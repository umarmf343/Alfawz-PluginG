(() => {
  const config = window.alfawzRecitationData || {};
  const root = document.getElementById('alfawz-recitation-assistant');

  if (!root) {
    return;
  }

  if (!config.enabled || !config.isLoggedIn) {
    root.classList.add('hidden');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const hasRecognitionSupport = typeof SpeechRecognition === 'function';

  const selectors = {
    toggle: '#alfawz-recitation-toggle',
    status: '#alfawz-recitation-status',
    visualizer: '#alfawz-recitation-visualizer',
    scoreValue: '#alfawz-recitation-score-value',
    verse: '#alfawz-recitation-verse',
    translation: '#alfawz-recitation-translation',
    updated: '#alfawz-recitation-updated',
    mistakes: '#alfawz-recitation-mistakes',
    snippets: '#alfawz-recitation-snippets',
    historyToggle: '#alfawz-recitation-history-toggle',
    historyClose: '#alfawz-recitation-history-close',
    historyPanel: '#alfawz-recitation-history',
    historyList: '#alfawz-recitation-history-list',
  };

  const el = Object.fromEntries(
    Object.entries(selectors).map(([key, selector]) => [key, root.querySelector(selector)])
  );

  const strings = {
    ...{
      coachTitle: 'AI Recitation Coach',
      startLabel: 'Begin listening',
      stopLabel: 'Stop listening',
      unsupported: 'Your browser does not support speech recognition. Try Chrome or Edge on desktop.',
      permissionDenied: 'Microphone access was blocked. Enable it in your browser settings and try again.',
      audioCaptureError: 'We could not access your microphone. Check your device and try again.',
      networkError: 'Speech recognition is temporarily unavailable. Check your connection and try again.',
      interrupted: 'Speech recognition was interrupted. Tap begin listening to try again.',
      noSpeech: 'We did not capture your voice. Try again.',
      pending: 'Listening… recite the ayah clearly.',
      processing: 'Analysing your recitation…',
      idle: 'Tap begin listening when you are ready to recite.',
      scoreLabel: 'Accuracy score',
      historyTitle: 'Recent sessions',
      mistakeTitle: 'Focus insights',
      snippetsTitle: 'Tarteel-style snippets',
      retryLabel: 'Try again',
      viewHistoryLabel: 'View last reviews',
      noMistakes: 'Flawless! Keep reinforcing this ayah daily.',
    },
    ...(config.strings || {}),
  };

  const state = {
    listening: false,
    processing: false,
    recognition: null,
    currentVerse: null,
    history: [],
  };

  const audio = {
    stream: null,
    context: null,
    analyser: null,
    source: null,
    frame: null,
    data: null,
    bars: [],
  };

  const hasMediaCaptureSupport = !!(
    navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function'
  );

  const ensureVisualizerBars = () => {
    if (!el.visualizer || audio.bars.length) {
      return;
    }
    audio.bars = Array.from(el.visualizer.querySelectorAll('[data-bar]'));
    if (audio.bars.length === 0) {
      audio.bars = [];
    }
  };

  const resetVisualizerBars = () => {
    if (!audio.bars.length) {
      return;
    }
    audio.bars.forEach((bar) => {
      bar.style.setProperty('--alfawz-visualizer-scale', '0.08');
    });
  };

  const stopVisualizer = (releaseStream = true) => {
    if (audio.frame) {
      cancelAnimationFrame(audio.frame);
      audio.frame = null;
    }
    if (el.visualizer) {
      delete el.visualizer.dataset.visualizing;
      el.visualizer.classList.add('hidden');
    }
    resetVisualizerBars();

    if (!releaseStream) {
      return;
    }

    if (audio.source) {
      try {
        audio.source.disconnect();
      } catch (error) {
        // Ignore disconnection errors.
      }
      audio.source = null;
    }

    audio.analyser = null;
    audio.data = null;

    if (audio.context && typeof audio.context.close === 'function') {
      audio.context.close().catch(() => {});
    }
    audio.context = null;

    if (audio.stream) {
      audio.stream.getTracks().forEach((track) => track.stop());
    }
    audio.stream = null;
  };

  const startVisualizer = () => {
    if (!audio.analyser || !el.visualizer) {
      return;
    }
    ensureVisualizerBars();
    if (!audio.bars.length) {
      return;
    }
    if (!audio.data || audio.data.length !== audio.analyser.frequencyBinCount) {
      audio.data = new Uint8Array(audio.analyser.frequencyBinCount);
    }

    el.visualizer.classList.remove('hidden');
    el.visualizer.dataset.visualizing = 'true';

    const render = () => {
      if (!audio.analyser) {
        return;
      }
      audio.analyser.getByteFrequencyData(audio.data);
      const sliceSize = Math.max(1, Math.floor(audio.data.length / audio.bars.length));
      audio.bars.forEach((bar, index) => {
        let sum = 0;
        for (let i = 0; i < sliceSize; i += 1) {
          const dataIndex = index * sliceSize + i;
          if (dataIndex < audio.data.length) {
            sum += audio.data[dataIndex];
          }
        }
        const average = sum / sliceSize || 0;
        const normalized = Math.max(0.08, average / 255);
        bar.style.setProperty('--alfawz-visualizer-scale', normalized.toFixed(3));
      });
      audio.frame = requestAnimationFrame(render);
    };

    if (audio.frame) {
      cancelAnimationFrame(audio.frame);
    }
    render();
  };

  const prepareVisualizer = async () => {
    if (!hasMediaCaptureSupport || !el.visualizer) {
      return null;
    }
    if (audio.analyser) {
      return audio.analyser;
    }

    ensureVisualizerBars();

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (error) {
      throw error;
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (typeof AudioContextCtor !== 'function') {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      throw new Error('AudioContextUnsupported');
    }

    const context = new AudioContextCtor();
    if (context.state === 'suspended' && typeof context.resume === 'function') {
      try {
        await context.resume();
      } catch (error) {
        // Ignore resume errors; continue with initialised context.
      }
    }

    const analyser = context.createAnalyser();
    analyser.fftSize = 256;

    const source = context.createMediaStreamSource(stream);
    source.connect(analyser);

    audio.stream = stream;
    audio.context = context;
    audio.analyser = analyser;
    audio.source = source;

    return analyser;
  };

  const headers = {};
  if (config.nonce) {
    headers['X-WP-Nonce'] = config.nonce;
  }

  const historyPalettes = [
    {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(14, 165, 233, 0.18), rgba(129, 140, 248, 0.2))',
      border: 'rgba(59, 130, 246, 0.25)',
      shadow: '0 18px 32px -16px rgba(30, 64, 175, 0.45)',
      verse: '#0f172a',
      score: '#1d4ed8',
      meta: 'rgba(15, 23, 42, 0.6)',
    },
    {
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(236, 72, 153, 0.18), rgba(249, 115, 22, 0.18))',
      border: 'rgba(244, 114, 182, 0.3)',
      shadow: '0 18px 32px -16px rgba(190, 24, 93, 0.4)',
      verse: '#1f2937',
      score: '#be123c',
      meta: 'rgba(55, 65, 81, 0.65)',
    },
    {
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(45, 212, 191, 0.18), rgba(14, 165, 233, 0.18))',
      border: 'rgba(20, 184, 166, 0.32)',
      shadow: '0 18px 32px -16px rgba(13, 148, 136, 0.38)',
      verse: '#0f172a',
      score: '#0f766e',
      meta: 'rgba(22, 78, 99, 0.6)',
    },
  ];

  const mistakePalettes = [
    {
      background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.22), rgba(251, 191, 36, 0.2), rgba(253, 186, 116, 0.2))',
      border: 'rgba(248, 113, 113, 0.3)',
      heading: '#b91c1c',
      body: '#4b5563',
    },
    {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(129, 140, 248, 0.18), rgba(236, 72, 153, 0.2))',
      border: 'rgba(129, 140, 248, 0.35)',
      heading: '#4338ca',
      body: '#374151',
    },
    {
      background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(45, 212, 191, 0.2), rgba(59, 130, 246, 0.18))',
      border: 'rgba(20, 184, 166, 0.35)',
      heading: '#0f766e',
      body: '#1f2937',
    },
  ];

  const snippetPalettes = [
    {
      background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.18), rgba(236, 72, 153, 0.18), rgba(251, 191, 36, 0.16))',
      border: 'rgba(217, 70, 239, 0.28)',
      heading: '#7e22ce',
      body: '#475569',
    },
    {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(14, 165, 233, 0.18), rgba(56, 189, 248, 0.18))',
      border: 'rgba(14, 165, 233, 0.3)',
      heading: '#1d4ed8',
      body: '#0f172a',
    },
    {
      background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.18), rgba(101, 163, 13, 0.18), rgba(250, 204, 21, 0.18))',
      border: 'rgba(101, 163, 13, 0.28)',
      heading: '#166534',
      body: '#365314',
    },
  ];

  const pickPalette = (palettes, index) => palettes[index % palettes.length];

  const updateToggleLabel = () => {
    if (!el.toggle) {
      return;
    }
    const labelSpan = el.toggle.querySelector('span:last-child');
    if (labelSpan) {
      labelSpan.textContent = state.listening ? strings.stopLabel : strings.startLabel;
    }
  };

  const setStatus = (message, tone = 'muted') => {
    if (!el.status) {
      return;
    }
    el.status.textContent = message;
    el.status.className = 'text-sm ' +
      (tone === 'success'
        ? 'text-emerald-600'
        : tone === 'error'
        ? 'text-rose-600'
        : tone === 'info'
        ? 'text-indigo-600'
        : 'text-slate-500');
  };

  const setScore = (score) => {
    if (el.scoreValue) {
      el.scoreValue.textContent = typeof score === 'number' && !Number.isNaN(score)
        ? `${score.toFixed(1)}%`
        : '--';
    }
  };

  const setVerseDetails = (detail) => {
    const verse = detail || {};
    state.currentVerse = verse && verse.verseKey ? verse : null;

    if (el.verse) {
      if (!state.currentVerse) {
        el.verse.textContent = strings.idle || 'Tap begin listening when you are ready to recite.';
      } else {
        const verseLabelParts = [];
        const surahLabel = window.wp?.i18n?.__( 'Surah', 'alfawzquran' ) || 'Surah';
        const ayahLabel = window.wp?.i18n?.__( 'Ayah', 'alfawzquran' ) || 'Ayah';
        if (verse.surahId) {
          verseLabelParts.push(`${surahLabel} ${verse.surahId}`);
        }
        if (verse.verseId) {
          verseLabelParts.push(`${ayahLabel} ${verse.verseId}`);
        }
        el.verse.textContent = verseLabelParts.length ? verseLabelParts.join(' • ') : verse.verseKey;
      }
    }

    if (el.translation) {
      el.translation.textContent = verse.translation || '';
    }

    if (el.toggle) {
      el.toggle.disabled = !state.currentVerse || !hasRecognitionSupport;
    }
  };

  const setListening = (isListening) => {
    state.listening = isListening;
    root.classList.toggle('is-listening', isListening);
    updateToggleLabel();
    if (isListening) {
      setStatus(strings.pending, 'info');
    } else if (!state.processing) {
      setStatus(strings.idle, 'muted');
    }
  };

  const ensureRecognition = () => {
    if (!hasRecognitionSupport) {
      return null;
    }
    if (!state.recognition) {
      try {
        state.recognition = new SpeechRecognition();
        state.recognition.continuous = false;
        state.recognition.interimResults = false;
        state.recognition.lang = 'ar-SA';
        state.recognition.maxAlternatives = 1;

        state.recognition.addEventListener('result', (event) => {
          const lastResult = event.results[event.results.length - 1];
          if (!lastResult) {
            return;
          }
          const transcript = (lastResult[0] && lastResult[0].transcript) || '';
          const confidence = lastResult[0] ? lastResult[0].confidence : null;
          stopListening();
          analyseTranscript(transcript, confidence);
        });

        state.recognition.addEventListener('error', (event) => {
          const errorType = event?.error;
          console.warn('[Alfawz Recitation] Speech recognition error', errorType);
          state.processing = false;
          stopListening();

          switch (errorType) {
            case 'not-allowed':
            case 'service-not-allowed':
              setStatus(strings.permissionDenied, 'error');
              break;
            case 'audio-capture':
              setStatus(strings.audioCaptureError, 'error');
              break;
            case 'network':
              setStatus(strings.networkError, 'error');
              break;
            case 'aborted':
              setStatus(strings.interrupted, 'info');
              break;
            case 'no-speech':
              setStatus(strings.noSpeech, 'error');
              break;
            default:
              setStatus(strings.unsupported, 'error');
              break;
          }
        });

        state.recognition.addEventListener('end', () => {
          if (state.listening) {
            try {
              state.recognition.start();
            } catch (error) {
              console.warn('[Alfawz Recitation] Unable to resume recognition', error);
              stopListening();
            }
          }
        });
      } catch (error) {
        console.warn('[Alfawz Recitation] Unable to initialise speech recognition', error);
        return null;
      }
    }
    return state.recognition;
  };

  const startListening = async () => {
    if (!hasRecognitionSupport) {
      setStatus(strings.unsupported, 'error');
      return;
    }
    if (!state.currentVerse) {
      setStatus('Select a verse to receive feedback.', 'error');
      return;
    }
    const recognition = ensureRecognition();
    if (!recognition) {
      setStatus(strings.unsupported, 'error');
      return;
    }

    if (hasMediaCaptureSupport && el.visualizer) {
      try {
        await prepareVisualizer();
      } catch (error) {
        console.warn('[Alfawz Recitation] Unable to start audio visualizer', error);
        if (error && (error.name === 'NotAllowedError' || error.name === 'SecurityError')) {
          setStatus(strings.permissionDenied, 'error');
          return;
        }
        if (error && (error.name === 'NotFoundError' || error.name === 'AbortError')) {
          setStatus(strings.audioCaptureError, 'error');
          return;
        }
        if (error && error.message === 'AudioContextUnsupported') {
          setStatus(strings.unsupported, 'error');
        }
      }
    }
    try {
      recognition.start();
      setListening(true);
      startVisualizer();
    } catch (error) {
      console.warn('[Alfawz Recitation] Failed to start recognition', error);
      stopVisualizer();
      setStatus(strings.unsupported, 'error');
    }
  };

  const stopListening = () => {
    if (state.recognition) {
      try {
        state.recognition.stop();
      } catch (error) {
        // Ignore if already stopped.
      }
    }
    stopVisualizer();
    setListening(false);
  };

  const request = async (endpoint, { method = 'GET', body } = {}) => {
    if (!endpoint) {
      return null;
    }
    const options = {
      method,
      headers: { ...headers },
      credentials: 'same-origin',
    };

    if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, options);
    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(rawText || `Request failed with status ${response.status}`);
    }

    if (response.status === 204 || !rawText.trim()) {
      return null;
    }

    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(rawText);
      } catch (error) {
        console.warn('[Alfawz Recitation] Unable to parse JSON response', error);
      }
    }

    try {
      return JSON.parse(rawText);
    } catch (error) {
      console.warn('[Alfawz Recitation] Received non-JSON response', {
        endpoint,
        contentType,
        preview: rawText.slice(0, 120),
      });
      return { error: 'invalid_json', raw: rawText };
    }
  };

  const renderMistakes = (mistakes) => {
    if (!el.mistakes) {
      return;
    }
    el.mistakes.innerHTML = '';
    if (!Array.isArray(mistakes) || mistakes.length === 0) {
      const item = document.createElement('li');
      item.className = 'rounded-2xl border border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 px-4 py-3 text-slate-400 shadow-inner';
      item.textContent = strings.noMistakes;
      el.mistakes.appendChild(item);
      return;
    }
    mistakes.forEach((mistake, index) => {
      const item = document.createElement('li');
      item.className = 'alfawz-recitation-mistake';
      const palette = pickPalette(mistakePalettes, index);
      item.style.background = palette.background;
      item.style.borderColor = palette.border;
      item.style.boxShadow = '0 22px 40px -18px rgba(15, 23, 42, 0.35)';
      const title = document.createElement('strong');
      title.textContent =
        mistake.type === 'skipped_word'
          ? window.wp?.i18n?.__( 'Skipped word', 'alfawzquran' ) || 'Skipped word'
          : mistake.type === 'extra_word'
          ? window.wp?.i18n?.__( 'Extra word', 'alfawzquran' ) || 'Extra word'
          : window.wp?.i18n?.__( 'Pronunciation cue', 'alfawzquran' ) || 'Pronunciation cue';
      title.style.color = palette.heading;
      const body = document.createElement('p');
      const parts = [];
      if (mistake.expected) {
        parts.push((window.wp?.i18n?.__( 'Expected:', 'alfawzquran' ) || 'Expected:') + ` ${mistake.expected}`);
      }
      if (mistake.spoken) {
        parts.push((window.wp?.i18n?.__( 'Heard:', 'alfawzquran' ) || 'Heard:') + ` ${mistake.spoken}`);
      }
      body.textContent = parts.join(' • ');
      body.style.color = palette.body;
      item.appendChild(title);
      item.appendChild(body);
      el.mistakes.appendChild(item);
    });
  };

  const renderSnippets = (snippets) => {
    if (!el.snippets) {
      return;
    }
    el.snippets.innerHTML = '';
    if (!Array.isArray(snippets) || snippets.length === 0) {
      return;
    }
    snippets.forEach((snippet, index) => {
      const chip = document.createElement('div');
      chip.className = 'alfawz-recitation-chip shadow-md transition-transform duration-300 ease-out hover:-translate-y-1';
      const palette = pickPalette(snippetPalettes, index);
      chip.style.background = palette.background;
      chip.style.borderColor = palette.border;
      const title = document.createElement('strong');
      title.textContent = snippet.title || '';
      title.style.color = palette.heading;
      const body = document.createElement('p');
      body.textContent = snippet.body || '';
      body.style.color = palette.body;
      chip.appendChild(title);
      chip.appendChild(body);
      el.snippets.appendChild(chip);
    });
  };

  const renderHistory = (history) => {
    if (!el.historyList) {
      return;
    }
    el.historyList.innerHTML = '';
    if (!Array.isArray(history) || history.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'rounded-2xl border border-dashed border-sky-200 bg-gradient-to-br from-sky-50 via-cyan-50 to-indigo-50 px-4 py-3 text-slate-400 shadow-inner';
      empty.textContent = window.wp?.i18n?.__("You have not recorded any recitation feedback yet.", 'alfawzquran') ||
        'You have not recorded any recitation feedback yet.';
      el.historyList.appendChild(empty);
      return;
    }

    const formatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    history.forEach((entry, index) => {
      const item = document.createElement('li');
      item.className = 'relative overflow-hidden rounded-2xl border px-4 py-4 shadow-lg transition-shadow duration-300 ease-out hover:shadow-xl';
      const palette = pickPalette(historyPalettes, index);
      item.style.background = palette.background;
      item.style.borderColor = palette.border;
      item.style.boxShadow = palette.shadow;
      const heading = document.createElement('div');
      heading.className = 'flex items-center justify-between gap-3';
      const verse = document.createElement('strong');
      verse.className = 'text-sm font-semibold';
      verse.style.color = palette.verse;
      verse.textContent = entry.verse_key || `${entry.surah_id || ''}:${entry.verse_id || ''}`;
      const score = document.createElement('span');
      score.className = 'text-sm font-semibold';
      score.style.color = palette.score;
      score.textContent = typeof entry.score === 'number' ? `${entry.score.toFixed(1)}%` : '--';
      heading.appendChild(verse);
      heading.appendChild(score);

      const meta = document.createElement('p');
      meta.className = 'mt-2 text-xs uppercase tracking-[0.3em]';
      meta.style.color = palette.meta;
      if (entry.evaluated_at) {
        meta.textContent = formatter.format(new Date(entry.evaluated_at));
      }

      item.appendChild(heading);
      if (meta.textContent) {
        item.appendChild(meta);
      }
      el.historyList.appendChild(item);
    });
  };

  const renderAnalysis = (result) => {
    state.processing = false;
    setListening(false);
    setScore(result?.score);
    const evaluatedAt = result?.evaluated_at || new Date().toISOString();
    if (el.updated) {
      const formatter = new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      el.updated.textContent = formatter.format(new Date(evaluatedAt));
    }
    renderMistakes(result?.mistakes || []);
    renderSnippets(result?.snippets || []);
    if (Array.isArray(state.history)) {
      state.history.unshift({ ...result, evaluated_at: evaluatedAt });
      state.history = state.history.slice(0, 10);
      renderHistory(state.history);
    }
    setStatus(strings.noMistakes && (!result?.mistakes || result.mistakes.length === 0)
      ? strings.noMistakes
      : window.wp?.i18n?.__("Review the focus insights to strengthen this ayah.", 'alfawzquran') ||
        'Review the focus insights to strengthen this ayah.',
      result?.mistakes && result.mistakes.length ? 'info' : 'success');
  };

  const analyseTranscript = async (transcript, confidence) => {
    if (!transcript) {
      setStatus(window.wp?.i18n?.__("We did not capture your voice. Try again.", 'alfawzquran') || 'We did not capture your voice. Try again.', 'error');
      return;
    }
    if (!state.currentVerse?.verseKey) {
      setStatus('Select a verse to receive feedback.', 'error');
      return;
    }
    state.processing = true;
    setStatus(strings.processing, 'info');

    try {
      const payload = {
        verse_key: state.currentVerse.verseKey,
        transcript,
      };
      if (typeof confidence === 'number') {
        payload.confidence = confidence;
      }
      const response = await request(config.endpoints?.analyze, {
        method: 'POST',
        body: payload,
      });
      if (response?.result) {
        renderAnalysis(response.result);
      } else {
        throw new Error('Empty analysis response');
      }
    } catch (error) {
      console.error('[Alfawz Recitation] Analysis failed', error);
      setStatus(window.wp?.i18n?.__("We could not analyse that recitation. Please try again.", 'alfawzquran') ||
        'We could not analyse that recitation. Please try again.', 'error');
    } finally {
      state.processing = false;
    }
  };

  const toggleListening = () => {
    if (state.listening) {
      stopListening();
      return;
    }
    startListening();
  };

  const toggleHistory = (force) => {
    if (!el.historyPanel) {
      return;
    }
    const show = typeof force === 'boolean' ? force : el.historyPanel.classList.contains('hidden');
    el.historyPanel.classList.toggle('hidden', !show);
  };

  const loadHistory = async () => {
    try {
      const response = await request(config.endpoints?.history);
      if (response?.history && Array.isArray(response.history)) {
        state.history = response.history;
        renderHistory(state.history);
      } else {
        state.history = [];
        if (response?.error === 'invalid_json') {
          console.warn('[Alfawz Recitation] History endpoint returned invalid JSON', response);
        }
        renderHistory(state.history);
      }
    } catch (error) {
      console.warn('[Alfawz Recitation] Unable to load history', error);
      state.history = [];
      renderHistory(state.history);
    }
  };

  document.addEventListener('alfawz:memorizationVerse', (event) => {
    const detail = event?.detail || {};
    if (detail && detail.planId === null && detail.verseId === null) {
      setVerseDetails(null);
      return;
    }
    if (detail.complete) {
      setVerseDetails(null);
      setScore(100);
      setStatus(strings.noMistakes, 'success');
      return;
    }
    if (detail.error) {
      setStatus(window.wp?.i18n?.__("Unable to load the verse for analysis.", 'alfawzquran') || 'Unable to load the verse for analysis.', 'error');
      return;
    }
    setVerseDetails({
      verseKey: detail.verseKey,
      surahId: detail.surahId,
      verseId: detail.verseId,
      translation: detail.translation,
    });
  });

  document.addEventListener('alfawz:memorizationPlan', (event) => {
    const detail = event?.detail || {};
    if (!detail.active) {
      setVerseDetails(null);
      setScore(null);
    }
  });

  if (el.toggle) {
    el.toggle.addEventListener('click', toggleListening);
  }

  if (el.historyToggle) {
    el.historyToggle.addEventListener('click', () => {
      toggleHistory();
    });
  }

  if (el.historyClose) {
    el.historyClose.addEventListener('click', () => toggleHistory(false));
  }

  if (!hasRecognitionSupport) {
    setStatus(strings.unsupported, 'error');
    if (el.toggle) {
      el.toggle.disabled = true;
    }
  } else {
    setStatus(strings.idle, 'muted');
    updateToggleLabel();
  }

  setVerseDetails(null);
  loadHistory();
})();

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
    verseContent: '#alfawz-recitation-verse-content',
    arabic: '#alfawz-recitation-arabic',
    transliteration: '#alfawz-recitation-transliteration',
    translation: '#alfawz-recitation-translation',
    updated: '#alfawz-recitation-updated',
    mistakes: '#alfawz-recitation-mistakes',
    snippets: '#alfawz-recitation-snippets',
    blurToggle: '#alfawz-recitation-blur-toggle',
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
      retrying: 'Listening again…',
      pending: 'Listening… recite the ayah clearly.',
      processing: 'Analysing your recitation…',
      idle: 'Tap begin listening when you are ready to recite.',
      scoreLabel: 'Accuracy score',
      historyTitle: 'Recent sessions',
      mistakeTitle: 'Focus insights',
      snippetsTitle: 'Tarteel-style snippets',
      retryLabel: 'Try again',
      viewHistoryLabel: 'View last reviews',
      blurOnLabel: 'Blur verse',
      blurOffLabel: 'Show verse',
      noMistakes: 'Flawless! Keep reinforcing this ayah daily.',
      memorizationComplete:
        'Barakallahu feek! Memorization complete—may Allah make it firm in your heart.',
      historyLoadError: 'Unable to load your recent sessions.',
      livePreviewBadge: 'Live',
      livePreviewNoMistakes: 'Sounding great so far! Keep reciting.',
      livePreviewListening: 'Listening live… Mistakes will appear here instantly.',
      livePreviewUnavailable: 'Real-time cues will appear once the reference verse is ready.',
      livePreviewTitle: 'Live detection',
    },
    ...(config.strings || {}),
  };

  const state = {
    listening: false,
    processing: false,
    recognition: null,
    currentVerse: null,
    history: [],
    retryTimeout: null,
    expectedWords: [],
    pendingTranscript: '',
    sessionStartedAt: null,
    previewActive: false,
    verseBlurred: false,
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

  const normalizeTranscript = (text) =>
    (text || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]+/g, '')
      .replace(/[^\p{L}\p{N}\s'\-]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const tokenizePhrase = (text) => {
    if (!text) {
      return [];
    }
    return text
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);
  };

  const diffWordSequences = (expected, spoken) => {
    const mistakes = [];
    let matches = 0;
    let i = 0;
    let j = 0;
    const expectedCount = expected.length;
    const spokenCount = spoken.length;

    while (i < expectedCount && j < spokenCount) {
      const expectedWord = expected[i];
      const spokenWord = spoken[j];

      if (expectedWord === spokenWord) {
        matches += 1;
        i += 1;
        j += 1;
        continue;
      }

      const remainingSpoken = spoken.slice(j + 1);
      const remainingExpected = expected.slice(i + 1);

      if (remainingSpoken.includes(expectedWord)) {
        mistakes.push({
          type: 'skipped_word',
          expected: expectedWord,
          spoken: spokenWord,
          position: i + 1,
        });
        i += 1;
        continue;
      }

      if (spokenWord && !remainingExpected.includes(spokenWord)) {
        mistakes.push({
          type: 'extra_word',
          expected: expectedWord,
          spoken: spokenWord,
          position: i + 1,
        });
        j += 1;
        continue;
      }

      mistakes.push({
        type: 'mismatch',
        expected: expectedWord,
        spoken: spokenWord,
        position: i + 1,
      });
      i += 1;
      j += 1;
    }

    while (i < expectedCount) {
      mistakes.push({
        type: 'skipped_word',
        expected: expected[i],
        spoken: '',
        position: i + 1,
      });
      i += 1;
    }

    while (j < spokenCount) {
      mistakes.push({
        type: 'extra_word',
        expected: '',
        spoken: spoken[j],
        position: expectedCount + (j + 1),
      });
      j += 1;
    }

    return {
      matches,
      mistakes,
    };
  };

  const hasExpectedWords = () => Array.isArray(state.expectedWords) && state.expectedWords.length > 0;

  const computePreviewFeedback = (transcript) => {
    if (!transcript || !hasExpectedWords()) {
      return { score: null, mistakes: [] };
    }
    const normalized = normalizeTranscript(transcript);
    if (!normalized) {
      return { score: null, mistakes: [] };
    }
    const spokenWords = tokenizePhrase(normalized);
    const diff = diffWordSequences(state.expectedWords, spokenWords);
    const matches = Math.max(0, diff.matches || 0);
    const score = Math.max(0, Math.min(100, (matches / Math.max(state.expectedWords.length, 1)) * 100));
    return {
      score,
      mistakes: diff.mistakes,
    };
  };

  const computeSessionDuration = () => {
    if (!state.sessionStartedAt) {
      return null;
    }
    const elapsed = (performance.now() - state.sessionStartedAt) / 1000;
    if (!Number.isFinite(elapsed) || elapsed < 0) {
      return null;
    }
    return elapsed;
  };

  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return null;
    }
    const totalSeconds = Math.round(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const parts = [];
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }
    parts.push(`${remainingSeconds}s`);
    return parts.join(' ');
  };

  const updateExpectedWords = (detail) => {
    if (!detail) {
      state.expectedWords = [];
      return;
    }
    const sources = [detail.transliteration, detail.translation, detail.arabic];
    const sourceText = sources.find((value) => typeof value === 'string' && value.trim());
    state.expectedWords = tokenizePhrase(normalizeTranscript(sourceText || ''));
  };

  const updateLivePreview = (transcript) => {
    if (!state.previewActive) {
      return;
    }
    if (!hasExpectedWords()) {
      renderMistakes([], { preview: true, emptyMessage: strings.livePreviewUnavailable });
      setScore(null, { preview: true });
      return;
    }
    const combinedTranscript = [state.pendingTranscript, transcript]
      .filter((chunk) => typeof chunk === 'string' && chunk.trim())
      .join(' ')
      .trim();
    if (!combinedTranscript) {
      renderMistakes([], { preview: true, emptyMessage: strings.livePreviewListening });
      setScore(null, { preview: true });
      return;
    }
    const feedback = computePreviewFeedback(combinedTranscript);
    renderMistakes(feedback.mistakes || [], { preview: true });
    if (typeof feedback.score === 'number' && !Number.isNaN(feedback.score)) {
      setScore(feedback.score, { preview: true });
    } else {
      setScore(null, { preview: true });
    }
  };

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

  const updateBlurToggleLabel = () => {
    if (!el.blurToggle) {
      return;
    }
    const labelSpan = el.blurToggle.querySelector('span:last-child');
    if (labelSpan) {
      labelSpan.textContent = state.verseBlurred
        ? strings.blurOffLabel || 'Show verse'
        : strings.blurOnLabel || 'Blur verse';
    }
  };

  const applyVerseBlurState = () => {
    if (el.verseContent) {
      const shouldBlur = Boolean(state.currentVerse) && Boolean(state.verseBlurred);
      el.verseContent.dataset.blurred = shouldBlur ? 'true' : 'false';
      el.verseContent.classList.toggle('hidden', !state.currentVerse);
    }
    if (el.blurToggle) {
      el.blurToggle.disabled = !state.currentVerse;
      el.blurToggle.setAttribute('aria-pressed', state.verseBlurred ? 'true' : 'false');
      el.blurToggle.setAttribute(
        'aria-label',
        state.verseBlurred
          ? strings.blurOffLabel || 'Show verse'
          : strings.blurOnLabel || 'Blur verse'
      );
    }
    updateBlurToggleLabel();
  };

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

  const setScore = (score, { preview = false } = {}) => {
    if (!el.scoreValue) {
      return;
    }
    el.scoreValue.dataset.preview = preview ? 'true' : 'false';
    el.scoreValue.textContent = typeof score === 'number' && !Number.isNaN(score)
      ? `${score.toFixed(1)}%`
      : '--';
  };

  const setVerseDetails = (detail) => {
    const verse = detail || {};
    state.currentVerse = verse && verse.verseKey ? verse : null;
    state.pendingTranscript = '';
    state.previewActive = false;
    updateExpectedWords(state.currentVerse);

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

    if (el.arabic) {
      if (verse.arabic) {
        el.arabic.textContent = verse.arabic;
        el.arabic.classList.remove('hidden');
      } else {
        el.arabic.textContent = '';
        el.arabic.classList.add('hidden');
      }
    }

    if (el.transliteration) {
      if (verse.transliteration) {
        el.transliteration.textContent = verse.transliteration;
        el.transliteration.classList.remove('hidden');
      } else {
        el.transliteration.textContent = '';
        el.transliteration.classList.add('hidden');
      }
    }

    if (el.translation) {
      if (verse.translation) {
        el.translation.textContent = verse.translation;
        el.translation.classList.remove('hidden');
      } else {
        el.translation.textContent = '';
        el.translation.classList.add('hidden');
      }
    }

    applyVerseBlurState();

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
        state.recognition.interimResults = true;
        state.recognition.lang = 'ar-SA';
        state.recognition.maxAlternatives = 1;

        state.recognition.addEventListener('result', (event) => {
          let finalTranscript = '';
          let finalConfidence = null;
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (!result || !result[0]) {
              continue;
            }
            const transcript = (result[0].transcript || '').trim();
            if (!transcript) {
              continue;
            }
            if (result.isFinal) {
              state.pendingTranscript = [state.pendingTranscript, transcript]
                .filter((chunk) => chunk && chunk.trim())
                .join(' ')
                .trim();
              finalTranscript = state.pendingTranscript;
              if (typeof result[0].confidence === 'number') {
                finalConfidence = result[0].confidence;
              }
            } else {
              updateLivePreview(transcript);
            }
          }
          if (finalTranscript) {
            const duration = computeSessionDuration();
            stopListening({ preservePreview: true });
            analyseTranscript(finalTranscript.trim(), finalConfidence, duration);
          }
        });

        state.recognition.addEventListener('error', (event) => {
          const errorType = event?.error;
          console.warn('[Alfawz Recitation] Speech recognition error', errorType);
          state.processing = false;
          const wasListening = state.listening;
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
              setStatus(`${strings.noSpeech} ${strings.retrying}`.trim(), 'info');
              if (wasListening && state.currentVerse) {
                scheduleRetry();
              }
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

    if (state.retryTimeout) {
      clearTimeout(state.retryTimeout);
      state.retryTimeout = null;
    }

    state.previewActive = true;
    state.pendingTranscript = '';
    state.sessionStartedAt = performance.now();
    if (hasExpectedWords()) {
      renderMistakes([], { preview: true, emptyMessage: strings.livePreviewListening });
    } else {
      renderMistakes([], { preview: true, emptyMessage: strings.livePreviewUnavailable });
    }
    setScore(null, { preview: true });

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

  const stopListening = ({ preservePreview = false } = {}) => {
    if (state.recognition) {
      try {
        state.recognition.stop();
      } catch (error) {
        // Ignore if already stopped.
      }
    }
    stopVisualizer();
    if (state.retryTimeout) {
      clearTimeout(state.retryTimeout);
      state.retryTimeout = null;
    }
    state.previewActive = false;
    state.pendingTranscript = '';
    if (!preservePreview) {
      if (el.scoreValue?.dataset.preview === 'true') {
        setScore(null, { preview: false });
      }
      if (el.mistakes?.dataset.preview === 'true') {
        renderMistakes([], { preview: false, emptyMessage: strings.noMistakes });
      }
    }
    state.sessionStartedAt = null;
    setListening(false);
  };

  const scheduleRetry = (delay = 800) => {
    if (state.retryTimeout) {
      clearTimeout(state.retryTimeout);
    }
    state.retryTimeout = window.setTimeout(() => {
      state.retryTimeout = null;
      if (!state.listening && !state.processing && state.currentVerse) {
        startListening();
      }
    }, Math.max(0, delay));
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
      let message = `Request failed with status ${response.status}`;
      if (rawText) {
        if (contentType.includes('application/json')) {
          try {
            const payload = JSON.parse(rawText);
            if (payload && typeof payload.message === 'string' && payload.message.trim()) {
              message = payload.message.trim();
            }
          } catch (error) {
            // Fall back to the default message when JSON parsing fails.
          }
        } else {
          const stripped = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          if (stripped) {
            message = stripped.slice(0, 160);
          }
        }
      }
      throw new Error(message);
    }

    if (response.status === 204 || !rawText) {
      return null;
    }

    const trimmed = rawText.trim();
    const sanitized = trimmed.replace(/^\uFEFF/, '');

    if (!sanitized) {
      return null;
    }

    if (contentType.includes('application/json')) {
      if (sanitized.startsWith('<')) {
        console.warn(
          '[Alfawz Recitation] Expected JSON response but received HTML payload despite JSON content type'
        );
        return null;
      }
      try {
        return JSON.parse(sanitized);
      } catch (error) {
        console.warn('[Alfawz Recitation] Invalid JSON response', error);
        return null;
      }
    }

    if (sanitized.startsWith('<')) {
      console.warn('[Alfawz Recitation] Expected JSON response but received HTML payload');
      return null;
    }

    try {
      return JSON.parse(sanitized);
    } catch (error) {
      console.warn('[Alfawz Recitation] Expected JSON response but received non-JSON payload', error);
      return null;
    }
  };

  const renderMistakes = (mistakes, { preview = false, emptyMessage } = {}) => {
    if (!el.mistakes) {
      return;
    }
    el.mistakes.innerHTML = '';
    el.mistakes.dataset.preview = preview ? 'true' : 'false';

    if (!Array.isArray(mistakes) || mistakes.length === 0) {
      const item = document.createElement('li');
      item.className = 'rounded-2xl border border-dashed border-white/25 bg-white/10 px-4 py-3 text-white/70 backdrop-blur';
      item.textContent =
        emptyMessage ||
        (preview
          ? strings.livePreviewNoMistakes || 'Sounding great so far! Keep reciting.'
          : strings.noMistakes || 'Flawless! Keep reinforcing this ayah daily.');
      el.mistakes.appendChild(item);
      return;
    }

    mistakes.forEach((mistake) => {
      const item = document.createElement('li');
      item.className = 'alfawz-recitation-mistake';
      if (preview) {
        item.classList.add('is-preview');
        const badge = document.createElement('span');
        badge.className = 'alfawz-recitation-mistake-badge';
        badge.textContent = strings.livePreviewBadge || 'Live';
        const badgeTitle = strings.livePreviewTitle || 'Live detection';
        badge.setAttribute('aria-label', badgeTitle);
        badge.title = badgeTitle;
        item.appendChild(badge);
      }
      const title = document.createElement('strong');
      title.textContent =
        mistake.type === 'skipped_word'
          ? window.wp?.i18n?.__('Skipped word', 'alfawzquran') || 'Skipped word'
          : mistake.type === 'extra_word'
          ? window.wp?.i18n?.__('Extra word', 'alfawzquran') || 'Extra word'
          : window.wp?.i18n?.__('Pronunciation cue', 'alfawzquran') || 'Pronunciation cue';
      const body = document.createElement('p');
      const parts = [];
      if (mistake.expected) {
        parts.push((window.wp?.i18n?.__('Expected:', 'alfawzquran') || 'Expected:') + ` ${mistake.expected}`);
      }
      if (mistake.spoken) {
        parts.push((window.wp?.i18n?.__('Heard:', 'alfawzquran') || 'Heard:') + ` ${mistake.spoken}`);
      }
      body.textContent = parts.join(' • ');
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
    snippets.forEach((snippet) => {
      const chip = document.createElement('div');
      chip.className = 'alfawz-recitation-chip';
      const title = document.createElement('strong');
      title.textContent = snippet.title || '';
      const body = document.createElement('p');
      body.textContent = snippet.body || '';
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
      empty.className = 'text-white/70';
      empty.textContent = window.wp?.i18n?.__("You have not recorded any recitation feedback yet.", 'alfawzquran') ||
        'You have not recorded any recitation feedback yet.';
      el.historyList.appendChild(empty);
      return;
    }

    const formatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    history.forEach((entry) => {
      const item = document.createElement('li');
      item.className = 'rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-lg backdrop-blur';
      const heading = document.createElement('div');
      heading.className = 'flex items-center justify-between gap-3';
      const verse = document.createElement('strong');
      verse.className = 'text-sm font-semibold text-white';
      verse.textContent = entry.verse_key || `${entry.surah_id || ''}:${entry.verse_id || ''}`;
      const score = document.createElement('span');
      score.className = 'text-sm font-semibold text-emerald-200';
      score.textContent = typeof entry.score === 'number' ? `${entry.score.toFixed(1)}%` : '--';
      heading.appendChild(verse);
      heading.appendChild(score);

      const meta = document.createElement('p');
      meta.className = 'mt-2 text-xs uppercase tracking-[0.3em] text-white/60';
      if (entry.evaluated_at) {
        meta.textContent = formatter.format(new Date(entry.evaluated_at));
      }
      const durationLabel = formatDuration(Number(entry.duration));
      if (durationLabel) {
        meta.textContent = meta.textContent
          ? `${meta.textContent} • ${durationLabel}`
          : durationLabel;
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
    renderMistakes(result?.mistakes || [], { preview: false });
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

  const analyseTranscript = async (transcript, confidence, durationSeconds) => {
    if (!transcript) {
      setStatus(window.wp?.i18n?.__("We did not capture your voice. Try again.", 'alfawzquran') || 'We did not capture your voice. Try again.', 'error');
      return;
    }
    if (!state.currentVerse?.verseKey) {
      setStatus('Select a verse to receive feedback.', 'error');
      return;
    }
    state.processing = true;
    state.previewActive = false;
    state.pendingTranscript = '';
    setStatus(strings.processing, 'info');

    try {
      const payload = {
        verse_key: state.currentVerse.verseKey,
        transcript,
      };
      if (typeof confidence === 'number') {
        payload.confidence = confidence;
      }
      if (typeof durationSeconds === 'number' && Number.isFinite(durationSeconds)) {
        payload.duration = Math.max(0, Number(durationSeconds.toFixed(2)));
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
      if (response?.history) {
        state.history = response.history;
        renderHistory(state.history);
      }
    } catch (error) {
      console.warn('[Alfawz Recitation] Unable to load history', error);
      if (el.historyList) {
        el.historyList.innerHTML = '';
        const item = document.createElement('li');
        item.className = 'rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white/80 backdrop-blur';
        item.textContent = strings.historyLoadError || 'Unable to load your recent sessions.';
        el.historyList.appendChild(item);
      }
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
      setStatus(strings.memorizationComplete || strings.noMistakes, 'success');
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
      transliteration: detail.transliteration,
      arabic: detail.arabic,
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

  if (el.blurToggle) {
    el.blurToggle.addEventListener('click', () => {
      if (!state.currentVerse) {
        return;
      }
      state.verseBlurred = !state.verseBlurred;
      applyVerseBlurState();
    });
    updateBlurToggleLabel();
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

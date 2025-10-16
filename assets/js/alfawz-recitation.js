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

  const headers = {};
  if (config.nonce) {
    headers['X-WP-Nonce'] = config.nonce;
  }

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

  const startListening = () => {
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
    try {
      recognition.start();
      setListening(true);
    } catch (error) {
      console.warn('[Alfawz Recitation] Failed to start recognition', error);
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
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
    }
    if (response.status === 204) {
      return null;
    }
    return response.json();
  };

  const renderMistakes = (mistakes) => {
    if (!el.mistakes) {
      return;
    }
    el.mistakes.innerHTML = '';
    if (!Array.isArray(mistakes) || mistakes.length === 0) {
      const item = document.createElement('li');
      item.className = 'rounded-2xl border border-dashed border-slate-200/70 bg-white/70 px-4 py-3 text-slate-400';
      item.textContent = strings.noMistakes;
      el.mistakes.appendChild(item);
      return;
    }
    mistakes.forEach((mistake) => {
      const item = document.createElement('li');
      item.className = 'alfawz-recitation-mistake';
      const title = document.createElement('strong');
      title.textContent =
        mistake.type === 'skipped_word'
          ? window.wp?.i18n?.__( 'Skipped word', 'alfawzquran' ) || 'Skipped word'
          : mistake.type === 'extra_word'
          ? window.wp?.i18n?.__( 'Extra word', 'alfawzquran' ) || 'Extra word'
          : window.wp?.i18n?.__( 'Pronunciation cue', 'alfawzquran' ) || 'Pronunciation cue';
      const body = document.createElement('p');
      const parts = [];
      if (mistake.expected) {
        parts.push((window.wp?.i18n?.__( 'Expected:', 'alfawzquran' ) || 'Expected:') + ` ${mistake.expected}`);
      }
      if (mistake.spoken) {
        parts.push((window.wp?.i18n?.__( 'Heard:', 'alfawzquran' ) || 'Heard:') + ` ${mistake.spoken}`);
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
      empty.className = 'text-slate-400';
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
      item.className = 'rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm';
      const heading = document.createElement('div');
      heading.className = 'flex items-center justify-between gap-3';
      const verse = document.createElement('strong');
      verse.className = 'text-sm text-slate-700';
      verse.textContent = entry.verse_key || `${entry.surah_id || ''}:${entry.verse_id || ''}`;
      const score = document.createElement('span');
      score.className = 'text-sm font-semibold text-indigo-600';
      score.textContent = typeof entry.score === 'number' ? `${entry.score.toFixed(1)}%` : '--';
      heading.appendChild(verse);
      heading.appendChild(score);

      const meta = document.createElement('p');
      meta.className = 'mt-2 text-xs uppercase tracking-[0.3em] text-slate-400';
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
      if (response?.history) {
        state.history = response.history;
        renderHistory(state.history);
      }
    } catch (error) {
      console.warn('[Alfawz Recitation] Unable to load history', error);
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

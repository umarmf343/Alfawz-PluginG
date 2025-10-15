(() => {
  const wpData = window.alfawzData || {};
  const API_BASE = (wpData.apiUrl || '/wp-json/alfawzquran/v1/').replace(/\/+$/, '/');
  const QURAN_AUDIO_API_BASE = 'https://api.alquran.cloud/v1/';
  const RECITER_EDITION = wpData.defaultReciter || 'ar.alafasy';
  let currentReciter = wpData.userPreferences?.default_reciter || RECITER_EDITION;
  const TRANSLATION_EDITION = wpData.defaultTranslation || 'en.sahih';
  const TRANSLITERATION_EDITION = wpData.defaultTransliteration || 'en.transliteration';
  const HASANAT_PER_LETTER = Number(wpData.hasanatPerLetter || 10);

  const headers = {};
  if (wpData.nonce) {
    headers['X-WP-Nonce'] = wpData.nonce;
  }

  const state = {
    surahs: null,
    verseCache: new Map(),
    audioCache: new Map(),
    dashboardStats: null,
  };

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));
  const formatPercent = (value) => `${Math.min(100, Math.max(0, Number(value || 0))).toFixed(0)}%`;
  const timezoneOffset = () => -new Date().getTimezoneOffset();

  const buildApiUrl = (path) => {
    const clean = path.replace(/^\//, '');
    return `${API_BASE}${clean}`;
  };

  const apiRequest = async (path, { method = 'GET', body, headers: extraHeaders, raw = false } = {}) => {
    const url = buildApiUrl(path);
    const options = { method, headers: { ...headers, ...(extraHeaders || {}) } };

    if (body instanceof FormData) {
      options.body = body;
    } else if (body !== undefined && body !== null) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
      }

      if (response.status === 204) {
        return null;
      }

      if (raw) {
        return response;
      }

      return await response.json();
    } catch (error) {
      console.error('[AlfawzQuran] API error:', error);
      throw error;
    }
  };

  const fetchJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }
    return response.json();
  };

  const loadSurahs = async () => {
    if (state.surahs) {
      return state.surahs;
    }
    const data = await apiRequest('surahs');
    state.surahs = Array.isArray(data) ? data : [];
    return state.surahs;
  };

  const loadVerse = async (surahId, verseId) => {
    const cacheKey = `${surahId}:${verseId}:${TRANSLATION_EDITION}:${TRANSLITERATION_EDITION}`;
    if (state.verseCache.has(cacheKey)) {
      return state.verseCache.get(cacheKey);
    }

    const params = new URLSearchParams();
    if (TRANSLATION_EDITION) {
      params.append('translation', TRANSLATION_EDITION);
    }
    if (TRANSLITERATION_EDITION) {
      params.append('transliteration', TRANSLITERATION_EDITION);
    }

    const query = params.toString();
    const endpoint = query ? `surahs/${surahId}/verses/${verseId}?${query}` : `surahs/${surahId}/verses/${verseId}`;
    const verseResponse = await apiRequest(endpoint);

    const verse = {
      surahId,
      verseId,
      arabic: verseResponse?.arabic || '',
      translation: verseResponse?.translation || '',
      transliteration: verseResponse?.transliteration || '',
      surahName: verseResponse?.surah_name || '',
      surahNameAr: verseResponse?.surah_name_ar || '',
      juz: verseResponse?.juz || '',
      totalVerses: verseResponse?.total_verses || 0,
      verseKey: verseResponse?.verse_key || `${surahId}:${verseId}`,
    };

    state.verseCache.set(cacheKey, verse);
    return verse;
  };

  const selectCdnAudio = (payload) => {
    if (!payload || typeof payload !== 'object') {
      return '';
    }

    const secondary = Array.isArray(payload.audioSecondary) ? payload.audioSecondary : [];
    const cdnSource = secondary.find((url) => typeof url === 'string' && /cdn\.islamic\.network/i.test(url));

    if (cdnSource) {
      return cdnSource;
    }

    return typeof payload.audio === 'string' ? payload.audio : '';
  };

  const loadAudio = async (surahId, verseId) => {
    const reciter = currentReciter || RECITER_EDITION;
    const cacheKey = `${reciter}:${surahId}:${verseId}`;
    if (state.audioCache.has(cacheKey)) {
      return state.audioCache.get(cacheKey);
    }
    const response = await fetchJson(`${QURAN_AUDIO_API_BASE}ayah/${surahId}:${verseId}/${reciter}`);
    const audioUrl = selectCdnAudio(response?.data) || '';
    state.audioCache.set(cacheKey, audioUrl);
    return audioUrl;
  };

  const setText = (element, value) => {
    if (element) {
      element.textContent = value;
    }
  };

  const toggleHidden = (element, show) => {
    if (!element) {
      return;
    }
    element.classList.toggle('hidden', !show);
  };

  const renderList = (element, items, renderer) => {
    if (!element) {
      return;
    }
    element.innerHTML = '';
    items.forEach((item, index) => {
      const node = renderer(item, index);
      if (node) {
        element.appendChild(node);
      }
    });
    element.removeAttribute('aria-busy');
  };

  const createListItem = (classes = '') => {
    const li = document.createElement('li');
    li.className = classes || 'rounded-2xl border border-slate-100 bg-white p-4 shadow-sm';
    return li;
  };

  const buildBadge = (text, theme = 'emerald') => {
    const span = document.createElement('span');
    span.className = `inline-flex items-center rounded-full bg-${theme}-100 px-3 py-1 text-xs font-semibold text-${theme}-700`;
    span.textContent = text;
    return span;
  };

  const computeHasanat = (arabicText) => {
    if (!arabicText) {
      return 0;
    }
    const letters = arabicText.replace(/[^\u0600-\u06FF]/g, '').length;
    return letters * HASANAT_PER_LETTER;
  };

  const buildVerseKey = (surahId, verseId) => `${surahId}:${verseId}`;


  const initDashboard = async () => {
    const root = qs('#alfawz-dashboard');
    if (!root || !wpData.isLoggedIn) {
      return;
    }

    try {
      const [stats, goal, egg, leaderboard] = await Promise.all([
        apiRequest('user-stats'),
        apiRequest(`recitation-goal?timezone_offset=${timezoneOffset()}`),
        apiRequest('egg-challenge'),
        apiRequest('leaderboard'),
      ]);

      state.dashboardStats = stats;

      setText(qs('#alfawz-verses-today', root), formatNumber(goal?.count || stats?.verses_read || 0));
      const goalLabel = qs('#alfawz-daily-goal-text', root);
      if (goalLabel) {
        goalLabel.textContent = goal?.last_reset ? `Goal resets at ${goal.last_reset}` : '';
      }
      setText(qs('#alfawz-memorised-today', root), formatNumber(stats?.verses_memorized || 0));
      setText(qs('#alfawz-current-streak', root), formatNumber(stats?.current_streak || 0));
      setText(qs('#alfawz-hasanat-total', root), formatNumber(stats?.total_hasanat || 0));

      const dailyProgressBar = qs('#alfawz-daily-progress-bar', root);
      const dailyProgressLabel = qs('#alfawz-daily-progress-label', root);
      const dailyProgressNote = qs('#alfawz-daily-progress-note', root);

      if (goal) {
        if (dailyProgressBar) {
          dailyProgressBar.style.width = `${goal.percentage || 0}%`;
        }
        setText(dailyProgressLabel, `${goal.count || 0} / ${goal.target || 10}`);
        setText(dailyProgressNote, goal.remaining === 0 ? wpData.strings?.goalComplete || 'Goal completed for today!' : `${goal.remaining} verses left to reach today\'s target.`);
      }

      const eggStatus = qs('#alfawz-egg-status', root);
      const eggProgress = qs('#alfawz-egg-progress', root);
      if (eggStatus && egg) {
        eggStatus.textContent = `${egg.count} / ${egg.target} ${egg.count === 1 ? 'recitation' : 'recitations'}`;
      }
      if (eggProgress && egg) {
        eggProgress.style.width = `${egg.percentage || 0}%`;
      }

      const leaderboardPreview = qs('#alfawz-leaderboard-preview', root);
      if (leaderboardPreview && Array.isArray(leaderboard)) {
        renderList(leaderboardPreview, leaderboard.slice(0, 5), (item, index) => {
          const li = createListItem('flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 shadow-sm');
          li.innerHTML = `
            <div class="flex items-center gap-3">
              <span class="text-lg font-semibold text-emerald-600">${index + 1}</span>
              <div>
                <p class="font-semibold text-slate-900">${item.display_name || '—'}</p>
                <p class="text-xs text-slate-500">${formatNumber(item.verses_read || 0)} verses</p>
              </div>
            </div>
            <span class="text-sm font-semibold text-emerald-600">⭐ ${formatNumber(item.total_hasanat || 0)}</span>
          `;
          return li;
        });
      }

      const planList = await apiRequest('memorization-plans');
      const planName = qs('#alfawz-plan-name', root);
      const planMeta = qs('#alfawz-plan-meta', root);
      const planProgress = qs('#alfawz-plan-progress', root);

      if (Array.isArray(planList) && planList.length > 0) {
        const activePlan = planList[0];
        setText(planName, activePlan.plan_name || 'Memorisation plan');
        if (planMeta) {
          planMeta.textContent = `${activePlan.completed_verses || 0} / ${activePlan.total_verses || 0} verses`;
        }
        if (planProgress) {
          planProgress.style.width = `${activePlan.completion_percentage || 0}%`;
        }
      } else {
        setText(planName, 'Create your first plan to get started');
        if (planMeta) {
          planMeta.textContent = '';
        }
        if (planProgress) {
          planProgress.style.width = '0%';
        }
      }

      const lastVerseHeading = qs('#alfawz-last-verse-title', root);
      const lastVersePreview = qs('#alfawz-last-verse-preview', root);
      if (lastVerseHeading) {
        lastVerseHeading.textContent = stats?.last_verse_key ? `Surah ${stats.last_verse_key}` : 'Start a new session';
      }
      if (lastVersePreview) {
        lastVersePreview.textContent = stats?.last_verse_excerpt || wpData.strings?.dashboardPlaceholder || 'Launch the reader to log your next ayah.';
      }

      const continueButton = qs('[data-action="continue-reading"]', root);
      if (continueButton && stats?.last_verse_key) {
        continueButton.addEventListener('click', () => {
          window.location.href = `${wpData.pluginUrl || ''}reader/?verse=${encodeURIComponent(stats.last_verse_key)}`;
        });
      }
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to load dashboard data', error);
    }
  };

  const populateSurahSelect = async (select) => {
    if (!select) {
      return;
    }
    const surahs = await loadSurahs();
    select.innerHTML = '<option value="">Select…</option>';
    surahs.forEach((surah) => {
      const option = document.createElement('option');
      option.value = surah.number;
      option.textContent = `${surah.number}. ${surah.englishName}`;
      select.appendChild(option);
    });
  };

  const populateVerseSelect = (select, surah) => {
    if (!select) {
      return;
    }
    select.innerHTML = '';
    if (!surah) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Select a surah first';
      select.appendChild(option);
      select.disabled = true;
      return;
    }
    for (let i = 1; i <= (surah.numberOfAyahs || surah.ayahs || 0); i += 1) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `Ayah ${i}`;
      select.appendChild(option);
    }
    select.disabled = false;
  };

  const getSurahById = (id) => {
    if (!state.surahs) {
      return null;
    }
    return state.surahs.find((surah) => Number(surah.number) === Number(id));
  };

  const initReader = async () => {
    const root = qs('#alfawz-reader');
    if (!root) {
      return;
    }

    const surahSelect = qs('#alfawz-surah-select', root);
    const verseSelect = qs('#alfawz-verse-select', root);
    const loader = qs('#alfawz-verse-loader', root);
    const verseCard = qs('#alfawz-verse-container', root);
    const heading = qs('#alfawz-verse-heading', root);
    const meta = qs('#alfawz-verse-meta', root);
    const arabicEl = qs('#alfawz-arabic-text', root);
    const transliterationEl = qs('#alfawz-transliteration', root);
    const translationEl = qs('#alfawz-translation', root);
    const prevBtn = qs('#alfawz-prev-verse', root);
    const nextBtn = qs('#alfawz-next-verse', root);
    const eggEmoji = qs('#alfawz-egg-emoji', root);
    const eggCount = qs('#alfawz-egg-count', root);
    const eggProgress = qs('#alfawz-egg-progress-bar', root);
    const dailyBar = qs('#alfawz-daily-progress-bar', root);
    const dailyLabel = qs('#alfawz-daily-label', root);
    const dailyNote = qs('#alfawz-daily-note', root);
    const dailyModal = qs('#alfawz-daily-modal', root);
    const dailyDismissControls = dailyModal ? dailyModal.querySelectorAll('[data-dismiss-daily]') : [];
    const dailyModalConfetti = dailyModal ? qs('.alfawz-daily-modal__confetti', dailyModal) : null;
    const confettiHost = qs('#alfawz-confetti-host', root);
    const eggWidget = qs('#alfawz-egg-widget', root);

    let currentSurahId = null;
    let currentSurah = null;
    let currentVerseId = null;
    let isLoading = false;
    let lastEggCelebratedTarget = null;

    const defaultDailyTarget = Number(wpData.dailyTarget || 10);

    const safeSetText = (element, value) => {
      if (element) {
        element.textContent = value || '';
      }
    };

    const setLoadingState = (busy, message) => {
      if (loader) {
        if (message) {
          loader.textContent = message;
        }
        loader.classList.toggle('hidden', !busy);
      }
      if (verseCard) {
        verseCard.classList.toggle('hidden', busy);
      }
      root.setAttribute('aria-busy', busy ? 'true' : 'false');
    };

    const spawnConfetti = (host, count = 18) => {
      if (!host) {
        return;
      }
      for (let i = 0; i < count; i += 1) {
        const piece = document.createElement('span');
        piece.className = 'alfawz-confetti-piece';
        piece.style.setProperty('--alfawz-confetti-x', `${Math.random() * 100}%`);
        piece.style.setProperty('--alfawz-confetti-delay', `${Math.random() * 150}ms`);
        piece.style.setProperty('--alfawz-confetti-duration', `${1200 + Math.random() * 600}ms`);
        host.appendChild(piece);
        window.setTimeout(() => piece.remove(), 2000);
      }
    };

    const celebrateEgg = () => {
      if (eggWidget) {
        eggWidget.classList.add('alfawz-egg-celebrate');
        window.setTimeout(() => eggWidget.classList.remove('alfawz-egg-celebrate'), 1200);
      }
      spawnConfetti(confettiHost);
    };

    const updateEggWidget = (state) => {
      if (!state) {
        return;
      }
      safeSetText(eggCount, `${state.count} / ${state.target}`);
      if (eggProgress) {
        eggProgress.style.width = `${Math.min(100, Number(state.percentage || 0))}%`;
      }
      if (eggEmoji) {
        eggEmoji.textContent = state.count >= state.target || state.completed ? '🐣' : '🥚';
      }
      if (state.completed && state.previous_target && state.previous_target !== lastEggCelebratedTarget) {
        lastEggCelebratedTarget = state.previous_target;
        celebrateEgg();
      }
    };

    const updateNavigationButtons = () => {
      const total = currentSurah ? Number(currentSurah.numberOfAyahs || currentSurah.ayahs || currentSurah.totalVerses || 0) : 0;
      if (prevBtn) {
        prevBtn.disabled = !currentVerseId || currentVerseId <= 1;
      }
      if (nextBtn) {
        nextBtn.disabled = !currentVerseId || !total || currentVerseId >= total;
      }
    };

    const updateDailyWidget = (state) => {
      const resolved = state || {
        count: 0,
        target: defaultDailyTarget,
        remaining: defaultDailyTarget,
        percentage: 0,
      };
      const percentage = Math.min(100, Number(resolved.percentage ?? (resolved.target ? (resolved.count / resolved.target) * 100 : 0)));
      if (dailyBar) {
        dailyBar.style.width = `${percentage}%`;
      }
      safeSetText(dailyLabel, `${resolved.count || 0} / ${resolved.target || defaultDailyTarget}`);
      if (dailyNote) {
        if (resolved.remaining <= 0) {
          dailyNote.textContent = wpData.strings?.goalComplete || 'Goal completed for today!';
        } else {
          const remaining = resolved.remaining ?? Math.max(0, (resolved.target || defaultDailyTarget) - (resolved.count || 0));
          dailyNote.textContent = `${remaining} ${remaining === 1 ? 'verse' : 'verses'} left to reach today's goal.`;
        }
      }
    };

    const openDailyModal = (state) => {
      if (!dailyModal) {
        return;
      }
      dailyModal.classList.remove('hidden');
      if (state) {
        const modalTitle = qs('#alfawz-daily-modal-title', dailyModal);
        const modalMessage = qs('#alfawz-daily-modal-message', dailyModal);
        safeSetText(modalTitle, 'MashaAllah! Goal achieved');
        if (modalMessage) {
          modalMessage.textContent = `You read ${state.target || defaultDailyTarget} verses today. Keep the baraka flowing!`;
        }
      }
      spawnConfetti(dailyModalConfetti || confettiHost, 28);
    };

    const closeDailyModal = () => {
      dailyModal?.classList.add('hidden');
    };

    const renderVerse = async (surahId, verseId) => {
      const surah = getSurahById(surahId);
      if (!surah || !verseId) {
        return;
      }
      currentSurah = surah;
      isLoading = true;
      setLoadingState(true, 'Loading verse…');
      try {
        const verse = await loadVerse(surahId, verseId);
        currentVerseId = verseId;
        isLoading = false;
        setLoadingState(false);
        if (verseSelect) {
          verseSelect.value = String(verseId);
        }
        const totalVerses = verse.totalVerses || Number(surah.numberOfAyahs || surah.ayahs || 0);
        safeSetText(heading, verse.surahName || `Surah ${surah.englishName || surah.englishNameTranslation || surah.name || surahId}`);
        const metaParts = [];
        if (totalVerses) {
          metaParts.push(`Ayah ${verseId} / ${totalVerses}`);
        } else {
          metaParts.push(`Ayah ${verseId}`);
        }
        if (verse.juz) {
          metaParts.push(`Juz ${verse.juz}`);
        }
        if (verse.surahNameAr) {
          metaParts.push(verse.surahNameAr);
        }
        safeSetText(meta, metaParts.join(' • '));
        safeSetText(arabicEl, verse.arabic);
        if (transliterationEl) {
          transliterationEl.textContent = verse.transliteration || '';
          transliterationEl.classList.toggle('hidden', !verse.transliteration);
        }
        if (translationEl) {
          translationEl.textContent = verse.translation || '';
          translationEl.classList.toggle('hidden', !verse.translation);
        }
        updateNavigationButtons();
      } catch (error) {
        isLoading = false;
        console.warn('[AlfawzQuran] Unable to load verse', error);
        setLoadingState(true, 'Unable to load verse. Please try again.');
      }
    };

    const logVerseProgress = async (surahId, verseId) => {
      if (!wpData.isLoggedIn) {
        return;
      }
      try {
        const response = await apiRequest('verse-progress', {
          method: 'POST',
          body: {
            verse_key: `${surahId}:${verseId}`,
            timezone_offset: timezoneOffset(),
          },
        });
        if (response?.daily) {
          updateDailyWidget(response.daily);
          if (response.daily.just_completed && !response.daily.already_counted) {
            openDailyModal(response.daily);
          }
        } else {
          updateDailyWidget(null);
        }
        if (response?.egg) {
          updateEggWidget(response.egg);
        }
      } catch (error) {
        console.warn('[AlfawzQuran] unable to update progress state', error);
      }
    };

    const handleSurahChange = (event) => {
      const surahId = Number(event.target.value);
      currentSurahId = surahId || null;
      currentSurah = surahId ? getSurahById(surahId) : null;
      currentVerseId = null;
      if (currentSurah) {
        populateVerseSelect(verseSelect, currentSurah);
        verseSelect.dispatchEvent(new CustomEvent('alfawz:ready'));
        verseSelect.disabled = false;
        setLoadingState(true, 'Select a verse to begin reading.');
      } else {
        if (verseSelect) {
          verseSelect.innerHTML = '<option value="">Select a surah first</option>';
          verseSelect.disabled = true;
        }
        setLoadingState(true, 'Select a surah and verse to begin your recitation.');
      }
      updateNavigationButtons();
    };

    const handleVerseChange = async (event) => {
      const verseId = Number(event.target.value);
      if (!currentSurahId || !verseId || isLoading) {
        return;
      }
      await renderVerse(currentSurahId, verseId);
    };

    const handlePrev = async () => {
      if (!currentSurahId || !currentVerseId || currentVerseId <= 1 || isLoading) {
        return;
      }
      const previous = currentVerseId - 1;
      if (verseSelect) {
        verseSelect.value = String(previous);
      }
      await renderVerse(currentSurahId, previous);
    };

    const handleNext = async () => {
      if (!currentSurahId || !currentVerseId || isLoading) {
        return;
      }
      const total = currentSurah ? Number(currentSurah.numberOfAyahs || currentSurah.ayahs || 0) : 0;
      if (total && currentVerseId >= total) {
        return;
      }
      const nextVerse = currentVerseId + 1;
      if (verseSelect) {
        verseSelect.value = String(nextVerse);
      }
      await renderVerse(currentSurahId, nextVerse);
      await logVerseProgress(currentSurahId, nextVerse);
    };

    const hydrateFromQuery = () => {
      const params = new URLSearchParams(window.location.search);
      let querySurah = Number(params.get('surah'));
      let queryVerse = params.get('verse');
      if (queryVerse && queryVerse.includes(':')) {
        const [surahPart, versePart] = queryVerse.split(':');
        if (!querySurah && surahPart) {
          querySurah = Number(surahPart);
        }
        queryVerse = versePart;
      }
      const verseNumber = Number(queryVerse);
      if (querySurah) {
        if (verseNumber) {
          const waitForOptions = () => {
            verseSelect.value = String(verseNumber);
            verseSelect.dispatchEvent(new Event('change'));
          };
          verseSelect.addEventListener('alfawz:ready', waitForOptions, { once: true });
        }
        surahSelect.value = String(querySurah);
        handleSurahChange({ target: surahSelect });
      }
    };

    const fetchInitialStates = async () => {
      if (!wpData.isLoggedIn) {
        updateDailyWidget(null);
        updateEggWidget({ count: 0, target: 20, percentage: 0 });
        return;
      }
      try {
        const [stats, egg] = await Promise.all([
          apiRequest(`user-stats?timezone_offset=${timezoneOffset()}`),
          apiRequest('egg-challenge'),
        ]);
        if (stats?.daily_goal) {
          updateDailyWidget(stats.daily_goal);
        } else {
          updateDailyWidget(null);
        }
        if (egg) {
          updateEggWidget(egg);
        } else {
          updateEggWidget({ count: 0, target: 20, percentage: 0 });
        }
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to load gamification state', error);
        updateDailyWidget(null);
        updateEggWidget({ count: 0, target: 20, percentage: 0 });
      }
    };

    setLoadingState(true);
    await populateSurahSelect(surahSelect);
    await fetchInitialStates();
    hydrateFromQuery();

    surahSelect.addEventListener('change', handleSurahChange);
    verseSelect.addEventListener('change', handleVerseChange);
    prevBtn?.addEventListener('click', handlePrev);
    nextBtn?.addEventListener('click', handleNext);
    dailyDismissControls.forEach((control) => {
      control.addEventListener('click', closeDailyModal);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeDailyModal();
      }
    });
  };


  const initMemorizer = async () => {
    const root = qs('#alfawz-memorizer');
    if (!root || !wpData.isLoggedIn) {
      return;
    }

    const surahSelect = qs('#alfawz-memo-surah', root);
    const verseSelect = qs('#alfawz-memo-verse', root);
    const loadBtn = qs('#alfawz-memo-load', root);
    const note = qs('#alfawz-memo-selection-note', root);
    const session = qs('#alfawz-memo-session', root);
    const heading = qs('#alfawz-memo-heading', root);
    const arabicEl = qs('#alfawz-memo-arabic', root);
    const translationEl = qs('#alfawz-memo-translation', root);
    const counterLabel = qs('#alfawz-memo-repetition-label', root);
    const counter = qs('#alfawz-memo-counter', root);
    const progress = qs('#alfawz-memo-progress', root);
    const progressNote = qs('#alfawz-memo-progress-note', root);
    const repeatBtn = qs('#alfawz-memo-repeat', root);
    const audioBtn = qs('#alfawz-memo-audio', root);
    const completeBtn = qs('#alfawz-memo-complete', root);
    const prevBtn = qs('#alfawz-memo-prev', root);
    const nextBtn = qs('#alfawz-memo-next', root);
    const notesField = qs('#alfawz-memo-notes', root);
    const saveNotes = qs('#alfawz-memo-save', root);
    const saveStatus = qs('#alfawz-memo-save-status', root);
    const planList = qs('#alfawz-memo-plan-list', root);
    const refreshPlans = qs('#alfawz-memo-refresh', root);
    const celebrationCard = qs('#alfawz-memo-celebration', root);
    const celebrationTitle = qs('#alfawz-memo-celebration-title', root);
    const celebrationNote = qs('#alfawz-memo-celebration-note', root);

    await populateSurahSelect(surahSelect);

    let currentSurahId = null;
    let currentVerseId = null;
    let repetitionCount = 0;
    let currentAudio = null;

    const getCurrentSurahLength = () => {
      const surah = getSurahById(currentSurahId);
      return surah ? Number(surah.numberOfAyahs || surah.ayahs || 0) : 0;
    };

    const updateNavigationButtons = () => {
      const totalVerses = getCurrentSurahLength();
      const hasSelection = Boolean(currentSurahId && currentVerseId);
      prevBtn.disabled = !hasSelection || currentVerseId <= 1;
      const canAdvance = hasSelection && currentVerseId < totalVerses && repetitionCount >= 20;
      nextBtn.disabled = !canAdvance;
      nextBtn.classList.toggle('alfawz-ready', canAdvance);
    };

    const setCelebrationState = (isActive) => {
      toggleHidden(celebrationCard, isActive);
      root.classList.toggle('alfawz-celebration', isActive);

      if (!isActive) {
        return;
      }

      const totalVerses = getCurrentSurahLength();
      const nextVerseNumber = currentVerseId ? currentVerseId + 1 : null;
      setText(celebrationTitle, 'Takbir! 20 repetitions complete');
      if (celebrationNote) {
        if (nextVerseNumber && nextVerseNumber <= totalVerses) {
          celebrationNote.textContent = `Ayah ${nextVerseNumber} is now unlocked. Tap "Mark memorised" to continue.`;
        } else {
          celebrationNote.textContent = 'You have completed the final ayah in this surah. Outstanding effort!';
        }
      }
    };

    const updateRepetitionUI = () => {
      setText(counterLabel, `${repetitionCount} / 20`);
      setText(counter, formatNumber(repetitionCount));
      if (progress) {
        progress.style.width = `${Math.min(100, (repetitionCount / 20) * 100)}%`;
      }
      const remaining = Math.max(0, 20 - repetitionCount);
      const hasCompleted = repetitionCount >= 20;
      setText(
        progressNote,
        hasCompleted
          ? 'Takbir! You have reached 20 repetitions — log it to update your memorisation stats.'
          : `${remaining} repetitions remaining.`
      );
      completeBtn.disabled = !hasCompleted;
      setCelebrationState(hasCompleted);
      updateNavigationButtons();
    };

    const renderPlanList = async () => {
      try {
        const plans = await apiRequest('memorization-plans');
        renderList(planList, Array.isArray(plans) ? plans : [], (plan) => {
          const li = createListItem('flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm');
          li.innerHTML = `
            <div>
              <p class="font-semibold text-slate-900">${plan.plan_name || 'Plan'}</p>
              <p class="text-xs text-slate-500">Surah ${plan.surah_id} · Ayah ${plan.start_verse} – ${plan.end_verse}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-emerald-600">${formatNumber(plan.completed_verses || 0)} / ${formatNumber(plan.total_verses || 0)}</p>
              <p class="text-xs text-slate-500">${formatPercent(plan.completion_percentage || 0)} complete</p>
            </div>
          `;
          return li;
        });
      } catch (error) {
        planList.innerHTML = '<li class="text-sm text-slate-500">Unable to load plans.</li>';
      }
    };

    refreshPlans?.addEventListener('click', renderPlanList);

    const loadVerseForMemorisation = async () => {
      if (!currentSurahId || !currentVerseId) {
        return;
      }
      const surah = getSurahById(currentSurahId);
      if (!surah) {
        return;
      }
      try {
        const verse = await loadVerse(currentSurahId, currentVerseId);
        setText(heading, `Surah ${surah.englishName} · Ayah ${currentVerseId}`);
        setText(arabicEl, verse.arabic);
        setText(translationEl, verse.translation);
        repetitionCount = 0;
        updateRepetitionUI();
        session.classList.remove('hidden');
        note.textContent = 'Focus on tajwid, rhythm, and meaning with every repetition.';
        delete completeBtn.dataset.status;
        setCelebrationState(false);
      } catch (error) {
        note.textContent = 'Unable to load verse. Please try again.';
      }
    };

    surahSelect.addEventListener('change', (event) => {
      currentSurahId = Number(event.target.value) || null;
      currentVerseId = null;
      populateVerseSelect(verseSelect, getSurahById(currentSurahId));
      verseSelect.value = '';
      verseSelect.disabled = !currentSurahId;
      loadBtn.disabled = !currentSurahId;
      repetitionCount = 0;
      setCelebrationState(false);
      updateNavigationButtons();
    });

    verseSelect.addEventListener('change', (event) => {
      currentVerseId = Number(event.target.value) || null;
      loadBtn.disabled = !currentVerseId;
      setCelebrationState(false);
      updateNavigationButtons();
    });

    loadBtn.addEventListener('click', loadVerseForMemorisation);

    repeatBtn.addEventListener('click', () => {
      repetitionCount = Math.min(20, repetitionCount + 1);
      updateRepetitionUI();
    });

    audioBtn.addEventListener('click', async () => {
      if (!currentSurahId || !currentVerseId) {
        return;
      }
      const audioUrl = await loadAudio(currentSurahId, currentVerseId);
      if (!audioUrl) {
        return;
      }
      if (currentAudio) {
        currentAudio.pause();
      }
      currentAudio = new Audio(audioUrl);
      currentAudio.play();
    });

    completeBtn.addEventListener('click', async () => {
      if (!currentSurahId || !currentVerseId || repetitionCount < 20) {
        return;
      }
      try {
        const verse = await loadVerse(currentSurahId, currentVerseId);
        const hasanat = computeHasanat(verse.arabic);
        await apiRequest('progress', {
          method: 'POST',
          body: {
            surah_id: currentSurahId,
            verse_id: currentVerseId,
            progress_type: 'memorized',
            hasanat,
            repetition_count: repetitionCount,
          },
        });
        completeBtn.dataset.status = 'saved';
        setText(
          progressNote,
          'Memorisation logged! Advance whenever you are ready for the next ayah.'
        );
        setCelebrationState(true);
        updateNavigationButtons();
        await renderPlanList();
      } catch (error) {
        completeBtn.dataset.status = 'error';
      }
    });

    prevBtn.addEventListener('click', async () => {
      if (currentVerseId && currentVerseId > 1) {
        currentVerseId -= 1;
        verseSelect.value = currentVerseId;
        await loadVerseForMemorisation();
      }
    });

    nextBtn.addEventListener('click', async () => {
      const surah = getSurahById(currentSurahId);
      if (!surah) {
        return;
      }
      if (nextBtn.disabled) {
        return;
      }
      if (currentVerseId && currentVerseId < (surah.numberOfAyahs || 0)) {
        currentVerseId += 1;
        verseSelect.value = currentVerseId;
        await loadVerseForMemorisation();
      }
    });

    saveNotes?.addEventListener('click', () => {
      const storageKey = `alfawz-memo-notes-${currentSurahId || 'none'}-${currentVerseId || 'none'}`;
      localStorage.setItem(storageKey, notesField.value || '');
      saveStatus.textContent = 'Notes saved locally on this device.';
    });

    await renderPlanList();
  };

  const initLeaderboard = async () => {
    const root = qs('#alfawz-leaderboard');
    if (!root) {
      return;
    }
    try {
      const leaderboard = await apiRequest('leaderboard');
      const tbody = qs('#alfawz-leaderboard-body', root);
      const updated = qs('#alfawz-leaderboard-updated', root);
      if (!tbody) {
        return;
      }
      tbody.innerHTML = '';
      (leaderboard || []).forEach((entry, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="px-4 py-3 text-sm font-semibold text-slate-500">${index + 1}</td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">${(entry.display_name || '?').slice(0, 2)}</span>
              <span class="font-semibold text-slate-900">${entry.display_name || '—'}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-right text-sm font-semibold text-slate-700">${formatNumber(entry.verses_read || 0)}</td>
          <td class="px-4 py-3 text-right text-sm font-semibold text-emerald-600">${formatNumber(entry.total_hasanat || 0)}</td>
        `;
        tbody.appendChild(tr);
      });
      if (updated) {
        updated.textContent = `Updated ${new Date().toLocaleTimeString()}`;
      }
      tbody.removeAttribute('aria-busy');
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to load leaderboard', error);
    }
  };

  const initProfile = async () => {
    const root = qs('#alfawz-profile');
    if (!root || !wpData.isLoggedIn) {
      return;
    }

    try {
      const stats = state.dashboardStats || await apiRequest('user-stats');
      setText(qs('#alfawz-profile-verses', root), formatNumber(stats?.verses_read || 0));
      setText(qs('#alfawz-profile-hasanat', root), formatNumber(stats?.total_hasanat || 0));
      setText(qs('#alfawz-profile-memorised', root), formatNumber(stats?.verses_memorized || 0));
      setText(qs('#alfawz-profile-streak', root), formatNumber(stats?.current_streak || 0));
      setText(qs('#alfawz-profile-since', root), stats?.member_since ? `Member since ${stats.member_since}` : '');

      const bookmarks = await apiRequest('bookmarks');
      renderList(qs('#alfawz-profile-bookmarks-list', root), Array.isArray(bookmarks) ? bookmarks : [], (bookmark) => {
        const li = createListItem('flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm');
        li.innerHTML = `
          <div>
            <p class="font-semibold text-slate-900">Surah ${bookmark.surah_id} · Ayah ${bookmark.verse_id}</p>
            <p class="text-xs text-slate-500">${bookmark.note || ''}</p>
          </div>
          <a class="text-sm font-semibold text-emerald-600" href="${wpData.pluginUrl || ''}reader/?surah=${bookmark.surah_id}&verse=${bookmark.verse_id}">Open</a>
        `;
        return li;
      });

      const achievementFeed = qs('#alfawz-profile-achievement-feed', root);
      if (achievementFeed) {
        const cards = [];
        if ((stats?.verses_memorized || 0) > 0) {
          cards.push({
            title: 'Memorisation milestone',
            description: `You have memorised ${formatNumber(stats.verses_memorized)} verse(s).`,
          });
        }
        if ((stats?.current_streak || 0) > 0) {
          cards.push({
            title: 'Daily streak',
            description: `Keep going! You are on day ${formatNumber(stats.current_streak)} of consistent recitation.`,
          });
        }
        if (cards.length === 0) {
          cards.push({ title: 'Begin your journey', description: 'Log your first recitation to unlock achievements.' });
        }
        achievementFeed.innerHTML = '';
        cards.forEach((card) => {
          const div = document.createElement('div');
          div.className = 'rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm';
          div.innerHTML = `<h4 class="text-sm font-semibold text-emerald-800">${card.title}</h4><p class="mt-1 text-xs text-emerald-700">${card.description}</p>`;
          achievementFeed.appendChild(div);
        });
      }
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to load profile data', error);
    }
  };

  const initSettings = async () => {
    const root = qs('#alfawz-settings');
    if (!root || !wpData.isLoggedIn) {
      return;
    }

    const form = qs('#alfawz-settings-form', root);
    const reciterSelect = qs('#alfawz-settings-reciter', form);
    const translationSelect = qs('#alfawz-settings-translation', form);
    const transliterationSelect = qs('#alfawz-settings-transliteration', form);
    const hasanatField = qs('#alfawz-settings-hasanat', form);
    const dailySlider = qs('#alfawz-settings-daily', form);
    const dailyLabel = qs('#alfawz-settings-daily-label', root);
    const dailyNote = qs('#alfawz-settings-daily-note', root);
    const leaderboardToggle = qs('#alfawz-settings-leaderboard', form);
    const toggleCopy = qs('[data-toggle-copy]', form);
    const resetBtn = qs('#alfawz-settings-reset', root);
    const saveBtn = qs('#alfawz-settings-save', root);
    const feedback = qs('#alfawz-settings-feedback', root);
    const plansMetric = qs('#alfawz-settings-metric-plans', root);
    const versesMetric = qs('#alfawz-settings-metric-verses', root);
    const streakMetric = qs('#alfawz-settings-metric-streak', root);
    const highlightTitle = qs('#alfawz-settings-highlight-title', root);
    const highlightNote = qs('#alfawz-settings-highlight-note', root);
    const planList = qs('#alfawz-settings-plan-list', root);
    const planEmpty = qs('#alfawz-settings-plan-empty', root);
    const tipParagraph = qs('#alfawz-settings-quote p', root);
    const tipSource = qs('#alfawz-settings-quote-source', root);
    const refreshTip = qs('#alfawz-settings-refresh-tip', root);

    const fallbackPreferences = {
      default_reciter: wpData.defaultReciter || 'ar.alafasy',
      default_translation: wpData.defaultTranslation || 'en.sahih',
      default_transliteration: wpData.defaultTransliteration ?? 'en.transliteration',
      hasanat_per_letter: Number(wpData.hasanatPerLetter || 10),
      daily_verse_target: Number(wpData.dailyTarget || 10),
      enable_leaderboard: wpData.userPreferences?.enable_leaderboard ?? true,
    };

    const statePrefs = { ...fallbackPreferences, ...(wpData.userPreferences || {}) };

    const tips = [
      {
        text: '“The most beloved deed to Allah is the most regular and constant even if it were little.”',
        source: 'Prophet Muhammad ﷺ – Sahih al-Bukhari',
      },
      {
        text: '“Your heart finds rest when the Quran is recited, so keep it luminous with daily verses.”',
        source: 'Al-Ghazali – Ihya Ulum ad-Din',
      },
      {
        text: '“Tie your memorisation with review, for knowledge leaves when neglected.”',
        source: 'Imam Shafi’i – Adab al-Shafi’i',
      },
      {
        text: '“Let each verse you recite be a conversation with your Lord that softens the heart.”',
        source: 'Ibn al-Qayyim – Al-Fawaid',
      },
    ];

    const setFeedback = (message, status = '') => {
      if (!feedback) {
        return;
      }
      feedback.textContent = message || '';
      if (status) {
        feedback.dataset.status = status;
      } else {
        delete feedback.dataset.status;
      }
    };

    const updateDailySliderCopy = (value) => {
      if (dailyLabel) {
        dailyLabel.textContent = `${value}`;
      }
      if (dailyNote) {
        if (value < 10) {
          dailyNote.textContent = 'Gentle steps build unshakeable habits—keep it steady.';
        } else if (value < 20) {
          dailyNote.textContent = 'A balanced challenge that keeps recitation flowing every day.';
        } else {
          dailyNote.textContent = 'Aim high and remember to review—consistency crowns the journey.';
        }
      }
    };

    const applyPreferences = (preferences = {}) => {
      const merged = { ...fallbackPreferences, ...preferences };
      statePrefs.default_reciter = merged.default_reciter;
      statePrefs.default_translation = merged.default_translation;
      statePrefs.default_transliteration = merged.default_transliteration;
      statePrefs.hasanat_per_letter = Number(merged.hasanat_per_letter || fallbackPreferences.hasanat_per_letter);
      statePrefs.daily_verse_target = Number(merged.daily_verse_target || fallbackPreferences.daily_verse_target);
      statePrefs.enable_leaderboard = Boolean(
        merged.enable_leaderboard ?? fallbackPreferences.enable_leaderboard
      );

      currentReciter = statePrefs.default_reciter || RECITER_EDITION;
      state.audioCache.clear();

      if (reciterSelect) {
        reciterSelect.value = statePrefs.default_reciter;
      }
      if (translationSelect) {
        translationSelect.value = statePrefs.default_translation;
      }
      if (transliterationSelect) {
        transliterationSelect.value = statePrefs.default_transliteration ?? '';
      }
      if (hasanatField) {
        hasanatField.value = statePrefs.hasanat_per_letter;
      }
      if (dailySlider) {
        dailySlider.value = statePrefs.daily_verse_target;
        updateDailySliderCopy(statePrefs.daily_verse_target);
      }
      if (leaderboardToggle) {
        leaderboardToggle.checked = Boolean(statePrefs.enable_leaderboard);
      }
      if (toggleCopy) {
        toggleCopy.textContent = leaderboardToggle?.checked
          ? 'Show me on the community leaderboard'
          : 'Keep my progress private';
      }
    };

    const loadPreferences = async () => {
      try {
        const response = await apiRequest('user-preferences');
        if (response && typeof response === 'object') {
          applyPreferences(response);
        } else {
          applyPreferences(statePrefs);
        }
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to load user preferences', error);
        applyPreferences(statePrefs);
      }
    };

    const loadMetrics = async () => {
      try {
        const stats = state.dashboardStats || await apiRequest('user-stats');
        if (plansMetric) {
          plansMetric.textContent = formatNumber(stats?.active_plans || 0);
        }
        if (versesMetric) {
          versesMetric.textContent = formatNumber(stats?.verses_memorized || 0);
        }
        if (streakMetric) {
          streakMetric.textContent = formatNumber(stats?.current_streak || 0);
        }
        if (highlightTitle) {
          if ((stats?.current_streak || 0) > 0) {
            highlightTitle.textContent = `Keep nurturing your ${formatNumber(stats.current_streak)} day streak!`;
            highlightNote.textContent = 'Log a quick recitation session today to protect the momentum.';
          } else {
            highlightTitle.textContent = 'Begin a new streak today';
            highlightNote.textContent = 'Even one ayah brings you closer—set a gentle target and press play.';
          }
        }
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to load settings metrics', error);
      }
    };

    const renderPlans = async () => {
      if (!planList) {
        return;
      }
      planList.innerHTML = '';
      planList.setAttribute('aria-busy', 'true');
      try {
        const plans = await apiRequest('memorization-plans');
        planList.innerHTML = '';
        const collection = Array.isArray(plans) ? plans : [];
        if (!collection.length) {
          planList.setAttribute('aria-busy', 'false');
          planEmpty?.classList.remove('hidden');
          return;
        }
        planEmpty?.classList.add('hidden');
        collection.slice(0, 4).forEach((plan) => {
          const li = document.createElement('li');
          li.className = 'alfawz-settings-plan-item';
          const completion = Number(plan.completion_percentage || 0);
          li.innerHTML = `
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-semibold text-slate-900">${plan.plan_name || 'Memorisation plan'}</p>
              <span class="text-xs font-semibold text-emerald-600">${formatPercent(completion)}</span>
            </div>
            <div class="alfawz-settings-plan-item__meta">
              <span>Surah ${plan.surah_id}</span>
              <span>Ayah ${plan.start_verse} – ${plan.end_verse}</span>
            </div>
            <div class="alfawz-settings-plan-item__progress"><span style="width:${Math.min(100, completion)}%"></span></div>
          `;
          planList.appendChild(li);
        });
        planList.setAttribute('aria-busy', 'false');
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to load memorisation plans', error);
        planList.innerHTML = '<li class="text-sm text-slate-500">Unable to load plans right now.</li>';
        planList.setAttribute('aria-busy', 'false');
      }
    };

    const rotateTip = () => {
      const choice = tips[Math.floor(Math.random() * tips.length)];
      if (tipParagraph) {
        tipParagraph.textContent = choice.text;
      }
      if (tipSource) {
        tipSource.textContent = choice.source;
      }
    };

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!saveBtn) {
        return;
      }
      saveBtn.disabled = true;
      saveBtn.classList.add('is-loading');
      setFeedback('Saving preferences…');
      const payload = {
        default_reciter: reciterSelect?.value || fallbackPreferences.default_reciter,
        default_translation: translationSelect?.value || fallbackPreferences.default_translation,
        default_transliteration: transliterationSelect?.value || '',
        hasanat_per_letter: Number(hasanatField?.value || fallbackPreferences.hasanat_per_letter),
        daily_verse_target: Number(dailySlider?.value || fallbackPreferences.daily_verse_target),
        enable_leaderboard: leaderboardToggle?.checked ? 1 : 0,
      };
      try {
        const response = await apiRequest('user-preferences', {
          method: 'POST',
          body: payload,
        });
        applyPreferences(response || payload);
        setFeedback(wpData.strings?.settingsSaved || 'Preferences updated!', 'success');
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to save user preferences', error);
        setFeedback(wpData.strings?.settingsError || 'Unable to save preferences. Please try again.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.classList.remove('is-loading');
      }
    });

    dailySlider?.addEventListener('input', (event) => {
      const value = Number(event.target.value || fallbackPreferences.daily_verse_target);
      updateDailySliderCopy(value);
    });

    leaderboardToggle?.addEventListener('change', () => {
      if (toggleCopy) {
        toggleCopy.textContent = leaderboardToggle.checked
          ? 'Show me on the community leaderboard'
          : 'Keep my progress private';
      }
    });

    reciterSelect?.addEventListener('change', (event) => {
      currentReciter = event.target.value || RECITER_EDITION;
      state.audioCache.clear();
    });

    resetBtn?.addEventListener('click', () => {
      applyPreferences(fallbackPreferences);
      setFeedback('Preferences reset to site defaults.', 'success');
    });

    refreshTip?.addEventListener('click', rotateTip);

    rotateTip();
    await Promise.all([loadPreferences(), loadMetrics(), renderPlans()]);
  };

  document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initReader();
    initMemorizer();
    initLeaderboard();
    initProfile();
    initSettings();
  });
})();

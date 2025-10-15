(() => {
  const config = window.alfawzReaderData || {};
  const root = document.getElementById('alfawz-reader');

  if (!root) {
    return;
  }

  const API_BASE = (config.apiUrl || '/wp-json/alfawzquran/v1/').replace(/\/+$, '/');
  const headers = {};

  if (config.nonce) {
    headers['X-WP-Nonce'] = config.nonce;
  }

  const elements = {
    surahSelect: root.querySelector('#surah-select'),
    verseSelect: root.querySelector('#verse-select'),
    verseHeading: root.querySelector('#verse-heading'),
    verseLoader: root.querySelector('#verse-loader'),
    verseContent: root.querySelector('#verse-content'),
    arabic: root.querySelector('#arabic-text'),
    transliteration: root.querySelector('#transliteration'),
    translation: root.querySelector('#translation'),
    prev: root.querySelector('#prev-verse'),
    next: root.querySelector('#next-verse'),
    eggIcon: root.querySelector('#egg-icon'),
    eggCount: root.querySelector('#egg-count'),
    eggProgress: root.querySelector('#egg-progress'),
    eggNote: root.querySelector('#egg-note'),
    dailyCount: root.querySelector('#daily-count'),
    dailyProgress: root.querySelector('#daily-progress'),
    dailyNote: root.querySelector('#daily-note'),
    modal: root.querySelector('#reader-modal'),
    modalTitle: root.querySelector('#modal-title'),
    modalMessage: root.querySelector('#modal-message'),
    modalClose: root.querySelector('#modal-close'),
    verseContainer: root.querySelector('#verse-container'),
  };

  const state = {
    surahs: [],
    verseTotals: new Map(),
    verseCache: new Map(),
    currentSurah: null,
    currentVerse: null,
    egg: null,
    daily: null,
    userStats: null,
    isCelebratingEgg: false,
  };

  const confettiColors = ['#10b981', '#f97316', '#60a5fa', '#facc15', '#ec4899'];
  let modalOpen = false;

  const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));
  const clampPercentage = (value) => Math.min(100, Math.max(0, Number(value || 0)));
  const timezoneOffset = () => -new Date().getTimezoneOffset();

  const buildUrl = (path) => `${API_BASE}${path.replace(/^\//, '')}`;

  const request = async (path, { method = 'GET', body } = {}) => {
    const options = {
      method,
      headers: { ...headers },
    };

    if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(buildUrl(path), options);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  const prefersReducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showLoader = (message) => {
    if (elements.verseLoader) {
      elements.verseLoader.textContent = message || '';
      elements.verseLoader.hidden = !message;
    }
    if (elements.verseContent) {
      elements.verseContent.hidden = true;
    }
  };

  const showVerseContent = () => {
    if (elements.verseLoader) {
      elements.verseLoader.hidden = true;
    }
    if (elements.verseContent) {
      elements.verseContent.hidden = false;
    }
  };

  const updateHeading = (text) => {
    if (elements.verseHeading) {
      elements.verseHeading.textContent = text || '';
    }
  };

  const updateNavButtons = () => {
    const total = state.currentSurah ? state.verseTotals.get(state.currentSurah) || 0 : 0;
    const current = Number(state.currentVerse || 0);

    if (elements.prev) {
      elements.prev.disabled = !state.currentSurah || current <= 1;
    }

    if (elements.next) {
      elements.next.disabled = !state.currentSurah || !current || current >= total;
    }
  };

  const updateEggWidget = (egg) => {
    state.egg = egg || state.egg;
    const active = state.egg || {};

    if (!config.isLoggedIn) {
      if (elements.eggIcon) {
        elements.eggIcon.textContent = '🥚';
      }
      if (elements.eggCount) {
        elements.eggCount.textContent = '0 / 0';
      }
      if (elements.eggProgress) {
        elements.eggProgress.style.width = '0%';
      }
      if (elements.eggNote) {
        elements.eggNote.textContent = config.strings?.loginRequired || 'Log in to track the egg challenge.';
      }
      return;
    }

    const count = Number(active.count || 0);
    const target = Number(active.target || config.dailyTarget || 20);
    const percentage = clampPercentage(active.percentage);
    const remaining = Math.max(0, target - count);

    if (elements.eggIcon) {
      elements.eggIcon.textContent = state.isCelebratingEgg ? '🐣' : '🥚';
    }

    if (elements.eggCount) {
      elements.eggCount.textContent = `${formatNumber(count)} / ${formatNumber(target)}`;
    }

    if (elements.eggProgress) {
      elements.eggProgress.style.width = `${percentage}%`;
    }

    if (elements.eggNote) {
      if (state.isCelebratingEgg) {
        elements.eggNote.textContent = config.strings?.eggComplete || 'Egg hatched! Target increased.';
      } else if (remaining === 0 && target > 0) {
        elements.eggNote.textContent = config.strings?.eggComplete || 'Egg hatched! Target increased.';
      } else if (remaining === 1) {
        elements.eggNote.textContent = 'One more recitation to hatch the egg!';
      } else {
        elements.eggNote.textContent = `${formatNumber(remaining)} recitations until the egg hatches.`;
      }
    }
  };

  const updateDailyTracker = (daily) => {
    state.daily = daily || state.daily;
    const active = state.daily || {};

    if (!config.isLoggedIn) {
      if (elements.dailyCount) {
        elements.dailyCount.textContent = '—';
      }
      if (elements.dailyProgress) {
        elements.dailyProgress.style.width = '0%';
      }
      if (elements.dailyNote) {
        elements.dailyNote.textContent = config.strings?.loginRequired || 'Log in to track your daily verses.';
      }
      return;
    }

    const count = Number(active.count || 0);
    const target = Number(active.target || config.dailyTarget || 10);
    const percentage = clampPercentage(active.percentage);
    const remaining = Math.max(0, Number(active.remaining ?? target - count));

    if (elements.dailyCount) {
      elements.dailyCount.textContent = `${formatNumber(count)} / ${formatNumber(target)}`;
    }

    if (elements.dailyProgress) {
      elements.dailyProgress.style.width = `${percentage}%`;
    }

    if (elements.dailyNote) {
      const base = remaining === 0
        ? (config.strings?.goalCompleted || 'Takbir! Daily goal complete.')
        : `${formatNumber(remaining)} ${config.strings?.goalRemaining || 'verses left today'}`;
      const total = state.userStats && typeof state.userStats.verses_read !== 'undefined'
        ? ` · ${formatNumber(state.userStats.verses_read)} verses logged overall`
        : '';
      elements.dailyNote.textContent = `${base}${total}`;
    }
  };

  const triggerConfetti = () => {
    if (!elements.verseContainer || prefersReducedMotion()) {
      return;
    }

    const frag = document.createDocumentFragment();
    const total = 24;

    for (let i = 0; i < total; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'alfawz-confetti-piece';
      piece.style.setProperty('--index', i.toString());
      piece.style.backgroundColor = confettiColors[i % confettiColors.length];
      frag.appendChild(piece);
      setTimeout(() => piece.remove(), 1600);
    }

    elements.verseContainer.appendChild(frag);
  };

  const openModal = (title, message) => {
    if (!elements.modal) {
      return;
    }

    elements.modalTitle.textContent = title || '';
    elements.modalMessage.textContent = message || '';
    elements.modal.setAttribute('aria-hidden', 'false');
    elements.modal.classList.add('is-open');
    modalOpen = true;
  };

  const closeModal = () => {
    if (!elements.modal) {
      return;
    }
    elements.modal.setAttribute('aria-hidden', 'true');
    elements.modal.classList.remove('is-open');
    modalOpen = false;
  };

  const celebrateEgg = (egg) => {
    state.isCelebratingEgg = true;
    updateEggWidget(egg);
    triggerConfetti();
    setTimeout(() => {
      state.isCelebratingEgg = false;
      updateEggWidget(egg);
    }, 2200);
  };

  const persistSelection = () => {
    try {
      if (!state.currentSurah || !state.currentVerse) {
        return;
      }
      const payload = {
        surah: state.currentSurah,
        verse: state.currentVerse,
      };
      localStorage.setItem('alfawz-reader-selection', JSON.stringify(payload));
    } catch (error) {
      // Ignore persistence failures.
    }
  };

  const loadSurahs = async () => {
    if (state.surahs.length) {
      return state.surahs;
    }
    const surahs = await request('surahs');
    state.surahs = Array.isArray(surahs) ? surahs : [];
    state.surahs.forEach((surah) => {
      state.verseTotals.set(Number(surah.number), Number(surah.numberOfAyahs || surah.ayahs || 0));
    });
    return state.surahs;
  };

  const populateSurahSelect = (surahs) => {
    if (!elements.surahSelect) {
      return;
    }

    elements.surahSelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = config.strings?.selectPrompt || 'Select a surah to begin.';
    elements.surahSelect.appendChild(placeholder);

    surahs.forEach((surah) => {
      const option = document.createElement('option');
      option.value = surah.number;
      option.textContent = `${surah.number}. ${surah.englishName}`;
      elements.surahSelect.appendChild(option);
    });
  };

  const populateVerseSelect = (surahId) => {
    if (!elements.verseSelect) {
      return;
    }

    const total = surahId ? state.verseTotals.get(Number(surahId)) || 0 : 0;
    elements.verseSelect.innerHTML = '';

    if (!surahId || total === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = config.strings?.selectPrompt || 'Select a surah to begin.';
      elements.verseSelect.appendChild(option);
      elements.verseSelect.disabled = true;
      return;
    }

    elements.verseSelect.disabled = false;
    for (let i = 1; i <= total; i += 1) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `Ayah ${i}`;
      elements.verseSelect.appendChild(option);
    }
  };

  const getSurahById = (surahId) => state.surahs.find((surah) => Number(surah.number) === Number(surahId));

  const loadVerse = async (surahId, verseNumber) => {
    const cacheKey = `${surahId}:${verseNumber}`;
    if (state.verseCache.has(cacheKey)) {
      return state.verseCache.get(cacheKey);
    }

    const verse = await request(`surahs/${surahId}/verses/${verseNumber}`);
    state.verseCache.set(cacheKey, verse);
    return verse;
  };

  const renderVerse = (verse) => {
    if (!verse) {
      return;
    }

    const surahName = verse.surah?.englishName || `Surah ${verse.surah_id || state.currentSurah || ''}`;
    const heading = `${surahName} · Ayah ${verse.verse_number || state.currentVerse || ''}`;
    updateHeading(heading);

    if (elements.arabic) {
      elements.arabic.textContent = verse.arabic_text || '';
    }

    if (elements.translation) {
      elements.translation.textContent = verse.translation || '';
      elements.translation.hidden = !verse.translation;
    }

    if (elements.transliteration) {
      elements.transliteration.textContent = verse.transliteration || '';
      elements.transliteration.hidden = !verse.transliteration;
    }

    showVerseContent();
  };

  const handleVerseChange = async (verseNumber, { updateSelect = false, track = false } = {}) => {
    if (!state.currentSurah || !verseNumber) {
      return;
    }

    const surah = getSurahById(state.currentSurah);
    const total = state.verseTotals.get(state.currentSurah) || 0;
    const safeVerse = Math.min(Math.max(1, verseNumber), total || verseNumber);

    if (updateSelect && elements.verseSelect) {
      elements.verseSelect.value = safeVerse;
    }

    try {
      showLoader(config.strings?.loading || 'Loading verse…');
      const verse = await loadVerse(state.currentSurah, safeVerse);
      state.currentVerse = safeVerse;
      renderVerse(verse);
      updateNavButtons();
      persistSelection();
      if (track && config.isLoggedIn) {
        await trackProgress();
      }
    } catch (error) {
      if (elements.verseLoader) {
        elements.verseLoader.textContent = 'Unable to load verse. Please try again.';
        elements.verseLoader.hidden = false;
      }
      console.warn('[AlfawzQuran] Unable to load verse', error);
    }
  };

  const handleSurahChange = async (surahId, { fromHistory = false } = {}) => {
    state.currentSurah = surahId || null;
    state.currentVerse = null;
    state.isCelebratingEgg = false;

    if (elements.surahSelect) {
      elements.surahSelect.value = surahId || '';
    }

    populateVerseSelect(surahId);
    updateNavButtons();

    if (!surahId) {
      showLoader(config.strings?.selectPrompt || 'Select a surah to begin.');
      return;
    }

    const surah = getSurahById(surahId);
    if (surah) {
      updateHeading(`${surah.englishName} (${surahId})`);
    }

    if (!fromHistory && elements.verseSelect) {
      elements.verseSelect.value = '';
    }

    showLoader(config.strings?.selectPrompt || 'Select a verse to begin.');
  };

  const trackProgress = async () => {
    if (!config.isLoggedIn || !state.currentSurah || !state.currentVerse) {
      return;
    }

    try {
      const payload = {
        verse_key: `${state.currentSurah}:${state.currentVerse}`,
        timezone_offset: timezoneOffset(),
      };

      const response = await request('verse-progress', { method: 'POST', body: payload });

      if (response?.daily) {
        updateDailyTracker(response.daily);
        document.dispatchEvent(new CustomEvent('alfawz:daily-progress', { detail: response.daily }));
        if (response.daily.just_completed && !response.daily.already_counted) {
          triggerConfetti();
          const message = `Alhamdulillah! You read ${formatNumber(response.daily.target || config.dailyTarget || 10)} verses today.`;
          openModal(config.strings?.goalCompleted || 'Daily goal complete!', message);
        }
      }

      if (response?.egg) {
        updateEggWidget(response.egg);
        if (response.egg.completed) {
          celebrateEgg(response.egg);
        }
      }
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to update progress', error);
    }
  };

  const goToPrevious = async () => {
    if (!state.currentSurah || !state.currentVerse || state.currentVerse <= 1) {
      return;
    }
    const target = state.currentVerse - 1;
    await handleVerseChange(target, { updateSelect: true, track: false });
  };

  const goToNext = async () => {
    if (!state.currentSurah) {
      return;
    }
    const total = state.verseTotals.get(state.currentSurah) || 0;
    if (!state.currentVerse) {
      await handleVerseChange(1, { updateSelect: true, track: true });
      return;
    }
    if (state.currentVerse >= total) {
      return;
    }
    const target = state.currentVerse + 1;
    await handleVerseChange(target, { updateSelect: true, track: true });
  };

  const fetchDailyState = async () => {
    if (!config.isLoggedIn) {
      updateDailyTracker(null);
      return;
    }

    try {
      const response = await request(`recitation-goal?timezone_offset=${timezoneOffset()}`);
      updateDailyTracker(response);
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to load daily goal state', error);
    }
  };

  const fetchEggState = async () => {
    if (!config.isLoggedIn) {
      updateEggWidget(null);
      return;
    }

    try {
      const egg = await request('egg-challenge');
      updateEggWidget(egg);
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to load egg challenge', error);
    }
  };

  const fetchUserStats = async () => {
    if (!config.isLoggedIn) {
      return;
    }

    try {
      const stats = await request('user-stats');
      if (stats && typeof stats === 'object') {
        state.userStats = stats;
        updateDailyTracker(state.daily);
      }
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to load user stats', error);
    }
  };

  const hydrateFromHistory = async () => {
    const params = new URLSearchParams(window.location.search);
    const verseParam = params.get('verse');
    let surahId = Number(params.get('surah')) || null;
    let verseNumber = null;

    if (verseParam) {
      if (verseParam.includes(':')) {
        const [surahPart, versePart] = verseParam.split(':');
        surahId = surahId || Number(surahPart);
        verseNumber = Number(versePart);
      } else {
        verseNumber = Number(verseParam);
      }
    }

    if (!surahId) {
      try {
        const stored = localStorage.getItem('alfawz-reader-selection');
        if (stored) {
          const payload = JSON.parse(stored);
          if (payload?.surah) {
            surahId = Number(payload.surah);
            verseNumber = Number(payload.verse || verseNumber);
          }
        }
      } catch (error) {
        // Ignore storage issues.
      }
    }

    if (surahId) {
      await handleSurahChange(surahId, { fromHistory: true });
      if (verseNumber) {
        await handleVerseChange(verseNumber, { updateSelect: true, track: false });
      }
    }
  };

  const attachEventListeners = () => {
    elements.prev?.addEventListener('click', goToPrevious);
    elements.next?.addEventListener('click', goToNext);

    elements.surahSelect?.addEventListener('change', async (event) => {
      const value = Number(event.target.value) || null;
      await handleSurahChange(value);
    });

    elements.verseSelect?.addEventListener('change', async (event) => {
      const value = Number(event.target.value) || null;
      await handleVerseChange(value, { updateSelect: true, track: false });
    });

    elements.modalClose?.addEventListener('click', closeModal);
    elements.modal?.addEventListener('click', (event) => {
      if (event.target === elements.modal || event.target.classList.contains('alfawz-modal-backdrop')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modalOpen) {
        closeModal();
      }
    });
  };

  const initialise = async () => {
    if (elements.prev) {
      elements.prev.disabled = true;
    }
    if (elements.next) {
      elements.next.disabled = true;
    }

    try {
      const surahs = await loadSurahs();
      populateSurahSelect(surahs);
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to load surahs', error);
      if (elements.surahSelect) {
        elements.surahSelect.innerHTML = '<option value="">Unable to load surah list</option>';
        elements.surahSelect.disabled = true;
      }
    }

    await fetchDailyState();
    await fetchEggState();
    await fetchUserStats();
    await hydrateFromHistory();
    updateNavButtons();
  };

  attachEventListeners();
  showLoader(config.strings?.selectPrompt || 'Select a surah to begin.');
  initialise();
})();

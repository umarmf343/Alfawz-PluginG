(() => {
  const wpData = window.alfawzData || {};
  const API_BASE = (wpData.apiUrl || '/wp-json/alfawzquran/v1/').replace(/\/+$/, '/');
  const QURAN_AUDIO_API_BASE = 'https://api.alquran.cloud/v1/';
  const RECITER_EDITION = wpData.defaultReciter || 'ar.alafasy';
  let currentReciter = wpData.userPreferences?.default_reciter || RECITER_EDITION;
  const TRANSLATION_EDITION = wpData.defaultTranslation || 'en.sahih';
  const TRANSLITERATION_EDITION = wpData.defaultTransliteration || 'en.transliteration';
  const HASANAT_PER_LETTER = 10;

  const headers = {};
  if (wpData.nonce) {
    headers['X-WP-Nonce'] = wpData.nonce;
  }

  const state = {
    surahs: null,
    verseCache: new Map(),
    audioCache: new Map(),
    surahFullCache: new Map(),
    dashboardStats: null,
    hasanatTotal: 0,
    hasanatBadge: null,
    hasanatBadgeCount: null,
    refreshLeaderboard: null,
    leaderboardLoading: null,
  };

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));
  const formatPercent = (value) => `${Math.min(100, Math.max(0, Number(value || 0))).toFixed(0)}%`;
  const timezoneOffset = () => -new Date().getTimezoneOffset();
  const escapeHtml = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const countArabicLetters = (arabicText = '') => {
    if (!arabicText) {
      return 0;
    }
    return String(arabicText)
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[^\u0621-\u064A\u066E-\u06D3]/g, '')
      .length;
  };

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

  const computeHasanat = (arabicText) => countArabicLetters(arabicText) * HASANAT_PER_LETTER;

  const ensureHasanatBadge = () => {
    if (!wpData.isLoggedIn) {
      return null;
    }

    if (state.hasanatBadge) {
      return state.hasanatBadge;
    }

    let badge = document.getElementById('alfawz-hasanat-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'alfawz-hasanat-badge';
      badge.className = 'alfawz-hasanat-badge';
      badge.setAttribute('role', 'status');
      badge.setAttribute('aria-live', 'polite');
      badge.innerHTML = `
        <div class="alfawz-hasanat-badge__count">0</div>
        <div class="alfawz-hasanat-badge__label">HASANAT EARNED</div>
      `;
      document.body.appendChild(badge);
    }

    state.hasanatBadge = badge;
    state.hasanatBadgeCount = badge.querySelector('.alfawz-hasanat-badge__count');
    return badge;
  };

  const updateHasanatDisplays = (total) => {
    const value = Number(total || 0);
    state.hasanatTotal = value;

    if (state.dashboardStats && typeof state.dashboardStats === 'object') {
      state.dashboardStats.total_hasanat = value;
    }

    const badge = ensureHasanatBadge();
    if (badge && state.hasanatBadgeCount) {
      state.hasanatBadgeCount.textContent = formatNumber(value);
    }

    const ids = ['#alfawz-hasanat-total', '#alfawz-profile-hasanat-total'];
    ids.forEach((selector) => {
      const element = qs(selector);
      if (element) {
        element.textContent = formatNumber(value);
      }
    });

    document.querySelectorAll('[data-stat="hasanat"]').forEach((node) => {
      node.textContent = formatNumber(value);
    });
  };

  const showHasanatSplash = (amount, anchor) => {
    if (!amount || amount <= 0) {
      return;
    }
    const host = document.body;
    if (!host) {
      return;
    }
    const splash = document.createElement('div');
    splash.className = 'alfawz-hasanat-splash animate-float-up';
    splash.textContent = `+${formatNumber(amount)} Hasanat!`;
    splash.setAttribute('aria-hidden', 'true');

    let top = window.innerHeight / 2 + window.scrollY;
    let left = window.innerWidth / 2 + window.scrollX;

    if (anchor && typeof anchor.getBoundingClientRect === 'function') {
      const rect = anchor.getBoundingClientRect();
      top = rect.top + window.scrollY - 8;
      left = rect.left + (rect.width / 2) + window.scrollX;
    }

    splash.style.top = `${top}px`;
    splash.style.left = `${left}px`;

    host.appendChild(splash);
    window.setTimeout(() => {
      splash.remove();
    }, 1500);
  };

  const dispatchHasanatEvent = (detail) => {
    try {
      document.dispatchEvent(new CustomEvent('alfawz:hasanat-updated', { detail }));
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to dispatch hasanat event', error);
    }
  };

  const awardHasanat = async ({
    surahId,
    verseId,
    hasanat,
    progressType = 'read',
    repetitionCount = 0,
    anchorEl = null,
  } = {}) => {
    if (!wpData.isLoggedIn) {
      return null;
    }
    const parsedHasanat = Number(hasanat || 0);
    const safeSurah = Number(surahId || 0);
    const safeVerse = Number(verseId || 0);
    if (parsedHasanat <= 0 || safeSurah <= 0 || safeVerse <= 0) {
      return null;
    }
    try {
      const response = await apiRequest('hasanat', {
        method: 'POST',
        body: {
          surah_id: safeSurah,
          verse_id: safeVerse,
          hasanat: parsedHasanat,
          progress_type: progressType,
          repetition_count: repetitionCount,
        },
      });

      const total = response?.total_hasanat ?? state.hasanatTotal;
      updateHasanatDisplays(total);

      const awarded = Number(response?.hasanat_awarded || 0);
      if (awarded > 0) {
        showHasanatSplash(awarded, anchorEl);
        if (typeof state.refreshLeaderboard === 'function') {
          state.refreshLeaderboard();
        }
      }

      dispatchHasanatEvent({
        total,
        amount: awarded,
        surahId: safeSurah,
        verseId: safeVerse,
        progressType,
        alreadyCounted: !(awarded > 0),
      });

      return response;
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to award hasanat', error);
      return null;
    }
  };

  window.AlfawzHasanat = {
    ...(window.AlfawzHasanat || {}),
    countLetters: countArabicLetters,
    computeHasanat,
    updateDisplays: updateHasanatDisplays,
    showSplash: showHasanatSplash,
    award: awardHasanat,
    formatNumber,
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
      const totalHasanat = Number(stats?.total_hasanat || 0);
      setText(qs('#alfawz-hasanat-total', root), formatNumber(totalHasanat));
      updateHasanatDisplays(totalHasanat);

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
    const verseContent = qs('#alfawz-verse-content', root);
    const prevBtn = qs('#alfawz-prev-verse', root);
    const nextBtn = qs('#alfawz-next-verse', root);
    const eggEmoji = qs('#alfawz-egg-emoji', root);
    const eggCount = qs('#alfawz-egg-count', root);
    const eggProgress = qs('#alfawz-egg-progress-bar', root);
    const eggMessage = qs('#alfawz-egg-message', root);
    const dailyBar = qs('#alfawz-daily-progress-bar', root);
    const dailyLabel = qs('#alfawz-daily-label', root);
    const dailyNote = qs('#alfawz-daily-note', root);
    const dailyModal = qs('#alfawz-daily-modal', root);
    const dailyDismissControls = dailyModal ? dailyModal.querySelectorAll('[data-dismiss-daily]') : [];
    const dailyModalConfetti = dailyModal ? qs('.alfawz-daily-modal__confetti', dailyModal) : null;
    const confettiHost = qs('#alfawz-confetti-host', root);
    const eggWidget = qs('#alfawz-egg-widget', root);
    const audioButton = qs('#alfawz-verse-audio', root);
    const audioIcon = qs('#alfawz-verse-audio-icon', root);
    const audioLabel = qs('#alfawz-verse-audio-label', root);
    const surahToggle = qs('#alfawz-surah-toggle', root);
    const surahToggleState = qs('#alfawz-surah-toggle-state', root);
    const surahListWrapper = qs('#alfawz-surah-list-wrapper', root);
    const surahList = qs('#alfawz-surah-list', root);
    const surahListLoader = qs('#alfawz-surah-list-loader', root);

    let currentSurahId = null;
    let currentSurah = null;
    let currentVerseId = null;
    let isLoading = false;
    let lastEggCelebratedTarget = null;
    let currentAudioElement = null;
    let audioState = 'idle';
    let isFullSurahMode = false;

    const defaultDailyTarget = Number(wpData.dailyTarget || 10);

    const safeSetText = (element, value) => {
      if (element) {
        element.textContent = value || '';
      }
    };

    const animateBar = (bar, percentage) => {
      if (!bar) {
        return;
      }
      requestAnimationFrame(() => {
        bar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
      });
    };

    const startVerseTransition = () => {
      if (!verseContent) {
        return;
      }
      verseContent.classList.remove('alfawz-fade-in');
      verseContent.classList.add('alfawz-fade-out');
    };

    const finishVerseTransition = () => {
      if (!verseContent) {
        return;
      }
      requestAnimationFrame(() => {
        verseContent.classList.remove('alfawz-fade-out');
        verseContent.classList.add('alfawz-fade-in');
        window.setTimeout(() => verseContent.classList.remove('alfawz-fade-in'), 320);
      });
    };

    const attachPressFeedback = (button) => {
      if (!button) {
        return;
      }
      const add = () => button.classList.add('alfawz-press');
      const remove = () => button.classList.remove('alfawz-press');
      ['mousedown', 'touchstart', 'keydown'].forEach((eventName) => {
        button.addEventListener(eventName, (event) => {
          if (eventName === 'keydown' && event.key !== ' ' && event.key !== 'Enter') {
            return;
          }
          add();
        });
      });
      ['mouseup', 'mouseleave', 'touchend', 'touchcancel', 'blur', 'keyup'].forEach((eventName) => {
        button.addEventListener(eventName, () => remove());
      });
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
      if (audioButton) {
        const disabled = busy || !currentSurahId || !currentVerseId || audioState === 'loading';
        audioButton.disabled = disabled;
        audioButton.setAttribute('aria-disabled', disabled ? 'true' : 'false');
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
      const target = Number(state.target || 0);
      const count = Number(state.count || 0);
      const percentage = Number(state.percentage ?? (target ? (count / target) * 100 : 0));
      animateBar(eggProgress, percentage);
      if (eggEmoji) {
        eggEmoji.textContent = count >= target || state.completed ? '🐣' : '🥚';
      }
      if (eggMessage) {
        if (state.completed) {
          const rawNextTarget = state.next_target || (target ? target + 5 : 25);
          const nextTarget = Number(rawNextTarget) || 25;
          eggMessage.innerHTML = `🎉 <span class="font-semibold">Takbir!</span> You’ve broken the egg! Next challenge: <span class="font-semibold">${nextTarget} verses</span>`;
        } else {
          const remaining = target ? Math.max(0, target - count) : null;
          if (remaining && remaining > 0) {
            eggMessage.textContent = `${remaining} ${remaining === 1 ? 'more verse' : 'more verses'} to hatch the surprise.`;
          } else {
            eggMessage.textContent = 'Keep reading to hatch the surprise.';
          }
        }
      }
      const label = target ? `${count} / ${target} Verses` : `${count} Verses`;
      safeSetText(eggCount, label);
      const celebrationKey = state.previous_target || state.target || `${count}-${target}`;
      if (state.completed && celebrationKey !== lastEggCelebratedTarget) {
        lastEggCelebratedTarget = celebrationKey;
        celebrateEgg();
      }
    };

    const updateNavigationButtons = () => {
      const total = currentSurah ? Number(currentSurah.numberOfAyahs || currentSurah.ayahs || currentSurah.totalVerses || 0) : 0;
      if (prevBtn) {
        prevBtn.disabled = isFullSurahMode || !currentVerseId || currentVerseId <= 1;
      }
      if (nextBtn) {
        nextBtn.disabled = isFullSurahMode || !currentVerseId || !total || currentVerseId >= total;
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
      animateBar(dailyBar, percentage);
      safeSetText(dailyLabel, `${resolved.count || 0} / ${resolved.target || defaultDailyTarget} Verses Today`);
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

    const updateSurahToggleAvailability = () => {
      if (!surahToggle) {
        return;
      }
      const enabled = Boolean(currentSurahId);
      surahToggle.disabled = !enabled;
      surahToggle.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    };

    const setAudioButtonState = (state) => {
      audioState = state;
      if (!audioButton) {
        return;
      }
      let icon = '▶️';
      let label = wpData.strings?.playVerseAudio || 'Play verse audio';
      let disabled = !currentSurahId || !currentVerseId;
      if (state === 'loading') {
        icon = '⏳';
        label = wpData.strings?.loadingAudio || 'Loading audio…';
        disabled = true;
      } else if (state === 'playing') {
        icon = '⏸️';
        label = wpData.strings?.pauseVerseAudio || 'Pause verse audio';
        disabled = false;
      } else if (state === 'error') {
        icon = '⚠️';
        label = wpData.strings?.audioUnavailable || 'Audio unavailable';
        disabled = true;
      }
      if (audioIcon) {
        audioIcon.textContent = icon;
      }
      safeSetText(audioLabel, label);
      audioButton.disabled = disabled;
      audioButton.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    };

    const stopAudioPlayback = () => {
      if (currentAudioElement) {
        try {
          currentAudioElement.pause();
        } catch (error) {
          // noop
        }
        currentAudioElement.currentTime = 0;
        currentAudioElement = null;
      }
      if (audioState !== 'loading') {
        setAudioButtonState('idle');
      }
    };

    const highlightSurahVerse = (verseId) => {
      if (!surahList) {
        return;
      }
      const items = surahList.querySelectorAll('[data-verse-number]');
      items.forEach((item) => {
        const isActive = Number(item.dataset.verseNumber) === Number(verseId);
        item.classList.toggle('alfawz-surah-verse--active', isActive);
        if (isActive && isFullSurahMode) {
          item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    };

    const loadSurahVerses = async (surahId) => {
      if (!surahId) {
        return [];
      }
      const translation = TRANSLATION_EDITION || '';
      const transliteration = TRANSLITERATION_EDITION || '';
      const cacheKey = `${surahId}:${translation}:${transliteration}`;
      if (state.surahFullCache.has(cacheKey)) {
        return state.surahFullCache.get(cacheKey);
      }
      const params = new URLSearchParams();
      if (translation) {
        params.append('translation', translation);
      }
      if (transliteration) {
        params.append('transliteration', transliteration);
      }
      const endpoint = params.toString()
        ? `surahs/${surahId}/verses?${params.toString()}`
        : `surahs/${surahId}/verses`;
      const response = await apiRequest(endpoint);
      const verses = Array.isArray(response)
        ? response.map((item) => {
            const verseNumber = Number(
              item.numberInSurah || item.number || item.verse_id || item.verseId || 0,
            );
            const surahMeta = item.surah || {};
            return {
              surahId,
              verseId: verseNumber,
              arabic: item.text || item.arabic || '',
              translation: item.translation || '',
              transliteration: item.transliteration || '',
              juz: item.juz || item.juzNumber || null,
              audio: selectCdnAudio(item),
              surahName:
                surahMeta.englishName || currentSurah?.englishName || currentSurah?.englishNameTranslation || '',
              surahNameAr: surahMeta.name || currentSurah?.name || '',
              totalVerses: Number(
                surahMeta.numberOfAyahs || currentSurah?.numberOfAyahs || currentSurah?.ayahs || response.length || 0,
              ),
            };
          })
        : [];
      state.surahFullCache.set(cacheKey, verses);
      return verses;
    };

    const renderFullSurah = async (surahId, focusVerseId) => {
      if (!surahListWrapper || !surahListLoader || !surahList) {
        return;
      }
      surahList.classList.add('hidden');
      surahListLoader.classList.remove('hidden');
      try {
        const verses = await loadSurahVerses(surahId);
        surahList.innerHTML = '';
        verses
          .filter((verse) => verse.verseId)
          .forEach((verse) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'alfawz-surah-verse';
            button.dataset.verseNumber = String(verse.verseId);
            const fragments = [
              `<span class="alfawz-surah-verse__number">${escapeHtml(verse.verseId)}</span>`,
              `<span class="alfawz-surah-verse__arabic" dir="rtl" lang="ar">${escapeHtml(verse.arabic)}</span>`,
            ];
            if (verse.transliteration) {
              fragments.push(
                `<span class="alfawz-surah-verse__transliteration">${escapeHtml(verse.transliteration)}</span>`,
              );
            }
            if (verse.translation) {
              fragments.push(
                `<span class="alfawz-surah-verse__translation">${escapeHtml(verse.translation)}</span>`,
              );
            }
            button.innerHTML = fragments.join('');
            button.addEventListener('click', async () => {
              if (!currentSurahId || isLoading) {
                return;
              }
              const verseNumber = Number(button.dataset.verseNumber);
              if (!Number.isFinite(verseNumber) || verseNumber <= 0) {
                return;
              }
              if (verseSelect) {
                verseSelect.value = String(verseNumber);
              }
              await renderVerse(currentSurahId, verseNumber);
            });
            surahList.appendChild(button);
          });
        surahListLoader.classList.add('hidden');
        surahList.classList.remove('hidden');
        highlightSurahVerse(focusVerseId || currentVerseId);
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to load full surah view', error);
        surahList.innerHTML = '';
        if (surahListLoader) {
          surahListLoader.textContent =
            wpData.strings?.surahLoadError || 'Unable to load the full surah right now.';
        }
      }
    };

    const setFullSurahMode = async (active) => {
      const desired = Boolean(active);
      if (desired && !currentSurahId) {
        return;
      }
      isFullSurahMode = desired;
      if (surahToggle) {
        surahToggle.setAttribute('aria-checked', desired ? 'true' : 'false');
      }
      safeSetText(surahToggleState, desired ? 'On' : 'Off');
      if (surahListWrapper) {
        surahListWrapper.classList.toggle('hidden', !desired);
      }
      updateNavigationButtons();
      if (!desired && surahList) {
        surahList.innerHTML = '';
      }
      if (desired && currentSurahId) {
        await renderFullSurah(currentSurahId, currentVerseId);
      }
    };

    const prefetchAdjacentVerses = (surahId, verseId) => {
      if (!surahId || !verseId) {
        return;
      }
      const total = currentSurah ? Number(currentSurah.numberOfAyahs || currentSurah.ayahs || currentSurah.totalVerses || 0) : 0;
      const targets = [];
      if (verseId > 1) {
        targets.push(verseId - 1);
      }
      if (!total || verseId < total) {
        targets.push(verseId + 1);
      }
      targets
        .filter((candidate) => candidate > 0 && (!total || candidate <= total))
        .forEach((candidate) => {
          loadVerse(surahId, candidate).catch(() => {});
          loadAudio(surahId, candidate).catch(() => {});
        });
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
        stopAudioPlayback();
        startVerseTransition();
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
        setAudioButtonState('idle');
        if (isFullSurahMode) {
          if (!surahList || !surahList.childElementCount) {
            renderFullSurah(surahId, verseId).catch(() => {});
          } else {
            highlightSurahVerse(verseId);
          }
        }
        prefetchAdjacentVerses(surahId, verseId);
        finishVerseTransition();
        return verse;
      } catch (error) {
        isLoading = false;
        console.warn('[AlfawzQuran] Unable to load verse', error);
        setLoadingState(true, 'Unable to load verse. Please try again.');
        setAudioButtonState('error');
        finishVerseTransition();
        return null;
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
      stopAudioPlayback();
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
      updateSurahToggleAvailability();
      setAudioButtonState('idle');
      if (isFullSurahMode) {
        if (currentSurahId) {
          renderFullSurah(currentSurahId, currentVerseId).catch(() => {});
        } else {
          setFullSurahMode(false);
        }
      }
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
      const verse = await renderVerse(currentSurahId, nextVerse);
      if (verse) {
        const hasanat = computeHasanat(verse.arabic);
        if (hasanat > 0) {
          await awardHasanat({
            surahId: currentSurahId,
            verseId: nextVerse,
            hasanat,
            progressType: 'read',
            anchorEl: nextBtn,
          });
        }
      }
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
    updateSurahToggleAvailability();
    setAudioButtonState('idle');

    surahSelect.addEventListener('change', handleSurahChange);
    verseSelect.addEventListener('change', handleVerseChange);
    prevBtn?.addEventListener('click', handlePrev);
    nextBtn?.addEventListener('click', handleNext);
    audioButton?.addEventListener('click', async () => {
      if (!currentSurahId || !currentVerseId) {
        return;
      }
      if (audioState === 'playing' && currentAudioElement) {
        stopAudioPlayback();
        return;
      }
      try {
        setAudioButtonState('loading');
        const audioUrl = await loadAudio(currentSurahId, currentVerseId);
        if (!audioUrl) {
          setAudioButtonState('error');
          return;
        }
        stopAudioPlayback();
        const audio = new Audio(audioUrl);
        currentAudioElement = audio;
        audio.addEventListener('ended', () => setAudioButtonState('idle'));
        audio.addEventListener('pause', () => {
          if (audioState === 'playing' && audio.paused) {
            setAudioButtonState('idle');
          }
        });
        await audio.play();
        setAudioButtonState('playing');
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to play verse audio', error);
        setAudioButtonState('error');
      }
    });
    surahToggle?.addEventListener('click', async () => {
      if (!currentSurahId && !isFullSurahMode) {
        return;
      }
      await setFullSurahMode(!isFullSurahMode);
    });
    attachPressFeedback(prevBtn);
    attachPressFeedback(nextBtn);
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
    let memoHasAwarded = false;
    let memoAwardInFlight = false;

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

    const triggerMemoHasanat = async (anchorEl) => {
      if (memoHasAwarded || memoAwardInFlight) {
        return memoHasAwarded;
      }
      if (!currentSurahId || !currentVerseId) {
        return false;
      }
      const hasanat = computeHasanat(arabicEl.textContent || '');
      if (!hasanat) {
        return false;
      }
      memoAwardInFlight = true;
      try {
        const response = await awardHasanat({
          surahId: currentSurahId,
          verseId: currentVerseId,
          hasanat,
          progressType: 'memorized',
          repetitionCount,
          anchorEl,
        });
        if (response) {
          memoHasAwarded = true;
        }
        return Boolean(response);
      } catch (error) {
        console.warn('[Alfawz Memorizer] Unable to award hasanat', error);
        return false;
      } finally {
        memoAwardInFlight = false;
      }
    };

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
        memoHasAwarded = false;
        memoAwardInFlight = false;
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

    repeatBtn.addEventListener('click', async () => {
      repetitionCount = Math.min(20, repetitionCount + 1);
      updateRepetitionUI();
      if (repetitionCount >= 20) {
        await triggerMemoHasanat(repeatBtn);
      }
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
        if (!memoHasAwarded) {
          await triggerMemoHasanat(completeBtn);
        }
        if (memoHasAwarded) {
          completeBtn.dataset.status = 'saved';
          setText(
            progressNote,
            'Memorisation logged! Advance whenever you are ready for the next ayah.'
          );
          setCelebrationState(true);
          updateNavigationButtons();
          await renderPlanList();
        } else {
          completeBtn.dataset.status = 'error';
        }
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

  const initLeaderboard = () => {
    const root = qs('#alfawz-leaderboard');
    if (!root) {
      state.refreshLeaderboard = null;
      return;
    }
    const tbody = qs('#alfawz-leaderboard-body', root);
    const updated = qs('#alfawz-leaderboard-updated', root);
    if (!tbody) {
      state.refreshLeaderboard = null;
      return;
    }

    const loadLeaderboard = async () => {
      if (state.leaderboardLoading) {
        return state.leaderboardLoading;
      }
      tbody.setAttribute('aria-busy', 'true');
      const request = (async () => {
        try {
          const leaderboard = await apiRequest('leaderboard');
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
        } catch (error) {
          console.warn('[AlfawzQuran] Unable to load leaderboard', error);
        } finally {
          tbody.removeAttribute('aria-busy');
          state.leaderboardLoading = null;
        }
      })();

      state.leaderboardLoading = request;
      return request;
    };

    state.refreshLeaderboard = loadLeaderboard;
    loadLeaderboard();
  };

  const applyProfileAnimations = (root) => {
    if (!root) {
      return;
    }
    const elements = root.querySelectorAll('[data-animate="fade"]');
    elements.forEach((element, index) => {
      element.style.animationDelay = `${index * 110}ms`;
      element.classList.add('animate-fade-in');
    });
  };

  const formatPlanRange = (plan) => {
    if (!plan) {
      return '';
    }
    const start = Number(plan.start_verse || 0);
    const end = Number(plan.end_verse || 0);
    if (start && end && start !== end) {
      return `Ayah ${start}–${end}`;
    }
    if (start) {
      return `Ayah ${start}`;
    }
    return '';
  };

  const buildPlanTitle = (plan) => {
    if (!plan) {
      return '';
    }
    if (plan.plan_name) {
      return plan.plan_name;
    }
    if (plan.surah_id) {
      return `Surah ${plan.surah_id}`;
    }
    return 'Memorization Plan';
  };

  const formatResetTimestamp = (value) => {
    if (!value) {
      return '';
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    }
    return value;
  };

  const initProfile = async () => {
    const root = qs('#alfawz-profile');
    if (!root || !wpData.isLoggedIn) {
      return;
    }

    const nameEl = qs('#alfawz-profile-name', root);
    const taglineEl = qs('#alfawz-profile-tagline', root);
    const heroNoteEl = qs('#alfawz-profile-hero-note', root);
    const streakDaysEl = qs('#alfawz-profile-streak-days', root);
    const hasanatEl = qs('#alfawz-profile-hasanat-total', root);
    const memorizedEl = qs('#alfawz-profile-memorized-count', root);
    const readEl = qs('#alfawz-profile-read-count', root);
    const currentStreakEl = qs('#alfawz-profile-current-streak', root);
    const activePlansEl = qs('#alfawz-profile-active-plans', root);
    const timelineEl = qs('#alfawz-profile-timeline', root);
    const goalTextEl = qs('#alfawz-profile-goal-text', root);
    const goalFillEl = qs('#alfawz-profile-goal-fill', root);
    const goalNoteEl = qs('#alfawz-profile-daily-note', root);
    const goalResetEl = qs('#alfawz-profile-daily-reset', root);

    const renderTimeline = (plans) => {
      if (!timelineEl) {
        return;
      }
      timelineEl.innerHTML = '';
      const list = Array.isArray(plans) ? plans : [];

      const buildTimelineCard = ({ icon, iconClass, title, subtitle, detail, progress, accent }) => {
        const item = document.createElement('div');
        item.className = 'alfawz-timeline-item';
        const iconWrap = document.createElement('div');
        iconWrap.className = `alfawz-timeline-icon ${iconClass || ''}`.trim();
        if (icon === '✓') {
          iconWrap.classList.add('alfawz-check-pop');
        }
        iconWrap.textContent = icon || '';
        item.appendChild(iconWrap);

        const panel = document.createElement('div');
        panel.className = 'rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm';

        const titleEl = document.createElement('p');
        titleEl.className = 'text-lg font-semibold text-slate-900';
        titleEl.textContent = title;
        panel.appendChild(titleEl);

        if (subtitle) {
          const subtitleEl = document.createElement('p');
          subtitleEl.className = 'mt-1 text-base font-medium text-emerald-700';
          subtitleEl.textContent = subtitle;
          panel.appendChild(subtitleEl);
        }

        if (detail) {
          const detailEl = document.createElement('p');
          detailEl.className = 'mt-2 text-base text-slate-600';
          detailEl.textContent = detail;
          panel.appendChild(detailEl);
        }

        if (progress) {
          const progressTrack = document.createElement('div');
          progressTrack.className = 'mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200';
          const progressFill = document.createElement('div');
          progressFill.className = `h-2 rounded-full transition-all duration-700 ease-out ${progress.accentClass || 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600'}`;
          progressFill.style.width = `${Math.max(0, Math.min(100, progress.value || 0))}%`;
          progressTrack.appendChild(progressFill);
          panel.appendChild(progressTrack);

          if (progress.label) {
            const progressLabel = document.createElement('p');
            progressLabel.className = 'mt-2 text-base font-medium text-slate-600';
            progressLabel.textContent = progress.label;
            panel.appendChild(progressLabel);
          }
        }

        if (accent) {
          const accentEl = document.createElement('p');
          accentEl.className = 'mt-2 text-base font-semibold text-amber-600';
          accentEl.textContent = accent;
          panel.appendChild(accentEl);
        }

        item.appendChild(panel);
        return item;
      };

      if (list.length === 0) {
        const encouragement = document.createElement('div');
        encouragement.className = 'rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 text-base font-medium text-emerald-700 shadow-sm';
        encouragement.textContent = 'Begin your first memorization plan to start recording milestones.';
        timelineEl.appendChild(encouragement);
        return;
      }

      const completedPlan = list.find((plan) => Number(plan?.completion_percentage || 0) >= 100 || String(plan?.status || '').toLowerCase() === 'completed');
      if (completedPlan) {
        const totalVerses = Number(completedPlan.total_verses || 0);
        const completedVerses = Number(completedPlan.completed_verses || totalVerses);
        const completedTitle = buildPlanTitle(completedPlan);
        const completedRange = formatPlanRange(completedPlan);
        const title = completedRange ? `${completedTitle} · ${completedRange}` : completedTitle;
        const detail = totalVerses
          ? `Memorized ${formatNumber(completedVerses)} of ${formatNumber(totalVerses)} verses.`
          : 'Memorized verses recorded in this plan.';
        const accent = completedPlan.daily_goal
          ? `Daily rhythm was ${formatNumber(completedPlan.daily_goal)} verses.`
          : null;
        timelineEl.appendChild(
          buildTimelineCard({
            icon: '✓',
            title,
            subtitle: 'Alhamdulillah! Plan completed.',
            detail,
            accent,
          })
        );
      } else {
        const awaiting = document.createElement('div');
        awaiting.className = 'rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-base font-medium text-emerald-700 shadow-sm';
        awaiting.textContent = 'Your first completion is on the horizon—stay consistent and it will arrive soon.';
        timelineEl.appendChild(awaiting);
      }

      const activePlan = list.find((plan) => Number(plan?.completion_percentage || 0) < 100);
      if (activePlan) {
        const totalVerses = Number(activePlan.total_verses || 0);
        const completedVerses = Number(activePlan.completed_verses || 0);
        const remainingVerses = Math.max(0, totalVerses - completedVerses);
        const percentage = totalVerses > 0 ? Math.round((completedVerses / totalVerses) * 100) : Number(activePlan.completion_percentage || 0);
        const activeTitle = buildPlanTitle(activePlan);
        const activeRange = formatPlanRange(activePlan);
        const title = activeRange ? `${activeTitle} · ${activeRange}` : activeTitle;
        const detailParts = [];
        detailParts.push(`${formatNumber(completedVerses)} of ${formatNumber(totalVerses)} verses memorized.`);
        if (activePlan.daily_goal) {
          detailParts.push(`Goal: ${formatNumber(activePlan.daily_goal)} verses/day.`);
        }
        timelineEl.appendChild(
          buildTimelineCard({
            icon: '🕗',
            iconClass: 'alfawz-status-pending',
            title,
            subtitle: 'In progress — keep nourishing your heart.',
            detail: detailParts.join(' '),
            progress: {
              value: percentage,
              label: `${formatNumber(remainingVerses)} verses remain to complete this plan.`,
              accentClass: 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600',
            },
          })
        );
      } else if (list.length > 0) {
        const completedAll = document.createElement('div');
        completedAll.className = 'rounded-2xl border border-emerald-100 bg-white/90 p-5 text-base text-emerald-700 shadow-sm';
        completedAll.textContent = 'All current memorization plans are complete—consider starting a new challenge!';
        timelineEl.appendChild(completedAll);
      }
    };

    const updateDailyGoal = (goalState) => {
      const state = goalState && typeof goalState === 'object' ? goalState : {};
      const count = Number(state.count || 0);
      const target = Number(state.target || state.daily_goal_target || 0);
      const percentage = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;
      if (goalFillEl) {
        goalFillEl.style.width = `${percentage}%`;
        goalFillEl.setAttribute('aria-valuenow', String(percentage));
      }
      if (goalTextEl) {
        setText(goalTextEl, `${formatNumber(count)} / ${formatNumber(target)} verses completed`);
      }
      if (goalNoteEl) {
        const remaining = Math.max(0, target - count);
        const message = percentage >= 100
          ? 'MashaAllah! Today’s goal is complete—every verse is a jewel.'
          : `Only ${formatNumber(remaining)} verses to reach today’s goal.`;
        setText(goalNoteEl, message);
      }
      if (goalResetEl) {
        const resetLabel = state.last_reset ? `Last reset ${formatResetTimestamp(state.last_reset)}` : 'Resets at midnight';
        setText(goalResetEl, resetLabel);
      }
    };

    try {
      const [stats, plans, dailyGoal] = await Promise.all([
        state.dashboardStats ? Promise.resolve(state.dashboardStats) : apiRequest(`user-stats?timezone_offset=${timezoneOffset()}`),
        apiRequest('memorization-plans'),
        apiRequest(`daily-goal?timezone_offset=${timezoneOffset()}`),
      ]);

      if (!state.dashboardStats && stats) {
        state.dashboardStats = stats;
      }

      if (stats) {
        setText(nameEl, stats.display_name || nameEl?.textContent || 'Beloved Student');
        const tagline = stats.member_since
          ? `Walking with the Qur’an since ${stats.member_since}`
          : taglineEl?.textContent || 'Walking with the Qur’an each day.';
        setText(taglineEl, tagline);

        const heroNoteParts = [];
        if (Number(stats.verses_read || 0) > 0) {
          heroNoteParts.push(`${formatNumber(stats.verses_read)} verses recited`);
        }
        if (Number(stats.longest_streak || 0) > 0) {
          heroNoteParts.push(`Longest streak ${formatNumber(stats.longest_streak)} days`);
        }
        if (heroNoteParts.length > 0) {
          setText(heroNoteEl, heroNoteParts.join(' • '));
        } else if (heroNoteEl) {
          heroNoteEl.textContent = 'Each recitation polishes the heart—keep shining.';
        }

        setText(streakDaysEl, formatNumber(stats.current_streak || 0));
        const profileHasanat = Number(stats.total_hasanat || 0);
        setText(hasanatEl, formatNumber(profileHasanat));
        updateHasanatDisplays(profileHasanat);
        setText(memorizedEl, formatNumber(stats.verses_memorized || 0));
        setText(readEl, formatNumber(stats.verses_read || 0));
        setText(currentStreakEl, formatNumber(stats.current_streak || 0));
      }

      const planList = Array.isArray(plans) ? plans : [];
      const activePlans = planList.filter((plan) => String(plan?.status || '').toLowerCase() !== 'completed');
      setText(activePlansEl, formatNumber(activePlans.length));
      renderTimeline(planList);

      updateDailyGoal(dailyGoal || stats?.daily_goal || {});
      applyProfileAnimations(root);
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to load profile data', error);
    }
  };

  const initSettings = async () => {
    const root = qs('#alfawz-settings');
    if (!root || !wpData.isLoggedIn) {
      return;
    }

    const profileForm = qs('#alfawz-settings-profile-form', root);
    const fullNameField = qs('#alfawz-settings-full-name', profileForm);
    const emailField = qs('#alfawz-settings-email', profileForm);
    const profileSaveBtn = qs('#alfawz-settings-profile-save', profileForm);
    const profileStatus = qs('#alfawz-profile-status', root);
    const profileMessage = qs('#alfawz-profile-message', profileForm);

    const planSection = root.querySelector('[data-plan-url]');
    const planName = qs('#alfawz-current-plan-name', root);
    const planRange = qs('#alfawz-current-plan-range', root);
    const planNote = qs('#alfawz-current-plan-note', root);
    const planProgress = qs('#alfawz-plan-progress', root);
    const planEmpty = qs('#alfawz-plan-empty', root);
    const planButton = qs('#alfawz-settings-plan-button', root);
    const changePasswordBtn = qs('#alfawz-change-password', root);

    const preferencesForm = qs('#alfawz-preferences-form', root);
    const audioToggle = qs('#alfawz-pref-audio', preferencesForm);
    const textSizeButtons = Array.from(preferencesForm?.querySelectorAll('[data-text-size]') || []);
    const languageSelect = qs('#alfawz-pref-language', preferencesForm);
    const prefStatus = qs('#alfawz-preferences-status', preferencesForm);
    const prefMessage = qs('#alfawz-preferences-message', preferencesForm);
    const prefSaveBtn = qs('#alfawz-preferences-save', preferencesForm);

    const indicatorTimers = new WeakMap();

    const flashIndicator = (indicator) => {
      if (!indicator) {
        return;
      }
      const existing = indicatorTimers.get(indicator);
      if (existing) {
        clearTimeout(existing);
      }
      indicator.classList.remove('hidden');
      indicator.classList.add('flex', 'is-visible');
      const timeout = setTimeout(() => {
        indicator.classList.remove('is-visible', 'flex');
        indicator.classList.add('hidden');
      }, 2200);
      indicatorTimers.set(indicator, timeout);
    };

    const showMessage = (element, message, status = 'success') => {
      if (!element) {
        return;
      }
      if (!message) {
        element.textContent = '';
        element.classList.add('hidden');
        element.classList.remove('text-emerald-600', 'text-red-600');
        return;
      }
      element.textContent = message;
      element.classList.remove('hidden');
      element.classList.remove('text-emerald-600', 'text-red-600');
      element.classList.add(status === 'error' ? 'text-red-600' : 'text-emerald-600');
    };

    const setActiveTextSize = (size) => {
      textSizeButtons.forEach((button) => {
        const { textSize } = button.dataset;
        const isActive = textSize === size;
        button.classList.toggle('border-emerald-500', isActive);
        button.classList.toggle('bg-emerald-50', isActive);
        button.classList.toggle('text-emerald-700', isActive);
        button.classList.toggle('font-medium', isActive);
        button.classList.toggle('border-gray-300', !isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    const fallbackPreferences = {
      default_reciter: wpData.defaultReciter || 'ar.alafasy',
      default_translation: wpData.defaultTranslation || 'en.sahih',
      default_transliteration: wpData.defaultTransliteration ?? 'en.transliteration',
      hasanat_per_letter: Number(wpData.hasanatPerLetter || 10),
      daily_verse_target: Number(wpData.dailyTarget || 10),
      enable_leaderboard: Boolean(
        wpData.userPreferences?.enable_leaderboard ?? wpData.enableLeaderboard ?? true
      ),
      audio_feedback: true,
      text_size: 'medium',
      interface_language: 'en',
    };

    let preferenceState = { ...fallbackPreferences, ...(wpData.userPreferences || {}) };

    const applyPreferences = (preferences = {}) => {
      preferenceState = { ...preferenceState, ...preferences };
      if (audioToggle) {
        audioToggle.checked = Boolean(preferenceState.audio_feedback);
      }
      setActiveTextSize(preferenceState.text_size || 'medium');
      if (languageSelect) {
        languageSelect.value = preferenceState.interface_language || 'en';
      }
    };

    applyPreferences(preferenceState);

    const loadProfile = async () => {
      try {
        const profile = await apiRequest('user-profile');
        if (profile?.display_name && fullNameField) {
          fullNameField.value = profile.display_name;
        }
        if (profile?.email && emailField) {
          emailField.value = profile.email;
        }
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to load profile data', error);
      }
    };

    const loadPreferences = async () => {
      try {
        const response = await apiRequest('user-preferences');
        if (response && typeof response === 'object') {
          applyPreferences({ ...fallbackPreferences, ...response });
        }
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to load user preferences', error);
      }
    };

    const renderPlan = async () => {
      if (!planName || !planProgress) {
        return;
      }
      try {
        const plans = await apiRequest('memorization-plans');
        const collection = Array.isArray(plans) ? plans : [];
        if (!collection.length) {
          planName.textContent = 'No memorization plan yet.';
          if (planRange) {
            planRange.textContent = '';
          }
          if (planNote) {
            planNote.textContent = 'Tap "Start New Memorization Plan" to begin a gentle path.';
          }
          if (planProgress) {
            planProgress.style.width = '0%';
          }
          planEmpty?.classList.remove('hidden');
          return;
        }

        const activePlan = collection.find((plan) => plan.status === 'active') || collection[0];
        const completion = Math.max(0, Math.min(100, Number(activePlan?.completion_percentage || 0)));
        const totalVerses = Number(activePlan?.total_verses || 0);
        const completedVerses = Number(activePlan?.completed_verses || 0);

        planEmpty?.classList.add('hidden');
        if (activePlan?.plan_name) {
          planName.textContent = activePlan.plan_name;
        } else if (activePlan?.surah_id) {
          planName.textContent = `Surah ${activePlan.surah_id}`;
        } else {
          planName.textContent = 'Memorization plan';
        }
        if (planRange) {
          const rangeParts = [];
          if (activePlan?.surah_id) {
            rangeParts.push(`Surah ${activePlan.surah_id}`);
          }
          if (activePlan?.start_verse && activePlan?.end_verse) {
            rangeParts.push(`Ayah ${activePlan.start_verse} – ${activePlan.end_verse}`);
          }
          planRange.textContent = rangeParts.join(' · ');
        }
        if (planNote) {
          if (completion >= 100) {
            planNote.textContent = 'This plan is complete. Begin a new plan to continue your journey.';
          } else {
            const completedCopy = totalVerses
              ? `${formatNumber(completedVerses)} of ${formatNumber(totalVerses)} verses complete.`
              : '';
            planNote.textContent = `${completedCopy} Complete 20 gentle repetitions to unlock your next verse.`.trim();
          }
        }
        if (planProgress) {
          planProgress.style.width = `${completion}%`;
        }
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to load memorization plan', error);
        planName.textContent = 'Unable to load your memorization plan right now.';
        if (planRange) {
          planRange.textContent = '';
        }
        if (planNote) {
          planNote.textContent = 'Please refresh the page or try again shortly.';
        }
        if (planProgress) {
          planProgress.style.width = '0%';
        }
      }
    };

    if (planButton) {
      planButton.addEventListener('click', () => {
        const targetUrl = planSection?.dataset.planUrl || wpData.memorizerUrl;
        if (targetUrl) {
          window.location.href = targetUrl;
        }
      });
    }

    changePasswordBtn?.addEventListener('click', () => {
      const targetUrl = changePasswordBtn.dataset.passwordUrl;
      if (targetUrl) {
        window.location.href = targetUrl;
      }
    });

    let saveTimeout;
    let isSavingPreferences = false;
    let pendingSave = false;

    const savePreferences = async (manual = false) => {
      if (isSavingPreferences) {
        pendingSave = manual || pendingSave;
        return;
      }

      clearTimeout(saveTimeout);
      isSavingPreferences = true;
      if (prefSaveBtn) {
        prefSaveBtn.disabled = true;
      }
      showMessage(prefMessage, manual ? 'Saving preferences…' : 'Saving…', 'success');

      const payload = {
        ...preferenceState,
        enable_leaderboard: preferenceState.enable_leaderboard ? 1 : 0,
        audio_feedback: preferenceState.audio_feedback ? 1 : 0,
      };

      try {
        const response = await apiRequest('user-preferences', {
          method: 'POST',
          body: payload,
        });
        applyPreferences(response || payload);
        flashIndicator(prefStatus);
        showMessage(prefMessage, wpData.strings?.settingsSaved || 'Preferences updated!', 'success');
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to save user preferences', error);
        showMessage(
          prefMessage,
          wpData.strings?.settingsError || 'Unable to save preferences. Please try again.',
          'error'
        );
      } finally {
        isSavingPreferences = false;
        if (prefSaveBtn) {
          prefSaveBtn.disabled = false;
        }
        if (pendingSave) {
          pendingSave = false;
          savePreferences(false);
        }
      }
    };

    const schedulePreferenceSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        savePreferences(false);
      }, 600);
    };

    audioToggle?.addEventListener('change', () => {
      preferenceState.audio_feedback = audioToggle.checked;
      schedulePreferenceSave();
    });

    textSizeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const { textSize } = button.dataset;
        if (!textSize || textSize === preferenceState.text_size) {
          return;
        }
        preferenceState.text_size = textSize;
        setActiveTextSize(textSize);
        schedulePreferenceSave();
      });
    });

    languageSelect?.addEventListener('change', (event) => {
      preferenceState.interface_language = event.target.value || 'en';
      schedulePreferenceSave();
    });

    preferencesForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      savePreferences(true);
    });

    profileForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const fullName = (fullNameField?.value || '').trim();
      if (!fullName) {
        showMessage(
          profileMessage,
          wpData.strings?.profileNameMissing || 'Please add your full name before saving.',
          'error'
        );
        return;
      }

      showMessage(profileMessage, 'Saving profile…', 'success');
      if (profileSaveBtn) {
        profileSaveBtn.disabled = true;
      }

      try {
        const response = await apiRequest('user-profile', {
          method: 'POST',
          body: { full_name: fullName },
        });
        if (response?.display_name && fullNameField) {
          fullNameField.value = response.display_name;
        }
        if (response?.email && emailField) {
          emailField.value = response.email;
        }
        flashIndicator(profileStatus);
        showMessage(profileMessage, wpData.strings?.profileSaved || 'Profile updated!', 'success');
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to update profile', error);
        showMessage(
          profileMessage,
          wpData.strings?.profileError || 'Unable to update profile. Please try again.',
          'error'
        );
      } finally {
        if (profileSaveBtn) {
          profileSaveBtn.disabled = false;
        }
      }
    });

    await Promise.all([loadProfile(), loadPreferences(), renderPlan()]);
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (wpData.isLoggedIn) {
      ensureHasanatBadge();
    }
    initDashboard();
    initReader();
    initMemorizer();
    initLeaderboard();
    initProfile();
    initSettings();
  });
})();

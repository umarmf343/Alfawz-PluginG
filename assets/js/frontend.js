(() => {
  const wpData = window.alfawzData || {};
  const API_BASE = (wpData.apiUrl || '/wp-json/alfawzquran/v1/').replace(/\/+$/, '/');
  const QURAN_API_BASE = 'https://api.alquran.cloud/v1/';
  const ARABIC_EDITION = 'quran-uthmani';
  const RECITER_EDITION = wpData.defaultReciter || 'ar.alafasy';
  const TRANSLATION_EDITION = wpData.defaultTranslation || 'en.sahih';
  const HASANAT_PER_LETTER = Number(wpData.hasanatPerLetter || 10);

  const headers = {};
  if (wpData.nonce) {
    headers['X-WP-Nonce'] = wpData.nonce;
  }

  const state = {
    surahs: null,
    verseCache: new Map(),
    translationCache: new Map(),
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
    const data = await fetchJson(`${QURAN_API_BASE}surah`);
    state.surahs = Array.isArray(data.data) ? data.data : [];
    return state.surahs;
  };

  const loadVerse = async (surahId, verseId) => {
    const cacheKey = `${surahId}:${verseId}`;
    if (state.verseCache.has(cacheKey)) {
      return state.verseCache.get(cacheKey);
    }

    const [arabicResponse, translationResponse] = await Promise.all([
      fetchJson(`${QURAN_API_BASE}ayah/${surahId}:${verseId}/${ARABIC_EDITION}`),
      fetchJson(`${QURAN_API_BASE}ayah/${surahId}:${verseId}/${TRANSLATION_EDITION}`),
    ]);

    const verse = {
      surahId,
      verseId,
      arabic: arabicResponse?.data?.text || '',
      translation: translationResponse?.data?.text || '',
      surahName: arabicResponse?.data?.surah?.englishName || '',
      juz: arabicResponse?.data?.juz || '',
      numberInSurah: arabicResponse?.data?.numberInSurah || verseId,
    };

    state.verseCache.set(cacheKey, verse);
    return verse;
  };

  const loadAudio = async (surahId, verseId) => {
    const cacheKey = `${surahId}:${verseId}`;
    if (state.audioCache.has(cacheKey)) {
      return state.audioCache.get(cacheKey);
    }
    const response = await fetchJson(`${QURAN_API_BASE}ayah/${surahId}:${verseId}/${RECITER_EDITION}`);
    const audioUrl = response?.data?.audio || '';
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

  const attachNavigation = () => {
    const nav = qs('.alfawz-bottom-navigation');
    if (!nav) {
      return;
    }
    nav.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-page]');
      if (!link) {
        return;
      }
      nav.querySelectorAll('a[data-page]').forEach((anchor) => {
        anchor.classList.toggle('active', anchor === link);
      });
    });
  };

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

  const initQaidah = async () => {
    const root = qs('#alfawz-qaidah');
    if (!root || !wpData.isLoggedIn) {
      return;
    }
    const role = root.dataset.role || 'student';

    if (role === 'teacher') {
      const classList = qs('#alfawz-qaidah-class-list', root);
      const assignmentList = qs('#alfawz-qaidah-assignment-list', root);
      const audioForm = qs('#alfawz-qaidah-audio-form', root);
      const audioStatus = qs('#alfawz-qaidah-audio-status', root);

      try {
        const classes = await apiRequest('qaidah/classes');
        renderList(classList, Array.isArray(classes) ? classes : [], (item) => {
          const li = createListItem();
          li.innerHTML = `<p class="font-semibold text-slate-900">${item.label}</p>`;
          return li;
        });
      } catch (error) {
        classList.innerHTML = '<li class="text-sm text-slate-500">Unable to load classes.</li>';
      }

      try {
        const assignments = await apiRequest('qaidah/assignments?context=manage');
        renderList(assignmentList, Array.isArray(assignments) ? assignments : [], (assignment) => {
          const li = createListItem();
          li.innerHTML = `
            <div class="space-y-1">
              <p class="font-semibold text-slate-900">${assignment.title || 'Qa’idah board'}</p>
              <p class="text-xs text-slate-500">${assignment.description || ''}</p>
            </div>
            <span class="text-xs text-slate-500">${assignment.students ? assignment.students.length : 0} learners</span>
          `;
          return li;
        });
      } catch (error) {
        assignmentList.innerHTML = '<li class="text-sm text-slate-500">Unable to load assignments.</li>';
      }

      audioForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fileInput = qs('#alfawz-qaidah-audio-file', audioForm);
        if (!fileInput?.files?.length) {
          return;
        }
        const formData = new FormData();
        formData.append('audio', fileInput.files[0]);
        try {
          await apiRequest('qaidah/audio', { method: 'POST', body: formData });
          audioStatus.textContent = 'Audio uploaded successfully.';
          fileInput.value = '';
        } catch (error) {
          audioStatus.textContent = 'Upload failed. Please try again.';
        }
      });
    } else {
      const assignmentList = qs('#alfawz-qaidah-student-assignments', root);
      const progressBar = qs('#alfawz-qaidah-progress-bar', root);
      const progressLabel = qs('#alfawz-qaidah-progress-label', root);

      try {
        const assignments = await apiRequest('qaidah/assignments');
        renderList(assignmentList, Array.isArray(assignments) ? assignments : [], (assignment) => {
          const li = createListItem();
          li.innerHTML = `
            <div class="space-y-1">
              <p class="font-semibold text-slate-900">${assignment.title || 'Qa’idah practice'}</p>
              <p class="text-xs text-slate-500">${assignment.description || ''}</p>
            </div>
            <a class="text-sm font-semibold text-emerald-600" href="${assignment.permalink || '#'}">Open</a>
          `;
          return li;
        });
      } catch (error) {
        assignmentList.innerHTML = '<li class="text-sm text-slate-500">No assignments yet. Stay tuned!</li>';
      }

      try {
        const egg = await apiRequest('egg-challenge');
        if (progressBar) {
          progressBar.style.width = `${egg.percentage || 0}%`;
        }
        if (progressLabel) {
          progressLabel.textContent = `${egg.count} of ${egg.target} recitations logged by your class.`;
        }
      } catch (error) {
        if (progressLabel) {
          progressLabel.textContent = 'Unable to load egg challenge progress.';
        }
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initMemorizer();
    initLeaderboard();
    initProfile();
    initQaidah();
    attachNavigation();
  });
})();

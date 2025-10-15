(() => {
  const wpData = window.alfawzMemoData || window.alfawzData || {};
  const root = document.getElementById('alfawz-memorization');
  if (!root || !wpData.isLoggedIn) {
    return;
  }

  const API_BASE = (wpData.apiUrl || '/wp-json/alfawzquran/v1/').replace(/\/+$/, '/');
  const QURAN_API_BASE = 'https://api.alquran.cloud/v1/';
  const ARABIC_EDITION = 'quran-uthmani';
  const TRANSLATION_EDITION = wpData.defaultTranslation || 'en.sahih';
  const HEADERS = {};
  if (wpData.nonce) {
    HEADERS['X-WP-Nonce'] = wpData.nonce;
  }

  const el = {
    creationForm: root.querySelector('#alfawz-memorization-form'),
    surahSelect: root.querySelector('#alfawz-memorization-surah'),
    startInput: root.querySelector('#alfawz-memorization-start'),
    endInput: root.querySelector('#alfawz-memorization-end'),
    beginButton: root.querySelector('#alfawz-memorization-begin'),
    formStatus: root.querySelector('#alfawz-memorization-form-status'),
    emptyState: root.querySelector('#alfawz-memorization-empty'),
    activeState: root.querySelector('#alfawz-memorization-active'),
    planLabel: root.querySelector('#alfawz-memorization-plan-label'),
    planTitle: root.querySelector('#alfawz-memorization-plan-title'),
    planRange: root.querySelector('#alfawz-memorization-plan-range'),
    planProgress: root.querySelector('#alfawz-memorization-plan-progress'),
    verseArabic: root.querySelector('#alfawz-memorization-ayah-ar'),
    verseTranslation: root.querySelector('#alfawz-memorization-ayah-translation'),
    verseTransliteration: root.querySelector('#alfawz-memorization-ayah-transliteration'),
    translationToggle: root.querySelector('#alfawz-memorization-toggle-translation'),
    repetitionsLabel: root.querySelector('#alfawz-memorization-repetitions'),
    progressBar: root.querySelector('#progress-bar'),
    progressNote: root.querySelector('#progress-note'),
    counter: root.querySelector('#counter'),
    repeatButton: root.querySelector('#repeat-btn'),
    statsTotal: root.querySelector('#alfawz-memorization-stat-total'),
    statsMemorized: root.querySelector('#alfawz-memorization-stat-memorized'),
    statsRemaining: root.querySelector('#alfawz-memorization-stat-remaining'),
    statsCompletion: root.querySelector('#alfawz-memorization-stat-completion'),
    activeStatus: root.querySelector('#alfawz-memorization-active-status'),
    modal: root.querySelector('#celebration-modal'),
    continueButton: root.querySelector('#next-verse-btn'),
    reviewButton: root.querySelector('#review-later'),
  };

  const state = {
    surahs: [],
    surahMap: new Map(),
    planSummary: null,
    planDetail: null,
    repetitionCount: 0,
    currentVerse: null,
    currentVerseData: null,
    translationVisible: true,
    modalOpen: false,
    hasAwardedCurrentVerse: false,
    awardInFlight: false,
  };

  const softChimeSrc =
    'data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAADP/AP//z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A//8z/8A';

  const playChime = () => {
    try {
      const audio = new Audio(softChimeSrc);
      audio.play().catch(() => {});
    } catch (error) {
      console.warn('[Alfawz Memorization] Unable to play chime', error);
    }
  };

  const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));
  const formatPercent = (value) => `${Math.min(100, Math.max(0, Number(value || 0))).toFixed(0)}%`;

  const fallbackCountLetters = (text = '') =>
    String(text)
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[^\u0621-\u064A\u066E-\u06D3]/g, '')
      .length;

  const getHasanatBridge = () => window.AlfawzHasanat || {};

  const computeVerseHasanat = (arabicText = '') => {
    const bridge = getHasanatBridge();
    if (bridge && typeof bridge.computeHasanat === 'function') {
      return bridge.computeHasanat(arabicText);
    }
    return fallbackCountLetters(arabicText) * 10;
  };

  const toggleElement = (element, show) => {
    if (!element) {
      return;
    }
    element.classList.toggle('hidden', !show);
  };

  const setStatus = (message, tone = 'muted') => {
    if (!el.formStatus) {
      return;
    }
    el.formStatus.textContent = message || '';
    el.formStatus.className = `text-sm ${
      tone === 'error' ? 'text-red-600' : tone === 'success' ? 'text-emerald-600' : 'text-slate-600'
    }`;
  };

  const buildApiUrl = (path) => `${API_BASE}${path.replace(/^\//, '')}`;

  const apiRequest = async (path, { method = 'GET', body } = {}) => {
    const options = { method, headers: { ...HEADERS } };
    if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(buildApiUrl(path), options);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
    }
    if (response.status === 204) {
      return null;
    }
    return response.json();
  };

  const fetchSurahs = async () => {
    if (state.surahs.length) {
      return state.surahs;
    }
    const response = await fetch(`${QURAN_API_BASE}surah`);
    if (!response.ok) {
      throw new Error('Unable to load surahs');
    }
    const data = await response.json();
    state.surahs = Array.isArray(data?.data) ? data.data : [];
    state.surahs.forEach((surah) => {
      state.surahMap.set(Number(surah.number), surah);
    });
    return state.surahs;
  };

  const populateSurahSelect = async () => {
    try {
      const surahs = await fetchSurahs();
      el.surahSelect.innerHTML = '';
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = wpData.selectSurahLabel || 'Select a surah';
      placeholder.disabled = true;
      placeholder.selected = true;
      el.surahSelect.appendChild(placeholder);

      surahs.forEach((surah) => {
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number}. ${surah.englishName}`;
        option.dataset.ayahs = surah.numberOfAyahs;
        el.surahSelect.appendChild(option);
      });
    } catch (error) {
      setStatus(wpData.surahErrorMessage || 'Unable to load surahs right now.', 'error');
      console.error('[Alfawz Memorization] Failed to populate surahs', error);
    }
  };

  const constrainRangeInputs = () => {
    const selectedOption = el.surahSelect.options[el.surahSelect.selectedIndex];
    const totalAyahs = selectedOption ? Number(selectedOption.dataset.ayahs || 0) : 0;
    if (totalAyahs > 0) {
      el.startInput.max = totalAyahs;
      el.endInput.max = totalAyahs;
      if (Number(el.endInput.value || 0) > totalAyahs) {
        el.endInput.value = totalAyahs;
      }
    }
    const start = Number(el.startInput.value || 1);
    const end = Number(el.endInput.value || start);
    if (end < start) {
      el.endInput.value = start;
    }
  };

  const fetchPlans = async () => {
    try {
      const plans = await apiRequest('memorization-plans');
      return Array.isArray(plans) ? plans : [];
    } catch (error) {
      console.error('[Alfawz Memorization] Unable to load plans', error);
      return [];
    }
  };

  const chooseActivePlan = (plans) => plans.find((plan) => (plan.status || 'active') !== 'completed') || null;

  const fetchPlanDetail = async (planId) => {
    if (!planId) {
      return null;
    }
    try {
      const detail = await apiRequest(`memorization-plans/${planId}`);
      return detail;
    } catch (error) {
      console.error('[Alfawz Memorization] Unable to load plan detail', error);
      return null;
    }
  };

  const getCompletedSet = (plan) => {
    const progress = Array.isArray(plan?.progress) ? plan.progress : [];
    const completed = new Set();
    progress.forEach((entry) => {
      if (Number(entry.is_completed) === 1) {
        completed.add(Number(entry.verse_id));
      }
    });
    return completed;
  };

  const determineNextVerse = (plan) => {
    if (!plan) {
      return null;
    }
    const start = Number(plan.start_verse);
    const end = Number(plan.end_verse);
    const completed = getCompletedSet(plan);
    for (let verse = start; verse <= end; verse += 1) {
      if (!completed.has(verse)) {
        return verse;
      }
    }
    return null;
  };

  const fetchVerse = async (surahId, verseId) => {
    if (!surahId || !verseId) {
      return null;
    }
    const requests = [
      fetch(`${QURAN_API_BASE}ayah/${surahId}:${verseId}/${ARABIC_EDITION}`),
      fetch(`${QURAN_API_BASE}ayah/${surahId}:${verseId}/${TRANSLATION_EDITION}`),
    ];

    const [arabicResponse, translationResponse] = await Promise.all(requests);
    if (!arabicResponse.ok || !translationResponse.ok) {
      throw new Error('Unable to load verse from API');
    }
    const [arabicData, translationData] = await Promise.all([arabicResponse.json(), translationResponse.json()]);

    return {
      arabic: arabicData?.data?.text || '',
      translation: translationData?.data?.text || '',
      surahName: arabicData?.data?.surah?.englishName || '',
      numberInSurah: arabicData?.data?.numberInSurah || verseId,
    };
  };

  const updateStats = (plan) => {
    if (!plan) {
      el.statsTotal.textContent = '0';
      el.statsMemorized.textContent = '0';
      el.statsRemaining.textContent = '0';
      el.statsCompletion.textContent = '0%';
      return;
    }
    const total = Number(plan.total_verses || plan.end_verse - plan.start_verse + 1 || 0);
    const completedSet = getCompletedSet(plan);
    const completed = completedSet.size;
    const remaining = Math.max(0, total - completed);
    el.statsTotal.textContent = formatNumber(total);
    el.statsMemorized.textContent = formatNumber(completed);
    el.statsRemaining.textContent = formatNumber(remaining);
    el.statsCompletion.textContent = formatPercent(total === 0 ? 0 : (completed / total) * 100);
  };

  const setPlanHeader = (plan) => {
    if (!plan) {
      el.planLabel.textContent = '';
      el.planTitle.textContent = '';
      el.planRange.textContent = '';
      el.planProgress.textContent = '';
      return;
    }

    const surah = state.surahMap.get(Number(plan.surah_id));
    const planName = plan.plan_name || (surah ? `${surah.englishName}` : 'Memorization Plan');
    el.planLabel.textContent = surah ? `${surah.englishName} • ${surah.englishNameTranslation || surah.englishName}` : '';
    el.planTitle.textContent = planName;
    el.planRange.textContent = `Ayah ${plan.start_verse} – ${plan.end_verse}`;
    const total = Number(plan.total_verses || plan.end_verse - plan.start_verse + 1 || 0);
    const completed = getCompletedSet(plan).size;
    el.planProgress.textContent = `${formatNumber(completed)} / ${formatNumber(total)} ${wpData.versesLabel || 'Verses'}`;
  };

  const setRepeatButtonState = () => {
    if (!el.repeatButton) {
      return;
    }
    el.repeatButton.disabled = !state.currentVerse || state.modalOpen;
  };

  const triggerMemorizationHasanat = async () => {
    if (state.hasAwardedCurrentVerse || state.awardInFlight) {
      return;
    }
    if (!state.planDetail || !state.currentVerse) {
      return;
    }
    const verseData = state.currentVerseData;
    if (!verseData || !verseData.arabic) {
      return;
    }
    const hasanat = computeVerseHasanat(verseData.arabic);
    if (!hasanat || hasanat <= 0) {
      return;
    }
    const bridge = getHasanatBridge();
    if (!bridge || typeof bridge.award !== 'function') {
      return;
    }

    state.awardInFlight = true;
    try {
      const result = await bridge.award({
        surahId: state.planDetail.surah_id,
        verseId: state.currentVerse,
        hasanat,
        progressType: 'memorized',
        repetitionCount: Math.max(20, state.repetitionCount || 20),
        anchorEl: el.repeatButton,
      });
      if (result !== null) {
        state.hasAwardedCurrentVerse = true;
      }
    } catch (error) {
      console.warn('[Alfawz Memorization] Unable to award hasanat', error);
    } finally {
      state.awardInFlight = false;
    }
  };

  const updateTranslationToggleLabel = () => {
    if (!el.translationToggle) {
      return;
    }
    const label = state.translationVisible
      ? wpData.hideTranslationLabel || 'Hide translation'
      : wpData.showTranslationLabel || 'Show translation';
    el.translationToggle.innerHTML = `🔁 ${label}`;
  };

  const updateProgressUI = () => {
    const count = state.repetitionCount;
    el.repetitionsLabel.textContent = `${count} / 20 ${wpData.repetitionLabel || 'Repetitions'}${count >= 20 ? ' ✅' : ''}`;
    const width = Math.min(100, (count / 20) * 100);
    if (el.progressBar) {
      el.progressBar.style.width = `${width}%`;
      el.progressBar.classList.toggle('alfawz-progress-celebrate', count >= 20);
      el.progressBar.classList.toggle('animate-pulse', count >= 20);
    }
    if (el.counter) {
      el.counter.textContent = `${count} / 20 ${wpData.repetitionLabel || 'Repetitions'}`;
    }
    if (el.progressNote) {
      const remaining = 20 - count;
      el.progressNote.textContent =
        count >= 20
          ? wpData.readyMessage || 'Takbir! You may progress to the next ayah.'
          : count === 0
          ? wpData.progressIntro || 'Tap repeat to begin your twenty-fold focus session.'
          : `${remaining} ${wpData.remainingLabel || 'repetitions remaining.'}`;
    }
    if (count >= 20 && !state.hasAwardedCurrentVerse) {
      triggerMemorizationHasanat();
    }
    if (count >= 20 && !state.modalOpen) {
      openModal();
    }
    setRepeatButtonState();
  };

  const resetRepetition = () => {
    state.repetitionCount = 0;
    state.hasAwardedCurrentVerse = false;
    state.awardInFlight = false;
    updateProgressUI();
  };

  const openModal = () => {
    if (!el.modal) {
      return;
    }
    state.modalOpen = true;
    el.modal.classList.remove('hidden');
    el.modal.classList.add('flex');
    const modalCard = el.modal.querySelector('.celebration-card');
    if (modalCard) {
      modalCard.classList.remove('animate-pop-in');
      // Force reflow to restart animation
      void modalCard.offsetWidth;
      modalCard.classList.add('animate-pop-in');
    }
    setRepeatButtonState();
  };

  const closeModal = () => {
    if (!el.modal) {
      return;
    }
    state.modalOpen = false;
    el.modal.classList.add('hidden');
    el.modal.classList.remove('flex');
    setRepeatButtonState();
  };

  const renderVerse = async () => {
    if (!state.planDetail || !state.currentVerse) {
      return;
    }
    el.activeStatus.textContent = '';
    try {
      const verse = await fetchVerse(state.planDetail.surah_id, state.currentVerse);
      if (!verse) {
        throw new Error('Empty verse payload');
      }
      state.currentVerseData = {
        ...verse,
        surahId: state.planDetail?.surah_id || null,
        verseId: state.currentVerse,
      };
      state.hasAwardedCurrentVerse = false;
      state.awardInFlight = false;
      el.verseArabic.textContent = verse.arabic;
      el.verseTranslation.textContent = verse.translation;
      el.verseTranslation.classList.toggle('hidden', !state.translationVisible);
      if (el.progressNote) {
        el.progressNote.textContent = wpData.progressIntro || 'Tap repeat to begin your twenty-fold focus session.';
      }
      updateTranslationToggleLabel();
      el.repetitionsLabel.textContent = `0 / 20 ${wpData.repetitionLabel || 'Repetitions'}`;
      resetRepetition();
    } catch (error) {
      console.error('[Alfawz Memorization] Failed to render verse', error);
      state.currentVerseData = null;
      state.hasAwardedCurrentVerse = false;
      state.awardInFlight = false;
      el.activeStatus.textContent = wpData.verseErrorMessage || 'Unable to load verse details right now.';
    }
  };

  const setActiveState = (hasPlan) => {
    toggleElement(el.activeState, hasPlan);
    toggleElement(el.emptyState, !hasPlan);
  };

  const refreshPlan = async () => {
    const plans = await fetchPlans();
    state.planSummary = chooseActivePlan(plans);
    if (!state.planSummary) {
      state.planDetail = null;
      state.currentVerse = null;
      state.currentVerseData = null;
      state.hasAwardedCurrentVerse = false;
      state.awardInFlight = false;
      setActiveState(false);
      setStatus(wpData.noPlanMessage || 'Create your first plan to begin memorizing.', 'muted');
      setRepeatButtonState();
      return;
    }
    state.planDetail = await fetchPlanDetail(state.planSummary.id);
    if (!state.planDetail) {
      setActiveState(false);
      setStatus(wpData.planLoadError || 'Unable to load your memorization plan.', 'error');
      state.currentVerseData = null;
      state.hasAwardedCurrentVerse = false;
      state.awardInFlight = false;
      return;
    }
    await fetchSurahs();
    setPlanHeader(state.planDetail);
    updateStats(state.planDetail);
    const nextVerse = determineNextVerse(state.planDetail);
    state.currentVerse = nextVerse;
    setActiveState(true);
    if (!nextVerse) {
      el.activeStatus.textContent = wpData.planCompleteMessage || 'All verses in this plan are memorized. Create a new plan to continue.';
      toggleElement(el.repeatButton, false);
      if (el.progressBar) {
        el.progressBar.style.width = '100%';
        el.progressBar.classList.add('alfawz-progress-celebrate', 'animate-pulse');
      }
      if (el.repetitionsLabel) {
        el.repetitionsLabel.textContent = `20 / 20 ${wpData.repetitionLabel || 'Repetitions'} ✅`;
      }
      if (el.counter) {
        el.counter.textContent = `20 / 20 ${wpData.repetitionLabel || 'Repetitions'}`;
      }
      if (el.progressNote) {
        el.progressNote.textContent = wpData.planCompleteMessage || 'All verses in this plan are memorized. Create a new plan to continue.';
      }
      setRepeatButtonState();
      return;
    }
    toggleElement(el.repeatButton, true);
    await renderVerse();
  };

  const recordCompletion = (verseId) => {
    if (!state.planDetail) {
      return;
    }
    const progress = Array.isArray(state.planDetail.progress) ? state.planDetail.progress : [];
    const existing = progress.find((entry) => Number(entry.verse_id) === Number(verseId));
    if (existing) {
      existing.is_completed = 1;
    } else {
      progress.push({ verse_id: verseId, is_completed: 1 });
    }
  };

  const handleContinue = async () => {
    if (!state.planDetail || !state.currentVerse) {
      closeModal();
      return;
    }
    el.continueButton.disabled = true;
    try {
      await apiRequest(`memorization-plans/${state.planDetail.id}/progress`, {
        method: 'POST',
        body: {
          verse_id: state.currentVerse,
          action: 'mark',
        },
      });
      recordCompletion(state.currentVerse);
      updateStats(state.planDetail);
      const nextVerse = determineNextVerse(state.planDetail);
      state.currentVerse = nextVerse;
      closeModal();
      resetRepetition();
      if (!nextVerse) {
        el.activeStatus.textContent = wpData.planCompleteMessage || 'All verses in this plan are memorized. Create a new plan to continue.';
        toggleElement(el.repeatButton, false);
        if (el.progressBar) {
          el.progressBar.style.width = '100%';
          el.progressBar.classList.add('alfawz-progress-celebrate', 'animate-pulse');
        }
        if (el.repetitionsLabel) {
          el.repetitionsLabel.textContent = `20 / 20 ${wpData.repetitionLabel || 'Repetitions'} ✅`;
        }
        if (el.counter) {
          el.counter.textContent = `20 / 20 ${wpData.repetitionLabel || 'Repetitions'}`;
        }
        if (el.progressNote) {
          el.progressNote.textContent = wpData.planCompleteMessage || 'All verses in this plan are memorized. Create a new plan to continue.';
        }
        setPlanHeader(state.planDetail);
        return;
      }
      await renderVerse();
    } catch (error) {
      console.error('[Alfawz Memorization] Failed to record completion', error);
      el.activeStatus.textContent = wpData.progressErrorMessage || 'Unable to save progress. Please try again.';
    } finally {
      el.continueButton.disabled = false;
    }
  };

  const handleReviewLater = () => {
    closeModal();
    resetRepetition();
  };

  const initEventListeners = () => {
    if (el.creationForm) {
      el.creationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const surahId = Number(el.surahSelect.value || 0);
        const start = Number(el.startInput.value || 0);
        const end = Number(el.endInput.value || 0);
        if (!surahId || !start || !end) {
          setStatus(wpData.formValidationMessage || 'Please select a surah and valid ayah range.', 'error');
          return;
        }
        if (end < start) {
          setStatus(wpData.rangeErrorMessage || 'End ayah must be greater than start ayah.', 'error');
          return;
        }
        setStatus(wpData.creatingPlanMessage || 'Creating plan…', 'muted');
        el.beginButton.disabled = true;
        try {
          const surah = state.surahMap.get(surahId);
          const planName = surah
            ? `${surah.englishName} • Ayah ${start}-${end}`
            : `Surah ${surahId} • Ayah ${start}-${end}`;
          await apiRequest('memorization-plans', {
            method: 'POST',
            body: {
              plan_name: planName,
              surah_id: surahId,
              start_verse: start,
              end_verse: end,
              daily_goal: 0,
            },
          });
          setStatus(wpData.planCreatedMessage || 'Plan created! Loading your first verse…', 'success');
          await refreshPlan();
        } catch (error) {
          console.error('[Alfawz Memorization] Failed to create plan', error);
          setStatus(wpData.planCreateError || 'Unable to create plan. Please try again.', 'error');
        } finally {
          el.beginButton.disabled = false;
        }
      });
    }

    el.surahSelect?.addEventListener('change', constrainRangeInputs);
    el.startInput?.addEventListener('input', constrainRangeInputs);
    el.endInput?.addEventListener('input', constrainRangeInputs);

    el.repeatButton?.addEventListener('click', () => {
      if (!state.currentVerse || state.modalOpen) {
        return;
      }
      state.repetitionCount = Math.min(20, state.repetitionCount + 1);
      playChime();
      updateProgressUI();
      el.repeatButton.disabled = true;
      el.repeatButton.classList.add('animate-pulse');
      window.setTimeout(() => {
        el.repeatButton.classList.remove('animate-pulse');
        if (!state.modalOpen) {
          el.repeatButton.disabled = false;
        }
      }, 300);
    });

    el.translationToggle?.addEventListener('click', () => {
      state.translationVisible = !state.translationVisible;
      el.verseTranslation.classList.toggle('hidden', !state.translationVisible);
      updateTranslationToggleLabel();
    });

    el.continueButton?.addEventListener('click', handleContinue);
    el.reviewButton?.addEventListener('click', handleReviewLater);
  };

  const init = async () => {
    await populateSurahSelect();
    constrainRangeInputs();
    initEventListeners();
    await refreshPlan();
    updateProgressUI();
  };

  init().catch((error) => {
    console.error('[Alfawz Memorization] Failed to initialize', error);
  });
})();

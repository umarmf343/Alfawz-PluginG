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
  const AUDIO_EDITION = wpData.audioEdition || 'ar.alafasy';
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
    savedPlanButton: root.querySelector('#alfawz-memorization-save-plan'),
    savedPlansSelect: root.querySelector('#alfawz-memorization-saved-plans'),
    emptyState: root.querySelector('#alfawz-memorization-empty'),
    activeState: root.querySelector('#alfawz-memorization-active'),
    planLabel: root.querySelector('#alfawz-memorization-plan-label'),
    planTitle: root.querySelector('#alfawz-memorization-plan-title'),
    planRange: root.querySelector('#alfawz-memorization-plan-range'),
    planProgress: root.querySelector('#alfawz-memorization-plan-progress'),
    verseArabic: root.querySelector('#alfawz-memorization-ayah-ar'),
    verseTranslation: root.querySelector('#alfawz-memorization-ayah-translation'),
    verseTransliteration: root.querySelector('#alfawz-memorization-ayah-transliteration'),
    verseMeta: root.querySelector('#alfawz-memorization-verse-meta'),
    translationToggle: root.querySelector('#alfawz-memorization-toggle-translation'),
    surahToggle: root.querySelector('#alfawz-memorization-toggle-surah'),
    repetitionsLabel: root.querySelector('#alfawz-memorization-repetitions'),
    progressBar: root.querySelector('#progress-bar'),
    progressNote: root.querySelector('#progress-note'),
    counter: root.querySelector('#counter'),
    repeatButton: root.querySelector('#repeat-btn'),
    prevButton: root.querySelector('#alfawz-memorization-prev'),
    nextButton: root.querySelector('#alfawz-memorization-next'),
    audioButton: root.querySelector('#alfawz-memorization-audio'),
    statsTotal: root.querySelector('#alfawz-memorization-stat-total'),
    statsMemorized: root.querySelector('#alfawz-memorization-stat-memorized'),
    statsRemaining: root.querySelector('#alfawz-memorization-stat-remaining'),
    statsCompletion: root.querySelector('#alfawz-memorization-stat-completion'),
    activeStatus: root.querySelector('#alfawz-memorization-active-status'),
    modal: root.querySelector('#celebration-modal'),
    continueButton: root.querySelector('#next-verse-btn'),
    reviewButton: root.querySelector('#review-later'),
    surahContents: root.querySelector('#alfawz-memorization-surah-contents'),
    verseList: root.querySelector('#alfawz-memorization-verse-list'),
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
    fullSurahVisible: false,
    modalOpen: false,
    hasAwardedCurrentVerse: false,
    awardInFlight: false,
    verseCache: new Map(),
    surahContentCache: new Map(),
    audioElement: null,
    audioButtonDefaultLabel:
      el.audioButton?.querySelector('span:last-child')?.textContent?.trim() ||
      wpData.playAudioLabel ||
      'Play verse audio',
    savedPlans: [],
    lastVerseCelebrationKey: null,
    lastPlanCelebrationKey: null,
  };

  const SAVED_PLANS_KEY = 'alfawz_memo_saved_plans';

  const broadcast = (name, detail = {}) => {
    if (typeof document === 'undefined') {
      return;
    }
    try {
      document.dispatchEvent(new CustomEvent(name, { detail }));
    } catch (error) {
      if (window?.console?.warn) {
        console.warn('[Alfawz Memorization] Unable to dispatch event', name, error);
      }
    }
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

  const setButtonLabel = (button, text) => {
    if (!button) {
      return;
    }
    const spans = button.querySelectorAll('span');
    const labelSpan = spans.length > 1 ? spans[1] : spans[0];
    if (labelSpan) {
      labelSpan.textContent = text;
    } else {
      button.textContent = text;
    }
  };

  const getCacheKey = (surahId, verseId) => `${surahId}:${verseId}`;

  const getCachedVerse = (surahId, verseId) => state.verseCache.get(getCacheKey(surahId, verseId)) || null;

  const storeCachedVerse = (surahId, verseId, data) => {
    if (!surahId || !verseId || !data) {
      return;
    }
    state.verseCache.set(getCacheKey(surahId, verseId), data);
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

  const loadSavedPlans = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    try {
      const raw = window.localStorage.getItem(SAVED_PLANS_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .map((plan) => ({
          id: String(plan?.id || plan?.key || ''),
          surahId: Number(plan?.surahId || plan?.surah_id || 0),
          start: Number(plan?.start || plan?.start_verse || 0),
          end: Number(plan?.end || plan?.end_verse || 0),
          label: String(plan?.label || ''),
        }))
        .filter((plan) => plan.id && plan.surahId && plan.start && plan.end);
    } catch (error) {
      console.warn('[Alfawz Memorization] Unable to load saved plans', error);
      return [];
    }
  };

  const persistSavedPlans = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      const payload = state.savedPlans.map((plan) => ({
        id: plan.id,
        surahId: plan.surahId,
        start: plan.start,
        end: plan.end,
        label: plan.label,
      }));
      window.localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn('[Alfawz Memorization] Unable to persist saved plans', error);
    }
  };

  const getSavedPlanLabel = (plan) => {
    if (!plan) {
      return '';
    }
    if (plan.label) {
      return plan.label;
    }
    const surah = state.surahMap.get(plan.surahId);
    const prefix = surah ? surah.englishName : `Surah ${plan.surahId}`;
    return `${prefix} • Ayah ${plan.start}-${plan.end}`;
  };

  const renderSavedPlanOptions = () => {
    if (!el.savedPlansSelect) {
      return;
    }
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = state.savedPlans.length
      ? wpData.chooseSavedPlanLabel || 'Choose a saved plan'
      : wpData.noSavedPlansLabel || 'No saved plans yet';

    el.savedPlansSelect.innerHTML = '';
    el.savedPlansSelect.appendChild(placeholder);

    state.savedPlans.forEach((plan) => {
      const option = document.createElement('option');
      option.value = plan.id;
      option.textContent = getSavedPlanLabel(plan);
      el.savedPlansSelect.appendChild(option);
    });

    el.savedPlansSelect.disabled = state.savedPlans.length === 0;
  };

  const saveCurrentPlanToLibrary = () => {
    if (!el.surahSelect || !el.startInput || !el.endInput) {
      return;
    }
    const surahId = Number(el.surahSelect.value || 0);
    const start = Number(el.startInput.value || 0);
    const end = Number(el.endInput.value || 0);
    if (!surahId || !start || !end || end < start) {
      setStatus(wpData.planSaveError || 'Unable to save this plan. Please check your selections and try again.', 'error');
      return;
    }
    const key = `${surahId}:${start}-${end}`;
    const surah = state.surahMap.get(surahId);
    const label = surah ? `${surah.englishName} • Ayah ${start}-${end}` : `Surah ${surahId} • Ayah ${start}-${end}`;
    const planData = {
      id: key,
      surahId,
      start,
      end,
      label,
    };
    const existingIndex = state.savedPlans.findIndex((plan) => plan.id === planData.id);
    if (existingIndex >= 0) {
      state.savedPlans.splice(existingIndex, 1);
    }
    state.savedPlans.unshift(planData);
    if (state.savedPlans.length > 20) {
      state.savedPlans = state.savedPlans.slice(0, 20);
    }
    persistSavedPlans();
    renderSavedPlanOptions();
    setStatus(wpData.planSavedMessage || 'Plan saved for quick access!', 'success');
  };

  const applySavedPlanToForm = (planId) => {
    if (!planId || !el.surahSelect || !el.startInput || !el.endInput) {
      return;
    }
    const plan = state.savedPlans.find((entry) => entry.id === planId);
    if (!plan) {
      return;
    }
    el.surahSelect.value = String(plan.surahId);
    constrainRangeInputs();
    el.startInput.value = plan.start;
    el.endInput.value = plan.end;
    setStatus(wpData.planLoadedMessage || 'Plan loaded! Ready to begin.', 'muted');
  };

  const initSavedPlans = () => {
    state.savedPlans = loadSavedPlans();
    renderSavedPlanOptions();
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
    const cached = getCachedVerse(surahId, verseId);
    if (cached) {
      return cached;
    }

    const requests = [
      fetch(`${QURAN_API_BASE}ayah/${surahId}:${verseId}/${ARABIC_EDITION}`),
      fetch(`${QURAN_API_BASE}ayah/${surahId}:${verseId}/${TRANSLATION_EDITION}`),
      fetch(`${QURAN_API_BASE}ayah/${surahId}:${verseId}/${AUDIO_EDITION}`),
    ];

    const [arabicResponse, translationResponse, audioResponse] = await Promise.all(requests);
    if (!arabicResponse.ok || !translationResponse.ok) {
      throw new Error('Unable to load verse from API');
    }
    const [arabicData, translationData] = await Promise.all([arabicResponse.json(), translationResponse.json()]);
    let audioUrl = '';
    if (audioResponse.ok) {
      try {
        const audioData = await audioResponse.json();
        audioUrl = audioData?.data?.audio || '';
      } catch (error) {
        console.warn('[Alfawz Memorization] Unable to parse audio response', error);
      }
    }

    const verse = {
      arabic: arabicData?.data?.text || '',
      translation: translationData?.data?.text || '',
      surahName: arabicData?.data?.surah?.englishName || '',
      numberInSurah: arabicData?.data?.numberInSurah || verseId,
      audio: audioUrl,
    };

    storeCachedVerse(surahId, verseId, verse);
    return verse;
  };

  const fetchSurahContent = async (surahId) => {
    if (!surahId) {
      return null;
    }
    if (state.surahContentCache.has(surahId)) {
      return state.surahContentCache.get(surahId);
    }

    const query = new URLSearchParams();
    if (wpData.defaultTranslation) {
      query.append('translation', wpData.defaultTranslation);
    }
    if (wpData.defaultTransliteration) {
      query.append('transliteration', wpData.defaultTransliteration);
    }

    try {
      const path = `surahs/${surahId}/verses${query.toString() ? `?${query.toString()}` : ''}`;
      const versesResponse = await apiRequest(path);

      if (!Array.isArray(versesResponse) || versesResponse.length === 0) {
        throw new Error('Invalid surah response');
      }

      const verses = versesResponse.map((verse, index) => ({
        numberInSurah:
          Number(verse.numberInSurah || verse.verse_id || verse.verseId || verse.number_in_surah || index + 1) || index + 1,
        arabic: verse.arabic || verse.text || '',
        translation: verse.translation || '',
        transliteration: verse.transliteration || '',
      }));

      const firstVerse = versesResponse[0] || {};
      const bundle = {
        surahName: firstVerse.surah_name || '',
        surahNameArabic: firstVerse.surah_name_ar || '',
        totalAyahs:
          Number(firstVerse.total_verses || firstVerse.totalAyahs || firstVerse.total_ayahs || verses.length) || verses.length,
        verses,
      };

      state.surahContentCache.set(surahId, bundle);
      return bundle;
    } catch (error) {
      console.error('[Alfawz Memorization] Failed to load surah content', error);
      return null;
    }
  };

  const goToVerse = async (verseId) => {
    if (!state.planDetail) {
      return;
    }
    const numericVerse = Number(verseId);
    if (!numericVerse) {
      return;
    }
    const start = Number(state.planDetail.start_verse || 1);
    const end = Number(state.planDetail.end_verse || start);
    if (numericVerse < start || numericVerse > end) {
      return;
    }
    if (state.currentVerse === numericVerse) {
      highlightActiveVerse();
      return;
    }
    state.currentVerse = numericVerse;
    await renderVerse();
  };

  const renderFullSurah = async () => {
    if (!state.fullSurahVisible || !state.planDetail || !el.surahContents || !el.verseList) {
      return;
    }
    const surahId = state.planDetail.surah_id;
    const bundle = await fetchSurahContent(surahId);
    if (!bundle) {
      el.verseList.innerHTML = `<p class="rounded-2xl bg-[#fde8ea] px-4 py-4 text-sm text-[#6a2133]">${
        wpData.surahLoadError || 'Unable to display the full surah right now.'
      }</p>`;
      return;
    }

    el.verseList.innerHTML = '';
    const start = Number(state.planDetail.start_verse || 1);
    const end = Number(state.planDetail.end_verse || start);

    bundle.verses.forEach((verse) => {
      const verseRow = document.createElement('article');
      const withinPlan = verse.numberInSurah >= start && verse.numberInSurah <= end;
      verseRow.dataset.verseId = verse.numberInSurah;
      verseRow.className = `transition rounded-2xl border px-5 py-4 shadow-sm hover:shadow-md ${
        withinPlan ? 'border-[#f3d9d7] bg-white' : 'border-transparent bg-white/70'
      }`;
      verseRow.innerHTML = `
        <div class="flex items-start gap-4">
          <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#f3d9d7] text-[#6a2133] font-semibold">${formatNumber(
            verse.numberInSurah,
          )}</span>
          <div class="flex-1 space-y-3 text-right" dir="rtl" lang="ar">
            <p class="text-2xl font-semibold text-[#2f0716]">${verse.arabic}</p>
          </div>
        </div>
        <p class="mt-3 text-left text-base text-[#6a2133]">${verse.translation}</p>
      `;
      verseRow.addEventListener('click', () => {
        if (!state.fullSurahVisible) {
          return;
        }
        goToVerse(verse.numberInSurah);
      });
      el.verseList.appendChild(verseRow);
    });

    highlightActiveVerse();
  };

  const syncSurahVisibility = async () => {
    if (!el.surahContents) {
      return;
    }
    if (state.fullSurahVisible) {
      toggleElement(el.surahContents, true);
      await renderFullSurah();
    } else {
      toggleElement(el.surahContents, false);
    }
    updateSurahToggleLabel();
    updateNavigationState();
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

  const celebratePlanCompletion = () => {
    const planId = state.planDetail?.id || state.planSummary?.id || null;
    if (
      !planId ||
      state.lastPlanCelebrationKey === planId ||
      !window.AlfawzCelebrations ||
      typeof window.AlfawzCelebrations.celebrate !== 'function'
    ) {
      return;
    }
    state.lastPlanCelebrationKey = planId;
    const surah = state.surahMap.get(Number(state.planDetail?.surah_id || 0));
    const planName =
      state.planDetail?.plan_name ||
      surah?.englishName ||
      surah?.englishNameTranslation ||
      'this memorisation plan';
    const startVerse = state.planDetail?.start_verse ? formatNumber(state.planDetail.start_verse) : '';
    const endVerse = state.planDetail?.end_verse ? formatNumber(state.planDetail.end_verse) : '';
    const detail = startVerse && endVerse
      ? `Ayat ${startVerse} – ${endVerse} are now memorised.`
      : 'You have completed every verse in this plan.';
    window.AlfawzCelebrations.celebrate('memorization-plan', {
      message: `You completed ${planName}. Allahumma barik!`,
      detail,
      cta: 'Choose another plan',
    });
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
    setButtonLabel(el.translationToggle, label);
  };

  const updateSurahToggleLabel = () => {
    if (!el.surahToggle) {
      return;
    }
    const label = state.fullSurahVisible
      ? wpData.hideSurahLabel || 'Hide entire surah'
      : wpData.showSurahLabel || 'Show entire surah';
    setButtonLabel(el.surahToggle, label);
  };

  const updateNavigationState = () => {
    if (!el.prevButton || !el.nextButton || !state.planDetail) {
      return;
    }
    const start = Number(state.planDetail.start_verse || 1);
    const end = Number(state.planDetail.end_verse || start);
    const current = Number(state.currentVerse || start);
    const disableNav = state.fullSurahVisible || !state.currentVerse;
    el.prevButton.disabled = disableNav || current <= start;
    el.nextButton.disabled = disableNav || current >= end;
  };

  const getAudioElement = () => {
    if (!state.audioElement) {
      state.audioElement = new Audio();
      state.audioElement.preload = 'auto';
      state.audioElement.addEventListener('ended', () => {
        if (el.audioButton) {
          el.audioButton.disabled = false;
          setButtonLabel(el.audioButton, state.audioButtonDefaultLabel || wpData.playAudioLabel || 'Play verse audio');
        }
      });
      state.audioElement.addEventListener('error', () => {
        if (el.audioButton) {
          el.audioButton.disabled = false;
          setButtonLabel(el.audioButton, state.audioButtonDefaultLabel || wpData.playAudioLabel || 'Play verse audio');
        }
      });
    }
    return state.audioElement;
  };

  const stopAudioPlayback = () => {
    if (!state.audioElement) {
      return;
    }
    try {
      state.audioElement.pause();
      state.audioElement.currentTime = 0;
    } catch (error) {
      // Ignore
    }
    if (el.audioButton) {
      el.audioButton.disabled = false;
      setButtonLabel(el.audioButton, state.audioButtonDefaultLabel || wpData.playAudioLabel || 'Play verse audio');
    }
  };

  const playCurrentVerseAudio = async () => {
    if (!el.audioButton) {
      return;
    }
    const audioUrl = state.currentVerseData?.audio;
    if (!audioUrl) {
      el.activeStatus.textContent = wpData.audioUnavailableMessage || 'Audio for this verse is not available right now.';
      return;
    }
    const audioElement = getAudioElement();
    try {
      stopAudioPlayback();
      el.audioButton.disabled = true;
      setButtonLabel(el.audioButton, wpData.playingAudioLabel || 'Playing…');
      audioElement.src = audioUrl;
      await audioElement.play();
    } catch (error) {
      console.warn('[Alfawz Memorization] Unable to play verse audio', error);
      el.audioButton.disabled = false;
      setButtonLabel(el.audioButton, state.audioButtonDefaultLabel || wpData.playAudioLabel || 'Play verse audio');
      el.activeStatus.textContent = wpData.audioErrorMessage || 'Unable to play audio for this verse.';
    }
  };

  const updateVerseMeta = (verseData) => {
    if (!el.verseMeta) {
      return;
    }
    if (!verseData) {
      el.verseMeta.textContent = '';
      return;
    }
    const surahName = verseData.surahName || state.planDetail?.plan_name || '';
    const verseNumber = formatNumber(verseData.numberInSurah || state.currentVerse || 0);
    const rangeStart = state.planDetail ? formatNumber(state.planDetail.start_verse) : '';
    const rangeEnd = state.planDetail ? formatNumber(state.planDetail.end_verse) : '';
    const rangeText = state.planDetail && rangeStart && rangeEnd ? `${wpData.rangeLabel || 'Range'} ${rangeStart}-${rangeEnd}` : '';
    const verseText = `${wpData.verseLabel || 'Ayah'} ${verseNumber}`;
    el.verseMeta.textContent = [surahName, verseText, rangeText].filter(Boolean).join(' • ');
  };

  const highlightActiveVerse = () => {
    if (!el.verseList) {
      return;
    }
    const current = Number(state.currentVerse || 0);
    el.verseList.querySelectorAll('[data-verse-id]').forEach((node) => {
      const isActive = Number(node.dataset.verseId) === current;
      node.classList.toggle('ring-2', isActive);
      node.classList.toggle('ring-[#7b1c3a]', isActive);
      node.classList.toggle('shadow-lg', isActive);
    });
  };

  const prefetchAdjacentVerses = () => {
    if (!state.planDetail || !state.currentVerse) {
      return;
    }
    const surahId = state.planDetail.surah_id;
    const start = Number(state.planDetail.start_verse || 1);
    const end = Number(state.planDetail.end_verse || start);
    const prev = state.currentVerse - 1;
    const next = state.currentVerse + 1;
    const promises = [];
    if (prev >= start && !getCachedVerse(surahId, prev)) {
      promises.push(fetchVerse(surahId, prev).catch(() => null));
    }
    if (next <= end && !getCachedVerse(surahId, next)) {
      promises.push(fetchVerse(surahId, next).catch(() => null));
    }
    if (promises.length) {
      Promise.all(promises).catch(() => {});
    }
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
    const verseData = state.currentVerseData;
    const verseNumber = verseData?.numberInSurah || state.currentVerse;
    const celebrationKey = state.planDetail?.id
      ? `${state.planDetail.id}:${verseNumber}`
      : `verse:${verseNumber}`;
    if (
      window.AlfawzCelebrations &&
      typeof window.AlfawzCelebrations.celebrate === 'function' &&
      celebrationKey &&
      state.lastVerseCelebrationKey !== celebrationKey
    ) {
      state.lastVerseCelebrationKey = celebrationKey;
      const surahName =
        verseData?.surahName ||
        state.planDetail?.plan_name ||
        state.surahMap.get(Number(state.planDetail?.surah_id || 0))?.englishName ||
        '';
      const formattedVerse = verseNumber ? formatNumber(verseNumber) : '';
      const message = surahName
        ? `Ayah ${formattedVerse} of ${surahName} is ready to be locked in your heart.`
        : 'Twenty repetitions complete. Your focus is paying off!';
      const detail = surahName
        ? 'Recite it once more, then tap “Mark memorised” when you feel confident.'
        : 'Tap “Mark memorised” when you are ready to move forward.';
      window.AlfawzCelebrations.celebrate('memorization-verse', {
        message,
        detail,
        cta: 'Mark memorised',
      });
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
    stopAudioPlayback();
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
      state.lastVerseCelebrationKey = null;
      broadcast('alfawz:memorizationVerse', {
        planId: state.planDetail?.id || state.planSummary?.id || null,
        surahId: state.planDetail?.surah_id || null,
        verseId: state.currentVerse,
        verseKey:
          state.planDetail?.surah_id && state.currentVerse
            ? `${state.planDetail.surah_id}:${state.currentVerse}`
            : null,
        arabic: verse.arabic || '',
        translation: verse.translation || '',
        transliteration: verse.transliteration || '',
      });
      state.hasAwardedCurrentVerse = false;
      state.awardInFlight = false;
      el.verseArabic.textContent = verse.arabic;
      el.verseTranslation.textContent = verse.translation;
      el.verseTranslation.classList.toggle('hidden', !state.translationVisible);
      updateVerseMeta(verse);
      if (el.audioButton) {
        el.audioButton.disabled = false;
        setButtonLabel(el.audioButton, state.audioButtonDefaultLabel || wpData.playAudioLabel || 'Play verse audio');
      }
      if (el.progressNote) {
        el.progressNote.textContent = wpData.progressIntro || 'Tap repeat to begin your twenty-fold focus session.';
      }
      updateTranslationToggleLabel();
      el.repetitionsLabel.textContent = `0 / 20 ${wpData.repetitionLabel || 'Repetitions'}`;
      resetRepetition();
      updateNavigationState();
      highlightActiveVerse();
      prefetchAdjacentVerses();
    } catch (error) {
      console.error('[Alfawz Memorization] Failed to render verse', error);
      state.currentVerseData = null;
      state.hasAwardedCurrentVerse = false;
      state.awardInFlight = false;
      updateVerseMeta(null);
      el.activeStatus.textContent = wpData.verseErrorMessage || 'Unable to load verse details right now.';
      broadcast('alfawz:memorizationVerse', {
        planId: state.planDetail?.id || state.planSummary?.id || null,
        surahId: state.planDetail?.surah_id || null,
        verseId: state.currentVerse,
        error: true,
      });
    }
  };

  const setActiveState = (hasPlan) => {
    toggleElement(el.activeState, hasPlan);
    toggleElement(el.emptyState, !hasPlan);
  };

  const refreshPlan = async () => {
    const previousSurahId = state.planDetail?.surah_id || null;
    const plans = await fetchPlans();
    state.planSummary = chooseActivePlan(plans);
    if (!state.planSummary) {
      state.planDetail = null;
      state.currentVerse = null;
      state.currentVerseData = null;
      state.hasAwardedCurrentVerse = false;
      state.awardInFlight = false;
      state.fullSurahVisible = false;
      stopAudioPlayback();
      setActiveState(false);
      setStatus(wpData.noPlanMessage || 'Create your first plan to begin memorizing.', 'muted');
      setRepeatButtonState();
      await syncSurahVisibility();
      broadcast('alfawz:memorizationPlan', { active: false });
      broadcast('alfawz:memorizationVerse', { planId: null, surahId: null, verseId: null });
      return;
    }
    const previousPlanId = state.planDetail?.id || state.planSummary?.id || null;
    state.planDetail = await fetchPlanDetail(state.planSummary.id);
    if (state.planDetail) {
      const currentPlanId = state.planDetail?.id || state.planSummary?.id || null;
      if (currentPlanId && currentPlanId !== previousPlanId) {
        state.lastPlanCelebrationKey = null;
      }
    }
    if (!state.planDetail) {
      setActiveState(false);
      setStatus(wpData.planLoadError || 'Unable to load your memorization plan.', 'error');
      state.currentVerseData = null;
      state.hasAwardedCurrentVerse = false;
      state.awardInFlight = false;
      state.fullSurahVisible = false;
      stopAudioPlayback();
      if (el.audioButton) {
        el.audioButton.disabled = true;
        setButtonLabel(el.audioButton, state.audioButtonDefaultLabel || wpData.playAudioLabel || 'Play verse audio');
      }
      await syncSurahVisibility();
      broadcast('alfawz:memorizationPlan', { active: false });
      return;
    }
    if (previousSurahId && Number(previousSurahId) !== Number(state.planDetail.surah_id)) {
      state.fullSurahVisible = false;
    }
    await fetchSurahs();
    setPlanHeader(state.planDetail);
    updateStats(state.planDetail);
    broadcast('alfawz:memorizationPlan', {
      active: true,
      planId: state.planDetail?.id || state.planSummary?.id || null,
      surahId: state.planDetail?.surah_id || null,
      startVerse: state.planDetail?.start_verse || null,
      endVerse: state.planDetail?.end_verse || null,
    });
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
      state.currentVerseData = null;
      stopAudioPlayback();
      if (el.audioButton) {
        el.audioButton.disabled = true;
        setButtonLabel(el.audioButton, state.audioButtonDefaultLabel || wpData.playAudioLabel || 'Play verse audio');
      }
      setRepeatButtonState();
      await syncSurahVisibility();
      broadcast('alfawz:memorizationVerse', {
        planId: state.planDetail?.id || state.planSummary?.id || null,
        surahId: state.planDetail?.surah_id || null,
        verseId: null,
        complete: true,
      });
      celebratePlanCompletion();
      return;
    }
    toggleElement(el.repeatButton, true);
    await renderVerse();
    await syncSurahVisibility();
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
        await syncSurahVisibility();
        celebratePlanCompletion();
        return;
      }
      await renderVerse();
      if (state.fullSurahVisible) {
        await renderFullSurah();
      }
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

    el.savedPlanButton?.addEventListener('click', () => {
      saveCurrentPlanToLibrary();
    });

    el.savedPlansSelect?.addEventListener('change', (event) => {
      const selectValue = event.target?.value || '';
      applySavedPlanToForm(selectValue);
      if (event.target && typeof event.target.selectedIndex === 'number') {
        event.target.selectedIndex = 0;
      }
    });

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

    el.prevButton?.addEventListener('click', () => {
      if (state.fullSurahVisible) {
        return;
      }
      goToVerse((state.currentVerse || 0) - 1);
    });

    el.nextButton?.addEventListener('click', () => {
      if (state.fullSurahVisible) {
        return;
      }
      goToVerse((state.currentVerse || 0) + 1);
    });

    el.audioButton?.addEventListener('click', playCurrentVerseAudio);

    el.surahToggle?.addEventListener('click', async () => {
      state.fullSurahVisible = !state.fullSurahVisible;
      await syncSurahVisibility();
    });

    el.continueButton?.addEventListener('click', handleContinue);
    el.reviewButton?.addEventListener('click', handleReviewLater);
  };

  const init = async () => {
    await populateSurahSelect();
    initSavedPlans();
    constrainRangeInputs();
    updateTranslationToggleLabel();
    updateSurahToggleLabel();
    initEventListeners();
    await refreshPlan();
    updateProgressUI();
  };

  init().catch((error) => {
    console.error('[Alfawz Memorization] Failed to initialize', error);
  });
})();

(() => {
  const wpData = window.alfawzData || {};
  const API_BASE = (wpData.apiUrl || '/wp-json/alfawzquran/v1/').replace(/\/+$/, '/');
  const QURAN_AUDIO_CDN_BASE = 'https://cdn.islamic.network/quran/audio/128/';
  const CDN_FALLBACK_RECITER = 'ar.alafasy';
  const GWANI_ARCHIVE_RECITER = 'gwani-dahir';
  const GWANI_ARCHIVE_DOWNLOAD_BASE = 'https://archive.org/download/MoshafGwaniDahir/';
  const GWANI_ARCHIVE_METADATA_URL = 'https://archive.org/metadata/MoshafGwaniDahir';
  const RECITER_EDITION = wpData.defaultReciter || CDN_FALLBACK_RECITER;
  let currentReciter = wpData.userPreferences?.default_reciter || RECITER_EDITION;
  const DEFAULT_TRANSLATION_EDITION =
    wpData.userPreferences?.default_translation || wpData.defaultTranslation || 'en.sahih';
  const DEFAULT_TRANSLITERATION_EDITION =
    wpData.userPreferences?.default_transliteration ||
    wpData.defaultTransliteration ||
    'en.transliteration';
  const HASANAT_PER_LETTER = 10;

  const safeStorage = (() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      const testKey = '__alfawz_storage_check__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (error) {
      return null;
    }
  })();

  const setPersistentItem = (key, value) => {
    if (!safeStorage || typeof value === 'undefined') {
      return;
    }
    try {
      safeStorage.setItem(key, value);
    } catch (error) {
      // Storage may be full or unavailable; ignore gracefully.
    }
  };

  const getPersistentItem = (key) => {
    if (!safeStorage) {
      return null;
    }
    try {
      return safeStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const normaliseStoredValue = (value) => {
    if (typeof value !== 'string') {
      return '';
    }
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
      return '';
    }
    return trimmed;
  };

  const translationProfiles = [
    {
      id: 'standard',
      edition: 'en.sahih',
      label: 'Study-ready',
    },
    {
      id: 'family',
      edition: 'en.clearquran',
      label: 'Family paraphrase',
    },
    {
      id: 'senior',
      edition: 'en.yusufali',
      label: 'Senior classic',
    },
    {
      id: 'heritage',
      edition: 'en.pickthall',
      label: 'Heritage tone',
    },
  ];

  const translationProfileMap = translationProfiles.reduce((map, profile) => {
    map[profile.id] = profile;
    return map;
  }, {});

  const translationEditionToProfile = translationProfiles.reduce((map, profile) => {
    if (profile.edition) {
      map[profile.edition] = profile.id;
    }
    return map;
  }, {});

  const transliterationProfiles = [
    {
      id: 'standard',
      edition: DEFAULT_TRANSLITERATION_EDITION,
      mode: 'standard',
    },
    {
      id: 'gentle',
      edition: DEFAULT_TRANSLITERATION_EDITION,
      mode: 'simplified',
    },
    {
      id: 'assistive',
      edition: DEFAULT_TRANSLITERATION_EDITION,
      mode: 'assistive',
    },
  ];

  const transliterationProfileMap = transliterationProfiles.reduce((map, profile) => {
    map[profile.id] = profile;
    return map;
  }, {});

  const storedTranslationProfile = normaliseStoredValue(
    getPersistentItem('alfawz.translationProfile'),
  );
  const storedTransliterationProfile = normaliseStoredValue(
    getPersistentItem('alfawz.transliterationProfile'),
  );

  let activeTranslationProfileId = translationProfileMap[storedTranslationProfile]
    ? storedTranslationProfile
    : translationEditionToProfile[DEFAULT_TRANSLATION_EDITION] || translationProfiles[0].id;
  let activeTranslationEdition =
    translationProfileMap[activeTranslationProfileId]?.edition || DEFAULT_TRANSLATION_EDITION;

  let activeTransliterationProfileId = transliterationProfileMap[storedTransliterationProfile]
    ? storedTransliterationProfile
    : transliterationProfiles[0].id;
  let activeTransliterationEdition =
    transliterationProfileMap[activeTransliterationProfileId]?.edition ||
    DEFAULT_TRANSLITERATION_EDITION;

  const getActiveTranslationEdition = () =>
    activeTranslationEdition || DEFAULT_TRANSLATION_EDITION || 'en.sahih';

  const getActiveTransliterationEdition = () =>
    activeTransliterationEdition || DEFAULT_TRANSLITERATION_EDITION || '';

  const headers = {};
  if (wpData.nonce) {
    headers['X-WP-Nonce'] = wpData.nonce;
  }

  const state = {
    surahs: null,
    verseCache: new Map(),
    versePromises: new Map(),
    surahCache: new Map(),
    surahPromises: new Map(),
    audioCache: new Map(),
    dashboardStats: null,
    dashboardInsights: null,
    hasanatTotal: 0,
    hasanatBadge: null,
    hasanatBadgeCount: null,
    refreshLeaderboard: null,
    leaderboardLoading: null,
  };

  const clearLanguageCaches = () => {
    state.verseCache.clear();
    state.versePromises.clear();
    state.surahCache.clear();
    state.surahPromises.clear();
  };

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));
  const formatDecimal = (value, digits = 1) =>
    new Intl.NumberFormat(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(Number(value || 0));
  const formatPercent = (value) => `${Math.min(100, Math.max(0, Number(value || 0))).toFixed(0)}%`;
  const timezoneOffset = () => -new Date().getTimezoneOffset();

  const reduceMotionQuery =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

  const prefersReducedMotion = () => Boolean(reduceMotionQuery?.matches);

  const easeOutCubic = (t) => 1 - (1 - t) ** 3;

  const parseNumeric = (value) => {
    if (value === undefined || value === null) {
      return 0;
    }
    return Number(String(value).replace(/[^0-9.-]+/g, '')) || 0;
  };

  const animateNumber = (element, targetValue, { duration = 1200 } = {}) => {
    if (!element) {
      return;
    }
    const finalValue = Number(targetValue) || 0;
    if (prefersReducedMotion()) {
      element.textContent = formatNumber(finalValue);
      element.dataset.counterValue = finalValue;
      return;
    }

    const initialValue = parseNumeric(element.dataset.counterValue ?? element.textContent ?? 0);
    if (initialValue === finalValue) {
      element.textContent = formatNumber(finalValue);
      element.dataset.counterValue = finalValue;
      return;
    }

    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      const current = initialValue + (finalValue - initialValue) * eased;
      element.textContent = formatNumber(Math.round(current));
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        element.textContent = formatNumber(finalValue);
        element.dataset.counterValue = finalValue;
      }
    };

    requestAnimationFrame(tick);
  };

  const updateAnimatedNumber = (element, value, options) => {
    if (!element) {
      return;
    }
    animateNumber(element, value, options);
  };

  const animateProgressBar = (element, value, { duration = 900 } = {}) => {
    if (!element) {
      return;
    }

    const finalWidth = Math.max(0, Math.min(100, Number(value) || 0));
    if (prefersReducedMotion()) {
      element.style.width = `${finalWidth}%`;
      element.dataset.progressValue = finalWidth;
      return;
    }

    const initialWidth = Number((element.dataset.progressValue ?? parseFloat(element.style.width)) || 0);
    if (Math.abs(finalWidth - initialWidth) < 0.5) {
      element.style.width = `${finalWidth}%`;
      element.dataset.progressValue = finalWidth;
      return;
    }

    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      const current = initialWidth + (finalWidth - initialWidth) * eased;
      element.style.width = `${current.toFixed(1)}%`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        element.style.width = `${finalWidth}%`;
        element.dataset.progressValue = finalWidth;
      }
    };

    requestAnimationFrame(tick);
  };

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
      const status = response.status;
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        const text = await response.text();
        const snippet = text ? text.trim().slice(0, 300) : '';
        const message = snippet
          ? `Request failed with status ${status}: ${snippet}`
          : `Request failed with status ${status}`;
        throw new Error(message);
      }

      if (status === 204) {
        return null;
      }

      if (raw) {
        return response;
      }

      const bodyText = await response.text();

      if (!contentType.toLowerCase().includes('json')) {
        const snippet = bodyText ? bodyText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300) : '';
        const message = snippet
          ? `Expected a JSON response but received “${contentType || 'unknown'}”: ${snippet}`
          : `Expected a JSON response but received “${contentType || 'unknown'}”.`;
        throw new Error(message);
      }

      try {
        return bodyText ? JSON.parse(bodyText) : null;
      } catch (parseError) {
        const snippet = bodyText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
        const message = snippet
          ? `Received malformed JSON: ${snippet}`
          : 'Received malformed JSON response.';
        throw new Error(message);
      }
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

  const buildApiQuery = (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      searchParams.append(key, value);
    });
    const query = searchParams.toString();
    return query ? `?${query}` : '';
  };

  const normaliseApiVerse = (payload, fallbackSurahId, fallbackVerseId) => {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const surahId = Number(
      payload.surahId ?? payload.surah_id ?? payload.surah?.id ?? fallbackSurahId ?? 0,
    );
    const verseId = Number(payload.verseId ?? payload.verse_id ?? fallbackVerseId ?? 0);

    if (!surahId || !verseId) {
      return null;
    }

    const verseKey = payload.verseKey ?? payload.verse_key ?? `${surahId}:${verseId}`;
    const arabic = payload.arabic ?? payload.text ?? '';
    const translation = payload.translation ?? '';
    const transliteration = payload.transliteration ?? '';
    const surahName = payload.surahName ?? payload.surah_name ?? '';
    const surahNameAr = payload.surahNameAr ?? payload.surah_name_ar ?? '';
    const juz = payload.juz ?? null;
    const totalVerses = Number(payload.totalVerses ?? payload.total_verses ?? 0) || 0;
    const apiAudio = payload.audio ?? '';
    const apiAudioSecondaryRaw = payload.audioSecondary ?? payload.audio_secondary ?? [];
    const apiAudioSecondary = Array.isArray(apiAudioSecondaryRaw)
      ? apiAudioSecondaryRaw.filter((entry) => typeof entry === 'string' && entry)
      : [];
    const isBismillah = Boolean(payload.isBismillah ?? payload.is_bismillah ?? false);
    const displayVerseNumberRaw = payload.displayVerseNumber ?? payload.display_verse_number;
    const parsedDisplayNumber =
      displayVerseNumberRaw === undefined || displayVerseNumberRaw === null
        ? null
        : Number(displayVerseNumberRaw);
    const displayVerseNumber = Number.isFinite(parsedDisplayNumber)
      ? parsedDisplayNumber
      : isBismillah
      ? 0
      : verseId;
    const displayVerseLabel = payload.displayVerseLabel ?? payload.display_verse_label ?? '';

    const reciter = currentReciter || RECITER_EDITION || CDN_FALLBACK_RECITER;
    const computedAudio = buildAudioUrl(reciter, surahId, verseId) || apiAudio || '';
    const audioSecondary = [];
    if (computedAudio) {
      audioSecondary.push(computedAudio);
    }
    apiAudioSecondary.forEach((entry) => {
      if (entry && entry !== computedAudio) {
        audioSecondary.push(entry);
      }
    });

    return {
      surahId,
      verseId,
      verseKey,
      arabic,
      translation,
      transliteration,
      surahName,
      surahNameAr,
      juz,
      totalVerses,
      audio: computedAudio,
      audioSecondary,
      isBismillah,
      displayVerseNumber,
      displayVerseLabel,
    };
  };

  const parseDisplayNumber = (value) => {
    if (value === undefined || value === null) {
      return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const isVerseBismillah = (verse) => Boolean(verse?.isBismillah ?? verse?.is_bismillah);

  const getDisplayVerseNumber = (verse) => {
    if (!verse) {
      return null;
    }
    const preferred = parseDisplayNumber(
      verse.displayVerseNumber ?? verse.display_verse_number ?? null,
    );
    if (preferred !== null) {
      return preferred;
    }
    return parseDisplayNumber(verse.verseId ?? verse.verse_id ?? null);
  };

  const getDisplayVerseLabel = (verse, strings = {}) => {
    if (!verse) {
      return '';
    }

    const label = verse.displayVerseLabel ?? verse.display_verse_label;
    if (label) {
      return label;
    }

    const ayahLabel = strings.ayahLabel || 'Ayah';
    const bismillahLabel = strings.bismillahLabel || 'Bismillah';
    const number = getDisplayVerseNumber(verse);

    if (number === null) {
      return ayahLabel;
    }

    if (number <= 0) {
      if (isVerseBismillah(verse)) {
        return bismillahLabel;
      }
      const fallback = parseDisplayNumber(verse.verseId ?? verse.verse_id ?? null);
      if (fallback) {
        return `${ayahLabel} ${fallback}`;
      }
      return ayahLabel;
    }

    return `${ayahLabel} ${number}`;
  };

  const padAudioFragment = (value) => {
    const numeric = Number(value || 0);
    if (!numeric) {
      return '';
    }
    return String(numeric).padStart(3, '0');
  };

  const isArchiveReciter = (reciter) => (reciter || '').toLowerCase() === GWANI_ARCHIVE_RECITER;

  const buildArchiveVerseUrl = (surahId, verseId) => {
    const paddedSurah = padAudioFragment(surahId);
    const paddedVerse = padAudioFragment(verseId);
    if (!paddedSurah || !paddedVerse) {
      return '';
    }
    return `${GWANI_ARCHIVE_DOWNLOAD_BASE}${paddedSurah}${paddedVerse}.mp3`;
  };

  const archiveManifestState = {
    manifest: null,
    promise: null,
  };

  const parseArchiveManifest = (metadata) => {
    const files = Array.isArray(metadata?.files) ? metadata.files : [];
    const manifest = new Map();
    files.forEach((file) => {
      const name = typeof file?.name === 'string' ? file.name : '';
      if (!name || !name.toLowerCase().endsWith('.mp3')) {
        return;
      }
      const match = name.match(/(\d{3})\.mp3$/i);
      if (!match) {
        return;
      }
      const id = Number(match[1]);
      if (!id || manifest.has(id)) {
        return;
      }
      manifest.set(id, name);
    });
    return manifest;
  };

  const loadArchiveManifest = async () => {
    if (archiveManifestState.manifest) {
      return archiveManifestState.manifest;
    }
    if (archiveManifestState.promise) {
      return archiveManifestState.promise;
    }

    const request = (async () => {
      try {
        const metadata = await fetchJson(GWANI_ARCHIVE_METADATA_URL);
        const manifest = parseArchiveManifest(metadata);
        archiveManifestState.manifest = manifest;
        return manifest;
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to load Gwani archive manifest', error);
        return null;
      } finally {
        archiveManifestState.promise = null;
      }
    })();

    archiveManifestState.promise = request;
    return request;
  };

  const loadArchiveSurahUrl = async (surahId) => {
    const manifest = await loadArchiveManifest();
    if (manifest instanceof Map) {
      const fileName = manifest.get(Number(surahId));
      if (fileName) {
        return `${GWANI_ARCHIVE_DOWNLOAD_BASE}${encodeURIComponent(fileName)}`;
      }
    }

    const paddedSurah = padAudioFragment(surahId);
    if (!paddedSurah) {
      return '';
    }
    return `${GWANI_ARCHIVE_DOWNLOAD_BASE}${paddedSurah}.mp3`;
  };

  const buildProxiedAudioUrl = (reciter, surahId, verseId) => {
    const safeReciter = (reciter || CDN_FALLBACK_RECITER || '').trim();
    const numericSurah = Number(surahId);
    const numericVerse = Number(verseId);

    if (!safeReciter || !Number.isFinite(numericSurah) || !Number.isFinite(numericVerse)) {
      return '';
    }

    if (numericSurah <= 0 || numericVerse <= 0) {
      return '';
    }

    const encodedReciter = encodeURIComponent(safeReciter.toLowerCase());
    return `${API_BASE}audio/${encodedReciter}/${numericSurah}/${numericVerse}.mp3`;
  };

  const buildCdnAudioUrl = (reciter, surahId, verseId) => {
    const paddedSurah = padAudioFragment(surahId);
    const paddedVerse = padAudioFragment(verseId);
    if (!paddedSurah || !paddedVerse) {
      return '';
    }
    const safeReciter = reciter || CDN_FALLBACK_RECITER;
    return `${QURAN_AUDIO_CDN_BASE}${safeReciter}/${paddedSurah}${paddedVerse}.mp3`;
  };

  const buildAudioUrl = (reciter, surahId, verseId) => {
    if (isArchiveReciter(reciter)) {
      return buildArchiveVerseUrl(surahId, verseId);
    }
    return buildProxiedAudioUrl(reciter, surahId, verseId) || buildCdnAudioUrl(reciter, surahId, verseId);
  };

  const verseCacheKey = (surahId, verseId) => {
    const translationKey = getActiveTranslationEdition() || 'default';
    const transliterationKey = getActiveTransliterationEdition() || 'none';
    return `${surahId}:${verseId}:${translationKey}:${transliterationKey}`;
  };

  const surahCacheKey = (surahId) => {
    const translationKey = getActiveTranslationEdition() || 'default';
    const transliterationKey = getActiveTransliterationEdition() || 'none';
    return `${surahId}:${translationKey}:${transliterationKey}`;
  };

  const storeVerseInCache = (verse) => {
    if (!verse || !verse.surahId || !verse.verseId) {
      return;
    }
    state.verseCache.set(verseCacheKey(verse.surahId, verse.verseId), verse);
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
    const cacheKey = verseCacheKey(surahId, verseId);
    if (state.verseCache.has(cacheKey)) {
      return state.verseCache.get(cacheKey);
    }
    if (state.versePromises.has(cacheKey)) {
      return state.versePromises.get(cacheKey);
    }

    const query = buildApiQuery({
      translation: getActiveTranslationEdition(),
      transliteration: getActiveTransliterationEdition(),
    });

    const request = (async () => {
      const payload = await apiRequest(`surahs/${surahId}/verses/${verseId}${query}`);
      const verse = normaliseApiVerse(payload, surahId, verseId);
      if (!verse) {
        throw new Error('Invalid verse response');
      }
      storeVerseInCache(verse);
      return verse;
    })()
      .catch((error) => {
        state.versePromises.delete(cacheKey);
        throw error;
      })
      .finally(() => {
        state.versePromises.delete(cacheKey);
      });

    state.versePromises.set(cacheKey, request);
    return request;
  };

  const primeVerse = (surahId, verseId, { immediate = false } = {}) => {
    const safeSurah = Number(surahId || 0);
    const safeVerse = Number(verseId || 0);
    if (!safeSurah || !safeVerse) {
      return;
    }
    const cacheKey = verseCacheKey(safeSurah, safeVerse);
    if (state.verseCache.has(cacheKey) || state.versePromises.has(cacheKey)) {
      return;
    }

    const task = () => {
      loadVerse(safeSurah, safeVerse).catch(() => {});
    };

    if (immediate) {
      task();
      return;
    }

    const schedule = typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback
      : (fn) => window.setTimeout(fn, 120);
    schedule(() => task());
  };

  const loadSurahVerses = async (surahId) => {
    if (!surahId) {
      return [];
    }
    const cacheKey = surahCacheKey(surahId);
    if (state.surahCache.has(cacheKey)) {
      return state.surahCache.get(cacheKey);
    }
    if (state.surahPromises.has(cacheKey)) {
      return state.surahPromises.get(cacheKey);
    }

    const request = (async () => {
      try {
        const query = buildApiQuery({
          translation: getActiveTranslationEdition(),
          transliteration: getActiveTransliterationEdition(),
        });

        const payload = await apiRequest(`surahs/${surahId}/verses${query}`);
        const verses = Array.isArray(payload)
          ? payload
              .map((entry) => normaliseApiVerse(entry, surahId))
              .filter((verse) => Boolean(verse && verse.surahId && verse.verseId))
          : [];

        if (verses.length) {
          const total = verses.length;
          verses.forEach((verse) => {
            if (!verse.totalVerses) {
              verse.totalVerses = total;
            }
            storeVerseInCache(verse);
          });
        }

        state.surahCache.set(cacheKey, verses);
        return verses;
      } catch (error) {
        state.surahCache.delete(cacheKey);
        throw error;
      } finally {
        state.surahPromises.delete(cacheKey);
      }
    })();

    state.surahPromises.set(cacheKey, request);
    return request;
  };

  const loadReciterAudio = (reciter, surahId, verseId) => {
    const safeReciter = reciter || CDN_FALLBACK_RECITER;
    const cacheKey = `${safeReciter}:${surahId}:${verseId}`;
    if (state.audioCache.has(cacheKey)) {
      return state.audioCache.get(cacheKey);
    }

    const audioUrl = buildAudioUrl(safeReciter, surahId, verseId);
    state.audioCache.set(cacheKey, audioUrl);
    return audioUrl;
  };

  const loadAudio = async (surahId, verseId) => {
    const reciter = currentReciter || RECITER_EDITION || CDN_FALLBACK_RECITER;
    return loadReciterAudio(reciter, surahId, verseId);
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

  const setDashboardAnimationDelays = (root) => {
    if (!root) {
      return;
    }
    const nodes = root.querySelectorAll('[data-animate]');
    nodes.forEach((node, index) => {
      const delay = Number(node.dataset.animateDelay || 0);
      const fallback = index * 80;
      const finalDelay = Number.isFinite(delay) && delay > 0 ? delay : fallback;
      node.style.setProperty('--alfawz-animate-delay', `${finalDelay}ms`);
    });
  };

  const revealDashboard = (root) => {
    if (!root) {
      return;
    }
    requestAnimationFrame(() => {
      root.classList.add('is-ready');
    });
  };

  const bindDashboardParallax = (root) => {
    const glow = root?.querySelector('[data-dashboard-glow]');
    if (!glow || prefersReducedMotion()) {
      return;
    }

    const pointerQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;
    if (pointerQuery?.matches) {
      return;
    }

    const setGlow = (x, y) => {
      glow.style.setProperty('--alfawz-glow-x', `${x}%`);
      glow.style.setProperty('--alfawz-glow-y', `${y}%`);
    };

    const resetGlow = () => {
      setGlow(50, 50);
      root.classList.remove('is-pointer-active');
    };

    setGlow(50, 50);

    const handleMove = (event) => {
      const rect = glow.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }
      const withinX = event.clientX >= rect.left && event.clientX <= rect.right;
      const withinY = event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!withinX || !withinY) {
        resetGlow();
        return;
      }
      const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
      const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
      setGlow(x, y);
      root.classList.add('is-pointer-active');
    };

    root.addEventListener('pointermove', handleMove);
    root.addEventListener('pointerleave', resetGlow);
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

  const dispatchEggState = (state) => {
    if (!state) {
      return;
    }
    try {
      document.dispatchEvent(new CustomEvent('alfawz:egg-updated', { detail: state }));
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to dispatch egg state', error);
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
    const safeProgressType = progressType === 'memorized' ? 'memorized' : 'read';
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
          progress_type: safeProgressType,
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
        progressType: safeProgressType,
        alreadyCounted: !(awarded > 0),
      });

      if (safeProgressType === 'read') {
        Promise.resolve().then(async () => {
          try {
            const eggState = await apiRequest('egg-challenge');
            dispatchEggState(eggState);
          } catch (eggError) {
            console.warn('[AlfawzQuran] Unable to refresh egg state', eggError);
          }
        });
      }

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

    setDashboardAnimationDelays(root);
    bindDashboardParallax(root);

    const smartGoalCard = qs('#alfawz-smart-goal-card', root);
    const smartGoalMessage = qs('#alfawz-smart-goal-message', root);
    const smartGoalToday = qs('#alfawz-smart-goal-today', root);
    const smartGoalTodayHint = qs('#alfawz-smart-goal-today-hint', root);
    const smartGoalTarget = qs('#alfawz-smart-goal-target', root);
    const smartGoalTargetHint = qs('#alfawz-smart-goal-target-hint', root);
    const smartGoalAverage = qs('#alfawz-smart-goal-average', root);
    const smartGoalAverageHint = qs('#alfawz-smart-goal-average-hint', root);
    const smartGoalStreak = qs('#alfawz-smart-goal-streak', root);
    const smartGoalStreakHint = qs('#alfawz-smart-goal-streak-hint', root);
    const smartGoalTrend = qs('#alfawz-smart-goal-trend', root);
    const smartGoalNote = qs('#alfawz-smart-goal-note', root);
    const consistencyScore = qs('#alfawz-consistency-score', root);
    const consistencyMessage = qs('#alfawz-consistency-message', root);
    const consistencyHeatmap = qs('#alfawz-consistency-heatmap', root);
    const reflectionList = qs('#alfawz-reflection-preview', root);
    const reflectionEmpty = qs('#alfawz-reflection-empty', root);
    const reflectionCardCopy = qs('#alfawz-reflection-card-copy', root);

    const renderHeatmap = (series) => {
      if (!consistencyHeatmap) {
        return;
      }
      consistencyHeatmap.innerHTML = '';
      if (!Array.isArray(series) || !series.length) {
        return;
      }
      const fragment = document.createDocumentFragment();
      series.forEach((day) => {
        const span = document.createElement('span');
        span.setAttribute('role', 'listitem');
        const percentage = Number(day?.percentage || 0);
        let level = 'none';
        if (percentage >= 100) {
          level = 'high';
        } else if (percentage >= 60) {
          level = 'medium';
        } else if (percentage > 0) {
          level = 'low';
        }
        span.dataset.level = level;
        const verses = Number(day?.verses || 0);
        span.textContent = verses > 0 ? String(Math.min(verses, 99)) : '·';
        span.title = `${day?.label || day?.date || ''}: ${formatNumber(verses)} ${verses === 1 ? 'verse' : 'verses'}`;
        fragment.appendChild(span);
      });
      consistencyHeatmap.appendChild(fragment);
    };

    const renderReflectionsPreview = (items) => {
      if (!reflectionList) {
        return;
      }
      reflectionList.innerHTML = '';
      if (!Array.isArray(items) || !items.length) {
        reflectionEmpty?.classList.remove('hidden');
        return;
      }

      reflectionEmpty?.classList.add('hidden');
      const fragment = document.createDocumentFragment();
      items.forEach((entry) => {
        const li = document.createElement('li');
        li.className = 'alfawz-dashboard-reflection-item';
        const mood = document.createElement('strong');
        mood.textContent = entry?.mood_label || entry?.mood || 'Reflection';
        li.appendChild(mood);
        if (entry?.created_at_label) {
          const time = document.createElement('time');
          time.dateTime = entry?.created_at_gmt || '';
          time.textContent = entry.created_at_label;
          li.appendChild(time);
        }
        const body = document.createElement('p');
        body.textContent = entry?.excerpt || entry?.content || '';
        li.appendChild(body);
        fragment.appendChild(li);
      });
      reflectionList.appendChild(fragment);
    };

    const applyInsights = (insights) => {
      if (!insights) {
        smartGoalCard?.classList.add('opacity-60');
        return;
      }

      state.dashboardInsights = insights;
      const dynamic = insights.dynamic_goal || {};
      const consistency = insights.consistency || {};

      if (smartGoalMessage && dynamic.message) {
        smartGoalMessage.textContent = dynamic.message;
      }
      if (smartGoalToday) {
        smartGoalToday.textContent = formatNumber(dynamic.today || 0);
      }
      if (smartGoalTodayHint) {
        smartGoalTodayHint.textContent = dynamic.today_percentage >= 0
          ? `${formatPercent(dynamic.today_percentage)} of today’s intention`
          : '';
      }
      if (smartGoalTarget) {
        smartGoalTarget.textContent = formatNumber(dynamic.suggested_target || insights.target || wpData.dailyTarget || 10);
      }
      if (smartGoalTargetHint) {
        smartGoalTargetHint.textContent = dynamic.goal_message ? '' : 'Personalised suggestion based on your recent pace.';
      }
      if (smartGoalAverage) {
        smartGoalAverage.textContent = formatDecimal(dynamic.range_average || 0, 1);
      }
      if (smartGoalAverageHint) {
        smartGoalAverageHint.textContent = 'Average verses across the last 7 days.';
      }
      if (smartGoalStreak) {
        smartGoalStreak.textContent = formatNumber(dynamic.streak_met_goal || 0);
      }
      if (smartGoalStreakHint) {
        smartGoalStreakHint.textContent = 'Consecutive days meeting your intention.';
      }
      if (smartGoalTrend) {
        const trend = String(dynamic.trend || 'steady').toLowerCase();
        const emoji = trend === 'up' ? '📈' : trend === 'down' ? '🌙' : '〰️';
        const label = trend === 'up' ? 'Rising rhythm' : trend === 'down' ? 'Gentle reset' : 'Steady pace';
        smartGoalTrend.textContent = `${emoji} ${label}`;
      }
      if (smartGoalNote && dynamic.goal_message) {
        smartGoalNote.textContent = dynamic.goal_message;
      }

      if (consistencyScore) {
        consistencyScore.textContent = formatNumber(consistency.score || 0);
      }
      if (consistencyMessage && consistency.message) {
        consistencyMessage.textContent = consistency.message;
      }
      renderHeatmap(insights.series || []);
      renderReflectionsPreview(insights.reflections || []);

      if (reflectionCardCopy && Array.isArray(insights.reflections)) {
        const totalReflections = insights.reflections.length;
        reflectionCardCopy.textContent = totalReflections
          ? `You have ${formatNumber(totalReflections)} heartfelt reflections logged. Add one from today’s reading.`
          : 'Capture how an ayah touched your heart and revisit your Quranly-inspired reflections.';
      }
    };

    try {
      const insightsPromise = apiRequest('insights/dashboard?range=21&include_reflections=1').catch((error) => {
        console.warn('[AlfawzQuran] Unable to load insights', error);
        return null;
      });

      const [stats, goal, egg, leaderboard, insights] = await Promise.all([
        apiRequest('user-stats'),
        apiRequest(`recitation-goal?timezone_offset=${timezoneOffset()}`),
        apiRequest('egg-challenge'),
        apiRequest('leaderboard'),
        insightsPromise,
      ]);

      state.dashboardStats = stats;

      const versesTodayValue = Number(goal?.count || stats?.verses_read || 0);
      updateAnimatedNumber(qs('#alfawz-verses-today', root), versesTodayValue);
      const goalLabel = qs('#alfawz-daily-goal-text', root);
      if (goalLabel) {
        goalLabel.textContent = goal?.last_reset ? `Goal resets at ${goal.last_reset}` : '';
      }
      updateAnimatedNumber(qs('#alfawz-memorised-today', root), stats?.verses_memorized || 0);
      updateAnimatedNumber(qs('#alfawz-current-streak', root), stats?.current_streak || 0);
      updateAnimatedNumber(qs('#alfawz-dashboard-streak-highlight', root), stats?.current_streak || 0);
      const totalHasanat = Number(stats?.total_hasanat || 0);
      updateAnimatedNumber(qs('#alfawz-hasanat-total', root), totalHasanat);
      updateHasanatDisplays(totalHasanat);

      const dailyProgressBar = qs('#alfawz-daily-progress-bar', root);
      const dailyProgressLabel = qs('#alfawz-daily-progress-label', root);
      const dailyProgressNote = qs('#alfawz-daily-progress-note', root);

      if (goal) {
        animateProgressBar(dailyProgressBar, goal.percentage || 0);
        setText(dailyProgressLabel, `${goal.count || 0} / ${goal.target || 10}`);
        setText(
          dailyProgressNote,
          goal.remaining === 0
            ? wpData.strings?.goalComplete || 'Goal completed for today!'
            : `${goal.remaining} verses left to reach today\'s target.`
        );
      }

      const eggStatus = qs('#alfawz-egg-status', root);
      const eggProgress = qs('#alfawz-egg-progress', root);
      if (eggStatus && egg) {
        eggStatus.textContent = `${egg.count} / ${egg.target} ${egg.count === 1 ? 'recitation' : 'recitations'}`;
      }
      if (eggProgress && egg) {
        animateProgressBar(eggProgress, egg.percentage || 0);
      }

      const leaderboardPreview = qs('#alfawz-leaderboard-preview', root);
      if (leaderboardPreview && Array.isArray(leaderboard)) {
        renderList(leaderboardPreview, leaderboard.slice(0, 5), (item, index) => {
          const li = createListItem('alfawz-dashboard-list-item');
          li.innerHTML = `
            <div class="alfawz-dashboard-list-user flex items-center gap-3">
              <span class="alfawz-dashboard-rank text-base font-semibold">${index + 1}</span>
              <div class="alfawz-dashboard-list-details">
                <p class="alfawz-dashboard-list-name text-base font-semibold text-rose-900">${item.display_name || '—'}</p>
                <p class="alfawz-dashboard-list-meta text-sm text-rose-700">${formatNumber(item.verses_read || 0)} verses</p>
              </div>
            </div>
            <span class="alfawz-dashboard-list-score text-sm font-semibold text-rose-700">⭐ ${formatNumber(
              item.total_hasanat || 0
            )}</span>
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
        animateProgressBar(planProgress, activePlan.completion_percentage || 0);
      } else {
        setText(planName, 'Create your first plan to get started');
        if (planMeta) {
          planMeta.textContent = '';
        }
        animateProgressBar(planProgress, 0);
      }

      const lastVerseHeading = qs('#alfawz-last-verse-title', root);
      const lastVersePreview = qs('#alfawz-last-verse-preview', root);
      const lastVerseProgress = qs('#alfawz-last-verse-progress', root);

      const lastVerseKeyFromStats = stats?.last_verse_key ? String(stats.last_verse_key).trim() : '';
      if (lastVerseKeyFromStats) {
        setPersistentItem('alfawz:last-verse-key', lastVerseKeyFromStats);
      }
      const cachedLastVerseKey = normaliseStoredValue(getPersistentItem('alfawz:last-verse-key'));
      const resolvedLastVerseKey = lastVerseKeyFromStats || cachedLastVerseKey;
      const displayLastVerseKey = normaliseStoredValue(resolvedLastVerseKey);

      const lastVerseExcerptFromStats = normaliseStoredValue(stats?.last_verse_excerpt || '');
      if (lastVerseExcerptFromStats) {
        setPersistentItem('alfawz:last-verse-excerpt', lastVerseExcerptFromStats);
      }
      const cachedLastVerseExcerpt = normaliseStoredValue(getPersistentItem('alfawz:last-verse-excerpt'));

      const statsProgressValue =
        typeof stats?.last_verse_progress === 'number'
          ? stats.last_verse_progress
          : typeof stats?.last_verse_percentage === 'number'
          ? stats.last_verse_percentage
          : null;
      if (statsProgressValue !== null && !Number.isNaN(Number(statsProgressValue))) {
        setPersistentItem('alfawz:last-verse-progress', String(statsProgressValue));
      }
      const cachedProgressRaw = normaliseStoredValue(getPersistentItem('alfawz:last-verse-progress'));
      const cachedProgressValue = cachedProgressRaw ? Number(cachedProgressRaw) : NaN;
      const resolvedProgressValue =
        statsProgressValue !== null && !Number.isNaN(Number(statsProgressValue))
          ? Number(statsProgressValue)
          : !Number.isNaN(cachedProgressValue)
          ? cachedProgressValue
          : 0;

      if (lastVerseHeading) {
        lastVerseHeading.textContent = displayLastVerseKey
          ? `Surah ${displayLastVerseKey}`
          : 'Start a new session';
      }
      if (lastVersePreview) {
        lastVersePreview.textContent =
          lastVerseExcerptFromStats ||
          cachedLastVerseExcerpt ||
          wpData.strings?.dashboardPlaceholder ||
          'Launch the reader to log your next ayah.';
      }
      if (lastVerseProgress) {
        const progressDisplay = Number.isFinite(resolvedProgressValue)
          ? Math.max(0, Math.min(100, Math.round(resolvedProgressValue)))
          : 0;
        lastVerseProgress.textContent = `${progressDisplay}%`;
      }

      const continueButton = qs('[data-action="continue-reading"]', root);
      if (continueButton) {
        const continueVerseKey = displayLastVerseKey;
        if (continueVerseKey) {
          continueButton.removeAttribute('disabled');
          continueButton.addEventListener('click', () => {
            const baseUrl = wpData.readerUrl || 'alfawz-reader/';
            let targetUrl;
            try {
              targetUrl = new URL(baseUrl, window.location.origin);
            } catch (error) {
              console.warn('[AlfawzQuran] invalid reader URL, falling back to site origin', error);
              targetUrl = new URL('alfawz-reader/', window.location.origin);
            }

            const [surahPart, versePart] = continueVerseKey.split(':');
            if (surahPart && versePart) {
              targetUrl.searchParams.set('surah', surahPart);
              targetUrl.searchParams.set('verse', versePart);
            } else {
              targetUrl.searchParams.set('verse', continueVerseKey);
            }

            window.location.href = targetUrl.toString();
          });
        } else {
          continueButton.setAttribute('disabled', 'disabled');
        }
      }

      applyInsights(insights);
      revealDashboard(root);
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to load dashboard data', error);
      revealDashboard(root);
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
    const transliterationToggle = qs('#alfawz-toggle-transliteration', root);
    const translationToggle = qs('#alfawz-toggle-translation', root);
    const translationChips = Array.from(
      root.querySelectorAll('[data-translation-option]'),
    );
    const transliterationChips = Array.from(
      root.querySelectorAll('[data-transliteration-option]'),
    );
    const verseContent = qs('#alfawz-verse-content', root);
    const prevBtn = qs('#alfawz-prev-verse', root);
    const nextBtn = qs('#alfawz-next-verse', root);
    const nextSurahBtn = qs('#alfawz-next-surah', root);
    const defaultNextSurahLabel = nextSurahBtn
      ? nextSurahBtn.textContent.trim() || 'Enter Next'
      : 'Enter Next';
    const eggEmoji = qs('#alfawz-egg-emoji', root);
    const eggCount = qs('#alfawz-egg-count', root);
    const eggProgress = qs('#alfawz-egg-progress-bar', root);
    const eggMessage = qs('#alfawz-egg-message', root);
    const eggMessageSplashHosts = Array.from(root.querySelectorAll('[data-role="alfawz-egg-message-splash"]'));
    const growthVisual = qs('#alfawz-growth-visual', root);
    const dailyBar = qs('#alfawz-daily-progress-bar', root);
    const dailyLabel = qs('#alfawz-daily-label', root);
    const dailyNote = qs('#alfawz-daily-note', root);
    const dailyModal = qs('#alfawz-daily-modal', root);
    const dailyDismissControls = dailyModal ? dailyModal.querySelectorAll('[data-dismiss-daily]') : [];
    const dailyModalConfetti = dailyModal ? qs('.alfawz-daily-modal__confetti', dailyModal) : null;
    const confettiHost = qs('#alfawz-confetti-host', root);
    const celebrationAnnouncer = qs('#alfawz-reader-announcement', root);
    const eggWidget = qs('#alfawz-egg-widget', root);
    const audioPanel = qs('#alfawz-audio-panel', root);
    const audioStatus = audioPanel ? qs('#alfawz-audio-status', audioPanel) : null;
    const audioLabel = audioPanel ? qs('#alfawz-audio-label', audioPanel) : null;
    const audioToggle = audioPanel ? qs('#alfawz-audio-toggle', audioPanel) : null;
    const audioToggleLabel = audioPanel ? qs('#alfawz-audio-toggle-label', audioPanel) : null;
    const audioProgressBar = audioPanel ? qs('#alfawz-audio-progress', audioPanel) : null;
    const audioVisualizer = audioPanel ? qs('#alfawz-audio-visualizer', audioPanel) : null;
    const audioSeek = audioPanel ? qs('#alfawz-audio-seek', audioPanel) : null;
    const audioCurrentTime = audioPanel ? qs('#alfawz-audio-current', audioPanel) : null;
    const audioDurationTime = audioPanel ? qs('#alfawz-audio-duration', audioPanel) : null;
    const audioSourceBadge = audioPanel ? qs('#alfawz-audio-source', audioPanel) : null;
    const gwaniPlayer = qs('#alfawz-gwani-player', root);
    const gwaniSurahSelect = gwaniPlayer ? qs('#alfawz-gwani-surah-select', gwaniPlayer) : null;
    const gwaniPlayButton = gwaniPlayer ? qs('#alfawz-gwani-play', gwaniPlayer) : null;
    const gwaniStatus = gwaniPlayer ? qs('#alfawz-gwani-status', gwaniPlayer) : null;
    const gwaniAudio = gwaniPlayer ? qs('#alfawz-gwani-audio', gwaniPlayer) : null;
    if (gwaniSurahSelect) {
      gwaniSurahSelect.dataset.locked = 'true';
    }
    const surahToggle = qs('#alfawz-surah-toggle', root);
    const surahToggleHint = qs('#alfawz-surah-toggle-hint', root);
    const surahList = qs('#alfawz-surah-full-view', root);
    const surahListBody = surahList ? qs('#alfawz-surah-list-body', surahList) : null;
    const reflectionWidget = qs('#alfawz-reflection-widget', root);
    const reflectionContext = qs('#alfawz-reflection-context', root);
    const reflectionInput = qs('#alfawz-reflection-input', root);
    const reflectionStatus = qs('#alfawz-reflection-status', root);
    const reflectionSaveButton = qs('#alfawz-reflection-save', root);
    const reflectionClearButton = qs('#alfawz-reflection-clear', root);
    const reflectionList = qs('#alfawz-reflection-list', root);
    const reflectionEmptyState = qs('#alfawz-reflection-empty-state', root);
    const reflectionMoodButtons = reflectionWidget
      ? Array.from(reflectionWidget.querySelectorAll('.alfawz-reflection-mood'))
      : [];
    const reflectionSaveDefaultLabel = reflectionSaveButton?.textContent?.trim() || 'Save reflection';

    let currentVerseData = null;

    const strings = {
      playAyah: wpData.strings?.playAyah || 'Play this ayah',
      pauseAyah: wpData.strings?.pauseAyah || 'Pause this ayah',
      playLabel: wpData.strings?.play || 'Play',
      pauseLabel: wpData.strings?.pause || 'Pause',
      focusAyah: wpData.strings?.focusAyah || 'Focus this ayah',
      loadingSurah: wpData.strings?.loadingSurah || 'Loading surah…',
      surahError: wpData.strings?.surahError || 'Unable to load the full surah right now. Please try again.',
      toggleOff: wpData.strings?.toggleVerseMode || 'Navigate verse by verse',
      toggleOn: wpData.strings?.toggleSurahMode || 'All verses visible at once',
      ayahLabel: wpData.strings?.ayahLabel || 'Ayah',
      bismillahLabel: wpData.strings?.bismillahLabel || 'Bismillah',
      verses: wpData.strings?.gamePanelVersesLabel || 'Verses',
      eggCelebration: wpData.strings?.eggCelebrationMessage || 'Takbir! You cracked the egg challenge.',
      growthCelebration:
        wpData.strings?.growthCelebrationMessage || 'Takbir! Your tree blossomed into a new canopy.',
      growthStageLabel: wpData.strings?.gamePanelGrowthStageLabel || 'Growth Stage',
      growthInProgress: wpData.strings?.readerGrowthInProgress || 'Keep nurturing your tree with every verse.',
      growthComplete:
        wpData.strings?.readerGrowthComplete || 'Takbir! Your tree blossomed—strive for the next canopy.',
      growthTitle: wpData.strings?.gamePanelGrowthTitle || 'Nurture the Tree of Noor!',
    };

    const reflectionStrings = {
      prompt: wpData.strings?.reflectionPrompt || 'How did this ayah resonate with your heart today?',
      saved: wpData.strings?.reflectionSaved || 'Reflection saved. JazakAllahu khayran for sharing.',
      deleted: wpData.strings?.reflectionDeleted || 'Reflection removed.',
      loadError: wpData.strings?.reflectionLoadError || 'Unable to load reflections right now.',
      saveError: wpData.strings?.reflectionSaveError || 'Unable to save reflection. Please try again.',
      deleteError: wpData.strings?.reflectionDeleteError || 'Unable to delete this reflection right now.',
      loginRequired: wpData.strings?.reflectionLogin || 'Sign in to save your reflections.',
      selectVerse: wpData.strings?.reflectionSelectVerse || 'Select a verse to begin reflecting.',
      saving: wpData.strings?.saving || 'Saving…',
      loading: wpData.strings?.reflectionLoading || 'Loading reflections…',
      removing: wpData.strings?.reflectionDeleting || 'Removing reflection…',
      confirmDelete: wpData.strings?.confirmDeleteReflection || 'Delete this reflection?',
    };

    const announceCelebration = (message = '') => {
      if (!celebrationAnnouncer || !message) {
        return;
      }
      celebrationAnnouncer.textContent = '';
      celebrationAnnouncer.textContent = message;
    };

    const reflectionListLimit = 8;
    const reflectionState = {
      items: [],
      currentVerseKey: null,
      loading: false,
      submitting: false,
      activeMood: '',
      lastMood: '',
    };

    const gwaniDefaultStatus = 'Select a surah to hear the Gwani Dahiru recitation.';
    const gwaniPlayDefaultLabel = gwaniPlayButton?.textContent?.trim() || 'Play full surah';
    let gwaniLoading = false;
    let gwaniCurrentSurahId = null;

    const setReflectionStatus = (message = '') => {
      if (reflectionStatus) {
        reflectionStatus.textContent = message;
      }
    };

    const setReflectionContext = (surah, verse, verseId, surahId = null) => {
      if (!reflectionContext) {
        return;
      }

      if (!verseId) {
        reflectionContext.textContent = reflectionStrings.selectVerse;
        return;
      }

      const surahName =
        verse?.surahName ||
        surah?.englishName ||
        surah?.englishNameTranslation ||
        surah?.name ||
        (surahId ? `Surah ${surahId}` : 'This surah');
      const verseLabel = verse ? getDisplayVerseLabel(verse, strings) : '';
      const displayLabel = verseLabel || (verseId ? `${strings.ayahLabel} ${verseId}` : strings.ayahLabel);
      reflectionContext.textContent = `Reflect on ${surahName} · ${displayLabel}`;
    };

    const updateDashboardReflections = (reflection) => {
      if (!reflection || !state.dashboardInsights || !Array.isArray(state.dashboardInsights.reflections)) {
        return;
      }

      const existing = state.dashboardInsights.reflections.filter((entry) => entry && entry.id !== reflection.id);
      state.dashboardInsights.reflections = [reflection, ...existing].slice(0, 3);
    };

    const removeDashboardReflection = (id) => {
      if (!state.dashboardInsights || !Array.isArray(state.dashboardInsights.reflections)) {
        return;
      }
      state.dashboardInsights.reflections = state.dashboardInsights.reflections.filter((entry) => entry?.id !== id);
    };

    const describeGwaniSurah = (surahId) => {
      const numericId = Number(surahId || 0);
      if (!numericId) {
        return '';
      }
      const surah = getSurahById(numericId);
      const fallback = `Surah ${numericId}`;
      if (!surah) {
        return fallback;
      }
      const prefix = surah.number ? `${surah.number}. ` : '';
      const name =
        surah.englishName ||
        surah.englishNameTranslation ||
        surah.name ||
        surah.revelationType ||
        fallback;
      return `${prefix}${name}`;
    };

    const setGwaniStatus = (message = gwaniDefaultStatus, tone = 'muted') => {
      if (!gwaniStatus) {
        return;
      }
      gwaniStatus.textContent = message || '';
      const tones = ['loading', 'success', 'error'];
      tones.forEach((name) => {
        gwaniStatus.classList.toggle(`is-${name}`, tone === name);
      });
    };

    const updateGwaniButtonState = () => {
      if (!gwaniPlayButton) {
        return;
      }
      const hasSelection = Boolean(Number(gwaniSurahSelect?.value || 0));
      gwaniPlayButton.disabled = gwaniLoading || !hasSelection;
    };

    const setGwaniLoadingState = (loading) => {
      gwaniLoading = Boolean(loading);
      if (gwaniPlayButton) {
        gwaniPlayButton.setAttribute('aria-busy', gwaniLoading ? 'true' : 'false');
        gwaniPlayButton.textContent = gwaniLoading
          ? wpData.strings?.loading || 'Loading…'
          : gwaniPlayDefaultLabel;
      }
      if (gwaniSurahSelect && !gwaniSurahSelect.dataset.locked) {
        gwaniSurahSelect.disabled = gwaniLoading;
      }
      updateGwaniButtonState();
    };

    const resetGwaniAudio = ({ keepSource = false } = {}) => {
      if (!gwaniAudio) {
        return;
      }
      try {
        gwaniAudio.pause();
      } catch (error) {
        // ignore pause errors
      }
      if (!keepSource) {
        gwaniAudio.removeAttribute('src');
      }
      gwaniAudio.load();
    };

    const handleGwaniSurahChange = () => {
      updateGwaniButtonState();
      if (!gwaniSurahSelect) {
        return;
      }
      const surahId = Number(gwaniSurahSelect.value || 0);
      if (!surahId) {
        gwaniCurrentSurahId = null;
        resetGwaniAudio();
        setGwaniStatus(gwaniDefaultStatus);
        return;
      }
      if (gwaniCurrentSurahId && gwaniCurrentSurahId !== surahId) {
        gwaniCurrentSurahId = null;
        resetGwaniAudio();
      }
      const surahName = describeGwaniSurah(surahId);
      setGwaniStatus(`Ready to play ${surahName} from the Gwani Dahiru archive. Press play to begin.`, 'success');
    };

    const handleGwaniPlay = async () => {
      if (!gwaniSurahSelect || !gwaniAudio || gwaniLoading) {
        return;
      }
      const surahId = Number(gwaniSurahSelect.value || 0);
      if (!surahId) {
        return;
      }
      const surahName = describeGwaniSurah(surahId) || `Surah ${surahId}`;
      setGwaniLoadingState(true);
      setGwaniStatus(`Loading ${surahName} from the Gwani Dahiru archive…`, 'loading');
      try {
        const url = await loadArchiveSurahUrl(surahId);
        if (!url) {
          throw new Error('Archive URL unavailable');
        }
        gwaniCurrentSurahId = surahId;
        const verseAudio = ensureAudioElement();
        if (verseAudio && typeof verseAudio.pause === 'function') {
          verseAudio.pause();
        }
        gwaniAudio.pause();
        gwaniAudio.src = url;
        gwaniAudio.dataset.surahId = String(surahId);
        gwaniAudio.load();
        const playPromise = gwaniAudio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(() => {
            if (gwaniCurrentSurahId === surahId) {
              setGwaniStatus(`Ready to play ${surahName} from the Gwani Dahiru archive. Press play to begin.`, 'success');
            }
          });
        } else {
          setGwaniStatus(`Ready to play ${surahName} from the Gwani Dahiru archive. Press play to begin.`, 'success');
        }
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to start Gwani surah playback', error);
        gwaniCurrentSurahId = null;
        resetGwaniAudio();
        setGwaniStatus('Unable to load this surah from the archive right now. Please try another.', 'error');
      } finally {
        setGwaniLoadingState(false);
      }
    };

    function getEnabledReflectionMoodButtons() {
      return reflectionMoodButtons.filter((button) => !button.disabled);
    }

    function updateReflectionMoodButtons() {
      if (!reflectionMoodButtons.length) {
        return;
      }

      const enabledButtons = getEnabledReflectionMoodButtons();
      let activeMood = reflectionState.activeMood || '';

      if (
        activeMood &&
        !enabledButtons.some((button) => {
          return (button.dataset.mood || '') === activeMood;
        })
      ) {
        activeMood = '';
        reflectionState.activeMood = '';
      }

      let hasSelected = false;

      reflectionMoodButtons.forEach((button) => {
        const mood = button.dataset.mood || '';
        const isSelected = Boolean(activeMood) && activeMood === mood;
        const ariaPressed = isSelected ? 'true' : 'false';

        button.setAttribute('aria-pressed', ariaPressed);
        button.setAttribute('aria-checked', ariaPressed);
        if (button.disabled) {
          button.setAttribute('aria-disabled', 'true');
        } else {
          button.removeAttribute('aria-disabled');
        }
        button.tabIndex = isSelected ? 0 : -1;
        if (isSelected) {
          hasSelected = true;
        }
      });

      if (!hasSelected) {
        const fallback = enabledButtons[0];
        if (fallback) {
          fallback.tabIndex = 0;
        }
      }
    }

    function canInteractWithReflectionMoods() {
      return Boolean(wpData.isLoggedIn) && Boolean(reflectionState.currentVerseKey) && !reflectionState.submitting;
    }

    function setActiveReflectionMood(mood, { toggle = true, focusTarget = null, suppressStatus = false } = {}) {
      if (!canInteractWithReflectionMoods()) {
        if (!wpData.isLoggedIn && !suppressStatus) {
          setReflectionStatus(reflectionStrings.loginRequired);
        }
        return;
      }

      const normalizedMood = mood || '';
      if (toggle && reflectionState.activeMood === normalizedMood) {
        reflectionState.activeMood = '';
      } else {
        reflectionState.activeMood = normalizedMood;
      }

      updateReflectionMoodButtons();

      if (focusTarget && typeof focusTarget.focus === 'function') {
        focusTarget.focus();
      }

      syncReflectionControls();
    }

    function moveFocusBetweenReflectionMoods(currentButton, direction) {
      const enabledButtons = getEnabledReflectionMoodButtons();
      if (!enabledButtons.length) {
        return;
      }

      const currentIndex = currentButton ? enabledButtons.indexOf(currentButton) : -1;
      const count = enabledButtons.length;
      const nextIndex = currentIndex === -1 ? (direction > 0 ? 0 : count - 1) : (currentIndex + direction + count) % count;
      const nextButton = enabledButtons[nextIndex];
      if (!nextButton) {
        return;
      }

      if (typeof nextButton.focus === 'function') {
        nextButton.focus();
      }

      setActiveReflectionMood(nextButton.dataset.mood || '', {
        toggle: false,
        focusTarget: nextButton,
        suppressStatus: true,
      });
    }

    const syncReflectionControls = () => {
      const hasVerse = Boolean(reflectionState.currentVerseKey);
      const isLoggedIn = Boolean(wpData.isLoggedIn);
      const disabled = !hasVerse || !isLoggedIn;
      const busy = reflectionState.loading;

      if (reflectionWidget) {
        reflectionWidget.classList.toggle('alfawz-reflection-widget--disabled', disabled);
        reflectionWidget.setAttribute('aria-busy', busy ? 'true' : 'false');
      }

      if (reflectionInput) {
        reflectionInput.disabled = disabled;
      }

      const moodsDisabled = disabled || reflectionState.submitting;
      reflectionMoodButtons.forEach((button) => {
        button.disabled = moodsDisabled;
        if (moodsDisabled) {
          button.setAttribute('aria-disabled', 'true');
          button.tabIndex = -1;
        } else {
          button.removeAttribute('aria-disabled');
        }
      });

      if (!moodsDisabled) {
        updateReflectionMoodButtons();
      }

      if (reflectionSaveButton) {
        const hasContent = Boolean(reflectionInput?.value?.trim());
        reflectionSaveButton.disabled = disabled || reflectionState.submitting || !hasContent;
        reflectionSaveButton.textContent = reflectionState.submitting
          ? reflectionStrings.saving
          : reflectionSaveDefaultLabel;
      }

      if (reflectionClearButton) {
        const hasFormState = Boolean(reflectionInput?.value) || Boolean(reflectionState.activeMood);
        reflectionClearButton.disabled = disabled || !hasFormState || reflectionState.submitting;
      }
    };

    const clearReflectionForm = ({ keepMood = false, quiet = false } = {}) => {
      if (reflectionInput) {
        reflectionInput.value = '';
      }
      if (!keepMood) {
        reflectionState.activeMood = '';
        updateReflectionMoodButtons();
      }
      if (!quiet) {
        setReflectionStatus('');
      }
      syncReflectionControls();
    };

    function renderReflectionItems() {
      if (!reflectionList) {
        return;
      }

      reflectionList.innerHTML = '';
      const items = Array.isArray(reflectionState.items) ? reflectionState.items : [];

      if (!items.length) {
        if (reflectionEmptyState) {
          reflectionEmptyState.classList.remove('hidden');
        }
        return;
      }

      if (reflectionEmptyState) {
        reflectionEmptyState.classList.add('hidden');
      }

      const fragment = document.createDocumentFragment();
      items.forEach((entry) => {
        const li = document.createElement('li');
        li.className = 'alfawz-reflection-item';

        const details = document.createElement('details');
        details.className = 'alfawz-reflection-entry';

        const summary = document.createElement('summary');
        summary.className = 'alfawz-reflection-summary';

        const mood = document.createElement('strong');
        mood.textContent = entry?.mood_label || entry?.mood || 'Reflection';
        summary.appendChild(mood);

        if (entry?.created_at_label) {
          const time = document.createElement('time');
          time.dateTime = entry?.created_at_gmt || '';
          time.textContent = entry.created_at_label;
          summary.appendChild(time);
        }

        details.appendChild(summary);

        const body = document.createElement('div');
        body.className = 'alfawz-reflection-details';

        const content = document.createElement('p');
        content.textContent = entry?.content || '';
        body.appendChild(content);

        if (entry?.id) {
          const remove = document.createElement('button');
          remove.type = 'button';
          remove.textContent = wpData.strings?.delete || 'Delete';
          remove.addEventListener('click', () => {
            handleReflectionDelete(entry);
          });
          body.appendChild(remove);
        }

        details.appendChild(body);
        li.appendChild(details);
        fragment.appendChild(li);
      });

      reflectionList.appendChild(fragment);
    }

    async function handleReflectionDelete(entry) {
      if (!entry?.id || reflectionState.submitting) {
        return;
      }

      if (!window.confirm(reflectionStrings.confirmDelete)) {
        return;
      }

      reflectionState.submitting = true;
      syncReflectionControls();
      setReflectionStatus(reflectionStrings.removing);

      try {
        await apiRequest(`reflections/${entry.id}`, { method: 'DELETE' });
        reflectionState.items = reflectionState.items.filter((item) => item.id !== entry.id);
        renderReflectionItems();
        if (reflectionState.items.length) {
          setReflectionStatus(reflectionStrings.deleted);
        } else {
          setReflectionStatus(reflectionStrings.prompt);
        }
        removeDashboardReflection(entry.id);
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to delete reflection', error);
        setReflectionStatus(reflectionStrings.deleteError);
      } finally {
        reflectionState.submitting = false;
        syncReflectionControls();
      }
    }

    const loadReflectionsForVerse = async (surahId, verseId, verse) => {
      reflectionState.currentVerseKey = surahId && verseId ? `${surahId}:${verseId}` : null;
      reflectionState.items = [];
      renderReflectionItems();

      if (!reflectionState.currentVerseKey) {
        setReflectionContext(null, null, null);
        setReflectionStatus(reflectionStrings.selectVerse);
        syncReflectionControls();
        return;
      }

      setReflectionContext(getSurahById(surahId), verse, verseId, surahId);

      if (!wpData.isLoggedIn) {
        setReflectionStatus(reflectionStrings.loginRequired);
        syncReflectionControls();
        return;
      }

      clearReflectionForm({ keepMood: true, quiet: true });
      reflectionState.loading = true;
      syncReflectionControls();
      setReflectionStatus(reflectionStrings.loading);

      try {
        const response = await apiRequest(
          `reflections?surah_id=${surahId}&verse_id=${verseId}&limit=${reflectionListLimit}`
        );
        const items = Array.isArray(response?.items) ? response.items : [];
        reflectionState.items = items;
        reflectionState.lastMood = response?.last_mood || reflectionState.lastMood || '';
        if (!reflectionState.activeMood && reflectionState.lastMood) {
          reflectionState.activeMood = reflectionState.lastMood;
          updateReflectionMoodButtons();
        }
        renderReflectionItems();
        setReflectionStatus(items.length ? '' : reflectionStrings.prompt);
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to load reflections', error);
        setReflectionStatus(reflectionStrings.loadError);
      } finally {
        reflectionState.loading = false;
        syncReflectionControls();
      }
    };

    const handleReflectionSave = async () => {
      if (!wpData.isLoggedIn || reflectionState.submitting || !reflectionState.currentVerseKey) {
        if (!wpData.isLoggedIn) {
          setReflectionStatus(reflectionStrings.loginRequired);
        }
        return;
      }

      const content = reflectionInput?.value?.trim();
      if (!content) {
        setReflectionStatus(reflectionStrings.prompt);
        return;
      }

      const [surahId, verseId] = reflectionState.currentVerseKey.split(':').map((part) => Number(part));
      if (!surahId || !verseId) {
        return;
      }

      const body = {
        surah_id: surahId,
        verse_id: verseId,
        content,
      };

      const mood = reflectionState.activeMood || reflectionState.lastMood || '';
      if (mood) {
        body.mood = mood;
      }

      reflectionState.submitting = true;
      syncReflectionControls();
      setReflectionStatus(reflectionStrings.saving);

      try {
        const response = await apiRequest('reflections', {
          method: 'POST',
          body,
        });
        const reflection = response?.reflection;
        if (reflection) {
          reflectionState.items = [reflection, ...reflectionState.items].slice(0, reflectionListLimit);
          reflectionState.lastMood = reflection.mood || mood || reflectionState.lastMood;
          reflectionState.activeMood = reflectionState.lastMood;
          updateReflectionMoodButtons();
          renderReflectionItems();
          setReflectionStatus(reflectionStrings.saved);
          if (reflectionInput) {
            reflectionInput.value = '';
          }
          updateDashboardReflections(reflection);
        } else {
          setReflectionStatus(reflectionStrings.saved);
        }
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to save reflection', error);
        setReflectionStatus(reflectionStrings.saveError);
      } finally {
        reflectionState.submitting = false;
        syncReflectionControls();
      }
    };

    reflectionMoodButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setActiveReflectionMood(button.dataset.mood || '', {
          toggle: true,
          focusTarget: button,
        });
      });

      button.addEventListener('keydown', (event) => {
        const key = event.key;
        if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
          event.preventDefault();
          setActiveReflectionMood(button.dataset.mood || '', {
            toggle: true,
            focusTarget: button,
          });
          return;
        }

        if (key === 'ArrowRight' || key === 'ArrowDown') {
          event.preventDefault();
          moveFocusBetweenReflectionMoods(button, 1);
          return;
        }

        if (key === 'ArrowLeft' || key === 'ArrowUp') {
          event.preventDefault();
          moveFocusBetweenReflectionMoods(button, -1);
        }
      });
    });

    updateReflectionMoodButtons();

    reflectionInput?.addEventListener('input', () => {
      if (!reflectionState.submitting) {
        syncReflectionControls();
      }
    });

    reflectionInput?.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        handleReflectionSave();
      }
    });

    reflectionSaveButton?.addEventListener('click', handleReflectionSave);

    reflectionClearButton?.addEventListener('click', () => {
      if (!wpData.isLoggedIn) {
        setReflectionStatus(reflectionStrings.loginRequired);
        return;
      }
      clearReflectionForm();
      setReflectionStatus(reflectionStrings.prompt);
      reflectionInput?.focus();
    });

    if (reflectionWidget) {
      updateReflectionMoodButtons();
      renderReflectionItems();
      if (wpData.isLoggedIn) {
        setReflectionStatus(reflectionStrings.selectVerse);
      } else {
        setReflectionStatus(reflectionStrings.loginRequired);
      }
      syncReflectionControls();
    }

    if (gwaniPlayer) {
      setGwaniStatus(gwaniDefaultStatus);
      updateGwaniButtonState();
      if (gwaniSurahSelect) {
        gwaniSurahSelect.addEventListener('change', handleGwaniSurahChange);
      }
      if (gwaniPlayButton) {
        gwaniPlayButton.addEventListener('click', handleGwaniPlay);
      }
      if (gwaniAudio) {
        const describeCurrentGwaniSurah = () => describeGwaniSurah(gwaniCurrentSurahId) || '';
        gwaniAudio.addEventListener('loadeddata', () => {
          if (!gwaniCurrentSurahId) {
            return;
          }
          const name = describeCurrentGwaniSurah();
          setGwaniStatus(`${name} ready. Press play to listen.`, 'success');
        });
        gwaniAudio.addEventListener('play', () => {
          if (!gwaniCurrentSurahId) {
            return;
          }
          const name = describeCurrentGwaniSurah();
          setGwaniStatus(`Now playing ${name} from the Gwani Dahiru archive.`, 'success');
        });
        gwaniAudio.addEventListener('pause', () => {
          if (!gwaniCurrentSurahId || gwaniAudio.ended) {
            return;
          }
          const name = describeCurrentGwaniSurah();
          setGwaniStatus(`${name} playback paused.`, 'muted');
        });
        gwaniAudio.addEventListener('ended', () => {
          if (!gwaniCurrentSurahId) {
            return;
          }
          const name = describeCurrentGwaniSurah();
          setGwaniStatus(`${name} playback finished.`, 'success');
        });
        gwaniAudio.addEventListener('waiting', () => {
          if (!gwaniCurrentSurahId) {
            return;
          }
          const name = describeCurrentGwaniSurah();
          setGwaniStatus(`Buffering ${name}…`, 'loading');
        });
        gwaniAudio.addEventListener('error', () => {
          gwaniCurrentSurahId = null;
          resetGwaniAudio();
          setGwaniStatus('Unable to play this surah from the archive right now. Please try again later.', 'error');
        });
      }
    }

    let currentSurahId = null;
    let currentSurah = null;
    let currentVerseId = null;
    let isLoading = false;
    let lastEggCelebratedTarget = null;
    let lastSurahCelebration = { key: '', timestamp: 0 };
    let audioElement = null;
    let audioReady = false;
    let audioIsPlaying = false;
    let audioLoadToken = 0;
    let audioWasForcedPause = false;
    let isSeekingAudio = false;
    let showFullSurah = false;
    let cachedSurahVerses = [];
    let cachedSurahId = null;
    let showTransliteration = true;
    let showTranslation = true;
    let hasTransliteration = false;
    let hasTranslation = false;

    const expandLongVowels = (input) =>
      String(input || '').replace(/[ĀāĪīŪū]/g, (char) => {
        const map = {
          Ā: 'Aa',
          ā: 'aa',
          Ī: 'Ee',
          ī: 'ee',
          Ū: 'Oo',
          ū: 'oo',
        };
        return map[char] || char;
      });

    const simplifyTransliteration = (text) => {
      if (!text) {
        return '';
      }
      const expanded = expandLongVowels(text);
      return expanded
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[’'‘`ʿʾˀˁ]/g, '')
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const formatTransliterationText = (text) => {
      if (!text) {
        return '';
      }
      const profile = transliterationProfileMap[activeTransliterationProfileId];
      if (!profile) {
        return text;
      }
      const mode = profile.mode || 'standard';
      if (mode === 'simplified' || mode === 'assistive') {
        const simplified = simplifyTransliteration(text);
        return mode === 'assistive' ? simplified.toUpperCase() : simplified;
      }
      return text;
    };

    const applyTransliterationProfileToElement = (element, sourceText) => {
      if (!element) {
        return;
      }
      const formatted = formatTransliterationText(sourceText);
      element.textContent = formatted || '';
      element.dataset.profile = activeTransliterationProfileId;
      element.classList.toggle(
        'alfawz-transliteration--assistive',
        activeTransliterationProfileId === 'assistive',
      );
    };

    const updateTranslationChips = () => {
      translationChips.forEach((chip) => {
        const { translationOption } = chip.dataset || {};
        const isActive = translationOption === activeTranslationProfileId;
        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    const updateTransliterationChips = () => {
      transliterationChips.forEach((chip) => {
        const { transliterationOption } = chip.dataset || {};
        const isActive = transliterationOption === activeTransliterationProfileId;
        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    const refreshTransliterationContent = () => {
      if (transliterationEl && currentVerseData) {
        applyTransliterationProfileToElement(
          transliterationEl,
          currentVerseData.transliteration || '',
        );
        transliterationEl.classList.toggle(
          'hidden',
          !hasTransliteration || !showTransliteration,
        );
      }
      if (surahListBody && Array.isArray(cachedSurahVerses) && cachedSurahVerses.length) {
        const items = Array.from(surahListBody.querySelectorAll('.alfawz-surah-item'));
        items.forEach((item) => {
          const verseId = Number(item.dataset.verseId);
          if (!verseId) {
            return;
          }
          const verse = cachedSurahVerses.find((entry) => Number(entry.verseId) === verseId);
          const transliterationNode = item.querySelector('.alfawz-surah-item__transliteration');
          if (transliterationNode) {
            applyTransliterationProfileToElement(
              transliterationNode,
              verse?.transliteration || '',
            );
            transliterationNode.classList.toggle(
              'hidden',
              !showTransliteration || !verse?.transliteration,
            );
          }
        });
      }
      syncSurahTransliterationVisibility();
    };

    const handleTranslationProfileChange = async (profileId) => {
      const profile = translationProfileMap[profileId];
      if (!profile) {
        return;
      }
      const previousEdition = activeTranslationEdition;
      const nextEdition = profile.edition || DEFAULT_TRANSLATION_EDITION;
      if (profileId === activeTranslationProfileId && nextEdition === previousEdition) {
        return;
      }
      activeTranslationProfileId = profileId;
      activeTranslationEdition = nextEdition;
      setPersistentItem('alfawz.translationProfile', profileId);
      updateTranslationChips();
      clearLanguageCaches();
      cachedSurahVerses = [];
      cachedSurahId = null;
      if (surahListBody) {
        surahListBody.innerHTML = '';
      }
      if (!currentSurahId || !currentVerseId) {
        return;
      }
      setLoadingState(true, 'Updating translation…');
      try {
        await renderVerse(currentSurahId, currentVerseId);
        if (showFullSurah) {
          await ensureSurahView(currentSurahId, currentVerseId);
        }
      } catch (error) {
        console.warn('[AlfawzQuran] unable to switch translation', error);
      } finally {
        setLoadingState(false);
      }
    };

    const handleTransliterationProfileChange = async (profileId) => {
      const profile = transliterationProfileMap[profileId];
      if (!profile) {
        return;
      }
      const previousEdition = activeTransliterationEdition;
      const previousProfileId = activeTransliterationProfileId;
      const nextEdition = profile.edition || DEFAULT_TRANSLITERATION_EDITION;
      if (profileId === previousProfileId && nextEdition === previousEdition) {
        return;
      }
      activeTransliterationProfileId = profileId;
      activeTransliterationEdition = nextEdition;
      setPersistentItem('alfawz.transliterationProfile', profileId);
      updateTransliterationChips();
      if (previousEdition !== nextEdition) {
        clearLanguageCaches();
        cachedSurahVerses = [];
        cachedSurahId = null;
        if (surahListBody) {
          surahListBody.innerHTML = '';
        }
        if (!currentSurahId || !currentVerseId) {
          return;
        }
        setLoadingState(true, 'Updating transliteration…');
        try {
          await renderVerse(currentSurahId, currentVerseId);
          if (showFullSurah) {
            await ensureSurahView(currentSurahId, currentVerseId);
          }
        } catch (error) {
          console.warn('[AlfawzQuran] unable to switch transliteration edition', error);
        } finally {
          setLoadingState(false);
        }
        return;
      }
      refreshTransliterationContent();
    };

    updateTranslationChips();
    updateTransliterationChips();

    translationChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const { translationOption } = chip.dataset || {};
        if (!translationOption) {
          return;
        }
        handleTranslationProfileChange(translationOption).catch((error) => {
          console.warn('[AlfawzQuran] unable to apply translation preference', error);
        });
      });
    });

    transliterationChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const { transliterationOption } = chip.dataset || {};
        if (!transliterationOption) {
          return;
        }
        handleTransliterationProfileChange(transliterationOption).catch((error) => {
          console.warn('[AlfawzQuran] unable to apply transliteration preference', error);
        });
      });
    });

    const defaultDailyTarget = Number(wpData.dailyTarget || 10);

    const safeSetText = (element, value) => {
      if (element) {
        element.textContent = value || '';
      }
    };

    const setToggleState = (toggle, isActive) => {
      if (!toggle) {
        return;
      }
      toggle.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      const label = isActive ? toggle.dataset.labelHide : toggle.dataset.labelShow;
      if (label) {
        toggle.textContent = label;
      }
    };

    const setToggleAvailability = (toggle, available) => {
      if (!toggle) {
        return;
      }
      toggle.hidden = !available;
      toggle.disabled = !available;
      toggle.setAttribute('aria-disabled', available ? 'false' : 'true');
    };

    const syncSurahTransliterationVisibility = () => {
      if (!surahListBody) {
        return;
      }
      const transliterations = surahListBody.querySelectorAll('.alfawz-surah-item__transliteration');
      transliterations.forEach((element) => {
        element.classList.toggle('hidden', !showTransliteration);
      });
    };

    const syncTransliterationVisibility = () => {
      if (transliterationEl) {
        transliterationEl.classList.toggle('hidden', !hasTransliteration || !showTransliteration);
      }
      syncSurahTransliterationVisibility();
    };

    const syncSurahTranslationVisibility = () => {
      if (!surahListBody) {
        return;
      }
      const translations = surahListBody.querySelectorAll('.alfawz-surah-item__translation');
      translations.forEach((element) => {
        element.classList.toggle('hidden', !showTranslation);
      });
    };

    const syncTranslationVisibility = () => {
      if (translationEl) {
        translationEl.classList.toggle('hidden', !hasTranslation || !showTranslation);
      }
      syncSurahTranslationVisibility();
    };

    const setSurahPlayButtonState = (
      button,
      { isCurrent = false, isPlaying = false } = {}
    ) => {
      if (!button) {
        return;
      }
      const icon = button.querySelector('.alfawz-surah-item__icon');
      const text = button.querySelector('.alfawz-surah-item__play-text');
      const verseAnnouncement =
        button.dataset.verseAnnouncement || button.dataset.verseId || '';
      const playing = Boolean(isCurrent && isPlaying);
      const ariaPrefix = playing ? strings.pauseAyah : strings.playAyah;
      const labelText = playing ? strings.pauseLabel : strings.playLabel;
      if (icon) {
        icon.textContent = playing ? '⏸' : '▶';
      }
      if (text) {
        text.textContent = labelText;
      }
      if (ariaPrefix) {
        button.setAttribute(
          'aria-label',
          verseAnnouncement ? `${ariaPrefix} ${verseAnnouncement}` : ariaPrefix
        );
      }
      button.setAttribute('aria-pressed', playing ? 'true' : 'false');
      button.classList.toggle('is-active', isCurrent);
      button.classList.toggle('is-playing', playing);
    };

    const syncSurahPlayButtons = () => {
      if (!surahListBody) {
        return;
      }
      const buttons = surahListBody.querySelectorAll('.alfawz-surah-item__play');
      if (!buttons.length) {
        return;
      }
      const playing = audioReady && audioIsPlaying;
      const activeVerseId = Number(currentVerseId);
      buttons.forEach((button) => {
        const verseId = Number(button.dataset.verseId);
        const isCurrent = !Number.isNaN(verseId) && verseId === activeVerseId;
        setSurahPlayButtonState(button, {
          isCurrent,
          isPlaying: playing,
        });
      });
    };

    if (transliterationToggle) {
      setToggleState(transliterationToggle, showTransliteration);
      setToggleAvailability(transliterationToggle, false);
      transliterationToggle.addEventListener('click', () => {
        if (transliterationToggle.disabled || transliterationToggle.getAttribute('aria-disabled') === 'true') {
          return;
        }
        showTransliteration = !showTransliteration;
        setToggleState(transliterationToggle, showTransliteration);
        syncTransliterationVisibility();
      });
    }

    if (translationToggle) {
      setToggleState(translationToggle, showTranslation);
      setToggleAvailability(translationToggle, false);
      translationToggle.addEventListener('click', () => {
        if (translationToggle.disabled || translationToggle.getAttribute('aria-disabled') === 'true') {
          return;
        }
        showTranslation = !showTranslation;
        setToggleState(translationToggle, showTranslation);
        syncTranslationVisibility();
      });
    }

    const formatTime = (seconds) => {
      if (!Number.isFinite(seconds) || seconds < 0) {
        return '0:00';
      }
      const total = Math.floor(seconds);
      const minutes = Math.floor(total / 60);
      const remaining = total % 60;
      return `${minutes}:${String(remaining).padStart(2, '0')}`;
    };

    const setAudioStatus = (message) => {
      if (audioStatus) {
        audioStatus.textContent = message;
      }
    };

    const setAudioLabel = (label) => {
      if (audioLabel) {
        audioLabel.textContent = label;
      }
    };

    const setAudioSourceBadge = (text, theme = 'emerald') => {
      if (!audioSourceBadge) {
        return;
      }
      const themes = {
        emerald: 'alfawz-badge--primary',
        amber: 'alfawz-badge--secondary',
        rose: 'alfawz-badge--accent',
      };
      const themeClass = themes[theme] || themes.emerald;
      audioSourceBadge.className = `alfawz-badge ${themeClass}`;
      audioSourceBadge.textContent = text;
    };

    const setAudioProgress = (percentage) => {
      const clamped = Math.min(100, Math.max(0, percentage || 0));
      if (audioProgressBar) {
        audioProgressBar.style.width = `${clamped}%`;
      }
      if (audioSeek && !isSeekingAudio) {
        audioSeek.value = String(clamped);
      }
    };

    const updateAudioTimes = (current, duration) => {
      if (audioCurrentTime) {
        audioCurrentTime.textContent = formatTime(current);
      }
      if (audioDurationTime) {
        audioDurationTime.textContent = formatTime(duration);
      }
    };

    const updateAudioToggle = () => {
      if (!audioToggle || !audioToggleLabel) {
        return;
      }
      if (!audioReady) {
        audioToggle.disabled = true;
        audioToggleLabel.textContent = wpData.strings?.loading || 'Loading…';
        audioToggle.setAttribute('aria-pressed', 'false');
        return;
      }
      audioToggle.disabled = false;
      if (audioIsPlaying) {
        audioToggleLabel.textContent = wpData.strings?.pause || 'Pause';
        audioToggle.setAttribute('aria-pressed', 'true');
      } else {
        audioToggleLabel.textContent = wpData.strings?.play || 'Play';
        audioToggle.setAttribute('aria-pressed', 'false');
      }
    };

    const updateAudioPanelState = () => {
      if (!audioPanel) {
        return;
      }
      audioPanel.classList.toggle('is-playing', audioReady && audioIsPlaying);
      if (audioVisualizer) {
        audioVisualizer.style.opacity = audioReady && audioIsPlaying ? '0.72' : '0.25';
      }
    };

    const ensureAudioElement = () => {
      if (!audioPanel) {
        return null;
      }
      if (audioElement) {
        return audioElement;
      }
      const element = new Audio();
      element.preload = 'auto';
      element.crossOrigin = 'anonymous';
      element.addEventListener('timeupdate', () => {
        if (!audioReady) {
          return;
        }
        updateAudioTimes(element.currentTime, element.duration);
        if (!isSeekingAudio) {
          const percentage = element.duration ? (element.currentTime / element.duration) * 100 : 0;
          setAudioProgress(percentage);
        }
      });
      element.addEventListener('loadedmetadata', () => {
        if (!audioReady) {
          return;
        }
        updateAudioTimes(element.currentTime, element.duration);
      });
      element.addEventListener('play', () => {
        audioIsPlaying = true;
        updateAudioToggle();
        updateAudioPanelState();
        if (audioReady) {
          setAudioStatus('Now playing recitation.');
        }
        syncSurahPlayButtons();
      });
      element.addEventListener('pause', () => {
        audioIsPlaying = false;
        updateAudioToggle();
        updateAudioPanelState();
        if (audioReady && !audioWasForcedPause) {
          setAudioStatus('Recitation paused.');
        }
        audioWasForcedPause = false;
        syncSurahPlayButtons();
      });
      element.addEventListener('ended', () => {
        audioIsPlaying = false;
        updateAudioToggle();
        updateAudioPanelState();
        if (audioReady) {
          setAudioStatus('Recitation finished. Replay to listen again.');
          setAudioProgress(100);
        }
        syncSurahPlayButtons();
      });
      element.addEventListener('waiting', () => {
        if (audioReady) {
          setAudioStatus('Buffering recitation…');
        }
      });
      audioElement = element;
      return audioElement;
    };

    const getAudioSourceMeta = () => {
      const reciter = currentReciter || RECITER_EDITION || CDN_FALLBACK_RECITER;
      const archive = isArchiveReciter(reciter);
      return {
        reciter,
        isArchive: archive,
        waitingLabel: archive ? 'Archive · waiting' : 'CDN · waiting',
        resolvingLabel: archive ? 'Archive · resolving' : 'CDN · resolving',
        unavailableLabel: archive ? 'Archive · unavailable' : 'CDN · unavailable',
        fallbackLabel: archive ? 'Backup · CDN' : 'CDN · primary',
        fallbackTheme: archive ? 'rose' : 'emerald',
        fallbackReciter: archive ? CDN_FALLBACK_RECITER : reciter,
      };
    };

    const resetAudio = (message, { keepSource = false } = {}) => {
      audioLoadToken += 1;
      const audio = ensureAudioElement();
      audioReady = false;
      audioIsPlaying = false;
      if (audio) {
        audio.pause();
        audioWasForcedPause = true;
        audio.removeAttribute('src');
        audio.load();
      }
      if (audioSeek) {
        audioSeek.value = '0';
        audioSeek.disabled = true;
      }
      setAudioProgress(0);
      updateAudioTimes(0, 0);
      if (!keepSource) {
        const sourceMeta = getAudioSourceMeta();
        setAudioSourceBadge(sourceMeta.waitingLabel, 'emerald');
      }
      setAudioStatus(message || 'Select a verse to load the recitation.');
      updateAudioToggle();
      updateAudioPanelState();
      syncSurahPlayButtons();
    };

    const attemptLoadCandidate = (url, label, theme = 'emerald') =>
      new Promise((resolve, reject) => {
        if (!url) {
          reject(new Error('Empty audio URL'));
          return;
        }
        const audio = ensureAudioElement();
        if (!audio) {
          reject(new Error('Audio element unavailable'));
          return;
        }
        let settled = false;
        const cleanup = () => {
          audio.removeEventListener('canplaythrough', onReady);
          audio.removeEventListener('loadeddata', onReady);
          audio.removeEventListener('error', onError);
          window.clearTimeout(timeoutId);
        };
        const onReady = () => {
          if (settled) {
            return;
          }
          settled = true;
          cleanup();
          resolve({ url, label, theme });
        };
        const onError = () => {
          if (settled) {
            return;
          }
          settled = true;
          cleanup();
          audio.removeAttribute('src');
          audio.load();
          reject(new Error('Audio error'));
        };
        const timeoutId = window.setTimeout(() => {
          if (settled) {
            return;
          }
          settled = true;
          cleanup();
          audio.removeAttribute('src');
          audio.load();
          reject(new Error('Audio timeout'));
        }, 8000);
        audio.addEventListener('canplaythrough', onReady, { once: true });
        audio.addEventListener('loadeddata', onReady, { once: true });
        audio.addEventListener('error', onError, { once: true });
        audio.src = url;
        audio.load();
      });

    const prepareAudio = async (surahId, verseId, verse) => {
      if (!audioPanel || !surahId || !verseId) {
        return;
      }
      const token = ++audioLoadToken;
      const audio = ensureAudioElement();
      if (!audio) {
        return;
      }
      audio.pause();
      audioWasForcedPause = true;
      audio.currentTime = 0;
      isSeekingAudio = false;
      if (audioSeek) {
        audioSeek.value = '0';
        audioSeek.disabled = true;
      }
      audioReady = false;
      setAudioProgress(0);
      updateAudioTimes(0, 0);
      const surahName = verse?.surahName || currentSurah?.englishName || `Surah ${surahId}`;
      const verseLabel = verse ? getDisplayVerseLabel(verse, strings) : `${strings.ayahLabel} ${verseId}`;
      const sourceMeta = getAudioSourceMeta();
      setAudioLabel(`${surahName} • ${verseLabel}`);
      setAudioStatus('Loading recitation…');
      setAudioSourceBadge(sourceMeta.resolvingLabel, 'emerald');
      updateAudioToggle();
      updateAudioPanelState();

      const candidates = [];
      if (sourceMeta.isArchive) {
        const verseUrl = buildArchiveVerseUrl(surahId, verseId);
        candidates.push({ loader: () => attemptLoadCandidate(verseUrl, 'Archive · ayah', 'emerald') });
        candidates.push({
          loader: async () => {
            const surahUrl = await loadArchiveSurahUrl(surahId);
            if (!surahUrl) {
              return null;
            }
            return attemptLoadCandidate(surahUrl, 'Archive · surah', 'amber');
          },
        });
      }

      candidates.push({
        loader: () => {
          const fallbackUrl = loadReciterAudio(sourceMeta.fallbackReciter, surahId, verseId);
          if (!fallbackUrl) {
            return Promise.reject(new Error('Fallback unavailable'));
          }
          return attemptLoadCandidate(fallbackUrl, sourceMeta.fallbackLabel, sourceMeta.fallbackTheme);
        },
      });

      let resolved = null;
      for (const candidate of candidates) {
        try {
          // eslint-disable-next-line no-await-in-loop
          resolved = await candidate.loader();
          if (resolved) {
            break;
          }
        } catch (error) {
          // continue to next candidate
        }
      }

      if (token !== audioLoadToken) {
        return;
      }

      if (!resolved) {
        audioReady = false;
        setAudioStatus('Audio not available for this verse yet.');
        setAudioSourceBadge(sourceMeta.unavailableLabel, 'rose');
        updateAudioToggle();
        updateAudioPanelState();
        return;
      }

      setAudioSourceBadge(resolved.label, resolved.theme);
      if (audioSeek) {
        audioSeek.disabled = false;
        audioSeek.value = '0';
      }
      audio.currentTime = 0;
      audioReady = true;
      audioIsPlaying = false;
      updateAudioToggle();
      updateAudioPanelState();
      setAudioStatus('Recitation ready. Press play to listen.');
      updateAudioTimes(0, audio.duration);
    };

    if (audioPanel) {
      resetAudio('Select a surah and verse to load the recitation.');
      if (audioToggle) {
        audioToggle.addEventListener('click', async () => {
          if (!audioReady) {
            return;
          }
          const audio = ensureAudioElement();
          if (!audio) {
            return;
          }
          audioWasForcedPause = false;
          if (audio.paused) {
            try {
              await audio.play();
            } catch (error) {
              setAudioStatus('Unable to start playback. Please try again.');
            }
          } else {
            audio.pause();
          }
        });
      }
      if (audioSeek) {
        ['mousedown', 'touchstart'].forEach((eventName) => {
          audioSeek.addEventListener(eventName, () => {
            if (audioReady) {
              isSeekingAudio = true;
            }
          });
        });
        ['mouseup', 'touchend', 'touchcancel', 'mouseleave'].forEach((eventName) => {
          audioSeek.addEventListener(eventName, () => {
            if (!audioReady) {
              return;
            }
            if (isSeekingAudio) {
              isSeekingAudio = false;
              const audio = ensureAudioElement();
              if (audio && audio.duration) {
                const percentage = Number(audioSeek.value || 0) / 100;
                audio.currentTime = audio.duration * percentage;
              }
            }
          });
        });
        audioSeek.addEventListener('input', () => {
          if (!audioReady) {
            return;
          }
          const audio = ensureAudioElement();
          if (!audio || !audio.duration) {
            return;
          }
          const percentage = Number(audioSeek.value || 0) / 100;
          const preview = audio.duration * percentage;
          setAudioProgress(percentage * 100);
          updateAudioTimes(preview, audio.duration);
        });
        audioSeek.addEventListener('change', () => {
          if (!audioReady) {
            return;
          }
          const audio = ensureAudioElement();
          if (!audio || !audio.duration) {
            return;
          }
          const percentage = Number(audioSeek.value || 0) / 100;
          audio.currentTime = audio.duration * percentage;
        });
      }
    }

    const animateBar = (bar, percentage) => {
      if (!bar) {
        return;
      }
      requestAnimationFrame(() => {
        bar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
      });
    };

    const updateGrowthVisual = (
      visual,
      { completedStages = 0, activeStage = 0, progress = 0, maxStage = 5 } = {}
    ) => {
      if (!visual) {
        return;
      }
      const normalizedMax = Math.max(1, Number(maxStage) || 1);
      const normalizedCompleted = Math.max(
        0,
        Math.min(normalizedMax, Number(completedStages) || 0)
      );
      const normalizedActive = Math.max(
        normalizedCompleted,
        Math.min(normalizedMax, Number(activeStage) || 0)
      );
      const stageProgress = Math.max(0, Math.min(1, Number(progress) || 0));

      visual.dataset.stage = String(normalizedActive);
      visual.dataset.completed = String(normalizedCompleted);
      visual.style.setProperty('--alfawz-growth-progress', stageProgress.toFixed(3));

      const leaves = visual.querySelectorAll('[data-leaf]');
      if (normalizedActive <= 0) {
        leaves.forEach((leaf) => {
          leaf.classList.remove('is-active', 'is-growing');
          leaf.style.removeProperty('--leaf-progress');
        });
        return;
      }

      leaves.forEach((leaf, index) => {
        const leafNumber = index + 1;
        const isCompleted = leafNumber <= normalizedCompleted;
        const isCurrent =
          !isCompleted && leafNumber === normalizedCompleted + 1 && leafNumber <= normalizedActive;
        const currentProgress = isCurrent ? stageProgress : 0;
        const grown = currentProgress >= 0.999;
        const shouldGrow = isCurrent && !grown;

        leaf.classList.toggle('is-active', isCompleted || (isCurrent && grown));
        leaf.classList.toggle('is-growing', shouldGrow);

        if (shouldGrow) {
          leaf.style.setProperty('--leaf-progress', currentProgress.toFixed(3));
        } else {
          leaf.style.removeProperty('--leaf-progress');
        }

        if (!isCompleted && !isCurrent) {
          leaf.classList.remove('is-active', 'is-growing');
        }
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
      root.setAttribute('aria-busy', busy ? 'true' : 'false');
    };

    const updateToggleHint = () => {
      if (!surahToggleHint) {
        return;
      }
      surahToggleHint.textContent = showFullSurah ? strings.toggleOn : strings.toggleOff;
    };

    const updateSurahModeUI = () => {
      if (surahList) {
        surahList.classList.toggle('hidden', !showFullSurah);
        surahList.classList.toggle('is-expanded', showFullSurah);
        surahList.setAttribute('aria-hidden', showFullSurah ? 'false' : 'true');
        if (!showFullSurah && surahListBody) {
          surahListBody.innerHTML = '';
        }
      }
      if (surahToggle) {
        surahToggle.checked = showFullSurah;
        surahToggle.setAttribute('aria-expanded', showFullSurah ? 'true' : 'false');
      }
      updateToggleHint();
      updateNavigationButtons();
      root.classList.toggle('alfawz-surah-expanded', showFullSurah);
    };

    const setSurahListLoading = (busy) => {
      if (!surahList) {
        return;
      }
      surahList.classList.toggle('is-loading', busy);
      if (!surahListBody) {
        return;
      }
      if (busy) {
        surahListBody.innerHTML = `<div class="alfawz-surah-loading">${strings.loadingSurah}</div>`;
      }
    };

    const renderSurahList = (verses, activeVerseId) => {
      if (!surahListBody) {
        return;
      }
      surahListBody.innerHTML = '';
      if (!Array.isArray(verses) || !verses.length) {
        const empty = document.createElement('p');
        empty.className = 'alfawz-surah-empty';
        empty.textContent = strings.surahError;
        surahListBody.appendChild(empty);
        return;
      }
      const fragment = document.createDocumentFragment();
      verses.forEach((verse) => {
        const item = document.createElement('article');
        item.className = 'alfawz-surah-item';
        const normalizedVerseId = Number(verse.verseId);
        item.dataset.verseId = String(normalizedVerseId);
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        const verseLabel = getDisplayVerseLabel(verse, strings);
        const announcement = verseLabel || `${strings.ayahLabel} ${verse.verseId}`;
        item.setAttribute('aria-label', `${strings.focusAyah} ${announcement}`);
        const isActiveVerse = normalizedVerseId === Number(activeVerseId);
        if (isActiveVerse) {
          item.classList.add('is-active');
          item.setAttribute('aria-current', 'true');
        } else {
          item.removeAttribute('aria-current');
        }

        const header = document.createElement('div');
        header.className = 'alfawz-surah-item__header';
        const index = document.createElement('span');
        index.className = 'alfawz-surah-item__index';
        index.textContent = verseLabel || `${strings.ayahLabel} ${verse.verseId}`;
        header.appendChild(index);
        if (verse.juz) {
          const juz = document.createElement('span');
          juz.className = 'alfawz-surah-item__badge';
          juz.textContent = `Juz ${verse.juz}`;
          header.appendChild(juz);
        }
        item.appendChild(header);

        const arabic = document.createElement('p');
        arabic.className = 'alfawz-surah-item__arabic';
        arabic.dir = 'rtl';
        arabic.lang = 'ar';
        arabic.textContent = verse.arabic || '';
        item.appendChild(arabic);

        if (verse.transliteration) {
          const transliteration = document.createElement('p');
          transliteration.className = 'alfawz-surah-item__transliteration';
          applyTransliterationProfileToElement(transliteration, verse.transliteration);
          transliteration.classList.toggle('hidden', !showTransliteration);
          item.appendChild(transliteration);
        }

        if (verse.translation) {
          const translation = document.createElement('p');
          translation.className = 'alfawz-surah-item__translation';
          translation.textContent = verse.translation;
          translation.classList.toggle('hidden', !showTranslation);
          item.appendChild(translation);
        }

        const actions = document.createElement('div');
        actions.className = 'alfawz-surah-item__actions';

        const playButton = document.createElement('button');
        playButton.type = 'button';
        playButton.className = 'alfawz-surah-item__play';
        playButton.innerHTML = `
          <span class="alfawz-surah-item__icon" aria-hidden="true">▶</span>
          <span class="alfawz-surah-item__play-text">${strings.playLabel}</span>
        `;
        playButton.dataset.verseId = String(normalizedVerseId);
        playButton.dataset.verseAnnouncement = announcement;
        setSurahPlayButtonState(playButton, {
          isCurrent: isActiveVerse,
          isPlaying:
            isActiveVerse && audioReady && audioIsPlaying && normalizedVerseId === Number(currentVerseId),
        });
        playButton.addEventListener('click', async (event) => {
          event.stopPropagation();
          if (!currentSurahId || isLoading) {
            return;
          }
          const normalizedCurrentVerse = Number(currentVerseId);
          const isSameVerse = normalizedVerseId === normalizedCurrentVerse;
          const audio = ensureAudioElement();
          if (isSameVerse && audio && audioReady) {
            audioWasForcedPause = false;
            if (audio.paused) {
              try {
                await audio.play();
              } catch (error) {
                setAudioStatus('Unable to start playback. Please try again.');
              }
            } else {
              audio.pause();
            }
            return;
          }
          const result = await renderVerse(currentSurahId, verse.verseId);
          if (!result || !audioPanel) {
            return;
          }
          try {
            const nextAudio = ensureAudioElement();
            if (nextAudio) {
              audioWasForcedPause = false;
              if (nextAudio.paused) {
                await nextAudio.play();
              }
            }
          } catch (error) {
            setAudioStatus('Unable to start playback. Please try again.');
          }
        });
        actions.appendChild(playButton);

        item.appendChild(actions);

        item.addEventListener('click', async () => {
          if (!currentSurahId || isLoading) {
            return;
          }
          if (Number(verse.verseId) === Number(currentVerseId)) {
            return;
          }
          await renderVerse(currentSurahId, verse.verseId);
          root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        item.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            item.click();
          }
        });

        fragment.appendChild(item);
      });
      surahListBody.appendChild(fragment);
      syncSurahPlayButtons();
    };

    const prefetchAdjacentVerses = (surahId, verseId, versesSource = null) => {
      const totalFromSource = Array.isArray(versesSource) ? versesSource.length : 0;
      const totalFromSurah = currentSurah
        ? Number(currentSurah.numberOfAyahs || currentSurah.ayahs || currentSurah.totalVerses || 0)
        : 0;
      const total = totalFromSource || totalFromSurah;
      const neighbors = [];
      if (verseId > 1) {
        neighbors.push(verseId - 1);
      }
      if (total && verseId < total) {
        neighbors.push(verseId + 1);
      }
      neighbors.forEach((id) => {
        const key = verseCacheKey(surahId, id);
        if (state.verseCache.has(key)) {
          return;
        }
        if (Array.isArray(versesSource)) {
          const match = versesSource.find((entry) => Number(entry.verseId) === Number(id));
          if (match) {
            storeVerseInCache(match);
            if (match?.surahId && match?.verseId) {
              primeVerse(match.surahId, match.verseId, { immediate: true });
            }
            return;
          }
        }
        primeVerse(surahId, id, { immediate: true });
      });
    };

    const warmSurahCache = async (surahId, activeVerseId, { forceRender = false } = {}) => {
      const verses = await loadSurahVerses(surahId);
      if (currentSurahId !== surahId) {
        return verses;
      }
      cachedSurahId = surahId;
      cachedSurahVerses = verses;
      prefetchAdjacentVerses(surahId, activeVerseId, verses);
      if ((showFullSurah || forceRender) && surahList) {
        renderSurahList(verses, activeVerseId);
      }
      return verses;
    };

    const ensureSurahView = async (surahId, activeVerseId) => {
      if (!surahList) {
        return;
      }
      setSurahListLoading(true);
      try {
        await warmSurahCache(surahId, activeVerseId, { forceRender: true });
      } catch (error) {
        if (surahListBody) {
          surahListBody.innerHTML = '';
          const message = document.createElement('p');
          message.className = 'alfawz-surah-error';
          message.textContent = strings.surahError;
          surahListBody.appendChild(message);
        }
        console.warn('[AlfawzQuran] Unable to load full surah', error);
      } finally {
        setSurahListLoading(false);
      }
    };

    const spawnConfetti = (host, count = 18, palette) => {
      if (window.AlfawzCelebrations && typeof window.AlfawzCelebrations.spawnConfetti === 'function') {
        window.AlfawzCelebrations.spawnConfetti(host || confettiHost, count, palette);
        return;
      }
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

    const triggerEggMessageShower = () => {
      if (prefersReducedMotion() || !eggMessageSplashHosts.length) {
        return;
      }
      const hues = [348, 12, 24, 320];
      eggMessageSplashHosts.forEach((host) => {
        const shower = document.createElement('span');
        shower.className = 'alfawz-egg-message-shower';
        const dropCount = 9;
        for (let i = 0; i < dropCount; i += 1) {
          const drop = document.createElement('span');
          drop.className = 'alfawz-egg-message-shower__drop';
          drop.style.setProperty('--alfawz-drop-x', `${-55 + Math.random() * 110}%`);
          drop.style.setProperty('--alfawz-drop-delay', `${Math.random() * 160}ms`);
          drop.style.setProperty('--alfawz-drop-duration', `${720 + Math.random() * 360}ms`);
          drop.style.setProperty('--alfawz-drop-scale', `${0.85 + Math.random() * 0.55}`);
          drop.style.setProperty('--alfawz-drop-hue', `${hues[Math.floor(Math.random() * hues.length)]}`);
          shower.appendChild(drop);
        }
        host.appendChild(shower);
        window.requestAnimationFrame(() => {
          shower.classList.add('is-active');
        });
        const leaveDelay = 780;
        window.setTimeout(() => {
          shower.classList.add('is-leaving');
        }, leaveDelay);
        window.setTimeout(() => {
          shower.remove();
        }, leaveDelay + 360);
      });
    };

    const celebrateEgg = (message = strings.eggCelebration) => {
      if (eggWidget) {
        eggWidget.classList.add('alfawz-egg-celebrate');
        window.setTimeout(() => eggWidget.classList.remove('alfawz-egg-celebrate'), 1200);
      }
      triggerEggMessageShower();
      spawnConfetti(confettiHost);
      announceCelebration(message || strings.eggCelebration);
    };

    const celebrateSurahCompletion = (surahName = '') => {
      spawnConfetti(confettiHost, 32);
      announceCelebration(
        surahName ? `Takbir! You completed ${surahName}.` : 'Takbir! You completed this surah.'
      );
      if (window.AlfawzCelebrations && typeof window.AlfawzCelebrations.celebrate === 'function') {
        window.AlfawzCelebrations.celebrate('surah', {
          message: surahName
            ? `Takbir! You completed ${surahName}. May the Qur’an be a light for you.`
            : 'Takbir! You completed this surah. May the Qur’an be a light for you.',
          detail: 'Take a moment to make du’a or continue to the next recitation.',
          cta: 'Continue reciting',
        });
      }
    };

    const maybeCelebrateSurahCompletion = (surahId, verseId) => {
      const numericSurah = Number(surahId || 0);
      const numericVerse = Number(verseId || 0);
      if (!numericSurah || !numericVerse) {
        return;
      }
      const surah = getSurahById(numericSurah);
      const totalVerses = surah ? Number(surah.numberOfAyahs || surah.ayahs || surah.totalVerses || 0) : 0;
      if (!totalVerses || numericVerse < totalVerses) {
        return;
      }
      const key = `${numericSurah}:${totalVerses}`;
      const now = Date.now();
      if (lastSurahCelebration.key === key && now - lastSurahCelebration.timestamp < 60000) {
        return;
      }
      lastSurahCelebration = { key, timestamp: now };
      const surahName =
        surah?.englishName ||
        surah?.englishNameTranslation ||
        surah?.name ||
        `Surah ${numericSurah}`;
      celebrateSurahCompletion(surahName);
    };

    const updateEggWidget = (state) => {
      if (!state) {
        return;
      }
      const target = Number(state.target || 0);
      const count = Number(state.count || 0);
      const safeTarget = target > 0 ? target : 1;
      const percentage = Number(state.percentage ?? (target ? (count / target) * 100 : 0));
      const completed = Boolean(state.completed) || (target > 0 && count >= target);
      const nextTarget = Number(state.next_target || state.target || safeTarget);
      const previousTarget = Number(state.previous_target || 0) || null;
      const phase = state.phase === 'growth' ? 'growth' : 'egg';
      const maxGrowthStage = Number(state.max_growth_stage || 5) || 5;
      const reportedGrowthStage = Number(state.growth_stage || 0) || 0;
      const completedGrowthStages = Number(state.growth_completed ?? 0) || Math.max(0, reportedGrowthStage - 1);
      const stageProgress = target > 0 ? Math.max(0, Math.min(1, count / safeTarget)) : 0;
      const activeGrowthStage = phase === 'growth'
        ? Math.max(1, Math.min(maxGrowthStage, reportedGrowthStage || completedGrowthStages + 1 || 1))
        : 0;

      if (eggWidget) {
        eggWidget.dataset.phase = phase;
      }
      animateBar(eggProgress, percentage);
      if (eggEmoji) {
        if (phase === 'growth') {
          eggEmoji.textContent = count >= target ? '🌳' : '🌱';
        } else {
          eggEmoji.textContent = completed ? '🐣' : '🥚';
        }
      }
      if (eggMessage) {
        if (phase === 'growth') {
          if (completed) {
            const achievedStage = Math.max(1, Math.min(maxGrowthStage, completedGrowthStages || activeGrowthStage || 1));
            const hasMoreStages = completedGrowthStages < maxGrowthStage;
            const nextStage = hasMoreStages
              ? Math.min(maxGrowthStage, achievedStage + 1)
              : achievedStage;
            const currentLabel = `${strings.growthStageLabel} ${formatNumber(achievedStage)}`;
            let nextLabel = '';
            if (hasMoreStages) {
              nextLabel = `${strings.growthStageLabel} ${formatNumber(nextStage)}`;
            } else if (nextTarget) {
              nextLabel = `${formatNumber(nextTarget)} ${strings.verses}`;
            }
            eggMessage.innerHTML = `🌿 <span class="font-semibold">${strings.growthComplete}</span><br /><span class="font-semibold">${currentLabel}</span>`;
            if (nextLabel) {
              eggMessage.innerHTML += ` → <span class="font-semibold">${nextLabel}</span>`;
            }
          } else {
            const remaining = Number(state.remaining ?? Math.max(0, target - count));
            if (remaining > 0) {
              const remainingLabel = `${formatNumber(remaining)} ${remaining === 1 ? 'more verse' : 'more verses'}`;
              eggMessage.textContent = `${strings.growthInProgress} ${remainingLabel} to reach the next canopy.`;
            } else {
              eggMessage.textContent = strings.growthInProgress;
            }
          }
        } else if (completed) {
          const hatchedLabel = previousTarget && previousTarget > 0 ? previousTarget : Math.max(1, nextTarget - 5);
          const hatchedDisplay = formatNumber(hatchedLabel);
          const nextDisplay = formatNumber(nextTarget);
          eggMessage.innerHTML = `🎉 <span class="font-semibold">Takbir!</span> You cracked the <span class="font-semibold">${hatchedDisplay}-verse</span> egg! Next challenge: <span class="font-semibold">${nextDisplay} verses</span>`;
        } else {
          const remaining = Number(state.remaining ?? Math.max(0, safeTarget - count));
          if (remaining > 0) {
            const remainingLabel = `${formatNumber(remaining)} ${remaining === 1 ? 'more verse' : 'more verses'}`;
            eggMessage.textContent = `${remainingLabel} to hatch the surprise.`;
          } else {
            eggMessage.textContent = 'Keep reading to hatch the surprise.';
          }
        }
      }
      const label = state.progress_label
        ? `${state.progress_label} ${strings.verses}`
        : target
          ? `${formatNumber(count)} / ${formatNumber(target)} ${strings.verses}`
          : `${formatNumber(count)} ${strings.verses}`;
      safeSetText(eggCount, label);

      updateGrowthVisual(growthVisual, {
        completedStages: phase === 'growth' ? completedGrowthStages : 0,
        activeStage: phase === 'growth' ? activeGrowthStage : 0,
        progress: phase === 'growth' ? stageProgress : 0,
        maxStage: maxGrowthStage,
      });

      const celebrationKey = state.completed_at || state.previous_target || state.target || `${count}-${target}`;
      if (state.completed && celebrationKey !== lastEggCelebratedTarget) {
        lastEggCelebratedTarget = celebrationKey;
        const celebrationMessage = phase === 'growth' ? strings.growthCelebration : strings.eggCelebration;
        celebrateEgg(celebrationMessage);
      }
    };

    const resolveNextSurah = () => {
      if (!currentSurah || !Array.isArray(state.surahs) || !state.surahs.length) {
        return null;
      }
      const currentNumber = Number(currentSurah.number || currentSurah.id || 0);
      if (!currentNumber) {
        return null;
      }
      const currentIndex = state.surahs.findIndex(
        (surah) => Number(surah.number) === currentNumber
      );
      if (currentIndex === -1 || currentIndex + 1 >= state.surahs.length) {
        return null;
      }
      return state.surahs[currentIndex + 1] || null;
    };

    const updateNavigationButtons = () => {
      const total = currentSurah
        ? Number(currentSurah.numberOfAyahs || currentSurah.ayahs || currentSurah.totalVerses || 0)
        : 0;
      const hideNav = showFullSurah;
      const atEnd = !hideNav && total && currentVerseId && currentVerseId >= total;
      const nextSurah = atEnd ? resolveNextSurah() : null;
      if (prevBtn) {
        prevBtn.classList.toggle('hidden', hideNav);
        prevBtn.disabled = hideNav || !currentVerseId || currentVerseId <= 1;
      }
      if (nextBtn) {
        const hideNextBtn = hideNav || atEnd;
        nextBtn.classList.toggle('hidden', hideNextBtn);
        nextBtn.disabled = hideNav || !currentVerseId || !total || currentVerseId >= total;
      }
      if (nextSurahBtn) {
        const showNextSurah = Boolean(nextSurah);
        if (!showNextSurah) {
          nextSurahBtn.classList.remove('is-loading');
          if (defaultNextSurahLabel) {
            safeSetText(nextSurahBtn, defaultNextSurahLabel);
          }
        } else if (!nextSurahBtn.classList.contains('is-loading') && defaultNextSurahLabel) {
          safeSetText(nextSurahBtn, defaultNextSurahLabel);
        }
        nextSurahBtn.hidden = !showNextSurah;
        nextSurahBtn.disabled = !showNextSurah;
        if (showNextSurah) {
          const label =
            nextSurah?.englishName ||
            nextSurah?.englishNameTranslation ||
            nextSurah?.name ||
            `Surah ${Number(nextSurah?.number || nextSurah?.id || 0)}`;
          nextSurahBtn.setAttribute('aria-label', `Enter next surah: ${label}`);
          nextSurahBtn.title = `Enter next surah: ${label}`;
        } else {
          nextSurahBtn.removeAttribute('aria-label');
          nextSurahBtn.removeAttribute('title');
        }
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
      announceCelebration('MashaAllah! Daily goal achieved.');
      if (window.AlfawzCelebrations && typeof window.AlfawzCelebrations.celebrate === 'function') {
        const verses = state?.target || defaultDailyTarget;
        window.AlfawzCelebrations.celebrate('daily', {
          message: `You reached your daily goal of ${verses} verses. MashaAllah!`,
          detail: 'Set a fresh intention or revisit your favourite passage.',
          cta: 'Plan tomorrow’s goal',
        });
      }
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
        startVerseTransition();
        const verse = await loadVerse(surahId, verseId);
        currentVerseId = verseId;
        currentVerseData = verse;
        isLoading = false;
        setLoadingState(false);
        if (verseSelect) {
          verseSelect.value = String(verseId);
        }
        const totalVerses = verse.totalVerses || Number(surah.numberOfAyahs || surah.ayahs || 0);
        const displayNumber = getDisplayVerseNumber(verse);
        const verseLabel = getDisplayVerseLabel(verse, strings);
        if (verseId > 1) {
          primeVerse(surahId, verseId - 1, { immediate: true });
        }
        if (totalVerses && verseId < totalVerses) {
          primeVerse(surahId, verseId + 1, { immediate: true });
        }
        safeSetText(heading, verse.surahName || `Surah ${surah.englishName || surah.englishNameTranslation || surah.name || surahId}`);
        const metaParts = [];
        if (totalVerses && displayNumber && displayNumber > 0) {
          metaParts.push(`${strings.ayahLabel} ${displayNumber} / ${totalVerses}`);
        } else if (displayNumber && displayNumber > 0) {
          metaParts.push(`${strings.ayahLabel} ${displayNumber}`);
        } else if (verseLabel) {
          metaParts.push(verseLabel);
        } else {
          metaParts.push(`${strings.ayahLabel} ${verseId}`);
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
          hasTransliteration = Boolean(verse.transliteration);
          applyTransliterationProfileToElement(transliterationEl, verse.transliteration || '');
          syncTransliterationVisibility();
          if (transliterationToggle) {
            setToggleAvailability(transliterationToggle, hasTransliteration);
            setToggleState(transliterationToggle, showTransliteration);
          }
        }
        if (translationEl) {
          hasTranslation = Boolean(verse.translation);
          translationEl.textContent = verse.translation || '';
          syncTranslationVisibility();
          if (translationToggle) {
            setToggleAvailability(translationToggle, hasTranslation);
            setToggleState(translationToggle, showTranslation);
          }
        }
        updateNavigationButtons();
        if (showFullSurah && cachedSurahId === surahId && Array.isArray(cachedSurahVerses)) {
          renderSurahList(cachedSurahVerses, verseId);
        }
        finishVerseTransition();
        try {
          await prepareAudio(surahId, verseId, verse);
        } catch (error) {
          console.warn('[AlfawzQuran] Unable to prepare audio', error);
        }
        syncSurahPlayButtons();
        if (showFullSurah) {
          ensureSurahView(surahId, verseId);
        } else {
          warmSurahCache(surahId, verseId).catch(() => {});
        }
        if (reflectionWidget) {
          void loadReflectionsForVerse(surahId, verseId, verse);
        }
        return verse;
      } catch (error) {
        isLoading = false;
        currentVerseData = null;
        console.warn('[AlfawzQuran] Unable to load verse', error);
        setLoadingState(true, 'Unable to load verse. Please try again.');
        if (audioPanel) {
          resetAudio('Unable to load recitation. Please try another verse.');
        }
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
          dispatchEggState(response.egg);
        }
        maybeCelebrateSurahCompletion(surahId, verseId);
      } catch (error) {
        console.warn('[AlfawzQuran] unable to update progress state', error);
      }
    };

    const handleSurahChange = (event) => {
      const surahId = Number(event.target.value);
      currentSurahId = surahId || null;
      currentSurah = surahId ? getSurahById(surahId) : null;
      currentVerseId = null;
      currentVerseData = null;
      cachedSurahVerses = [];
      cachedSurahId = null;
      if (surahListBody) {
        surahListBody.innerHTML = '';
      }
      if (surahToggle) {
        surahToggle.disabled = !surahId;
        if (!surahId && showFullSurah) {
          showFullSurah = false;
        }
      }
      if (currentSurah) {
        populateVerseSelect(verseSelect, currentSurah);
        verseSelect.dispatchEvent(new CustomEvent('alfawz:ready'));
        verseSelect.disabled = false;
        setLoadingState(true, 'Select a verse to begin reading.');
        if (audioPanel) {
          resetAudio('Select a verse to hear the recitation.', { keepSource: false });
        }
        if (showFullSurah) {
          ensureSurahView(surahId, null);
        }
      } else {
        if (verseSelect) {
          verseSelect.innerHTML = '<option value="">Select a surah first</option>';
          verseSelect.disabled = true;
        }
        setLoadingState(true, 'Select a surah and verse to begin your recitation.');
        if (audioPanel) {
          resetAudio('Select a surah and verse to load the recitation.', { keepSource: false });
        }
      }
      if (reflectionWidget) {
        reflectionState.currentVerseKey = null;
        reflectionState.items = [];
        renderReflectionItems();
        if (currentSurah) {
          setReflectionContext(currentSurah, null, null, surahId);
        } else {
          setReflectionContext(null, null, null);
        }
        if (wpData.isLoggedIn) {
          setReflectionStatus(reflectionStrings.selectVerse);
        } else {
          setReflectionStatus(reflectionStrings.loginRequired);
        }
        clearReflectionForm({ keepMood: true, quiet: true });
        syncReflectionControls();
      }
      updateSurahModeUI();
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

    const handleNextSurah = async () => {
      if (isLoading) {
        return;
      }
      const nextSurah = resolveNextSurah();
      if (!nextSurah || !surahSelect) {
        return;
      }
      const nextSurahId = Number(nextSurah.number || nextSurah.id || 0);
      if (!nextSurahId) {
        return;
      }
      if (nextSurahBtn) {
        nextSurahBtn.disabled = true;
        nextSurahBtn.setAttribute('aria-busy', 'true');
        nextSurahBtn.classList.add('is-loading');
        safeSetText(nextSurahBtn, 'Loading Surah');
      }
      try {
        surahSelect.value = String(nextSurahId);
        handleSurahChange({ target: surahSelect });
        if (verseSelect) {
          verseSelect.value = '1';
        }
        await renderVerse(nextSurahId, 1);
      } finally {
        if (nextSurahBtn) {
          nextSurahBtn.removeAttribute('aria-busy');
          nextSurahBtn.classList.remove('is-loading');
          if (defaultNextSurahLabel) {
            safeSetText(nextSurahBtn, defaultNextSurahLabel);
          }
        }
        updateNavigationButtons();
      }
    };

    const handleSurahToggleChange = async (event) => {
      const nextState =
        typeof event?.target?.checked === 'boolean' ? event.target.checked : !showFullSurah;
      showFullSurah = Boolean(nextState);
      updateSurahModeUI();
      if (showFullSurah && currentSurahId) {
        await ensureSurahView(currentSurahId, currentVerseId || null);
      }
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
    await Promise.all([
      populateSurahSelect(surahSelect),
      gwaniSurahSelect ? populateSurahSelect(gwaniSurahSelect) : Promise.resolve(),
    ]);
    if (gwaniSurahSelect) {
      delete gwaniSurahSelect.dataset.locked;
      gwaniSurahSelect.disabled = false;
      gwaniSurahSelect.value = '';
      handleGwaniSurahChange();
    }
    await fetchInitialStates();
    hydrateFromQuery();

    surahSelect.addEventListener('change', handleSurahChange);
    verseSelect.addEventListener('change', handleVerseChange);
    prevBtn?.addEventListener('click', handlePrev);
    nextBtn?.addEventListener('click', handleNext);
    nextSurahBtn?.addEventListener('click', () => {
      void handleNextSurah();
    });
    if (surahToggle) {
      surahToggle.disabled = true;
      surahToggle.addEventListener('change', handleSurahToggleChange);
    }
    updateToggleHint();
    updateSurahModeUI();
    attachPressFeedback(prevBtn);
    attachPressFeedback(nextBtn);
    attachPressFeedback(nextSurahBtn);
    dailyDismissControls.forEach((control) => {
      control.addEventListener('click', closeDailyModal);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeDailyModal();
      }
    });
    document.addEventListener('alfawz:egg-updated', (event) => {
      if (event?.detail) {
        updateEggWidget(event.detail);
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
        const totalVerses = Number(
          verse.totalVerses || surah.numberOfAyahs || surah.ayahs || surah.totalVerses || 0
        );
        if (currentVerseId > 1) {
          primeVerse(currentSurahId, currentVerseId - 1, { immediate: true });
        }
        if (totalVerses && currentVerseId < totalVerses) {
          primeVerse(currentSurahId, currentVerseId + 1, { immediate: true });
        }
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
    const podium = qs('#alfawz-leaderboard-podium', root);
    const podiumWrapper = root.querySelector('[data-leaderboard-podium-wrapper]');
    const emptyState = qs('#alfawz-leaderboard-empty', root);
    const refreshButton = qs('#alfawz-leaderboard-refresh', root);
    const refreshIcon = refreshButton ? refreshButton.querySelector('[data-refresh-icon]') : null;
    const refreshSpinner = refreshButton ? refreshButton.querySelector('[data-refresh-spinner]') : null;
    const totalEl = qs('#alfawz-leaderboard-total', root);
    const topVersesEl = qs('#alfawz-leaderboard-verses', root);
    const topHasanatEl = qs('#alfawz-leaderboard-hasanat', root);

    if (!tbody) {
      state.refreshLeaderboard = null;
      return;
    }

    const setRefreshState = (loading) => {
      if (!refreshButton) {
        return;
      }
      refreshButton.disabled = Boolean(loading);
      if (loading) {
        refreshButton.setAttribute('aria-busy', 'true');
      } else {
        refreshButton.removeAttribute('aria-busy');
      }
      if (refreshIcon) {
        refreshIcon.classList.toggle('hidden', Boolean(loading));
      }
      if (refreshSpinner) {
        refreshSpinner.classList.toggle('hidden', !loading);
      }
    };

    const initialsFor = (name) => {
      if (!name) {
        return '—';
      }
      const words = String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      if (!words.length) {
        return '—';
      }
      if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
      }
      return `${(words[0][0] || '').toUpperCase()}${(words[1][0] || '').toUpperCase()}`;
    };

    const podiumLabel = (rank) => {
      if (rank === 1) {
        return '1st place';
      }
      if (rank === 2) {
        return '2nd place';
      }
      if (rank === 3) {
        return '3rd place';
      }
      return `${rank}th place`;
    };

    const differenceLabel = (rank, verses, leaderVerses) => {
      const total = Number(verses || 0);
      const leader = Number(leaderVerses || 0);
      if (rank === 1) {
        return 'Leading this week';
      }
      if (leader <= 0) {
        return 'Building momentum';
      }
      const diff = leader - total;
      if (diff <= 0) {
        return 'Tied with the leader';
      }
      return `${formatNumber(diff)} verses behind`;
    };

    const percentOfLeader = (value, leader) => {
      const leaderValue = Number(leader || 0);
      if (!leaderValue) {
        return 0;
      }
      return Math.max(0, Math.min(100, Math.round((Number(value || 0) / leaderValue) * 100)));
    };

    const renderPodiumSkeleton = () => {
      if (!podium) {
        return;
      }
      podium.setAttribute('aria-busy', 'true');
      if (podium.children.length) {
        return;
      }
      podium.dataset.skeleton = 'true';
      podium.innerHTML = '';
      for (let index = 0; index < 3; index += 1) {
        const card = document.createElement('article');
        card.className = 'alfawz-leaderboard-podium-card animate-pulse bg-white/40';
        card.innerHTML = `
          <div class="flex items-center gap-4">
            <div class="h-14 w-14 rounded-full bg-[#fbe4d6]"></div>
            <div class="space-y-3">
              <div class="h-4 w-28 rounded-full bg-[#f3d7c7]"></div>
              <div class="h-3 w-24 rounded-full bg-[#f7ddce]"></div>
            </div>
          </div>
          <div class="mt-6 space-y-3">
            <div class="h-3 w-full rounded-full bg-[#fcefe6]"></div>
            <div class="h-3 w-3/4 rounded-full bg-[#f7ddce]"></div>
          </div>
        `;
        podium.appendChild(card);
      }
    };

    const renderTableSkeleton = () => {
      if (!tbody) {
        return;
      }
      tbody.setAttribute('aria-busy', 'true');
      if (tbody.children.length) {
        return;
      }
      tbody.dataset.skeleton = 'true';
      tbody.innerHTML = '';
      for (let index = 0; index < 6; index += 1) {
        const tr = document.createElement('tr');
        tr.className = 'animate-pulse';
        tr.innerHTML = `
          <td class="px-6 py-4">
            <div class="h-4 w-8 rounded-full bg-[#f3d7c7]"></div>
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center gap-4">
              <div class="h-11 w-11 rounded-full bg-[#fbe4d6]"></div>
              <div class="space-y-3">
                <div class="h-4 w-32 rounded-full bg-[#f7ddce]"></div>
                <div class="h-3 w-24 rounded-full bg-[#fcefe6]"></div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="space-y-3">
              <div class="ml-auto h-4 w-16 rounded-full bg-[#f7ddce]"></div>
              <div class="ml-auto h-2 w-24 rounded-full bg-[#fcefe6]"></div>
            </div>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="ml-auto h-4 w-20 rounded-full bg-[#f3d7c7]"></div>
          </td>
        `;
        tbody.appendChild(tr);
      }
    };

    const renderSkeleton = () => {
      renderPodiumSkeleton();
      renderTableSkeleton();
      toggleHidden(emptyState, false);
    };

    const renderPodium = (entries, leaderVerses) => {
      if (!podium) {
        return;
      }
      podium.innerHTML = '';
      const medals = ['🥇', '🥈', '🥉'];
      entries.forEach((entry, index) => {
        const rank = index + 1;
        const verses = Number(entry?.verses_read || 0);
        const percent = percentOfLeader(verses, leaderVerses || verses);
        const card = document.createElement('article');
        card.className = 'alfawz-leaderboard-podium-card group';
        card.dataset.rank = String(rank);
        card.setAttribute('data-animate', 'rise');
        card.style.animationDelay = `${index * 90}ms`;
        card.innerHTML = `
          <div class="alfawz-leaderboard-medal" aria-hidden="true">${medals[index] || '🏅'}</div>
          <div class="flex flex-col gap-6">
            <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-4">
                <div class="relative h-16 w-16 overflow-hidden rounded-full bg-white/80 shadow-xl shadow-[#741f31]/10">
                  <span class="absolute inset-0 flex items-center justify-center text-xl font-semibold text-[#741f31]">${initialsFor(entry?.display_name)}</span>
                  <span class="absolute inset-0 rounded-full border border-white/70"></span>
                </div>
                <div class="space-y-1">
                  <h3 class="text-2xl font-semibold text-[#2f0811]">${entry?.display_name || '—'}</h3>
                  <p class="text-sm text-[#741f31]/70">${differenceLabel(rank, verses, leaderVerses)}</p>
                </div>
              </div>
              <span class="inline-flex items-center justify-center rounded-full bg-white/60 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#741f31]/80 shadow-sm shadow-white/40 backdrop-blur-sm">${podiumLabel(rank)}</span>
            </header>
            <dl class="grid gap-3 text-sm text-[#4b0d18]/80 sm:grid-cols-2">
              <div class="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-inner shadow-white/40 backdrop-blur">
                <dt class="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#741f31]/60">Verses</dt>
                <dd class="mt-2 text-2xl font-bold text-[#2f0811]">${formatNumber(verses)}</dd>
              </div>
              <div class="rounded-2xl border border-white/40 bg-white/50 p-4 shadow-inner shadow-white/30 backdrop-blur">
                <dt class="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#741f31]/60">Hasanat</dt>
                <dd class="mt-2 text-2xl font-bold text-[#a83254]">${formatNumber(entry?.total_hasanat || 0)}</dd>
              </div>
            </dl>
            <footer class="flex flex-col gap-3">
              <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-[#a83254]/70">
                <span>Progress</span>
                <span>${percent}%</span>
              </div>
              <div class="alfawz-leaderboard-progress" style="--alfawz-progress:${percent}%">
                <span class="sr-only">${percent}% of leader</span>
              </div>
              <p class="text-xs font-medium uppercase tracking-[0.3em] text-[#a83254]/70">${percent}% of leader</p>
            </footer>
          </div>
        `;
        podium.appendChild(card);
      });
      podium.removeAttribute('aria-busy');
      delete podium.dataset.skeleton;
    };

    const renderRows = (entries, leaderVerses, offset = 0) => {
      tbody.innerHTML = '';
      entries.forEach((entry, index) => {
        const rank = offset + index + 1;
        const verses = Number(entry?.verses_read || 0);
        const percent = percentOfLeader(verses, leaderVerses || verses);
        const tr = document.createElement('tr');
        tr.className = 'transition-all duration-300 hover:bg-[#fff4e6]/70 focus-within:bg-[#fff4e6]/80';
        tr.dataset.rank = String(rank);
        tr.setAttribute('data-animate', 'rise');
        tr.style.animationDelay = `${index * 45}ms`;
        tr.innerHTML = `
          <td class="px-6 py-4 text-base font-semibold text-[#741f31]">${rank}</td>
          <td class="px-6 py-4">
            <div class="flex items-center gap-4">
              <span class="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#fbe4d6] text-base font-semibold text-[#741f31] shadow-inner">${initialsFor(entry?.display_name)}</span>
              <div class="space-y-1">
                <p class="font-semibold text-[#2f0811]">${entry?.display_name || '—'}</p>
                <p class="text-xs text-[#a83254]/70">${differenceLabel(rank, verses, leaderVerses)}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="space-y-2">
              <p class="text-sm font-semibold text-[#4b0d18]">${formatNumber(verses)}</p>
              <div class="alfawz-leaderboard-progress" style="--alfawz-progress:${percent}%">
                <span class="sr-only">${percent}% of leader</span>
              </div>
              <p class="text-xs font-medium uppercase tracking-[0.3em] text-[#a83254]/60">${percent}% of leader</p>
            </div>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="inline-flex items-center justify-end gap-2 rounded-full bg-gradient-to-r from-[#5b0a1b] via-[#87203a] to-[#f8e8da] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[#5b0a1b]/35 ring-1 ring-white/40">
              <span class="inline-flex h-2.5 w-2.5 rounded-full bg-white/80 animate-pulse"></span>
              <span class="tracking-wide drop-shadow-sm">${formatNumber(entry?.total_hasanat || 0)}</span>
              <span class="text-xs font-semibold uppercase text-white/80">Hasanat</span>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
      tbody.removeAttribute('aria-busy');
      delete tbody.dataset.skeleton;
    };

    const updateSummaries = (entries, leaderVerses, leaderHasanat) => {
      setText(totalEl, formatNumber(entries.length || 0));
      setText(topVersesEl, formatNumber(leaderVerses || 0));
      setText(topHasanatEl, formatNumber(leaderHasanat || 0));
    };

    const loadLeaderboard = async () => {
      if (state.leaderboardLoading) {
        return state.leaderboardLoading;
      }

      renderSkeleton();
      setRefreshState(true);

      const request = (async () => {
        try {
          const leaderboard = await apiRequest('leaderboard');
          const entries = Array.isArray(leaderboard) ? leaderboard : [];
          const leaderVerses = entries.reduce((max, item) => {
            const verses = Number(item?.verses_read || 0);
            return verses > max ? verses : max;
          }, 0);
          const topEntries = entries.slice(0, 3);
          const leaderHasanat = topEntries.length ? Number(topEntries[0]?.total_hasanat || 0) : 0;

          if (topEntries.length) {
            renderPodium(topEntries, leaderVerses || Number(topEntries[0]?.verses_read || 0));
          } else if (podium) {
            podium.innerHTML = '';
            podium.removeAttribute('aria-busy');
            delete podium.dataset.skeleton;
          }

          if (entries.length) {
            renderRows(entries, leaderVerses || Number(topEntries[0]?.verses_read || 0), 0);
          } else {
            tbody.innerHTML = '';
            tbody.removeAttribute('aria-busy');
            delete tbody.dataset.skeleton;
          }

          toggleHidden(emptyState, entries.length === 0);
          if (podiumWrapper) {
            toggleHidden(podiumWrapper, topEntries.length > 0);
          }

          updateSummaries(entries, leaderVerses || Number(topEntries[0]?.verses_read || 0), leaderHasanat);

          if (updated) {
            updated.textContent = entries.length
              ? `Updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
              : 'Waiting for first entries';
          }
        } catch (error) {
          console.warn('[AlfawzQuran] Unable to load leaderboard', error);
          if (updated) {
            updated.textContent = 'Unable to refresh leaderboard';
          }
          if (tbody && tbody.dataset.skeleton) {
            tbody.innerHTML = '';
            delete tbody.dataset.skeleton;
          }
          if (podium && podium.dataset.skeleton) {
            podium.innerHTML = '';
            delete podium.dataset.skeleton;
          }
        } finally {
          setRefreshState(false);
          tbody.removeAttribute('aria-busy');
          podium?.removeAttribute('aria-busy');
          state.leaderboardLoading = null;
        }
      })();

      state.leaderboardLoading = request;
      return request;
    };

    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        loadLeaderboard();
      });
    }

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

    const avatarPreview = qs('#alfawz-profile-avatar-preview', root);
    const avatarButton = qs('#alfawz-profile-avatar-button', root);
    const avatarStatus = qs('#alfawz-profile-avatar-status', root);
    const avatarModal = qs('#alfawz-profile-avatar-modal', root);
    const avatarOverlay = avatarModal?.querySelector('[data-avatar-overlay]');
    const avatarDialog = avatarModal?.querySelector('[data-avatar-dialog]');
    const avatarOptions = Array.from(avatarModal?.querySelectorAll('[data-avatar-option]') || []);
    const avatarSaveBtn = avatarModal?.querySelector('[data-avatar-save]');
    const avatarCancelButtons = Array.from(avatarModal?.querySelectorAll('[data-avatar-cancel]') || []);
    const avatarMessage = avatarModal?.querySelector('[data-avatar-message]');
    const avatarMap = wpData.avatars || {};
    const initialAvatarGender = (avatarPreview?.dataset.avatarGender || '').toLowerCase();
    let avatarState = { current: initialAvatarGender, pending: initialAvatarGender };
    let avatarStatusTimeout = null;

    const hideAvatarStatus = () => {
      if (avatarStatusTimeout) {
        clearTimeout(avatarStatusTimeout);
        avatarStatusTimeout = null;
      }
      if (!avatarStatus) {
        return;
      }
      avatarStatus.textContent = '';
      avatarStatus.classList.add('hidden');
      avatarStatus.classList.remove('text-emerald-200', 'text-rose-200');
    };

    const showAvatarStatus = (message, status = 'success') => {
      if (!avatarStatus) {
        return;
      }
      if (avatarStatusTimeout) {
        clearTimeout(avatarStatusTimeout);
        avatarStatusTimeout = null;
      }
      if (!message) {
        hideAvatarStatus();
        return;
      }
      avatarStatus.textContent = message;
      avatarStatus.classList.remove('hidden');
      avatarStatus.classList.remove('text-emerald-200', 'text-rose-200');
      avatarStatus.classList.add(status === 'error' ? 'text-rose-200' : 'text-emerald-200');
      const timeoutDuration = status === 'error' ? 5200 : 3600;
      avatarStatusTimeout = setTimeout(() => {
        hideAvatarStatus();
      }, timeoutDuration);
    };

    const resetAvatarInlineMessage = () => {
      if (!avatarMessage) {
        return;
      }
      avatarMessage.textContent = '';
      avatarMessage.classList.add('hidden');
      avatarMessage.classList.remove('text-red-600', 'text-emerald-600');
    };

    const updateAvatarOptionState = (value) => {
      avatarOptions.forEach((option) => {
        const { avatarOption } = option.dataset || {};
        option.setAttribute('aria-pressed', avatarOption === value ? 'true' : 'false');
      });
    };

    const applyAvatarSelection = (payload = {}) => {
      const fallbackGender = (avatarPreview?.dataset.avatarGender || '').toLowerCase();
      const gender = String(
        payload.gender || payload.avatar_gender || avatarState.current || fallbackGender || ''
      ).toLowerCase();
      const mappedUrl = gender && avatarMap ? avatarMap[gender] : '';
      const responseUrl = payload.url || payload.avatar_url;
      const nextUrl =
        responseUrl ||
        mappedUrl ||
        avatarPreview?.dataset.activeAvatar ||
        avatarPreview?.dataset.defaultAvatar ||
        avatarPreview?.src;

      avatarState = {
        current: gender,
        pending: gender,
      };

      if (avatarPreview) {
        if (nextUrl) {
          avatarPreview.src = nextUrl;
          avatarPreview.dataset.activeAvatar = nextUrl;
        } else if (avatarPreview.dataset.defaultAvatar) {
          avatarPreview.src = avatarPreview.dataset.defaultAvatar;
          avatarPreview.dataset.activeAvatar = avatarPreview.dataset.defaultAvatar;
        }
        avatarPreview.dataset.avatarGender = gender || '';
        const altText = payload.alt || payload.avatar_alt || avatarPreview.dataset.defaultAlt || avatarPreview.alt;
        if (altText) {
          avatarPreview.alt = altText;
        }
      }

      updateAvatarOptionState(gender);
      resetAvatarInlineMessage();
    };

    const closeAvatarModal = () => {
      if (!avatarModal) {
        return;
      }
      avatarModal.classList.add('hidden');
      avatarModal.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', handleAvatarKeydown);
      resetAvatarInlineMessage();
    };

    const handleAvatarKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAvatarModal();
      }
    };

    const openAvatarModal = () => {
      if (!avatarModal) {
        return;
      }
      resetAvatarInlineMessage();
      avatarModal.classList.remove('hidden');
      avatarModal.setAttribute('aria-hidden', 'false');
      avatarState.pending = avatarState.current;
      updateAvatarOptionState(avatarState.pending);
      const focusTarget =
        avatarOptions.find((option) => option.dataset.avatarOption === avatarState.pending) || avatarOptions[0];
      requestAnimationFrame(() => {
        focusTarget?.focus();
      });
      document.addEventListener('keydown', handleAvatarKeydown);
    };

    const saveAvatarSelection = async () => {
      if (!avatarModal) {
        return;
      }

      const selected = avatarState.pending;
      if (!selected) {
        if (avatarMessage) {
          avatarMessage.textContent = wpData.strings?.avatarMissing || 'Please choose a silhouette before saving.';
          avatarMessage.classList.remove('hidden');
          avatarMessage.classList.remove('text-emerald-600');
          avatarMessage.classList.add('text-red-600');
        } else {
          showAvatarStatus(wpData.strings?.avatarMissing || 'Please choose a silhouette before saving.', 'error');
        }
        return;
      }

      hideAvatarStatus();
      const originalLabel = avatarSaveBtn?.textContent;
      if (avatarSaveBtn) {
        avatarSaveBtn.disabled = true;
        avatarSaveBtn.textContent = wpData.strings?.saving || 'Saving…';
      }

      try {
        const response = await apiRequest('user-profile', {
          method: 'POST',
          body: { avatar_gender: selected },
        });
        const avatarPayload = response?.avatar || {
          gender: response?.avatar_gender,
          url: response?.avatar_url,
        };
        applyAvatarSelection(avatarPayload);
        closeAvatarModal();
        showAvatarStatus(wpData.strings?.avatarSaved || 'Profile photo updated!', 'success');
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to update avatar', error);
        if (avatarMessage) {
          avatarMessage.textContent = wpData.strings?.avatarError || 'Unable to update profile photo. Please try again.';
          avatarMessage.classList.remove('hidden');
          avatarMessage.classList.remove('text-emerald-600');
          avatarMessage.classList.add('text-red-600');
        }
        showAvatarStatus(
          wpData.strings?.avatarError || 'Unable to update profile photo. Please try again.',
          'error'
        );
      } finally {
        if (avatarSaveBtn) {
          avatarSaveBtn.disabled = false;
          if (originalLabel) {
            avatarSaveBtn.textContent = originalLabel;
          }
        }
      }
    };

    avatarOptions.forEach((option) => {
      option.addEventListener('click', () => {
        const { avatarOption } = option.dataset || {};
        if (!avatarOption) {
          return;
        }
        avatarState.pending = avatarOption;
        updateAvatarOptionState(avatarOption);
        resetAvatarInlineMessage();
      });
    });

    avatarButton?.addEventListener('click', () => {
      openAvatarModal();
    });

    avatarSaveBtn?.addEventListener('click', () => {
      saveAvatarSelection();
    });

    avatarCancelButtons.forEach((button) => {
      button.addEventListener('click', () => {
        closeAvatarModal();
      });
    });

    avatarOverlay?.addEventListener('click', () => {
      closeAvatarModal();
    });

    avatarDialog?.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    avatarModal?.addEventListener('click', (event) => {
      if (event.target === avatarModal) {
        closeAvatarModal();
      }
    });

    applyAvatarSelection({});

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
        panel.className = 'alfawz-timeline-card';

        const titleEl = document.createElement('p');
        titleEl.className = 'alfawz-timeline-title';
        titleEl.textContent = title;
        panel.appendChild(titleEl);

        if (subtitle) {
          const subtitleEl = document.createElement('p');
          subtitleEl.className = 'alfawz-timeline-subtitle';
          subtitleEl.textContent = subtitle;
          panel.appendChild(subtitleEl);
        }

        if (detail) {
          const detailEl = document.createElement('p');
          detailEl.className = 'alfawz-timeline-detail';
          detailEl.textContent = detail;
          panel.appendChild(detailEl);
        }

        if (progress) {
          const progressTrack = document.createElement('div');
          progressTrack.className = 'alfawz-timeline-progress';
          const progressFill = document.createElement('div');
          progressFill.className = 'alfawz-timeline-progress-fill';
          if (progress.accentClass) {
            progress.accentClass
              .split(' ')
              .filter(Boolean)
              .forEach((cls) => progressFill.classList.add(cls));
          } else {
            progressFill.classList.add('alfawz-progress-accent');
          }
          progressFill.style.width = `${Math.max(0, Math.min(100, progress.value || 0))}%`;
          progressTrack.appendChild(progressFill);
          panel.appendChild(progressTrack);

          if (progress.label) {
            const progressLabel = document.createElement('p');
            progressLabel.className = 'alfawz-timeline-progress-label';
            progressLabel.textContent = progress.label;
            panel.appendChild(progressLabel);
          }
        }

        if (accent) {
          const accentEl = document.createElement('p');
          accentEl.className = 'alfawz-timeline-accent';
          accentEl.textContent = accent;
          panel.appendChild(accentEl);
        }

        item.appendChild(panel);
        return item;
      };

        if (list.length === 0) {
          const encouragement = document.createElement('div');
          encouragement.className = 'alfawz-timeline-card text-base font-semibold text-[#741f31]';
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
          awaiting.className = 'alfawz-timeline-card text-base font-semibold text-[#741f31]';
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
        applyAvatarSelection({ gender: stats.avatar_gender, url: stats.avatar_url });
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
    const avatarPreview = qs('#alfawz-settings-avatar-preview', profileForm?.parentElement);
    const avatarButton = qs('#alfawz-settings-avatar-button', profileForm);
    const avatarChoiceInput = qs('#alfawz-avatar-choice', profileForm);
    const avatarModal = qs('#alfawz-avatar-modal', root);
    const avatarOverlay = avatarModal?.querySelector('[data-avatar-overlay]');
    const avatarDialog = avatarModal?.querySelector('[data-avatar-dialog]');
    const avatarOptions = Array.from(avatarModal?.querySelectorAll('[data-avatar-option]') || []);
    const avatarSaveBtn = avatarModal?.querySelector('[data-avatar-save]');
    const avatarCancelButtons = Array.from(avatarModal?.querySelectorAll('[data-avatar-cancel]') || []);
    const avatarMessage = avatarModal?.querySelector('[data-avatar-message]');

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

    const avatarMap = wpData.avatars || {};
    let avatarState = {
      current: (avatarChoiceInput?.value || '').toLowerCase(),
      pending: (avatarChoiceInput?.value || '').toLowerCase(),
    };

    const resetAvatarMessage = () => {
      if (!avatarMessage) {
        return;
      }
      avatarMessage.textContent = '';
      avatarMessage.classList.add('hidden');
      avatarMessage.classList.remove('text-red-600', 'text-emerald-600');
    };

    const updateAvatarOptionState = (value) => {
      avatarOptions.forEach((option) => {
        const { avatarOption } = option.dataset || {};
        option.setAttribute('aria-pressed', avatarOption === value ? 'true' : 'false');
      });
    };

    const applyAvatarSelection = (payload = {}) => {
      const gender = String(payload.gender || payload.avatar_gender || avatarState.current || '').toLowerCase();
      const mappedUrl = gender && avatarMap ? avatarMap[gender] : '';
      const responseUrl = payload.url || payload.avatar_url;
      const nextUrl = responseUrl || mappedUrl || avatarPreview?.dataset.activeAvatar || avatarPreview?.dataset.defaultAvatar || avatarPreview?.src;

      avatarState = {
        current: gender,
        pending: gender,
      };

      if (avatarChoiceInput) {
        avatarChoiceInput.value = gender || '';
      }

      if (avatarPreview) {
        if (nextUrl) {
          avatarPreview.src = nextUrl;
          avatarPreview.dataset.activeAvatar = nextUrl;
        } else if (avatarPreview.dataset.defaultAvatar) {
          avatarPreview.src = avatarPreview.dataset.defaultAvatar;
        }
      }

      updateAvatarOptionState(gender);
      resetAvatarMessage();
    };

    const closeAvatarModal = () => {
      if (!avatarModal) {
        return;
      }
      avatarModal.classList.add('hidden');
      avatarModal.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', handleAvatarKeydown);
    };

    const handleAvatarKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAvatarModal();
      }
    };

    const openAvatarModal = () => {
      if (!avatarModal) {
        return;
      }
      resetAvatarMessage();
      avatarModal.classList.remove('hidden');
      avatarModal.setAttribute('aria-hidden', 'false');
      avatarState.pending = avatarState.current;
      updateAvatarOptionState(avatarState.pending);
      const focusTarget = avatarOptions.find((option) => option.dataset.avatarOption === avatarState.pending) || avatarOptions[0];
      requestAnimationFrame(() => {
        focusTarget?.focus();
      });
      document.addEventListener('keydown', handleAvatarKeydown);
    };

    const saveAvatarSelection = async () => {
      if (!avatarModal) {
        return;
      }

      const selected = avatarState.pending;
      if (!selected) {
        if (avatarMessage) {
          avatarMessage.textContent = wpData.strings?.avatarMissing || 'Please choose a silhouette before saving.';
          avatarMessage.classList.remove('hidden');
          avatarMessage.classList.remove('text-emerald-600');
          avatarMessage.classList.add('text-red-600');
        } else {
          showMessage(profileMessage, wpData.strings?.avatarMissing || 'Please choose a silhouette before saving.', 'error');
        }
        return;
      }

      const originalLabel = avatarSaveBtn?.textContent;
      if (avatarSaveBtn) {
        avatarSaveBtn.disabled = true;
        avatarSaveBtn.textContent = wpData.strings?.saving || 'Saving…';
      }

      try {
        const response = await apiRequest('user-profile', {
          method: 'POST',
          body: { avatar_gender: selected },
        });
        const avatarPayload = response?.avatar || {
          gender: response?.avatar_gender,
          url: response?.avatar_url,
        };
        applyAvatarSelection(avatarPayload);
        showMessage(profileMessage, wpData.strings?.avatarSaved || 'Profile photo updated!', 'success');
        closeAvatarModal();
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to update avatar', error);
        if (avatarMessage) {
          avatarMessage.textContent = wpData.strings?.avatarError || 'Unable to update profile photo. Please try again.';
          avatarMessage.classList.remove('hidden');
          avatarMessage.classList.remove('text-emerald-600');
          avatarMessage.classList.add('text-red-600');
        } else {
          showMessage(profileMessage, wpData.strings?.avatarError || 'Unable to update profile photo. Please try again.', 'error');
        }
      } finally {
        if (avatarSaveBtn) {
          avatarSaveBtn.disabled = false;
          if (originalLabel) {
            avatarSaveBtn.textContent = originalLabel;
          }
        }
      }
    };

    avatarOptions.forEach((option) => {
      option.addEventListener('click', () => {
        const { avatarOption } = option.dataset || {};
        if (!avatarOption) {
          return;
        }
        avatarState.pending = avatarOption;
        updateAvatarOptionState(avatarOption);
        resetAvatarMessage();
      });
    });

    avatarButton?.addEventListener('click', () => {
      openAvatarModal();
    });

    avatarSaveBtn?.addEventListener('click', () => {
      saveAvatarSelection();
    });

    avatarCancelButtons.forEach((button) => {
      button.addEventListener('click', () => {
        closeAvatarModal();
      });
    });

    avatarOverlay?.addEventListener('click', () => {
      closeAvatarModal();
    });

    avatarDialog?.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    avatarModal?.addEventListener('click', (event) => {
      if (event.target === avatarModal) {
        closeAvatarModal();
      }
    });

    applyAvatarSelection({});

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
      contrast_mode: 'default',
      dyslexia_font: false,
      senior_mode: false,
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

    window.addEventListener('alfawz:accessibilityChange', (event) => {
      const detail = event?.detail || {};
      if (detail.textSize && detail.textSize !== preferenceState.text_size) {
        preferenceState.text_size = detail.textSize;
        setActiveTextSize(detail.textSize);
      }
      if (typeof detail.contrast !== 'undefined') {
        preferenceState.contrast_mode = detail.contrast;
      }
      if (typeof detail.dyslexia !== 'undefined') {
        preferenceState.dyslexia_font = Boolean(detail.dyslexia);
      }
      if (typeof detail.seniorMode !== 'undefined') {
        preferenceState.senior_mode = Boolean(detail.seniorMode);
      }
    });

    const loadProfile = async () => {
      try {
        const profile = await apiRequest('user-profile');
        if (profile?.display_name && fullNameField) {
          fullNameField.value = profile.display_name;
        }
        if (profile?.email && emailField) {
          emailField.value = profile.email;
        }
        if (profile) {
          const avatarPayload = profile.avatar || {
            gender: profile.avatar_gender,
            url: profile.avatar_url,
          };
          applyAvatarSelection(avatarPayload);
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
        if (response) {
          const avatarPayload = response.avatar || {
            gender: response.avatar_gender,
            url: response.avatar_url,
          };
          applyAvatarSelection(avatarPayload);
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

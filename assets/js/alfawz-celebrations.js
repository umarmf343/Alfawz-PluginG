(() => {
  const doc = document;
  if (!doc || typeof window === 'undefined') {
    return;
  }

  const TYPE_CLASSES = [
    'is-general',
    'is-surah',
    'is-daily',
    'is-time',
    'is-hasanat',
    'is-memorization-verse',
    'is-memorization-plan',
  ];

  const STORAGE_KEYS = {
    hasanat: 'alfawzCelebrationHasanat',
  };

  const DEFAULT_DURATION = 6500;

  const DEFAULT_PRESETS = {
    general: {
      icon: '🎉',
      title: 'Celebration unlocked',
      message: 'Keep up the blessed momentum.',
      cta: 'Keep going',
      palette: ['#fb7185', '#f97316', '#22d3ee'],
    },
    surah: {
      icon: '🌙',
      title: 'Takbir! Surah complete',
      message: 'You completed this surah. May the Qur’an illuminate your path.',
      cta: 'Review the next ayah',
      palette: ['#f59e0b', '#f97316', '#22c55e'],
    },
    daily: {
      icon: '🌞',
      title: 'Daily goal achieved',
      message: 'Today’s recitation target is complete. MashaAllah!',
      cta: 'Set a new intention',
      palette: ['#fbbf24', '#f97316', '#38bdf8'],
    },
    time: {
      icon: '🕌',
      title: 'Blessed routine complete',
      message: 'Your timed recitation is logged. May it be a light for you.',
      cta: 'Continue your journey',
      palette: ['#6366f1', '#a855f7', '#ec4899'],
    },
    hasanat: {
      icon: '💫',
      title: '100 hasanat gathered',
      message: 'A hundred hasanat today—may it weigh heavy on your scales.',
      cta: 'Strive for more khayr',
      palette: ['#22c55e', '#10b981', '#fde047'],
    },
    'memorization-verse': {
      icon: '🧠',
      title: 'Verse memorised',
      message: 'Twenty focused repetitions complete. Lock it into your heart.',
      cta: 'Mark as memorised',
      palette: ['#f97316', '#fb7185', '#60a5fa'],
    },
    'memorization-plan': {
      icon: '📘',
      title: 'Plan complete',
      message: 'You finished every verse in this plan. Allahumma barik!',
      cta: 'Review another plan',
      palette: ['#22c55e', '#14b8a6', '#a855f7'],
    },
  };

  const supportsMotion = () => {
    try {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (error) {
      return true;
    }
  };

  let overlay = null;
  let overlayCard = null;
  let overlayIcon = null;
  let overlayTitle = null;
  let overlayMessage = null;
  let overlayDetail = null;
  let overlayButton = null;
  let overlayConfetti = null;
  let hideTimer = 0;
  let lastFocus = null;

  const ensureOverlay = () => {
    if (overlay) {
      return overlay;
    }

    overlay = doc.createElement('div');
    overlay.id = 'alfawz-celebration-splash';
    overlay.className = 'alfawz-celebration-splash hidden';
    overlay.innerHTML = `
      <div class="alfawz-celebration-splash__backdrop" data-celebration-dismiss aria-hidden="true"></div>
      <div class="alfawz-celebration-splash__card" role="alertdialog" aria-live="assertive" aria-modal="false">
        <div class="alfawz-celebration-splash__icon" aria-hidden="true"></div>
        <div class="alfawz-celebration-splash__copy">
          <p class="alfawz-celebration-splash__eyebrow" id="alfawz-celebration-label">MashaAllah!</p>
          <h3 class="alfawz-celebration-splash__title"></h3>
          <p class="alfawz-celebration-splash__message"></p>
          <p class="alfawz-celebration-splash__detail"></p>
        </div>
        <button type="button" class="alfawz-celebration-splash__button" data-celebration-dismiss></button>
        <div class="alfawz-celebration-splash__confetti" aria-hidden="true"></div>
      </div>
    `;

    overlayCard = overlay.querySelector('.alfawz-celebration-splash__card');
    overlayIcon = overlay.querySelector('.alfawz-celebration-splash__icon');
    overlayTitle = overlay.querySelector('.alfawz-celebration-splash__title');
    overlayMessage = overlay.querySelector('.alfawz-celebration-splash__message');
    overlayDetail = overlay.querySelector('.alfawz-celebration-splash__detail');
    overlayButton = overlay.querySelector('.alfawz-celebration-splash__button');
    overlayConfetti = overlay.querySelector('.alfawz-celebration-splash__confetti');

    overlay.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      if (event.target.hasAttribute('data-celebration-dismiss')) {
        hideOverlay();
      }
    });

    doc.addEventListener('keydown', (event) => {
      if (!overlay || overlay.classList.contains('hidden')) {
        return;
      }
      if (event.key === 'Escape') {
        hideOverlay();
      }
    });

    doc.body.appendChild(overlay);
    return overlay;
  };

  const clearTypeClasses = () => {
    if (!overlay) {
      return;
    }
    TYPE_CLASSES.forEach((name) => overlay.classList.remove(name));
  };

  const focusButton = () => {
    if (!overlayButton) {
      return;
    }
    try {
      overlayButton.focus({ preventScroll: true });
    } catch (error) {
      overlayButton.focus();
    }
  };

  const hideOverlay = () => {
    if (!overlay) {
      return;
    }
    if (hideTimer) {
      window.clearTimeout(hideTimer);
      hideTimer = 0;
    }
    overlay.classList.remove('is-visible');
    overlay.classList.add('is-leaving');
    window.setTimeout(() => {
      overlay?.classList.add('hidden');
      overlay?.classList.remove('is-leaving');
      if (lastFocus && typeof lastFocus.focus === 'function') {
        try {
          lastFocus.focus({ preventScroll: true });
        } catch (error) {
          lastFocus.focus();
        }
      }
      lastFocus = null;
    }, 220);
  };

  const spawnConfetti = (host, count = 28, palette) => {
    if (!host || !supportsMotion()) {
      return;
    }
    const total = typeof count === 'number' && count > 0 ? count : 24;
    const colors = Array.isArray(palette) && palette.length ? palette : null;
    for (let index = 0; index < total; index += 1) {
      const piece = doc.createElement('span');
      piece.className = 'alfawz-confetti-piece';
      piece.style.setProperty('--alfawz-confetti-x', `${Math.random() * 100}%`);
      piece.style.setProperty('--alfawz-confetti-delay', `${Math.random() * 180}ms`);
      piece.style.setProperty('--alfawz-confetti-duration', `${1200 + Math.random() * 700}ms`);
      if (colors) {
        const first = colors[Math.floor(Math.random() * colors.length)];
        const second = colors[Math.floor(Math.random() * colors.length)];
        piece.style.background = `linear-gradient(135deg, ${first}, ${second})`;
      }
      host.appendChild(piece);
      window.setTimeout(() => piece.remove(), 2200);
    }
  };

  const showOverlay = ({
    type = 'general',
    icon,
    title,
    message,
    detail,
    cta,
    palette,
    duration = DEFAULT_DURATION,
  } = {}) => {
    ensureOverlay();
    if (!overlay || !overlayCard) {
      return;
    }

    lastFocus = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
    clearTypeClasses();

    const preset = DEFAULT_PRESETS[type] || DEFAULT_PRESETS.general;
    const resolvedIcon = icon || preset.icon;
    const resolvedTitle = title || preset.title;
    const resolvedMessage = message || preset.message;
    const resolvedDetail = detail || '';
    const resolvedCta = cta || preset.cta || 'Keep going';
    const resolvedPalette = palette || preset.palette;

    overlayIcon.textContent = resolvedIcon || '';
    overlayTitle.textContent = resolvedTitle || '';
    overlayMessage.textContent = resolvedMessage || '';
    overlayDetail.textContent = resolvedDetail || '';
    overlayDetail.classList.toggle('hidden', !resolvedDetail);
    overlayButton.textContent = resolvedCta || 'Keep going';

    overlay.classList.remove('hidden');
    overlay.classList.add('is-visible');
    overlay.classList.add(`is-${type}`);

    overlayCard.setAttribute('aria-labelledby', 'alfawz-celebration-label');

    if (overlayConfetti) {
      spawnConfetti(overlayConfetti, 36, resolvedPalette);
    }

    focusButton();

    if (hideTimer) {
      window.clearTimeout(hideTimer);
    }

    if (typeof duration === 'number' && duration > 0) {
      hideTimer = window.setTimeout(() => {
        hideOverlay();
      }, duration);
    }
  };

  const celebrate = (type, overrides = {}) => {
    const payload = typeof type === 'object' ? type : { ...overrides, type };
    const normalizedType = typeof payload.type === 'string' ? payload.type : 'general';
    showOverlay({ ...payload, type: normalizedType });
  };

  const readStorage = (key) => {
    if (!window.localStorage) {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  };

  const writeStorage = (key, value) => {
    if (!window.localStorage) {
      return;
    }
    try {
      if (value === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      // Ignore storage errors.
    }
  };

  const getLocalDateKey = () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return null;
    }
  };

  const trackDailyHasanat = (amount = 0) => {
    const numeric = Number(amount || 0);
    if (!(numeric > 0)) {
      return;
    }
    const dateKey = getLocalDateKey();
    if (!dateKey) {
      return;
    }
    const snapshot = readStorage(STORAGE_KEYS.hasanat) || {};
    if (snapshot.date !== dateKey) {
      snapshot.date = dateKey;
      snapshot.total = 0;
      snapshot.celebrated = false;
    }
    snapshot.total = Number(snapshot.total || 0) + numeric;
    if (!snapshot.celebrated && snapshot.total >= 100) {
      celebrate('hasanat', {
        message: 'You have reached 100 hasanat today. May Allah multiply your rewards.',
        detail: 'Aim for another hundred before the day ends.',
        cta: 'Record another recitation',
      });
      snapshot.celebrated = true;
    }
    writeStorage(STORAGE_KEYS.hasanat, snapshot);
  };

  const handleHasanatEvent = (event) => {
    if (!event || !event.detail) {
      return;
    }
    const detail = event.detail;
    if (detail.alreadyCounted) {
      return;
    }
    trackDailyHasanat(detail.amount || detail.hasanat || 0);
  };

  doc.addEventListener('alfawz:hasanat-updated', handleHasanatEvent, { passive: true });
  doc.addEventListener('alfawz:celebrate', (event) => {
    if (!event || !event.detail) {
      return;
    }
    celebrate(event.detail.type || 'general', event.detail);
  });

  window.AlfawzCelebrations = {
    show: showOverlay,
    celebrate,
    hide: hideOverlay,
    spawnConfetti,
    trackDailyHasanat,
  };
})();

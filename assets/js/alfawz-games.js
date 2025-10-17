(() => {
  const wpData = window.alfawzData || {};
  const API_BASE = (wpData.apiUrl || '/wp-json/alfawzquran/v1/').replace(/\/+$/, '/');
  const headers = {};
  if (wpData.nonce) {
    headers['X-WP-Nonce'] = wpData.nonce;
  }

  const strings = {
    loadError: wpData.strings?.gamePanelLoadError || 'We could not load your quest data. Please refresh to try again.',
    completed: wpData.strings?.gamePanelCompletedLabel || 'Completed',
    verses: wpData.strings?.gamePanelVersesLabel || 'Verses',
    eggComplete: wpData.strings?.gamePanelEggComplete || 'Takbir! The egg is hatching—keep soaring!',
    eggInProgress: wpData.strings?.gamePanelEggInProgress || 'Recite to fill the egg with radiant knowledge.',
    rewardAwaiting: wpData.strings?.gamePanelRewardAwaiting || 'Divine Reward Awaiting',
    levelLabel: wpData.strings?.gamePanelLevelLabel || 'Level',
    badgeSingular: wpData.strings?.gamePanelBadgeSingular || 'badge unlocked',
    badgePlural: wpData.strings?.gamePanelBadgePlural || 'badges unlocked',
    locked: wpData.strings?.gamePanelLockedLabel || 'Locked',
    playNow: wpData.strings?.gamePanelPlayNow || 'Play Now',
    keepGoing: wpData.strings?.gamePanelKeepGoing || 'Keep Going',
    puzzleIdle: wpData.strings?.puzzleIdle || 'Tap “Play Game” to begin your ayah puzzle quest.',
    puzzleActive: wpData.strings?.puzzleActive || 'Arrange each tile to rebuild the ayah in the right order.',
    puzzleError: wpData.strings?.puzzleError || 'A few tiles are misplaced. Tap a slot to swap them around!',
    puzzleSuccess: wpData.strings?.puzzleSuccess || 'Takbir! You rebuilt the ayah—feel the barakah bloom!',
    puzzlePlay: wpData.strings?.puzzlePlay || 'Play Game',
    puzzleShuffle: wpData.strings?.puzzleShuffle || 'Shuffle Puzzle',
    puzzleNext: wpData.strings?.puzzleNext || 'Next Puzzle',
    puzzleSlotPlaceholder: wpData.strings?.puzzleSlotPlaceholder || 'Tap to place a tile',
    puzzleStreakPrefix: wpData.strings?.puzzleStreakPrefix || 'Streak x',
    puzzleSolvedLabel: wpData.strings?.puzzleSolvedLabel || 'Puzzles Solved',
    puzzleUnlockHint:
      wpData.strings?.puzzleUnlockHint
      || 'Complete three puzzles today to unlock the “Night of Tranquility” weekly challenge.',
    puzzleBestLabel: wpData.strings?.puzzleBestLabel || 'Best',
  };

  const root = document.querySelector('#alfawz-game-panel');
  if (!root) {
    return;
  }

  const elements = {
    loading: root.querySelector('#alfawz-game-loading'),
    content: root.querySelector('#alfawz-game-content'),
    error: root.querySelector('#alfawz-game-error'),
    statCards: root.querySelector('#alfawz-stat-cards'),
    stats: {
      hasanat: root.querySelector('[data-stat="hasanat"]'),
      verses: root.querySelector('[data-stat="verses"]'),
      streak: root.querySelector('[data-stat="streak"]'),
    },
    achievementSummary: root.querySelector('#alfawz-achievement-summary'),
    achievementGrid: root.querySelector('#alfawz-achievement-grid'),
    achievementEmpty: root.querySelector('#alfawz-achievement-empty'),
    questList: root.querySelector('#alfawz-quest-list'),
    questEmpty: root.querySelector('#alfawz-quest-empty'),
    egg: {
      card: root.querySelector('#alfawz-egg-card'),
      emoji: root.querySelector('#alfawz-egg-emoji'),
      level: root.querySelector('#alfawz-egg-level'),
      message: root.querySelector('#alfawz-egg-message'),
      progress: root.querySelector('#alfawz-egg-progress'),
      label: root.querySelector('#alfawz-egg-label'),
      playButton: root.querySelector('#alfawz-egg-play'),
      playLabel: root.querySelector('#alfawz-egg-play [data-role="alfawz-egg-play-label"]'),
    },
    virtueGarden: {
      section: root.querySelector('#virtue-garden'),
      intro: root.querySelector('#virtue-garden-intro'),
      startButton: root.querySelector('#virtue-garden-start'),
      message: root.querySelector('#virtue-garden-message'),
      game: root.querySelector('#virtue-garden-game'),
      stats: {
        seeds: root.querySelector('[data-garden-stat="seeds"]'),
        radiance: root.querySelector('[data-garden-stat="radiance"]'),
        streak: root.querySelector('[data-garden-stat="streak"]'),
      },
      dayChip: root.querySelector('#virtue-garden-day'),
      habit: root.querySelector('#virtue-garden-habit'),
      plantGrid: root.querySelector('#virtue-garden-plants'),
      plantEmpty: root.querySelector('#virtue-garden-plant-empty'),
      taskList: root.querySelector('#virtue-garden-task-list'),
      logList: root.querySelector('#virtue-garden-log'),
      careButton: root.querySelector('#virtue-garden-care'),
      careMeter: root.querySelector('#virtue-garden-care-meter'),
      mood: root.querySelector('#virtue-garden-mood'),
    },
    puzzle: {
      section: root.querySelector('#alfawz-puzzle'),
      playButton: root.querySelector('#alfawz-puzzle-play'),
      playIcon: root.querySelector('#alfawz-puzzle-play [data-role="puzzle-play-icon"]'),
      playLabel: root.querySelector('#alfawz-puzzle-play [data-role="puzzle-play-label"]'),
      card: root.querySelector('#alfawz-puzzle-card'),
      bank: root.querySelector('#alfawz-puzzle-bank'),
      slots: root.querySelector('#alfawz-puzzle-slots'),
      status: root.querySelector('#alfawz-puzzle-status'),
      progress: root.querySelector('#alfawz-puzzle-progress'),
      timer: root.querySelector('#alfawz-puzzle-timer'),
      moves: root.querySelector('#alfawz-puzzle-moves'),
      completed: root.querySelector('#alfawz-puzzle-completed'),
      streak: root.querySelector('#alfawz-puzzle-streak'),
      theme: root.querySelector('[data-role="puzzle-theme"]'),
      title: root.querySelector('[data-role="puzzle-title"]'),
      reference: root.querySelector('[data-role="puzzle-reference"]'),
      translation: root.querySelector('[data-role="puzzle-translation"]'),
      unlock: root.querySelector('#alfawz-puzzle-unlock'),
    },
  };

  let latestEggState = null;

  const timezoneOffset = () => -new Date().getTimezoneOffset();
  const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));
  const clampPercent = (value) => Math.max(0, Math.min(100, Number(value || 0)));
  const clampValue = (value, min, max) => Math.max(min, Math.min(max, Number(value || 0)));
  const randomItem = (items) => {
    if (!Array.isArray(items) || !items.length) {
      return null;
    }
    return items[Math.floor(Math.random() * items.length)];
  };
  const createUid = (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`;
  const formatTime = (value) => {
    const totalSeconds = Math.max(0, Math.floor(Number(value || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const resolvePlayUrl = (...candidates) => {
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }
    return '';
  };

  const buildApiUrl = (path) => `${API_BASE}${path.replace(/^\//, '')}`;

  const apiRequest = async (path) => {
    const url = buildApiUrl(path);
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
    }
    if (response.status === 204) {
      return null;
    }
    return response.json();
  };

  const toggleView = ({ loading = false, error = null } = {}) => {
    if (elements.loading) {
      elements.loading.classList.toggle('hidden', !loading);
    }
    if (elements.error) {
      if (error) {
        elements.error.textContent = error;
        elements.error.classList.remove('hidden');
      } else {
        elements.error.classList.add('hidden');
        elements.error.textContent = '';
      }
    }
    if (elements.content) {
      elements.content.classList.toggle('hidden', Boolean(loading || error));
    }
  };

  const pulseValue = (element) => {
    if (!element) {
      return;
    }
    element.classList.remove('alfawz-value-pulse');
    void element.offsetWidth; // Force reflow
    element.classList.add('alfawz-value-pulse');
  };

  const applyStagger = (nodes) => {
    if (!nodes) {
      return;
    }
    Array.from(nodes).forEach((node, index) => {
      const delay = index * 90;
      node.style.setProperty('--alfawz-delay', `${delay}ms`);
      requestAnimationFrame(() => {
        node.classList.add('animate-soft-fade');
      });
    });
  };

  const spawnConfetti = (host) => {
    if (!host) {
      return;
    }
    const colors = ['#8b1e3f', '#f59bb4', '#f4d6c7', '#ffd166', '#b4637a'];
    const container = document.createElement('div');
    container.className = 'alfawz-confetti-container';
    host.appendChild(container);

    for (let i = 0; i < 14; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'alfawz-confetti-piece';
      piece.style.setProperty('--alfawz-confetti-color', colors[i % colors.length]);
      piece.style.setProperty('--alfawz-confetti-x', `${Math.random() * 120 - 60}%`);
      piece.style.setProperty('--alfawz-confetti-delay', `${Math.random() * 0.35}s`);
      piece.style.setProperty('--alfawz-confetti-rotation', `${Math.random() * 360}deg`);
      container.appendChild(piece);
      piece.addEventListener('animationend', () => {
        piece.remove();
        if (!container.childElementCount) {
          container.remove();
        }
      });
    }
  };

  const shuffleArray = (input) => {
    const array = Array.isArray(input) ? input.slice() : [];
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const puzzleDeck = [
    {
      id: 'fatiha-1',
      surah: 'Al-Fatihah',
      ayah: 1,
      reference: 'Surah Al-Fatihah · Ayah 1',
      translation: 'In the name of Allah—the Most Compassionate, Most Merciful.',
      segments: [
        'In the name of Allah—',
        'the Most Compassionate,',
        'Most Merciful.',
      ],
      theme: 'Daily Theme · Blossoming Mercy',
      title: 'Rebuild the Ayah of Mercy',
      unlock: 'Complete two puzzles to reveal tomorrow’s Blossoming Mercy path.',
    },
    {
      id: 'baqarah-286',
      surah: 'Al-Baqarah',
      ayah: 286,
      reference: 'Surah Al-Baqarah · Ayah 286',
      translation:
        'Allah does not burden a soul beyond what it can bear. It will have the good it has earned, and it will bear what it has earned of evil.',
      segments: [
        'Allah does not burden a soul',
        'beyond what it can bear.',
        'It will have the good it has earned,',
        'and it will bear what it has earned of evil.',
      ],
      theme: 'Weekly Spotlight · Resilient Hearts',
      title: 'Strength in Patience Puzzle',
      unlock: 'Solve this resilience puzzle to unlock the “Night of Tranquility” theme.',
    },
    {
      id: 'sharh-5',
      surah: 'Ash-Sharh',
      ayah: '5-6',
      reference: 'Surah Ash-Sharh · Ayat 5-6',
      translation: 'So surely with hardship comes ease. Indeed, with hardship comes ease.',
      segments: [
        'So surely with hardship',
        'comes ease.',
        'Indeed, with hardship',
        'comes ease.',
      ],
      theme: 'Daily Theme · Steady Hope',
      title: 'Twin Waves of Ease',
      unlock: 'Keep a two-day streak to unlock the Steady Hope collection.',
    },
    {
      id: 'duha-11',
      surah: 'Ad-Duhaa',
      ayah: 11,
      reference: 'Surah Ad-Duhaa · Ayah 11',
      translation: 'So proclaim the blessings of your Lord.',
      segments: [
        'So proclaim',
        'the blessings',
        'of your Lord.',
      ],
      theme: 'Weekly Spotlight · Grateful Hearts',
      title: 'Blessings in Bloom',
      unlock: 'Share one reflection to unlock the Grateful Hearts quest.',
    },
    {
      id: 'rahman-13',
      surah: 'Ar-Rahman',
      ayah: 13,
      reference: 'Surah Ar-Rahman · Ayah 13',
      translation: 'So which of your Lord’s favours will you both deny?',
      segments: [
        'So which of',
        'your Lord’s favours',
        'will you both deny?',
      ],
      theme: 'Daily Theme · Echoes of Gratitude',
      title: 'Favors Count Puzzle',
      unlock: 'Unlock this echo to reveal bonus gratitude badges.',
    },
  ];

  const puzzleState = {
    currentPuzzle: null,
    placement: [],
    segments: [],
    moves: 0,
    completed: 0,
    streak: 0,
    bestStreak: 0,
    startTime: null,
    elapsed: 0,
    timerInterval: null,
    activeSlot: null,
    isComplete: false,
    usedIds: new Set(),
    lastPuzzleId: null,
  };

  const statusStyles = {
    idle: ['border-[#d47a92]/60', 'bg-white/70', 'text-[#7a0f32]'],
    active: ['border-[#f5b1c7]/70', 'bg-white', 'text-[#8b1e3f]'],
    success: ['border-emerald-200/80', 'bg-emerald-50/95', 'text-emerald-700'],
    error: ['border-[#f9a8b5]/80', 'bg-[#ffe5eb]/90', 'text-[#b3264a]'],
  };
  const statusResetClasses = Array.from(new Set(Object.values(statusStyles).flat()));

  const slotStates = {
    empty: ['border-dashed', 'border-[#f2bccc]', 'bg-white/60', 'text-[#b4637a]'],
    filled: ['border-solid', 'border-[#8b1e3f]', 'bg-white', 'text-[#4d081d]', 'shadow-lg', 'shadow-[#4d081d]/10'],
    correct: ['border-solid', 'border-emerald-400/80', 'bg-emerald-50', 'text-emerald-700', 'shadow-lg', 'shadow-emerald-200/40'],
    incorrect: ['border-solid', 'border-[#f97380]', 'bg-[#ffe7eb]', 'text-[#b3264a]', 'shadow-lg', 'shadow-[#fca5a5]/60'],
  };
  const slotResetClasses = Array.from(new Set(Object.values(slotStates).flat().concat(['ring-2', 'ring-[#f59bb4]/70', 'ring-offset-2', 'ring-offset-white'])));

  const updatePuzzleStatus = (message, state = 'idle') => {
    if (!elements.puzzle.status) {
      return;
    }
    const targetState = statusStyles[state] ? state : 'idle';
    elements.puzzle.status.textContent = message;
    elements.puzzle.status.classList.remove(...statusResetClasses);
    elements.puzzle.status.classList.add(...statusStyles[targetState]);
  };

  const updatePuzzleProgress = () => {
    if (!elements.puzzle.progress || !puzzleState.currentPuzzle) {
      if (elements.puzzle.progress) {
        elements.puzzle.progress.style.width = '0%';
      }
      return;
    }
    const total = puzzleState.currentPuzzle.segments.length;
    const filled = puzzleState.placement.filter((value) => value !== null).length;
    const percent = total > 0 ? clampPercent((filled / total) * 100) : 0;
    elements.puzzle.progress.style.width = `${percent}%`;
  };

  const updatePuzzleTimerDisplay = (value) => {
    if (!elements.puzzle.timer) {
      return;
    }
    elements.puzzle.timer.textContent = formatTime(value);
  };

  const updatePuzzleMovesDisplay = () => {
    if (!elements.puzzle.moves) {
      return;
    }
    elements.puzzle.moves.textContent = formatNumber(puzzleState.moves);
  };

  const updatePuzzleCompletedDisplay = () => {
    if (!elements.puzzle.completed) {
      return;
    }
    const value = formatNumber(puzzleState.completed);
    elements.puzzle.completed.textContent = value;
    elements.puzzle.completed.setAttribute('aria-label', `${strings.puzzleSolvedLabel}: ${value}`);
  };

  const updatePuzzleStreakDisplay = () => {
    if (!elements.puzzle.streak) {
      return;
    }
    const current = formatNumber(puzzleState.streak);
    const best = formatNumber(Math.max(puzzleState.bestStreak, puzzleState.streak));
    let label = `${strings.puzzleStreakPrefix}${current}`;
    if (puzzleState.bestStreak > 0) {
      label = `${label} · ${strings.puzzleBestLabel} ${best}`;
    }
    elements.puzzle.streak.textContent = label;
    elements.puzzle.streak.setAttribute('aria-label', `${strings.puzzleStreakPrefix}${current}`);
  };

  const updatePuzzleUnlockMessage = (puzzle = null) => {
    if (!elements.puzzle.unlock) {
      return;
    }
    const message = puzzle?.unlock || strings.puzzleUnlockHint;
    elements.puzzle.unlock.textContent = message;
  };

  const setPlayButtonState = (state) => {
    if (!elements.puzzle.playButton) {
      return;
    }
    const presets = {
      idle: { icon: '▶', label: strings.puzzlePlay },
      playing: { icon: '⟳', label: strings.puzzleShuffle },
      complete: { icon: '✨', label: strings.puzzleNext },
    };
    const config = presets[state] || presets.idle;
    if (elements.puzzle.playLabel) {
      elements.puzzle.playLabel.textContent = config.label;
    } else {
      elements.puzzle.playButton.textContent = config.label;
    }
    if (elements.puzzle.playIcon) {
      elements.puzzle.playIcon.textContent = config.icon;
    }
    elements.puzzle.playButton.dataset.state = state;
  };

  const stopPuzzleTimer = () => {
    if (puzzleState.timerInterval) {
      window.clearInterval(puzzleState.timerInterval);
      puzzleState.timerInterval = null;
    }
    if (puzzleState.startTime) {
      puzzleState.elapsed = Date.now() - puzzleState.startTime;
      updatePuzzleTimerDisplay(puzzleState.elapsed);
      puzzleState.startTime = null;
    }
  };

  const tickPuzzleTimer = () => {
    if (!puzzleState.startTime) {
      return;
    }
    const elapsed = Date.now() - puzzleState.startTime;
    puzzleState.elapsed = elapsed;
    updatePuzzleTimerDisplay(elapsed);
  };

  const startPuzzleTimer = () => {
    stopPuzzleTimer();
    puzzleState.startTime = Date.now();
    puzzleState.elapsed = 0;
    updatePuzzleTimerDisplay(0);
    puzzleState.timerInterval = window.setInterval(() => {
      tickPuzzleTimer();
    }, 1000);
  };

  const applySlotState = (slot, state) => {
    if (!slot) {
      return;
    }
    const targetState = slotStates[state] ? state : 'empty';
    slot.classList.remove(...slotResetClasses);
    slot.classList.add(...slotStates[targetState]);
    if (Number(slot.dataset.slotIndex || -1) === puzzleState.activeSlot && !puzzleState.isComplete) {
      slot.classList.add('ring-2', 'ring-[#f59bb4]/70', 'ring-offset-2', 'ring-offset-white');
    }
  };

  const setActiveSlot = (index = null) => {
    puzzleState.activeSlot = Number.isInteger(index) ? Number(index) : null;
    if (!elements.puzzle.slots) {
      return;
    }
    Array.from(elements.puzzle.slots.children).forEach((slot) => {
      const slotIndex = Number(slot.dataset.slotIndex);
      const isActive = Number.isInteger(puzzleState.activeSlot) && slotIndex === puzzleState.activeSlot && !puzzleState.isComplete;
      slot.classList.remove('ring-2', 'ring-[#f59bb4]/70', 'ring-offset-2', 'ring-offset-white');
      if (isActive) {
        slot.classList.add('ring-2', 'ring-[#f59bb4]/70', 'ring-offset-2', 'ring-offset-white');
      }
    });
  };

  const createSlot = (index) => {
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.dataset.slotIndex = index;
    slot.dataset.placeholder = `${strings.puzzleSlotPlaceholder}`;
    slot.className =
      'alfawz-puzzle-slot flex min-h-[60px] items-center justify-center rounded-3xl border-2 px-4 text-center text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f59bb4]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
    slot.textContent = `${strings.puzzleSlotPlaceholder}`;
    applySlotState(slot, 'empty');
    slot.addEventListener('click', (event) => {
      event.preventDefault();
      if (puzzleState.isComplete) {
        return;
      }
      const slotIndex = Number(slot.dataset.slotIndex);
      const segmentIndex = slot.dataset.segmentIndex;
      if (segmentIndex !== undefined && segmentIndex !== null && segmentIndex !== '') {
        const currentIndex = Number(segmentIndex);
        puzzleState.moves += 1;
        updatePuzzleMovesDisplay();
        puzzleState.placement[slotIndex] = null;
        slot.dataset.segmentIndex = '';
        slot.textContent = slot.dataset.placeholder;
        applySlotState(slot, 'empty');
        if (elements.puzzle.bank) {
          const tile = elements.puzzle.bank.querySelector(`[data-segment-index="${currentIndex}"]`);
          if (tile) {
            tile.disabled = false;
            tile.classList.remove('opacity-40', 'cursor-not-allowed');
            tile.removeAttribute('aria-disabled');
          }
        }
        updatePuzzleProgress();
        updatePuzzleStatus(strings.puzzleActive, 'active');
        setActiveSlot(slotIndex);
      } else {
        setActiveSlot(slotIndex);
      }
    });
    return slot;
  };

  const disableTile = (tile) => {
    if (!tile) {
      return;
    }
    tile.disabled = true;
    tile.classList.add('opacity-40', 'cursor-not-allowed');
    tile.setAttribute('aria-disabled', 'true');
  };

  const createTile = (segment) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.dataset.segmentIndex = segment.index;
    tile.className =
      'alfawz-puzzle-tile relative inline-flex w-full items-center justify-center rounded-3xl border border-[#f6c5d5] bg-white/90 px-4 py-3 text-center text-sm font-semibold text-[#7a0f32] shadow-lg shadow-[#4d081d]/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f59bb4]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
    tile.textContent = segment.text;
    tile.setAttribute('aria-label', `Tile ${segment.index + 1}: ${segment.text}`);
    tile.addEventListener('click', (event) => {
      event.preventDefault();
      if (tile.disabled || puzzleState.isComplete) {
        return;
      }
      const targetSlotIndex = Number.isInteger(puzzleState.activeSlot)
        ? puzzleState.activeSlot
        : puzzleState.placement.findIndex((value) => value === null);
      if (targetSlotIndex === -1) {
        pulseValue(tile);
        return;
      }
      const slot = elements.puzzle.slots?.querySelector(`[data-slot-index="${targetSlotIndex}"]`);
      if (!slot) {
        return;
      }
      const existingSegment = slot.dataset.segmentIndex;
      if (existingSegment !== undefined && existingSegment !== null && existingSegment !== '') {
        return;
      }
      puzzleState.placement[targetSlotIndex] = segment.index;
      slot.dataset.segmentIndex = segment.index;
      slot.textContent = segment.text;
      applySlotState(slot, 'filled');
      disableTile(tile);
      setActiveSlot(targetSlotIndex + 1 < puzzleState.placement.length ? targetSlotIndex + 1 : null);
      puzzleState.moves += 1;
      updatePuzzleMovesDisplay();
      updatePuzzleProgress();
      evaluatePuzzle();
    });
    return tile;
  };

  const highlightIncorrectSlots = () => {
    if (!elements.puzzle.slots || !puzzleState.currentPuzzle) {
      return;
    }
    Array.from(elements.puzzle.slots.children).forEach((slot) => {
      const slotIndex = Number(slot.dataset.slotIndex);
      const segmentIndex = Number(slot.dataset.segmentIndex);
      if (!Number.isInteger(segmentIndex)) {
        return;
      }
      if (segmentIndex === slotIndex) {
        applySlotState(slot, 'correct');
      } else {
        applySlotState(slot, 'incorrect');
      }
    });
  };

  const markSlotsAsCorrect = () => {
    if (!elements.puzzle.slots) {
      return;
    }
    Array.from(elements.puzzle.slots.children).forEach((slot) => {
      applySlotState(slot, 'correct');
    });
  };

  const evaluatePuzzle = () => {
    if (!puzzleState.currentPuzzle) {
      return;
    }
    const total = puzzleState.currentPuzzle.segments.length;
    const filled = puzzleState.placement.filter((value) => value !== null).length;
    if (filled < total) {
      updatePuzzleStatus(strings.puzzleActive, 'active');
      return;
    }
    const isCorrect = puzzleState.placement.every((value, index) => value === index);
    if (!isCorrect) {
      updatePuzzleStatus(strings.puzzleError, 'error');
      highlightIncorrectSlots();
      return;
    }
    markSlotsAsCorrect();
    handlePuzzleComplete();
  };

  const selectNextPuzzle = () => {
    if (!puzzleDeck.length) {
      return null;
    }
    if (puzzleState.usedIds.size >= puzzleDeck.length) {
      puzzleState.usedIds.clear();
    }
    const unused = puzzleDeck.filter((item) => !puzzleState.usedIds.has(item.id));
    let pool = unused.length ? unused : puzzleDeck.slice();
    if (pool.length > 1 && puzzleState.lastPuzzleId) {
      const filtered = pool.filter((item) => item.id !== puzzleState.lastPuzzleId);
      if (filtered.length) {
        pool = filtered;
      }
    }
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  };

  const markPuzzleAsUsed = (puzzle) => {
    if (!puzzle) {
      return;
    }
    puzzleState.usedIds.add(puzzle.id);
    puzzleState.lastPuzzleId = puzzle.id;
  };

  const updatePuzzleMeta = (puzzle) => {
    if (elements.puzzle.theme) {
      elements.puzzle.theme.textContent = puzzle?.theme || strings.puzzleActive;
    }
    if (elements.puzzle.title) {
      elements.puzzle.title.textContent = puzzle?.title || strings.puzzleActive;
    }
    if (elements.puzzle.reference) {
      const reference = puzzle?.reference || (puzzle ? `Surah ${puzzle.surah} · Ayah ${puzzle.ayah}` : '');
      elements.puzzle.reference.textContent = reference;
    }
    if (elements.puzzle.translation) {
      elements.puzzle.translation.textContent = puzzle?.translation || '';
    }
  };

  const setupPuzzleBoard = (puzzle) => {
    if (!elements.puzzle.bank || !elements.puzzle.slots) {
      return;
    }
    elements.puzzle.bank.innerHTML = '';
    elements.puzzle.slots.innerHTML = '';
    puzzleState.segments = puzzle.segments.map((text, index) => ({
      id: `${puzzle.id}-${index}`,
      index,
      text,
    }));
    puzzleState.placement = new Array(puzzleState.segments.length).fill(null);

    const shuffled = shuffleArray(puzzleState.segments);
    shuffled.forEach((segment) => {
      const tile = createTile(segment);
      elements.puzzle.bank.appendChild(tile);
    });

    puzzleState.segments.forEach((_, index) => {
      const slot = createSlot(index);
      elements.puzzle.slots.appendChild(slot);
    });
    setActiveSlot(0);
    updatePuzzleProgress();
  };

  const handlePuzzleComplete = () => {
    if (puzzleState.isComplete) {
      return;
    }
    puzzleState.isComplete = true;
    stopPuzzleTimer();
    puzzleState.completed += 1;
    puzzleState.streak += 1;
    if (puzzleState.streak > puzzleState.bestStreak) {
      puzzleState.bestStreak = puzzleState.streak;
    }
    updatePuzzleCompletedDisplay();
    updatePuzzleStreakDisplay();
    updatePuzzleStatus(strings.puzzleSuccess, 'success');
    setPlayButtonState('complete');
    if (elements.puzzle.bank) {
      elements.puzzle.bank.querySelectorAll('button').forEach((tile) => {
        disableTile(tile);
      });
    }
    spawnConfetti(elements.puzzle.card || elements.puzzle.section || root);
  };

  const startPuzzleRound = (puzzle = null, options = {}) => {
    if (!elements.puzzle.section) {
      return;
    }
    const reuseCurrent = Boolean(options.reuse);
    let chosen = puzzle;
    if (!reuseCurrent || !chosen) {
      chosen = selectNextPuzzle();
      markPuzzleAsUsed(chosen);
    }
    if (!chosen) {
      return;
    }
    puzzleState.currentPuzzle = chosen;
    puzzleState.isComplete = false;
    puzzleState.moves = 0;
    puzzleState.elapsed = 0;
    puzzleState.activeSlot = null;
    updatePuzzleMeta(chosen);
    updatePuzzleUnlockMessage(chosen);
    setupPuzzleBoard(chosen);
    updatePuzzleMovesDisplay();
    updatePuzzleTimerDisplay(0);
    updatePuzzleStatus(strings.puzzleActive, 'active');
    setPlayButtonState('playing');
    startPuzzleTimer();
  };

  const resetPuzzleView = () => {
    stopPuzzleTimer();
    puzzleState.currentPuzzle = null;
    puzzleState.isComplete = false;
    puzzleState.placement = [];
    puzzleState.segments = [];
    puzzleState.activeSlot = null;
    puzzleState.elapsed = 0;
    puzzleState.moves = 0;
    updatePuzzleStatus(strings.puzzleIdle, 'idle');
    updatePuzzleTimerDisplay(0);
    updatePuzzleMovesDisplay();
    updatePuzzleProgress();
    updatePuzzleCompletedDisplay();
    updatePuzzleStreakDisplay();
    updatePuzzleUnlockMessage();
    setPlayButtonState('idle');
    if (elements.puzzle.bank) {
      elements.puzzle.bank.innerHTML = '';
    }
    if (elements.puzzle.slots) {
      elements.puzzle.slots.innerHTML = '';
    }
  };

  const initPuzzleGame = () => {
    if (!elements.puzzle.section) {
      return;
    }
    resetPuzzleView();
    if (elements.puzzle.playButton) {
      elements.puzzle.playButton.addEventListener('click', (event) => {
        event.preventDefault();
        const state = elements.puzzle.playButton.dataset.state || 'idle';
        if (state === 'playing' && puzzleState.currentPuzzle && !puzzleState.isComplete) {
          startPuzzleRound(puzzleState.currentPuzzle, { reuse: true });
          return;
        }
        if (state === 'complete') {
          puzzleState.isComplete = false;
        }
        startPuzzleRound();
      });
    }
  };

  const renderStats = (stats) => {
    if (!stats) {
      return;
    }
    if (elements.stats.hasanat) {
      elements.stats.hasanat.textContent = formatNumber(stats.total_hasanat);
      pulseValue(elements.stats.hasanat);
    }
    if (elements.stats.verses) {
      elements.stats.verses.textContent = formatNumber(stats.verses_read);
      pulseValue(elements.stats.verses);
    }
    if (elements.stats.streak) {
      elements.stats.streak.textContent = formatNumber(stats.current_streak);
      pulseValue(elements.stats.streak);
    }
  };

  const buildProgressBar = (progress, target) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#f3d9d2]/80';

    const bar = document.createElement('div');
    bar.className = 'h-full rounded-full bg-gradient-to-r from-[#8b1e3f] via-[#d05672] to-[#f9a8b5] transition-all duration-500';
    const percentage = target > 0 ? clampPercent((progress / target) * 100) : 0;
    bar.style.width = `${percentage}%`;
    wrapper.appendChild(bar);

    return { wrapper, percentage };
  };

  const plantStages = [
    { index: 0, threshold: 0, label: 'Seedling', icon: '🌱', description: 'Intentions taking root.' },
    { index: 1, threshold: 30, label: 'Sprout', icon: '🌿', description: 'Daily recitation stretches new leaves.' },
    { index: 2, threshold: 65, label: 'Bloom', icon: '🌸', description: 'Reflections release a fragrant bloom.' },
    { index: 3, threshold: 100, label: 'Radiant Grove', icon: '🌳', description: 'Tafsir nourishes a radiant canopy.' },
  ];

  const plantCatalog = [
    { id: 'mercy-rose', name: 'Mercy Rose', attribute: 'Petals perfume the air whenever you recite Ar-Rahman.', element: 'Mercy', emoji: '🌹' },
    { id: 'hikmah-oak', name: 'Hikmah Oak', attribute: 'Branches whisper tafsir insights to visiting hearts.', element: 'Wisdom', emoji: '🌳' },
    { id: 'sabr-lily', name: 'Sabr Lily', attribute: 'Blooms brightest after patient memorisation sessions.', element: 'Sabr', emoji: '🌼' },
    { id: 'nur-vine', name: 'Nur Vine', attribute: 'Shimmers softly during nightly dhikr reflections.', element: 'Nur', emoji: '🌿' },
    { id: 'dhikr-palm', name: 'Dhikr Palm', attribute: 'Produces dates of remembrance for loved ones.', element: 'Dhikr', emoji: '🌴' },
    { id: 'ikhlas-lotus', name: 'Ikhlas Lotus', attribute: 'Floats serenely reminding you to purify intention.', element: 'Ikhlas', emoji: '🌸' },
    { id: 'tawbah-moss', name: 'Tawbah Moss', attribute: 'Softens the soil with dew drops of repentance.', element: 'Tawbah', emoji: '🪴' },
    { id: 'sakinah-cedar', name: 'Sakinah Cedar', attribute: 'Shelters your duas beneath tranquil shade.', element: 'Sakinah', emoji: '🌲' },
  ];

  const taskLibrary = [
    {
      id: 'recite-dawn',
      type: 'recite',
      title: 'Dawn Dew Recitation',
      prompt: 'Recite Surah Al-Fatihah slowly at dawn and let each verse settle.',
      duration: '4 min',
      seeds: 14,
      tip: 'Whisper the basmalah with a deep breath to anchor your tajwid.',
    },
    {
      id: 'recite-mercy',
      type: 'recite',
      title: 'Mercy Echo',
      prompt: 'Repeat Ayat Al-Kursi three times focusing on Allah’s protection.',
      duration: '6 min',
      seeds: 18,
      tip: 'Visualise a gentle light surrounding your heart as you recite.',
    },
    {
      id: 'recite-nightfall',
      type: 'recite',
      title: 'Nightfall Pairing',
      prompt: 'Recite Surah Al-Falaq and An-Nas before resting.',
      duration: '3 min',
      seeds: 12,
      tip: 'Let each refuge remind you to seek Allah’s shelter.',
    },
    {
      id: 'recite-review',
      type: 'recite',
      title: 'Review Garland',
      prompt: 'Revisit the last five ayat you memorised and recite without looking.',
      duration: '9 min',
      seeds: 19,
      tip: 'Note any slips and polish them after the session.',
    },
    {
      id: 'reflect-rahma',
      type: 'reflect',
      title: 'Mercy Mirror',
      prompt: 'Reflect on how Ar-Rahman appears in Surah Maryam and note one blessing.',
      duration: '5 min',
      seeds: 13,
      tip: 'Share the reflection with a loved one to double the barakah.',
    },
    {
      id: 'reflect-gratitude',
      type: 'reflect',
      title: 'Gratitude Sketch',
      prompt: 'List three favours mentioned in Surah Ar-Rahman that you felt today.',
      duration: '6 min',
      seeds: 15,
      tip: 'Pair each favour with a whispered “Alhamdulillah”.',
    },
    {
      id: 'reflect-hope',
      type: 'reflect',
      title: 'Hope Lantern',
      prompt: 'Read Ayah 286 of Al-Baqarah and journal one way Allah eases your burdens.',
      duration: '7 min',
      seeds: 16,
      tip: 'Close the journal with a dua asking for steadfastness.',
    },
    {
      id: 'learn-tafsir-asr',
      type: 'learn',
      title: 'Asr Insight',
      prompt: 'Study a tafsir snippet of Surah Al-Asr and capture the three keys to success.',
      duration: '8 min',
      seeds: 17,
      tip: 'Teach the keys to a sibling or friend to cement them.',
    },
    {
      id: 'learn-tafsir-sharh',
      type: 'learn',
      title: 'Expanded Chest',
      prompt: 'Listen to a short explanation of Surah Ash-Sharh and mark one comforting phrase.',
      duration: '6 min',
      seeds: 16,
      tip: 'Repeat the phrase as a breathing zikr for a minute.',
    },
    {
      id: 'learn-tafsir-layl',
      type: 'learn',
      title: 'Night Charity Spark',
      prompt: 'Read the tafsir of Surah Al-Layl verses 5-10 and plan one quiet act of charity.',
      duration: '7 min',
      seeds: 18,
      tip: 'Set a reminder to carry out the charity before Maghrib.',
    },
    {
      id: 'bonus-family',
      type: 'bonus',
      title: 'Family Bloom',
      prompt: 'Teach a younger sibling or friend one ayah you love and recite it together.',
      duration: '10 min',
      seeds: 20,
      tip: 'Record the moment and thank Allah for shared learning.',
    },
    {
      id: 'bonus-sadaqah',
      type: 'bonus',
      title: 'Secret Seed',
      prompt: 'Give a hidden sadaqah inspired by a verse you memorised today.',
      duration: '5 min',
      seeds: 18,
      tip: 'Make niyyah that Allah alone knows of this gift.',
    },
  ];

  const moodStates = [
    { threshold: 80, message: 'Luminous — your care routine is thriving.' },
    { threshold: 55, message: 'Blooming — keep your dhikr gentle and steady.' },
    { threshold: 35, message: 'Wilting — a gentle recitation will revive the soil.' },
    { threshold: 0, message: 'Parched — return with reflection to rescue the garden.' },
  ];

  const messageStyles = {
    idle: 'border-[#f4c7d3]/70 bg-white/80 text-[#7a0f32]',
    active: 'border-[#c23958]/70 bg-[#fde8ef]/90 text-[#4d081d]',
    success: 'border-emerald-200/80 bg-emerald-50/90 text-emerald-700',
    warning: 'border-amber-200/80 bg-amber-50/90 text-amber-700',
  };

  const logToneStyles = {
    default: 'border-white/60 bg-white/80 text-[#7a0f32]',
    success: 'border-emerald-200/60 bg-emerald-50/85 text-emerald-700',
    warning: 'border-amber-200/60 bg-amber-50/85 text-amber-700',
    highlight: 'border-[#c23958]/60 bg-[#fde8ef]/90 text-[#4d081d]',
    event: 'border-[#8b1e3f]/50 bg-[#4d081d]/10 text-[#4d081d]',
  };

  const taskTypeMeta = {
    recite: {
      chip: 'Recitation Quest',
      icon: '📿',
      cardClasses: 'bg-gradient-to-br from-[#fff5f8]/95 via-[#fde3ec]/95 to-[#fbdce9]/95 border-[#f4c7d3]/70 text-[#4d081d]',
      buttonClasses: 'bg-gradient-to-r from-[#8b1e3f] via-[#c23958] to-[#f59bb4] shadow-[#4d081d]/25',
    },
    reflect: {
      chip: 'Reflection Ritual',
      icon: '🪞',
      cardClasses: 'bg-gradient-to-br from-[#fff8f1]/95 via-[#fdeedb]/95 to-[#f9e2d2]/95 border-[#f6d5c5]/70 text-[#4d081d]',
      buttonClasses: 'bg-gradient-to-r from-[#b97326] via-[#e59d47] to-[#ffd58f] shadow-[#5e3108]/30',
    },
    learn: {
      chip: 'Tafsir Insight',
      icon: '📚',
      cardClasses: 'bg-gradient-to-br from-[#f5f9ff]/95 via-[#e7f2ff]/95 to-[#e0f1ff]/95 border-[#c8dfff]/70 text-[#20324d]',
      buttonClasses: 'bg-gradient-to-r from-[#3469a5] via-[#5d8dd1] to-[#8fb8ff] shadow-[#1b3d63]/25',
    },
    bonus: {
      chip: 'Bonus Bloom',
      icon: '✨',
      cardClasses: 'bg-gradient-to-br from-[#fef6ff]/95 via-[#f6e8ff]/95 to-[#efe1ff]/95 border-[#dcc8ff]/70 text-[#3c1b5a]',
      buttonClasses: 'bg-gradient-to-r from-[#8246c9] via-[#a86bed] to-[#d3a9ff] shadow-[#3c1a6b]/30',
    },
  };

  const gardenState = {
    started: false,
    day: 1,
    streak: 0,
    totalSeeds: 0,
    care: 64,
    careUsed: false,
    plants: [],
    tasks: [],
    usedPlantIds: new Set(),
    combo: { types: new Set(), triggered: false },
    completedToday: false,
  };

  const setGardenMessage = (text, state = 'idle') => {
    if (!elements.virtueGarden.message) {
      return;
    }
    const targetState = messageStyles[state] ? state : 'idle';
    elements.virtueGarden.message.dataset.state = targetState;
    elements.virtueGarden.message.textContent = text;
    Object.values(messageStyles).forEach((classes) => {
      classes.split(' ').forEach((className) => {
        elements.virtueGarden.message.classList.remove(className);
      });
    });
    messageStyles[targetState].split(' ').forEach((className) => {
      elements.virtueGarden.message.classList.add(className);
    });
  };

  const updateGardenHabitIndicator = () => {
    if (!elements.virtueGarden.habit) {
      return;
    }
    if (!gardenState.started) {
      elements.virtueGarden.habit.textContent = 'Begin today’s rituals to awaken your first plant.';
      return;
    }
    const remaining = gardenState.tasks.filter((task) => !task.completed).length;
    if (!remaining) {
      elements.virtueGarden.habit.textContent = 'All rituals complete — your grove is humming with nur.';
      return;
    }
    elements.virtueGarden.habit.textContent = `${remaining} ritual${remaining === 1 ? '' : 's'} awaiting your care.`;
  };

  const addGardenLog = (message, tone = 'default') => {
    if (!elements.virtueGarden.logList) {
      return;
    }
    const item = document.createElement('li');
    item.className =
      'relative overflow-hidden rounded-3xl border px-4 py-3 text-sm font-semibold leading-snug shadow-inner backdrop-blur-sm transition-all duration-300';
    const toneClasses = logToneStyles[tone] || logToneStyles.default;
    toneClasses.split(' ').forEach((className) => item.classList.add(className));
    const glow = document.createElement('div');
    glow.className =
      'pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-500';
    item.appendChild(glow);
    const time = document.createElement('p');
    time.className = 'relative text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#b4637a]/80';
    try {
      time.textContent = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date());
    } catch (error) {
      time.textContent = new Date().toLocaleTimeString();
    }
    item.appendChild(time);
    const textNode = document.createElement('p');
    textNode.className = 'relative mt-1 text-sm font-semibold';
    textNode.textContent = message;
    item.appendChild(textNode);
    elements.virtueGarden.logList.prepend(item);
    requestAnimationFrame(() => {
      item.classList.add('animate-soft-fade');
      glow.classList.add('opacity-100');
    });
    while (elements.virtueGarden.logList.childElementCount > 7) {
      elements.virtueGarden.logList.removeChild(elements.virtueGarden.logList.lastElementChild);
    }
  };

  const getPlantStage = (progress) => {
    const value = clampPercent(progress);
    let stage = plantStages[0];
    plantStages.forEach((entry) => {
      if (value >= entry.threshold) {
        stage = entry;
      }
    });
    return stage;
  };

  const renderGardenPlants = () => {
    if (!elements.virtueGarden.plantGrid) {
      return;
    }
    elements.virtueGarden.plantGrid.innerHTML = '';
    if (!gardenState.plants.length) {
      elements.virtueGarden.plantEmpty?.classList.remove('hidden');
      return;
    }
    elements.virtueGarden.plantEmpty?.classList.add('hidden');
    gardenState.plants.forEach((plant, index) => {
      const stage = getPlantStage(plant.growth);
      const card = document.createElement('article');
      card.className =
        'group relative overflow-hidden rounded-[28px] border border-[#f4c7d3]/60 bg-white/95 p-5 text-[#4d081d] shadow-lg shadow-[#310915]/12 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl';
      card.dataset.state = plant.growth >= 100 ? 'complete' : 'growing';
      card.style.setProperty('--alfawz-delay', `${index * 90}ms`);
      const glow = document.createElement('div');
      glow.className =
        'pointer-events-none absolute inset-0 bg-gradient-to-br from-[#fbe7ef]/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100';
      card.appendChild(glow);
      const header = document.createElement('div');
      header.className = 'relative flex items-center justify-between gap-3';
      const titleWrap = document.createElement('div');
      titleWrap.className = 'flex items-center gap-3';
      const icon = document.createElement('span');
      icon.setAttribute('aria-hidden', 'true');
      icon.className = 'inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fde8ef] text-2xl shadow-inner';
      icon.textContent = plant.emoji || '🌱';
      titleWrap.appendChild(icon);
      const title = document.createElement('div');
      title.className = 'space-y-1';
      const name = document.createElement('p');
      name.className = 'text-lg font-bold';
      name.textContent = plant.name;
      const attribute = document.createElement('p');
      attribute.className = 'text-sm font-medium text-[#7a0f32]';
      attribute.textContent = plant.attribute;
      title.appendChild(name);
      title.appendChild(attribute);
      titleWrap.appendChild(title);
      header.appendChild(titleWrap);
      const badge = document.createElement('span');
      badge.className = 'rounded-full bg-[#fde9ef] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#b4637a]';
      badge.textContent = `${stage.icon} ${stage.label}`;
      header.appendChild(badge);
      card.appendChild(header);
      const description = document.createElement('p');
      description.className = 'relative mt-3 text-sm font-medium text-[#9d4158]';
      description.textContent = stage.description;
      card.appendChild(description);
      const progressWrapper = document.createElement('div');
      progressWrapper.className = 'relative mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#f6d7df]/80';
      const progressBar = document.createElement('div');
      progressBar.className =
        'h-full rounded-full bg-gradient-to-r from-[#8b1e3f] via-[#c23958] to-[#f59bb4] transition-all duration-500';
      progressBar.style.width = `${clampPercent(plant.growth)}%`;
      progressWrapper.appendChild(progressBar);
      card.appendChild(progressWrapper);
      const footer = document.createElement('div');
      footer.className = 'mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#b4637a]';
      const growthLabel = document.createElement('span');
      growthLabel.textContent = `${Math.round(plant.growth)}% grown`;
      const seedsLabel = document.createElement('span');
      seedsLabel.textContent = `${formatNumber(plant.seeds)} virtue seeds absorbed`;
      footer.appendChild(growthLabel);
      footer.appendChild(seedsLabel);
      card.appendChild(footer);
      elements.virtueGarden.plantGrid.appendChild(card);
      requestAnimationFrame(() => {
        card.classList.add('animate-soft-fade');
      });
    });
  };

  const spawnPlant = () => {
    let pool = plantCatalog.filter((plant) => !gardenState.usedPlantIds.has(plant.id));
    if (!pool.length) {
      gardenState.usedPlantIds.clear();
      pool = plantCatalog.slice();
    }
    const blueprint = randomItem(pool);
    if (!blueprint) {
      return null;
    }
    gardenState.usedPlantIds.add(blueprint.id);
    const plant = {
      id: createUid('plant'),
      catalogId: blueprint.id,
      name: blueprint.name,
      attribute: blueprint.attribute,
      element: blueprint.element,
      emoji: blueprint.emoji,
      growth: 0,
      seeds: 0,
      stageIndex: 0,
    };
    gardenState.plants.push(plant);
    addGardenLog(`${plant.name} sprouted in your garden. Nourish it with today’s worship!`, 'event');
    return plant;
  };

  const allocateSeedsToPlants = (amount) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }
    let remaining = Math.max(0, Math.round(amount));
    while (remaining > 0) {
      let plant = gardenState.plants.find((item) => item.growth < 100);
      if (!plant) {
        plant = spawnPlant();
        if (!plant) {
          break;
        }
      }
      const beforeStage = getPlantStage(plant.growth);
      const space = Math.max(0, 100 - plant.growth);
      const applied = Math.max(1, Math.min(space, remaining));
      plant.growth = clampPercent(plant.growth + applied);
      plant.seeds += applied;
      remaining -= applied;
      const afterStage = getPlantStage(plant.growth);
      if (afterStage.index !== beforeStage.index) {
        addGardenLog(`${plant.name} reached the ${afterStage.label.toLowerCase()} stage!`, 'highlight');
        plant.stageIndex = afterStage.index;
      }
      if (plant.growth >= 100 && remaining > 0) {
        addGardenLog(`${plant.name} is radiant—new seedbeds are ready.`, 'success');
      }
    }
    renderGardenPlants();
    updateGardenStats();
  };

  const updateGardenStats = () => {
    if (elements.virtueGarden.stats.seeds) {
      elements.virtueGarden.stats.seeds.textContent = formatNumber(gardenState.totalSeeds);
    }
    if (elements.virtueGarden.stats.streak) {
      const streakLabel = gardenState.streak
        ? `${formatNumber(gardenState.streak)} day${gardenState.streak === 1 ? '' : 's'}`
        : 'Warmup day';
      elements.virtueGarden.stats.streak.textContent = streakLabel;
    }
    if (elements.virtueGarden.dayChip) {
      elements.virtueGarden.dayChip.textContent = `Day ${gardenState.day}`;
    }
    const radiance = gardenState.plants.length
      ? Math.round(
          gardenState.plants.reduce((sum, plant) => sum + clampPercent(plant.growth), 0) /
            gardenState.plants.length
        )
      : 0;
    let radianceLabel = 'Seedling Patch';
    if (radiance >= 90) {
      radianceLabel = 'Luminous Orchard';
    } else if (radiance >= 60) {
      radianceLabel = 'Blossoming Grove';
    } else if (radiance >= 35) {
      radianceLabel = 'Emerging Meadow';
    }
    if (elements.virtueGarden.stats.radiance) {
      elements.virtueGarden.stats.radiance.textContent = `${radianceLabel} (${radiance}%)`;
    }
  };

  const updateCareMeter = () => {
    if (elements.virtueGarden.careMeter) {
      elements.virtueGarden.careMeter.style.width = `${clampPercent(gardenState.care)}%`;
    }
    const mood = moodStates.find((entry) => gardenState.care >= entry.threshold) || moodStates[moodStates.length - 1];
    if (elements.virtueGarden.mood && mood) {
      elements.virtueGarden.mood.textContent = mood.message;
    }
    if (!gardenState.started) {
      return;
    }
    if (gardenState.care < 35 && gardenState.tasks.some((task) => !task.completed)) {
      if (elements.virtueGarden.message && elements.virtueGarden.message.dataset.state !== 'success') {
        setGardenMessage('Your garden is craving attention—complete a ritual to restore it.', 'warning');
      }
    }
  };

  const refreshCareButton = () => {
    if (!elements.virtueGarden.careButton) {
      return;
    }
    if (!gardenState.started) {
      elements.virtueGarden.careButton.disabled = false;
      elements.virtueGarden.careButton.classList.remove('cursor-not-allowed', 'opacity-60');
      elements.virtueGarden.careButton.textContent = 'Daily Care Pulse';
      return;
    }
    elements.virtueGarden.careButton.disabled = gardenState.careUsed;
    if (gardenState.careUsed) {
      elements.virtueGarden.careButton.textContent = 'Care Logged';
      elements.virtueGarden.careButton.classList.add('cursor-not-allowed', 'opacity-60');
    } else {
      elements.virtueGarden.careButton.textContent = 'Daily Care Pulse';
      elements.virtueGarden.careButton.classList.remove('cursor-not-allowed', 'opacity-60');
    }
  };

  const buildDailyTaskSet = () => {
    const categories = ['recite', 'reflect', 'learn'];
    const shuffled = shuffleArray(taskLibrary);
    const selected = [];
    categories.forEach((category) => {
      const found = shuffled.find(
        (item) => item.type === category && !selected.some((chosen) => chosen.id === item.id)
      );
      if (found) {
        selected.push(found);
      }
    });
    const remaining = shuffled.filter((item) => !selected.some((chosen) => chosen.id === item.id));
    const extra = remaining.find((item) => item.type === 'bonus') || remaining[0];
    if (extra) {
      selected.push(extra);
    }
    return selected.map((task, index) => {
      const variance = Math.round((Math.random() - 0.5) * 2);
      const seeds = Math.max(8, task.seeds + variance);
      return {
        ...task,
        seeds,
        uid: createUid(`task-${task.type}`),
        completed: false,
        order: index,
      };
    });
  };

  const completeGardenTask = (taskId) => {
    const task = gardenState.tasks.find((item) => item.uid === taskId);
    if (!task || task.completed) {
      return;
    }
    task.completed = true;
    gardenState.combo.types.add(task.type);
    let reward = Math.max(8, Math.round(task.seeds));
    if (task.type === 'bonus') {
      reward += 4;
    }
    if (gardenState.combo.types.size >= 3 && !gardenState.combo.triggered) {
      const comboReward = 5;
      reward += comboReward;
      gardenState.combo.triggered = true;
      addGardenLog(`Harmony combo! +${formatNumber(comboReward)} bonus seeds for varied worship.`, 'highlight');
      spawnConfetti(elements.virtueGarden.game || elements.virtueGarden.section || root);
    }
    gardenState.totalSeeds += reward;
    const careBoost = task.type === 'reflect' ? 12 : task.type === 'recite' ? 10 : task.type === 'learn' ? 9 : 8;
    gardenState.care = clampPercent(gardenState.care + careBoost);
    const growth = Math.max(1, Math.round(reward * 1.1));
    allocateSeedsToPlants(growth);
    addGardenLog(`+${formatNumber(reward)} virtue seeds from ${task.title}.`, 'success');
    renderGardenTasks({ animate: false });
    updateGardenStats();
    updateCareMeter();
    updateGardenHabitIndicator();
    checkGardenCompletion();
  };

  const renderGardenTasks = (options = {}) => {
    if (!elements.virtueGarden.taskList) {
      return;
    }
    const { animate = true } = options;
    elements.virtueGarden.taskList.innerHTML = '';
    if (!gardenState.started) {
      const placeholder = document.createElement('p');
      placeholder.className =
        'rounded-3xl border border-white/25 bg-white/10 px-4 py-4 text-sm font-semibold text-white/80 shadow-inner';
      placeholder.textContent = 'Tap “Play Game” to reveal today’s rituals.';
      elements.virtueGarden.taskList.appendChild(placeholder);
      updateGardenHabitIndicator();
      return;
    }
    if (!gardenState.tasks.length) {
      const empty = document.createElement('p');
      empty.className =
        'rounded-3xl border border-white/25 bg-white/10 px-4 py-4 text-sm font-semibold text-white/80 shadow-inner';
      empty.textContent = 'You completed everything! Return tomorrow for fresh seeds.';
      elements.virtueGarden.taskList.appendChild(empty);
      updateGardenHabitIndicator();
      return;
    }
    gardenState.tasks.forEach((task, index) => {
      const meta = taskTypeMeta[task.type] || taskTypeMeta.recite;
      const card = document.createElement('article');
      card.className =
        'group relative overflow-hidden rounded-[28px] border p-5 text-white shadow-[0_24px_60px_-28px_rgba(18,5,9,0.65)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl';
      card.classList.add(...meta.cardClasses.split(' '));
      card.dataset.taskCard = task.uid;
      card.dataset.state = task.completed ? 'complete' : 'ready';
      card.style.setProperty('--alfawz-delay', `${index * 90}ms`);
      const glow = document.createElement('div');
      glow.className =
        'pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100';
      card.appendChild(glow);
      const header = document.createElement('div');
      header.className = 'relative flex items-center justify-between gap-3 text-[#4d081d]';
      const chip = document.createElement('span');
      chip.className =
        'inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[#7a1332] shadow-inner';
      chip.setAttribute('data-role', 'task-status');
      chip.textContent = task.completed ? 'Nurtured' : meta.chip;
      header.appendChild(chip);
      const reward = document.createElement('span');
      reward.className =
        'inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-[#7a1332] shadow-inner';
      reward.innerHTML = `<span aria-hidden="true">✨</span>+${formatNumber(task.seeds)} seeds`;
      header.appendChild(reward);
      card.appendChild(header);
      const title = document.createElement('h4');
      title.className = 'relative mt-3 text-xl font-bold text-[#4d081d]';
      title.innerHTML = `${meta.icon || '🌿'} ${task.title}`;
      card.appendChild(title);
      const prompt = document.createElement('p');
      prompt.className = 'relative mt-2 text-sm font-medium text-[#7a0f32]';
      prompt.textContent = task.prompt;
      card.appendChild(prompt);
      if (task.tip) {
        const tip = document.createElement('p');
        tip.className =
          'relative mt-3 rounded-2xl bg-white/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#b4637a]';
        tip.textContent = task.tip;
        card.appendChild(tip);
      }
      const footer = document.createElement('div');
      footer.className =
        'relative mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#9d4158]';
      const duration = document.createElement('span');
      duration.textContent = `Est. ${task.duration}`;
      footer.appendChild(duration);
      const typeLabel = document.createElement('span');
      typeLabel.textContent = task.type === 'bonus' ? 'Bonus reward active' : 'Daily ritual';
      footer.appendChild(typeLabel);
      card.appendChild(footer);
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.taskId = task.uid;
      button.className =
        'mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/70';
      button.classList.add(...meta.buttonClasses.split(' '));
      button.innerHTML = '<span aria-hidden="true">▶</span><span>Log Ritual</span>';
      if (task.completed) {
        button.disabled = true;
        button.innerHTML = '<span aria-hidden="true">✨</span><span>Logged</span>';
        button.className =
          'mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 focus:outline-none';
      } else {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          completeGardenTask(task.uid);
        });
      }
      card.appendChild(button);
      elements.virtueGarden.taskList.appendChild(card);
      if (animate) {
        requestAnimationFrame(() => {
          card.classList.add('animate-soft-fade');
        });
      }
    });
    updateGardenHabitIndicator();
  };

  const checkGardenCompletion = () => {
    if (!gardenState.started || !gardenState.tasks.length) {
      return;
    }
    const remaining = gardenState.tasks.filter((task) => !task.completed).length;
    if (remaining > 0) {
      setGardenMessage(`Keep going—${remaining} ritual${remaining === 1 ? '' : 's'} still need your touch.`, 'active');
      return;
    }
    if (gardenState.completedToday) {
      return;
    }
    gardenState.completedToday = true;
    gardenState.streak += 1;
    setGardenMessage('Takbir! Your grove is luminous—return tomorrow for new blossoms.', 'success');
    addGardenLog('Takbir! Your entire garden is glowing with today’s worship.', 'highlight');
    updateGardenStats();
    spawnConfetti(elements.virtueGarden.game || elements.virtueGarden.section || root);
    window.setTimeout(() => {
      advanceGardenDay();
    }, 1600);
  };

  const advanceGardenDay = () => {
    gardenState.day += 1;
    gardenState.tasks = buildDailyTaskSet();
    gardenState.combo = { types: new Set(), triggered: false };
    gardenState.completedToday = false;
    gardenState.care = clampPercent(gardenState.care - 18);
    if (gardenState.care < 22) {
      gardenState.care = 22;
    }
    gardenState.careUsed = false;
    renderGardenTasks();
    updateGardenStats();
    updateCareMeter();
    updateGardenHabitIndicator();
    refreshCareButton();
    setGardenMessage(`Day ${gardenState.day} unlocked—fresh virtue seeds await.`, 'active');
    addGardenLog(`New rituals sprouted for Day ${gardenState.day}.`, 'event');
  };

  const handleCarePulse = (event) => {
    event.preventDefault();
    if (!gardenState.started) {
      setGardenMessage('Start the game to unlock the care pulse.', 'warning');
      return;
    }
    if (gardenState.careUsed) {
      setGardenMessage('Today’s care pulse is already recorded. Complete a ritual to refresh it tomorrow.', 'warning');
      return;
    }
    gardenState.care = clampPercent(gardenState.care + 16);
    gardenState.careUsed = true;
    refreshCareButton();
    updateCareMeter();
    addGardenLog('You tended the soil with a mindful dua. Vitality restored!', 'success');
    if (elements.virtueGarden.message?.dataset.state !== 'success') {
      setGardenMessage('You watered the garden—vitality restored!', 'active');
    }
  };

  const handleGardenStart = (event) => {
    event.preventDefault();
    if (!elements.virtueGarden.section) {
      return;
    }
    if (!gardenState.started) {
      gardenState.started = true;
      gardenState.day = 1;
      gardenState.streak = 0;
      gardenState.totalSeeds = 0;
      gardenState.care = 64;
      gardenState.careUsed = false;
      gardenState.completedToday = false;
      gardenState.combo = { types: new Set(), triggered: false };
      gardenState.tasks = buildDailyTaskSet();
      gardenState.plants = [];
      gardenState.usedPlantIds = new Set();
      renderGardenPlants();
      renderGardenTasks();
      updateGardenStats();
      updateCareMeter();
      updateGardenHabitIndicator();
      refreshCareButton();
      addGardenLog('Game started — your soil is ready for seeds.', 'event');
      setGardenMessage('Welcome, caretaker! Complete today’s rituals to awaken your first plant.', 'active');
      elements.virtueGarden.game?.classList.remove('hidden');
      if (elements.virtueGarden.startButton) {
        elements.virtueGarden.startButton.textContent = 'Continue Cultivating';
      }
      if (elements.virtueGarden.intro) {
        elements.virtueGarden.intro.classList.add('ring-2', 'ring-white/40');
      }
    } else {
      setGardenMessage('Return to your rituals and keep the barakah flowing.', 'active');
    }
    elements.virtueGarden.game?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const initVirtueGarden = () => {
    if (!elements.virtueGarden.section) {
      return;
    }
    renderGardenPlants();
    renderGardenTasks();
    updateGardenStats();
    updateCareMeter();
    updateGardenHabitIndicator();
    refreshCareButton();
    setGardenMessage('Tap “Play Game” to sow your first virtue seeds.', 'idle');
    if (elements.virtueGarden.startButton) {
      elements.virtueGarden.startButton.addEventListener('click', handleGardenStart);
    }
    if (elements.virtueGarden.careButton) {
      elements.virtueGarden.careButton.addEventListener('click', handleCarePulse);
    }
  };

  const renderAchievements = (payload) => {
    if (!elements.achievementGrid) {
      return;
    }
    const achievements = Array.isArray(payload?.achievements) ? payload.achievements : Array.isArray(payload) ? payload : [];
    elements.achievementGrid.innerHTML = '';

    if (!achievements.length) {
      elements.achievementEmpty?.classList.remove('hidden');
      if (elements.achievementSummary) {
        elements.achievementSummary.textContent = '';
      }
      return;
    }

    const unlockedCount = achievements.filter((item) => item.unlocked).length;
    if (elements.achievementSummary) {
      const suffix = unlockedCount === 1 ? strings.badgeSingular : strings.badgePlural;
      elements.achievementSummary.textContent = `${unlockedCount} / ${achievements.length} ${suffix}`;
    }
    elements.achievementEmpty?.classList.add('hidden');

    achievements.forEach((achievement, index) => {
      const unlocked = Boolean(achievement.unlocked);
      const card = document.createElement('article');
      card.className = `group relative flex flex-col items-center overflow-hidden rounded-[28px] border-2 p-7 text-center shadow-xl transition-all duration-300 ${
        unlocked
          ? 'bg-gradient-to-br from-[#8b1e3f]/90 via-[#c43a59]/85 to-[#f59bb4]/80 text-white shadow-[0_24px_45px_-18px_rgba(139,30,63,0.55)] hover:-translate-y-2 hover:shadow-[0_34px_55px_-15px_rgba(139,30,63,0.55)] border-transparent'
          : 'bg-gradient-to-br from-white/96 via-[#fde9e5]/96 to-[#fff9f7]/96 text-[#5f0d26] shadow-[#2e0715]/12 hover:-translate-y-1.5 hover:shadow-2xl border-[#f4c7d3]/70'
      } backdrop-blur-sm`;
      card.dataset.status = unlocked ? 'unlocked' : 'locked';
      card.style.setProperty('--alfawz-delay', `${index * 100}ms`);
      requestAnimationFrame(() => {
        card.classList.add('animate-pop-in');
      });

      const glow = document.createElement('div');
      glow.className = `pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ${
        unlocked ? 'bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_65%)]' : 'bg-[radial-gradient(circle_at_bottom,_rgba(255,255,255,0.85),_transparent_70%)]'
      } group-hover:opacity-100`;
      card.appendChild(glow);

      const statusChip = document.createElement('span');
      statusChip.className = `absolute right-5 top-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] transition-colors duration-300 ${
        unlocked ? 'bg-white/25 text-white shadow-lg shadow-[#4d081d]/25 backdrop-blur' : 'bg-white/80 text-[#8b1e3f] shadow-inner'
      }`;
      statusChip.textContent = unlocked ? strings.completed : strings.locked;
      card.appendChild(statusChip);

      const iconWrap = document.createElement('div');
      iconWrap.className = `relative z-10 inline-flex h-16 w-16 items-center justify-center rounded-3xl border-2 text-4xl transition-transform duration-300 ${
        unlocked
          ? 'border-white/70 bg-white/20 text-white shadow-lg shadow-[#4d081d]/35 group-hover:scale-110'
          : 'border-[#f4c7d3]/60 bg-white/80 text-[#b3264a] shadow-lg shadow-[#7d1b36]/15 group-hover:scale-105'
      }`;
      iconWrap.setAttribute('aria-hidden', 'true');
      const icon = document.createElement('span');
      icon.className = 'drop-shadow-sm';
      icon.textContent = achievement.icon || (unlocked ? '✨' : '🔒');
      iconWrap.appendChild(icon);
      card.appendChild(iconWrap);

      const title = document.createElement('p');
      title.className = `relative z-10 mt-4 text-xl font-black tracking-tight ${unlocked ? 'text-white drop-shadow-lg' : 'text-[#3b0c1f] drop-shadow-sm'}`;
      title.textContent = achievement.title || '';
      card.appendChild(title);

      if (achievement.description) {
        const description = document.createElement('p');
        description.className = `relative z-10 mt-3 text-base font-medium leading-relaxed ${
          unlocked ? 'text-white/90' : 'text-[#6f1330]/80'
        }`;
        description.textContent = achievement.description;
        card.appendChild(description);
      }

      if (Number.isFinite(achievement.reward)) {
        const reward = document.createElement('div');
        reward.className = `relative z-10 mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold shadow-lg transition duration-300 ${
          unlocked ? 'bg-white/20 text-white shadow-[#4d081d]/30 backdrop-blur group-hover:shadow-[#4d081d]/45' : 'bg-white/85 text-[#8b1e3f] shadow-[#4d081d]/10'
        }`;
        const rewardIcon = document.createElement('span');
        rewardIcon.setAttribute('aria-hidden', 'true');
        rewardIcon.textContent = '✨';
        const rewardLabel = document.createElement('span');
        rewardLabel.textContent = `+${formatNumber(achievement.reward)} Hasanat`;
        reward.appendChild(rewardIcon);
        reward.appendChild(rewardLabel);
        card.appendChild(reward);
      }

      if (achievement.target) {
        const { wrapper, percentage } = buildProgressBar(achievement.progress || 0, achievement.target);
        wrapper.className = `relative mt-5 h-2.5 w-full overflow-hidden rounded-full ${
          unlocked ? 'bg-white/25' : 'bg-[#f9dce2]/80'
        }`;
        const progressBar = wrapper.querySelector('div');
        if (progressBar) {
          progressBar.className = `h-full rounded-full transition-all duration-500 ${
            unlocked ? 'bg-gradient-to-r from-white via-[#ffd5e0] to-[#ffe8ef]' : 'bg-gradient-to-r from-[#8b1e3f] via-[#d05672] to-[#f9a8b5]'
          }`;
        }
        card.appendChild(wrapper);

        const caption = document.createElement('p');
        caption.className = `relative mt-3 text-sm font-semibold ${unlocked ? 'text-white/85' : 'text-[#7a0f32]'}`;
        const progressValue = `${formatNumber(Math.min(achievement.progress || 0, achievement.target))} / ${formatNumber(
          achievement.target
        )}`;
        caption.textContent = unlocked
          ? `${strings.completed} • ${progressValue}`
          : `${progressValue} • ${percentage.toFixed(0)}%`;
        card.appendChild(caption);
      }

      const playButton = document.createElement('button');
      playButton.type = 'button';
      playButton.className = `relative z-10 mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        unlocked
          ? 'bg-white text-[#8b1e3f] shadow-lg shadow-[#4d081d]/25 ring-[#8b1e3f]/60 ring-offset-transparent hover:-translate-y-1 hover:bg-[#ffe5ec] hover:text-[#5f0d26]'
          : 'bg-white/70 text-[#8b1e3f]/60 shadow-inner ring-0 cursor-not-allowed'
      }`;
      playButton.dataset.achievementId = achievement.id || '';
      playButton.setAttribute('aria-label', `${(unlocked ? strings.playNow : strings.keepGoing) || ''} – ${achievement.title || ''}`.trim());

      const playIcon = document.createElement('span');
      playIcon.setAttribute('aria-hidden', 'true');
      playIcon.className = 'text-base';
      playIcon.textContent = unlocked ? '▶' : '🔒';
      const playLabel = document.createElement('span');
      playLabel.textContent = unlocked ? strings.playNow : strings.keepGoing;
      playButton.appendChild(playIcon);
      playButton.appendChild(playLabel);

      if (unlocked) {
        const handlePlay = () => {
          const targetUrl = resolvePlayUrl(achievement.play_url, wpData.gamePlayUrl, wpData.memorizerUrl, wpData.readerUrl);
          if (targetUrl) {
            window.location.href = targetUrl;
            return;
          }
          window.dispatchEvent(
            new CustomEvent('alfawz:playAchievement', {
              detail: {
                achievement,
              },
            })
          );
        };
        playButton.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          handlePlay();
        });
      } else {
        playButton.disabled = true;
        playButton.setAttribute('aria-disabled', 'true');
      }

      card.appendChild(playButton);

      elements.achievementGrid.appendChild(card);
    });
  };

  const renderEgg = (state) => {
    if (!elements.egg.card) {
      return;
    }
    latestEggState = state || null;
    const playUrl = resolvePlayUrl(state?.play_url, wpData.gamePlayUrl, wpData.memorizerUrl, wpData.readerUrl);
    const count = Number(state?.count || 0);
    const target = Math.max(1, Number(state?.target || 20));
    const percentage = clampPercent(state?.percentage ?? (target ? (count / target) * 100 : 0));
    const completed = Boolean(state?.completed) || percentage >= 100 || count >= target;
    const nextTarget = Number(state?.next_target || state?.target || target);
    const previousTarget = Number(state?.previous_target || 0) || null;

    if (elements.egg.playButton) {
      elements.egg.playButton.dataset.playUrl = playUrl;
      elements.egg.playButton.setAttribute('aria-label', strings.playNow);
    }
    if (elements.egg.playLabel) {
      elements.egg.playLabel.textContent = strings.playNow;
    }

    if (elements.egg.progress) {
      elements.egg.progress.style.width = `${percentage}%`;
    }
    if (elements.egg.label) {
      if (state?.progress_label) {
        elements.egg.label.textContent = `${state.progress_label} ${strings.verses}`;
      } else {
        elements.egg.label.textContent = `${formatNumber(Math.min(count, target))} / ${formatNumber(target)} ${strings.verses}`;
      }
    }
    if (elements.egg.message) {
      if (completed && nextTarget) {
        const hatchedLabel = previousTarget && previousTarget > 0 ? formatNumber(previousTarget) : formatNumber(Math.max(1, nextTarget - 5));
        elements.egg.message.innerHTML = `${strings.eggComplete} <br /><span class="font-semibold">${hatchedLabel}</span> → <span class="font-semibold">${formatNumber(nextTarget)} ${strings.verses}</span>`;
      } else if (Number.isFinite(state?.remaining) && state.remaining > 0) {
        const remaining = formatNumber(state.remaining);
        elements.egg.message.textContent = `${remaining} ${strings.verses.toLowerCase()} to go.`;
      } else {
        elements.egg.message.textContent = strings.eggInProgress;
      }
    }
    if (elements.egg.emoji) {
      elements.egg.emoji.textContent = completed ? '🐣' : '🥚';
    }
    if (elements.egg.card) {
      elements.egg.card.classList.toggle('alfawz-egg-hatched', completed);
    }
    if (elements.egg.level) {
      const level = Number(state?.level || 0) || Math.max(1, Math.ceil(target / 20));
      elements.egg.level.textContent = `${strings.levelLabel} ${formatNumber(level)}`;
    }

    elements.egg.card.dataset.state = completed ? 'completed' : 'active';
  };

  if (elements.egg.playButton) {
    elements.egg.playButton.addEventListener('click', (event) => {
      event.preventDefault();
      const targetUrl = elements.egg.playButton?.dataset?.playUrl
        || resolvePlayUrl(wpData.gamePlayUrl, wpData.memorizerUrl, wpData.readerUrl);
      if (targetUrl) {
        window.location.href = targetUrl;
        return;
      }
      window.dispatchEvent(
        new CustomEvent('alfawz:playEggChallenge', {
          detail: {
            source: 'egg-card',
            state: latestEggState,
          },
        })
      );
    });
  }

  const renderQuest = (quest) => {
    const item = document.createElement('div');
    item.className =
      'alfawz-quest-item group relative overflow-hidden rounded-[28px] border border-[#8b1e3f]/20 bg-gradient-to-br from-white/92 via-[#fff5f8]/95 to-[#fde8ef]/90 p-6 shadow-[0_22px_45px_-18px_rgba(77,8,29,0.25)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_34px_65px_-24px_rgba(139,30,63,0.48)] focus-within:-translate-y-1.5 focus-within:shadow-[0_34px_60px_-22px_rgba(139,30,63,0.45)]';
    item.dataset.questId = quest.id || '';

    const status = quest.status || 'in_progress';
    const isCompleted = status === 'completed' || status === 'complete';

    const glow = document.createElement('div');
    glow.className = 'alfawz-quest-glow';
    item.appendChild(glow);

    const header = document.createElement('div');
    header.className = 'relative z-10 flex items-start gap-4';
    item.appendChild(header);

    const badge = document.createElement('div');
    badge.className = `flex h-14 w-14 flex-none items-center justify-center rounded-[22px] text-2xl font-semibold shadow-lg shadow-[#4d081d]/20 ring-2 ring-white/60 ${
      isCompleted
        ? 'bg-gradient-to-br from-[#8b1e3f] via-[#a82349] to-[#f59bb4] text-white'
        : 'bg-gradient-to-br from-[#fde4ec] via-[#fff5f8] to-[#ffd7e4] text-[#8b1e3f]'
    }`;
    badge.textContent = isCompleted ? '✓' : quest.icon || '☆';
    header.appendChild(badge);

    const info = document.createElement('div');
    info.className = 'flex-1';
    header.appendChild(info);

    const title = document.createElement('p');
    title.className = 'text-xl font-extrabold tracking-tight text-[#410618] drop-shadow-sm';
    title.textContent = quest.title || '';
    info.appendChild(title);

    if (quest.description) {
      const description = document.createElement('p');
      description.className = 'mt-1 text-base text-[#b4637a]';
      description.style.opacity = '0.94';
      description.textContent = quest.description;
      info.appendChild(description);
    }

    const rewardRow = document.createElement('div');
    rewardRow.className = 'relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3';

    const reward = document.createElement('div');
    reward.className =
      'inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-[#8b1e3f] shadow-inner shadow-white/40 ring-1 ring-white/60 backdrop-blur-sm';
    if (Number.isFinite(quest.reward)) {
      reward.textContent = `+${formatNumber(quest.reward)} Hasanat`;
    } else {
      reward.textContent = quest.reward_label || strings.rewardAwaiting;
    }
    rewardRow.appendChild(reward);

    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.className =
      'alfawz-quest-play relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8b1e3f] via-[#c23958] to-[#f59bb4] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#4d081d]/25 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f9a8b5]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:translate-y-[-2px] hover:brightness-110 active:translate-y-0';
    playButton.dataset.questId = quest.id || '';
    playButton.setAttribute('aria-label', `${strings.playNow || ''} – ${quest.title || ''}`.trim());

    const playIcon = document.createElement('span');
    playIcon.setAttribute('aria-hidden', 'true');
    playIcon.className = 'alfawz-quest-play-icon text-base transition-transform duration-300';
    playIcon.textContent = '▶';

    const playLabel = document.createElement('span');
    playLabel.textContent = strings.playNow;

    playButton.appendChild(playIcon);
    playButton.appendChild(playLabel);

    const questPlayUrl = quest.play_url || wpData.gamePlayUrl || wpData.memorizerUrl || wpData.readerUrl || '';
    const openInNewTab = quest.open_in_new_tab || quest.openInNewTab || false;

    const handleQuestPlay = () => {
      if (questPlayUrl) {
        if (openInNewTab) {
          window.open(questPlayUrl, '_blank', 'noopener');
        } else {
          window.location.href = questPlayUrl;
        }
        return;
      }
      window.dispatchEvent(
        new CustomEvent('alfawz:playQuest', {
          detail: {
            quest,
          },
        })
      );
    };

    playButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleQuestPlay();
    });

    rewardRow.appendChild(playButton);
    item.appendChild(rewardRow);

    if (quest.target) {
      const { wrapper, percentage } = buildProgressBar(quest.progress || 0, quest.target);
      wrapper.classList.add('mt-4');
      wrapper.classList.add('relative', 'z-10');
      item.appendChild(wrapper);

      const caption = document.createElement('p');
      caption.className = 'relative z-10 mt-2 text-sm font-semibold text-[#7a0f32]';
      caption.style.opacity = '0.9';
      const value = `${formatNumber(Math.min(quest.progress || 0, quest.target))} / ${formatNumber(quest.target)}`;
      caption.textContent = isCompleted ? `${strings.completed} • ${value}` : `${value} • ${percentage.toFixed(0)}%`;
      item.appendChild(caption);
    }

    if (isCompleted) {
      item.classList.add('alfawz-quest-complete');
      if (item.dataset.state !== 'completed') {
        spawnConfetti(item);
      }
      item.dataset.state = 'completed';
    } else {
      item.dataset.state = status;
    }

    return item;
  };

  const renderQuests = (payload) => {
    if (!elements.questList) {
      return;
    }
    const quests = Array.isArray(payload?.quests) ? payload.quests : Array.isArray(payload) ? payload : [];
    elements.questList.innerHTML = '';

    if (!quests.length) {
      elements.questEmpty?.classList.remove('hidden');
      return;
    }

    elements.questEmpty?.classList.add('hidden');
    quests.forEach((quest, index) => {
      const node = renderQuest(quest);
      node.style.setProperty('--alfawz-delay', `${index * 80}ms`);
      requestAnimationFrame(() => {
        node.classList.add('animate-soft-fade');
      });
      elements.questList.appendChild(node);
    });
  };

  initVirtueGarden();
  initPuzzleGame();

  const loadData = async () => {
    toggleView({ loading: true });
    try {
      const query = `?timezone_offset=${timezoneOffset()}`;
      const [stats, achievements, quests, egg] = await Promise.all([
        apiRequest(`user-stats${query}`),
        apiRequest(`achievements${query}`),
        apiRequest(`daily-quests${query}`),
        apiRequest('egg-challenge'),
      ]);

      renderStats(stats);
      renderAchievements(achievements);
      renderQuests(quests);
      renderEgg(egg);

      toggleView({ loading: false });
      if (elements.statCards) {
        applyStagger(elements.statCards.children);
      }
    } catch (error) {
      console.error('[AlfawzQuran] Unable to load game panel:', error);
      toggleView({ loading: false, error: strings.loadError });
    }
  };

  loadData();
})();

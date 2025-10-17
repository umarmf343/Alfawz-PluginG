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

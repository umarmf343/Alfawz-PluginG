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
    gameStatusPrompt: wpData.strings?.gameStatusPrompt || 'Select a tile to begin building the ayah.',
    gameStatusNeedTile: wpData.strings?.gameStatusNeedTile || 'Choose a tile from the word bank first.',
    gameStatusPlaced: wpData.strings?.gameStatusPlaced || 'Great! Keep arranging the ayah.',
    gameStatusReturned: wpData.strings?.gameStatusReturned || 'Tile returned to the word bank.',
    gameStatusIncomplete: wpData.strings?.gameStatusIncomplete || 'Fill every slot to complete the ayah.',
    gameStatusMismatch: wpData.strings?.gameStatusMismatch || 'Almost there—adjust the highlighted tiles.',
    gameStatusSuccess: wpData.strings?.gameStatusSuccess || 'Takbir! You rebuilt the ayah in perfect order.',
    gameSlotLabel: wpData.strings?.gameSlotLabel || 'Slot %d',
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
    playButton: root.querySelector('[data-action="play-game"]'),
    gameModal: root.querySelector('#alfawz-game-modal'),
    gameCard: root.querySelector('#alfawz-mini-game-card'),
    closeGameButton: root.querySelector('[data-action="close-game"]'),
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
    },
    game: {
      bank: root.querySelector('#alfawz-game-bank'),
      slots: root.querySelector('#alfawz-game-slots'),
      status: root.querySelector('#alfawz-game-status'),
      moves: root.querySelector('#alfawz-game-moves'),
      timer: root.querySelector('#alfawz-game-timer'),
      reference: root.querySelector('#alfawz-game-reference'),
      translation: root.querySelector('#alfawz-game-translation'),
      arabic: root.querySelector('#alfawz-game-arabic'),
      checkButton: root.querySelector('[data-action="check-game"]'),
      resetButton: root.querySelector('[data-action="reset-game"]'),
    },
  };

  const timezoneOffset = () => -new Date().getTimezoneOffset();
  const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));
  const clampPercent = (value) => Math.max(0, Math.min(100, Number(value || 0)));

  const buildApiUrl = (path) => `${API_BASE}${path.replace(/^\//, '')}`;

  const apiRequest = async (path, options = {}) => {
    const url = buildApiUrl(path);
    const { method = 'GET', body } = options;
    const requestHeaders = { ...headers };
    const config = { method, headers: requestHeaders };

    if (body instanceof FormData) {
      config.body = body;
    } else if (body !== undefined && body !== null) {
      config.body = typeof body === 'string' ? body : JSON.stringify(body);
      requestHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, config);
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
      const card = document.createElement('div');
      card.className = `relative flex flex-col items-center overflow-hidden rounded-3xl border border-[#8b1e3f]/20 p-6 text-center shadow-xl transition-transform duration-300 ${
        unlocked
          ? 'bg-gradient-to-br from-[#fbe6dd]/90 via-[#fde9e5]/90 to-white/95 text-[#4d081d] shadow-[#4d081d]/15'
          : 'bg-white/95 text-[#5f0d26] shadow-[#2e0715]/10'
      }`;
      card.dataset.status = unlocked ? 'unlocked' : 'locked';
      card.style.setProperty('--alfawz-delay', `${index * 100}ms`);
      requestAnimationFrame(() => {
        card.classList.add('animate-pop-in');
      });

      const icon = document.createElement('div');
      icon.className = 'text-4xl drop-shadow-sm';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = achievement.icon || (unlocked ? '✨' : '🔒');
      card.appendChild(icon);

      const title = document.createElement('p');
      title.className = 'mt-2 text-lg font-semibold';
      title.textContent = achievement.title || '';
      card.appendChild(title);

      if (achievement.description) {
        const description = document.createElement('p');
        description.className = 'mt-2 text-base font-medium text-[#7a0f32]/80';
        description.textContent = achievement.description;
        card.appendChild(description);
      }

      if (Number.isFinite(achievement.reward)) {
        const reward = document.createElement('p');
        reward.className = 'mt-4 inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-[#8b1e3f] shadow-sm';
        reward.textContent = `+${formatNumber(achievement.reward)} Hasanat`;
        card.appendChild(reward);
      }

      if (achievement.target) {
        const { wrapper, percentage } = buildProgressBar(achievement.progress || 0, achievement.target);
        wrapper.classList.add('mt-5');
        card.appendChild(wrapper);

        const caption = document.createElement('p');
        caption.className = 'mt-3 text-sm font-semibold text-[#7a0f32]';
        const progressValue = `${formatNumber(Math.min(achievement.progress || 0, achievement.target))} / ${formatNumber(
          achievement.target
        )}`;
        caption.textContent = unlocked
          ? `${strings.completed} • ${progressValue}`
          : `${progressValue} • ${percentage.toFixed(0)}%`;
        card.appendChild(caption);
      }

      elements.achievementGrid.appendChild(card);
    });
  };

  const renderEgg = (state) => {
    if (!elements.egg.card) {
      return;
    }
    const count = Number(state?.count || 0);
    const target = Math.max(1, Number(state?.target || 20));
    const percentage = clampPercent(state?.percentage ?? (target ? (count / target) * 100 : 0));
    const completed = Boolean(state?.completed) || percentage >= 100 || count >= target;
    const nextTarget = Number(state?.next_target || state?.target || target);
    const previousTarget = Number(state?.previous_target || 0) || null;

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
  };

  const renderQuest = (quest) => {
    const item = document.createElement('div');
    item.className = 'alfawz-quest-item relative overflow-hidden rounded-3xl border border-[#8b1e3f]/15 bg-white/95 p-5 shadow-xl shadow-[#2e0715]/10 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl';
    item.dataset.questId = quest.id || '';

    const status = quest.status || 'in_progress';
    const isCompleted = status === 'completed' || status === 'complete';

    const header = document.createElement('div');
    header.className = 'flex items-center';
    item.appendChild(header);

    const badge = document.createElement('div');
    badge.className = `mr-4 flex h-12 w-12 flex-none items-center justify-center rounded-2xl text-2xl ${
      isCompleted ? 'bg-[#8b1e3f] text-white shadow-lg shadow-[#4d081d]/25' : 'bg-[#fbe0e8] text-[#8b1e3f] shadow-inner'
    }`;
    badge.textContent = isCompleted ? '✓' : quest.icon || '☆';
    header.appendChild(badge);

    const info = document.createElement('div');
    info.className = 'flex-1';
    header.appendChild(info);

    const title = document.createElement('p');
    title.className = 'text-lg font-bold text-[#4d081d]';
    title.textContent = quest.title || '';
    info.appendChild(title);

    if (quest.description) {
      const description = document.createElement('p');
      description.className = 'mt-1 text-base text-[#b4637a]';
      description.textContent = quest.description;
      info.appendChild(description);
    }

    const reward = document.createElement('div');
    reward.className = 'mt-3 inline-flex items-center rounded-full bg-[#fde8ef] px-3 py-1 text-sm font-semibold text-[#8b1e3f] shadow-sm';
    if (Number.isFinite(quest.reward)) {
      reward.textContent = `+${formatNumber(quest.reward)} Hasanat`;
    } else {
      reward.textContent = quest.reward_label || strings.rewardAwaiting;
    }
    item.appendChild(reward);

    if (quest.target) {
      const { wrapper, percentage } = buildProgressBar(quest.progress || 0, quest.target);
      wrapper.classList.add('mt-4');
      item.appendChild(wrapper);

      const caption = document.createElement('p');
      caption.className = 'mt-2 text-sm font-semibold text-[#7a0f32]';
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

  const puzzles = [
    {
      reference: 'Al-Fātiḥah (1:1)',
      translation: 'In the name of Allah, the Most Compassionate, the Most Merciful.',
      arabic: 'بِسْمِ ٱللّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      words: [
        'In',
        'the',
        'name',
        'of',
        'Allah,',
        'the',
        'Most',
        'Compassionate,',
        'the',
        'Most',
        'Merciful.',
      ],
    },
    {
      reference: 'Al-Ikhlāṣ (112:1)',
      translation: 'Say, “He is Allah—the One.”',
      arabic: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
      words: ['Say,', 'He', 'is', 'Allah,', 'the', 'One.'],
    },
    {
      reference: 'Ash-Sharḥ (94:5)',
      translation: 'Indeed, with hardship comes ease.',
      arabic: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
      words: ['Indeed,', 'with', 'hardship', 'comes', 'ease.'],
    },
  ];

  const shuffleArray = (items) => {
    const copy = Array.isArray(items) ? [...items] : [];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const formatSlotLabel = (index) => {
    const template = strings.gameSlotLabel || 'Slot %d';
    if (template.includes('%d')) {
      return template.replace('%d', index + 1);
    }
    return `${template} ${index + 1}`;
  };

  const gameState = {
    active: false,
    selection: null,
    tiles: new Map(),
    slotElements: [],
    slotAssignments: [],
    timerId: null,
    startTime: 0,
    moves: 0,
    completed: false,
    lastFocus: null,
    puzzle: null,
    previousOverflow: { html: '', body: '' },
  };

  const updateGameStatus = (message, state = 'neutral') => {
    if (!elements.game.status) {
      return;
    }
    elements.game.status.textContent = message || '';
    if (!state || state === 'neutral') {
      delete elements.game.status.dataset.state;
    } else {
      elements.game.status.dataset.state = state;
    }
  };

  const updateMoves = () => {
    if (elements.game.moves) {
      elements.game.moves.textContent = formatNumber(gameState.moves);
    }
  };

  const stopTimer = () => {
    if (gameState.timerId) {
      window.clearInterval(gameState.timerId);
      gameState.timerId = null;
    }
  };

  const updateTimerDisplay = () => {
    if (!elements.game.timer) {
      return;
    }
    const elapsed = Math.max(0, Math.floor((Date.now() - gameState.startTime) / 1000));
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    elements.game.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    stopTimer();
    gameState.startTime = Date.now();
    updateTimerDisplay();
    gameState.timerId = window.setInterval(updateTimerDisplay, 1000);
  };

  const clearSelectionHighlight = () => {
    if (gameState.selection === null) {
      return;
    }
    const record = gameState.tiles.get(gameState.selection);
    if (record) {
      const nextState = record.element.hasAttribute('data-slot') ? 'placed' : 'idle';
      record.element.dataset.state = nextState;
      record.element.setAttribute('aria-pressed', 'false');
    }
    gameState.selection = null;
  };

  const moveTileToBank = (tileId) => {
    const record = gameState.tiles.get(tileId);
    if (!record || !elements.game.bank) {
      return;
    }
    const slotIndexAttr = record.element.getAttribute('data-slot');
    if (slotIndexAttr !== null) {
      const slotIndex = Number(slotIndexAttr);
      if (!Number.isNaN(slotIndex)) {
        const slot = gameState.slotElements[slotIndex];
        if (slot) {
          slot.dataset.tile = '';
          slot.classList.remove('filled', 'correct', 'incorrect');
          slot.textContent = slot.dataset.placeholder || formatSlotLabel(slotIndex);
        }
        gameState.slotAssignments[slotIndex] = null;
      }
    }
    record.element.removeAttribute('data-slot');
    record.element.dataset.state = 'idle';
    record.element.setAttribute('aria-pressed', 'false');
    elements.game.bank.appendChild(record.element);
    if (gameState.selection === tileId) {
      gameState.selection = null;
    }
  };

  const placeTileInSlot = (tileId, slotIndex) => {
    const record = gameState.tiles.get(tileId);
    const slot = gameState.slotElements[slotIndex];
    if (!record || !slot) {
      return;
    }

    if (slot.dataset.tile) {
      const existingId = Number(slot.dataset.tile);
      if (!Number.isNaN(existingId)) {
        moveTileToBank(existingId);
      }
    }

    clearSelectionHighlight();
    slot.dataset.tile = String(tileId);
    slot.classList.add('filled');
    slot.classList.remove('correct', 'incorrect');
    slot.textContent = '';
    record.element.dataset.state = 'placed';
    record.element.setAttribute('aria-pressed', 'false');
    record.element.setAttribute('data-slot', String(slotIndex));
    slot.appendChild(record.element);
    gameState.slotAssignments[slotIndex] = tileId;
  };

  const handleTileClick = (tileId) => {
    const record = gameState.tiles.get(tileId);
    if (!record) {
      return;
    }

    if (record.element.hasAttribute('data-slot')) {
      moveTileToBank(tileId);
      gameState.moves += 1;
      updateMoves();
      updateGameStatus(strings.gameStatusReturned);
      return;
    }

    if (gameState.selection === tileId) {
      record.element.dataset.state = 'idle';
      record.element.setAttribute('aria-pressed', 'false');
      gameState.selection = null;
      updateGameStatus(strings.gameStatusPrompt);
      return;
    }

    clearSelectionHighlight();
    gameState.selection = tileId;
    record.element.dataset.state = 'selected';
    record.element.setAttribute('aria-pressed', 'true');
    updateGameStatus(strings.gameStatusPrompt);
  };

  const handleSlotClick = (slotIndex) => {
    const slot = gameState.slotElements[slotIndex];
    if (!slot) {
      return;
    }

    const currentTile = slot.dataset.tile ? Number(slot.dataset.tile) : null;
    if (currentTile !== null && !Number.isNaN(currentTile)) {
      if (gameState.selection !== null && gameState.selection !== currentTile) {
        moveTileToBank(currentTile);
        placeTileInSlot(gameState.selection, slotIndex);
        gameState.moves += 1;
        updateMoves();
        updateGameStatus(strings.gameStatusPlaced);
        return;
      }
      moveTileToBank(currentTile);
      gameState.moves += 1;
      updateMoves();
      updateGameStatus(strings.gameStatusReturned);
      return;
    }

    if (gameState.selection === null) {
      slot.classList.add('is-active');
      window.setTimeout(() => slot.classList.remove('is-active'), 180);
      updateGameStatus(strings.gameStatusNeedTile, 'error');
      return;
    }

    placeTileInSlot(gameState.selection, slotIndex);
    gameState.moves += 1;
    updateMoves();
    updateGameStatus(strings.gameStatusPlaced);
  };

  const checkSolution = () => {
    if (!gameState.slotElements.length) {
      return false;
    }
    let allFilled = true;
    let allCorrect = true;

    gameState.slotElements.forEach((slot, index) => {
      if (!slot) {
        return;
      }
      slot.classList.remove('correct', 'incorrect');
      const tileValue = slot.dataset.tile;
      if (!tileValue) {
        allFilled = false;
        allCorrect = false;
        return;
      }
      const tileId = Number(tileValue);
      if (Number.isNaN(tileId) || tileId !== index) {
        allCorrect = false;
        slot.classList.add('incorrect');
      } else {
        slot.classList.add('correct');
      }
    });

    if (!allFilled) {
      updateGameStatus(strings.gameStatusIncomplete, 'error');
      return false;
    }

    if (!allCorrect) {
      updateGameStatus(strings.gameStatusMismatch, 'error');
      return false;
    }

    updateGameStatus(strings.gameStatusSuccess, 'success');
    completeGame();
    return true;
  };

  const completeGame = async () => {
    if (gameState.completed) {
      return;
    }
    gameState.completed = true;
    stopTimer();
    if (elements.game.checkButton) {
      elements.game.checkButton.setAttribute('disabled', 'disabled');
    }
    try {
      const eggState = await apiRequest('egg-challenge', { method: 'POST' });
      renderEgg(eggState);
      if (elements.egg.card) {
        spawnConfetti(elements.egg.card);
      }
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to update egg challenge from game victory', error);
    }
    if (elements.gameCard) {
      spawnConfetti(elements.gameCard);
    }
  };

  const initGameBoard = () => {
    if (!elements.game.bank || !elements.game.slots) {
      return;
    }

    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    gameState.puzzle = puzzle;
    gameState.tiles = new Map();
    gameState.slotElements = [];
    gameState.slotAssignments = [];
    gameState.selection = null;
    gameState.moves = 0;
    gameState.completed = false;

    elements.game.bank.innerHTML = '';
    elements.game.slots.innerHTML = '';

    if (elements.game.reference) {
      elements.game.reference.textContent = puzzle.reference;
    }
    if (elements.game.translation) {
      elements.game.translation.textContent = puzzle.translation;
    }
    if (elements.game.arabic) {
      elements.game.arabic.textContent = puzzle.arabic;
    }
    if (elements.game.checkButton) {
      elements.game.checkButton.removeAttribute('disabled');
    }

    const tileData = puzzle.words.map((word, index) => ({ id: index, word }));
    const shuffledTiles = shuffleArray(tileData);

    shuffledTiles.forEach((tile) => {
      const tileButton = document.createElement('button');
      tileButton.type = 'button';
      tileButton.className = 'alfawz-game-tile px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
      tileButton.textContent = tile.word;
      tileButton.dataset.tileId = String(tile.id);
      tileButton.dataset.state = 'idle';
      tileButton.setAttribute('aria-pressed', 'false');
      tileButton.addEventListener('click', () => handleTileClick(tile.id));
      elements.game.bank.appendChild(tileButton);
      gameState.tiles.set(tile.id, { ...tile, element: tileButton });
    });

    puzzle.words.forEach((_, index) => {
      const slotButton = document.createElement('button');
      slotButton.type = 'button';
      slotButton.className = 'alfawz-game-slot focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
      const label = formatSlotLabel(index);
      slotButton.dataset.index = String(index);
      slotButton.dataset.placeholder = label;
      slotButton.setAttribute('aria-label', label);
      slotButton.textContent = label;
      slotButton.addEventListener('click', () => handleSlotClick(index));
      elements.game.slots.appendChild(slotButton);
      gameState.slotElements[index] = slotButton;
      gameState.slotAssignments[index] = null;
    });

    updateMoves();
    updateGameStatus(strings.gameStatusPrompt);
    startTimer();
  };

  const resetGame = () => {
    if (!gameState.active) {
      return;
    }
    initGameBoard();
  };

  const disablePageScroll = () => {
    gameState.previousOverflow = {
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
    };
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };

  const enablePageScroll = () => {
    if (gameState.previousOverflow) {
      document.documentElement.style.overflow = gameState.previousOverflow.html || '';
      document.body.style.overflow = gameState.previousOverflow.body || '';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  };

  const openGameModal = () => {
    if (!elements.gameModal || gameState.active) {
      return;
    }
    gameState.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    elements.gameModal.classList.remove('hidden');
    elements.gameModal.setAttribute('aria-hidden', 'false');
    disablePageScroll();
    gameState.active = true;
    initGameBoard();
    if (elements.gameCard && typeof elements.gameCard.focus === 'function') {
      elements.gameCard.focus();
    }
  };

  const closeGameModal = () => {
    if (!elements.gameModal || !gameState.active) {
      return;
    }
    elements.gameModal.classList.add('hidden');
    elements.gameModal.setAttribute('aria-hidden', 'true');
    stopTimer();
    enablePageScroll();
    gameState.active = false;
    gameState.selection = null;
    gameState.completed = false;
    if (gameState.lastFocus && typeof gameState.lastFocus.focus === 'function') {
      gameState.lastFocus.focus();
    }
    gameState.lastFocus = null;
  };

  if (elements.playButton && elements.gameModal && elements.game.bank && elements.game.slots) {
    elements.playButton.addEventListener('click', openGameModal);
  }
  if (elements.closeGameButton) {
    elements.closeGameButton.addEventListener('click', closeGameModal);
  }
  if (elements.game.resetButton) {
    elements.game.resetButton.addEventListener('click', resetGame);
  }
  if (elements.game.checkButton) {
    elements.game.checkButton.addEventListener('click', () => {
      checkSolution();
    });
  }
  if (elements.gameModal) {
    elements.gameModal.addEventListener('click', (event) => {
      if (event.target === elements.gameModal) {
        closeGameModal();
      }
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && gameState.active) {
      event.preventDefault();
      closeGameModal();
    }
  });

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

(() => {
  const wpData = window.alfawzData || {};
  const API_BASE = (wpData.apiUrl || '/wp-json/alfawzquran/v1/').replace(/\/+$/, '/');
  const headers = {};
  if (wpData.nonce) {
    headers['X-WP-Nonce'] = wpData.nonce;
  }

  const root = document.querySelector('#alfawz-games');
  if (!root) {
    return;
  }

  const themeText = root.querySelector('#alfawz-theme-chip');
  const loader = root.querySelector('#alfawz-game-loader');
  const card = root.querySelector('#alfawz-game-card');
  const bank = root.querySelector('#alfawz-game-bank');
  const slotsContainer = root.querySelector('#alfawz-game-slots');
  const progressBar = root.querySelector('#alfawz-game-progress');
  const progressLabel = root.querySelector('#alfawz-game-progress-label');
  const shuffleBtn = root.querySelector('#alfawz-game-shuffle');
  const resetBtn = root.querySelector('#alfawz-game-reset');
  const checkBtn = root.querySelector('#alfawz-game-check');
  const statusEl = root.querySelector('#alfawz-game-status');
  const referenceEl = root.querySelector('#alfawz-game-reference');
  const translationEl = root.querySelector('#alfawz-game-translation');
  const subtitleEl = root.querySelector('#alfawz-game-subtitle');
  const timerEl = root.querySelector('#alfawz-game-timer');
  const timerNote = root.querySelector('#alfawz-game-timer-note');
  const completedEl = root.querySelector('#alfawz-game-completed');
  const streakEl = root.querySelector('#alfawz-game-streak');
  const bestEl = root.querySelector('#alfawz-game-best');
  const habitCopy = root.querySelector('#alfawz-habit-copy');
  const unlockStatus = root.querySelector('#alfawz-unlock-status');
  const confettiHost = root.querySelector('#alfawz-game-confetti');

  if (!bank || !slotsContainer) {
    return;
  }

  const localStorageKey = 'alfawzPuzzleStats';
  let surahCache = null;
  let currentPuzzle = null;
  let timerInterval = null;
  let timerStart = null;
  let draggedTile = null;

  const themes = [
    { label: 'Emerald focus', note: 'Let every tile remind you of sincerity.' },
    { label: 'Night reciter', note: 'Match the rhythm of tahajjud in quiet focus.' },
    { label: 'Tajwid tempo', note: 'Recite with precision then rebuild the ayah.' },
    { label: 'Hifdh energy', note: 'Repeat until the order becomes second nature.' },
    { label: 'Meaning first', note: 'Reflect on the translation before arranging.' },
  ];

  const defaultStats = () => ({ completed: 0, streak: 0, bestTime: null, lastCompletion: null });

  const loadStats = () => {
    try {
      const raw = localStorage.getItem(localStorageKey);
      if (!raw) {
        return defaultStats();
      }
      const parsed = JSON.parse(raw);
      return {
        completed: Number(parsed.completed || 0),
        streak: Number(parsed.streak || 0),
        bestTime: parsed.bestTime ? Number(parsed.bestTime) : null,
        lastCompletion: parsed.lastCompletion || null,
      };
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to parse puzzle stats', error);
      return defaultStats();
    }
  };

  let stats = loadStats();

  const saveStats = () => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(stats));
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to persist puzzle stats', error);
    }
  };

  const formatDuration = (milliseconds) => {
    if (!milliseconds || Number.isNaN(milliseconds)) {
      return '--:--';
    }
    const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const updateStatsUI = () => {
    if (completedEl) {
      completedEl.textContent = String(stats.completed || 0);
    }
    if (streakEl) {
      streakEl.textContent = String(stats.streak || 0);
    }
    if (bestEl) {
      bestEl.textContent = stats.bestTime ? formatDuration(stats.bestTime) : '--:--';
    }
    updateHabitCopy();
  };

  const updateHabitCopy = () => {
    if (!habitCopy || !unlockStatus) {
      return;
    }
    const streak = Number(stats.streak || 0);
    if (streak === 0) {
      habitCopy.textContent = 'Show up daily to unlock themed reflections and extra challenges.';
      unlockStatus.textContent = 'Complete one puzzle to start your streak.';
    } else if (streak < 3) {
      habitCopy.textContent = 'Beautiful start! Keep the momentum for three straight days.';
      unlockStatus.textContent = `Streak: ${streak} day${streak === 1 ? '' : 's'} in a row.`;
    } else if (streak < 7) {
      habitCopy.textContent = 'The habit is taking root—aim for a full week of puzzles.';
      unlockStatus.textContent = `Only ${7 - streak} day(s) left to unlock the weekly reflection.`;
    } else {
      habitCopy.textContent = 'Legendary consistency! Enjoy the bonus reflections and challenge rounds.';
      unlockStatus.textContent = 'Weekly reflection unlocked. Maintain the streak for ongoing insights.';
    }
  };

  const setStatus = (message, state = '') => {
    if (!statusEl) {
      return;
    }
    statusEl.textContent = message || '';
    if (state) {
      statusEl.dataset.state = state;
    } else {
      statusEl.removeAttribute('data-state');
    }
  };

  const setProgress = (placed, total) => {
    if (progressBar) {
      const percentage = total ? Math.min(100, (placed / total) * 100) : 0;
      progressBar.style.width = `${percentage}%`;
    }
    if (progressLabel) {
      progressLabel.textContent = total ? `Tiles placed ${placed} / ${total}` : '';
    }
  };

  const shuffleArray = (array) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const apiRequest = async (path) => {
    const clean = path.replace(/^\//, '');
    const url = `${API_BASE}${clean}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
  };

  const loadSurahs = async () => {
    if (surahCache) {
      return surahCache;
    }
    const response = await apiRequest('surahs');
    surahCache = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
    return surahCache;
  };

  const cleanWords = (text) => {
    return text
      .replace(/[\u060C\u061B\u061F،؛؟“”"'()\[\]{}*_—–-]/g, ' ')
      .replace(/[.,!:;]/g, ' ')
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);
  };

  const fetchPuzzleVerse = async () => {
    const surahs = await loadSurahs();
    if (!surahs.length) {
      throw new Error('No surahs available');
    }
    const attempts = 10;
    for (let i = 0; i < attempts; i += 1) {
      const surah = surahs[Math.floor(Math.random() * surahs.length)];
      const surahId = Number(surah.number || surah.id || surah.surah_id || surah.surahId);
      const totalAyahs = Number(surah.numberOfAyahs || surah.ayahs || surah.total_verses || 0);
      if (!surahId || !totalAyahs) {
        continue;
      }
      const verseId = Math.floor(Math.random() * totalAyahs) + 1;
      const params = new URLSearchParams();
      if (wpData.defaultTranslation) {
        params.append('translation', wpData.defaultTranslation);
      }
      const query = params.toString();
      const endpoint = query
        ? `surahs/${surahId}/verses/${verseId}?${query}`
        : `surahs/${surahId}/verses/${verseId}`;
      try {
        const verseResponse = await apiRequest(endpoint);
        const translation = verseResponse?.translation || verseResponse?.data?.translation || '';
        const words = cleanWords(translation);
        if (words.length < 4 || words.length > 14) {
          continue;
        }
        return {
          surahId,
          verseId,
          surahName: verseResponse?.surah_name || surah.englishName || surah.name || `Surah ${surahId}`,
          surahNameAr: verseResponse?.surah_name_ar || '',
          verseKey: verseResponse?.verse_key || `${surahId}:${verseId}`,
          translation,
          words,
        };
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to fetch verse for puzzle', error);
      }
    }
    throw new Error('Unable to find suitable verse');
  };

  const resetSlots = () => {
    Array.from(slotsContainer.children).forEach((slot) => {
      slot.classList.remove('filled', 'correct', 'incorrect', 'is-active');
    });
  };

  const firstEmptySlot = () => {
    return Array.from(slotsContainer.children).find((slot) => !slot.firstElementChild);
  };

  const updateProgressState = () => {
    const slots = Array.from(slotsContainer.children);
    const placed = slots.filter((slot) => slot.firstElementChild).length;
    setProgress(placed, slots.length);
    if (placed === 0) {
      setStatus('Drag or tap tiles to place them into the glowing board.');
    } else if (placed < slots.length) {
      setStatus('Keep arranging until every slot is filled.');
    } else {
      setStatus('All tiles placed — check your order when ready.');
    }
  };

  const placeTileInSlot = (tile, slot) => {
    if (!tile || !slot) {
      return;
    }
    const previousParent = tile.parentElement;
    if (slot.firstElementChild) {
      bank.appendChild(slot.firstElementChild);
    }
    slot.appendChild(tile);
    slot.classList.add('filled');
    slot.classList.remove('correct', 'incorrect');
    if (previousParent && previousParent !== bank && previousParent.classList) {
      previousParent.classList.remove('filled', 'correct', 'incorrect');
    }
    updateProgressState();
  };

  const moveTileToBank = (tile) => {
    if (!tile) {
      return;
    }
    const previousParent = tile.parentElement;
    bank.appendChild(tile);
    if (previousParent && previousParent !== bank && previousParent.classList) {
      previousParent.classList.remove('filled', 'correct', 'incorrect');
    }
    updateProgressState();
  };

  const handleTileClick = (event) => {
    const tile = event.currentTarget;
    if (!tile) {
      return;
    }
    if (tile.parentElement === bank) {
      const empty = firstEmptySlot();
      if (empty) {
        placeTileInSlot(tile, empty);
      }
    } else {
      moveTileToBank(tile);
    }
  };

  const handleDragStart = (event) => {
    draggedTile = event.currentTarget;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedTile.dataset.correctIndex || '');
    draggedTile.classList.add('is-dragging');
  };

  const handleDragEnd = (event) => {
    event.currentTarget.classList.remove('is-dragging');
    draggedTile = null;
  };

  const attachTileInteractions = (tile) => {
    tile.addEventListener('click', handleTileClick);
    tile.addEventListener('dragstart', handleDragStart);
    tile.addEventListener('dragend', handleDragEnd);
    tile.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (tile.parentElement === bank) {
          const empty = firstEmptySlot();
          if (empty) {
            placeTileInSlot(tile, empty);
          }
        } else {
          moveTileToBank(tile);
        }
      }
    });
  };

  const handleSlotDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.currentTarget.classList.add('is-active');
  };

  const handleSlotDragLeave = (event) => {
    event.currentTarget.classList.remove('is-active');
  };

  const handleSlotDrop = (event) => {
    event.preventDefault();
    const slot = event.currentTarget;
    slot.classList.remove('is-active');
    if (draggedTile) {
      placeTileInSlot(draggedTile, slot);
    }
  };

  const handleBankDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleBankDrop = (event) => {
    event.preventDefault();
    if (draggedTile) {
      moveTileToBank(draggedTile);
    }
  };

  const clearBoard = () => {
    bank.innerHTML = '';
    slotsContainer.innerHTML = '';
  };

  const spawnConfetti = (host, count = 28) => {
    if (!host) {
      return;
    }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }
    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'alfawz-confetti-piece';
      piece.style.setProperty('--x', `${Math.random() * 100}%`);
      piece.style.setProperty('--y', `${Math.random() * 100}%`);
      piece.style.animationDelay = `${Math.random() * 0.2}s`;
      host.appendChild(piece);
      window.setTimeout(() => piece.remove(), 1600);
    }
  };

  const stopTimer = () => {
    if (timerInterval) {
      window.clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    timerStart = Date.now();
    if (timerEl) {
      timerEl.textContent = '00:00';
    }
    timerInterval = window.setInterval(() => {
      if (!timerStart || !timerEl) {
        return;
      }
      const diff = Date.now() - timerStart;
      timerEl.textContent = formatDuration(diff);
    }, 500);
  };

  const updateTheme = () => {
    if (!themeText) {
      return;
    }
    const theme = themes[Math.floor(Math.random() * themes.length)];
    themeText.textContent = `${theme.label} · ${theme.note}`;
  };

  const checkPuzzle = () => {
    if (!currentPuzzle) {
      return;
    }
    const slots = Array.from(slotsContainer.children);
    if (!slots.every((slot) => slot.firstElementChild)) {
      setStatus('Place all tiles before checking the answer.', 'error');
      return;
    }
    let allCorrect = true;
    slots.forEach((slot, index) => {
      slot.classList.remove('correct', 'incorrect');
      const tile = slot.firstElementChild;
      if (!tile) {
        return;
      }
      const correctIndex = Number(tile.dataset.correctIndex || '-1');
      if (correctIndex === index) {
        slot.classList.add('correct');
      } else {
        slot.classList.add('incorrect');
        allCorrect = false;
      }
    });
    if (allCorrect) {
      handleSuccess();
    } else {
      setStatus('Not quite yet—adjust tiles with a red glow.', 'error');
      window.setTimeout(() => {
        Array.from(slotsContainer.children).forEach((slot) => {
          slot.classList.remove('incorrect');
        });
      }, 1200);
    }
  };

  const handleSuccess = () => {
    stopTimer();
    setStatus('Takbir! You rebuilt the ayah perfectly.', 'success');
    const elapsed = timerStart ? Date.now() - timerStart : null;
    stats.completed = (stats.completed || 0) + 1;
    if (elapsed && (!stats.bestTime || elapsed < stats.bestTime)) {
      stats.bestTime = elapsed;
    }
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    if (stats.lastCompletion === todayKey) {
      // streak unchanged
    } else if (stats.lastCompletion === yesterdayKey) {
      stats.streak = (stats.streak || 0) + 1;
    } else {
      stats.streak = 1;
    }
    stats.lastCompletion = todayKey;
    saveStats();
    updateStatsUI();
    spawnConfetti(confettiHost);
    if (timerNote && elapsed) {
      timerNote.textContent = `Solved in ${formatDuration(elapsed)} — next puzzle loading…`;
    }
    window.setTimeout(() => {
      loadPuzzle();
    }, 1800);
  };

  const resetBoard = () => {
    Array.from(slotsContainer.children).forEach((slot) => {
      if (slot.firstElementChild) {
        bank.appendChild(slot.firstElementChild);
      }
      slot.classList.remove('filled', 'correct', 'incorrect', 'is-active');
    });
    updateProgressState();
    setStatus('Tiles returned to the bank. Try a new arrangement.');
  };

  const shuffleBank = () => {
    const tiles = Array.from(bank.children);
    const shuffled = shuffleArray(tiles);
    shuffled.forEach((tile) => {
      bank.appendChild(tile);
    });
    updateProgressState();
  };

  const renderPuzzle = (puzzle) => {
    clearBoard();
    currentPuzzle = puzzle;
    if (referenceEl) {
      const surahName = puzzle.surahName || `Surah ${puzzle.surahId}`;
      referenceEl.textContent = `${surahName} · Ayah ${puzzle.verseId}`;
    }
    if (translationEl) {
      translationEl.textContent = puzzle.translation || '';
    }
    if (subtitleEl) {
      subtitleEl.textContent = `Arrange ${puzzle.words.length} luminous tiles to reveal the ayah.`;
    }
    const slotCount = puzzle.words.length;
    for (let i = 0; i < slotCount; i += 1) {
      const slot = document.createElement('div');
      slot.className = 'alfawz-game-slot';
      slot.dataset.index = String(i);
      slot.textContent = 'Drop tile';
      slot.addEventListener('dragover', handleSlotDragOver);
      slot.addEventListener('dragleave', handleSlotDragLeave);
      slot.addEventListener('drop', handleSlotDrop);
      slotsContainer.appendChild(slot);
    }
    const tiles = shuffleArray(puzzle.words.map((word, index) => ({ word, index })));
    tiles.forEach(({ word, index }) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'alfawz-game-tile';
      tile.draggable = true;
      tile.dataset.correctIndex = String(index);
      tile.textContent = word;
      attachTileInteractions(tile);
      bank.appendChild(tile);
    });
    updateProgressState();
    updateTheme();
    startTimer();
    setStatus('Tiles ready — build the ayah from right to left meaning.');
  };

  bank.addEventListener('dragover', handleBankDragOver);
  bank.addEventListener('drop', handleBankDrop);

  const loadPuzzle = async () => {
    loader?.classList.remove('hidden');
    card?.classList.add('hidden');
    setStatus('Preparing a new ayah…');
    resetSlots();
    stopTimer();
    try {
      const puzzle = await fetchPuzzleVerse();
      renderPuzzle(puzzle);
      loader?.classList.add('hidden');
      card?.classList.remove('hidden');
      if (timerNote) {
        timerNote.textContent = 'Tiles begin to glow when they rest in the right slot.';
      }
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to load puzzle', error);
      setStatus('Unable to load a puzzle right now. Please try again.', 'error');
      loader?.classList.add('hidden');
      card?.classList.add('hidden');
    }
  };

  shuffleBtn?.addEventListener('click', () => {
    shuffleBank();
    setStatus('Tiles shuffled. Follow your intuition.');
  });

  resetBtn?.addEventListener('click', resetBoard);
  checkBtn?.addEventListener('click', checkPuzzle);

  updateStatsUI();
  loadPuzzle();
})();

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
    },
  };

  const timezoneOffset = () => -new Date().getTimezoneOffset();
  const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));
  const clampPercent = (value) => Math.max(0, Math.min(100, Number(value || 0)));

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
    const colors = ['#34d399', '#f97316', '#60a5fa', '#f59e0b', '#8b5cf6'];
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
    wrapper.className = 'mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100';

    const bar = document.createElement('div');
    bar.className = 'h-2 rounded-full bg-emerald-400 transition-all duration-500';
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
      card.className = `relative flex flex-col items-center rounded-xl border-2 p-4 text-center shadow-sm transition-transform duration-300 ${
        unlocked ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-700'
      }`;
      card.dataset.status = unlocked ? 'unlocked' : 'locked';
      card.style.setProperty('--alfawz-delay', `${index * 100}ms`);
      requestAnimationFrame(() => {
        card.classList.add('animate-pop-in');
      });

      const icon = document.createElement('div');
      icon.className = 'text-4xl';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = achievement.icon || (unlocked ? '✨' : '🔒');
      card.appendChild(icon);

      const title = document.createElement('p');
      title.className = 'mt-2 text-lg font-semibold';
      title.textContent = achievement.title || '';
      card.appendChild(title);

      if (achievement.description) {
        const description = document.createElement('p');
        description.className = 'mt-1 text-base text-emerald-800/80';
        description.textContent = achievement.description;
        card.appendChild(description);
      }

      if (Number.isFinite(achievement.reward)) {
        const reward = document.createElement('p');
        reward.className = 'mt-3 inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-emerald-700 shadow-sm';
        reward.textContent = `+${formatNumber(achievement.reward)} Hasanat`;
        card.appendChild(reward);
      }

      if (achievement.target) {
        const { wrapper, percentage } = buildProgressBar(achievement.progress || 0, achievement.target);
        wrapper.classList.add('mt-4');
        card.appendChild(wrapper);

        const caption = document.createElement('p');
        caption.className = 'mt-2 text-sm font-medium';
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
    const percentage = clampPercent(state?.percentage || (count / target) * 100);
    const completed = percentage >= 100 || count >= target;

    if (elements.egg.progress) {
      elements.egg.progress.style.width = `${percentage}%`;
    }
    if (elements.egg.label) {
      elements.egg.label.textContent = `${formatNumber(Math.min(count, target))} / ${formatNumber(target)} ${strings.verses}`;
    }
    if (elements.egg.message) {
      elements.egg.message.textContent = completed ? strings.eggComplete : strings.eggInProgress;
    }
    if (elements.egg.emoji) {
      elements.egg.emoji.textContent = completed ? '🐣' : '🥚';
    }
    if (elements.egg.card) {
      elements.egg.card.classList.toggle('alfawz-egg-hatched', completed);
    }
    if (elements.egg.level) {
      const level = Math.max(1, Math.ceil(target / 20));
      elements.egg.level.textContent = `${strings.levelLabel} ${formatNumber(level)}`;
    }
  };

  const renderQuest = (quest) => {
    const item = document.createElement('div');
    item.className = 'alfawz-quest-item relative overflow-hidden rounded-xl border border-purple-100 bg-white p-4 shadow-sm';
    item.dataset.questId = quest.id || '';

    const status = quest.status || 'in_progress';
    const isCompleted = status === 'completed' || status === 'complete';

    const header = document.createElement('div');
    header.className = 'flex items-center';
    item.appendChild(header);

    const badge = document.createElement('div');
    badge.className = `mr-3 flex h-12 w-12 flex-none items-center justify-center rounded-full text-2xl ${
      isCompleted ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-600'
    }`;
    badge.textContent = isCompleted ? '✓' : quest.icon || '☆';
    header.appendChild(badge);

    const info = document.createElement('div');
    info.className = 'flex-1';
    header.appendChild(info);

    const title = document.createElement('p');
    title.className = 'text-lg font-semibold text-slate-900';
    title.textContent = quest.title || '';
    info.appendChild(title);

    if (quest.description) {
      const description = document.createElement('p');
      description.className = 'text-base text-purple-600';
      description.textContent = quest.description;
      info.appendChild(description);
    }

    const reward = document.createElement('div');
    reward.className = 'mt-3 inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700';
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
      caption.className = 'mt-2 text-sm font-medium text-slate-700';
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

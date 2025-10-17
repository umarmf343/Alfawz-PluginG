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
    playQuest: wpData.strings?.gamePanelPlayQuestLabel || 'Play quest',
    resumeQuest: wpData.strings?.gamePanelResumeQuestLabel || 'Play again',
    playHint: wpData.strings?.gamePanelPlayQuestHint || 'Launch the activity to keep your momentum glowing.',
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

  const resolveQuestLaunchUrl = (quest = {}) => {
    if (quest.play_url) {
      return quest.play_url;
    }
    if (quest.id === 'memorize-verse' && wpData.memorizerUrl) {
      return wpData.memorizerUrl;
    }
    if (wpData.readerUrl) {
      return wpData.readerUrl;
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
    item.className =
      'alfawz-quest-item group relative overflow-hidden rounded-[32px] border border-[#f4cbd9]/70 bg-gradient-to-br from-white/95 via-[#fff5f8]/95 to-[#ffe7ef]/90 p-6 text-[#4d081d] shadow-xl shadow-[#2e0715]/15 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl focus-within:-translate-y-1 focus-within:shadow-2xl';
    item.dataset.questId = quest.id || '';

    const status = quest.status || 'in_progress';
    const isCompleted = status === 'completed' || status === 'complete';

    const halo = document.createElement('div');
    halo.className =
      'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),_transparent_65%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100';
    halo.style.zIndex = '0';
    item.appendChild(halo);

    const sparkle = document.createElement('span');
    sparkle.className =
      'pointer-events-none absolute -top-12 -right-8 h-32 w-32 rounded-full bg-[#ffd9e5]/55 blur-3xl opacity-70 transition-opacity duration-500 group-hover:opacity-100';
    sparkle.style.zIndex = '0';
    item.appendChild(sparkle);

    const header = document.createElement('div');
    header.className = 'relative z-[2] flex items-center';
    item.appendChild(header);

    const badge = document.createElement('div');
    badge.className = `relative z-[2] mr-4 flex h-12 w-12 flex-none items-center justify-center rounded-2xl text-2xl shadow-lg ${
      isCompleted
        ? 'bg-[#8b1e3f] text-white shadow-[#4d081d]/25'
        : 'bg-[#fbe0e8] text-[#8b1e3f] shadow-[#4d081d]/5'
    }`;
    badge.textContent = isCompleted ? '✓' : quest.icon || '☆';
    header.appendChild(badge);

    const info = document.createElement('div');
    info.className = 'relative z-[2] flex-1';
    header.appendChild(info);

    const title = document.createElement('p');
    title.className = 'text-lg font-black tracking-tight text-[#4d081d] sm:text-xl';
    title.textContent = quest.title || '';
    info.appendChild(title);

    if (quest.description) {
      const description = document.createElement('p');
      description.className = 'relative mt-2 text-sm font-medium text-[#b4637a]/95 sm:text-base';
      description.textContent = quest.description;
      info.appendChild(description);
    }

    const reward = document.createElement('div');
    reward.className =
      'relative z-[2] mt-4 inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-1 text-sm font-semibold text-[#8b1e3f] shadow-inner shadow-white/50 backdrop-blur';
    const rewardIcon = document.createElement('span');
    rewardIcon.className = 'text-base';
    rewardIcon.textContent = '✨';
    reward.appendChild(rewardIcon);
    const rewardLabel = document.createElement('span');
    if (Number.isFinite(quest.reward)) {
      rewardLabel.textContent = `+${formatNumber(quest.reward)} Hasanat`;
    } else {
      rewardLabel.textContent = quest.reward_label || strings.rewardAwaiting;
    }
    reward.appendChild(rewardLabel);
    item.appendChild(reward);

    if (quest.target) {
      const { wrapper, percentage } = buildProgressBar(quest.progress || 0, quest.target);
      wrapper.classList.add('relative', 'z-[2]', 'mt-5');
      item.appendChild(wrapper);

      const caption = document.createElement('p');
      caption.className = 'relative z-[2] mt-3 text-sm font-semibold text-[#7a0f32]';
      const value = `${formatNumber(Math.min(quest.progress || 0, quest.target))} / ${formatNumber(quest.target)}`;
      caption.textContent = isCompleted ? `${strings.completed} • ${value}` : `${value} • ${percentage.toFixed(0)}%`;
      item.appendChild(caption);
    }

    const actions = document.createElement('div');
    actions.className = 'relative z-[2] mt-5 flex flex-wrap items-center gap-3';

    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.className =
      'alfawz-quest-play-button inline-flex items-center gap-3 rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white';
    const playIcon = document.createElement('span');
    playIcon.className = 'alfawz-quest-play-icon';
    playIcon.textContent = '▶';
    const playLabel = document.createElement('span');
    playLabel.className = 'whitespace-nowrap';
    playLabel.textContent = isCompleted ? strings.resumeQuest : strings.playQuest;
    playButton.append(playIcon, playLabel);
    const ariaLabelParts = [playLabel.textContent];
    if (quest.title) {
      ariaLabelParts.push(quest.title);
    }
    playButton.setAttribute('aria-label', ariaLabelParts.join(' – '));

    const launchUrl = resolveQuestLaunchUrl(quest);
    if (launchUrl) {
      playButton.addEventListener('click', () => {
        playButton.classList.add('is-launching');
        const opened = window.open(launchUrl, '_blank', 'noopener');
        if (!opened) {
          window.location.href = launchUrl;
        }
        window.dispatchEvent(
          new CustomEvent('alfawz:quest-launch', {
            detail: {
              questId: quest.id || null,
              url: launchUrl,
            },
          })
        );
        window.setTimeout(() => {
          playButton.classList.remove('is-launching');
        }, 720);
      });
    } else {
      playButton.disabled = true;
      playButton.setAttribute('aria-disabled', 'true');
    }

    actions.appendChild(playButton);
    item.appendChild(actions);

    if (strings.playHint) {
      const hint = document.createElement('p');
      hint.className = 'relative z-[2] mt-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#b4637a]/75';
      hint.textContent = strings.playHint;
      item.appendChild(hint);
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

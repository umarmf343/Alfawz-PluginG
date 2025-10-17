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
  };

  let latestEggState = null;

  const timezoneOffset = () => -new Date().getTimezoneOffset();
  const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));
  const clampPercent = (value) => Math.max(0, Math.min(100, Number(value || 0)));

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

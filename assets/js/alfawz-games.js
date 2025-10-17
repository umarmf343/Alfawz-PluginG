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
  const safeParseJson = (value, fallback) => {
    if (typeof value !== 'string') {
      return fallback;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  };

  const localStore = (() => {
    try {
      const testKey = '__alfawz-test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (error) {
      return null;
    }
  })();

  const readStorage = (key, fallback) => {
    if (!localStore) {
      return fallback;
    }
    const value = localStore.getItem(key);
    return value === null ? fallback : safeParseJson(value, fallback);
  };

  const writeStorage = (key, value) => {
    if (!localStore) {
      return;
    }
    try {
      localStore.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore write failures silently.
    }
  };

  const dateKey = (value = new Date()) => {
    const instance = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(instance.getTime())) {
      return null;
    }
    return instance.toISOString().slice(0, 10);
  };

  const diffInDays = (from, to) => {
    if (!from || !to) {
      return null;
    }
    const start = new Date(`${from}T00:00:00Z`);
    const end = new Date(`${to}T00:00:00Z`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }
    const msPerDay = 86400000;
    return Math.round((end.getTime() - start.getTime()) / msPerDay);
  };

  const shuffleArray = (items) => {
    const list = Array.isArray(items) ? [...items] : [];
    for (let index = list.length - 1; index > 0; index -= 1) {
      const j = Math.floor(Math.random() * (index + 1));
      [list[index], list[j]] = [list[j], list[index]];
    }
    return list;
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

  const initializeDailyVerseGame = () => {
    const container = root.querySelector('#alfawz-daily-verse-game');
    if (!container) {
      return;
    }

    const lobby = container.querySelector('[data-role="daily-game-lobby"]');
    const stage = container.querySelector('[data-role="daily-game-stage"]');
    const card = container.querySelector('[data-role="daily-game-card"]');
    const startButton = container.querySelector('[data-role="daily-game-start"]');
    const startLabel = container.querySelector('[data-role="daily-game-start-label"]');
    const statusEl = container.querySelector('[data-role="daily-game-status"]');
    const referenceEl = container.querySelector('[data-role="daily-verse-reference"]');
    const arabicEl = container.querySelector('[data-role="daily-verse-arabic"]');
    const translationEl = container.querySelector('[data-role="daily-verse-translation"]');
    const questionEl = container.querySelector('[data-role="daily-game-question"]');
    const optionsContainer = container.querySelector('[data-role="daily-game-options"]');
    const feedbackWrap = container.querySelector('[data-role="daily-game-feedback"]');
    const feedbackTitle = container.querySelector('[data-role="daily-game-feedback-title"]');
    const feedbackBody = container.querySelector('[data-role="daily-game-feedback-body"]');
    const reflectionEl = container.querySelector('[data-role="daily-game-reflection"]');
    const finishedButton = container.querySelector('[data-role="daily-game-finished"]');
    const progressEl = container.querySelector('[data-role="daily-game-progress"]');

    const scoreboard = {
      streak: container.querySelector('[data-role="daily-game-streak"]'),
      xp: container.querySelector('[data-role="daily-game-xp"]'),
      best: container.querySelector('[data-role="daily-game-best"]'),
      streakHint: container.querySelector('[data-role="daily-game-streak-hint"]'),
      xpHint: container.querySelector('[data-role="daily-game-xp-hint"]'),
      bestHint: container.querySelector('[data-role="daily-game-best-hint"]'),
    };

    const dailyStrings = {
      readyStatus: 'Today’s ayah is waiting. Press play when you are ready to reflect.',
      reviewStatus: 'You already unlocked today’s meaning. Revisit it anytime.',
      successStatus: 'Meaning unlocked! Return tomorrow for another ayah.',
      encourageStatus: 'Reflect once more on the translation and try a different meaning.',
      correctTitle: 'Brilliant insight!',
      wrongTitle: 'Reflect again',
      wrongBody: 'Read the verse carefully and search for the meaning that matches its message.',
      xpHintPrefix: 'Today’s reward',
      progressPrefix: 'Attempts today',
      completedProgress: 'Meaning secured',
      reviewProgress: 'Meaning locked earlier today',
      xpTag: 'Wisdom XP',
      reviewLabel: 'Review Meaning',
    };

    const versePool = [
      {
        id: 'alfawz-daily-bismillah',
        reference: 'Al-Fātiḥah · Ayah 1',
        arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
        translation: 'In the Name of Allah—the Most Compassionate, Most Merciful.',
        question: 'What habit does this ayah nurture in our daily actions?',
        options: [
          {
            id: 'begin-with-allah',
            text: 'Start every action by saying “Bismillah” and leaning on Allah’s mercy.',
          },
          {
            id: 'finish-fast',
            text: 'Finish tasks as fast as possible so you have more free time.',
          },
          {
            id: 'ask-friends',
            text: 'Ask a friend for permission before you begin anything important.',
          },
        ],
        answer: 'begin-with-allah',
        meaning:
          'This opening ayah teaches us to anchor every effort in Allah’s name, trusting His endless mercy to guide the outcome.',
        reflection: 'Say “Bismillah” aloud before your next task and notice how it fills the moment with calm focus.',
        anchor: 'Meaning anchor: Everything begins best by remembering Allah.',
        xp: 70,
      },
      {
        id: 'alfawz-daily-ease',
        reference: 'Ash-Sharḥ · Ayah 5-6',
        arabic: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا • إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
        translation: 'So, surely with hardship comes ease. Yes, surely with hardship comes ease.',
        question: 'How does this ayah shape the way we face challenges?',
        options: [
          {
            id: 'hopeful-patience',
            text: 'Hold firm to hope because every challenge is paired with relief from Allah.',
          },
          {
            id: 'avoid-effort',
            text: 'Avoid difficult tasks so you never feel stretched.',
          },
          {
            id: 'instant-results',
            text: 'Expect instant results without working steadily through hardship.',
          },
        ],
        answer: 'hopeful-patience',
        meaning:
          'Allah promises that ease accompanies hardship, encouraging us to stay patient and expect His relief even while we work.',
        reflection: 'When a challenge feels tough today, whisper “Allah will bring ease” and keep moving forward.',
        anchor: 'Meaning anchor: Hardship never arrives alone—ease travels with it.',
        xp: 65,
      },
      {
        id: 'alfawz-daily-trust',
        reference: 'Al-Baqarah · Ayah 286',
        arabic: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
        translation: 'Allah does not burden any soul with more than it can bear.',
        question: 'What reassurance does this ayah give when life feels overwhelming?',
        options: [
          {
            id: 'power-within',
            text: 'Allah knows your capacity and gives you the strength to handle your responsibilities.',
          },
          {
            id: 'give-up',
            text: 'Give up quickly because burdens are always heavier than you can manage.',
          },
          {
            id: 'swap-duties',
            text: 'Swap your duties with others so you never have to face tough moments.',
          },
        ],
        answer: 'power-within',
        meaning:
          'This ayah reassures us that every test is within our ability, gifting confidence that Allah believes in our resilience.',
        reflection: 'List one challenge you overcame before—it is proof that Allah made you capable again today.',
        anchor: 'Meaning anchor: Your load fits the strength Allah placed within you.',
        xp: 60,
      },
      {
        id: 'alfawz-daily-time',
        reference: 'Al-ʿAṣr · Ayah 1-3',
        arabic:
          'وَٱلْعَصْرِ • إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ • إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ',
        translation:
          'By time! Surely humanity is in loss—except those who believe, do good deeds, urge one another to the truth, and urge one another to patience.',
        question: 'What winning routine does Surah Al-ʿAṣr guide us to build?',
        options: [
          {
            id: 'faithful-actions',
            text: 'Use time for faith, good deeds, truth, and patient support with others.',
          },
          {
            id: 'solo-success',
            text: 'Focus only on personal success and ignore everyone else.',
          },
          {
            id: 'endless-rest',
            text: 'Rest endlessly because time is meant only for relaxation.',
          },
        ],
        answer: 'faithful-actions',
        meaning:
          'The surah shows a four-part formula: faith, good deeds, truthful reminders, and patient teamwork save our time from loss.',
        reflection: 'Choose one friend or sibling and share a positive reminder with them today.',
        anchor: 'Meaning anchor: Time turns into treasure through faith, action, truth, and patience.',
        xp: 75,
      },
      {
        id: 'alfawz-daily-gratitude',
        reference: 'Ar-Raḥmān · Ayah 13',
        arabic: 'فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ',
        translation: 'So which of the favours of your Lord will you deny?',
        question: 'What mindset does this ayah spark every single day?',
        options: [
          {
            id: 'spot-blessings',
            text: 'Keep spotting Allah’s endless blessings and respond with grateful praise.',
          },
          {
            id: 'count-problems',
            text: 'Count problems more than blessings so you stay alert to danger.',
          },
          {
            id: 'delay-gratitude',
            text: 'Delay gratitude until life feels completely perfect.',
          },
        ],
        answer: 'spot-blessings',
        meaning:
          'Allah repeats this ayah to wake our hearts up to gratitude—every moment is packed with gifts to acknowledge.',
        reflection: 'Before sleeping, whisper three things you are thankful for from today.',
        anchor: 'Meaning anchor: Gratitude keeps blessings shining.',
        xp: 60,
      },
      {
        id: 'alfawz-daily-service',
        reference: 'Aḍ-Ḍuḥā · Ayah 11',
        arabic: 'وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ',
        translation: 'And proclaim the blessings of your Lord.',
        question: 'How should we respond when Allah gifts us blessings?',
        options: [
          {
            id: 'share-goodness',
            text: 'Use His blessings to spread goodness and inspire others with gratitude.',
          },
          {
            id: 'hide-gifts',
            text: 'Hide every blessing so no one knows about it.',
          },
          {
            id: 'boast-alone',
            text: 'Boast loudly to feel superior to other people.',
          },
        ],
        answer: 'share-goodness',
        meaning:
          'This ayah invites us to recognize blessings out loud in a humble way that motivates service and thankfulness.',
        reflection: 'Share one blessing from today with a friend and say “Alhamdulillah” together.',
        anchor: 'Meaning anchor: Blessings grow when they inspire gratitude and kindness.',
        xp: 55,
      },
      {
        id: 'alfawz-daily-unity',
        reference: 'Al-Ḥujurāt · Ayah 13',
        arabic:
          'يَـٰٓأَيُّهَا ٱلنَّاسُ إِنَّا خَلَقْنَـٰكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَـٰكُمْ شُعُوبًا وَقَبَآئِلَ لِتَعَارَفُوا۟ إِنَّ أَكْرَمَكُمْ عِندَ ٱللَّهِ أَتْقَىٰكُمْ',
        translation:
          'O humankind! We created you from a single man and woman, and made you peoples and tribes so that you may know one another. Surely the most noble of you in Allah’s sight is the most mindful of Him.',
        question: 'What community habit does this ayah teach?',
        options: [
          {
            id: 'celebrate-diversity',
            text: 'Celebrate diversity and focus on taqwa instead of status.',
          },
          {
            id: 'stay-isolated',
            text: 'Stay isolated from people who are different from you.',
          },
          {
            id: 'compete-status',
            text: 'Compete for status so others feel smaller than you.',
          },
        ],
        answer: 'celebrate-diversity',
        meaning:
          'Allah reminds us that honour comes from taqwa—not tribe or status—so we should connect, learn, and honour every believer.',
        reflection: 'Greet someone different from you today with warmth and a sincere duʿāʾ for them.',
        anchor: 'Meaning anchor: Unity plus taqwa beats ego and division.',
        xp: 70,
      },
      {
        id: 'alfawz-daily-sincerity',
        reference: 'Al-Ikhlāṣ · Ayah 1-4',
        arabic:
          'قُلْ هُوَ ٱللَّهُ أَحَدٌ • ٱللَّهُ ٱلصَّمَدُ • لَمْ يَلِدْ وَلَمْ يُولَدْ • وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ',
        translation:
          'Say, “He is Allah, the One! Allah, the Eternal Refuge. He neither begets nor is born, nor is there anything comparable to Him.”',
        question: 'How does Surah Al-Ikhlāṣ shape our belief and worship?',
        options: [
          {
            id: 'pure-worship',
            text: 'Worship Allah alone with sincerity because no one compares to Him.',
          },
          {
            id: 'seek-idols',
            text: 'Seek help from idols to feel extra protected.',
          },
          {
            id: 'mix-beliefs',
            text: 'Mix different beliefs together so everyone is satisfied.',
          },
        ],
        answer: 'pure-worship',
        meaning:
          'These verses crown our hearts with tawḥīd—knowing Allah is unique, eternal, and the only One worthy of worship.',
        reflection: 'Recite Surah Al-Ikhlāṣ after Maghrib tonight and let its meaning settle deeply.',
        anchor: 'Meaning anchor: Pure tawḥīd lights every act of worship.',
        xp: 80,
      },
      {
        id: 'alfawz-daily-hope',
        reference: 'Az-Zumar · Ayah 53',
        arabic:
          'قُلْ يَـٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا',
        translation:
          'Say, “O My servants who have exceeded the limits against their souls! Do not lose hope in Allah’s mercy, for Allah certainly forgives all sins.”',
        question: 'What heart-shift does this ayah invite when we slip?',
        options: [
          {
            id: 'return-with-hope',
            text: 'Return to Allah with hopeful repentance because His mercy is vast.',
          },
          {
            id: 'hide-mistakes',
            text: 'Hide mistakes forever and believe forgiveness is impossible.',
          },
          {
            id: 'repeat-errors',
            text: 'Repeat sins proudly since mercy is guaranteed regardless.',
          },
        ],
        answer: 'return-with-hope',
        meaning:
          'Allah personally invites sinners back with optimism—His mercy welcomes every sincere repentant heart.',
        reflection: 'Make a heartfelt duʿāʾ seeking forgiveness tonight, trusting Allah’s mercy.',
        anchor: 'Meaning anchor: Never despair—mercy is always open.',
        xp: 75,
      },
      {
        id: 'alfawz-daily-guidance',
        reference: 'Al-Baqarah · Ayah 2',
        arabic: 'ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ',
        translation: 'This is the Book about which there is no doubt—a guidance for the mindful.',
        question: 'What commitment does this ayah ask from us toward the Qur’an?',
        options: [
          {
            id: 'follow-guidance',
            text: 'Trust the Qur’an completely and follow it with a mindful heart.',
          },
          {
            id: 'doubt-often',
            text: 'Keep doubting the Qur’an until proof appears from elsewhere.',
          },
          {
            id: 'use-rarely',
            text: 'Read the Qur’an rarely because guidance can wait.',
          },
        ],
        answer: 'follow-guidance',
        meaning:
          'Allah announces that the Qur’an is a doubt-free guide for people of taqwa—inviting us to approach it with trust and obedience.',
        reflection: 'Plan one small action today inspired by an ayah you love and carry it through.',
        anchor: 'Meaning anchor: Guidance opens fully when we approach with taqwa.',
        xp: 65,
      },
    ];

    const baseDate = '2024-01-01';
    const todayKey = dateKey();
    const offset = diffInDays(baseDate, todayKey) ?? 0;
    const index = versePool.length ? ((offset % versePool.length) + versePool.length) % versePool.length : 0;
    const todaysVerse = versePool[Math.min(index, versePool.length - 1)];
    if (!todaysVerse) {
      return;
    }

    const STORAGE_KEY = 'alfawzDailyVerseProgress';
    const defaultProgress = {
      streak: 0,
      best: 0,
      wisdomXp: 0,
      lastCompleted: null,
      lastVerseId: null,
      attemptsToday: 0,
      lastAttemptDate: null,
      totalAttempts: 0,
    };

    let progress = readStorage(STORAGE_KEY, defaultProgress) || defaultProgress;
    progress = {
      ...defaultProgress,
      ...progress,
    };
    progress.streak = Number(progress.streak) || 0;
    progress.best = Number(progress.best) || 0;
    progress.wisdomXp = Number(progress.wisdomXp) || 0;
    progress.attemptsToday = Number(progress.attemptsToday) || 0;
    progress.totalAttempts = Number(progress.totalAttempts) || 0;

    let requiresPersist = false;

    if (progress.lastCompleted) {
      const gap = diffInDays(progress.lastCompleted, todayKey);
      if (gap !== null && gap > 1) {
        progress.streak = 0;
        requiresPersist = true;
      }
    }

    if (progress.lastAttemptDate) {
      const attemptGap = diffInDays(progress.lastAttemptDate, todayKey);
      if (attemptGap === null || attemptGap !== 0) {
        progress.attemptsToday = 0;
        requiresPersist = true;
      }
    }

    const xpReward = Number(todaysVerse.xp || 60);
    const hasCompletedToday =
      progress.lastCompleted === todayKey && progress.lastVerseId === todaysVerse.id && progress.streak >= 0;

    let answered = false;
    let optionButtons = [];

    const persist = () => {
      writeStorage(STORAGE_KEY, {
        ...progress,
      });
    };

    if (requiresPersist) {
      persist();
    }

    const setStatus = (message) => {
      if (statusEl) {
        statusEl.textContent = message;
      }
    };

    const updateScoreboard = () => {
      if (scoreboard.streak) {
        scoreboard.streak.textContent = formatNumber(progress.streak);
      }
      if (scoreboard.xp) {
        scoreboard.xp.textContent = formatNumber(progress.wisdomXp);
      }
      if (scoreboard.best) {
        scoreboard.best.textContent = formatNumber(progress.best);
      }
    };

    const updateScoreboardHints = () => {
      if (scoreboard.streakHint) {
        scoreboard.streakHint.textContent = progress.streak > 0 ? 'Keep it glowing!' : 'Day one begins now.';
      }
      if (scoreboard.xpHint) {
        scoreboard.xpHint.textContent = `+${formatNumber(xpReward)} ${dailyStrings.xpTag} when you succeed today.`;
      }
      if (scoreboard.bestHint) {
        scoreboard.bestHint.textContent = progress.best > 0 ? 'Personal record so far.' : 'Set your first record!';
      }
    };

    const updateProgressMessage = (completed = false, xpEarned = xpReward, options = {}) => {
      if (!progressEl) {
        return;
      }
      if (completed) {
        if (options.review) {
          progressEl.textContent = `${dailyStrings.reviewProgress} • ${dailyStrings.xpTag}: ${formatNumber(progress.wisdomXp)}`;
          return;
        }
        const attemptsValue = Number(progress.attemptsToday || 0);
        const attemptsLabel = `${formatNumber(attemptsValue)} ${attemptsValue === 1 ? 'attempt' : 'attempts'}`;
        progressEl.textContent = `${dailyStrings.completedProgress} • +${formatNumber(xpEarned)} ${dailyStrings.xpTag} • ${attemptsLabel}`;
        return;
      }
      const attemptsValue = Number(progress.attemptsToday || 0);
      const attemptsLabel = `${formatNumber(attemptsValue)} ${attemptsValue === 1 ? 'attempt' : 'attempts'}`;
      progressEl.textContent = `${dailyStrings.progressPrefix}: ${attemptsLabel} • ${dailyStrings.xpHintPrefix}: +${formatNumber(xpReward)} ${dailyStrings.xpTag}`;
    };

    const showFeedback = (success, options = {}) => {
      if (!feedbackWrap) {
        return;
      }
      const { verse, hint, xpEarned = xpReward, review = false } = options;
      feedbackWrap.hidden = false;
      if (feedbackTitle) {
        feedbackTitle.textContent = success ? dailyStrings.correctTitle : dailyStrings.wrongTitle;
      }
      if (feedbackBody) {
        if (success && verse) {
          feedbackBody.textContent = verse.meaning;
        } else {
          feedbackBody.textContent = dailyStrings.wrongBody;
        }
      }
      if (reflectionEl) {
        if (success && verse) {
          reflectionEl.textContent = verse.reflection;
        } else if (verse) {
          reflectionEl.textContent = hint || verse.anchor || '';
        } else {
          reflectionEl.textContent = hint || '';
        }
      }
      if (success) {
        updateProgressMessage(true, xpEarned, { review });
      }
    };

    const lockOptions = (correctId) => {
      optionButtons.forEach((button) => {
        const optionId = button?.dataset?.optionId;
        button.disabled = true;
        button.classList.add('is-locked');
        if (optionId === correctId) {
          button.classList.add('is-correct');
        } else {
          button.classList.add('is-disabled');
        }
      });
    };

    const handleSuccess = (button, verse) => {
      answered = true;
      button.classList.add('is-correct', 'is-celebrating');
      lockOptions(verse.answer);

      const lastCompletedDiff = progress.lastCompleted ? diffInDays(progress.lastCompleted, todayKey) : null;
      if (lastCompletedDiff === 1) {
        progress.streak += 1;
      } else if (lastCompletedDiff === 0) {
        // Already counted today; no change.
      } else {
        progress.streak = 1;
      }
      progress.best = Math.max(progress.best || 0, progress.streak || 0);
      progress.wisdomXp += xpReward;
      progress.lastCompleted = todayKey;
      progress.lastVerseId = verse.id;
      progress.attemptsToday = Number(progress.attemptsToday || 0);
      progress.totalAttempts = Number(progress.totalAttempts || 0);
      progress.attemptsToday += 1;
      progress.totalAttempts += 1;
      progress.lastAttemptDate = todayKey;
      persist();

      updateScoreboard();
      updateScoreboardHints();
      showFeedback(true, { verse, xpEarned: xpReward });
      setStatus(dailyStrings.successStatus);
      if (finishedButton) {
        finishedButton.classList.remove('hidden');
      }
      if (card) {
        card.classList.add('is-complete');
        spawnConfetti(card);
      }
    };

    const handleFailure = (button, verse) => {
      button.classList.add('is-incorrect');
      button.disabled = true;
      progress.attemptsToday = Number(progress.attemptsToday || 0) + 1;
      progress.totalAttempts = Number(progress.totalAttempts || 0) + 1;
      progress.lastAttemptDate = todayKey;
      persist();
      updateProgressMessage(false);
      setStatus(dailyStrings.encourageStatus);
      showFeedback(false, { verse, hint: verse.anchor });
    };

    const renderVerse = (verse, options = {}) => {
      const { review = false } = options;
      answered = review;
      optionButtons = [];
      if (referenceEl) {
        referenceEl.textContent = verse.reference;
      }
      if (arabicEl) {
        arabicEl.textContent = verse.arabic;
      }
      if (translationEl) {
        translationEl.textContent = verse.translation;
      }
      if (questionEl) {
        questionEl.textContent = verse.question;
      }
      if (feedbackWrap) {
        feedbackWrap.hidden = true;
      }

      if (optionsContainer) {
        optionsContainer.innerHTML = '';
        const randomized = review ? verse.options : shuffleArray(verse.options);
        randomized.forEach((option) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'alfawz-daily-game-option';
          button.dataset.optionId = option.id;
          button.innerHTML = `<span>${option.text}</span>`;
          if (review) {
            button.disabled = true;
            button.classList.add('is-locked');
            if (option.id === verse.answer) {
              button.classList.add('is-correct');
            } else {
              button.classList.add('is-disabled');
            }
          } else {
            button.addEventListener('click', () => {
              if (answered) {
                return;
              }
              if (option.id === verse.answer) {
                handleSuccess(button, verse);
              } else {
                handleFailure(button, verse);
              }
            });
          }
          optionsContainer.appendChild(button);
          optionButtons.push(button);
        });
      }

      if (review) {
        showFeedback(true, { verse, xpEarned: 0, review: true });
        if (finishedButton) {
          finishedButton.classList.remove('hidden');
        }
        updateProgressMessage(true, 0, { review: true });
        setStatus(dailyStrings.reviewStatus);
      } else {
        updateProgressMessage(false);
        setStatus(dailyStrings.readyStatus);
      }
    };

    const openStage = (options = {}) => {
      if (lobby) {
        lobby.classList.add('hidden');
      }
      if (stage) {
        stage.classList.remove('hidden');
      }
      renderVerse(todaysVerse, options);
    };

    if (startButton) {
      startButton.addEventListener('click', () => {
        const review = Boolean(hasCompletedToday);
        openStage({ review });
      });
      if (hasCompletedToday && startLabel) {
        startLabel.textContent = dailyStrings.reviewLabel;
      }
    }

    if (finishedButton) {
      finishedButton.addEventListener('click', () => {
        if (stage) {
          stage.classList.add('hidden');
        }
        if (lobby) {
          lobby.classList.remove('hidden');
        }
        if (startButton && startLabel) {
          startLabel.textContent = dailyStrings.reviewLabel;
        }
        setStatus(dailyStrings.reviewStatus);
      });
    }

    updateScoreboard();
    updateScoreboardHints();
    if (hasCompletedToday) {
      updateProgressMessage(true, 0, { review: true });
      showFeedback(true, { verse: todaysVerse, xpEarned: 0, review: true });
      setStatus(dailyStrings.reviewStatus);
      if (feedbackWrap) {
        feedbackWrap.hidden = false;
      }
    } else {
      updateProgressMessage(false);
      setStatus(dailyStrings.readyStatus);
      if (feedbackWrap) {
        feedbackWrap.hidden = true;
      }
    }
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

  initializeDailyVerseGame();
  loadData();
})();

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

  const initVirtueGardenTycoon = () => {
    const section = root.querySelector('#virtue-garden-tycoon');
    if (!section) {
      return;
    }

    const startButton = section.querySelector('#virtue-garden-start');
    const screen = section.querySelector('#virtue-garden-screen');
    const modal = section.querySelector('#virtue-garden-modal');
    const modalCompleteButton = modal?.querySelector('#virtue-garden-complete-task');
    const modalCloseButtons = modal ? Array.from(modal.querySelectorAll('[data-role="modal-dismiss"]')) : [];

    const elementsGarden = {
      seeds: section.querySelector('#virtue-seed-count'),
      harmony: section.querySelector('#virtue-harmony'),
      flourish: section.querySelector('#virtue-flourish'),
      flourishBar: section.querySelector('#virtue-flourish-bar'),
      streak: section.querySelector('#virtue-streak'),
      tasks: section.querySelector('#virtue-garden-task-list'),
      dailySummary: section.querySelector('#virtue-daily-summary'),
      gardenGrid: section.querySelector('#virtue-garden-grid'),
      story: section.querySelector('#virtue-garden-story'),
      weather: section.querySelector('#virtue-garden-weather'),
      upgrades: section.querySelector('#virtue-upgrade-list'),
      modal: {
        root: modal,
        chip: modal?.querySelector('#virtue-garden-modal-chip') || null,
        title: modal?.querySelector('#virtue-garden-modal-title') || null,
        description: modal?.querySelector('#virtue-garden-modal-description') || null,
        prompt: modal?.querySelector('#virtue-garden-modal-prompt') || null,
        reward: modal?.querySelector('#virtue-garden-modal-reward') || null,
      },
    };

    const storageKey = 'alfawz:virtue-garden-tycoon';
    const MAX_SLOTS = 6;
    const STAGE_LABELS = ['Seedling', 'Sprout', 'Bloom', 'Radiant Tree'];
    const STAGE_EMOJIS = ['🌱', '🌿', '🌸', '🌳'];
    const STAGE_THRESHOLDS = [0, 28, 68, 120];
    const WEATHER_STATES = [
      { label: 'Tranquil skies', hint: 'Seeds glow softly today.' },
      { label: 'Dawn shimmer', hint: 'Reflection missions grant bonus harmony.' },
      { label: 'Ihsan breeze', hint: 'Plants respond eagerly to nurture sessions.' },
      { label: 'Moonlit hush', hint: 'Complete tafsir missions for radiant boosts.' },
      { label: 'Rain of mercy', hint: 'New seedlings germinate faster.' },
    ];
    const PLANT_PREFIXES = ['Radiant', 'Serene', 'Guiding', 'Noor', 'Verdant', 'Hafidh', 'Barakah', 'Jannah'];
    const PLANT_TYPES = ['Palm', 'Lily', 'Cedar', 'Rose', 'Jasmine', 'Olive', 'Tulip', 'Willow'];
    const PLANT_TRAITS = [
      'Amplifies tajwid focus',
      'Boosts reflection clarity',
      'Invites mindful recitation',
      'Raises tafsir curiosity',
      'Brightens memorisation mood',
      'Steadies nightly review',
      'Encourages dua journaling',
      'Spreads gentle gratitude',
    ];
    const PLANT_BLESSINGS = [
      'Releases a harmony wave when blooming',
      'Sprinkles bonus seeds after every streak milestone',
      'Guides you to a fresh tafsir insight',
      'Teaches a luminous dua when flourishing',
      'Unlocks a serene breathing exercise',
      'Shares a scholar quote during reflection',
    ];
    const PLANT_MOODS = ['Tranquil', 'Joyful', 'Curious', 'Hopeful', 'Determined', 'Gentle'];
    const TASKS = [
      {
        id: 'recite',
        title: 'Recitation Sprint',
        chip: 'Recite',
        icon: '🎙️',
        description: 'Recite three ayat aloud, paying attention to tajwid and melody.',
        seeds: 12,
        xp: 16,
        maxCompletions: 2,
        prompts: [
          {
            label: 'Melody focus',
            steps: [
              'Pick a short passage from today\'s review list.',
              'Recite aloud and highlight every qalqalah or mad you notice.',
              'Repeat the ayah once more while smiling to soften your tone.',
            ],
            reflection: 'Which tajwid rule brightened your recitation most today?',
          },
          {
            label: 'Power breath',
            steps: [
              'Stand tall and take a deep breath before reciting.',
              'Sustain your breath for as long as possible on a single ayah.',
              'Mark any place you needed to pause and retry with stronger breath.',
            ],
            reflection: 'How did your breathing change the feeling of the ayat?',
          },
        ],
      },
      {
        id: 'reflect',
        title: 'Reflection Journal',
        chip: 'Reflect',
        icon: '🪞',
        description: 'Pause with one ayah and write a heartfelt takeaway.',
        seeds: 14,
        xp: 18,
        maxCompletions: 2,
        prompts: [
          {
            label: 'Heart map',
            steps: [
              'Choose an ayah that feels relevant to you right now.',
              'Write down three emotions the ayah awakens inside you.',
              'Describe one action you can take inspired by the ayah.',
            ],
            reflection: 'Who could you share this reflection with today?',
          },
          {
            label: 'Gratitude glow',
            steps: [
              'Read the ayah slowly twice, once silently and once aloud.',
              'List two blessings mentioned or implied in the ayah.',
              'Craft a short dua thanking Allah for those blessings.',
            ],
            reflection: 'Which blessing felt newly appreciated after reflecting?',
          },
        ],
      },
      {
        id: 'tafseer',
        title: 'Tafsir Discovery',
        chip: 'Learn',
        icon: '📚',
        description: 'Study a tafsir snippet and share the gem you uncovered.',
        seeds: 16,
        xp: 22,
        maxCompletions: 1,
        prompts: [
          {
            label: 'Context clues',
            steps: [
              'Read a short tafsir paragraph for an ayah you love.',
              'Note the historical moment or lesson highlighted by scholars.',
              'Explain the insight aloud as if teaching a younger sibling.',
            ],
            reflection: 'What surprised you about the ayah\'s deeper context?',
          },
          {
            label: 'Keyword hunt',
            steps: [
              'Pick an Arabic keyword from the ayah and look up its root meaning.',
              'List two synonyms that expand your understanding of the verse.',
              'Share the meaning in your journal with a colourful doodle.',
            ],
            reflection: 'How does this keyword reshape your appreciation of the message?',
          },
        ],
      },
    ];
    const UPGRADE_CATALOG = [
      {
        id: 'waterBlessing',
        title: 'Water Blessing',
        icon: '💧',
        description: 'Reduce nurture costs by 1 (never below 2).',
        costBase: 24,
        costStep: 10,
        maxLevel: 3,
      },
      {
        id: 'knowledgeFountain',
        title: 'Knowledge Fountain',
        icon: '📖',
        description: 'Each mission grants +2 bonus seeds per level.',
        costBase: 30,
        costStep: 12,
        maxLevel: 3,
      },
      {
        id: 'shrineGlow',
        title: 'Shrine Glow',
        icon: '✨',
        description: 'Plants earn +4 extra growth XP per nurture.',
        costBase: 34,
        costStep: 14,
        maxLevel: 3,
      },
    ];
    const NEW_PLANT_COST = 8;

    const defaultTasksState = () => {
      const result = {};
      TASKS.forEach((task) => {
        result[task.id] = { completions: 0 };
      });
      return result;
    };

    const defaultUpgradesState = () => {
      const result = {};
      UPGRADE_CATALOG.forEach((upgrade) => {
        result[upgrade.id] = 0;
      });
      return result;
    };

    const defaultState = () => ({
      seeds: 15,
      harmony: 28,
      streak: 0,
      dayCount: 1,
      currentDay: null,
      tasks: defaultTasksState(),
      plants: Array.from({ length: MAX_SLOTS }, () => null),
      unlockedSlots: 3,
      selectedPlant: null,
      story: [],
      totalCompletions: 0,
      upgrades: defaultUpgradesState(),
      weatherIndex: Math.floor(Math.random() * WEATHER_STATES.length),
      visited: false,
    });

    const getTodayKey = () => {
      const now = new Date();
      const month = `${now.getMonth() + 1}`.padStart(2, '0');
      const day = `${now.getDate()}`.padStart(2, '0');
      return `${now.getFullYear()}-${month}-${day}`;
    };

    const differenceInDays = (from, to) => {
      if (!from || !to) {
        return 0;
      }
      const fromDate = new Date(`${from}T00:00:00`);
      const toDate = new Date(`${to}T00:00:00`);
      const diff = Math.round((toDate - fromDate) / 86400000);
      return Number.isFinite(diff) ? diff : 0;
    };

    const randomFrom = (list) => {
      if (!Array.isArray(list) || !list.length) {
        return null;
      }
      return list[Math.floor(Math.random() * list.length)];
    };

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const localStorageAvailable = () => {
      try {
        return typeof window !== 'undefined' && 'localStorage' in window;
      } catch (error) {
        return false;
      }
    };

    const loadState = () => {
      const base = defaultState();
      if (!localStorageAvailable()) {
        return base;
      }
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            base.seeds = Number.isFinite(parsed.seeds) ? parsed.seeds : base.seeds;
            base.harmony = Number.isFinite(parsed.harmony) ? parsed.harmony : base.harmony;
            base.streak = Number.isFinite(parsed.streak) ? parsed.streak : base.streak;
            base.dayCount = Number.isFinite(parsed.dayCount) ? parsed.dayCount : base.dayCount;
            base.currentDay = typeof parsed.currentDay === 'string' ? parsed.currentDay : base.currentDay;
            base.unlockedSlots = clamp(Number(parsed.unlockedSlots || base.unlockedSlots), 1, MAX_SLOTS);
            base.selectedPlant = typeof parsed.selectedPlant === 'string' ? parsed.selectedPlant : base.selectedPlant;
            base.totalCompletions = Number.isFinite(parsed.totalCompletions) ? parsed.totalCompletions : base.totalCompletions;
            base.weatherIndex = Number.isFinite(parsed.weatherIndex)
              ? Math.abs(parsed.weatherIndex) % WEATHER_STATES.length
              : base.weatherIndex;
            base.visited = Boolean(parsed.visited);
            if (Array.isArray(parsed.story)) {
              base.story = parsed.story.slice(0, 20);
            }
            if (parsed.tasks && typeof parsed.tasks === 'object') {
              base.tasks = { ...defaultTasksState(), ...parsed.tasks };
            }
            if (Array.isArray(parsed.plants)) {
              base.plants = Array.from({ length: MAX_SLOTS }, (_, index) => parsed.plants[index] || null);
            }
            if (parsed.upgrades && typeof parsed.upgrades === 'object') {
              base.upgrades = { ...defaultUpgradesState(), ...parsed.upgrades };
            }
          }
        }
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to load Virtue Garden state:', error);
      }
      return base;
    };

    let state = loadState();

    const saveState = () => {
      if (!localStorageAvailable()) {
        return;
      }
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.warn('[AlfawzQuran] Unable to save Virtue Garden state:', error);
      }
    };

    const addStoryEntry = (title, detail, tone = 'log') => {
      if (!state.story) {
        state.story = [];
      }
      state.story.unshift({
        id: `story-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        title,
        detail,
        tone,
        time: Date.now(),
      });
      if (state.story.length > 20) {
        state.story.length = 20;
      }
    };

    const ensureSelectedPlant = () => {
      if (state.selectedPlant && state.plants.some((plant) => plant && plant.id === state.selectedPlant)) {
        return;
      }
      const firstPlant = state.plants.find((plant) => Boolean(plant));
      state.selectedPlant = firstPlant ? firstPlant.id : null;
    };

    const syncDay = () => {
      const todayKey = getTodayKey();
      if (state.currentDay === todayKey) {
        return;
      }
      const difference = differenceInDays(state.currentDay, todayKey);
      state.currentDay = todayKey;
      if (difference === 1) {
        state.streak = (state.streak || 0) + 1;
      } else {
        state.streak = 1;
      }
      state.dayCount = Math.max(1, (state.dayCount || 1) + (difference > 0 ? 1 : 0));
      state.tasks = defaultTasksState();
      state.totalCompletions = 0;
      state.harmony = Math.max(18, Math.round((state.harmony || 28) * 0.92));
      state.weatherIndex = Math.floor(Math.random() * WEATHER_STATES.length);
      addStoryEntry('Sunrise Blessings', 'A new day dawns in the Virtue Garden. Fresh missions await!', 'daybreak');
      saveState();
    };

    const createPlant = () => ({
      id: `plant-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name: `${randomFrom(PLANT_PREFIXES)} ${randomFrom(PLANT_TYPES)}`,
      stage: 0,
      xp: 0,
      trait: randomFrom(PLANT_TRAITS),
      blessing: randomFrom(PLANT_BLESSINGS),
      mood: randomFrom(PLANT_MOODS),
      createdAt: Date.now(),
      lastBoosted: Date.now(),
    });

    const getPlantStageLabel = (plant) => STAGE_LABELS[clamp(plant.stage, 0, STAGE_LABELS.length - 1)] || STAGE_LABELS[0];

    const getPlantEmoji = (plant) => STAGE_EMOJIS[clamp(plant.stage, 0, STAGE_EMOJIS.length - 1)] || '🌱';

    const getNurtureCost = (plant) => {
      const baseCost = 5 + plant.stage * 3;
      const reduction = state.upgrades.waterBlessing || 0;
      return Math.max(2, baseCost - reduction);
    };

    const boostPlant = (plant, xpGain, reason = 'nurture') => {
      if (!plant || !Number.isFinite(xpGain)) {
        return;
      }
      const bonus = state.upgrades.shrineGlow || 0;
      const totalXpGain = xpGain + bonus * 4;
      plant.xp += totalXpGain;
      plant.lastBoosted = Date.now();

      let leveledUp = false;
      while (plant.stage < STAGE_LABELS.length - 1) {
        const nextThreshold = STAGE_THRESHOLDS[plant.stage + 1] || Infinity;
        if (plant.xp < nextThreshold) {
          break;
        }
        plant.stage += 1;
        leveledUp = true;
        state.harmony = Math.min(160, (state.harmony || 28) + 10 + plant.stage * 2);
        addStoryEntry(
          `${plant.name} advanced!`,
          `${getPlantStageLabel(plant)} unlocked • ${plant.blessing}`,
          'garden'
        );
      }
      if (!leveledUp && reason === 'nurture') {
        state.harmony = Math.min(160, (state.harmony || 28) + 3 + bonus);
      }
    };

    const plantSeed = (slot) => {
      if (state.seeds < NEW_PLANT_COST) {
        addStoryEntry('Need more seeds', 'Complete a mission to gather enough virtue seeds for planting.', 'log');
        return;
      }
      const plant = createPlant();
      state.seeds -= NEW_PLANT_COST;
      state.plants[slot] = plant;
      state.selectedPlant = plant.id;
      boostPlant(plant, 12, 'plant');
      addStoryEntry('New seedling planted', `${plant.name} is settling in with a ${plant.trait.toLowerCase()}.`, 'garden');
      saveState();
      renderGarden();
      renderStats();
    };

    const nurturePlant = (plant) => {
      const cost = getNurtureCost(plant);
      if (state.seeds < cost) {
        addStoryEntry('Not enough seeds', 'Complete more missions to gather seeds for nurturing.', 'log');
        return;
      }
      state.seeds -= cost;
      boostPlant(plant, 14 + plant.stage * 4, 'nurture');
      addStoryEntry('Nurture session', `${plant.name} soaked up ${cost} seeds of care.`, 'garden');
      saveState();
      renderGarden();
      renderStats();
    };

    const unlockPlot = () => {
      if (state.unlockedSlots >= MAX_SLOTS) {
        return;
      }
      const cost = 40 + state.unlockedSlots * 15;
      if (state.seeds < cost) {
        addStoryEntry('Unlock blocked', 'You need more seeds to open a new garden plot.', 'log');
        return;
      }
      state.seeds -= cost;
      state.unlockedSlots = clamp(state.unlockedSlots + 1, 1, MAX_SLOTS);
      addStoryEntry('New plot unlocked', 'A fresh garden bed is ready for planting!', 'garden');
      saveState();
      renderGarden();
      renderStats();
    };

    const totalMissionSlots = TASKS.reduce((sum, task) => sum + task.maxCompletions, 0);

    const getTaskState = (taskId) => {
      if (!state.tasks[taskId]) {
        state.tasks[taskId] = { completions: 0 };
      }
      return state.tasks[taskId];
    };

    const completeTask = (task, prompt) => {
      const taskState = getTaskState(task.id);
      if (taskState.completions >= task.maxCompletions) {
        return;
      }
      const upgradeBonus = (state.upgrades.knowledgeFountain || 0) * 2;
      const streakBonus = Math.min(6, state.streak || 0);
      const chanceBonus = Math.random() < 0.35 ? 3 : 0;
      const seedsEarned = task.seeds + upgradeBonus + streakBonus + chanceBonus;
      state.seeds += seedsEarned;
      state.harmony = Math.min(170, (state.harmony || 28) + 6 + streakBonus);
      taskState.completions += 1;
      state.totalCompletions = (state.totalCompletions || 0) + 1;
      const activePlant = state.plants.find((plant) => plant && plant.id === state.selectedPlant) || state.plants.find(Boolean);
      if (activePlant) {
        boostPlant(activePlant, task.xp, 'mission');
      }
      addStoryEntry(
        `${task.title} complete!`,
        `+${seedsEarned} virtue seeds${prompt?.label ? ` • Focus: ${prompt.label}` : ''}.`,
        'task'
      );
      saveState();
      renderAll();
    };

    let activeModalTask = null;
    let activeModalPrompt = null;

    const closeModal = () => {
      if (!elementsGarden.modal.root) {
        return;
      }
      elementsGarden.modal.root.classList.add('hidden');
      elementsGarden.modal.root.classList.remove('is-visible');
      activeModalTask = null;
      activeModalPrompt = null;
    };

    const renderModalPrompt = (prompt) => {
      if (!elementsGarden.modal.prompt) {
        return;
      }
      elementsGarden.modal.prompt.innerHTML = '';
      if (!prompt) {
        return;
      }
      const list = document.createElement('ol');
      list.className = 'virtue-garden-modal__steps';
      prompt.steps?.forEach((step, index) => {
        const item = document.createElement('li');
        item.innerHTML = `<span>${index + 1}.</span><p>${step}</p>`;
        list.appendChild(item);
      });
      elementsGarden.modal.prompt.appendChild(list);
      if (prompt.reflection) {
        const reflection = document.createElement('p');
        reflection.className = 'virtue-garden-modal__reflection';
        reflection.textContent = prompt.reflection;
        elementsGarden.modal.prompt.appendChild(reflection);
      }
    };

    const openTaskModal = (task) => {
      if (!modal || !task) {
        return;
      }
      const prompt = randomFrom(task.prompts) || null;
      activeModalTask = task;
      activeModalPrompt = prompt;
      elementsGarden.modal.root?.classList.remove('hidden');
      elementsGarden.modal.root?.classList.add('is-visible');
      if (elementsGarden.modal.chip) {
        elementsGarden.modal.chip.textContent = task.chip || '';
      }
      if (elementsGarden.modal.title) {
        elementsGarden.modal.title.textContent = task.title;
      }
      if (elementsGarden.modal.description) {
        elementsGarden.modal.description.textContent = task.description;
      }
      if (elementsGarden.modal.reward) {
        const taskState = getTaskState(task.id);
        const remaining = task.maxCompletions - taskState.completions;
        elementsGarden.modal.reward.textContent = remaining > 0
          ? `${remaining} attempt${remaining === 1 ? '' : 's'} remaining today`
          : 'All attempts used today';
      }
      renderModalPrompt(prompt);
    };

    const renderStats = () => {
      if (elementsGarden.seeds) {
        elementsGarden.seeds.textContent = formatNumber(state.seeds || 0);
      }
      if (elementsGarden.harmony) {
        elementsGarden.harmony.textContent = formatNumber(state.harmony || 0);
      }
      if (elementsGarden.streak) {
        elementsGarden.streak.textContent = formatNumber(state.streak || 0);
      }
      const totalCompleted = TASKS.reduce(
        (sum, task) => sum + (getTaskState(task.id).completions || 0),
        0
      );
      const totalAvailable = totalMissionSlots || 1;
      const percentage = clamp(Math.round((totalCompleted / totalAvailable) * 100), 0, 100);
      if (elementsGarden.flourish) {
        elementsGarden.flourish.textContent = `${percentage}%`;
      }
      if (elementsGarden.flourishBar) {
        elementsGarden.flourishBar.style.width = `${percentage}%`;
      }
      if (elementsGarden.dailySummary) {
        elementsGarden.dailySummary.textContent = `${totalCompleted} of ${totalAvailable} missions completed`;
      }
    };

    const renderTasks = () => {
      if (!elementsGarden.tasks) {
        return;
      }
      elementsGarden.tasks.innerHTML = '';
      TASKS.forEach((task) => {
        const taskState = getTaskState(task.id);
        const completed = taskState.completions >= task.maxCompletions;
        const card = document.createElement('article');
        card.className = `virtue-task-card${completed ? ' is-complete' : ''}`;
        const header = document.createElement('div');
        header.className = 'virtue-task-card__header';
        const icon = document.createElement('span');
        icon.className = 'virtue-task-card__icon';
        icon.textContent = task.icon || '🌱';
        header.appendChild(icon);
        const titleWrap = document.createElement('div');
        const chip = document.createElement('span');
        chip.className = 'virtue-task-card__chip';
        chip.textContent = task.chip || '';
        const title = document.createElement('h4');
        title.className = 'virtue-task-card__title';
        title.textContent = task.title;
        titleWrap.appendChild(chip);
        titleWrap.appendChild(title);
        header.appendChild(titleWrap);
        card.appendChild(header);

        const description = document.createElement('p');
        description.className = 'virtue-task-card__description';
        description.textContent = task.description;
        card.appendChild(description);

        const progress = document.createElement('div');
        progress.className = 'virtue-task-card__progress';
        const progressLabel = document.createElement('span');
        progressLabel.textContent = `${taskState.completions} / ${task.maxCompletions}`;
        const progressBar = document.createElement('div');
        progressBar.className = 'virtue-task-card__progress-bar';
        const innerBar = document.createElement('div');
        innerBar.style.width = `${clamp((taskState.completions / task.maxCompletions) * 100, 0, 100)}%`;
        progressBar.appendChild(innerBar);
        progress.appendChild(progressLabel);
        progress.appendChild(progressBar);
        card.appendChild(progress);

        const actions = document.createElement('div');
        actions.className = 'virtue-task-card__actions';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'virtue-task-card__button';
        button.textContent = completed ? strings.completed || 'Completed' : strings.playNow || 'Play Now';
        if (completed) {
          button.disabled = true;
        } else {
          button.addEventListener('click', (event) => {
            event.preventDefault();
            openTaskModal(task);
          });
        }
        actions.appendChild(button);
        card.appendChild(actions);
        elementsGarden.tasks.appendChild(card);
      });
    };

    const renderGarden = () => {
      if (!elementsGarden.gardenGrid) {
        return;
      }
      elementsGarden.gardenGrid.innerHTML = '';
      ensureSelectedPlant();
      for (let index = 0; index < state.unlockedSlots; index += 1) {
        const plant = state.plants[index];
        if (plant) {
          const card = document.createElement('div');
          card.className = 'virtue-garden-plot';
          card.dataset.stage = `${clamp(plant.stage, 0, STAGE_LABELS.length - 1)}`;
          if (state.selectedPlant === plant.id) {
            card.classList.add('is-active');
          }
          const header = document.createElement('div');
          header.className = 'virtue-garden-plot__header';
          const emoji = document.createElement('span');
          emoji.className = 'virtue-garden-plot__emoji';
          emoji.textContent = getPlantEmoji(plant);
          header.appendChild(emoji);
          const titleWrap = document.createElement('div');
          const title = document.createElement('h4');
          title.className = 'virtue-garden-plot__title';
          title.textContent = plant.name;
          const mood = document.createElement('p');
          mood.className = 'virtue-garden-plot__mood';
          mood.textContent = `${plant.mood} • ${getPlantStageLabel(plant)}`;
          titleWrap.appendChild(title);
          titleWrap.appendChild(mood);
          header.appendChild(titleWrap);
          card.appendChild(header);

          const trait = document.createElement('p');
          trait.className = 'virtue-garden-plot__trait';
          trait.textContent = plant.trait;
          card.appendChild(trait);

          const progress = document.createElement('div');
          progress.className = 'virtue-garden-plot__progress';
          const nextThreshold = STAGE_THRESHOLDS[plant.stage + 1] || STAGE_THRESHOLDS[STAGE_THRESHOLDS.length - 1];
          const percent = plant.stage >= STAGE_LABELS.length - 1
            ? 100
            : clamp((plant.xp / nextThreshold) * 100, 0, 100);
          const progressInner = document.createElement('div');
          progressInner.style.width = `${percent}%`;
          progress.appendChild(progressInner);
          const progressLabel = document.createElement('span');
          progressLabel.className = 'virtue-garden-plot__xp';
          progressLabel.textContent = plant.stage >= STAGE_LABELS.length - 1
            ? 'Legendary form achieved'
            : `${Math.round(plant.xp)} xp • next bloom at ${nextThreshold}`;
          card.appendChild(progress);
          card.appendChild(progressLabel);

          const blessing = document.createElement('p');
          blessing.className = 'virtue-garden-plot__blessing';
          blessing.textContent = plant.blessing;
          card.appendChild(blessing);

          const actions = document.createElement('div');
          actions.className = 'virtue-garden-plot__actions';
          const focusButton = document.createElement('button');
          focusButton.type = 'button';
          focusButton.className = 'virtue-garden-plot__focus';
          focusButton.textContent = state.selectedPlant === plant.id ? 'Focused' : 'Set Focus';
          if (state.selectedPlant !== plant.id) {
            focusButton.addEventListener('click', () => {
              state.selectedPlant = plant.id;
              addStoryEntry('Focus shifted', `${plant.name} is now your spotlight plant.`, 'garden');
              saveState();
              renderGarden();
            });
          } else {
            focusButton.disabled = true;
          }

          const nurtureButton = document.createElement('button');
          nurtureButton.type = 'button';
          nurtureButton.className = 'virtue-garden-plot__action';
          const nurtureCost = getNurtureCost(plant);
          nurtureButton.textContent = `Nurture (${nurtureCost} seeds)`;
          if (state.seeds < nurtureCost) {
            nurtureButton.disabled = true;
          } else {
            nurtureButton.addEventListener('click', () => {
              nurturePlant(plant);
            });
          }
          actions.appendChild(focusButton);
          actions.appendChild(nurtureButton);
          card.appendChild(actions);

          elementsGarden.gardenGrid.appendChild(card);
        } else {
          const emptyCard = document.createElement('div');
          emptyCard.className = 'virtue-garden-plot virtue-garden-plot--empty';
          const label = document.createElement('p');
          label.className = 'virtue-garden-plot__empty-label';
          label.textContent = 'Empty plot • Plant a new virtue seed';
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'virtue-garden-plot__action';
          button.textContent = `Plant seed (${NEW_PLANT_COST} seeds)`;
          if (state.seeds < NEW_PLANT_COST) {
            button.disabled = true;
          } else {
            button.addEventListener('click', () => {
              plantSeed(index);
            });
          }
          emptyCard.appendChild(label);
          emptyCard.appendChild(button);
          elementsGarden.gardenGrid.appendChild(emptyCard);
        }
      }

      if (state.unlockedSlots < MAX_SLOTS) {
        const unlockCard = document.createElement('div');
        unlockCard.className = 'virtue-garden-plot virtue-garden-plot--locked';
        const title = document.createElement('h4');
        title.textContent = 'Locked plot';
        const description = document.createElement('p');
        description.textContent = 'Spend seeds to expand your garden and welcome new companions.';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'virtue-garden-plot__action';
        const cost = 40 + state.unlockedSlots * 15;
        button.textContent = `Unlock for ${cost} seeds`;
        if (state.seeds < cost) {
          button.disabled = true;
        } else {
          button.addEventListener('click', () => {
            unlockPlot();
          });
        }
        unlockCard.appendChild(title);
        unlockCard.appendChild(description);
        unlockCard.appendChild(button);
        elementsGarden.gardenGrid.appendChild(unlockCard);
      }
    };

    const renderStory = () => {
      if (!elementsGarden.story) {
        return;
      }
      elementsGarden.story.innerHTML = '';
      const storyItems = Array.isArray(state.story) && state.story.length ? state.story : [
        {
          id: 'story-empty',
          title: 'Welcome to Virtue Garden Tycoon!',
          detail: 'Start a mission to collect virtue seeds and plant your first seedling.',
          tone: 'daybreak',
          time: Date.now(),
        },
      ];

      const formatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: 'numeric' });
      storyItems.forEach((entry) => {
        const item = document.createElement('div');
        item.className = `virtue-garden-story${entry.tone ? ` virtue-garden-story--${entry.tone}` : ''}`;
        const title = document.createElement('p');
        title.className = 'virtue-garden-story__title';
        title.textContent = entry.title;
        const detail = document.createElement('p');
        detail.className = 'virtue-garden-story__detail';
        detail.textContent = entry.detail;
        const time = document.createElement('span');
        time.className = 'virtue-garden-story__time';
        time.textContent = formatter.format(new Date(entry.time));
        item.appendChild(title);
        item.appendChild(detail);
        item.appendChild(time);
        elementsGarden.story.appendChild(item);
      });
    };

    const renderUpgrades = () => {
      if (!elementsGarden.upgrades) {
        return;
      }
      elementsGarden.upgrades.innerHTML = '';
      UPGRADE_CATALOG.forEach((upgrade) => {
        const level = state.upgrades[upgrade.id] || 0;
        const card = document.createElement('div');
        card.className = 'virtue-upgrade-card';
        const header = document.createElement('div');
        header.className = 'virtue-upgrade-card__header';
        const icon = document.createElement('span');
        icon.className = 'virtue-upgrade-card__icon';
        icon.textContent = upgrade.icon || '✨';
        const title = document.createElement('h4');
        title.textContent = upgrade.title;
        header.appendChild(icon);
        header.appendChild(title);
        card.appendChild(header);

        const description = document.createElement('p');
        description.className = 'virtue-upgrade-card__description';
        description.textContent = upgrade.description;
        card.appendChild(description);

        const levelBadge = document.createElement('span');
        levelBadge.className = 'virtue-upgrade-card__level';
        levelBadge.textContent = `Level ${level}`;
        card.appendChild(levelBadge);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'virtue-upgrade-card__button';
        if (level >= upgrade.maxLevel) {
          button.textContent = 'Maxed out';
          button.disabled = true;
        } else {
          const cost = upgrade.costBase + upgrade.costStep * level;
          button.textContent = `Upgrade • ${cost} seeds`;
          if (state.seeds < cost) {
            button.disabled = true;
          } else {
            button.addEventListener('click', () => {
              state.seeds -= cost;
              state.upgrades[upgrade.id] = level + 1;
              state.harmony = Math.min(180, (state.harmony || 28) + 12);
              addStoryEntry('Upgrade unlocked', `${upgrade.title} reached level ${level + 1}.`, 'upgrade');
              saveState();
              renderUpgrades();
              renderStats();
            });
          }
        }
        card.appendChild(button);
        elementsGarden.upgrades.appendChild(card);
      });
    };

    const renderWeather = () => {
      if (!elementsGarden.weather) {
        return;
      }
      const weather = WEATHER_STATES[state.weatherIndex] || WEATHER_STATES[0];
      elementsGarden.weather.textContent = weather.label;
      elementsGarden.weather.title = weather.hint;
    };

    const renderAll = () => {
      renderStats();
      renderTasks();
      renderGarden();
      renderUpgrades();
      renderStory();
      renderWeather();
    };

    if (modalCompleteButton) {
      modalCompleteButton.addEventListener('click', () => {
        if (!activeModalTask) {
          return;
        }
        const taskState = getTaskState(activeModalTask.id);
        if (taskState.completions >= activeModalTask.maxCompletions) {
          closeModal();
          return;
        }
        completeTask(activeModalTask, activeModalPrompt);
        closeModal();
      });
    }

    modalCloseButtons.forEach((button) => {
      button.addEventListener('click', () => {
        closeModal();
      });
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    });

    if (startButton) {
      startButton.addEventListener('click', () => {
        if (screen) {
          screen.classList.remove('hidden');
          requestAnimationFrame(() => {
            screen.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }
        startButton.textContent = strings.keepGoing || 'Keep Going';
        state.visited = true;
        saveState();
      });
    }

    if (state.visited && screen) {
      screen.classList.remove('hidden');
    }

    syncDay();
    renderAll();
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
  initVirtueGardenTycoon();
})();

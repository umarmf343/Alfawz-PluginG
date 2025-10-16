(function () {
  'use strict';
  const settings = window.alfawzTeacherData || {};
  const root = document.getElementById('alfawz-teacher-dashboard');

  if (!root) {
    return;
  }

  const API_BASE = (settings.apiUrl || '/wp-json/alfawzquran/v1/').replace(/\/+$/, '/');
  const HEADERS = {};
  if (settings.nonce) {
    HEADERS['X-WP-Nonce'] = settings.nonce;
  }

  const strings = settings.strings || {};

  const state = {
    assignments: [],
    classes: [],
    memorization: [],
  };

  const reduceMotionQuery =
    typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  let prefersReducedMotion = reduceMotionQuery ? reduceMotionQuery.matches : false;
  let animateObserver = null;
  const animationFrameIds = new WeakMap();

  const assignmentTable = document.getElementById('alfawz-teacher-assignment-rows');
  const classCards = document.getElementById('alfawz-teacher-class-cards');
  const memoList = document.getElementById('alfawz-teacher-memo-list');
  const activityList = document.getElementById('alfawz-teacher-activity-list');
  const memoPill = document.getElementById('alfawz-teacher-memo-pill');

  const metricTargets = {
    classes: Array.from(document.querySelectorAll('[data-alfawz-metric="classes"]')),
    students: Array.from(document.querySelectorAll('[data-alfawz-metric="students"]')),
    assignments: Array.from(document.querySelectorAll('[data-alfawz-metric="assignments"]')),
    memorization: Array.from(document.querySelectorAll('[data-alfawz-metric="memorization"]')),
  };

  const setElementDelay = (element, delayOverride) => {
    if (!element) {
      return;
    }

    if (typeof delayOverride === 'number' && Number.isFinite(delayOverride)) {
      element.setAttribute('data-alfawz-delay', delayOverride.toFixed(2));
    } else if (typeof delayOverride === 'string') {
      element.setAttribute('data-alfawz-delay', delayOverride);
    }

    const delayAttr = element.getAttribute('data-alfawz-delay');
    if (delayAttr !== null) {
      const delay = Number(delayAttr);
      if (Number.isFinite(delay)) {
        element.style.setProperty('--alfawz-animate-delay', `${delay}s`);
      }
    }
  };

  const initAnimatedElements = () => {
    const animated = Array.from(root.querySelectorAll('[data-alfawz-animate]'));

    if (!animated.length) {
      return;
    }

    if (animateObserver) {
      animateObserver.disconnect();
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      animateObserver = null;
      animated.forEach((element) => {
        setElementDelay(element);
        element.classList.add('is-visible');
      });
      return;
    }

    animateObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            setElementDelay(target);
            target.classList.add('is-visible');
            animateObserver.unobserve(target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
    );

    animated.forEach((element) => {
      element.classList.remove('is-visible');
      setElementDelay(element);
      animateObserver.observe(element);
    });
  };

  const registerAnimatedElement = (element, delay = null) => {
    if (!element) {
      return;
    }

    setElementDelay(element, delay);

    if (prefersReducedMotion || !animateObserver) {
      element.classList.add('is-visible');
      return;
    }

    element.classList.remove('is-visible');
    animateObserver.observe(element);
  };

  const handleReduceMotionChange = (event) => {
    prefersReducedMotion = !!(event && event.matches);
    initAnimatedElements();
  };

  if (reduceMotionQuery) {
    if (typeof reduceMotionQuery.addEventListener === 'function') {
      reduceMotionQuery.addEventListener('change', handleReduceMotionChange);
    } else if (typeof reduceMotionQuery.addListener === 'function') {
      reduceMotionQuery.addListener(handleReduceMotionChange);
    }
  }

  const stopAnimation = (element) => {
    if (!element) {
      return;
    }
    const frameId = animationFrameIds.get(element);
    if (frameId) {
      cancelAnimationFrame(frameId);
      animationFrameIds.delete(element);
    }
  };

  const formatNumber = (value) => {
    const number = Number(value || 0);
    return Number.isFinite(number) ? new Intl.NumberFormat().format(number) : '0';
  };

  const formatMetricText = (value, label) => {
    const formatted = formatNumber(Math.max(0, Math.round(value)));
    return label ? `${formatted} ${label}`.trim() : formatted;
  };

  const animateNumberTo = (element, targetValue, label) => {
    if (!element) {
      return;
    }

    stopAnimation(element);

    const storedValue = Number(element.dataset.alfawzCurrentValue);
    const parsedCurrent = Number.isFinite(storedValue)
      ? storedValue
      : Number(String(element.textContent || '').replace(/[^0-9.-]/g, ''));
    const startValue = Number.isFinite(parsedCurrent) ? parsedCurrent : 0;

    if (prefersReducedMotion || Math.abs(targetValue - startValue) < 1) {
      const finalValue = Math.max(0, Math.round(targetValue));
      element.dataset.alfawzCurrentValue = finalValue;
      element.textContent = formatMetricText(finalValue, label);
      return;
    }

    const duration = 900;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (targetValue - startValue) * eased;
      const rounded = Math.max(0, Math.round(currentValue));
      element.dataset.alfawzCurrentValue = currentValue;
      element.textContent = formatMetricText(rounded, label);

      if (progress < 1) {
        const frameId = requestAnimationFrame(step);
        animationFrameIds.set(element, frameId);
      } else {
        const finalValue = Math.max(0, Math.round(targetValue));
        element.dataset.alfawzCurrentValue = finalValue;
        element.textContent = formatMetricText(finalValue, label);
        animationFrameIds.delete(element);
      }
    };

    const frameId = requestAnimationFrame(step);
    animationFrameIds.set(element, frameId);
  };

  const updateLabelledValue = (element, value, fallbackLabel = '') => {
    if (!element) {
      return;
    }

    const label = element.getAttribute('data-label') || fallbackLabel || '';
    const numericValue = typeof value === 'number' ? value : Number(value);

    if (Number.isFinite(numericValue)) {
      animateNumberTo(element, numericValue, label);
      return;
    }

    stopAnimation(element);
    const text = String(value ?? '').trim();
    const suffix = label ? ` ${label}` : '';
    element.textContent = text ? `${text}${suffix}`.trim() : label;
  };

  const updateMetricGroup = (key, value, fallbackLabel) => {
    const targets = metricTargets[key] || [];
    targets.forEach((element) => updateLabelledValue(element, value, fallbackLabel));
  };

  const formatDate = (value) => {
    if (!value) {
      return '';
    }
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return value;
    }
  };

  const buildApiUrl = (path) => {
    const clean = String(path || '').replace(/^\/+/, '');
    return `${API_BASE}${clean}`;
  };

  const apiRequest = async (path, options = {}) => {
    const url = buildApiUrl(path);
    const fetchOptions = {
      method: options.method || 'GET',
      headers: { ...HEADERS, ...(options.headers || {}) },
    };

    if (options.body instanceof FormData) {
      fetchOptions.body = options.body;
    } else if (options.body !== undefined && options.body !== null) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed (${response.status})`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  const createAssignmentButton = document.getElementById('alfawz-teacher-create-assignment');
  const refreshButtons = Array.from(document.querySelectorAll('[data-alfawz-teacher-refresh]'));
  const builderWrapper = document.getElementById('alfawz-qaidah-wrapper');
  const builderStatus = document.getElementById('alfawz-teacher-qaidah-status');
  const previewModal = document.getElementById('alfawz-teacher-assignment-modal');
  const previewClose = document.getElementById('alfawz-teacher-assignment-modal-close');
  const previewTitle = document.getElementById('alfawz-teacher-assignment-modal-title');
  const previewMeta = document.getElementById('alfawz-teacher-assignment-modal-meta');
  const previewImage = document.getElementById('alfawz-teacher-assignment-modal-image');
  const previewHotspots = document.getElementById('alfawz-teacher-assignment-modal-hotspots');

  const ensureBuilderApi = () => new Promise((resolve) => {
    if (window.alfawzQaidahTeacher) {
      resolve(window.alfawzQaidahTeacher);
      return;
    }
    const handler = () => {
      resolve(window.alfawzQaidahTeacher);
    };
    document.addEventListener('alfawzQaidahReady', handler, { once: true });
  });

  const toggleBuilder = (show) => {
    if (!builderWrapper) {
      return;
    }
    builderWrapper.classList.toggle('hidden', show === false);
  };

  const openBuilderForCreate = async () => {
    toggleBuilder(true);
    if (builderStatus) {
      builderStatus.textContent = strings.builderOpening || strings.loading || '';
    }
    try {
      const api = await ensureBuilderApi();
      api?.reset?.();
      api?.focus?.();
      if (builderStatus) {
        builderStatus.textContent = strings.builderReady || '';
      }
    } catch (error) {
      console.error('[AlfawzQuran] Unable to initialise builder', error);
      if (builderStatus) {
        builderStatus.textContent = strings.assignmentLoadError || '';
      }
    }
  };

  const editAssignmentInBuilder = async (assignmentId) => {
    toggleBuilder(true);
    if (builderStatus) {
      builderStatus.textContent = strings.loading || '';
    }
    try {
      const api = await ensureBuilderApi();
      await api?.editAssignment?.(assignmentId);
      api?.focus?.();
      if (builderStatus) {
        builderStatus.textContent = strings.builderReady || '';
      }
    } catch (error) {
      console.error('[AlfawzQuran] Unable to load assignment for editing', error);
      if (builderStatus) {
        builderStatus.textContent = strings.assignmentLoadError || '';
      }
    }
  };

  const closePreview = () => {
    if (!previewModal) {
      return;
    }
    previewModal.classList.add('hidden');
  };

  const openPreview = (assignment) => {
    if (!previewModal || !previewImage || !previewHotspots) {
      return;
    }

    previewTitle.textContent = assignment?.title || '';
    const classLabel = assignment?.class?.label || '';
    const updatedLabel = assignment?.updated ? `${strings.updatedLabel || 'Updated'} ${formatDate(assignment.updated)}` : '';
    previewMeta.textContent = [classLabel, updatedLabel].filter(Boolean).join(' • ');

    previewHotspots.innerHTML = '';

    if (assignment?.image?.url) {
      previewImage.style.display = '';
      previewImage.src = assignment.image.url;
      if (Array.isArray(assignment.hotspots)) {
        assignment.hotspots.forEach((hotspot, index) => {
          const marker = document.createElement('span');
          marker.className = 'alfawz-qaidah-hotspot';
          marker.style.left = hotspot.x || '0%';
          marker.style.top = hotspot.y || '0%';
          marker.textContent = String(index + 1);
          marker.setAttribute('aria-hidden', 'true');
          previewHotspots.appendChild(marker);
        });
      }
    } else {
      previewImage.style.display = 'none';
      const message = document.createElement('p');
      message.className = 'px-4 py-6 text-sm text-slate-500';
      message.textContent = strings.assignmentPreviewError || 'Preview unavailable for this assignment.';
      previewHotspots.appendChild(message);
    }

    previewModal.classList.remove('hidden');
  };

  const renderAssignments = () => {
    if (!assignmentTable) {
      return;
    }
    assignmentTable.innerHTML = '';
    assignmentTable.setAttribute('aria-busy', 'false');

    if (!state.assignments.length) {
      const row = document.createElement('tr');
      row.setAttribute('data-alfawz-animate', 'scale');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.className = 'px-4 py-6 text-center text-base text-[#7b1e3c]/70';
      cell.textContent = strings.noAssignments || '—';
      row.appendChild(cell);
      assignmentTable.appendChild(row);
      registerAnimatedElement(row, 0.05);
      return;
    }

    state.assignments.forEach((assignment, index) => {
      const row = document.createElement('tr');
      row.className = 'border-b border-[#f1d9c9]/60 last:border-0';
      row.setAttribute('data-alfawz-animate', 'scale');

      const titleCell = document.createElement('td');
      titleCell.className = 'px-4 py-4 text-base font-semibold text-[#3d0b1e]';
      titleCell.textContent = assignment.title || strings.assignmentFallback || 'Qa’idah assignment';

      const classCell = document.createElement('td');
      classCell.className = 'px-4 py-4 text-base text-[#502032]';
      classCell.textContent = assignment.class?.label || '—';

      const updatedCell = document.createElement('td');
      updatedCell.className = 'px-4 py-4 text-base text-[#502032]';
      updatedCell.textContent = formatDate(assignment.updated);

      const statusCell = document.createElement('td');
      statusCell.className = 'px-4 py-4 text-base font-semibold text-[#7b1e3c]';
      statusCell.textContent = strings.statusSent || 'Sent';

      const actionCell = document.createElement('td');
      actionCell.className = 'px-4 py-4 text-right text-sm';

      const viewButton = document.createElement('button');
      viewButton.type = 'button';
      viewButton.className = 'inline-flex items-center text-sm font-semibold text-[#7b1e3c] hover:underline focus:outline-none focus:underline';
      viewButton.textContent = strings.viewAssignment || 'View';
      viewButton.addEventListener('click', () => openPreview(assignment));

      const divider = document.createElement('span');
      divider.className = 'mx-2 text-[#d8a28d]';
      divider.textContent = '•';

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'inline-flex items-center text-sm font-semibold text-[#7b1e3c] hover:underline focus:outline-none focus:underline';
      editButton.textContent = strings.editAssignment || 'Edit';
      editButton.addEventListener('click', () => editAssignmentInBuilder(assignment.id));

      actionCell.append(viewButton, divider, editButton);

      row.append(titleCell, classCell, updatedCell, statusCell, actionCell);

      assignmentTable.appendChild(row);
      registerAnimatedElement(row, 0.05 * index);
    });
  };

  const memoCardVariants = [
    {
      background: 'from-[#fff5f7] via-[#ffe8f0] to-[#fde7ef]',
      border: 'border-[#f9cfd9]',
      title: 'text-[#5a0f27]',
      meta: 'text-[#7b1e3c]/70',
      metricBody: 'text-[#5a0f27]',
      metricLabel: 'text-[#7b1e3c]/70',
      metricValue: 'text-[#5a0f27]',
      planRow: 'bg-white/60',
      planTitle: 'text-[#5a0f27]',
      planMeta: 'text-[#7b1e3c]/70',
      extra: 'text-[#7b1e3c]/70',
    },
    {
      background: 'from-[#eef3ff] via-[#dbe7ff] to-[#f5f8ff]',
      border: 'border-[#c3d4ff]',
      title: 'text-[#1f2a5b]',
      meta: 'text-[#243764]/70',
      metricBody: 'text-[#1f2a5b]',
      metricLabel: 'text-[#243764]/70',
      metricValue: 'text-[#1f2a5b]',
      planRow: 'bg-white/60',
      planTitle: 'text-[#1f2a5b]',
      planMeta: 'text-[#243764]/70',
      extra: 'text-[#243764]/70',
    },
    {
      background: 'from-[#e9fbf1] via-[#d1f5e0] to-[#f2fff8]',
      border: 'border-[#b4e8cc]',
      title: 'text-[#1d4d3b]',
      meta: 'text-[#236447]/70',
      metricBody: 'text-[#1d4d3b]',
      metricLabel: 'text-[#236447]/70',
      metricValue: 'text-[#1d4d3b]',
      planRow: 'bg-white/60',
      planTitle: 'text-[#1d4d3b]',
      planMeta: 'text-[#236447]/70',
      extra: 'text-[#236447]/70',
    },
    {
      background: 'from-[#fff7e6] via-[#ffe9c7] to-[#fff3d6]',
      border: 'border-[#ffd8a8]',
      title: 'text-[#5b3a0e]',
      meta: 'text-[#8a5d16]/70',
      metricBody: 'text-[#5b3a0e]',
      metricLabel: 'text-[#8a5d16]/70',
      metricValue: 'text-[#5b3a0e]',
      planRow: 'bg-white/60',
      planTitle: 'text-[#5b3a0e]',
      planMeta: 'text-[#8a5d16]/70',
      extra: 'text-[#8a5d16]/70',
    },
  ];

  const renderMemorization = () => {
    if (!memoList) {
      return;
    }
    memoList.innerHTML = '';
    memoList.setAttribute('aria-busy', 'false');

    if (!state.memorization.length) {
      const empty = document.createElement('div');
      empty.className =
        'rounded-2xl border border-[#c3d4ff] bg-gradient-to-br from-[#eef3ff] via-[#f6f0ff] to-[#fff7f0] px-6 py-6 text-center text-base text-[#243764]/80 shadow-md shadow-[#1b1f3b]/10';
      empty.setAttribute('data-alfawz-animate', 'scale');
      empty.textContent = strings.noPlans || '—';
      memoList.appendChild(empty);
      registerAnimatedElement(empty, 0.05);
      return;
    }

    state.memorization.forEach((entry, index) => {
      const variant = memoCardVariants[index % memoCardVariants.length];
      const card = document.createElement('article');
      card.className = `rounded-2xl border ${variant.border} bg-gradient-to-br ${variant.background} p-6 shadow-lg shadow-[#2b0618]/10 transition hover:-translate-y-0.5 hover:shadow-2xl`;
      card.id = `memo-${entry.student.id}`;
      card.setAttribute('data-alfawz-animate', 'scale');

      const header = document.createElement('div');
      header.className = 'flex flex-wrap items-center justify-between gap-4';
      const title = document.createElement('div');
      title.innerHTML = `<p class="text-lg font-semibold ${variant.title}">${entry.student.name || ''}</p><p class="text-sm ${variant.meta}">${entry.student.class_label || ''}</p>`;

      const streak = Number(entry.metrics?.streak || 0);
      const streakTheme = streak > 1 ? 'emerald' : 'amber';
      const streakBadge = document.createElement('span');
      streakBadge.className = `inline-flex items-center rounded-full bg-${streakTheme}-100 px-3 py-1 text-sm font-semibold text-${streakTheme}-800`;
      streakBadge.textContent = `${strings.streakLabel || 'Day streak'} ${formatNumber(streak)}`;

      header.appendChild(title);
      header.appendChild(streakBadge);

      const metrics = document.createElement('dl');
      metrics.className = `mt-4 grid grid-cols-1 gap-4 text-sm ${variant.metricBody} sm:grid-cols-3`;

      const metricItems = [
        {
          label: strings.activePlansLabel || 'Active plans',
          value: formatNumber(entry.metrics?.active_plans || 0),
        },
        {
          label: strings.memorizedVersesLabel || 'Verses memorized',
          value: formatNumber(entry.metrics?.memorized_verses || 0),
        },
        {
          label: strings.streakLabel || 'Day streak',
          value: formatNumber(streak),
        },
      ];

      metricItems.forEach((metric) => {
        const block = document.createElement('div');
        block.innerHTML = `<dt class="font-medium ${variant.metricLabel}">${metric.label}</dt><dd class="text-2xl font-semibold ${variant.metricValue}">${metric.value}</dd>`;
        metrics.appendChild(block);
      });

      card.append(header, metrics);

      if (Array.isArray(entry.plans) && entry.plans.length) {
        const planList = document.createElement('div');
        planList.className = 'mt-4 space-y-2';
        entry.plans.slice(0, 3).forEach((plan) => {
          const planRow = document.createElement('div');
          planRow.className = `flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 shadow-sm shadow-[#1b1f3b]/5 ${variant.planRow}`;
          const totalVerses = Number(plan.total_verses || 0);
          const completedVerses = Number(plan.completed_verses || 0);
          const progress = totalVerses > 0 ? Math.round((completedVerses / totalVerses) * 100) : 0;
          planRow.innerHTML = `<p class="text-base font-medium ${variant.planTitle}">${plan.plan_name || strings.assignmentFallback || 'Qa’idah assignment'}</p><p class="text-sm ${variant.planMeta}">${formatNumber(completedVerses)} / ${formatNumber(totalVerses)} • ${progress}%</p>`;
          planList.appendChild(planRow);
        });

        if (entry.plans.length > 3) {
          const extra = document.createElement('p');
          extra.className = `text-sm ${variant.extra}`;
          const extraCount = entry.plans.length - 3;
          extra.textContent = `+${formatNumber(extraCount)} ${strings.activePlansUnit || strings.activePlansLabel || 'plans'}`;
          planList.appendChild(extra);
        }

        card.appendChild(planList);
      }

      if (streak <= 1 && strings.streakNeedsAttention) {
        const alert = document.createElement('p');
        alert.className = 'mt-4 text-sm font-semibold text-amber-700';
        alert.textContent = strings.streakNeedsAttention;
        card.appendChild(alert);
      }

      memoList.appendChild(card);
      registerAnimatedElement(card, 0.05 * index);
    });
  };

  const classCardVariants = [
    { background: 'bg-[#fdf5ea]', badge: 'bg-[#f3d9c1] text-[#5a0f27]' },
    { background: 'bg-[#f3f7ff]', badge: 'bg-[#dbe7ff] text-[#1f2a5b]' },
    { background: 'bg-[#fbe9f1]', badge: 'bg-[#f6c6dc] text-[#7b1e3c]' },
    { background: 'bg-[#eefbf4]', badge: 'bg-[#c8f2db] text-[#22593b]' },
  ];

  const renderClasses = () => {
    if (!classCards) {
      return;
    }
    classCards.innerHTML = '';
    classCards.setAttribute('aria-busy', 'false');

    if (!state.classes.length) {
      const empty = document.createElement('div');
      empty.className = 'rounded-2xl bg-[#fdf5ea] px-4 py-4 text-center text-base text-[#7b1e3c]/80';
      empty.setAttribute('data-alfawz-animate', 'scale');
      empty.textContent = strings.noClasses || '—';
      classCards.appendChild(empty);
      registerAnimatedElement(empty, 0.05);
      return;
    }

    state.classes.forEach((classItem, index) => {
      const variant = classCardVariants[index % classCardVariants.length];
      const wrapper = document.createElement('div');
      wrapper.className = `flex flex-col gap-3 rounded-2xl px-5 py-5 shadow-md shadow-[#2b0618]/5 transition hover:-translate-y-0.5 hover:shadow-xl ${variant.background}`;
      wrapper.setAttribute('data-alfawz-animate', 'scale');

      const info = document.createElement('div');
      info.innerHTML = `<div class="text-lg font-bold text-[#3d0b1e]">${classItem.label || ''}</div><div class="text-sm text-[#502032]">${formatNumber(classItem.student_count || 0)} ${strings.studentsUnit || strings.studentsLabel || 'students'}</div>`;

      const status = document.createElement('span');
      status.className = `self-start rounded-full px-3 py-1 text-sm font-semibold ${variant.badge}`;
      status.textContent = strings.classActiveLabel || 'Active';

      wrapper.append(info, status);
      classCards.appendChild(wrapper);
      registerAnimatedElement(wrapper, 0.05 * index);
    });
  };

  const getPlanLatestTimestamp = (plans) => {
    if (!Array.isArray(plans) || !plans.length) {
      return 0;
    }
    return plans.reduce((latest, plan) => {
      const dateValue = plan.updated_at || plan.completed_at || plan.created_at;
      if (!dateValue) {
        return latest;
      }
      const timestamp = new Date(dateValue).getTime();
      if (Number.isNaN(timestamp)) {
        return latest;
      }
      return Math.max(latest, timestamp);
    }, 0);
  };

  const renderActivity = () => {
    if (!activityList) {
      return;
    }

    activityList.innerHTML = '';
    activityList.setAttribute('aria-busy', 'false');

    const activities = [];

    state.assignments.forEach((assignment) => {
      const parts = [];
      if (assignment.title) {
        parts.push(assignment.title);
      }
      if (assignment.class?.label) {
        parts.push(assignment.class.label);
      }
      activities.push({
        icon: '📚',
        description: parts.join(' • ') || strings.assignmentFallback || 'Qa’idah assignment',
        timestamp: assignment.updated ? new Date(assignment.updated).getTime() : 0,
      });
    });

    state.memorization.forEach((entry) => {
      const studentName = entry.student?.name || '';
      const classLabel = entry.student?.class_label || '';
      const memorized = Number(entry.metrics?.memorized_verses || 0);
      const activePlans = Number(entry.metrics?.active_plans || 0);
      const summary = [];
      if (memorized > 0) {
        summary.push(`${formatNumber(memorized)} ${strings.memorizedVersesUnit || strings.memorizedVersesLabel || 'verses memorised'}`);
      }
      if (activePlans > 0) {
        summary.push(`${formatNumber(activePlans)} ${strings.activePlansUnit || strings.activePlansLabel || 'active memorisation plans'}`);
      }
      const detail = [studentName, summary.join(' • ')].filter(Boolean).join(' • ');
      const description = classLabel ? `${detail} (${classLabel})` : detail;
      activities.push({
        icon: '🧠',
        description: description || studentName,
        timestamp: getPlanLatestTimestamp(entry.plans),
      });
    });

    state.classes.forEach((classItem) => {
      activities.push({
        icon: '🏫',
        description: `${classItem.label || ''} • ${formatNumber(classItem.student_count || 0)} ${strings.studentsUnit || strings.studentsLabel || 'students'}`.trim(),
        timestamp: 0,
      });
    });

    const sorted = activities
      .filter((item) => item.description && item.description.trim())
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 6);

    if (!sorted.length) {
      const empty = document.createElement('li');
      empty.className = 'rounded-2xl bg-[#fdf5ea] px-4 py-4 text-base text-[#7b1e3c]/80';
      empty.setAttribute('data-alfawz-animate', 'scale');
      empty.textContent = strings.recentActivityEmpty || 'No recent activity yet.';
      activityList.appendChild(empty);
      registerAnimatedElement(empty, 0.05);
      return;
    }

    sorted.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'flex items-start gap-3 rounded-2xl bg-[#fdf5ea] px-4 py-4 text-base text-[#502032] shadow-sm shadow-[#2b0618]/5';
      li.setAttribute('data-alfawz-animate', 'scale');
      const icon = document.createElement('span');
      icon.className = 'text-2xl leading-none';
      icon.textContent = item.icon || '•';
      icon.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span');
      text.className = 'flex-1 text-base text-[#502032]';
      text.textContent = item.description;
      li.append(icon, text);
      activityList.appendChild(li);
      registerAnimatedElement(li, 0.05 * index);
    });
  };

  const updateCardMetrics = () => {
    const totalClasses = state.classes.length;
    const totalStudents = state.classes.reduce((total, item) => total + Number(item.student_count || 0), 0);
    const totalAssignments = state.assignments.length;
    const totalMemorization = state.memorization.length;

    updateMetricGroup('classes', totalClasses, strings.classesLabel || 'classes');
    updateMetricGroup('students', totalStudents, strings.studentsUnit || strings.studentsLabel || 'students');
    updateMetricGroup('assignments', totalAssignments, strings.assignmentCountLabel || 'assignments sent');
    updateMetricGroup('memorization', totalMemorization, strings.memoCountLabel || 'students tracked');
    updateLabelledValue(memoPill, totalMemorization, strings.memoCountLabel || 'students tracked');

    renderActivity();
  };

  const loadAssignments = async () => {
    if (assignmentTable) {
      assignmentTable.setAttribute('aria-busy', 'true');
    }
    try {
      const assignments = await apiRequest('qaidah/assignments?context=manage');
      state.assignments = Array.isArray(assignments) ? assignments : [];
      renderAssignments();
      updateCardMetrics();
    } catch (error) {
      console.error('[AlfawzQuran] Failed to load assignments', error);
      state.assignments = [];
      renderAssignments();
      updateCardMetrics();
    }
  };

  const loadClasses = async () => {
    if (classCards) {
      classCards.setAttribute('aria-busy', 'true');
    }
    try {
      const classes = await apiRequest('teacher/classes');
      state.classes = Array.isArray(classes) ? classes : [];
      renderClasses();
      updateCardMetrics();
    } catch (error) {
      console.error('[AlfawzQuran] Failed to load classes', error);
      state.classes = [];
      renderClasses();
      updateCardMetrics();
    }
  };

  const loadMemorization = async () => {
    if (memoList) {
      memoList.setAttribute('aria-busy', 'true');
    }
    try {
      const teacherId = settings.teacherId || 0;
      const endpoint = teacherId ? `memorization-plans?teacher_id=${teacherId}` : 'memorization-plans';
      const memo = await apiRequest(endpoint);
      state.memorization = Array.isArray(memo) ? memo : [];
      renderMemorization();
      updateCardMetrics();
    } catch (error) {
      console.error('[AlfawzQuran] Failed to load memorization plans', error);
      state.memorization = [];
      renderMemorization();
      updateCardMetrics();
    }
  };

  const loadAll = async () => {
    if (activityList) {
      activityList.setAttribute('aria-busy', 'true');
    }
    await Promise.all([loadAssignments(), loadClasses(), loadMemorization()]);
  };

  createAssignmentButton?.addEventListener('click', openBuilderForCreate);

  const setRefreshBusyState = (isBusy) => {
    refreshButtons.forEach((button) => {
      button.classList.toggle('is-busy', isBusy);
      if (isBusy) {
        button.setAttribute('aria-busy', 'true');
        button.setAttribute('disabled', 'disabled');
      } else {
        button.removeAttribute('aria-busy');
        button.removeAttribute('disabled');
      }
    });
  };

  refreshButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      if (button.classList.contains('is-busy')) {
        return;
      }
      setRefreshBusyState(true);
      Promise.resolve(loadAll()).finally(() => setRefreshBusyState(false));
    });
  });

  previewClose?.addEventListener('click', closePreview);
  previewModal?.addEventListener('click', (event) => {
    if (event.target === previewModal) {
      closePreview();
    }
  });

  document.addEventListener('alfawzQaidahAssignmentSaved', () => {
    loadAssignments();
    loadClasses();
  });

  initAnimatedElements();
  loadAll();
})();

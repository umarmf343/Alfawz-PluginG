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

  const updateMetricGroup = (key, value, fallbackLabel) => {
    const targets = metricTargets[key] || [];
    targets.forEach((element) => updateLabelledValue(element, value, fallbackLabel));
  };

  const updateLabelledValue = (element, value, fallbackLabel = '') => {
    if (!element) {
      return;
    }
    const label = element.getAttribute('data-label') || fallbackLabel || '';
    const text = String(value ?? '').trim();
    const suffix = label ? ` ${label}` : '';
    element.textContent = `${text}${suffix}`.trim();
  };

  const formatNumber = (value) => {
    const number = Number(value || 0);
    return Number.isFinite(number) ? new Intl.NumberFormat().format(number) : '0';
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
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.className = 'px-4 py-6 text-center text-base text-[#7b1e3c]/70';
      cell.textContent = strings.noAssignments || '—';
      row.appendChild(cell);
      assignmentTable.appendChild(row);
      return;
    }

    state.assignments.forEach((assignment) => {
      const row = document.createElement('tr');
      row.className = 'border-b border-[#f1d9c9]/60 last:border-0';

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
    });
  };

  const renderMemorization = () => {
    if (!memoList) {
      return;
    }
    memoList.innerHTML = '';
    memoList.setAttribute('aria-busy', 'false');

    if (!state.memorization.length) {
      const empty = document.createElement('div');
      empty.className = 'rounded-2xl border border-[#f1d9c9] bg-[#fdf5ea] px-6 py-6 text-center text-base text-[#7b1e3c]/80';
      empty.textContent = strings.noPlans || '—';
      memoList.appendChild(empty);
      return;
    }

    state.memorization.forEach((entry) => {
      const card = document.createElement('article');
      card.className = 'rounded-2xl border border-[#f1d9c9] bg-white/90 p-6 shadow-md shadow-[#2b0618]/5 transition hover:-translate-y-0.5 hover:shadow-xl';
      card.id = `memo-${entry.student.id}`;

      const header = document.createElement('div');
      header.className = 'flex flex-wrap items-center justify-between gap-4';
      const title = document.createElement('div');
      title.innerHTML = `<p class="text-lg font-semibold text-[#3d0b1e]">${entry.student.name || ''}</p><p class="text-sm text-[#7b1e3c]/70">${entry.student.class_label || ''}</p>`;

      const streak = Number(entry.metrics?.streak || 0);
      const streakTheme = streak > 1 ? 'emerald' : 'amber';
      const streakBadge = document.createElement('span');
      streakBadge.className = `inline-flex items-center rounded-full bg-${streakTheme}-100 px-3 py-1 text-sm font-semibold text-${streakTheme}-800`;
      streakBadge.textContent = `${strings.streakLabel || 'Day streak'} ${formatNumber(streak)}`;

      header.appendChild(title);
      header.appendChild(streakBadge);

      const metrics = document.createElement('dl');
      metrics.className = 'mt-4 grid grid-cols-1 gap-4 text-sm text-[#502032] sm:grid-cols-3';

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
        block.innerHTML = `<dt class="font-medium text-[#7b1e3c]/70">${metric.label}</dt><dd class="text-2xl font-semibold text-[#3d0b1e]">${metric.value}</dd>`;
        metrics.appendChild(block);
      });

      card.append(header, metrics);

      if (Array.isArray(entry.plans) && entry.plans.length) {
        const planList = document.createElement('div');
        planList.className = 'mt-4 space-y-2';
        entry.plans.slice(0, 3).forEach((plan) => {
          const planRow = document.createElement('div');
          planRow.className = 'flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#fdf5ea] px-4 py-3';
          const totalVerses = Number(plan.total_verses || 0);
          const completedVerses = Number(plan.completed_verses || 0);
          const progress = totalVerses > 0 ? Math.round((completedVerses / totalVerses) * 100) : 0;
          planRow.innerHTML = `<p class="text-base font-medium text-[#3d0b1e]">${plan.plan_name || strings.assignmentFallback || 'Qa’idah assignment'}</p><p class="text-sm text-[#7b1e3c]/70">${formatNumber(completedVerses)} / ${formatNumber(totalVerses)} • ${progress}%</p>`;
          planList.appendChild(planRow);
        });

        if (entry.plans.length > 3) {
          const extra = document.createElement('p');
          extra.className = 'text-sm text-[#7b1e3c]/70';
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
    empty.textContent = strings.noClasses || '—';
      classCards.appendChild(empty);
      return;
    }

    state.classes.forEach((classItem, index) => {
      const variant = classCardVariants[index % classCardVariants.length];
      const wrapper = document.createElement('div');
      wrapper.className = `flex flex-col gap-3 rounded-2xl px-5 py-5 shadow-md shadow-[#2b0618]/5 transition hover:-translate-y-0.5 hover:shadow-xl ${variant.background}`;

      const info = document.createElement('div');
      info.innerHTML = `<div class="text-lg font-bold text-[#3d0b1e]">${classItem.label || ''}</div><div class="text-sm text-[#502032]">${formatNumber(classItem.student_count || 0)} ${strings.studentsUnit || strings.studentsLabel || 'students'}</div>`;

      const status = document.createElement('span');
      status.className = `self-start rounded-full px-3 py-1 text-sm font-semibold ${variant.badge}`;
      status.textContent = strings.classActiveLabel || 'Active';

      wrapper.append(info, status);
      classCards.appendChild(wrapper);
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
      empty.textContent = strings.recentActivityEmpty || 'No recent activity yet.';
      activityList.appendChild(empty);
      return;
    }

    sorted.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'flex items-start gap-3 rounded-2xl bg-[#fdf5ea] px-4 py-4 text-base text-[#502032] shadow-sm shadow-[#2b0618]/5';
      const icon = document.createElement('span');
      icon.className = 'text-2xl leading-none';
      icon.textContent = item.icon || '•';
      icon.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span');
      text.className = 'flex-1 text-base text-[#502032]';
      text.textContent = item.description;
      li.append(icon, text);
      activityList.appendChild(li);
    });
  };

  const updateCardMetrics = () => {
    const totalClasses = state.classes.length;
    const totalStudents = state.classes.reduce((total, item) => total + Number(item.student_count || 0), 0);
    const totalAssignments = state.assignments.length;
    const totalMemorization = state.memorization.length;

    updateMetricGroup('classes', formatNumber(totalClasses), strings.classesLabel || 'classes');
    updateMetricGroup('students', formatNumber(totalStudents), strings.studentsUnit || strings.studentsLabel || 'students');
    updateMetricGroup('assignments', formatNumber(totalAssignments), strings.assignmentCountLabel || 'assignments sent');
    updateMetricGroup('memorization', formatNumber(totalMemorization), strings.memoCountLabel || 'students tracked');
    updateLabelledValue(memoPill, formatNumber(totalMemorization), strings.memoCountLabel || 'students tracked');

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
  refreshButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      loadAll();
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

  loadAll();
})();

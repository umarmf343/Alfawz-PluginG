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

  const qs = (selector) => root.querySelector(selector);
  const setText = (selector, value) => {
    const element = qs(selector);
    if (element) {
      element.textContent = value;
    }
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

  const assignmentTable = document.getElementById('alfawz-teacher-assignment-rows');
  const classList = document.getElementById('alfawz-teacher-class-list');
  const memoList = document.getElementById('alfawz-teacher-memo-list');
  const createAssignmentButton = document.getElementById('alfawz-teacher-create-assignment');
  const refreshButton = document.getElementById('alfawz-teacher-refresh');
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
      cell.className = 'px-4 py-6 text-center text-sm text-slate-500';
      cell.textContent = strings.noAssignments || '—';
      row.appendChild(cell);
      assignmentTable.appendChild(row);
      return;
    }

    state.assignments.forEach((assignment) => {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-100 last:border-0';

      const titleCell = document.createElement('td');
      titleCell.className = 'px-4 py-3 text-sm font-medium text-slate-900';
      titleCell.textContent = assignment.title || 'Qa’idah assignment';

      const classCell = document.createElement('td');
      classCell.className = 'px-4 py-3 text-sm text-slate-600';
      classCell.textContent = assignment.class?.label || '—';

      const updatedCell = document.createElement('td');
      updatedCell.className = 'px-4 py-3 text-sm text-slate-600';
      updatedCell.textContent = formatDate(assignment.updated);

      const statusCell = document.createElement('td');
      statusCell.className = 'px-4 py-3 text-sm text-emerald-600 font-semibold';
      statusCell.textContent = strings.statusSent || 'Sent';

      const actionCell = document.createElement('td');
      actionCell.className = 'px-4 py-3 text-right text-sm';

      const viewButton = document.createElement('button');
      viewButton.type = 'button';
      viewButton.className = 'alfawz-link text-emerald-600 font-semibold mr-3';
      viewButton.textContent = strings.viewAssignment || 'View';
      viewButton.addEventListener('click', () => openPreview(assignment));

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'alfawz-link text-emerald-600 font-semibold';
      editButton.textContent = strings.editAssignment || 'Edit';
      editButton.addEventListener('click', () => editAssignmentInBuilder(assignment.id));

      actionCell.appendChild(viewButton);
      actionCell.appendChild(editButton);

      row.appendChild(titleCell);
      row.appendChild(classCell);
      row.appendChild(updatedCell);
      row.appendChild(statusCell);
      row.appendChild(actionCell);

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
      empty.className = 'rounded-2xl border border-slate-100 bg-white p-6 text-center text-sm text-slate-500';
      empty.textContent = strings.noPlans || '—';
      memoList.appendChild(empty);
      return;
    }

    state.memorization.forEach((entry) => {
      const card = document.createElement('article');
      card.className = 'rounded-2xl border border-slate-100 bg-white p-5 shadow-sm';
      card.id = `memo-${entry.student.id}`;

      const header = document.createElement('div');
      header.className = 'flex flex-wrap items-center justify-between gap-3';
      const title = document.createElement('div');
      title.innerHTML = `<p class="text-sm font-semibold text-slate-900">${entry.student.name || ''}</p><p class="text-xs text-slate-500">${entry.student.class_label || ''}</p>`;

      const streakBadge = document.createElement('span');
      const streak = Number(entry.metrics?.streak || 0);
      const streakTheme = streak > 1 ? 'emerald' : 'amber';
      streakBadge.className = `inline-flex items-center rounded-full bg-${streakTheme}-100 px-3 py-1 text-xs font-semibold text-${streakTheme}-700`;
      streakBadge.textContent = `${strings.streakLabel || 'Streak'} ${formatNumber(streak)}`;

      header.appendChild(title);
      header.appendChild(streakBadge);

      const metrics = document.createElement('dl');
      metrics.className = 'mt-3 grid grid-cols-2 gap-3 text-xs text-slate-600';

      const metricItems = [
        {
          label: strings.activePlansLabel || 'Active plans',
          value: formatNumber(entry.metrics?.active_plans || 0),
        },
        {
          label: strings.memorizedVersesLabel || 'Verses memorized',
          value: formatNumber(entry.metrics?.memorized_verses || 0),
        },
      ];

      metricItems.forEach((metric) => {
        const item = document.createElement('div');
        item.innerHTML = `<dt class="font-medium text-slate-500">${metric.label}</dt><dd class="text-lg font-semibold text-slate-900">${metric.value}</dd>`;
        metrics.appendChild(item);
      });

      card.appendChild(header);
      card.appendChild(metrics);

      memoList.appendChild(card);
    });
  };

  const renderClasses = () => {
    if (!classList) {
      return;
    }
    classList.innerHTML = '';
    classList.setAttribute('aria-busy', 'false');

    if (!state.classes.length) {
      const empty = document.createElement('div');
      empty.className = 'rounded-2xl border border-slate-100 bg-white p-6 text-center text-sm text-slate-500';
      empty.textContent = strings.noClasses || '—';
      classList.appendChild(empty);
      return;
    }

    state.classes.forEach((classItem) => {
      const article = document.createElement('article');
      article.className = 'rounded-2xl border border-slate-100 bg-white p-5 shadow-sm';
      article.id = classItem.anchor || `class-${classItem.id}`;

      const header = document.createElement('div');
      header.className = 'flex flex-wrap items-center justify-between gap-3';
      const title = document.createElement('div');
      title.innerHTML = `<p class="text-sm font-semibold text-slate-900">${classItem.label || ''}</p><p class="text-xs text-slate-500">${strings.studentsLabel || 'Students'} ${formatNumber(classItem.student_count || 0)}</p>`;

      header.appendChild(title);
      article.appendChild(header);

      if (Array.isArray(classItem.students) && classItem.students.length) {
        const list = document.createElement('div');
        list.className = 'mt-3 flex flex-wrap items-center gap-2';
        classItem.students.forEach((student) => {
          const link = document.createElement('a');
          link.href = `#memo-${student.id}`;
          link.className = 'flex items-center gap-2 rounded-full border border-slate-100 px-3 py-1 text-xs text-slate-600 hover:border-emerald-200 hover:text-emerald-600';
          const avatar = document.createElement('span');
          avatar.className = 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700';
          if (student.avatar) {
            avatar.style.backgroundImage = `url(${student.avatar})`;
            avatar.style.backgroundSize = 'cover';
            avatar.textContent = '';
          } else {
            avatar.textContent = (student.name || '?').charAt(0).toUpperCase();
          }
          const name = document.createElement('span');
          name.textContent = student.name || '';
          link.appendChild(avatar);
          link.appendChild(name);
          list.appendChild(link);
        });
        article.appendChild(list);
      }

      classList.appendChild(article);
    });
  };

  const updateCardMetrics = () => {
    setText('#alfawz-teacher-assignment-count', formatNumber(state.assignments.length));
    const activePlans = state.memorization.reduce((total, entry) => total + Number(entry.metrics?.active_plans || 0), 0);
    setText('#alfawz-teacher-active-plan-count', formatNumber(activePlans));
    const streakAlerts = state.memorization.filter((entry) => Number(entry.metrics?.streak || 0) <= 1).length;
    setText('#alfawz-teacher-streak-alert-count', formatNumber(streakAlerts));
    setText('#alfawz-teacher-class-count', formatNumber(state.classes.length));
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
    }
  };

  const loadClasses = async () => {
    if (classList) {
      classList.setAttribute('aria-busy', 'true');
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
    }
  };

  const loadAll = async () => {
    await Promise.all([loadAssignments(), loadClasses(), loadMemorization()]);
  };

  createAssignmentButton?.addEventListener('click', openBuilderForCreate);
  refreshButton?.addEventListener('click', (event) => {
    event.preventDefault();
    loadAll();
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

(() => {
  const settings = window.alfawzTeacherData || {};
  const root = document.getElementById('alfawz-teacher-dashboard');

  if (!root) {
    return;
  }

  const apiBase = (settings.apiUrl || '/wp-json/alfawzquran/v1/').replace(/\/+$/, '/');
  const defaultHeaders = {};

  if (settings.nonce) {
    defaultHeaders['X-WP-Nonce'] = settings.nonce;
  }

  const strings = {
    statusSent: 'Sent',
    statusDraft: 'Draft',
    noAssignments: 'No assignments yet.',
    view: 'View',
    edit: 'Edit',
    openBuilder: 'Open builder',
    studentsLabel: 'students',
    plansLabel: 'plans',
    streakLabel: 'day streak',
    loading: 'Loading…',
    classActivity: 'View class activity',
    previewTitle: 'Assignment preview',
    noPreview: 'Preview unavailable for this assignment.',
    ...(settings.strings || {}),
  };

  const state = {
    assignments: [],
    classes: [],
    memorization: [],
    builderReady: false,
    previewAudio: null,
  };

  const assignmentList = document.getElementById('alfawz-teacher-assignment-list');
  const assignmentEmpty = document.getElementById('alfawz-teacher-assignment-empty');
  const assignmentCountEl = document.getElementById('alfawz-teacher-assignment-count');
  const createButton = document.getElementById('alfawz-teacher-create-assignment');
  const refreshAssignmentsButton = document.getElementById('alfawz-teacher-refresh-assignments');
  const classList = document.getElementById('alfawz-teacher-class-list');
  const classEmpty = document.getElementById('alfawz-teacher-class-empty');
  const classCountEl = document.getElementById('alfawz-teacher-class-count');
  const memorizationList = document.getElementById('alfawz-teacher-memorization-list');
  const memorizationEmpty = document.getElementById('alfawz-teacher-memorization-empty');
  const activePlansEl = document.getElementById('alfawz-teacher-active-plans');
  const studentCountEl = document.getElementById('alfawz-teacher-student-count');

  const builderModal = document.getElementById('alfawz-teacher-assignment-modal');
  const builderClose = document.getElementById('alfawz-teacher-assignment-close');
  const previewModal = document.getElementById('alfawz-teacher-assignment-preview');
  const previewClose = document.getElementById('alfawz-teacher-preview-close');
  const previewTitle = document.getElementById('alfawz-teacher-assignment-preview-title');
  const previewMeta = document.getElementById('alfawz-teacher-assignment-preview-meta');
  const previewImage = document.getElementById('alfawz-teacher-preview-image');
  const previewHotspots = document.getElementById('alfawz-teacher-preview-hotspots');
  const previewHotspotList = document.getElementById('alfawz-teacher-preview-hotspot-list');

  const buildApiUrl = (path) => `${apiBase}${String(path || '').replace(/^\/+/, '')}`;

  const apiRequest = async (path, { method = 'GET', body, headers: extraHeaders } = {}) => {
    const url = buildApiUrl(path);
    const options = { method, headers: { 'Content-Type': 'application/json', ...defaultHeaders, ...(extraHeaders || {}) } };

    if (body instanceof FormData) {
      delete options.headers['Content-Type'];
      options.body = body;
    } else if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  };

  const openModal = (modal) => {
    if (!modal) {
      return;
    }
    modal.classList.remove('hidden');
    document.body.classList.add('alfawz-qaidah-modal-open');
  };

  const closeModal = (modal) => {
    if (!modal) {
      return;
    }
    modal.classList.add('hidden');
    document.body.classList.remove('alfawz-qaidah-modal-open');
  };

  const formatDate = (value) => {
    if (!value) {
      return '';
    }
    try {
      const date = new Date(value);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return value;
    }
  };

  const stopPreviewAudio = () => {
    if (state.previewAudio) {
      state.previewAudio.pause();
      state.previewAudio = null;
    }
    if (previewHotspots) {
      previewHotspots.querySelectorAll('.is-playing').forEach((element) => element.classList.remove('is-playing'));
    }
    if (previewHotspotList) {
      previewHotspotList.querySelectorAll('.is-playing').forEach((element) => element.classList.remove('is-playing'));
    }
  };

  const renderPreviewHotspots = (assignment) => {
    if (!previewHotspots || !previewHotspotList) {
      return;
    }
    previewHotspots.innerHTML = '';
    previewHotspotList.innerHTML = '';

    if (!assignment || !Array.isArray(assignment.hotspots) || !assignment.hotspots.length) {
      const empty = document.createElement('li');
      empty.className = 'text-sm text-slate-500';
      empty.textContent = strings.noPreview;
      previewHotspotList.appendChild(empty);
      return;
    }

    assignment.hotspots.forEach((hotspot, index) => {
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'alfawz-qaidah-hotspot';
      marker.style.left = hotspot.x || '0%';
      marker.style.top = hotspot.y || '0%';
      marker.dataset.index = String(index);
      marker.setAttribute('aria-label', hotspot.label || `Hotspot ${index + 1}`);
      previewHotspots.appendChild(marker);

      const item = document.createElement('li');
      item.className = 'flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white/70 p-3 text-sm text-slate-700';
      const info = document.createElement('div');
      info.className = 'flex flex-col';
      const label = document.createElement('span');
      label.className = 'font-semibold';
      label.textContent = hotspot.label || `Marker ${index + 1}`;
      const meta = document.createElement('span');
      meta.className = 'text-xs text-slate-500';
      const xValue = Number.isFinite(parseFloat(hotspot.x)) ? Math.round(parseFloat(hotspot.x)) : 0;
      const yValue = Number.isFinite(parseFloat(hotspot.y)) ? Math.round(parseFloat(hotspot.y)) : 0;
      meta.textContent = `${xValue}% • ${yValue}%`;
      info.appendChild(label);
      info.appendChild(meta);
      item.appendChild(info);

      const actions = document.createElement('div');
      actions.className = 'flex items-center gap-2';
      if (hotspot.audio_url) {
        const playButton = document.createElement('button');
        playButton.type = 'button';
        playButton.className = 'alfawz-button alfawz-button--ghost text-sm';
        playButton.textContent = '▶️';
        playButton.addEventListener('click', () => {
          stopPreviewAudio();
          const audio = new Audio(hotspot.audio_url);
          audio.addEventListener('ended', () => stopPreviewAudio());
          audio.play().catch(() => {
            stopPreviewAudio();
          });
          state.previewAudio = audio;
          marker.classList.add('is-playing');
          item.classList.add('is-playing');
        });
        actions.appendChild(playButton);
      }
      item.appendChild(actions);
      previewHotspotList.appendChild(item);
    });
  };

  const openPreview = async (assignmentId) => {
    try {
      stopPreviewAudio();
      const assignment = await apiRequest(`qaidah/assignments/${assignmentId}`);
      if (previewTitle) {
        previewTitle.textContent = assignment?.title || strings.previewTitle;
      }
      if (previewMeta) {
        const classLabel = assignment?.class?.label || '';
        const updated = formatDate(assignment?.updated);
        previewMeta.textContent = [classLabel, updated].filter(Boolean).join(' • ');
      }
      if (previewImage) {
        previewImage.src = assignment?.image?.url || '';
      }
      renderPreviewHotspots(assignment);
      openModal(previewModal);
    } catch (error) {
      console.error('[AlfawzQuran] Failed to load assignment preview', error);
      alert(strings.noPreview);
    }
  };

  const ensureBuilderReady = () => state.builderReady || typeof window.AlfawzQaidahBuilder !== 'undefined';

  const openBuilder = (assignmentId) => {
    if (!ensureBuilderReady()) {
      console.warn('[AlfawzQuran] Qa’idah builder is still initialising.');
    }
    openModal(builderModal);
    const builder = window.AlfawzQaidahBuilder;
    if (builder && typeof builder.edit === 'function') {
      if (assignmentId) {
        builder.edit(assignmentId);
      } else if (typeof builder.reset === 'function') {
        builder.reset();
      }
    }
  };

  const renderAssignments = () => {
    if (!assignmentList) {
      return;
    }

    assignmentList.innerHTML = '';
    assignmentList.setAttribute('aria-busy', 'false');

    if (!state.assignments.length) {
      if (assignmentEmpty) {
        assignmentEmpty.classList.remove('hidden');
      }
      return;
    }

    if (assignmentEmpty) {
      assignmentEmpty.classList.add('hidden');
    }

    state.assignments.forEach((assignment) => {
      const item = document.createElement('li');
      item.className = 'rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm shadow-emerald-50';
      const header = document.createElement('div');
      header.className = 'flex flex-wrap items-start justify-between gap-3';

      const titleWrapper = document.createElement('div');
      titleWrapper.className = 'space-y-1';
      const title = document.createElement('h4');
      title.className = 'text-base font-semibold text-slate-900';
      title.textContent = assignment.title || strings.noAssignments;
      const meta = document.createElement('p');
      meta.className = 'text-xs text-slate-500';
      const parts = [assignment.class?.label || '', formatDate(assignment.updated)];
      meta.textContent = parts.filter(Boolean).join(' • ');
      titleWrapper.appendChild(title);
      titleWrapper.appendChild(meta);
      header.appendChild(titleWrapper);

      const status = document.createElement('span');
      status.className = 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700';
      status.textContent = assignment.status === 'draft' ? strings.statusDraft : strings.statusSent;
      header.appendChild(status);
      item.appendChild(header);

      const actions = document.createElement('div');
      actions.className = 'mt-4 flex flex-wrap items-center gap-3';
      const viewButton = document.createElement('button');
      viewButton.type = 'button';
      viewButton.className = 'alfawz-button alfawz-button--ghost text-sm';
      viewButton.textContent = strings.view;
      viewButton.addEventListener('click', () => openPreview(assignment.id));
      actions.appendChild(viewButton);

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'alfawz-button text-sm';
      editButton.textContent = assignment.status === 'draft' ? strings.edit : strings.openBuilder;
      editButton.addEventListener('click', () => openBuilder(assignment.id));
      actions.appendChild(editButton);

      item.appendChild(actions);
      assignmentList.appendChild(item);
    });
  };

  const renderClasses = () => {
    if (!classList) {
      return;
    }

    classList.innerHTML = '';
    classList.setAttribute('aria-busy', 'false');

    if (!state.classes.length) {
      if (classEmpty) {
        classEmpty.classList.remove('hidden');
      }
      return;
    }

    if (classEmpty) {
      classEmpty.classList.add('hidden');
    }

    state.classes.forEach((classItem) => {
      const card = document.createElement('article');
      card.className = 'rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm shadow-emerald-50';
      const header = document.createElement('div');
      header.className = 'flex flex-wrap items-center justify-between gap-2';
      const title = document.createElement('h4');
      title.className = 'text-base font-semibold text-slate-900';
      title.textContent = classItem.label || classItem.id;
      header.appendChild(title);

      const badge = document.createElement('span');
      badge.className = 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700';
      badge.textContent = `${classItem.student_count || 0} ${strings.studentsLabel}`;
      header.appendChild(badge);
      card.appendChild(header);

      if (classItem.activity_url) {
        const link = document.createElement('a');
        link.href = classItem.activity_url;
        link.className = 'alfawz-link text-sm font-semibold text-emerald-600';
        link.textContent = strings.classActivity;
        link.target = '_blank';
        card.appendChild(link);
      }

      if (Array.isArray(classItem.students) && classItem.students.length) {
        const list = document.createElement('ul');
        list.className = 'mt-4 space-y-2 text-sm text-slate-600';
        classItem.students.slice(0, 5).forEach((student) => {
          const row = document.createElement('li');
          row.className = 'flex items-center justify-between';
          const name = document.createElement('span');
          name.textContent = student.name;
          const stat = document.createElement('span');
          stat.className = 'text-xs text-slate-500';
          stat.textContent = `${student.verses_memorized || 0} • ${student.current_streak || 0} ${strings.streakLabel}`;
          row.appendChild(name);
          row.appendChild(stat);
          list.appendChild(row);
        });
        if (classItem.students.length > 5) {
          const more = document.createElement('li');
          more.className = 'text-xs text-slate-500';
          more.textContent = `+${classItem.students.length - 5} more`;
          list.appendChild(more);
        }
        card.appendChild(list);
      }

      classList.appendChild(card);
    });
  };

  const renderMemorization = () => {
    if (!memorizationList) {
      return;
    }

    memorizationList.innerHTML = '';
    memorizationList.setAttribute('aria-busy', 'false');

    if (!state.memorization.length) {
      if (memorizationEmpty) {
        memorizationEmpty.classList.remove('hidden');
      }
      return;
    }

    if (memorizationEmpty) {
      memorizationEmpty.classList.add('hidden');
    }

    state.memorization.forEach((entry) => {
      const card = document.createElement('article');
      card.className = 'rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm shadow-emerald-50';
      const header = document.createElement('div');
      header.className = 'flex flex-wrap items-center justify-between gap-2';
      const title = document.createElement('h4');
      title.className = 'text-base font-semibold text-slate-900';
      title.textContent = entry.student.name;
      header.appendChild(title);
      const streak = document.createElement('span');
      streak.className = 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700';
      streak.textContent = `${entry.metrics.streak || 0} ${strings.streakLabel}`;
      header.appendChild(streak);
      card.appendChild(header);

      const meta = document.createElement('p');
      meta.className = 'mt-2 text-xs text-slate-500';
      const plansLabel = `${entry.metrics.active_plans || 0} ${strings.plansLabel}`;
      const versesLabel = `${entry.metrics.verses_memorized || 0} verses`;
      meta.textContent = [entry.student.class_label || '', plansLabel, versesLabel].filter(Boolean).join(' • ');
      card.appendChild(meta);

      if (Array.isArray(entry.plans) && entry.plans.length) {
        const list = document.createElement('ul');
        list.className = 'mt-3 space-y-2 text-sm text-slate-600';
        entry.plans.forEach((plan) => {
          const row = document.createElement('li');
          row.className = 'flex items-center justify-between rounded-xl bg-white/70 p-2';
          const name = document.createElement('span');
          name.textContent = plan.plan_name;
          const progress = document.createElement('span');
          progress.className = 'text-xs text-slate-500';
          progress.textContent = `${plan.completion_percentage || 0}%`;
          row.appendChild(name);
          row.appendChild(progress);
          list.appendChild(row);
        });
        card.appendChild(list);
      }

      memorizationList.appendChild(card);
    });
  };

  const loadAssignments = async () => {
    if (assignmentList) {
      assignmentList.setAttribute('aria-busy', 'true');
    }
    try {
      const assignments = await apiRequest('qaidah/assignments?context=manage');
      state.assignments = Array.isArray(assignments) ? assignments : [];
      if (assignmentCountEl) {
        assignmentCountEl.textContent = String(state.assignments.length);
      }
      renderAssignments();
    } catch (error) {
      console.error('[AlfawzQuran] Failed to load assignments', error);
      if (assignmentEmpty) {
        assignmentEmpty.textContent = strings.noAssignments;
        assignmentEmpty.classList.remove('hidden');
      }
      if (assignmentCountEl) {
        assignmentCountEl.textContent = '0';
      }
    } finally {
      if (assignmentList) {
        assignmentList.setAttribute('aria-busy', 'false');
      }
    }
  };

  const loadClasses = async () => {
    if (classList) {
      classList.setAttribute('aria-busy', 'true');
    }
    try {
      const response = await apiRequest('teacher/classes');
      state.classes = Array.isArray(response?.classes) ? response.classes : [];
      if (classCountEl) {
        classCountEl.textContent = String(response?.totals?.classes || state.classes.length || 0);
      }
      renderClasses();
    } catch (error) {
      console.error('[AlfawzQuran] Failed to load classes', error);
      if (classEmpty) {
        classEmpty.classList.remove('hidden');
      }
      if (classCountEl) {
        classCountEl.textContent = '0';
      }
    } finally {
      if (classList) {
        classList.setAttribute('aria-busy', 'false');
      }
    }
  };

  const loadMemorization = async () => {
    if (memorizationList) {
      memorizationList.setAttribute('aria-busy', 'true');
    }
    try {
      const response = await apiRequest(`memorization-plans?teacher_id=${encodeURIComponent(settings.teacherId || 0)}`);
      state.memorization = Array.isArray(response?.students) ? response.students : [];
      const activePlans = state.memorization.reduce((total, entry) => total + (entry.metrics?.active_plans || 0), 0);
      const studentCount = state.memorization.length;
      if (activePlansEl) {
        activePlansEl.textContent = String(activePlans);
      }
      if (studentCountEl) {
        studentCountEl.textContent = `${studentCount} ${strings.studentsLabel}`;
      }
      renderMemorization();
    } catch (error) {
      console.error('[AlfawzQuran] Failed to load memorisation overview', error);
      if (memorizationEmpty) {
        memorizationEmpty.classList.remove('hidden');
      }
      if (activePlansEl) {
        activePlansEl.textContent = '0';
      }
      if (studentCountEl) {
        studentCountEl.textContent = `0 ${strings.studentsLabel}`;
      }
    } finally {
      if (memorizationList) {
        memorizationList.setAttribute('aria-busy', 'false');
      }
    }
  };

  const initialise = async () => {
    await Promise.all([loadAssignments(), loadClasses(), loadMemorization()]);
  };

  createButton?.addEventListener('click', () => openBuilder());
  refreshAssignmentsButton?.addEventListener('click', () => loadAssignments());
  builderClose?.addEventListener('click', () => {
    closeModal(builderModal);
    const builder = window.AlfawzQaidahBuilder;
    if (builder && typeof builder.reset === 'function') {
      builder.reset();
    }
  });
  previewClose?.addEventListener('click', () => {
    stopPreviewAudio();
    closeModal(previewModal);
  });

  document.addEventListener('alfawz:qaidah-ready', (event) => {
    if (event.detail?.role === 'teacher') {
      state.builderReady = true;
    }
  });

  document.addEventListener('alfawz:qaidah-updated', (event) => {
    closeModal(builderModal);
    loadAssignments();
  });

  initialise();
})();

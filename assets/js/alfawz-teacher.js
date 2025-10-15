(() => {
  const wpData = window.alfawzData || {};
  const teacherConfig = window.alfawzTeacherData || {};
  const root = document.getElementById('alfawz-teacher-dashboard');

  if (!root) {
    return;
  }

  const API_BASE = (wpData.apiUrl || '/wp-json/alfawzquran/v1/').replace(/\/+$/, '/');
  const CORE_API_BASE = API_BASE.replace(/alfawzquran\/v1\/?$/, '');
  const headers = {};

  if (wpData.nonce) {
    headers['X-WP-Nonce'] = wpData.nonce;
  }

  const teacherId = Number(teacherConfig.teacherId || root.dataset.teacherId || wpData.userId || 0);
  const builderUrl = teacherConfig.builderUrl || root.dataset.builderUrl || '';
  const classLinkTemplate = root.dataset.classLinkTemplate || '';

  const assignmentCardCount = root.querySelector('#alfawz-teacher-assignment-count');
  const draftCountEl = root.querySelector('#alfawz-teacher-draft-count');
  const weeklyAssignmentsEl = root.querySelector('#alfawz-teacher-weekly-assignments');
  const followupCountEl = root.querySelector('#alfawz-teacher-followup-count');
  const classCountEl = root.querySelector('#alfawz-teacher-class-count');
  const totalStudentsEl = root.querySelector('#alfawz-teacher-total-students');
  const studentCountEl = root.querySelector('#alfawz-teacher-student-count');
  const activePlanCountEl = root.querySelector('#alfawz-teacher-active-plan-count');
  const streakCountEl = root.querySelector('#alfawz-teacher-streak-count');
  const classListEl = root.querySelector('#alfawz-teacher-class-list');
  const classRefreshLabel = root.querySelector('#alfawz-teacher-class-refresh-label');
  const assignmentListEl = root.querySelector('#alfawz-teacher-assignment-list');
  const memorizationListEl = root.querySelector('#alfawz-teacher-memorization-list');
  const memorizationUpdatedEl = root.querySelector('#alfawz-teacher-memorization-updated');
  const assignmentForm = root.querySelector('#alfawz-teacher-assignment-form');
  const toggleFormButton = root.querySelector('#alfawz-teacher-toggle-form');
  const classSelect = root.querySelector('#alfawz-teacher-class-select');
  const studentSearchInput = root.querySelector('#alfawz-teacher-student-search');
  const studentListEl = root.querySelector('#alfawz-teacher-student-list');
  const studentHelperEl = root.querySelector('#alfawz-teacher-student-helper');
  const chooseImageButton = root.querySelector('#alfawz-teacher-choose-image');
  const removeImageButton = root.querySelector('#alfawz-teacher-remove-image');
  const imageInput = root.querySelector('#alfawz-teacher-assignment-image');
  const imagePreview = root.querySelector('#alfawz-teacher-image-preview');
  const assignmentStatus = root.querySelector('#alfawz-teacher-assignment-status');
  const hotspotListEl = root.querySelector('#alfawz-teacher-hotspot-list');
  const addHotspotButton = root.querySelector('#alfawz-teacher-add-hotspot');
  const refreshButton = root.querySelector('#alfawz-teacher-refresh');
  const syncAssignmentsButton = root.querySelector('#alfawz-teacher-sync-assignments');

  const state = {
    classes: [],
    assignments: [],
    memorization: [],
    students: [],
    filteredStudents: [],
    selectedStudents: new Set(),
    selectedClass: '',
    image: null,
    hotspots: [],
  };

  const setBusy = (element, busy) => {
    if (!element) {
      return;
    }
    element.setAttribute('aria-busy', busy ? 'true' : 'false');
  };

  const formatDate = (value) => {
    if (!value) {
      return '';
    }
    try {
      const date = value instanceof Date ? value : new Date(value);
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      return String(value);
    }
  };

  const withinLastDays = (value, days = 7) => {
    if (!value) {
      return false;
    }
    const now = Date.now();
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) {
      return false;
    }
    return now - timestamp <= days * 24 * 60 * 60 * 1000;
  };

  const apiRequest = async (path, { method = 'GET', body, headers: extraHeaders } = {}) => {
    const cleanPath = path.replace(/^\/+/, '');
    const url = `${API_BASE}${cleanPath}`;
    const requestOptions = { method, headers: { ...headers, ...(extraHeaders || {}) } };

    if (body instanceof FormData) {
      requestOptions.body = body;
    } else if (body !== undefined) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  const coreRequest = async (path, { method = 'GET', body, headers: extraHeaders } = {}) => {
    const cleanPath = path.replace(/^\/+/, '');
    const url = `${CORE_API_BASE}${cleanPath}`;
    const requestOptions = { method, headers: { ...headers, ...(extraHeaders || {}) } };

    if (body instanceof FormData) {
      requestOptions.body = body;
    } else if (body !== undefined) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed with status ${response.status}`);
    }

    return response.json();
  };

  const buildUrlWithQuery = (url, params) => {
    if (!url) {
      return '';
    }
    try {
      const parsed = new URL(url, window.location.origin);
      Object.entries(params || {}).forEach(([key, value]) => {
        parsed.searchParams.set(key, value);
      });
      return parsed.toString();
    } catch (error) {
      return url;
    }
  };

  const buildClassLink = (classId, apiLink = '') => {
    if (apiLink) {
      return apiLink;
    }
    if (classLinkTemplate) {
      return classLinkTemplate.replace('__CLASS__', encodeURIComponent(classId));
    }
    if (builderUrl) {
      return buildUrlWithQuery(builderUrl, { class: classId });
    }
    return '';
  };

  const clearChildren = (element) => {
    if (!element) {
      return;
    }
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  const renderClassOptions = () => {
    if (!classSelect) {
      return;
    }
    const currentValue = classSelect.value;
    clearChildren(classSelect);

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = classSelect.dataset.defaultLabel || classSelect.options?.[0]?.textContent || 'Select class…';
    classSelect.appendChild(defaultOption);

    state.classes.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.id || '';
      option.textContent = item.label || item.id;
      classSelect.appendChild(option);
    });

    if (currentValue && Array.from(classSelect.options).some((option) => option.value === currentValue)) {
      classSelect.value = currentValue;
    }
  };

  const renderClassList = () => {
    if (!classListEl) {
      return;
    }

    clearChildren(classListEl);

    if (!state.classes.length) {
      const empty = document.createElement('p');
      empty.className = 'text-sm text-slate-500';
      empty.textContent = 'No classes assigned yet. Please contact the admin to connect you with a class.';
      classListEl.appendChild(empty);
      setBusy(classListEl, false);
      return;
    }

    state.classes.forEach((classItem) => {
      const card = document.createElement('article');
      card.className = 'rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm';

      const header = document.createElement('div');
      header.className = 'flex flex-wrap items-start justify-between gap-3';

      const info = document.createElement('div');
      const title = document.createElement('h4');
      title.className = 'text-lg font-semibold text-slate-900';
      title.textContent = classItem.label || 'Unnamed class';

      const meta = document.createElement('p');
      meta.className = 'text-xs text-slate-500';
      meta.textContent = `${classItem.student_count || 0} students • ${classItem.assignment_count || 0} assignments`;

      info.appendChild(title);
      info.appendChild(meta);

      const linkUrl = buildClassLink(classItem.id, classItem.link);

      if (linkUrl) {
        const link = document.createElement('a');
        link.href = linkUrl;
        link.className = 'alfawz-link text-sm font-semibold text-emerald-600';
        link.textContent = 'View activity';
        header.appendChild(info);
        header.appendChild(link);
      } else {
        header.appendChild(info);
      }

      card.appendChild(header);

      if (classItem.latest_assignment && classItem.latest_assignment.title) {
        const latest = document.createElement('p');
        latest.className = 'mt-3 text-xs text-slate-500';
        const updated = formatDate(classItem.latest_assignment.updated);
        latest.textContent = `Latest assignment: ${classItem.latest_assignment.title} ${updated ? `• ${updated}` : ''}`;
        card.appendChild(latest);
      }

      classListEl.appendChild(card);
    });

    setBusy(classListEl, false);
  };

  const renderAssignmentList = () => {
    if (!assignmentListEl) {
      return;
    }

    clearChildren(assignmentListEl);

    if (!state.assignments.length) {
      const empty = document.createElement('li');
      empty.className = 'text-sm text-slate-500';
      empty.textContent = 'No assignments have been sent yet.';
      assignmentListEl.appendChild(empty);
      setBusy(assignmentListEl, false);
      return;
    }

    state.assignments.forEach((assignment) => {
      const item = document.createElement('li');
      item.className = 'rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm';

      const header = document.createElement('div');
      header.className = 'flex flex-wrap items-start justify-between gap-3';

      const info = document.createElement('div');
      const title = document.createElement('h4');
      title.className = 'text-base font-semibold text-slate-900';
      title.textContent = assignment.title || 'Qa’idah assignment';

      const subtitle = document.createElement('p');
      subtitle.className = 'text-xs text-slate-500';
      const classLabel = assignment.class && assignment.class.label ? assignment.class.label : 'No class';
      const updated = formatDate(assignment.updated || assignment.created);
      subtitle.textContent = `${classLabel}${updated ? ` • ${updated}` : ''}`;

      info.appendChild(title);
      info.appendChild(subtitle);

      const actions = document.createElement('div');
      actions.className = 'flex flex-wrap items-center gap-3';

      const status = document.createElement('span');
      const isDraft = assignment.status && assignment.status !== 'publish';
      status.className = `inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isDraft ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`;
      status.textContent = isDraft ? 'Draft' : 'Published';
      actions.appendChild(status);

      const viewLink = document.createElement('a');
      viewLink.className = 'text-sm font-semibold text-emerald-600';
      const viewUrl = assignment.permalink || (builderUrl ? buildUrlWithQuery(builderUrl, { assignment: assignment.id }) : '#');
      viewLink.href = viewUrl;
      viewLink.target = '_blank';
      viewLink.rel = 'noopener';
      viewLink.textContent = isDraft ? 'Edit' : 'View';
      actions.appendChild(viewLink);

      header.appendChild(info);
      header.appendChild(actions);

      if (assignment.description) {
        const description = document.createElement('p');
        description.className = 'mt-3 text-sm text-slate-600';
        description.innerHTML = assignment.description;
        item.appendChild(header);
        item.appendChild(description);
      } else {
        item.appendChild(header);
      }

      assignmentListEl.appendChild(item);
    });

    setBusy(assignmentListEl, false);
  };

  const renderMemorizationList = () => {
    if (!memorizationListEl) {
      return;
    }

    clearChildren(memorizationListEl);

    if (!state.memorization.length) {
      const empty = document.createElement('p');
      empty.className = 'text-sm text-slate-500';
      empty.textContent = 'No memorisation plans found for your students yet.';
      memorizationListEl.appendChild(empty);
      setBusy(memorizationListEl, false);
      return;
    }

    state.memorization.forEach((entry) => {
      const card = document.createElement('article');
      card.className = 'rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm';

      const header = document.createElement('div');
      header.className = 'flex flex-wrap items-center justify-between gap-3';

      const studentInfo = document.createElement('div');
      studentInfo.className = 'flex items-center gap-3';

      const avatar = document.createElement('img');
      avatar.className = 'h-10 w-10 rounded-full object-cover';
      avatar.alt = `${entry.student.name || 'Student'} avatar`;
      const fallbackAvatar = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
      avatar.src = entry.student.avatar || fallbackAvatar;

      const studentText = document.createElement('div');
      const name = document.createElement('p');
      name.className = 'text-sm font-semibold text-slate-900';
      name.textContent = entry.student.name || 'Student';
      const classInfo = document.createElement('p');
      classInfo.className = 'text-xs text-slate-500';
      classInfo.textContent = entry.student.class && entry.student.class.label ? entry.student.class.label : 'No class assigned';

      studentText.appendChild(name);
      studentText.appendChild(classInfo);

      studentInfo.appendChild(avatar);
      studentInfo.appendChild(studentText);
      header.appendChild(studentInfo);

      const stats = document.createElement('div');
      stats.className = 'text-right';
      const memorized = document.createElement('p');
      memorized.className = 'text-sm font-semibold text-emerald-600';
      memorized.textContent = `${entry.verses_memorized || 0} verses memorised`;
      const streak = document.createElement('p');
      streak.className = 'text-xs text-slate-500';
      streak.textContent = `Streak: ${entry.streak?.current || 0} days`;
      stats.appendChild(memorized);
      stats.appendChild(streak);

      header.appendChild(stats);
      card.appendChild(header);

      if (entry.plans && entry.plans.length) {
        const planList = document.createElement('ul');
        planList.className = 'mt-3 space-y-2';
        entry.plans.forEach((plan) => {
          const planItem = document.createElement('li');
          planItem.className = 'rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-sm';
          const label = document.createElement('div');
          label.className = 'flex items-center justify-between';
          const title = document.createElement('span');
          title.className = 'font-semibold text-slate-800';
          title.textContent = plan.plan_name || 'Memorisation plan';
          const percent = document.createElement('span');
          percent.className = 'text-xs font-semibold text-emerald-600';
          percent.textContent = `${plan.completion_percentage || 0}%`;
          label.appendChild(title);
          label.appendChild(percent);
          planItem.appendChild(label);

          const progressMeta = document.createElement('p');
          progressMeta.className = 'mt-1 text-xs text-slate-500';
          progressMeta.textContent = `${plan.completed_verses || 0} of ${plan.total_verses || 0} verses completed`;
          planItem.appendChild(progressMeta);

          planList.appendChild(planItem);
        });
        card.appendChild(planList);
      } else {
        const noPlans = document.createElement('p');
        noPlans.className = 'mt-3 text-xs text-slate-500';
        noPlans.textContent = 'No active memorisation plans yet.';
        card.appendChild(noPlans);
      }

      memorizationListEl.appendChild(card);
    });

    setBusy(memorizationListEl, false);
  };

  const updateAssignmentMetrics = () => {
    const assignments = state.assignments || [];
    const published = assignments.filter((item) => (item.status || 'publish') === 'publish');
    const drafts = assignments.filter((item) => (item.status || 'publish') !== 'publish');
    const weekly = assignments.filter((item) => withinLastDays(item.updated || item.created, 7));
    const followup = assignments.filter((item) => (item.status || 'publish') !== 'publish' || (Array.isArray(item.students) && item.students.length === 0));

    if (assignmentCardCount) {
      assignmentCardCount.textContent = published.length.toString();
    }
    if (draftCountEl) {
      draftCountEl.textContent = drafts.length.toString();
    }
    if (weeklyAssignmentsEl) {
      weeklyAssignmentsEl.textContent = weekly.length.toString();
    }
    if (followupCountEl) {
      followupCountEl.textContent = followup.length.toString();
    }
  };

  const updateClassMetrics = () => {
    if (classCountEl) {
      classCountEl.textContent = state.classes.length.toString();
    }
    const totalStudents = state.classes.reduce((total, item) => total + (item.student_count || 0), 0);
    if (totalStudentsEl) {
      totalStudentsEl.textContent = totalStudents.toString();
    }
    if (classRefreshLabel) {
      classRefreshLabel.textContent = `Updated ${formatDate(new Date())}`;
    }
  };

  const updateMemorizationMetrics = () => {
    if (studentCountEl) {
      studentCountEl.textContent = state.memorization.length.toString();
    }
    const activePlans = state.memorization.reduce((total, entry) => total + (entry.active_plan_count || 0), 0);
    if (activePlanCountEl) {
      activePlanCountEl.textContent = activePlans.toString();
    }
    const streaking = state.memorization.filter((entry) => (entry.streak?.current || 0) > 0).length;
    if (streakCountEl) {
      streakCountEl.textContent = streaking.toString();
    }
    if (memorizationUpdatedEl) {
      memorizationUpdatedEl.textContent = `Synced ${formatDate(new Date())}`;
    }
  };

  const filterStudents = (query) => {
    const normalized = (query || '').trim().toLowerCase();
    if (!normalized) {
      state.filteredStudents = [...state.students];
      return;
    }
    state.filteredStudents = state.students.filter((student) => {
      const haystack = `${student.name || ''} ${student.email || ''}`.toLowerCase();
      return haystack.includes(normalized);
    });
  };

  const renderStudentList = () => {
    if (!studentListEl) {
      return;
    }
    clearChildren(studentListEl);

    if (!state.filteredStudents.length) {
      const empty = document.createElement('p');
      empty.className = 'text-xs text-slate-500';
      empty.textContent = state.selectedClass
        ? 'No students found for the selected class.'
        : 'Select a class to load students or add them manually.';
      studentListEl.appendChild(empty);
      setBusy(studentListEl, false);
      return;
    }

    state.filteredStudents.forEach((student) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'flex items-center justify-between rounded-xl border border-slate-100 bg-white/80 px-3 py-2 text-sm';

      const info = document.createElement('div');
      const name = document.createElement('span');
      name.className = 'font-semibold text-slate-800';
      name.textContent = student.name || 'Student';
      const email = document.createElement('span');
      email.className = 'ml-2 text-xs text-slate-500';
      email.textContent = student.email || '';
      info.appendChild(name);
      if (student.email) {
        info.appendChild(email);
      }

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = student.id;
      checkbox.className = 'h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500';
      checkbox.checked = state.selectedStudents.has(student.id);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          state.selectedStudents.add(student.id);
        } else {
          state.selectedStudents.delete(student.id);
        }
      });

      wrapper.appendChild(info);
      wrapper.appendChild(checkbox);
      studentListEl.appendChild(wrapper);
    });

    setBusy(studentListEl, false);
  };

  const loadStudents = async (classId = '') => {
    setBusy(studentListEl, true);
    state.selectedClass = classId;
    state.selectedStudents.clear();

    try {
      const endpoint = classId ? `qaidah/students?class_id=${encodeURIComponent(classId)}` : 'qaidah/students';
      const students = await apiRequest(endpoint);
      state.students = Array.isArray(students) ? students : [];
      filterStudents(studentSearchInput?.value || '');
      renderStudentList();
    } catch (error) {
      clearChildren(studentListEl);
      const notice = document.createElement('p');
      notice.className = 'text-xs text-rose-600';
      notice.textContent = 'Unable to load students. Please try again.';
      studentListEl.appendChild(notice);
      setBusy(studentListEl, false);
    }
  };

  const setImagePreview = (image) => {
    state.image = image;
    if (!imagePreview) {
      return;
    }
    if (image && image.url) {
      const img = imagePreview.querySelector('img');
      if (img) {
        img.src = image.url;
      }
      imagePreview.classList.remove('hidden');
      if (removeImageButton) {
        removeImageButton.classList.remove('hidden');
      }
    } else {
      const img = imagePreview.querySelector('img');
      if (img) {
        img.src = '';
      }
      imagePreview.classList.add('hidden');
      if (removeImageButton) {
        removeImageButton.classList.add('hidden');
      }
    }
  };

  const uploadImage = async (file) => {
    if (!file) {
      return null;
    }
    const formData = new FormData();
    formData.append('file', file, file.name);
    const response = await coreRequest('wp/v2/media', { method: 'POST', body: formData });
    return {
      id: response?.id,
      url: response?.source_url || response?.guid?.rendered || '',
    };
  };

  const uploadHotspotAudio = async (index, file, statusEl) => {
    if (!file) {
      return null;
    }
    const formData = new FormData();
    formData.append('audio', file, file.name);
    try {
      const response = await apiRequest('qaidah/audio', { method: 'POST', body: formData });
      state.hotspots[index].audio_id = response?.id || 0;
      state.hotspots[index].audio_url = response?.url || '';
      if (statusEl) {
        statusEl.textContent = 'Audio uploaded';
        statusEl.className = 'text-xs text-emerald-600';
      }
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = 'Audio upload failed';
        statusEl.className = 'text-xs text-rose-600';
      }
    }
  };

  const renderHotspots = () => {
    if (!hotspotListEl) {
      return;
    }
    clearChildren(hotspotListEl);

    if (!state.hotspots.length) {
      const empty = document.createElement('p');
      empty.className = 'text-xs text-slate-500';
      empty.textContent = 'Add hotspots to highlight areas of focus on the Qa’idah page.';
      hotspotListEl.appendChild(empty);
      return;
    }

    state.hotspots.forEach((spot, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'space-y-3 rounded-xl border border-emerald-100 bg-white/80 p-3';

      const header = document.createElement('div');
      header.className = 'flex items-center justify-between';

      const title = document.createElement('p');
      title.className = 'text-sm font-semibold text-slate-800';
      title.textContent = `Hotspot ${index + 1}`;

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'text-xs font-semibold text-rose-600';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        state.hotspots.splice(index, 1);
        renderHotspots();
      });

      header.appendChild(title);
      header.appendChild(removeButton);
      wrapper.appendChild(header);

      const labelField = document.createElement('label');
      labelField.className = 'alfawz-field';
      const labelSpan = document.createElement('span');
      labelSpan.className = 'alfawz-field-label';
      labelSpan.textContent = 'Label';
      const labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.className = 'alfawz-input';
      labelInput.value = spot.label || '';
      labelInput.addEventListener('input', () => {
        state.hotspots[index].label = labelInput.value;
      });
      labelField.appendChild(labelSpan);
      labelField.appendChild(labelInput);
      wrapper.appendChild(labelField);

      const grid = document.createElement('div');
      grid.className = 'grid gap-3 md:grid-cols-2';
      ['x', 'y', 'width', 'height'].forEach((key) => {
        const field = document.createElement('label');
        field.className = 'alfawz-field';
        const span = document.createElement('span');
        span.className = 'alfawz-field-label';
        span.textContent = key.toUpperCase();
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'alfawz-input';
        input.min = '0';
        input.max = '100';
        input.step = '0.1';
        input.value = spot[key] !== undefined ? spot[key] : '';
        input.addEventListener('input', () => {
          state.hotspots[index][key] = Number(input.value || 0);
        });
        field.appendChild(span);
        field.appendChild(input);
        grid.appendChild(field);
      });
      wrapper.appendChild(grid);

      const audioRow = document.createElement('div');
      audioRow.className = 'flex flex-wrap items-center gap-3';
      const audioButton = document.createElement('button');
      audioButton.type = 'button';
      audioButton.className = 'alfawz-button alfawz-button--ghost';
      audioButton.innerHTML = `<span>🎧</span><span>${spot.audio_url ? 'Replace audio' : 'Upload audio'}</span>`;
      const audioStatus = document.createElement('p');
      audioStatus.className = 'text-xs text-slate-500';
      if (spot.audio_url) {
        audioStatus.textContent = 'Audio attached';
      }
      const audioInput = document.createElement('input');
      audioInput.type = 'file';
      audioInput.accept = 'audio/*';
      audioInput.className = 'hidden';
      audioButton.addEventListener('click', () => audioInput.click());
      audioInput.addEventListener('change', async () => {
        if (audioInput.files?.length) {
          audioStatus.textContent = 'Uploading audio…';
          audioStatus.className = 'text-xs text-slate-500';
          await uploadHotspotAudio(index, audioInput.files[0], audioStatus);
        }
      });
      audioRow.appendChild(audioButton);
      audioRow.appendChild(audioInput);
      audioRow.appendChild(audioStatus);
      wrapper.appendChild(audioRow);

      hotspotListEl.appendChild(wrapper);
    });
  };

  const resetAssignmentForm = () => {
    if (assignmentForm) {
      assignmentForm.reset();
    }
    state.selectedClass = '';
    state.selectedStudents.clear();
    state.students = [];
    state.filteredStudents = [];
    studentListEl && clearChildren(studentListEl);
    state.hotspots = [];
    renderHotspots();
    setImagePreview(null);
    if (studentHelperEl) {
      studentHelperEl.textContent = 'Select an entire class or pick individual students.';
    }
    renderStudentList();
  };

  const createAssignment = async (event) => {
    event.preventDefault();
    if (!assignmentForm) {
      return;
    }

    const titleInput = assignmentForm.querySelector('#alfawz-teacher-assignment-title');
    const descriptionInput = assignmentForm.querySelector('#alfawz-teacher-assignment-description');
    const title = titleInput?.value.trim();
    const description = descriptionInput?.value.trim();
    const classId = classSelect?.value || '';
    const students = Array.from(state.selectedStudents);

    if (!title) {
      if (assignmentStatus) {
        assignmentStatus.textContent = 'Please add a title before saving.';
        assignmentStatus.className = 'text-xs text-rose-600';
      }
      return;
    }

    if (!state.image?.id) {
      if (assignmentStatus) {
        assignmentStatus.textContent = 'Select an assignment image to continue.';
        assignmentStatus.className = 'text-xs text-rose-600';
      }
      return;
    }

    if (!classId && students.length === 0) {
      if (assignmentStatus) {
        assignmentStatus.textContent = 'Select a class or individual students.';
        assignmentStatus.className = 'text-xs text-rose-600';
      }
      return;
    }

    const payload = {
      title,
      class_id: classId,
      student_ids: students,
      description,
      image_id: state.image.id,
      hotspots: state.hotspots.map((spot) => ({
        id: spot.id || undefined,
        label: spot.label || '',
        x: Number(spot.x || 0),
        y: Number(spot.y || 0),
        width: Number(spot.width || 0),
        height: Number(spot.height || 0),
        audio_id: spot.audio_id ? Number(spot.audio_id) : 0,
      })),
    };

    try {
      if (assignmentStatus) {
        assignmentStatus.textContent = 'Saving assignment…';
        assignmentStatus.className = 'text-xs text-slate-500';
      }
      const response = await apiRequest('qaidah/assignments', { method: 'POST', body: payload });
      if (assignmentStatus) {
        assignmentStatus.textContent = 'Assignment saved successfully.';
        assignmentStatus.className = 'text-xs text-emerald-600';
      }
      await loadAssignments();
      if (response?.id) {
        const link = builderUrl ? buildUrlWithQuery(builderUrl, { assignment: response.id }) : response?.permalink;
        if (link && assignmentStatus) {
          const anchor = document.createElement('a');
          anchor.href = link;
          anchor.textContent = 'Open in builder';
          anchor.className = 'ml-2 text-xs font-semibold text-emerald-600';
          anchor.target = '_blank';
          anchor.rel = 'noopener';
          assignmentStatus.appendChild(anchor);
        }
      }
      resetAssignmentForm();
      loadStudents(state.selectedClass);
    } catch (error) {
      if (assignmentStatus) {
        assignmentStatus.textContent = 'Unable to save assignment. Please try again.';
        assignmentStatus.className = 'text-xs text-rose-600';
      }
    }
  };

  const loadClasses = async () => {
    setBusy(classListEl, true);
    try {
      const response = await apiRequest('teacher/classes');
      state.classes = Array.isArray(response) ? response : [];
      renderClassOptions();
      renderClassList();
      updateClassMetrics();
    } catch (error) {
      clearChildren(classListEl);
      const notice = document.createElement('p');
      notice.className = 'text-sm text-rose-600';
      notice.textContent = 'Unable to load classes.';
      classListEl.appendChild(notice);
      setBusy(classListEl, false);
    }
  };

  const loadAssignments = async () => {
    setBusy(assignmentListEl, true);
    try {
      const response = await apiRequest('qaidah/assignments?context=manage');
      state.assignments = Array.isArray(response) ? response : [];
      renderAssignmentList();
      updateAssignmentMetrics();
    } catch (error) {
      clearChildren(assignmentListEl);
      const notice = document.createElement('li');
      notice.className = 'text-sm text-rose-600';
      notice.textContent = 'Unable to load assignments.';
      assignmentListEl.appendChild(notice);
      setBusy(assignmentListEl, false);
    }
  };

  const loadMemorization = async () => {
    setBusy(memorizationListEl, true);
    try {
      const endpoint = teacherId ? `memorization-plans?teacher_id=${encodeURIComponent(teacherId)}` : 'memorization-plans';
      const response = await apiRequest(endpoint);
      state.memorization = Array.isArray(response) ? response : [];
      renderMemorizationList();
      updateMemorizationMetrics();
    } catch (error) {
      clearChildren(memorizationListEl);
      const notice = document.createElement('p');
      notice.className = 'text-sm text-rose-600';
      notice.textContent = 'Unable to load memorisation data.';
      memorizationListEl.appendChild(notice);
      setBusy(memorizationListEl, false);
    }
  };

  const loadAll = async () => {
    await Promise.all([loadClasses(), loadAssignments(), loadMemorization()]);
  };

  toggleFormButton?.addEventListener('click', () => {
    if (!assignmentForm) {
      return;
    }
    assignmentForm.classList.toggle('hidden');
    if (!assignmentForm.classList.contains('hidden') && !state.students.length) {
      loadStudents(classSelect?.value || '');
    }
  });

  classSelect?.addEventListener('change', () => {
    loadStudents(classSelect.value);
  });

  studentSearchInput?.addEventListener('input', () => {
    filterStudents(studentSearchInput.value);
    renderStudentList();
  });

  chooseImageButton?.addEventListener('click', () => imageInput?.click());

  imageInput?.addEventListener('change', async () => {
    if (!imageInput.files?.length) {
      return;
    }
    try {
      const uploaded = await uploadImage(imageInput.files[0]);
      setImagePreview(uploaded);
      if (assignmentStatus) {
        assignmentStatus.textContent = '';
      }
    } catch (error) {
      if (assignmentStatus) {
        assignmentStatus.textContent = 'Image upload failed.';
        assignmentStatus.className = 'text-xs text-rose-600';
      }
      setImagePreview(null);
    }
  });

  removeImageButton?.addEventListener('click', () => {
    setImagePreview(null);
    if (imageInput) {
      imageInput.value = '';
    }
  });

  addHotspotButton?.addEventListener('click', () => {
    state.hotspots.push({
      id: `hotspot_${Date.now()}`,
      label: '',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      audio_id: 0,
      audio_url: '',
    });
    renderHotspots();
  });

  assignmentForm?.addEventListener('submit', createAssignment);
  refreshButton?.addEventListener('click', loadAll);
  syncAssignmentsButton?.addEventListener('click', loadAssignments);

  renderHotspots();
  loadAll();
})();

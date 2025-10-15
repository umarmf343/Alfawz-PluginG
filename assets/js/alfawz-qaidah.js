(() => {
  const settings = window.alfawzQaidahData || {};
  const root = document.getElementById('alfawz-qaidah');

  if (!root) {
    return;
  }

  const apiBase = (settings.apiUrl || '/wp-json/alfawzquran/v1/').replace(/\/+$/, '/');
  const headers = {};

  if (settings.nonce) {
    headers['X-WP-Nonce'] = settings.nonce;
  }

  const strings = {
    loading: 'Loading…',
    uploadError: 'Upload failed. Please try again.',
    recordError: 'Unable to access microphone. You can upload audio files instead.',
    recording: 'Recording…',
    saving: 'Saving assignment…',
    saved: 'Assignment sent successfully.',
    saveError: 'Assignment could not be saved. Please review the form and try again.',
    noAssignments: 'No assignments yet.',
    noStudents: 'No students available for this class.',
    firstHotspot: 'Click the image to add your first hotspot.',
    hotspotRequired: 'Add at least one hotspot before sending.',
    playbackError: 'Unable to play this audio clip.',
    ...(settings.strings || {}),
  };

  const buildApiUrl = (path) => {
    const clean = String(path || '').replace(/^\/+/, '');
    return `${apiBase}${clean}`;
  };

  const apiRequest = async (path, { method = 'GET', body, headers: extraHeaders } = {}) => {
    const url = buildApiUrl(path);
    const options = { method, headers: { ...headers, ...(extraHeaders || {}) } };

    if (body instanceof FormData) {
      options.body = body;
    } else if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
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

  const role = root.dataset.role || (settings.isTeacher ? 'teacher' : 'student');

  const render = (element, renderer) => {
    if (!element) {
      return;
    }
    element.innerHTML = '';
    renderer();
  };

  const formatPercent = (value) => {
    const number = Math.min(100, Math.max(0, Number(value) || 0));
    return `${number.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')}%`;
  };

  const teacherState = {
    classes: [],
    students: [],
    image: null,
    hotspots: [],
    currentAssignmentId: null,
    currentRecording: null,
    mediaRecorder: null,
    mediaStream: null,
    mediaChunks: [],
    recordControls: null,
    assignmentSaving: false,
  };

  const studentState = {
    assignments: [],
    currentAudio: null,
    playingHotspot: null,
  };

  const resetRecordingUI = () => {
    const controls = teacherState.recordControls;
    if (!controls) {
      return;
    }

    const { recordButton, status } = controls;
    if (recordButton) {
      recordButton.classList.remove('is-recording');
      const label = recordButton.querySelector('span');
      if (label) {
        label.textContent = 'Record audio';
      }
    }
    if (status && status.textContent === strings.recording) {
      status.textContent = '';
      status.classList.remove('is-info');
    }

    teacherState.recordControls = null;
  };

  const cleanupRecording = () => {
    if (teacherState.mediaRecorder) {
      teacherState.mediaRecorder.ondataavailable = null;
      teacherState.mediaRecorder.onstop = null;
      if (teacherState.mediaRecorder.state !== 'inactive') {
        teacherState.mediaRecorder.stop();
      }
    }
    if (teacherState.mediaStream) {
      teacherState.mediaStream.getTracks().forEach((track) => track.stop());
    }
    teacherState.mediaRecorder = null;
    teacherState.mediaStream = null;
    teacherState.mediaChunks = [];
    teacherState.currentRecording = null;
    resetRecordingUI();
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

  const initTeacherView = () => {
    const form = document.getElementById('alfawz-qaidah-assignment-form');
    const titleInput = document.getElementById('alfawz-qaidah-title');
    const descriptionInput = document.getElementById('alfawz-qaidah-description');
    const classSelect = document.getElementById('alfawz-qaidah-class');
    const studentFilter = document.getElementById('alfawz-qaidah-student-filter');
    const statusEl = document.getElementById('alfawz-qaidah-status');
    const selectImageButton = document.getElementById('alfawz-qaidah-select-image');
    const imagePreview = document.getElementById('alfawz-qaidah-image-preview');
    const imageElement = document.getElementById('alfawz-qaidah-image');
    const imageIdInput = document.getElementById('alfawz-qaidah-image-id');
    const hotspotLayer = document.getElementById('alfawz-qaidah-hotspot-layer');
    const hotspotList = document.getElementById('alfawz-qaidah-hotspot-list');
    const resetButton = document.getElementById('alfawz-qaidah-reset');
    const submitButton = document.getElementById('alfawz-qaidah-submit');
    const submitLabel = submitButton ? submitButton.querySelector('span:last-child') : null;
    const defaultSubmitLabel = submitLabel ? submitLabel.textContent : '';

    const setStatus = (message, tone = 'info') => {
      if (!statusEl) {
        return;
      }
      statusEl.textContent = message || '';
      statusEl.classList.remove('is-error', 'is-success', 'is-info');
      if (message) {
        const toneClass = tone === 'error' ? 'is-error' : tone === 'success' ? 'is-success' : 'is-info';
        statusEl.classList.add(toneClass);
      }
    };

    const populateClasses = async () => {
      try {
        const classes = await apiRequest('qaidah/classes');
        teacherState.classes = Array.isArray(classes) ? classes : [];
        const placeholder = classSelect
          ? classSelect.getAttribute('data-placeholder') || classSelect.dataset.placeholder || classSelect.options?.[0]?.text || 'Select a class…'
          : 'Select a class…';

        render(classSelect, () => {
          if (classSelect) {
            classSelect.setAttribute('data-placeholder', placeholder);
          }
          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.textContent = placeholder;
          classSelect.appendChild(defaultOption);
          teacherState.classes.forEach((classItem) => {
            const option = document.createElement('option');
            option.value = classItem.id;
            option.textContent = classItem.label || classItem.id;
            classSelect.appendChild(option);
          });
        });
        return teacherState.classes;
      } catch (error) {
        console.error('[AlfawzQuran] Failed to load classes', error);
        teacherState.classes = [];
        return teacherState.classes;
      }
    };

    const renderStudentFilter = () => {
      if (!studentFilter) {
        return;
      }
      render(studentFilter, () => {
        if (!teacherState.students.length) {
          const empty = document.createElement('p');
          empty.className = 'text-xs text-slate-500';
          empty.textContent = strings.noStudents;
          studentFilter.appendChild(empty);
          return;
        }

        teacherState.students.forEach((student) => {
          const id = `qaidah-student-${student.id}`;
          const wrapper = document.createElement('label');
          wrapper.className = 'alfawz-qaidah-student';
          wrapper.setAttribute('for', id);

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = id;
          checkbox.value = student.id;
          checkbox.className = 'alfawz-qaidah-student__checkbox';

          const avatar = document.createElement('span');
          avatar.className = 'alfawz-qaidah-student__avatar';
          if (student.avatar) {
            avatar.style.backgroundImage = `url(${student.avatar})`;
          } else {
            avatar.textContent = student.name ? student.name.charAt(0).toUpperCase() : 'S';
          }

          const info = document.createElement('span');
          info.className = 'alfawz-qaidah-student__name';
          info.textContent = student.name || `ID ${student.id}`;

          wrapper.appendChild(checkbox);
          wrapper.appendChild(avatar);
          wrapper.appendChild(info);
          studentFilter.appendChild(wrapper);
        });
      });
    };

    const markSelectedStudents = (selectedIds) => {
      if (!studentFilter || !Array.isArray(selectedIds) || !selectedIds.length) {
        return;
      }
      const selected = new Set(selectedIds.map((value) => Number(value)));
      studentFilter.querySelectorAll('input[type="checkbox"]').forEach((input) => {
        const value = Number(input.value);
        input.checked = selected.has(value);
      });
    };

    const ensureClassesLoaded = async () => {
      if (!teacherState.classes.length) {
        await populateClasses();
      }
      return teacherState.classes;
    };

    const parsePercent = (value) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string') {
        const cleaned = value.replace('%', '').trim();
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    };

    const prefillAssignment = async (assignment, options = {}) => {
      if (!assignment) {
        return null;
      }

      const { keepStatus = false } = options;

      await ensureClassesLoaded();

      teacherState.currentAssignmentId = assignment.id || null;

      if (submitLabel) {
        submitLabel.textContent = strings.updateAssignment || defaultSubmitLabel || submitLabel.textContent;
      }

      if (form) {
        form.reset();
      }

      if (titleInput) {
        titleInput.value = assignment.title || '';
      }

      if (descriptionInput) {
        descriptionInput.value = assignment.description || '';
      }

      const classId = assignment.class?.id || '';
      if (classSelect) {
        classSelect.value = classId;
      }

      await loadStudents(classId);

      if (Array.isArray(assignment.students) && assignment.students.length) {
        requestAnimationFrame(() => markSelectedStudents(assignment.students));
      }

      if (assignment.image && assignment.image.url) {
        teacherState.image = {
          id: assignment.image.id,
          url: assignment.image.url,
          width: assignment.image.width,
          height: assignment.image.height,
        };
        if (imageElement) {
          imageElement.src = teacherState.image.url;
          imageElement.onload = () => renderHotspots();
        }
        if (imagePreview) {
          imagePreview.classList.remove('hidden');
        }
        if (imageIdInput) {
          imageIdInput.value = assignment.image.id || '';
        }
      } else {
        teacherState.image = null;
        if (imagePreview) {
          imagePreview.classList.add('hidden');
        }
        if (imageElement) {
          imageElement.src = '';
        }
        if (imageIdInput) {
          imageIdInput.value = '';
        }
      }

      teacherState.hotspots = Array.isArray(assignment.hotspots)
        ? assignment.hotspots.map((hotspot) => ({
            id: hotspot.id || `hotspot-${Date.now()}`,
            label: hotspot.label || '',
            x: parsePercent(hotspot.x),
            y: parsePercent(hotspot.y),
            audioId: hotspot.audio_id || 0,
            audioUrl: hotspot.audio_url || '',
          }))
        : [];

      renderHotspots();

      if (!keepStatus) {
        setStatus(strings.editing || '', 'info');
      }

      return assignment;
    };

    const editAssignment = async (assignmentId) => {
      if (!assignmentId) {
        return null;
      }

      setStatus(strings.loading || 'Loading…', 'info');

      try {
        const assignment = await apiRequest(`qaidah/assignments/${assignmentId}`);
        await prefillAssignment(assignment);
        return assignment;
      } catch (error) {
        console.error('[AlfawzQuran] Failed to load assignment', error);
        setStatus(strings.editError || strings.saveError || '', 'error');
        throw error;
      }
    };

    const loadStudents = async (classId = '') => {
      try {
        const params = classId ? `?class_id=${encodeURIComponent(classId)}` : '';
        const students = await apiRequest(`qaidah/students${params}`);
        teacherState.students = Array.isArray(students) ? students : [];
        renderStudentFilter();
        return teacherState.students;
      } catch (error) {
        console.error('[AlfawzQuran] Failed to load students', error);
        teacherState.students = [];
        renderStudentFilter();
        return teacherState.students;
      }
    };

    const resetHotspots = () => {
      teacherState.hotspots = [];
      renderHotspots();
    };

    const resetBuilder = (clearStatus = true) => {
      cleanupRecording();
      teacherState.image = null;
      teacherState.currentAssignmentId = null;
      if (form) {
        form.reset();
      }
      if (imagePreview) {
        imagePreview.classList.add('hidden');
      }
      if (imageElement) {
        imageElement.src = '';
      }
      if (imageIdInput) {
        imageIdInput.value = '';
      }
      resetHotspots();
      if (submitLabel) {
        submitLabel.textContent = defaultSubmitLabel;
      }
      if (clearStatus) {
        setStatus('');
      }
    };

    const ensureMediaFrame = () => {
      if (!window.wp || !window.wp.media) {
        console.warn('[AlfawzQuran] wp.media is unavailable');
        return null;
      }
      const frame = wp.media({
        title: settings.mediaSettings?.title || 'Select Image',
        button: { text: settings.mediaSettings?.button || 'Use image' },
        multiple: false,
        library: { type: ['image'] },
      });

      frame.on('select', () => {
        const attachment = frame.state().get('selection').first();
        if (!attachment) {
          return;
        }
        const details = attachment.toJSON();
        teacherState.image = {
          id: details.id,
          url: details.sizes?.large?.url || details.url,
          width: details.width,
          height: details.height,
        };
        if (imageElement) {
          imageElement.src = teacherState.image.url;
          imageElement.onload = () => renderHotspots();
        }
        if (imagePreview) {
          imagePreview.classList.remove('hidden');
        }
        if (imageIdInput) {
          imageIdInput.value = teacherState.image.id;
        }
      });

      return frame;
    };

    let mediaFrame = null;

    const openMediaLibrary = (event) => {
      event.preventDefault();
      if (!mediaFrame) {
        mediaFrame = ensureMediaFrame();
      }
      mediaFrame?.open();
    };

    const renderHotspots = () => {
      if (!hotspotLayer || !hotspotList) {
        return;
      }

      hotspotLayer.innerHTML = '';
      hotspotList.innerHTML = '';

      if (!teacherState.hotspots.length) {
        const hint = document.createElement('li');
        hint.className = 'alfawz-qaidah-hotspot-empty';
        hint.textContent = strings.firstHotspot;
        hotspotList.appendChild(hint);
        return;
      }

      teacherState.hotspots.forEach((hotspot, index) => {
        const marker = document.createElement('button');
        marker.type = 'button';
        marker.className = 'alfawz-qaidah-hotspot';
        marker.style.left = formatPercent(hotspot.x);
        marker.style.top = formatPercent(hotspot.y);
        marker.dataset.id = hotspot.id;
        marker.setAttribute('aria-label', hotspot.label || `Hotspot ${index + 1}`);
        marker.addEventListener('click', (event) => {
          event.stopPropagation();
          const item = hotspotList.querySelector(`[data-id="${hotspot.id}"]`);
          item?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          item?.classList.add('is-focused');
          setTimeout(() => item?.classList.remove('is-focused'), 800);
        });
        hotspotLayer.appendChild(marker);

        const item = document.createElement('li');
        item.className = 'alfawz-qaidah-hotspot-item';
        item.dataset.id = hotspot.id;
        item.innerHTML = `
          <div class="alfawz-qaidah-hotspot-item__header">
            <span class="alfawz-qaidah-hotspot-item__badge">${index + 1}</span>
            <div class="alfawz-qaidah-hotspot-item__title">${hotspot.label || `Marker ${index + 1}`}</div>
          </div>
          <div class="alfawz-qaidah-hotspot-item__body">
            <label class="alfawz-field">
              <span class="alfawz-field-label">Label</span>
              <input type="text" class="alfawz-input" value="${hotspot.label || ''}" />
            </label>
            <div class="alfawz-qaidah-hotspot-item__coords">
              <label class="alfawz-field">
                <span class="alfawz-field-label">X (%)</span>
                <input type="number" class="alfawz-input" min="0" max="100" step="0.1" value="${Number(hotspot.x).toFixed(1)}" />
              </label>
              <label class="alfawz-field">
                <span class="alfawz-field-label">Y (%)</span>
                <input type="number" class="alfawz-input" min="0" max="100" step="0.1" value="${Number(hotspot.y).toFixed(1)}" />
              </label>
            </div>
          </div>
          <div class="alfawz-qaidah-hotspot-item__actions">
            <button type="button" class="alfawz-button alfawz-button--ghost" data-action="record">🎙️ <span>Record audio</span></button>
            <button type="button" class="alfawz-button alfawz-button--ghost" data-action="play" ${hotspot.audioUrl ? '' : 'disabled'}>▶️ <span>Play</span></button>
            <label class="alfawz-qaidah-hotspot-item__upload">📁
              <input type="file" accept="audio/*" data-action="upload" />
            </label>
            <button type="button" class="alfawz-link" data-action="remove">Delete</button>
          </div>
          <p class="alfawz-qaidah-hotspot-item__status" aria-live="polite"></p>
        `;

        const [labelInput] = item.querySelectorAll('input[type="text"]');
        const coordInputs = item.querySelectorAll('input[type="number"]');
        const recordButton = item.querySelector('[data-action="record"]');
        const playButton = item.querySelector('[data-action="play"]');
        const uploadInput = item.querySelector('[data-action="upload"]');
        const removeButton = item.querySelector('[data-action="remove"]');
        const status = item.querySelector('.alfawz-qaidah-hotspot-item__status');

        if (labelInput) {
          labelInput.addEventListener('input', (event) => {
            hotspot.label = event.target.value;
            const title = item.querySelector('.alfawz-qaidah-hotspot-item__title');
            if (title) {
              title.textContent = hotspot.label || `Marker ${index + 1}`;
            }
            marker.setAttribute('aria-label', hotspot.label || `Hotspot ${index + 1}`);
          });
        }

        if (coordInputs.length === 2) {
          coordInputs[0].addEventListener('input', (event) => {
            hotspot.x = Math.min(100, Math.max(0, Number(event.target.value) || 0));
            marker.style.left = formatPercent(hotspot.x);
          });
          coordInputs[1].addEventListener('input', (event) => {
            hotspot.y = Math.min(100, Math.max(0, Number(event.target.value) || 0));
            marker.style.top = formatPercent(hotspot.y);
          });
        }

        if (recordButton) {
          recordButton.addEventListener('click', () => {
            if (teacherState.currentRecording && teacherState.currentRecording !== hotspot.id) {
              cleanupRecording();
            }
            if (teacherState.currentRecording === hotspot.id) {
              cleanupRecording();
              return;
            }
            startRecording(hotspot, { recordButton, playButton, status });
          });
        }

        if (playButton) {
          playButton.addEventListener('click', async () => {
            if (!hotspot.audioUrl) {
              return;
            }
            playButton.disabled = true;
            playButton.classList.add('is-playing');
            try {
              const audio = new Audio(hotspot.audioUrl);
              await audio.play();
              audio.onended = () => {
                playButton.disabled = false;
                playButton.classList.remove('is-playing');
              };
            } catch (error) {
              playButton.disabled = false;
              playButton.classList.remove('is-playing');
              status.textContent = strings.playbackError;
              status.classList.add('is-error');
            }
          });
        }

        if (uploadInput) {
          uploadInput.addEventListener('change', async (event) => {
            if (!event.target.files || !event.target.files.length) {
              return;
            }
            const file = event.target.files[0];
            status.textContent = strings.loading;
            status.classList.remove('is-error');
            try {
              const formData = new FormData();
              formData.append('audio', file, file.name);
              const response = await apiRequest('qaidah/audio', { method: 'POST', body: formData });
              hotspot.audioId = response?.id || null;
              hotspot.audioUrl = response?.url || '';
              status.textContent = strings.saved;
              status.classList.remove('is-error');
              status.classList.add('is-success');
              if (playButton) {
                playButton.disabled = !hotspot.audioUrl;
              }
            } catch (error) {
              console.error('[AlfawzQuran] Audio upload failed', error);
              status.textContent = strings.uploadError;
              status.classList.add('is-error');
            }
            event.target.value = '';
          });
        }

        if (removeButton) {
          removeButton.addEventListener('click', () => {
            teacherState.hotspots = teacherState.hotspots.filter((itemHotspot) => itemHotspot.id !== hotspot.id);
            renderHotspots();
          });
        }

        hotspotList.appendChild(item);
      });
    };

    const startRecording = async (hotspot, controls) => {
      const { recordButton, playButton, status } = controls;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof window.MediaRecorder === 'undefined') {
        if (status) {
          status.textContent = strings.recordError;
          status.classList.remove('is-info', 'is-success');
          status.classList.add('is-error');
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        teacherState.mediaStream = stream;
        teacherState.mediaRecorder = new MediaRecorder(stream);
        teacherState.mediaChunks = [];
        teacherState.currentRecording = hotspot.id;
        teacherState.recordControls = controls;

        if (recordButton) {
          recordButton.classList.add('is-recording');
          const label = recordButton.querySelector('span');
          if (label) {
            label.textContent = 'Stop';
          }
        }
        if (status) {
          status.textContent = strings.recording;
          status.classList.remove('is-error', 'is-success');
          status.classList.add('is-info');
        }

        teacherState.mediaRecorder.ondataavailable = (event) => {
          if (event.data?.size > 0) {
            teacherState.mediaChunks.push(event.data);
          }
        };

        teacherState.mediaRecorder.onstop = async () => {
          const blob = new Blob(teacherState.mediaChunks, { type: teacherState.mediaRecorder.mimeType || 'audio/webm' });
          cleanupRecording();
          if (status) {
            status.textContent = strings.loading;
            status.classList.remove('is-error', 'is-success');
            status.classList.add('is-info');
          }
          try {
            const formData = new FormData();
            formData.append('audio', blob, `${hotspot.id}.webm`);
            const response = await apiRequest('qaidah/audio', { method: 'POST', body: formData });
            hotspot.audioId = response?.id || null;
            hotspot.audioUrl = response?.url || '';
            if (status) {
              status.textContent = strings.saved;
              status.classList.remove('is-error', 'is-info');
              status.classList.add('is-success');
            }
            if (playButton) {
              playButton.disabled = !hotspot.audioUrl;
            }
          } catch (error) {
            console.error('[AlfawzQuran] Audio upload failed', error);
            if (status) {
              status.textContent = strings.uploadError;
              status.classList.remove('is-info', 'is-success');
              status.classList.add('is-error');
            }
          }
        };

        teacherState.mediaRecorder.start();
      } catch (error) {
        console.error('[AlfawzQuran] Unable to record audio', error);
        cleanupRecording();
        if (status) {
          status.textContent = strings.recordError;
          status.classList.remove('is-info', 'is-success');
          status.classList.add('is-error');
        }
      }
    };

    const handleHotspotCreation = (event) => {
      if (!teacherState.image) {
        return;
      }
      const bounds = hotspotLayer.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      const hotspot = {
        id: `hotspot-${Date.now()}`,
        x: Math.min(100, Math.max(0, x)),
        y: Math.min(100, Math.max(0, y)),
        label: '',
        audioId: null,
        audioUrl: '',
      };
      teacherState.hotspots.push(hotspot);
      renderHotspots();
    };

    const collectSelectedStudents = () => {
      if (!studentFilter) {
        return [];
      }
      const selected = Array.from(studentFilter.querySelectorAll('input[type="checkbox"]:checked'));
      return selected.map((input) => Number(input.value)).filter((value) => Number.isFinite(value));
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      if (teacherState.assignmentSaving) {
        return;
      }

      const title = titleInput?.value?.trim();
      const classId = classSelect?.value?.trim();
      const description = descriptionInput?.value?.trim() || '';
      const studentIds = collectSelectedStudents();

      if (!title || !classId || !teacherState.image) {
        setStatus(strings.saveError, 'error');
        return;
      }

      if (!teacherState.hotspots.length) {
        setStatus(strings.hotspotRequired, 'error');
        return;
      }

      const hotspots = teacherState.hotspots.map((hotspot) => ({
        id: hotspot.id,
        label: hotspot.label || '',
        x: formatPercent(hotspot.x),
        y: formatPercent(hotspot.y),
        audio_id: hotspot.audioId || 0,
      }));

      const payload = {
        title,
        class_id: classId,
        description,
        student_ids: studentIds,
        image_id: teacherState.image.id,
        hotspots,
      };

      try {
        teacherState.assignmentSaving = true;
        setStatus(strings.saving, 'info');
        const editing = Boolean(teacherState.currentAssignmentId);
        const endpoint = editing ? `qaidah/assignments/${teacherState.currentAssignmentId}` : 'qaidah/assignments';
        const method = editing ? 'PUT' : 'POST';
        const board = await apiRequest(endpoint, { method, body: payload });

        if (editing) {
          teacherState.currentAssignmentId = board?.id || teacherState.currentAssignmentId;
          if (board) {
            await prefillAssignment(board, { keepStatus: true });
          }
          setStatus(strings.saved, 'success');
        } else {
          resetBuilder(false);
          setStatus(strings.saved, 'success');
        }

        document.dispatchEvent(
          new CustomEvent('alfawzQaidahAssignmentSaved', {
            detail: { assignment: board || null },
          })
        );
      } catch (error) {
        console.error('[AlfawzQuran] Failed to save assignment', error);
        setStatus(strings.saveError, 'error');
      } finally {
        teacherState.assignmentSaving = false;
      }
    };

    classSelect?.addEventListener('change', (event) => {
      const classId = event.target.value;
      loadStudents(classId);
    });

    hotspotLayer?.addEventListener('click', handleHotspotCreation);
    selectImageButton?.addEventListener('click', openMediaLibrary);
    form?.addEventListener('submit', handleSubmit);
    resetButton?.addEventListener('click', (event) => {
      event.preventDefault();
      resetBuilder();
    });

    window.addEventListener('beforeunload', cleanupRecording);

    window.alfawzQaidahTeacher = Object.assign(window.alfawzQaidahTeacher || {}, {
      editAssignment,
      reset: () => {
        resetBuilder();
      },
      focus: () => {
        if (root) {
          root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
    });

    document.dispatchEvent(
      new CustomEvent('alfawzQaidahReady', {
        detail: { role: 'teacher' },
      })
    );

    ensureClassesLoaded();
    loadStudents('');
  };

  const closeModal = (modal) => {
    modal.classList.add('hidden');
    document.body.classList.remove('alfawz-qaidah-modal-open');
  };

  const openModal = (modal) => {
    modal.classList.remove('hidden');
    document.body.classList.add('alfawz-qaidah-modal-open');
  };

  const stopStudentAudio = () => {
    if (studentState.currentAudio) {
      studentState.currentAudio.pause();
      studentState.currentAudio = null;
    }
    if (studentState.playingHotspot) {
      studentState.playingHotspot.classList.remove('is-playing');
      studentState.playingHotspot = null;
    }
  };

  const initStudentView = () => {
    const assignmentList = document.getElementById('alfawz-qaidah-assignment-list');
    const emptyMessage = document.getElementById('alfawz-qaidah-empty');
    const refreshButton = document.getElementById('alfawz-qaidah-refresh');
    const modal = document.getElementById('alfawz-qaidah-modal');
    const modalClose = document.getElementById('alfawz-qaidah-modal-close');
    const modalTitle = document.getElementById('alfawz-qaidah-modal-title');
    const modalMeta = document.getElementById('alfawz-qaidah-modal-meta');
    const modalImage = document.getElementById('alfawz-qaidah-modal-image');
    const modalHotspots = document.getElementById('alfawz-qaidah-modal-hotspots');

    const renderAssignments = () => {
      if (!assignmentList) {
        return;
      }
      assignmentList.innerHTML = '';
      assignmentList.setAttribute('aria-busy', 'false');

      if (!studentState.assignments.length) {
        if (emptyMessage) {
          emptyMessage.classList.remove('hidden');
        }
        return;
      }

      if (emptyMessage) {
        emptyMessage.classList.add('hidden');
      }

      studentState.assignments.forEach((assignment) => {
        const item = document.createElement('li');
        item.className = 'alfawz-qaidah-assignment';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'alfawz-qaidah-assignment__button';
        button.innerHTML = `
          <div class="alfawz-qaidah-assignment__title">${assignment.title || 'Qa’idah lesson'}</div>
          <div class="alfawz-qaidah-assignment__meta">${assignment.teacher?.name || ''} • ${formatDate(assignment.updated)}</div>
        `;
        button.addEventListener('click', () => {
          openAssignmentModal(assignment);
        });

        item.appendChild(button);
        assignmentList.appendChild(item);
      });
    };

    const openAssignmentModal = (assignment) => {
      if (!modal || !modalImage || !modalHotspots) {
        return;
      }
      stopStudentAudio();
      modalImage.src = assignment.image?.url || '';
      modalHotspots.innerHTML = '';

      if (modalTitle) {
        modalTitle.textContent = assignment.title || '';
      }
      if (modalMeta) {
        const teacherName = assignment.teacher?.name || '';
        const updated = formatDate(assignment.updated);
        modalMeta.textContent = `${teacherName}${teacherName && updated ? ' • ' : ''}${updated}`;
      }

      if (Array.isArray(assignment.hotspots)) {
        assignment.hotspots.forEach((hotspot, index) => {
          if (!hotspot.audio_url) {
            return;
          }
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'alfawz-qaidah-hotspot is-student';
          button.style.left = hotspot.x || '0%';
          button.style.top = hotspot.y || '0%';
          button.setAttribute('aria-label', hotspot.label || `Hotspot ${index + 1}`);
          button.innerHTML = '<span>▶️</span>';
          button.addEventListener('click', () => {
            stopStudentAudio();
            const audio = new Audio(hotspot.audio_url);
            studentState.currentAudio = audio;
            studentState.playingHotspot = button;
            button.classList.add('is-playing');
            audio.play().catch((error) => {
              console.error('[AlfawzQuran] Audio playback failed', error);
              button.classList.remove('is-playing');
            });
            audio.onended = () => {
              button.classList.remove('is-playing');
              if (studentState.currentAudio === audio) {
                studentState.currentAudio = null;
                studentState.playingHotspot = null;
              }
            };
          });
          modalHotspots.appendChild(button);
        });
      }

      openModal(modal);
    };

    const loadAssignments = async () => {
      if (!assignmentList) {
        return;
      }
      assignmentList.setAttribute('aria-busy', 'true');
      assignmentList.innerHTML = '';
      try {
        const assignments = await apiRequest('qaidah/assignments');
        studentState.assignments = Array.isArray(assignments) ? assignments : [];
        renderAssignments();
      } catch (error) {
        console.error('[AlfawzQuran] Failed to load assignments', error);
        if (emptyMessage) {
          emptyMessage.textContent = strings.noAssignments;
          emptyMessage.classList.remove('hidden');
        }
        assignmentList.setAttribute('aria-busy', 'false');
      }
    };

    refreshButton?.addEventListener('click', (event) => {
      event.preventDefault();
      loadAssignments();
    });

    modalClose?.addEventListener('click', () => {
      stopStudentAudio();
      closeModal(modal);
    });

    modal?.addEventListener('click', (event) => {
      if (event.target === modal) {
        stopStudentAudio();
        closeModal(modal);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        stopStudentAudio();
        closeModal(modal);
      }
    });

    loadAssignments();
  };

  if (role === 'teacher') {
    initTeacherView();
  } else {
    initStudentView();
  }
})();

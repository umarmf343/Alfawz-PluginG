;(function ($) {
  const adminData = window.alfawzAdminData || {}
  const API_BASE = adminData.apiUrl || '/wp-json/alfawzquran/v1/'
  const NONCE = adminData.nonce || ''

  const __ = window.wp && window.wp.i18n && typeof window.wp.i18n.__ === 'function' ? window.wp.i18n.__ : text => text
  const t = text => __(text, 'alfawzquran')

  const AUDIO_MIME_WHITELIST = {
    webm: 'audio/webm',
    wav: 'audio/wav',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    oga: 'audio/ogg',
    ogg: 'audio/ogg',
  }

  $(document).ready(function () {
    const $app = $('#alfawz-qaidah-board-app')

    if ($app.length && adminData.canManageBoards) {
      initBoardManager($app)
    }
  })

  function initBoardManager($root) {
    const state = {
      boards: [],
      classes: [],
      students: [],
      selectedBoardId: null,
      title: '',
      description: '',
      image: null,
      classId: '',
      studentIds: [],
      assignEntireClass: true,
      hotspots: [],
      drawing: false,
      drawStart: null,
      previewHotspot: null,
      mediaStream: null,
      mediaRecorder: null,
      recordingHotspotId: null,
    }

    const elements = buildLayout($root)

    bindToolbar()
    bindStageInteractions()

    Promise.all([loadClasses(), loadBoards()])
      .then(() => {
        renderBoardList()
        resetForm()
      })
      .catch(error => {
        console.error('Unable to bootstrap Qa\'idah boards', error)
        showNotice('error', t("Unable to load Qa'idah boards."))
      })

    function buildLayout($container) {
      $container.empty()

      const $grid = $('<div>', { class: 'alfawz-qaidah-board-grid' })
      const $listColumn = $('<aside>', { class: 'alfawz-qaidah-board-list', 'aria-label': "Qa'idah boards" })
      const $formColumn = $('<section>', { class: 'alfawz-qaidah-board-form', 'aria-label': "Qa'idah board editor" })

      const $listHeader = $('<div>', { class: 'alfawz-toolbar' }).append(
        $('<button>', {
          class: 'button button-primary',
          type: 'button',
          text: t('New assignment'),
        }).on('click', () => {
          resetForm()
          renderBoardList()
        })
      )

      const $listTitle = $('<h2>', { text: t('Existing assignments') })
      const $list = $('<ul>', { class: 'alfawz-qaidah-board-items', id: 'alfawz-board-list' })
      const $emptyList = $('<div>', { class: 'alfawz-hotspot-empty', text: t('No assignments created yet. Create one to get started.') })

      $listColumn.append($listTitle, $listHeader, $list, $emptyList)

      const $form = $('<form>', { id: 'alfawz-board-form', novalidate: 'novalidate' })
      const $alerts = $('<div>', { class: 'alfawz-alert-area', 'aria-live': 'polite' })

      const $titleField = $('<div>', { class: 'form-field' })
        .append($('<label>', { for: 'alfawz-board-title', text: t('Board title') }))
        .append(
          $('<input>', {
            type: 'text',
            id: 'alfawz-board-title',
            required: true,
            placeholder: t('E.g. Lesson 4 — Madd practice'),
          }).on('input', e => {
            state.title = e.target.value
          })
        )

      const $classField = $('<div>', { class: 'form-field' })
        .append(
          $('<label>', {
            for: 'alfawz-assignment-class',
            text: t('Class'),
          })
        )
        .append(
          $('<select>', {
            id: 'alfawz-assignment-class',
          }).on('change', event => {
            state.classId = event.target.value
            state.assignEntireClass = true
            state.studentIds = []
            renderAssignAllToggle()
            setFormLoading(true)
            loadStudentsForClass(state.classId)
              .then(() => {
                renderStudentChecklist()
                setFormLoading(false)
              })
              .catch(() => setFormLoading(false))
          })
        )
        .append(
          $('<p>', {
            class: 'description',
            text: t('Assignments deliver to the entire class by default. Uncheck the toggle below to target specific learners.'),
          })
        )

      const $studentField = $('<fieldset>', { class: 'form-field alfawz-student-field' })
        .append($('<legend>', { text: t('Student delivery') }))

      const $assignAllToggle = $('<label>', { class: 'alfawz-checkbox-inline' })
        .append(
          $('<input>', {
            type: 'checkbox',
            id: 'alfawz-assignment-all',
            checked: state.assignEntireClass,
          }).on('change', event => {
            state.assignEntireClass = event.target.checked
            if (state.assignEntireClass) {
              state.studentIds = []
            }
            renderAssignAllToggle()
            renderStudentChecklist()
          })
        )
        .append(
          $('<span>', {
            text: t('Send to entire class'),
          })
        )

      const $studentList = $('<div>', {
        class: 'alfawz-student-list',
        id: 'alfawz-student-list',
        role: 'group',
        'aria-describedby': 'alfawz-assignment-class',
      })

      $studentField.append($assignAllToggle, $studentList)

      const $descriptionField = $('<div>', { class: 'form-field' })
        .append(
          $('<label>', {
            for: 'alfawz-assignment-description',
            text: t('Lesson notes (optional)'),
          })
        )
        .append(
          $('<textarea>', {
            id: 'alfawz-assignment-description',
            rows: 3,
            placeholder: t('Explain the focus or give practice tips for students.'),
          }).on('input', event => {
            state.description = event.target.value
          })
        )

      const $imageField = $('<div>', { class: 'form-field' })
      const $imageLabel = $('<label>', { text: t('Lesson image') })
      const $toolbar = $('<div>', { class: 'alfawz-toolbar' })
      const $selectImageButton = $('<button>', {
        type: 'button',
        class: 'button button-secondary',
      })
        .text(t('Choose image'))
        .append($('<span>', { class: 'dashicons dashicons-format-image', 'aria-hidden': 'true' }))
        .on('click', openMediaLibrary)
      const $clearImageButton = $('<button>', {
        type: 'button',
        class: 'button',
        text: t('Remove image'),
      }).on('click', () => {
        state.image = null
        state.hotspots = []
        renderStage()
        renderHotspotEditor()
      })
      $toolbar.append($selectImageButton, $clearImageButton)

      const $stage = $('<div>', { class: 'alfawz-qaidah-hotspot-stage', id: 'alfawz-hotspot-stage' })
        .append($('<div>', { class: 'alfawz-hotspot-empty', text: t('Select an image to begin drawing hotspots.') }))

      const $stageToolbar = $('<div>', { class: 'alfawz-toolbar' })
      const $drawButton = $('<button>', {
        type: 'button',
        class: 'button button-primary',
      })
        .text(t('Add hotspot'))
        .prepend($('<span>', { class: 'dashicons dashicons-plus-alt2', 'aria-hidden': 'true' }))
        .on('click', () => {
          if (!state.image) {
            showNotice('warning', t('Select an image before drawing hotspots.'))
            return
          }
          state.drawing = true
          $drawButton.addClass('is-active')
        })

      const $clearHotspots = $('<button>', {
        type: 'button',
        class: 'button',
      })
        .text(t('Clear hotspots'))
        .prepend($('<span>', { class: 'dashicons dashicons-dismiss', 'aria-hidden': 'true' }))
        .on('click', () => {
          if (!state.hotspots.length) {
            return
          }
          if (window.confirm(t('Remove all hotspots from this image?'))) {
            state.hotspots = []
            renderStage()
            renderHotspotEditor()
          }
        })

      $stageToolbar.append($drawButton, $clearHotspots)

      const $hotspotEditor = $('<div>', { class: 'alfawz-hotspot-editor', id: 'alfawz-hotspot-editor' })

      const $formActions = $('<div>', { class: 'alfawz-form-actions' })
      const $saveButton = $('<button>', {
        type: 'submit',
        class: 'button button-primary button-hero',
        text: t('Save board'),
      })
      const $deleteButton = $('<button>', {
        type: 'button',
        class: 'button button-secondary',
        text: t('Delete board'),
      }).on('click', handleDelete)

      $formActions.append($saveButton, $deleteButton)

      $form.on('submit', handleSubmit)

      $imageField.append($imageLabel, $toolbar, $stage)
      $form.append($alerts, $titleField, $classField, $studentField, $descriptionField, $imageField, $stageToolbar, $hotspotEditor, $formActions)
      $formColumn.append($('<h2>', { text: t('Assignment builder') }), $form)

      $grid.append($listColumn, $formColumn)
      $container.append($grid)

      return {
        list: $list,
        listEmpty: $emptyList,
        titleInput: $titleField.find('input'),
        classSelect: $classField.find('select'),
        studentList: $studentList,
        assignAllCheckbox: $assignAllToggle.find('input'),
        descriptionInput: $descriptionField.find('textarea'),
        stage: $stage,
        drawButton: $drawButton,
        hotspotEditor: $hotspotEditor,
        alerts: $alerts,
        form: $form,
        deleteButton: $deleteButton,
      }
    }

    function bindToolbar() {
      elements.form.on('keydown', event => {
        if (event.key === 'Escape' && state.drawing) {
          state.drawing = false
          state.drawStart = null
          elements.drawButton.removeClass('is-active')
          removePreview()
        }
      })
    }

    function bindStageInteractions() {
      elements.stage.on('pointerdown', event => {
        if (!state.drawing || !state.image) {
          return
        }
        const rect = event.currentTarget.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100
        const y = ((event.clientY - rect.top) / rect.height) * 100

        state.drawStart = { x, y }
        createPreview(x, y, 0, 0)
        event.preventDefault()
      })

      elements.stage.on('pointermove', event => {
        if (!state.drawing || !state.drawStart || !state.image) {
          return
        }
        const rect = event.currentTarget.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100
        const y = ((event.clientY - rect.top) / rect.height) * 100
        const width = x - state.drawStart.x
        const height = y - state.drawStart.y

        updatePreview(width, height)
      })

      elements.stage.on('pointerup pointerleave', event => {
        if (!state.drawing || !state.drawStart || !state.image) {
          return
        }
        const rect = event.currentTarget.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100
        const y = ((event.clientY - rect.top) / rect.height) * 100
        const width = x - state.drawStart.x
        const height = y - state.drawStart.y

        finalizeHotspot(width, height)
        state.drawing = false
        state.drawStart = null
        elements.drawButton.removeClass('is-active')
        removePreview()
      })
    }

    function createPreview(x, y, width, height) {
      removePreview()
      const $preview = $('<div>', { class: 'alfawz-hotspot-box is-preview', id: 'alfawz-hotspot-preview' })
      $preview.css({
        left: `${x}%`,
        top: `${y}%`,
        width: `${Math.abs(width)}%`,
        height: `${Math.abs(height)}%`,
      })
      elements.stage.append($preview)
      state.previewHotspot = $preview
    }

    function updatePreview(width, height) {
      if (!state.previewHotspot || !state.drawStart) {
        return
      }
      const x = width >= 0 ? state.drawStart.x : state.drawStart.x + width
      const y = height >= 0 ? state.drawStart.y : state.drawStart.y + height
      state.previewHotspot.css({
        left: `${Math.max(0, Math.min(100, x))}%`,
        top: `${Math.max(0, Math.min(100, y))}%`,
        width: `${Math.min(100, Math.abs(width))}%`,
        height: `${Math.min(100, Math.abs(height))}%`,
      })
    }

    function removePreview() {
      if (state.previewHotspot) {
        state.previewHotspot.remove()
        state.previewHotspot = null
      }
    }

    function finalizeHotspot(width, height) {
      if (!state.drawStart) {
        return
      }

      const normalizedWidth = Math.min(100, Math.abs(width))
      const normalizedHeight = Math.min(100, Math.abs(height))

      if (normalizedWidth < 2 || normalizedHeight < 2) {
        showNotice('warning', t('Hotspot must be at least 2% of the image in size.'))
        return
      }

      const x = width >= 0 ? state.drawStart.x : state.drawStart.x + width
      const y = height >= 0 ? state.drawStart.y : state.drawStart.y + height

      const hotspot = {
        id: `hotspot_${Date.now()}`,
        label: `${t('Hotspot')} ${state.hotspots.length + 1}`,
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
        width: normalizedWidth,
        height: normalizedHeight,
        audio_id: 0,
        audio_url: '',
      }

      state.hotspots.push(hotspot)
      renderStage()
      renderHotspotEditor(hotspot.id)
    }

    function loadClasses() {
      return apiFetch('qaidah/classes')
        .then(data => {
          state.classes = Array.isArray(data) ? data : []

          if (!state.classId && state.classes.length) {
            state.classId = String(state.classes[0].id)
          }

          renderClassOptions()
          renderAssignAllToggle()

          if (state.classId) {
            return loadStudentsForClass(state.classId)
          }

          state.students = []
          renderStudentChecklist()
          return Promise.resolve()
        })
        .catch(error => {
          console.error('Unable to load classes', error)
          throw error
        })
    }

    function loadStudentsForClass(classId) {
      if (!classId) {
        state.students = []
        renderStudentChecklist()
        return Promise.resolve()
      }

      return apiFetch(`qaidah/students?class_id=${encodeURIComponent(classId)}`)
        .then(data => {
          state.students = Array.isArray(data) ? data : []
          renderStudentChecklist()
        })
        .catch(error => {
          console.error('Unable to load students', error)
          throw error
        })
    }

    function renderClassOptions() {
      const { classSelect } = elements
      classSelect.empty()

      if (!state.classes.length) {
        classSelect.append($('<option>', { value: '', text: t('No classes assigned') }))
        classSelect.prop('disabled', true)
        return
      }

      classSelect.prop('disabled', false)

      state.classes.forEach(classItem => {
        const id = String(classItem.id)
        classSelect.append(
          $('<option>', {
            value: id,
            text: classItem.label || id,
            selected: state.classId === id,
          })
        )
      })

      if (state.classId) {
        classSelect.val(state.classId)
      }
    }

    function renderAssignAllToggle() {
      const { assignAllCheckbox, studentList } = elements
      assignAllCheckbox.prop('checked', !!state.assignEntireClass)
      studentList.toggleClass('is-disabled', state.assignEntireClass)
    }

    function renderStudentChecklist() {
      const { studentList } = elements
      studentList.empty()

      renderAssignAllToggle()

      if (!state.students.length) {
        studentList.append($('<div>', { class: 'alfawz-hotspot-empty', text: t('No students found for this class.') }))
        return
      }

      const selectedIds = state.studentIds.map(id => parseInt(id, 10))

      state.students
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(student => {
          const studentId = parseInt(student.id, 10)
          const checkboxId = `alfawz-student-${studentId}`

          const $wrapper = $('<label>', { class: 'alfawz-student-checkbox', for: checkboxId })
          const $input = $('<input>', {
            type: 'checkbox',
            id: checkboxId,
            value: studentId,
            disabled: state.assignEntireClass,
            checked: !state.assignEntireClass && selectedIds.includes(studentId),
          }).on('change', event => {
            const value = parseInt(event.target.value, 10)

            if (event.target.checked) {
              if (!state.studentIds.includes(value)) {
                state.studentIds.push(value)
              }
            } else {
              state.studentIds = state.studentIds.filter(id => id !== value)
            }
          })

          const $details = $('<span>', { class: 'alfawz-student-label' })
            .append($('<strong>', { text: student.name || t('Unnamed student') }))

          if (student.email) {
            $details.append($('<span>', { class: 'alfawz-student-meta', text: student.email }))
          }

          $wrapper.append($input, $details)
          studentList.append($wrapper)
        })
    }

    function loadBoards() {
      return apiFetch('qaidah/assignments?context=manage')
        .then(data => {
          state.boards = Array.isArray(data) ? data : []
          renderBoardList()
        })
        .catch(error => {
          console.error('Unable to load boards', error)
          throw error
        })
    }

    function renderBoardList() {
      const { list, listEmpty } = elements
      list.empty()

      if (!state.boards.length) {
        listEmpty.show()
        return
      }

      listEmpty.hide()

      state.boards.forEach(board => {
        const title = board.title || t('Untitled assignment')
        const classLabel = board.class && board.class.label ? board.class.label : ''
        const recipients = formatRecipientMeta(board)
        const metaParts = []

        if (classLabel) {
          metaParts.push(`${t('Class')}: ${classLabel}`)
        }

        if (recipients) {
          metaParts.push(`${t('Recipients')}: ${recipients}`)
        }

        const $item = $('<li>')
          .toggleClass('is-active', board.id === state.selectedBoardId)
          .append(
            $('<div>', { class: 'board-info' }).append(
              $('<strong>', { text: title }),
              $('<div>', { class: 'board-meta', text: metaParts.join(' • ') })
            )
          )
          .append(
            $('<button>', {
              type: 'button',
              class: 'button-link',
              text: t('Edit'),
            }).on('click', () => {
              selectBoard(board.id)
            })
          )

        list.append($item)
      })
    }

    function formatRecipientMeta(board) {
      if (!board) {
        return ''
      }

      if (Array.isArray(board.students) && board.students.length) {
        if (Array.isArray(board.student_details) && board.student_details.length) {
          return board.student_details.map(student => student.name).join(', ')
        }

        return board.students.map(studentId => `#${studentId}`).join(', ')
      }

      if (board.class && board.class.id) {
        return t('Entire class')
      }

      return ''
    }

    function selectBoard(boardId) {
      const board = state.boards.find(item => item.id === boardId)
      if (!board) {
        return
      }

      state.selectedBoardId = board.id
      state.title = board.title || ''
      state.description = board.description || ''
      state.image = board.image || null
      state.classId = board.class && board.class.id ? String(board.class.id) : ''
      const targetedStudents = Array.isArray(board.students) ? board.students.map(id => parseInt(id, 10)) : []
      state.assignEntireClass = targetedStudents.length === 0
      state.studentIds = state.assignEntireClass ? [] : targetedStudents
      state.hotspots = Array.isArray(board.hotspots) ? board.hotspots.map(h => ({ ...h })) : []

      renderBoardList()
      renderClassOptions()
      setFormLoading(true)
      loadStudentsForClass(state.classId)
        .then(() => {
          renderForm()
          setFormLoading(false)
        })
        .catch(() => setFormLoading(false))
    }

    function renderForm() {
      elements.titleInput.val(state.title)
      elements.descriptionInput.val(state.description)
      renderClassOptions()
      renderAssignAllToggle()
      renderStudentChecklist()
      renderStage()
      renderHotspotEditor()
      elements.deleteButton.toggle(!!state.selectedBoardId)
      clearNotices()
    }

    function renderStage() {
      const { stage } = elements
      stage.empty()

      if (!state.image) {
        stage.append($('<div>', { class: 'alfawz-hotspot-empty', text: t('Select an image to begin drawing hotspots.') }))
        return
      }

      const $img = $('<img>', {
        src: state.image.url,
        alt: state.image.alt || '',
      })
      stage.append($img)

      state.hotspots.forEach(hotspot => {
        const $box = $('<div>', {
          class: 'alfawz-hotspot-box',
          'data-hotspot-id': hotspot.id,
        })
          .css({
            left: `${hotspot.x}%`,
            top: `${hotspot.y}%`,
            width: `${hotspot.width}%`,
            height: `${hotspot.height}%`,
          })
          .on('click', () => {
            focusHotspotCard(hotspot.id)
          })

        const $label = $('<span>', { class: 'alfawz-hotspot-label', text: hotspot.label || t('Hotspot') })
        $box.append($label)
        stage.append($box)
      })
    }

    function renderHotspotEditor(highlightId) {
      const { hotspotEditor } = elements
      hotspotEditor.empty()

      if (!state.hotspots.length) {
        hotspotEditor.append(
          $('<div>', { class: 'alfawz-hotspot-empty', text: t('Draw a hotspot to begin attaching audio.') })
        )
        return
      }

      state.hotspots.forEach((hotspot, index) => {
        const $card = $('<div>', { class: 'hotspot-card', 'data-hotspot-id': hotspot.id })
        const $heading = $('<h3>', { text: `${t('Hotspot')} ${index + 1}` })
        const $labelField = $('<div>', { class: 'form-field' })
          .append(
            $('<label>', {
              text: t('Visible label'),
              for: `hotspot-label-${hotspot.id}`,
            })
          )
          .append(
            $('<input>', {
              type: 'text',
              id: `hotspot-label-${hotspot.id}`,
              value: hotspot.label,
            }).on('input', event => {
              hotspot.label = event.target.value
              renderStage()
            })
          )

        const $audioControls = $('<div>', { class: 'hotspot-actions' })
        const $recordButton = $('<button>', {
          type: 'button',
          class: 'button',
          text: hotspot.id === state.recordingHotspotId ? t('Stop recording') : t('Record audio'),
        })
          .prepend($('<span>', { class: `dashicons ${hotspot.id === state.recordingHotspotId ? 'dashicons-controls-pause' : 'dashicons-microphone'}`, 'aria-hidden': 'true' }))
          .on('click', () => toggleRecording(hotspot))

        const $uploadInput = $('<input>', {
          type: 'file',
          accept: Object.values(AUDIO_MIME_WHITELIST).join(','),
        }).on('change', event => {
          if (!event.target.files.length) {
            return
          }
          uploadAudioFile(hotspot, event.target.files[0])
          event.target.value = ''
        })

        const $uploadLabel = $('<label>', { class: 'button', text: t('Upload audio') }).prepend($('<span>', { class: 'dashicons dashicons-upload', 'aria-hidden': 'true' }))
        $uploadLabel.append($uploadInput)

        const $removeButton = $('<button>', {
          type: 'button',
          class: 'button-link-delete',
          text: t('Remove hotspot'),
        }).on('click', () => {
          state.hotspots = state.hotspots.filter(item => item.id !== hotspot.id)
          renderStage()
          renderHotspotEditor()
        })

        $audioControls.append($recordButton, $uploadLabel, $removeButton)

        if (hotspot.audio_url) {
          const $preview = $('<div>', { class: 'hotspot-audio-preview' })
            .append(
              $('<audio>', {
                controls: 'controls',
                src: hotspot.audio_url,
              })
            )
            .append(
              $('<span>', { class: 'badge', text: t('Audio attached') })
            )
          $audioControls.append($preview)
        }

        $card.append($heading, $labelField, $audioControls)
        hotspotEditor.append($card)

        if (highlightId && highlightId === hotspot.id) {
          $card.addClass('is-highlighted')
          setTimeout(() => {
            $card.removeClass('is-highlighted')
          }, 1200)
        }
      })
    }

    function focusHotspotCard(hotspotId) {
      const $card = elements.hotspotEditor.find(`[data-hotspot-id="${hotspotId}"]`)
      if ($card.length) {
        $card[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
        $card.addClass('is-highlighted')
        setTimeout(() => $card.removeClass('is-highlighted'), 1200)
      }
    }

    function resetForm() {
      state.selectedBoardId = null
      state.title = ''
      state.description = ''
      state.image = null
      state.hotspots = []
      state.assignEntireClass = true
      state.studentIds = []
      state.classId = state.classes.length ? String(state.classes[0].id) : ''
      elements.form.trigger('reset')
      renderBoardList()
      setFormLoading(true)
      loadStudentsForClass(state.classId)
        .then(() => {
          renderForm()
          setFormLoading(false)
        })
        .catch(() => setFormLoading(false))
    }

    function handleSubmit(event) {
      event.preventDefault()
      clearNotices()

      if (!validateForm()) {
        return
      }

      const payload = {
        title: state.title,
        image_id: state.image ? state.image.id : 0,
        class_id: state.classId,
        description: state.description,
        student_ids: state.assignEntireClass ? [] : state.studentIds,
        hotspots: state.hotspots.map(h => ({
          id: h.id,
          label: h.label,
          x: h.x,
          y: h.y,
          width: h.width,
          height: h.height,
          audio_id: h.audio_id,
        })),
      }

      const endpoint = state.selectedBoardId ? `qaidah/assignments/${state.selectedBoardId}` : 'qaidah/assignments'
      const method = state.selectedBoardId ? 'PUT' : 'POST'

      setFormLoading(true)

      apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(board => {
          showNotice('success', adminData.strings ? adminData.strings.boardSaved : t('Assignment saved.'))
          const updatedBoard = Array.isArray(board) ? board[0] : board
          const existingIndex = state.boards.findIndex(item => item.id === updatedBoard.id)
          if (existingIndex > -1) {
            state.boards.splice(existingIndex, 1, updatedBoard)
          } else {
            state.boards.unshift(updatedBoard)
          }
          selectBoard(updatedBoard.id)
        })
        .catch(error => {
          console.error('Unable to save assignment', error)
          showNotice('error', error?.message || t('Unable to save assignment. Please try again.'))
        })
        .finally(() => setFormLoading(false))
    }

    function handleDelete() {
      if (!state.selectedBoardId) {
        return
      }

      if (!window.confirm(adminData.strings ? adminData.strings.confirmDelete : t('Delete this assignment?'))) {
        return
      }

      setFormLoading(true)

      apiFetch(`qaidah/assignments/${state.selectedBoardId}`, {
        method: 'DELETE',
      })
        .then(() => {
          showNotice('success', adminData.strings ? adminData.strings.boardDeleted : t('Assignment deleted.'))
          state.boards = state.boards.filter(board => board.id !== state.selectedBoardId)
          resetForm()
        })
        .catch(error => {
          console.error('Unable to delete assignment', error)
          showNotice('error', error?.message || t('Unable to delete assignment. Please try again.'))
        })
        .finally(() => setFormLoading(false))
    }

    function validateForm() {
      if (!state.title.trim()) {
        showNotice('error', t('Add a title for this assignment.'))
        elements.titleInput.focus()
        return false
      }

      if (!state.image) {
        showNotice('error', t('Select a lesson image.'))
        return false
      }

      if (!state.classId && !state.studentIds.length) {
        showNotice('error', t('Choose a class or select individual students.'))
        elements.classSelect.focus()
        return false
      }

      if (!state.assignEntireClass && !state.studentIds.length) {
        showNotice('error', t('Select at least one student.'))
        return false
      }

      if (!state.hotspots.length) {
        showNotice('error', t('Draw at least one hotspot.'))
        return false
      }

      const missingAudio = state.hotspots.filter(h => !h.audio_id)
      if (missingAudio.length) {
        showNotice('error', t('Attach audio to every hotspot before saving.'))
        focusHotspotCard(missingAudio[0].id)
        return false
      }

      return true
    }

    function showNotice(type, message) {
      const $notice = $('<div>', {
        class: `notice notice-${type} alfawz-alert`,
      }).append($('<p>').text(message))

      elements.alerts.empty().append($notice)
    }

    function clearNotices() {
      elements.alerts.empty()
    }

    function setFormLoading(isLoading) {
      elements.form.toggleClass('is-loading', isLoading)
      elements.form.find('button').prop('disabled', isLoading)
    }

    function openMediaLibrary() {
      const frame = wp.media({
        title: t("Select Qa'idah sheet image"),
        button: { text: t('Use this image') },
        library: { type: 'image' },
        multiple: false,
      })

      frame.on('select', () => {
        const attachment = frame.state().get('selection').first().toJSON()
        state.image = {
          id: attachment.id,
          url: attachment.url,
          alt: attachment.alt,
        }
        renderStage()
        renderHotspotEditor()
      })

      frame.open()
    }

    function toggleRecording(hotspot) {
      if (state.recordingHotspotId && state.recordingHotspotId !== hotspot.id) {
        showNotice('warning', t('Stop the current recording before starting a new one.'))
        return
      }

      if (state.mediaRecorder && state.mediaRecorder.state === 'recording') {
        stopRecording()
        return
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showNotice('error', t('Recording is not supported in this browser.'))
        return
      }

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          state.mediaStream = stream
          state.mediaRecorder = new MediaRecorder(stream)
          const chunks = []

          state.mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
              chunks.push(event.data)
            }
          }

          state.mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' })
            uploadAudioBlob(hotspot, blob, `qaidah-hotspot-${Date.now()}.webm`)
            cleanupMediaRecorder()
          }

          state.mediaRecorder.start()
          state.recordingHotspotId = hotspot.id
          renderHotspotEditor(hotspot.id)
        })
        .catch(error => {
          console.error('Unable to access microphone', error)
          showNotice('error', error.message || t('Unable to access microphone.'))
          cleanupMediaRecorder()
        })
    }

    function stopRecording() {
      if (state.mediaRecorder && state.mediaRecorder.state === 'recording') {
        state.mediaRecorder.stop()
      }
    }

    function cleanupMediaRecorder() {
      if (state.mediaRecorder) {
        state.mediaRecorder.ondataavailable = null
        state.mediaRecorder.onstop = null
      }
      if (state.mediaStream) {
        state.mediaStream.getTracks().forEach(track => track.stop())
      }
      state.mediaStream = null
      state.mediaRecorder = null
      state.recordingHotspotId = null
      renderHotspotEditor()
    }

    function uploadAudioBlob(hotspot, blob, filename) {
      const formData = new FormData()
      formData.append('audio', blob, filename)
      setFormLoading(true)

      apiFetch('qaidah/audio', {
        method: 'POST',
        body: formData,
        isFormData: true,
      })
        .then(response => {
          hotspot.audio_id = response.id
          hotspot.audio_url = response.url
          renderHotspotEditor(hotspot.id)
          showNotice('success', t('Audio saved for hotspot.'))
        })
        .catch(error => {
          console.error('Unable to upload audio', error)
          showNotice('error', error?.message || t('Unable to upload audio.'))
        })
        .finally(() => {
          setFormLoading(false)
        })
    }

    function uploadAudioFile(hotspot, file) {
      const extension = file.name.split('.').pop().toLowerCase()
      if (!AUDIO_MIME_WHITELIST[extension]) {
        showNotice('error', t('Unsupported audio format.'))
        return
      }

      const formData = new FormData()
      formData.append('audio', file, file.name)
      setFormLoading(true)

      apiFetch('qaidah/audio', {
        method: 'POST',
        body: formData,
        isFormData: true,
      })
        .then(response => {
          hotspot.audio_id = response.id
          hotspot.audio_url = response.url
          renderHotspotEditor(hotspot.id)
          showNotice('success', t('Audio uploaded.'))
        })
        .catch(error => {
          console.error('Unable to upload audio', error)
          showNotice('error', error?.message || t('Unable to upload audio.'))
        })
        .finally(() => setFormLoading(false))
    }
  }

  function apiFetch(path, options = {}) {
    const defaultHeaders = {
      'X-WP-Nonce': NONCE,
    }

    const config = {
      method: 'GET',
      credentials: 'same-origin',
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    }

    if (config.body && !config.isFormData && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body)
      config.headers['Content-Type'] = 'application/json'
    }

    if (config.isFormData) {
      delete config.isFormData
    }

    return fetch(API_BASE + path, config).then(response => {
      if (!response.ok) {
        return response.json().catch(() => ({})).then(data => {
          const error = new Error(data.message || response.statusText)
          error.code = response.status
          throw error
        })
      }

      if (response.status === 204) {
        return {}
      }

      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        return response.json()
      }

      return response.text()
    })
  }

})(jQuery)

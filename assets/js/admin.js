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
      students: [],
      selectedBoardId: null,
      title: '',
      image: null,
      studentIds: [],
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

    Promise.all([loadStudents(), loadBoards()])
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
          text: t('New board'),
        }).on('click', () => {
          resetForm()
          renderBoardList()
        })
      )

      const $listTitle = $('<h2>', { text: t('Existing boards') })
      const $list = $('<ul>', { class: 'alfawz-qaidah-board-items', id: 'alfawz-board-list' })
      const $emptyList = $('<div>', { class: 'alfawz-hotspot-empty', text: t('No boards created yet. Create one to get started.') })

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

      const $studentField = $('<div>', { class: 'form-field' })
        .append(
          $('<label>', {
            for: 'alfawz-board-students',
            text: t('Assign to students'),
          })
        )
        .append(
          $('<select>', {
            id: 'alfawz-board-students',
            multiple: 'multiple',
            size: 6,
          }).on('change', function () {
            const selected = Array.from(this.options)
              .filter(option => option.selected)
              .map(option => parseInt(option.value, 10))
            state.studentIds = selected
          })
        )
        .append(
          $('<p>', { class: 'description', text: t('Hold Ctrl/Command to select multiple students.') })
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
      $form.append($alerts, $titleField, $studentField, $imageField, $stageToolbar, $hotspotEditor, $formActions)
      $formColumn.append($('<h2>', { text: t('Board builder') }), $form)

      $grid.append($listColumn, $formColumn)
      $container.append($grid)

      return {
        list: $list,
        listEmpty: $emptyList,
        titleInput: $titleField.find('input'),
        studentSelect: $studentField.find('select'),
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

    function loadStudents() {
      return apiFetch('qaidah/students')
        .then(data => {
          state.students = Array.isArray(data) ? data : []
          populateStudents()
        })
        .catch(error => {
          console.error('Unable to load students', error)
          throw error
        })
    }

    function populateStudents() {
      const $select = elements.studentSelect
      $select.empty()

      if (!state.students.length) {
        $select.append($('<option>', { value: '', text: t('No students found') }))
        $select.prop('disabled', true)
        return
      }

      $select.prop('disabled', false)
      state.students
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(student => {
          $select.append(
            $('<option>', {
              value: student.id,
              text: student.name,
            })
          )
        })
    }

    function loadBoards() {
      return apiFetch('qaidah/boards?context=manage')
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
        const $item = $('<li>')
          .toggleClass('is-active', board.id === state.selectedBoardId)
          .append(
            $('<div>', { class: 'board-info' }).append(
              $('<strong>', { text: board.title || t('Untitled board') }),
              $('<div>', { class: 'board-meta', text: formatStudentMeta(board.student_details || board.students) })
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

    function formatStudentMeta(students) {
      if (!students || !students.length) {
        return t('No students assigned')
      }

      if (Array.isArray(students) && typeof students[0] === 'object') {
        return students.map(student => student.name).join(', ')
      }

      return state.students
        .filter(student => students.includes(student.id))
        .map(student => student.name)
        .join(', ')
    }

    function selectBoard(boardId) {
      const board = state.boards.find(item => item.id === boardId)
      if (!board) {
        return
      }

      state.selectedBoardId = board.id
      state.title = board.title || ''
      state.image = board.image || null
      state.studentIds = (board.students || []).map(id => parseInt(id, 10))
      state.hotspots = Array.isArray(board.hotspots) ? board.hotspots.map(h => ({ ...h })) : []

      renderBoardList()
      renderForm()
    }

    function renderForm() {
      elements.titleInput.val(state.title)
      elements.studentSelect.val(state.studentIds.map(id => String(id)))
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
      state.image = null
      state.studentIds = []
      state.hotspots = []
      elements.form.trigger('reset')
      renderForm()
      renderBoardList()
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
        student_ids: state.studentIds,
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

      const endpoint = state.selectedBoardId ? `qaidah/boards/${state.selectedBoardId}` : 'qaidah/boards'
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
          showNotice('success', adminData.strings ? adminData.strings.boardSaved : 'Board saved.')
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
          console.error('Unable to save board', error)
          showNotice('error', error?.message || t('Unable to save board. Please try again.'))
        })
        .finally(() => setFormLoading(false))
    }

    function handleDelete() {
      if (!state.selectedBoardId) {
        return
      }

      if (!window.confirm(adminData.strings ? adminData.strings.confirmDelete : 'Delete this board?')) {
        return
      }

      setFormLoading(true)

      apiFetch(`qaidah/boards/${state.selectedBoardId}`, {
        method: 'DELETE',
      })
        .then(() => {
          showNotice('success', adminData.strings ? adminData.strings.boardDeleted : 'Board deleted.')
          state.boards = state.boards.filter(board => board.id !== state.selectedBoardId)
          resetForm()
        })
        .catch(error => {
          console.error('Unable to delete board', error)
          showNotice('error', error?.message || t('Unable to delete board. Please try again.'))
        })
        .finally(() => setFormLoading(false))
    }

    function validateForm() {
      if (!state.title.trim()) {
        showNotice('error', t('Add a title for this board.'))
        elements.titleInput.focus()
        return false
      }

      if (!state.image) {
        showNotice('error', t('Select a lesson image.'))
        return false
      }

      if (!state.studentIds.length) {
        showNotice('error', t('Assign the board to at least one student.'))
        elements.studentSelect.focus()
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

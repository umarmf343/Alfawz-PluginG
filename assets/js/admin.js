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
    if (adminData.canManageAdmin && adminData.currentPage === 'alfawz-quran') {
      initAdminDashboard()
    }

    const $app = $('#alfawz-qaidah-board-app')

    if ($app.length && adminData.canManageBoards) {
      initBoardManager($app)
    }
  })

  function initAdminDashboard() {
    const state = {
      classes: [],
      teachers: [],
      selectedClassId: null,
      classNonce: adminData.nonces ? adminData.nonces.classes : '',
      userNonce: adminData.nonces ? adminData.nonces.users : '',
      settingsNonce: adminData.nonces ? adminData.nonces.settings : '',
      classStudents: [],
      classFormMode: 'create',
      overviewLoaded: false,
      usersLoaded: false,
      userFilter: {
        role: 'all',
        search: '',
      },
    }

    const $classForm = $('#alfawz-class-form')
    const $classTable = $('#alfawz-class-table tbody')
    const $classFormPanel = $('#alfawz-class-form-panel')
    const $classFormTitle = $('#alfawz-class-form-title')
    const $classFormSubtitle = $('#alfawz-class-form-subtitle')
    const $classFeedback = $('#alfawz-class-feedback')
    const $teacherSelect = $('#alfawz-class-teacher')
    const $classIdField = $('#alfawz-class-id')
    const $classNameField = $('#alfawz-class-name')
    const $classDescriptionField = $('#alfawz-class-description')
    const $newClassButton = $('#add-class-btn')
    const $cancelClassButton = $('#alfawz-cancel-class')
    const $closeClassFormButton = $('#close-class-form')
    const $classNonceInput = $('#alfawz_admin_classes_nonce')
    const $enrollmentSection = $('#alfawz-student-enrollment')
    const $selectedClassName = $('#alfawz-selected-class-name')
    const $enrolledStudents = $('#alfawz-enrolled-student-list')
    const $studentSearchInput = $('#alfawz-student-search-input')
    const $studentSearchButton = $('#alfawz-search-students')
    const $studentSearchResults = $('#alfawz-student-search-results')
    const $closeEnrollment = $('#alfawz-close-enrollment')
    const $userList = $('#alfawz-user-list')
    const $userFilterForm = $('#alfawz-user-filter')
    const $userNonceInput = $('#alfawz_admin_users_nonce')
    const $settingsForm = $('#alfawz-settings-form')
    const $settingsNonceInput = $('#alfawz_admin_settings_nonce')
    const $settingsFeedback = $('#alfawz-settings-feedback')

    if ($classNonceInput.length) {
      state.classNonce = $classNonceInput.val()
    }

    if ($userNonceInput.length) {
      state.userNonce = $userNonceInput.val()
    }

    if ($settingsNonceInput.length) {
      state.settingsNonce = $settingsNonceInput.val()
    }

    resetClassForm()
    closeClassForm()

    loadTeachers().then(loadClasses)
    loadOverview()
    loadUsers()
    loadSettings()

    $classForm.on('submit', function (event) {
      event.preventDefault()
      saveClass()
    })

    $newClassButton.on('click', function () {
      resetClassForm()
      openClassForm('create')
      $classNameField.trigger('focus')
    })

    $cancelClassButton.on('click', function () {
      resetClassForm()
      closeClassForm()
    })

    $closeClassFormButton.on('click', function () {
      resetClassForm()
      closeClassForm()
    })

    $classTable.on('click', '.alfawz-edit-class', function () {
      const classId = $(this).closest('tr').data('classId')
      const classData = state.classes.find(item => item.id === classId)
      if (classData) {
        populateClassForm(classData)
      }
    })

    $classTable.on('click', '.alfawz-delete-class', function () {
      const classId = $(this).closest('tr').data('classId')
      if (!classId) {
        return
      }

      if (!window.confirm(adminData.strings.confirmClass)) {
        return
      }

      dashboardRequest({
        method: 'DELETE',
        path: `admin/classes/${classId}`,
        nonce: state.classNonce,
      })
        .then(() => {
          resetClassForm()
          closeClassForm()
          showClassSuccess(__('Class deleted.', 'alfawzquran'))
          loadClasses()
        })
        .catch(showClassError)
    })

    $classTable.on('click', '.alfawz-manage-students', function () {
      const classId = $(this).closest('tr').data('classId')
      const classData = state.classes.find(item => item.id === classId)

      if (!classData) {
        return
      }

      state.selectedClassId = classId
      state.classStudents = Array.isArray(classData.students) ? classData.students.map(student => student.id) : []

      $selectedClassName.text(classData.name)
      renderEnrolledStudents(classData.students || [])
      $enrollmentSection.prop('hidden', false)
      $studentSearchResults.empty()
    })

    $closeEnrollment.on('click', function () {
      $enrollmentSection.prop('hidden', true)
      state.selectedClassId = null
      state.classStudents = []
      $selectedClassName.text('')
    })

    $enrolledStudents.on('click', '.alfawz-chip-remove', function () {
      const studentId = parseInt($(this).closest('li').data('studentId'), 10)
      if (!state.selectedClassId || !studentId) {
        return
      }

      const updatedList = state.classStudents.filter(id => id !== studentId)
      updateClassStudents(state.selectedClassId, updatedList)
    })

    $studentSearchButton.on('click', function () {
      performStudentSearch()
    })

    $studentSearchInput.on('keypress', function (event) {
      if (event.which === 13) {
        event.preventDefault()
        performStudentSearch()
      }
    })

    $studentSearchResults.on('click', '.alfawz-enroll-student', function () {
      const studentId = parseInt($(this).data('studentId'), 10)
      if (!state.selectedClassId || !studentId) {
        return
      }

      if (state.classStudents.includes(studentId)) {
        return
      }

      const updatedList = state.classStudents.concat([studentId])
      updateClassStudents(state.selectedClassId, updatedList)
    })

    $userFilterForm.on('submit', function (event) {
      event.preventDefault()
      state.userFilter.role = $('#alfawz-role-filter').val()
      state.userFilter.search = $('#alfawz-user-search').val()
      loadUsers()
    })

    $userList.on('click', '.alfawz-update-role', function () {
      const $item = $(this).closest('[data-user-id]')
      const userId = $item.data('userId')
      const newRole = $item.find('.alfawz-role-select').val()
      if (!userId || !newRole) {
        return
      }

      if (!window.confirm(__('Confirm role assignment for this user?', 'alfawzquran'))) {
        return
      }

      dashboardRequest({
        method: 'POST',
        path: `admin/users/${userId}/role`,
        data: { role: newRole },
        nonce: state.userNonce,
      })
        .then(() => {
          showTransientNotice($item, 'success', adminData.strings.roleUpdate)
          loadUsers()
        })
        .catch(() => {
          showTransientNotice($item, 'error', adminData.strings.roleUpdateError)
        })
    })

    $settingsForm.on('submit', function (event) {
      event.preventDefault()

      const payload = {
        alfawz_enable_leaderboard: $('#alfawz-setting-leaderboard').is(':checked') ? 1 : 0,
        alfawz_enable_egg_challenge: $('#alfawz-setting-egg').is(':checked') ? 1 : 0,
        alfawz_daily_verse_target: parseInt($('#alfawz-setting-daily-goal').val(), 10) || 0,
      }

      if (!window.confirm(__('Apply these platform settings?', 'alfawzquran'))) {
        return
      }

      dashboardRequest({
        method: 'POST',
        path: 'admin/settings',
        data: payload,
        nonce: state.settingsNonce,
      })
        .then(response => {
          renderSettings(response)
          showSettingsMessage('updated', __('Settings saved successfully.', 'alfawzquran'))
        })
        .catch(() => {
          showSettingsMessage('error', __('Unable to save settings. Please try again.', 'alfawzquran'))
        })
    })

    function saveClass() {
      const classId = $classIdField.val()
      const name = $classNameField.val().trim()
      if (!name) {
        showClassError(__('Class name is required.', 'alfawzquran'))
        return
      }

      const payload = {
        name,
        description: $classDescriptionField.val(),
        teacher_id: parseInt($teacherSelect.val(), 10) || null,
      }

      const requestOptions = {
        method: classId ? 'PUT' : 'POST',
        path: classId ? `admin/classes/${classId}` : 'admin/classes',
        data: payload,
        nonce: state.classNonce,
      }

      const confirmMessage = classId
        ? __('Apply these updates to the class?', 'alfawzquran')
        : __('Create this class now?', 'alfawzquran')

      if (!window.confirm(confirmMessage)) {
        return
      }

      dashboardRequest(requestOptions)
        .then(() => {
          resetClassForm()
          setClassFormMode('create')
          showClassSuccess(classId ? __('Class updated.', 'alfawzquran') : __('Class created.', 'alfawzquran'))
          loadClasses()
        })
        .catch(showClassError)
    }

    function resetClassForm() {
      $classIdField.val('')
      $classNameField.val('')
      $classDescriptionField.val('')
      if ($teacherSelect.length) {
        $teacherSelect.val('')
      }
      $classFeedback
        .addClass('hidden')
        .removeClass('bg-red-50 border-red-500 text-red-700 bg-emerald-50 border-emerald-500 text-emerald-800')
        .text('')
    }

    function setClassFormMode(mode) {
      state.classFormMode = mode
      if (mode === 'edit') {
        $classFormTitle.text(__('Edit Class', 'alfawzquran'))
        $classFormSubtitle.text(__('Update class details or reassign the lead teacher.', 'alfawzquran'))
      } else {
        $classFormTitle.text(__('Create Class', 'alfawzquran'))
        $classFormSubtitle.text(__('Provide class details and assign a teacher.', 'alfawzquran'))
      }
    }

    function openClassForm(mode = 'create') {
      setClassFormMode(mode)
      $classFormPanel.removeClass('hidden')
    }

    function closeClassForm() {
      setClassFormMode('create')
      $classFormPanel.addClass('hidden')
    }

    function populateClassForm(classData) {
      openClassForm('edit')
      $classIdField.val(classData.id)
      $classNameField.val(classData.name)
      $classDescriptionField.val(classData.description || '')
      $teacherSelect.val(classData.teacher ? String(classData.teacher.id) : '')
      window.scrollTo({ top: $classFormPanel.offset().top - 80, behavior: 'smooth' })
    }

    function showClassError(error) {
      let message = error

      if (typeof error !== 'string') {
        message = (error && error.responseJSON && error.responseJSON.message) || __('An unexpected error occurred.', 'alfawzquran')
      }

      $classFeedback
        .removeClass('hidden bg-emerald-50 border-emerald-500 text-emerald-800')
        .addClass('bg-red-50 border-red-500 text-red-700')
        .text(message)
        .removeClass('hidden')
    }

    function showClassSuccess(message) {
      $classFeedback
        .removeClass('hidden bg-red-50 border-red-500 text-red-700')
        .addClass('bg-emerald-50 border-emerald-500 text-emerald-800')
        .text(message)
        .removeClass('hidden')
      setTimeout(() => {
        $classFeedback.addClass('hidden')
      }, 3500)
    }

    function renderClasses() {
      if (!state.classes.length) {
        $classTable.html(`<tr><td colspan="4" class="px-4 py-4 text-center text-base text-gray-500">${__('No classes found.', 'alfawzquran')}</td></tr>`)
        return
      }

      const rows = state.classes.map(classItem => {
        const teacherName = classItem.teacher ? classItem.teacher.name : __('Unassigned', 'alfawzquran')
        const studentCount = Array.isArray(classItem.students) ? classItem.students.length : 0

        return `
          <tr data-class-id="${classItem.id}" class="transition hover:bg-gray-50">
            <td class="px-4 py-4 align-top">
              <div class="text-base font-semibold text-gray-900">${escapeHtml(classItem.name)}</div>
              ${classItem.description ? `<p class="mt-2 text-base text-gray-600">${escapeHtml(classItem.description)}</p>` : ''}
            </td>
            <td class="px-4 py-4 align-top text-base text-gray-700">${escapeHtml(teacherName)}</td>
            <td class="px-4 py-4 align-top text-base text-gray-700">${studentCount}</td>
            <td class="px-4 py-4 align-top text-base text-gray-700">
              <div class="flex flex-wrap gap-3">
                <button type="button" class="alfawz-manage-students inline-flex items-center rounded-lg border border-blue-600 px-3 py-2 text-base font-semibold text-blue-600 transition hover:bg-blue-50">${__('Manage Students', 'alfawzquran')}</button>
                <button type="button" class="alfawz-edit-class inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-base font-semibold text-white transition hover:bg-blue-700">${__('Edit', 'alfawzquran')}</button>
                <button type="button" class="alfawz-delete-class inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-base font-semibold text-white transition hover:bg-red-700">${__('Delete', 'alfawzquran')}</button>
              </div>
            </td>
          </tr>
        `
      })

      $classTable.html(rows.join(''))
    }

    function renderEnrolledStudents(students) {
      if (!students.length) {
        $enrolledStudents.html(`<li class="text-base text-gray-500">${__('No students assigned yet.', 'alfawzquran')}</li>`)
        return
      }

      const items = students.map(student => {
        return `
          <li data-student-id="${student.id}" class="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1">
            <span class="text-base font-medium text-emerald-800">${escapeHtml(student.name)}</span>
            <button type="button" class="alfawz-chip-remove text-lg font-semibold text-emerald-600 transition hover:text-emerald-800" aria-label="${__('Remove student', 'alfawzquran')}">×</button>
          </li>
        `
      })

      $enrolledStudents.html(items.join(''))
    }

    function performStudentSearch() {
      const query = $studentSearchInput.val().trim()
      if (!query || !state.selectedClassId) {
        return
      }

      $studentSearchResults.text(__('Searching…', 'alfawzquran'))

      dashboardRequest({
        method: 'GET',
        path: 'admin/users',
        query: { role: 'student', search: query },
      })
        .then(response => {
          renderStudentSearchResults(response.users || [])
        })
        .catch(() => {
          $studentSearchResults.text(__('Unable to load students.', 'alfawzquran'))
        })
    }

    function renderStudentSearchResults(students) {
      if (!students.length) {
        $studentSearchResults.text(__('No students found for this search.', 'alfawzquran'))
        return
      }

      const markup = students
        .map(student => {
          const alreadyEnrolled = state.classStudents.includes(student.id)
          const disabled = alreadyEnrolled ? 'disabled' : ''
          const label = alreadyEnrolled
            ? __('Already enrolled', 'alfawzquran')
            : __('Enroll', 'alfawzquran')

          const buttonClasses = alreadyEnrolled
            ? 'inline-flex items-center rounded-lg bg-gray-200 px-3 py-2 text-base font-semibold text-gray-500 cursor-not-allowed'
            : 'inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-base font-semibold text-white transition hover:bg-emerald-700'

          return `
            <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div>
                <div class="text-base font-semibold text-gray-800">${escapeHtml(student.name)}</div>
                <div class="text-base text-gray-500">${escapeHtml(student.email)}</div>
              </div>
              <button type="button" class="alfawz-enroll-student ${buttonClasses}" data-student-id="${student.id}" ${disabled}>${label}</button>
            </div>
          `
        })
        .join('')

      $studentSearchResults.html(markup)
    }

    function updateClassStudents(classId, studentIds) {
      if (!window.confirm(__('Apply enrollment changes for this class?', 'alfawzquran'))) {
        return
      }

      dashboardRequest({
        method: 'POST',
        path: `admin/classes/${classId}/students`,
        data: { student_ids: studentIds },
        nonce: state.classNonce,
      })
        .then(response => {
          const updatedClass = response.class
          state.classStudents = Array.isArray(updatedClass.students) ? updatedClass.students.map(student => student.id) : []
          state.classes = state.classes.map(item => (item.id === updatedClass.id ? updatedClass : item))
          renderEnrolledStudents(updatedClass.students || [])
          renderClasses()
        })
        .catch(() => {
          showClassError(__('Unable to update student enrollment.', 'alfawzquran'))
        })
    }

    function loadTeachers() {
      return dashboardRequest({
        method: 'GET',
        path: 'admin/users',
        query: { role: 'teacher', per_page: 100 },
      })
        .then(response => {
          state.teachers = response.users || []
          renderTeacherOptions()
        })
        .catch(() => {
          state.teachers = []
          renderTeacherOptions()
        })
    }

    function renderTeacherOptions() {
      const options = ['<option value="">' + __('Select a teacher', 'alfawzquran') + '</option>']
      state.teachers.forEach(teacher => {
        options.push(`<option value="${teacher.id}">${escapeHtml(teacher.name)}</option>`)
      })
      $teacherSelect.html(options.join(''))
    }

    function loadClasses() {
      dashboardRequest({
        method: 'GET',
        path: 'admin/classes',
      })
        .then(response => {
          state.classes = response.classes || []
          renderClasses()
        })
        .catch(() => {
          state.classes = []
          renderClasses()
        })
    }

    function loadOverview() {
      dashboardRequest({
        method: 'GET',
        path: 'admin/overview',
      })
        .then(response => {
          $('#alfawz-stat-students').text(response.total_students || 0)
          $('#alfawz-stat-teachers').text(response.total_teachers || 0)
          $('#alfawz-stat-classes').text(response.total_classes || 0)
          $('#alfawz-stat-plans').text(response.active_plans || 0)
        })
        .catch(() => {
          $('#alfawz-stat-students').text('—')
          $('#alfawz-stat-teachers').text('—')
          $('#alfawz-stat-classes').text('—')
          $('#alfawz-stat-plans').text('—')
        })
    }

    function loadUsers() {
      const query = {
        role: state.userFilter.role,
        search: state.userFilter.search,
      }

      dashboardRequest({
        method: 'GET',
        path: 'admin/users',
        query,
      })
        .then(response => {
          renderUsers(response.users || [])
        })
        .catch(() => {
          renderUsers([])
        })
    }

    function renderUsers(users) {
      if (!users.length) {
        $userList.html(`<div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-base text-gray-500">${__('No users found for this filter.', 'alfawzquran')}</div>`)
        return
      }

      const items = users.map(user => {
        const roleOptions = buildRoleOptions(user.roles)
        const classLabel = user.class && user.class.label ? escapeHtml(user.class.label) : __('Unassigned', 'alfawzquran')

        return `
          <div data-user-id="${user.id}" class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div class="space-y-2">
              <div class="text-base font-semibold text-gray-800">${escapeHtml(user.name)}</div>
              <div class="text-base text-gray-600">${escapeHtml(user.email)}</div>
              <div class="text-base text-gray-500">
                <span class="font-semibold text-gray-700">${__('Assigned Class:', 'alfawzquran')}</span> ${classLabel}
              </div>
            </div>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select class="alfawz-role-select rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" aria-label="${__('Select user role', 'alfawzquran')}">${roleOptions}</select>
              <button type="button" class="alfawz-update-role inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-base font-semibold text-white transition hover:bg-blue-700">${__('Save', 'alfawzquran')}</button>
            </div>
          </div>
        `
      })

      $userList.html(items.join(''))
    }

    function buildRoleOptions(roles) {
      const primaryRole = Array.isArray(roles) && roles.length ? roles[0] : 'subscriber'
      const availableRoles = [
        { value: 'student', label: __('Student', 'alfawzquran') },
        { value: 'teacher', label: __('Teacher', 'alfawzquran') },
        { value: 'subscriber', label: __('Subscriber', 'alfawzquran') },
      ]

      return availableRoles
        .map(role => {
          const selected = role.value === primaryRole ? 'selected' : ''
          return `<option value="${role.value}" ${selected}>${role.label}</option>`
        })
        .join('')
    }

    function loadSettings() {
      dashboardRequest({
        method: 'GET',
        path: 'admin/settings',
      })
        .then(response => {
          renderSettings(response)
        })
        .catch(() => {
          renderSettings({})
        })
    }

    function renderSettings(settings) {
      $('#alfawz-setting-leaderboard').prop('checked', Boolean(parseInt(settings.alfawz_enable_leaderboard, 10)))
      $('#alfawz-setting-egg').prop('checked', Boolean(parseInt(settings.alfawz_enable_egg_challenge, 10)))
      $('#alfawz-setting-daily-goal').val(settings.alfawz_daily_verse_target || 10)
    }

    function showSettingsMessage(type, message) {
      const isSuccess = type === 'updated'
      $settingsFeedback
        .removeClass('hidden bg-red-50 border-red-500 text-red-700 bg-emerald-50 border-emerald-500 text-emerald-800')
        .addClass(
          isSuccess
            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
            : 'bg-red-50 border-red-500 text-red-700'
        )
        .text(message)
        .removeClass('hidden')
      setTimeout(() => {
        $settingsFeedback.addClass('hidden')
      }, 3500)
    }
  }

  function dashboardRequest({ method = 'GET', path, data = null, nonce = '', query = null }) {
    const queryString = query ? `?${$.param(query)}` : ''
    const options = {
      url: API_BASE + path + queryString,
      method,
      headers: {
        'X-WP-Nonce': NONCE,
      },
      dataType: 'json',
    }

    const upperMethod = method.toUpperCase()

    if (upperMethod !== 'GET' && upperMethod !== 'HEAD') {
      const payload = data ? { ...data } : {}
      if (nonce) {
        payload.nonce = nonce
      }
      options.data = JSON.stringify(payload)
      options.contentType = 'application/json'
    }

    return $.ajax(options)
  }

  function escapeHtml(value) {
    return $('<div>').text(value || '').html()
  }

  function showTransientNotice($row, type, message) {
    $row.find('.alfawz-inline-notice').remove()

    const noticeClass =
      type === 'success'
        ? 'alfawz-inline-notice mt-2 text-base font-semibold text-emerald-700'
        : 'alfawz-inline-notice mt-2 text-base font-semibold text-red-600'

    const $notice = $('<div>', {
      class: noticeClass,
      text: message,
    })

    $row.append($notice)

    setTimeout(() => {
      $notice.fadeOut(200, function () {
        $(this).remove()
      })
    }, 3200)
  }

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

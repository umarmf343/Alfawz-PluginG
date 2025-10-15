;(($) => {
  // Get the correct API data from WordPress
  const alfawzData = window.alfawzData || {
    apiUrl: "/wp-json/alfawzquran/v1/",
    isLoggedIn: false,
    nonce: "12345",
    pages: {},
  }

  const getPageUrl = slug => {
    if (alfawzData.pages && alfawzData.pages[slug]) {
      return alfawzData.pages[slug]
    }

    return `/${slug.replace(/[^a-z0-9\-]/gi, '')}/`
  }

  const navigateToPage = (slug, params = {}) => {
    const baseUrl = getPageUrl(slug)

    try {
      const targetUrl = new URL(baseUrl, window.location.origin)

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          targetUrl.searchParams.set(key, value)
        }
      })

      window.location.href = targetUrl.toString()
    } catch (error) {
      const query = new URLSearchParams(params).toString()
      window.location.href = `${baseUrl}${query ? `?${query}` : ''}`
    }
  }

  // Use only alquran.cloud API
  const ALQURAN_API_BASE = 'https://api.alquran.cloud/v1/'
  const ARABIC_EDITION = alfawzData.defaultReciter || 'ar.alafasy'
  const ENGLISH_EDITION = alfawzData.defaultTranslation || 'en.sahih'
  const canPreviewQaidahBoards = Boolean(alfawzData.canPreviewQaidahBoards)

  // Global state
  let sessionHasanat = 0
  let versesReadSession = 0
  let readingStartTime = null
  let readingTimer = null
  let showTranslation = true

  // Audio state - single audio instance
  let currentAudio = null
  let currentAudioButton = null

  // Reader navigation state
  let currentSurahId = null
  let currentVerseId = null
  let currentSurahData = null
  let currentVerseAudioUrl = null

  const AYAH_PUZZLE_STORAGE_KEYS = {
    completed: "alfawzAyahPuzzleCompleted",
    bestTime: "alfawzAyahPuzzleBestTime",
    streak: "alfawzAyahPuzzleStreak",
    lastCompleted: "alfawzAyahPuzzleLastCompleted",
  }

  const AYAH_PUZZLE_THEMES = [
    {
      title: "Serenity Sunday",
      copy: "Piece together verses of mercy to begin your week with calm intention.",
    },
    {
      title: "Momentum Monday",
      copy: "Verses on perseverance keep your memorisation goals on track.",
    },
    {
      title: "Tafsir Tuesday",
      copy: "Explore layered meanings by rebuilding ayat rich with imagery.",
    },
    {
      title: "Wisdom Wednesday",
      copy: "Spot guidance themed pieces to sharpen your reflection midweek.",
    },
    {
      title: "Thankful Thursday",
      copy: "Gather ayat of gratitude to close the work week with praise.",
    },
    {
      title: "Focus Friday",
      copy: "Celebrate Jumu'ah with puzzles centred on remembrance and reward.",
    },
    {
      title: "Summit Saturday",
      copy: "Unlock challenge verses to protect your streak heading into a new week.",
    },
  ]

  const ayahPuzzleState = {
    correctOrder: [],
    pieces: [],
    currentSurah: null,
    currentAyah: null,
    startTime: null,
    timerInterval: null,
    completedCount: 0,
    bestTime: null,
    streak: 0,
    lastCompletedDay: null,
    todayKey: null,
    isSolved: false,
  }

  let cachedSurahList = null

  // Initialize when document is ready
  $(document).ready(() => {
    initializeDashboard()
    initializeReader()
    initializeMemorizer()
    initializeLeaderboard()
    initializeSettings()
    initializeGames()
    initializeQaidah()
    initializeBottomNavigation()
    initializeSwitches()
    loadUserStats()
    startReadingTimer()
  })

  // ========================================
  // DASHBOARD FUNCTIONALITY
  // ========================================
  function initializeDashboard() {
    if ($(".alfawz-dashboard").length) {
      loadDailySurah()
      updateProgressAnimations()
    }
  }

  function loadDailySurah() {
    const today = new Date()
    const dayOfWeek = today.getDay()

    const dailySurahs = {
      0: { id: 18, name: "Al-Kahf", reason: "Sunday - Reflection Day" },
      1: { id: 2, name: "Al-Baqarah", reason: "Monday - New Week Energy" },
      2: { id: 36, name: "Ya-Sin", reason: "Tuesday - Heart of Quran" },
      3: { id: 55, name: "Ar-Rahman", reason: "Wednesday - Mercy Day" },
      4: { id: 67, name: "Al-Mulk", reason: "Thursday - Protection" },
      5: { id: 18, name: "Al-Kahf", reason: "Friday - Jumu'ah Special" },
      6: { id: 76, name: "Al-Insan", reason: "Saturday - Gratitude" },
    }

    const todaysSurah = dailySurahs[dayOfWeek]

    if (todaysSurah) {
      loadSurahCard(todaysSurah)
    }
  }

  function loadSurahCard(surah) {
    const card = $("#daily-surah-card")
    card.html('<div class="alfawz-loading">Loading today\'s special surah...</div>')

    // Load first verse of the surah
    fetch(`${ALQURAN_API_BASE}surah/${surah.id}/${ARABIC_EDITION}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "OK" && data.data.ayahs && data.data.ayahs.length > 0) {
          const verse = data.data.ayahs[0] // First verse
          
          // Load translation
          fetch(`${ALQURAN_API_BASE}ayah/${surah.id}:1/${ENGLISH_EDITION}`)
            .then(response => response.json())
            .then(translationData => {
              const translation = translationData.status === "OK" ? translationData.data.text : "Translation not available."

              card.html(`
                <div class="alfawz-surah-header">
                  <h4>Surah ${surah.name} (${surah.id})</h4>
                  <p class="alfawz-surah-reason">${surah.reason}</p>
                </div>
                <div class="alfawz-verse-arabic">${verse.text}</div>
                <div class="alfawz-verse-translation">${translation}</div>
                <div class="alfawz-verse-controls">
                  <button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-primary alfawz-btn-small" data-surah-id="${surah.id}" data-verse-id="1" id="read-daily-verse">
                    <span class="alfawz-btn-icon">📖</span> Read Now
                  </button>
                  <span class="alfawz-hasanat-counter">
                    <span class="alfawz-hasanat-icon">⭐</span> ${verse.text.replace(/[^\u0600-\u06FF]/g, "").length * alfawzData.hasanatPerLetter} Hasanat
                  </span>
                </div>
              `)
              $("#read-daily-verse").on("click", function() {
                const surahId = $(this).data("surah-id")
                const verseId = $(this).data("verse-id")
                navigateToPage('reader', { surah: surahId, verse: verseId })
              })
            })
            .catch(error => {
              console.error("Error fetching translation:", error)
              card.html('<div class="alfawz-error-message">Failed to load translation.</div>')
            })
        } else {
          card.html('<div class="alfawz-error-message">Failed to load surah data.</div>')
        }
      })
      .catch(error => {
        console.error("Error fetching surah:", error)
        card.html('<div class="alfawz-error-message">Failed to load surah.</div>')
      })
  }

  function updateProgressAnimations() {
    $(".alfawz-progress-fill").each(function() {
      const width = $(this).css("width")
      $(this).css("width", "0%").animate({ width: width }, 1000)
    })
  }

  // ========================================
  // READER FUNCTIONALITY
  // ========================================
  function initializeReader() {
    if ($(".alfawz-reader").length) {
      loadSurahsIntoDropdown("#reader-surah-select")
      $("#reader-surah-select").on("change", handleSurahSelectChange)
      $("#reader-verse-select").on("change", handleVerseSelectChange)
      $("#reader-play-audio").on("click", playVerseAudio)
      $("#reader-mark-read").on("click", markVerseAsRead)
      $("#reader-bookmark").on("click", addBookmark)
      $("#show-translation").on("change", toggleTranslation)
      $("#prev-verse-btn").on("click", navigateVerse)
      $("#next-verse-btn").on("click", navigateVerse)

      // Check URL parameters for initial load
      const urlParams = new URLSearchParams(window.location.search)
      const surahParam = urlParams.get("surah")
      const verseParam = urlParams.get("verse")

      if (surahParam && verseParam) {
        // Set dropdowns and load verse after surahs are loaded
        const checkSurahsLoaded = setInterval(() => {
          if ($("#reader-surah-select option").length > 1) {
            clearInterval(checkSurahsLoaded)
            $("#reader-surah-select").val(surahParam).trigger("change")
            // Wait for verses to load before setting verse dropdown
            const checkVersesLoaded = setInterval(() => {
              if ($("#reader-verse-select option").length > 1 && !$("#reader-verse-select").prop("disabled")) {
                clearInterval(checkVersesLoaded)
                $("#reader-verse-select").val(verseParam).trigger("change")
              }
            }, 100)
          }
        }, 100)
      }
    }
  }

  function loadSurahsIntoDropdown(dropdownSelector) {
    fetch(`${ALQURAN_API_BASE}surah`)
      .then(response => response.json())
      .then(data => {
        const dropdown = $(dropdownSelector)
        dropdown.empty().append('<option value="">Select Surah</option>')
        if (data.status === "OK") {
          data.data.forEach(surah => {
            dropdown.append(
              `<option value="${surah.number}" data-ayahs="${surah.numberOfAyahs}">
                ${surah.number}. ${surah.englishName} (${surah.name}) - ${surah.numberOfAyahs} Ayahs
              </option>`
            )
          })
        } else {
          dropdown.append('<option value="">Error loading surahs</option>')
        }
      })
      .catch(error => {
        console.error("Error fetching surahs:", error)
        $(dropdownSelector).empty().append('<option value="">Error loading surahs</option>')
      })
  }

  function handleSurahSelectChange() {
    const surahId = $(this).val()
    const verseDropdown = $("#reader-verse-select")
    verseDropdown.empty().append('<option value="">Select Verse</option>').prop("disabled", true)
    $("#reader-verse-card").hide()
    $(".alfawz-loading-message").show()
    $(".alfawz-reader-actions").hide()
    $("#selected-surah-display").hide()

    if (surahId) {
      const numberOfAyahs = $(this).find("option:selected").data("ayahs")
      for (let i = 1; i <= numberOfAyahs; i++) {
        verseDropdown.append(`<option value="${i}">Verse ${i}</option>`)
      }
      verseDropdown.prop("disabled", false)
      currentSurahId = surahId
      currentVerseId = null // Reset verse when surah changes
      currentSurahData = null // Clear cached surah data
      currentVerseAudioUrl = null
      
      // Fetch full surah data for navigation
      fetch(`${ALQURAN_API_BASE}surah/${surahId}/${ARABIC_EDITION}`)
        .then(response => response.json())
        .then(data => {
          if (data.status === "OK") {
            currentSurahData = data.data
          } else {
            console.error("Failed to load full surah data for navigation.")
          }
        })
        .catch(error => console.error("Error fetching full surah data:", error))

      // Update selected surah display
      const surahName = $(this).find("option:selected").text()
      $("#selected-surah-name").text(surahName)
      $("#selected-surah-display").show()
    }
    updateNavigationButtons()
  }

  function handleVerseSelectChange() {
    const surahId = $("#reader-surah-select").val()
    const verseId = $(this).val()

    if (surahId && verseId) {
      loadVerse(surahId, verseId)
      currentVerseId = verseId
    } else {
      $("#reader-verse-card").hide()
      $(".alfawz-loading-message").show()
      $(".alfawz-reader-actions").hide()
      currentVerseAudioUrl = null
    }
    updateNavigationButtons()
  }

  function loadVerse(surahId, verseId) {
    $("#reader-quran-text").html('<div class="alfawz-loading-verse">Loading Arabic text...</div>')
    $("#reader-quran-translation").html('<div class="alfawz-loading-verse">Loading translation...</div>')
    $("#current-verse-hasanat").text("0")
    $("#reader-verse-card").show()
    $(".alfawz-loading-message").hide()
    $(".alfawz-reader-actions").show()
    $(".alfawz-verse-counter-display").show()

    // Fetch Arabic text
    currentVerseAudioUrl = null

    fetch(`${ALQURAN_API_BASE}ayah/${surahId}:${verseId}/${ARABIC_EDITION}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "OK") {
          $("#reader-quran-text").text(data.data.text)
          const hasanat = data.data.text.replace(/[^\u0600-\u06FF]/g, "").length * alfawzData.hasanatPerLetter
          $("#current-verse-hasanat").text(hasanat)
          if (data.data.audioSecondary && data.data.audioSecondary.length) {
            currentVerseAudioUrl = data.data.audioSecondary[0]
          } else if (data.data.audio) {
            currentVerseAudioUrl = data.data.audio
          }
        } else {
          $("#reader-quran-text").text("Failed to load Arabic text.")
        }
      })
      .catch(error => {
        console.error("Error fetching Arabic text:", error)
        $("#reader-quran-text").text("Failed to load Arabic text.")
        currentVerseAudioUrl = null
      })

    // Fetch English translation
    fetch(`${ALQURAN_API_BASE}ayah/${surahId}:${verseId}/${ENGLISH_EDITION}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "OK") {
          $("#reader-quran-translation").text(data.data.text)
          if (!showTranslation) {
            $("#reader-quran-translation").hide()
          }
        } else {
          $("#reader-quran-translation").text("Failed to load translation.")
        }
      })
      .catch(error => {
        console.error("Error fetching translation:", error)
        $("#reader-quran-translation").text("Failed to load translation.")
      })

    $("#current-surah-verse").text(`${surahId}:${verseId}`)
    updateNavigationButtons()
  }

  function toggleTranslation() {
    showTranslation = $(this).is(":checked")
    if (showTranslation) {
      $("#reader-quran-translation").slideDown()
    } else {
      $("#reader-quran-translation").slideUp()
    }
  }

  function playVerseAudio() {
    const surahId = $("#reader-surah-select").val()
    const verseId = $("#reader-verse-select").val()
    const audioButton = $(this)

    if (!surahId || !verseId) {
      showNotification("Please select a surah and verse first.", "error")
      return
    }

    const audioUrl = currentVerseAudioUrl

    if (!audioUrl) {
      showNotification("Audio is not available for this verse.", "error")
      return
    }

    if (currentAudio) {
      currentAudio.pause()
      if (currentAudioButton) {
        currentAudioButton.removeClass("playing").find(".alfawz-audio-text").text("Play Audio")
      }
      if (currentAudio.src === audioUrl) {
        currentAudio = null
        currentAudioButton = null
        return // Stop and reset if same audio is clicked again
      }
    }

    currentAudio = new Audio(audioUrl)
    currentAudioButton = audioButton

    audioButton.addClass("loading").find(".alfawz-audio-text").text("Loading...")

    currentAudio.oncanplaythrough = () => {
      audioButton.removeClass("loading").addClass("playing").find(".alfawz-audio-text").text("Playing...")
      currentAudio.play()
    }

    currentAudio.onended = () => {
      audioButton.removeClass("playing").find(".alfawz-audio-text").text("Play Audio")
      currentAudio = null
      currentAudioButton = null
    }

    currentAudio.onerror = () => {
      audioButton.removeClass("loading").removeClass("playing").find(".alfawz-audio-text").text("Play Audio")
      showNotification("Failed to load audio. Please try again.", "error")
      currentAudio = null
      currentAudioButton = null
    }
  }

  function markVerseAsRead() {
    if (!alfawzData.isLoggedIn) {
      showNotification("Please log in to mark verses as read.", "error")
      return
    }

    const surahId = $("#reader-surah-select").val()
    const verseId = $("#reader-verse-select").val()
    const hasanat = parseInt($("#current-verse-hasanat").text())

    if (!surahId || !verseId || isNaN(hasanat)) {
      showNotification("Please select a valid verse first.", "error")
      return
    }

    const button = $(this)
    button.prop("disabled", true).text("Marking...")

    $.ajax({
      url: alfawzData.apiUrl + "progress",
      method: "POST",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      data: {
        surah_id: surahId,
        verse_id: verseId,
        progress_type: "read",
        hasanat: hasanat,
      },
      success: (response) => {
        if (response.success) {
          showNotification("Verse marked as read! +" + hasanat + " Hasanat", "success")
          sessionHasanat += hasanat
          versesReadSession++
          $("#session-hasanat").text(sessionHasanat)
          $("#verses-read-session").text(versesReadSession)
          loadUserStats() // Update overall stats
          button.text("Marked!").addClass("alfawz-btn-success")
          setTimeout(() => {
            button.prop("disabled", false).text("Mark as Read").removeClass("alfawz-btn-success")
          }, 2000)
        } else {
          showNotification(response.message || "Failed to mark verse as read.", "error")
          button.prop("disabled", false).text("Mark as Read")
        }
      },
      error: (xhr, status, error) => {
        console.error("Error marking verse as read:", error)
        showNotification("Error marking verse as read. Please try again.", "error")
        button.prop("disabled", false).text("Mark as Read")
      },
    })
  }

  function addBookmark() {
    if (!alfawzData.isLoggedIn) {
      showNotification("Please log in to add bookmarks.", "error")
      return
    }

    const surahId = $("#reader-surah-select").val()
    const verseId = $("#reader-verse-select").val()

    if (!surahId || !verseId) {
      showNotification("Please select a verse to bookmark.", "error")
      return
    }

    const button = $(this)
    button.prop("disabled", true).text("Saving...")

    $.ajax({
      url: alfawzData.apiUrl + "bookmarks",
      method: "POST",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      data: {
        surah_id: surahId,
        verse_id: verseId,
        note: "", // Optional: could add a modal for notes
      },
      success: (response) => {
        if (response.success) {
          showNotification("Verse bookmarked successfully!", "success")
          button.text("Bookmarked!").addClass("alfawz-btn-success")
          setTimeout(() => {
            button.prop("disabled", false).text("Bookmark").removeClass("alfawz-btn-success")
          }, 2000)
        } else {
          showNotification(response.message || "Failed to bookmark verse.", "error")
          button.prop("disabled", false).text("Bookmark")
        }
      },
      error: (xhr, status, error) => {
        console.error("Error adding bookmark:", error)
        showNotification("Error adding bookmark. Please try again.", "error")
        button.prop("disabled", false).text("Bookmark")
      },
    })
  }

  function navigateVerse(event) {
    const direction = $(event.target).attr("id") === "prev-verse-btn" ? -1 : 1
    let newVerseId = parseInt(currentVerseId) + direction
    let newSurahId = parseInt(currentSurahId)

    if (!currentSurahData) {
      showNotification("Surah data not loaded for navigation.", "error")
      return
    }

    const totalAyahsInCurrentSurah = currentSurahData.numberOfAyahs

    if (newVerseId < 1) {
      // Go to previous surah's last verse
      const prevSurahId = newSurahId - 1
      if (prevSurahId >= 1) {
        fetch(`${ALQURAN_API_BASE}surah/${prevSurahId}/${ARABIC_EDITION}`)
          .then(response => response.json())
          .then(data => {
            if (data.status === "OK") {
              const prevSurahTotalAyahs = data.data.numberOfAyahs
              $("#reader-surah-select").val(prevSurahId).trigger("change")
              // Wait for verses to load before setting verse dropdown
              const checkVersesLoaded = setInterval(() => {
                if ($("#reader-verse-select option").length > 1 && !$("#reader-verse-select").prop("disabled")) {
                  clearInterval(checkVersesLoaded)
                  $("#reader-verse-select").val(prevSurahTotalAyahs).trigger("change")
                }
              }, 100)
            } else {
              showNotification("Cannot navigate to previous surah.", "error")
            }
          })
          .catch(error => {
            console.error("Error navigating to previous surah:", error)
            showNotification("Error navigating to previous surah.", "error")
          })
        return
      } else {
        showNotification("You are at the beginning of the Quran.", "info")
        return
      }
    } else if (newVerseId > totalAyahsInCurrentSurah) {
      // Go to next surah's first verse
      const nextSurahId = newSurahId + 1
      if (nextSurahId <= 114) { // Assuming 114 surahs in total
        $("#reader-surah-select").val(nextSurahId).trigger("change")
        // Wait for verses to load before setting verse dropdown
        const checkVersesLoaded = setInterval(() => {
          if ($("#reader-verse-select option").length > 1 && !$("#reader-verse-select").prop("disabled")) {
            clearInterval(checkVersesLoaded)
            $("#reader-verse-select").val(1).trigger("change")
          }
        }, 100)
        return
      } else {
        showNotification("You are at the end of the Quran.", "info")
        return
      }
    }

    $("#reader-verse-select").val(newVerseId).trigger("change")
  }

  // ========================================
  // MEMORIZER FUNCTIONALITY
  // ========================================
  let currentMemorizationVerse = null
  let repetitionCount = 0
  const REPETITION_TARGET = 20 // Default repetition target
  const REPEAT_BUTTON_LOCK_DURATION = 300
  let memorizationSessionActive = false
  let reviewStatusDefaultText = ""
  let markMemorizedDefaultLabel = ""
  const REVIEW_STORAGE_KEY_PREFIX = "alfawzMemoReview"
  let playAudioDefaultLabel = ""
  let currentReviewState = { rating: null, notes: "" }
  let completionCelebrationShown = false
  const REVIEW_QUEUE_STORAGE_KEY = "alfawzMemoReviewQueue"
  let repetitionChimeContext = null

  function initializeMemorizer() {
    if ($(".alfawz-memorizer").length) {
      setupPlanCreationForm()
      loadSurahsIntoDropdown("#memo-surah-select")
      $("#memo-surah-select").on("change", handleMemoSurahSelectChange)
      $("#memo-verse-select").on("change", handleMemoVerseSelectChange)
      $("#load-memorization-verse").on("click", loadMemorizationVerse)
      $("#memo-play-audio").on("click", playMemorizationAudio)
      $("#repeat-verse-btn").on("click", incrementRepetition)
      $("#prev-memo-verse-btn").on("click", () => navigateMemorizationVerse(-1))
      $("#next-memo-verse-btn").on("click", () => navigateMemorizationVerse(1))
      $("#memo-mark-memorized").on("click", markVerseAsMemorized)
      $("#memo-select-another").on("click", resetMemorizationSession)
      $("#continue-memorization").on("click", continueMemorizationAfterCelebration)
      $("#review-verse-later").on("click", handleReviewLaterSelection)

      hideCongratulationsModal({ immediate: true })

      $("#memo-review-actions .alfawz-review-chip").on("click", handleReviewSelection)
      $("#memo-review-notes").on("input", handleReviewNotesInput)
      $("#memo-save-review").on("click", saveReviewSnapshot)

      reviewStatusDefaultText = $("#memo-review-status").text().trim()
      markMemorizedDefaultLabel = $("#memo-mark-memorized .alfawz-btn-text").text().trim() || $("#memo-mark-memorized").text().trim()
      playAudioDefaultLabel = $("#memo-play-audio .alfawz-audio-text").text().trim() || $("#memo-play-audio").text().trim()
      updateNavigationButtons()
      resetReviewUI()

      // Memorization Plan Revision
      loadMemorizationPlans()
      $("#memorization-plan-select").on("change", handlePlanSelectChange)
      $("#load-memorization-plan").on("click", loadSelectedMemorizationPlan)
      $("#restart-plan").on("click", restartMemorizationPlan)
    }
  }

  function handleMemoSurahSelectChange() {
    const surahId = $(this).val()
    const verseDropdown = $("#memo-verse-select")
    verseDropdown.empty().append('<option value="">Select Verse</option>').prop("disabled", true)
    $("#load-memorization-verse").prop("disabled", true)
    $(".alfawz-memorization-session").hide()
    $("#selected-memo-verse-display").hide()
    memorizationSessionActive = false
    stopCurrentAudioPlayback()
    resetReviewUI()
    updateNavigationButtons()

    if (surahId) {
      fetch(`${ALQURAN_API_BASE}surah/${surahId}`)
        .then(response => response.json())
        .then(data => {
          if (data.status === "OK" && data.data.ayahs) {
            data.data.ayahs.forEach(ayah => {
              verseDropdown.append(`<option value="${ayah.numberInSurah}" data-global-number="${ayah.number}">Verse ${ayah.numberInSurah}</option>`)
            })
            verseDropdown.prop("disabled", false)
            updateNavigationButtons()
          } else {
            verseDropdown.append('<option value="">Error loading verses</option>')
          }
        })
        .catch(error => {
          console.error("Error fetching verses for memorizer:", error)
          verseDropdown.append('<option value="">Error loading verses</option>')
        })
    }
  }

  function handleMemoVerseSelectChange() {
    const surahId = $("#memo-surah-select").val()
    const verseId = $(this).val()
    if (surahId && verseId) {
      $("#load-memorization-verse").prop("disabled", false)
      const surahName = $("#memo-surah-select option:selected").text().split('(')[0].trim()
      $("#selected-memo-verse-name").text(`${surahName}, Verse ${verseId}`)
      $("#selected-memo-verse-display").show()
    } else {
      $("#load-memorization-verse").prop("disabled", true)
      $("#selected-memo-verse-display").hide()
    }
  }

  function loadMemorizationVerse(event) {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault()
    }
    const verseId = $("#memo-verse-select").val()
    startMemorizationForVerse(verseId)
  }

  function startMemorizationForVerse(verseId, { triggeredByNavigation = false } = {}) {
    const surahId = $("#memo-surah-select").val()

    if (!surahId || !verseId) {
      showNotification("Please select a surah and verse to memorize.", "error")
      updateNavigationButtons()
      return
    }

    memorizationSessionActive = true
    completionCelebrationShown = false
    repetitionCount = 0
    $("#repetition-progress-bar")
      .removeClass("alfawz-progress-complete alfawz-stage-early alfawz-stage-momentum alfawz-stage-complete")
      .css("width", "0%")
    $("#repetition-progress-check").removeClass("is-visible")
    updateRepetitionDisplay()
    hideCongratulationsModal({ immediate: true })
    $("#repeat-verse-btn").removeClass("alfawz-repeat-completed").prop("disabled", false)
    disableMarkAsMemorizedButton()
    $("#memo-mark-memorized .alfawz-btn-text").text(markMemorizedDefaultLabel || $("#memo-mark-memorized").text())
    $("#memo-mark-memorized").data("needs-save", false)

    stopCurrentAudioPlayback()

    $("#memo-verse-select").val(verseId)
    refreshSelectedVerseDisplay(surahId, verseId)
    updateNavigationButtons()
    hydrateReviewUI(surahId, verseId)

    $("#memo-quran-text").html('<div class="alfawz-loading-verse">Loading Arabic text...</div>')
    $("#memo-quran-translation").html('<div class="alfawz-loading-verse">Loading translation...</div>')
    $("#memo-verse-number").text(verseId)
    $("#session-verse-info").text(`Surah ${surahId}, Verse ${verseId}`)

    $(".alfawz-memorization-session").show()
    $("#load-memorization-verse").prop("disabled", true)
    $("#memo-surah-select").prop("disabled", true)
    $("#memo-verse-select").prop("disabled", true)

    currentMemorizationVerse = null

    fetch(`${ALQURAN_API_BASE}ayah/${surahId}:${verseId}/${ARABIC_EDITION}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "OK") {
          $("#memo-quran-text").text(data.data.text)
          const audioUrl =
            data.data.audioSecondary && data.data.audioSecondary.length
              ? data.data.audioSecondary[0]
              : data.data.audio || null
          currentMemorizationVerse = {
            surah_id: surahId,
            verse_id: verseId,
            text: data.data.text,
            hasanat: data.data.text.replace(/[^\u0600-\u06FF]/g, "").length * alfawzData.hasanatPerLetter,
            audioUrl,
          }
        } else {
          $("#memo-quran-text").text("Failed to load Arabic text.")
        }
      })
      .catch(error => {
        console.error("Error fetching Arabic text for memorizer:", error)
        $("#memo-quran-text").text("Failed to load Arabic text.")
        currentMemorizationVerse = null
      })

    fetch(`${ALQURAN_API_BASE}ayah/${surahId}:${verseId}/${ENGLISH_EDITION}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "OK") {
          $("#memo-quran-translation").text(data.data.text)
        } else {
          $("#memo-quran-translation").text("Failed to load translation.")
        }
      })
      .catch(error => {
        console.error("Error fetching translation for memorizer:", error)
        $("#memo-quran-translation").text("Failed to load translation.")
      })
  }

  function playMemorizationAudio() {
    if (!currentMemorizationVerse) {
      showNotification("Please load a verse first.", "error")
      return
    }

    const audioUrl = currentMemorizationVerse.audioUrl
    if (!audioUrl) {
      showNotification("Audio is not available for this verse.", "error")
      return
    }
    const audioButton = $(this)

    if (currentAudio) {
      currentAudio.pause()
      if (currentAudioButton) {
        currentAudioButton.removeClass("playing").find(".alfawz-audio-text").text(playAudioDefaultLabel || "Play Audio")
      }
      if (currentAudio.src === audioUrl) {
        currentAudio = null
        currentAudioButton = null
        return // Stop and reset if same audio is clicked again
      }
    }

    currentAudio = new Audio(audioUrl)
    currentAudioButton = audioButton

    audioButton.addClass("loading").find(".alfawz-audio-text").text("Loading...")

    currentAudio.oncanplaythrough = () => {
      audioButton.removeClass("loading").addClass("playing").find(".alfawz-audio-text").text("Playing...")
      currentAudio.play()
    }

    currentAudio.onended = () => {
      audioButton.removeClass("playing").find(".alfawz-audio-text").text(playAudioDefaultLabel || "Play Audio")
      currentAudio = null
      currentAudioButton = null
    }

    currentAudio.onerror = () => {
      audioButton.removeClass("loading").removeClass("playing").find(".alfawz-audio-text").text(playAudioDefaultLabel || "Play Audio")
      showNotification("Failed to load audio. Please try again.", "error")
      currentAudio = null
      currentAudioButton = null
    }
  }

  function incrementRepetition() {
    if (!currentMemorizationVerse) {
      showNotification("Please load a verse to start repetitions.", "error")
      return
    }

    if (!memorizationSessionActive) {
      showNotification("Please load a verse to start repetitions.", "error")
      return
    }

    repetitionCount++
    if (repetitionCount > REPETITION_TARGET) {
      repetitionCount = REPETITION_TARGET
    }
    updateRepetitionDisplay()
    showRepetitionFeedback()

    playRepetitionChime()
    lockRepeatButtonTemporarily(repetitionCount >= REPETITION_TARGET)

    if (repetitionCount >= REPETITION_TARGET) {
      repetitionCount = REPETITION_TARGET
      handleRepetitionTargetReached()
    }
  }

  function lockRepeatButtonTemporarily(permanentlyLocked = false) {
    const repeatButton = $("#repeat-verse-btn")
    repeatButton.addClass("alfawz-repeat-clicked").prop("disabled", true)

    setTimeout(() => {
      if (!permanentlyLocked && repetitionCount < REPETITION_TARGET) {
        repeatButton.prop("disabled", false)
      }
      repeatButton.removeClass("alfawz-repeat-clicked")
    }, REPEAT_BUTTON_LOCK_DURATION)
  }

  function playRepetitionChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) {
        return
      }

      if (!repetitionChimeContext) {
        repetitionChimeContext = new AudioContext()
      }

      const context = repetitionChimeContext
      if (context.state === "suspended") {
        context.resume().catch(() => {})
      }

      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(880, context.currentTime)

      gainNode.gain.setValueAtTime(0.0001, context.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28)

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      oscillator.start()
      oscillator.stop(context.currentTime + 0.3)
    } catch (error) {
      console.warn("Unable to play repetition chime:", error)
    }
  }

  function updateRepetitionDisplay() {
    $("#repetition-count").text(repetitionCount)
    $("#repetition-target").text(REPETITION_TARGET)
    $("#session-progress-text").text(`${repetitionCount} / ${REPETITION_TARGET} Repetitions`)

    const percentage = (repetitionCount / REPETITION_TARGET) * 100
    const progressBar = $("#repetition-progress-bar")
    progressBar
      .css("width", `${percentage}%`)
      .attr("aria-valuenow", repetitionCount)
      .attr("aria-valuemax", REPETITION_TARGET)
      .removeClass("alfawz-stage-early alfawz-stage-momentum alfawz-stage-complete")

    const progressCheck = $("#repetition-progress-check")
    progressCheck.removeClass("is-visible")

    if (repetitionCount >= REPETITION_TARGET) {
      progressBar.addClass("alfawz-stage-complete")
      progressCheck.addClass("is-visible")
    } else if (repetitionCount >= 10) {
      progressBar.addClass("alfawz-stage-momentum")
    } else {
      progressBar.addClass("alfawz-stage-early")
    }

    const markersContainer = $(".alfawz-progress-markers")
    markersContainer.empty()
    for (let i = 1; i <= REPETITION_TARGET; i++) {
      const markerClass = i <= repetitionCount ? "alfawz-marker-completed" : ""
      markersContainer.append(`<div class="alfawz-progress-marker ${markerClass}"></div>`)
    }

    updateNavigationButtons()
  }

  function handleRepetitionTargetReached() {
    if (completionCelebrationShown || !currentMemorizationVerse) {
      return
    }

    const repeatButton = $("#repeat-verse-btn")
    repeatButton.addClass("alfawz-repeat-completed").prop("disabled", true)
    $("#repetition-progress-bar").addClass("alfawz-progress-complete")
    $("#repetition-progress-check").addClass("is-visible")

    markVerseAsMemorized(null, { triggeredAutomatically: true, repeatButton })
  }

  function disableMarkAsMemorizedButton() {
    $("#memo-mark-memorized")
      .prop("disabled", true)
      .attr("aria-disabled", "true")
      .addClass("alfawz-btn-disabled")
  }

  function enableMarkAsMemorizedButton() {
    $("#memo-mark-memorized")
      .prop("disabled", false)
      .attr("aria-disabled", "false")
      .removeClass("alfawz-btn-disabled")
  }

  function showRepetitionFeedback() {
    const feedback = $(`
      <div class="alfawz-repetition-feedback">
        <span class="alfawz-feedback-icon">✨</span>
        <span class="alfawz-feedback-text">${$('#repetition-count').text()}/${$('#repetition-target').text()}</span>
      </div>
    `)

    $('body').append(feedback)

    setTimeout(() => {
      feedback.addClass('alfawz-feedback-show')
    }, 10)

    setTimeout(() => {
      feedback.removeClass('alfawz-feedback-show')
      setTimeout(() => feedback.remove(), 300)
    }, 1000)
  }

  function markVerseAsMemorized(event, options = {}) {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault()
    }

    const { triggeredAutomatically = false, repeatButton = null } = options

    let button = $(this)
    if (!button.length || !button.is("#memo-mark-memorized")) {
      button = $("#memo-mark-memorized")
    }

    const buttonLabel = button.find(".alfawz-btn-text")

    if (!currentMemorizationVerse) {
      showNotification("No verse loaded to mark as memorized.", "error")
      if (repeatButton && repeatButton.length) {
        repeatButton.removeClass("alfawz-repeat-completed").prop("disabled", false)
      }
      return
    }

    if (!memorizationSessionActive) {
      showNotification("Please load a verse to start repetitions.", "error")
      if (repeatButton && repeatButton.length) {
        repeatButton.removeClass("alfawz-repeat-completed").prop("disabled", false)
      }
      return
    }

    if (!alfawzData.isLoggedIn) {
      if (triggeredAutomatically) {
        showNotification("Log in to preserve this memorization in your account.", "warning")
        finalizeMemorizationCompletion(false)
      } else {
        showNotification("Please log in to mark verses as memorized.", "error")
      }
      return
    }

    if (!completionCelebrationShown && repetitionCount < REPETITION_TARGET) {
      showNotification(`Please complete ${REPETITION_TARGET} repetitions before marking as memorized.`, "error")
      button.prop("disabled", false)
      buttonLabel.length ? buttonLabel.text(markMemorizedDefaultLabel || "Mark as Memorized") : button.text(markMemorizedDefaultLabel || "Mark as Memorized")
      return
    }

    if (!triggeredAutomatically) {
      button.prop("disabled", true).addClass("alfawz-btn-disabled").attr("aria-disabled", "true")
      buttonLabel.length ? buttonLabel.text("Marking...") : button.text("Marking...")
    } else {
      button.attr("aria-disabled", "true").prop("disabled", true)
    }

    $.ajax({
      url: alfawzData.apiUrl + "progress",
      method: "POST",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      data: {
        surah_id: currentMemorizationVerse.surah_id,
        verse_id: currentMemorizationVerse.verse_id,
        progress_type: "memorized",
        hasanat: currentMemorizationVerse.hasanat,
        repetition_count: repetitionCount,
      },
      success: (response) => {
        if (response.success) {
          loadUserStats()
          const selectedPlanId = $("#memorization-plan-select").val()
          if (selectedPlanId) {
            loadMemorizationPlanProgress(selectedPlanId)
          }
          finalizeMemorizationCompletion(true)
        } else {
          handleMemorizationSaveFailure(response.message)
        }
      },
      error: (xhr, status, error) => {
        console.error("Error marking verse as memorized:", error)
        handleMemorizationSaveFailure()
      },
    })

    function handleMemorizationSaveFailure(customMessage) {
      const message = customMessage || "Failed to mark verse as memorized."
      showNotification(message, "error")
      if (repeatButton && repeatButton.length) {
        repeatButton.removeClass("alfawz-repeat-completed").prop("disabled", false)
      }
      enableMarkAsMemorizedButton()
      button.removeClass("alfawz-btn-disabled").attr("aria-disabled", "false")
      const needsSave = button.data("needs-save")
      if (needsSave) {
        buttonLabel.length ? buttonLabel.text("Save to Account") : button.text("Save to Account")
      } else {
        buttonLabel.length ? buttonLabel.text(markMemorizedDefaultLabel || "Mark as Memorized") : button.text(markMemorizedDefaultLabel || "Mark as Memorized")
      }
    }
  }

  function finalizeMemorizationCompletion(savedToAccount = true) {
    if (completionCelebrationShown) {
      updateNavigationButtons()
      return
    }

    completionCelebrationShown = true

    const markButton = $("#memo-mark-memorized")
    const label = markButton.find(".alfawz-btn-text")
    if (savedToAccount) {
      markButton.data("needs-save", false)
      if (label.length) {
        label.text("Memorized • 20x")
      } else {
        markButton.text("Memorized • 20x")
      }
      markButton.prop("disabled", true).attr("aria-disabled", "true").addClass("alfawz-btn-disabled")
    } else {
      markButton.data("needs-save", true)
      if (label.length) {
        label.text("Save to Account")
      } else {
        markButton.text("Save to Account")
      }
      enableMarkAsMemorizedButton()
    }

    const verseDisplay = $("#selected-memo-verse-name").text() ||
      (currentMemorizationVerse ? `Surah ${currentMemorizationVerse.surah_id}, Verse ${currentMemorizationVerse.verse_id}` : "")
    const hasanatEarned = currentMemorizationVerse ? currentMemorizationVerse.hasanat : 0

    showCongratulationsModal({
      hasanatEarned,
      savedToAccount,
      verseInfo: verseDisplay,
    })

    updateNavigationButtons()
  }

  function showCongratulationsModal({ hasanatEarned = 0, savedToAccount = true, verseInfo = "" } = {}) {
    const modal = $("#congratulations-modal")
    const detailParts = ["20 Repetitions Complete"]
    if (hasanatEarned) {
      detailParts.push(`+${hasanatEarned} Hasanat`)
    }
    if (verseInfo) {
      detailParts.push(verseInfo)
    }
    $("#achievement-details").text(detailParts.join(" • "))

    const celebrationStatus = savedToAccount
      ? "Progress saved to your memorization plan."
      : "Progress saved locally. Log in to keep it synced."
    $("#celebration-status")
      .text(celebrationStatus)
      .removeClass("is-success is-warning")
      .addClass(savedToAccount ? "is-success" : "is-warning")

    modal
      .removeClass("alfawz-hidden")
      .attr("aria-hidden", "false")
      .stop(true, true)
      .fadeIn(200, () => {
        modal.find(".alfawz-modal-content").addClass("alfawz-modal-celebrate")
      })
  }

  function hideCongratulationsModal({ immediate = false } = {}) {
    const modal = $("#congratulations-modal")
    const finalizeHide = () => {
      modal.addClass("alfawz-hidden").attr("aria-hidden", "true")
      modal.find(".alfawz-modal-content").removeClass("alfawz-modal-celebrate")
    }

    if (immediate) {
      modal.stop(true, true).hide()
      finalizeHide()
      return
    }

    modal.stop(true, true).fadeOut(200, finalizeHide)
  }

  function resetMemorizationSession() {
    hideCongratulationsModal()
    $(".alfawz-memorization-session").hide()
    $("#memo-surah-select").val("").prop("disabled", false)
    $("#memo-verse-select").empty().append('<option value="">Select surah first</option>').prop("disabled", true)
    $("#load-memorization-verse").prop("disabled", true)
    $("#selected-memo-verse-display").hide()
    currentMemorizationVerse = null
    repetitionCount = 0
    updateRepetitionDisplay()
    $("#repeat-verse-btn").removeClass("alfawz-repeat-completed").prop("disabled", false)
    $("#repetition-progress-bar")
      .removeClass("alfawz-progress-complete alfawz-stage-early alfawz-stage-momentum alfawz-stage-complete")
      .css("width", "0%")
    $("#repetition-progress-check").removeClass("is-visible")
    completionCelebrationShown = false
    disableMarkAsMemorizedButton()
    $("#memo-mark-memorized .alfawz-btn-text").text(markMemorizedDefaultLabel || $("#memo-mark-memorized").text())
    $("#memo-mark-memorized").data("needs-save", false)
    memorizationSessionActive = false
    stopCurrentAudioPlayback()
    resetReviewUI()
    updateNavigationButtons()
  }

  function stopCurrentAudioPlayback() {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }
    if (currentAudioButton) {
      currentAudioButton.removeClass("playing loading").find(".alfawz-audio-text").text(playAudioDefaultLabel || "Play Audio")
      currentAudioButton = null
    }
  }

  function getVerseOptions() {
    return $("#memo-verse-select option")
      .toArray()
      .filter(option => option.value)
  }

  function updateNavigationButtons() {
    const options = getVerseOptions()
    const currentValue = $("#memo-verse-select").val()
    const prevButton = $("#prev-memo-verse-btn")
    const nextButton = $("#next-memo-verse-btn")

    if (!memorizationSessionActive || !currentValue) {
      prevButton.prop("disabled", true)
      nextButton.prop("disabled", true)
      return
    }

    const index = options.findIndex(option => option.value === currentValue)
    if (index === -1) {
      prevButton.prop("disabled", true)
      nextButton.prop("disabled", true)
      return
    }

    const canAdvance = repetitionCount >= REPETITION_TARGET

    prevButton.prop("disabled", index <= 0)
    nextButton
      .prop("disabled", index >= options.length - 1 || !canAdvance)
      .attr("aria-disabled", index >= options.length - 1 || !canAdvance)
      .toggleClass("alfawz-nav-locked", !canAdvance)
  }

  function navigateMemorizationVerse(step, triggeredByAuto = false) {
    if (!memorizationSessionActive) {
      return false
    }

    if (step > 0 && !triggeredByAuto && repetitionCount < REPETITION_TARGET) {
      const remaining = REPETITION_TARGET - repetitionCount
      showNotification(`Complete ${remaining} more repetitions to unlock the next verse.`, "warning")
      return false
    }

    const options = getVerseOptions()
    const currentValue = $("#memo-verse-select").val()
    const currentIndex = options.findIndex(option => option.value === currentValue)

    if (currentIndex === -1) {
      return false
    }

    const nextIndex = currentIndex + step
    if (nextIndex < 0 || nextIndex >= options.length) {
      if (triggeredByAuto) {
        showNotification("You have reached the end of this selection.", "info")
        $("#repeat-verse-btn").prop("disabled", false)
      }
      return false
    }

    const nextVerseId = options[nextIndex].value
    startMemorizationForVerse(nextVerseId, { triggeredByNavigation: true })

    if (triggeredByAuto) {
      showNotification(`Now reciting verse ${nextVerseId}.`, "success")
    }
    return true
  }

  function continueMemorizationAfterCelebration(event) {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault()
    }

    hideCongratulationsModal()

    const advanced = navigateMemorizationVerse(1, true)
    if (!advanced) {
      $("#repeat-verse-btn").removeClass("alfawz-repeat-completed").prop("disabled", false)
    }
  }

  function handleReviewLaterSelection(event) {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault()
    }

    if (!memorizationSessionActive) {
      showNotification("Load a verse before adding it to your review queue.", "error")
      return
    }

    const identifiers = getActiveMemorizationIdentifiers()
    if (!identifiers) {
      showNotification("Load a verse before adding it to your review queue.", "error")
      return
    }

    const queueEntry = {
      surahId: identifiers.surahId,
      verseId: identifiers.verseId,
      addedAt: Date.now(),
    }

    try {
      const existing = window.localStorage.getItem(REVIEW_QUEUE_STORAGE_KEY)
      const parsed = existing ? JSON.parse(existing) : []
      const queue = Array.isArray(parsed) ? parsed : []

      const filteredQueue = queue.filter(item => !(
        item && item.surahId === queueEntry.surahId && item.verseId === queueEntry.verseId
      ))
      filteredQueue.push(queueEntry)

      window.localStorage.setItem(REVIEW_QUEUE_STORAGE_KEY, JSON.stringify(filteredQueue))
      showNotification("Verse added to your review queue. Return soon to revisit it.", "success")
    } catch (error) {
      console.error("Failed to update review queue:", error)
      showNotification("Unable to save review reminder on this device.", "error")
    }
  }

  function refreshSelectedVerseDisplay(surahId, verseId) {
    const surahName = $("#memo-surah-select option:selected").text().split('(')[0].trim()
    if (surahName && verseId) {
      $("#selected-memo-verse-name").text(`${surahName}, Verse ${verseId}`)
      $("#selected-memo-verse-display").show()
    }
  }

  function handleReviewSelection() {
    const identifiers = getActiveMemorizationIdentifiers()
    if (!memorizationSessionActive || !identifiers) {
      showNotification("Load a verse before recording a review.", "error")
      return
    }

    const selectedScore = $(this).data("review-score")
    currentReviewState.rating = selectedScore

    $("#memo-review-actions .alfawz-review-chip").attr("aria-checked", "false")
    $(this).attr("aria-checked", "true")
    updateReviewStatusLabel()
  }

  function handleReviewNotesInput() {
    currentReviewState.notes = $(this).val()
  }

  function saveReviewSnapshot() {
    const identifiers = getActiveMemorizationIdentifiers()
    if (!memorizationSessionActive || !identifiers) {
      showNotification("Load a verse before saving a review.", "error")
      return
    }

    if (!currentReviewState.rating && !currentReviewState.notes.trim()) {
      showNotification("Select a review outcome or add notes before saving.", "error")
      return
    }

    const key = getReviewStorageKey(identifiers.surahId, identifiers.verseId)
    try {
      window.localStorage.setItem(key, JSON.stringify(currentReviewState))
      $("#memo-review-feedback").text("Review saved for this verse.")
      updateReviewStatusLabel()
    } catch (error) {
      console.error("Failed to store review:", error)
      showNotification("Unable to save review on this device.", "error")
    }
  }

  function hydrateReviewUI(surahId, verseId) {
    resetReviewUI()
    if (!surahId || !verseId) {
      return
    }

    const key = getReviewStorageKey(surahId, verseId)
    try {
      const stored = window.localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        currentReviewState = {
          rating: parsed.rating || null,
          notes: parsed.notes || "",
        }

        if (currentReviewState.rating) {
          $("#memo-review-actions .alfawz-review-chip").each(function () {
            const isSelected = $(this).data("review-score") === currentReviewState.rating
            $(this).attr("aria-checked", isSelected ? "true" : "false")
          })
        }

        if (currentReviewState.notes) {
          $("#memo-review-notes").val(currentReviewState.notes)
        }

        updateReviewStatusLabel()
        $("#memo-review-feedback").text("")
      }
    } catch (error) {
      console.error("Failed to hydrate review state:", error)
    }
  }

  function resetReviewUI() {
    currentReviewState = { rating: null, notes: "" }
    $("#memo-review-actions .alfawz-review-chip").attr("aria-checked", "false")
    $("#memo-review-notes").val("")
    $("#memo-review-feedback").text("")
    $("#memo-review-status").text(reviewStatusDefaultText || "No review yet")
  }

  function updateReviewStatusLabel() {
    if (currentReviewState.rating) {
      const labelMap = {
        perfect: "Perfect recall logged",
        solid: "Solid with notes",
        revisit: "Flagged to revisit",
      }
      $("#memo-review-status").text(labelMap[currentReviewState.rating] || reviewStatusDefaultText || "Review updated")
    } else if (currentReviewState.notes.trim()) {
      $("#memo-review-status").text("Notes captured")
    } else {
      $("#memo-review-status").text(reviewStatusDefaultText || "No review yet")
    }
  }

  function getReviewStorageKey(surahId, verseId) {
    return `${REVIEW_STORAGE_KEY_PREFIX}-${surahId}-${verseId}`
  }

  function getActiveMemorizationIdentifiers() {
    const surahId = $("#memo-surah-select").val()
    const verseId = $("#memo-verse-select").val()
    if (!surahId || !verseId) {
      return null
    }
    return { surahId, verseId }
  }

  // Memorization Plan Revision Functions
  function setPlanLaunchpadFeedback(message = "", tone = "info") {
    const feedback = $("#plan-launchpad-feedback")
    if (!feedback.length) {
      return
    }

    feedback
      .text(message || "")
      .removeClass("is-info is-success is-error")

    if (message) {
      const toneClass = tone === "error" ? "is-error" : tone === "success" ? "is-success" : "is-info"
      feedback.addClass(toneClass)
    }
  }

  function setupPlanCreationForm() {
    const form = $("#create-plan-form")
    if (!form.length) {
      return
    }

    loadSurahsIntoDropdown("#plan-surah-select")
    $("#plan-surah-select")
      .off("change.planCreation")
      .on("change.planCreation", handlePlanSurahSelectChange)
    form.off("submit.planCreation").on("submit.planCreation", createMemorizationPlan)
    $("#plan-name, #plan-surah-select, #plan-start-verse, #plan-end-verse, #plan-daily-goal")
      .off("input.planCreation change.planCreation")
      .on("input.planCreation change.planCreation", updatePlanSummary)

    setPlanLaunchpadFeedback("")
    updatePlanSummary()
  }

  function generateDefaultPlanName(surahName, startLocal, endLocal) {
    const trimmedSurah = surahName ? surahName.trim() : ""
    if (trimmedSurah && startLocal && endLocal) {
      return `${trimmedSurah} ${startLocal}-${endLocal}`
    }
    if (trimmedSurah) {
      return `${trimmedSurah} Memorization`
    }
    return `Memorization Plan ${new Date().toISOString().split('T')[0]}`
  }

  function loadMemorizationPlans() {
    if (!alfawzData.isLoggedIn) {
      $("#memorization-plan-select").empty().append('<option value="">Login to see plans</option>')
      return
    }

    $.ajax({
      url: alfawzData.apiUrl + "memorization-plans",
      method: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      success: (response) => {
        const dropdown = $("#memorization-plan-select")
        dropdown.empty().append('<option value="">Choose a plan</option>')
        if (response && response.length > 0) {
          response.forEach(plan => {
            dropdown.append(
              `<option value="${plan.id}" data-surah-id="${plan.surah_id}" data-start-verse="${plan.start_verse}" data-end-verse="${plan.end_verse}">
                ${plan.plan_name} (Surah ${plan.surah_id}, Verses ${plan.start_verse}-${plan.end_verse})
              </option>`
            )
          })
          $("#active-plans-count").text(response.length)
        } else {
          dropdown.append('<option value="">No plans found</option>')
          $("#active-plans-count").text(0)
        }
      },
      error: (xhr) => {
        console.error("Failed to load memorization plans:", xhr)
        $("#memorization-plan-select").empty().append('<option value="">Failed to load plans</option>')
      }
    })
  }

  function handlePlanSelectChange() {
    const selectedPlanId = $(this).val()
    if (selectedPlanId) {
      $("#load-memorization-plan").prop("disabled", false)
    } else {
      $("#load-memorization-plan").prop("disabled", true)
      $("#plan-progress-container").hide()
      $("#plan-verses-container").hide()
    }
  }

  function loadSelectedMemorizationPlan() {
    const planId = $("#memorization-plan-select").val()
    if (!planId) return

    $("#plan-progress-container").show().find(".alfawz-plan-info").html('<div class="alfawz-loading-plan"><span class="alfawz-loading-icon">⏳</span><p>Loading plan details...</p></div>')
    $("#plan-verses-container").show().find("#plan-verses-list").html('<div class="alfawz-loading-plan"><span class="alfawz-loading-icon">⏳</span><p>Loading verses...</p></div>')

    $.ajax({
      url: alfawzData.apiUrl + `memorization-plans/${planId}`,
      method: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      success: (response) => {
        if (response) {
          $("#current-plan-name").text(response.plan_name)
          $("#plan-completion-text").text(`${response.completed_verses} / ${response.total_verses} verses completed`)
          $("#plan-percentage").text(`${response.completion_percentage}%`)
          $("#plan-progress-fill").css("width", `${response.completion_percentage}%`)

          const versesList = $("#plan-verses-list")
          versesList.empty()

          const memorizedVerses = new Set(response.progress.map(p => p.verse_id))

          // Fetch surah to get Arabic text for preview
          fetch(`${ALQURAN_API_BASE}surah/${response.surah_id}/${ARABIC_EDITION}`)
            .then(res => res.json())
            .then(surahData => {
              if (surahData.status === "OK" && surahData.data.ayahs) {
                for (let i = response.start_verse; i <= response.end_verse; i++) {
                  const verse = surahData.data.ayahs.find(a => a.numberInSurah == i)
                  const isCompleted = memorizedVerses.has(i.toString())
                  const verseTextPreview = verse ? verse.text.substring(0, 50) + "..." : "Loading verse preview..."

                  versesList.append(`
                    <div class="alfawz-verse-item ${isCompleted ? 'completed' : ''}" data-verse-id="${i}" data-surah-id="${response.surah_id}" data-plan-id="${response.id}">
                      <div class="alfawz-verse-header">
                        <span class="alfawz-verse-number">${i}</span>
                        <div class="alfawz-verse-checkbox">
                          <input type="checkbox" ${isCompleted ? 'checked' : ''} data-verse-id="${i}" class="alfawz-mark-plan-verse">
                        </div>
                      </div>
                      <div class="alfawz-verse-preview">${verseTextPreview}</div>
                      <div class="alfawz-verse-actions">
                        <button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-small alfawz-btn-secondary alfawz-preview-verse-btn" data-surah-id="${response.surah_id}" data-verse-id="${i}">
                          Preview
                        </button>
                        <span class="alfawz-verse-status">${isCompleted ? 'Memorized' : 'Pending'}</span>
                      </div>
                    </div>
                  `)
                }
                $(".alfawz-mark-plan-verse").on("change", togglePlanVerseCompletion)
                $(".alfawz-preview-verse-btn").on("click", previewPlanVerse)
              } else {
                versesList.html('<div class="alfawz-error-message">Failed to load verse previews.</div>')
              }
            })
            .catch(error => {
              console.error("Error fetching surah for plan verses:", error)
              versesList.html('<div class="alfawz-error-message">Failed to load verse previews.</div>')
            })
        } else {
          showNotification("Failed to load memorization plan.", "error")
          $("#plan-progress-container").hide()
          $("#plan-verses-container").hide()
        }
      },
      error: (xhr, status, error) => {
        console.error("Error loading memorization plan:", error)
        showNotification("Error loading memorization plan. Please try again.", "error")
        $("#plan-progress-container").hide()
        $("#plan-verses-container").hide()
      }
    })
  }

  function togglePlanVerseCompletion() {
    if (!alfawzData.isLoggedIn) {
      showNotification("Please log in to update plan progress.", "error")
      $(this).prop('checked', !$(this).is(':checked')); // Revert checkbox state
      return
    }

    const checkbox = $(this)
    const verseId = checkbox.data("verse-id")
    const planId = checkbox.closest(".alfawz-verse-item").data("plan-id")
    const action = checkbox.is(":checked") ? "mark" : "unmark"
    const verseItem = checkbox.closest(".alfawz-verse-item")

    $.ajax({
      url: alfawzData.apiUrl + `memorization-plans/${planId}/progress`,
      method: "POST",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      data: {
        verse_id: verseId,
        action: action,
      },
      success: (response) => {
        if (response.success) {
          showNotification(`Verse ${verseId} ${action === 'mark' ? 'marked' : 'unmarked'} successfully!`, "success")
          if (action === 'mark') {
            verseItem.addClass('completed').find('.alfawz-verse-status').text('Memorized')
          } else {
            verseItem.removeClass('completed').find('.alfawz-verse-status').text('Pending')
          }
          loadMemorizationPlanProgress(planId) // Reload progress bar and counts
        } else {
          showNotification(response.message || "Failed to update plan progress.", "error")
          checkbox.prop('checked', !checkbox.is(':checked')); // Revert checkbox state
        }
      },
      error: (xhr, status, error) => {
        console.error("Error updating plan progress:", error)
        showNotification("Error updating plan progress. Please try again.", "error")
        checkbox.prop('checked', !checkbox.is(':checked')); // Revert checkbox state
      },
    })
  }

  function previewPlanVerse() {
    const surahId = $(this).data("surah-id")
    const verseId = $(this).data("verse-id")
    
    if (!surahId || !verseId) {
      showNotification("Verse data missing for preview.", "error")
      return
    }

    // Redirect to reader page with selected verse
    navigateToPage('reader', { surah: surahId, verse: verseId })
  }

  function restartMemorizationPlan() {
    if (!confirm("Are you sure you want to restart this plan? All memorization progress for this plan will be reset.")) {
      return
    }

    const planId = $("#memorization-plan-select").val()
    if (!planId) return

    $.ajax({
      url: alfawzData.apiUrl + `memorization-plans/${planId}/restart`,
      method: "POST",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      success: (response) => {
        if (response.success) {
          showNotification("Memorization plan restarted successfully!", "success")
          loadSelectedMemorizationPlan() // Reload plan to show reset progress
        } else {
          showNotification(response.message || "Failed to restart plan.", "error")
        }
      },
      error: (xhr, status, error) => {
        console.error("Error restarting plan:", error)
        showNotification("Error restarting plan. Please try again.", "error")
      },
    })
  }

  // Helper to load plan progress (used after updates)
  function loadMemorizationPlanProgress(planId) {
    $.ajax({
      url: alfawzData.apiUrl + `memorization-plans/${planId}`,
      method: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      success: (response) => {
        if (response) {
          $("#plan-completion-text").text(`${response.completed_verses} / ${response.total_verses} verses completed`)
          $("#plan-percentage").text(`${response.completion_percentage}%`)
          $("#plan-progress-fill").css("width", `${response.completion_percentage}%`)

          // Update checkboxes and status in the list
          const memorizedVerses = new Set(response.progress.map(p => p.verse_id))
          $("#plan-verses-list .alfawz-verse-item").each(function() {
            const verseId = $(this).data('verse-id').toString()
            const checkbox = $(this).find('.alfawz-mark-plan-verse')
            const statusText = $(this).find('.alfawz-verse-status')

            if (memorizedVerses.has(verseId)) {
              $(this).addClass('completed')
              checkbox.prop('checked', true)
              statusText.text('Memorized')
            } else {
              $(this).removeClass('completed')
              checkbox.prop('checked', false)
              statusText.text('Pending')
            }
          })
        }
      }
    })
  }

  // ========================================
  // SETTINGS FUNCTIONALITY
  // ========================================
  function initializeSettings() {
    if ($(".alfawz-settings").length) {
      setupPlanCreationForm()
      loadExistingMemorizationPlans()
    }
  }

  function handlePlanSurahSelectChange() {
    const surahId = $(this).val()
    const startVerseDropdown = $("#plan-start-verse")
    const endVerseDropdown = $("#plan-end-verse")
    
    startVerseDropdown.empty().append('<option value="">Start Verse</option>').prop("disabled", true)
    endVerseDropdown.empty().append('<option value="">End Verse</option>').prop("disabled", true)
    setPlanLaunchpadFeedback("")

    if (surahId) {
      fetch(`${ALQURAN_API_BASE}surah/${surahId}`)
        .then(response => response.json())
        .then(data => {
          if (data.status === "OK" && data.data.ayahs) {
            data.data.ayahs.forEach(ayah => {
              startVerseDropdown.append(`<option value="${ayah.number}" data-local="${ayah.numberInSurah}">Verse ${ayah.numberInSurah}</option>`)
              endVerseDropdown.append(`<option value="${ayah.number}" data-local="${ayah.numberInSurah}">Verse ${ayah.numberInSurah}</option>`)
            })
            startVerseDropdown.prop("disabled", false)
            endVerseDropdown.prop("disabled", false)
          } else {
            startVerseDropdown.append('<option value="">Error loading verses</option>')
            endVerseDropdown.append('<option value="">Error loading verses</option>')
          }
          updatePlanSummary()
        })
        .catch(error => {
          console.error("Error fetching verses for plan creation:", error)
          startVerseDropdown.append('<option value="">Error loading verses</option>')
          endVerseDropdown.append('<option value="">Error loading verses</option>')
          updatePlanSummary()
        })
    }
  }

  function updatePlanSummary() {
    const planNameRaw = $("#plan-name").val()
    const planName = planNameRaw ? planNameRaw.trim() : ""
    const surahId = $("#plan-surah-select").val()
    const startVerse = $("#plan-start-verse").val()
    const endVerse = $("#plan-end-verse").val()
    const dailyGoal = $("#plan-daily-goal").val()

    const surahName = surahId ? $("#plan-surah-select option:selected").text().split('(')[0].trim() : ""
    const startLocal = parseInt($("#plan-start-verse option:selected").data("local")) || parseInt(startVerse) || null
    const endLocal = parseInt($("#plan-end-verse option:selected").data("local")) || parseInt(endVerse) || null

    let summaryText = "Select your verses to craft a heartfelt memorization intention."
    let disableButton = true

    if (surahId && startVerse && endVerse && dailyGoal) {
      if (startLocal !== null && endLocal !== null && startLocal > endLocal) {
        summaryText = "Adjust your verse range so the ending verse comes after the starting verse."
        setPlanLaunchpadFeedback("Adjust your verse range so it flows forward.", "error")
      } else {
        const totalVerses = endLocal !== null && startLocal !== null ? endLocal - startLocal + 1 : 0
        const versesText = totalVerses > 1 ? `${totalVerses} verses` : "1 verse"
        const goalText = dailyGoal === "1" ? "1 verse" : `${dailyGoal} verses`
        const planFocus = planName ? `"${planName}"` : `Surah ${surahName}`
        summaryText = `${planFocus} focuses on Surah ${surahName} verses ${startLocal}-${endLocal}. Commit to ${goalText} each day to complete ${versesText}.`
        disableButton = false
        setPlanLaunchpadFeedback("")
      }
    } else {
      setPlanLaunchpadFeedback("")
    }

    $("#create-plan-btn").prop("disabled", disableButton)
    $("#plan-summary-text").text(summaryText)
  }

  function createMemorizationPlan(event) {
    event.preventDefault()

    if (!alfawzData.isLoggedIn) {
      showNotification("Please log in to create memorization plans.", "error")
      setPlanLaunchpadFeedback("Please log in to create and sync memorization plans.", "error")
      return
    }

    const planNameValue = $("#plan-name").val()
    const planNameInput = planNameValue ? planNameValue.trim() : ""
    const surahId = $("#plan-surah-select").val()
    const startVerse = $("#plan-start-verse").val()
    const endVerse = $("#plan-end-verse").val()
    const dailyGoal = $("#plan-daily-goal").val()

    if (!surahId || !startVerse || !endVerse || !dailyGoal) {
      showNotification("Please fill in all plan details.", "error")
      setPlanLaunchpadFeedback("Complete each field to anchor your memorization plan.", "error")
      return
    }

    const startLocal = parseInt($("#plan-start-verse option:selected").data("local")) || parseInt(startVerse)
    const endLocal = parseInt($("#plan-end-verse option:selected").data("local")) || parseInt(endVerse)

    if (startLocal > endLocal) {
      showNotification("Start verse cannot be greater than end verse.", "error")
      setPlanLaunchpadFeedback("Start verse cannot be greater than end verse.", "error")
      return
    }

    const surahName = $("#plan-surah-select option:selected").text().split('(')[0].trim()
    const resolvedPlanName = planNameInput || generateDefaultPlanName(surahName, startLocal, endLocal)

    const button = $("#create-plan-btn")
    const buttonLabel = button.find(".alfawz-btn-label")
    button.prop("disabled", true).addClass("alfawz-btn-disabled")
    if (buttonLabel.length) {
      buttonLabel.text("Locking in...")
    } else {
      button.text("Locking in...")
    }
    setPlanLaunchpadFeedback("Anchoring your intention...", "info")

    $.ajax({
      url: alfawzData.apiUrl + "memorization-plans",
      method: "POST",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      data: {
        plan_name: resolvedPlanName,
        surah_id: surahId,
        start_verse: startVerse,
        end_verse: endVerse,
        daily_goal: dailyGoal,
      },
      success: (response) => {
        if (response.success) {
          showNotification("Memorization plan created successfully!", "success")
          const formElement = $("#create-plan-form")[0]
          if (formElement) {
            formElement.reset()
          }
          updatePlanSummary()
          loadExistingMemorizationPlans()
          loadMemorizationPlans()
          setPlanLaunchpadFeedback("Journey anchored. Bismillah!", "success")
          const successMessage = $("#plan-created-success-message")
          successMessage
            .removeClass("alfawz-hidden")
            .stop(true, true)
            .fadeIn()
            .delay(3000)
            .fadeOut(() => successMessage.addClass("alfawz-hidden"))
        } else {
          showNotification(response.message || "Failed to create plan.", "error")
          setPlanLaunchpadFeedback(response.message || "Unable to create plan.", "error")
        }
        button.prop("disabled", false).removeClass("alfawz-btn-disabled")
        if (buttonLabel.length) {
          buttonLabel.text("Begin Memorizing")
        } else {
          button.text("Begin Memorizing")
        }
      },
      error: (xhr, status, error) => {
        console.error("Error creating plan:", error)
        showNotification("Error creating plan. Please try again.", "error")
        setPlanLaunchpadFeedback("Unable to create plan. Please try again.", "error")
        button.prop("disabled", false).removeClass("alfawz-btn-disabled")
        if (buttonLabel.length) {
          buttonLabel.text("Begin Memorizing")
        } else {
          button.text("Begin Memorizing")
        }
      },
    })
  }

  function loadExistingMemorizationPlans() {
    if (!alfawzData.isLoggedIn) {
      $("#existing-plans-list").html('<div class="alfawz-empty-state"><p>Login to see your plans.</p></div>')
      return
    }

    $("#existing-plans-list").html('<div class="alfawz-loading-plans"><span class="alfawz-loading-icon">⏳</span><p>Loading your plans...</p></div>')

    $.ajax({
      url: alfawzData.apiUrl + "memorization-plans",
      method: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      success: (response) => {
        const plansList = $("#existing-plans-list")
        plansList.empty()
        if (response && response.length > 0) {
          response.forEach(plan => {
            plansList.append(`
              <div class="alfawz-plan-card ${plan.status}">
                <div class="alfawz-plan-header">
                  <h4 class="alfawz-plan-name">${plan.plan_name}</h4>
                  <span class="alfawz-plan-status ${plan.status}">${plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}</span>
                </div>
                <div class="alfawz-plan-details">
                  <p>Surah ${plan.surah_id}, Verses ${plan.start_verse}-${plan.end_verse}</p>
                  <p>${plan.daily_goal} verses / day</p>
                </div>
                <div class="alfawz-plan-progress-mini">
                  <div class="alfawz-plan-progress-text">Progress: Loading...</div>
                  <div class="alfawz-progress-track">
                    <div class="alfawz-progress-fill" style="width: 0%"></div>
                  </div>
                </div>
                <div class="alfawz-plan-actions">
                  <button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-small alfawz-btn-primary alfawz-continue-plan-btn" data-plan-id="${plan.id}">
                    Continue Plan
                  </button>
                  <button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-small alfawz-btn-secondary alfawz-delete-plan-btn" data-plan-id="${plan.id}">
                    Delete
                  </button>
                </div>
              </div>
            `)
            // Load individual plan progress
            loadPlanProgressForCard(plan.id)
          })
          $(".alfawz-continue-plan-btn").on("click", function() {
            const planId = $(this).data("plan-id")
            navigateToPage('memorization', { plan: planId })
          })
          $(".alfawz-delete-plan-btn").on("click", deleteMemorizationPlan)
        } else {
          plansList.html('<div class="alfawz-empty-state"><p>You haven\'t created any memorization plans yet.</p><p>Start by creating one above!</p></div>')
        }
      },
      error: (xhr, status, error) => {
        console.error("Error loading existing plans:", error)
        $("#existing-plans-list").html('<div class="alfawz-error-message">Failed to load your plans.</div>')
      }
    })
  }

  function loadPlanProgressForCard(planId) {
    $.ajax({
      url: alfawzData.apiUrl + `memorization-plans/${planId}`,
      method: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      success: (response) => {
        if (response) {
          const card = $(`.alfawz-plan-card .alfawz-continue-plan-btn[data-plan-id="${planId}"]`).closest('.alfawz-plan-card')
          card.find('.alfawz-plan-progress-text').text(`Progress: ${response.completed_verses} / ${response.total_verses} (${response.completion_percentage}%)`)
          card.find('.alfawz-progress-fill').css('width', `${response.completion_percentage}%`)
        }
      }
    })
  }

  function deleteMemorizationPlan() {
    if (!confirm("Are you sure you want to delete this memorization plan? This action cannot be undone.")) {
      return
    }

    const planId = $(this).data("plan-id")
    const button = $(this)
    button.prop("disabled", true).text("Deleting...")

    $.ajax({
      url: alfawzData.apiUrl + `memorization-plans/${planId}`,
      method: "DELETE",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      success: (response) => {
        if (response.success) {
          showNotification("Memorization plan deleted successfully!", "success")
          loadExistingMemorizationPlans() // Reload the list
          loadMemorizationPlans() // Reload plans in memorizer dropdown
        } else {
          showNotification(response.message || "Failed to delete plan.", "error")
          button.prop("disabled", false).text("Delete")
        }
      },
      error: (xhr, status, error) => {
        console.error("Error deleting plan:", error)
        showNotification("Error deleting plan. Please try again.", "error")
        button.prop("disabled", false).text("Delete")
      },
    })
  }

  // ========================================
  // LEADERBOARD FUNCTIONALITY
  // ========================================
  function initializeLeaderboard() {
    if ($(".alfawz-leaderboard").length) {
      loadLeaderboard("all_time") // Default load
      $("#leaderboard-period-select").on("change", function() {
        loadLeaderboard($(this).val())
      })
    }
  }

  function loadLeaderboard(period) {
    $("#leaderboard-list").html('<div class="alfawz-loading"><span class="alfawz-loading-icon">⏳</span><p>Loading leaderboard...</p></div>')

    $.ajax({
      url: alfawzData.apiUrl + "leaderboard",
      method: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      data: { period: period },
      success: (response) => {
        const list = $("#leaderboard-list")
        list.empty()
        if (response && response.length > 0) {
          $.each(response, function(index, user) {
            let rankClass = ""
            if (index === 0) rankClass = "gold"
            else if (index === 1) rankClass = "silver"
            else if (index === 2) rankClass = "bronze"

            list.append(`
              <li class="alfawz-leaderboard-item">
                <div class="alfawz-rank ${rankClass}">${index + 1}</div>
                <div class="alfawz-user-info">
                  <div class="alfawz-user-name">${user.display_name}</div>
                  <div class="alfawz-user-stats">
                    <span>📖 ${user.verses_read} Verses Read</span>
                    <span>🧠 ${user.verses_memorized} Verses Memorized</span>
                    <span>🔥 ${user.current_streak} Day Streak</span>
                  </div>
                </div>
                <div class="alfawz-user-hasanat">${parseInt(user.total_hasanat).toLocaleString()} Hasanat</div>
              </li>
            `)
          })
        } else {
          list.html('<div class="alfawz-empty-state"><span class="alfawz-empty-icon">😔</span><p>No leaderboard data available for this period.</p></div>')
        }
      },
      error: (xhr, status, error) => {
        console.error("Error loading leaderboard:", error)
        $("#leaderboard-list").html('<div class="alfawz-error-message">Failed to load leaderboard.</div>')
      },
    })
  }

  // ========================================
  // PROFILE FUNCTIONALITY
  // ========================================
  function initializeProfile() {
    if ($(".alfawz-profile").length) {
      loadUserStats()
      loadUserBookmarks()
      loadUserMemorizationPlans()
    }
  }

  function loadUserStats() {
    if (!alfawzData.isLoggedIn) {
      $("#profile-total-hasanat").text("N/A")
      $("#profile-verses-read").text("N/A")
      $("#profile-verses-memorized").text("N/A")
      $("#profile-current-streak").text("N/A")
      $("#profile-longest-streak").text("N/A")
      $("#profile-member-since").text("N/A")
      $("#profile-username").text("Guest")
      return
    }

    $.ajax({
      url: alfawzData.apiUrl + "user-stats",
      method: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      success: (response) => {
        if (response) {
          $("#profile-username").text(response.display_name || "User")
          $("#profile-total-hasanat").text(parseInt(response.total_hasanat || 0).toLocaleString())
          $("#profile-verses-read").text(response.verses_read || 0)
          $("#profile-verses-memorized").text(response.verses_memorized || 0)
          $("#profile-current-streak").text(response.current_streak || 0)
          $("#profile-longest-streak").text(response.longest_streak || 0)
          $("#profile-member-since").text(response.member_since || "N/A")
          $("#profile-avatar").attr("src", response.avatar_url || "/diverse-user-avatars.png")
        }
      },
      error: (xhr, status, error) => {
        console.error("Error loading user stats:", error)
        showNotification("Failed to load profile stats.", "error")
      },
    })
  }

  function loadUserBookmarks() {
    if (!alfawzData.isLoggedIn) {
      $("#bookmarks-list").html('<div class="alfawz-empty-state"><p>Login to see your bookmarks.</p></div>')
      return
    }

    $("#bookmarks-list").html('<div class="alfawz-loading-bookmarks"><span class="alfawz-loading-icon">⏳</span><p>Loading your bookmarks...</p></div>')

    $.ajax({
      url: alfawzData.apiUrl + "bookmarks",
      method: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      success: (response) => {
        const list = $("#bookmarks-list")
        list.empty()
        if (response && response.length > 0) {
          response.forEach(bookmark => {
            list.append(`
              <div class="alfawz-bookmark-item">
                <div class="alfawz-bookmark-info">
                  <span class="alfawz-bookmark-verse">Surah ${bookmark.surah_id}, Verse ${bookmark.verse_id}</span>
                  <span class="alfawz-bookmark-date">${new Date(bookmark.timestamp).toLocaleDateString()}</span>
                </div>
                <button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-small alfawz-btn-secondary alfawz-view-bookmark-btn" data-surah-id="${bookmark.surah_id}" data-verse-id="${bookmark.verse_id}">
                  View
                </button>
                <button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-small alfawz-btn-danger alfawz-delete-bookmark-btn" data-bookmark-id="${bookmark.id}">
                  Delete
                </button>
              </div>
            `)
          })
          $(".alfawz-view-bookmark-btn").on("click", function() {
            const surahId = $(this).data("surah-id")
            const verseId = $(this).data("verse-id")
            navigateToPage('reader', { surah: surahId, verse: verseId })
          })
          $(".alfawz-delete-bookmark-btn").on("click", deleteBookmark)
        } else {
          list.html('<div class="alfawz-empty-state"><p>You have no bookmarks yet.</p></div>')
        }
      },
      error: (xhr, status, error) => {
        console.error("Error loading bookmarks:", error)
        $("#bookmarks-list").html('<div class="alfawz-error-message">Failed to load bookmarks.</div>')
      },
    })
  }

  function deleteBookmark() {
    if (!confirm("Are you sure you want to delete this bookmark?")) {
      return
    }

    const bookmarkId = $(this).data("bookmark-id")
    const button = $(this)
    button.prop("disabled", true).text("Deleting...")

    $.ajax({
      url: alfawzData.apiUrl + `bookmarks/${bookmarkId}`,
      method: "DELETE",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      success: (response) => {
        if (response.success) {
          showNotification("Bookmark deleted successfully!", "success")
          loadUserBookmarks() // Reload the list
        } else {
          showNotification(response.message || "Failed to delete bookmark.", "error")
          button.prop("disabled", false).text("Delete")
        }
      },
      error: (xhr, status, error) => {
        console.error("Error deleting bookmark:", error)
        showNotification("Error deleting bookmark. Please try again.", "error")
        button.prop("disabled", false).text("Delete")
      },
    })
  }

  function loadUserMemorizationPlans() {
    if (!alfawzData.isLoggedIn) {
      $("#profile-plans-list").html('<div class="alfawz-empty-state"><p>Login to see your memorization plans.</p></div>')
      return
    }

    $("#profile-plans-list").html('<div class="alfawz-loading-plans"><span class="alfawz-loading-icon">⏳</span><p>Loading your memorization plans...</p></div>')

    $.ajax({
      url: alfawzData.apiUrl + "memorization-plans",
      method: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      success: (response) => {
        const list = $("#profile-plans-list")
        list.empty()
        if (response && response.length > 0) {
          response.forEach(plan => {
            list.append(`
              <div class="alfawz-plan-card ${plan.status}">
                <div class="alfawz-plan-header">
                  <h4 class="alfawz-plan-name">${plan.plan_name}</h4>
                  <span class="alfawz-plan-status ${plan.status}">${plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}</span>
                </div>
                <div class="alfawz-plan-details">
                  <p>Surah ${plan.surah_id}, Verses ${plan.start_verse}-${plan.end_verse}</p>
                  <p>${plan.daily_goal} verses / day</p>
                </div>
                <div class="alfawz-plan-progress-mini">
                  <div class="alfawz-plan-progress-text">Progress: ${plan.completed_verses} / ${plan.total_verses} (${plan.completion_percentage}%)</div>
                  <div class="alfawz-progress-track">
                    <div class="alfawz-progress-fill" style="width: ${plan.completion_percentage}%"></div>
                  </div>
                </div>
                <div class="alfawz-plan-actions">
                  <button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-small alfawz-btn-primary alfawz-continue-plan-btn" data-plan-id="${plan.id}">
                    Continue Plan
                  </button>
                  <button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-small alfawz-btn-secondary alfawz-delete-plan-btn" data-plan-id="${plan.id}">
                    Delete
                  </button>
                </div>
              </div>
            `)
          })
          $(".alfawz-continue-plan-btn").on("click", function() {
            const planId = $(this).data("plan-id")
            navigateToPage('memorization', { plan: planId })
          })
          $(".alfawz-delete-plan-btn").on("click", deleteMemorizationPlan) // Re-use delete function
        } else {
          list.html('<div class="alfawz-empty-state"><p>You have no memorization plans yet.</p><p>Create one in the Settings section!</p></div>')
        }
      },
      error: (xhr, status, error) => {
        console.error("Error loading user memorization plans:", error)
        $("#profile-plans-list").html('<div class="alfawz-error-message">Failed to load your memorization plans.</div>')
      },
    })
  }

  // ========================================
  // AYAH PUZZLE BUILDER GAME
  // ========================================
  function initializeGames() {
    if (!$('.alfawz-games').length) {
      return
    }

    hydratePuzzleState()
    updateHabitMessaging()
    bindGameControlButtons()

    const resetButton = $('#alfawz-reset-puzzle')
    if (resetButton.length && !resetButton.data('default-label')) {
      resetButton.data('default-label', resetButton.text())
    }

    loadAyahPuzzle()
  }

  function hydratePuzzleState() {
    ayahPuzzleState.completedCount = parseInt(
      getPuzzleStorage(AYAH_PUZZLE_STORAGE_KEYS.completed) || '0',
      10
    )
    const storedBest = parseInt(
      getPuzzleStorage(AYAH_PUZZLE_STORAGE_KEYS.bestTime) || '0',
      10
    )
    ayahPuzzleState.bestTime = storedBest > 0 ? storedBest : null
    ayahPuzzleState.streak = parseInt(
      getPuzzleStorage(AYAH_PUZZLE_STORAGE_KEYS.streak) || '0',
      10
    )
    ayahPuzzleState.lastCompletedDay =
      getPuzzleStorage(AYAH_PUZZLE_STORAGE_KEYS.lastCompleted) || null
    ayahPuzzleState.todayKey = new Date().toISOString().slice(0, 10)
    updatePuzzleStatsUI()
  }

  function updatePuzzleStatsUI() {
    $('#alfawz-completed-count').text(ayahPuzzleState.completedCount)
    $('#alfawz-streak-count').text(ayahPuzzleState.streak)
    $('#alfawz-best-time').text(
      ayahPuzzleState.bestTime ? formatTimeFromMs(ayahPuzzleState.bestTime) : '--:--'
    )
  }

  function updateHabitMessaging() {
    const today = new Date()
    const theme = AYAH_PUZZLE_THEMES[today.getDay()] || AYAH_PUZZLE_THEMES[0]
    const chipText = $('#alfawz-theme-chip .alfawz-theme-text')
    if (chipText.length) {
      chipText.text(theme.title)
    }
    $('#alfawz-habit-copy').text(theme.copy)
    ayahPuzzleState.todayKey = today.toISOString().slice(0, 10)
    updateUnlockStatusMessage()
  }

  function updateUnlockStatusMessage() {
    const unlockEl = $('#alfawz-unlock-status')
    if (!unlockEl.length) {
      return
    }

    const completed = ayahPuzzleState.completedCount
    let message = 'Solve 3 puzzles to unlock the Midweek Mosaic challenge.'
    if (completed >= 7) {
      message =
        'All weekly challenges unlocked! Keep your streak alive to reveal master puzzles.'
    } else if (completed >= 3) {
      message =
        'Midweek Mosaic unlocked! Solve 7 puzzles to reveal the Deep Dive weekender.'
    }

    if (ayahPuzzleState.streak >= 3) {
      message += ` You are on a ${ayahPuzzleState.streak}-day streak—bonus tiles await!`
    }

    unlockEl.text(message)
  }

  function bindGameControlButtons() {
    $('#alfawz-shuffle-puzzle')
      .off('click')
      .on('click', shufflePuzzlePieces)

    $('#alfawz-reset-puzzle')
      .off('click')
      .on('click', function() {
        const mode = $(this).data('mode') || 'reset'
        const defaultLabel = $(this).data('default-label') || 'Reset Board'
        if (mode === 'next') {
          $(this).data('mode', 'reset').text(defaultLabel)
          loadAyahPuzzle()
        } else {
          resetPuzzleBoard()
        }
      })

    $('#alfawz-check-puzzle')
      .off('click')
      .on('click', checkPuzzleOrder)

    $('#alfawz-puzzle-bank')
      .off('dragover drop')
      .on('dragover', handleBankDragOver)
      .on('drop', handleBankDrop)

    $('#alfawz-puzzle-board')
      .off('dblclick', '.alfawz-puzzle-piece')
      .on('dblclick', '.alfawz-puzzle-piece', function() {
        $('#alfawz-puzzle-bank').append(
          $(this).removeClass('in-slot is-correct is-wrong')
        )
        updatePlacementProgress()
        setPuzzleStatus('Tile returned to the bank.', 'info')
      })
  }

  function fetchSurahMetadata() {
    if (cachedSurahList) {
      return Promise.resolve(cachedSurahList)
    }

    return fetch(`${ALQURAN_API_BASE}surah`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'OK' && Array.isArray(data.data)) {
          cachedSurahList = data.data
          return cachedSurahList
        }
        throw new Error('Unable to load surah list')
      })
  }

  function loadAyahPuzzle() {
    if (!$('.alfawz-games').length) {
      return
    }

    disablePuzzleButtons(true)
    stopPuzzleTimer()
    ayahPuzzleState.isSolved = false
    const resetButton = $('#alfawz-reset-puzzle')
    if (resetButton.length) {
      const defaultLabel = resetButton.data('default-label') || 'Reset Board'
      resetButton.data('mode', 'reset').text(defaultLabel)
    }
    $('#alfawz-puzzle-reference').text('Gathering a new ayah…')
    $('#alfawz-puzzle-translation').text('')
    $('#alfawz-puzzle-bank').empty()
    $('#alfawz-puzzle-board').empty()
    updatePlacementProgress()
    setPuzzleStatus('Loading a fresh puzzle…', 'info')

    fetchSurahMetadata()
      .then(surahs => {
        const curated = surahs.filter(surah => surah.numberOfAyahs <= 40)
        const pool = curated.length ? curated : surahs
        const chosenSurah = pool[Math.floor(Math.random() * pool.length)]
        const verseNumber =
          Math.floor(Math.random() * chosenSurah.numberOfAyahs) + 1

        ayahPuzzleState.currentSurah = chosenSurah
        ayahPuzzleState.currentAyah = verseNumber

        return Promise.all([
          fetch(
            `${ALQURAN_API_BASE}ayah/${chosenSurah.number}:${verseNumber}/${ARABIC_EDITION}`
          ).then(res => res.json()),
          fetch(
            `${ALQURAN_API_BASE}ayah/${chosenSurah.number}:${verseNumber}/${ENGLISH_EDITION}`
          ).then(res => res.json()),
        ])
      })
      .then(([arabicData, translationData]) => {
        if (!arabicData || arabicData.status !== 'OK') {
          throw new Error('Invalid ayah response')
        }

        const verseText = cleanAyahText(arabicData.data && arabicData.data.text)
        const translationText =
          translationData && translationData.status === 'OK'
            ? translationData.data && translationData.data.text
            : ''

        if (!verseText) {
          throw new Error('Missing verse text')
        }

        buildPuzzlePieces(verseText)

        $('#alfawz-puzzle-reference').text(
          `Surah ${ayahPuzzleState.currentSurah.englishName} (${ayahPuzzleState.currentSurah.number}), Ayah ${ayahPuzzleState.currentAyah}`
        )

        if (translationText) {
          $('#alfawz-puzzle-translation').text(translationText)
        } else {
          $('#alfawz-puzzle-translation').text(
            'Translation unavailable at the moment.'
          )
        }

        beginPuzzleTimer()
        setPuzzleStatus('Arrange the tiles so the ayah reads in order.', 'info')
        disablePuzzleButtons(false)
      })
      .catch(error => {
        console.error('Error loading ayah puzzle:', error)
        setPuzzleStatus('We could not load a puzzle. Please try again.', 'error')
        disablePuzzleButtons(false)
      })
  }

  function buildPuzzlePieces(verseText) {
    const words = verseText.split(' ').filter(Boolean)
    if (!words.length) {
      setPuzzleStatus('Unable to build puzzle pieces for this ayah.', 'error')
      disablePuzzleButtons(false)
      return
    }

    const segments = []
    let index = 0
    while (index < words.length) {
      const remaining = words.length - index
      let chunkSize = remaining <= 3 ? remaining : Math.floor(Math.random() * 3) + 1
      if (remaining - chunkSize === 1) {
        chunkSize += 1
      }
      const segment = words.slice(index, index + chunkSize).join(' ')
      segments.push(segment)
      index += chunkSize
    }

    if (segments.length < 3 && words.length >= 3) {
      segments.length = 0
      words.forEach(word => segments.push(word))
    }

    ayahPuzzleState.correctOrder = segments
    ayahPuzzleState.pieces = segments.map((text, idx) => ({
      id: `piece-${Date.now()}-${idx}`,
      text,
      correctIndex: idx,
    }))

    const shuffledPieces = shuffleArray(ayahPuzzleState.pieces)
    const bank = $('#alfawz-puzzle-bank').empty()
    shuffledPieces.forEach(piece => {
      const element = $('<div class="alfawz-puzzle-piece" draggable="true"></div>')
        .attr('data-piece-id', piece.id)
        .attr('data-correct-index', piece.correctIndex)
        .text(piece.text)
      bank.append(element)
    })

    buildPuzzleSlots(segments.length)
    registerPuzzleInteractions()
    updatePlacementProgress()
  }

  function buildPuzzleSlots(count) {
    const board = $('#alfawz-puzzle-board').empty()
    for (let i = 0; i < count; i += 1) {
      const slot = $(
        `<div class="alfawz-puzzle-slot" data-slot="${i}">
          <span class="alfawz-slot-index">${i + 1}</span>
          <div class="alfawz-slot-dropzone" data-slot="${i}"></div>
        </div>`
      )
      board.append(slot)
    }
  }

  function registerPuzzleInteractions() {
    $('.alfawz-puzzle-piece')
      .off('dragstart dragend')
      .on('dragstart', handlePieceDragStart)
      .on('dragend', handlePieceDragEnd)

    $('.alfawz-slot-dropzone')
      .off('dragover dragleave drop')
      .on('dragover', handleSlotDragOver)
      .on('dragleave', handleSlotDragLeave)
      .on('drop', handleSlotDrop)
  }

  function handlePieceDragStart(event) {
    const piece = $(this)
    piece.addClass('dragging')
    event.originalEvent.dataTransfer.setData(
      'text/plain',
      piece.data('piece-id')
    )
  }

  function handlePieceDragEnd() {
    $(this).removeClass('dragging')
  }

  function handleSlotDragOver(event) {
    event.preventDefault()
    $(this).addClass('is-hovered')
  }

  function handleSlotDragLeave() {
    $(this).removeClass('is-hovered')
  }

  function handleSlotDrop(event) {
    event.preventDefault()
    const slot = $(this)
    slot.removeClass('is-hovered')
    const pieceId = event.originalEvent.dataTransfer.getData('text/plain')
    const piece = $(`.alfawz-puzzle-piece[data-piece-id='${pieceId}']`)
    if (!piece.length) {
      return
    }

    const displaced = slot.children('.alfawz-puzzle-piece')
    if (displaced.length) {
      $('#alfawz-puzzle-bank').append(
        displaced.removeClass('in-slot is-correct is-wrong')
      )
    }

    slot.append(piece.removeClass('is-correct is-wrong').addClass('in-slot'))
    updatePlacementProgress()
  }

  function handleBankDragOver(event) {
    event.preventDefault()
  }

  function handleBankDrop(event) {
    event.preventDefault()
    const pieceId = event.originalEvent.dataTransfer.getData('text/plain')
    const piece = $(`.alfawz-puzzle-piece[data-piece-id='${pieceId}']`)
    if (!piece.length) {
      return
    }

    $('#alfawz-puzzle-bank').append(
      piece.removeClass('in-slot is-correct is-wrong')
    )
    updatePlacementProgress()
  }

  function updatePlacementProgress() {
    const total = ayahPuzzleState.correctOrder.length
    const placed = $('#alfawz-puzzle-board .alfawz-slot-dropzone .alfawz-puzzle-piece').length
    const percentage = total === 0 ? 0 : Math.min((placed / total) * 100, 100)
    $('#alfawz-placement-progress').css('width', `${percentage}%`)
  }

  function shufflePuzzlePieces() {
    const bank = $('#alfawz-puzzle-bank')
    const pieces = bank.children('.alfawz-puzzle-piece').toArray()
    if (!pieces.length) {
      setPuzzleStatus('Move tiles back to the bank before shuffling.', 'info')
      return
    }

    const shuffled = shuffleArray(pieces)
    bank.empty()
    shuffled.forEach(piece => bank.append(piece))
    setPuzzleStatus('Tiles shuffled—trust your intuition.', 'info')
  }

  function resetPuzzleBoard() {
    const bank = $('#alfawz-puzzle-bank')
    $('#alfawz-puzzle-board .alfawz-slot-dropzone .alfawz-puzzle-piece').each(function() {
      bank.append($(this).removeClass('in-slot is-correct is-wrong'))
    })
    updatePlacementProgress()
    setPuzzleStatus('Board cleared. Try a new arrangement.', 'info')
  }

  function checkPuzzleOrder() {
    if (!ayahPuzzleState.correctOrder.length) {
      return
    }

    const dropzones = $('#alfawz-puzzle-board .alfawz-slot-dropzone')
    const total = ayahPuzzleState.correctOrder.length
    const filled = dropzones.filter(function() {
      return $(this).children('.alfawz-puzzle-piece').length > 0
    }).length

    if (filled < total) {
      setPuzzleStatus('Place all tiles on the board before checking.', 'error')
      return
    }

    let isCorrect = true
    dropzones.each(function(index) {
      const piece = $(this).children('.alfawz-puzzle-piece').first()
      const correctIndex = parseInt(piece.data('correct-index'), 10)
      if (correctIndex === index) {
        piece.removeClass('is-wrong').addClass('is-correct')
      } else {
        piece.removeClass('is-correct').addClass('is-wrong')
        isCorrect = false
      }
    })

    if (isCorrect) {
      handlePuzzleSolved(Date.now() - ayahPuzzleState.startTime)
    } else {
      setPuzzleStatus('Keep tuning the flow—highlighted tiles are out of place.', 'error')
    }
  }

  function handlePuzzleSolved(elapsedMs) {
    if (ayahPuzzleState.isSolved) {
      return
    }

    ayahPuzzleState.isSolved = true
    stopPuzzleTimer()
    setPuzzleStatus(
      `Beautiful! You rebuilt the ayah in ${formatTimeFromMs(elapsedMs)}.`,
      'success'
    )

    ayahPuzzleState.completedCount += 1
    setPuzzleStorage(
      AYAH_PUZZLE_STORAGE_KEYS.completed,
      ayahPuzzleState.completedCount
    )

    if (!ayahPuzzleState.bestTime || elapsedMs < ayahPuzzleState.bestTime) {
      ayahPuzzleState.bestTime = elapsedMs
      setPuzzleStorage(AYAH_PUZZLE_STORAGE_KEYS.bestTime, elapsedMs)
    }

    updatePuzzleStreak()
    updatePuzzleStatsUI()
    updateUnlockStatusMessage()

    disablePuzzleButtons(true)
    $('#alfawz-reset-puzzle')
      .prop('disabled', false)
      .data('mode', 'next')
      .text('Next Puzzle')
  }

  function updatePuzzleStreak() {
    const today = ayahPuzzleState.todayKey
    const last = ayahPuzzleState.lastCompletedDay

    if (!last) {
      ayahPuzzleState.streak = Math.max(1, ayahPuzzleState.streak || 0)
    } else if (last === today) {
      // Already counted for today
    } else {
      const diff = calculateDayDifference(last, today)
      if (diff === 1) {
        ayahPuzzleState.streak += 1
      } else if (diff > 1) {
        ayahPuzzleState.streak = 1
      } else {
        ayahPuzzleState.streak = Math.max(1, ayahPuzzleState.streak || 0)
      }
    }

    ayahPuzzleState.lastCompletedDay = today
    setPuzzleStorage(AYAH_PUZZLE_STORAGE_KEYS.streak, ayahPuzzleState.streak)
    setPuzzleStorage(AYAH_PUZZLE_STORAGE_KEYS.lastCompleted, today)
  }

  function beginPuzzleTimer() {
    if (ayahPuzzleState.timerInterval) {
      clearInterval(ayahPuzzleState.timerInterval)
    }

    ayahPuzzleState.startTime = Date.now()
    $('#alfawz-puzzle-timer').text('00:00')

    ayahPuzzleState.timerInterval = setInterval(() => {
      const elapsed = Date.now() - ayahPuzzleState.startTime
      $('#alfawz-puzzle-timer').text(formatTimeFromMs(elapsed))
    }, 1000)
  }

  function stopPuzzleTimer() {
    if (ayahPuzzleState.timerInterval) {
      clearInterval(ayahPuzzleState.timerInterval)
      ayahPuzzleState.timerInterval = null
    }
  }

  function setPuzzleStatus(message, tone = 'info') {
    const status = $('#alfawz-puzzle-status')
    if (!status.length) {
      return
    }

    status.removeClass('is-success is-error is-info')
    if (tone === 'success') {
      status.addClass('is-success')
    } else if (tone === 'error') {
      status.addClass('is-error')
    } else {
      status.addClass('is-info')
    }

    status.text(message)
  }

  function formatTimeFromMs(ms) {
    if (!ms || ms < 0) {
      return '00:00'
    }
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  function shuffleArray(items) {
    const array = [...items]
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
    return array
  }

  function calculateDayDifference(previous, current) {
    const previousDate = new Date(`${previous}T00:00:00`)
    const currentDate = new Date(`${current}T00:00:00`)
    const diffMs = currentDate.getTime() - previousDate.getTime()
    return Math.round(diffMs / (1000 * 60 * 60 * 24))
  }

  function disablePuzzleButtons(isDisabled) {
    $('#alfawz-shuffle-puzzle, #alfawz-check-puzzle, #alfawz-reset-puzzle').prop(
      'disabled',
      isDisabled
    )
  }

  function getPuzzleStorage(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key)
      }
    } catch (error) {
      console.warn('Ayah puzzle storage unavailable:', error)
    }
    return null
  }

  function setPuzzleStorage(key, value) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value)
      }
    } catch (error) {
      console.warn('Unable to persist ayah puzzle storage:', error)
    }
  }

  function cleanAyahText(text) {
    if (!text) {
      return ''
    }
    return text
      .replace(/[\u06d6-\u06ed]/g, '')
      .replace(/[ۖۗۚۛۙۘۚۛۜ۝﴾﴿]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // ========================================
  // GENERAL UTILITIES
  // ========================================
  function showNotification(message, type = "info") {
    let notificationClass = ""
    let icon = ""
    if (type === "success") {
      notificationClass = "alfawz-success-notification"
      icon = "✅"
    } else if (type === "error") {
      notificationClass = "alfawz-error-notification"
      icon = "❌"
    } else if (type === "hasanat") {
      notificationClass = "alfawz-hasanat-notification"
      icon = "⭐"
    } else {
      notificationClass = "alfawz-info-notification"
      icon = "ℹ️"
    }

    const notification = $(`
      <div class="alfawz-notification ${notificationClass}">
        <span class="alfawz-notification-icon">${icon}</span>
        <span class="alfawz-notification-message">${message}</span>
      </div>
    `)

    $("body").append(notification)

    setTimeout(() => {
      notification.addClass("show")
    }, 10)

    setTimeout(() => {
      notification.removeClass("show")
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }

  function startReadingTimer() {
    if ($(".alfawz-reader").length || $(".alfawz-memorizer").length) {
      readingStartTime = Date.now()
      readingTimer = setInterval(() => {
        const elapsed = Date.now() - readingStartTime
        const minutes = Math.floor(elapsed / 60000)
        const seconds = Math.floor((elapsed % 60000) / 1000)
        $("#session-time").text(`${minutes}m ${seconds}s`)
      }, 1000)
    } else {
      if (readingTimer) {
        clearInterval(readingTimer)
        readingTimer = null
      }
    }
  }

  function updateNavigationButtons() {
    const surahId = parseInt($("#reader-surah-select").val())
    const verseId = parseInt($("#reader-verse-select").val())
    const totalAyahs = $("#reader-surah-select option:selected").data("ayahs")

    $("#prev-verse-btn").prop("disabled", surahId === 1 && verseId === 1)
    $("#next-verse-btn").prop("disabled", surahId === 114 && verseId === totalAyahs)
  }

  // ========================================
  // QA'IDAH PRACTICE EXPERIENCE
  // ========================================

  function initializeQaidah() {
    initializeStudentQaidah()
    initializeTeacherQaidah()
  }

  function initializeStudentQaidah() {
    const $canvas = $('.alfawz-qaidah-canvas[data-qaidah-context="student"]')

    if (!$canvas.length) {
      return
    }

    const translate = window.wp && window.wp.i18n && typeof window.wp.i18n.__ === 'function' ? window.wp.i18n.__ : text => text
    const t = text => translate(text, 'alfawzquran')
    const $list = $('#qaidah-assignment-list')
    const $stage = $('#qaidah-stage')
    const urlParams = new URLSearchParams(window.location.search)
    const assignmentParam = parseInt(urlParams.get('assignment'), 10)
    const requestedAssignmentId = Number.isNaN(assignmentParam) ? null : assignmentParam
    const previewModeEnabled = urlParams.get('preview') === '1' && canPreviewQaidahBoards
    const previewBoardId = previewModeEnabled ? requestedAssignmentId : null
    let assignments = []
    let activeAssignmentId = null
    let activeAudio = null
    let previewBoard = null

    fetchAssignments()

    function fetchAssignments() {
      if (!alfawzData.isLoggedIn) {
        renderListMessage(t("Log in to access your Qa'idah assignments."))
        renderStageMessage(t("Please sign in to listen to your teacher's hotspots."))
        return
      }

      renderListLoading()

      $.ajax({
        url: `${alfawzData.apiUrl}qaidah/assignments`,
        method: 'GET',
        headers: {
          'X-WP-Nonce': alfawzData.nonce,
        },
      })
        .done(response => {
          assignments = Array.isArray(response) ? response : []
          renderAssignmentList()

          if (assignments.length) {
            const preferredAssignment = requestedAssignmentId ? assignments.find(item => item.id === requestedAssignmentId) : null

            if (preferredAssignment) {
              activateAssignment(preferredAssignment.id)
            } else if (previewModeEnabled && previewBoardId) {
              previewBoardAsTeacher(previewBoardId)
            } else {
              const firstAssignment = assignments[0]
              activateAssignment(firstAssignment.id)
            }
          } else if (previewModeEnabled && previewBoardId) {
            previewBoardAsTeacher(previewBoardId)
          } else {
            renderStageMessage(t("Your teacher has not shared any Qa'idah assignments yet."))
          }
        })
        .fail(() => {
          renderListMessage(t("We couldn't load your assignments right now."))

          if (previewModeEnabled && previewBoardId) {
            previewBoardAsTeacher(previewBoardId)
          } else {
            renderStageMessage(t('Please refresh the page or try again later.'))
          }
        })
    }

    function renderListLoading() {
      $list.html(`<div class="alfawz-qaidah-empty"><p>${t('Loading your assignments…')}</p></div>`)
    }

    function renderListMessage(message) {
      $list.html(`<div class="alfawz-qaidah-empty"><p>${message}</p></div>`)
    }

    function renderStageMessage(message) {
      stopHotspotAudio()
      $stage.html(`<div class="alfawz-qaidah-placeholder"><p>${message}</p></div>`)
    }

    function renderAssignmentList() {
      if (!assignments.length) {
        renderListMessage(t('No Qa\'idah assignments are available yet.'))
        return
      }

      $list.empty()

      assignments.forEach(assignment => {
        const $card = $('<article>', { class: 'alfawz-qaidah-assignment-card' })
          .toggleClass('is-active', assignment.id === activeAssignmentId)
          .append(
            $('<h4>', {
              class: 'alfawz-qaidah-assignment-title',
              text: assignment.title || t("Qa'idah assignment"),
            })
          )

        const $meta = $('<div>', { class: 'alfawz-qaidah-assignment-meta' })

        if (assignment.teacher && assignment.teacher.name) {
          $meta.append($('<span>').text(`👩‍🏫 ${assignment.teacher.name}`))
        }

        if (assignment.class && assignment.class.label) {
          $meta.append($('<span>').text(`🏷️ ${assignment.class.label}`))
        }

        if (assignment.updated) {
          $meta.append($('<span>').text(`🕒 ${formatAssignmentDate(assignment.updated)}`))
        }

        $card.append($meta)

        $card.on('click keypress', event => {
          if (event.type === 'click' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            activateAssignment(assignment.id)
          }
        })

        $card.attr('tabindex', 0)

        $list.append($card)
      })
    }

    function renderPreviewBoardList() {
      if (!previewBoard) {
        renderListMessage(t('We could not find that board for preview.'))
        return
      }

      const board = previewBoard
      const $card = $('<article>', { class: 'alfawz-qaidah-assignment-card is-active is-preview' })

      $('<span>', {
        class: 'alfawz-qaidah-badge',
        text: t('Teacher preview'),
      }).appendTo($card)

      $('<h4>', {
        class: 'alfawz-qaidah-assignment-title',
        text: board.title || t("Qa'idah board"),
      }).appendTo($card)

      const $meta = $('<div>', { class: 'alfawz-qaidah-assignment-meta' })

      if (board.teacher && board.teacher.name) {
        $meta.append($('<span>').text(`👩‍🏫 ${board.teacher.name}`))
      }

      if (board.class && board.class.label) {
        $meta.append($('<span>').text(`🏷️ ${board.class.label}`))
      }

      if (board.updated) {
        $meta.append($('<span>').text(`🕒 ${formatAssignmentDate(board.updated)}`))
      }

      if ($meta.children().length) {
        $card.append($meta)
      }

      $('<p>', {
        class: 'alfawz-qaidah-preview-helper',
        text: t('Students will only see this board after you share it with them.'),
      }).appendTo($card)

      const $actions = $('<div>', { class: 'alfawz-qaidah-preview-actions' })

      $('<button>', {
        type: 'button',
        class: 'alfawz-btn alfawz-btn-secondary alfawz-btn-small',
        text: t('Back to assignments'),
      })
        .on('click', exitPreviewMode)
        .appendTo($actions)

      $card.append($actions)

      $list.empty().append($card)
    }

    function exitPreviewMode() {
      try {
        const targetUrl = new URL(window.location.href)
        targetUrl.searchParams.delete('preview')
        targetUrl.searchParams.delete('assignment')
        window.location.href = targetUrl.toString()
      } catch (error) {
        const params = new URLSearchParams(window.location.search)
        params.delete('preview')
        params.delete('assignment')
        const query = params.toString()
        window.location.href = `${window.location.pathname}${query ? `?${query}` : ''}`
      }
    }

    function previewBoardAsTeacher(boardId) {
      if (!canPreviewQaidahBoards || !boardId) {
        renderStageMessage(t('Return to the teacher dashboard to select a different board.'))
        renderListMessage(t('Teacher preview is not available for this board.'))
        return
      }

      previewBoard = null
      renderListMessage(t('Loading teacher preview…'))
      renderStageMessage(t('Preparing your preview…'))

      $.ajax({
        url: `${alfawzData.apiUrl}qaidah/boards/${boardId}`,
        method: 'GET',
        data: { context: 'manage' },
        headers: {
          'X-WP-Nonce': alfawzData.nonce,
        },
      })
        .done(board => {
          if (!board || !board.id) {
            renderListMessage(t('We could not find that board for preview.'))
            renderStageMessage(t('Select a different board from the teacher dashboard.'))
            return
          }

          previewBoard = Object.assign({ preview: true }, board)
          activeAssignmentId = board.id
          renderPreviewBoardList()
          renderStage(previewBoard)
        })
        .fail(response => {
          const message = response?.responseJSON?.message || t('We could not open that board for preview.')
          renderListMessage(message)
          renderStageMessage(t('Reload this page from the teacher dashboard to try again.'))
        })
    }

    function activateAssignment(assignmentId) {
      const assignment = assignments.find(item => item.id === assignmentId)
      if (!assignment) {
        return
      }

      activeAssignmentId = assignmentId
      renderAssignmentList()
      renderStage(assignment)
    }

    function renderStage(assignment) {
      stopHotspotAudio()

      $stage.empty()

      const $header = $('<div>', { class: 'alfawz-qaidah-stage-header' })
      $('<h3>', { text: assignment.title || t("Qa'idah assignment") }).appendTo($header)

      if (assignment.description) {
        $('<p>', { class: 'alfawz-qaidah-stage-description', html: assignment.description }).appendTo($header)
      } else {
        $('<p>', { class: 'alfawz-qaidah-stage-description', text: t('Tap a hotspot to hear the model pronunciation.') }).appendTo($header)
      }

      if (assignment.preview) {
        $('<div>', {
          class: 'alfawz-qaidah-preview-notice',
          text: t("You are previewing this Qa'idah board as a teacher. Students will only see it once it has been shared with them."),
        }).appendTo($header)
      }

      const $meta = $('<div>', { class: 'alfawz-qaidah-stage-meta' })

      if (assignment.teacher && assignment.teacher.name) {
        $meta.append($('<span>').text(`👩‍🏫 ${assignment.teacher.name}`))
      }

      if (assignment.class && assignment.class.label) {
        $meta.append($('<span>').text(`🏷️ ${assignment.class.label}`))
      }

      if (assignment.updated) {
        $meta.append($('<span>').text(`🕒 ${formatAssignmentDate(assignment.updated)}`))
      }

      const $stageCanvas = $('<div>', { class: 'alfawz-qaidah-stage-canvas' })

      if (assignment.image && assignment.image.url) {
        const $image = $('<div>', { class: 'alfawz-qaidah-stage-image' })

        $('<img>', {
          src: assignment.image.url,
          alt: assignment.image.alt || assignment.title || t("Qa'idah assignment image"),
        }).appendTo($image)

        if (Array.isArray(assignment.hotspots) && assignment.hotspots.length) {
          assignment.hotspots.forEach(hotspot => {
            $image.append(createHotspotButton(hotspot))
          })
        } else {
          $image.append(
            $('<div>', {
              class: 'alfawz-qaidah-empty',
              html: `<p>${t('This assignment does not have any hotspots yet.')}</p>`,
            })
          )
        }

        $stageCanvas.append($image)
      } else {
        $stageCanvas.append(
          $('<div>', {
            class: 'alfawz-qaidah-empty',
            html: `<p>${t('This assignment is missing an image.')}</p>`,
          })
        )
      }

      $stage.empty().append($header, $meta, $stageCanvas)
    }

    function createHotspotButton(hotspot) {
      const label = hotspot.label || t("Qa'idah hotspot")
      const audioUrl = hotspot.audio_url || ''
      const x = clampPercentage(hotspot.x)
      const y = clampPercentage(hotspot.y)
      const width = clampPercentage(hotspot.width, 6)
      const height = clampPercentage(hotspot.height, 6)

      const $button = $('<button>', {
        type: 'button',
        class: 'alfawz-qaidah-hotspot',
        'aria-label': label,
      }).css({
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
      })

      $button.append($('<span>').text('▶'))

      if (!audioUrl) {
        $button.addClass('is-muted')
      }

      $button.on('click', event => {
        event.preventDefault()

        if (!audioUrl) {
          flashHotspot($button)
          return
        }

        playHotspotAudio(audioUrl, $button)
      })

      return $button
    }

    function playHotspotAudio(url, $button) {
      stopHotspotAudio()

      try {
        activeAudio = new Audio(url)
        $button.addClass('is-playing')

        activeAudio.addEventListener('ended', stopHotspotAudio)
        activeAudio.addEventListener('error', () => {
          flashHotspot($button)
          stopHotspotAudio()
        })

        activeAudio.play().catch(() => {
          flashHotspot($button)
          stopHotspotAudio()
        })
      } catch (error) {
        console.error("Unable to play Qa'idah hotspot", error)
        flashHotspot($button)
        stopHotspotAudio()
      }
    }

    function stopHotspotAudio() {
      if (activeAudio) {
        try {
          activeAudio.pause()
        } catch (error) {
          // Ignore pause errors
        }
        activeAudio = null
      }

      $stage.find('.alfawz-qaidah-hotspot').removeClass('is-playing')
    }

    function flashHotspot($button) {
      $button.addClass('is-error')
      window.setTimeout(() => $button.removeClass('is-error'), 600)
    }

    function clampPercentage(value, fallback = 0) {
      const numeric = typeof value === 'number' ? value : parseFloat(value)

      if (Number.isNaN(numeric)) {
        return fallback
      }

      return Math.max(0, Math.min(100, numeric))
    }

    function formatAssignmentDate(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      } catch (error) {
        return ''
      }
    }
  }

  function initializeTeacherQaidah() {
    const $module = $('.alfawz-qaidah-teacher[data-qaidah-context="teacher"]')

    if (!$module.length) {
      return
    }

    const translate = window.wp && window.wp.i18n && typeof window.wp.i18n.__ === 'function' ? window.wp.i18n.__ : text => text
    const t = text => translate(text, 'alfawzquran')
    const $boardSelect = $('#qaidah-teacher-board-select')
    const $classInput = $('#qaidah-teacher-class-id')
    const $studentsInput = $('#qaidah-teacher-students')
    const $descriptionInput = $('#qaidah-teacher-description')
    const $feedback = $('#qaidah-teacher-feedback')
    const $boardsList = $('#qaidah-teacher-boards-list')
    const $summaryTotal = $('#qaidah-total-boards')
    const $summaryClasses = $('#qaidah-active-classes')
    const $summaryStudents = $('#qaidah-student-count')
    const $refreshButton = $('#qaidah-refresh-boards')
    const $form = $('#qaidah-teacher-share-form')
    const adminManageUrl = $module.data('admin-url') || ''
    let boards = []
    let selectedBoardId = null
    let isSavingBoard = false

    if (!alfawzData.isLoggedIn) {
      showTeacherFeedback(t("Please log in to manage Qa'idah boards."), 'error')
      disableForm(true)
      $boardSelect.prop('disabled', true)
      return
    }

    $refreshButton.on('click', event => {
      event.preventDefault()
      fetchBoards(true)
    })

    $boardSelect.on('change', handleBoardSelection)
    $form.on('submit', handleBoardSubmit)

    fetchBoards()

    function fetchBoards(showMessage = false) {
      showTeacherFeedback(t('Loading boards…'), 'info')
      disableForm(true)
      $boardSelect.prop('disabled', true)

      $.ajax({
        url: `${alfawzData.apiUrl}qaidah/boards`,
        method: 'GET',
        data: { context: 'manage' },
        headers: {
          'X-WP-Nonce': alfawzData.nonce,
        },
      })
        .done(response => {
          boards = Array.isArray(response) ? response : []

          if (!boards.length) {
            selectedBoardId = null
          } else if (!selectedBoardId || !boards.some(board => board.id === selectedBoardId)) {
            selectedBoardId = boards[0].id
          }

          populateBoardSelect()
          renderBoardSummary()
          renderTeacherBoards()
          handleBoardSelection()

          const hasBoards = boards.length > 0
          disableForm(!hasBoards)
          $boardSelect.prop('disabled', !hasBoards)

          if (hasBoards) {
            showTeacherFeedback(showMessage ? t('Boards refreshed.') : '', 'success')
          } else {
            showTeacherFeedback(t("You haven't created any Qa'idah boards yet."), 'info')
          }
        })
        .fail(() => {
          showTeacherFeedback(t("We couldn't load your Qa'idah boards."), 'error')
          $boardsList.html(`<div class="alfawz-qaidah-empty"><p>${t("We couldn't load your Qa'idah boards.")}</p></div>`)
          populateBoardSelect(true)
        })
    }

    function populateBoardSelect(disableOnly = false) {
      $boardSelect.empty()

      if (disableOnly || !boards.length) {
        $boardSelect.append(`<option value="">${t('No boards available')}</option>`)
        return
      }

      $boardSelect.append(`<option value="">${t('Select a board')}</option>`)
      boards.forEach(board => {
        $boardSelect.append(`<option value="${board.id}">${board.title || t("Untitled Qa'idah board")}</option>`)
      })

      if (selectedBoardId) {
        $boardSelect.val(String(selectedBoardId))
      } else {
        $boardSelect.val('')
      }
    }

    function handleBoardSelection() {
      const value = parseInt($boardSelect.val(), 10)
      selectedBoardId = Number.isNaN(value) ? null : value

      if (!selectedBoardId) {
        resetFormFields()
        disableForm(boards.length === 0)
        return
      }

      const board = boards.find(item => item.id === selectedBoardId)
      if (!board) {
        resetFormFields()
        return
      }

      const classId = board.class && board.class.id ? board.class.id : ''
      $classInput.val(classId)

      const studentIds = Array.isArray(board.students) ? board.students.join(', ') : ''
      $studentsInput.val(studentIds)

      const descriptionText = board.description ? $('<div>').html(board.description).text() : ''
      $descriptionInput.val(descriptionText)

      disableForm(false)
    }

    function handleBoardSubmit(event) {
      event.preventDefault()

      if (isSavingBoard) {
        return
      }

      if (!selectedBoardId) {
        showTeacherFeedback(t('Select a board before saving.'), 'error')
        return
      }

      const classId = $classInput.val().trim()
      const description = $descriptionInput.val().trim()
      const rawStudents = $studentsInput.val().split(',')
      const studentIds = rawStudents
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !Number.isNaN(id) && id > 0)

      const payload = {
        class_id: classId,
        description,
        student_ids: studentIds,
      }

      isSavingBoard = true
      toggleSavingState(true)

      $.ajax({
        url: `${alfawzData.apiUrl}qaidah/boards/${selectedBoardId}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        headers: {
          'X-WP-Nonce': alfawzData.nonce,
        },
      })
        .done(board => {
          if (board && board.id) {
            boards = boards.map(item => (item.id === board.id ? board : item))
            renderBoardSummary()
            renderTeacherBoards()
            showTeacherFeedback(t('Sharing settings saved.'), 'success')
          } else {
            showTeacherFeedback(t('Board updated, but no data returned.'), 'info')
          }
        })
        .fail(response => {
          const message = response?.responseJSON?.message || t('Unable to update this board right now.')
          showTeacherFeedback(message, 'error')
        })
        .always(() => {
          isSavingBoard = false
          toggleSavingState(false)
        })
    }

    function renderBoardSummary() {
      $summaryTotal.text(boards.length)

      const classSet = new Set()
      let totalStudents = 0

      boards.forEach(board => {
        if (board.class && board.class.id) {
          classSet.add(board.class.id)
        }

        if (Array.isArray(board.students)) {
          totalStudents += board.students.length
        }
      })

      $summaryClasses.text(classSet.size)
      $summaryStudents.text(totalStudents)
    }

    function renderTeacherBoards() {
      $boardsList.empty()

      if (!boards.length) {
        $boardsList.html(`<div class="alfawz-qaidah-empty"><p>${t("Create a Qa'idah board in the builder to begin sharing assignments.")}</p></div>`)
        return
      }

      boards.forEach(board => {
        const $card = $('<article>', { class: 'alfawz-qaidah-teacher-card' })

        $('<h4>', {
          class: 'alfawz-qaidah-teacher-title',
          text: board.title || t("Untitled Qa'idah board"),
        }).appendTo($card)

        const $meta = $('<ul>', { class: 'alfawz-qaidah-teacher-meta' })
        if (board.class && board.class.label) {
          $('<li>', { text: `🏷️ ${board.class.label}` }).appendTo($meta)
        }
        const studentTotal = Array.isArray(board.students) ? board.students.length : 0
        $('<li>', { text: `🎯 ${studentTotal} ${studentTotal === 1 ? t('student') : t('students')}` }).appendTo($meta)

        if (board.updated) {
          $('<li>', { text: `🕒 ${formatBoardDate(board.updated)}` }).appendTo($meta)
        }
        $card.append($meta)

        if (Array.isArray(board.student_details) && board.student_details.length) {
          const $chips = $('<div>', { class: 'alfawz-qaidah-student-chips' })
          board.student_details.slice(0, 6).forEach(student => {
            $('<span>', { class: 'alfawz-chip', text: student.display || `ID ${student.id}` }).appendTo($chips)
          })

          if (board.student_details.length > 6) {
            $('<span>', { class: 'alfawz-chip alfawz-chip-more', text: `+${board.student_details.length - 6}` }).appendTo($chips)
          }

          $card.append($chips)
        }

        const $actions = $('<div>', { class: 'alfawz-qaidah-teacher-card-actions' })
        $('<button>', {
          type: 'button',
          class: 'alfawz-btn alfawz-btn-secondary alfawz-btn-small',
          text: t('Preview as student'),
        }).on('click', () => {
          if (!canPreviewQaidahBoards) {
            showTeacherFeedback(t('You do not have permission to preview Qa\'idah boards.'), 'error')
            return
          }

          const params = { assignment: board.id }
          if (canPreviewQaidahBoards) {
            params.preview = 1
          }

          navigateToPage('qaidah-student', params)
        }).appendTo($actions)

        if (adminManageUrl) {
          $('<a>', {
            class: 'alfawz-btn alfawz-btn-link alfawz-btn-small',
            href: `${adminManageUrl}&board=${board.id}`,
            text: t('Open in builder'),
          }).appendTo($actions)
        }

        $card.append($actions)
        $boardsList.append($card)
      })
    }

    function formatBoardDate(dateString) {
      try {
        return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      } catch (error) {
        return ''
      }
    }

    function showTeacherFeedback(message, type = 'info') {
      const classes = ['is-info', 'is-success', 'is-error']
      $feedback.removeClass(classes.join(' '))

      if (!message) {
        $feedback.text('')
        return
      }

      const className = type === 'error' ? 'is-error' : type === 'success' ? 'is-success' : 'is-info'
      $feedback.addClass(className).text(message)
    }

    function resetFormFields() {
      $classInput.val('')
      $studentsInput.val('')
      $descriptionInput.val('')
    }

    function disableForm(state) {
      $classInput.prop('disabled', state)
      $studentsInput.prop('disabled', state)
      $descriptionInput.prop('disabled', state)
      $form.find('button[type="submit"]').prop('disabled', state)
    }

    function toggleSavingState(state) {
      const $submit = $form.find('button[type="submit"]')

      if (state) {
        if (!$submit.data('original-text')) {
          $submit.data('original-text', $submit.text())
        }
        $submit.prop('disabled', true).text(t('Saving…'))
      } else {
        const original = $submit.data('original-text')
        $submit.prop('disabled', false)
        if (original) {
          $submit.text(original)
        }
      }
    }
  }


  function initializeBottomNavigation() {
    const $nav = $(".alfawz-bottom-navigation")

    if (!$nav.length) {
      return
    }

    const currentPage = ($nav.data("current-page") || "").toString()
    const activateItem = ($item) => {
      $nav.find(".alfawz-nav-item").removeClass("active").removeAttr("aria-current")
      $item.addClass("active").attr("aria-current", "page")
    }

    if (currentPage) {
      const $current = $nav.find(`.alfawz-nav-item[data-page="${currentPage}"]`).first()
      if ($current.length) {
        activateItem($current)
      }
    }

    if (!$nav.find(".alfawz-nav-item.active").length) {
      const locationPath = window.location.pathname.replace(/\/+$/, "").toLowerCase()
      $nav.find(".alfawz-nav-item").each(function() {
        const href = $(this).attr("href")
        if (!href) {
          return
        }

        const linkPath = new URL(href, window.location.origin).pathname.replace(/\/+$/, "").toLowerCase()
        if (linkPath === locationPath) {
          activateItem($(this))
          return false
        }
      })
    }

    let lastScrollTop = window.scrollY || 0
    let navHidden = false

    $(window).on("scroll", () => {
      const currentScrollTop = window.scrollY || 0

      if (currentScrollTop > lastScrollTop && currentScrollTop > 80) {
        if (!navHidden) {
          $nav.addClass("alfawz-nav-hidden")
          navHidden = true
        }
      } else if (navHidden || currentScrollTop <= 80) {
        $nav.removeClass("alfawz-nav-hidden")
        navHidden = false
      }

      lastScrollTop = currentScrollTop
    })
  }

  function initializeSwitches() {
    const updateSwitchState = (input) => {
      const $input = $(input)
      const $label = $input.closest(".alfawz-toggle-label")
      const $switchText = $label.find(".alfawz-switch")

      if (!$switchText.length) {
        return
      }

      const isChecked = $input.is(":checked")
      $switchText.toggleClass("on", isChecked)
      $switchText.toggleClass("off", !isChecked)
    }

    $(document).on("change", ".alfawz-toggle-label input[type='checkbox']", function() {
      updateSwitchState(this)
    })

    $(".alfawz-toggle-label input[type='checkbox']").each(function() {
      updateSwitchState(this)
    })
  }
})(jQuery)

;(($) => {
  // Get the correct API data from WordPress
  const alfawzData = window.alfawzData || {
    apiUrl: "/wp-json/alfawzquran/v1/",
    isLoggedIn: false,
    nonce: "12345",
  }

  // Use only alquran.cloud API
  const ALQURAN_API_BASE = 'https://api.alquran.cloud/v1/'
  const ARABIC_EDITION = alfawzData.defaultReciter || 'ar.alafasy'
  const ENGLISH_EDITION = alfawzData.defaultTranslation || 'en.sahih'

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
    initializeBottomNavigation()
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
                  <button class="alfawz-btn alfawz-btn-primary alfawz-btn-small" data-surah-id="${surah.id}" data-verse-id="1" id="read-daily-verse">
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
                window.location.href = `${alfawzData.pluginUrl}reader/?surah=${surahId}&verse=${verseId}`
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

  function initializeMemorizer() {
    if ($(".alfawz-memorizer").length) {
      loadSurahsIntoDropdown("#memo-surah-select")
      $("#memo-surah-select").on("change", handleMemoSurahSelectChange)
      $("#memo-verse-select").on("change", handleMemoVerseSelectChange)
      $("#load-memorization-verse").on("click", loadMemorizationVerse)
      $("#memo-play-audio").on("click", playMemorizationAudio)
      $("#repeat-verse-btn").on("click", incrementRepetition)
      $("#repeat-verse-btn-mobile").on("click", incrementRepetition)
      $("#memo-mark-memorized").on("click", markVerseAsMemorized)
      $("#memo-select-another").on("click", resetMemorizationSession)
      $("#continue-memorization").on("click", resetMemorizationSession)

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

    if (surahId) {
      fetch(`${ALQURAN_API_BASE}surah/${surahId}`)
        .then(response => response.json())
        .then(data => {
          if (data.status === "OK" && data.data.ayahs) {
            data.data.ayahs.forEach(ayah => {
              verseDropdown.append(`<option value="${ayah.number}">Verse ${ayah.number}</option>`)
            })
            verseDropdown.prop("disabled", false)
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

  function loadMemorizationVerse() {
    const surahId = $("#memo-surah-select").val()
    const verseId = $("#memo-verse-select").val()

    if (!surahId || !verseId) {
      showNotification("Please select a surah and verse to memorize.", "error")
      return
    }

    // Reset session for new verse
    repetitionCount = 0
    updateRepetitionDisplay()
    $("#repeat-verse-btn").removeClass("alfawz-repeat-completed").prop("disabled", false)
    $("#memo-mark-memorized").prop("disabled", false)

    $("#memo-quran-text").html('<div class="alfawz-loading-verse">Loading Arabic text...</div>')
    $("#memo-quran-translation").html('<div class="alfawz-loading-verse">Loading translation...</div>')
    $("#memo-verse-number").text(verseId)
    $("#session-verse-info").text(`Surah ${surahId}, Verse ${verseId}`)

    $(".alfawz-memorization-session").show()
    $("#load-memorization-verse").prop("disabled", true)
    $("#memo-surah-select").prop("disabled", true)
    $("#memo-verse-select").prop("disabled", true)

    // Fetch Arabic text
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

    // Fetch English translation
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

  function incrementRepetition() {
    if (!currentMemorizationVerse) {
      showNotification("Please load a verse to start repetitions.", "error")
      return
    }

    repetitionCount++
    updateRepetitionDisplay()
    showRepetitionFeedback()

    if (repetitionCount >= REPETITION_TARGET) {
      $("#repeat-verse-btn").addClass("alfawz-repeat-completed").prop("disabled", true)
      $("#repeat-verse-btn-mobile").addClass("alfawz-repeat-completed").prop("disabled", true)
      showNotification("Repetition target reached! You can now mark as memorized.", "success")
    }
  }

  function updateRepetitionDisplay() {
    $("#repetition-count").text(repetitionCount)
    $("#repetition-target").text(REPETITION_TARGET)
    $("#session-progress-text").text(`Repetitions: ${repetitionCount} / ${REPETITION_TARGET}`)

    const percentage = (repetitionCount / REPETITION_TARGET) * 100
    $("#repetition-progress-bar").css("width", `${percentage}%`)

    // Update progress markers
    const markersContainer = $(".alfawz-progress-markers")
    markersContainer.empty()
    for (let i = 1; i <= REPETITION_TARGET; i++) {
      const markerClass = i <= repetitionCount ? "alfawz-marker-completed" : ""
      markersContainer.append(`<div class="alfawz-progress-marker ${markerClass}"></div>`)
    }
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

  function markVerseAsMemorized() {
    if (!alfawzData.isLoggedIn) {
      showNotification("Please log in to mark verses as memorized.", "error")
      return
    }
    if (!currentMemorizationVerse) {
      showNotification("No verse loaded to mark as memorized.", "error")
      return
    }
    if (repetitionCount < REPETITION_TARGET) {
      showNotification(`Please complete ${REPETITION_TARGET} repetitions before marking as memorized.`, "error")
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
        surah_id: currentMemorizationVerse.surah_id,
        verse_id: currentMemorizationVerse.verse_id,
        progress_type: "memorized",
        hasanat: currentMemorizationVerse.hasanat,
        repetition_count: repetitionCount,
      },
      success: (response) => {
        if (response.success) {
          showCongratulationsModal(currentMemorizationVerse.hasanat)
          loadUserStats() // Update overall stats
          // Update plan progress if a plan is active
          const selectedPlanId = $("#memorization-plan-select").val()
          if (selectedPlanId) {
            loadMemorizationPlanProgress(selectedPlanId)
          }
        } else {
          showNotification(response.message || "Failed to mark verse as memorized.", "error")
          button.prop("disabled", false).text("Mark Memorized")
        }
      },
      error: (xhr, status, error) => {
        console.error("Error marking verse as memorized:", error)
        showNotification("Error marking verse as memorized. Please try again.", "error")
        button.prop("disabled", false).text("Mark Memorized")
      },
    })
  }

  function showCongratulationsModal(hasanatEarned) {
    $("#achievement-details").text(`+${hasanatEarned} Hasanat earned`)
    $("#congratulations-modal").fadeIn().find(".alfawz-modal-content").addClass("alfawz-modal-celebrate")
  }

  function resetMemorizationSession() {
    $("#congratulations-modal").fadeOut().find(".alfawz-modal-content").removeClass("alfawz-modal-celebrate")
    $(".alfawz-memorization-session").hide()
    $("#memo-surah-select").val("").prop("disabled", false)
    $("#memo-verse-select").empty().append('<option value="">Select surah first</option>').prop("disabled", true)
    $("#load-memorization-verse").prop("disabled", true)
    $("#selected-memo-verse-display").hide()
    currentMemorizationVerse = null
    repetitionCount = 0
    updateRepetitionDisplay()
    $("#repeat-verse-btn").removeClass("alfawz-repeat-completed").prop("disabled", false)
    $("#memo-mark-memorized").prop("disabled", false)
  }

  // Memorization Plan Revision Functions
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
                        <button class="alfawz-btn alfawz-btn-small alfawz-btn-secondary alfawz-preview-verse-btn" data-surah-id="${response.surah_id}" data-verse-id="${i}">
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
    window.location.href = `${alfawzData.pluginUrl}reader/?surah=${surahId}&verse=${verseId}`
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
      loadSurahsIntoDropdown("#plan-surah-select")
      $("#plan-surah-select").on("change", handlePlanSurahSelectChange)
      $("#create-plan-form").on("submit", createMemorizationPlan)
      $("#plan-name, #plan-surah-select, #plan-start-verse, #plan-end-verse, #plan-daily-goal").on("input change", updatePlanSummary)
      
      // Load existing plans on settings page
      loadExistingMemorizationPlans()
    }
  }

  function handlePlanSurahSelectChange() {
    const surahId = $(this).val()
    const startVerseDropdown = $("#plan-start-verse")
    const endVerseDropdown = $("#plan-end-verse")
    
    startVerseDropdown.empty().append('<option value="">Start Verse</option>').prop("disabled", true)
    endVerseDropdown.empty().append('<option value="">End Verse</option>').prop("disabled", true)

    if (surahId) {
      fetch(`${ALQURAN_API_BASE}surah/${surahId}`)
        .then(response => response.json())
        .then(data => {
          if (data.status === "OK" && data.data.ayahs) {
            data.data.ayahs.forEach(ayah => {
              startVerseDropdown.append(`<option value="${ayah.number}">Verse ${ayah.number}</option>`)
              endVerseDropdown.append(`<option value="${ayah.number}">Verse ${ayah.number}</option>`)
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
    const planName = $("#plan-name").val()
    const surahId = $("#plan-surah-select").val()
    const startVerse = $("#plan-start-verse").val()
    const endVerse = $("#plan-end-verse").val()
    const dailyGoal = $("#plan-daily-goal").val()

    const surahName = surahId ? $("#plan-surah-select option:selected").text().split('(')[0].trim() : "N/A"
    const totalVerses = (startVerse && endVerse) ? (parseInt(endVerse) - parseInt(startVerse) + 1) : 0

    let summaryText = ""
    if (planName && surahId && startVerse && endVerse && dailyGoal) {
      summaryText = `You are creating a plan "${planName}" to memorize Surah ${surahName} (Verses ${startVerse}-${endVerse}). This plan covers ${totalVerses} verses with a daily goal of ${dailyGoal} verses.`
      $("#create-plan-btn").prop("disabled", false)
    } else {
      summaryText = "Fill in all fields to see a summary of your memorization plan."
      $("#create-plan-btn").prop("disabled", true)
    }

    $("#plan-summary-text").text(summaryText)
  }

  function createMemorizationPlan(event) {
    event.preventDefault()

    if (!alfawzData.isLoggedIn) {
      showNotification("Please log in to create memorization plans.", "error")
      return
    }

    const planName = $("#plan-name").val()
    const surahId = $("#plan-surah-select").val()
    const startVerse = $("#plan-start-verse").val()
    const endVerse = $("#plan-end-verse").val()
    const dailyGoal = $("#plan-daily-goal").val()

    if (!planName || !surahId || !startVerse || !endVerse || dailyGoal) {
      showNotification("Please fill in all plan details.", "error")
      return
    }

    if (parseInt(startVerse) > parseInt(endVerse)) {
      showNotification("Start verse cannot be greater than end verse.", "error")
      return
    }

    const button = $("#create-plan-btn")
    button.prop("disabled", true).text("Creating...")

    $.ajax({
      url: alfawzData.apiUrl + "memorization-plans",
      method: "POST",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("X-WP-Nonce", alfawzData.nonce)
      },
      data: {
        plan_name: planName,
        surah_id: surahId,
        start_verse: startVerse,
        end_verse: endVerse,
        daily_goal: dailyGoal,
      },
      success: (response) => {
        if (response.success) {
          showNotification("Memorization plan created successfully!", "success")
          $("#create-plan-form")[0].reset() // Reset form
          updatePlanSummary() // Clear summary
          loadExistingMemorizationPlans() // Reload existing plans list
          loadMemorizationPlans() // Reload plans in memorizer dropdown
          $("#plan-created-success-message").fadeIn().delay(3000).fadeOut()
        } else {
          showNotification(response.message || "Failed to create plan.", "error")
        }
        button.prop("disabled", false).text("Create Plan")
      },
      error: (xhr, status, error) => {
        console.error("Error creating plan:", error)
        showNotification("Error creating plan. Please try again.", "error")
        button.prop("disabled", false).text("Create Plan")
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
                  <button class="alfawz-btn alfawz-btn-small alfawz-btn-primary alfawz-continue-plan-btn" data-plan-id="${plan.id}">
                    Continue Plan
                  </button>
                  <button class="alfawz-btn alfawz-btn-small alfawz-btn-secondary alfawz-delete-plan-btn" data-plan-id="${plan.id}">
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
            window.location.href = `${alfawzData.pluginUrl}memorizer/?plan=${planId}`
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
                <button class="alfawz-btn alfawz-btn-small alfawz-btn-secondary alfawz-view-bookmark-btn" data-surah-id="${bookmark.surah_id}" data-verse-id="${bookmark.verse_id}">
                  View
                </button>
                <button class="alfawz-btn alfawz-btn-small alfawz-btn-danger alfawz-delete-bookmark-btn" data-bookmark-id="${bookmark.id}">
                  Delete
                </button>
              </div>
            `)
          })
          $(".alfawz-view-bookmark-btn").on("click", function() {
            const surahId = $(this).data("surah-id")
            const verseId = $(this).data("verse-id")
            window.location.href = `${alfawzData.pluginUrl}reader/?surah=${surahId}&verse=${verseId}`
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
                  <button class="alfawz-btn alfawz-btn-small alfawz-btn-primary alfawz-continue-plan-btn" data-plan-id="${plan.id}">
                    Continue Plan
                  </button>
                  <button class="alfawz-btn alfawz-btn-small alfawz-btn-secondary alfawz-delete-plan-btn" data-plan-id="${plan.id}">
                    Delete
                  </button>
                </div>
              </div>
            `)
          })
          $(".alfawz-continue-plan-btn").on("click", function() {
            const planId = $(this).data("plan-id")
            window.location.href = `${alfawzData.pluginUrl}memorizer/?plan=${planId}`
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
  // BOTTOM NAVIGATION
  // ========================================
  function initializeBottomNavigation() {
    const currentPath = window.location.pathname
    $(".alfawz-nav-item").each(function() {
      const href = $(this).attr("href")
      if (currentPath.includes(href.replace(alfawzData.pluginUrl, ""))) {
        $(this).addClass("active")
      }
    })
  }
})(jQuery)

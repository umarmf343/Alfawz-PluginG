<?php
namespace AlfawzQuran\Frontend;

/**
 * Frontend functionality and shortcodes
 */
class Frontend {
    
    /**
     * Tracks the last shortcode that rendered content so the footer
     * navigation can highlight the active view.
     *
     * @var string|null
     */
    private $active_view = null;

    /**
     * Cached account page URL.
     *
     * @var string|null
     */
    private $account_page_url = null;

    public function __construct() {
        add_action('init', [$this, 'register_shortcodes']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('wp_head', [$this, 'add_meta_tags']);
        add_action('template_redirect', [$this, 'redirect_alfawz_pages_to_account']);
    }

    public function register_shortcodes() {
        add_shortcode('alfawz_dashboard', [$this, 'dashboard_shortcode']);
        add_shortcode('alfawz_reader', [$this, 'reader_shortcode']);
        add_shortcode('alfawz_memorizer', [$this, 'memorizer_shortcode']);
        add_shortcode('alfawz_memorization', [$this, 'memorizer_shortcode']);
        add_shortcode('alfawz_leaderboard', [$this, 'leaderboard_shortcode']);
        add_shortcode('alfawz_profile', [$this, 'profile_shortcode']);
        add_shortcode('alfawz_settings', [$this, 'settings_shortcode']);
        add_shortcode('alfawz_game', [$this, 'games_shortcode']);
        add_shortcode('alfawz_games', [$this, 'games_shortcode']);
        add_shortcode('alfawz_qaidah', [$this, 'qaidah_shortcode']);
        add_shortcode('alfawz_teacher_dashboard', [$this, 'teacher_dashboard_shortcode']);
        add_shortcode('alfawz_account', [$this, 'account_shortcode']);
    }

    public function enqueue_assets() {
        if ($this->is_alfawz_page()) {
            $rest_nonce = wp_create_nonce('wp_rest');
            $is_logged_in = is_user_logged_in();
            $current_user_id = get_current_user_id();

            // Tailwind via CDN keeps the plugin lightweight and avoids build tooling.
            wp_enqueue_style(
                'alfawz-tailwind',
                'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
                [],
                '2.2.19'
            );

            wp_enqueue_style(
                'alfawz-frontend',
                ALFAWZQURAN_PLUGIN_URL . 'assets/css/frontend.css',
                ['alfawz-tailwind'],
                ALFAWZQURAN_VERSION
            );

            wp_enqueue_script(
                'alfawz-frontend',
                ALFAWZQURAN_PLUGIN_URL . 'assets/js/frontend.js',
                [],
                ALFAWZQURAN_VERSION,
                true
            );

            wp_enqueue_script(
                'alfawz-routine',
                ALFAWZQURAN_PLUGIN_URL . 'assets/js/alfawz-routine.js',
                [],
                ALFAWZQURAN_VERSION,
                true
            );

            wp_enqueue_script(
                'alfawz-memorization',
                ALFAWZQURAN_PLUGIN_URL . 'assets/js/alfawz-memorization.js',
                [],
                ALFAWZQURAN_VERSION,
                true
            );

            wp_enqueue_script(
                'alfawz-recitation',
                ALFAWZQURAN_PLUGIN_URL . 'assets/js/alfawz-recitation.js',
                [ 'alfawz-memorization' ],
                ALFAWZQURAN_VERSION,
                true
            );

            $reader_url = home_url('/reader/');
            if (function_exists('alfawz_get_bottom_nav_url')) {
                $resolved_reader = \alfawz_get_bottom_nav_url('reader');
                if (! empty($resolved_reader)) {
                    $reader_url = $resolved_reader;
                }
            }

            wp_localize_script('alfawz-frontend', 'alfawzData', [
                'apiUrl' => rest_url('alfawzquran/v1/'),
                'nonce' => $rest_nonce,
                'userId' => $current_user_id,
                'isLoggedIn' => $is_logged_in,
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'pluginUrl' => ALFAWZQURAN_PLUGIN_URL,
                'readerUrl' => $reader_url,
                'memorizerUrl' => home_url('/alfawz-memorizer/'),
                'hasanatPerLetter' => get_option('alfawz_hasanat_per_letter', 10),
                'dailyTarget' => get_option('alfawz_daily_verse_target', 10),
                'defaultReciter' => get_option('alfawz_default_reciter', 'ar.alafasy'),
                'defaultTranslation' => get_option('alfawz_default_translation', 'en.sahih'),
                'defaultTransliteration' => get_option('alfawz_default_transliteration', 'en.transliteration'),
                'enableLeaderboard' => (bool) get_option('alfawz_enable_leaderboard', 1),
                'userPreferences' => $this->get_user_preferences_for_script(),
                'strings' => [
                    'settingsSaved' => __('Preferences updated!', 'alfawzquran'),
                    'settingsError' => __('Unable to save preferences. Please try again.', 'alfawzquran'),
                    'profileSaved' => __('Profile updated!', 'alfawzquran'),
                    'profileError' => __('Unable to update profile. Please try again.', 'alfawzquran'),
                    'profileNameMissing' => __('Please add your full name before saving.', 'alfawzquran'),
                    'gamePanelLoadError' => __('We could not load your quest data. Please refresh to try again.', 'alfawzquran'),
                    'gamePanelCompletedLabel' => __('Completed', 'alfawzquran'),
                    'gamePanelVersesLabel' => __('Verses', 'alfawzquran'),
                    'gamePanelEggComplete' => __('Takbir! The egg is hatching—keep soaring!', 'alfawzquran'),
                    'gamePanelEggInProgress' => __('Recite to fill the egg with radiant knowledge.', 'alfawzquran'),
                    'gamePanelRewardAwaiting' => __('Divine Reward Awaiting', 'alfawzquran'),
                    'gamePanelLevelLabel' => __('Level', 'alfawzquran'),
                    'gamePanelBadgeSingular' => __('badge unlocked', 'alfawzquran'),
                    'gamePanelBadgePlural' => __('badges unlocked', 'alfawzquran'),
                ],
            ]);

            $timezone_string = function_exists('wp_timezone_string') ? wp_timezone_string() : get_option('timezone_string');
            if (empty($timezone_string) && function_exists('wp_timezone')) {
                $timezone = wp_timezone();
                $timezone_string = $timezone instanceof \DateTimeZone ? $timezone->getName() : '';
            }

            if (empty($timezone_string)) {
                $timezone_string = 'UTC';
            }

            wp_localize_script('alfawz-routine', 'alfawzRoutineData', [
                'timezone'  => $timezone_string,
                'gmtOffset' => get_option('gmt_offset', 0),
            ]);

            wp_localize_script('alfawz-memorization', 'alfawzMemoData', [
                'apiUrl' => rest_url('alfawzquran/v1/'),
                'nonce' => $rest_nonce,
                'isLoggedIn' => $is_logged_in,
                'defaultTranslation' => get_option('alfawz_default_translation', 'en.sahih'),
                'defaultTransliteration' => get_option('alfawz_default_transliteration', 'en.transliteration'),
                'selectSurahLabel' => __('Select a surah', 'alfawzquran'),
                'surahErrorMessage' => __('Unable to load surahs right now.', 'alfawzquran'),
                'formValidationMessage' => __('Please select a surah and valid ayah range.', 'alfawzquran'),
                'rangeErrorMessage' => __('End ayah must be greater than start ayah.', 'alfawzquran'),
                'creatingPlanMessage' => __('Creating plan…', 'alfawzquran'),
                'planCreatedMessage' => __('Plan created! Loading your first verse…', 'alfawzquran'),
                'planCreateError' => __('Unable to create plan. Please try again.', 'alfawzquran'),
                'noPlanMessage' => __('Create your first plan to begin memorizing.', 'alfawzquran'),
                'planLoadError' => __('Unable to load your memorization plan.', 'alfawzquran'),
                'planCompleteMessage' => __('All verses in this plan are memorized. Create a new plan to continue.', 'alfawzquran'),
                'progressErrorMessage' => __('Unable to save progress. Please try again.', 'alfawzquran'),
                'verseErrorMessage' => __('Unable to load verse details right now.', 'alfawzquran'),
                'readyMessage' => __('Takbir! You may progress to the next ayah.', 'alfawzquran'),
                'remainingLabel' => __('repetitions remaining.', 'alfawzquran'),
                'hideTranslationLabel' => __('Hide translation', 'alfawzquran'),
                'showTranslationLabel' => __('Show translation', 'alfawzquran'),
                'versesLabel' => __('Verses', 'alfawzquran'),
                'repetitionLabel' => __('Repetitions', 'alfawzquran'),
            ]);

            wp_localize_script('alfawz-recitation', 'alfawzRecitationData', [
                'apiUrl' => rest_url('alfawzquran/v1/'),
                'nonce' => $rest_nonce,
                'isLoggedIn' => $is_logged_in,
                'enabled' => (bool) get_option('alfawz_enable_recitation_assistant', 1),
                'endpoints' => [
                    'analyze' => rest_url('alfawzquran/v1/recitations/analyze'),
                    'history' => rest_url('alfawzquran/v1/recitations/history'),
                    'snippets' => rest_url('alfawzquran/v1/recitations/snippets'),
                ],
                'strings' => [
                    'coachTitle' => __('AI Recitation Coach', 'alfawzquran'),
                    'startLabel' => __('Begin listening', 'alfawzquran'),
                    'stopLabel' => __('Stop listening', 'alfawzquran'),
                    'unsupported' => __('Your browser does not support speech recognition. Try Chrome or Edge on desktop.', 'alfawzquran'),
                    'permissionDenied' => __('Microphone access was blocked. Enable it in your browser settings and try again.', 'alfawzquran'),
                    'audioCaptureError' => __('We could not access your microphone. Check your device and try again.', 'alfawzquran'),
                    'networkError' => __('Speech recognition is temporarily unavailable. Check your connection and try again.', 'alfawzquran'),
                    'interrupted' => __('Speech recognition was interrupted. Tap begin listening to try again.', 'alfawzquran'),
                    'noSpeech' => __('We did not capture your voice. Try again.', 'alfawzquran'),
                    'pending' => __('Listening… recite the ayah clearly.', 'alfawzquran'),
                    'processing' => __('Analysing your recitation…', 'alfawzquran'),
                    'idle' => __('Tap begin listening when you are ready to recite.', 'alfawzquran'),
                    'scoreLabel' => __('Accuracy score', 'alfawzquran'),
                    'historyTitle' => __('Recent sessions', 'alfawzquran'),
                    'mistakeTitle' => __('Focus insights', 'alfawzquran'),
                    'snippetsTitle' => __('Tarteel-style snippets', 'alfawzquran'),
                    'retryLabel' => __('Try again', 'alfawzquran'),
                    'viewHistoryLabel' => __('View last reviews', 'alfawzquran'),
                    'noMistakes' => __('Flawless! Keep reinforcing this ayah daily.', 'alfawzquran'),
                ],
            ]);
        }

        if ($this->current_page_uses_shortcode('alfawz_qaidah')) {
            wp_enqueue_media();

            wp_enqueue_script(
                'alfawz-qaidah',
                ALFAWZQURAN_PLUGIN_URL . 'assets/js/alfawz-qaidah.js',
                [],
                ALFAWZQURAN_VERSION,
                true
            );

            wp_localize_script('alfawz-qaidah', 'alfawzQaidahData', [
                'apiUrl'         => rest_url('alfawzquran/v1/'),
                'nonce'          => wp_create_nonce('wp_rest'),
                'userId'         => get_current_user_id(),
                'isTeacher'      => $this->current_user_is_teacher(),
                'strings'        => [
                    'loading'        => __('Loading…', 'alfawzquran'),
                    'uploadError'    => __('Upload failed. Please try again.', 'alfawzquran'),
                    'recordError'    => __('Unable to access microphone. You can upload audio files instead.', 'alfawzquran'),
                    'recording'      => __('Recording…', 'alfawzquran'),
                    'saving'         => __('Saving assignment…', 'alfawzquran'),
                    'saved'          => __('Assignment sent successfully.', 'alfawzquran'),
                    'saveError'      => __('Assignment could not be saved. Please review the form and try again.', 'alfawzquran'),
                    'noAssignments'  => __('No assignments yet.', 'alfawzquran'),
                    'noStudents'     => __('No students available for this class.', 'alfawzquran'),
                    'firstHotspot'   => __('Click the image to add your first hotspot.', 'alfawzquran'),
                    'hotspotRequired'=> __('Add at least one hotspot before sending.', 'alfawzquran'),
                    'playbackError'  => __('Unable to play this audio clip.', 'alfawzquran'),
                    'editing'        => __('Editing existing assignment.', 'alfawzquran'),
                    'editError'      => __('Unable to load assignment. Please try again.', 'alfawzquran'),
                    'updateAssignment' => __('Update assignment', 'alfawzquran'),
                    'recordButton'   => __('Record Audio', 'alfawzquran'),
                    'playButton'     => __('Play', 'alfawzquran'),
                    'uploadButton'   => __('Upload Audio', 'alfawzquran'),
                    'hotspotTitle'   => __('Hotspot', 'alfawzquran'),
                    'openLesson'     => __('Open Lesson', 'alfawzquran'),
                    'fromLabel'      => __('From', 'alfawzquran'),
                    'stopRecording'  => __('Stop', 'alfawzquran'),
                    'newBadge'       => __('New', 'alfawzquran'),
                ],
                'mediaSettings' => [
                    'title'  => __('Select Qa’idah Image', 'alfawzquran'),
                    'button' => __('Use this image', 'alfawzquran'),
                ],
            ]);
        }

        if (
            $this->current_page_uses_shortcode('alfawz_game')
            || $this->current_page_uses_shortcode('alfawz_games')
        ) {
            wp_enqueue_script(
                'alfawz-games',
                ALFAWZQURAN_PLUGIN_URL . 'assets/js/alfawz-games.js',
                [ 'alfawz-frontend' ],
                ALFAWZQURAN_VERSION,
                true
            );
        }

        if ($this->current_page_uses_shortcode('alfawz_teacher_dashboard')) {
            wp_enqueue_media();

            wp_enqueue_script(
                'alfawz-qaidah',
                ALFAWZQURAN_PLUGIN_URL . 'assets/js/alfawz-qaidah.js',
                [],
                ALFAWZQURAN_VERSION,
                true
            );

            wp_localize_script('alfawz-qaidah', 'alfawzQaidahData', [
                'apiUrl'         => rest_url('alfawzquran/v1/'),
                'nonce'          => wp_create_nonce('wp_rest'),
                'userId'         => get_current_user_id(),
                'isTeacher'      => $this->current_user_is_teacher(),
                'strings'        => [
                    'loading'        => __('Loading…', 'alfawzquran'),
                    'uploadError'    => __('Upload failed. Please try again.', 'alfawzquran'),
                    'recordError'    => __('Unable to access microphone. You can upload audio files instead.', 'alfawzquran'),
                    'recording'      => __('Recording…', 'alfawzquran'),
                    'saving'         => __('Saving assignment…', 'alfawzquran'),
                    'saved'          => __('Assignment sent successfully.', 'alfawzquran'),
                    'saveError'      => __('Assignment could not be saved. Please review the form and try again.', 'alfawzquran'),
                    'noAssignments'  => __('No assignments yet.', 'alfawzquran'),
                    'noStudents'     => __('No students available for this class.', 'alfawzquran'),
                    'firstHotspot'   => __('Click the image to add your first hotspot.', 'alfawzquran'),
                    'hotspotRequired'=> __('Add at least one hotspot before sending.', 'alfawzquran'),
                    'playbackError'  => __('Unable to play this audio clip.', 'alfawzquran'),
                    'editing'        => __('Editing existing assignment.', 'alfawzquran'),
                    'editError'      => __('Unable to load assignment. Please try again.', 'alfawzquran'),
                    'updateAssignment' => __('Update assignment', 'alfawzquran'),
                    'recordButton'   => __('Record Audio', 'alfawzquran'),
                    'playButton'     => __('Play', 'alfawzquran'),
                    'uploadButton'   => __('Upload Audio', 'alfawzquran'),
                    'hotspotTitle'   => __('Hotspot', 'alfawzquran'),
                    'openLesson'     => __('Open Lesson', 'alfawzquran'),
                    'fromLabel'      => __('From', 'alfawzquran'),
                    'stopRecording'  => __('Stop', 'alfawzquran'),
                    'newBadge'       => __('New', 'alfawzquran'),
                ],
                'mediaSettings' => [
                    'title'  => __('Select Qa’idah Image', 'alfawzquran'),
                    'button' => __('Use this image', 'alfawzquran'),
                ],
            ]);

            $qaidah_url = '';
            if (function_exists('alfawz_get_bottom_nav_url')) {
                $qaidah_url = alfawz_get_bottom_nav_url('qaidah');
            }
            if (empty($qaidah_url)) {
                $qaidah_url = home_url(trailingslashit('alfawz-qaidah'));
            }

            wp_enqueue_script(
                'alfawz-teacher',
                ALFAWZQURAN_PLUGIN_URL . 'assets/js/alfawz-teacher.js',
                [],
                ALFAWZQURAN_VERSION,
                true
            );

            wp_localize_script('alfawz-teacher', 'alfawzTeacherData', [
                'apiUrl'      => rest_url('alfawzquran/v1/'),
                'nonce'       => wp_create_nonce('wp_rest'),
                'teacherId'   => get_current_user_id(),
                'qaidahUrl'   => $qaidah_url,
                'strings'     => [
                    'loading'              => __('Loading…', 'alfawzquran'),
                    'noAssignments'        => __('No Qa’idah assignments yet.', 'alfawzquran'),
                    'noClasses'            => __('No classes assigned to you yet.', 'alfawzquran'),
                    'noPlans'              => __('No memorisation plans found yet.', 'alfawzquran'),
                    'noStudents'           => __('No students found for this class.', 'alfawzquran'),
                    'viewAssignment'       => __('View', 'alfawzquran'),
                    'editAssignment'       => __('Edit', 'alfawzquran'),
                    'statusSent'           => __('Sent', 'alfawzquran'),
                    'statusDraft'          => __('Draft', 'alfawzquran'),
                    'updatedLabel'         => __('Updated', 'alfawzquran'),
                    'studentsLabel'        => __('Students', 'alfawzquran'),
                    'activePlansLabel'     => __('Active plans', 'alfawzquran'),
                    'memorizedVersesLabel' => __('Verses memorized', 'alfawzquran'),
                    'streakLabel'          => __('Day streak', 'alfawzquran'),
                    'streakNeedsAttention' => __('Needs encouragement', 'alfawzquran'),
                    'assignmentLoadError'  => __('Unable to load this assignment. Please try again.', 'alfawzquran'),
                    'assignmentPreviewError' => __('Preview unavailable for this assignment.', 'alfawzquran'),
                    'modalTitle'           => __('Assignment preview', 'alfawzquran'),
                    'builderOpening'       => __('Opening assignment builder…', 'alfawzquran'),
                    'builderReady'         => __('Assignment builder ready.', 'alfawzquran'),
                    'classesLabel'         => __('classes', 'alfawzquran'),
                    'studentsUnit'         => __('students', 'alfawzquran'),
                    'assignmentCountLabel' => __('assignments sent', 'alfawzquran'),
                    'memoCountLabel'       => __('students tracked', 'alfawzquran'),
                    'classActiveLabel'     => __('Active', 'alfawzquran'),
                    'recentActivityEmpty'  => __('No recent activity yet. Student updates will appear here.', 'alfawzquran'),
                    'assignmentFallback'   => __('Qa’idah assignment', 'alfawzquran'),
                    'memorizedVersesUnit'  => __('verses memorised', 'alfawzquran'),
                    'activePlansUnit'      => __('active memorisation plans', 'alfawzquran'),
                ],
            ]);
        }
    }
    
    public function add_meta_tags() {
        if ($this->is_alfawz_page()) {
            echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">' . "\n";
            echo '<meta name="description" content="AlfawzQuran - Read, memorize and track your Quran progress">' . "\n";
        }
    }

    public function redirect_alfawz_pages_to_account() {
        if (is_admin() || wp_doing_ajax()) {
            return;
        }

        if (defined('REST_REQUEST') && REST_REQUEST) {
            return;
        }

        if (!$this->is_alfawz_page()) {
            return;
        }

        if ($this->is_account_page_request()) {
            return;
        }

        if (!is_user_logged_in()) {
            $this->redirect_to_account_page('', true);
            return;
        }

        if ($this->current_user_is_admin()) {
            return;
        }

        $access_requirement = $this->determine_page_access_requirement();

        if ('teacher' === $access_requirement && !$this->current_user_is_teacher()) {
            $this->redirect_to_account_page('restricted');
        }

        if ('student' === $access_requirement && $this->current_user_is_teacher()) {
            $this->redirect_to_account_page('restricted');
        }
    }
    
    private function is_alfawz_page() {
        global $post;

        if (!$post) {
            return false;
        }

        $alfawz_shortcodes = [
            'alfawz_dashboard',
            'alfawz_reader',
            'alfawz_memorizer',
            'alfawz_leaderboard',
            'alfawz_profile',
            'alfawz_settings',
            'alfawz_game',
            'alfawz_games',
            'alfawz_qaidah',
            'alfawz_teacher_dashboard',
            'alfawz_account'
        ];

        foreach ($alfawz_shortcodes as $shortcode) {
            if (has_shortcode($post->post_content, $shortcode)) {
                return true;
            }
        }

        return false;
    }

    private function is_account_page_request() {
        global $post;

        if (!$post) {
            return false;
        }

        return has_shortcode($post->post_content, 'alfawz_account');
    }

    private function current_page_uses_shortcode($shortcode) {
        global $post;

        if (! $post instanceof \WP_Post) {
            return false;
        }

        return has_shortcode($post->post_content, $shortcode);
    }

    public function dashboard_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        $this->active_view = 'dashboard';

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/dashboard.php';
        return ob_get_clean();
    }

    public function reader_shortcode($atts) {
        $this->active_view = 'reader';
        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/reader.php';
        return ob_get_clean();
    }

    public function memorizer_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        $this->active_view = 'memorizer';

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/memorizer.php';
        return ob_get_clean();
    }

    public function leaderboard_shortcode($atts) {
        if (!get_option('alfawz_enable_leaderboard')) {
            return '<div class="alfawz-notice">' . __('Leaderboard is currently disabled.', 'alfawzquran') . '</div>';
        }

        $this->active_view = 'leaderboard';

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/leaderboard.php';
        return ob_get_clean();
    }

    public function profile_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        $this->active_view = 'profile';

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/profile.php';
        return ob_get_clean();
    }

    public function settings_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        $this->active_view = 'settings';

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/settings.php';
        return ob_get_clean();
    }

    public function games_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        $this->active_view = 'games';

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/games.php';
        return ob_get_clean();
    }

    public function qaidah_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        $this->active_view = 'qaidah';

        ob_start();
        $qaidah_role = $this->determine_qaidah_role();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/qaidah.php';
        return ob_get_clean();
    }

    public function account_shortcode($atts) {
        $this->active_view = 'account';

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/account.php';
        return ob_get_clean();
    }

    public function teacher_dashboard_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        if (!current_user_can('manage_options') && !current_user_can('alfawz_teacher')) {
            return '<div class="alfawz-login-required"><div class="alfawz-login-card"><h3>' . esc_html__('Access denied.', 'alfawzquran') . '</h3><p>' . esc_html__('This dashboard is reserved for Alfawz teachers.', 'alfawzquran') . '</p></div></div>';
        }

        $this->active_view = 'teacher-dashboard';

        $qaidah_page_link = '';
        if (function_exists('alfawz_get_bottom_nav_url')) {
            $qaidah_page_link = alfawz_get_bottom_nav_url('qaidah');
        }

        if (empty($qaidah_page_link)) {
            $qaidah_page_link = home_url(trailingslashit('alfawz-qaidah'));
        }

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/teacher-dashboard.php';
        return ob_get_clean();
    }

    private function determine_qaidah_role() {
        if ($this->current_user_is_teacher()) {
            return 'teacher';
        }

        return 'student';
    }

    private function get_user_preferences_for_script() {
        if (!is_user_logged_in()) {
            return [];
        }

        $defaults = [
            'default_reciter'         => get_option('alfawz_default_reciter', 'ar.alafasy'),
            'default_translation'     => get_option('alfawz_default_translation', 'en.sahih'),
            'default_transliteration' => get_option('alfawz_default_transliteration', 'en.transliteration'),
            'hasanat_per_letter'      => (int) get_option('alfawz_hasanat_per_letter', 10),
            'daily_verse_target'      => (int) get_option('alfawz_daily_verse_target', 10),
            'enable_leaderboard'      => (bool) get_option('alfawz_enable_leaderboard', 1),
        ];

        $user_id = get_current_user_id();
        $meta_map = [
            'default_reciter'         => 'alfawz_pref_default_reciter',
            'default_translation'     => 'alfawz_pref_default_translation',
            'default_transliteration' => 'alfawz_pref_default_transliteration',
            'hasanat_per_letter'      => 'alfawz_pref_hasanat_per_letter',
            'daily_verse_target'      => 'alfawz_pref_daily_target',
            'enable_leaderboard'      => 'alfawz_pref_enable_leaderboard',
        ];

        $preferences = [];

        foreach ($meta_map as $key => $meta_key) {
            $value = get_user_meta($user_id, $meta_key, true);

            if ('' === $value || null === $value) {
                $preferences[$key] = $defaults[$key];
                continue;
            }

            if ('enable_leaderboard' === $key) {
                $preferences[$key] = (bool) $value;
            } elseif (in_array($key, ['hasanat_per_letter', 'daily_verse_target'], true)) {
                $preferences[$key] = (int) $value;
            } else {
                $preferences[$key] = $value;
            }
        }

        return $preferences;
    }

    private function current_user_is_teacher() {
        if (!is_user_logged_in()) {
            return false;
        }

        if (current_user_can('manage_options')) {
            return true;
        }

        $user = wp_get_current_user();

        if (in_array('teacher', (array) $user->roles, true)) {
            return true;
        }

        return current_user_can('edit_posts');
    }

    private function current_user_is_admin() {
        return is_user_logged_in() && current_user_can('manage_options');
    }

    private function determine_page_access_requirement() {
        $teacher_shortcodes = [
            'alfawz_teacher_dashboard',
        ];

        foreach ($teacher_shortcodes as $shortcode) {
            if ($this->current_page_uses_shortcode($shortcode)) {
                return 'teacher';
            }
        }

        $student_shortcodes = [
            'alfawz_dashboard',
            'alfawz_reader',
            'alfawz_memorizer',
            'alfawz_memorization',
            'alfawz_leaderboard',
            'alfawz_profile',
            'alfawz_settings',
            'alfawz_game',
            'alfawz_games',
        ];

        foreach ($student_shortcodes as $shortcode) {
            if ($this->current_page_uses_shortcode($shortcode)) {
                return 'student';
            }
        }

        return null;
    }

    private function redirect_to_account_page($notice = '', $preserve_redirect = false) {
        $account_url = $this->get_account_page_url();

        if (empty($account_url)) {
            return;
        }

        if (!empty($notice)) {
            $account_url = add_query_arg('alfawz_notice[]', $notice, $account_url);
        }

        if ($preserve_redirect) {
            $current_url = $this->get_current_page_url();
            $current_url = wp_validate_redirect($current_url, '');

            if (!empty($current_url)) {
                $account_url = add_query_arg('redirect_to', $current_url, $account_url);
            }
        }

        wp_safe_redirect($account_url);
        exit;
    }

    private function get_current_page_url() {
        $permalink = get_permalink();

        if (!empty($permalink)) {
            return $permalink;
        }

        if (isset($GLOBALS['wp']) && $GLOBALS['wp'] instanceof \WP) {
            $request = $GLOBALS['wp']->request;

            if (!empty($request)) {
                return home_url(trailingslashit($request));
            }
        }

        return home_url('/');
    }
    
    private function login_required_message() {
        $login_url = $this->get_account_page_url();

        if (!empty($login_url)) {
            $current_url = get_permalink();

            if (!empty($current_url)) {
                $login_url = add_query_arg('redirect_to', $current_url, $login_url);
            }
        } else {
            $login_url = wp_login_url(get_permalink());
        }

        $can_register = function_exists('wp_registration_enabled')
            ? wp_registration_enabled()
            : (bool) get_option('users_can_register');
        $register_url = $can_register ? wp_registration_url() : '';

        ob_start();
        ?>
        <div class="alfawz-login-required">
            <div class="alfawz-login-card">
                <div class="alfawz-login-icon">🔒</div>
                <h3><?php _e('Login Required', 'alfawzquran'); ?></h3>
                <p><?php _e('Please log in to access this feature and track your Quran reading progress.', 'alfawzquran'); ?></p>
                <div class="alfawz-login-actions">
                    <a href="<?php echo esc_url($login_url); ?>" class="alfawz-btn alfawz-btn-primary">
                        <?php _e('Login', 'alfawzquran'); ?>
                    </a>
                    <?php if ($register_url): ?>
                        <a href="<?php echo esc_url($register_url); ?>" class="alfawz-btn alfawz-btn-secondary">
                            <?php _e('Register', 'alfawzquran'); ?>
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    public function redirect_wp_login_page() {
        if ('GET' !== $_SERVER['REQUEST_METHOD'] || wp_doing_ajax()) {
            return;
        }

        if (isset($_REQUEST['interim-login'])) {
            return;
        }

        $action = isset($_REQUEST['action']) ? sanitize_key(wp_unslash($_REQUEST['action'])) : '';
        $allowed_actions = apply_filters(
            'alfawz_account_allowed_login_actions',
            ['lostpassword', 'retrievepassword', 'resetpass', 'rp', 'logout', 'confirm_admin_email', 'postpass']
        );

        if (in_array($action, $allowed_actions, true)) {
            return;
        }

        $account_url = $this->get_account_page_url();

        if (empty($account_url)) {
            return;
        }

        $requested_admin_access = false;

        if (isset($_GET['redirect_to'])) {
            $raw_redirect_to = wp_unslash($_GET['redirect_to']);
            $raw_redirect_to = is_string($raw_redirect_to) ? rawurldecode($raw_redirect_to) : '';
            $redirect_path = wp_parse_url($raw_redirect_to, PHP_URL_PATH);

            if (is_string($redirect_path) && false !== strpos($redirect_path, 'wp-admin')) {
                $requested_admin_access = true;
            }
        }

        if (!$requested_admin_access && isset($_SERVER['REQUEST_URI'])) {
            $request_uri = wp_unslash($_SERVER['REQUEST_URI']);
            $request_path = wp_parse_url($request_uri, PHP_URL_PATH);

            if (is_string($request_path) && false !== strpos($request_path, 'wp-admin')) {
                $requested_admin_access = true;
            }
        }

        if ($requested_admin_access) {
            return;
        }

        $notices = [];

        if (isset($_GET['redirect_to'])) {
            $redirect_to = wp_unslash($_GET['redirect_to']);
            $redirect_to = is_string($redirect_to) ? rawurldecode($redirect_to) : '';
            $redirect_to = wp_validate_redirect($redirect_to, '');

            if (!empty($redirect_to)) {
                $account_url = add_query_arg('redirect_to', $redirect_to, $account_url);
            }
        }

        if (isset($_GET['reauth'])) {
            $notices[] = 'reauth';
        }

        if (isset($_GET['checkemail'])) {
            $checkemail = sanitize_key(wp_unslash($_GET['checkemail']));

            if ('confirm' === $checkemail) {
                $notices[] = 'check_email';
            } elseif ('registered' === $checkemail) {
                $notices[] = 'registration';
            }
        }

        if (isset($_GET['resetpass'])) {
            $notices[] = 'password_reset';
        }

        if (!empty($notices)) {
            foreach ($notices as $notice) {
                $account_url = add_query_arg('alfawz_notice[]', $notice, $account_url);
            }
        }

        wp_safe_redirect($account_url);
        exit;
    }

    public function handle_login_failure($username) {
        if (wp_doing_ajax()) {
            return;
        }

        $account_url = $this->get_account_page_url();

        if (empty($account_url)) {
            return;
        }

        $account_url = add_query_arg('alfawz_notice[]', 'login_failed', $account_url);

        if (isset($_REQUEST['redirect_to'])) {
            $redirect_to = wp_unslash($_REQUEST['redirect_to']);
            $redirect_to = is_string($redirect_to) ? rawurldecode($redirect_to) : '';
            $redirect_to = wp_validate_redirect($redirect_to, '');

            if (!empty($redirect_to)) {
                $account_url = add_query_arg('redirect_to', $redirect_to, $account_url);
            }
        }

        wp_safe_redirect($account_url);
        exit;
    }

    public function redirect_non_admin_dashboard() {
        if (!is_admin() || wp_doing_ajax() || (defined('DOING_CRON') && DOING_CRON)) {
            return;
        }

        if (!is_user_logged_in() || current_user_can('manage_options')) {
            return;
        }

        $script = isset($_SERVER['PHP_SELF']) ? wp_basename(wp_unslash($_SERVER['PHP_SELF'])) : '';
        $bypass_scripts = ['admin-ajax.php', 'admin-post.php', 'async-upload.php'];

        if (in_array($script, $bypass_scripts, true)) {
            return;
        }

        $account_url = $this->get_account_page_url();

        if (empty($account_url)) {
            return;
        }

        $account_url = add_query_arg('alfawz_notice[]', 'restricted', $account_url);

        wp_safe_redirect($account_url);
        exit;
    }

    private function get_account_page_url() {
        if (null !== $this->account_page_url) {
            return $this->account_page_url;
        }

        $page_id = (int) get_option('alfawz_account_page_id');

        if ($page_id > 0) {
            $url = get_permalink($page_id);

            if (!empty($url)) {
                $this->account_page_url = $url;
                return $this->account_page_url;
            }
        }

        $candidates = apply_filters('alfawz_account_page_slugs', ['alfawz-account', 'account', 'my-account']);

        foreach ($candidates as $slug) {
            $page = get_page_by_path($slug);

            if ($page instanceof \WP_Post) {
                $url = get_permalink($page);

                if (!empty($url)) {
                    $this->account_page_url = $url;
                    return $this->account_page_url;
                }
            }
        }

        $default = home_url(trailingslashit('alfawz-account'));
        $this->account_page_url = apply_filters('alfawz_account_page_url', $default);

        return $this->account_page_url;
    }

}

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

    public function __construct() {
        add_action('init', [$this, 'register_shortcodes']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('wp_head', [$this, 'add_meta_tags']);
    }

    public function register_shortcodes() {
        add_shortcode('alfawz_dashboard', [$this, 'dashboard_shortcode']);
        add_shortcode('alfawz_reader', [$this, 'reader_shortcode']);
        add_shortcode('alfawz_memorizer', [$this, 'memorizer_shortcode']);
        add_shortcode('alfawz_memorization', [$this, 'memorizer_shortcode']);
        add_shortcode('alfawz_leaderboard', [$this, 'leaderboard_shortcode']);
        add_shortcode('alfawz_profile', [$this, 'profile_shortcode']);
        add_shortcode('alfawz_settings', [$this, 'settings_shortcode']);
        add_shortcode('alfawz_games', [$this, 'games_shortcode']);
        add_shortcode('alfawz_qaidah', [$this, 'qaidah_shortcode']);
        add_shortcode('alfawz_teacher_dashboard', [$this, 'teacher_dashboard_shortcode']);
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
                'alfawz-memorization',
                ALFAWZQURAN_PLUGIN_URL . 'assets/js/alfawz-memorization.js',
                [],
                ALFAWZQURAN_VERSION,
                true
            );

            wp_localize_script('alfawz-frontend', 'alfawzData', [
                'apiUrl' => rest_url('alfawzquran/v1/'),
                'nonce' => $rest_nonce,
                'userId' => $current_user_id,
                'isLoggedIn' => $is_logged_in,
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'pluginUrl' => ALFAWZQURAN_PLUGIN_URL,
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
                ],
            ]);

            wp_localize_script('alfawz-memorization', 'alfawzMemoData', [
                'apiUrl' => rest_url('alfawzquran/v1/'),
                'nonce' => $rest_nonce,
                'isLoggedIn' => $is_logged_in,
                'defaultTranslation' => get_option('alfawz_default_translation', 'en.sahih'),
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
                    'stopRecording'  => __('Stop', 'alfawzquran'),
                    'newBadge'       => __('New', 'alfawzquran'),
                ],
                'mediaSettings' => [
                    'title'  => __('Select Qa’idah Image', 'alfawzquran'),
                    'button' => __('Use this image', 'alfawzquran'),
                ],
            ]);
        }

        if ($this->current_page_uses_shortcode('alfawz_games')) {
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
            'alfawz_games',
            'alfawz_qaidah',
            'alfawz_teacher_dashboard'
        ];

        foreach ($alfawz_shortcodes as $shortcode) {
            if (has_shortcode($post->post_content, $shortcode)) {
                return true;
            }
        }

        return false;
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
    
    private function login_required_message() {
        $login_url  = wp_login_url(get_permalink());
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

}

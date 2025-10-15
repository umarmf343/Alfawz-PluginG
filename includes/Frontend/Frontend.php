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
        add_action('wp_footer', [$this, 'render_bottom_navigation']);
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
        add_shortcode('alfawz_qaidah_teacher', [$this, 'qaidah_teacher_shortcode']);
        add_shortcode('alfawz_qaidah_student', [$this, 'qaidah_student_shortcode']);
    }
    
    public function enqueue_assets() {
        if ($this->is_alfawz_page()) {
            $rest_nonce = wp_create_nonce('wp_rest');
            $is_logged_in = is_user_logged_in();
            $current_user_id = get_current_user_id();

            // Tailwind via CDN keeps the plugin lightweight and avoids build tooling.
            wp_enqueue_style(
                'alfawz-tailwind',
                'https://cdn.jsdelivr.net/npm/tailwindcss@3.4.13/dist/tailwind.min.css',
                [],
                '3.4.13'
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
                'hasanatPerLetter' => get_option('alfawz_hasanat_per_letter', 10),
                'dailyTarget' => get_option('alfawz_daily_verse_target', 10),
                'defaultReciter' => get_option('alfawz_default_reciter', 'ar.alafasy'),
                'defaultTranslation' => get_option('alfawz_default_translation', 'en.sahih'),
                'defaultTransliteration' => get_option('alfawz_default_transliteration', 'en.transliteration')
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
            'alfawz_qaidah_teacher',
            'alfawz_qaidah_student'
        ];

        foreach ($alfawz_shortcodes as $shortcode) {
            if (has_shortcode($post->post_content, $shortcode)) {
                return true;
            }
        }

        return false;
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

    public function qaidah_teacher_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        $this->active_view = 'qaidah';

        ob_start();
        $qaidah_role = 'teacher';
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/qaidah.php';
        return ob_get_clean();
    }

    public function qaidah_student_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        $this->active_view = 'qaidah';

        ob_start();
        $qaidah_role = 'student';
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/qaidah.php';
        return ob_get_clean();
    }
    
    private function login_required_message() {
        $login_url = wp_login_url(get_permalink());
        $register_url = wp_registration_enabled() ? wp_registration_url() : '';

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

    public function render_bottom_navigation() {
        if (!$this->active_view) {
            return;
        }

        $current_page = $this->active_view;
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/mobile-nav.php';
    }
}

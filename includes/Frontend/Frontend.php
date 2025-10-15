<?php
namespace AlfawzQuran\Frontend;

/**
 * Frontend functionality and shortcodes
 */
class Frontend {
    public function __construct() {
        add_action('init', [$this, 'register_shortcodes']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('wp_head', [$this, 'add_meta_tags']);
        add_action('wp_footer', [$this, 'render_mobile_navigation']);
    }

    public function register_shortcodes() {
        add_shortcode('alfawz_dashboard', [$this, 'dashboard_shortcode']);
        add_shortcode('alfawz_reader', [$this, 'reader_shortcode']);
        add_shortcode('alfawz_memorization', [$this, 'memorization_shortcode']);
        add_shortcode('alfawz_memorizer', [$this, 'memorization_shortcode']);
        add_shortcode('alfawz_leaderboard', [$this, 'leaderboard_shortcode']);
        add_shortcode('alfawz_profile', [$this, 'profile_shortcode']);
        add_shortcode('alfawz_settings', [$this, 'settings_shortcode']);
        add_shortcode('alfawz_games', [$this, 'games_shortcode']);
        add_shortcode('alfawz_qaidah_student', [$this, 'qaidah_student_shortcode']);
        add_shortcode('alfawz_qaidah_teacher', [$this, 'qaidah_teacher_shortcode']);
        add_shortcode('alfawz_qaidah', [$this, 'qaidah_student_shortcode']);
    }

    public function enqueue_assets() {
        if (!$this->is_alfawz_page()) {
            return;
        }

        wp_enqueue_style(
            'alfawz-tailwind',
            'https://cdn.jsdelivr.net/npm/tailwindcss@3.4.4/dist/tailwind.min.css',
            [],
            ALFAWZQURAN_VERSION
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
            ['jquery'],
            ALFAWZQURAN_VERSION,
            true
        );

        $localized_roles        = [];
        $can_preview_qaidah     = false;

        if (is_user_logged_in()) {
            $current_user      = wp_get_current_user();
            $localized_roles   = $current_user instanceof \WP_User ? (array) $current_user->roles : [];
            $can_preview_qaidah = current_user_can('manage_options')
                || current_user_can('edit_posts')
                || in_array('teacher', $localized_roles, true);
        }

        wp_localize_script('alfawz-frontend', 'alfawzData', [
            'apiUrl'             => rest_url('alfawzquran/v1/'),
            'nonce'              => wp_create_nonce('wp_rest'),
            'userId'             => get_current_user_id(),
            'isLoggedIn'         => is_user_logged_in(),
            'ajaxUrl'            => admin_url('admin-ajax.php'),
            'pluginUrl'          => ALFAWZQURAN_PLUGIN_URL,
            'hasanatPerLetter'   => get_option('alfawz_hasanat_per_letter', 10),
            'dailyTarget'        => get_option('alfawz_daily_verse_target', 10),
            'defaultReciter'     => get_option('alfawz_default_reciter', 'ar.alafasy'),
            'defaultTranslation' => get_option('alfawz_default_translation', 'en.sahih'),
            'pages'              => $this->get_page_urls(),
            'roles'              => $localized_roles,
            'canPreviewQaidahBoards' => $can_preview_qaidah,
        ]);
    }

    public function add_meta_tags() {
        if (!$this->is_alfawz_page()) {
            return;
        }

        echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">' . "\n";
        echo '<meta name="description" content="AlfawzQuran - Read, memorize and track your Quran progress">' . "\n";
    }

    public function dashboard_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/dashboard.php';
        return ob_get_clean();
    }

    public function reader_shortcode($atts) {
        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/reader.php';
        return ob_get_clean();
    }

    public function memorization_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/memorization.php';
        return ob_get_clean();
    }

    public function qaidah_student_shortcode($atts) {
        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/qaidah-student.php';
        return ob_get_clean();
    }

    public function qaidah_teacher_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        if (!current_user_can('manage_options') && !in_array('teacher', (array) wp_get_current_user()->roles, true)) {
            return '<div class="alfawz-notice">' . __("You do not have permission to manage Qa'idah assignments.", 'alfawzquran') . '</div>';
        }

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/qaidah-teacher.php';
        return ob_get_clean();
    }

    public function leaderboard_shortcode($atts) {
        if (!get_option('alfawz_enable_leaderboard')) {
            return '<div class="alfawz-notice">' . __('Leaderboard is currently disabled.', 'alfawzquran') . '</div>';
        }

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/leaderboard.php';
        return ob_get_clean();
    }

    public function profile_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/profile.php';
        return ob_get_clean();
    }

    public function settings_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/settings.php';
        return ob_get_clean();
    }

    public function games_shortcode($atts) {
        if (!is_user_logged_in()) {
            return $this->login_required_message();
        }

        ob_start();
        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/games.php';
        return ob_get_clean();
    }

    public function render_mobile_navigation() {
        if (!$this->is_alfawz_page()) {
            return;
        }

        $current_page = $this->determine_current_view_slug();
        $alfawz_nav_roles = is_user_logged_in() ? (array) wp_get_current_user()->roles : [];

        include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/mobile-nav.php';
    }

    private function determine_current_view_slug() {
        global $post;

        if (!$post instanceof \WP_Post) {
            return '';
        }

        foreach ($this->get_shortcode_slug_map() as $shortcode => $slug) {
            if (has_shortcode($post->post_content, $shortcode)) {
                return $slug;
            }
        }

        return '';
    }

    private function is_alfawz_page() {
        global $post;

        if (!$post instanceof \WP_Post) {
            return false;
        }

        foreach (array_keys($this->get_shortcode_slug_map()) as $shortcode) {
            if (has_shortcode($post->post_content, $shortcode)) {
                return true;
            }
        }

        return false;
    }

    private function get_shortcode_slug_map() {
        return [
            'alfawz_dashboard'      => 'dashboard',
            'alfawz_reader'         => 'reader',
            'alfawz_memorization'   => 'memorization',
            'alfawz_memorizer'      => 'memorization',
            'alfawz_leaderboard'    => 'leaderboard',
            'alfawz_profile'        => 'profile',
            'alfawz_settings'       => 'settings',
            'alfawz_games'          => 'games',
            'alfawz_qaidah_student' => 'qaidah-student',
            'alfawz_qaidah_teacher' => 'qaidah-teacher',
            'alfawz_qaidah'         => 'qaidah-student',
        ];
    }

    private function get_page_urls() {
        $slugs = [
            'dashboard',
            'reader',
            'memorization',
            'leaderboard',
            'profile',
            'settings',
            'games',
            'qaidah-student',
            'qaidah-teacher',
        ];

        $urls = [];

        foreach ($slugs as $slug) {
            $urls[$slug] = $this->get_page_url($slug);
        }

        return $urls;
    }

    private function get_page_url($slug) {
        $candidates = [
            $slug,
            'alfawz-' . $slug,
        ];

        foreach ($candidates as $path) {
            $page = get_page_by_path($path);
            if ($page instanceof \WP_Post) {
                return get_permalink($page);
            }
        }

        return home_url(trailingslashit($slug));
    }

    private function login_required_message() {
        $login_url    = wp_login_url(get_permalink());
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
                    <?php if ($register_url) : ?>
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

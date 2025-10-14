<?php
namespace AlfawzQuran\Admin;

use AlfawzQuran\Core\Environment;

/**
 * Admin-specific functionality
 */
class Admin {

    public function __construct() {
        // Constructor can be used for initialization if needed
    }

    /**
     * Display admin notices that inform the site owner about connectivity issues.
     */
    public function display_api_connection_notice() {
        $messages = [];

        $api_notice = get_transient( 'alfawz_quran_api_notice' );
        if ( ! empty( $api_notice ) ) {
            $messages[] = $api_notice;
        }

        $environment_warnings = Environment::get_warnings();
        if ( ! empty( $environment_warnings ) ) {
            $messages = array_merge( $messages, $environment_warnings );
        }

        if ( empty( $messages ) ) {
            return;
        }

        foreach ( $messages as $message ) {
            printf(
                '<div class="notice notice-error"><p>%s</p></div>',
                wp_kses_post( $message )
            );
        }
    }

    /**
     * Add admin menu pages.
     */
    public function add_admin_menu() {
        add_menu_page(
            __( 'AlfawzQuran Dashboard', 'alfawzquran' ),
            __( 'AlfawzQuran', 'alfawzquran' ),
            'manage_options',
            'alfawz-quran',
            [ $this, 'display_admin_dashboard' ],
            'dashicons-book-alt',
            20
        );

        add_submenu_page(
            'alfawz-quran',
            __( 'Settings', 'alfawzquran' ),
            __( 'Settings', 'alfawzquran' ),
            'manage_options',
            'alfawz-quran-settings',
            [ $this, 'display_admin_settings' ]
        );
    }

    /**
     * Display the admin dashboard page.
     */
    public function display_admin_dashboard() {
        include ALFAWZQURAN_PLUGIN_PATH . 'admin/partials/dashboard.php';
    }

    /**
     * Display the admin settings page.
     */
    public function display_admin_settings() {
        include ALFAWZQURAN_PLUGIN_PATH . 'admin/partials/settings.php';
    }

    /**
     * Enqueue admin-specific assets.
     */
    public function enqueue_admin_assets() {
        if ( isset( $_GET['page'] ) && strpos( $_GET['page'], 'alfawz-quran' ) !== false ) {
            wp_enqueue_style(
                'alfawz-admin-style',
                ALFAWZQURAN_PLUGIN_URL . 'assets/css/admin.css',
                [],
                ALFAWZQURAN_VERSION
            );

            wp_enqueue_script(
                'alfawz-admin-script',
                ALFAWZQURAN_PLUGIN_URL . 'assets/js/admin.js',
                ['jquery'],
                ALFAWZQURAN_VERSION,
                true
            );

            wp_localize_script('alfawz-admin-script', 'alfawzAdminData', [
                'apiUrl' => rest_url('alfawzquran/v1/'),
                'nonce' => wp_create_nonce('wp_rest'),
            ]);
        }
    }

    /**
     * Periodically check whether the environment can perform required HTTPS requests.
     */
    public function maybe_recheck_environment() {
        Environment::maybe_recheck();
    }
}

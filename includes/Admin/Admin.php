<?php
namespace AlfawzQuran\Admin;

/**
 * Admin-specific functionality
 */
class Admin {

    public function __construct() {
        // Constructor can be used for initialization if needed
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
}

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
     * Display admin notices that inform the site owner about connectivity issues.
     */
    public function display_api_connection_notice() {
        $notices = array_filter([
            get_transient( 'alfawz_quran_api_notice' ),
            get_transient( 'alfawz_wp_org_connection_warning' ),
        ]);

        if ( empty( $notices ) ) {
            return;
        }

        foreach ( $notices as $notice ) {
            $type    = 'error';
            $message = $notice;

            if ( is_array( $notice ) ) {
                $type    = ! empty( $notice['type'] ) ? $notice['type'] : 'error';
                $message = isset( $notice['message'] ) ? $notice['message'] : '';

                if ( ! empty( $notice['details'] ) ) {
                    $message .= ' ' . sprintf(
                        /* translators: %s: Original error message returned by WordPress. */
                        __( 'Reported error: %s', 'alfawzquran' ),
                        $notice['details']
                    );
                }
            }

            if ( empty( $message ) ) {
                continue;
            }

            $class = 'notice notice-' . sanitize_html_class( $type );

            printf(
                '<div class="%1$s"><p>%2$s</p></div>',
                esc_attr( $class ),
                esc_html( $message )
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

        if ( $this->user_can_manage_boards() ) {
            add_submenu_page(
                'alfawz-quran',
                __( "Qa'idah Boards", 'alfawzquran' ),
                __( "Qa'idah Boards", 'alfawzquran' ),
                'edit_posts',
                'alfawz-qaidah-boards',
                [ $this, 'display_qaidah_boards' ]
            );
        }
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
     * Display the Qa'idah board management page.
     */
    public function display_qaidah_boards() {
        include ALFAWZQURAN_PLUGIN_PATH . 'admin/partials/qaidah-boards.php';
    }

    /**
     * Enqueue admin-specific assets.
     */
    public function enqueue_admin_assets() {
        if ( isset( $_GET['page'] ) && strpos( sanitize_key( wp_unslash( $_GET['page'] ) ), 'alfawz-quran' ) !== false ) {
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

            if ( isset( $_GET['page'] ) && 'alfawz-qaidah-boards' === sanitize_key( wp_unslash( $_GET['page'] ) ) ) {
                wp_enqueue_media();
            }

            wp_localize_script('alfawz-admin-script', 'alfawzAdminData', [
                'apiUrl'           => rest_url('alfawzquran/v1/'),
                'nonce'            => wp_create_nonce('wp_rest'),
                'currentUserId'    => get_current_user_id(),
                'canManageBoards'  => $this->user_can_manage_boards(),
                'strings'          => [
                    'boardSaved'    => __( 'Qa\'idah board saved successfully.', 'alfawzquran' ),
                    'boardDeleted'  => __( 'Qa\'idah board deleted successfully.', 'alfawzquran' ),
                    'confirmDelete' => __( 'Are you sure you want to delete this board?', 'alfawzquran' ),
                ],
            ]);
        }
    }

    /**
     * Determine whether the current user can manage Qa'idah boards.
     *
     * @return bool
     */
    private function user_can_manage_boards() {
        if ( ! is_user_logged_in() ) {
            return false;
        }

        $user = wp_get_current_user();

        if ( current_user_can( 'manage_options' ) ) {
            return true;
        }

        if ( in_array( 'teacher', (array) $user->roles, true ) ) {
            return true;
        }

        return current_user_can( 'edit_posts' );
    }
}

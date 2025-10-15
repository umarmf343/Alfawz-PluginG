<?php
namespace AlfawzQuran\Admin;

use AlfawzQuran\Models\UserProgress;

/**
 * Admin-specific functionality
 */
class Admin {

    public function __construct() {
        // Constructor can be used for initialization if needed
    }

    /**
     * Ensure the administrator role is granted the custom Alfawz admin capability.
     */
    public function ensure_admin_capability() {
        $admin_role = get_role( 'administrator' );

        if ( $admin_role && ! $admin_role->has_cap( 'alfawz_admin' ) ) {
            $admin_role->add_cap( 'alfawz_admin' );
        }

        $teacher_roles = apply_filters( 'alfawz_teacher_capability_roles', [ 'teacher', 'editor' ] );

        foreach ( $teacher_roles as $role_key ) {
            $role = get_role( $role_key );

            if ( $role && ! $role->has_cap( 'alfawz_teacher' ) ) {
                $role->add_cap( 'alfawz_teacher' );
            }
        }
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
        if ( $this->user_can_access_admin() ) {
            $capability = current_user_can( 'manage_options' ) ? 'manage_options' : 'alfawz_admin';

            add_menu_page(
                __( 'AlfawzQuran Dashboard', 'alfawzquran' ),
                __( 'AlfawzQuran', 'alfawzquran' ),
                $capability,
                'alfawz-quran',
                [ $this, 'display_admin_dashboard' ],
                'dashicons-book-alt',
                20
            );

            add_submenu_page(
                'alfawz-quran',
                __( 'Settings', 'alfawzquran' ),
                __( 'Settings', 'alfawzquran' ),
                $capability,
                'alfawz-quran-settings',
                [ $this, 'display_admin_settings' ]
            );

            add_submenu_page(
                'alfawz-quran',
                __( 'Insights', 'alfawzquran' ),
                __( 'Insights', 'alfawzquran' ),
                $capability,
                'alfawz-quran-stats',
                [ $this, 'display_admin_stats' ]
            );
        }

        if ( $this->user_can_manage_boards() ) {
            add_submenu_page(
                'alfawz-quran',
                __( "Qa'idah Assignments", 'alfawzquran' ),
                __( "Qa'idah Assignments", 'alfawzquran' ),
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
     * Display the admin statistics and leaderboard page.
     */
    public function display_admin_stats() {
        $overall_stats = [
            'total_users'      => 0,
            'total_hasanat'    => 0,
            'verses_read'      => 0,
            'verses_memorized' => 0,
        ];

        $user_stats = [];

        if ( class_exists( UserProgress::class ) ) {
            $progress      = new UserProgress();
            $overall_stats = $progress->get_overall_stats();
            $leaderboard   = $progress->get_leaderboard( 'all_time', 25 );

            foreach ( $leaderboard as $entry ) {
                $user = get_userdata( $entry['user_id'] );

                $user_stats[] = [
                    'user_id'         => (int) $entry['user_id'],
                    'display_name'    => $entry['display_name'] ?? ( $user ? $user->display_name : __( 'Unknown User', 'alfawzquran' ) ),
                    'user_email'      => $user ? $user->user_email : '',
                    'total_hasanat'   => isset( $entry['total_hasanat'] ) ? (int) $entry['total_hasanat'] : 0,
                    'verses_read'     => isset( $entry['verses_read'] ) ? (int) $entry['verses_read'] : 0,
                    'verses_memorized'=> isset( $entry['verses_memorized'] ) ? (int) $entry['verses_memorized'] : 0,
                    'current_streak'  => isset( $entry['current_streak'] ) ? (int) $entry['current_streak'] : 0,
                    'last_activity'   => get_user_meta( $entry['user_id'], 'alfawz_quran_last_activity_date', true ),
                ];
            }
        }

        include ALFAWZQURAN_PLUGIN_PATH . 'admin/partials/stats.php';
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
                'canManageAdmin'   => $this->user_can_access_admin(),
                'currentPage'      => isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '',
                'nonces'           => [
                    'classes'  => wp_create_nonce( 'alfawz_admin_classes' ),
                    'users'    => wp_create_nonce( 'alfawz_admin_users' ),
                    'settings' => wp_create_nonce( 'alfawz_admin_settings' ),
                ],
                'strings'          => [
                    'boardSaved'      => __( 'Qa\'idah assignment saved successfully.', 'alfawzquran' ),
                    'boardDeleted'    => __( 'Qa\'idah assignment deleted successfully.', 'alfawzquran' ),
                    'confirmDelete'   => __( 'Are you sure you want to delete this assignment?', 'alfawzquran' ),
                    'confirmClass'    => __( 'Are you sure you want to delete this class? This will unassign all students.', 'alfawzquran' ),
                    'roleUpdate'      => __( 'Role updated successfully.', 'alfawzquran' ),
                    'roleUpdateError' => __( 'Unable to update role.', 'alfawzquran' ),
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

    /**
     * Determine whether the current user can access the main Alfawz admin dashboard.
     *
     * @return bool
     */
    private function user_can_access_admin() {
        return current_user_can( 'manage_options' ) || current_user_can( 'alfawz_admin' );
    }
}

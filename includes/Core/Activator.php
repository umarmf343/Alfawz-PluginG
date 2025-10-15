<?php
namespace AlfawzQuran\Core;

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    AlfawzQuran
 * @subpackage AlfawzQuran/includes
 * @author     Your Name <email@example.com>
 */
class Activator {

    /**
     * Create necessary database tables and set default options.
     *
     * @since    1.0.0
     */
    public static function activate() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();

        // Table for user progress
        $table_name_progress = $wpdb->prefix . 'alfawz_quran_progress';
        $sql_progress = "CREATE TABLE $table_name_progress (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            surah_id int(11) NOT NULL,
            verse_id int(11) NOT NULL,
            progress_type varchar(50) NOT NULL, -- 'read' or 'memorized'
            hasanat int(11) DEFAULT 0,
            repetition_count int(11) DEFAULT 0,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY surah_verse (surah_id, verse_id)
        ) $charset_collate;";

        // Table for user bookmarks
        $table_name_bookmarks = $wpdb->prefix . 'alfawz_quran_bookmarks';
        $sql_bookmarks = "CREATE TABLE $table_name_bookmarks (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            surah_id int(11) NOT NULL,
            verse_id int(11) NOT NULL,
            note text,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY  (id),
            KEY user_id (user_id)
        ) $charset_collate;";

        // Table for memorization plans
        $table_name_plans = $wpdb->prefix . 'alfawz_quran_memorization_plans';
        $sql_plans = "CREATE TABLE $table_name_plans (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            plan_name varchar(255) NOT NULL,
            surah_id int(11) NOT NULL,
            start_verse int(11) NOT NULL,
            end_verse int(11) NOT NULL,
            daily_goal int(11) DEFAULT 0,
            status varchar(50) DEFAULT 'active' NOT NULL, -- 'active', 'completed', 'archived'
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY  (id),
            KEY user_id (user_id)
        ) $charset_collate;";

        // Table for memorization plan progress (linking verses to plans)
        $table_name_plan_progress = $wpdb->prefix . 'alfawz_quran_plan_progress';
        $sql_plan_progress = "CREATE TABLE $table_name_plan_progress (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            plan_id bigint(20) NOT NULL,
            user_id bigint(20) NOT NULL,
            surah_id int(11) NOT NULL,
            verse_id int(11) NOT NULL,
            is_completed tinyint(1) DEFAULT 0 NOT NULL,
            completed_at datetime,
            PRIMARY KEY  (id),
            KEY plan_id (plan_id),
            KEY user_id (user_id),
            UNIQUE KEY plan_verse_user (plan_id, surah_id, verse_id, user_id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql_progress );
        dbDelta( $sql_bookmarks );
        dbDelta( $sql_plans );
        dbDelta( $sql_plan_progress );

        // Set default options
        add_option( 'alfawz_hasanat_per_letter', 10 );
        add_option( 'alfawz_daily_verse_target', 10 );
        add_option( 'alfawz_default_reciter', 'ar.alafasy' );
        add_option( 'alfawz_default_translation', 'en.sahih' );
        add_option( 'alfawz_enable_leaderboard', true );
        add_option( 'alfawz_enable_egg_challenge', 1 );

        // Schedule daily cron job for streak calculation
        if ( ! wp_next_scheduled( 'alfawz_quran_daily_cron' ) ) {
            wp_schedule_event( strtotime( '00:00:00' ) + ( 24 * 60 * 60 ), 'daily', 'alfawz_quran_daily_cron' );
        }

        self::create_pages();

        // Log activation
        error_log('AlfawzQuran Plugin activated successfully');

        $admin_role = get_role( 'administrator' );
        if ( $admin_role && ! $admin_role->has_cap( 'alfawz_admin' ) ) {
            $admin_role->add_cap( 'alfawz_admin' );
        }

        $teacher_cap_roles = apply_filters( 'alfawz_teacher_capability_roles', [ 'teacher', 'editor' ] );
        foreach ( $teacher_cap_roles as $role_key ) {
            $role = get_role( $role_key );
            if ( $role && ! $role->has_cap( 'alfawz_teacher' ) ) {
                $role->add_cap( 'alfawz_teacher' );
            }
        }
    }

    /**
     * Create public-facing pages required for the plugin shortcodes.
     */
    private static function create_pages() {
        $pages = [
            [
                'slug'      => 'alfawz-dashboard',
                'title'     => __( 'Alfawz Dashboard', 'alfawzquran' ),
                'shortcode' => '[alfawz_dashboard]',
            ],
            [
                'slug'      => 'alfawz-reader',
                'title'     => __( 'Alfawz Reader', 'alfawzquran' ),
                'shortcode' => '[alfawz_reader]',
            ],
            [
                'slug'      => 'alfawz-memorizer',
                'title'     => __( 'Alfawz Memorizer', 'alfawzquran' ),
                'shortcode' => '[alfawz_memorizer]',
            ],
            [
                'slug'      => 'alfawz-leaderboard',
                'title'     => __( 'Alfawz Leaderboard', 'alfawzquran' ),
                'shortcode' => '[alfawz_leaderboard]',
            ],
            [
                'slug'      => 'alfawz-profile',
                'title'     => __( 'Alfawz Profile', 'alfawzquran' ),
                'shortcode' => '[alfawz_profile]',
            ],
            [
                'slug'      => 'alfawz-settings',
                'title'     => __( 'Alfawz Settings', 'alfawzquran' ),
                'shortcode' => '[alfawz_settings]',
            ],
            [
                'slug'      => 'alfawz-qaidah',
                'title'     => __( "Alfawz Qa'idah", 'alfawzquran' ),
                'shortcode' => '[alfawz_qaidah]',
            ],
            [
                'slug'      => 'alfawz-games',
                'title'     => __( 'Alfawz Games', 'alfawzquran' ),
                'shortcode' => '[alfawz_games]',
            ],
            [
                'slug'      => 'alfawz-teacher-dashboard',
                'title'     => __( 'Alfawz Teacher Dashboard', 'alfawzquran' ),
                'shortcode' => '[alfawz_teacher_dashboard]',
            ],
        ];

        $stored_page_ids = get_option( 'alfawz_created_pages', [] );
        if ( ! is_array( $stored_page_ids ) ) {
            $stored_page_ids = [];
        }

        $new_page_ids = [];

        foreach ( $pages as $page ) {
            $existing_page = get_page_by_path( $page['slug'], OBJECT, 'page' );

            if ( $existing_page instanceof \WP_Post ) {
                if ( 'trash' === $existing_page->post_status ) {
                    wp_update_post([
                        'ID'          => $existing_page->ID,
                        'post_status' => 'publish',
                    ]);
                }

                continue;
            }

            $page_id = wp_insert_post([
                'post_title'   => $page['title'],
                'post_name'    => $page['slug'],
                'post_content' => $page['shortcode'],
                'post_status'  => 'publish',
                'post_type'    => 'page',
                'post_author'  => get_current_user_id(),
            ]);

            if ( ! is_wp_error( $page_id ) && $page_id ) {
                $new_page_ids[] = (int) $page_id;
            }
        }

        $all_page_ids = array_unique( array_merge( $stored_page_ids, $new_page_ids ) );

        if ( ! empty( $all_page_ids ) ) {
            update_option( 'alfawz_created_pages', array_values( array_map( 'intval', $all_page_ids ) ) );
        } else {
            delete_option( 'alfawz_created_pages' );
        }
    }
}

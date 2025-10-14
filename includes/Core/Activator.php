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

        // Schedule daily cron job for streak calculation
        if ( ! wp_next_scheduled( 'alfawz_quran_daily_cron' ) ) {
            wp_schedule_event( strtotime( '00:00:00' ) + ( 24 * 60 * 60 ), 'daily', 'alfawz_quran_daily_cron' );
        }

        // Log activation
        error_log('AlfawzQuran Plugin activated successfully');
    }
}

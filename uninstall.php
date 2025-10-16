<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * When populating this file, ensure that you are not using any functions
 * that are defined in the plugin globally.
 *
 * @link       https://alfawzquran.com
 * @since      1.0.0
 *
 * @package    AlfawzQuran
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

global $wpdb;

// Delete custom database tables
$table_progress = $wpdb->prefix . 'alfawz_quran_progress';
$table_bookmarks = $wpdb->prefix . 'alfawz_quran_bookmarks';
$table_plans = $wpdb->prefix . 'alfawz_quran_memorization_plans';
$table_plan_progress = $wpdb->prefix . 'alfawz_quran_plan_progress';
$table_reflections = $wpdb->prefix . 'alfawz_quran_reflections';

$wpdb->query( "DROP TABLE IF EXISTS $table_progress" );
$wpdb->query( "DROP TABLE IF EXISTS $table_bookmarks" );
$wpdb->query( "DROP TABLE IF EXISTS $table_plans" );
$wpdb->query( "DROP TABLE IF EXISTS $table_plan_progress" );
$wpdb->query( "DROP TABLE IF EXISTS $table_reflections" );

// Delete plugin options
delete_option( 'alfawz_hasanat_per_letter' );
delete_option( 'alfawz_daily_verse_target' );
delete_option( 'alfawz_default_reciter' );
delete_option( 'alfawz_default_translation' );
delete_option( 'alfawz_enable_leaderboard' );
delete_option( 'alfawz_enable_egg_challenge' );

// Delete user meta data associated with the plugin
$users = get_users( [ 'fields' => 'ID' ] );
foreach ( $users as $user_id ) {
    delete_user_meta( $user_id, 'alfawz_quran_current_streak' );
    delete_user_meta( $user_id, 'alfawz_quran_longest_streak' );
    delete_user_meta( $user_id, 'alfawz_quran_last_activity_date' );
    delete_user_meta( $user_id, 'alfawz_pref_default_reciter' );
    delete_user_meta( $user_id, 'alfawz_pref_default_translation' );
    delete_user_meta( $user_id, 'alfawz_pref_default_transliteration' );
    delete_user_meta( $user_id, 'alfawz_pref_hasanat_per_letter' );
    delete_user_meta( $user_id, 'alfawz_pref_daily_target' );
    delete_user_meta( $user_id, 'alfawz_pref_enable_leaderboard' );
    delete_user_meta( $user_id, 'alfawz_reflection_last_mood' );
    delete_user_meta( $user_id, 'daily_recited_verses' );
    delete_user_meta( $user_id, 'alfawz_daily_recited_verses_log' );
    delete_user_meta( $user_id, 'alfawz_daily_goal_last_reset' );
    delete_user_meta( $user_id, 'alfawz_daily_goal_last_completion' );
    delete_user_meta( $user_id, 'egg_challenge_current_count' );
    delete_user_meta( $user_id, 'egg_challenge_target' );
    delete_user_meta( $user_id, 'alfawz_egg_last_completion_target' );
    delete_user_meta( $user_id, 'alfawz_egg_last_completion_at' );
}

// Clear any scheduled cron jobs
wp_clear_scheduled_hook( 'alfawz_quran_daily_cron' );

// Remove pages that were created during activation
$created_pages = get_option( 'alfawz_created_pages', [] );
if ( is_array( $created_pages ) ) {
    foreach ( $created_pages as $page_id ) {
        $page_id = (int) $page_id;
        $page    = get_post( $page_id );

        if ( $page && 'page' === $page->post_type ) {
            wp_delete_post( $page_id, true );
        }
    }
}

delete_option( 'alfawz_created_pages' );

// Flush rewrite rules to remove custom endpoints
flush_rewrite_rules();

// Log uninstallation
error_log('AlfawzQuran Plugin uninstalled successfully');

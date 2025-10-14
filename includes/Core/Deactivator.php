<?php
namespace AlfawzQuran\Core;

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    AlfawzQuran
 * @subpackage AlfawzQuran/includes
 * @author     Your Name <email@example.com>
 */
class Deactivator {

    /**
     * Short Description. (use period)
     *
     * Long Description.
     *
     * @since    1.0.0
     */
    public static function deactivate() {
        // Clear any scheduled cron jobs
        wp_clear_scheduled_hook( 'alfawz_quran_daily_cron' );

        // Clear any plugin-specific caches if necessary
        // For example, if you used WP Transients for API responses:
        // delete_transient( 'alfawz_quran_surahs_cache' );

        // Flush rewrite rules to remove custom endpoints
        flush_rewrite_rules();

        // Log deactivation
        error_log('AlfawzQuran Plugin deactivated successfully');
    }
}

<?php
/**
 * Plugin Name: AlfawzQuran
 * Plugin URI:  https://alfawzquran.com
 * Description: A comprehensive WordPress plugin for Quran reading, memorization, and progress tracking.
 * Version:     1.0.0
 * Author:      Your Name
 * Author URI:  https://yourwebsite.com
 * License:     GPL2
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: alfawzquran
 * Domain Path: /languages
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Define Constants
 */
define( 'ALFAWZQURAN_VERSION', '1.0.0' );
define( 'ALFAWZQURAN_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'ALFAWZQURAN_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'ALFAWZQURAN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/Core/Activator.php
 */
function activate_alfawz_quran() {
    require_once ALFAWZQURAN_PLUGIN_PATH . 'includes/Core/Activator.php';
    AlfawzQuran\Core\Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/Core/Deactivator.php
 */
function deactivate_alfawz_quran() {
    require_once ALFAWZQURAN_PLUGIN_PATH . 'includes/Core/Deactivator.php';
    AlfawzQuran\Core\Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_alfawz_quran' );
register_deactivation_hook( __FILE__, 'deactivate_alfawz_quran' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing hooks.
 */
require ALFAWZQURAN_PLUGIN_PATH . 'includes/Core/Loader.php';
require_once ALFAWZQURAN_PLUGIN_PATH . 'includes/Core/ErrorHandler.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file means
 * that all of the hooks will be defined and ready to be registered.
 *
 * @since    1.0.0
 */
function run_alfawz_quran() {
    $loader = new AlfawzQuran\Core\Loader();

    $error_handler = new AlfawzQuran\Core\ErrorHandler();
    $error_handler->register();

    // Load Qa'idah board registration
    require_once ALFAWZQURAN_PLUGIN_PATH . 'includes/Core/QaidahBoards.php';
    $qaidah_boards = new AlfawzQuran\Core\QaidahBoards();
    $loader->add_action( 'init', $qaidah_boards, 'register_post_type' );
    $loader->add_action( 'init', $qaidah_boards, 'register_meta' );

    // Load class registration and helpers
    require_once ALFAWZQURAN_PLUGIN_PATH . 'includes/Core/ClassManager.php';
    $class_manager = new AlfawzQuran\Core\ClassManager();
    $loader->add_action( 'init', $class_manager, 'register_post_type' );
    $loader->add_action( 'before_delete_post', $class_manager, 'cleanup_assignments', 10, 1 );

    // Load admin-specific functionality
    require_once ALFAWZQURAN_PLUGIN_PATH . 'includes/Admin/Admin.php';
    $admin = new AlfawzQuran\Admin\Admin();
    $loader->add_action( 'admin_menu', $admin, 'add_admin_menu' );
    $loader->add_action( 'admin_enqueue_scripts', $admin, 'enqueue_admin_assets' );
    $loader->add_action( 'admin_notices', $admin, 'display_api_connection_notice' );
    $loader->add_action( 'admin_init', $admin, 'ensure_admin_capability' );

    // Load public-facing functionality
    require_once ALFAWZQURAN_PLUGIN_PATH . 'includes/Frontend/Frontend.php';
    require_once ALFAWZQURAN_PLUGIN_PATH . 'includes/Frontend/BottomNav.php';
    $frontend = new AlfawzQuran\Frontend\Frontend();
    $loader->add_action( 'init', $frontend, 'register_shortcodes' );
    $loader->add_action( 'wp_enqueue_scripts', $frontend, 'enqueue_assets' );
    $loader->add_action( 'wp_head', $frontend, 'add_meta_tags' );
    $loader->add_action( 'login_init', $frontend, 'redirect_wp_login_page' );
    $loader->add_action( 'wp_login_failed', $frontend, 'handle_login_failure', 10, 1 );
    $loader->add_action( 'admin_init', $frontend, 'redirect_non_admin_dashboard' );

    // Load API routes
    require_once ALFAWZQURAN_PLUGIN_PATH . 'includes/API/Routes.php';
    new AlfawzQuran\API\Routes();

    // Load Models
    require_once ALFAWZQURAN_PLUGIN_PATH . 'includes/Models/UserProgress.php';
    require_once ALFAWZQURAN_PLUGIN_PATH . 'includes/Models/QaidahBoard.php';
    require_once ALFAWZQURAN_PLUGIN_PATH . 'includes/API/QuranAPI.php'; // Ensure this is loaded if used by other classes

    $loader->run();
}
run_alfawz_quran();

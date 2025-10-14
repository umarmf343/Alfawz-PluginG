<?php
namespace AlfawzQuran\Core;

use function add_action;
use function error_log;
use function restore_error_handler;
use function set_error_handler;
use function set_transient;
use function sprintf;
use function strpos;
use function __;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Capture specific WordPress warnings so we can surface them as admin notices
 * without breaking page rendering with "headers already sent" issues.
 */
class ErrorHandler {
    /**
     * @var callable|null
     */
    private $previous_handler = null;

    /**
     * Track whether we've registered an error handler.
     *
     * @var bool
     */
    private $registered = false;

    /**
     * Register the handler for WordPress generated user warnings.
     */
    public function register() {
        if ( $this->registered ) {
            return;
        }

        $this->previous_handler = set_error_handler( [ $this, 'handle_warning' ], E_USER_WARNING );
        $this->registered        = true;

        add_action( 'shutdown', [ $this, 'restore' ], 1 );
    }

    /**
     * Restore the previously registered error handler.
     */
    public function restore() {
        if ( ! $this->registered ) {
            return;
        }

        restore_error_handler();
        $this->registered = false;
    }

    /**
     * Convert the WordPress.org connection warning into an admin notice so the
     * error does not break header output.
     *
     * @param int    $errno   The level of the error raised.
     * @param string $errstr  The error message.
     * @param string $errfile The filename that the error was raised in.
     * @param int    $errline The line number the error was raised at.
     *
     * @return bool True if the PHP internal error handler should not be called.
     */
    public function handle_warning( $errno, $errstr, $errfile, $errline ) {
        if ( E_USER_WARNING === $errno && $this->is_wordpress_org_warning( $errstr ) ) {
            $this->store_notice( $errstr, $errfile, $errline );

            return true;
        }

        if ( is_callable( $this->previous_handler ) ) {
            return (bool) call_user_func( $this->previous_handler, $errno, $errstr, $errfile, $errline );
        }

        return false;
    }

    /**
     * Determine whether the warning came from wp_update_plugins().
     *
     * @param string $message
     *
     * @return bool
     */
    private function is_wordpress_org_warning( $message ) {
        return false !== strpos( $message, 'wp_update_plugins()' ) &&
            false !== strpos( $message, 'WordPress.org' );
    }

    /**
     * Store a transient so we can surface the error as an admin notice and log
     * the failure for debugging purposes.
     *
     * @param string $error_message The warning that WordPress generated.
     * @param string $file          The file where the warning was raised.
     * @param int    $line          The line where the warning was raised.
     */
    private function store_notice( $error_message, $file, $line ) {
        $notice = [
            'type'    => 'error',
            'message' => __( 'WordPress could not establish a secure connection to WordPress.org. Plugin and theme updates may fail until your server can reach WordPress.org over HTTPS. Please contact your hosting provider to ensure outbound HTTPS requests are allowed and that CURL and OpenSSL are enabled.', 'alfawzquran' ),
            'details' => $error_message,
        ];

        set_transient( 'alfawz_wp_org_connection_warning', $notice, HOUR_IN_SECONDS * 6 );

        error_log( sprintf( 'AlfawzQuran detected WordPress.org connection failure in %1$s on line %2$d: %3$s', $file, $line, $error_message ) );
    }
}

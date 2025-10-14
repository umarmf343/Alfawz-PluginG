<?php
namespace AlfawzQuran\Core;

/**
 * Handles runtime environment diagnostics for the plugin.
 */
class Environment {
    const OPTION_KEY = 'alfawz_quran_environment_warnings';
    const TRANSIENT_KEY = 'alfawz_quran_environment_last_check';

    /**
     * Perform a full environment verification.
     *
     * @param bool $force Optional. Whether to bypass the throttling mechanism. Default false.
     */
    public static function verify( $force = false ) {
        if ( ! $force && ! self::should_run_check() ) {
            return;
        }

        $warnings = [];

        if ( ! function_exists( 'curl_version' ) ) {
            $warnings[] = __( 'The PHP cURL extension is not available. AlfawzQuran relies on it to reach external services such as the Quran API and WordPress.org.', 'alfawzquran' );
        }

        if ( ! extension_loaded( 'openssl' ) ) {
            $warnings[] = __( 'The PHP OpenSSL extension is not available. Secure HTTPS requests are required for the plugin to operate correctly.', 'alfawzquran' );
        }

        $https_checks = [
            'https://api.alquran.cloud/v1/surah'          => __( 'Unable to reach the Quran API over HTTPS. Cached data will be used when available. Please ensure outgoing HTTPS traffic is allowed on the server.', 'alfawzquran' ),
            'https://wordpress.org/'                      => __( 'Unable to reach WordPress.org over HTTPS. This prevents WordPress from checking for updates and may display warnings during plugin activation. Please contact your hosting provider to resolve SSL connectivity.', 'alfawzquran' ),
        ];

        foreach ( $https_checks as $url => $message ) {
            $result = self::test_https_request( $url );

            if ( is_wp_error( $result ) ) {
                $warnings[] = sprintf(
                    /* translators: 1: Descriptive message, 2: Error message. */
                    __( '%1$s Error details: %2$s', 'alfawzquran' ),
                    $message,
                    $result->get_error_message()
                );
            }
        }

        if ( ! empty( $warnings ) ) {
            update_option( self::OPTION_KEY, array_values( array_unique( $warnings ) ), false );
        } else {
            delete_option( self::OPTION_KEY );
        }

        set_transient( self::TRANSIENT_KEY, time(), HOUR_IN_SECONDS * 12 );
    }

    /**
     * Retrieve stored warnings.
     *
     * @return array
     */
    public static function get_warnings() {
        $warnings = get_option( self::OPTION_KEY, [] );

        if ( ! is_array( $warnings ) ) {
            return [];
        }

        return array_filter( array_map( 'trim', $warnings ) );
    }

    /**
     * Trigger a verification run if the throttling window has passed.
     */
    public static function maybe_recheck() {
        self::verify();
    }

    /**
     * Determine whether the connectivity check should execute.
     *
     * @return bool
     */
    private static function should_run_check() {
        return false === get_transient( self::TRANSIENT_KEY );
    }

    /**
     * Attempt an HTTPS request and return the raw response or WP_Error.
     *
     * @param string $url URL to test.
     *
     * @return array|\WP_Error
     */
    private static function test_https_request( $url ) {
        $response = wp_remote_get(
            $url,
            [
                'timeout'   => 10,
                'sslverify' => true,
            ]
        );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code( $response );

        if ( empty( $code ) || $code >= 400 ) {
            return new \WP_Error( 'http_error', __( 'Received an unexpected response while testing HTTPS connectivity.', 'alfawzquran' ) );
        }

        return $response;
    }
}

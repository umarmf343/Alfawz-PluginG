<?php
namespace AlfawzQuran\API;

/**
 * Handles external API calls to Alquran.cloud.
 */
class QuranAPI {
    private $base_url = 'https://api.alquran.cloud/v1/';

    /**
     * Fetch all surahs.
     *
     * @return array|WP_Error
     */
    public function get_surahs() {
        $response = wp_remote_get( $this->base_url . 'surah' );
        return $this->handle_response( $response );
    }

    /**
     * Fetch a specific surah.
     *
     * @param int $surah_number
     * @param string $edition
     * @return array|WP_Error
     */
    public function get_surah( $surah_number, $edition = 'quran-simple' ) {
        $response = wp_remote_get( $this->base_url . 'surah/' . $surah_number . '/' . $edition );
        return $this->handle_response( $response );
    }

    /**
     * Fetch a specific ayah (verse).
     *
     * @param int $surah_number
     * @param int $ayah_number
     * @param string $edition
     * @return array|WP_Error
     */
    public function get_ayah( $surah_number, $ayah_number, $edition = 'quran-simple' ) {
        $response = wp_remote_get( $this->base_url . 'ayah/' . $surah_number . ':' . $ayah_number . '/' . $edition );
        return $this->handle_response( $response );
    }

    /**
     * Handle the API response.
     *
     * @param array|WP_Error $response
     * @return array|WP_Error
     */
    private function handle_response( $response ) {
        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        if ( json_last_error() !== JSON_ERROR_NONE ) {
            return new \WP_Error( 'json_decode_error', 'Failed to decode JSON response from API.' );
        }

        if ( isset( $data['status'] ) && $data['status'] === 'OK' ) {
            return $data['data'];
        } else {
            return new \WP_Error( 'api_error', isset( $data['data'] ) ? $data['data'] : 'Unknown API error.' );
        }
    }
}

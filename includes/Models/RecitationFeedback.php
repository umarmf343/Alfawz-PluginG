<?php
namespace AlfawzQuran\Models;

use function current_time;
use function get_user_meta;
use function is_array;
use function maybe_unserialize;
use function update_user_meta;
use function wp_json_encode;

/**
 * Stores AI recitation feedback history for each user.
 */
class RecitationFeedback {
    const USER_META_KEY = 'alfawz_recitation_feedback_history';
    const MAX_ENTRIES   = 25;

    /**
     * Record a new recitation evaluation snapshot for a user.
     *
     * @param int   $user_id User identifier.
     * @param array $payload Evaluation payload to persist.
     * @return array Stored history for convenience.
     */
    public function log_feedback( $user_id, array $payload ) {
        $user_id = (int) $user_id;
        if ( $user_id <= 0 ) {
            return [];
        }

        $history = $this->get_history( $user_id, false );

        $entry = array_merge(
            [
                'evaluated_at' => current_time( 'mysql' ),
            ],
            $this->sanitize_payload( $payload )
        );

        array_unshift( $history, $entry );

        if ( count( $history ) > self::MAX_ENTRIES ) {
            $history = array_slice( $history, 0, self::MAX_ENTRIES );
        }

        update_user_meta( $user_id, self::USER_META_KEY, wp_json_encode( $history ) );

        return $history;
    }

    /**
     * Retrieve the stored recitation analysis history.
     *
     * @param int  $user_id User identifier.
     * @param bool $limit   Whether to slice to the max entries.
     * @return array
     */
    public function get_history( $user_id, $limit = true ) {
        $user_id = (int) $user_id;
        if ( $user_id <= 0 ) {
            return [];
        }

        $raw = get_user_meta( $user_id, self::USER_META_KEY, true );

        if ( empty( $raw ) ) {
            return [];
        }

        if ( is_string( $raw ) ) {
            $decoded = json_decode( $raw, true );
            if ( json_last_error() === JSON_ERROR_NONE ) {
                $raw = $decoded;
            }
        }

        if ( ! is_array( $raw ) ) {
            $raw = maybe_unserialize( $raw );
        }

        if ( ! is_array( $raw ) ) {
            return [];
        }

        if ( $limit && count( $raw ) > self::MAX_ENTRIES ) {
            return array_slice( $raw, 0, self::MAX_ENTRIES );
        }

        return $raw;
    }

    /**
     * Sanitize feedback payload before persistence.
     *
     * @param array $payload Raw payload.
     * @return array
     */
    private function sanitize_payload( array $payload ) {
        $allowed_keys = [
            'verse_key',
            'surah_id',
            'verse_id',
            'score',
            'confidence',
            'duration',
            'transcript',
            'expected',
            'mistakes',
            'suggestions',
            'snippets',
            'token_count',
        ];

        $sanitized = [];
        foreach ( $allowed_keys as $key ) {
            if ( array_key_exists( $key, $payload ) ) {
                $sanitized[ $key ] = $payload[ $key ];
            }
        }

        return $sanitized;
    }
}

<?php
namespace AlfawzQuran\Support;

use WP_User;

/**
 * Helper utilities for computing personalised daily targets across age bands.
 */
class DailyTargets {

    public const DEFAULT_TARGET = 10;

    /**
     * Supported age bands for daily targets.
     *
     * @return string[]
     */
    public static function bands() {
        return [ 'child', 'adult', 'senior' ];
    }

    /**
     * Resolve the preferred age band for the given user.
     *
     * @param int $user_id
     * @return string
     */
    public static function resolve_age_band( $user_id = 0 ) {
        $band = '';

        if ( $user_id ) {
            $band = get_user_meta( $user_id, 'alfawz_pref_age_band', true );

            if ( '' === $band ) {
                $band = get_user_meta( $user_id, 'alfawz_profile_age_band', true );
            }

            if ( '' === $band ) {
                $user = get_userdata( $user_id );

                if ( $user instanceof WP_User ) {
                    $roles = (array) $user->roles;
                    if ( array_intersect( $roles, [ 'teacher', 'administrator', 'editor', 'alfawz_admin' ] ) ) {
                        $band = 'adult';
                    } elseif ( array_intersect( $roles, [ 'senior', 'retiree' ] ) ) {
                        $band = 'senior';
                    } elseif ( array_intersect( $roles, [ 'student', 'subscriber' ] ) ) {
                        $band = 'child';
                    }
                }
            }
        }

        $band = self::normalise_band( $band );

        /**
         * Filter the detected age band for a user.
         *
         * @param string $band
         * @param int    $user_id
         */
        $band = apply_filters( 'alfawz_daily_target_age_band', $band, $user_id );

        return self::normalise_band( $band );
    }

    /**
     * Normalise an age band identifier.
     *
     * @param string $band
     * @return string
     */
    public static function normalise_band( $band ) {
        $band = strtolower( (string) $band );
        return in_array( $band, self::bands(), true ) ? $band : 'adult';
    }

    /**
     * Return the per-band daily targets for a user, falling back to scaled defaults.
     *
     * @param int $user_id
     * @return array{child:int,adult:int,senior:int}
     */
    public static function get_band_targets( $user_id = 0 ) {
        $base_target = self::determine_base_target( $user_id );

        $targets = [
            'child'  => self::read_band_meta( $user_id, 'child' ),
            'adult'  => self::read_band_meta( $user_id, 'adult' ),
            'senior' => self::read_band_meta( $user_id, 'senior' ),
        ];

        $targets['adult']  = $targets['adult'] > 0 ? $targets['adult'] : $base_target;
        $targets['child']  = $targets['child'] > 0 ? $targets['child'] : self::derive_child_target( $base_target );
        $targets['senior'] = $targets['senior'] > 0 ? $targets['senior'] : self::derive_senior_target( $base_target );

        foreach ( $targets as $band => $value ) {
            $targets[ $band ] = max( 1, (int) $value );
        }

        /**
         * Allow filtering of the resolved daily target bands for a user.
         *
         * @param array $targets
         * @param int   $user_id
         */
        $targets = apply_filters( 'alfawz_daily_target_bands', $targets, $user_id );

        return [
            'child'  => max( 1, (int) ( $targets['child'] ?? $base_target ) ),
            'adult'  => max( 1, (int) ( $targets['adult'] ?? $base_target ) ),
            'senior' => max( 1, (int) ( $targets['senior'] ?? $base_target ) ),
        ];
    }

    /**
     * Resolve the active daily target for the provided user and band.
     *
     * @param int         $user_id
     * @param string|null $band
     * @return int
     */
    public static function resolve_user_target( $user_id = 0, $band = null ) {
        $band    = self::normalise_band( $band ?: self::resolve_age_band( $user_id ) );
        $targets = self::get_band_targets( $user_id );

        if ( isset( $targets[ $band ] ) ) {
            return max( 1, (int) $targets[ $band ] );
        }

        return max( 1, (int) $targets['adult'] );
    }

    /**
     * Determine the base daily target preference for the user.
     *
     * @param int $user_id
     * @return int
     */
    private static function determine_base_target( $user_id ) {
        $option_target = (int) get_option( 'alfawz_daily_verse_target', self::DEFAULT_TARGET );
        $base_target   = $option_target > 0 ? $option_target : self::DEFAULT_TARGET;

        if ( $user_id ) {
            $user_preference = (int) get_user_meta( $user_id, 'alfawz_pref_daily_target', true );
            if ( $user_preference > 0 ) {
                $base_target = $user_preference;
            }
        }

        return max( 1, $base_target );
    }

    /**
     * Read the stored meta value for a specific band.
     *
     * @param int    $user_id
     * @param string $band
     * @return int
     */
    private static function read_band_meta( $user_id, $band ) {
        if ( ! $user_id ) {
            return 0;
        }

        $meta_key = self::band_meta_key( $band );
        if ( ! $meta_key ) {
            return 0;
        }

        return (int) get_user_meta( $user_id, $meta_key, true );
    }

    /**
     * Map band identifiers to user meta keys.
     *
     * @param string $band
     * @return string|null
     */
    public static function band_meta_key( $band ) {
        switch ( self::normalise_band( $band ) ) {
            case 'child':
                return 'alfawz_pref_daily_target_child';
            case 'senior':
                return 'alfawz_pref_daily_target_senior';
            case 'adult':
                return 'alfawz_pref_daily_target_adult';
        }

        return null;
    }

    private static function derive_child_target( $base_target ) {
        $scaled = (int) round( $base_target * 0.6 );
        if ( $scaled >= $base_target ) {
            $scaled = max( 1, $base_target - 1 );
        }

        return max( 1, $scaled );
    }

    private static function derive_senior_target( $base_target ) {
        $scaled = (int) round( $base_target * 0.7 );
        if ( $scaled >= $base_target ) {
            $scaled = max( 1, $base_target - 1 );
        }

        return max( 1, $scaled );
    }
}

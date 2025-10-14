<?php
namespace AlfawzQuran\Core;

/**
 * Register the custom post type and meta used for Qa'idah practice boards.
 */
class QaidahBoards {
    /**
     * Post type slug for Qa'idah boards.
     */
    const POST_TYPE = 'alfawz_qaidah_board';

    /**
     * Register the custom post type.
     */
    public function register_post_type() {
        if ( \post_type_exists( self::POST_TYPE ) ) {
            return;
        }

        $labels = [
            'name'               => \__( "Qa'idah Boards", 'alfawzquran' ),
            'singular_name'      => \__( "Qa'idah Board", 'alfawzquran' ),
            'add_new'            => \__( 'Add New', 'alfawzquran' ),
            'add_new_item'       => \__( "Add New Qa'idah Board", 'alfawzquran' ),
            'edit_item'          => \__( 'Edit Qa\'idah Board', 'alfawzquran' ),
            'new_item'           => \__( 'New Qa\'idah Board', 'alfawzquran' ),
            'all_items'          => \__( "Qa'idah Boards", 'alfawzquran' ),
            'view_item'          => \__( 'View Qa\'idah Board', 'alfawzquran' ),
            'search_items'       => \__( "Search Qa'idah Boards", 'alfawzquran' ),
            'not_found'          => \__( 'No Qa\'idah boards found', 'alfawzquran' ),
            'not_found_in_trash' => \__( 'No Qa\'idah boards found in Trash', 'alfawzquran' ),
            'menu_name'          => \__( "Qa'idah Boards", 'alfawzquran' ),
        ];

        $args = [
            'labels'             => $labels,
            'public'             => false,
            'show_ui'            => false,
            'show_in_menu'       => false,
            'show_in_nav_menus'  => false,
            'show_in_admin_bar'  => false,
            'supports'           => [ 'title' ],
            'has_archive'        => false,
            'rewrite'            => false,
            'capability_type'    => 'post',
        ];

        register_post_type( self::POST_TYPE, $args );
    }

    /**
     * Register post meta fields used by the custom post type.
     */
    public function register_meta() {
        \register_post_meta(
            self::POST_TYPE,
            '_alfawz_qaidah_image_id',
            [
                'type'         => 'integer',
                'single'       => true,
                'show_in_rest' => false,
                'sanitize_callback' => 'absint',
            ]
        );

        \register_post_meta(
            self::POST_TYPE,
            '_alfawz_qaidah_hotspots',
            [
                'type'              => 'string',
                'single'            => true,
                'show_in_rest'      => false,
                'sanitize_callback' => [ $this, 'sanitize_hotspots_meta' ],
            ]
        );

        \register_post_meta(
            self::POST_TYPE,
            '_alfawz_qaidah_students',
            [
                'type'              => 'string',
                'single'            => true,
                'show_in_rest'      => false,
                'sanitize_callback' => [ $this, 'sanitize_students_meta' ],
            ]
        );
    }

    /**
     * Sanitize the stored hotspots payload.
     *
     * @param mixed $value Raw value passed from WordPress.
     * @return string Sanitized JSON string.
     */
    public function sanitize_hotspots_meta( $value ) {
        if ( empty( $value ) ) {
            return '';
        }

        if ( is_array( $value ) ) {
            $value = \wp_json_encode( $value );
        }

        if ( ! is_string( $value ) ) {
            return '';
        }

        return \wp_kses_post( $value );
    }

    /**
     * Sanitize the stored students payload.
     *
     * @param mixed $value Raw value passed from WordPress.
     * @return string Sanitized JSON string.
     */
    public function sanitize_students_meta( $value ) {
        if ( empty( $value ) ) {
            return '';
        }

        if ( is_array( $value ) ) {
            $value = \wp_json_encode( array_map( 'intval', $value ) );
        }

        if ( ! is_string( $value ) ) {
            return '';
        }

        return \wp_kses_post( $value );
    }
}

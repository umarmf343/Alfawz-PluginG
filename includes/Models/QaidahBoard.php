<?php
namespace AlfawzQuran\Models;

use AlfawzQuran\Core\QaidahBoards;
use WP_Error;
use WP_Post;

/**
 * Data layer for managing Qa'idah practice assignments.
 */
class QaidahBoard {
    /**
     * Persist a Qa'idah assignment and its metadata.
     *
     * @param array $data Sanitized assignment data.
     * @param int   $board_id Optional assignment ID when updating an existing record.
     *
     * @return int|WP_Error Post ID on success or WP_Error on failure.
     */
    public function save_board( array $data, $board_id = 0 ) {
        $title        = isset( $data['title'] ) ? \sanitize_text_field( $data['title'] ) : '';
        $image_id     = isset( $data['image_id'] ) ? \absint( $data['image_id'] ) : 0;
        $student_ids  = isset( $data['student_ids'] ) && is_array( $data['student_ids'] ) ? array_map( '\absint', $data['student_ids'] ) : [];
        $hotspots     = isset( $data['hotspots'] ) && is_array( $data['hotspots'] ) ? $data['hotspots'] : [];
        $author_id    = isset( $data['author_id'] ) ? \absint( $data['author_id'] ) : \get_current_user_id();
        $class_id     = isset( $data['class_id'] ) ? $this->sanitize_class_id( $data['class_id'] ) : '';
        $description  = isset( $data['description'] ) ? \wp_kses_post( $data['description'] ) : '';

        if ( empty( $title ) ) {
            return new WP_Error( 'alfawz_missing_title', \__( 'A title is required for the Qa\'idah assignment.', 'alfawzquran' ) );
        }

        if ( ! $image_id ) {
            return new WP_Error( 'alfawz_missing_image', \__( 'Please select an image before saving the Qa\'idah assignment.', 'alfawzquran' ) );
        }

        if ( empty( $class_id ) && empty( $student_ids ) ) {
            return new WP_Error( 'alfawz_missing_students', \__( 'Select a class or individual students for this Qa\'idah assignment.', 'alfawzquran' ) );
        }

        $sanitized_hotspots = [];

        foreach ( $hotspots as $hotspot ) {
            $hotspot_id = isset( $hotspot['id'] ) ? \sanitize_key( $hotspot['id'] ) : \uniqid( 'hotspot_', true );

            $sanitized_hotspots[] = [
                'id'       => $hotspot_id,
                'label'    => isset( $hotspot['label'] ) ? \sanitize_text_field( $hotspot['label'] ) : '',
                'x'        => $this->sanitize_percentage( $hotspot['x'] ?? 0 ),
                'y'        => $this->sanitize_percentage( $hotspot['y'] ?? 0 ),
                'width'    => $this->sanitize_percentage( $hotspot['width'] ?? 0 ),
                'height'   => $this->sanitize_percentage( $hotspot['height'] ?? 0 ),
                'audio_id' => isset( $hotspot['audio_id'] ) ? \absint( $hotspot['audio_id'] ) : 0,
            ];
        }

        $post_data = [
            'post_type'   => QaidahBoards::POST_TYPE,
            'post_title'  => $title,
            'post_status' => 'publish',
            'post_author' => $author_id,
        ];

        if ( $board_id ) {
            $post_data['ID'] = \absint( $board_id );
            $result          = \wp_update_post( $post_data, true );
        } else {
            $result = \wp_insert_post( $post_data, true );
        }

        if ( \is_wp_error( $result ) ) {
            return $result;
        }

        $post_id = (int) $result;

        \update_post_meta( $post_id, '_alfawz_qaidah_image_id', $image_id );
        \update_post_meta( $post_id, '_alfawz_qaidah_hotspots', \wp_json_encode( $sanitized_hotspots ) );
        \update_post_meta( $post_id, '_alfawz_qaidah_students', \wp_json_encode( $student_ids ) );
        \update_post_meta( $post_id, '_alfawz_qaidah_class_id', $class_id );
        \update_post_meta( $post_id, '_alfawz_qaidah_description', $description );

        return $post_id;
    }

    /**
     * Retrieve boards assigned to a specific student.
     *
     * @param int $user_id WordPress user ID.
     *
     * @return array
     */
    public function get_boards_for_student( $user_id ) {
        $user_id = \absint( $user_id );

        if ( ! $user_id ) {
            return [];
        }

        $class_id  = $this->sanitize_class_id( \get_user_meta( $user_id, 'alfawz_class_id', true ) );
        $meta_query = [
            'relation' => 'OR',
            [
                'key'     => '_alfawz_qaidah_students',
                'value'   => '"' . $user_id . '"',
                'compare' => 'LIKE',
            ],
        ];

        if ( $class_id ) {
            $meta_query[] = [
                'key'     => '_alfawz_qaidah_class_id',
                'value'   => $class_id,
                'compare' => '=',
            ];
        }

        $query_args = [
            'post_type'      => QaidahBoards::POST_TYPE,
            'posts_per_page' => -1,
            'post_status'    => 'publish',
            'meta_query'     => $meta_query,
        ];

        $posts = \get_posts( $query_args );

        return array_map( function ( WP_Post $post ) {
            return $this->prepare_board_for_response( $post, 'view' );
        }, $posts );
    }

    /**
     * Retrieve all boards created by a teacher.
     *
     * @param int $user_id WordPress user ID.
     *
     * @return array
     */
    public function get_boards_for_teacher( $user_id ) {
        $user_id = \absint( $user_id );

        $query_args = [
            'post_type'      => QaidahBoards::POST_TYPE,
            'posts_per_page' => -1,
            'post_status'    => 'publish',
        ];

        if ( $user_id ) {
            $query_args['author'] = $user_id;
        }

        $posts = \get_posts( $query_args );

        return array_map( function ( WP_Post $post ) {
            return $this->prepare_board_for_response( $post, 'manage' );
        }, $posts );
    }

    /**
     * Prepare a board for REST responses.
     *
     * @param WP_Post $post    Post object.
     * @param string  $context Response context. Accepts 'view' or 'manage'.
     *
     * @return array
     */
    public function prepare_board_for_response( WP_Post $post, $context = 'view' ) {
        $image_id     = (int) \get_post_meta( $post->ID, '_alfawz_qaidah_image_id', true );
        $hotspots     = $this->decode_meta_json( \get_post_meta( $post->ID, '_alfawz_qaidah_hotspots', true ) );
        $student_ids  = $this->decode_meta_json( \get_post_meta( $post->ID, '_alfawz_qaidah_students', true ) );
        $class_id     = $this->sanitize_class_id( \get_post_meta( $post->ID, '_alfawz_qaidah_class_id', true ) );
        $description  = \get_post_meta( $post->ID, '_alfawz_qaidah_description', true );

        $image = null;

        if ( $image_id ) {
            $image_src = \wp_get_attachment_image_src( $image_id, 'large' );
            $image     = [
                'id'    => $image_id,
                'url'   => $image_src ? $image_src[0] : \wp_get_attachment_url( $image_id ),
                'width' => $image_src ? (int) $image_src[1] : null,
                'height'=> $image_src ? (int) $image_src[2] : null,
                'alt'   => \get_post_meta( $image_id, '_wp_attachment_image_alt', true ),
            ];
        }

        $prepared_hotspots = [];

        foreach ( $hotspots as $hotspot ) {
            $audio_id = isset( $hotspot['audio_id'] ) ? \absint( $hotspot['audio_id'] ) : 0;

            $prepared_hotspots[] = [
                'id'        => isset( $hotspot['id'] ) ? \sanitize_key( $hotspot['id'] ) : \uniqid( 'hotspot_', true ),
                'label'     => isset( $hotspot['label'] ) ? \sanitize_text_field( $hotspot['label'] ) : '',
                'x'         => $this->format_percentage( $hotspot['x'] ?? 0 ),
                'y'         => $this->format_percentage( $hotspot['y'] ?? 0 ),
                'width'     => $this->format_percentage( $hotspot['width'] ?? 0 ),
                'height'    => $this->format_percentage( $hotspot['height'] ?? 0 ),
                'audio_id'  => $audio_id,
                'audio_url' => $audio_id ? \wp_get_attachment_url( $audio_id ) : '',
            ];
        }

        $response = [
            'id'          => $post->ID,
            'title'       => \get_the_title( $post ),
            'image'       => $image,
            'hotspots'    => $prepared_hotspots,
            'students'    => array_map( '\absint', $student_ids ),
            'class'       => $class_id ? [
                'id'    => $class_id,
                'label' => $this->resolve_class_label( $class_id ),
            ] : null,
            'description' => $description ? \wp_kses_post( $description ) : '',
            'teacher'     => [
                'id'   => (int) $post->post_author,
                'name' => \get_the_author_meta( 'display_name', $post->post_author ),
            ],
            'updated'     => \get_post_modified_time( 'c', false, $post ),
        ];

        if ( 'manage' === $context ) {
            $response['student_details'] = $this->prepare_student_details( $student_ids );
        }

        return $response;
    }

    /**
     * Decode JSON stored meta safely.
     *
     * @param string $value Meta value.
     *
     * @return array
     */
    private function decode_meta_json( $value ) {
        if ( empty( $value ) ) {
            return [];
        }

        if ( is_array( $value ) ) {
            return $value;
        }

        $decoded = \json_decode( $value, true );

        return is_array( $decoded ) ? $decoded : [];
    }

    /**
     * Prepare student records for manage responses.
     *
     * @param array $student_ids List of student user IDs.
     *
     * @return array
     */
    private function prepare_student_details( $student_ids ) {
        $details = [];

        foreach ( (array) $student_ids as $student_id ) {
            $student_id = \absint( $student_id );

            if ( ! $student_id ) {
                continue;
            }

            $user = \get_userdata( $student_id );

            if ( ! $user ) {
                continue;
            }

            $details[] = [
                'id'          => $student_id,
                'name'        => $user->display_name,
                'email'       => $user->user_email,
                'avatar'      => \get_avatar_url( $student_id ),
                'role_labels' => $user->roles,
            ];
        }

        return $details;
    }

    /**
     * Normalize a class identifier into a safe string.
     *
     * @param mixed $value Raw class identifier.
     * @return string Sanitized identifier.
     */
    private function sanitize_class_id( $value ) {
        if ( is_array( $value ) ) {
            $value = reset( $value );
        }

        if ( is_numeric( $value ) ) {
            return (string) \absint( $value );
        }

        $value = (string) $value;

        if ( '' === $value ) {
            return '';
        }

        return \sanitize_text_field( $value );
    }

    /**
     * Retrieve a friendly label for a class identifier.
     *
     * @param string $class_id Class identifier.
     * @return string
     */
    private function resolve_class_label( $class_id ) {
        if ( '' === $class_id ) {
            return '';
        }

        $label = \apply_filters( 'alfawz_qaidah_class_label', '', $class_id );

        if ( ! empty( $label ) ) {
            return $label;
        }

        if ( is_numeric( $class_id ) ) {
            $term = \get_term( (int) $class_id, 'alfawz_class' );

            if ( $term && ! is_wp_error( $term ) ) {
                return $term->name;
            }
        }

        return \sprintf( \__( 'Class %s', 'alfawzquran' ), $class_id );
    }

    private function sanitize_percentage( $value ) {
        $number = $this->normalize_percentage_value( $value );

        return $this->format_percentage_value( $number );
    }

    private function format_percentage( $value ) {
        if ( is_string( $value ) && strpos( $value, '%' ) !== false ) {
            return $this->sanitize_percentage( $value );
        }

        $number = $this->normalize_percentage_value( $value );

        return $this->format_percentage_value( $number );
    }

    private function normalize_percentage_value( $value ) {
        if ( is_array( $value ) ) {
            $value = reset( $value );
        }

        if ( is_string( $value ) ) {
            $value = trim( str_replace( '%', '', $value ) );
        }

        if ( ! is_numeric( $value ) ) {
            return 0.0;
        }

        $number = (float) $value;

        if ( $number < 0 ) {
            $number = 0;
        }

        if ( $number > 100 ) {
            $number = 100;
        }

        return $number;
    }

    private function format_percentage_value( $number ) {
        $formatted = number_format( (float) $number, 2, '.', '' );
        $formatted = rtrim( rtrim( $formatted, '0' ), '.' );

        if ( '' === $formatted ) {
            $formatted = '0';
        }

        return $formatted . '%';
    }
}

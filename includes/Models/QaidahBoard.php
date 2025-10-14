<?php
namespace AlfawzQuran\Models;

use AlfawzQuran\Core\QaidahBoards;
use WP_Error;
use WP_Post;

/**
 * Data layer for managing Qa'idah practice boards and assignments.
 */
class QaidahBoard {
    /**
     * Persist a Qa'idah board and its metadata.
     *
     * @param array $data Sanitized board data.
     * @param int   $board_id Optional board ID when updating an existing record.
     *
     * @return int|WP_Error Post ID on success or WP_Error on failure.
     */
    public function save_board( array $data, $board_id = 0 ) {
        $title        = isset( $data['title'] ) ? \sanitize_text_field( $data['title'] ) : '';
        $image_id     = isset( $data['image_id'] ) ? \absint( $data['image_id'] ) : 0;
        $student_ids  = isset( $data['student_ids'] ) && is_array( $data['student_ids'] ) ? array_map( '\absint', $data['student_ids'] ) : [];
        $hotspots     = isset( $data['hotspots'] ) && is_array( $data['hotspots'] ) ? $data['hotspots'] : [];
        $author_id    = isset( $data['author_id'] ) ? \absint( $data['author_id'] ) : \get_current_user_id();

        if ( empty( $title ) ) {
            return new WP_Error( 'alfawz_missing_title', \__( 'A title is required for the Qa\'idah board.', 'alfawzquran' ) );
        }

        if ( ! $image_id ) {
            return new WP_Error( 'alfawz_missing_image', \__( 'Please select an image before saving the Qa\'idah board.', 'alfawzquran' ) );
        }

        if ( empty( $student_ids ) ) {
            return new WP_Error( 'alfawz_missing_students', \__( 'Select at least one student for this Qa\'idah board.', 'alfawzquran' ) );
        }

        $sanitized_hotspots = [];

        foreach ( $hotspots as $hotspot ) {
            $hotspot_id = isset( $hotspot['id'] ) ? \sanitize_key( $hotspot['id'] ) : \uniqid( 'hotspot_', true );

            $sanitized_hotspots[] = [
                'id'       => $hotspot_id,
                'label'    => isset( $hotspot['label'] ) ? \sanitize_text_field( $hotspot['label'] ) : '',
                'x'        => isset( $hotspot['x'] ) ? (float) $hotspot['x'] : 0,
                'y'        => isset( $hotspot['y'] ) ? (float) $hotspot['y'] : 0,
                'width'    => isset( $hotspot['width'] ) ? (float) $hotspot['width'] : 0,
                'height'   => isset( $hotspot['height'] ) ? (float) $hotspot['height'] : 0,
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

        $query_args = [
            'post_type'      => QaidahBoards::POST_TYPE,
            'posts_per_page' => -1,
            'post_status'    => 'publish',
            'meta_query'     => [
                [
                    'key'     => '_alfawz_qaidah_students',
                    'value'   => '"' . $user_id . '"',
                    'compare' => 'LIKE',
                ],
            ],
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
        $image_id    = (int) \get_post_meta( $post->ID, '_alfawz_qaidah_image_id', true );
        $hotspots    = $this->decode_meta_json( \get_post_meta( $post->ID, '_alfawz_qaidah_hotspots', true ) );
        $student_ids = $this->decode_meta_json( \get_post_meta( $post->ID, '_alfawz_qaidah_students', true ) );

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
                'x'         => isset( $hotspot['x'] ) ? (float) $hotspot['x'] : 0,
                'y'         => isset( $hotspot['y'] ) ? (float) $hotspot['y'] : 0,
                'width'     => isset( $hotspot['width'] ) ? (float) $hotspot['width'] : 0,
                'height'    => isset( $hotspot['height'] ) ? (float) $hotspot['height'] : 0,
                'audio_id'  => $audio_id,
                'audio_url' => $audio_id ? \wp_get_attachment_url( $audio_id ) : '',
            ];
        }

        $response = [
            'id'        => $post->ID,
            'title'     => \get_the_title( $post ),
            'image'     => $image,
            'hotspots'  => $prepared_hotspots,
            'students'  => array_map( '\absint', $student_ids ),
            'teacher'   => [
                'id'   => (int) $post->post_author,
                'name' => \get_the_author_meta( 'display_name', $post->post_author ),
            ],
            'updated'   => \get_post_modified_time( 'c', false, $post ),
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
}

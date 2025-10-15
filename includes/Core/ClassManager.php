<?php
namespace AlfawzQuran\Core;

/**
 * Register and maintain the Alfawz Class custom post type.
 */
class ClassManager {
    /**
     * Register the custom post type used for class management.
     */
    public function register_post_type() {
        $labels = [
            'name'               => __( 'Classes', 'alfawzquran' ),
            'singular_name'      => __( 'Class', 'alfawzquran' ),
            'add_new'            => __( 'Add New', 'alfawzquran' ),
            'add_new_item'       => __( 'Add New Class', 'alfawzquran' ),
            'edit_item'          => __( 'Edit Class', 'alfawzquran' ),
            'new_item'           => __( 'New Class', 'alfawzquran' ),
            'view_item'          => __( 'View Class', 'alfawzquran' ),
            'search_items'       => __( 'Search Classes', 'alfawzquran' ),
            'not_found'          => __( 'No classes found.', 'alfawzquran' ),
            'not_found_in_trash' => __( 'No classes found in Trash.', 'alfawzquran' ),
            'all_items'          => __( 'All Classes', 'alfawzquran' ),
            'menu_name'          => __( 'Classes', 'alfawzquran' ),
        ];

        $args = [
            'labels'             => $labels,
            'public'             => false,
            'show_ui'            => false,
            'show_in_menu'       => false,
            'capability_type'    => 'post',
            'supports'           => [ 'title', 'editor' ],
            'hierarchical'       => false,
            'rewrite'            => false,
            'query_var'          => false,
            'can_export'         => false,
        ];

        register_post_type( 'alfawz_class', $args );
    }

    /**
     * Ensure related data is cleaned up when a class is deleted.
     *
     * @param int $post_id Post identifier.
     */
    public function cleanup_assignments( $post_id ) {
        if ( 'alfawz_class' !== get_post_type( $post_id ) ) {
            return;
        }

        $teacher_id = (int) get_post_meta( $post_id, '_alfawz_class_teacher', true );

        if ( $teacher_id ) {
            $classes = get_user_meta( $teacher_id, 'alfawz_teacher_classes', true );
            if ( is_array( $classes ) ) {
                $classes = array_map( 'intval', $classes );
                $classes = array_filter( $classes, function ( $class_id ) use ( $post_id ) {
                    return (int) $class_id !== (int) $post_id;
                } );
                update_user_meta( $teacher_id, 'alfawz_teacher_classes', $classes );
            }
        }

        $students = get_users(
            [
                'meta_key'   => 'alfawz_class_id',
                'meta_value' => $post_id,
                'fields'     => 'ids',
            ]
        );

        foreach ( $students as $student_id ) {
            delete_user_meta( $student_id, 'alfawz_class_id' );
        }
    }
}

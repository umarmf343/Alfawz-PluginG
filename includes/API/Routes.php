<?php
namespace AlfawzQuran\API;

use AlfawzQuran\Models\QaidahBoard;
use AlfawzQuran\Models\UserProgress;
use WP_REST_Server;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Register REST API routes for the plugin.
 */
class Routes {

    /**
     * Base URL for the external Quran API.
     */
    const API_BASE = 'https://api.alquran.cloud/v1';

    /**
     * Default number of verses for the daily goal.
     */
    const DAILY_GOAL_TARGET = 10;

    /**
     * User meta keys for the daily recitation goal.
     */
    const DAILY_GOAL_META_COUNT          = 'daily_recited_verses';
    const DAILY_GOAL_META_LOG            = 'alfawz_daily_recited_verses_log';
    const DAILY_GOAL_META_LAST_RESET     = 'alfawz_daily_goal_last_reset';
    const DAILY_GOAL_META_LAST_COMPLETION = 'alfawz_daily_goal_last_completion';

    /**
     * User meta keys for the egg challenge.
     */
    const EGG_CHALLENGE_COUNT_META      = 'egg_challenge_current_count';
    const EGG_CHALLENGE_TARGET_META     = 'egg_challenge_target';
    const EGG_CHALLENGE_LAST_TARGET_META = 'alfawz_egg_last_completion_target';

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
        add_action( 'alfawz_quran_daily_cron', [ $this, 'calculate_daily_streaks' ] );
    }

    /**
     * Register the REST API routes.
     */
    public function register_routes() {
        $namespace = 'alfawzquran/v1';
        
        // Test endpoint
        register_rest_route($namespace, '/test', [
            'methods' => 'GET',
            'callback' => [$this, 'test_endpoint'],
            'permission_callback' => '__return_true'
        ]);
        
        // Get surahs - Updated to use AlQuran.cloud directly
        register_rest_route($namespace, '/surahs', [
            'methods' => 'GET',
            'callback' => [$this, 'get_surahs'],
            'permission_callback' => '__return_true'
        ]);
        
        // Get verses - Updated to use AlQuran.cloud directly
        register_rest_route($namespace, '/surahs/(?P<id>\d+)/verses', [
            'methods' => 'GET',
            'callback' => [$this, 'get_verses'],
            'permission_callback' => '__return_true',
            'args' => [
                'id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ]
            ]
        ]);

        register_rest_route($namespace, '/surahs/(?P<id>\d+)/verses/(?P<num>\d+)', [
            'methods'  => 'GET',
            'callback' => [$this, 'get_single_verse'],
            'permission_callback' => '__return_true',
            'args'     => [
                'id'  => [
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    },
                ],
                'num' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    },
                ],
            ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/progress', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'update_user_progress' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/user-stats', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_user_stats' ],
            'permission_callback' => [ $this, 'check_permission' ],
            'args'                => [
                'timezone_offset' => [
                    'validate_callback' => function( $param ) {
                        return is_numeric( $param ) || '' === $param || null === $param;
                    },
                ],
            ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/leaderboard', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_leaderboard' ],
            'permission_callback' => '__return_true', // Public endpoint
        ]);

        register_rest_route( 'alfawzquran/v1', '/bookmarks', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_user_bookmarks' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/bookmarks', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'add_user_bookmark' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/bookmarks/(?P<id>\d+)', [
            'methods'             => 'DELETE',
            'callback'            => [ $this, 'delete_user_bookmark' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/memorization-plans', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_memorization_plans' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/memorization-plans', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'create_memorization_plan' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/memorization-plans/(?P<id>\d+)', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_single_memorization_plan' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/memorization-plans/(?P<id>\d+)', [
            'methods'             => 'DELETE',
            'callback'            => [ $this, 'delete_memorization_plan' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/memorization-plans/(?P<id>\d+)/progress', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'update_memorization_plan_progress' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/memorization-plans/(?P<id>\d+)/restart', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'restart_memorization_plan' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);

        register_rest_route(
            $namespace,
            '/recitation-goal',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_daily_recitation_goal' ],
                'permission_callback' => [ $this, 'check_permission' ],
                'args'                => [
                    'timezone_offset' => [
                        'validate_callback' => function( $param ) {
                            return is_numeric( $param ) || '' === $param || null === $param;
                        },
                    ],
                ],
            ]
        );

        register_rest_route(
            $namespace,
            '/verse-progress',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'track_verse_progress' ],
                'permission_callback' => [ $this, 'check_permission' ],
                'args'                => [
                    'verse_key'       => [
                        'required'          => true,
                        'validate_callback' => function( $param ) {
                            return is_string( $param ) && '' !== trim( $param );
                        },
                    ],
                    'timezone_offset' => [
                        'validate_callback' => function( $param ) {
                            return is_numeric( $param ) || '' === $param || null === $param;
                        },
                    ],
                ],
            ]
        );

        register_rest_route(
            $namespace,
            '/egg-challenge',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_egg_challenge_state' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'increment_egg_challenge_endpoint' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

        register_rest_route(
            $namespace,
            '/egg-challenge/progress',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_egg_challenge_overview' ],
                'permission_callback' => [ $this, 'teacher_permission_callback' ],
            ]
        );

        register_rest_route( 'alfawzquran/v1', '/stats', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_admin_stats' ],
            'permission_callback' => function() {
                return current_user_can( 'manage_options' );
            },
        ]);

        register_rest_route( $namespace, '/qaidah/classes', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_qaidah_classes' ],
            'permission_callback' => [ $this, 'teacher_permission_callback' ],
        ] );

        register_rest_route( $namespace, '/qaidah/students', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_qaidah_students' ],
            'permission_callback' => [ $this, 'teacher_permission_callback' ],
        ] );

        register_rest_route( $namespace, '/qaidah/audio', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'upload_qaidah_audio' ],
            'permission_callback' => [ $this, 'teacher_permission_callback' ],
        ] );

        register_rest_route( $namespace, '/qaidah/boards', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_qaidah_boards' ],
                'permission_callback' => [ $this, 'check_permission' ],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'create_qaidah_board' ],
                'permission_callback' => [ $this, 'teacher_permission_callback' ],
            ],
        ] );

        register_rest_route( $namespace, '/qaidah/assignments', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_qaidah_boards' ],
                'permission_callback' => [ $this, 'check_permission' ],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'create_qaidah_board' ],
                'permission_callback' => [ $this, 'teacher_permission_callback' ],
            ],
        ] );

        register_rest_route( $namespace, '/qaidah/boards/(?P<id>\d+)', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_single_qaidah_board' ],
                'permission_callback' => [ $this, 'teacher_permission_callback' ],
            ],
            [
                'methods'             => 'PUT',
                'callback'            => [ $this, 'update_qaidah_board' ],
                'permission_callback' => [ $this, 'teacher_permission_callback' ],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [ $this, 'delete_qaidah_board' ],
                'permission_callback' => [ $this, 'teacher_permission_callback' ],
            ],
        ] );

        register_rest_route( $namespace, '/qaidah/assignments/(?P<id>\d+)', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_single_qaidah_board' ],
                'permission_callback' => [ $this, 'teacher_permission_callback' ],
            ],
            [
                'methods'             => 'PUT',
                'callback'            => [ $this, 'update_qaidah_board' ],
                'permission_callback' => [ $this, 'teacher_permission_callback' ],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [ $this, 'delete_qaidah_board' ],
                'permission_callback' => [ $this, 'teacher_permission_callback' ],
            ],
        ] );

        register_rest_route( $namespace, '/teacher/classes', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_teacher_classes_overview' ],
            'permission_callback' => [ $this, 'teacher_permission_callback' ],
        ] );
    }

    /**
     * Check if the user is logged in.
     */
    public function check_permission( \WP_REST_Request $request ) {
        return is_user_logged_in();
    }

    /**
     * Check whether the user can manage Qa'idah boards.
     */
    public function teacher_permission_callback( WP_REST_Request $request ) {
        return $this->current_user_is_teacher();
    }

    /**
     * Ensure the current request is made by an administrator or privileged staff.
     */
    public function admin_permission_callback( WP_REST_Request $request ) {
        return current_user_can( 'manage_options' ) || current_user_can( 'alfawz_admin' );
    }

    /**
     * Update user progress (read or memorized).
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response
     */
    public function update_user_progress( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        $surah_id = $request->get_param( 'surah_id' );
        $verse_id = $request->get_param( 'verse_id' );
        $progress_type = $request->get_param( 'progress_type' ); // 'read' or 'memorized'
        $hasanat = $request->get_param( 'hasanat' );
        $repetition_count = $request->get_param( 'repetition_count' );

        if ( empty( $user_id ) || empty( $surah_id ) || empty( $verse_id ) || empty( $progress_type ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Missing required parameters.' ], 400 );
        }

        $progress_model = new UserProgress();
        $result = $progress_model->add_progress( $user_id, $surah_id, $verse_id, $progress_type, $hasanat, $repetition_count );

        if ( $result ) {
            return new \WP_REST_Response( [ 'success' => true, 'message' => 'Progress updated successfully.' ], 200 );
        } else {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Failed to update progress.' ], 500 );
        }
    }

    /**
     * Get user statistics.
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response
     */
    public function get_user_stats( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        if ( empty( $user_id ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'User not logged in.' ], 401 );
        }

        $timezone_offset = $request->get_param( 'timezone_offset' );
        $progress_model = new UserProgress();
        $stats = $progress_model->get_user_stats( $user_id );

        // Add user display name and avatar
        $user_data = get_userdata( $user_id );
        $stats['display_name'] = $user_data ? $user_data->display_name : 'Guest';
        $stats['avatar_url'] = get_avatar_url( $user_id );
        $stats['member_since'] = $user_data ? date( 'M Y', strtotime( $user_data->user_registered ) ) : 'N/A';
        $stats['daily_goal'] = $this->prepare_daily_goal_state( $user_id, $timezone_offset );

        return new \WP_REST_Response( $stats, 200 );
    }

    /**
     * Provide administrators with a high-level system overview.
     */
    public function get_admin_overview( WP_REST_Request $request ) {
        $counts        = count_users();
        $role_counts   = isset( $counts['avail_roles'] ) ? (array) $counts['avail_roles'] : [];
        $total_students = isset( $role_counts['student'] ) ? (int) $role_counts['student'] : 0;
        $total_teachers = isset( $role_counts['teacher'] ) ? (int) $role_counts['teacher'] : 0;

        $class_counts = wp_count_posts( 'alfawz_class' );
        $total_classes = $class_counts && isset( $class_counts->publish ) ? (int) $class_counts->publish : 0;

        global $wpdb;
        $plan_table   = $wpdb->prefix . 'alfawz_quran_memorization_plans';
        $active_plans = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$plan_table} WHERE status = %s", 'active' ) );

        $qaidah_type   = \AlfawzQuran\Core\QaidahBoards::POST_TYPE;
        $qaidah_counts = wp_count_posts( $qaidah_type );
        $recent_qaidah = $qaidah_counts && isset( $qaidah_counts->publish ) ? (int) $qaidah_counts->publish : 0;

        return new WP_REST_Response(
            [
                'total_students' => $total_students,
                'total_teachers' => $total_teachers,
                'total_classes'  => $total_classes,
                'active_plans'   => $active_plans,
                'recent_qaidah'  => $recent_qaidah,
            ],
            200
        );
    }

    /**
     * Return all classes for the administrator dashboard.
     */
    public function get_admin_classes( WP_REST_Request $request ) {
        $classes = get_posts(
            [
                'post_type'      => 'alfawz_class',
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'orderby'        => 'title',
                'order'          => 'ASC',
            ]
        );

        $data = array_map( function ( $post ) {
            return $this->prepare_class_payload( $post->ID );
        }, $classes );

        return new WP_REST_Response(
            [
                'classes' => array_values( array_filter( $data ) ),
            ],
            200
        );
    }

    /**
     * Create a new class.
     */
    public function create_admin_class( WP_REST_Request $request ) {
        $nonce = $this->verify_action_nonce( $request, 'alfawz_admin_classes' );
        if ( is_wp_error( $nonce ) ) {
            return $nonce;
        }

        $params      = $request->get_json_params();
        $name        = isset( $params['name'] ) ? sanitize_text_field( $params['name'] ) : '';
        $description = isset( $params['description'] ) ? wp_kses_post( $params['description'] ) : '';
        $teacher_id  = isset( $params['teacher_id'] ) ? absint( $params['teacher_id'] ) : 0;

        if ( '' === $name ) {
            return new WP_Error( 'rest_invalid_param', __( 'Class name is required.', 'alfawzquran' ), [ 'status' => 400 ] );
        }

        $post_id = wp_insert_post(
            [
                'post_type'    => 'alfawz_class',
                'post_status'  => 'publish',
                'post_title'   => $name,
                'post_content' => $description,
            ],
            true
        );

        if ( is_wp_error( $post_id ) ) {
            return $post_id;
        }

        if ( $teacher_id ) {
            $this->assign_teacher_to_class( $post_id, $teacher_id );
        } else {
            delete_post_meta( $post_id, '_alfawz_class_teacher' );
        }

        return new WP_REST_Response(
            [
                'class' => $this->prepare_class_payload( $post_id ),
            ],
            201
        );
    }

    /**
     * Update an existing class record.
     */
    public function update_admin_class( WP_REST_Request $request ) {
        $nonce = $this->verify_action_nonce( $request, 'alfawz_admin_classes' );
        if ( is_wp_error( $nonce ) ) {
            return $nonce;
        }

        $class_id = absint( $request->get_param( 'id' ) );
        $post     = get_post( $class_id );

        if ( ! $post || 'alfawz_class' !== $post->post_type ) {
            return new WP_Error( 'rest_class_not_found', __( 'Class not found.', 'alfawzquran' ), [ 'status' => 404 ] );
        }

        $params      = $request->get_json_params();
        $name        = isset( $params['name'] ) ? sanitize_text_field( $params['name'] ) : $post->post_title;
        $description = isset( $params['description'] ) ? wp_kses_post( $params['description'] ) : $post->post_content;
        $teacher_id  = isset( $params['teacher_id'] ) ? absint( $params['teacher_id'] ) : 0;

        $update = wp_update_post(
            [
                'ID'           => $class_id,
                'post_title'   => $name,
                'post_content' => $description,
            ],
            true
        );

        if ( is_wp_error( $update ) ) {
            return $update;
        }

        if ( $teacher_id ) {
            $this->assign_teacher_to_class( $class_id, $teacher_id );
        } else {
            $this->remove_teacher_from_class( $class_id );
        }

        return new WP_REST_Response(
            [
                'class' => $this->prepare_class_payload( $class_id ),
            ],
            200
        );
    }

    /**
     * Delete a class and release relationships.
     */
    public function delete_admin_class( WP_REST_Request $request ) {
        $nonce = $this->verify_action_nonce( $request, 'alfawz_admin_classes' );
        if ( is_wp_error( $nonce ) ) {
            return $nonce;
        }

        $class_id = absint( $request->get_param( 'id' ) );
        $post     = get_post( $class_id );

        if ( ! $post || 'alfawz_class' !== $post->post_type ) {
            return new WP_Error( 'rest_class_not_found', __( 'Class not found.', 'alfawzquran' ), [ 'status' => 404 ] );
        }

        $this->remove_teacher_from_class( $class_id );

        $students = get_users(
            [
                'meta_key'   => 'alfawz_class_id',
                'meta_value' => $class_id,
                'fields'     => 'ids',
            ]
        );

        foreach ( $students as $student_id ) {
            delete_user_meta( $student_id, 'alfawz_class_id' );
        }

        $deleted = wp_delete_post( $class_id, true );

        if ( ! $deleted ) {
            return new WP_Error( 'rest_cannot_delete', __( 'Unable to delete class.', 'alfawzquran' ), [ 'status' => 500 ] );
        }

        return new WP_REST_Response( [ 'deleted' => true ], 200 );
    }

    /**
     * Update student enrollment for a class.
     */
    public function update_admin_class_students( WP_REST_Request $request ) {
        $nonce = $this->verify_action_nonce( $request, 'alfawz_admin_classes' );
        if ( is_wp_error( $nonce ) ) {
            return $nonce;
        }

        $class_id = absint( $request->get_param( 'id' ) );
        $post     = get_post( $class_id );

        if ( ! $post || 'alfawz_class' !== $post->post_type ) {
            return new WP_Error( 'rest_class_not_found', __( 'Class not found.', 'alfawzquran' ), [ 'status' => 404 ] );
        }

        $params      = $request->get_json_params();
        $student_ids = isset( $params['student_ids'] ) ? (array) $params['student_ids'] : [];
        $student_ids = array_values( array_unique( array_map( 'absint', $student_ids ) ) );

        $current_students = get_users(
            [
                'meta_key'   => 'alfawz_class_id',
                'meta_value' => $class_id,
                'fields'     => 'ids',
            ]
        );

        foreach ( $current_students as $student_id ) {
            if ( ! in_array( $student_id, $student_ids, true ) ) {
                delete_user_meta( $student_id, 'alfawz_class_id' );
            }
        }

        foreach ( $student_ids as $student_id ) {
            if ( get_userdata( $student_id ) ) {
                update_user_meta( $student_id, 'alfawz_class_id', $class_id );
            }
        }

        return new WP_REST_Response(
            [
                'class' => $this->prepare_class_payload( $class_id ),
            ],
            200
        );
    }

    /**
     * Return users for administrative role management.
     */
    public function get_admin_users( WP_REST_Request $request ) {
        $role   = sanitize_text_field( $request->get_param( 'role' ) );
        $search = sanitize_text_field( $request->get_param( 'search' ) );

        $args = [
            'number'     => 100,
            'orderby'    => 'display_name',
            'order'      => 'ASC',
            'fields'     => [ 'ID', 'display_name', 'user_email', 'roles' ],
        ];

        if ( $role && 'all' !== $role ) {
            if ( 'student' === $role ) {
                $args['role__in'] = [ 'student', 'subscriber' ];
            } elseif ( 'teacher' === $role ) {
                $args['role__in'] = [ 'teacher' ];
            } else {
                $args['role__in'] = [ $role ];
            }
        }

        if ( $search ) {
            $args['search']          = '*' . $search . '*';
            $args['search_columns']  = [ 'user_login', 'user_email', 'display_name' ];
        }

        $users = get_users( $args );

        $data = array_values( array_filter( array_map( function ( $user ) {
            return $this->prepare_user_payload( $user );
        }, $users ) ) );

        return new WP_REST_Response(
            [
                'users' => $data,
            ],
            200
        );
    }

    /**
     * Update a user's primary role.
     */
    public function update_admin_user_role( WP_REST_Request $request ) {
        $nonce = $this->verify_action_nonce( $request, 'alfawz_admin_users' );
        if ( is_wp_error( $nonce ) ) {
            return $nonce;
        }

        $user_id = absint( $request->get_param( 'id' ) );
        $user    = get_userdata( $user_id );

        if ( ! $user ) {
            return new WP_Error( 'rest_user_not_found', __( 'User not found.', 'alfawzquran' ), [ 'status' => 404 ] );
        }

        $params = $request->get_json_params();
        $role   = isset( $params['role'] ) ? sanitize_text_field( $params['role'] ) : '';

        $allowed_roles = apply_filters( 'alfawz_admin_allowed_roles', [ 'student', 'teacher', 'subscriber' ] );

        if ( ! in_array( $role, $allowed_roles, true ) ) {
            return new WP_Error( 'rest_invalid_role', __( 'Invalid role supplied.', 'alfawzquran' ), [ 'status' => 400 ] );
        }

        $updated = wp_update_user(
            [
                'ID'   => $user_id,
                'role' => $role,
            ]
        );

        if ( is_wp_error( $updated ) ) {
            return $updated;
        }

        return new WP_REST_Response(
            [
                'user' => $this->prepare_user_payload( get_userdata( $user_id ) ),
            ],
            200
        );
    }

    /**
     * Return the current plugin settings relevant to the admin dashboard.
     */
    public function get_admin_settings( WP_REST_Request $request ) {
        return new WP_REST_Response(
            [
                'alfawz_enable_leaderboard'   => (int) get_option( 'alfawz_enable_leaderboard', 1 ),
                'alfawz_enable_egg_challenge' => (int) get_option( 'alfawz_enable_egg_challenge', 1 ),
                'alfawz_daily_verse_target'   => (int) get_option( 'alfawz_daily_verse_target', 10 ),
            ],
            200
        );
    }

    /**
     * Persist plugin settings from the admin dashboard.
     */
    public function save_admin_settings( WP_REST_Request $request ) {
        $nonce = $this->verify_action_nonce( $request, 'alfawz_admin_settings' );
        if ( is_wp_error( $nonce ) ) {
            return $nonce;
        }

        $params = $request->get_json_params();

        $leaderboard = ! empty( $params['alfawz_enable_leaderboard'] ) ? 1 : 0;
        $egg         = ! empty( $params['alfawz_enable_egg_challenge'] ) ? 1 : 0;
        $daily_goal  = isset( $params['alfawz_daily_verse_target'] ) ? max( 1, absint( $params['alfawz_daily_verse_target'] ) ) : 10;

        update_option( 'alfawz_enable_leaderboard', $leaderboard );
        update_option( 'alfawz_enable_egg_challenge', $egg );
        update_option( 'alfawz_daily_verse_target', $daily_goal );

        return $this->get_admin_settings( $request );
    }

    /**
     * Return the classes assigned to the current teacher.
     */
    public function get_qaidah_classes( WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new WP_REST_Response( [], 200 );
        }

        $class_ids = $this->get_classes_for_user( $user_id );

        $classes = array_map( function ( $class_id ) {
            return [
                'id'    => $class_id,
                'label' => $this->resolve_class_label( $class_id ),
            ];
        }, $class_ids );

        return new WP_REST_Response( $classes, 200 );
    }

    /**
     * Return students eligible for Qa'idah board assignments.
     */
    public function get_qaidah_students( WP_REST_Request $request ) {
        $class_id = $this->normalize_class_id( $request->get_param( 'class_id' ) );
        $roles    = apply_filters( 'alfawz_qaidah_student_roles', [ 'student', 'subscriber' ] );

        if ( $class_id && ! $this->current_user_can_access_class( get_current_user_id(), $class_id ) ) {
            return new WP_REST_Response( [], 200 );
        }

        $args = [
            'role__in' => $roles,
            'orderby'  => 'display_name',
            'order'    => 'ASC',
        ];

        if ( $class_id ) {
            $args['meta_query'] = [
                [
                    'key'     => 'alfawz_class_id',
                    'value'   => $class_id,
                    'compare' => '=',
                ],
            ];
        }

        $users = get_users( $args );

        $students = array_map( function ( $user ) use ( $class_id ) {
            return [
                'id'        => (int) $user->ID,
                'name'      => $user->display_name,
                'email'     => $user->user_email,
                'class_id'  => \get_user_meta( $user->ID, 'alfawz_class_id', true ),
                'avatar'    => \get_avatar_url( $user->ID ),
                'is_assigned'=> $class_id ? ( \get_user_meta( $user->ID, 'alfawz_class_id', true ) === $class_id ) : false,
            ];
        }, $users );

        return new WP_REST_Response( $students, 200 );
    }

    /**
     * Handle audio uploads for Qa'idah hotspots.
     */
    public function upload_qaidah_audio( WP_REST_Request $request ) {
        $files = $request->get_file_params();

        if ( empty( $files['audio'] ) || ! empty( $files['audio']['error'] ) ) {
            return new WP_Error( 'alfawz_audio_upload_error', \__( 'Audio file is required.', 'alfawzquran' ), [ 'status' => 400 ] );
        }

        $audio = $files['audio'];

        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $allowed_types = [
            'audio/webm',
            'audio/wav',
            'audio/mpeg',
            'audio/mp4',
            'audio/ogg',
        ];

        $overrides = [
            'test_form' => false,
            'mimes'     => [
                'webm' => 'audio/webm',
                'wav'  => 'audio/wav',
                'mp3'  => 'audio/mpeg',
                'm4a'  => 'audio/mp4',
                'ogg'  => 'audio/ogg',
                'oga'  => 'audio/ogg',
            ],
        ];

        $uploaded = wp_handle_upload( $audio, $overrides );

        if ( isset( $uploaded['error'] ) ) {
            return new WP_Error( 'alfawz_audio_upload_error', $uploaded['error'], [ 'status' => 400 ] );
        }

        if ( ! in_array( $uploaded['type'], $allowed_types, true ) ) {
            return new WP_Error( 'alfawz_audio_upload_error', \__( 'Unsupported audio format.', 'alfawzquran' ), [ 'status' => 400 ] );
        }

        $attachment = [
            'post_mime_type' => $uploaded['type'],
            'post_title'     => sanitize_file_name( pathinfo( $uploaded['file'], PATHINFO_FILENAME ) ),
            'post_content'   => '',
            'post_status'    => 'inherit',
        ];

        $attach_id = wp_insert_attachment( $attachment, $uploaded['file'] );

        if ( is_wp_error( $attach_id ) ) {
            return new WP_Error( 'alfawz_audio_upload_error', \__( 'Unable to save audio file.', 'alfawzquran' ), [ 'status' => 500 ] );
        }

        $metadata = wp_generate_attachment_metadata( $attach_id, $uploaded['file'] );
        wp_update_attachment_metadata( $attach_id, $metadata );

        return new WP_REST_Response(
            [
                'id'  => (int) $attach_id,
                'url' => wp_get_attachment_url( $attach_id ),
            ],
            201
        );
    }

    /**
     * Retrieve Qa'idah boards for the current user.
     */
    public function get_qaidah_boards( WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new WP_REST_Response( [], 200 );
        }

        $context = $request->get_param( 'context' );
        $model   = new QaidahBoard();

        if ( 'manage' === $context && $this->current_user_is_teacher() ) {
            $author_id = current_user_can( 'manage_options' ) ? 0 : $user_id;
            $boards    = $model->get_boards_for_teacher( $author_id );
        } else {
            $boards = $model->get_boards_for_student( $user_id );
        }

        return new WP_REST_Response( $boards, 200 );
    }

    /**
     * Provide a high-level overview of classes assigned to the current teacher.
     */
    public function get_teacher_classes_overview( WP_REST_Request $request ) {
        $current_user_id = get_current_user_id();

        if ( ! $current_user_id ) {
            return new WP_REST_Response( [], 200 );
        }

        $teacher_id = $current_user_id;
        $requested_teacher = absint( $request->get_param( 'teacher_id' ) );

        if ( $requested_teacher && $requested_teacher !== $current_user_id && ! current_user_can( 'manage_options' ) ) {
            return new WP_REST_Response( [ 'message' => __( 'You are not allowed to view these classes.', 'alfawzquran' ) ], 403 );
        }

        if ( $requested_teacher && current_user_can( 'manage_options' ) ) {
            $teacher_id = $requested_teacher;
        }

        $roster = $this->collect_teacher_roster( $teacher_id );

        if ( empty( $roster['classes'] ) ) {
            return new WP_REST_Response( [], 200 );
        }

        $response = [];

        foreach ( $roster['classes'] as $class_id => $class_data ) {
            $student_ids    = isset( $class_data['students'] ) ? (array) $class_data['students'] : [];
            $student_preview = array_slice( array_map( function( $student_id ) use ( $roster ) {
                $student = $roster['students'][ $student_id ] ?? null;

                if ( ! $student ) {
                    return null;
                }

                return [
                    'id'     => $student['id'],
                    'name'   => $student['name'],
                    'avatar' => $student['avatar'],
                    'streak' => $student['streak'],
                ];
            }, $student_ids ), 0, 3 );

            $student_preview = array_values( array_filter( $student_preview ) );

            $response[] = [
                'id'            => $class_data['id'],
                'label'         => $class_data['label'],
                'student_count' => count( $student_ids ),
                'students'      => $student_preview,
                'anchor'        => 'class-' . sanitize_title( $class_data['id'] ),
            ];
        }

        return new WP_REST_Response( $response, 200 );
    }

    /**
     * Retrieve a single Qa'idah board.
     */
    public function get_single_qaidah_board( WP_REST_Request $request ) {
        $board_id = (int) $request['id'];
        $post     = get_post( $board_id );

        if ( ! $post || QaidahBoard::POST_TYPE !== $post->post_type ) {
            return new WP_REST_Response( [ 'message' => \__( 'Board not found.', 'alfawzquran' ) ], 404 );
        }

        if ( ! $this->can_manage_board( $post ) ) {
            return new WP_REST_Response( [ 'message' => \__( 'You cannot access this board.', 'alfawzquran' ) ], 403 );
        }

        $model  = new QaidahBoard();
        $board  = $model->prepare_board_for_response( $post, 'manage' );

        return new WP_REST_Response( $board, 200 );
    }

    /**
     * Create a new Qa'idah board.
     */
    public function create_qaidah_board( WP_REST_Request $request ) {
        $data  = $request->get_json_params();
        $model = new QaidahBoard();

        $result = $model->save_board(
            [
                'title'       => $data['title'] ?? '',
                'image_id'    => $data['image_id'] ?? 0,
                'student_ids' => $data['student_ids'] ?? [],
                'class_id'    => $data['class_id'] ?? '',
                'description' => $data['description'] ?? '',
                'hotspots'    => $data['hotspots'] ?? [],
                'author_id'   => get_current_user_id(),
            ]
        );

        if ( is_wp_error( $result ) ) {
            return new WP_REST_Response( [ 'message' => $result->get_error_message() ], 400 );
        }

        $post  = get_post( $result );
        $board = $model->prepare_board_for_response( $post, 'manage' );

        return new WP_REST_Response( $board, 201 );
    }

    /**
     * Update an existing Qa'idah board.
     */
    public function update_qaidah_board( WP_REST_Request $request ) {
        $board_id = (int) $request['id'];
        $post     = get_post( $board_id );

        if ( ! $post || QaidahBoard::POST_TYPE !== $post->post_type ) {
            return new WP_REST_Response( [ 'message' => \__( 'Board not found.', 'alfawzquran' ) ], 404 );
        }

        if ( ! $this->can_manage_board( $post ) ) {
            return new WP_REST_Response( [ 'message' => \__( 'You cannot modify this board.', 'alfawzquran' ) ], 403 );
        }

        $data  = $request->get_json_params();
        $model = new QaidahBoard();

        $result = $model->save_board(
            [
                'title'       => $data['title'] ?? $post->post_title,
                'image_id'    => $data['image_id'] ?? (int) get_post_meta( $post->ID, '_alfawz_qaidah_image_id', true ),
                'student_ids' => $data['student_ids'] ?? [],
                'class_id'    => $data['class_id'] ?? get_post_meta( $post->ID, '_alfawz_qaidah_class_id', true ),
                'description' => $data['description'] ?? get_post_meta( $post->ID, '_alfawz_qaidah_description', true ),
                'hotspots'    => $data['hotspots'] ?? [],
                'author_id'   => (int) $post->post_author,
            ],
            $board_id
        );

        if ( is_wp_error( $result ) ) {
            return new WP_REST_Response( [ 'message' => $result->get_error_message() ], 400 );
        }

        $updated_post = get_post( $result );
        $board        = $model->prepare_board_for_response( $updated_post, 'manage' );

        return new WP_REST_Response( $board, 200 );
    }

    /**
     * Delete a Qa'idah board.
     */
    public function delete_qaidah_board( WP_REST_Request $request ) {
        $board_id = (int) $request['id'];
        $post     = get_post( $board_id );

        if ( ! $post || QaidahBoard::POST_TYPE !== $post->post_type ) {
            return new WP_REST_Response( [ 'message' => \__( 'Board not found.', 'alfawzquran' ) ], 404 );
        }

        if ( ! $this->can_manage_board( $post ) ) {
            return new WP_REST_Response( [ 'message' => \__( 'You cannot delete this board.', 'alfawzquran' ) ], 403 );
        }

        wp_delete_post( $board_id, true );

        return new WP_REST_Response( null, 204 );
    }

    /**
     * Verify an admin action nonce embedded in REST payloads.
     */
    private function verify_action_nonce( WP_REST_Request $request, $action ) {
        $nonce = $this->get_request_nonce( $request );

        if ( ! $nonce || ! wp_verify_nonce( $nonce, $action ) ) {
            return new WP_Error( 'rest_forbidden', __( 'Security check failed.', 'alfawzquran' ), [ 'status' => 403 ] );
        }

        return true;
    }

    /**
     * Extract the nonce from JSON or request parameters.
     */
    private function get_request_nonce( WP_REST_Request $request ) {
        $nonce = $request->get_param( 'nonce' );

        if ( null === $nonce ) {
            $json_params = $request->get_json_params();
            if ( is_array( $json_params ) && isset( $json_params['nonce'] ) ) {
                $nonce = $json_params['nonce'];
            }
        }

        return $nonce;
    }

    /**
     * Prepare a class payload for REST responses.
     */
    private function prepare_class_payload( $class_id ) {
        $post = get_post( $class_id );

        if ( ! $post || 'alfawz_class' !== $post->post_type ) {
            return null;
        }

        $teacher_id = (int) get_post_meta( $class_id, '_alfawz_class_teacher', true );
        $teacher    = null;

        if ( $teacher_id ) {
            $teacher_user = get_userdata( $teacher_id );

            if ( $teacher_user ) {
                $teacher = [
                    'id'    => (int) $teacher_user->ID,
                    'name'  => $teacher_user->display_name,
                    'email' => $teacher_user->user_email,
                ];
            }
        }

        $students = get_users(
            [
                'meta_key'   => 'alfawz_class_id',
                'meta_value' => $class_id,
                'orderby'    => 'display_name',
                'order'      => 'ASC',
                'fields'     => [ 'ID', 'display_name', 'user_email' ],
            ]
        );

        $student_data = array_map(
            function ( $student ) {
                return [
                    'id'    => (int) $student->ID,
                    'name'  => $student->display_name,
                    'email' => $student->user_email,
                ];
            },
            $students
        );

        return [
            'id'          => (int) $class_id,
            'name'        => $post->post_title,
            'description' => $post->post_content,
            'teacher'     => $teacher,
            'students'    => $student_data,
        ];
    }

    /**
     * Assign a teacher to the provided class.
     */
    private function assign_teacher_to_class( $class_id, $teacher_id ) {
        $teacher = get_userdata( $teacher_id );

        if ( ! $teacher ) {
            return;
        }

        $previous_teacher = (int) get_post_meta( $class_id, '_alfawz_class_teacher', true );

        if ( $previous_teacher && $previous_teacher !== $teacher_id ) {
            $this->detach_class_from_teacher( $previous_teacher, $class_id );
        }

        update_post_meta( $class_id, '_alfawz_class_teacher', $teacher_id );

        $classes = get_user_meta( $teacher_id, 'alfawz_teacher_classes', true );

        if ( ! is_array( $classes ) ) {
            $classes = [];
        }

        $classes[] = (int) $class_id;

        update_user_meta( $teacher_id, 'alfawz_teacher_classes', array_values( array_unique( array_map( 'intval', $classes ) ) ) );
    }

    /**
     * Remove the assigned teacher from a class.
     */
    private function remove_teacher_from_class( $class_id ) {
        $teacher_id = (int) get_post_meta( $class_id, '_alfawz_class_teacher', true );

        if ( $teacher_id ) {
            $this->detach_class_from_teacher( $teacher_id, $class_id );
        }

        delete_post_meta( $class_id, '_alfawz_class_teacher' );
    }

    /**
     * Detach class mapping from a teacher meta record.
     */
    private function detach_class_from_teacher( $teacher_id, $class_id ) {
        $classes = get_user_meta( $teacher_id, 'alfawz_teacher_classes', true );

        if ( ! is_array( $classes ) ) {
            return;
        }

        $classes = array_map( 'intval', $classes );
        $classes = array_values(
            array_filter(
                $classes,
                function ( $value ) use ( $class_id ) {
                    return (int) $value !== (int) $class_id;
                }
            )
        );

        update_user_meta( $teacher_id, 'alfawz_teacher_classes', $classes );
    }

    /**
     * Prepare user data for REST responses.
     */
    private function prepare_user_payload( $user ) {
        $user_object = $user instanceof \WP_User ? $user : get_userdata( $user );

        if ( ! $user_object ) {
            return null;
        }

        $class_id = get_user_meta( $user_object->ID, 'alfawz_class_id', true );

        $class = null;

        if ( $class_id ) {
            $class = [
                'id'    => is_numeric( $class_id ) ? (int) $class_id : $class_id,
                'label' => $this->resolve_class_label( $class_id ),
            ];
        }

        return [
            'id'    => (int) $user_object->ID,
            'name'  => $user_object->display_name,
            'email' => $user_object->user_email,
            'roles' => array_values( (array) $user_object->roles ),
            'class' => $class,
        ];
    }

    /**
     * Determine whether the current user can manage Qa'idah boards.
     */
    private function current_user_is_teacher() {
        if ( ! is_user_logged_in() ) {
            return false;
        }

        if ( current_user_can( 'manage_options' ) ) {
            return true;
        }

        $user = wp_get_current_user();

        if ( in_array( 'teacher', (array) $user->roles, true ) ) {
            return true;
        }

        return current_user_can( 'edit_posts' );
    }

    /**
     * Retrieve the classes accessible to the given user.
     *
     * @param int $user_id User identifier.
     * @return array
     */
    private function collect_teacher_roster( $teacher_id ) {
        $teacher_id = absint( $teacher_id );

        $roster = [
            'classes'  => [],
            'students' => [],
        ];

        if ( ! $teacher_id ) {
            return $roster;
        }

        $class_ids = $this->get_classes_for_user( $teacher_id );

        if ( empty( $class_ids ) ) {
            return $roster;
        }

        $student_roles = apply_filters( 'alfawz_qaidah_student_roles', [ 'student', 'subscriber' ] );

        foreach ( $class_ids as $class_id ) {
            $class_label = $this->resolve_class_label( $class_id );

            $roster['classes'][ $class_id ] = [
                'id'       => $class_id,
                'label'    => $class_label,
                'students' => [],
            ];

            $student_ids = get_users(
                [
                    'role__in'  => $student_roles,
                    'meta_key'  => 'alfawz_class_id',
                    'meta_value'=> $class_id,
                    'fields'    => 'ids',
                ]
            );

            foreach ( (array) $student_ids as $student_id ) {
                $student_id = (int) $student_id;
                $roster['classes'][ $class_id ]['students'][] = $student_id;

                if ( isset( $roster['students'][ $student_id ] ) ) {
                    continue;
                }

                $user = get_userdata( $student_id );

                if ( ! $user ) {
                    continue;
                }

                $roster['students'][ $student_id ] = [
                    'id'          => $student_id,
                    'name'        => $user->display_name,
                    'email'       => $user->user_email,
                    'avatar'      => get_avatar_url( $student_id ),
                    'class_id'    => $class_id,
                    'class_label' => $class_label,
                    'streak'      => (int) get_user_meta( $student_id, 'alfawz_quran_current_streak', true ),
                ];
            }
        }

        return $roster;
    }

    private function get_classes_for_user( $user_id ) {
        if ( \current_user_can( 'manage_options' ) ) {
            return $this->discover_all_classes();
        }

        $raw = \get_user_meta( $user_id, 'alfawz_teacher_classes', true );

        if ( empty( $raw ) ) {
            return [];
        }

        if ( is_string( $raw ) ) {
            $raw = array_map( 'trim', explode( ',', $raw ) );
        }

        if ( ! is_array( $raw ) ) {
            $raw = [ $raw ];
        }

        $normalized = [];

        foreach ( $raw as $value ) {
            $class_id = $this->normalize_class_id( $value );

            if ( '' === $class_id ) {
                continue;
            }

            $normalized[] = $class_id;
        }

        return array_values( array_unique( $normalized ) );
    }

    /**
     * Determine whether the current user can access a specific class identifier.
     *
     * @param int    $user_id  Current user ID.
     * @param string $class_id Class identifier.
     * @return bool
     */
    private function current_user_can_access_class( $user_id, $class_id ) {
        if ( \current_user_can( 'manage_options' ) ) {
            return true;
        }

        $classes = $this->get_classes_for_user( $user_id );

        return in_array( $class_id, $classes, true );
    }

    /**
     * Normalize a raw class identifier.
     *
     * @param mixed $value Raw value.
     * @return string
     */
    private function normalize_class_id( $value ) {
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
     * Resolve a class label using taxonomy or filters.
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

            if ( $term && ! \is_wp_error( $term ) ) {
                return $term->name;
            }
        }

        return \sprintf( \__( 'Class %s', 'alfawzquran' ), $class_id );
    }

    /**
     * Collect all class identifiers stored in user meta.
     *
     * @return array
     */
    private function discover_all_classes() {
        global $wpdb;

        $results = $wpdb->get_col( $wpdb->prepare( "SELECT DISTINCT meta_value FROM {$wpdb->usermeta} WHERE meta_key = %s AND meta_value <> ''", 'alfawz_class_id' ) );

        $classes = [];

        foreach ( (array) $results as $value ) {
            $class_id = $this->normalize_class_id( $value );

            if ( '' === $class_id ) {
                continue;
            }

            $classes[] = $class_id;
        }

        return array_values( array_unique( $classes ) );
    }

    /**
     * Check if the current user can edit a specific board.
     */
    private function can_manage_board( $post ) {
        if ( current_user_can( 'manage_options' ) ) {
            return true;
        }

        return (int) $post->post_author === get_current_user_id();
    }

    /**
     * Get leaderboard data.
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response
     */
    public function get_leaderboard( \WP_REST_Request $request ) {
        $period = $request->get_param( 'period' ); // e.g., 'daily', 'weekly', 'monthly', 'all_time'
        if ( ! in_array( $period, [ 'daily', 'weekly', 'monthly', 'all_time' ] ) ) {
            $period = 'all_time'; // Default to all time
        }

        $progress_model = new UserProgress();
        $leaderboard = $progress_model->get_leaderboard( $period );

        return new \WP_REST_Response( $leaderboard, 200 );
    }

    /**
     * Get user bookmarks.
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response
     */
    public function get_user_bookmarks( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        if ( empty( $user_id ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'User not logged in.' ], 401 );
        }

        $progress_model = new UserProgress();
        $bookmarks = $progress_model->get_bookmarks( $user_id );

        return new \WP_REST_Response( $bookmarks, 200 );
    }

    /**
     * Add a user bookmark.
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response
     */
    public function add_user_bookmark( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        $surah_id = $request->get_param( 'surah_id' );
        $verse_id = $request->get_param( 'verse_id' );
        $note = $request->get_param( 'note' );

        if ( empty( $user_id ) || empty( $surah_id ) || empty( $verse_id ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Missing required parameters.' ], 400 );
        }

        $progress_model = new UserProgress();
        $result = $progress_model->add_bookmark( $user_id, $surah_id, $verse_id, $note );

        if ( $result ) {
            return new \WP_REST_Response( [ 'success' => true, 'message' => 'Bookmark added successfully.' ], 200 );
        } else {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Failed to add bookmark. It might already exist.' ], 500 );
        }
    }

    /**
     * Delete a user bookmark.
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response
     */
    public function delete_user_bookmark( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        $bookmark_id = $request->get_param( 'id' );

        if ( empty( $user_id ) || empty( $bookmark_id ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Missing required parameters.' ], 400 );
        }

        $progress_model = new UserProgress();
        $result = $progress_model->delete_bookmark( $user_id, $bookmark_id );

        if ( $result ) {
            return new \WP_REST_Response( [ 'success' => true, 'message' => 'Bookmark deleted successfully.' ], 200 );
        } else {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Failed to delete bookmark or bookmark not found.' ], 500 );
        }
    }

    /**
     * Get memorization plans for the current user.
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response
     */
    public function get_memorization_plans( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        if ( empty( $user_id ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'User not logged in.' ], 401 );
        }

        $teacher_id = absint( $request->get_param( 'teacher_id' ) );

        if ( $teacher_id ) {
            if ( $teacher_id !== $user_id && ! current_user_can( 'manage_options' ) ) {
                return new \WP_REST_Response( [ 'message' => __( 'You are not allowed to view these memorisation plans.', 'alfawzquran' ) ], 403 );
            }

            $roster = $this->collect_teacher_roster( $teacher_id );

            if ( empty( $roster['students'] ) ) {
                return new \WP_REST_Response( [], 200 );
            }

            $progress_model = new UserProgress();
            $response       = [];

            foreach ( $roster['students'] as $student_id => $student_data ) {
                $plans = $progress_model->get_memorization_plans( $student_id );

                $active_plans = array_filter( $plans, function( $plan ) {
                    $status = isset( $plan['status'] ) ? strtolower( $plan['status'] ) : 'active';
                    return ! in_array( $status, [ 'completed', 'archived' ], true );
                } );

                $memorized_verses = array_sum( array_map( function( $plan ) {
                    return isset( $plan['completed_verses'] ) ? (int) $plan['completed_verses'] : 0;
                }, $plans ) );

                $response[] = [
                    'student' => [
                        'id'          => $student_data['id'],
                        'name'        => $student_data['name'],
                        'email'       => $student_data['email'],
                        'avatar'      => $student_data['avatar'],
                        'class_id'    => $student_data['class_id'],
                        'class_label' => $student_data['class_label'],
                    ],
                    'plans'   => $plans,
                    'metrics' => [
                        'active_plans'     => count( $active_plans ),
                        'total_plans'      => count( $plans ),
                        'memorized_verses' => $memorized_verses,
                        'streak'           => (int) $student_data['streak'],
                    ],
                ];
            }

            return new \WP_REST_Response( $response, 200 );
        }

        $progress_model = new UserProgress();
        $plans          = $progress_model->get_memorization_plans( $user_id );

        return new \WP_REST_Response( $plans, 200 );
    }

    /**
     * Create a new memorization plan.
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response
     */
    public function create_memorization_plan( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        $plan_name = sanitize_text_field( $request->get_param( 'plan_name' ) );
        $surah_id = intval( $request->get_param( 'surah_id' ) );
        $start_verse = intval( $request->get_param( 'start_verse' ) );
        $end_verse = intval( $request->get_param( 'end_verse' ) );
        $daily_goal = intval( $request->get_param( 'daily_goal' ) );

        if ( empty( $user_id ) || empty( $plan_name ) || empty( $surah_id ) || empty( $start_verse ) || empty( $end_verse ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Missing required parameters.' ], 400 );
        }

        if ( $start_verse > $end_verse ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Start verse cannot be greater than end verse.' ], 400 );
        }

        $progress_model = new UserProgress();
        $result = $progress_model->create_memorization_plan( $user_id, $plan_name, $surah_id, $start_verse, $end_verse, $daily_goal );

        if ( $result ) {
            return new \WP_REST_Response( [ 'success' => true, 'message' => 'Memorization plan created successfully.', 'plan_id' => $result ], 200 );
        } else {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Failed to create memorization plan.' ], 500 );
        }
    }

    /**
     * Get a single memorization plan with its progress.
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response
     */
    public function get_single_memorization_plan( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        $plan_id = intval( $request->get_param( 'id' ) );

        if ( empty( $user_id ) || empty( $plan_id ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Missing required parameters.' ], 400 );
        }

        $progress_model = new UserProgress();
        $plan = $progress_model->get_single_memorization_plan( $user_id, $plan_id );

        if ( $plan ) {
            return new \WP_REST_Response( $plan, 200 );
        } else {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Memorization plan not found or not accessible.' ], 404 );
        }
    }

    /**
     * Delete a memorization plan.
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response
     */
    public function delete_memorization_plan( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        $plan_id = intval( $request->get_param( 'id' ) );

        if ( empty( $user_id ) || empty( $plan_id ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Missing required parameters.' ], 400 );
        }

        $progress_model = new UserProgress();
        $result = $progress_model->delete_memorization_plan( $user_id, $plan_id );

        if ( $result ) {
            return new \WP_REST_Response( [ 'success' => true, 'message' => 'Memorization plan deleted successfully.' ], 200 );
        } else {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Failed to delete memorization plan or plan not found.' ], 500 );
        }
    }

    /**
     * Update progress for a specific memorization plan.
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response
     */
    public function update_memorization_plan_progress( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        $plan_id = intval( $request->get_param( 'id' ) );
        $verse_id = intval( $request->get_param( 'verse_id' ) );
        $action = sanitize_text_field( $request->get_param( 'action' ) ); // 'mark' or 'unmark'

        if ( empty( $user_id ) || empty( $plan_id ) || empty( $verse_id ) || ! in_array( $action, ['mark', 'unmark'] ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Missing or invalid parameters.' ], 400 );
        }

        $progress_model = new UserProgress();
        $result = $progress_model->update_memorization_plan_progress( $user_id, $plan_id, $verse_id, $action );

        if ( $result ) {
            return new \WP_REST_Response( [ 'success' => true, 'message' => 'Plan progress updated successfully.' ], 200 );
        } else {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Failed to update plan progress.' ], 500 );
        }
    }

    /**
     * Restart a memorization plan (reset all progress for it).
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response
     */
    public function restart_memorization_plan( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        $plan_id = intval( $request->get_param( 'id' ) );

        if ( empty( $user_id ) || empty( $plan_id ) ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Missing required parameters.' ], 400 );
        }

        $progress_model = new UserProgress();
        $result = $progress_model->restart_memorization_plan( $user_id, $plan_id );

        if ( $result ) {
            return new \WP_REST_Response( [ 'success' => true, 'message' => 'Memorization plan restarted successfully.' ], 200 );
        } else {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Failed to restart memorization plan.' ], 500 );
        }
    }

    /**
     * Return the current daily recitation goal state for the authenticated user.
     */
    public function get_daily_recitation_goal( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'User not logged in.' ], 401 );
        }

        $timezone_offset = $request->get_param( 'timezone_offset' );
        $state           = $this->prepare_daily_goal_state( $user_id, $timezone_offset );

        return new \WP_REST_Response( $state, 200 );
    }

    /**
     * Handle the verse progression event coming from the reader UI.
     */
    public function track_verse_progress( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'User not logged in.' ], 401 );
        }

        $verse_key       = sanitize_text_field( (string) $request->get_param( 'verse_key' ) );
        $timezone_offset = $request->get_param( 'timezone_offset' );

        if ( '' === $verse_key ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'Verse identifier is required.' ], 400 );
        }

        $daily_state = $this->increment_daily_goal_progress( $user_id, $verse_key, $timezone_offset );
        $egg_state   = $this->increment_egg_challenge( $user_id );

        return new \WP_REST_Response(
            [
                'success' => true,
                'daily'   => $daily_state,
                'egg'     => $egg_state,
            ],
            200
        );
    }

    /**
     * Return the egg challenge state for the authenticated user.
     */
    public function get_egg_challenge_state( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'User not logged in.' ], 401 );
        }

        $state = $this->prepare_egg_challenge_state( $user_id );

        return new \WP_REST_Response( $state, 200 );
    }

    /**
     * Increment the egg challenge without touching the daily goal.
     */
    public function increment_egg_challenge_endpoint( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'User not logged in.' ], 401 );
        }

        $state = $this->increment_egg_challenge( $user_id );

        return new \WP_REST_Response( $state, 200 );
    }

    /**
     * Provide teachers with a high-level overview of student egg challenge progress.
     */
    public function get_egg_challenge_overview( WP_REST_Request $request ) {
        $class_id = $this->normalize_class_id( $request->get_param( 'class_id' ) );
        $roles    = apply_filters( 'alfawz_qaidah_student_roles', [ 'student', 'subscriber' ] );

        $args = [
            'role__in' => $roles,
            'orderby'  => 'display_name',
            'order'    => 'ASC',
            'fields'   => [ 'ID', 'display_name', 'user_email' ],
        ];

        if ( $class_id ) {
            $args['meta_query'] = [
                [
                    'key'     => 'alfawz_class_id',
                    'value'   => $class_id,
                    'compare' => '=',
                ],
            ];
        }

        $users = get_users( $args );

        $students = array_map(
            function ( $user ) {
                $progress = $this->prepare_egg_challenge_state( $user->ID );

                $daily_count = (int) get_user_meta( $user->ID, self::DAILY_GOAL_META_COUNT, true );

                return [
                    'id'                => (int) $user->ID,
                    'name'              => $user->display_name,
                    'email'             => $user->user_email,
                    'egg_count'         => $progress['count'],
                    'egg_target'        => $progress['target'],
                    'egg_percentage'    => $progress['percentage'],
                    'last_completion'   => $progress['previous_target'],
                    'daily_goal_count'  => $daily_count,
                    'daily_goal_target' => self::DAILY_GOAL_TARGET,
                ];
            },
            $users
        );

        return new WP_REST_Response(
            [
                'students' => $students,
                'count'    => count( $students ),
            ],
            200
        );
    }

    /**
     * Calculate and update daily streaks for all users.
     * This function is called by a daily cron job.
     */
    public function calculate_daily_streaks() {
        $progress_model = new UserProgress();
        $progress_model->update_all_user_streaks();
        $this->reset_daily_recitations_for_all_users();
        error_log('AlfawzQuran Daily Cron: Streaks updated.');
    }

    /**
     * Build the current daily goal state for a user, resetting when necessary.
     */
    private function prepare_daily_goal_state( $user_id, $timezone_offset = null ) {
        $this->maybe_reset_daily_goal( $user_id, $timezone_offset );

        $count      = (int) get_user_meta( $user_id, self::DAILY_GOAL_META_COUNT, true );
        $target     = self::DAILY_GOAL_TARGET;
        $percentage = $target > 0 ? round( ( $count / $target ) * 100, 2 ) : 0;
        $remaining  = max( 0, $target - $count );
        $last_reset = get_user_meta( $user_id, self::DAILY_GOAL_META_LAST_RESET, true );

        if ( '' === $last_reset ) {
            $last_reset = $this->get_local_date_string( $timezone_offset );
            update_user_meta( $user_id, self::DAILY_GOAL_META_LAST_RESET, $last_reset );
        }

        return [
            'count'      => $count,
            'target'     => $target,
            'percentage' => min( 100, $percentage ),
            'remaining'  => $remaining,
            'last_reset' => $last_reset,
        ];
    }

    /**
     * Increment the daily goal while respecting unique verses per day.
     */
    private function increment_daily_goal_progress( $user_id, $verse_key, $timezone_offset = null ) {
        $state          = $this->prepare_daily_goal_state( $user_id, $timezone_offset );
        $previous_count = (int) $state['count'];

        $log = get_user_meta( $user_id, self::DAILY_GOAL_META_LOG, true );
        if ( ! is_array( $log ) ) {
            $log = [];
        }

        $already_counted = in_array( $verse_key, $log, true );

        if ( ! $already_counted ) {
            $log[] = $verse_key;
        }

        $log = array_values( array_unique( array_map( 'strval', $log ) ) );
        $count = count( $log );

        update_user_meta( $user_id, self::DAILY_GOAL_META_LOG, $log );
        update_user_meta( $user_id, self::DAILY_GOAL_META_COUNT, $count );

        $just_completed = ( $previous_count < self::DAILY_GOAL_TARGET ) && ( $count >= self::DAILY_GOAL_TARGET ) && ! $already_counted;

        if ( $just_completed ) {
            update_user_meta( $user_id, self::DAILY_GOAL_META_LAST_COMPLETION, current_time( 'mysql' ) );
        }

        return [
            'count'           => $count,
            'target'          => self::DAILY_GOAL_TARGET,
            'remaining'       => max( 0, self::DAILY_GOAL_TARGET - $count ),
            'percentage'      => min( 100, self::DAILY_GOAL_TARGET > 0 ? round( ( $count / self::DAILY_GOAL_TARGET ) * 100, 2 ) : 0 ),
            'just_completed'  => $just_completed,
            'already_counted' => $already_counted,
            'last_reset'      => $state['last_reset'],
        ];
    }

    /**
     * Ensure the daily goal counter is reset when a new day starts.
     */
    private function maybe_reset_daily_goal( $user_id, $timezone_offset = null ) {
        $current_date = $this->get_local_date_string( $timezone_offset );
        $last_reset   = get_user_meta( $user_id, self::DAILY_GOAL_META_LAST_RESET, true );

        if ( $current_date === $last_reset ) {
            return;
        }

        update_user_meta( $user_id, self::DAILY_GOAL_META_COUNT, 0 );
        update_user_meta( $user_id, self::DAILY_GOAL_META_LOG, [] );
        update_user_meta( $user_id, self::DAILY_GOAL_META_LAST_RESET, $current_date );
        delete_user_meta( $user_id, self::DAILY_GOAL_META_LAST_COMPLETION );
    }

    /**
     * Compute a Y-m-d date string for the provided timezone offset.
     */
    private function get_local_date_string( $timezone_offset = null ) {
        $timestamp = current_time( 'timestamp', true );

        if ( null !== $timezone_offset && '' !== $timezone_offset && is_numeric( $timezone_offset ) ) {
            $timestamp += (int) $timezone_offset * MINUTE_IN_SECONDS;
        } else {
            $timestamp = current_time( 'timestamp' );
        }

        return gmdate( 'Y-m-d', $timestamp );
    }

    /**
     * Retrieve the egg challenge state for the given user.
     */
    private function prepare_egg_challenge_state( $user_id ) {
        $count  = (int) get_user_meta( $user_id, self::EGG_CHALLENGE_COUNT_META, true );
        $target = (int) get_user_meta( $user_id, self::EGG_CHALLENGE_TARGET_META, true );

        if ( $target <= 0 ) {
            $target = 20;
            update_user_meta( $user_id, self::EGG_CHALLENGE_TARGET_META, $target );
        }

        if ( $count < 0 ) {
            $count = 0;
            update_user_meta( $user_id, self::EGG_CHALLENGE_COUNT_META, 0 );
        }

        $percentage      = $target > 0 ? round( ( $count / $target ) * 100, 2 ) : 0;
        $previous_target = get_user_meta( $user_id, self::EGG_CHALLENGE_LAST_TARGET_META, true );

        return [
            'count'            => $count,
            'target'           => $target,
            'percentage'       => min( 100, $percentage ),
            'previous_target'  => '' !== $previous_target ? (int) $previous_target : null,
        ];
    }

    /**
     * Increment the egg challenge counters.
     */
    private function increment_egg_challenge( $user_id ) {
        $state   = $this->prepare_egg_challenge_state( $user_id );
        $count   = (int) $state['count'] + 1;
        $target  = (int) $state['target'];
        $completed = false;
        $previous_target = null;

        if ( $count >= $target ) {
            $completed       = true;
            $previous_target = $target;
            $target         += 5;
            $count           = 0;

            update_user_meta( $user_id, self::EGG_CHALLENGE_TARGET_META, $target );
            update_user_meta( $user_id, self::EGG_CHALLENGE_COUNT_META, $count );
            update_user_meta( $user_id, self::EGG_CHALLENGE_LAST_TARGET_META, $previous_target );
        } else {
            update_user_meta( $user_id, self::EGG_CHALLENGE_COUNT_META, $count );
        }

        $percentage = $target > 0 ? round( ( $count / $target ) * 100, 2 ) : 0;

        return [
            'count'           => $count,
            'target'          => $target,
            'percentage'      => min( 100, $percentage ),
            'completed'       => $completed,
            'previous_target' => $previous_target,
        ];
    }

    /**
     * Reset the daily recitation counters for every user as part of the cron job.
     */
    private function reset_daily_recitations_for_all_users() {
        $users = get_users( [ 'fields' => 'ID' ] );
        $date  = gmdate( 'Y-m-d', current_time( 'timestamp', true ) );

        foreach ( $users as $user_id ) {
            update_user_meta( $user_id, self::DAILY_GOAL_META_COUNT, 0 );
            update_user_meta( $user_id, self::DAILY_GOAL_META_LOG, [] );
            update_user_meta( $user_id, self::DAILY_GOAL_META_LAST_RESET, $date );
            delete_user_meta( $user_id, self::DAILY_GOAL_META_LAST_COMPLETION );
        }
    }

    /**
     * Get overall admin statistics.
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response
     */
    public function get_admin_stats( \WP_REST_Request $request ) {
        $progress_model = new UserProgress();
        $stats = $progress_model->get_overall_stats();
        return new \WP_REST_Response( $stats, 200 );
    }

    public function test_endpoint($request) {
        return rest_ensure_response([
            'status' => 'success',
            'message' => 'AlfawzQuran API is working!',
            'timestamp' => current_time('mysql')
        ]);
    }
    
    public function get_surahs($request) {
        $surahs = $this->get_surah_catalog();

        if (is_wp_error($surahs)) {
            return $surahs;
        }

        return rest_ensure_response($surahs);
    }

    public function get_verses($request) {
        $surah_id = $request->get_param('id');

        $verses = $this->get_surah_verses((int) $surah_id);

        if (is_wp_error($verses)) {
            return $verses;
        }

        return rest_ensure_response($verses);
    }

    public function get_single_verse( \WP_REST_Request $request ) {
        $surah_id   = (int) $request->get_param( 'id' );
        $verse_num  = (int) $request->get_param( 'num' );
        $translation = $request->get_param( 'translation' );
        $transliteration = $request->get_param( 'transliteration' );

        if ( $surah_id <= 0 || $verse_num <= 0 ) {
            return new \WP_REST_Response( [ 'message' => __( 'Invalid verse reference provided.', 'alfawzquran' ) ], 400 );
        }

        $translation_edition     = $translation ? sanitize_text_field( $translation ) : get_option( 'alfawz_default_translation', 'en.sahih' );
        $transliteration_edition = $transliteration ? sanitize_text_field( $transliteration ) : get_option( 'alfawz_default_transliteration', 'en.transliteration' );

        $arabic_data = $this->fetch_ayah_data( $surah_id, $verse_num, 'quran-uthmani' );

        if ( is_wp_error( $arabic_data ) ) {
            return $arabic_data;
        }

        $translation_text = '';
        if ( ! empty( $translation_edition ) ) {
            $translation_data = $this->fetch_ayah_data( $surah_id, $verse_num, $translation_edition );
            if ( ! is_wp_error( $translation_data ) ) {
                $translation_text = isset( $translation_data['text'] ) ? wp_strip_all_tags( $translation_data['text'] ) : '';
            }
        }

        $transliteration_text = '';
        if ( ! empty( $transliteration_edition ) ) {
            $transliteration_data = $this->fetch_ayah_data( $surah_id, $verse_num, $transliteration_edition );
            if ( ! is_wp_error( $transliteration_data ) ) {
                $transliteration_text = isset( $transliteration_data['text'] ) ? wp_strip_all_tags( $transliteration_data['text'] ) : '';
            }
        }

        $surah_meta = isset( $arabic_data['surah'] ) && is_array( $arabic_data['surah'] ) ? $arabic_data['surah'] : [];

        $response = [
            'surah_id'            => $surah_id,
            'verse_id'            => $verse_num,
            'verse_key'           => sprintf( '%d:%d', $surah_id, $verse_num ),
            'surah_name'          => $surah_meta['englishName'] ?? '',
            'surah_name_ar'       => $surah_meta['name'] ?? '',
            'total_verses'        => isset( $surah_meta['numberOfAyahs'] ) ? (int) $surah_meta['numberOfAyahs'] : 0,
            'juz'                 => isset( $arabic_data['juz'] ) ? (int) $arabic_data['juz'] : null,
            'arabic'              => isset( $arabic_data['text'] ) ? $arabic_data['text'] : '',
            'translation'         => $translation_text,
            'transliteration'     => $transliteration_text,
            'audio'               => $arabic_data['audio'] ?? '',
            'audio_secondary'     => isset( $arabic_data['audioSecondary'] ) ? $arabic_data['audioSecondary'] : [],
        ];

        return rest_ensure_response( $response );
    }

    private function fetch_ayah_data( int $surah_id, int $verse_num, string $edition ) {
        $edition_key = sanitize_key( str_replace( '.', '_', strtolower( $edition ) ) );
        $cache_key   = sprintf( 'alfawz_ayah_%d_%d_%s', $surah_id, $verse_num, $edition_key );

        $cached = get_transient( $cache_key );
        if ( false !== $cached ) {
            return $cached;
        }

        $url      = sprintf( '%s/ayah/%d:%d/%s', self::API_BASE, $surah_id, $verse_num, rawurlencode( $edition ) );
        $response = wp_remote_get(
            $url,
            [
                'timeout' => 20,
                'headers' => [
                    'Accept' => 'application/json',
                ],
            ]
        );

        if ( is_wp_error( $response ) ) {
            return $this->record_api_failure( $response );
        }

        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        if ( empty( $data ) || 200 !== (int) ( $data['code'] ?? 0 ) || empty( $data['data'] ) ) {
            return $this->record_api_failure( new \WP_Error( 'api_error', __( 'Invalid response received from the Quran API.', 'alfawzquran' ) ) );
        }

        $ayah = $data['data'];

        set_transient( $cache_key, $ayah, HOUR_IN_SECONDS * 6 );
        $this->clear_api_failure_notice();

        return $ayah;
    }

    /**
     * Retrieve the full surah catalog, leveraging caching and fallbacks when
     * external requests fail.
     *
     * @return array|\WP_Error
     */
    private function get_surah_catalog() {
        $transient_key = 'alfawz_surah_catalog';
        $option_key    = 'alfawz_surah_catalog';

        $cached = get_transient($transient_key);
        if (is_array($cached) && !empty($cached)) {
            return $cached;
        }

        $stored = get_option($option_key);
        if (is_array($stored) && !empty($stored)) {
            set_transient($transient_key, $stored, DAY_IN_SECONDS);
            return $stored;
        }

        $response = wp_remote_get(
            self::API_BASE . '/surah',
            [
                'timeout' => 20,
                'headers' => [
                    'Accept' => 'application/json',
                ],
            ]
        );

        if (is_wp_error($response)) {
            return $this->record_api_failure($response);
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (empty($data) || !isset($data['code']) || 200 !== (int) $data['code'] || empty($data['data'])) {
            return $this->record_api_failure(new \WP_Error('api_error', __('Invalid response received from the Quran API.', 'alfawzquran')));
        }

        $surahs = $data['data'];

        set_transient($transient_key, $surahs, DAY_IN_SECONDS);
        update_option($option_key, $surahs, false);
        $this->clear_api_failure_notice();

        return $surahs;
    }

    /**
     * Retrieve the verses for a particular surah. Falls back to the cached
     * value when the external API cannot be reached.
     *
     * @param int $surah_id
     *
     * @return array|\WP_Error
     */
    private function get_surah_verses(int $surah_id) {
        $transient_key = sprintf('alfawz_surah_%d_verses', $surah_id);
        $option_key    = sprintf('alfawz_surah_%d_verses', $surah_id);

        $cached = get_transient($transient_key);
        if (is_array($cached) && !empty($cached)) {
            return $cached;
        }

        $stored = get_option($option_key);
        if (is_array($stored) && !empty($stored)) {
            set_transient($transient_key, $stored, WEEK_IN_SECONDS);
            return $stored;
        }

        $response = wp_remote_get(
            sprintf('%s/surah/%d', self::API_BASE, $surah_id),
            [
                'timeout' => 20,
                'headers' => [
                    'Accept' => 'application/json',
                ],
            ]
        );

        if (is_wp_error($response)) {
            return $this->record_api_failure($response);
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (empty($data) || !isset($data['code']) || 200 !== (int) $data['code'] || empty($data['data']['ayahs'])) {
            return $this->record_api_failure(new \WP_Error('api_error', __('Invalid response received from the Quran API.', 'alfawzquran')));
        }

        $verses = $data['data']['ayahs'];

        set_transient($transient_key, $verses, WEEK_IN_SECONDS);
        update_option($option_key, $verses, false);
        $this->clear_api_failure_notice();

        return $verses;
    }

    /**
     * Store an admin notice when an API call fails and return a user-friendly
     * WP_Error instance.
     *
     * @param \WP_Error $error
     *
     * @return \WP_Error
     */
    private function record_api_failure(\WP_Error $error) {
        $message = sprintf(
            /* translators: %s: Error message returned by the remote request. */
            __('AlfawzQuran could not reach the external Quran API. The reported error was: %s. Please verify that your server can make secure HTTPS requests. Cached data will be used when available.', 'alfawzquran'),
            $error->get_error_message()
        );

        set_transient('alfawz_quran_api_notice', $message, HOUR_IN_SECONDS * 12);

        return new \WP_Error(
            'api_error',
            __('Unable to connect to the Quran API. Please contact your server administrator to ensure outgoing HTTPS requests are allowed.', 'alfawzquran'),
            [
                'status'  => 500,
                'details' => $error->get_error_message(),
            ]
        );
    }

    /**
     * Remove the admin notice transient after a successful API call.
     */
    private function clear_api_failure_notice() {
        delete_transient('alfawz_quran_api_notice');
    }
}
        register_rest_route(
            $namespace,
            '/admin/overview',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_admin_overview' ],
                'permission_callback' => [ $this, 'admin_permission_callback' ],
            ]
        );

        register_rest_route(
            $namespace,
            '/admin/classes',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_admin_classes' ],
                    'permission_callback' => [ $this, 'admin_permission_callback' ],
                ],
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'create_admin_class' ],
                    'permission_callback' => [ $this, 'admin_permission_callback' ],
                    'args'                => [
                        'name' => [
                            'required'          => true,
                            'sanitize_callback' => 'sanitize_text_field',
                        ],
                    ],
                ],
            ]
        );

        register_rest_route(
            $namespace,
            '/admin/classes/(?P<id>\d+)',
            [
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_admin_class' ],
                    'permission_callback' => [ $this, 'admin_permission_callback' ],
                ],
                [
                    'methods'             => WP_REST_Server::DELETABLE,
                    'callback'            => [ $this, 'delete_admin_class' ],
                    'permission_callback' => [ $this, 'admin_permission_callback' ],
                ],
            ]
        );

        register_rest_route(
            $namespace,
            '/admin/classes/(?P<id>\d+)/students',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'update_admin_class_students' ],
                'permission_callback' => [ $this, 'admin_permission_callback' ],
            ]
        );

        register_rest_route(
            $namespace,
            '/admin/users',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_admin_users' ],
                'permission_callback' => [ $this, 'admin_permission_callback' ],
            ]
        );

        register_rest_route(
            $namespace,
            '/admin/users/(?P<id>\d+)/role',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'update_admin_user_role' ],
                'permission_callback' => [ $this, 'admin_permission_callback' ],
            ]
        );

        register_rest_route(
            $namespace,
            '/admin/settings',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_admin_settings' ],
                    'permission_callback' => [ $this, 'admin_permission_callback' ],
                ],
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'save_admin_settings' ],
                    'permission_callback' => [ $this, 'admin_permission_callback' ],
                ],
            ]
        );

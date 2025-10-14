<?php
namespace AlfawzQuran\API;

use AlfawzQuran\Models\UserProgress;
use AlfawzQuran\API\QuranAPI;

/**
 * Register REST API routes for the plugin.
 */
class Routes {

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
        
        register_rest_route( 'alfawzquran/v1', '/progress', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'update_user_progress' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/user-stats', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_user_stats' ],
            'permission_callback' => [ $this, 'check_permission' ],
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

        register_rest_route( 'alfawzquran/v1', '/stats', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_admin_stats' ],
            'permission_callback' => function() {
                return current_user_can( 'manage_options' );
            },
        ]);
    }

    /**
     * Check if the user is logged in.
     */
    public function check_permission( \WP_REST_Request $request ) {
        return is_user_logged_in();
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

        $progress_model = new UserProgress();
        $stats = $progress_model->get_user_stats( $user_id );

        // Add user display name and avatar
        $user_data = get_userdata( $user_id );
        $stats['display_name'] = $user_data ? $user_data->display_name : 'Guest';
        $stats['avatar_url'] = get_avatar_url( $user_id );
        $stats['member_since'] = $user_data ? date( 'M Y', strtotime( $user_data->user_registered ) ) : 'N/A';

        return new \WP_REST_Response( $stats, 200 );
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

        $progress_model = new UserProgress();
        $plans = $progress_model->get_memorization_plans( $user_id );

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
     * Calculate and update daily streaks for all users.
     * This function is called by a daily cron job.
     */
    public function calculate_daily_streaks() {
        $progress_model = new UserProgress();
        $progress_model->update_all_user_streaks();
        error_log('AlfawzQuran Daily Cron: Streaks updated.');
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
        // Use AlQuran.cloud API directly
        $response = wp_remote_get('https://api.alquran.cloud/v1/surah');
        
        if (is_wp_error($response)) {
            return new \WP_Error('api_error', 'Failed to fetch surahs', ['status' => 500]);
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || $data['code'] !== 200) {
            return new \WP_Error('api_error', 'Invalid API response', ['status' => 500]);
        }
        
        return rest_ensure_response($data['data']);
    }
    
    public function get_verses($request) {
        $surah_id = $request->get_param('id');
        
        // Get basic surah info for verse count
        $response = wp_remote_get("https://api.alquran.cloud/v1/surah/{$surah_id}");
        
        if (is_wp_error($response)) {
            return new \WP_Error('api_error', 'Failed to fetch verses', ['status' => 500]);
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || $data['code'] !== 200) {
            return new \WP_Error('api_error', 'Invalid API response', ['status' => 500]);
        }
        
        return rest_ensure_response($data['data']['ayahs']);
    }
}

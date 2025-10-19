<?php
namespace AlfawzQuran\API;

use AlfawzQuran\API\QuranAPI;
use AlfawzQuran\Models\QaidahBoard;
use AlfawzQuran\Models\RecitationFeedback;
use AlfawzQuran\Models\UserProgress;
use AlfawzQuran\Models\UserReflection;
use AlfawzQuran\Support\DailyTargets;
use DateTimeImmutable;
use DateTimeZone;
use WP_REST_Server;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use function __;
use function absint;
use function apply_filters;
use function number_format_i18n;
use function esc_url_raw;
use function rest_ensure_response;
use function sanitize_key;
use function sanitize_text_field;
use function sanitize_textarea_field;
use function sanitize_email;
use function sanitize_user;
use function get_avatar_url;
use function get_option;
use function get_user_meta;
use function get_userdata;
use function get_user_by;
use function delete_user_meta;
use function email_exists;
use function username_exists;
use function wp_generate_password;
use function wp_insert_user;
use function wp_new_user_notification;
use function wp_strip_all_tags;
use function wp_json_encode;
use function wp_trim_words;
use function update_user_meta;
use function is_email;
use function wp_unslash;

/**
 * Register REST API routes for the plugin.
 */
class Routes {

    /**
     * Base URL for the external Quran API.
     */
    const API_BASE = 'https://api.alquran.cloud/v1';

    /**
     * Base URL for the CDN that hosts Quran recitations.
     */
    const AUDIO_CDN_BASE = 'https://cdn.islamic.network/quran/audio/128/';

    /**
     * Default number of verses for the daily goal.
     */
    const DAILY_GOAL_TARGET = DailyTargets::DEFAULT_TARGET;

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
    const EGG_CHALLENGE_COUNT_META       = 'egg_challenge_current_count';
    const EGG_CHALLENGE_TARGET_META      = 'egg_challenge_target';
    const EGG_CHALLENGE_LAST_TARGET_META = 'alfawz_egg_last_completion_target';
    const EGG_CHALLENGE_LAST_COMPLETION_META = 'alfawz_egg_last_completion_at';

    /**
     * Default and incremental values for the egg challenge.
     */
    const EGG_CHALLENGE_BASE_TARGET = 20;
    const EGG_CHALLENGE_STEP        = 5;
    const EGG_CHALLENGE_MAX_LEVEL   = 5;
    const TREE_CHALLENGE_MAX_STAGE  = 5;

    /**
     * Cached recitation snippet definitions sourced from the Tarteel-inspired library.
     *
     * @var array|null
     */
    private $recitation_snippet_cache = null;

    /**
     * Stores the recitation feedback repository.
     *
     * @var RecitationFeedback|null
     */
    private $recitation_feedback;

    /**
     * Provides access to the Quran API for verse lookups.
     *
     * @var QuranAPI|null
     */
    private $quran_api;

    /**
     * Journalling repository inspired by Quranly reflections.
     *
     * @var UserReflection|null
     */
    private $user_reflections;

    public function __construct() {
        $this->recitation_feedback = class_exists( RecitationFeedback::class ) ? new RecitationFeedback() : null;
        $this->quran_api           = class_exists( QuranAPI::class ) ? new QuranAPI() : null;
        $this->user_reflections    = class_exists( UserReflection::class ) ? new UserReflection() : null;

        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
        add_action( 'alfawz_quran_daily_cron', [ $this, 'calculate_daily_streaks' ] );
    }

    /**
     * Return the available bundled avatar silhouettes.
     *
     * @return array<string, string>
     */
    private function get_avatar_choices() {
        return [
            'male'   => ALFAWZQURAN_PLUGIN_URL . 'assets/images/avatar-male.svg',
            'female' => ALFAWZQURAN_PLUGIN_URL . 'assets/images/avatar-female.svg',
        ];
    }

    /**
     * Normalise a user supplied avatar gender value.
     *
     * @param string $value Raw value from the request or user meta.
     * @return string Normalised value (male, female) or empty string.
     */
    private function normalise_avatar_gender( $value ) {
        $gender = strtolower( trim( (string) $value ) );
        return in_array( $gender, [ 'male', 'female' ], true ) ? $gender : '';
    }

    /**
     * Build the avatar response for a given user.
     *
     * @param int $user_id User identifier.
     * @return array<string, mixed>
     */
    private function prepare_user_avatar( $user_id ) {
        $choices = $this->get_avatar_choices();
        $gender  = $this->normalise_avatar_gender( get_user_meta( $user_id, 'alfawz_avatar_gender', true ) );

        if ( $gender && isset( $choices[ $gender ] ) ) {
            return [
                'type'   => 'silhouette',
                'gender' => $gender,
                'url'    => esc_url_raw( $choices[ $gender ] ),
            ];
        }

        return [
            'type'   => 'default',
            'gender' => '',
            'url'    => esc_url_raw( get_avatar_url( $user_id ) ),
        ];
    }

    /**
     * Prepare a consistent profile payload response.
     *
     * @param \WP_User $user WordPress user object.
     * @return array<string, mixed>
     */
    private function prepare_profile_payload( \WP_User $user ) {
        $avatar = $this->prepare_user_avatar( $user->ID );

        return [
            'display_name'  => $user->display_name,
            'first_name'    => $user->first_name,
            'last_name'     => $user->last_name,
            'email'         => $user->user_email,
            'avatar'        => $avatar,
            'avatar_url'    => $avatar['url'],
            'avatar_gender' => $avatar['gender'],
        ];
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
                    'validate_callback' => [ $this, 'validate_numeric_param' ],
                ],
                'translation' => [
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'transliteration' => [
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ]
        ]);

        register_rest_route($namespace, '/surahs/(?P<id>\d+)/verses/(?P<num>\d+)', [
            'methods'  => 'GET',
            'callback' => [$this, 'get_single_verse'],
            'permission_callback' => '__return_true',
            'args'     => [
                'id'  => [
                    'validate_callback' => [ $this, 'validate_numeric_param' ],
                ],
                'num' => [
                    'validate_callback' => [ $this, 'validate_numeric_param' ],
                ],
            ],
        ]);

        register_rest_route(
            $namespace,
            '/auth/magic-link',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'send_magic_link' ],
                'permission_callback' => '__return_true',
            ]
        );

        register_rest_route($namespace, '/audio/(?P<reciter>[a-zA-Z0-9._-]+)/(?P<surah>\d+)/(?P<verse>\d+)(?:\.mp3)?', [
            'methods'  => [ WP_REST_Server::READABLE, 'HEAD' ],
            'callback' => [ $this, 'proxy_audio' ],
            'permission_callback' => '__return_true',
            'args'     => [
                'reciter' => [
                    'required'          => true,
                    'validate_callback' => [ $this, 'validate_reciter_identifier' ],
                    'sanitize_callback' => [ $this, 'sanitize_reciter_identifier' ],
                ],
                'surah'   => [
                    'required'          => true,
                    'validate_callback' => [ $this, 'validate_numeric_param' ],
                ],
                'verse'   => [
                    'required'          => true,
                    'validate_callback' => [ $this, 'validate_numeric_param' ],
                ],
            ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/progress', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'update_user_progress' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);

        register_rest_route( 'alfawzquran/v1', '/hasanat', [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => [ $this, 'award_hasanat' ],
            'permission_callback' => [ $this, 'check_permission' ],
            'args'                => [
                'surah_id'        => [
                    'required'          => true,
                    'validate_callback' => [ $this, 'validate_numeric_param' ],
                ],
                'verse_id'        => [
                    'required'          => true,
                    'validate_callback' => [ $this, 'validate_numeric_param' ],
                ],
                'hasanat'         => [
                    'required'          => true,
                    'validate_callback' => [ $this, 'validate_numeric_param' ],
                ],
                'progress_type'   => [
                    'required'          => false,
                    'sanitize_callback' => 'sanitize_key',
                ],
                'repetition_count' => [
                    'required'          => false,
                    'validate_callback' => [ $this, 'validate_numeric_param' ],
                ],
            ],
        ] );

        register_rest_route( 'alfawzquran/v1', '/user-stats', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_user_stats' ],
            'permission_callback' => [ $this, 'check_permission' ],
            'args'                => [
                'timezone_offset' => [
                    'validate_callback' => function( $param, $request = null, $param_name = '' ) {
                        return is_numeric( $param ) || '' === $param || null === $param;
                    },
                ],
            ],
        ] );

        register_rest_route( 'alfawzquran/v1', '/achievements', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [ $this, 'get_achievements' ],
            'permission_callback' => [ $this, 'check_permission' ],
            'args'                => [
                'timezone_offset' => [
                    'validate_callback' => function( $param, $request = null, $param_name = '' ) {
                        return is_numeric( $param ) || '' === $param || null === $param;
                    },
                ],
            ],
        ] );

        register_rest_route( 'alfawzquran/v1', '/daily-quests', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [ $this, 'get_daily_quests' ],
            'permission_callback' => [ $this, 'check_permission' ],
            'args'                => [
                'timezone_offset' => [
                    'validate_callback' => function( $param, $request = null, $param_name = '' ) {
                        return is_numeric( $param ) || '' === $param || null === $param;
                    },
                ],
            ],
        ] );

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
            '/user-preferences',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_user_preferences' ],
                'permission_callback' => [ $this, 'check_permission' ],
            ]
        );

        register_rest_route(
            $namespace,
            '/user-preferences',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'update_user_preferences' ],
                'permission_callback' => [ $this, 'check_permission' ],
            ]
        );

        register_rest_route(
            $namespace,
            '/user-profile',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_user_profile' ],
                'permission_callback' => [ $this, 'check_permission' ],
            ]
        );

        register_rest_route(
            $namespace,
            '/user-profile',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'update_user_profile' ],
                'permission_callback' => [ $this, 'check_permission' ],
            ]
        );

        register_rest_route(
            $namespace,
            '/recitation-goal',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_daily_recitation_goal' ],
                'permission_callback' => [ $this, 'check_permission' ],
                'args'                => [
                    'timezone_offset' => [
                        'validate_callback' => function( $param, $request = null, $param_name = '' ) {
                            return is_numeric( $param ) || '' === $param || null === $param;
                        },
                    ],
                ],
            ]
        );

        register_rest_route(
            $namespace,
            '/daily-goal',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_daily_recitation_goal' ],
                'permission_callback' => [ $this, 'check_permission' ],
                'args'                => [
                    'timezone_offset' => [
                        'validate_callback' => function( $param, $request = null, $param_name = '' ) {
                            return is_numeric( $param ) || '' === $param || null === $param;
                        },
                    ],
                ],
            ]
        );

        register_rest_route(
            $namespace,
            '/insights/dashboard',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_dashboard_insights' ],
                'permission_callback' => [ $this, 'check_permission' ],
                'args'                => [
                    'range' => [
                        'validate_callback' => function( $param ) {
                            return null === $param || '' === $param || is_numeric( $param );
                        },
                    ],
                    'include_reflections' => [
                        'sanitize_callback' => function( $value ) {
                            return (bool) $value;
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
                        'validate_callback' => function( $param, $request = null, $param_name = '' ) {
                            return is_string( $param ) && '' !== trim( $param );
                        },
                    ],
                    'timezone_offset' => [
                        'validate_callback' => function( $param, $request = null, $param_name = '' ) {
                            return is_numeric( $param ) || '' === $param || null === $param;
                        },
                    ],
                ],
            ]
        );

        register_rest_route(
            $namespace,
            '/reflections',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'list_reflections' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [
                        'surah_id' => [
                            'validate_callback' => [ $this, 'validate_numeric_param' ],
                        ],
                        'verse_id' => [
                            'validate_callback' => [ $this, 'validate_numeric_param' ],
                        ],
                        'limit' => [
                            'validate_callback' => [ $this, 'validate_numeric_param' ],
                        ],
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'create_reflection' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [
                        'surah_id' => [
                            'required'          => true,
                            'validate_callback' => [ $this, 'validate_numeric_param' ],
                        ],
                        'verse_id' => [
                            'required'          => true,
                            'validate_callback' => [ $this, 'validate_numeric_param' ],
                        ],
                        'content' => [
                            'required'          => true,
                            'sanitize_callback' => 'sanitize_textarea_field',
                        ],
                        'mood' => [
                            'required'          => false,
                            'sanitize_callback' => 'sanitize_key',
                        ],
                    ],
                ],
            ]
        );

        register_rest_route(
            $namespace,
            '/reflections/(?P<id>\\d+)',
            [
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_reflection' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [
                        'id'      => [
                            'required'          => true,
                            'validate_callback' => [ $this, 'validate_numeric_param' ],
                        ],
                        'content' => [
                            'required'          => false,
                            'sanitize_callback' => 'sanitize_textarea_field',
                        ],
                        'mood'    => [
                            'required'          => false,
                            'sanitize_callback' => 'sanitize_key',
                        ],
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::DELETABLE,
                    'callback'            => [ $this, 'delete_reflection' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [
                        'id' => [
                            'required'          => true,
                            'validate_callback' => [ $this, 'validate_numeric_param' ],
                        ],
                    ],
                ],
            ]
        );

        register_rest_route(
            $namespace,
            '/recitations/analyze',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'analyze_recitation' ],
                'permission_callback' => [ $this, 'check_permission' ],
                'args'                => [
                    'verse_key'  => [
                        'required'          => true,
                        'sanitize_callback' => function( $value ) {
                            return sanitize_text_field( $value );
                        },
                    ],
                    'transcript' => [
                        'required'          => true,
                        'sanitize_callback' => function( $value ) {
                            return wp_strip_all_tags( (string) $value );
                        },
                    ],
                    'confidence' => [
                        'required'          => false,
                        'validate_callback' => function( $value ) {
                            return null === $value || is_numeric( $value );
                        },
                    ],
                    'duration'   => [
                        'required'          => false,
                        'validate_callback' => function( $value ) {
                            return null === $value || is_numeric( $value );
                        },
                    ],
                ],
            ]
        );

        register_rest_route(
            $namespace,
            '/recitations/history',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_recitation_history' ],
                'permission_callback' => [ $this, 'check_permission' ],
            ]
        );

        register_rest_route(
            $namespace,
            '/recitations/snippets',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_recitation_snippets_endpoint' ],
                'permission_callback' => '__return_true',
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
            '/admin/classes/(?P<id>\\d+)',
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
            '/admin/classes/(?P<id>\\d+)/students',
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
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_admin_users' ],
                    'permission_callback' => [ $this, 'admin_permission_callback' ],
                ],
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'create_admin_user' ],
                    'permission_callback' => [ $this, 'admin_permission_callback' ],
                ],
            ]
        );

        register_rest_route(
            $namespace,
            '/admin/users/(?P<id>\\d+)/role',
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
    }

    /**
     * Send a one-tap login email using WordPress' password reset flow.
     */
    public function send_magic_link( WP_REST_Request $request ) {
        $params = $request->get_json_params();
        if ( empty( $params ) ) {
            $params = $request->get_params();
        }

        $raw_identifier = isset( $params['identifier'] ) ? wp_unslash( $params['identifier'] ) : '';
        $identifier     = sanitize_text_field( (string) $raw_identifier );

        if ( '' === $identifier ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'Please provide an email or username so we can send your login link.', 'alfawzquran' ),
                ],
                400
            );
        }

        $user = false;
        if ( is_email( $identifier ) ) {
            $user = get_user_by( 'email', $identifier );
        }

        if ( ! $user ) {
            $user = get_user_by( 'login', sanitize_user( $identifier, true ) );
        }

        $login_identifier = $user ? $user->user_login : $identifier;
        $result           = retrieve_password( $login_identifier );

        if ( true === $result ) {
            return new WP_REST_Response(
                [
                    'success' => true,
                    'message' => __( 'Check your email for a secure login link. Follow the reset instructions to continue.', 'alfawzquran' ),
                ],
                200
            );
        }

        if ( is_wp_error( $result ) ) {
            $code = $result->get_error_code();

            if ( in_array( $code, [ 'invalid_email', 'invalidcombo' ], true ) ) {
                return new WP_REST_Response(
                    [
                        'success' => true,
                        'message' => __( 'If that account exists, we just emailed gentle step-by-step instructions.', 'alfawzquran' ),
                    ],
                    200
                );
            }

            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'We could not send the login link right now. Please try again in a moment.', 'alfawzquran' ),
                    'code'    => $code,
                ],
                500
            );
        }

        return new WP_REST_Response(
            [
                'success' => true,
                'message' => __( 'Check your email for a secure login link. Follow the reset instructions to continue.', 'alfawzquran' ),
            ],
            200
        );
    }

    /**
     * Validate that a REST request parameter contains a numeric value.
     *
     * @param mixed             $value       The value being validated.
     * @param \WP_REST_Request $request     Optional. The current request instance.
     * @param string            $param_name Optional. Parameter name.
     *
     * @return bool Whether the value represents a number.
     */
    public function validate_numeric_param( $value, $request = null, $param_name = '' ) {
        return is_numeric( $value );
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
     * Provide dashboard-grade insights mirroring Quranly's guided analytics.
     */
    public function get_dashboard_insights( WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'User not logged in.', 'alfawzquran' ),
                ],
                401
            );
        }

        $range = $request->get_param( 'range' );
        if ( null === $range || '' === $range ) {
            $range = 21;
        }

        $range = absint( $range );
        if ( $range < 7 ) {
            $range = 7;
        } elseif ( $range > 60 ) {
            $range = 60;
        }

        $include_reflections = (bool) $request->get_param( 'include_reflections' );

        $progress_model = new UserProgress();
        $history        = $progress_model->get_recent_daily_activity( $user_id, $range );
        $target         = $this->resolve_user_daily_target( $user_id );
        $series         = $this->normalise_activity_series( is_array( $history ) ? $history : [], $range, $target );
        $dynamic        = $this->build_dynamic_goal_insights( $series, $target );
        $consistency    = $this->build_consistency_insights( $series, $target );

        $payload = [
            'range_days'   => $range,
            'target'       => $target,
            'series'       => $series,
            'dynamic_goal' => $dynamic,
            'consistency'  => $consistency,
        ];

        if ( $include_reflections && $this->user_reflections ) {
            $recent = $this->user_reflections->get_recent( $user_id, 3 );
            $payload['reflections'] = array_map(
                [ $this, 'transform_reflection_for_response' ],
                is_array( $recent ) ? $recent : []
            );
            $payload['last_mood'] = sanitize_key( (string) get_user_meta( $user_id, 'alfawz_reflection_last_mood', true ) );
        }

        return rest_ensure_response( $payload );
    }

    /**
     * Return reflections for the authenticated user.
     */
    public function list_reflections( WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new WP_REST_Response( [ 'success' => false, 'message' => __( 'User not logged in.', 'alfawzquran' ) ], 401 );
        }

        if ( ! $this->user_reflections ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'Reflections are currently unavailable.', 'alfawzquran' ),
                ],
                501
            );
        }

        $limit    = absint( $request->get_param( 'limit' ) );
        $surah_id = absint( $request->get_param( 'surah_id' ) );
        $verse_id = absint( $request->get_param( 'verse_id' ) );

        if ( $limit <= 0 ) {
            $limit = 10;
        } elseif ( $limit > 25 ) {
            $limit = 25;
        }

        $args = [
            'limit' => $limit,
        ];

        if ( $surah_id > 0 ) {
            $args['surah_id'] = $surah_id;
        }

        if ( $verse_id > 0 ) {
            $args['verse_id'] = $verse_id;
        }

        $items = $this->user_reflections->get_many( $user_id, $args );
        $items = is_array( $items ) ? $items : [];

        return rest_ensure_response(
            [
                'items'     => array_map( [ $this, 'transform_reflection_for_response' ], $items ),
                'count'     => count( $items ),
                'last_mood' => sanitize_key( (string) get_user_meta( $user_id, 'alfawz_reflection_last_mood', true ) ),
            ]
        );
    }

    /**
     * Create a new reflection entry.
     */
    public function create_reflection( WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new WP_REST_Response( [ 'success' => false, 'message' => __( 'User not logged in.', 'alfawzquran' ) ], 401 );
        }

        if ( ! $this->user_reflections ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'Reflections are currently unavailable.', 'alfawzquran' ),
                ],
                501
            );
        }

        $surah_id = absint( $request->get_param( 'surah_id' ) );
        $verse_id = absint( $request->get_param( 'verse_id' ) );
        $content  = sanitize_textarea_field( (string) $request->get_param( 'content' ) );
        $mood     = sanitize_key( (string) $request->get_param( 'mood' ) );

        if ( $surah_id <= 0 || $verse_id <= 0 || '' === trim( $content ) ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'A surah, ayah, and heartfelt reflection are required.', 'alfawzquran' ),
                ],
                400
            );
        }

        $created = $this->user_reflections->create( $user_id, $surah_id, $verse_id, $content, $mood );

        if ( ! $created ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'Unable to save your reflection. Please try again.', 'alfawzquran' ),
                ],
                500
            );
        }

        if ( $mood ) {
            update_user_meta( $user_id, 'alfawz_reflection_last_mood', $mood );
        }

        return new WP_REST_Response(
            [
                'success'    => true,
                'reflection' => $this->transform_reflection_for_response( $created ),
            ],
            201
        );
    }

    /**
     * Update an existing reflection.
     */
    public function update_reflection( WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new WP_REST_Response( [ 'success' => false, 'message' => __( 'User not logged in.', 'alfawzquran' ) ], 401 );
        }

        if ( ! $this->user_reflections ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'Reflections are currently unavailable.', 'alfawzquran' ),
                ],
                501
            );
        }

        $id = absint( $request->get_param( 'id' ) );

        if ( $id <= 0 ) {
            return new WP_REST_Response( [ 'success' => false, 'message' => __( 'Reflection identifier is required.', 'alfawzquran' ) ], 400 );
        }

        $existing = $this->user_reflections->get( $id, $user_id );
        if ( ! $existing ) {
            return new WP_REST_Response( [ 'success' => false, 'message' => __( 'Reflection not found.', 'alfawzquran' ) ], 404 );
        }

        $fields = [];

        if ( null !== $request->get_param( 'content' ) ) {
            $fields['content'] = sanitize_textarea_field( (string) $request->get_param( 'content' ) );
        }

        if ( null !== $request->get_param( 'mood' ) ) {
            $fields['mood'] = sanitize_key( (string) $request->get_param( 'mood' ) );
        }

        if ( empty( $fields ) ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'Provide content or a mood update.', 'alfawzquran' ),
                ],
                400
            );
        }

        $updated = $this->user_reflections->update( $id, $user_id, $fields );

        if ( ! $updated ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'Unable to update this reflection right now.', 'alfawzquran' ),
                ],
                500
            );
        }

        if ( ! empty( $fields['mood'] ) ) {
            update_user_meta( $user_id, 'alfawz_reflection_last_mood', $fields['mood'] );
        }

        return new WP_REST_Response(
            [
                'success'    => true,
                'reflection' => $this->transform_reflection_for_response( $updated ),
            ],
            200
        );
    }

    /**
     * Delete a stored reflection.
     */
    public function delete_reflection( WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new WP_REST_Response( [ 'success' => false, 'message' => __( 'User not logged in.', 'alfawzquran' ) ], 401 );
        }

        if ( ! $this->user_reflections ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'Reflections are currently unavailable.', 'alfawzquran' ),
                ],
                501
            );
        }

        $id = absint( $request->get_param( 'id' ) );

        if ( $id <= 0 ) {
            return new WP_REST_Response( [ 'success' => false, 'message' => __( 'Reflection identifier is required.', 'alfawzquran' ) ], 400 );
        }

        $existing = $this->user_reflections->get( $id, $user_id );
        if ( ! $existing ) {
            return new WP_REST_Response( [ 'success' => false, 'message' => __( 'Reflection not found.', 'alfawzquran' ) ], 404 );
        }

        $deleted = $this->user_reflections->delete( $id, $user_id );

        if ( ! $deleted ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'Unable to delete this reflection at the moment.', 'alfawzquran' ),
                ],
                500
            );
        }

        return new WP_REST_Response(
            [
                'success' => true,
                'deleted' => true,
            ],
            200
        );
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

        $result = $this->record_progress_award( $user_id, $surah_id, $verse_id, $progress_type, $hasanat, $repetition_count );

        if ( is_wp_error( $result ) ) {
            $status = (int) $result->get_error_data( 'status' );
            if ( ! $status ) {
                $status = 500;
            }

            return new \WP_REST_Response(
                [
                    'success' => false,
                    'message' => $result->get_error_message(),
                ],
                $status
            );
        }

        return new \WP_REST_Response(
            array_merge(
                [
                    'success' => true,
                    'message' => __( 'Progress updated successfully.', 'alfawzquran' ),
                ],
                $result
            ),
            200
        );
    }

    /**
     * Record a hasanat award from the reader or memorizer interface.
     */
    public function award_hasanat( WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new WP_REST_Response( [ 'success' => false, 'message' => __( 'User not logged in.', 'alfawzquran' ) ], 401 );
        }

        $surah_id         = $request->get_param( 'surah_id' );
        $verse_id         = $request->get_param( 'verse_id' );
        $hasanat          = $request->get_param( 'hasanat' );
        $progress_type    = $request->get_param( 'progress_type' );
        $repetition_count = $request->get_param( 'repetition_count' );

        $result = $this->record_progress_award( $user_id, $surah_id, $verse_id, $progress_type, $hasanat, $repetition_count );

        if ( is_wp_error( $result ) ) {
            $status = (int) $result->get_error_data( 'status' );
            if ( ! $status ) {
                $status = 500;
            }

            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => $result->get_error_message(),
                ],
                $status
            );
        }

        return new WP_REST_Response(
            array_merge(
                [ 'success' => true ],
                $result
            ),
            200
        );
    }

    /**
     * Persist a hasanat award and keep the running total in user meta.
     */
    private function record_progress_award( $user_id, $surah_id, $verse_id, $progress_type, $hasanat, $repetition_count = 0 ) {
        $surah_id         = absint( $surah_id );
        $verse_id         = absint( $verse_id );
        $hasanat          = (int) $hasanat;
        $repetition_count = (int) $repetition_count;

        if ( $surah_id <= 0 || $verse_id <= 0 ) {
            return new WP_Error(
                'alfawz_invalid_reference',
                __( 'A valid surah and verse are required.', 'alfawzquran' ),
                [ 'status' => 400 ]
            );
        }

        if ( $hasanat <= 0 ) {
            return new WP_Error(
                'alfawz_invalid_hasanat',
                __( 'Hasanat must be greater than zero.', 'alfawzquran' ),
                [ 'status' => 400 ]
            );
        }

        $progress_type = $progress_type ? sanitize_key( (string) $progress_type ) : 'read';
        $allowed_types = [ 'read', 'memorized' ];
        if ( ! in_array( $progress_type, $allowed_types, true ) ) {
            $progress_type = 'read';
        }

        $progress_model = new UserProgress();
        $result         = $progress_model->add_progress( $user_id, $surah_id, $verse_id, $progress_type, $hasanat, $repetition_count );

        if ( ! is_array( $result ) ) {
            $result = [
                'success'          => (bool) $result,
                'hasanat_awarded'  => $result ? $hasanat : 0,
                'already_recorded' => false,
                'progress_id'      => 0,
            ];
        }

        if ( empty( $result['success'] ) ) {
            return new WP_Error(
                'alfawz_progress_error',
                __( 'Unable to record progress at this time.', 'alfawzquran' ),
                [ 'status' => 500 ]
            );
        }

        $awarded = isset( $result['hasanat_awarded'] ) ? (int) $result['hasanat_awarded'] : 0;

        $current_total = (int) get_user_meta( $user_id, 'total_hasanat', true );
        if ( $current_total < 0 ) {
            $current_total = 0;
        }

        if ( $awarded > 0 ) {
            $current_total += $awarded;
        }

        update_user_meta( $user_id, 'total_hasanat', $current_total );

        return [
            'total_hasanat'   => $current_total,
            'hasanat_awarded' => $awarded,
            'already_counted' => $awarded === 0,
            'progress_type'   => $progress_type,
            'progress_id'     => isset( $result['progress_id'] ) ? (int) $result['progress_id'] : 0,
        ];
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
        $avatar_data = $this->prepare_user_avatar( $user_id );
        $stats['avatar_url']    = $avatar_data['url'];
        $stats['avatar_gender'] = $avatar_data['gender'];
        $stats['member_since'] = $user_data ? date( 'M Y', strtotime( $user_data->user_registered ) ) : 'N/A';
        $stats['daily_goal'] = $this->prepare_daily_goal_state( $user_id, $timezone_offset );

        return new \WP_REST_Response( $stats, 200 );
    }

    /**
     * Return progress-based achievement states for the authenticated user.
     */
    public function get_achievements( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'User not logged in.' ], 401 );
        }

        $progress_model = new UserProgress();
        $stats          = $progress_model->get_user_stats( $user_id );

        $achievements = [];

        $verses_read = (int) ( $stats['verses_read'] ?? 0 );
        $verses_memorized = (int) ( $stats['verses_memorized'] ?? 0 );
        $current_streak = (int) ( $stats['current_streak'] ?? 0 );
        $longest_streak = (int) ( $stats['longest_streak'] ?? 0 );

        $achievements[] = [
            'id'          => 'streak-10',
            'title'       => __( '10-Day Flame', 'alfawzquran' ),
            'description' => __( 'Sustain a ten day recitation streak.', 'alfawzquran' ),
            'reward'      => 150,
            'progress'    => min( 10, max( $current_streak, $longest_streak ) ),
            'target'      => 10,
            'unlocked'    => max( $current_streak, $longest_streak ) >= 10,
            'icon'        => '🔥',
        ];

        $achievements[] = [
            'id'          => 'verses-100',
            'title'       => __( 'Century Reader', 'alfawzquran' ),
            'description' => __( 'Read one hundred unique verses.', 'alfawzquran' ),
            'reward'      => 220,
            'progress'    => min( 100, $verses_read ),
            'target'      => 100,
            'unlocked'    => $verses_read >= 100,
            'icon'        => '🌟',
        ];

        $achievements[] = [
            'id'          => 'memory-5',
            'title'       => __( 'Heartscribe', 'alfawzquran' ),
            'description' => __( 'Commit five verses to memory.', 'alfawzquran' ),
            'reward'      => 300,
            'progress'    => min( 5, $verses_memorized ),
            'target'      => 5,
            'unlocked'    => $verses_memorized >= 5,
            'icon'        => '🧠',
        ];

        return new \WP_REST_Response(
            [
                'achievements' => $achievements,
            ],
            200
        );
    }

    /**
     * Provide the current daily quests and their progress state for the user.
     */
    public function get_daily_quests( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( ! $user_id ) {
            return new \WP_REST_Response( [ 'success' => false, 'message' => 'User not logged in.' ], 401 );
        }

        $timezone_offset = $request->get_param( 'timezone_offset' );
        $progress_model  = new UserProgress();

        list( $day_start, $day_end ) = $this->get_local_day_bounds( $timezone_offset );
        $daily_summary = $progress_model->get_daily_progress_summary( $user_id, $day_start, $day_end );

        $quests = [];

        $hasanat_today = (int) ( $daily_summary['hasanat'] ?? 0 );
        $quests[]      = [
            'id'          => 'hasanat-burst',
            'title'       => __( 'Earn 500 Hasanat', 'alfawzquran' ),
            'description' => __( 'Let every letter shine—gather five hundred hasanat today.', 'alfawzquran' ),
            'reward'      => 180,
            'progress'    => $hasanat_today,
            'target'      => 500,
            'status'      => $hasanat_today >= 500 ? 'completed' : 'in_progress',
        ];

        return new \WP_REST_Response(
            [
                'quests' => $quests,
            ],
            200
        );
    }

    public function get_user_profile( WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( empty( $user_id ) ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'User not logged in.', 'alfawzquran' ),
                ],
                401
            );
        }

        $user = get_userdata( $user_id );
        if ( ! $user ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'Unable to load profile.', 'alfawzquran' ),
                ],
                404
            );
        }

        return new WP_REST_Response(
            $this->prepare_profile_payload( $user ),
            200
        );
    }

    public function update_user_profile( WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( empty( $user_id ) ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'User not logged in.', 'alfawzquran' ),
                ],
                401
            );
        }

        $params    = $request->get_json_params();
        if ( empty( $params ) ) {
            $params = $request->get_params();
        }

        $full_name      = isset( $params['full_name'] ) ? sanitize_text_field( $params['full_name'] ) : '';
        $has_avatar_key = array_key_exists( 'avatar_gender', $params );
        $avatar_raw     = $has_avatar_key ? $params['avatar_gender'] : '';
        $avatar_gender  = $has_avatar_key ? $this->normalise_avatar_gender( $avatar_raw ) : '';

        if ( '' === $full_name && ! $has_avatar_key ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'Please provide a field to update.', 'alfawzquran' ),
                ],
                400
            );
        }

        if ( $has_avatar_key && '' !== $avatar_raw && '' === $avatar_gender ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'Please choose a valid profile silhouette.', 'alfawzquran' ),
                ],
                400
            );
        }

        if ( '' !== $full_name ) {
            $name_parts = preg_split( '/\s+/', trim( $full_name ) );
            $first_name = $name_parts ? array_shift( $name_parts ) : '';
            $last_name  = $name_parts ? implode( ' ', $name_parts ) : '';

            $user_update = [
                'ID'           => $user_id,
                'display_name' => $full_name,
            ];

            if ( $first_name ) {
                $user_update['first_name'] = $first_name;
            }

            if ( $last_name ) {
                $user_update['last_name'] = $last_name;
            }

            $result = wp_update_user( $user_update );

            if ( is_wp_error( $result ) ) {
                return new WP_REST_Response(
                    [
                        'success' => false,
                        'message' => __( 'Unable to update your profile right now.', 'alfawzquran' ),
                    ],
                    500
                );
            }

            update_user_meta( $user_id, 'nickname', $full_name );
        }

        if ( $has_avatar_key ) {
            if ( $avatar_gender ) {
                update_user_meta( $user_id, 'alfawz_avatar_gender', $avatar_gender );
            } else {
                delete_user_meta( $user_id, 'alfawz_avatar_gender' );
            }
        }

        $user = get_userdata( $user_id );
        if ( ! $user ) {
            return new WP_REST_Response(
                [
                    'success' => false,
                    'message' => __( 'Unable to load profile.', 'alfawzquran' ),
                ],
                500
            );
        }

        return new WP_REST_Response( $this->prepare_profile_payload( $user ), 200 );
    }

    public function get_user_preferences( WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        if ( empty( $user_id ) ) {
            return new WP_REST_Response( [ 'success' => false, 'message' => 'User not logged in.' ], 401 );
        }

        return new WP_REST_Response( $this->prepare_user_preferences( $user_id ), 200 );
    }

    public function update_user_preferences( WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        if ( empty( $user_id ) ) {
            return new WP_REST_Response( [ 'success' => false, 'message' => 'User not logged in.' ], 401 );
        }

        $params = $request->get_json_params();
        if ( empty( $params ) ) {
            $params = $request->get_params();
        }

        $map = [
            'default_reciter'         => 'alfawz_pref_default_reciter',
            'default_translation'     => 'alfawz_pref_default_translation',
            'default_transliteration' => 'alfawz_pref_default_transliteration',
            'hasanat_per_letter'      => 'alfawz_pref_hasanat_per_letter',
            'daily_verse_target'      => 'alfawz_pref_daily_target',
            'enable_leaderboard'      => 'alfawz_pref_enable_leaderboard',
            'audio_feedback'          => 'alfawz_pref_audio_feedback',
            'text_size'               => 'alfawz_pref_text_size',
            'interface_language'      => 'alfawz_pref_interface_language',
        ];

        foreach ( $map as $key => $meta_key ) {
            if ( ! array_key_exists( $key, $params ) ) {
                continue;
            }

            $value = $params[ $key ];

            switch ( $key ) {
                case 'default_reciter':
                case 'default_translation':
                    update_user_meta( $user_id, $meta_key, sanitize_text_field( $value ) );
                    break;
                case 'default_transliteration':
                    update_user_meta( $user_id, $meta_key, sanitize_text_field( $value ) );
                    break;
                case 'hasanat_per_letter':
                    update_user_meta( $user_id, $meta_key, max( 1, absint( $value ) ) );
                    break;
                case 'daily_verse_target':
                    update_user_meta( $user_id, $meta_key, max( 1, absint( $value ) ) );
                    break;
                case 'enable_leaderboard':
                    update_user_meta( $user_id, $meta_key, $value ? 1 : 0 );
                    break;
                case 'audio_feedback':
                    update_user_meta( $user_id, $meta_key, $value ? 1 : 0 );
                    break;
                case 'text_size':
                    update_user_meta( $user_id, $meta_key, sanitize_text_field( $value ) );
                    break;
                case 'interface_language':
                    $lang = substr( sanitize_key( (string) $value ), 0, 2 );
                    if ( ! in_array( $lang, [ 'en', 'ar', 'ur' ], true ) ) {
                        $lang = 'en';
                    }
                    update_user_meta( $user_id, $meta_key, $lang );
                    break;
            }
        }

        if ( array_key_exists( 'age_band', $params ) ) {
            $band = DailyTargets::normalise_band( sanitize_key( (string) $params['age_band'] ) );
            update_user_meta( $user_id, 'alfawz_pref_age_band', $band );
        }

        if ( isset( $params['daily_target_bands'] ) && is_array( $params['daily_target_bands'] ) ) {
            foreach ( DailyTargets::bands() as $band ) {
                if ( ! array_key_exists( $band, $params['daily_target_bands'] ) ) {
                    continue;
                }

                $meta_key = DailyTargets::band_meta_key( $band );
                if ( ! $meta_key ) {
                    continue;
                }

                $band_value = max( 1, absint( $params['daily_target_bands'][ $band ] ) );
                update_user_meta( $user_id, $meta_key, $band_value );
            }
        }

        return new WP_REST_Response( $this->prepare_user_preferences( $user_id ), 200 );
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
     * Create a new user from the admin dashboard.
     */
    public function create_admin_user( WP_REST_Request $request ) {
        $nonce = $this->verify_action_nonce( $request, 'alfawz_admin_users' );
        if ( is_wp_error( $nonce ) ) {
            return $nonce;
        }

        $params = $request->get_json_params();

        $first_name   = isset( $params['first_name'] ) ? sanitize_text_field( $params['first_name'] ) : '';
        $last_name    = isset( $params['last_name'] ) ? sanitize_text_field( $params['last_name'] ) : '';
        $display_name = isset( $params['display_name'] ) ? sanitize_text_field( $params['display_name'] ) : '';
        $email        = isset( $params['email'] ) ? sanitize_email( $params['email'] ) : '';
        $role         = isset( $params['role'] ) ? sanitize_text_field( $params['role'] ) : '';
        $password     = isset( $params['password'] ) && is_string( $params['password'] ) ? trim( $params['password'] ) : '';
        $send_email   = ! empty( $params['send_email'] );

        if ( ! $email || ! is_email( $email ) ) {
            return new WP_Error( 'rest_invalid_email', __( 'Please provide a valid email address.', 'alfawzquran' ), [ 'status' => 400 ] );
        }

        if ( email_exists( $email ) ) {
            return new WP_Error( 'rest_email_exists', __( 'A user with this email already exists.', 'alfawzquran' ), [ 'status' => 409 ] );
        }

        $allowed_roles = apply_filters( 'alfawz_admin_allowed_roles', [ 'student', 'teacher', 'alfawz_admin', 'subscriber' ] );

        if ( ! in_array( $role, $allowed_roles, true ) ) {
            return new WP_Error( 'rest_invalid_role', __( 'Invalid role supplied.', 'alfawzquran' ), [ 'status' => 400 ] );
        }

        if ( ! $display_name ) {
            $display_name = trim( $first_name . ' ' . $last_name );
        }

        if ( ! $display_name ) {
            $display_name = $email;
        }

        $username_input = isset( $params['username'] ) ? sanitize_user( $params['username'], true ) : '';
        $username_base  = $username_input;

        if ( ! $username_base && $email ) {
            $username_base = sanitize_user( current( explode( '@', $email ) ), true );
        }

        if ( ! $username_base && $display_name ) {
            $username_base = sanitize_user( $display_name, true );
        }

        $user_login = $this->generate_unique_username( $username_base );

        $generated_password = false;

        if ( '' === $password ) {
            $password          = wp_generate_password( 12, false );
            $generated_password = true;
        }

        $user_id = wp_insert_user(
            [
                'user_login'   => $user_login,
                'user_pass'    => $password,
                'user_email'   => $email,
                'role'         => $role,
                'first_name'   => $first_name,
                'last_name'    => $last_name,
                'display_name' => $display_name,
                'nickname'     => $display_name,
            ]
        );

        if ( is_wp_error( $user_id ) ) {
            return $user_id;
        }

        if ( $send_email ) {
            wp_new_user_notification( $user_id, null, 'both' );
        }

        $response = [
            'user'       => $this->prepare_user_payload( get_userdata( $user_id ) ),
            'email_sent' => (bool) $send_email,
        ];

        if ( $generated_password && ! $send_email ) {
            $response['password'] = $password;
        }

        return new WP_REST_Response( $response, 201 );
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

        $allowed_roles = apply_filters( 'alfawz_admin_allowed_roles', [ 'student', 'teacher', 'alfawz_admin', 'subscriber' ] );

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
            $avatar = $this->prepare_user_avatar( $user->ID );
            return [
                'id'        => (int) $user->ID,
                'name'      => $user->display_name,
                'email'     => $user->user_email,
                'class_id'  => \get_user_meta( $user->ID, 'alfawz_class_id', true ),
                'avatar'    => $avatar['url'],
                'avatar_gender' => $avatar['gender'],
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
     * Generate a unique username based on a preferred value.
     */
    private function generate_unique_username( $base ) {
        $username = sanitize_user( $base, true );

        if ( '' === $username ) {
            $username = 'alfawz_user';
        }

        $original = $username;
        $suffix   = 1;

        while ( username_exists( $username ) ) {
            $username = $original . $suffix;
            $suffix++;
        }

        return $username;
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

                $avatar = $this->prepare_user_avatar( $student_id );

                $roster['students'][ $student_id ] = [
                    'id'          => $student_id,
                    'name'        => $user->display_name,
                    'email'       => $user->user_email,
                    'avatar'      => $avatar['url'],
                    'avatar_gender' => $avatar['gender'],
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
                $progress      = $this->prepare_egg_challenge_state( $user->ID );
                $daily_count   = (int) get_user_meta( $user->ID, self::DAILY_GOAL_META_COUNT, true );
                $band_targets  = DailyTargets::get_band_targets( $user->ID );
                $age_band      = DailyTargets::resolve_age_band( $user->ID );
                $daily_target  = max( 1, (int) ( $band_targets[ $age_band ] ?? DailyTargets::resolve_user_target( $user->ID ) ) );

                return [
                    'id'                => (int) $user->ID,
                    'name'              => $user->display_name,
                    'email'             => $user->user_email,
                    'egg_count'         => $progress['count'],
                    'egg_target'        => $progress['target'],
                    'egg_percentage'    => $progress['percentage'],
                    'last_completion'   => $progress['previous_target'],
                    'daily_goal_count'  => $daily_count,
                    'daily_goal_target' => $daily_target,
                    'daily_goal_band'   => $age_band,
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

    private function prepare_user_preferences( $user_id ) {
        $defaults = [
            'default_reciter'         => get_option( 'alfawz_default_reciter', 'ar.alafasy' ),
            'default_translation'     => get_option( 'alfawz_default_translation', 'en.sahih' ),
            'default_transliteration' => get_option( 'alfawz_default_transliteration', 'en.transliteration' ),
            'hasanat_per_letter'      => (int) get_option( 'alfawz_hasanat_per_letter', 10 ),
            'daily_verse_target'      => (int) get_option( 'alfawz_daily_verse_target', 10 ),
            'enable_leaderboard'      => (bool) get_option( 'alfawz_enable_leaderboard', 1 ),
            'audio_feedback'          => true,
            'text_size'               => 'medium',
            'interface_language'      => 'en',
        ];

        $map = [
            'default_reciter'         => 'alfawz_pref_default_reciter',
            'default_translation'     => 'alfawz_pref_default_translation',
            'default_transliteration' => 'alfawz_pref_default_transliteration',
            'hasanat_per_letter'      => 'alfawz_pref_hasanat_per_letter',
            'daily_verse_target'      => 'alfawz_pref_daily_target',
            'enable_leaderboard'      => 'alfawz_pref_enable_leaderboard',
            'audio_feedback'          => 'alfawz_pref_audio_feedback',
            'text_size'               => 'alfawz_pref_text_size',
            'interface_language'      => 'alfawz_pref_interface_language',
        ];

        $preferences = [];

        foreach ( $map as $key => $meta_key ) {
            $value = get_user_meta( $user_id, $meta_key, true );

            if ( '' === $value || null === $value ) {
                $preferences[ $key ] = $defaults[ $key ];
                continue;
            }

            if ( in_array( $key, [ 'enable_leaderboard', 'audio_feedback' ], true ) ) {
                $preferences[ $key ] = (bool) $value;
            } elseif ( in_array( $key, [ 'hasanat_per_letter', 'daily_verse_target' ], true ) ) {
                $preferences[ $key ] = (int) $value;
            } elseif ( 'interface_language' === $key ) {
                $lang = substr( sanitize_key( (string) $value ), 0, 2 );
                $preferences[ $key ] = in_array( $lang, [ 'en', 'ar', 'ur' ], true ) ? $lang : $defaults[ $key ];
            } else {
                $preferences[ $key ] = $value;
            }
        }

        $preferences['daily_verse_target']  = max( 1, (int) ( $preferences['daily_verse_target'] ?? $defaults['daily_verse_target'] ) );
        $preferences['age_band']            = DailyTargets::resolve_age_band( $user_id );
        $preferences['daily_target_bands']  = DailyTargets::get_band_targets( $user_id );

        return $preferences;
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
     * Resolve the personalised daily target for the given user.
     */
    private function resolve_user_daily_target( $user_id ) {
        return DailyTargets::resolve_user_target( $user_id );
    }

    /**
     * Prepare a contiguous daily series for the requested range.
     */
    private function normalise_activity_series( array $history, $range, $target ) {
        $range  = max( 1, (int) $range );
        $target = max( 1, (int) $target );

        $map = [];
        foreach ( $history as $row ) {
            if ( empty( $row['date'] ) ) {
                continue;
            }

            $map[ $row['date'] ] = [
                'verses_read'      => isset( $row['verses_read'] ) ? (int) $row['verses_read'] : 0,
                'verses_memorized' => isset( $row['verses_memorized'] ) ? (int) $row['verses_memorized'] : 0,
                'hasanat'          => isset( $row['hasanat'] ) ? (int) $row['hasanat'] : 0,
            ];
        }

        $series = [];
        $anchor = new DateTimeImmutable( 'now', new DateTimeZone( 'UTC' ) );
        $anchor = $anchor->setTime( 0, 0, 0 );

        for ( $i = $range - 1; $i >= 0; $i-- ) {
            $date_obj = $anchor->modify( sprintf( '-%d days', $i ) );
            $date_key = $date_obj->format( 'Y-m-d' );
            $stats    = $map[ $date_key ] ?? [ 'verses_read' => 0, 'verses_memorized' => 0, 'hasanat' => 0 ];
            $verses   = (int) $stats['verses_read'];
            $ratio    = $target > 0 ? min( 1, $verses / $target ) : 0;

            $series[] = [
                'date'        => $date_key,
                'label'       => $date_obj->format( 'M j' ),
                'weekday'     => $date_obj->format( 'D' ),
                'verses'      => $verses,
                'memorized'   => (int) $stats['verses_memorized'],
                'hasanat'     => (int) $stats['hasanat'],
                'percentage'  => round( $ratio * 100, 1 ),
                'met_goal'    => $ratio >= 1,
                'target'      => $target,
            ];
        }

        return $series;
    }

    /**
     * Build the dynamic goal payload inspired by Quranly's smart coach.
     */
    private function build_dynamic_goal_insights( array $series, $target ) {
        $target = max( 1, (int) $target );

        if ( empty( $series ) ) {
            return [
                'suggested_target' => $target,
                'today'            => 0,
                'range_average'    => 0,
                'trend'            => 'steady',
                'trend_delta'      => 0,
                'today_percentage' => 0,
                'streak_met_goal'  => 0,
                'message'          => __( 'Recite your first ayah today to unlock personalised insights.', 'alfawzquran' ),
                'goal_message'     => sprintf(
                    __( 'Aim for %1$s verses today.', 'alfawzquran' ),
                    number_format_i18n( $target )
                ),
            ];
        }

        $counts = array_map(
            static function ( $day ) {
                return isset( $day['verses'] ) ? (int) $day['verses'] : 0;
            },
            $series
        );

        $today         = (int) end( $counts );
        $recent_window = array_slice( $counts, -7 );
        $average       = ! empty( $recent_window ) ? array_sum( $recent_window ) / count( $recent_window ) : 0;
        $suggested     = $average > 0 ? (int) round( $average ) : $target;
        $suggested     = max( 3, min( 60, $suggested ) );

        if ( $suggested <= 0 ) {
            $suggested = $target;
        }

        $previous_window = array_slice( $counts, -4, 3 );
        $previous_avg    = ! empty( $previous_window ) ? array_sum( $previous_window ) / count( $previous_window ) : 0;
        $trend_delta     = $today - $previous_avg;

        if ( $trend_delta > 1.5 ) {
            $trend = 'up';
        } elseif ( $trend_delta < -1.5 ) {
            $trend = 'down';
        } else {
            $trend = 'steady';
        }

        $today_percentage = $suggested > 0 ? min( 100, round( ( $today / $suggested ) * 100 ) ) : 0;
        $streak_met_goal  = $this->calculate_goal_streak( $series );

        if ( $today_percentage >= 100 ) {
            $message = __( 'Takbir! You have already met today’s personalised target.', 'alfawzquran' );
        } elseif ( 'up' === $trend ) {
            $message = __( 'Your pace is accelerating—keep nourishing your heart with this momentum.', 'alfawzquran' );
        } elseif ( 'down' === $trend ) {
            $message = __( 'Slow and steady is still progress. Revisit a shorter passage to rebuild flow.', 'alfawzquran' );
        } else {
            $message = __( 'A consistent rhythm is forming. Protect it with a mindful recitation today.', 'alfawzquran' );
        }

        return [
            'suggested_target' => $suggested,
            'today'            => $today,
            'range_average'    => round( $average, 1 ),
            'trend'            => $trend,
            'trend_delta'      => round( $trend_delta, 1 ),
            'today_percentage' => $today_percentage,
            'streak_met_goal'  => $streak_met_goal,
            'message'          => $message,
            'goal_message'     => sprintf(
                __( 'Aim for %1$s verses today (recent average %2$s).', 'alfawzquran' ),
                number_format_i18n( $suggested ),
                number_format_i18n( max( 0, $average ), 1 )
            ),
        ];
    }

    /**
     * Summarise consistency metrics for the dashboard heatmap.
     */
    private function build_consistency_insights( array $series, $target ) {
        $target     = max( 1, (int) $target );
        $total_days = count( $series );

        if ( $total_days <= 0 ) {
            return [
                'score'           => 0,
                'status'          => 'fresh',
                'message'         => __( 'Begin logging verses to unlock your consistency insights.', 'alfawzquran' ),
                'met_goal_days'   => 0,
                'total_days'      => 0,
                'streak_met_goal' => 0,
            ];
        }

        $met_goal_days = 0;
        $ratio_sum     = 0.0;

        foreach ( $series as $day ) {
            $verses = isset( $day['verses'] ) ? (int) $day['verses'] : 0;
            $ratio  = $target > 0 ? min( 1, $verses / $target ) : 0;
            $ratio_sum += $ratio;

            if ( $ratio >= 1 ) {
                $met_goal_days++;
            }
        }

        $score           = (int) round( ( $ratio_sum / max( 1, $total_days ) ) * 100 );
        $streak_met_goal = $this->calculate_goal_streak( $series );

        if ( $score >= 85 ) {
            $status  = 'radiant';
            $message = __( 'Phenomenal consistency—this mirrors Quranly’s radiant streak tier!', 'alfawzquran' );
        } elseif ( $score >= 60 ) {
            $status  = 'steady';
            $message = __( 'A steady habit is blooming. Keep polishing your heart each day.', 'alfawzquran' );
        } elseif ( $score > 0 ) {
            $status  = 'growing';
            $message = __( 'Let’s rebuild with small, sincere sessions—every ayah counts.', 'alfawzquran' );
        } else {
            $status  = 'fresh';
            $message = __( 'Start today with one ayah to unlock personalised streak coaching.', 'alfawzquran' );
        }

        return [
            'score'           => $score,
            'status'          => $status,
            'message'         => $message,
            'met_goal_days'   => $met_goal_days,
            'total_days'      => $total_days,
            'streak_met_goal' => $streak_met_goal,
        ];
    }

    /**
     * Determine the current streak of days meeting the daily goal.
     */
    private function calculate_goal_streak( array $series ) {
        $streak = 0;

        for ( $i = count( $series ) - 1; $i >= 0; $i-- ) {
            $met = ! empty( $series[ $i ]['met_goal'] );
            if ( $met ) {
                $streak++;
            } else {
                break;
            }
        }

        return $streak;
    }

    /**
     * Decorate a reflection row for REST responses.
     */
    private function transform_reflection_for_response( array $reflection ) {
        $reflection['surah_id'] = isset( $reflection['surah_id'] ) ? (int) $reflection['surah_id'] : 0;
        $reflection['verse_id'] = isset( $reflection['verse_id'] ) ? (int) $reflection['verse_id'] : 0;
        $reflection['mood']     = sanitize_key( $reflection['mood'] ?? '' );
        $reflection['verse_key'] = sprintf( '%d:%d', $reflection['surah_id'], $reflection['verse_id'] );
        $reflection['mood_label'] = $this->get_reflection_mood_label( $reflection['mood'] );
        $reflection['excerpt']    = wp_trim_words( $reflection['content'] ?? '', 28, '…' );

        $created_gmt = $reflection['created_at'] ?? '';
        $timestamp   = $created_gmt ? strtotime( $created_gmt . ' UTC' ) : false;

        if ( $timestamp ) {
            $reflection['created_at_gmt']   = gmdate( 'c', $timestamp );
            $reflection['created_at_label'] = gmdate( 'M j', $timestamp );
        } else {
            $reflection['created_at_gmt']   = '';
            $reflection['created_at_label'] = '';
        }

        return $reflection;
    }

    /**
     * Provide a human-readable label for reflection moods.
     */
    private function get_reflection_mood_label( $mood ) {
        $key = sanitize_key( $mood );
        $map = [
            'grateful'   => __( 'Grateful', 'alfawzquran' ),
            'focused'    => __( 'Focused', 'alfawzquran' ),
            'hopeful'    => __( 'Hopeful', 'alfawzquran' ),
            'reflective' => __( 'Reflective', 'alfawzquran' ),
            'striving'   => __( 'Striving', 'alfawzquran' ),
            'uplifted'   => __( 'Uplifted', 'alfawzquran' ),
        ];

        return $map[ $key ] ?? __( 'Reflection', 'alfawzquran' );
    }

    /**
     * Build the current daily goal state for a user, resetting when necessary.
     */
    private function prepare_daily_goal_state( $user_id, $timezone_offset = null ) {
        $this->maybe_reset_daily_goal( $user_id, $timezone_offset );

        $count        = (int) get_user_meta( $user_id, self::DAILY_GOAL_META_COUNT, true );
        $band_targets = DailyTargets::get_band_targets( $user_id );
        $age_band     = DailyTargets::resolve_age_band( $user_id );
        $target       = max( 1, (int) ( $band_targets[ $age_band ] ?? DailyTargets::resolve_user_target( $user_id ) ) );
        $percentage   = $target > 0 ? round( ( $count / $target ) * 100, 2 ) : 0;
        $remaining    = max( 0, $target - $count );
        $last_reset   = get_user_meta( $user_id, self::DAILY_GOAL_META_LAST_RESET, true );

        if ( '' === $last_reset ) {
            $last_reset = $this->get_local_date_string( $timezone_offset );
            update_user_meta( $user_id, self::DAILY_GOAL_META_LAST_RESET, $last_reset );
        }

        return [
            'count'         => $count,
            'target'        => $target,
            'percentage'    => min( 100, $percentage ),
            'remaining'     => $remaining,
            'last_reset'    => $last_reset,
            'band_targets'  => $band_targets,
            'age_band'      => $age_band,
        ];
    }

    /**
     * Calculate the UTC bounds for the current local day based on offset or WordPress timezone.
     */
    private function get_local_day_bounds( $timezone_offset = null ) {
        if ( null !== $timezone_offset && '' !== $timezone_offset && is_numeric( $timezone_offset ) ) {
            $offset_minutes = (int) $timezone_offset;
            $now_utc        = new DateTimeImmutable( 'now', new DateTimeZone( 'UTC' ) );
            $local_now      = $now_utc->modify( sprintf( '%+d minutes', $offset_minutes ) );
            $start_local    = $local_now->setTime( 0, 0, 0 );
            $end_local      = $start_local->modify( '+1 day' );
            $start_utc      = $start_local->modify( sprintf( '%+d minutes', -$offset_minutes ) );
            $end_utc        = $end_local->modify( sprintf( '%+d minutes', -$offset_minutes ) );
        } else {
            $timezone   = wp_timezone();
            $local_now  = new DateTimeImmutable( 'now', $timezone );
            $start_local = $local_now->setTime( 0, 0, 0 );
            $end_local   = $start_local->modify( '+1 day' );
            $start_utc   = $start_local->setTimezone( new DateTimeZone( 'UTC' ) );
            $end_utc     = $end_local->setTimezone( new DateTimeZone( 'UTC' ) );
        }

        return [
            $start_utc->format( 'Y-m-d H:i:s' ),
            $end_utc->format( 'Y-m-d H:i:s' ),
        ];
    }

    /**
     * Increment the daily goal while respecting unique verses per day.
     */
    private function increment_daily_goal_progress( $user_id, $verse_key, $timezone_offset = null ) {
        $state          = $this->prepare_daily_goal_state( $user_id, $timezone_offset );
        $previous_count = (int) $state['count'];
        $target         = max( 1, (int) ( $state['target'] ?? DailyTargets::resolve_user_target( $user_id ) ) );

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

        $just_completed = ( $previous_count < $target ) && ( $count >= $target ) && ! $already_counted;

        if ( $just_completed ) {
            update_user_meta( $user_id, self::DAILY_GOAL_META_LAST_COMPLETION, current_time( 'mysql' ) );
        }

        return [
            'count'           => $count,
            'target'          => $target,
            'remaining'       => max( 0, $target - $count ),
            'percentage'      => min( 100, $target > 0 ? round( ( $count / $target ) * 100, 2 ) : 0 ),
            'just_completed'  => $just_completed,
            'already_counted' => $already_counted,
            'last_reset'      => $state['last_reset'],
            'band_targets'    => isset( $state['band_targets'] ) ? $state['band_targets'] : DailyTargets::get_band_targets( $user_id ),
            'age_band'        => isset( $state['age_band'] ) ? $state['age_band'] : DailyTargets::resolve_age_band( $user_id ),
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
            $target = self::EGG_CHALLENGE_BASE_TARGET;
            update_user_meta( $user_id, self::EGG_CHALLENGE_TARGET_META, $target );
        }

        if ( $count < 0 ) {
            $count = 0;
            update_user_meta( $user_id, self::EGG_CHALLENGE_COUNT_META, 0 );
        }

        $percentage       = $target > 0 ? round( ( $count / $target ) * 100, 2 ) : 0;
        $previous_target  = get_user_meta( $user_id, self::EGG_CHALLENGE_LAST_TARGET_META, true );
        $last_completion  = get_user_meta( $user_id, self::EGG_CHALLENGE_LAST_COMPLETION_META, true );
        $normalized_count = min( $count, $target );
        $phase_info       = $this->resolve_egg_challenge_phase( $target, $previous_target );

        return [
            'count'            => $normalized_count,
            'target'           => $target,
            'percentage'       => min( 100, $percentage ),
            'remaining'        => max( 0, $target - $normalized_count ),
            'previous_target'  => '' !== $previous_target ? (int) $previous_target : null,
            'completed'        => false,
            'next_target'      => $target,
            'level'            => $this->calculate_egg_challenge_level( $target ),
            'last_completion'  => $last_completion ? gmdate( 'c', strtotime( $last_completion ) ) : null,
            'progress_label'   => sprintf( '%d / %d', $normalized_count, $target ),
            'phase'            => $phase_info['phase'],
            'growth_stage'     => $phase_info['growth_stage'],
            'growth_completed' => $phase_info['growth_completed'],
            'max_growth_stage' => $phase_info['max_growth_stage'],
        ];
    }

    /**
     * Determine the egg challenge level based on the active target size.
     */
    private function calculate_egg_challenge_level( $target ) {
        $target = (int) $target;
        $base   = (int) self::EGG_CHALLENGE_BASE_TARGET;
        $step   = max( 1, (int) self::EGG_CHALLENGE_STEP );

        if ( $target <= $base ) {
            return 1;
        }

        $progress = max( 0, $target - $base );

        return 1 + (int) floor( $progress / $step );
    }

    /**
     * Determine whether the user should see the egg challenge or the growth challenge.
     *
     * @param int      $target          The active target for the challenge.
     * @param int|null $previous_target The most recently completed target.
     *
     * @return array{phase:string,growth_stage:int,growth_completed:int,max_growth_stage:int}
     */
    private function resolve_egg_challenge_phase( $target, $previous_target = null ) {
        $target          = (int) $target;
        $has_previous    = null !== $previous_target && '' !== $previous_target;
        $previous_target = $has_previous ? (int) $previous_target : null;
        $step            = max( 1, (int) self::EGG_CHALLENGE_STEP );
        $max_level       = max( 1, (int) self::EGG_CHALLENGE_MAX_LEVEL );
        $final_egg       = (int) self::EGG_CHALLENGE_BASE_TARGET + ( ( $max_level - 1 ) * $step );
        $max_stage       = max( 1, (int) self::TREE_CHALLENGE_MAX_STAGE );

        $phase = 'egg';
        if ( $target > $final_egg || ( $previous_target && $previous_target >= $final_egg ) ) {
            $phase = 'growth';
        }

        $completed_stages = 0;
        $active_stage     = 0;

        if ( 'growth' === $phase ) {
            $effective_completed = $previous_target && $previous_target >= $final_egg
                ? $previous_target
                : max( $final_egg, $target - $step );

            $completed_stages = (int) floor( max( 0, $effective_completed - $final_egg ) / $step );
            $completed_stages = max( 0, min( $completed_stages, $max_stage ) );
            $active_stage     = max( 1, min( $completed_stages + 1, $max_stage ) );
        }

        return [
            'phase'            => $phase,
            'growth_stage'     => $active_stage,
            'growth_completed' => $completed_stages,
            'max_growth_stage' => $max_stage,
        ];
    }

    /**
     * Increment the egg challenge counters.
     */
    private function increment_egg_challenge( $user_id ) {
        $state            = $this->prepare_egg_challenge_state( $user_id );
        $count            = (int) $state['count'] + 1;
        $target           = (int) $state['target'];
        $completed        = false;
        $previous_target  = null;
        $completed_at     = null;

        if ( $count >= $target ) {
            $completed        = true;
            $previous_target  = $target;
            $target          += self::EGG_CHALLENGE_STEP;
            $count            = 0;
            $completed_at     = current_time( 'mysql', true );

            update_user_meta( $user_id, self::EGG_CHALLENGE_TARGET_META, $target );
            update_user_meta( $user_id, self::EGG_CHALLENGE_COUNT_META, $count );
            update_user_meta( $user_id, self::EGG_CHALLENGE_LAST_TARGET_META, $previous_target );
            update_user_meta( $user_id, self::EGG_CHALLENGE_LAST_COMPLETION_META, $completed_at );
        } else {
            update_user_meta( $user_id, self::EGG_CHALLENGE_COUNT_META, $count );
        }

        $percentage  = $target > 0 ? round( ( $count / $target ) * 100, 2 ) : 0;
        $phase_info  = $this->resolve_egg_challenge_phase( $target, $previous_target ?? $state['previous_target'] ?? null );

        return [
            'count'           => $count,
            'target'          => $target,
            'percentage'      => min( 100, $percentage ),
            'remaining'       => max( 0, $target - $count ),
            'completed'       => $completed,
            'previous_target' => $previous_target,
            'next_target'     => $target,
            'level'           => $this->calculate_egg_challenge_level( $target ),
            'progress_label'  => sprintf( '%d / %d', min( $count, $target ), $target ),
            'completed_at'    => $completed_at ? gmdate( 'c', strtotime( $completed_at ) ) : null,
            'last_completion' => $completed_at ? gmdate( 'c', strtotime( $completed_at ) ) : ( $state['last_completion'] ?? null ),
            'phase'           => $phase_info['phase'],
            'growth_stage'    => $phase_info['growth_stage'],
            'growth_completed' => $phase_info['growth_completed'],
            'max_growth_stage' => $phase_info['max_growth_stage'],
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
        $surah_id       = (int) $request->get_param('id');
        $translation    = $request->get_param('translation');
        $transliteration = $request->get_param('transliteration');

        $verses = $this->get_surah_verses(
            $surah_id,
            $translation ? sanitize_text_field($translation) : null,
            $transliteration ? sanitize_text_field($transliteration) : null
        );

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
                'headers' => $this->build_default_headers(),
            ]
        );

        if ( is_wp_error( $response ) ) {
            return $this->record_api_failure( $response );
        }

        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        if ( ! $this->is_successful_api_response( $data ) || empty( $data['data'] ) ) {
            return $this->record_api_failure( new \WP_Error( 'api_error', __( 'Invalid response received from the Quran API.', 'alfawzquran' ) ) );
        }

        $ayah = $data['data'];

        set_transient( $cache_key, $ayah, HOUR_IN_SECONDS * 6 );
        $this->clear_api_failure_notice();

        return $ayah;
    }

    /**
     * Proxy Quran audio through WordPress to avoid CORS restrictions.
     */
    public function proxy_audio( \WP_REST_Request $request ) {
        $reciter = $this->sanitize_reciter_identifier( (string) $request->get_param( 'reciter' ) );
        $surah   = (int) $request->get_param( 'surah' );
        $verse   = (int) $request->get_param( 'verse' );

        if ( $surah <= 0 || $verse <= 0 ) {
            return new \WP_REST_Response( [ 'message' => __( 'Invalid audio reference provided.', 'alfawzquran' ) ], 400 );
        }

        $reciter = $reciter ?: 'ar.alafasy';

        $padded_surah = str_pad( (string) $surah, 3, '0', STR_PAD_LEFT );
        $padded_verse = str_pad( (string) $verse, 3, '0', STR_PAD_LEFT );
        $file_name    = $padded_surah . $padded_verse . '.mp3';
        $remote_url   = trailingslashit( self::AUDIO_CDN_BASE . $reciter ) . $file_name;

        $cache_key = sprintf( 'alfawz_audio_%s_%d_%d', $reciter, $surah, $verse );
        $cached    = get_transient( $cache_key );
        if ( false !== $cached ) {
            $response = new \WP_REST_Response( $cached );
            $response->set_headers( $this->build_audio_headers( strlen( $cached ) ) );
            return $response;
        }

        $response = wp_remote_get(
            $remote_url,
            [
                'timeout'     => 25,
                'decompress'  => false,
                'redirection' => 3,
                'headers'     => [
                    'Accept'     => 'audio/mpeg',
                    'User-Agent' => $this->build_user_agent(),
                    'Referer'    => home_url(),
                ],
            ]
        );

        if ( is_wp_error( $response ) ) {
            return $this->record_api_failure( $response );
        }

        $status = (int) wp_remote_retrieve_response_code( $response );
        if ( $status < 200 || $status >= 300 ) {
            return $this->record_api_failure( new \WP_Error( 'api_error', __( 'Unable to load requested audio clip from the Quran CDN.', 'alfawzquran' ) ) );
        }

        $body = wp_remote_retrieve_body( $response );
        if ( empty( $body ) ) {
            return $this->record_api_failure( new \WP_Error( 'api_error', __( 'Audio stream returned an empty response.', 'alfawzquran' ) ) );
        }

        set_transient( $cache_key, $body, HOUR_IN_SECONDS * 6 );

        $rest_response = new \WP_REST_Response( $body );
        $rest_response->set_headers( $this->build_audio_headers( strlen( $body ) ) );

        $etag = wp_remote_retrieve_header( $response, 'etag' );
        if ( $etag ) {
            $rest_response->header( 'ETag', $etag );
        }

        return $rest_response;
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
                'headers' => $this->build_default_headers(),
            ]
        );

        if (is_wp_error($response)) {
            $error = $this->record_api_failure($response);
            $fallback = $this->get_local_surah_catalog_from_dataset();
            if ($fallback !== null) {
                set_transient($transient_key, $fallback, DAY_IN_SECONDS);
                update_option($option_key, $fallback, false);
                return $fallback;
            }

            return $error;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!$this->is_successful_api_response($data) || empty($data['data'])) {
            $error = $this->record_api_failure(new \WP_Error('api_error', __('Invalid response received from the Quran API.', 'alfawzquran')));
            $fallback = $this->get_local_surah_catalog_from_dataset();
            if ($fallback !== null) {
                set_transient($transient_key, $fallback, DAY_IN_SECONDS);
                update_option($option_key, $fallback, false);
                return $fallback;
            }

            return $error;
        }

        $surah_payload = $data['data'];
        if (isset($surah_payload['surahs']) && is_array($surah_payload['surahs'])) {
            $surahs = $surah_payload['surahs'];
        } else {
            $surahs = $surah_payload;
        }

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
    private function get_surah_verses(int $surah_id, ?string $translation = null, ?string $transliteration = null) {
        $translation_edition     = $translation !== null ? $translation : (string) get_option('alfawz_default_translation', 'en.sahih');
        $transliteration_edition = $transliteration !== null ? $transliteration : (string) get_option('alfawz_default_transliteration', 'en.transliteration');

        $translation_key     = $translation_edition ? sanitize_key(str_replace('.', '_', strtolower($translation_edition))) : 'none';
        $transliteration_key = $transliteration_edition ? sanitize_key(str_replace('.', '_', strtolower($transliteration_edition))) : 'none';

        $cache_key_suffix = sprintf('%s_%s', $translation_key, $transliteration_key);
        $transient_key     = sprintf('alfawz_surah_%d_verses_%s', $surah_id, $cache_key_suffix);
        $option_key        = $transient_key;

        $cached = get_transient($transient_key);
        if (is_array($cached) && !empty($cached)) {
            return $cached;
        }

        $stored = get_option($option_key);
        if (is_array($stored) && !empty($stored)) {
            set_transient($transient_key, $stored, WEEK_IN_SECONDS);
            return $stored;
        }

        $editions = [ 'quran-uthmani' ];
        if (!empty($translation_edition)) {
            $editions[] = $translation_edition;
        }
        if (!empty($transliteration_edition)) {
            $editions[] = $transliteration_edition;
        }

        $edition_path = implode(',', array_map(static function ($edition) {
            return rawurlencode($edition);
        }, $editions));

        $response = wp_remote_get(
            sprintf('%s/surah/%d/editions/%s', self::API_BASE, $surah_id, $edition_path),
            [
                'timeout' => 20,
                'headers' => $this->build_default_headers(),
            ]
        );

        if (is_wp_error($response)) {
            $error = $this->record_api_failure($response);
            $fallback = $this->get_local_surah_verses_from_dataset($surah_id);
            if ($fallback !== null) {
                $fallback = $this->decorate_basmallah_metadata($fallback);
                set_transient($transient_key, $fallback, WEEK_IN_SECONDS);
                update_option($option_key, $fallback, false);
                return $fallback;
            }

            return $error;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!$this->is_successful_api_response($data) || empty($data['data']) || !is_array($data['data'])) {
            $error = $this->record_api_failure(new \WP_Error('api_error', __('Invalid response received from the Quran API.', 'alfawzquran')));
            $fallback = $this->get_local_surah_verses_from_dataset($surah_id);
            if ($fallback !== null) {
                $fallback = $this->decorate_basmallah_metadata($fallback);
                set_transient($transient_key, $fallback, WEEK_IN_SECONDS);
                update_option($option_key, $fallback, false);
                return $fallback;
            }

            return $error;
        }

        $payload = $data['data'];
        if (isset($payload['data']) && is_array($payload['data'])) {
            $payload = $payload['data'];
        }

        $editions_data = $payload;

        $buckets    = [];
        $surah_meta = null;
        foreach ($editions_data as $edition_payload) {
            if (!is_array($edition_payload)) {
                continue;
            }

            $edition_meta = $edition_payload;
            if (isset($edition_payload['edition']) && is_array($edition_payload['edition'])) {
                $edition_meta = array_merge($edition_payload['edition'], $edition_meta);
            }

            $raw_identifier = $edition_meta['identifier'] ?? $edition_payload['identifier'] ?? '';
            $ayahs = $edition_payload['ayahs'] ?? [];

            if (empty($raw_identifier) || empty($ayahs) || !is_array($ayahs)) {
                continue;
            }

            $identifier = sanitize_key(str_replace('.', '_', strtolower($raw_identifier)));
            $buckets[ $identifier ] = $ayahs;

            if (!$surah_meta) {
                if (isset($edition_payload['surah']) && is_array($edition_payload['surah'])) {
                    $surah_meta = $edition_payload['surah'];
                } else {
                    $surah_meta = [
                        'englishName'           => $edition_payload['englishName'] ?? $edition_meta['englishName'] ?? '',
                        'englishNameTranslation' => $edition_payload['englishNameTranslation'] ?? $edition_meta['englishNameTranslation'] ?? '',
                        'name'                  => $edition_payload['name'] ?? $edition_meta['name'] ?? '',
                        'numberOfAyahs'         => isset($edition_payload['numberOfAyahs']) ? (int) $edition_payload['numberOfAyahs'] : ($edition_meta['numberOfAyahs'] ?? 0),
                        'revelationType'        => $edition_payload['revelationType'] ?? $edition_meta['revelationType'] ?? '',
                    ];
                }
            }
        }

        $primary_key   = sanitize_key('quran_uthmani');
        $arabic_ayahs  = $buckets[ $primary_key ] ?? reset($buckets);
        $translation_bucket = $translation_edition ? sanitize_key(str_replace('.', '_', strtolower($translation_edition))) : null;
        $translit_bucket    = $transliteration_edition ? sanitize_key(str_replace('.', '_', strtolower($transliteration_edition))) : null;

        if (empty($arabic_ayahs) || !is_array($arabic_ayahs)) {
            $error = $this->record_api_failure(new \WP_Error('api_error', __('Invalid response received from the Quran API.', 'alfawzquran')));
            $fallback = $this->get_local_surah_verses_from_dataset($surah_id);
            if ($fallback !== null) {
                set_transient($transient_key, $fallback, WEEK_IN_SECONDS);
                update_option($option_key, $fallback, false);
                return $fallback;
            }

            return $error;
        }

        $verse_count = count($arabic_ayahs);
        $verses      = [];

        foreach ($arabic_ayahs as $index => $ayah) {
            if (!is_array($ayah)) {
                continue;
            }

            $verse_number = isset($ayah['numberInSurah']) ? (int) $ayah['numberInSurah'] : ($index + 1);
            $surah_data   = isset($ayah['surah']) && is_array($ayah['surah']) ? $ayah['surah'] : [];

            $translation_text = '';
            if ($translation_bucket && isset($buckets[ $translation_bucket ][ $index ]['text'])) {
                $translation_text = wp_strip_all_tags((string) $buckets[ $translation_bucket ][ $index ]['text']);
            }

            $transliteration_text = '';
            if ($translit_bucket && isset($buckets[ $translit_bucket ][ $index ]['text'])) {
                $transliteration_text = wp_strip_all_tags((string) $buckets[ $translit_bucket ][ $index ]['text']);
            }

            $audio_secondary = [];
            if (!empty($ayah['audioSecondary']) && is_array($ayah['audioSecondary'])) {
                $audio_secondary = array_values(array_filter($ayah['audioSecondary'], 'is_string'));
            }

            $verses[] = [
                'surah_id'        => $surah_id,
                'verse_id'        => $verse_number,
                'verse_key'       => sprintf('%d:%d', $surah_id, $verse_number),
                'surah_name'      => $surah_data['englishName'] ?? ($surah_meta['englishName'] ?? ''),
                'surah_name_ar'   => $surah_data['name'] ?? ($surah_meta['name'] ?? ''),
                'total_verses'    => isset($surah_data['numberOfAyahs']) ? (int) $surah_data['numberOfAyahs'] : $verse_count,
                'juz'             => isset($ayah['juz']) ? (int) $ayah['juz'] : null,
                'arabic'          => isset($ayah['text']) ? (string) $ayah['text'] : '',
                'translation'     => $translation_text,
                'transliteration' => $transliteration_text,
                'audio'           => isset($ayah['audio']) ? (string) $ayah['audio'] : '',
                'audio_secondary' => $audio_secondary,
            ];
        }

        $verses = $this->decorate_basmallah_metadata($verses);

        set_transient($transient_key, $verses, WEEK_IN_SECONDS);
        update_option($option_key, $verses, false);
        $this->clear_api_failure_notice();

        return $verses;
    }

    /**
     * Retrieve the surah catalog from the bundled fallback dataset.
     *
     * @return array|null
     */
    private function get_local_surah_catalog_from_dataset() {
        $map = $this->load_fallback_surah_map();
        if (empty($map) || !is_array($map)) {
            return null;
        }

        $catalog = [];
        foreach ($map as $id => $surah) {
            if (!is_array($surah)) {
                continue;
            }

            $verses = isset($surah['verses']) && is_array($surah['verses']) ? $surah['verses'] : [];
            $catalog[] = [
                'number'                => (int) $id,
                'englishName'           => (string) ($surah['english_name'] ?? ''),
                'englishNameTranslation' => (string) ($surah['english_name'] ?? ''),
                'name'                  => (string) ($surah['arabic_name'] ?? ''),
                'numberOfAyahs'         => count($verses),
            ];
        }

        usort(
            $catalog,
            static function ($left, $right) {
                return ($left['number'] ?? 0) <=> ($right['number'] ?? 0);
            }
        );

        return $catalog;
    }

    /**
     * Retrieve surah verses from the bundled fallback dataset.
     *
     * @param int $surah_id
     *
     * @return array|null
     */
    private function get_local_surah_verses_from_dataset(int $surah_id) {
        $map = $this->load_fallback_surah_map();
        if (empty($map) || !isset($map[ $surah_id ])) {
            return null;
        }

        $surah = $map[ $surah_id ];
        if (!is_array($surah)) {
            return null;
        }

        $verses = isset($surah['verses']) && is_array($surah['verses']) ? $surah['verses'] : [];
        if (empty($verses)) {
            return null;
        }

        $total = count($verses);
        $normalised = [];

        foreach ($verses as $entry) {
            if (!is_array($entry)) {
                continue;
            }

            $verse_id = isset($entry['verse_id']) ? (int) $entry['verse_id'] : 0;
            if ($verse_id <= 0) {
                continue;
            }

            $juz_value = null;
            if (array_key_exists('juz', $entry) && $entry['juz'] !== '' && $entry['juz'] !== null) {
                $juz_value = (int) $entry['juz'];
                if ($juz_value <= 0) {
                    $juz_value = null;
                }
            }

            $normalised[] = [
                'surah_id'        => $surah_id,
                'verse_id'        => $verse_id,
                'verse_key'       => isset($entry['verse_key']) ? (string) $entry['verse_key'] : sprintf('%d:%d', $surah_id, $verse_id),
                'surah_name'      => isset($entry['surah_name']) ? (string) $entry['surah_name'] : (string) ($surah['english_name'] ?? ''),
                'surah_name_ar'   => isset($entry['surah_name_ar']) ? (string) $entry['surah_name_ar'] : (string) ($surah['arabic_name'] ?? ''),
                'total_verses'    => isset($entry['total_verses']) ? max(1, (int) $entry['total_verses']) : $total,
                'juz'             => $juz_value,
                'arabic'          => isset($entry['arabic']) ? (string) $entry['arabic'] : '',
                'translation'     => isset($entry['translation']) ? (string) $entry['translation'] : '',
                'transliteration' => isset($entry['transliteration']) ? (string) $entry['transliteration'] : '',
                'audio'           => '',
                'audio_secondary' => [],
            ];
        }

        $normalised = $this->decorate_basmallah_metadata($normalised);

        return $normalised ?: null;
    }

    /**
     * Add metadata to verses that contain the basmala so that front-end
     * consumers can display it independently of the first numbered ayah.
     *
     * @param array<int, array<string, mixed>> $verses
     *
     * @return array<int, array<string, mixed>>
     */
    private function decorate_basmallah_metadata(array $verses) {
        if (empty($verses)) {
            return $verses;
        }

        $bismillah_count = 0;

        foreach ($verses as $index => $verse) {
            if (!is_array($verse)) {
                continue;
            }

            $verse_id = isset($verse['verse_id']) ? (int) $verse['verse_id'] : 0;

            $verses[ $index ]['display_verse_number'] = $verse_id;
            $verses[ $index ]['display_verse_label']  = '';
            $verses[ $index ]['is_bismillah']          = $this->is_bismillah_entry($verse);

            if (!empty($verses[ $index ]['is_bismillah'])) {
                $verses[ $index ]['display_verse_number'] = 0;
                $verses[ $index ]['display_verse_label']  = __('Bismillah', 'alfawzquran');
                $bismillah_count++;
            }
        }

        if ($bismillah_count > 0) {
            foreach ($verses as $index => $verse) {
                if (!is_array($verse) || !empty($verse['is_bismillah'])) {
                    continue;
                }

                $original_id = isset($verse['verse_id']) ? (int) $verse['verse_id'] : 0;
                if ($original_id <= 0) {
                    continue;
                }

                $adjusted = $original_id - $bismillah_count;
                if ($adjusted > 0) {
                    $verses[ $index ]['display_verse_number'] = $adjusted;
                }
            }
        }

        return $verses;
    }

    /**
     * Determine whether the provided verse payload represents the basmala.
     *
     * @param array<string, mixed> $verse
     */
    private function is_bismillah_entry(array $verse) {
        $arabic_text = isset($verse['arabic']) ? (string) $verse['arabic'] : '';
        $translation = isset($verse['translation']) ? (string) $verse['translation'] : '';

        if ($arabic_text !== '') {
            $normalised = $this->normalise_basmallah_text($arabic_text);
            $variants   = [
                'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
                'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
            ];

            if (in_array($normalised, $variants, true)) {
                return true;
            }
        }

        if ($translation !== '') {
            $normalised_translation = strtolower($translation);
            if (false !== strpos($normalised_translation, 'in the name of') && false !== strpos($normalised_translation, 'merciful')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Normalise the Arabic text for basmala comparisons.
     */
    private function normalise_basmallah_text(string $value) {
        $value = preg_replace('/\x{FEFF}/u', '', $value);
        $value = preg_replace('/\s+/u', ' ', $value);

        return trim($value);
    }

    /**
     * Load the bundled fallback surah dataset into memory.
     *
     * @return array|null
     */
    private function load_fallback_surah_map() {
        static $map = null;

        if ($map !== null) {
            return $map ?: null;
        }

        $path = ALFAWZQURAN_PLUGIN_PATH . 'assets/data/quran-fallback.json';
        if (!file_exists($path) || !is_readable($path)) {
            $map = false;
            return null;
        }

        $contents = file_get_contents($path);
        if (false === $contents) {
            $map = false;
            return null;
        }

        $decoded = json_decode($contents, true);
        if (!is_array($decoded) || empty($decoded['surahs']) || !is_array($decoded['surahs'])) {
            $map = false;
            return null;
        }

        $map = [];
        foreach ($decoded['surahs'] as $surah) {
            if (!is_array($surah)) {
                continue;
            }

            $id = isset($surah['id']) ? (int) $surah['id'] : 0;
            if ($id <= 0) {
                continue;
            }

            $map[ $id ] = $surah;
        }

        if (empty($map)) {
            $map = false;
            return null;
        }

        return $map;
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

    /**
     * Build a common set of headers for HTTP requests to the Quran API.
     */
    private function build_default_headers() {
        return [
            'Accept'     => 'application/json',
            'User-Agent' => $this->build_user_agent(),
            'Referer'    => home_url(),
        ];
    }

    /**
     * Generate a descriptive user-agent for outbound requests.
     */
    private function build_user_agent() {
        $blog_name = get_bloginfo( 'name', 'display' );
        $site_url  = home_url();

        return sprintf( 'AlfawzQuran/%s (%s)', ALFAWZQURAN_VERSION ?? '1.0.0', $site_url ?: $blog_name ?: 'WordPress' );
    }

    /**
     * Determine whether a decoded API response should be considered successful.
     *
     * @param mixed $data
     * @return bool
     */
    private function is_successful_api_response( $data ) {
        if ( ! is_array( $data ) ) {
            return false;
        }

        if ( isset( $data['code'] ) && 200 === (int) $data['code'] ) {
            return true;
        }

        if ( isset( $data['status'] ) ) {
            $status = $data['status'];

            if ( true === $status || 200 === (int) $status ) {
                return true;
            }

            if ( is_string( $status ) ) {
                $normalized = strtolower( $status );
                if ( in_array( $normalized, [ 'ok', 'success', 'true' ], true ) ) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Build response headers for proxied audio requests.
     */
    private function build_audio_headers( $content_length = null ) {
        $headers = [
            'Content-Type'              => 'audio/mpeg',
            'Access-Control-Allow-Origin' => '*',
            'Cache-Control'             => 'public, max-age=' . DAY_IN_SECONDS,
        ];

        if ( null !== $content_length ) {
            $headers['Content-Length'] = (string) $content_length;
        }

        return $headers;
    }

    /**
     * Validate a reciter identifier received via the REST API.
     */
    public function validate_reciter_identifier( $value ) {
        return is_string( $value ) && (bool) preg_match( '/^[a-z0-9._-]+$/i', $value );
    }

    /**
     * Sanitize a reciter identifier while preserving allowed separators.
     */
    public function sanitize_reciter_identifier( $value ) {
        $value = strtolower( (string) $value );
        return preg_replace( '/[^a-z0-9._-]/', '', $value );
    }

    /**
     * Analyse a recitation transcript against the expected ayah and surface insights inspired by Tarteel.
     */
    public function analyze_recitation( WP_REST_Request $request ) {
        $verse_key  = trim( (string) $request->get_param( 'verse_key' ) );
        $transcript = trim( (string) $request->get_param( 'transcript' ) );
        $confidence = $request->get_param( 'confidence' );
        $duration   = $request->get_param( 'duration' );

        if ( '' === $verse_key ) {
            return new WP_Error( 'alfawz_invalid_verse_key', __( 'A verse key is required for analysis.', 'alfawzquran' ) );
        }

        if ( '' === $transcript ) {
            return new WP_Error( 'alfawz_empty_transcript', __( 'Please recite the verse so we can provide feedback.', 'alfawzquran' ) );
        }

        $parsed = $this->parse_verse_key( $verse_key );
        if ( is_wp_error( $parsed ) ) {
            return $parsed;
        }

        list( $surah_id, $verse_id ) = $parsed;

        $expected        = $this->fetch_expected_verse_bundle( $surah_id, $verse_id );
        $fallback_reason = null;

        if ( is_wp_error( $expected ) ) {
            $fallback_reason = $expected->get_error_message();
            $expected        = $this->build_fallback_expected_bundle( $transcript );
        } elseif ( ! $this->expected_bundle_has_content( $expected ) ) {
            $fallback_reason = __( 'The verse text was unavailable from the Quran API.', 'alfawzquran' );
            $expected        = $this->build_fallback_expected_bundle( $transcript );
        }

        $analysis = $this->build_recitation_analysis( $transcript, $expected );

        $payload = [
            'verse_key'  => $verse_key,
            'surah_id'   => $surah_id,
            'verse_id'   => $verse_id,
            'score'      => $analysis['score'],
            'transcript' => $analysis['transcript'],
            'mistakes'   => $analysis['mistakes'],
            'suggestions'=> $analysis['suggestions'],
            'snippets'   => $analysis['snippets'],
            'expected'   => $expected,
        ];

        if ( null !== $analysis['token_count'] ) {
            $payload['token_count'] = $analysis['token_count'];
        }

        if ( null !== $confidence && '' !== $confidence ) {
            $payload['confidence'] = max( 0, min( 1, (float) $confidence ) );
        }

        if ( null !== $duration && '' !== $duration ) {
            $payload['duration'] = max( 0, (float) $duration );
        }

        if ( isset( $expected['fallback'] ) && $expected['fallback'] ) {
            $notice = [
                'code'    => 'alfawz_recitation_expected_fallback',
                'message' => __( 'We could not fetch the reference verse. Feedback is based on your recitation alone.', 'alfawzquran' ),
            ];

            if ( $fallback_reason ) {
                $notice['details'] = $fallback_reason;
            }

            $payload['notices'] = [ $notice ];
        }

        if ( $this->recitation_feedback ) {
            $this->recitation_feedback->log_feedback( $request->get_user_id(), $payload );
        }

        return rest_ensure_response(
            [
                'result' => $payload,
            ]
        );
    }

    /**
     * Return the user recitation history if the repository is available.
     */
    public function get_recitation_history( WP_REST_Request $request ) {
        if ( ! $this->recitation_feedback ) {
            return rest_ensure_response( [ 'history' => [] ] );
        }

        $history = $this->recitation_feedback->get_history( $request->get_user_id() );

        return rest_ensure_response( [ 'history' => $history ] );
    }

    /**
     * Expose the snippet library so the front-end can surface focused cues.
     */
    public function get_recitation_snippets_endpoint() {
        return rest_ensure_response(
            [
                'snippets' => $this->get_recitation_snippet_library(),
            ]
        );
    }

    /**
     * Compare a transcript with the expected verse and compute alignment metrics.
     *
     * @param string $transcript User supplied transcript.
     * @param array  $expected   Expected verse bundle.
     * @return array
     */
    private function build_recitation_analysis( $transcript, array $expected ) {
        $clean_transcript = $this->normalize_transcript( $transcript );
        $spoken_words     = $this->tokenize_phrase( $clean_transcript );

        $expected_source = $expected['transliteration'] ?? '';
        if ( '' === $expected_source ) {
            $expected_source = $expected['translation'] ?? '';
        }
        if ( '' === $expected_source ) {
            $expected_source = $expected['arabic'] ?? '';
        }

        $expected_words = $this->tokenize_phrase( $this->normalize_transcript( $expected_source ) );

        $diff = $this->diff_word_sequences( $expected_words, $spoken_words );
        $matches = max( 0, (int) ( $diff['matches'] ?? 0 ) );
        $expected_count = max( count( $expected_words ), 1 );

        $score = round( max( 0, min( 100, ( $matches / $expected_count ) * 100 ) ), 2 );

        return [
            'score'       => $score,
            'transcript'  => $clean_transcript,
            'mistakes'    => $diff['mistakes'],
            'suggestions' => $this->generate_recitation_suggestions( $diff['mistakes'], $expected ),
            'snippets'    => $this->prepare_snippets_from_mistakes( $diff['mistakes'] ),
            'token_count' => count( $spoken_words ),
        ];
    }

    /**
     * Normalise text for comparison.
     */
    private function normalize_transcript( $text ) {
        $text = strtolower( (string) $text );
        $text = preg_replace( '/[\p{Mn}\p{Sk}]+/u', '', $text );
        $text = preg_replace( '/[^\p{L}\p{N}\s\'\-]+/u', ' ', $text );
        $text = preg_replace( '/\s+/u', ' ', trim( $text ) );

        return $text;
    }

    /**
     * Tokenise text into an ordered sequence of words.
     */
    private function tokenize_phrase( $text ) {
        if ( '' === trim( (string) $text ) ) {
            return [];
        }

        $tokens = preg_split( '/\s+/u', trim( (string) $text ) );
        $tokens = array_map( 'trim', array_filter( (array) $tokens ) );

        return array_values( $tokens );
    }

    /**
     * Produce a lightweight diff between the expected and spoken word sequences.
     */
    private function diff_word_sequences( array $expected, array $spoken ) {
        $mistakes = [];
        $matches  = 0;
        $i        = 0;
        $j        = 0;
        $expected_count = count( $expected );
        $spoken_count   = count( $spoken );

        while ( $i < $expected_count && $j < $spoken_count ) {
            $expected_word = $expected[ $i ];
            $spoken_word   = $spoken[ $j ];

            if ( $expected_word === $spoken_word ) {
                $matches++;
                $i++;
                $j++;
                continue;
            }

            $remaining_spoken   = array_slice( $spoken, $j + 1 );
            $remaining_expected = array_slice( $expected, $i + 1 );

            if ( in_array( $expected_word, $remaining_spoken, true ) ) {
                $mistakes[] = [
                    'type'     => 'skipped_word',
                    'expected' => $expected_word,
                    'spoken'   => $spoken_word,
                    'position' => $i + 1,
                ];
                $i++;
                continue;
            }

            if ( ! empty( $spoken_word ) && ! in_array( $spoken_word, $remaining_expected, true ) ) {
                $mistakes[] = [
                    'type'     => 'extra_word',
                    'expected' => $expected_word,
                    'spoken'   => $spoken_word,
                    'position' => $i + 1,
                ];
                $j++;
                continue;
            }

            $mistakes[] = [
                'type'     => 'mismatch',
                'expected' => $expected_word,
                'spoken'   => $spoken_word,
                'position' => $i + 1,
            ];
            $i++;
            $j++;
        }

        while ( $i < $expected_count ) {
            $mistakes[] = [
                'type'     => 'skipped_word',
                'expected' => $expected[ $i ],
                'spoken'   => '',
                'position' => $i + 1,
            ];
            $i++;
        }

        while ( $j < $spoken_count ) {
            $mistakes[] = [
                'type'     => 'extra_word',
                'expected' => '',
                'spoken'   => $spoken[ $j ],
                'position' => $expected_count + ( $j + 1 ),
            ];
            $j++;
        }

        return [
            'matches'  => $matches,
            'mistakes' => $mistakes,
        ];
    }

    /**
     * Generate encouraging guidance based on the detected mistakes.
     */
    private function generate_recitation_suggestions( array $mistakes, array $expected ) {
        if ( empty( $mistakes ) ) {
            return [
                __( 'Impeccable flow! Sustain this cadence to cement the ayah in your heart.', 'alfawzquran' ),
            ];
        }

        $suggestions = [];
        foreach ( $mistakes as $mistake ) {
            switch ( $mistake['type'] ) {
                case 'skipped_word':
                    $suggestions[] = sprintf(
                        /* translators: %s: missed word */
                        __( 'Revisit the phrase "%s" and trace it slowly with your finger to avoid skipping it next time.', 'alfawzquran' ),
                        $mistake['expected']
                    );
                    break;
                case 'extra_word':
                    $suggestions[] = __( 'Balance your breathing between phrases so additional words do not slip into the recitation.', 'alfawzquran' );
                    break;
                default:
                    $suggestions[] = __( 'Focus on your makharij and elongations to keep each syllable distinct.', 'alfawzquran' );
                    break;
            }
        }

        return array_values( array_unique( $suggestions ) );
    }

    /**
     * Select snippets aligned with the detected improvement areas.
     */
    private function prepare_snippets_from_mistakes( array $mistakes ) {
        $library = $this->get_recitation_snippet_library();
        $pool    = [];

        if ( empty( $mistakes ) && isset( $library['success'] ) ) {
            $pool = $library['success'];
        } else {
            foreach ( $mistakes as $mistake ) {
                $type = $mistake['type'] ?? 'mismatch';
                if ( isset( $library[ $type ] ) ) {
                    $pool = array_merge( $pool, (array) $library[ $type ] );
                }
            }
        }

        $unique = [];
        $seen   = [];

        foreach ( $pool as $snippet ) {
            if ( ! is_array( $snippet ) ) {
                continue;
            }
            $key = isset( $snippet['id'] ) ? $snippet['id'] : md5( wp_json_encode( $snippet ) );
            if ( isset( $seen[ $key ] ) ) {
                continue;
            }
            $seen[ $key ] = true;
            $unique[]     = $snippet;
        }

        return $unique;
    }

    /**
     * Retrieve (and cache) the snippet library.
     */
    private function get_recitation_snippet_library() {
        if ( null !== $this->recitation_snippet_cache ) {
            return $this->recitation_snippet_cache;
        }

        $defaults = [
            'mismatch'     => [
                [
                    'id'    => 'tajweed-vowel-balance',
                    'title' => __( 'Tune your vowels', 'alfawzquran' ),
                    'body'  => __( 'Lengthen your madd letters for two slow beats and anchor your tongue placement on qalqalah sounds.', 'alfawzquran' ),
                ],
            ],
            'skipped_word' => [
                [
                    'id'    => 'trace-phrase-loop',
                    'title' => __( 'Trace the skipped phrase', 'alfawzquran' ),
                    'body'  => __( 'Whisper the missed word three times, then blend it back into the full ayah to rebuild the neural loop.', 'alfawzquran' ),
                ],
            ],
            'extra_word'   => [
                [
                    'id'    => 'breath-harmony',
                    'title' => __( 'Reset your breathing cadence', 'alfawzquran' ),
                    'body'  => __( 'Inhale through the nose for four counts before reciting, letting excess filler words fall away.', 'alfawzquran' ),
                ],
            ],
            'success'      => [
                [
                    'id'    => 'flow-celebration',
                    'title' => __( 'Flow secured', 'alfawzquran' ),
                    'body'  => __( 'Lock in this confident recitation by revisiting it at dawn and after maghrib for spaced reinforcement.', 'alfawzquran' ),
                ],
            ],
        ];

        $this->recitation_snippet_cache = apply_filters( 'alfawz_recitation_snippets_library', $defaults );

        return $this->recitation_snippet_cache;
    }

    /**
     * Determine whether the fetched verse bundle contains usable content.
     */
    private function expected_bundle_has_content( array $bundle ) {
        $fields = [ 'arabic', 'transliteration', 'translation' ];

        foreach ( $fields as $field ) {
            if ( ! empty( $bundle[ $field ] ) && is_string( $bundle[ $field ] ) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Build a minimal expected verse bundle when the Quran API is unreachable.
     */
    private function build_fallback_expected_bundle( $transcript ) {
        return [
            'arabic'          => '',
            'transliteration' => $this->normalize_transcript( $transcript ),
            'translation'     => '',
            'fallback'        => true,
        ];
    }

    /**
     * Parse a verse key such as "2:255" into numeric identifiers.
     */
    private function parse_verse_key( $verse_key ) {
        $parts = preg_split( '/[:\\-]/', (string) $verse_key );
        if ( count( $parts ) < 2 ) {
            return new WP_Error( 'alfawz_invalid_verse_key', __( 'Verse keys should follow the surah:ayah format.', 'alfawzquran' ) );
        }

        $surah_id = absint( $parts[0] );
        $verse_id = absint( $parts[1] );

        if ( $surah_id <= 0 || $verse_id <= 0 ) {
            return new WP_Error( 'alfawz_invalid_verse_key', __( 'A valid surah and ayah number are required.', 'alfawzquran' ) );
        }

        return [ $surah_id, $verse_id ];
    }

    /**
     * Retrieve the verse text bundle from the Quran API client.
     */
    private function fetch_expected_verse_bundle( $surah_id, $verse_id ) {
        if ( ! $this->quran_api ) {
            return new WP_Error( 'alfawz_missing_api', __( 'Recitation insights require the Quran API service to be available.', 'alfawzquran' ) );
        }

        $arabic_data = $this->quran_api->get_ayah( $surah_id, $verse_id, 'quran-uthmani' );
        if ( is_wp_error( $arabic_data ) ) {
            return $arabic_data;
        }

        $transliteration_edition = get_option( 'alfawz_default_transliteration', 'en.transliteration' );
        $translation_edition     = get_option( 'alfawz_default_translation', 'en.sahih' );

        $transliteration_data = $this->quran_api->get_ayah( $surah_id, $verse_id, $transliteration_edition );
        $translation_data     = $this->quran_api->get_ayah( $surah_id, $verse_id, $translation_edition );

        if ( is_wp_error( $transliteration_data ) ) {
            $transliteration_data = [];
        }

        if ( is_wp_error( $translation_data ) ) {
            $translation_data = [];
        }

        return [
            'arabic'         => $this->extract_ayah_text( $arabic_data ),
            'transliteration'=> $this->extract_ayah_text( $transliteration_data ),
            'translation'    => $this->extract_ayah_text( $translation_data ),
        ];
    }

    /**
     * Extract the text component from a Quran API ayah response.
     */
    private function extract_ayah_text( $payload ) {
        if ( empty( $payload ) || ! is_array( $payload ) ) {
            return '';
        }

        if ( isset( $payload['text'] ) ) {
            return trim( wp_strip_all_tags( $payload['text'] ) );
        }

        if ( isset( $payload['ayah'] ) && is_array( $payload['ayah'] ) && isset( $payload['ayah']['text'] ) ) {
            return trim( wp_strip_all_tags( $payload['ayah']['text'] ) );
        }

        if ( isset( $payload['data'] ) && is_array( $payload['data'] ) ) {
            return $this->extract_ayah_text( $payload['data'] );
        }

        return '';
    }
}

<?php
namespace AlfawzQuran\Models;

/**
 * Handles all database interactions for user progress, bookmarks, and memorization plans.
 */
class UserProgress {
    private $wpdb;
    private $table_progress;
    private $table_bookmarks;
    private $table_plans;
    private $table_plan_progress;

    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_progress = $wpdb->prefix . 'alfawz_quran_progress';
        $this->table_bookmarks = $wpdb->prefix . 'alfawz_quran_bookmarks';
        $this->table_plans = $wpdb->prefix . 'alfawz_quran_memorization_plans';
        $this->table_plan_progress = $wpdb->prefix . 'alfawz_quran_plan_progress';
    }

    /**
     * Add or update user progress for a verse.
     *
     * @param int $user_id
     * @param int $surah_id
     * @param int $verse_id
     * @param string $progress_type 'read' or 'memorized'
     * @param int $hasanat
     * @param int $repetition_count
     * @return bool
     */
    public function add_progress( $user_id, $surah_id, $verse_id, $progress_type, $hasanat = 0, $repetition_count = 0 ) {
        $hasanat = max( 0, (int) $hasanat );
        $repetition_count = max( 0, (int) $repetition_count );

        $today = gmdate( 'Y-m-d' );
        $existing_progress = $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->table_progress} WHERE user_id = %d AND surah_id = %d AND verse_id = %d AND progress_type = %s AND DATE(timestamp) = %s",
                $user_id,
                $surah_id,
                $verse_id,
                $progress_type,
                $today
            )
        );

        if ( $existing_progress ) {
            $existing_hasanat   = (int) $existing_progress->hasanat;
            $new_hasanat        = max( $existing_hasanat, $hasanat );
            $awarded_difference = max( 0, $new_hasanat - $existing_hasanat );
            $new_repetitions    = max( (int) $existing_progress->repetition_count, $repetition_count );

            $updated = $this->wpdb->update(
                $this->table_progress,
                [
                    'hasanat'          => $new_hasanat,
                    'repetition_count' => $new_repetitions,
                    'timestamp'        => current_time( 'mysql', true ),
                ],
                [ 'id' => $existing_progress->id ],
                [ '%d', '%d', '%s' ],
                [ '%d' ]
            );

            return [
                'success'          => $updated !== false,
                'hasanat_awarded'  => $updated !== false ? $awarded_difference : 0,
                'already_recorded' => $updated !== false ? $awarded_difference === 0 && $existing_hasanat > 0 : false,
                'progress_id'      => (int) $existing_progress->id,
            ];
        }

        $inserted = $this->wpdb->insert(
            $this->table_progress,
            [
                'user_id'          => $user_id,
                'surah_id'         => $surah_id,
                'verse_id'         => $verse_id,
                'progress_type'    => $progress_type,
                'hasanat'          => $hasanat,
                'repetition_count' => $repetition_count,
                'timestamp'        => current_time( 'mysql', true ),
            ],
            [ '%d', '%d', '%d', '%s', '%d', '%d', '%s' ]
        );

        return [
            'success'          => $inserted !== false,
            'hasanat_awarded'  => $inserted !== false ? $hasanat : 0,
            'already_recorded' => false,
            'progress_id'      => $inserted ? (int) $this->wpdb->insert_id : 0,
        ];
    }

    /**
     * Get comprehensive statistics for a specific user.
     *
     * @param int $user_id
     * @return array
     */
    public function get_user_stats( $user_id ) {
        $meta_total    = get_user_meta( $user_id, 'total_hasanat', true );
        $total_hasanat = is_numeric( $meta_total ) ? (int) $meta_total : $this->wpdb->get_var(
            $this->wpdb->prepare( "SELECT SUM(hasanat) FROM {$this->table_progress} WHERE user_id = %d", $user_id )
        );

        $verses_read = $this->wpdb->get_var(
            $this->wpdb->prepare( "SELECT COUNT(DISTINCT CONCAT(surah_id, '-', verse_id)) FROM {$this->table_progress} WHERE user_id = %d AND progress_type = 'read'", $user_id )
        );

        $verses_memorized = $this->wpdb->get_var(
            $this->wpdb->prepare( "SELECT COUNT(DISTINCT CONCAT(surah_id, '-', verse_id)) FROM {$this->table_progress} WHERE user_id = %d AND progress_type = 'memorized'", $user_id )
        );

        // Get streak data from user meta
        $current_streak = get_user_meta( $user_id, 'alfawz_quran_current_streak', true );
        $longest_streak = get_user_meta( $user_id, 'alfawz_quran_longest_streak', true );

        return [
            'total_hasanat'      => intval( $total_hasanat ),
            'verses_read'        => intval( $verses_read ),
            'verses_memorized'   => intval( $verses_memorized ),
            'current_streak'     => intval( $current_streak ),
            'longest_streak'     => intval( $longest_streak ),
        ];
    }

    /**
     * Summarise the user's progress within a given UTC date range.
     */
    public function get_daily_progress_summary( $user_id, $start_gmt, $end_gmt ) {
        if ( empty( $user_id ) || empty( $start_gmt ) || empty( $end_gmt ) ) {
            return [
                'verses_read'               => 0,
                'verses_memorized'          => 0,
                'memorization_repetitions'  => 0,
                'hasanat'                   => 0,
            ];
        }

        $start = gmdate( 'Y-m-d H:i:s', strtotime( $start_gmt ) );
        $end   = gmdate( 'Y-m-d H:i:s', strtotime( $end_gmt ) );

        $verses_read = (int) $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT COUNT(DISTINCT CONCAT(surah_id, '-', verse_id)) FROM {$this->table_progress} WHERE user_id = %d AND progress_type = 'read' AND timestamp >= %s AND timestamp < %s",
                $user_id,
                $start,
                $end
            )
        );

        $verses_memorized = (int) $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT COUNT(DISTINCT CONCAT(surah_id, '-', verse_id)) FROM {$this->table_progress} WHERE user_id = %d AND progress_type = 'memorized' AND timestamp >= %s AND timestamp < %s",
                $user_id,
                $start,
                $end
            )
        );

        $memorization_repetitions = (int) $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT SUM(repetition_count) FROM {$this->table_progress} WHERE user_id = %d AND progress_type = 'memorized' AND timestamp >= %s AND timestamp < %s",
                $user_id,
                $start,
                $end
            )
        );

        $hasanat = (int) $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT SUM(hasanat) FROM {$this->table_progress} WHERE user_id = %d AND timestamp >= %s AND timestamp < %s",
                $user_id,
                $start,
                $end
            )
        );

        return [
            'verses_read'              => $verses_read,
            'verses_memorized'         => $verses_memorized,
            'memorization_repetitions' => $memorization_repetitions,
            'hasanat'                  => $hasanat,
        ];
    }

    /**
     * Aggregate daily activity counts for the requested window.
     *
     * @param int $user_id User identifier.
     * @param int $days    Number of days to include.
     *
     * @return array[]
     */
    public function get_recent_daily_activity( $user_id, $days = 14 ) {
        $user_id = (int) $user_id;
        if ( $user_id <= 0 ) {
            return [];
        }

        $days = (int) $days;
        if ( $days < 1 ) {
            $days = 1;
        } elseif ( $days > 90 ) {
            $days = 90;
        }

        $start = gmdate( 'Y-m-d H:i:s', strtotime( sprintf( '-%d days', $days ) ) );

        $query = $this->wpdb->prepare(
            "SELECT DATE(timestamp) AS activity_date,
                    SUM(CASE WHEN progress_type = 'read' THEN 1 ELSE 0 END) AS verses_read,
                    SUM(CASE WHEN progress_type = 'memorized' THEN 1 ELSE 0 END) AS verses_memorized,
                    SUM(hasanat) AS hasanat
             FROM {$this->table_progress}
             WHERE user_id = %d AND timestamp >= %s
             GROUP BY activity_date
             ORDER BY activity_date ASC",
            $user_id,
            $start
        );

        $rows = $this->wpdb->get_results( $query, ARRAY_A );

        if ( empty( $rows ) ) {
            return [];
        }

        return array_map(
            static function ( $row ) {
                return [
                    'date'             => $row['activity_date'],
                    'verses_read'      => isset( $row['verses_read'] ) ? (int) $row['verses_read'] : 0,
                    'verses_memorized' => isset( $row['verses_memorized'] ) ? (int) $row['verses_memorized'] : 0,
                    'hasanat'          => isset( $row['hasanat'] ) ? (int) $row['hasanat'] : 0,
                ];
            },
            $rows
        );
    }

    /**
     * Get overall statistics for admin dashboard.
     *
     * @return array
     */
    public function get_overall_stats() {
        $total_users = count_users()['total_users'];
        $total_hasanat = $this->wpdb->get_var( "SELECT SUM(hasanat) FROM {$this->table_progress}" );
        $verses_read = $this->wpdb->get_var( "SELECT COUNT(DISTINCT CONCAT(surah_id, '-', verse_id, '-', user_id)) FROM {$this->table_progress} WHERE progress_type = 'read'" );
        $verses_memorized = $this->wpdb->get_var( "SELECT COUNT(DISTINCT CONCAT(surah_id, '-', verse_id, '-', user_id)) FROM {$this->table_progress} WHERE progress_type = 'memorized'" );

        return [
            'total_users'        => intval( $total_users ),
            'total_hasanat'      => intval( $total_hasanat ),
            'verses_read'        => intval( $verses_read ),
            'verses_memorized'   => intval( $verses_memorized ),
        ];
    }

    /**
     * Get leaderboard data based on total hasanat.
     *
     * @param string $period 'daily', 'weekly', 'monthly', 'all_time'
     * @param int $limit
     * @return array
     */
    public function get_leaderboard( $period = 'all_time', $limit = 10 ) {
        $date_clause = '';
        $today = gmdate( 'Y-m-d H:i:s' );

        switch ( $period ) {
            case 'daily':
                $date_clause = $this->wpdb->prepare( "AND DATE(timestamp) = CURDATE()", $today );
                break;
            case 'weekly':
                $date_clause = $this->wpdb->prepare( "AND timestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)", $today );
                break;
            case 'monthly':
                $date_clause = $this->wpdb->prepare( "AND timestamp >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)", $today );
                break;
            case 'all_time':
            default:
                $date_clause = '';
                break;
        }

        $results = $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT
                    p.user_id,
                    SUM(p.hasanat) AS total_hasanat,
                    COUNT(DISTINCT CASE WHEN p.progress_type = 'read' THEN CONCAT(p.surah_id, '-', p.verse_id) END) AS verses_read,
                    COUNT(DISTINCT CASE WHEN p.progress_type = 'memorized' THEN CONCAT(p.surah_id, '-', p.verse_id) END) AS verses_memorized
                FROM {$this->table_progress} p
                WHERE 1=1 {$date_clause}
                GROUP BY p.user_id
                ORDER BY total_hasanat DESC
                LIMIT %d",
                $limit
            ),
            ARRAY_A
        );

        foreach ( $results as &$row ) {
            $user_info = get_userdata( $row['user_id'] );
            $row['display_name'] = $user_info ? $user_info->display_name : 'Unknown User';
            $row['current_streak'] = get_user_meta( $row['user_id'], 'alfawz_quran_current_streak', true ) ?: 0;
        }

        return $results;
    }

    /**
     * Add a bookmark for a user.
     *
     * @param int $user_id
     * @param int $surah_id
     * @param int $verse_id
     * @param string $note
     * @return bool
     */
    public function add_bookmark( $user_id, $surah_id, $verse_id, $note = '' ) {
        // Prevent duplicate bookmarks for the same user, surah, and verse
        $existing_bookmark = $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT id FROM {$this->table_bookmarks} WHERE user_id = %d AND surah_id = %d AND verse_id = %d",
                $user_id,
                $surah_id,
                $verse_id
            )
        );

        if ( $existing_bookmark ) {
            return false; // Bookmark already exists
        }

        $inserted = $this->wpdb->insert(
            $this->table_bookmarks,
            [
                'user_id'  => $user_id,
                'surah_id' => $surah_id,
                'verse_id' => $verse_id,
                'note'     => sanitize_textarea_field( $note ),
                'timestamp' => current_time( 'mysql', true ),
            ],
            [ '%d', '%d', '%d', '%s', '%s' ]
        );
        return $inserted !== false;
    }

    /**
     * Get all bookmarks for a user.
     *
     * @param int $user_id
     * @return array
     */
    public function get_bookmarks( $user_id ) {
        $bookmarks = $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->table_bookmarks} WHERE user_id = %d ORDER BY timestamp DESC",
                $user_id
            ),
            ARRAY_A
        );
        return $bookmarks;
    }

    /**
     * Delete a specific bookmark for a user.
     *
     * @param int $user_id
     * @param int $bookmark_id
     * @return bool
     */
    public function delete_bookmark( $user_id, $bookmark_id ) {
        $deleted = $this->wpdb->delete(
            $this->table_bookmarks,
            [
                'id'      => $bookmark_id,
                'user_id' => $user_id,
            ],
            [ '%d', '%d' ]
        );
        return $deleted !== false;
    }

    /**
     * Create a new memorization plan.
     *
     * @param int $user_id
     * @param string $plan_name
     * @param int $surah_id
     * @param int $start_verse
     * @param int $end_verse
     * @param int $daily_goal
     * @return int|false Insert ID on success, false on failure.
     */
    public function create_memorization_plan( $user_id, $plan_name, $surah_id, $start_verse, $end_verse, $daily_goal = 0 ) {
        $inserted = $this->wpdb->insert(
            $this->table_plans,
            [
                'user_id'     => $user_id,
                'plan_name'   => $plan_name,
                'surah_id'    => $surah_id,
                'start_verse' => $start_verse,
                'end_verse'   => $end_verse,
                'daily_goal'  => $daily_goal,
                'status'      => 'active',
                'created_at'  => current_time( 'mysql', true ),
            ],
            [ '%d', '%s', '%d', '%d', '%d', '%d', '%s', '%s' ]
        );

        if ( $inserted ) {
            return $this->wpdb->insert_id;
        }
        return false;
    }

    /**
     * Get all memorization plans for a user.
     *
     * @param int $user_id
     * @return array
     */
    public function get_memorization_plans( $user_id ) {
        $plans = $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->table_plans} WHERE user_id = %d ORDER BY created_at DESC",
                $user_id
            ),
            ARRAY_A
        );

        foreach ($plans as &$plan) {
            $plan['total_verses'] = $plan['end_verse'] - $plan['start_verse'] + 1;
            $plan['completed_verses'] = $this->wpdb->get_var(
                $this->wpdb->prepare(
                    "SELECT COUNT(*) FROM {$this->table_plan_progress} WHERE plan_id = %d AND user_id = %d AND is_completed = 1",
                    $plan['id'],
                    $user_id
                )
            );
            $plan['completion_percentage'] = $plan['total_verses'] > 0 ? round(($plan['completed_verses'] / $plan['total_verses']) * 100) : 0;
            if ($plan['completion_percentage'] == 100) {
                $plan['status'] = 'completed';
                // Optionally update plan status in DB if not already
                $this->wpdb->update(
                    $this->table_plans,
                    ['status' => 'completed'],
                    ['id' => $plan['id']],
                    ['%s'],
                    ['%d']
                );
            } else {
                $plan['status'] = 'active'; // Ensure status is active if not completed
                $this->wpdb->update(
                    $this->table_plans,
                    ['status' => 'active'],
                    ['id' => $plan['id']],
                    ['%s'],
                    ['%d']
                );
            }
        }

        return $plans;
    }

    /**
     * Get a single memorization plan with its progress details.
     *
     * @param int $user_id
     * @param int $plan_id
     * @return array|null
     */
    public function get_single_memorization_plan( $user_id, $plan_id ) {
        $plan = $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->table_plans} WHERE id = %d AND user_id = %d",
                $plan_id,
                $user_id
            ),
            ARRAY_A
        );

        if ( $plan ) {
            $plan['total_verses'] = $plan['end_verse'] - $plan['start_verse'] + 1;
            $plan['progress'] = $this->wpdb->get_results(
                $this->wpdb->prepare(
                    "SELECT verse_id, is_completed, completed_at FROM {$this->table_plan_progress} WHERE plan_id = %d AND user_id = %d",
                    $plan_id,
                    $user_id
                ),
                ARRAY_A
            );
            $plan['completed_verses'] = count( array_filter( $plan['progress'], function( $p ) { return $p['is_completed'] == 1; } ) );
            $plan['completion_percentage'] = $plan['total_verses'] > 0 ? round(($plan['completed_verses'] / $plan['total_verses']) * 100) : 0;
            if ($plan['completion_percentage'] == 100) {
                $plan['status'] = 'completed';
                $this->wpdb->update(
                    $this->table_plans,
                    ['status' => 'completed'],
                    ['id' => $plan['id']],
                    ['%s'],
                    ['%d']
                );
            } else {
                $plan['status'] = 'active';
                $this->wpdb->update(
                    $this->table_plans,
                    ['status' => 'active'],
                    ['id' => $plan['id']],
                    ['%s'],
                    ['%d']
                );
            }
        }
        return $plan;
    }

    /**
     * Delete a memorization plan and its associated progress.
     *
     * @param int $user_id
     * @param int $plan_id
     * @return bool
     */
    public function delete_memorization_plan( $user_id, $plan_id ) {
        $this->wpdb->query( 'START TRANSACTION' );

        $deleted_plan = $this->wpdb->delete(
            $this->table_plans,
            [
                'id'      => $plan_id,
                'user_id' => $user_id,
            ],
            [ '%d', '%d' ]
        );

        if ( $deleted_plan === false ) {
            $this->wpdb->query( 'ROLLBACK' );
            return false;
        }

        $deleted_progress = $this->wpdb->delete(
            $this->table_plan_progress,
            [
                'plan_id' => $plan_id,
                'user_id' => $user_id,
            ],
            [ '%d', '%d' ]
        );

        if ( $deleted_progress === false ) {
            $this->wpdb->query( 'ROLLBACK' );
            return false;
        }

        $this->wpdb->query( 'COMMIT' );
        return true;
    }

    /**
     * Update progress for a specific verse within a memorization plan.
     *
     * @param int $user_id
     * @param int $plan_id
     * @param int $verse_id
     * @param string $action 'mark' or 'unmark'
     * @return bool
     */
    public function update_memorization_plan_progress( $user_id, $plan_id, $verse_id, $action ) {
        $plan = $this->get_single_memorization_plan( $user_id, $plan_id );
        if ( ! $plan ) {
            return false; // Plan not found or doesn't belong to user
        }

        // Check if verse is within the plan's range
        if ( $verse_id < $plan['start_verse'] || $verse_id > $plan['end_verse'] ) {
            return false; // Verse not part of this plan
        }

        $is_completed = ( $action === 'mark' ) ? 1 : 0;
        $completed_at = ( $action === 'mark' ) ? current_time( 'mysql', true ) : null;

        $existing_entry = $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT id FROM {$this->table_plan_progress} WHERE plan_id = %d AND user_id = %d AND surah_id = %d AND verse_id = %d",
                $plan_id,
                $user_id,
                $plan['surah_id'],
                $verse_id
            )
        );

        if ( $existing_entry ) {
            $updated = $this->wpdb->update(
                $this->table_plan_progress,
                [
                    'is_completed' => $is_completed,
                    'completed_at' => $completed_at,
                ],
                [ 'id' => $existing_entry->id ],
                [ '%d', '%s' ],
                [ '%d' ]
            );
            return $updated !== false;
        } else {
            $inserted = $this->wpdb->insert(
                $this->table_plan_progress,
                [
                    'plan_id'      => $plan_id,
                    'user_id'      => $user_id,
                    'surah_id'     => $plan['surah_id'],
                    'verse_id'     => $verse_id,
                    'is_completed' => $is_completed,
                    'completed_at' => $completed_at,
                ],
                [ '%d', '%d', '%d', '%d', '%d', '%s' ]
            );
            return $inserted !== false;
        }
    }

    /**
     * Restart a memorization plan by resetting its progress.
     *
     * @param int $user_id
     * @param int $plan_id
     * @return bool
     */
    public function restart_memorization_plan( $user_id, $plan_id ) {
        $plan = $this->get_single_memorization_plan( $user_id, $plan_id );
        if ( ! $plan ) {
            return false; // Plan not found or doesn't belong to user
        }

        $this->wpdb->query( 'START TRANSACTION' );

        // Delete existing progress entries for this plan
        $deleted_progress = $this->wpdb->delete(
            $this->table_plan_progress,
            [
                'plan_id' => $plan_id,
                'user_id' => $user_id,
            ],
            [ '%d', '%d' ]
        );

        if ( $deleted_progress === false ) {
            $this->wpdb->query( 'ROLLBACK' );
            return false;
        }

        // Update plan status to active
        $updated_plan_status = $this->wpdb->update(
            $this->table_plans,
            ['status' => 'active'],
            ['id' => $plan_id, 'user_id' => $user_id],
            ['%s'],
            ['%d', '%d']
        );

        if ( $updated_plan_status === false ) {
            $this->wpdb->query( 'ROLLBACK' );
            return false;
        }

        $this->wpdb->query( 'COMMIT' );
        return true;
    }

    /**
     * Update daily streaks for all users.
     * This should be called daily via a cron job.
     */
    public function update_all_user_streaks() {
        $users = get_users( [ 'fields' => 'ID' ] );
        $today = gmdate( 'Y-m-d' );
        $yesterday = gmdate( 'Y-m-d', strtotime( '-1 day' ) );

        foreach ( $users as $user_id ) {
            $current_streak = (int) get_user_meta( $user_id, 'alfawz_quran_current_streak', true );
            $longest_streak = (int) get_user_meta( $user_id, 'alfawz_quran_longest_streak', true );
            $last_activity_date = get_user_meta( $user_id, 'alfawz_quran_last_activity_date', true );

            // Check if user had any activity today
            $has_activity_today = $this->wpdb->get_var(
                $this->wpdb->prepare(
                    "SELECT COUNT(*) FROM {$this->table_progress} WHERE user_id = %d AND DATE(timestamp) = %s",
                    $user_id,
                    $today
                )
            );

            if ( $has_activity_today > 0 ) {
                // User was active today
                if ( $last_activity_date === $yesterday ) {
                    // Continued streak from yesterday
                    $current_streak++;
                } elseif ( $last_activity_date !== $today ) {
                    // New activity after a break or first activity
                    $current_streak = 1;
                }
                update_user_meta( $user_id, 'alfawz_quran_last_activity_date', $today );
            } else {
                // User was not active today
                if ( $last_activity_date === $yesterday ) {
                    // Streak broken
                    $current_streak = 0;
                }
                // If last_activity_date is older than yesterday, streak is already 0
            }

            update_user_meta( $user_id, 'alfawz_quran_current_streak', $current_streak );
            if ( $current_streak > $longest_streak ) {
                update_user_meta( $user_id, 'alfawz_quran_longest_streak', $current_streak );
            }
        }
    }
}

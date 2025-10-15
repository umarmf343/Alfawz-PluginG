<div class="alfawz-dashboard">
    <div class="alfawz-dashboard-header">
        <div class="alfawz-header-content">
            <h2><?php _e('Welcome Back!', 'alfawzquran'); ?></h2>
            <p><?php _e('Your daily dose of Quranic inspiration and progress.', 'alfawzquran'); ?></p>
        </div>
    </div>

    <div class="alfawz-stats-overview alfawz-progress-grid">
        <div class="alfawz-progress-card">
            <div class="alfawz-card-icon">
                <div class="alfawz-icon-circle alfawz-hasanat-icon"><span class="alfawz-icon" aria-hidden="true">⭐</span></div>
            </div>
            <div class="alfawz-card-content">
                <div class="alfawz-card-value" id="profile-total-hasanat">0</div>
                <div class="alfawz-card-label"><?php _e('Total Hasanat', 'alfawzquran'); ?></div>
            </div>
            <div class="alfawz-card-decoration" aria-hidden="true"></div>
        </div>
        <div class="alfawz-progress-card">
            <div class="alfawz-card-icon">
                <div class="alfawz-icon-circle alfawz-verses-icon"><span class="alfawz-icon" aria-hidden="true">📜</span></div>
            </div>
            <div class="alfawz-card-content">
                <div class="alfawz-card-value" id="profile-verses-read">0</div>
                <div class="alfawz-card-label"><?php _e('Verses Read', 'alfawzquran'); ?></div>
            </div>
            <div class="alfawz-card-decoration" aria-hidden="true"></div>
        </div>
        <div class="alfawz-progress-card">
            <div class="alfawz-card-icon">
                <div class="alfawz-icon-circle alfawz-memorize-icon"><span class="alfawz-icon" aria-hidden="true">🧠</span></div>
            </div>
            <div class="alfawz-card-content">
                <div class="alfawz-card-value" id="profile-verses-memorized">0</div>
                <div class="alfawz-card-label"><?php _e('Verses Memorized', 'alfawzquran'); ?></div>
            </div>
            <div class="alfawz-card-decoration" aria-hidden="true"></div>
        </div>
        <div class="alfawz-progress-card">
            <div class="alfawz-card-icon">
                <div class="alfawz-icon-circle alfawz-streak-icon"><span class="alfawz-icon" aria-hidden="true">🔥</span></div>
            </div>
            <div class="alfawz-card-content">
                <div class="alfawz-card-value" id="profile-current-streak">0</div>
                <div class="alfawz-card-label"><?php _e('Current Streak', 'alfawzquran'); ?></div>
            </div>
            <div class="alfawz-card-decoration" aria-hidden="true"></div>
        </div>
    </div>

    <div class="alfawz-daily-progress">
        <h3><?php _e('Daily Reading Goal', 'alfawzquran'); ?></h3>
        <div class="alfawz-progress-bar">
            <div class="alfawz-progress-fill" style="width: 0%" id="daily-progress-fill"></div>
        </div>
        <p class="alfawz-text-center">
            <span id="verses-read-today">0</span> / <span id="daily-target-verses">10</span> verses read today
        </p>
        <div class="alfawz-congratulations alfawz-hidden" id="daily-goal-congratulations">
            <h4><?php _e('Congratulations!', 'alfawzquran'); ?></h4>
            <p><?php _e('You\'ve reached your daily reading goal!', 'alfawzquran'); ?></p>
        </div>
    </div>

    <div class="alfawz-quick-actions">
        <a href="<?php echo esc_url(ALFAWZQURAN_PLUGIN_URL . 'reader/'); ?>" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-beautiful-btn" role="button">
            <span class="alfawz-btn-icon-wrapper"><span class="alfawz-btn-icon">📖</span></span>
            <span class="alfawz-btn-text"><?php _e('Start Reading', 'alfawzquran'); ?></span>
            <span class="alfawz-btn-glow"></span>
        </a>
        <a href="<?php echo esc_url( home_url( 'alfawz-memorization/' ) ); ?>" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-beautiful-btn" role="button">
            <span class="alfawz-btn-icon-wrapper"><span class="alfawz-btn-icon">🧠</span></span>
            <span class="alfawz-btn-text"><?php _e('Start Memorizing', 'alfawzquran'); ?></span>
            <span class="alfawz-btn-glow"></span>
        </a>
    </div>

    <div class="alfawz-daily-surah">
        <h3><?php _e('Today\'s Special Surah', 'alfawzquran'); ?></h3>
        <div id="daily-surah-card">
            <div class="alfawz-loading-message">
                <span class="alfawz-loading-icon">⏳</span>
                <h3><?php _e('Loading daily surah...', 'alfawzquran'); ?></h3>
                <p><?php _e('Please wait while we fetch today\'s recommended surah.', 'alfawzquran'); ?></p>
            </div>
        </div>
    </div>

    <div class="alfawz-recent-activity">
        <h3><?php _e('Recent Activity', 'alfawzquran'); ?></h3>
        <div class="alfawz-activity-list" id="recent-activity-list">
            <div class="alfawz-loading-message">
                <span class="alfawz-loading-icon">⏳</span>
                <h3><?php _e('Loading recent activity...', 'alfawzquran'); ?></h3>
                <p><?php _e('Fetching your latest reading and memorization logs.', 'alfawzquran'); ?></p>
            </div>
        </div>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Function to load user stats for dashboard
    function loadDashboardStats() {
        if (!alfawzData.isLoggedIn) {
            $('#profile-total-hasanat').text('N/A');
            $('#profile-verses-read').text('N/A');
            $('#profile-verses-memorized').text('N/A');
            $('#profile-current-streak').text('N/A');
            $('#verses-read-today').text('N/A');
            $('#daily-target-verses').text(alfawzData.dailyTarget);
            $('#recent-activity-list').html('<div class="alfawz-empty-state"><p>Please log in to see your dashboard stats and activity.</p></div>');
            return;
        }

        $.ajax({
            url: alfawzData.apiUrl + 'user-stats',
            method: 'GET',
            beforeSend: (xhr) => {
                xhr.setRequestHeader('X-WP-Nonce', alfawzData.nonce);
            },
            success: function(response) {
                if (response) {
                    $('#profile-total-hasanat').text(parseInt(response.total_hasanat || 0).toLocaleString());
                    $('#profile-verses-read').text(response.verses_read || 0);
                    $('#profile-verses-memorized').text(response.verses_memorized || 0);
                    $('#profile-current-streak').text(response.current_streak || 0);
                    
                    // Daily progress
                    const versesReadToday = response.verses_read_today || 0;
                    const dailyTarget = alfawzData.dailyTarget;
                    $('#verses-read-today').text(versesReadToday);
                    $('#daily-target-verses').text(dailyTarget);
                    const dailyProgressPercentage = (versesReadToday / dailyTarget) * 100;
                    $('#daily-progress-fill').css('width', `${Math.min(dailyProgressPercentage, 100)}%`);

                    if (versesReadToday >= dailyTarget) {
                        $('#daily-goal-congratulations').removeClass('alfawz-hidden');
                    } else {
                        $('#daily-goal-congratulations').addClass('alfawz-hidden');
                    }

                    // Recent activity
                    const activityList = $('#recent-activity-list');
                    activityList.empty();
                    if (response.recent_activity && response.recent_activity.length > 0) {
                        $.each(response.recent_activity, function(index, activity) {
                            const icon = activity.progress_type === 'read' ? '📖' : '🧠';
                            const hasanatText = activity.hasanat ? `<span class="alfawz-hasanat">⭐ ${activity.hasanat} Hasanat</span>` : '';
                            const date = new Date(activity.timestamp).toLocaleString();
                            activityList.append(`
                                <div class="alfawz-activity-item">
                                    <div class="alfawz-activity-icon">${icon}</div>
                                    <div class="alfawz-activity-content">
                                        <div class="alfawz-activity-text">
                                            ${activity.progress_type === 'read' ? 'Read' : 'Memorized'} Surah ${activity.surah_id}, Verse ${activity.verse_id}
                                        </div>
                                        <div class="alfawz-activity-meta">
                                            ${hasanatText}
                                            <span class="alfawz-time">🕒 ${date}</span>
                                        </div>
                                    </div>
                                </div>
                            `);
                        });
                    } else {
                        activityList.html('<div class="alfawz-empty-state"><p>No recent activity found. Start reading or memorizing!</p></div>');
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Error loading dashboard stats:', error);
                $('#profile-total-hasanat').text('Error');
                $('#profile-verses-read').text('Error');
                $('#profile-verses-memorized').text('Error');
                $('#profile-current-streak').text('Error');
                $('#verses-read-today').text('Error');
                $('#recent-activity-list').html('<div class="alfawz-error-message">Failed to load recent activity.</div>');
            }
        });
    }

    // Call on page load
    loadDashboardStats();
});
</script>

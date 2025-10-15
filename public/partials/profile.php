<div class="alfawz-profile">
    <div class="alfawz-profile-header">
        <div class="alfawz-profile-avatar-section">
            <div class="alfawz-profile-avatar">
                <img id="profile-avatar" src="/placeholder.svg?height=100&width=100" alt="User Avatar">
                <span class="alfawz-avatar-badge"><?php _e('Pro', 'alfawzquran'); ?></span>
            </div>
        </div>
        <div class="alfawz-profile-info">
            <h2 id="profile-username"><?php _e('Guest User', 'alfawzquran'); ?></h2>
            <p class="alfawz-member-since"><?php _e('Member since:', 'alfawzquran'); ?> <span id="profile-member-since">N/A</span></p>
            <div class="alfawz-total-hasanat">
                <span class="alfawz-hasanat-icon">⭐</span>
                <div class="alfawz-hasanat-content">
                    <span class="alfawz-hasanat-number" id="profile-total-hasanat">0</span>
                    <span class="alfawz-hasanat-label"><?php _e('Total Hasanat', 'alfawzquran'); ?></span>
                </div>
            </div>
        </div>
    </div>

    <div class="alfawz-profile-content-grid">
        <div class="alfawz-profile-section">
            <h3><?php _e('Your Progress', 'alfawzquran'); ?></h3>
            <div class="alfawz-profile-stats">
                <div class="alfawz-stat-card">
                    <div class="alfawz-stat-number" id="profile-verses-read">0</div>
                    <div class="alfawz-stat-label"><?php _e('Verses Read', 'alfawzquran'); ?></div>
                </div>
                <div class="alfawz-stat-card">
                    <div class="alfawz-stat-number" id="profile-verses-memorized">0</div>
                    <div class="alfawz-stat-label"><?php _e('Verses Memorized', 'alfawzquran'); ?></div>
                </div>
                <div class="alfawz-stat-card">
                    <div class="alfawz-stat-number" id="profile-current-streak">0</div>
                    <div class="alfawz-stat-label"><?php _e('Current Streak', 'alfawzquran'); ?></div>
                </div>
                <div class="alfawz-stat-card">
                    <div class="alfawz-stat-number" id="profile-longest-streak">0</div>
                    <div class="alfawz-stat-label"><?php _e('Longest Streak', 'alfawzquran'); ?></div>
                </div>
            </div>
        </div>

        <div class="alfawz-profile-section">
            <h3><?php _e('Your Bookmarks', 'alfawzquran'); ?></h3>
            <div class="alfawz-bookmarks-list" id="bookmarks-list">
                <div class="alfawz-loading-message">
                    <span class="alfawz-loading-icon">⏳</span>
                    <h3><?php _e('Loading bookmarks...', 'alfawzquran'); ?></h3>
                    <p><?php _e('Fetching your saved verses.', 'alfawzquran'); ?></p>
                </div>
            </div>
        </div>

        <div class="alfawz-profile-section">
            <h3><?php _e('Your Memorization Plans', 'alfawzquran'); ?></h3>
            <div class="alfawz-plans-list" id="profile-plans-list">
                <div class="alfawz-loading-message">
                    <span class="alfawz-loading-icon">⏳</span>
                    <h3><?php _e('Loading plans...', 'alfawzquran'); ?></h3>
                    <p><?php _e('Fetching your memorization plans.', 'alfawzquran'); ?></p>
                </div>
            </div>
        </div>

        <div class="alfawz-profile-section">
            <h3><?php _e('Achievements', 'alfawzquran'); ?></h3>
            <div class="alfawz-achievements-grid" id="achievements-grid">
                <div class="alfawz-achievement-card">
                    <span class="alfawz-achievement-icon">🌟</span>
                    <div class="alfawz-achievement-content">
                        <h4><?php _e('First Read', 'alfawzquran'); ?></h4>
                        <p><?php _e('Read your first verse.', 'alfawzquran'); ?></p>
                    </div>
                </div>
                <div class="alfawz-achievement-card">
                    <span class="alfawz-achievement-icon">✨</span>
                    <div class="alfawz-achievement-content">
                        <h4><?php _e('Daily Goal Achiever', 'alfawzquran'); ?></h4>
                        <p><?php _e('Complete your daily reading goal.', 'alfawzquran'); ?></p>
                    </div>
                </div>
                <div class="alfawz-achievement-card">
                    <span class="alfawz-achievement-icon">🏅</span>
                    <div class="alfawz-achievement-content">
                        <h4><?php _e('Memorizer Initiate', 'alfawzquran'); ?></h4>
                        <p><?php _e('Memorize your first verse.', 'alfawzquran'); ?></p>
                    </div>
                </div>
                <div class="alfawz-achievement-card">
                    <span class="alfawz-achievement-icon">🔥</span>
                    <div class="alfawz-achievement-content">
                        <h4><?php _e('7-Day Streak', 'alfawzquran'); ?></h4>
                        <p><?php _e('Maintain a 7-day reading streak.', 'alfawzquran'); ?></p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="alfawz-profile-actions">
        <a href="<?php echo esc_url(ALFAWZQURAN_PLUGIN_URL . 'games/'); ?>" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-primary alfawz-btn-large" role="button">
            <?php _e('Play Game', 'alfawzquran'); ?>
        </a>
        <a href="<?php echo esc_url(wp_logout_url(home_url())); ?>" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-secondary alfawz-btn-large" role="button">
            <?php _e('Logout', 'alfawzquran'); ?>
        </a>
        <a href="<?php echo esc_url(ALFAWZQURAN_PLUGIN_URL . 'settings/'); ?>" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-primary alfawz-btn-large" role="button">
            <?php _e('Edit Settings', 'alfawzquran'); ?>
        </a>
    </div>
</div>

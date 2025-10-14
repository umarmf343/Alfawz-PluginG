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
        <a href="<?php echo esc_url(wp_logout_url(home_url())); ?>" class="alfawz-btn alfawz-btn-secondary alfawz-btn-large">
            <?php _e('Logout', 'alfawzquran'); ?>
        </a>
        <a href="<?php echo esc_url(home_url('/alfawz-settings/')); ?>" class="alfawz-btn alfawz-btn-primary alfawz-btn-large">
            <?php _e('Edit Settings', 'alfawzquran'); ?>
        </a>
    </div>
</div>

<div class="alfawz-bottom-navigation">
    <div class="alfawz-nav-container">
        <a href="<?php echo esc_url(home_url('/alfawz-dashboard/')); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">🏠</span>
            <span class="alfawz-nav-label"><?php _e('Dashboard', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(home_url('/alfawz-reader/')); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">📖</span>
            <span class="alfawz-nav-label"><?php _e('Reader', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(home_url('/alfawz-memorizer/')); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">🧠</span>
            <span class="alfawz-nav-label"><?php _e('Memorizer', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(home_url('/alfawz-leaderboard/')); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">🏆</span>
            <span class="alfawz-nav-label"><?php _e('Leaderboard', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(home_url('/alfawz-profile/')); ?>" class="alfawz-nav-item active">
            <span class="alfawz-nav-icon">👤</span>
            <span class="alfawz-nav-label"><?php _e('Profile', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(home_url('/alfawz-settings/')); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">⚙️</span>
            <span class="alfawz-nav-label"><?php _e('Settings', 'alfawzquran'); ?></span>
        </a>
    </div>
</div>

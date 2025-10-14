<div class="alfawz-leaderboard">
    <div class="alfawz-leaderboard-header">
        <div class="alfawz-header-content">
            <h2><?php _e('Leaderboard', 'alfawzquran'); ?></h2>
            <p><?php _e('See how you rank among other Quran learners!', 'alfawzquran'); ?></p>
        </div>
    </div>

    <div class="alfawz-leaderboard-controls">
        <div class="alfawz-period-selector-container">
            <label for="leaderboard-period-select" class="alfawz-control-label">
                <span class="alfawz-label-icon">📅</span>
                <?php _e('View Period:', 'alfawzquran'); ?>
            </label>
            <select id="leaderboard-period-select" class="alfawz-period-selector">
                <option value="all_time"><?php _e('All Time', 'alfawzquran'); ?></option>
                <option value="monthly"><?php _e('Monthly', 'alfawzquran'); ?></option>
                <option value="weekly"><?php _e('Weekly', 'alfawzquran'); ?></option>
                <option value="daily"><?php _e('Daily', 'alfawzquran'); ?></option>
            </select>
        </div>
    </div>

    <div class="alfawz-leaderboard-table">
        <ul class="alfawz-leaderboard-list" id="leaderboard-list">
            <div class="alfawz-loading-message">
                <span class="alfawz-loading-icon">⏳</span>
                <h3><?php _e('Loading leaderboard...', 'alfawzquran'); ?></h3>
                <p><?php _e('Fetching top users by Hasanat.', 'alfawzquran'); ?></p>
            </div>
        </ul>
    </div>
</div>

<div class="alfawz-bottom-navigation">
    <div class="alfawz-nav-container">
        <a href="<?php echo esc_url(ALFAWZQURAN_PLUGIN_URL . 'dashboard/'); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">🏠</span>
            <span class="alfawz-nav-label"><?php _e('Dashboard', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(ALFAWZQURAN_PLUGIN_URL . 'reader/'); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">📖</span>
            <span class="alfawz-nav-label"><?php _e('Reader', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(ALFAWZQURAN_PLUGIN_URL . 'memorizer/'); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">🧠</span>
            <span class="alfawz-nav-label"><?php _e('Memorizer', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(ALFAWZQURAN_PLUGIN_URL . 'leaderboard/'); ?>" class="alfawz-nav-item active">
            <span class="alfawz-nav-icon">🏆</span>
            <span class="alfawz-nav-label"><?php _e('Leaderboard', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(ALFAWZQURAN_PLUGIN_URL . 'profile/'); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">👤</span>
            <span class="alfawz-nav-label"><?php _e('Profile', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(ALFAWZQURAN_PLUGIN_URL . 'settings/'); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">⚙️</span>
            <span class="alfawz-nav-label"><?php _e('Settings', 'alfawzquran'); ?></span>
        </a>
    </div>
</div>

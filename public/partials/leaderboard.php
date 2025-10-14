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

<?php
$current_page = 'leaderboard';
include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/mobile-nav.php';
?>

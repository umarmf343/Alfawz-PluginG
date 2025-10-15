<div class="alfawz-games">
    <div class="alfawz-games-header">
        <div class="alfawz-header-content">
            <h2><?php _e('Ayah Puzzle Builder', 'alfawzquran'); ?></h2>
            <p><?php _e('Rebuild the ayah by arranging each luminous tile back into its original order.', 'alfawzquran'); ?></p>
            <div class="alfawz-theme-chip" id="alfawz-theme-chip">
                <span class="alfawz-theme-icon">✨</span>
                <span class="alfawz-theme-text"><?php _e('Loading today\'s theme…', 'alfawzquran'); ?></span>
            </div>
        </div>
    </div>

    <div class="alfawz-game-grid">
        <div class="alfawz-game-main-card">
            <div class="alfawz-card-headline">
                <h3><?php _e('Reconstruct the verse', 'alfawzquran'); ?></h3>
                <p><?php _e('Drag the tiles from the bank into the illuminated board so the ayah reads perfectly.', 'alfawzquran'); ?></p>
            </div>

            <div class="alfawz-puzzle-meta">
                <div class="alfawz-puzzle-reference" id="alfawz-puzzle-reference"><?php _e('Fetching a new ayah…', 'alfawzquran'); ?></div>
                <p class="alfawz-puzzle-translation" id="alfawz-puzzle-translation"></p>
            </div>

            <div class="alfawz-puzzle-play-area">
                <div class="alfawz-puzzle-bank" id="alfawz-puzzle-bank"></div>
                <div class="alfawz-puzzle-board" id="alfawz-puzzle-board"></div>
            </div>

            <div class="alfawz-puzzle-actions">
                <button type="button" id="alfawz-shuffle-puzzle" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-secondary">
                    <?php _e('Shuffle Tiles', 'alfawzquran'); ?>
                </button>
                <button type="button" id="alfawz-reset-puzzle" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-ghost">
                    <?php _e('Reset Board', 'alfawzquran'); ?>
                </button>
                <button type="button" id="alfawz-check-puzzle" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-primary">
                    <?php _e('Check Order', 'alfawzquran'); ?>
                </button>
            </div>

            <div class="alfawz-puzzle-footer">
                <div class="alfawz-puzzle-status" id="alfawz-puzzle-status">
                    <?php _e('Tip: Each tile glows when it rests in the correct slot.', 'alfawzquran'); ?>
                </div>
                <div class="alfawz-puzzle-progress">
                    <span class="alfawz-progress-label"><?php _e('Tiles placed', 'alfawzquran'); ?></span>
                    <div class="alfawz-progress-bar small">
                        <div class="alfawz-progress-fill" id="alfawz-placement-progress" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        </div>

        <aside class="alfawz-game-sidebar">
            <div class="alfawz-stats-card">
                <h3><?php _e('Session Progress', 'alfawzquran'); ?></h3>
                <div class="alfawz-stat-line">
                    <span><?php _e('Puzzles Solved', 'alfawzquran'); ?></span>
                    <strong id="alfawz-completed-count">0</strong>
                </div>
                <div class="alfawz-stat-line">
                    <span><?php _e('Daily Streak', 'alfawzquran'); ?></span>
                    <strong id="alfawz-streak-count">0</strong>
                </div>
                <div class="alfawz-stat-line">
                    <span><?php _e('Best Time', 'alfawzquran'); ?></span>
                    <strong id="alfawz-best-time">--:--</strong>
                </div>
            </div>

            <div class="alfawz-timer-card">
                <div class="alfawz-timer-value" id="alfawz-puzzle-timer">00:00</div>
                <p><?php _e('Stay focused—the quicker you rebuild, the brighter your reward.', 'alfawzquran'); ?></p>
            </div>

            <div class="alfawz-habit-card">
                <h3><?php _e('Habit Hook', 'alfawzquran'); ?></h3>
                <p id="alfawz-habit-copy"><?php _e('Unlock themed puzzles by showing up every day and every week.', 'alfawzquran'); ?></p>
                <div class="alfawz-unlock-status" id="alfawz-unlock-status"></div>
            </div>
        </aside>
    </div>
</div>

<?php
$current_page = 'games';
?>

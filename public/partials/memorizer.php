<div class="alfawz-memorizer">
    <div class="alfawz-page-stack">
        <div class="alfawz-memorizer-header">
            <div class="alfawz-header-content">
                <h2><?php _e('Quran Memorizer', 'alfawzquran'); ?></h2>
                <p><?php _e('Select a verse to begin your memorization journey.', 'alfawzquran'); ?></p>
                <div class="alfawz-selected-surah alfawz-hidden" id="selected-memo-verse-display">
                    <span class="alfawz-surah-icon">📖</span>
                    <span id="selected-memo-verse-name"></span>
                </div>
            </div>
        </div>

        <div class="alfawz-memorization-stats">
            <div class="alfawz-stat-container alfawz-memorized-container">
                <div class="alfawz-stat-icon-wrapper">
                    <div class="alfawz-stat-pulse"></div>
                    <div class="alfawz-stat-icon-circle"><span class="alfawz-stat-icon">🧠</span></div>
                </div>
                <div class="alfawz-stat-number" id="total-memorized-verses">0</div>
                <div class="alfawz-stat-label"><?php _e('Memorized Verses', 'alfawzquran'); ?></div>
                <div class="alfawz-stat-decoration"></div>
            </div>
            <div class="alfawz-stat-container alfawz-streak-container">
                <div class="alfawz-stat-icon-wrapper">
                    <div class="alfawz-stat-flame"></div>
                    <div class="alfawz-stat-icon-circle"><span class="alfawz-stat-icon">🔥</span></div>
                </div>
                <div class="alfawz-stat-number" id="current-memorization-streak">0</div>
                <div class="alfawz-stat-label"><?php _e('Current Streak', 'alfawzquran'); ?></div>
                <div class="alfawz-stat-decoration"></div>
            </div>
            <div class="alfawz-stat-container alfawz-plans-container">
                <div class="alfawz-stat-icon-wrapper">
                    <div class="alfawz-stat-shine"></div>
                    <div class="alfawz-stat-icon-circle"><span class="alfawz-stat-icon">📝</span></div>
                </div>
                <div class="alfawz-stat-number" id="active-plans-count">0</div>
                <div class="alfawz-stat-label"><?php _e('Active Plans', 'alfawzquran'); ?></div>
                <div class="alfawz-stat-decoration"></div>
            </div>
        </div>

        <div class="alfawz-memorization-controls">
            <div class="alfawz-memo-selection-controls">
                <div class="alfawz-surah-selection">
                    <label for="memo-surah-select" class="alfawz-control-label">
                        <span class="alfawz-label-icon">📚</span>
                        <?php _e('Select Surah:', 'alfawzquran'); ?>
                    </label>
                    <select id="memo-surah-select" class="alfawz-surah-dropdown">
                        <option value=""><?php _e('Loading Surahs...', 'alfawzquran'); ?></option>
                    </select>
                </div>
                <div class="alfawz-verse-selection">
                    <label for="memo-verse-select" class="alfawz-control-label">
                        <span class="alfawz-label-icon">📜</span>
                        <?php _e('Select Verse:', 'alfawzquran'); ?>
                    </label>
                    <select id="memo-verse-select" class="alfawz-verse-dropdown" disabled>
                        <option value=""><?php _e('Select surah first', 'alfawzquran'); ?></option>
                    </select>
                </div>
                <div class="alfawz-memo-actions">
                    <button id="load-memorization-verse" class="alfawz-btn alfawz-btn-primary alfawz-btn-large" disabled>
                        <span class="alfawz-btn-icon">▶️</span> <?php _e('Load Verse', 'alfawzquran'); ?>
                    </button>
                </div>
            </div>
        </div>

        <div class="alfawz-memorization-plan-section">
            <h3><?php _e('Memorization Plans', 'alfawzquran'); ?></h3>
            <p class="alfawz-section-subtitle"><?php _e('Stay organised with a clear list of tasks and progress for every plan.', 'alfawzquran'); ?></p>
            <div class="alfawz-plan-selection-controls">
                <div class="alfawz-plan-dropdown-container">
                    <label for="memorization-plan-select" class="alfawz-control-label">
                        <span class="alfawz-label-icon">📝</span>
                        <?php _e('Choose Plan:', 'alfawzquran'); ?>
                    </label>
                    <select id="memorization-plan-select" class="alfawz-surah-dropdown">
                        <option value=""><?php _e('Loading plans...', 'alfawzquran'); ?></option>
                    </select>
                </div>
                <button id="load-memorization-plan" class="alfawz-btn alfawz-btn-primary alfawz-btn-large" disabled>
                    <span class="alfawz-btn-icon">🚀</span> <?php _e('Load Plan', 'alfawzquran'); ?>
                </button>
            </div>

            <div id="plan-progress-container" class="alfawz-plan-progress-overview alfawz-hidden">
                <div class="alfawz-plan-info">
                    <h4 id="current-plan-name"></h4>
                    <p id="plan-completion-text"></p>
                </div>
                <div class="alfawz-progress-bar">
                    <div class="alfawz-progress-fill" style="width: 0%" id="plan-progress-fill"></div>
                </div>
                <p class="alfawz-text-center"><span id="plan-percentage">0%</span> Completed</p>
                <button id="restart-plan" class="alfawz-btn alfawz-btn-secondary alfawz-btn-small">
                    <span class="alfawz-btn-icon">🔄</span> <?php _e('Restart Plan', 'alfawzquran'); ?>
                </button>
            </div>

            <div id="plan-verses-container" class="alfawz-plan-verses-list-container alfawz-hidden">
                <h4><?php _e('Verses in Plan', 'alfawzquran'); ?></h4>
                <div id="plan-verses-list" class="alfawz-plan-verses-list">
                     Verses will be loaded here
                </div>
            </div>
        </div>

        <div class="alfawz-memorization-session alfawz-hidden">
            <div class="alfawz-session-header">
                <h3><?php _e('Memorization Session', 'alfawzquran'); ?></h3>
                <div class="alfawz-session-info">
                    <span><?php _e('Verse:', 'alfawzquran'); ?> <span id="session-verse-info"></span></span>
                    <span><?php _e('Time:', 'alfawzquran'); ?> <span id="session-time">0m 0s</span></span>
                </div>
            </div>

            <div class="alfawz-memorization-verse-card alfawz-focus-card" tabindex="0" role="group" aria-live="polite">
                <div class="alfawz-verse-number-mem" id="memo-verse-number"></div>
                <div class="alfawz-verse-arabic-mem" id="memo-quran-text"></div>
                <div class="alfawz-verse-translation-mem" id="memo-quran-translation"></div>
            </div>

            <div class="alfawz-memorization-audio-controls">
                <button id="memo-play-audio" class="alfawz-audio-control-btn">
                    <span class="alfawz-btn-icon">🔊</span> <span class="alfawz-audio-text"><?php _e('Play Audio', 'alfawzquran'); ?></span>
                </button>
            </div>

            <div class="alfawz-repetition-controls">
                <div class="alfawz-repetition-header">
                    <h4><?php _e('Repetitions', 'alfawzquran'); ?></h4>
                    <span class="alfawz-repetition-counter">
                        <span id="repetition-count">0</span> / <span id="repetition-target">20</span>
                    </span>
                </div>
                <div class="alfawz-repetition-progress">
                    <div class="alfawz-progress-track">
                        <div class="alfawz-progress-fill" style="width: 0%" id="repetition-progress-bar"></div>
                        <div class="alfawz-progress-markers"></div>
                    </div>
                    <p class="alfawz-text-center alfawz-mb-0" id="session-progress-text"><?php _e('Repetitions: 0 / 20', 'alfawzquran'); ?></p>
                </div>
                <div class="alfawz-repeat-button-container">
                    <button id="repeat-verse-btn" class="alfawz-repeat-btn">
                        <span class="alfawz-repeat-icon-wrapper"><span class="alfawz-repeat-icon">🔁</span></span>
                        <div class="alfawz-repeat-content">
                            <span class="alfawz-repeat-text"><?php _e('Repeat Verse', 'alfawzquran'); ?></span>
                            <span class="alfawz-repeat-subtitle"><?php _e('Click to repeat and track progress', 'alfawzquran'); ?></span>
                        </div>
                    </button>
                </div>
            </div>

            <div class="alfawz-session-actions">
                <div class="alfawz-primary-actions">
                    <button id="memo-mark-memorized" class="alfawz-beautiful-btn alfawz-btn-success">
                        <span class="alfawz-btn-icon-wrapper"><span class="alfawz-btn-icon">✅</span></span>
                        <span class="alfawz-btn-text"><?php _e('Mark as Memorized', 'alfawzquran'); ?></span>
                        <span class="alfawz-btn-glow"></span>
                    </button>
                    <button id="memo-select-another" class="alfawz-beautiful-btn alfawz-btn-secondary">
                        <span class="alfawz-btn-icon-wrapper"><span class="alfawz-btn-icon">➕</span></span>
                        <span class="alfawz-btn-text"><?php _e('Select Another Verse', 'alfawzquran'); ?></span>
                        <span class="alfawz-btn-glow"></span>
                    </button>
                </div>
                <div class="alfawz-mobile-controls-row alfawz-hidden">
                    <button id="prev-memo-verse-btn" class="alfawz-mobile-nav-btn" disabled>
                        <span class="alfawz-btn-icon">◀️</span> Prev
                    </button>
                    <button id="repeat-verse-btn-mobile" class="alfawz-repeat-btn-mobile">
                        <span class="alfawz-repeat-icon">🔁</span>
                        <span class="alfawz-repeat-text">Repeat</span>
                    </button>
                    <button id="next-memo-verse-btn" class="alfawz-mobile-nav-btn" disabled>
                        Next <span class="alfawz-btn-icon">▶️</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Congratulations Modal -->
<div id="congratulations-modal" class="alfawz-congratulations-modal alfawz-hidden">
    <div class="alfawz-modal-overlay"></div>
    <div class="alfawz-modal-content">
        <div class="alfawz-modal-header">
            <div class="alfawz-celebration-icon">🎉</div>
            <h3><?php _e('MashaAllah!', 'alfawzquran'); ?></h3>
        </div>
        <div class="alfawz-modal-body">
            <p><?php _e('You have successfully memorized this verse!', 'alfawzquran'); ?></p>
            <div class="alfawz-achievement-display">
                <span class="alfawz-achievement-icon">⭐</span>
                <div class="alfawz-achievement-text">
                    <div class="alfawz-achievement-title"><?php _e('Verse Memorized!', 'alfawzquran'); ?></div>
                    <div class="alfawz-achievement-subtitle" id="achievement-details"></div>
                </div>
            </div>
        </div>
        <div class="alfawz-modal-actions">
            <button id="continue-memorization" class="alfawz-btn alfawz-btn-primary alfawz-btn-large">
                <?php _e('Continue Memorizing', 'alfawzquran'); ?>
            </button>
            <a href="<?php echo esc_url(ALFAWZQURAN_PLUGIN_URL . 'profile/'); ?>" class="alfawz-btn alfawz-btn-secondary alfawz-btn-large">
                <?php _e('View Profile', 'alfawzquran'); ?>
            </a>
        </div>
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
        <a href="<?php echo esc_url(ALFAWZQURAN_PLUGIN_URL . 'memorizer/'); ?>" class="alfawz-nav-item active">
            <span class="alfawz-nav-icon">🧠</span>
            <span class="alfawz-nav-label"><?php _e('Memorizer', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(ALFAWZQURAN_PLUGIN_URL . 'leaderboard/'); ?>" class="alfawz-nav-item">
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

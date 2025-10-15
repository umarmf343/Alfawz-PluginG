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

        <div class="alfawz-memorization-stats alfawz-progress-grid">
            <div class="alfawz-progress-card alfawz-memorizer-card">
                <div class="alfawz-card-icon">
                    <div class="alfawz-icon-circle alfawz-memorized-icon"><span class="alfawz-icon">🧠</span></div>
                </div>
                <div class="alfawz-card-content">
                    <div class="alfawz-card-value" id="total-memorized-verses">0</div>
                    <div class="alfawz-card-label"><?php _e('Memorized Verses', 'alfawzquran'); ?></div>
                </div>
                <div class="alfawz-card-decoration"></div>
            </div>
            <div class="alfawz-progress-card alfawz-memorizer-card">
                <div class="alfawz-card-icon">
                    <div class="alfawz-icon-circle alfawz-memorizer-streak-icon"><span class="alfawz-icon">🔥</span></div>
                </div>
                <div class="alfawz-card-content">
                    <div class="alfawz-card-value" id="current-memorization-streak">0</div>
                    <div class="alfawz-card-label"><?php _e('Current Streak', 'alfawzquran'); ?></div>
                </div>
                <div class="alfawz-card-decoration"></div>
            </div>
            <div class="alfawz-progress-card alfawz-memorizer-card">
                <div class="alfawz-card-icon">
                    <div class="alfawz-icon-circle alfawz-plans-icon"><span class="alfawz-icon">📝</span></div>
                </div>
                <div class="alfawz-card-content">
                    <div class="alfawz-card-value" id="active-plans-count">0</div>
                    <div class="alfawz-card-label"><?php _e('Active Plans', 'alfawzquran'); ?></div>
                    <a href="<?php echo esc_url(home_url('/memorizer/create-plan/')); ?>" role="button" class="alfawz-btn alfawz-btn-primary alfawz-create-plan-btn">
                        <span aria-hidden="true" class="alfawz-btn-icon">+</span><?php _e('Create Memorization Plan', 'alfawzquran'); ?>
                    </a>
                </div>
                <div class="alfawz-card-decoration"></div>
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
                    <button id="load-memorization-verse" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-primary alfawz-btn-large" disabled>
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
                <button id="load-memorization-plan" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-primary alfawz-btn-large" disabled>
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
                <button id="restart-plan" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-secondary alfawz-btn-small">
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

            <div class="alfawz-memorization-verse-card" role="group" aria-live="polite">
                <div class="alfawz-verse-number-mem" id="memo-verse-number"></div>
                <div class="alfawz-focus-card alfawz-verse-focus-card" tabindex="0">
                    <div class="alfawz-verse-arabic-mem" id="memo-quran-text" dir="rtl" lang="ar"></div>
                    <div class="alfawz-verse-translation-mem" id="memo-quran-translation"></div>
                </div>
            </div>

            <div class="alfawz-session-navigation" role="group" aria-label="Memorization navigation controls">
                <button id="prev-memo-verse-btn" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-mobile-nav-btn" disabled>
                    <span class="alfawz-btn-icon" aria-hidden="true">◀️</span>
                    <span><?php _e('Previous', 'alfawzquran'); ?></span>
                </button>
                <button id="memo-mark-memorized" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-beautiful-btn alfawz-btn-success">
                    <span class="alfawz-btn-icon-wrapper"><span class="alfawz-btn-icon" aria-hidden="true">✅</span></span>
                    <span class="alfawz-btn-text"><?php _e('Mark as Memorized', 'alfawzquran'); ?></span>
                    <span class="alfawz-btn-glow"></span>
                </button>
                <button id="next-memo-verse-btn" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-mobile-nav-btn" disabled>
                    <span><?php _e('Next', 'alfawzquran'); ?></span>
                    <span class="alfawz-btn-icon" aria-hidden="true">▶️</span>
                </button>
            </div>

            <div class="alfawz-repetition-controls">
                <div class="alfawz-repetition-header">
                    <h4><?php _e('Repetitions', 'alfawzquran'); ?></h4>
                    <span class="alfawz-repetition-counter" aria-live="polite" aria-atomic="true">
                        <span id="repetition-count">0</span> / <span id="repetition-target">20</span>
                    </span>
                </div>
                <div class="alfawz-repetition-progress">
                    <div class="alfawz-progress-track" role="presentation">
                        <div
                            class="alfawz-progress-fill"
                            style="width: 0%"
                            id="repetition-progress-bar"
                            role="progressbar"
                            aria-label="<?php esc_attr_e('Repetition progress', 'alfawzquran'); ?>"
                            aria-valuemin="0"
                            aria-valuenow="0"
                            aria-valuemax="20"
                        ></div>
                        <div class="alfawz-progress-markers"></div>
                    </div>
                    <p class="alfawz-text-center alfawz-mb-0" id="session-progress-text" aria-live="polite" aria-atomic="true"><?php _e('Repetitions: 0 / 20', 'alfawzquran'); ?></p>
                </div>
                <div class="alfawz-repeat-button-container">
                    <button
                        id="repeat-verse-btn"
                        class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-repeat-btn"
                        type="button"
                    >
                        <span class="alfawz-repeat-icon-wrapper"><span class="alfawz-repeat-icon" aria-hidden="true">🔁</span></span>
                        <div class="alfawz-repeat-content">
                            <span class="alfawz-repeat-text"><?php _e('Repeat Verse', 'alfawzquran'); ?></span>
                            <span class="alfawz-repeat-subtitle"><?php _e('Each click adds one repetition towards 20x auto-advance', 'alfawzquran'); ?></span>
                        </div>
                    </button>
                </div>
            </div>

            <div class="alfawz-session-actions">
                <button id="memo-select-another" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-beautiful-btn alfawz-btn-secondary">
                    <span class="alfawz-btn-icon-wrapper"><span class="alfawz-btn-icon" aria-hidden="true">➕</span></span>
                    <span class="alfawz-btn-text"><?php _e('Select Another Verse', 'alfawzquran'); ?></span>
                    <span class="alfawz-btn-glow"></span>
                </button>
            </div>

            <div class="alfawz-memorization-audio-controls">
                <button id="memo-play-audio" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-audio-control-btn">
                    <span class="alfawz-btn-icon" aria-hidden="true">🔊</span> <span class="alfawz-audio-text"><?php _e('Play Audio', 'alfawzquran'); ?></span>
                </button>
            </div>

            <div class="alfawz-review-panel" id="memo-review-panel">
                <div class="alfawz-review-header">
                    <h4><?php _e('Memorization Review', 'alfawzquran'); ?></h4>
                    <span class="alfawz-review-status" id="memo-review-status"><?php _e('No review yet', 'alfawzquran'); ?></span>
                </div>
                <p class="alfawz-review-intro"><?php _e('Capture pronunciation, fluency, and confidence insights after each verse to power guardian and coach feedback.', 'alfawzquran'); ?></p>
                <div class="alfawz-review-actions" id="memo-review-actions" role="radiogroup" aria-label="<?php esc_attr_e('Select review outcome', 'alfawzquran'); ?>">
                    <button type="button" class="alfawz-review-chip" data-review-score="perfect" role="radio" aria-checked="false">
                        <span class="alfawz-review-icon" aria-hidden="true">🌟</span>
                        <span><?php _e('Perfect recall', 'alfawzquran'); ?></span>
                    </button>
                    <button type="button" class="alfawz-review-chip" data-review-score="solid" role="radio" aria-checked="false">
                        <span class="alfawz-review-icon" aria-hidden="true">👍</span>
                        <span><?php _e('Solid with notes', 'alfawzquran'); ?></span>
                    </button>
                    <button type="button" class="alfawz-review-chip" data-review-score="revisit" role="radio" aria-checked="false">
                        <span class="alfawz-review-icon" aria-hidden="true">🔁</span>
                        <span><?php _e('Needs revisit', 'alfawzquran'); ?></span>
                    </button>
                </div>
                <label for="memo-review-notes" class="alfawz-review-label"><?php _e('Review notes', 'alfawzquran'); ?></label>
                <textarea id="memo-review-notes" class="alfawz-review-notes" rows="3" placeholder="<?php esc_attr_e('Add tajwid observations, pacing feedback, or motivation cues…', 'alfawzquran'); ?>"></textarea>
                <div class="alfawz-review-footer">
                    <button type="button" id="memo-save-review" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-primary">
                        <span class="alfawz-btn-icon" aria-hidden="true">💾</span>
                        <span><?php _e('Save review snapshot', 'alfawzquran'); ?></span>
                    </button>
                    <span class="alfawz-review-feedback" id="memo-review-feedback" aria-live="polite"></span>
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
            <button id="continue-memorization" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-primary alfawz-btn-large">
                <?php _e('Continue Memorizing', 'alfawzquran'); ?>
            </button>
            <a href="<?php echo esc_url(ALFAWZQURAN_PLUGIN_URL . 'profile/'); ?>" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-btn-secondary alfawz-btn-large" role="button">
                <?php _e('View Profile', 'alfawzquran'); ?>
            </a>
        </div>
    </div>
</div>

<?php
$current_page = 'memorizer';
include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/mobile-nav.php';
?>

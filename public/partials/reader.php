<div class="alfawz-reader">
    <div class="alfawz-page-stack">
        <div class="alfawz-reader-header">
            <div class="alfawz-header-content">
                <h2><?php _e('Quran Reader', 'alfawzquran'); ?></h2>
                <p><?php _e('Select a Surah and Verse to start reading.', 'alfawzquran'); ?></p>
                <div class="alfawz-selected-surah alfawz-hidden" id="selected-surah-display">
                    <span class="alfawz-surah-icon">📖</span>
                    <span id="selected-surah-name"></span>
                </div>
            </div>
        </div>

        <div class="alfawz-reader-controls">
        <div class="alfawz-selection-controls">
            <div class="alfawz-surah-selection">
                <label for="reader-surah-select" class="alfawz-control-label">
                    <span class="alfawz-label-icon">📚</span>
                    <?php _e('Select Surah:', 'alfawzquran'); ?>
                </label>
                <select id="reader-surah-select" class="alfawz-surah-dropdown">
                    <option value=""><?php _e('Loading Surahs...', 'alfawzquran'); ?></option>
                </select>
            </div>
            <div class="alfawz-verse-selection">
                <label for="reader-verse-select" class="alfawz-control-label">
                    <span class="alfawz-label-icon">📜</span>
                    <?php _e('Select Verse:', 'alfawzquran'); ?>
                </label>
                <select id="reader-verse-select" class="alfawz-verse-dropdown" disabled>
                    <option value=""><?php _e('Select surah first', 'alfawzquran'); ?></option>
                </select>
            </div>
            <div class="alfawz-reading-options">
                <label class="alfawz-toggle-label">
                    <input type="checkbox" id="show-translation" checked>
                    <span class="alfawz-toggle-slider"></span>
                    <span class="alfawz-label-icon">🌐</span>
                    <span class="alfawz-toggle-text alfawz-switch off"><?php _e('Show Translation', 'alfawzquran'); ?></span>
                </label>
                <div class="alfawz-verse-counter-display alfawz-hidden">
                    <span class="alfawz-counter-label"><?php _e('Current Verse:', 'alfawzquran'); ?></span>
                    <span class="alfawz-verse-counter" id="current-surah-verse"></span>
                </div>
            </div>
        </div>
        </div>

        <div class="alfawz-verse-display">
            <div class="alfawz-loading-message" id="reader-loading-message">
                <span class="alfawz-loading-icon">⏳</span>
                <h3><?php _e('Select a verse to begin', 'alfawzquran'); ?></h3>
                <p><?php _e('Choose a Surah and Verse from the dropdowns above.', 'alfawzquran'); ?></p>
            </div>

            <div class="alfawz-verse-card alfawz-hidden" id="reader-verse-card" role="group" aria-live="polite">
                <button
                    id="prev-verse-btn"
                    type="button"
                    class="alfawz-verse-nav-button alfawz-verse-nav-button--prev"
                    aria-label="<?php esc_attr_e('Previous verse', 'alfawzquran'); ?>"
                    disabled
                >
                    <span class="alfawz-verse-nav-icon" aria-hidden="true">◀️</span>
                    <span class="alfawz-sr-only"><?php _e('Previous verse', 'alfawzquran'); ?></span>
                </button>

                <div class="alfawz-focus-card alfawz-verse-focus-card alfawz-reader-verse-content" tabindex="0">
                    <div class="alfawz-verse-arabic" id="reader-quran-text" dir="rtl" lang="ar"></div>
                    <div class="alfawz-verse-translation" id="reader-quran-translation"></div>
                </div>

                <button
                    id="next-verse-btn"
                    type="button"
                    class="alfawz-verse-nav-button alfawz-verse-nav-button--next"
                    aria-label="<?php esc_attr_e('Next verse', 'alfawzquran'); ?>"
                    disabled
                >
                    <span class="alfawz-verse-nav-icon" aria-hidden="true">▶️</span>
                    <span class="alfawz-sr-only"><?php _e('Next verse', 'alfawzquran'); ?></span>
                </button>
            </div>
        </div>

        <div class="alfawz-reader-actions alfawz-hidden">
        <div class="alfawz-primary-actions">
            <button id="reader-play-audio" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-beautiful-btn">
                <span class="alfawz-btn-icon-wrapper"><span class="alfawz-btn-icon">🔊</span></span>
                <span class="alfawz-btn-text alfawz-audio-text"><?php _e('Play Audio', 'alfawzquran'); ?></span>
                <span class="alfawz-btn-glow"></span>
            </button>
            <button id="reader-mark-read" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-beautiful-btn">
                <span class="alfawz-btn-icon-wrapper"><span class="alfawz-btn-icon">✅</span></span>
                <span class="alfawz-btn-text"><?php _e('Mark as Read', 'alfawzquran'); ?></span>
                <span class="alfawz-btn-glow"></span>
            </button>
            <button id="reader-bookmark" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md alfawz-btn alfawz-beautiful-btn">
                <span class="alfawz-btn-icon-wrapper"><span class="alfawz-btn-icon">🔖</span></span>
                <span class="alfawz-btn-text"><?php _e('Bookmark', 'alfawzquran'); ?></span>
                <span class="alfawz-btn-glow"></span>
            </button>
        </div>
        <div class="alfawz-hasanat-display">
            <span class="alfawz-hasanat-icon-wrapper"><span class="alfawz-hasanat-icon">⭐</span></span>
            <div class="alfawz-hasanat-content">
                <span class="alfawz-hasanat-value" id="current-verse-hasanat">0</span>
                <span class="alfawz-hasanat-label"><?php _e('Hasanat for this verse', 'alfawzquran'); ?></span>
            </div>
            <span class="alfawz-hasanat-sparkle"></span>
            <span class="alfawz-hasanat-glow"></span>
        </div>
        </div>

        <div class="alfawz-live-progress">
            <h3><?php _e('Your Session Progress', 'alfawzquran'); ?></h3>
            <div class="alfawz-progress-grid">
                <div class="alfawz-progress-card">
                    <div class="alfawz-card-icon">
                        <div class="alfawz-icon-circle alfawz-hasanat-icon"><span class="alfawz-icon">⭐</span></div>
                    </div>
                    <div class="alfawz-card-content">
                        <div class="alfawz-card-value" id="session-hasanat">0</div>
                        <div class="alfawz-card-label"><?php _e('Hasanat Earned', 'alfawzquran'); ?></div>
                    </div>
                    <div class="alfawz-card-decoration"></div>
                </div>
                <div class="alfawz-progress-card">
                    <div class="alfawz-card-icon">
                        <div class="alfawz-icon-circle alfawz-verses-icon"><span class="alfawz-icon">📜</span></div>
                    </div>
                    <div class="alfawz-card-content">
                        <div class="alfawz-card-value" id="verses-read-session">0</div>
                        <div class="alfawz-card-label"><?php _e('Verses Read', 'alfawzquran'); ?></div>
                    </div>
                    <div class="alfawz-card-decoration"></div>
                </div>
                <div class="alfawz-progress-card">
                    <div class="alfawz-card-icon">
                        <div class="alfawz-icon-circle alfawz-time-icon"><span class="alfawz-icon">⏱️</span></div>
                    </div>
                    <div class="alfawz-card-content">
                        <div class="alfawz-card-value" id="session-time">0m 0s</div>
                        <div class="alfawz-card-label"><?php _e('Session Time', 'alfawzquran'); ?></div>
                    </div>
                    <div class="alfawz-card-decoration"></div>
                </div>
                <div class="alfawz-progress-card">
                    <div class="alfawz-card-icon">
                        <div class="alfawz-icon-circle alfawz-streak-icon"><span class="alfawz-icon">🔥</span></div>
                    </div>
                    <div class="alfawz-card-content">
                        <div class="alfawz-card-value" id="current-streak-display">0</div>
                        <div class="alfawz-card-label"><?php _e('Current Streak', 'alfawzquran'); ?></div>
                    </div>
                    <div class="alfawz-card-decoration"></div>
                </div>
            </div>
        </div>
    </div>
</div>

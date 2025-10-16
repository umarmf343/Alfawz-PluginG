<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-reader" class="alfawz-reader-shell alfawz-no-scrollbar px-4 pt-8 sm:px-6">
    <div class="alfawz-reader-controls mx-auto mt-10 max-w-3xl" aria-labelledby="alfawz-reader-label">
        <h2 id="alfawz-reader-label" class="alfawz-controls-heading">
            <?php esc_html_e( 'Select a surah and ayah', 'alfawzquran' ); ?>
        </h2>
        <div class="alfawz-controls-grid">
            <label class="alfawz-field">
                <span class="alfawz-field-label"><?php esc_html_e( 'Surah', 'alfawzquran' ); ?></span>
                <select id="alfawz-surah-select" class="alfawz-select">
                    <option value=""><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></option>
                </select>
            </label>
            <label class="alfawz-field">
                <span class="alfawz-field-label"><?php esc_html_e( 'Verse', 'alfawzquran' ); ?></span>
                <select id="alfawz-verse-select" class="alfawz-select" disabled>
                    <option value=""><?php esc_html_e( 'Select a surah first', 'alfawzquran' ); ?></option>
                </select>
            </label>
        </div>
    </div>

    <div class="alfawz-reader-surface mx-auto max-w-3xl px-5 py-10 sm:px-8" aria-live="polite" aria-busy="true">
        <div id="alfawz-confetti-host" class="alfawz-confetti-host" aria-hidden="true"></div>
        <p id="alfawz-reader-announcement" class="screen-reader-text" role="status" aria-live="polite"></p>
        <div id="alfawz-verse-loader" class="alfawz-verse-loader">
            <?php esc_html_e( 'Select a surah and verse to begin your recitation.', 'alfawzquran' ); ?>
        </div>
        <article id="alfawz-verse-container" class="alfawz-verse-card hidden" aria-labelledby="alfawz-verse-heading">
            <div id="alfawz-egg-widget" class="alfawz-egg-widget" aria-live="polite">
                <div class="alfawz-egg-visual">
                    <div id="alfawz-egg-emoji" class="alfawz-egg-emoji" role="img" aria-label="<?php esc_attr_e( 'Egg progress', 'alfawzquran' ); ?>">🥚</div>
                    <div class="alfawz-egg-sparkle" aria-hidden="true"></div>
                </div>
                <div class="alfawz-egg-progress">
                    <div class="alfawz-progress-track" aria-hidden="true">
                        <div id="alfawz-egg-progress-bar" class="alfawz-progress-fill" style="width:0%"></div>
                    </div>
                    <div class="alfawz-egg-stats">
                        <span id="alfawz-egg-count" class="alfawz-egg-count">0 / 0</span>
                        <p id="alfawz-egg-message" class="alfawz-egg-message"><?php esc_html_e( 'Keep reading to hatch the surprise.', 'alfawzquran' ); ?></p>
                    </div>
                </div>
            </div>

            <button type="button" id="alfawz-prev-verse" class="alfawz-verse-nav" aria-label="<?php esc_attr_e( 'Previous verse', 'alfawzquran' ); ?>" disabled>◁</button>
            <button type="button" id="alfawz-next-verse" class="alfawz-verse-nav" aria-label="<?php esc_attr_e( 'Next verse', 'alfawzquran' ); ?>" disabled>▷</button>

            <header class="alfawz-verse-header" aria-live="polite">
                <p id="alfawz-verse-meta" class="alfawz-verse-meta"></p>
                <h3 id="alfawz-verse-heading" class="alfawz-verse-heading"></h3>
            </header>

            <div id="alfawz-verse-content" class="alfawz-verse-panel">
                <p id="alfawz-arabic-text" class="alfawz-arabic" dir="rtl" lang="ar"></p>
                <p id="alfawz-transliteration" class="alfawz-transliteration"></p>
                <p id="alfawz-translation" class="alfawz-translation"></p>
            </div>

            <div id="alfawz-surah-view-toggle" class="alfawz-view-toggle" role="group" aria-label="<?php esc_attr_e( 'Toggle surah display mode', 'alfawzquran' ); ?>">
                <label class="alfawz-switch" for="alfawz-surah-toggle">
                    <input
                        type="checkbox"
                        id="alfawz-surah-toggle"
                        aria-expanded="false"
                        aria-controls="alfawz-surah-full-view"
                    />
                    <span class="alfawz-switch-track" aria-hidden="true">
                        <span class="alfawz-switch-indicator"></span>
                    </span>
                    <span class="alfawz-switch-copy">
                        <span class="alfawz-switch-title"><?php esc_html_e( 'Show entire surah', 'alfawzquran' ); ?></span>
                        <span id="alfawz-surah-toggle-hint" class="alfawz-switch-hint"><?php esc_html_e( 'Navigate verse by verse', 'alfawzquran' ); ?></span>
                    </span>
                </label>
            </div>

            <section class="alfawz-progress-widget" aria-live="polite">
                <div class="alfawz-progress-track" aria-hidden="true">
                    <div id="alfawz-daily-progress-bar" class="alfawz-progress-fill" style="width:0%"></div>
                </div>
                <div class="alfawz-progress-copy">
                    <span id="alfawz-daily-label" class="alfawz-progress-label">0 / 10 Verses Today</span>
                    <p id="alfawz-daily-note" class="alfawz-progress-note"></p>
                </div>
            </section>

            <section
                id="alfawz-reflection-widget"
                class="alfawz-reflection-widget"
                aria-labelledby="alfawz-reflection-heading"
                aria-live="polite"
            >
                <div class="alfawz-reflection-head">
                    <div>
                        <h4 id="alfawz-reflection-heading" class="alfawz-reflection-title">
                            <?php esc_html_e( 'Reflection journal', 'alfawzquran' ); ?>
                        </h4>
                        <p id="alfawz-reflection-context" class="alfawz-reflection-context">
                            <?php esc_html_e( 'Select a verse to share how it resonated with you.', 'alfawzquran' ); ?>
                        </p>
                    </div>
<?php
$reflection_moods = [
    'grateful'   => [
        'emoji' => '😊',
        'label' => __( 'Grateful', 'alfawzquran' ),
    ],
    'focused'    => [
        'emoji' => '🎯',
        'label' => __( 'Focused', 'alfawzquran' ),
    ],
    'hopeful'    => [
        'emoji' => '🌱',
        'label' => __( 'Hopeful', 'alfawzquran' ),
    ],
    'reflective' => [
        'emoji' => '🪞',
        'label' => __( 'Reflective', 'alfawzquran' ),
    ],
    'striving'   => [
        'emoji' => '🔥',
        'label' => __( 'Striving', 'alfawzquran' ),
    ],
];
?>
                    <div class="alfawz-reflection-moods" role="radiogroup" aria-label="<?php esc_attr_e( 'Select a reflection mood', 'alfawzquran' ); ?>">
<?php
$index = 0;
foreach ( $reflection_moods as $mood_slug => $mood_data ) :
    $emoji        = $mood_data['emoji'];
    $label        = $mood_data['label'];
    $tabindex     = 0 === $index ? '0' : '-1';
    $index++;
    ?>
                        <button
                            type="button"
                            class="alfawz-reflection-mood"
                            data-mood="<?php echo esc_attr( $mood_slug ); ?>"
                            aria-pressed="false"
                            aria-checked="false"
                            role="radio"
                            tabindex="<?php echo esc_attr( $tabindex ); ?>"
                            aria-label="<?php echo esc_attr( $label ); ?>"
                            title="<?php echo esc_attr( $label ); ?>"
                        >
                            <span aria-hidden="true"><?php echo esc_html( $emoji ); ?></span>
                        </button>
<?php endforeach; ?>
                    </div>
                </div>
                <div class="alfawz-reflection-body">
                    <label class="alfawz-reflection-label" for="alfawz-reflection-input">
                        <?php esc_html_e( 'Your reflection', 'alfawzquran' ); ?>
                    </label>
                    <textarea
                        id="alfawz-reflection-input"
                        class="alfawz-reflection-input"
                        rows="3"
                        maxlength="500"
                        placeholder="<?php echo esc_attr__( 'Capture a brief note or dua inspired by this ayah…', 'alfawzquran' ); ?>"
                    ></textarea>
                    <p class="alfawz-reflection-status" id="alfawz-reflection-status" role="status" aria-live="polite"></p>
                    <div class="alfawz-reflection-actions">
                        <button type="button" class="alfawz-button" id="alfawz-reflection-save">
                            <?php esc_html_e( 'Save reflection', 'alfawzquran' ); ?>
                        </button>
                        <button type="button" class="alfawz-reflection-clear" id="alfawz-reflection-clear">
                            <?php esc_html_e( 'Clear', 'alfawzquran' ); ?>
                        </button>
                    </div>
                </div>
                <div class="alfawz-reflection-history">
                    <h5 class="alfawz-reflection-history-title"><?php esc_html_e( 'Recent reflections', 'alfawzquran' ); ?></h5>
                    <ul id="alfawz-reflection-list" class="alfawz-reflection-list" aria-live="polite"></ul>
                    <p id="alfawz-reflection-empty-state" class="alfawz-reflection-empty">
                        <?php esc_html_e( 'Your reflections for this ayah will appear here.', 'alfawzquran' ); ?>
                    </p>
                </div>
            </section>

            <div id="alfawz-surah-full-view" class="alfawz-surah-list hidden" aria-live="polite" aria-labelledby="alfawz-surah-full-heading">
                <div class="alfawz-surah-list__intro">
                    <h4 id="alfawz-surah-full-heading"><?php esc_html_e( 'All verses in this surah', 'alfawzquran' ); ?></h4>
                    <p class="alfawz-surah-list__hint"><?php esc_html_e( 'Tap a verse to focus it or play the recitation.', 'alfawzquran' ); ?></p>
                </div>
                <div id="alfawz-surah-list-body" class="alfawz-surah-list__body"></div>
            </div>
        </article>
    </div>

    <div
        id="alfawz-gwani-player"
        class="alfawz-gwani-player mx-auto mt-8 max-w-3xl"
        aria-labelledby="alfawz-gwani-player-heading"
        aria-live="polite"
    >
        <h3 id="alfawz-gwani-player-heading" class="alfawz-controls-heading">
            <?php esc_html_e( 'Gwani Dahiru Surah Player', 'alfawzquran' ); ?>
        </h3>
        <p class="alfawz-gwani-description">
            <?php esc_html_e( 'Stream complete surahs from the Gwani Dahiru archive without changing your current reader selection.', 'alfawzquran' ); ?>
        </p>
        <p class="alfawz-gwani-footnote">
            <?php esc_html_e( 'Audio sourced from the Moshaf Gwani Dahir collection hosted on the Internet Archive.', 'alfawzquran' ); ?>
            <a href="https://archive.org/details/MoshafGwaniDahir" class="alfawz-audio-link" target="_blank" rel="noopener">
                <?php esc_html_e( 'Explore the archive', 'alfawzquran' ); ?>
            </a>
        </p>
        <div class="alfawz-gwani-controls">
            <label class="alfawz-field">
                <span class="alfawz-field-label"><?php esc_html_e( 'Surah', 'alfawzquran' ); ?></span>
                <select id="alfawz-gwani-surah-select" class="alfawz-select" disabled>
                    <option value=""><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></option>
                </select>
            </label>
            <div class="alfawz-gwani-action">
                <button type="button" id="alfawz-gwani-play" class="alfawz-button" disabled>
                    <?php esc_html_e( 'Play full surah', 'alfawzquran' ); ?>
                </button>
            </div>
        </div>
        <p id="alfawz-gwani-status" class="alfawz-gwani-status" role="status">
            <?php esc_html_e( 'Select a surah to hear the Gwani Dahiru recitation.', 'alfawzquran' ); ?>
        </p>
        <audio id="alfawz-gwani-audio" class="alfawz-gwani-audio" controls preload="none" aria-label="<?php esc_attr_e( 'Gwani Dahiru surah audio player', 'alfawzquran' ); ?>"></audio>
    </div>

    <div id="alfawz-daily-modal" class="alfawz-daily-modal hidden fixed inset-0 z-50 flex items-end justify-center px-4 pb-8 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="alfawz-daily-modal-title" aria-describedby="alfawz-daily-modal-message">
        <div class="alfawz-daily-modal__backdrop absolute inset-0 bg-gray-900 bg-opacity-60" data-dismiss-daily></div>
        <div class="alfawz-daily-modal__card relative z-10 w-full max-w-md translate-y-6 rounded-2xl bg-white px-6 py-8 text-center shadow-xl transition sm:translate-y-0">
            <div class="alfawz-daily-modal__confetti pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <h3 id="alfawz-daily-modal-title" class="text-2xl font-semibold text-emerald-900"><?php esc_html_e( 'MashaAllah! Goal achieved', 'alfawzquran' ); ?></h3>
            <p id="alfawz-daily-modal-message" class="mt-3 text-base text-gray-600"><?php esc_html_e( 'You reached today\'s 10-verse milestone. Keep the momentum going!', 'alfawzquran' ); ?></p>
            <button type="button" class="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400" data-dismiss-daily>
                <span>🎉</span>
                <span><?php esc_html_e( 'Continue reading', 'alfawzquran' ); ?></span>
            </button>
        </div>
    </div>
</div>

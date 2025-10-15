<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-reader" class="alfawz-reader-shell mx-auto max-w-3xl px-4">
    <div class="alfawz-reader-surface" aria-live="polite" aria-busy="true">
        <div id="alfawz-verse-loader" class="alfawz-verse-loader">
            <?php esc_html_e( 'Select a surah and verse to begin your recitation.', 'alfawzquran' ); ?>
        </div>
        <article id="alfawz-verse-container" class="alfawz-verse-card hidden">
            <div id="alfawz-confetti-host" class="alfawz-confetti-host" aria-hidden="true"></div>
            <div class="alfawz-egg-widget" id="alfawz-egg-widget" aria-live="polite">
                <div class="alfawz-egg-icon" id="alfawz-egg-emoji" role="img" aria-label="<?php esc_attr_e( 'Egg progress', 'alfawzquran' ); ?>">🥚</div>
                <div class="alfawz-egg-progress">
                    <p class="alfawz-egg-heading"><?php esc_html_e( 'Break the egg', 'alfawzquran' ); ?></p>
                    <p class="alfawz-egg-count" id="alfawz-egg-count">0 / 0</p>
                    <div class="alfawz-progress-track" role="presentation">
                        <div id="alfawz-egg-progress-bar" class="alfawz-progress-fill" style="width:0%"></div>
                    </div>
                </div>
            </div>

            <button type="button" id="alfawz-prev-verse" class="alfawz-verse-nav" aria-label="<?php esc_attr_e( 'Previous verse', 'alfawzquran' ); ?>" disabled>◁</button>
            <button type="button" id="alfawz-next-verse" class="alfawz-verse-nav" aria-label="<?php esc_attr_e( 'Next verse', 'alfawzquran' ); ?>" disabled>▷</button>

            <header class="alfawz-verse-header">
                <p id="alfawz-verse-meta" class="alfawz-verse-meta"></p>
                <h3 id="alfawz-verse-heading" class="alfawz-verse-heading"></h3>
            </header>

            <div class="alfawz-verse-text">
                <p id="alfawz-arabic-text" class="alfawz-arabic" dir="rtl" lang="ar"></p>
                <p id="alfawz-transliteration" class="alfawz-transliteration"></p>
                <p id="alfawz-translation" class="alfawz-translation"></p>
            </div>

            <section class="alfawz-daily-widget" aria-live="polite">
                <header>
                    <h4 class="alfawz-daily-title"><?php esc_html_e( 'Daily 10-verse tracker', 'alfawzquran' ); ?></h4>
                    <p id="alfawz-daily-label" class="alfawz-daily-count">0 / 10</p>
                </header>
                <div class="alfawz-progress-track" role="presentation">
                    <div id="alfawz-daily-progress-bar" class="alfawz-progress-fill" style="width:0%"></div>
                </div>
                <p id="alfawz-daily-note" class="alfawz-daily-note"></p>
            </section>
        </article>
    </div>

    <div class="alfawz-reader-controls" aria-labelledby="alfawz-reader-label">
        <h2 id="alfawz-reader-label" class="screen-reader-text"><?php esc_html_e( 'Select a surah and ayah', 'alfawzquran' ); ?></h2>
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

    <div id="alfawz-daily-modal" class="alfawz-daily-modal hidden" role="dialog" aria-modal="true" aria-labelledby="alfawz-daily-modal-title" aria-describedby="alfawz-daily-modal-message">
        <div class="alfawz-daily-modal__backdrop" data-dismiss-daily></div>
        <div class="alfawz-daily-modal__card">
            <div class="alfawz-daily-modal__confetti" aria-hidden="true"></div>
            <h3 id="alfawz-daily-modal-title" class="alfawz-daily-modal__title"><?php esc_html_e( 'MashaAllah! Goal achieved', 'alfawzquran' ); ?></h3>
            <p id="alfawz-daily-modal-message" class="alfawz-daily-modal__message"><?php esc_html_e( 'You reached today\'s 10-verse milestone. Keep the momentum going!', 'alfawzquran' ); ?></p>
            <button type="button" class="alfawz-button" data-dismiss-daily>
                <span>🎉</span>
                <span><?php esc_html_e( 'Continue reading', 'alfawzquran' ); ?></span>
            </button>
        </div>
    </div>
</div>

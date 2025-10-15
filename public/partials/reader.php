<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-reader" class="alfawz-reader-shell alfawz-no-scrollbar relative min-h-screen overflow-x-hidden px-4 pb-16 pt-12 sm:px-6">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header class="alfawz-reader-hero text-center">
            <p class="alfawz-reader-kicker"><?php esc_html_e( 'Student Quran Reader', 'alfawzquran' ); ?></p>
            <h1 class="alfawz-reader-title"><?php esc_html_e( 'Immerse in your recitation flow', 'alfawzquran' ); ?></h1>
            <p class="alfawz-reader-lead"><?php esc_html_e( 'Choose a surah, glide through verses, and let every ayah resonate with beauty and clarity.', 'alfawzquran' ); ?></p>
        </header>

        <div class="alfawz-reader-card" aria-live="polite" aria-busy="true">
            <div id="alfawz-confetti-host" class="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true"></div>
            <div id="alfawz-verse-loader" class="alfawz-reader-loader">
                <?php esc_html_e( 'Select a surah and verse to begin your recitation.', 'alfawzquran' ); ?>
            </div>

            <article id="alfawz-verse-container" class="alfawz-reader-stage hidden" aria-labelledby="alfawz-verse-heading">
                <div id="alfawz-egg-widget" class="alfawz-reader-egg" aria-live="polite">
                    <div id="alfawz-egg-emoji" class="alfawz-egg-emoji" role="img" aria-label="<?php esc_attr_e( 'Egg progress', 'alfawzquran' ); ?>">🥚</div>
                    <div class="alfawz-meter" role="presentation">
                        <div id="alfawz-egg-progress-bar" class="alfawz-meter__bar" style="width:0%"></div>
                    </div>
                    <span id="alfawz-egg-count" class="alfawz-egg-count">0 / 0</span>
                    <p id="alfawz-egg-message" class="alfawz-egg-message"><?php esc_html_e( 'Keep reading to hatch the surprise.', 'alfawzquran' ); ?></p>
                </div>

                <button type="button" id="alfawz-prev-verse" class="alfawz-verse-nav alfawz-verse-nav--prev" aria-label="<?php esc_attr_e( 'Previous verse', 'alfawzquran' ); ?>" disabled>
                    <span aria-hidden="true">◁</span>
                </button>
                <button type="button" id="alfawz-next-verse" class="alfawz-verse-nav alfawz-verse-nav--next" aria-label="<?php esc_attr_e( 'Next verse', 'alfawzquran' ); ?>" disabled>
                    <span aria-hidden="true">▷</span>
                </button>

                <header class="alfawz-verse-header">
                    <p id="alfawz-verse-meta" class="alfawz-verse-meta"></p>
                    <h3 id="alfawz-verse-heading" class="alfawz-verse-heading"></h3>
                </header>

                <div id="alfawz-verse-content" class="alfawz-verse-content">
                    <p id="alfawz-arabic-text" class="alfawz-verse-arabic" dir="rtl" lang="ar"></p>
                    <p id="alfawz-transliteration" class="alfawz-verse-transliteration"></p>
                    <p id="alfawz-translation" class="alfawz-verse-translation"></p>
                </div>

                <div class="alfawz-verse-actions" aria-live="polite">
                    <button type="button" id="alfawz-verse-audio" class="alfawz-audio-button" aria-describedby="alfawz-verse-meta" disabled>
                        <span id="alfawz-verse-audio-icon" class="alfawz-audio-icon" aria-hidden="true">▶️</span>
                        <span id="alfawz-verse-audio-label" class="alfawz-audio-label"><?php esc_html_e( 'Play verse audio', 'alfawzquran' ); ?></span>
                    </button>
                    <button type="button" id="alfawz-surah-toggle" class="alfawz-toggle" role="switch" aria-checked="false" aria-disabled="true" disabled>
                        <span class="sr-only"><?php esc_html_e( 'Toggle full surah display', 'alfawzquran' ); ?></span>
                        <span class="alfawz-toggle__track" aria-hidden="true">
                            <span class="alfawz-toggle__thumb"></span>
                        </span>
                        <span class="alfawz-toggle__text">
                            <span class="alfawz-toggle__label"><?php esc_html_e( 'Surah display', 'alfawzquran' ); ?></span>
                            <span id="alfawz-surah-toggle-state" class="alfawz-toggle__state"><?php esc_html_e( 'Off', 'alfawzquran' ); ?></span>
                        </span>
                    </button>
                </div>

                <section class="alfawz-daily" aria-live="polite">
                    <div class="alfawz-meter" role="presentation">
                        <div id="alfawz-daily-progress-bar" class="alfawz-meter__bar" style="width:0%"></div>
                    </div>
                    <span id="alfawz-daily-label" class="alfawz-daily-label">0 / 10 Verses Today</span>
                    <p id="alfawz-daily-note" class="alfawz-daily-note"></p>
                </section>
            </article>

            <section id="alfawz-surah-list-wrapper" class="alfawz-surah-wrapper hidden" aria-live="polite">
                <header class="alfawz-surah-header">
                    <h4 class="alfawz-surah-title"><?php esc_html_e( 'Full Surah View', 'alfawzquran' ); ?></h4>
                    <p class="alfawz-surah-subtitle"><?php esc_html_e( 'Scroll to absorb every ayah or tap one to focus above.', 'alfawzquran' ); ?></p>
                </header>
                <div id="alfawz-surah-list-loader" class="alfawz-surah-loader"><?php esc_html_e( 'Loading the full surah…', 'alfawzquran' ); ?></div>
                <div id="alfawz-surah-list" class="alfawz-surah-list hidden" data-testid="alfawz-surah-list"></div>
            </section>
        </div>

        <div class="alfawz-selector-card" aria-labelledby="alfawz-reader-label">
            <div class="alfawz-selector-header">
                <h2 id="alfawz-reader-label" class="alfawz-selector-title"><?php esc_html_e( 'Select a surah and ayah', 'alfawzquran' ); ?></h2>
                <p class="alfawz-selector-note"><?php esc_html_e( 'Build your flow by pairing a surah with a verse, then glide using the arrows or full view.', 'alfawzquran' ); ?></p>
            </div>
            <div class="mt-6 grid gap-5 sm:grid-cols-2">
                <label class="alfawz-selector-field">
                    <span class="alfawz-selector-label"><?php esc_html_e( 'Surah', 'alfawzquran' ); ?></span>
                    <select id="alfawz-surah-select" class="alfawz-selector-input">
                        <option value=""><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></option>
                    </select>
                </label>
                <label class="alfawz-selector-field">
                    <span class="alfawz-selector-label"><?php esc_html_e( 'Verse', 'alfawzquran' ); ?></span>
                    <select id="alfawz-verse-select" class="alfawz-selector-input" disabled>
                        <option value=""><?php esc_html_e( 'Select a surah first', 'alfawzquran' ); ?></option>
                    </select>
                </label>
            </div>
        </div>
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

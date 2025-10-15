<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-reader" class="alfawz-reader-shell alfawz-no-scrollbar bg-amber-50 min-h-screen px-4 pt-8 sm:px-6">
    <div class="relative mx-auto max-w-2xl rounded-xl bg-white bg-opacity-90 px-4 py-8 shadow-sm sm:px-6 alfawz-glass" aria-live="polite" aria-busy="true">
        <div id="alfawz-confetti-host" class="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true"></div>
        <div id="alfawz-verse-loader" class="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 bg-opacity-80 px-4 py-16 text-center text-base text-emerald-700">
            <?php esc_html_e( 'Select a surah and verse to begin your recitation.', 'alfawzquran' ); ?>
        </div>
        <article id="alfawz-verse-container" class="relative hidden" aria-labelledby="alfawz-verse-heading">
            <div id="alfawz-egg-widget" class="flex flex-col items-center mb-6 animate-fade-in" aria-live="polite">
                <div id="alfawz-egg-emoji" class="text-4xl mb-2" role="img" aria-label="<?php esc_attr_e( 'Egg progress', 'alfawzquran' ); ?>">🥚</div>
                <div class="w-full bg-gray-200 rounded-full h-2 mb-1 overflow-hidden">
                    <div id="alfawz-egg-progress-bar" class="h-2 rounded-full bg-amber-500 transition-all duration-500 ease-out" style="width:0%"></div>
                </div>
                <span id="alfawz-egg-count" class="text-sm text-gray-600">0 / 0</span>
                <p id="alfawz-egg-message" class="mt-1 text-xs text-amber-600 text-center"><?php esc_html_e( 'Keep reading to hatch the surprise.', 'alfawzquran' ); ?></p>
            </div>

            <div class="pointer-events-none absolute right-6 top-6 text-right" aria-live="polite">
                <span class="block text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-500"><?php esc_html_e( 'Hasanat', 'alfawzquran' ); ?></span>
                <span class="text-xl font-bold text-emerald-700" data-hasanat-total>0</span>
            </div>

            <button type="button" id="alfawz-prev-verse" class="alfawz-verse-nav absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 transform items-center justify-center rounded-full bg-black bg-opacity-10 text-2xl text-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-opacity-20" aria-label="<?php esc_attr_e( 'Previous verse', 'alfawzquran' ); ?>" disabled>◁</button>
            <button type="button" id="alfawz-next-verse" class="alfawz-verse-nav absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 transform items-center justify-center rounded-full bg-black bg-opacity-10 text-2xl text-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-opacity-20" aria-label="<?php esc_attr_e( 'Next verse', 'alfawzquran' ); ?>" disabled>▷</button>

            <header class="space-y-2 text-center">
                <p id="alfawz-verse-meta" class="text-xs font-semibold uppercase text-emerald-700 alfawz-tracking-wide"></p>
                <h3 id="alfawz-verse-heading" class="text-2xl font-semibold text-emerald-900"></h3>
            </header>

            <div id="alfawz-verse-content" class="mt-6 rounded-lg bg-emerald-50 px-4 py-6 text-center shadow-inner alfawz-verse-panel">
                <p id="alfawz-arabic-text" class="font-arabic text-4xl leading-relaxed text-emerald-900 sm:text-5xl" dir="rtl" lang="ar"></p>
                <p id="alfawz-transliteration" class="text-lg text-gray-700 mt-2"></p>
                <p id="alfawz-translation" class="text-base italic text-gray-600 mt-1"></p>
            </div>

            <section class="mt-6 text-center" aria-live="polite">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-1 overflow-hidden">
                    <div id="alfawz-daily-progress-bar" class="h-2 rounded-full bg-emerald-500 transition-all duration-500 ease-out" style="width:0%"></div>
                </div>
                <span id="alfawz-daily-label" class="text-xs text-gray-500">0 / 10 Verses Today</span>
                <p id="alfawz-daily-note" class="mt-1 text-xs text-emerald-700"></p>
            </section>
        </article>
    </div>

    <div class="mx-auto mt-8 max-w-2xl rounded-xl bg-white bg-opacity-90 p-4 shadow-sm sm:p-6 alfawz-glass" aria-labelledby="alfawz-reader-label">
        <h2 id="alfawz-reader-label" class="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            <?php esc_html_e( 'Select a surah and ayah', 'alfawzquran' ); ?>
        </h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <label class="flex flex-col">
                <span class="text-sm font-medium text-emerald-800"><?php esc_html_e( 'Surah', 'alfawzquran' ); ?></span>
                <select id="alfawz-surah-select" class="mt-2 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-base text-emerald-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    <option value=""><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></option>
                </select>
            </label>
            <label class="flex flex-col">
                <span class="text-sm font-medium text-emerald-800"><?php esc_html_e( 'Verse', 'alfawzquran' ); ?></span>
                <select id="alfawz-verse-select" class="mt-2 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-base text-emerald-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400" disabled>
                    <option value=""><?php esc_html_e( 'Select a surah first', 'alfawzquran' ); ?></option>
                </select>
            </label>
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

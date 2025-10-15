<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-reader" class="alfawz-surface mx-auto max-w-4xl space-y-6 rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100/70 backdrop-blur">
    <header class="space-y-1 text-slate-900">
        <p class="text-sm font-medium tracking-wide text-emerald-600"><?php esc_html_e( 'Immersive Quran Reader', 'alfawzquran' ); ?></p>
        <h2 class="text-2xl font-semibold leading-tight"><?php esc_html_e( 'Navigate ayat with a tap', 'alfawzquran' ); ?></h2>
        <p class="text-sm text-slate-600"><?php esc_html_e( 'Use the controls below to step through verses, listen to recitation, and log your progress instantly.', 'alfawzquran' ); ?></p>
    </header>

    <section class="grid gap-4 md:grid-cols-2" aria-labelledby="alfawz-reader-controls">
        <h3 id="alfawz-reader-controls" class="sr-only"><?php esc_html_e( 'Surah and verse selection', 'alfawzquran' ); ?></h3>
        <label class="alfawz-field">
            <span class="alfawz-field-label"><?php esc_html_e( 'Choose a surah', 'alfawzquran' ); ?></span>
            <select id="alfawz-reader-surah" class="alfawz-select">
                <option value=""><?php esc_html_e( 'Loading surahs…', 'alfawzquran' ); ?></option>
            </select>
        </label>
        <label class="alfawz-field">
            <span class="alfawz-field-label"><?php esc_html_e( 'Choose a verse', 'alfawzquran' ); ?></span>
            <select id="alfawz-reader-verse" class="alfawz-select" disabled>
                <option value=""><?php esc_html_e( 'Select a surah first', 'alfawzquran' ); ?></option>
            </select>
        </label>
        <label class="alfawz-switch md:col-span-2">
            <input type="checkbox" id="alfawz-toggle-translation" checked>
            <span class="alfawz-switch-control" aria-hidden="true"></span>
            <span class="alfawz-switch-label"><?php esc_html_e( 'Show translation', 'alfawzquran' ); ?></span>
        </label>
    </section>

    <section class="space-y-4" aria-live="polite" aria-busy="true">
        <div id="alfawz-reader-loading" class="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-center text-sm text-emerald-700">
            <?php esc_html_e( 'Select a surah and verse to begin reading.', 'alfawzquran' ); ?>
        </div>
        <article id="alfawz-reader-card" class="hidden rounded-3xl bg-white p-6 shadow-lg shadow-emerald-100/60">
            <header class="flex flex-wrap items-center justify-between gap-2">
                <h3 class="text-lg font-semibold text-slate-900" id="alfawz-reader-heading"></h3>
                <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700" id="alfawz-reader-session"></span>
            </header>
            <div class="mt-4 flex flex-col gap-4">
                <p id="alfawz-reader-arabic" class="text-right text-2xl leading-relaxed tracking-wide text-slate-900" dir="rtl" lang="ar"></p>
                <p id="alfawz-reader-translation" class="text-base leading-relaxed text-slate-600"></p>
            </div>
            <footer class="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div class="flex gap-2">
                    <button type="button" class="alfawz-circle" id="alfawz-reader-prev" aria-label="<?php esc_attr_e( 'Previous verse', 'alfawzquran' ); ?>" disabled>◀</button>
                    <button type="button" class="alfawz-circle" id="alfawz-reader-next" aria-label="<?php esc_attr_e( 'Next verse', 'alfawzquran' ); ?>" disabled>▶</button>
                </div>
                <div class="flex flex-wrap gap-3">
                    <button type="button" class="alfawz-button" id="alfawz-reader-audio">
                        <span>🔊</span>
                        <span><?php esc_html_e( 'Play audio', 'alfawzquran' ); ?></span>
                    </button>
                    <button type="button" class="alfawz-button" id="alfawz-reader-mark">
                        <span>✅</span>
                        <span><?php esc_html_e( 'Mark as read', 'alfawzquran' ); ?></span>
                    </button>
                    <button type="button" class="alfawz-button" id="alfawz-reader-bookmark">
                        <span>🔖</span>
                        <span><?php esc_html_e( 'Bookmark', 'alfawzquran' ); ?></span>
                    </button>
                </div>
            </footer>
        </article>
    </section>

    <section class="grid gap-4 md:grid-cols-2" aria-labelledby="alfawz-reader-metrics">
        <h3 id="alfawz-reader-metrics" class="sr-only"><?php esc_html_e( 'Reader metrics', 'alfawzquran' ); ?></h3>
        <article class="alfawz-card" id="alfawz-hasanat-card">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( 'Hasanat for this verse', 'alfawzquran' ); ?></p>
            <p class="mt-3 text-3xl font-semibold text-slate-900" id="alfawz-reader-hasanat">0</p>
            <p class="text-xs text-slate-500" id="alfawz-reader-hasanat-note"></p>
        </article>
        <article class="alfawz-card" id="alfawz-verse-goal">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( '10 verse goal', 'alfawzquran' ); ?></p>
            <div class="mt-3 h-2 rounded-full bg-slate-200">
                <div id="alfawz-goal-progress" class="h-2 rounded-full bg-emerald-500 transition-all" style="width:0%"></div>
            </div>
            <p class="mt-3 text-xs text-slate-500" id="alfawz-goal-note"></p>
        </article>
    </section>

    <section class="rounded-3xl border border-amber-100 bg-amber-50/70 p-5" aria-labelledby="alfawz-egg-heading">
        <div class="flex items-center justify-between">
            <div>
                <h3 id="alfawz-egg-heading" class="text-lg font-semibold text-amber-800"><?php esc_html_e( 'Egg challenge', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-amber-700" id="alfawz-egg-description"><?php esc_html_e( 'Read together as a family or class to hatch the golden egg.', 'alfawzquran' ); ?></p>
            </div>
            <span class="text-3xl" role="img" aria-hidden="true">🥚</span>
        </div>
        <div class="mt-4 h-2 rounded-full bg-white/80">
            <div id="alfawz-egg-progress" class="h-2 rounded-full bg-amber-500 transition-all" style="width:0%"></div>
        </div>
        <p class="mt-2 text-xs font-medium uppercase tracking-wide text-amber-700" id="alfawz-egg-status"></p>
        <button type="button" class="alfawz-link mt-3 text-sm font-semibold text-amber-700" id="alfawz-egg-cheer">
            <?php esc_html_e( 'Celebrate the latest milestone', 'alfawzquran' ); ?>
        </button>
    </section>
</div>

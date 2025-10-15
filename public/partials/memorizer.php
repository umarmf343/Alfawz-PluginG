<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-memorizer" class="alfawz-surface mx-auto max-w-4xl space-y-8 rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100/70 backdrop-blur">
    <header class="space-y-1 text-slate-900">
        <p class="text-sm font-medium tracking-wide text-emerald-600"><?php esc_html_e( 'Memorisation Studio', 'alfawzquran' ); ?></p>
        <h2 class="text-2xl font-semibold leading-tight"><?php esc_html_e( 'Repeat each ayah twenty times to seal it in your heart', 'alfawzquran' ); ?></h2>
        <p class="text-sm text-slate-600"><?php esc_html_e( 'Choose an ayah, focus on tajwid, and let the counter guide you through 20 deliberate repetitions.', 'alfawzquran' ); ?></p>
    </header>

    <section class="grid gap-4 md:grid-cols-2" aria-labelledby="alfawz-memorizer-selection">
        <h3 id="alfawz-memorizer-selection" class="sr-only"><?php esc_html_e( 'Memorisation verse selection', 'alfawzquran' ); ?></h3>
        <label class="alfawz-field">
            <span class="alfawz-field-label"><?php esc_html_e( 'Choose a surah', 'alfawzquran' ); ?></span>
            <select id="alfawz-memo-surah" class="alfawz-select">
                <option value=""><?php esc_html_e( 'Loading surahs…', 'alfawzquran' ); ?></option>
            </select>
        </label>
        <label class="alfawz-field">
            <span class="alfawz-field-label"><?php esc_html_e( 'Choose a verse', 'alfawzquran' ); ?></span>
            <select id="alfawz-memo-verse" class="alfawz-select" disabled>
                <option value=""><?php esc_html_e( 'Select a surah first', 'alfawzquran' ); ?></option>
            </select>
        </label>
        <div class="md:col-span-2 flex flex-wrap items-center gap-3">
            <button type="button" class="alfawz-button" id="alfawz-memo-load" disabled>
                <span>🚀</span>
                <span><?php esc_html_e( 'Load verse', 'alfawzquran' ); ?></span>
            </button>
            <p class="text-xs text-slate-500" id="alfawz-memo-selection-note"></p>
        </div>
    </section>

    <section id="alfawz-memo-session" class="hidden space-y-6">
        <article class="rounded-3xl bg-white p-6 shadow-lg shadow-emerald-100/60">
            <header class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( 'Currently memorising', 'alfawzquran' ); ?></p>
                    <h3 class="text-lg font-semibold text-slate-900" id="alfawz-memo-heading"></h3>
                </div>
                <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700" id="alfawz-memo-repetition-label">0 / 20</span>
            </header>
            <div class="mt-4 space-y-4">
                <p id="alfawz-memo-arabic" class="text-right text-2xl leading-relaxed tracking-wide text-slate-900" dir="rtl" lang="ar"></p>
                <p id="alfawz-memo-translation" class="text-base leading-relaxed text-slate-600"></p>
            </div>
            <footer class="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div class="flex gap-2">
                    <button type="button" class="alfawz-circle" id="alfawz-memo-prev" aria-label="<?php esc_attr_e( 'Previous verse', 'alfawzquran' ); ?>" disabled>◀</button>
                    <button type="button" class="alfawz-circle" id="alfawz-memo-next" aria-label="<?php esc_attr_e( 'Next verse', 'alfawzquran' ); ?>" disabled>▶</button>
                </div>
                <div class="flex flex-wrap gap-3">
                    <button type="button" class="alfawz-button" id="alfawz-memo-repeat">
                        <span>🔁</span>
                        <span><?php esc_html_e( 'Repeat verse', 'alfawzquran' ); ?></span>
                    </button>
                    <button type="button" class="alfawz-button" id="alfawz-memo-audio">
                        <span>🎧</span>
                        <span><?php esc_html_e( 'Play slow recitation', 'alfawzquran' ); ?></span>
                    </button>
                    <button type="button" class="alfawz-button" id="alfawz-memo-complete" disabled>
                        <span>🌟</span>
                        <span><?php esc_html_e( 'Mark memorised', 'alfawzquran' ); ?></span>
                    </button>
                </div>
            </footer>
        </article>

        <article class="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 class="text-base font-semibold text-emerald-800"><?php esc_html_e( '20x repetition tracker', 'alfawzquran' ); ?></h3>
                    <p class="text-sm text-emerald-700"><?php esc_html_e( 'Tap the repeat button to advance the counter. The verse unlocks after 20 repetitions.', 'alfawzquran' ); ?></p>
                </div>
                <span class="rounded-full bg-white px-3 py-1 text-sm font-semibold text-emerald-700" id="alfawz-memo-counter">0</span>
            </div>
            <div class="mt-4 h-2 rounded-full bg-white/70">
                <div id="alfawz-memo-progress" class="h-2 rounded-full bg-emerald-500 transition-all" style="width:0%"></div>
            </div>
            <p class="mt-3 text-xs uppercase tracking-wide text-emerald-700" id="alfawz-memo-progress-note"></p>
        </article>

        <article class="rounded-3xl bg-slate-50/80 p-6" id="alfawz-memo-journal">
            <h3 class="text-base font-semibold text-slate-900"><?php esc_html_e( 'Reflection journal', 'alfawzquran' ); ?></h3>
            <p class="mt-1 text-sm text-slate-600"><?php esc_html_e( 'Capture tajwid notes and teaching feedback to review later.', 'alfawzquran' ); ?></p>
            <textarea id="alfawz-memo-notes" class="alfawz-textarea mt-4" rows="4" placeholder="<?php esc_attr_e( 'Record pronunciation notes or memorisation tips…', 'alfawzquran' ); ?>"></textarea>
            <div class="mt-3 flex flex-wrap gap-3">
                <button type="button" class="alfawz-button" id="alfawz-memo-save">
                    <span>💾</span>
                    <span><?php esc_html_e( 'Save notes', 'alfawzquran' ); ?></span>
                </button>
                <p class="text-xs text-slate-500" id="alfawz-memo-save-status"></p>
            </div>
        </article>
    </section>

    <section class="space-y-4" aria-labelledby="alfawz-memo-plans">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 id="alfawz-memo-plans" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Memorisation plans', 'alfawzquran' ); ?></h3>
            <button type="button" class="alfawz-link text-sm font-semibold text-emerald-600" id="alfawz-memo-refresh">
                <?php esc_html_e( 'Refresh', 'alfawzquran' ); ?>
            </button>
        </div>
        <ul id="alfawz-memo-plan-list" class="space-y-3" aria-live="polite" aria-busy="true"></ul>
    </section>
</div>

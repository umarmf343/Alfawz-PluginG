<?php
if (! defined('ABSPATH')) {
    exit;
}
?>
<div id="alfawz-reader" class="alfawz-reader-wrapper relative mx-auto max-w-4xl px-4 pb-safe text-center">
    <div class="space-y-6">
        <header class="space-y-2">
            <p class="text-sm font-semibold uppercase tracking-widest text-emerald-600"><?php esc_html_e('Alfawz Quran Reader', 'alfawzquran'); ?></p>
            <h1 class="text-3xl font-semibold text-slate-900"><?php esc_html_e('Flow through the Qur’an one ayah at a time', 'alfawzquran'); ?></h1>
            <p class="text-sm text-slate-600"><?php esc_html_e('Choose a surah and verse to begin. Progress, egg challenge, and daily goals update as you read.', 'alfawzquran'); ?></p>
        </header>

        <div id="verse-container" class="alfawz-reader-card relative overflow-hidden rounded-3xl bg-white/95 p-6 shadow-2xl shadow-emerald-800/10">
            <div id="egg-challenge" class="alfawz-egg-widget mx-auto mb-6 max-w-md rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-5 text-center">
                <p class="text-sm font-semibold uppercase tracking-widest text-amber-700"><?php esc_html_e('Break the Egg', 'alfawzquran'); ?></p>
                <div class="mt-3 flex items-center justify-center gap-3 text-4xl" aria-live="polite">
                    <span id="egg-icon" role="img" aria-label="egg">🥚</span>
                    <span class="text-base font-semibold text-amber-800" id="egg-count">0 / 0</span>
                </div>
                <div class="alfawz-progress-bar mt-3">
                    <div id="egg-progress" class="alfawz-progress-fill bg-amber-500" style="width:0%"></div>
                </div>
                <p class="mt-2 text-xs text-amber-700" id="egg-note"><?php esc_html_e('Read verses to hatch the egg.', 'alfawzquran'); ?></p>
            </div>

            <button id="prev-verse" type="button" class="alfawz-nav-button left-0" aria-label="<?php esc_attr_e('Previous verse', 'alfawzquran'); ?>">◁</button>
            <button id="next-verse" type="button" class="alfawz-nav-button right-0" aria-label="<?php esc_attr_e('Next verse', 'alfawzquran'); ?>">▷</button>

            <div class="space-y-4 px-6 py-4 sm:px-12">
                <p id="verse-heading" class="text-sm font-semibold uppercase tracking-widest text-emerald-700"><?php esc_html_e('Select a verse to begin', 'alfawzquran'); ?></p>
                <div id="verse-loader" class="mx-auto max-w-md text-sm text-slate-500"><?php esc_html_e('Waiting for your selection…', 'alfawzquran'); ?></div>
                <div id="verse-content" class="space-y-4" hidden>
                    <p id="arabic-text" class="text-balance text-3xl leading-loose tracking-wide text-slate-900" dir="rtl" lang="ar"></p>
                    <p id="transliteration" class="text-lg font-medium leading-relaxed text-slate-700"></p>
                    <p id="translation" class="text-base leading-relaxed text-slate-600"></p>
                </div>
            </div>

            <div id="daily-tracker" class="alfawz-daily-widget mx-auto mt-6 max-w-md rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-5 text-center">
                <p class="text-sm font-semibold uppercase tracking-widest text-emerald-700"><?php esc_html_e('Daily 10-verse tracker', 'alfawzquran'); ?></p>
                <p class="mt-2 text-lg font-semibold text-emerald-900" id="daily-count">0 / 10</p>
                <div class="alfawz-progress-bar mt-3">
                    <div id="daily-progress" class="alfawz-progress-fill bg-emerald-500" style="width:0%"></div>
                </div>
                <p class="mt-2 text-xs text-emerald-700" id="daily-note"><?php esc_html_e('Each next tap counts towards today’s goal.', 'alfawzquran'); ?></p>
            </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
            <label class="text-left">
                <span class="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500"><?php esc_html_e('Surah', 'alfawzquran'); ?></span>
                <select id="surah-select" class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base font-medium text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                    <option value=""><?php esc_html_e('Loading…', 'alfawzquran'); ?></option>
                </select>
            </label>
            <label class="text-left">
                <span class="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500"><?php esc_html_e('Verse', 'alfawzquran'); ?></span>
                <select id="verse-select" class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base font-medium text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" disabled>
                    <option value=""><?php esc_html_e('Choose a surah first', 'alfawzquran'); ?></option>
                </select>
            </label>
        </div>
    </div>

    <div id="reader-modal" class="alfawz-modal" role="dialog" aria-modal="true" aria-hidden="true">
        <div class="alfawz-modal-backdrop"></div>
        <div class="alfawz-modal-content">
            <div class="space-y-4 text-center">
                <div class="flex justify-center" aria-hidden="true">
                    <span class="text-5xl">🎉</span>
                </div>
                <h2 id="modal-title" class="text-2xl font-semibold text-slate-900"></h2>
                <p id="modal-message" class="text-base text-slate-600"></p>
                <button type="button" id="modal-close" class="alfawz-modal-close"><?php esc_html_e('Keep reading', 'alfawzquran'); ?></button>
            </div>
        </div>
    </div>
</div>

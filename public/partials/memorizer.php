<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-memorization" class="bg-amber-50 pb-[120px]">
    <div class="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section aria-labelledby="alfawz-memorization-start-title" class="space-y-6 text-center">
            <header class="mx-auto max-w-3xl space-y-2">
                <p class="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600"><?php esc_html_e( 'Sacred Repetition Practice', 'alfawzquran' ); ?></p>
                <h2 id="alfawz-memorization-start-title" class="text-3xl font-semibold text-slate-900 sm:text-4xl">
                    <?php esc_html_e( 'Build a spiritually uplifting 20x memorization journey.', 'alfawzquran' ); ?>
                </h2>
                <p class="text-sm text-slate-600 sm:text-base">
                    <?php esc_html_e( 'Select your surah and ayah range to begin a focused loop of remembrance.', 'alfawzquran' ); ?>
                </p>
            </header>

            <form id="alfawz-memorization-form" class="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-2xl bg-white/90 p-6 text-left shadow-xl shadow-emerald-100/50">
                <div class="text-4xl text-emerald-600">🧠</div>
                <h3 class="text-xl font-semibold text-slate-900">
                    <?php esc_html_e( 'Start Your Memorization Journey', 'alfawzquran' ); ?>
                </h3>
                <p class="text-sm text-slate-600">
                    <?php esc_html_e( 'Choose a surah and define the verses you wish to weave into your heart.', 'alfawzquran' ); ?>
                </p>
                <div class="grid gap-3 sm:grid-cols-2">
                    <label class="flex flex-col gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                        <span><?php esc_html_e( 'Surah', 'alfawzquran' ); ?></span>
                        <select id="alfawz-memorization-surah" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" required>
                            <option value="" selected disabled><?php esc_html_e( 'Loading surahs…', 'alfawzquran' ); ?></option>
                        </select>
                    </label>
                    <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        <span><?php esc_html_e( 'From Ayah', 'alfawzquran' ); ?></span>
                        <input type="number" id="alfawz-memorization-start" min="1" class="w-full rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="1" required />
                    </label>
                    <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        <span><?php esc_html_e( 'To Ayah', 'alfawzquran' ); ?></span>
                        <input type="number" id="alfawz-memorization-end" min="1" class="w-full rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="5" required />
                    </label>
                </div>
                <button type="submit" id="alfawz-memorization-begin" class="mt-2 w-full rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white shadow-lg transition transform hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-emerald-400">
                    <?php esc_html_e( 'Begin Memorizing', 'alfawzquran' ); ?>
                </button>
                <p id="alfawz-memorization-form-status" class="text-sm text-slate-600"></p>
            </form>
        </section>

        <section id="alfawz-memorization-empty" class="mx-auto hidden max-w-md rounded-2xl border border-amber-100 bg-white/90 p-6 text-center shadow-sm">
            <div class="text-4xl mb-4">🧠</div>
            <h3 class="text-xl font-bold text-gray-800 mb-3"><?php esc_html_e( 'Start Your Memorization Journey', 'alfawzquran' ); ?></h3>
            <p class="text-gray-600 mb-4">
                <?php esc_html_e( 'Select a Surah and verse range to begin.', 'alfawzquran' ); ?>
            </p>
            <p class="text-sm text-gray-500">
                <?php esc_html_e( 'Sacred repetition transforms verses into living memory. Begin a plan to unlock your loop.', 'alfawzquran' ); ?>
            </p>
        </section>

        <section id="alfawz-memorization-active" class="hidden space-y-10">
            <header class="text-center">
                <p class="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600" id="alfawz-memorization-plan-label"></p>
                <h3 class="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl" id="alfawz-memorization-plan-title"></h3>
                <p class="mt-2 text-sm text-slate-600 sm:text-base" id="alfawz-memorization-plan-range"></p>
                <div class="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-5 py-2 text-sm font-semibold text-emerald-700" id="alfawz-memorization-plan-progress"></div>
            </header>

            <div class="mb-4 text-center">
                <div class="text-5xl mb-3">🧠</div>
                <div class="mx-auto h-3 w-full max-w-2xl rounded-full bg-gray-200">
                    <div id="progress-bar" class="h-3 rounded-full bg-emerald-500 shadow-inner transition-all duration-500" style="width: 0%"></div>
                </div>
                <div id="counter" class="mt-2 text-lg font-medium text-gray-700">0 / 20 <?php esc_html_e( 'Repetitions', 'alfawzquran' ); ?></div>
            </div>

            <article class="memorization-verse-shell mx-auto max-w-2xl rounded-2xl border border-amber-100 bg-white/95 px-4 py-10 shadow-sm sm:px-8">
                <div class="text-center">
                    <p class="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600"><?php esc_html_e( 'Current Verse', 'alfawzquran' ); ?></p>
                    <p id="alfawz-memorization-ayah-ar" class="alfawz-verse-arabic text-center text-4xl leading-relaxed tracking-wide text-slate-900 sm:text-5xl" dir="rtl" lang="ar"></p>
                    <p id="alfawz-memorization-ayah-transliteration" class="hidden text-lg text-gray-700 mt-3"></p>
                    <p id="alfawz-memorization-ayah-translation" class="text-base italic text-gray-600 mt-2"></p>
                </div>
                <div class="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                    <p id="progress-note" class="text-sm font-medium text-emerald-700"><?php esc_html_e( 'Tap repeat to begin your twenty-fold focus session.', 'alfawzquran' ); ?></p>
                    <button type="button" id="alfawz-memorization-toggle-translation" class="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:scale-105 hover:border-emerald-200 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                        🔁 <?php esc_html_e( 'Hide translation', 'alfawzquran' ); ?>
                    </button>
                </div>
                <button type="button" id="repeat-btn" class="mt-6 w-full rounded-xl bg-emerald-600 py-4 text-xl font-bold text-white shadow-md transition transform hover:scale-105 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-emerald-400">
                    <?php esc_html_e( 'Repeat Verse', 'alfawzquran' ); ?>
                </button>
                <p id="alfawz-memorization-repetitions" class="mt-4 text-center text-base font-medium text-slate-700">0 / 20 <?php esc_html_e( 'Repetitions', 'alfawzquran' ); ?></p>
            </article>

            <section id="alfawz-memorization-stats" class="grid grid-cols-1 gap-4 text-slate-900 sm:grid-cols-2">
                <div class="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-100">
                    <p class="text-sm text-emerald-600"><?php esc_html_e( 'Total Verses', 'alfawzquran' ); ?></p>
                    <p id="alfawz-memorization-stat-total" class="mt-1 text-2xl font-semibold">0</p>
                </div>
                <div class="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-100">
                    <p class="text-sm text-emerald-600"><?php esc_html_e( 'Memorized', 'alfawzquran' ); ?></p>
                    <p id="alfawz-memorization-stat-memorized" class="mt-1 text-2xl font-semibold">0</p>
                </div>
                <div class="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-100">
                    <p class="text-sm text-emerald-600"><?php esc_html_e( 'Remaining', 'alfawzquran' ); ?></p>
                    <p id="alfawz-memorization-stat-remaining" class="mt-1 text-2xl font-semibold">0</p>
                </div>
                <div class="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-100">
                    <p class="text-sm text-emerald-600"><?php esc_html_e( 'Completion', 'alfawzquran' ); ?></p>
                    <p id="alfawz-memorization-stat-completion" class="mt-1 text-2xl font-semibold">0%</p>
                </div>
            </section>
            <p id="alfawz-memorization-active-status" class="text-center text-sm text-slate-600"></p>
        </section>
    </div>

    <div id="celebration-modal" class="fixed inset-0 hidden items-center justify-center bg-black/60 p-4 text-center">
        <div class="celebration-card relative max-w-sm rounded-2xl bg-white p-8 shadow-2xl animate-pop-in">
            <div class="alfawz-confetti-burst" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="text-6xl mb-4">🎉</div>
            <h2 class="text-2xl font-bold text-emerald-800 mb-2"><?php esc_html_e( 'MashaAllah!', 'alfawzquran' ); ?></h2>
            <p class="text-gray-700 mb-4"><?php esc_html_e( 'You have firmly memorized this verse through 20 repetitions.', 'alfawzquran' ); ?></p>
            <p class="text-amber-700 font-medium mb-6"><?php esc_html_e( 'Barakallahu Feek — May Allah preserve it in your heart.', 'alfawzquran' ); ?></p>
            <div class="flex flex-col gap-3">
                <button id="next-verse-btn" class="bg-emerald-600 text-white py-3 rounded-lg font-medium shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                    <?php esc_html_e( 'Continue to Next Verse', 'alfawzquran' ); ?>
                </button>
                <button id="review-later" class="text-gray-600 py-2 font-medium transition hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-100">
                    <?php esc_html_e( 'Review Later', 'alfawzquran' ); ?>
                </button>
            </div>
        </div>
    </div>
</div>

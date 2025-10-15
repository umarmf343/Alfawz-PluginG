<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-memorization" class="mx-auto flex max-w-4xl flex-col gap-8 rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100/70 backdrop-blur">
    <section aria-labelledby="alfawz-memorization-start-title" class="space-y-4">
        <header class="space-y-1 text-slate-900">
            <p class="text-sm font-semibold uppercase tracking-wide text-emerald-600"><?php esc_html_e( 'Start Memorization Journey', 'alfawzquran' ); ?></p>
            <h2 id="alfawz-memorization-start-title" class="text-2xl font-semibold leading-tight"><?php esc_html_e( 'Build a consistent 20x repetition habit for every ayah.', 'alfawzquran' ); ?></h2>
            <p class="text-sm text-slate-600"><?php esc_html_e( 'Select your surah and ayah range to craft a focused plan.', 'alfawzquran' ); ?></p>
        </header>
        <form id="alfawz-memorization-form" class="flex flex-wrap items-end gap-4 rounded-2xl bg-white/70 p-4 shadow-inner">
            <label class="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
                <span class="font-medium text-slate-700"><?php esc_html_e( 'Surah', 'alfawzquran' ); ?></span>
                <select id="alfawz-memorization-surah" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" required>
                    <option value="" selected disabled><?php esc_html_e( 'Loading surahs…', 'alfawzquran' ); ?></option>
                </select>
            </label>
            <label class="flex w-full min-w-[8rem] flex-1 flex-col gap-1 text-sm sm:w-auto">
                <span class="font-medium text-slate-700"><?php esc_html_e( 'From Ayah', 'alfawzquran' ); ?></span>
                <input type="number" id="alfawz-memorization-start" min="1" class="w-full rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="1" required />
            </label>
            <label class="flex w-full min-w-[8rem] flex-1 flex-col gap-1 text-sm sm:w-auto">
                <span class="font-medium text-slate-700"><?php esc_html_e( 'To Ayah', 'alfawzquran' ); ?></span>
                <input type="number" id="alfawz-memorization-end" min="1" class="w-full rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="5" required />
            </label>
            <button type="submit" id="alfawz-memorization-begin" class="min-h-[3rem] rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-400">
                <?php esc_html_e( 'Begin Memorizing', 'alfawzquran' ); ?>
            </button>
        </form>
        <p id="alfawz-memorization-form-status" class="text-sm text-slate-600"></p>
    </section>

    <section id="alfawz-memorization-empty" class="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 p-6 text-slate-700">
        <p class="text-base font-medium"><?php esc_html_e( 'Create a plan to unlock your personalized memorization loop.', 'alfawzquran' ); ?></p>
        <p class="mt-2 text-sm text-slate-600"><?php esc_html_e( 'Plans pull verses dynamically—no hard-coded ranges—so you can focus on recitation while the tracker handles progress.', 'alfawzquran' ); ?></p>
    </section>

    <section id="alfawz-memorization-active" class="hidden space-y-6 rounded-2xl bg-white/80 p-6 shadow-lg shadow-emerald-100/70">
        <header class="flex flex-wrap items-center justify-between gap-4 text-slate-900">
            <div>
                <p class="text-sm font-semibold uppercase tracking-wide text-emerald-600" id="alfawz-memorization-plan-label"></p>
                <h3 class="text-2xl font-semibold" id="alfawz-memorization-plan-title"></h3>
                <p class="text-sm text-slate-600" id="alfawz-memorization-plan-range"></p>
            </div>
            <div class="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700" id="alfawz-memorization-plan-progress"></div>
        </header>

        <article class="space-y-4 rounded-2xl bg-white/90 p-6 shadow-inner">
            <div class="space-y-3 text-center">
                <p class="text-sm font-semibold uppercase tracking-wide text-emerald-600"><?php esc_html_e( 'Current Verse', 'alfawzquran' ); ?></p>
                <p id="alfawz-memorization-ayah-ar" class="text-3xl leading-loose tracking-wide text-slate-900" dir="rtl" lang="ar"></p>
                <p id="alfawz-memorization-ayah-translation" class="text-lg text-slate-600"></p>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3">
                <p id="alfawz-memorization-repetitions" class="text-base font-medium text-slate-700">0 / 20 <?php esc_html_e( 'Repetitions', 'alfawzquran' ); ?></p>
                <button type="button" id="alfawz-memorization-toggle-translation" class="min-h-[3rem] rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                    <?php esc_html_e( 'Hide translation', 'alfawzquran' ); ?>
                </button>
            </div>
            <div class="w-full rounded-full bg-slate-200/80">
                <div id="alfawz-memorization-progress" class="h-3 rounded-full bg-emerald-500 transition-all duration-300" style="width:0%"></div>
            </div>
            <p id="alfawz-memorization-progress-note" class="text-sm text-emerald-700"><?php esc_html_e( 'Tap repeat to begin your twenty-fold focus session.', 'alfawzquran' ); ?></p>
            <button type="button" id="alfawz-memorization-repeat" class="min-h-[3rem] w-full rounded-xl bg-emerald-600 px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-400">
                <?php esc_html_e( 'Repeat Verse', 'alfawzquran' ); ?>
            </button>
        </article>

        <section id="alfawz-memorization-stats" class="grid grid-cols-1 gap-4 text-slate-900 md:grid-cols-2">
            <div class="flex min-h-[6rem] flex-col justify-center rounded-2xl bg-emerald-50/80 p-4 shadow-sm">
                <p class="text-sm text-emerald-600"><?php esc_html_e( 'Total Verses', 'alfawzquran' ); ?></p>
                <p id="alfawz-memorization-stat-total" class="text-2xl font-semibold">0</p>
            </div>
            <div class="flex min-h-[6rem] flex-col justify-center rounded-2xl bg-emerald-50/80 p-4 shadow-sm">
                <p class="text-sm text-emerald-600"><?php esc_html_e( 'Memorized', 'alfawzquran' ); ?></p>
                <p id="alfawz-memorization-stat-memorized" class="text-2xl font-semibold">0</p>
            </div>
            <div class="flex min-h-[6rem] flex-col justify-center rounded-2xl bg-emerald-50/80 p-4 shadow-sm">
                <p class="text-sm text-emerald-600"><?php esc_html_e( 'Remaining', 'alfawzquran' ); ?></p>
                <p id="alfawz-memorization-stat-remaining" class="text-2xl font-semibold">0</p>
            </div>
            <div class="flex min-h-[6rem] flex-col justify-center rounded-2xl bg-emerald-50/80 p-4 shadow-sm">
                <p class="text-sm text-emerald-600"><?php esc_html_e( 'Completion', 'alfawzquran' ); ?></p>
                <p id="alfawz-memorization-stat-completion" class="text-2xl font-semibold">0%</p>
            </div>
        </section>
        <p id="alfawz-memorization-active-status" class="text-sm text-slate-600"></p>
    </section>

    <div id="alfawz-memorization-modal" class="pointer-events-none fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/60 p-4">
        <div class="pointer-events-auto max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✅</div>
            <h3 class="mt-4 text-2xl font-semibold text-emerald-700"><?php esc_html_e( 'MashaAllah!', 'alfawzquran' ); ?></h3>
            <p class="mt-2 text-base text-slate-600">
                <?php esc_html_e( 'You have firmly memorized this verse through 20 repetitions. Barakallahu Feek — May Allah preserve it in your heart.', 'alfawzquran' ); ?>
            </p>
            <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button type="button" id="alfawz-memorization-continue" class="min-h-[3rem] flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    <?php esc_html_e( 'Continue to Next Verse', 'alfawzquran' ); ?>
                </button>
                <button type="button" id="alfawz-memorization-review" class="min-h-[3rem] flex-1 rounded-xl border border-emerald-200 px-4 py-3 text-base font-semibold text-emerald-700 transition hover:border-emerald-300 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                    <?php esc_html_e( 'Review Later', 'alfawzquran' ); ?>
                </button>
            </div>
        </div>
    </div>
</div>

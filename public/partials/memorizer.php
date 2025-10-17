<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-memorization" class="relative overflow-hidden bg-gradient-to-br from-[#081129] via-[#3b1d5a] to-[#fde4a7] pb-[160px] text-slate-100">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
        <div class="absolute -top-36 right-12 h-96 w-96 rounded-full bg-sky-400/25 blur-3xl"></div>
        <div class="absolute top-20 left-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl"></div>
        <div class="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl"></div>
    </div>
    <div class="relative mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6 lg:px-8">
        <section aria-labelledby="alfawz-memorization-start-title" class="space-y-8 text-center">
            <header class="mx-auto max-w-4xl space-y-3">
                <p class="text-sm font-semibold uppercase tracking-[0.45em] text-sky-200/90"><?php esc_html_e( 'Sacred Repetition Practice', 'alfawzquran' ); ?></p>
                <h2 id="alfawz-memorization-start-title" class="text-4xl font-bold text-white drop-shadow-sm sm:text-5xl">
                    <?php esc_html_e( 'Craft a soulful memorisation journey filled with rhythm and awe.', 'alfawzquran' ); ?>
                </h2>
                <p class="text-base text-slate-100/90 sm:text-lg">
                    <?php esc_html_e( 'Select your surah, choose the ayah range, and flow through verses with immersive focus tools.', 'alfawzquran' ); ?>
                </p>
            </header>

            <div class="grid gap-5 sm:grid-cols-3">
                <div class="rounded-3xl bg-gradient-to-br from-sky-500/80 to-sky-300/80 p-6 text-left shadow-xl ring-1 ring-sky-100/60">
                    <p class="text-xs uppercase tracking-[0.35em] text-white/80"><?php esc_html_e( 'Momentum', 'alfawzquran' ); ?></p>
                    <p class="mt-3 text-2xl font-semibold text-white">
                        <?php esc_html_e( 'Keep your pace with daily repetition bursts.', 'alfawzquran' ); ?>
                    </p>
                </div>
                <div class="rounded-3xl bg-gradient-to-br from-emerald-500/80 to-teal-300/80 p-6 text-left shadow-xl ring-1 ring-emerald-100/60">
                    <p class="text-xs uppercase tracking-[0.35em] text-white/80"><?php esc_html_e( 'Mindful focus', 'alfawzquran' ); ?></p>
                    <p class="mt-3 text-2xl font-semibold text-white">
                        <?php esc_html_e( 'Revisit verses with calming prompts and visuals.', 'alfawzquran' ); ?>
                    </p>
                </div>
                <div class="rounded-3xl bg-gradient-to-br from-amber-400/80 to-rose-400/80 p-6 text-left shadow-xl ring-1 ring-amber-100/60">
                    <p class="text-xs uppercase tracking-[0.35em] text-white/80"><?php esc_html_e( 'Community spirit', 'alfawzquran' ); ?></p>
                    <p class="mt-3 text-2xl font-semibold text-white">
                        <?php esc_html_e( 'Share progress and celebrate each memorisation milestone.', 'alfawzquran' ); ?>
                    </p>
                </div>
            </div>

            <form id="alfawz-memorization-form" class="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-3xl bg-white/95 p-8 text-left shadow-2xl ring-1 ring-slate-200/60 backdrop-blur">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500"><?php esc_html_e( 'Plan builder', 'alfawzquran' ); ?></p>
                        <h3 class="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                            <?php esc_html_e( 'Start your memorisation flow', 'alfawzquran' ); ?>
                        </h3>
                        <p class="mt-2 max-w-xl text-base text-slate-600">
                            <?php esc_html_e( 'Choose a surah and define the verse range that you wish to seal in your heart today.', 'alfawzquran' ); ?>
                        </p>
                    </div>
                    <div class="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 px-5 py-4 text-left text-indigo-800 shadow-inner sm:text-right">
                        <span class="text-4xl" aria-hidden="true">🧠</span>
                        <p class="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-700"><?php esc_html_e( 'Focus Ritual', 'alfawzquran' ); ?></p>
                    </div>
                </div>
                <div class="grid gap-4 sm:grid-cols-2">
                    <label class="flex flex-col gap-2 text-sm font-medium text-slate-600 sm:col-span-2">
                        <span><?php esc_html_e( 'Surah', 'alfawzquran' ); ?></span>
                        <select id="alfawz-memorization-surah" class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200" required>
                            <option value="" selected disabled><?php esc_html_e( 'Loading surahs…', 'alfawzquran' ); ?></option>
                        </select>
                    </label>
                    <label class="flex flex-col gap-2 text-sm font-medium text-slate-600">
                        <span><?php esc_html_e( 'From Ayah', 'alfawzquran' ); ?></span>
                        <input type="number" id="alfawz-memorization-start" min="1" class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-800 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="1" required />
                    </label>
                    <label class="flex flex-col gap-2 text-sm font-medium text-slate-600">
                        <span><?php esc_html_e( 'To Ayah', 'alfawzquran' ); ?></span>
                        <input type="number" id="alfawz-memorization-end" min="1" class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-800 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="5" required />
                    </label>
                </div>
                <button type="submit" id="alfawz-memorization-begin" class="mt-2 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:from-indigo-400 hover:to-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-200 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70">
                    <span class="mr-2 text-xl" aria-hidden="true">✨</span>
                    <?php esc_html_e( 'Begin memorising', 'alfawzquran' ); ?>
                </button>
                <p id="alfawz-memorization-form-status" class="text-sm font-medium text-indigo-700"></p>
            </form>
        </section>

        <section id="alfawz-memorization-empty" class="mx-auto hidden max-w-2xl rounded-3xl border border-white/30 bg-gradient-to-br from-emerald-500/80 to-teal-400/70 p-10 text-center text-white shadow-xl backdrop-blur">
            <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl" aria-hidden="true">🧠</div>
            <h3 class="text-2xl font-bold tracking-tight text-white"><?php esc_html_e( 'Start your memorisation journey', 'alfawzquran' ); ?></h3>
            <p class="mt-3 text-base text-emerald-50/90">
                <?php esc_html_e( 'Select a Surah and verse range to begin.', 'alfawzquran' ); ?>
            </p>
            <p class="mt-4 text-sm text-emerald-50/75">
                <?php esc_html_e( 'Sacred repetition transforms verses into living memory. Begin a plan to unlock your loop.', 'alfawzquran' ); ?>
            </p>
        </section>

        <section id="alfawz-memorization-active" class="hidden space-y-12">
            <header class="text-center text-white">
                <p class="text-sm font-semibold uppercase tracking-[0.4em] text-sky-100/90" id="alfawz-memorization-plan-label"></p>
                <h3 class="mt-4 text-4xl font-semibold sm:text-5xl" id="alfawz-memorization-plan-title"></h3>
                <p class="mt-3 text-base text-slate-100/90" id="alfawz-memorization-plan-range"></p>
                <div class="mx-auto mt-5 inline-flex items-center gap-3 rounded-full bg-white/20 px-6 py-2 text-sm font-semibold text-white shadow-lg" id="alfawz-memorization-plan-progress"></div>
            </header>

            <div class="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-500 to-rose-500 p-8 shadow-2xl ring-1 ring-white/25">
                <div class="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-sky-900/70 backdrop-blur-sm"></div>
                <div class="relative flex flex-col gap-6 text-center text-white drop-shadow-md">
                    <div class="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
                        <div class="flex flex-col items-center gap-3 sm:items-start">
                            <span class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-100/90"><?php esc_html_e( 'Rhythm tracker', 'alfawzquran' ); ?></span>
                            <div class="flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-left shadow-lg backdrop-blur-sm">
                                <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300/80 via-teal-300/80 to-cyan-300/80 text-3xl text-slate-900 shadow-inner" aria-hidden="true">🧠</div>
                                <div class="space-y-1">
                                    <p class="text-sm font-medium text-emerald-50/90"><?php esc_html_e( 'Daily loops completed', 'alfawzquran' ); ?></p>
                                    <p id="counter" class="text-2xl font-semibold text-emerald-50">0 / 20 <?php esc_html_e( 'Repetitions', 'alfawzquran' ); ?></p>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center gap-3 sm:items-end">
                            <p id="progress-note" class="text-sm font-medium text-white/90"><?php esc_html_e( 'Tap repeat to begin your twenty-fold focus session.', 'alfawzquran' ); ?></p>
                            <div class="flex items-center gap-3 text-sm font-medium text-white">
                                <button type="button" id="alfawz-memorization-toggle-surah" class="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-2 transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-2 focus:ring-offset-transparent">
                                    <span aria-hidden="true">📜</span>
                                    <span><?php esc_html_e( 'Show entire surah', 'alfawzquran' ); ?></span>
                                </button>
                                <button type="button" id="alfawz-memorization-toggle-translation" class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-[#f3d9d7] focus:ring-offset-2 focus:ring-offset-transparent">
                                    <span aria-hidden="true">🔁</span>
                                    <span><?php esc_html_e( 'Hide translation', 'alfawzquran' ); ?></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="mx-auto h-3 w-full max-w-2xl rounded-full bg-white/30 shadow-inner">
                        <div id="progress-bar" class="h-3 rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-200 transition-all duration-500" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <article class="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-3xl bg-white p-8 text-slate-800 shadow-2xl ring-1 ring-slate-200/70">
                <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div class="space-y-2 text-left">
                        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-500"><?php esc_html_e( 'Current verse', 'alfawzquran' ); ?></p>
                        <p id="alfawz-memorization-verse-meta" class="text-base font-medium text-slate-600"></p>
                    </div>
                    <div class="flex flex-wrap items-center justify-end gap-3">
                        <button type="button" id="alfawz-memorization-prev" class="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:from-sky-300 hover:via-indigo-300 hover:to-violet-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none">
                            <span aria-hidden="true">⬅️</span>
                            <?php esc_html_e( 'Previous', 'alfawzquran' ); ?>
                        </button>
                        <button type="button" id="alfawz-memorization-audio" class="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-indigo-400 hover:to-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200">
                            <span aria-hidden="true">🔊</span>
                            <?php esc_html_e( 'Play verse audio', 'alfawzquran' ); ?>
                        </button>
                        <button type="button" id="alfawz-memorization-next" class="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:from-emerald-300 hover:via-teal-300 hover:to-lime-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none">
                            <?php esc_html_e( 'Next', 'alfawzquran' ); ?>
                            <span aria-hidden="true">➡️</span>
                        </button>
                    </div>
                </header>

                <div class="space-y-6 text-center">
                    <p id="alfawz-memorization-ayah-ar" class="alfawz-verse-arabic text-2xl leading-relaxed tracking-wide text-slate-900 sm:text-3xl" dir="rtl" lang="ar"></p>
                    <p id="alfawz-memorization-ayah-transliteration" class="hidden text-lg text-indigo-600"></p>
                    <p id="alfawz-memorization-ayah-translation" class="text-lg italic text-slate-600"></p>
                </div>

                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p id="alfawz-memorization-repetitions" class="text-base font-medium text-indigo-600">0 / 20 <?php esc_html_e( 'Repetitions', 'alfawzquran' ); ?></p>
                    <button type="button" id="repeat-btn" class="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-7 py-3.5 text-lg font-semibold text-white shadow-xl transition-all duration-300 ease-out hover:scale-[1.04] hover:from-teal-400 hover:via-sky-400 hover:to-cyan-400 focus:outline-none focus:ring-4 focus:ring-emerald-200/60 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70">
                        <span aria-hidden="true" class="transition-transform duration-300 group-hover:rotate-12">🔁</span>
                        <span class="tracking-wide group-hover:drop-shadow"><?php esc_html_e( 'Repeat verse', 'alfawzquran' ); ?></span>
                    </button>
                </div>

                <p id="alfawz-memorization-active-status" class="text-sm font-medium text-slate-500"></p>
            </article>

            <section id="alfawz-recitation-assistant" class="mx-auto w-full max-w-4xl rounded-3xl bg-white/95 p-8 text-slate-800 shadow-2xl ring-1 ring-slate-200/70">
                <header class="space-y-2 text-left">
                    <p class="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500"><?php esc_html_e( 'AI recitation coach', 'alfawzquran' ); ?></p>
                    <h3 class="text-2xl font-semibold text-slate-900 sm:text-3xl"><?php esc_html_e( 'Refine your flow with Tarteel-style insights.', 'alfawzquran' ); ?></h3>
                    <p class="text-base text-slate-600"><?php esc_html_e( 'Let the assistant listen to your recitation, highlight slip-ups, and surface FES (Focus Enhancement Snippets) inspired by Tarteel’s memorisation playbook.', 'alfawzquran' ); ?></p>
                </header>

                <div class="mt-6 flex flex-col gap-8 lg:flex-row">
                    <div class="flex-1 space-y-6">
                        <div class="flex flex-wrap items-center gap-3">
                            <button type="button" id="alfawz-recitation-toggle" class="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:from-indigo-400 hover:to-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-200 focus:ring-offset-2 focus:ring-offset-white">
                                <span aria-hidden="true">🎙️</span>
                                <span><?php esc_html_e( 'Begin listening', 'alfawzquran' ); ?></span>
                            </button>
                            <button type="button" id="alfawz-recitation-history-toggle" class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                                <span aria-hidden="true">🗂️</span>
                                <span><?php esc_html_e( 'View last reviews', 'alfawzquran' ); ?></span>
                            </button>
                        </div>
                        <p id="alfawz-recitation-status" class="text-sm text-slate-500"><?php esc_html_e( 'Tap begin listening when you are ready to recite.', 'alfawzquran' ); ?></p>
                        <div class="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-indigo-50 to-rose-50 p-6 text-center shadow-inner">
                            <p class="text-3xl font-semibold uppercase tracking-[0.3em] text-indigo-500"><?php esc_html_e( 'Accuracy score', 'alfawzquran' ); ?></p>
                            <p id="alfawz-recitation-score-value" class="mt-2 text-[6.75rem] font-bold text-slate-900">--</p>
                            <p id="alfawz-recitation-verse" class="mt-1 text-4xl text-slate-600"><?php esc_html_e( 'Select a verse to begin your session.', 'alfawzquran' ); ?></p>
                            <p id="alfawz-recitation-translation" class="mt-2 text-4xl italic text-slate-500"></p>
                            <p id="alfawz-recitation-updated" class="mt-2 text-3xl uppercase tracking-[0.25em] text-slate-400"></p>
                        </div>
                    </div>

                    <div class="flex-1 space-y-6">
                        <div>
                            <h4 class="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500"><?php esc_html_e( 'Focus insights', 'alfawzquran' ); ?></h4>
                            <ul id="alfawz-recitation-mistakes" class="mt-3 space-y-3 text-sm text-slate-600">
                                <li class="rounded-2xl border border-dashed border-slate-200/70 bg-white/70 px-4 py-3 text-slate-400"><?php esc_html_e( 'No analysis yet. Start a session to see highlighted opportunities.', 'alfawzquran' ); ?></li>
                            </ul>
                        </div>
                        <div>
                            <h4 class="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500"><?php esc_html_e( 'Tarteel-style snippets', 'alfawzquran' ); ?></h4>
                            <div id="alfawz-recitation-snippets" class="mt-3 flex flex-wrap gap-2 text-sm"></div>
                        </div>
                    </div>
                </div>

                <div id="alfawz-recitation-history" class="mt-6 hidden rounded-3xl border border-slate-200/70 bg-white/90 p-5">
                    <div class="flex items-center justify-between">
                        <h4 class="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500"><?php esc_html_e( 'Recent sessions', 'alfawzquran' ); ?></h4>
                        <button type="button" id="alfawz-recitation-history-close" class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:text-indigo-500 focus:outline-none"><?php esc_html_e( 'Close', 'alfawzquran' ); ?></button>
                    </div>
                    <ul id="alfawz-recitation-history-list" class="mt-4 space-y-3 text-sm text-slate-600">
                        <li class="text-slate-400"><?php esc_html_e( 'You have not recorded any recitation feedback yet.', 'alfawzquran' ); ?></li>
                    </ul>
                </div>
            </section>

            <section id="alfawz-memorization-surah-contents" class="hidden">
                <div class="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-3xl bg-white/90 p-8 text-slate-800 shadow-2xl ring-1 ring-slate-200/70">
                    <header class="text-center">
                        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500"><?php esc_html_e( 'Surah overview', 'alfawzquran' ); ?></p>
                        <p class="mt-2 text-lg text-slate-600"><?php esc_html_e( 'All verses from the selected surah are displayed below for immersive review.', 'alfawzquran' ); ?></p>
                    </header>
                    <div id="alfawz-memorization-verse-list" class="space-y-4"></div>
                </div>
            </section>

            <section id="alfawz-memorization-stats" class="grid grid-cols-1 gap-6 text-center text-white sm:grid-cols-2">
                <div class="flex min-h-[220px] flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-600 p-10 shadow-2xl ring-1 ring-sky-200/60">
                    <p class="text-2xl uppercase tracking-[0.3em] text-white/90"><?php esc_html_e( 'Total verses', 'alfawzquran' ); ?></p>
                    <p id="alfawz-memorization-stat-total" class="mt-4 text-6xl font-extrabold">0</p>
                </div>
                <div class="flex min-h-[220px] flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 via-green-400 to-teal-600 p-10 shadow-2xl ring-1 ring-emerald-200/60">
                    <p class="text-2xl uppercase tracking-[0.3em] text-white/90"><?php esc_html_e( 'Memorised', 'alfawzquran' ); ?></p>
                    <p id="alfawz-memorization-stat-memorized" class="mt-4 text-6xl font-extrabold">0</p>
                </div>
                <div class="flex min-h-[220px] flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 via-fuchsia-400 to-amber-500 p-10 shadow-2xl ring-1 ring-rose-200/60">
                    <p class="text-2xl uppercase tracking-[0.3em] text-white/90"><?php esc_html_e( 'Remaining', 'alfawzquran' ); ?></p>
                    <p id="alfawz-memorization-stat-remaining" class="mt-4 text-6xl font-extrabold">0</p>
                </div>
                <div class="flex min-h-[220px] flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 via-violet-400 to-indigo-600 p-10 shadow-2xl ring-1 ring-purple-200/60">
                    <p class="text-2xl uppercase tracking-[0.3em] text-white/90"><?php esc_html_e( 'Completion', 'alfawzquran' ); ?></p>
                    <p id="alfawz-memorization-stat-completion" class="mt-4 text-6xl font-extrabold">0%</p>
                </div>
            </section>
        </section>
    </div>

    <div id="celebration-modal" class="fixed inset-0 hidden items-center justify-center bg-slate-900/70 p-4 text-center">
        <div class="celebration-card relative max-w-sm rounded-3xl bg-gradient-to-br from-white to-slate-100 p-8 shadow-2xl animate-pop-in">
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

<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-memorization" class="alfawz-typography-scale relative overflow-hidden bg-gradient-to-br from-[#520819] via-[#7b1c3a] to-[#f9f4ed] pb-[140px] text-[#f9f4ed]">
    <div class="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen" aria-hidden="true">
        <div class="absolute -top-40 right-10 h-80 w-80 rounded-full bg-white/20 blur-3xl"></div>
        <div class="absolute bottom-10 left-10 h-60 w-60 rounded-full bg-[#ffe9d6]/40 blur-3xl"></div>
    </div>
    <div class="alfawz-layout-shell relative mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        <section aria-labelledby="alfawz-memorization-start-title" class="space-y-8 text-center">
            <header class="mx-auto max-w-4xl space-y-3">
                <p class="text-sm font-semibold uppercase tracking-[0.45em] text-[#ffe9d6]/90"><?php esc_html_e( 'Sacred Repetition Practice', 'alfawzquran' ); ?></p>
                <h2 id="alfawz-memorization-start-title" class="text-4xl font-bold text-white drop-shadow-sm sm:text-5xl">
                    <?php esc_html_e( 'Craft a soulful memorisation journey filled with rhythm and awe.', 'alfawzquran' ); ?>
                </h2>
                <p class="text-base text-[#fbeee2] sm:text-lg">
                    <?php esc_html_e( 'Select your surah, choose the ayah range, and flow through verses with immersive focus tools.', 'alfawzquran' ); ?>
                </p>
            </header>

            <form id="alfawz-memorization-form" class="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-3xl bg-white/95 p-8 text-left shadow-2xl ring-1 ring-[#f3d9d7]/40 backdrop-blur">
                <div class="flex items-start justify-between gap-6">
                    <div>
                        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-[#8c2c44]"><?php esc_html_e( 'Plan builder', 'alfawzquran' ); ?></p>
                        <h3 class="mt-2 text-2xl font-semibold text-[#3b0f1c] sm:text-3xl">
                            <?php esc_html_e( 'Start your memorisation flow', 'alfawzquran' ); ?>
                        </h3>
                        <p class="mt-2 max-w-xl text-base text-[#8c2c44]">
                            <?php esc_html_e( 'Choose a surah and define the verse range that you wish to seal in your heart today.', 'alfawzquran' ); ?>
                        </p>
                    </div>
                    <div class="hidden text-5xl sm:block" aria-hidden="true">🧠</div>
                </div>
                <div class="grid gap-4 sm:grid-cols-2">
                    <label class="flex flex-col gap-2 text-sm font-medium text-[#5e1b2c] sm:col-span-2">
                        <span><?php esc_html_e( 'Surah', 'alfawzquran' ); ?></span>
                        <select id="alfawz-memorization-surah" class="w-full rounded-2xl border border-[#f3d9d7] bg-white px-4 py-3 text-base text-[#3b0f1c] shadow-sm transition focus:border-[#c26a73] focus:outline-none focus:ring-2 focus:ring-[#f3d9d7]" required>
                            <option value="" selected disabled><?php esc_html_e( 'Loading surahs…', 'alfawzquran' ); ?></option>
                        </select>
                    </label>
                    <label class="flex flex-col gap-2 text-sm font-medium text-[#5e1b2c]">
                        <span><?php esc_html_e( 'From Ayah', 'alfawzquran' ); ?></span>
                        <input type="number" id="alfawz-memorization-start" min="1" class="w-full rounded-2xl border border-[#f3d9d7] px-4 py-3 text-base text-[#3b0f1c] shadow-sm transition focus:border-[#c26a73] focus:outline-none focus:ring-2 focus:ring-[#f3d9d7]" placeholder="1" required />
                    </label>
                    <label class="flex flex-col gap-2 text-sm font-medium text-[#5e1b2c]">
                        <span><?php esc_html_e( 'To Ayah', 'alfawzquran' ); ?></span>
                        <input type="number" id="alfawz-memorization-end" min="1" class="w-full rounded-2xl border border-[#f3d9d7] px-4 py-3 text-base text-[#3b0f1c] shadow-sm transition focus:border-[#c26a73] focus:outline-none focus:ring-2 focus:ring-[#f3d9d7]" placeholder="5" required />
                    </label>
                </div>
                <button type="submit" id="alfawz-memorization-begin" class="mt-2 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#590f24] via-[#7b1c3a] to-[#a6374f] px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:from-[#6b152f] hover:to-[#b74b61] focus:outline-none focus:ring-4 focus:ring-[#f3d9d7] focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70">
                    <span class="mr-2 text-xl" aria-hidden="true">✨</span>
                    <?php esc_html_e( 'Begin memorising', 'alfawzquran' ); ?>
                </button>
                <p id="alfawz-memorization-form-status" class="text-sm font-medium text-[#8c2c44]"></p>
            </form>
        </section>

        <section id="alfawz-memorization-empty" class="mx-auto hidden max-w-2xl rounded-3xl border border-white/20 bg-white/20 p-8 text-center text-white shadow-xl backdrop-blur">
            <div class="text-6xl mb-4" aria-hidden="true">🧠</div>
            <h3 class="text-2xl font-bold tracking-tight"><?php esc_html_e( 'Start your memorisation journey', 'alfawzquran' ); ?></h3>
            <p class="mt-3 text-base text-[#fbeee2]">
                <?php esc_html_e( 'Select a Surah and verse range to begin.', 'alfawzquran' ); ?>
            </p>
            <p class="mt-4 text-sm text-[#fbeee2]/80">
                <?php esc_html_e( 'Sacred repetition transforms verses into living memory. Begin a plan to unlock your loop.', 'alfawzquran' ); ?>
            </p>
        </section>

        <section id="alfawz-memorization-active" class="hidden space-y-12">
            <header class="text-center text-white">
                <p class="text-sm font-semibold uppercase tracking-[0.4em] text-[#ffe9d6]/90" id="alfawz-memorization-plan-label"></p>
                <h3 class="mt-4 text-4xl font-semibold sm:text-5xl" id="alfawz-memorization-plan-title"></h3>
                <p class="mt-3 text-base text-[#f9f2eb]/90" id="alfawz-memorization-plan-range"></p>
                <div class="mx-auto mt-5 inline-flex items-center gap-3 rounded-full bg-white/20 px-6 py-2 text-sm font-semibold text-white shadow-lg" id="alfawz-memorization-plan-progress"></div>
            </header>

            <div class="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl bg-white/10 p-8 shadow-2xl backdrop-blur">
                <div class="flex flex-col gap-6 text-center text-white">
                    <div class="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
                        <div class="flex flex-col items-center gap-3 sm:items-start">
                            <span class="text-sm font-semibold uppercase tracking-[0.3em] text-[#ffe9d6]"><?php esc_html_e( 'Rhythm tracker', 'alfawzquran' ); ?></span>
                            <div class="flex items-center gap-3 text-left">
                                <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-inner" aria-hidden="true">🧠</div>
                                <div>
                                    <p class="text-sm text-[#fbeee2]/90"><?php esc_html_e( 'Daily loops completed', 'alfawzquran' ); ?></p>
                                    <p id="counter" class="text-2xl font-semibold text-white">0 / 20 <?php esc_html_e( 'Repetitions', 'alfawzquran' ); ?></p>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center gap-3 sm:items-end">
                            <p id="progress-note" class="text-sm font-medium text-[#ffe9d6]"><?php esc_html_e( 'Tap repeat to begin your twenty-fold focus session.', 'alfawzquran' ); ?></p>
                            <div class="flex items-center gap-3 text-sm font-medium text-white">
                                <button type="button" id="alfawz-memorization-toggle-surah" class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#f3d9d7] focus:ring-offset-2 focus:ring-offset-transparent">
                                    <span aria-hidden="true">📜</span>
                                    <span><?php esc_html_e( 'Show entire surah', 'alfawzquran' ); ?></span>
                                </button>
                                <button type="button" id="alfawz-memorization-toggle-translation" class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#f3d9d7] focus:ring-offset-2 focus:ring-offset-transparent">
                                    <span aria-hidden="true">🔁</span>
                                    <span><?php esc_html_e( 'Hide translation', 'alfawzquran' ); ?></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="mx-auto h-3 w-full max-w-2xl rounded-full bg-white/20">
                        <div id="progress-bar" class="h-3 rounded-full bg-gradient-to-r from-[#b56374] via-[#d9a3ab] to-white transition-all duration-500" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <article class="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-3xl bg-white/95 p-8 text-[#3b0f1c] shadow-2xl ring-1 ring-[#f3d9d7]/40">
                <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div class="space-y-2 text-left">
                        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-[#a34b61]"><?php esc_html_e( 'Current verse', 'alfawzquran' ); ?></p>
                        <p id="alfawz-memorization-verse-meta" class="text-base font-medium text-[#6a2133]"></p>
                    </div>
                    <div class="flex flex-wrap items-center justify-end gap-3">
                        <button type="button" id="alfawz-memorization-prev" class="inline-flex items-center gap-2 rounded-2xl border border-[#f3d9d7] px-4 py-2 text-sm font-semibold text-[#6a2133] transition hover:-translate-y-0.5 hover:border-[#d7a0a7] hover:text-[#3b0f1c] focus:outline-none focus:ring-2 focus:ring-[#f3d9d7] disabled:cursor-not-allowed disabled:opacity-50">
                            <span aria-hidden="true">⬅️</span>
                            <?php esc_html_e( 'Previous', 'alfawzquran' ); ?>
                        </button>
                        <button type="button" id="alfawz-memorization-audio" class="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#590f24] to-[#a6374f] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-[#6b152f] hover:to-[#b74b61] focus:outline-none focus:ring-2 focus:ring-[#f3d9d7]">
                            <span aria-hidden="true">🔊</span>
                            <?php esc_html_e( 'Play verse audio', 'alfawzquran' ); ?>
                        </button>
                        <button type="button" id="alfawz-memorization-next" class="inline-flex items-center gap-2 rounded-2xl border border-[#f3d9d7] px-4 py-2 text-sm font-semibold text-[#6a2133] transition hover:-translate-y-0.5 hover:border-[#d7a0a7] hover:text-[#3b0f1c] focus:outline-none focus:ring-2 focus:ring-[#f3d9d7] disabled:cursor-not-allowed disabled:opacity-50">
                            <?php esc_html_e( 'Next', 'alfawzquran' ); ?>
                            <span aria-hidden="true">➡️</span>
                        </button>
                    </div>
                </header>

                <div class="space-y-6 text-center">
                    <p id="alfawz-memorization-ayah-ar" class="alfawz-verse-arabic text-4xl leading-relaxed tracking-wide text-[#2f0716] sm:text-5xl" dir="rtl" lang="ar"></p>
                    <p id="alfawz-memorization-ayah-transliteration" class="hidden text-lg text-[#7b1c3a]"></p>
                    <p id="alfawz-memorization-ayah-translation" class="text-lg italic text-[#8c2c44]"></p>
                </div>

                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p id="alfawz-memorization-repetitions" class="text-base font-medium text-[#6a2133]">0 / 20 <?php esc_html_e( 'Repetitions', 'alfawzquran' ); ?></p>
                    <button type="button" id="repeat-btn" class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#590f24] via-[#7b1c3a] to-[#a6374f] px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] hover:from-[#6b152f] hover:to-[#b74b61] focus:outline-none focus:ring-4 focus:ring-[#f3d9d7] focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70">
                        <span aria-hidden="true">🔁</span>
                        <?php esc_html_e( 'Repeat verse', 'alfawzquran' ); ?>
                    </button>
                </div>

                <p id="alfawz-memorization-active-status" class="text-sm font-medium text-[#8c2c44]"></p>
            </article>

            <section id="alfawz-memorization-surah-contents" class="hidden">
                <div class="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-3xl bg-white/80 p-8 text-[#3b0f1c] shadow-2xl ring-1 ring-[#f3d9d7]/40">
                    <header class="text-center">
                        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-[#a34b61]"><?php esc_html_e( 'Surah overview', 'alfawzquran' ); ?></p>
                        <p class="mt-2 text-lg text-[#6a2133]"><?php esc_html_e( 'All verses from the selected surah are displayed below for immersive review.', 'alfawzquran' ); ?></p>
                    </header>
                    <div id="alfawz-memorization-verse-list" class="space-y-4"></div>
                </div>
            </section>

            <section id="alfawz-memorization-stats" class="grid grid-cols-1 gap-5 text-white sm:grid-cols-2">
                <div class="rounded-3xl bg-white/15 p-6 shadow-xl ring-1 ring-white/20">
                    <p class="text-sm uppercase tracking-[0.3em] text-[#ffe9d6]"><?php esc_html_e( 'Total verses', 'alfawzquran' ); ?></p>
                    <p id="alfawz-memorization-stat-total" class="mt-2 text-3xl font-semibold">0</p>
                </div>
                <div class="rounded-3xl bg-white/15 p-6 shadow-xl ring-1 ring-white/20">
                    <p class="text-sm uppercase tracking-[0.3em] text-[#ffe9d6]"><?php esc_html_e( 'Memorised', 'alfawzquran' ); ?></p>
                    <p id="alfawz-memorization-stat-memorized" class="mt-2 text-3xl font-semibold">0</p>
                </div>
                <div class="rounded-3xl bg-white/15 p-6 shadow-xl ring-1 ring-white/20">
                    <p class="text-sm uppercase tracking-[0.3em] text-[#ffe9d6]"><?php esc_html_e( 'Remaining', 'alfawzquran' ); ?></p>
                    <p id="alfawz-memorization-stat-remaining" class="mt-2 text-3xl font-semibold">0</p>
                </div>
                <div class="rounded-3xl bg-white/15 p-6 shadow-xl ring-1 ring-white/20">
                    <p class="text-sm uppercase tracking-[0.3em] text-[#ffe9d6]"><?php esc_html_e( 'Completion', 'alfawzquran' ); ?></p>
                    <p id="alfawz-memorization-stat-completion" class="mt-2 text-3xl font-semibold">0%</p>
                </div>
            </section>
        </section>
    </div>

    <div id="celebration-modal" class="fixed inset-0 hidden items-center justify-center bg-black/60 p-4 text-center">
        <div class="celebration-card relative max-w-sm rounded-3xl bg-white p-8 shadow-2xl animate-pop-in">
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

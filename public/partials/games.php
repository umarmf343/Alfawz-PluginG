<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-game-panel" class="relative mx-auto max-w-5xl overflow-hidden rounded-[42px] bg-gradient-to-br from-[#4d081d] via-[#7a0f32] to-[#f9f1e8] p-6 pb-16 shadow-2xl shadow-[#4d081d]/40 ring-1 ring-white/20 sm:p-10">
    <div class="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f7eadf]/50 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-[#ffdee0]/40 blur-2xl"></div>
    <div class="relative space-y-8 text-[#311019]">
        <div id="alfawz-game-loading" class="flex items-center justify-center gap-3 rounded-3xl border border-[#b4637a]/30 bg-gradient-to-r from-[#ffe3ef]/80 via-[#fff3da]/80 to-[#e7f3ff]/80 px-5 py-6 text-lg font-semibold text-[#7a0f32] shadow-lg shadow-[#310915]/10 backdrop-blur">
            <span class="inline-flex h-3 w-3 animate-pulse rounded-full bg-[#c43a59]"></span>
            <?php esc_html_e( 'Loading your joyful progress…', 'alfawzquran' ); ?>
        </div>

        <div id="alfawz-game-error" class="hidden rounded-3xl border border-rose-200/70 bg-gradient-to-r from-[#ffe2e8]/90 via-[#ffdede]/90 to-[#fff1f1]/90 px-5 py-6 text-center text-lg font-semibold text-rose-800 shadow-lg shadow-rose-300/50 backdrop-blur"></div>

        <div id="alfawz-game-content" class="hidden space-y-10">
            <section
                aria-label="<?php esc_attr_e( 'Virtue Garden Tycoon Quranic habit game', 'alfawzquran' ); ?>"
                class="space-y-6"
                id="alfawz-garden"
            >
                <div class="relative overflow-hidden rounded-[36px] border border-[#8b1e3f]/25 bg-gradient-to-br from-[#35285f] via-[#7c2c68] to-[#ffcfe3] p-6 text-[#fff9f4] shadow-[0_40px_120px_-50px_rgba(38,6,16,0.8)] sm:p-9">
                    <div class="pointer-events-none absolute -left-20 top-6 h-48 w-48 rounded-full bg-[#ffedf3]/30 blur-2xl"></div>
                    <div class="pointer-events-none absolute -right-16 bottom-0 h-60 w-60 rounded-full bg-[#ffd3c6]/20 blur-3xl"></div>
                    <div class="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div class="max-w-2xl space-y-4">
                            <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-5xl shadow-lg" aria-hidden="true">🌱</div>
                            <div class="space-y-2">
                                <h2 class="text-3xl font-black tracking-tight sm:text-[42px]">
                                    <?php esc_html_e( 'Virtue Garden Tycoon', 'alfawzquran' ); ?>
                                </h2>
                                <p class="text-base font-medium text-[#ffeae1] sm:text-lg">
                                    <?php
                                    esc_html_e(
                                        'Complete Quranic rituals to gather virtue seeds, awaken luminous plants, and keep your sanctuary thriving with daily care.',
                                        'alfawzquran'
                                    );
                                    ?>
                                </p>
                            </div>
                            <div class="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#ffe2d5]">
                                <span class="h-2 w-2 rounded-full bg-[#ffe2d5]"></span>
                                <?php esc_html_e( 'Daily care keeps the barakah blooming', 'alfawzquran' ); ?>
                            </div>
                        </div>
                        <button
                            id="alfawz-garden-play"
                            type="button"
                            class="inline-flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-[#f7a7b7] via-[#ffce8c] to-[#ffe8b9] px-6 py-3 text-sm font-semibold text-[#431028] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe2d5]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#431028]"
                        >
                            <span aria-hidden="true" class="text-base" data-role="garden-play-icon">▶</span>
                            <span data-role="garden-play-label"><?php esc_html_e( 'Play Game', 'alfawzquran' ); ?></span>
                        </button>
                    </div>
                </div>

                <div
                    id="alfawz-garden-board"
                    class="relative hidden space-y-6 rounded-[36px] border border-[#4d081d]/15 bg-gradient-to-br from-[#f6f5ff]/90 via-[#e9fbff]/90 to-[#fff3e9]/95 p-6 shadow-[0_34px_90px_-40px_rgba(139,30,63,0.6)] sm:p-10"
                >
                    <div class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent"></div>
                    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#ffd6db]/40 to-transparent"></div>

                    <div class="relative grid grid-cols-1 gap-6 lg:grid-cols-[1.75fr_1fr]">
                        <article class="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-white/95 via-[#fff4fa]/90 to-[#eef5ff]/90 p-6 text-[#4d081d] shadow-xl shadow-[#4d081d]/10">
                            <div class="pointer-events-none absolute -top-16 right-8 h-40 w-40 rounded-full bg-[#ffd7dc]/45 blur-3xl"></div>
                            <div class="pointer-events-none absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-[#ffe8c9]/35 blur-3xl"></div>
                            <div class="relative space-y-6">
                                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div class="group relative overflow-hidden rounded-3xl border border-[#ffd6de]/80 bg-[#fff4f6]/80 p-4 shadow-inner">
                                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ffe3ec]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        <p class="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#b4637a]">
                                            <?php esc_html_e( 'Virtue Seeds', 'alfawzquran' ); ?>
                                        </p>
                                        <p class="mt-2 text-3xl font-black text-[#8b1e3f] drop-shadow-sm" data-garden-stat="seeds">0</p>
                                    </div>
                                    <div class="group relative overflow-hidden rounded-3xl border border-[#ffd6de]/80 bg-[#fff4f6]/80 p-4 shadow-inner">
                                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ffe3ec]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        <p class="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#b4637a]">
                                            <?php esc_html_e( 'Garden Flourish', 'alfawzquran' ); ?>
                                        </p>
                                        <p class="mt-2 text-3xl font-black text-[#7a0f32] drop-shadow-sm" data-garden-stat="bloom">0</p>
                                    </div>
                                    <div class="group relative overflow-hidden rounded-3xl border border-[#ffe8ca]/80 bg-[#fff8ef]/80 p-4 shadow-inner">
                                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ffe8ca]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        <p class="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#bb7b54]">
                                            <?php esc_html_e( 'Care Rhythm', 'alfawzquran' ); ?>
                                        </p>
                                        <p class="mt-2 text-3xl font-black text-[#b4552b] drop-shadow-sm" data-garden-stat="care">0%</p>
                                    </div>
                                    <div class="group relative overflow-hidden rounded-3xl border border-[#ffd6de]/80 bg-[#fff4f6]/80 p-4 shadow-inner">
                                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ffe3ec]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        <p class="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#b4637a]">
                                            <?php esc_html_e( 'Rituals Today', 'alfawzquran' ); ?>
                                        </p>
                                        <p class="mt-2 text-3xl font-black text-[#8b1e3f] drop-shadow-sm" data-garden-stat="rituals">0 / 0</p>
                                    </div>
                                </div>

                                <p
                                    id="alfawz-garden-status"
                                    class="relative overflow-hidden rounded-3xl border border-dashed border-[#f0bac7] bg-gradient-to-r from-[#fff1f9]/80 via-[#f5f8ff]/80 to-[#fff7eb]/80 px-5 py-4 text-sm font-semibold text-[#7a0f32] shadow-inner transition-all duration-300"
                                >
                                    <?php esc_html_e( 'Tap “Play Game” to plant your first virtue seed.', 'alfawzquran' ); ?>
                                </p>

                                <div class="space-y-4">
                                    <div class="flex flex-wrap items-center justify-between gap-3">
                                        <h3 class="flex items-center gap-3 text-xl font-bold text-[#4d081d]">
                                            <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ffe9ef] text-lg shadow-inner" aria-hidden="true">🕊️</span>
                                            <?php esc_html_e( 'Daily Quranic Rituals', 'alfawzquran' ); ?>
                                        </h3>
                                        <span class="inline-flex items-center gap-2 rounded-full bg-[#fdf2f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#b4637a]">
                                            <span class="h-2 w-2 rounded-full bg-[#b4637a]"></span>
                                            <?php esc_html_e( 'Complete steps to earn seeds', 'alfawzquran' ); ?>
                                        </span>
                                    </div>
                                    <div id="alfawz-garden-task-list" class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                        <div class="rounded-3xl border border-dashed border-[#f4c7d3] bg-gradient-to-r from-[#fff1f9]/80 via-[#f2f8ff]/80 to-[#fff6eb]/80 p-5 text-center text-sm font-semibold text-[#b4637a] shadow-inner">
                                            <?php esc_html_e( 'Your ritual cards will appear here once you start the game.', 'alfawzquran' ); ?>
                                        </div>
                                    </div>
                                </div>

                                <div class="space-y-4">
                                    <div class="flex flex-wrap items-center justify-between gap-3">
                                        <h3 class="flex items-center gap-3 text-xl font-bold text-[#4d081d]">
                                            <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ffe9ef] text-lg shadow-inner" aria-hidden="true">🌸</span>
                                            <?php esc_html_e( 'Sanctuary Plots', 'alfawzquran' ); ?>
                                        </h3>
                                        <span id="alfawz-garden-plot-summary" class="text-xs font-semibold uppercase tracking-[0.28em] text-[#b4637a]">
                                            <?php esc_html_e( 'Plots awaiting seeds', 'alfawzquran' ); ?>
                                        </span>
                                    </div>
                                    <div id="alfawz-garden-plots" class="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div class="rounded-[28px] border border-dashed border-[#f4c7d3] bg-gradient-to-r from-[#fff0f8]/80 via-[#f1f8ff]/80 to-[#fff6ea]/80 p-6 text-center text-sm font-semibold text-[#b4637a] shadow-inner">
                                            <?php esc_html_e( 'Nurture rituals to unlock glowing plants.', 'alfawzquran' ); ?>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>

                        <aside class="relative flex flex-col justify-between gap-6 overflow-hidden rounded-[28px] border border-[#4d081d]/15 bg-gradient-to-br from-[#23154d] via-[#5c2d85] to-[#c6639f] p-6 text-white shadow-[0_32px_80px_-40px_rgba(38,6,16,0.8)]">
                            <div class="pointer-events-none absolute -top-16 left-6 h-36 w-36 rounded-full bg-[#ffedf3]/40 blur-2xl"></div>
                            <div class="pointer-events-none absolute -bottom-20 right-4 h-40 w-40 rounded-full bg-[#ffd7d3]/30 blur-3xl"></div>
                            <div class="relative space-y-6">
                                <div class="space-y-2">
                                    <h3 class="text-lg font-semibold uppercase tracking-[0.3em] text-white/80">
                                        <?php esc_html_e( 'Garden Care', 'alfawzquran' ); ?>
                                    </h3>
                                    <p id="alfawz-garden-care-hint" class="text-sm font-medium text-white/90">
                                        <?php esc_html_e( 'Keep devotion flowing with gentle rain and mindful whispers.', 'alfawzquran' ); ?>
                                    </p>
                                </div>
                                <div
                                    id="alfawz-garden-care-meter"
                                    class="relative h-3.5 w-full overflow-hidden rounded-full border border-white/30 bg-white/20"
                                    role="progressbar"
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                    aria-valuenow="0"
                                >
                                    <div id="alfawz-garden-care-bar" class="h-full rounded-full bg-gradient-to-r from-[#ffe8b9] via-[#f7a7b7] to-[#ff90c2] transition-all duration-500" style="width:0%"></div>
                                </div>
                                <button
                                    id="alfawz-garden-water"
                                    type="button"
                                    class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#781838]"
                                >
                                    <span aria-hidden="true">💧</span>
                                    <?php esc_html_e( 'Water & Whisper Du‘a', 'alfawzquran' ); ?>
                                </button>
                            </div>

                            <div class="relative space-y-4">
                                <h3 class="text-lg font-semibold uppercase tracking-[0.3em] text-white/80">
                                    <?php esc_html_e( 'Virtue Journal', 'alfawzquran' ); ?>
                                </h3>
                                <div
                                    id="alfawz-garden-journal"
                                    class="space-y-3 overflow-hidden rounded-[24px] border border-white/20 bg-white/10 p-4 text-sm font-medium text-white/90 shadow-inner"
                                >
                                    <p class="rounded-2xl border border-white/20 bg-white/10 px-3 py-2">
                                        <?php esc_html_e( 'Begin the game to log your radiant garden moments.', 'alfawzquran' ); ?>
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
            <section aria-label="<?php esc_attr_e( 'Ayah Puzzle Builder mini-game', 'alfawzquran' ); ?>" class="space-y-6" id="alfawz-puzzle">
                <div class="flex flex-wrap items-center justify-between gap-4 text-[#4d081d]">
                    <div>
                        <h2 class="flex items-center gap-3 text-2xl font-bold">
                            <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fde8ef] text-2xl shadow-inner" aria-hidden="true">🧩</span>
                            <?php esc_html_e( 'Ayah Puzzle Builder', 'alfawzquran' ); ?>
                        </h2>
                        <p class="mt-2 max-w-2xl text-sm font-medium text-[#7a0f32]">
                            <?php esc_html_e( 'Rebuild each ayah by arranging its radiant word-tiles in the correct order. Unlock fresh daily and weekly themes by keeping your streak alive!', 'alfawzquran' ); ?>
                        </p>
                    </div>
                    <button
                        id="alfawz-puzzle-play"
                        type="button"
                        class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-sky-500 to-rose-500 px-5 py-2.5 text-[1.05rem] font-semibold text-transparent shadow-lg shadow-[#25644d]/25 transition-all duration-300 hover:-translate-y-1 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                        <span
                            aria-hidden="true"
                            class="bg-gradient-to-r from-amber-200 via-emerald-200 to-sky-300 bg-clip-text text-transparent"
                            data-role="puzzle-play-icon"
                        >
                            ▶
                        </span>
                        <span
                            class="bg-gradient-to-r from-amber-200 via-sky-300 to-rose-300 bg-clip-text text-transparent"
                            data-role="puzzle-play-label"
                        >
                            <?php esc_html_e( 'Play Game', 'alfawzquran' ); ?>
                        </span>
                    </button>
                </div>

                <div class="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]" id="alfawz-puzzle-card">
                    <article class="relative overflow-hidden rounded-[32px] border border-[#8b1e3f]/20 bg-gradient-to-br from-[#f4f7ff]/95 via-[#f8e8ff]/95 to-[#ffe8e2]/95 p-6 shadow-[0_32px_80px_-30px_rgba(139,30,63,0.55)] backdrop-blur">
                        <div class="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#ffdce8]/40 blur-3xl"></div>
                        <div class="pointer-events-none absolute -bottom-20 right-10 h-40 w-40 rounded-full bg-[#fbe7ee]/60 blur-2xl"></div>

                        <div class="relative space-y-4 text-[#4d081d]">
                            <div class="flex flex-wrap items-center justify-between gap-3">
                                <div class="space-y-1">
                                    <p class="text-sm font-semibold uppercase tracking-[0.28em] text-[#b4637a]" data-role="puzzle-theme">
                                        <?php esc_html_e( 'Daily Theme · Blossoming Mercy', 'alfawzquran' ); ?>
                                    </p>
                                    <h3 class="text-2xl font-black tracking-tight" data-role="puzzle-title">
                                        <?php esc_html_e( 'Arrange the tiles to rebuild the ayah', 'alfawzquran' ); ?>
                                    </h3>
                                </div>
                                <div class="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#8b1e3f] shadow-inner ring-1 ring-white/70" id="alfawz-puzzle-streak">
                                    <?php esc_html_e( 'Streak x0', 'alfawzquran' ); ?>
                                </div>
                            </div>

                            <div class="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
                                <p class="text-lg font-semibold text-[#6f1330]" data-role="puzzle-reference">
                                    <?php esc_html_e( 'Surah Al-Fatihah · Ayah 1', 'alfawzquran' ); ?>
                                </p>
                                <p class="mt-1 text-base font-medium text-[#b4637a]" data-role="puzzle-translation">
                                    <?php esc_html_e( 'In the name of Allah—the Most Compassionate, Most Merciful.', 'alfawzquran' ); ?>
                                </p>
                            </div>

                            <div class="space-y-5" id="alfawz-puzzle-board">
                                <div class="grid gap-3 md:grid-cols-2" id="alfawz-puzzle-bank"></div>
                                <div class="grid gap-3 md:grid-cols-2" id="alfawz-puzzle-slots"></div>
                            </div>

                            <p
                                id="alfawz-puzzle-status"
                                role="status"
                                aria-live="polite"
                                class="relative overflow-hidden rounded-3xl border border-dashed border-[#d47a92]/60 bg-gradient-to-r from-[#fff0f7]/80 via-[#f3f7ff]/80 to-[#fff7eb]/80 px-4 py-3 text-sm font-semibold text-[#7a0f32] shadow-inner transition-colors duration-300"
                            >
                                <?php esc_html_e( 'Tap “Play Game” to begin your puzzle quest.', 'alfawzquran' ); ?>
                            </p>

                            <div class="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/60">
                                <div id="alfawz-puzzle-progress" class="h-full rounded-full bg-gradient-to-r from-[#8b1e3f] via-[#c43a59] to-[#f59bb4] transition-all duration-500" style="width:0%"></div>
                            </div>
                        </div>
                    </article>

                    <aside class="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-[32px] border border-[#4d081d]/10 bg-gradient-to-br from-[#211f5d] via-[#5a3b9d] to-[#c56bc1] p-6 text-white shadow-[0_24px_60px_-24px_rgba(38,6,16,0.65)]">
                        <div class="space-y-4">
                            <div class="alfawz-game-stat">
                                <span class="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
                                    <?php esc_html_e( 'Timer', 'alfawzquran' ); ?>
                                </span>
                                <strong class="text-3xl font-black" id="alfawz-puzzle-timer">00:00</strong>
                            </div>
                            <div class="alfawz-game-stat">
                                <span class="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
                                    <?php esc_html_e( 'Moves', 'alfawzquran' ); ?>
                                </span>
                                <strong class="text-3xl font-black" id="alfawz-puzzle-moves">0</strong>
                            </div>
                            <div class="alfawz-game-stat">
                                <span class="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
                                    <?php esc_html_e( 'Puzzles Solved', 'alfawzquran' ); ?>
                                </span>
                                <strong class="text-3xl font-black" id="alfawz-puzzle-completed">0</strong>
                            </div>
                        </div>
                        <div class="rounded-3xl border border-white/20 bg-white/10 p-5 text-sm font-medium text-white/90 shadow-inner" id="alfawz-puzzle-unlock">
                            <?php esc_html_e( 'Complete three puzzles today to unlock the “Night of Tranquility” weekly challenge.', 'alfawzquran' ); ?>
                        </div>
                    </aside>
                </div>
            </section>

            <section
                aria-label="<?php esc_attr_e( 'Daily Ayah Meaning Quest mini-game', 'alfawzquran' ); ?>"
                class="space-y-6"
                id="alfawz-verse-quest"
            >
                <div class="relative overflow-hidden rounded-[36px] border border-[#3f1025]/30 bg-gradient-to-br from-[#281f5f] via-[#8a2f69] to-[#ffd7a6] p-6 text-[#fff9f4] shadow-[0_36px_120px_-42px_rgba(33,8,19,0.85)] sm:p-9">
                    <div class="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-[#ffd7e2]/30 blur-3xl"></div>
                    <div class="pointer-events-none absolute -right-16 bottom-0 h-60 w-60 rounded-full bg-[#ffe7c6]/25 blur-[110px]"></div>
                    <div class="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div class="max-w-2xl space-y-4">
                            <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-4xl shadow-lg" aria-hidden="true">📜</div>
                            <div class="space-y-2">
                                <h2 class="text-3xl font-black tracking-tight sm:text-[42px]">
                                    <?php esc_html_e( 'Daily Ayah Meaning Quest', 'alfawzquran' ); ?>
                                </h2>
                                <p class="text-base font-medium text-[#ffe5df] sm:text-lg">
                                    <?php
                                    esc_html_e(
                                        'Unlock one radiant verse each day, discover its meaning, and keep your heart engaged with joyful reflection prompts.',
                                        'alfawzquran'
                                    );
                                    ?>
                                </p>
                            </div>
                            <div class="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#ffe1d9]">
                                <span class="h-2 w-2 rounded-full bg-[#ffe1d9]"></span>
                                <?php esc_html_e( 'One verse. One meaning. One heart shift.', 'alfawzquran' ); ?>
                            </div>
                        </div>
                        <div class="flex flex-col items-start gap-4">
                            <button
                                id="alfawz-verse-play"
                                type="button"
                                class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ffe8b9] via-[#f7a7b7] to-[#ff90c2] px-6 py-3 text-sm font-semibold text-[#3d0c1e] shadow-lg shadow-black/25 transition-all duration-300 hover:-translate-y-1 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3d0c1e]"
                            >
                                <span aria-hidden="true" class="text-base" data-role="verse-play-icon">▶</span>
                                <span data-role="verse-play-label"><?php esc_html_e( 'Play Game', 'alfawzquran' ); ?></span>
                            </button>
                            <p id="alfawz-verse-last-played" class="text-sm font-semibold text-[#ffe7df]/80">
                                <?php esc_html_e( 'Last played: Not yet', 'alfawzquran' ); ?>
                            </p>
                        </div>
                    </div>

                    <div class="relative mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div class="group relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-5 text-left shadow-lg shadow-black/15">
                            <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                            <p class="text-2xl font-semibold uppercase tracking-[0.32em] text-[#36454F]">
                                <?php esc_html_e( 'Day Streak', 'alfawzquran' ); ?>
                            </p>
                            <p class="mt-3 text-6xl font-black text-[#36454F] drop-shadow-sm" data-verse-stat="streak">0</p>
                        </div>
                        <div class="group relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-5 text-left shadow-lg shadow-black/15">
                            <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                            <p class="text-2xl font-semibold uppercase tracking-[0.32em] text-[#36454F]">
                                <?php esc_html_e( 'Verses Mastered', 'alfawzquran' ); ?>
                            </p>
                            <p class="mt-3 text-6xl font-black text-[#36454F] drop-shadow-sm" data-verse-stat="completed">0</p>
                        </div>
                        <div class="group relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-5 text-left shadow-lg shadow-black/15">
                            <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                            <p class="text-2xl font-semibold uppercase tracking-[0.32em] text-[#36454F]">
                                <?php esc_html_e( 'Answer Accuracy', 'alfawzquran' ); ?>
                            </p>
                            <p class="mt-3 text-6xl font-black text-[#36454F] drop-shadow-sm" data-verse-stat="accuracy">0%</p>
                        </div>
                    </div>
                </div>

                <div
                    id="alfawz-verse-stage"
                    class="hidden space-y-6 rounded-[36px] border border-[#4d081d]/15 bg-gradient-to-br from-[#f2f7ff]/95 via-[#fff3f8]/95 to-[#fef7ec]/95 p-6 shadow-[0_34px_90px_-42px_rgba(139,30,63,0.45)] sm:p-10"
                >
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
                        <article class="relative overflow-hidden rounded-[30px] border border-[#ffd6de]/70 bg-gradient-to-br from-white/95 via-[#fff3fa]/90 to-[#eef5ff]/90 p-6 text-[#4d081d] shadow-xl shadow-[#4d081d]/10">
                            <div class="pointer-events-none absolute -top-24 right-6 h-44 w-44 rounded-full bg-[#ffe7c6]/40 blur-3xl"></div>
                            <div class="pointer-events-none absolute -bottom-24 left-8 h-48 w-48 rounded-full bg-[#ffd7e2]/40 blur-3xl"></div>
                            <div class="relative space-y-4">
                                <div class="flex flex-wrap items-center justify-between gap-3">
                                    <div class="space-y-1">
                                        <p class="text-sm font-semibold uppercase tracking-[0.26em] text-[#b4637a]" data-role="verse-theme">
                                            <?php esc_html_e( 'Today’s Focus · Heartfelt Reliance', 'alfawzquran' ); ?>
                                        </p>
                                        <h3 class="text-2xl font-black tracking-tight" data-role="verse-title">
                                            <?php esc_html_e( 'Surah Al-Fatihah · Ayah 5', 'alfawzquran' ); ?>
                                        </h3>
                                    </div>
                                    <span class="inline-flex items-center gap-2 rounded-full bg-[#fdf2f8] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#b4637a]"><span class="h-2 w-2 rounded-full bg-[#b4637a]"></span><?php esc_html_e( 'Daily verse unlocked', 'alfawzquran' ); ?></span>
                                </div>
                                <div class="space-y-3 rounded-3xl border border-white/60 bg-white/90 p-5 shadow-inner">
                                    <p class="text-2xl font-black leading-relaxed" data-role="verse-arabic">
                                        <?php esc_html_e( 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'alfawzquran' ); ?>
                                    </p>
                                    <p class="text-sm font-semibold uppercase tracking-[0.28em] text-[#b4637a]" data-role="verse-transliteration">
                                        <?php esc_html_e( 'Iyyaka naʿbudu wa iyyaka nastaʿin', 'alfawzquran' ); ?>
                                    </p>
                                    <p class="text-base font-medium text-[#7a0f32]" data-role="verse-translation">
                                        <?php esc_html_e( 'You alone we worship and You alone we ask for help.', 'alfawzquran' ); ?>
                                    </p>
                                </div>
                                <p class="text-sm font-semibold text-[#b4637a]" data-role="verse-reference">
                                    <?php esc_html_e( 'Surah Al-Fatihah · Ayah 5', 'alfawzquran' ); ?>
                                </p>
                            </div>
                        </article>

                        <aside class="relative flex flex-col gap-5 overflow-hidden rounded-[30px] border border-[#4d081d]/10 bg-gradient-to-br from-[#e4f3ff]/85 via-[#fff1f8]/90 to-[#fff8e9]/95 p-6 text-[#4d081d] shadow-[0_24px_60px_-30px_rgba(77,8,29,0.45)]">
                            <div class="pointer-events-none absolute -top-16 left-6 h-40 w-40 rounded-full bg-[#ffd6de]/50 blur-3xl"></div>
                            <div class="pointer-events-none absolute -bottom-20 right-4 h-40 w-40 rounded-full bg-[#ffe8c9]/40 blur-3xl"></div>
                            <div class="relative space-y-4">
                                <p
                                    id="alfawz-verse-status"
                                    class="rounded-3xl border border-dashed border-[#f0bac7]/80 bg-gradient-to-r from-[#fff0f6]/85 via-[#f3f8ff]/80 to-[#fff7ec]/85 px-5 py-4 text-sm font-semibold shadow-inner transition-all duration-300"
                                >
                                    <?php esc_html_e( 'Tap “Play Game” to reveal today’s ayah quest.', 'alfawzquran' ); ?>
                                </p>
                                <p id="alfawz-verse-question" class="text-lg font-bold leading-relaxed text-[#5f0d26]">
                                    <?php esc_html_e( 'Which insight best captures today’s ayah meaning?', 'alfawzquran' ); ?>
                                </p>
                                <div id="alfawz-verse-options" class="grid grid-cols-1 gap-3">
                                    <p class="rounded-3xl border border-dashed border-[#f4c7d3] bg-gradient-to-r from-[#fff1f9]/80 via-[#f4f8ff]/80 to-[#fff7ec]/80 px-4 py-3 text-sm font-semibold text-[#b4637a] shadow-inner">
                                        <?php esc_html_e( 'Your answer choices will appear once you begin.', 'alfawzquran' ); ?>
                                    </p>
                                </div>
                                <div
                                    id="alfawz-verse-summary"
                                    class="hidden space-y-3 rounded-3xl border border-[#ffd6de]/80 bg-gradient-to-r from-[#fff2f9]/85 via-[#f5f8ff]/85 to-[#fff8ed]/85 px-5 py-4 text-sm font-semibold text-[#4d081d] shadow-inner"
                                >
                                    <h3 class="text-base font-bold text-[#5f0d26]">
                                        <?php esc_html_e( 'Meaning Spotlight', 'alfawzquran' ); ?>
                                    </h3>
                                    <p id="alfawz-verse-summary-text" class="leading-relaxed text-[#7a0f32]"></p>
                                    <p id="alfawz-verse-option-summary" class="hidden leading-relaxed text-[#7a0f32]/90"></p>
                                </div>
                            </div>
                        </aside>
                    </div>

                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div class="space-y-4 rounded-[30px] border border-[#ffd6de]/70 bg-gradient-to-r from-[#fff2f9]/90 via-[#f2f8ff]/88 to-[#fff6eb]/90 p-6 text-[#4d081d] shadow-inner" id="alfawz-verse-keywords">
                            <h3 class="flex items-center gap-3 text-lg font-bold text-[#4d081d]">
                                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fde8ef] text-lg shadow-inner" aria-hidden="true">✨</span>
                                <?php esc_html_e( 'Key Word Glow', 'alfawzquran' ); ?>
                            </h3>
                            <p class="rounded-3xl border border-dashed border-[#f4c7d3] bg-gradient-to-r from-[#fff0f8]/80 via-[#f2f8ff]/80 to-[#fff6ea]/80 px-4 py-3 text-sm font-semibold text-[#b4637a] shadow-inner">
                                <?php esc_html_e( 'Meaning cards will shimmer here once you start the quest.', 'alfawzquran' ); ?>
                            </p>
                        </div>
                        <div class="space-y-4 rounded-[30px] border border-[#f4c7d3]/80 bg-gradient-to-r from-[#fff3f9]/90 via-[#f2f9ff]/88 to-[#fff6ea]/90 p-6 text-[#4d081d] shadow-inner">
                            <h3 class="flex items-center gap-3 text-lg font-bold text-[#4d081d]">
                                <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ffe7d6] text-lg shadow-inner" aria-hidden="true">📝</span>
                                <?php esc_html_e( 'Reflection Prompts', 'alfawzquran' ); ?>
                            </h3>
                            <ul class="space-y-3" id="alfawz-verse-reflection-list">
                                <li class="rounded-3xl border border-dashed border-[#f4c7d3] bg-gradient-to-r from-[#fff0f8]/80 via-[#f2f8ff]/80 to-[#fff6ea]/80 px-4 py-3 text-sm font-semibold text-[#b4637a] shadow-inner">
                                    <?php esc_html_e( 'You’ll unlock personalised prompts after playing the game.', 'alfawzquran' ); ?>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <header class="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#2b1b60] via-[#7f2f88] to-[#ffd8a8] p-8 text-center text-[#fff8f2] shadow-2xl">
                <div class="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl"></div>
                <div class="pointer-events-none absolute -right-6 top-6 h-28 w-28 rounded-full bg-[#fbeadd]/40 blur-xl"></div>
                <div class="relative mx-auto flex max-w-xl flex-col items-center space-y-4">
                    <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-5xl shadow-lg" aria-hidden="true">🎮</div>
                    <div>
                        <h1 class="text-4xl font-black tracking-tight sm:text-[42px]">
                            <?php esc_html_e( 'Your Quranic Quest', 'alfawzquran' ); ?>
                        </h1>
                        <p class="mt-3 text-lg font-medium text-[#ffece1]">
                            <?php esc_html_e( 'Every verse you recite ripples with barakah—watch your divine rewards bloom in this joyful game hub.', 'alfawzquran' ); ?>
                        </p>
                    </div>
                    <div class="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#ffe7df]">
                        <span class="h-2 w-2 rounded-full bg-[#ffe7df]"></span>
                        <?php esc_html_e( 'Student Adventure Mode', 'alfawzquran' ); ?>
                    </div>
                    <div class="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                        <button
                            id="alfawz-game-hero-play"
                            type="button"
                            class="inline-flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#ffe7df] shadow-lg shadow-black/25 transition-all duration-300 hover:-translate-y-1 hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#8d1f3f]"
                        >
                            <span aria-hidden="true" class="text-base" data-role="hero-play-icon">▶</span>
                            <span data-role="hero-play-label"><?php esc_html_e( 'Play Game', 'alfawzquran' ); ?></span>
                        </button>
                        <p class="text-center text-sm font-semibold text-[#ffece1] opacity-90 sm:text-left">
                            <?php esc_html_e( 'Jump into Virtue Garden Tycoon to start cultivating today.', 'alfawzquran' ); ?>
                        </p>
                    </div>
                </div>
            </header>

            <section aria-label="<?php esc_attr_e( 'Your live progress stats', 'alfawzquran' ); ?>" class="space-y-4">
                <div class="flex items-center justify-between">
                    <h2 class="flex items-center gap-3 text-2xl font-bold text-[#4d081d]">
                        <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fbe0e8] text-2xl shadow-inner" aria-hidden="true">🌟</span>
                        <?php esc_html_e( 'Live Blessing Totals', 'alfawzquran' ); ?>
                    </h2>
                    <span class="hidden text-sm font-semibold text-[#7a0f32] sm:block">
                        <?php esc_html_e( 'Numbers shimmer when they grow — keep the streak alive!', 'alfawzquran' ); ?>
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-5 sm:grid-cols-3" id="alfawz-stat-cards">
                    <div class="group relative overflow-hidden rounded-3xl border border-[#8b1e3f]/20 bg-gradient-to-br from-[#fff7fb]/95 via-[#f3f9ff]/95 to-[#fff5eb]/95 p-6 text-center shadow-xl shadow-[#2e0715]/10 transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#8b1e3f]/12 via-transparent to-[#f9f1e8]/80 opacity-0 transition duration-300 group-hover:opacity-100"></div>
                        <div class="relative text-8xl text-[#36454F]" aria-hidden="true">⭐</div>
                        <p class="relative mt-3 text-8xl font-black text-[#36454F] drop-shadow-sm" data-stat="hasanat">0</p>
                        <p class="relative mt-2 text-2xl font-semibold uppercase tracking-[0.3em] text-[#36454F]">
                            <?php esc_html_e( 'Hasanat', 'alfawzquran' ); ?>
                        </p>
                    </div>
                    <div class="group relative overflow-hidden rounded-3xl border border-[#8b1e3f]/20 bg-gradient-to-br from-[#f4f9ff]/95 via-[#fff3f6]/95 to-[#fff6e8]/95 p-6 text-center shadow-xl shadow-[#2e0715]/10 transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#611229]/12 via-transparent to-[#f5ecde]/80 opacity-0 transition duration-300 group-hover:opacity-100"></div>
                        <div class="relative text-8xl text-[#36454F]" aria-hidden="true">📖</div>
                        <p class="relative mt-3 text-8xl font-black text-[#36454F] drop-shadow-sm" data-stat="verses">0</p>
                        <p class="relative mt-2 text-2xl font-semibold uppercase tracking-[0.3em] text-[#36454F]">
                            <?php esc_html_e( 'Verses Read', 'alfawzquran' ); ?>
                        </p>
                    </div>
                    <div class="group relative overflow-hidden rounded-3xl border border-[#8b1e3f]/20 bg-gradient-to-br from-[#fff3f6]/95 via-[#f2f7ff]/95 to-[#fff4eb]/95 p-6 text-center shadow-xl shadow-[#2e0715]/10 transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#a53d59]/12 via-transparent to-[#fde6d9]/80 opacity-0 transition duration-300 group-hover:opacity-100"></div>
                        <div class="relative text-8xl text-[#36454F]" aria-hidden="true">🔥</div>
                        <p class="relative mt-3 text-8xl font-black text-[#36454F] drop-shadow-sm" data-stat="streak">0</p>
                        <p class="relative mt-2 text-2xl font-semibold uppercase tracking-[0.3em] text-[#36454F]">
                            <?php esc_html_e( 'Day Streak', 'alfawzquran' ); ?>
                        </p>
                    </div>
                </div>
            </section>

            <section aria-label="<?php esc_attr_e( 'Your unlocked achievements', 'alfawzquran' ); ?>" class="space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <h2 class="flex items-center gap-3 text-2xl font-bold text-[#4d081d]">
                        <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fde5d9] text-2xl shadow-inner" aria-hidden="true">🏆</span>
                        <?php esc_html_e( 'Your Achievements', 'alfawzquran' ); ?>
                    </h2>
                    <span id="alfawz-achievement-summary" class="text-sm font-semibold uppercase tracking-[0.24em] text-[#b4637a]"></span>
                </div>
                <div id="alfawz-achievement-grid" class="grid grid-cols-1 gap-5 sm:grid-cols-2"></div>
                <p id="alfawz-achievement-empty" class="hidden rounded-3xl border border-dashed border-[#b4637a]/40 bg-gradient-to-r from-[#fff2f9]/90 via-[#f3f8ff]/88 to-[#fff6ec]/90 p-6 text-center text-lg font-semibold text-[#7a0f32] shadow-inner">
                    <?php esc_html_e( 'Keep reciting to unlock your first badge!', 'alfawzquran' ); ?>
                </p>
            </section>

            <section aria-label="<?php esc_attr_e( 'Egg challenge progress', 'alfawzquran' ); ?>" class="space-y-4">
                <div id="alfawz-egg-card" data-phase="egg" class="relative overflow-hidden rounded-[30px] border border-[#b4637a]/30 bg-gradient-to-br from-[#f1f4ff]/90 via-[#fde7ff]/90 to-[#fff3e6]/95 p-8 text-center shadow-xl shadow-[#320a16]/15">
                    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_65%)]"></div>
                    <div class="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-[#8b1e3f] px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-white shadow-lg" id="alfawz-egg-level">
                        <?php esc_html_e( 'Level 1', 'alfawzquran' ); ?>
                    </div>
                    <div class="relative mx-auto flex h-32 w-32 items-end justify-center" aria-hidden="true">
                        <div id="alfawz-egg-emoji" class="alfawz-egg-emoji inline-flex h-28 w-28 items-center justify-center text-7xl">🥚</div>
                        <div id="alfawz-growth-visual" class="alfawz-growth-visual">
                            <div class="alfawz-growth-trunk"></div>
                            <div class="alfawz-growth-canopy"></div>
                            <span class="alfawz-growth-leaf" data-leaf="1"></span>
                            <span class="alfawz-growth-leaf" data-leaf="2"></span>
                            <span class="alfawz-growth-leaf" data-leaf="3"></span>
                            <span class="alfawz-growth-leaf" data-leaf="4"></span>
                            <span class="alfawz-growth-leaf" data-leaf="5"></span>
                        </div>
                    </div>
                    <h3 id="alfawz-egg-title" class="relative mt-4 text-2xl font-black text-[#5f0d26]">
                        <?php esc_html_e( 'Hatch the Knowledge Egg!', 'alfawzquran' ); ?>
                    </h3>
                    <p id="alfawz-egg-message" class="relative mt-3 text-lg font-medium text-[#7a0f32]">
                        <?php esc_html_e( 'Recite verses to crack it open.', 'alfawzquran' ); ?>
                    </p>
                    <div class="relative mt-6 h-3 w-full overflow-hidden rounded-full bg-[#f2d7cf]/80">
                        <div id="alfawz-egg-progress" class="h-full rounded-full bg-gradient-to-r from-[#8b1e3f] via-[#c43a59] to-[#ffb8c4] transition-all duration-500" style="width:0%"></div>
                    </div>
                    <p id="alfawz-egg-label" class="relative mt-3 text-lg font-semibold text-[#5f0d26]">0 / 0</p>
                    <button
                        id="alfawz-egg-play"
                        type="button"
                        class="relative mt-6 inline-flex items-center gap-2 rounded-full bg-[#8b1e3f] px-6 py-2.5 text-base font-semibold text-white shadow-lg shadow-[#4d081d]/25 transition-all duration-300 hover:-translate-y-1 hover:bg-[#a02249] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b1e3f]/60 focus-visible:ring-offset-2"
                    >
                        <span aria-hidden="true" class="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-500 bg-clip-text text-[1.2rem] text-transparent">▶</span>
                        <span data-role="alfawz-egg-play-label" class="bg-gradient-to-r from-amber-300 via-rose-400 to-purple-500 bg-clip-text text-[1.2rem] text-transparent"><?php esc_html_e( 'Play Now', 'alfawzquran' ); ?></span>
                    </button>
                </div>
            </section>

            <section aria-label="<?php esc_attr_e( 'Daily quests', 'alfawzquran' ); ?>" class="space-y-4">
                <div class="flex flex-wrap items-center gap-3">
                    <h2 class="flex items-center gap-3 text-2xl font-bold text-[#4d081d]">
                        <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ffe7df] text-2xl shadow-inner" aria-hidden="true">📜</span>
                        <?php esc_html_e( 'Daily Quests', 'alfawzquran' ); ?>
                    </h2>
                    <span class="text-sm font-semibold uppercase tracking-[0.24em] text-[#b4637a]">
                        <?php esc_html_e( 'Complete quests to power-up your streak', 'alfawzquran' ); ?>
                    </span>
                </div>
                <div id="alfawz-quest-list" class="space-y-4"></div>
                <p id="alfawz-quest-empty" class="hidden rounded-3xl border border-dashed border-[#c68496]/40 bg-gradient-to-r from-[#fff2f9]/90 via-[#f2f8ff]/88 to-[#fff6ec]/90 p-6 text-center text-lg font-semibold text-[#8b1e3f] shadow-inner">
                    <?php esc_html_e( 'No quests available right now. Come back soon for new challenges!', 'alfawzquran' ); ?>
                </p>
            </section>
        </div>
    </div>
</div>
<?php
$current_page = 'games';
?>

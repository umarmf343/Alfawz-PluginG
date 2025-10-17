<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-game-panel" class="relative mx-auto max-w-5xl overflow-hidden rounded-[42px] bg-gradient-to-br from-[#4d081d] via-[#7a0f32] to-[#f9f1e8] p-6 pb-16 shadow-2xl shadow-[#4d081d]/40 ring-1 ring-white/20 sm:p-10">
    <div class="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f7eadf]/50 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-[#ffdee0]/40 blur-2xl"></div>
    <div class="relative space-y-8 text-[#311019]">
        <div id="alfawz-game-loading" class="flex items-center justify-center gap-3 rounded-3xl border border-[#b4637a]/30 bg-white/80 px-5 py-6 text-lg font-semibold text-[#7a0f32] shadow-lg shadow-[#310915]/10 backdrop-blur">
            <span class="inline-flex h-3 w-3 animate-pulse rounded-full bg-[#c43a59]"></span>
            <?php esc_html_e( 'Loading your joyful progress…', 'alfawzquran' ); ?>
        </div>

        <div id="alfawz-game-error" class="hidden rounded-3xl border border-rose-200/70 bg-rose-100/90 px-5 py-6 text-center text-lg font-semibold text-rose-800 shadow-lg shadow-rose-300/50 backdrop-blur"></div>

        <div id="alfawz-game-content" class="hidden space-y-10">
            <section aria-label="<?php esc_attr_e( 'Virtue Garden Tycoon habit game', 'alfawzquran' ); ?>" class="space-y-8" id="virtue-garden">
                <div id="virtue-garden-intro" class="relative overflow-hidden rounded-[36px] border border-[#f9cfd9]/60 bg-gradient-to-br from-[#4d081d] via-[#7a1332] to-[#f9d8c9] p-8 text-[#fff3ed] shadow-[0_40px_90px_-30px_rgba(77,8,29,0.65)]">
                    <div class="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-white/15 blur-3xl"></div>
                    <div class="pointer-events-none absolute -right-10 -bottom-14 h-64 w-64 rounded-full bg-[#ffe5ec]/40 blur-3xl"></div>
                    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_62%)]"></div>
                    <div class="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div class="space-y-5">
                            <span class="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-[#ffe7df] shadow-inner">
                                <span class="h-2 w-2 rounded-full bg-[#ffe7df]"></span>
                                <?php esc_html_e( 'Daily Quranic Habit Game', 'alfawzquran' ); ?>
                            </span>
                            <div class="space-y-4">
                                <h2 class="text-4xl font-black tracking-tight sm:text-[46px]">
                                    <?php esc_html_e( 'Virtue Garden Tycoon', 'alfawzquran' ); ?>
                                </h2>
                                <p class="max-w-2xl text-base font-medium text-[#ffece5]/90">
                                    <?php esc_html_e( 'Recite, reflect, and learn tafsir snippets to earn virtue seeds. Grow luminous plants with unique barakah powers and keep your garden thriving with daily care.', 'alfawzquran' ); ?>
                                </p>
                            </div>
                            <ul class="grid grid-cols-1 gap-3 text-sm font-semibold text-[#ffe3de]/85 sm:grid-cols-3">
                                <li class="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 shadow-inner">
                                    <span aria-hidden="true">🌱</span>
                                    <?php esc_html_e( 'Unlock rare blossoms with streaks', 'alfawzquran' ); ?>
                                </li>
                                <li class="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 shadow-inner">
                                    <span aria-hidden="true">🪴</span>
                                    <?php esc_html_e( 'Each task plants a new attribute', 'alfawzquran' ); ?>
                                </li>
                                <li class="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 shadow-inner">
                                    <span aria-hidden="true">⏰</span>
                                    <?php esc_html_e( 'Daily care keeps gardens radiant', 'alfawzquran' ); ?>
                                </li>
                            </ul>
                        </div>
                        <div class="flex flex-col items-start gap-4">
                            <button
                                id="virtue-garden-start"
                                type="button"
                                class="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-base font-semibold text-[#7a1332] shadow-xl shadow-[#310915]/25 transition-all duration-300 hover:-translate-y-1 hover:bg-[#fff7f5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe2eb]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#7a1332]"
                            >
                                <span aria-hidden="true" class="text-lg">▶</span>
                                <?php esc_html_e( 'Play Game', 'alfawzquran' ); ?>
                            </button>
                            <p class="max-w-xs text-left text-xs font-semibold uppercase tracking-[0.32em] text-white/75">
                                <?php esc_html_e( 'Habit hook: gardens flourish only with regular care.', 'alfawzquran' ); ?>
                            </p>
                        </div>
                    </div>
                </div>

                <div id="virtue-garden-game" class="hidden space-y-8">
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
                        <article class="relative overflow-hidden rounded-[34px] border border-[#f4c7d3]/60 bg-gradient-to-br from-[#fff7f9]/95 via-[#fde9ef]/95 to-[#fbe1e9]/95 p-7 text-[#4d081d] shadow-[0_32px_80px_-32px_rgba(139,30,63,0.42)] backdrop-blur">
                            <div class="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-[#ffd7e5]/40 blur-3xl"></div>
                            <div class="pointer-events-none absolute -bottom-16 right-6 h-60 w-60 rounded-full bg-[#fff1d7]/40 blur-3xl"></div>
                            <div class="relative space-y-6">
                                <header class="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p id="virtue-garden-day" class="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-[#b4637a] shadow-inner">
                                            <?php esc_html_e( 'Day 1', 'alfawzquran' ); ?>
                                        </p>
                                        <h3 class="mt-3 text-3xl font-black tracking-tight">
                                            <?php esc_html_e( 'Garden Overview', 'alfawzquran' ); ?>
                                        </h3>
                                    </div>
                                    <div class="rounded-3xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-semibold text-[#7a0f32] shadow-inner" id="virtue-garden-habit">
                                        <?php esc_html_e( 'Begin today’s rituals to awaken your first plant.', 'alfawzquran' ); ?>
                                    </div>
                                </header>

                                <p
                                    id="virtue-garden-message"
                                    data-state="idle"
                                    class="rounded-3xl border border-dashed border-[#f4c7d3]/70 bg-white/80 px-5 py-4 text-sm font-semibold text-[#7a0f32] shadow-inner transition-all duration-300"
                                >
                                    <?php esc_html_e( 'Tap “Play Game” to sow your first virtue seeds.', 'alfawzquran' ); ?>
                                </p>

                                <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div class="group relative overflow-hidden rounded-3xl border border-[#f6c5d5]/70 bg-white/90 p-5 shadow-lg shadow-[#320a16]/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#fbe3ec]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        <div class="relative text-xs font-semibold uppercase tracking-[0.32em] text-[#b4637a]">
                                            <?php esc_html_e( 'Virtue Seeds', 'alfawzquran' ); ?>
                                        </div>
                                        <p data-garden-stat="seeds" class="relative mt-3 text-3xl font-black text-[#7a1332]">0</p>
                                        <p class="relative mt-2 text-xs font-medium text-[#9d4158]">
                                            <?php esc_html_e( 'Total seeds earned from your Quranic habits.', 'alfawzquran' ); ?>
                                        </p>
                                    </div>
                                    <div class="group relative overflow-hidden rounded-3xl border border-[#f6c5d5]/70 bg-white/90 p-5 shadow-lg shadow-[#320a16]/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#fde6d9]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        <div class="relative text-xs font-semibold uppercase tracking-[0.32em] text-[#b4637a]">
                                            <?php esc_html_e( 'Garden Radiance', 'alfawzquran' ); ?>
                                        </div>
                                        <p data-garden-stat="radiance" class="relative mt-3 text-3xl font-black text-[#7a1332]">
                                            <?php esc_html_e( 'Seedling Patch (0%)', 'alfawzquran' ); ?>
                                        </p>
                                        <p class="relative mt-2 text-xs font-medium text-[#9d4158]">
                                            <?php esc_html_e( 'Average growth across every plant in your grove.', 'alfawzquran' ); ?>
                                        </p>
                                    </div>
                                    <div class="group relative overflow-hidden rounded-3xl border border-[#f6c5d5]/70 bg-white/90 p-5 shadow-lg shadow-[#320a16]/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ffe7df]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        <div class="relative text-xs font-semibold uppercase tracking-[0.32em] text-[#b4637a]">
                                            <?php esc_html_e( 'Consistency Streak', 'alfawzquran' ); ?>
                                        </div>
                                        <p data-garden-stat="streak" class="relative mt-3 text-3xl font-black text-[#7a1332]">
                                            <?php esc_html_e( '0 days', 'alfawzquran' ); ?>
                                        </p>
                                        <p class="relative mt-2 text-xs font-medium text-[#9d4158]">
                                            <?php esc_html_e( 'Return daily so your virtue seeds never dry out.', 'alfawzquran' ); ?>
                                        </p>
                                    </div>
                                </div>

                                <div class="space-y-5 rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-inner">
                                    <div class="flex flex-wrap items-center justify-between gap-3">
                                        <h4 class="flex items-center gap-2 text-lg font-semibold text-[#4d081d]">
                                            <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fde8ef] text-xl shadow-inner" aria-hidden="true">🪴</span>
                                            <?php esc_html_e( 'Garden Grove', 'alfawzquran' ); ?>
                                        </h4>
                                        <span class="rounded-full bg-[#fde9ef] px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#b4637a]">
                                            <?php esc_html_e( 'Unique plant attributes unlock with growth', 'alfawzquran' ); ?>
                                        </span>
                                    </div>
                                    <div id="virtue-garden-plants" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"></div>
                                    <p id="virtue-garden-plant-empty" class="rounded-3xl border border-dashed border-[#f4c7d3]/70 bg-white/80 px-5 py-4 text-sm font-semibold text-[#7a0f32] shadow-inner">
                                        <?php esc_html_e( 'No plants yet—complete a ritual to plant your first virtue seed.', 'alfawzquran' ); ?>
                                    </p>
                                </div>

                                <div class="space-y-4 rounded-[30px] border border-[#f4c7d3]/60 bg-white/90 p-6 shadow-inner">
                                    <div class="flex items-center justify-between">
                                        <h4 class="flex items-center gap-2 text-lg font-semibold text-[#4d081d]">
                                            <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fde0e8] text-xl shadow-inner" aria-hidden="true">📜</span>
                                            <?php esc_html_e( 'Virtue Chronicle', 'alfawzquran' ); ?>
                                        </h4>
                                        <span class="text-xs font-semibold uppercase tracking-[0.28em] text-[#b4637a]">
                                            <?php esc_html_e( 'Latest garden events', 'alfawzquran' ); ?>
                                        </span>
                                    </div>
                                    <ul id="virtue-garden-log" class="space-y-3"></ul>
                                </div>
                            </div>
                        </article>

                        <aside class="relative flex h-full flex-col gap-6 overflow-hidden rounded-[34px] border border-[#4d081d]/10 bg-gradient-to-br from-[#4d081d] via-[#80173a] to-[#b3264a] p-6 text-white shadow-[0_28px_70px_-28px_rgba(38,6,16,0.65)]">
                            <div class="space-y-3">
                                <h3 class="flex items-center gap-3 text-2xl font-bold">
                                    <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-inner" aria-hidden="true">🎮</span>
                                    <?php esc_html_e( 'Daily Rituals', 'alfawzquran' ); ?>
                                </h3>
                                <p class="text-sm font-medium text-white/80">
                                    <?php esc_html_e( 'Complete Quranic actions to collect virtue seeds and keep your garden glowing with barakah.', 'alfawzquran' ); ?>
                                </p>
                            </div>

                            <div id="virtue-garden-task-list" class="space-y-4"></div>

                            <div class="space-y-3 rounded-3xl border border-white/20 bg-white/10 p-5 shadow-inner">
                                <button
                                    id="virtue-garden-care"
                                    type="button"
                                    class="w-full rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#7a1332] shadow-lg shadow-[#310915]/25 transition-all duration-300 hover:-translate-y-1 hover:bg-[#fff3f7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe2eb]/70 focus-visible:ring-offset-2"
                                >
                                    <?php esc_html_e( 'Daily Care Pulse', 'alfawzquran' ); ?>
                                </button>
                                <div class="h-2.5 w-full overflow-hidden rounded-full bg-white/30">
                                    <div id="virtue-garden-care-meter" class="h-full rounded-full bg-gradient-to-r from-[#ffe0ee] via-[#f59bb4] to-[#ffb8c4] transition-all duration-500" style="width:60%"></div>
                                </div>
                                <p id="virtue-garden-mood" class="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
                                    <?php esc_html_e( 'Your garden is waiting for gentle care.', 'alfawzquran' ); ?>
                                </p>
                            </div>

                            <div class="rounded-3xl border border-white/20 bg-white/10 p-4 text-xs font-medium text-white/80 shadow-inner">
                                <?php esc_html_e( 'Habit hook: visit daily to prevent your plants from fading. Missing a day lowers the care meter, so keep nurturing the grove!', 'alfawzquran' ); ?>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            <header class="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#541428] via-[#8d1f3f] to-[#f4d6c7] p-8 text-center text-[#fff8f2] shadow-2xl">
                <div class="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl"></div>
                <div class="pointer-events-none absolute -right-6 top-6 h-28 w-28 rounded-full bg-[#fbeadd]/40 blur-xl"></div>
                <div class="relative mx-auto flex max-w-xl flex-col items-center space-y-4">
                    <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-5xl shadow-lg" aria-hidden="true">🌷</div>
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
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-3" id="alfawz-stat-cards">
                    <div class="group relative overflow-hidden rounded-3xl border border-[#8b1e3f]/20 bg-white/95 p-6 text-center shadow-xl shadow-[#2e0715]/10 transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#8b1e3f]/12 via-transparent to-[#f9f1e8]/80 opacity-0 transition duration-300 group-hover:opacity-100"></div>
                        <div class="relative text-4xl" aria-hidden="true">⭐</div>
                        <p class="relative mt-3 text-4xl font-black text-[#7a0f32] drop-shadow-sm" data-stat="hasanat">0</p>
                        <p class="relative mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#b4637a]">
                            <?php esc_html_e( 'Hasanat', 'alfawzquran' ); ?>
                        </p>
                    </div>
                    <div class="group relative overflow-hidden rounded-3xl border border-[#8b1e3f]/20 bg-white/95 p-6 text-center shadow-xl shadow-[#2e0715]/10 transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#611229]/12 via-transparent to-[#f5ecde]/80 opacity-0 transition duration-300 group-hover:opacity-100"></div>
                        <div class="relative text-4xl" aria-hidden="true">📖</div>
                        <p class="relative mt-3 text-4xl font-black text-[#4d081d] drop-shadow-sm" data-stat="verses">0</p>
                        <p class="relative mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#b4637a]">
                            <?php esc_html_e( 'Verses Read', 'alfawzquran' ); ?>
                        </p>
                    </div>
                    <div class="group relative overflow-hidden rounded-3xl border border-[#8b1e3f]/20 bg-white/95 p-6 text-center shadow-xl shadow-[#2e0715]/10 transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#a53d59]/12 via-transparent to-[#fde6d9]/80 opacity-0 transition duration-300 group-hover:opacity-100"></div>
                        <div class="relative text-4xl" aria-hidden="true">🔥</div>
                        <p class="relative mt-3 text-4xl font-black text-[#b3264a] drop-shadow-sm" data-stat="streak">0</p>
                        <p class="relative mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#c56982]">
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
                <p id="alfawz-achievement-empty" class="hidden rounded-3xl border border-dashed border-[#b4637a]/40 bg-white/90 p-6 text-center text-lg font-semibold text-[#7a0f32] shadow-inner">
                    <?php esc_html_e( 'Keep reciting to unlock your first badge!', 'alfawzquran' ); ?>
                </p>
            </section>

            <section aria-label="<?php esc_attr_e( 'Egg challenge progress', 'alfawzquran' ); ?>" class="space-y-4">
                <div id="alfawz-egg-card" class="relative overflow-hidden rounded-[30px] border border-[#b4637a]/30 bg-gradient-to-br from-[#fbe6dd]/90 via-[#fcded8]/90 to-[#f9f1e8]/95 p-8 text-center shadow-xl shadow-[#320a16]/15">
                    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_65%)]"></div>
                    <div class="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-[#8b1e3f] px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-white shadow-lg" id="alfawz-egg-level">
                        <?php esc_html_e( 'Level 1', 'alfawzquran' ); ?>
                    </div>
                    <div class="relative text-7xl" id="alfawz-egg-emoji" aria-hidden="true">🥚</div>
                    <h3 class="relative mt-4 text-2xl font-black text-[#5f0d26]">
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
                        class="relative mt-6 inline-flex items-center gap-2 rounded-full bg-[#8b1e3f] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#4d081d]/25 transition-all duration-300 hover:-translate-y-1 hover:bg-[#a02249] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b1e3f]/60 focus-visible:ring-offset-2"
                    >
                        <span aria-hidden="true" class="text-base">▶</span>
                        <span data-role="alfawz-egg-play-label"><?php esc_html_e( 'Play Now', 'alfawzquran' ); ?></span>
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
                <p id="alfawz-quest-empty" class="hidden rounded-3xl border border-dashed border-[#c68496]/40 bg-white/90 p-6 text-center text-lg font-semibold text-[#8b1e3f] shadow-inner">
                    <?php esc_html_e( 'No quests available right now. Come back soon for new challenges!', 'alfawzquran' ); ?>
                </p>
            </section>
        </div>
    </div>
</div>
<?php
$current_page = 'games';
?>

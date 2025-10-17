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
            <header class="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#5f0d26] via-[#8d1f3f] to-[#f4d6c7] p-8 text-center text-[#fff8f2] shadow-2xl">
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

            <section id="virtue-garden-tycoon" aria-label="<?php esc_attr_e( 'Virtue Garden Tycoon game', 'alfawzquran' ); ?>" class="space-y-8">
                <div class="relative overflow-hidden rounded-[34px] border border-[#f4c7d3]/60 bg-gradient-to-r from-[#fff2f2]/80 via-[#ffe6f2]/90 to-[#fffaf0]/95 p-8 shadow-xl shadow-[#3a0a18]/10">
                    <div class="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/40 blur-2xl"></div>
                    <div class="pointer-events-none absolute -bottom-10 right-10 h-40 w-40 rounded-full bg-[#ffcfda]/30 blur-3xl"></div>
                    <div class="relative grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                        <div class="space-y-4 text-[#4d081d]">
                            <p class="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.32em] text-[#b4637a]">
                                <span class="h-2 w-2 rounded-full bg-[#b4637a]"></span>
                                <?php esc_html_e( 'Mini-Game Spotlight', 'alfawzquran' ); ?>
                            </p>
                            <h2 class="text-3xl font-black tracking-tight sm:text-[34px]">
                                <?php esc_html_e( 'Virtue Garden Tycoon', 'alfawzquran' ); ?>
                            </h2>
                            <p class="text-base leading-relaxed text-[#6f1330]">
                                <?php esc_html_e( 'Complete heartfelt Quranic missions to earn virtue seeds, unlock radiant plants, and nurture a living sanctuary of remembrance.', 'alfawzquran' ); ?>
                            </p>
                            <ul class="space-y-2 text-sm text-[#7a0f32]">
                                <li class="flex items-start gap-3"><span aria-hidden="true" class="mt-1 text-base">🌱</span><span><?php esc_html_e( 'Recite, reflect, and learn tafsir snippets to harvest glowing seeds.', 'alfawzquran' ); ?></span></li>
                                <li class="flex items-start gap-3"><span aria-hidden="true" class="mt-1 text-base">🏡</span><span><?php esc_html_e( 'Spend seeds to unlock new plots and evolve plants with unique blessings.', 'alfawzquran' ); ?></span></li>
                                <li class="flex items-start gap-3"><span aria-hidden="true" class="mt-1 text-base">🔥</span><span><?php esc_html_e( 'Maintain your daily streak so the garden stays vibrant and full of life.', 'alfawzquran' ); ?></span></li>
                            </ul>
                            <div class="flex flex-wrap items-center gap-3 pt-4">
                                <button
                                    id="virtue-garden-start"
                                    type="button"
                                    class="group inline-flex items-center gap-3 rounded-full bg-[#8b1e3f] px-6 py-2.5 text-base font-semibold text-white shadow-lg shadow-[#4d081d]/30 transition-all duration-300 hover:-translate-y-1 hover:bg-[#a02249] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b1e3f]/60 focus-visible:ring-offset-2"
                                >
                                    <span class="text-lg transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">▶</span>
                                    <?php esc_html_e( 'Play Game', 'alfawzquran' ); ?>
                                </button>
                                <span class="rounded-full bg-white/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#b4637a] shadow-inner"><?php esc_html_e( 'Daily habit builder', 'alfawzquran' ); ?></span>
                            </div>
                        </div>
                        <div class="relative flex items-center justify-center">
                            <div class="virtue-garden-peek absolute inset-0"></div>
                            <div class="relative rounded-[26px] border border-white/60 bg-gradient-to-br from-[#8b1e3f]/90 via-[#c43a59]/80 to-[#ff9fb7]/85 p-6 text-white shadow-[0_30px_55px_-25px_rgba(77,8,29,0.75)]">
                                <p class="text-sm font-semibold uppercase tracking-[0.28em] text-white/70"><?php esc_html_e( 'Preview', 'alfawzquran' ); ?></p>
                                <h3 class="mt-4 text-2xl font-black leading-tight"><?php esc_html_e( 'Unlock the "Garden of Light"', 'alfawzquran' ); ?></h3>
                                <p class="mt-3 text-sm leading-relaxed text-white/85"><?php esc_html_e( 'Grow luminescent plants, discover whispered duas, and trade seeds for wondrous upgrades.', 'alfawzquran' ); ?></p>
                                <div class="mt-5 flex items-center gap-3">
                                    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-3xl shadow-inner" aria-hidden="true">🌸</div>
                                    <div class="flex-1">
                                        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/60"><?php esc_html_e( 'Next unlock', 'alfawzquran' ); ?></p>
                                        <p class="text-sm font-semibold text-white"><?php esc_html_e( 'Luminous Palm • +10 harmony', 'alfawzquran' ); ?></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="virtue-garden-screen" class="hidden space-y-10">
                    <div class="grid gap-5 lg:grid-cols-4">
                        <div class="virtue-garden-stat-card">
                            <div class="virtue-garden-stat-bg"></div>
                            <div class="relative z-10">
                                <p class="virtue-garden-stat-label"><?php esc_html_e( 'Virtue Seeds', 'alfawzquran' ); ?></p>
                                <p id="virtue-seed-count" class="virtue-garden-stat-value">0</p>
                                <p class="virtue-garden-stat-note"><?php esc_html_e( 'Spend seeds to unlock new plots.', 'alfawzquran' ); ?></p>
                            </div>
                            <span class="virtue-garden-stat-icon" aria-hidden="true">💠</span>
                        </div>
                        <div class="virtue-garden-stat-card">
                            <div class="virtue-garden-stat-bg"></div>
                            <div class="relative z-10">
                                <p class="virtue-garden-stat-label"><?php esc_html_e( 'Garden Harmony', 'alfawzquran' ); ?></p>
                                <p id="virtue-harmony" class="virtue-garden-stat-value">0</p>
                                <p class="virtue-garden-stat-note"><?php esc_html_e( 'Harmony rises as plants flourish.', 'alfawzquran' ); ?></p>
                            </div>
                            <span class="virtue-garden-stat-icon" aria-hidden="true">🕊️</span>
                        </div>
                        <div class="virtue-garden-stat-card">
                            <div class="virtue-garden-stat-bg"></div>
                            <div class="relative z-10">
                                <p class="virtue-garden-stat-label"><?php esc_html_e( 'Daily Flourish', 'alfawzquran' ); ?></p>
                                <p id="virtue-flourish" class="virtue-garden-stat-value">0%</p>
                                <div class="mt-3 h-2.5 w-full rounded-full bg-white/30">
                                    <div id="virtue-flourish-bar" class="h-full rounded-full bg-gradient-to-r from-[#ffe0f1] via-[#ffd0d6] to-[#ffc98c] transition-all duration-500" style="width: 0%"></div>
                                </div>
                                <p class="virtue-garden-stat-note"><?php esc_html_e( 'Complete missions to hit 100%.', 'alfawzquran' ); ?></p>
                            </div>
                            <span class="virtue-garden-stat-icon" aria-hidden="true">🌈</span>
                        </div>
                        <div class="virtue-garden-stat-card">
                            <div class="virtue-garden-stat-bg"></div>
                            <div class="relative z-10">
                                <p class="virtue-garden-stat-label"><?php esc_html_e( 'Streak', 'alfawzquran' ); ?></p>
                                <p id="virtue-streak" class="virtue-garden-stat-value">0</p>
                                <p class="virtue-garden-stat-note"><?php esc_html_e( 'Keep visiting to protect your streak.', 'alfawzquran' ); ?></p>
                            </div>
                            <span class="virtue-garden-stat-icon" aria-hidden="true">🔥</span>
                        </div>
                    </div>

                    <div class="rounded-[30px] border border-[#f4c7d3]/70 bg-white/95 p-6 shadow-xl shadow-[#3a0a18]/10 backdrop-blur">
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 class="text-2xl font-black text-[#4d081d]">
                                    <?php esc_html_e( 'Today\'s Quranic Missions', 'alfawzquran' ); ?>
                                </h3>
                                <p class="mt-1 text-sm font-semibold uppercase tracking-[0.28em] text-[#b4637a]">
                                    <?php esc_html_e( 'Complete tasks to collect virtue seeds', 'alfawzquran' ); ?>
                                </p>
                            </div>
                            <div class="flex items-center gap-3 rounded-full bg-[#ffe8f0] px-4 py-2 text-sm font-semibold text-[#8b1e3f] shadow-inner">
                                <span class="text-lg" aria-hidden="true">⏳</span>
                                <span id="virtue-daily-summary"><?php esc_html_e( '0 of 0 missions completed', 'alfawzquran' ); ?></span>
                            </div>
                        </div>
                        <div class="mt-6 grid gap-4 md:grid-cols-3" id="virtue-garden-task-list"></div>
                    </div>

                    <div class="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                        <div class="rounded-[30px] border border-[#f2cad8]/60 bg-gradient-to-br from-white/98 via-[#fff2f6]/95 to-[#fff9f2]/90 p-6 shadow-xl shadow-[#320a16]/10">
                            <div class="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h3 class="text-2xl font-black text-[#4d081d]">
                                        <?php esc_html_e( 'Your Virtue Garden', 'alfawzquran' ); ?>
                                    </h3>
                                    <p class="mt-1 text-sm font-semibold uppercase tracking-[0.28em] text-[#b4637a]">
                                        <?php esc_html_e( 'Invest seeds to nurture radiant plants', 'alfawzquran' ); ?>
                                    </p>
                                </div>
                                <div class="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#7a0f32] shadow-inner">
                                    <span class="text-base" aria-hidden="true">🌤️</span>
                                    <span id="virtue-garden-weather"><?php esc_html_e( 'Tranquil skies', 'alfawzquran' ); ?></span>
                                </div>
                            </div>
                            <div id="virtue-garden-grid" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"></div>
                        </div>
                        <div class="flex flex-col gap-6">
                            <div class="rounded-[30px] border border-[#f7d9e2]/70 bg-white/95 p-6 shadow-lg shadow-[#3a0a18]/15">
                                <h3 class="text-xl font-black text-[#4d081d]">
                                    <?php esc_html_e( 'Garden Journal', 'alfawzquran' ); ?>
                                </h3>
                                <p class="mt-1 text-sm text-[#7a0f32]">
                                    <?php esc_html_e( 'Celebrate small wins and track how your sanctuary blossoms.', 'alfawzquran' ); ?>
                                </p>
                                <div id="virtue-garden-story" class="mt-4 space-y-3 max-h-72 overflow-y-auto pr-2 text-sm text-[#5f0d26]"></div>
                            </div>
                            <div class="rounded-[30px] border border-[#f7d9e2]/70 bg-gradient-to-br from-[#ffe6f0]/90 via-[#fff2e6]/90 to-[#ffffff]/95 p-6 shadow-lg shadow-[#3a0a18]/10">
                                <h3 class="text-xl font-black text-[#4d081d]">
                                    <?php esc_html_e( 'Upgrade Boutique', 'alfawzquran' ); ?>
                                </h3>
                                <p class="mt-1 text-sm text-[#7a0f32]">
                                    <?php esc_html_e( 'Trade virtue seeds for radiant boosts to keep your garden thriving.', 'alfawzquran' ); ?>
                                </p>
                                <div class="mt-4 space-y-3" id="virtue-upgrade-list"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    id="virtue-garden-modal"
                    class="virtue-garden-modal hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="virtue-garden-modal-title"
                >
                    <div class="virtue-garden-modal__backdrop" data-role="modal-dismiss"></div>
                    <div class="virtue-garden-modal__panel" role="document">
                        <div class="virtue-garden-modal__halo" aria-hidden="true"></div>
                        <div class="virtue-garden-modal__content">
                            <div class="flex items-start justify-between gap-4">
                                <div>
                                    <p id="virtue-garden-modal-chip" class="virtue-garden-modal__chip"></p>
                                    <h3 id="virtue-garden-modal-title" class="virtue-garden-modal__title"></h3>
                                </div>
                                <button type="button" class="virtue-garden-modal__close" data-role="modal-dismiss" aria-label="<?php esc_attr_e( 'Close task window', 'alfawzquran' ); ?>">✕</button>
                            </div>
                            <p id="virtue-garden-modal-description" class="virtue-garden-modal__description"></p>
                            <div id="virtue-garden-modal-prompt" class="virtue-garden-modal__prompt"></div>
                            <div class="flex flex-wrap items-center justify-between gap-4 pt-4">
                                <div class="flex items-center gap-2 text-sm font-semibold text-[#7a0f32]">
                                    <span aria-hidden="true">🌟</span>
                                    <span id="virtue-garden-modal-reward"></span>
                                </div>
                                <div class="flex gap-3">
                                    <button type="button" class="virtue-garden-modal__secondary" data-role="modal-dismiss">
                                        <?php esc_html_e( 'Maybe later', 'alfawzquran' ); ?>
                                    </button>
                                    <button type="button" id="virtue-garden-complete-task" class="virtue-garden-modal__primary">
                                        <?php esc_html_e( 'Complete Mission', 'alfawzquran' ); ?>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</div>
<?php
$current_page = 'games';
?>

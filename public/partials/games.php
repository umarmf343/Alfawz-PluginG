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

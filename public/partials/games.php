<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-game-panel" class="mx-auto max-w-5xl space-y-8 rounded-3xl bg-stone-50/95 p-6 pb-16 shadow-xl shadow-emerald-200/70 backdrop-blur">
    <div class="space-y-6">
        <div id="alfawz-game-loading" class="rounded-2xl border border-emerald-200/70 bg-white px-4 py-5 text-center text-base font-medium text-emerald-700 shadow-sm">
            <?php esc_html_e( 'Loading your joyful progress…', 'alfawzquran' ); ?>
        </div>

        <div id="alfawz-game-error" class="hidden rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-center text-base font-semibold text-rose-700 shadow-sm"></div>

        <div id="alfawz-game-content" class="hidden space-y-8">
            <header class="text-center">
                <div class="animate-soft-fade rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
                    <div class="text-5xl" aria-hidden="true">🎮</div>
                    <h1 class="mt-2 text-3xl font-bold tracking-tight">
                        <?php esc_html_e( 'Your Quranic Quest', 'alfawzquran' ); ?>
                    </h1>
                    <p class="mt-3 text-base text-emerald-50">
                        <?php esc_html_e( 'Every verse you recite ripples with barakah—watch your divine rewards bloom.', 'alfawzquran' ); ?>
                    </p>
                </div>
            </header>

            <section aria-label="<?php esc_attr_e( 'Your live progress stats', 'alfawzquran' ); ?>" class="space-y-4">
                <h2 class="text-lg font-semibold text-emerald-800">
                    <?php esc_html_e( 'Live Blessing Totals', 'alfawzquran' ); ?>
                </h2>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-3" id="alfawz-stat-cards">
                    <div class="alfawz-card-hud flex flex-col items-center justify-center rounded-xl border-2 border-emerald-300 bg-white p-5 text-center shadow-md">
                        <div class="text-3xl" aria-hidden="true">⭐</div>
                        <p class="mt-1 text-2xl font-bold text-emerald-700" data-stat="hasanat">0</p>
                        <p class="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                            <?php esc_html_e( 'Hasanat', 'alfawzquran' ); ?>
                        </p>
                    </div>
                    <div class="alfawz-card-hud flex flex-col items-center justify-center rounded-xl border-2 border-blue-300 bg-white p-5 text-center shadow-md">
                        <div class="text-3xl" aria-hidden="true">📖</div>
                        <p class="mt-1 text-2xl font-bold text-blue-700" data-stat="verses">0</p>
                        <p class="text-sm font-semibold uppercase tracking-wide text-blue-600">
                            <?php esc_html_e( 'Verses Read', 'alfawzquran' ); ?>
                        </p>
                    </div>
                    <div class="alfawz-card-hud flex flex-col items-center justify-center rounded-xl border-2 border-amber-300 bg-white p-5 text-center shadow-md">
                        <div class="text-3xl" aria-hidden="true">🔥</div>
                        <p class="mt-1 text-2xl font-bold text-amber-700" data-stat="streak">0</p>
                        <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">
                            <?php esc_html_e( 'Day Streak', 'alfawzquran' ); ?>
                        </p>
                    </div>
                </div>
            </section>

            <section aria-label="<?php esc_attr_e( 'Your unlocked achievements', 'alfawzquran' ); ?>" class="space-y-4">
                <div class="flex items-center justify-between">
                    <h2 class="flex items-center text-lg font-semibold text-slate-800">
                        <span class="mr-2 text-2xl" aria-hidden="true">🏆</span>
                        <?php esc_html_e( 'Your Achievements', 'alfawzquran' ); ?>
                    </h2>
                    <span id="alfawz-achievement-summary" class="text-sm font-medium text-emerald-600"></span>
                </div>
                <div id="alfawz-achievement-grid" class="grid grid-cols-1 gap-4 sm:grid-cols-2"></div>
                <p id="alfawz-achievement-empty" class="hidden rounded-xl border border-dashed border-emerald-200 bg-white p-4 text-center text-base text-emerald-700">
                    <?php esc_html_e( 'Keep reciting to unlock your first badge!', 'alfawzquran' ); ?>
                </p>
            </section>

            <section aria-label="<?php esc_attr_e( 'Egg challenge progress', 'alfawzquran' ); ?>" class="space-y-4">
                <div id="alfawz-egg-card" class="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-100 to-amber-200 p-6 text-center shadow-md">
                    <div class="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-white" id="alfawz-egg-level">
                        <?php esc_html_e( 'Level 1', 'alfawzquran' ); ?>
                    </div>
                    <div class="text-6xl" id="alfawz-egg-emoji" aria-hidden="true">🥚</div>
                    <h3 class="mt-3 text-xl font-bold text-amber-800">
                        <?php esc_html_e( 'Hatch the Knowledge Egg!', 'alfawzquran' ); ?>
                    </h3>
                    <p id="alfawz-egg-message" class="mt-2 text-base text-amber-700">
                        <?php esc_html_e( 'Recite verses to crack it open.', 'alfawzquran' ); ?>
                    </p>
                    <div class="mt-4 h-3 w-full rounded-full bg-amber-300">
                        <div id="alfawz-egg-progress" class="h-3 rounded-full bg-amber-600" style="width:0%"></div>
                    </div>
                    <p id="alfawz-egg-label" class="mt-2 text-base font-semibold text-amber-800">0 / 0</p>
                </div>
            </section>

            <section aria-label="<?php esc_attr_e( 'Daily quests', 'alfawzquran' ); ?>" class="space-y-4">
                <h2 class="flex items-center text-lg font-semibold text-slate-800">
                    <span class="mr-2 text-2xl" aria-hidden="true">📜</span>
                    <?php esc_html_e( 'Daily Quests', 'alfawzquran' ); ?>
                </h2>
                <div id="alfawz-quest-list" class="space-y-3"></div>
                <p id="alfawz-quest-empty" class="hidden rounded-xl border border-dashed border-purple-200 bg-white p-4 text-center text-base text-purple-600">
                    <?php esc_html_e( 'No quests available right now. Come back soon for new challenges!', 'alfawzquran' ); ?>
                </p>
            </section>
        </div>
    </div>
</div>
<?php
$current_page = 'games';
?>

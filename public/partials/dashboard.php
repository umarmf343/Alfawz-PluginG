<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-dashboard" class="alfawz-surface mx-auto max-w-5xl space-y-8 rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100/70 backdrop-blur">
    <header class="flex flex-col gap-2 text-slate-900">
        <p class="text-sm font-medium tracking-wide text-emerald-600" id="alfawz-dashboard-greeting"><?php esc_html_e( 'Assalamu alaikum, dear reciter!', 'alfawzquran' ); ?></p>
        <h2 class="text-2xl font-semibold leading-tight">
            <?php esc_html_e( 'Your Quran journey today', 'alfawzquran' ); ?>
        </h2>
        <p class="max-w-2xl text-sm text-slate-600">
            <?php esc_html_e( 'Track your daily verses, celebrate new memorisation, and pick up right where you left off.', 'alfawzquran' ); ?>
        </p>
    </header>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-labelledby="alfawz-dashboard-statistics">
        <h3 id="alfawz-dashboard-statistics" class="sr-only"><?php esc_html_e( 'Key progress statistics', 'alfawzquran' ); ?></h3>
        <article class="alfawz-card" data-stat="verses-read">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( 'Verses read today', 'alfawzquran' ); ?></p>
            <p class="mt-3 text-3xl font-semibold text-slate-900" id="alfawz-verses-today">0</p>
            <p class="text-xs text-slate-500" id="alfawz-daily-goal-text"></p>
        </article>
        <article class="alfawz-card" data-stat="memorised">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( 'New verses memorised', 'alfawzquran' ); ?></p>
            <p class="mt-3 text-3xl font-semibold text-slate-900" id="alfawz-memorised-today">0</p>
            <p class="text-xs text-slate-500"><?php esc_html_e( 'Logged within the last 24 hours', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-card" data-stat="streak">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( 'Current streak', 'alfawzquran' ); ?></p>
            <p class="mt-3 flex items-end gap-2 text-3xl font-semibold text-slate-900">
                <span id="alfawz-current-streak">0</span>
                <span class="text-base font-medium text-emerald-600"><?php esc_html_e( 'days', 'alfawzquran' ); ?></span>
            </p>
            <p class="text-xs text-slate-500"><?php esc_html_e( 'Keep it going to hatch the golden egg!', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-card" data-stat="hasanat">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( 'Hasanat earned', 'alfawzquran' ); ?></p>
            <p class="mt-3 text-3xl font-semibold text-slate-900" id="alfawz-hasanat-total" data-hasanat-total>0</p>
            <p class="text-xs text-slate-500"><?php esc_html_e( 'Based on your recitation logs', 'alfawzquran' ); ?></p>
        </article>
    </section>

    <section id="alfawz-routine-section" class="hidden rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6" aria-labelledby="alfawz-routine-heading" aria-live="polite" aria-hidden="true">
        <div class="mb-6 text-center">
            <h2 id="alfawz-routine-heading" class="text-xl font-bold text-gray-800"><?php esc_html_e( 'Your Daily Quranic Routine', 'alfawzquran' ); ?></h2>
            <p class="text-base text-gray-600"><?php esc_html_e( 'Aligned with the Sunnah — may Allah accept your devotion.', 'alfawzquran' ); ?></p>
        </div>
        <div data-routine-cards class="space-y-4" role="list"></div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2" aria-labelledby="alfawz-continue">
        <h3 id="alfawz-continue" class="sr-only"><?php esc_html_e( 'Continue where you left off', 'alfawzquran' ); ?></h3>
        <article class="alfawz-card flex flex-col gap-4" id="alfawz-last-verse-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( 'Resume recitation', 'alfawzquran' ); ?></p>
                    <h4 class="mt-1 text-lg font-semibold text-slate-900" id="alfawz-last-verse-title">—</h4>
                </div>
                <span class="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700" id="alfawz-last-verse-progress">0%</span>
            </div>
            <p class="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700" id="alfawz-last-verse-preview"></p>
            <div class="flex flex-wrap items-center gap-3">
                <button type="button" class="alfawz-button" data-action="continue-reading">
                    <span>📖</span>
                    <span><?php esc_html_e( 'Open reader', 'alfawzquran' ); ?></span>
                </button>
                <button type="button" class="alfawz-link text-sm font-semibold text-emerald-600" data-action="copy-verse">
                    <?php esc_html_e( 'Copy verse key', 'alfawzquran' ); ?>
                </button>
            </div>
        </article>
        <article class="alfawz-card flex flex-col gap-4" id="alfawz-memorisation-plan-card">
            <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( 'Active memorisation plan', 'alfawzquran' ); ?></p>
                <h4 class="mt-1 text-lg font-semibold text-slate-900" id="alfawz-plan-name">—</h4>
            </div>
            <div>
                <div class="h-2 rounded-full bg-slate-200">
                    <div id="alfawz-plan-progress" class="h-2 rounded-full bg-emerald-500 transition-all" style="width:0%"></div>
                </div>
                <p class="mt-2 text-xs text-slate-500" id="alfawz-plan-meta"></p>
            </div>
            <div class="flex flex-wrap gap-3">
                <button type="button" class="alfawz-button" data-action="open-memoriser">
                    <span>🧠</span>
                    <span><?php esc_html_e( 'Go to memoriser', 'alfawzquran' ); ?></span>
                </button>
                <button type="button" class="alfawz-link text-sm font-semibold text-emerald-600" data-action="view-plans">
                    <?php esc_html_e( 'Manage plans', 'alfawzquran' ); ?>
                </button>
            </div>
        </article>
    </section>

    <section class="grid gap-6 lg:grid-cols-2" aria-labelledby="alfawz-community">
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Community leaderboard', 'alfawzquran' ); ?></h3>
                <a href="<?php echo esc_url( apply_filters( 'alfawz_mobile_nav_url', '', 'leaderboard' ) ); ?>" class="alfawz-link text-sm font-semibold text-emerald-600"><?php esc_html_e( 'View all', 'alfawzquran' ); ?></a>
            </div>
            <ul id="alfawz-leaderboard-preview" class="space-y-3" aria-live="polite" aria-busy="true"></ul>
        </div>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Daily goals', 'alfawzquran' ); ?></h3>
                <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700" id="alfawz-egg-status"></span>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div class="flex items-center justify-between text-sm font-medium text-slate-600">
                    <span><?php esc_html_e( '10 verse recitation goal', 'alfawzquran' ); ?></span>
                    <span id="alfawz-daily-progress-label">0 / 10</span>
                </div>
                <div class="mt-3 h-2 rounded-full bg-white">
                    <div id="alfawz-daily-progress-bar" class="h-2 rounded-full bg-emerald-500 transition-all" style="width:0%"></div>
                </div>
                <p class="mt-3 text-xs text-slate-500" id="alfawz-daily-progress-note"></p>
            </div>
        </div>
    </section>
</div>

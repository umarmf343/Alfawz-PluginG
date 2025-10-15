<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div class="alfawz-dashboard-shell">
    <div class="alfawz-dashboard-glow" aria-hidden="true"></div>
    <div class="alfawz-dashboard-glow alfawz-dashboard-glow--secondary" aria-hidden="true"></div>

    <div id="alfawz-dashboard" class="alfawz-dashboard-surface mx-auto max-w-6xl space-y-10 rounded-alfawz-xl p-8" aria-live="polite" aria-busy="true">
        <header class="flex flex-col gap-3 text-alfawz-maroon-900" data-animate="fade">
            <span class="alfawz-pill" id="alfawz-dashboard-greeting">
                <?php esc_html_e( 'Assalamu alaikum, dear reciter!', 'alfawzquran' ); ?>
            </span>
            <div class="space-y-3">
                <h2 class="text-3xl font-bold leading-tight sm:text-4xl">
                    <?php esc_html_e( 'Your Quran journey today', 'alfawzquran' ); ?>
                </h2>
                <p class="max-w-2xl text-base text-alfawz-maroon-600">
                    <?php esc_html_e( 'Track your daily verses, celebrate each memorised ayah, and pick up right where you left off. Every recitation is a step closer to Jannah.', 'alfawzquran' ); ?>
                </p>
            </div>
        </header>

        <section class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-labelledby="alfawz-dashboard-statistics" data-animate="stagger">
        <h3 id="alfawz-dashboard-statistics" class="sr-only"><?php esc_html_e( 'Key progress statistics', 'alfawzquran' ); ?></h3>
        <article class="alfawz-card alfawz-card--metric" data-stat="verses-read">
            <p class="text-xs font-semibold uppercase alfawz-letter-spread text-alfawz-maroon-500"><?php esc_html_e( 'Verses read today', 'alfawzquran' ); ?></p>
            <p class="mt-4 flex items-end gap-2 text-4xl font-bold text-alfawz-maroon-950" id="alfawz-verses-today">0</p>
            <p class="text-sm text-alfawz-maroon-500" id="alfawz-daily-goal-text"></p>
        </article>
        <article class="alfawz-card alfawz-card--metric" data-stat="memorised">
            <p class="text-xs font-semibold uppercase alfawz-letter-spread text-alfawz-maroon-500"><?php esc_html_e( 'New verses memorised', 'alfawzquran' ); ?></p>
            <p class="mt-4 flex items-end gap-2 text-4xl font-bold text-alfawz-maroon-950" id="alfawz-memorised-today">0</p>
            <p class="text-sm text-alfawz-maroon-500"><?php esc_html_e( 'Logged within the last 24 hours', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-card alfawz-card--metric" data-stat="streak">
            <p class="text-xs font-semibold uppercase alfawz-letter-spread text-alfawz-maroon-500"><?php esc_html_e( 'Current streak', 'alfawzquran' ); ?></p>
            <p class="mt-4 flex items-end gap-3 text-4xl font-bold text-alfawz-maroon-950">
                <span id="alfawz-current-streak">0</span>
                <span class="alfawz-chip"><?php esc_html_e( 'days', 'alfawzquran' ); ?></span>
            </p>
            <p class="text-sm text-alfawz-maroon-500"><?php esc_html_e( 'Keep it going to hatch the golden egg!', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-card alfawz-card--metric" data-stat="hasanat">
            <p class="text-xs font-semibold uppercase alfawz-letter-spread text-alfawz-maroon-500"><?php esc_html_e( 'Hasanat earned', 'alfawzquran' ); ?></p>
            <p class="mt-4 flex items-center gap-2 text-4xl font-bold text-alfawz-maroon-950" id="alfawz-hasanat-total">0 <span class="text-base font-semibold text-alfawz-maroon-600">⭐</span></p>
            <p class="text-sm text-alfawz-maroon-500"><?php esc_html_e( 'Based on your recitation logs', 'alfawzquran' ); ?></p>
        </article>
    </section>

        <section id="alfawz-routine-section" class="alfawz-routine-panel hidden" aria-labelledby="alfawz-routine-heading" aria-live="polite" aria-hidden="true" data-animate="fade">
            <div class="mb-8 text-center">
                <h2 id="alfawz-routine-heading" class="text-2xl font-semibold text-alfawz-maroon-900"><?php esc_html_e( 'Your Daily Quranic Routine', 'alfawzquran' ); ?></h2>
                <p class="text-base text-alfawz-maroon-600"><?php esc_html_e( 'Aligned with the Sunnah — may Allah accept your devotion.', 'alfawzquran' ); ?></p>
            </div>
            <div data-routine-cards class="space-y-4" role="list"></div>
        </section>

        <section class="grid gap-6 xl:grid-cols-2" aria-labelledby="alfawz-continue" data-animate="stagger">
        <h3 id="alfawz-continue" class="sr-only"><?php esc_html_e( 'Continue where you left off', 'alfawzquran' ); ?></h3>
        <article class="alfawz-card flex flex-col gap-5" id="alfawz-last-verse-card">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p class="text-xs font-semibold uppercase alfawz-letter-spread text-alfawz-maroon-500"><?php esc_html_e( 'Resume recitation', 'alfawzquran' ); ?></p>
                    <h4 class="mt-2 text-xl font-semibold text-alfawz-maroon-900" id="alfawz-last-verse-title">—</h4>
                </div>
                <span class="alfawz-pill alfawz-pill--inverse" id="alfawz-last-verse-progress">0%</span>
            </div>
            <p class="alfawz-card-panel" id="alfawz-last-verse-preview"></p>
            <div class="flex flex-wrap items-center gap-3">
                <button type="button" class="alfawz-button" data-action="continue-reading">
                    <span>📖</span>
                    <span><?php esc_html_e( 'Open reader', 'alfawzquran' ); ?></span>
                </button>
                <button type="button" class="alfawz-link text-sm font-semibold text-alfawz-maroon-700" data-action="copy-verse">
                    <?php esc_html_e( 'Copy verse key', 'alfawzquran' ); ?>
                </button>
            </div>
        </article>
        <article class="alfawz-card flex flex-col gap-5" id="alfawz-memorisation-plan-card">
            <div class="space-y-2">
                <p class="text-xs font-semibold uppercase alfawz-letter-spread text-alfawz-maroon-500"><?php esc_html_e( 'Active memorisation plan', 'alfawzquran' ); ?></p>
                <h4 class="text-xl font-semibold text-alfawz-maroon-900" id="alfawz-plan-name">—</h4>
            </div>
            <div class="space-y-3">
                <div class="alfawz-progress-track">
                    <div id="alfawz-plan-progress" class="alfawz-progress-fill" style="width:0%"></div>
                </div>
                <p class="text-sm text-alfawz-maroon-600" id="alfawz-plan-meta"></p>
            </div>
            <div class="flex flex-wrap gap-3">
                <button type="button" class="alfawz-button" data-action="open-memoriser">
                    <span>🧠</span>
                    <span><?php esc_html_e( 'Go to memoriser', 'alfawzquran' ); ?></span>
                </button>
                <button type="button" class="alfawz-link text-sm font-semibold text-alfawz-maroon-700" data-action="view-plans">
                    <?php esc_html_e( 'Manage plans', 'alfawzquran' ); ?>
                </button>
            </div>
        </article>
    </section>

        <section class="grid gap-6 xl:grid-cols-2" aria-labelledby="alfawz-community" data-animate="stagger">
            <div class="space-y-5">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 class="text-xl font-semibold text-alfawz-maroon-900"><?php esc_html_e( 'Community leaderboard', 'alfawzquran' ); ?></h3>
                    <a href="<?php echo esc_url( apply_filters( 'alfawz_mobile_nav_url', '', 'leaderboard' ) ); ?>" class="alfawz-link text-sm font-semibold text-alfawz-maroon-700">
                        <?php esc_html_e( 'View all', 'alfawzquran' ); ?>
                    </a>
                </div>
                <ul id="alfawz-leaderboard-preview" class="space-y-3" aria-live="polite" aria-busy="true"></ul>
            </div>
            <div class="space-y-5">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 class="text-xl font-semibold text-alfawz-maroon-900"><?php esc_html_e( 'Daily goals', 'alfawzquran' ); ?></h3>
                    <span class="alfawz-chip alfawz-chip--amber" id="alfawz-egg-status"></span>
                </div>
                <div class="alfawz-card-panel space-y-4">
                    <div class="flex items-center justify-between text-sm font-medium text-alfawz-maroon-700">
                        <span><?php esc_html_e( '10 verse recitation goal', 'alfawzquran' ); ?></span>
                        <span id="alfawz-daily-progress-label">0 / 10</span>
                    </div>
                    <div class="alfawz-progress-track alfawz-progress-track--thin">
                        <div id="alfawz-daily-progress-bar" class="alfawz-progress-fill" style="width:0%"></div>
                    </div>
                    <p class="text-sm text-alfawz-maroon-600" id="alfawz-daily-progress-note"></p>
                </div>
            </div>
        </section>

        <section class="alfawz-inspiration" data-animate="fade">
            <div class="alfawz-inspiration__content">
                <h3 class="text-2xl font-semibold text-alfawz-milk-50"><?php esc_html_e( 'Today\'s reflection', 'alfawzquran' ); ?></h3>
                <p class="text-base text-alfawz-milk-100" id="alfawz-daily-progress-note-secondary"><?php esc_html_e( 'Remember, every letter recited carries immense reward. Invite a friend to revise with you and multiply the barakah.', 'alfawzquran' ); ?></p>
            </div>
            <button type="button" class="alfawz-button alfawz-button--light" data-action="share-progress">
                <span>✨</span>
                <span><?php esc_html_e( 'Share today\'s blessing', 'alfawzquran' ); ?></span>
            </button>
        </section>
    </div>
</div>

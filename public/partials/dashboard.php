<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-dashboard" class="alfawz-dashboard-shell">
    <div class="alfawz-dashboard-aurora" aria-hidden="true"></div>
    <div class="alfawz-dashboard-aurora alfawz-dashboard-aurora--accent" aria-hidden="true"></div>

    <header class="alfawz-dashboard-hero" aria-labelledby="alfawz-dashboard-heading">
        <div class="alfawz-dashboard-hero-copy">
            <p class="alfawz-dashboard-eyebrow" id="alfawz-dashboard-greeting"><?php esc_html_e( 'Assalamu alaikum, dear reciter!', 'alfawzquran' ); ?></p>
            <h2 class="alfawz-dashboard-title" id="alfawz-dashboard-heading"><?php esc_html_e( 'Your Quran journey today', 'alfawzquran' ); ?></h2>
            <p class="alfawz-dashboard-subtitle"><?php esc_html_e( 'Track your daily verses, celebrate new memorisation, and pick up right where you left off.', 'alfawzquran' ); ?></p>
            <div class="alfawz-dashboard-quick-actions" role="list">
                <a role="listitem" class="alfawz-dashboard-action" href="<?php echo esc_url( apply_filters( 'alfawz_mobile_nav_url', '', 'reader' ) ); ?>">
                    <span aria-hidden="true">📖</span>
                    <span><?php esc_html_e( 'Continue reciting', 'alfawzquran' ); ?></span>
                </a>
                <a role="listitem" class="alfawz-dashboard-action" href="<?php echo esc_url( apply_filters( 'alfawz_mobile_nav_url', '', 'memorizer' ) ); ?>">
                    <span aria-hidden="true">🧠</span>
                    <span><?php esc_html_e( 'Open memoriser', 'alfawzquran' ); ?></span>
                </a>
                <a role="listitem" class="alfawz-dashboard-action" href="<?php echo esc_url( apply_filters( 'alfawz_mobile_nav_url', '', 'games' ) ); ?>">
                    <span aria-hidden="true">🎮</span>
                    <span><?php esc_html_e( 'Boost with a game', 'alfawzquran' ); ?></span>
                </a>
            </div>
        </div>
        <aside class="alfawz-dashboard-hero-card" aria-live="polite">
            <div class="alfawz-dashboard-hero-ring" role="presentation">
                <span class="alfawz-dashboard-ring-label"><?php esc_html_e( 'Active streak', 'alfawzquran' ); ?></span>
                <span class="alfawz-dashboard-ring-value" id="alfawz-dashboard-streak-highlight">0</span>
                <span class="alfawz-dashboard-ring-suffix"><?php esc_html_e( 'days', 'alfawzquran' ); ?></span>
            </div>
            <p class="alfawz-dashboard-ring-note"><?php esc_html_e( 'Keep your consistency glowing to unlock egg rewards.', 'alfawzquran' ); ?></p>
        </aside>
    </header>

    <section class="alfawz-dashboard-stat-grid" aria-labelledby="alfawz-dashboard-statistics">
        <h3 id="alfawz-dashboard-statistics" class="screen-reader-text"><?php esc_html_e( 'Key progress statistics', 'alfawzquran' ); ?></h3>
        <article class="alfawz-dashboard-stat" data-stat="verses-read">
            <span class="alfawz-dashboard-stat-icon" aria-hidden="true">📚</span>
            <div class="alfawz-dashboard-stat-copy">
                <p class="alfawz-dashboard-stat-label"><?php esc_html_e( 'Verses read today', 'alfawzquran' ); ?></p>
                <p class="alfawz-dashboard-stat-value" id="alfawz-verses-today" data-alfawz-counter="true">0</p>
                <p class="alfawz-dashboard-stat-meta" id="alfawz-daily-goal-text"></p>
            </div>
        </article>
        <article class="alfawz-dashboard-stat" data-stat="memorised">
            <span class="alfawz-dashboard-stat-icon" aria-hidden="true">✨</span>
            <div class="alfawz-dashboard-stat-copy">
                <p class="alfawz-dashboard-stat-label"><?php esc_html_e( 'New verses memorised', 'alfawzquran' ); ?></p>
                <p class="alfawz-dashboard-stat-value" id="alfawz-memorised-today" data-alfawz-counter="true">0</p>
                <p class="alfawz-dashboard-stat-meta"><?php esc_html_e( 'Logged within the last 24 hours', 'alfawzquran' ); ?></p>
            </div>
        </article>
        <article class="alfawz-dashboard-stat" data-stat="streak">
            <span class="alfawz-dashboard-stat-icon" aria-hidden="true">🔥</span>
            <div class="alfawz-dashboard-stat-copy">
                <p class="alfawz-dashboard-stat-label"><?php esc_html_e( 'Current streak', 'alfawzquran' ); ?></p>
                <p class="alfawz-dashboard-stat-value" id="alfawz-current-streak" data-alfawz-counter="true">0</p>
                <p class="alfawz-dashboard-stat-meta"><?php esc_html_e( 'Keep it going to hatch the golden egg!', 'alfawzquran' ); ?></p>
            </div>
        </article>
        <article class="alfawz-dashboard-stat" data-stat="hasanat">
            <span class="alfawz-dashboard-stat-icon" aria-hidden="true">⭐</span>
            <div class="alfawz-dashboard-stat-copy">
                <p class="alfawz-dashboard-stat-label"><?php esc_html_e( 'Hasanat earned', 'alfawzquran' ); ?></p>
                <p class="alfawz-dashboard-stat-value" id="alfawz-hasanat-total" data-alfawz-counter="true">0</p>
                <p class="alfawz-dashboard-stat-meta"><?php esc_html_e( 'Based on your recitation logs', 'alfawzquran' ); ?></p>
            </div>
        </article>
    </section>

    <section id="alfawz-routine-section" class="alfawz-dashboard-routine hidden" aria-labelledby="alfawz-routine-heading" aria-live="polite" aria-hidden="true">
        <div class="alfawz-dashboard-section-header">
            <div>
                <h2 id="alfawz-routine-heading"><?php esc_html_e( 'Your daily Quranic routine', 'alfawzquran' ); ?></h2>
                <p><?php esc_html_e( 'Aligned with the Sunnah — may Allah accept your devotion.', 'alfawzquran' ); ?></p>
            </div>
            <span class="alfawz-dashboard-pill"><?php esc_html_e( 'Personalised', 'alfawzquran' ); ?></span>
        </div>
        <div data-routine-cards class="alfawz-dashboard-routine-list" role="list"></div>
    </section>

    <section class="alfawz-dashboard-columns" aria-labelledby="alfawz-continue">
        <h3 id="alfawz-continue" class="screen-reader-text"><?php esc_html_e( 'Continue where you left off', 'alfawzquran' ); ?></h3>
        <article class="alfawz-dashboard-panel" id="alfawz-last-verse-card">
            <div class="alfawz-dashboard-panel-header">
                <div>
                    <p class="alfawz-dashboard-panel-eyebrow"><?php esc_html_e( 'Resume recitation', 'alfawzquran' ); ?></p>
                    <h4 id="alfawz-last-verse-title">—</h4>
                </div>
                <span class="alfawz-dashboard-progress-indicator" id="alfawz-last-verse-progress">0%</span>
            </div>
            <p class="alfawz-dashboard-panel-body" id="alfawz-last-verse-preview"></p>
            <div class="alfawz-dashboard-panel-actions">
                <button type="button" class="alfawz-button" data-action="continue-reading">
                    <span aria-hidden="true">📖</span>
                    <span><?php esc_html_e( 'Open reader', 'alfawzquran' ); ?></span>
                </button>
                <button type="button" class="alfawz-dashboard-link" data-action="copy-verse">
                    <?php esc_html_e( 'Copy verse key', 'alfawzquran' ); ?>
                </button>
            </div>
        </article>
        <article class="alfawz-dashboard-panel" id="alfawz-memorisation-plan-card">
            <div class="alfawz-dashboard-panel-header">
                <div>
                    <p class="alfawz-dashboard-panel-eyebrow"><?php esc_html_e( 'Active memorisation plan', 'alfawzquran' ); ?></p>
                    <h4 id="alfawz-plan-name">—</h4>
                </div>
            </div>
            <div class="alfawz-dashboard-progress" role="presentation">
                <div class="alfawz-dashboard-progress-track">
                    <div id="alfawz-plan-progress" class="alfawz-dashboard-progress-bar" style="width:0%"></div>
                </div>
                <p id="alfawz-plan-meta" class="alfawz-dashboard-progress-meta"></p>
            </div>
            <div class="alfawz-dashboard-panel-actions">
                <button type="button" class="alfawz-button" data-action="open-memoriser">
                    <span aria-hidden="true">🧠</span>
                    <span><?php esc_html_e( 'Go to memoriser', 'alfawzquran' ); ?></span>
                </button>
                <button type="button" class="alfawz-dashboard-link" data-action="view-plans">
                    <?php esc_html_e( 'Manage plans', 'alfawzquran' ); ?>
                </button>
            </div>
        </article>
    </section>

    <section class="alfawz-dashboard-columns" aria-labelledby="alfawz-community">
        <div class="alfawz-dashboard-panel alfawz-dashboard-panel--accent">
            <div class="alfawz-dashboard-section-header">
                <h3 id="alfawz-community"><?php esc_html_e( 'Community leaderboard', 'alfawzquran' ); ?></h3>
                <a href="<?php echo esc_url( apply_filters( 'alfawz_mobile_nav_url', '', 'leaderboard' ) ); ?>" class="alfawz-dashboard-link">
                    <?php esc_html_e( 'View all', 'alfawzquran' ); ?>
                </a>
            </div>
            <ul id="alfawz-leaderboard-preview" class="alfawz-dashboard-list" aria-live="polite" aria-busy="true"></ul>
        </div>
        <div class="alfawz-dashboard-panel alfawz-dashboard-panel--glow">
            <div class="alfawz-dashboard-section-header">
                <h3><?php esc_html_e( 'Daily goals', 'alfawzquran' ); ?></h3>
                <span class="alfawz-dashboard-pill" id="alfawz-egg-status"></span>
            </div>
            <div class="alfawz-dashboard-progress" role="presentation">
                <p class="alfawz-dashboard-panel-eyebrow"><?php esc_html_e( '10 verse recitation goal', 'alfawzquran' ); ?></p>
                <div class="alfawz-dashboard-progress-track">
                    <div id="alfawz-daily-progress-bar" class="alfawz-dashboard-progress-bar" style="width:0%"></div>
                </div>
                <div class="alfawz-dashboard-progress-meta" id="alfawz-daily-progress-label">0 / 10</div>
            </div>
            <div class="alfawz-dashboard-progress" role="presentation">
                <p class="alfawz-dashboard-panel-eyebrow"><?php esc_html_e( 'Golden egg challenge', 'alfawzquran' ); ?></p>
                <div class="alfawz-dashboard-progress-track">
                    <div id="alfawz-egg-progress" class="alfawz-dashboard-progress-bar" style="width:0%"></div>
                </div>
            </div>
            <p class="alfawz-dashboard-progress-note" id="alfawz-daily-progress-note"></p>
        </div>
    </section>
</div>

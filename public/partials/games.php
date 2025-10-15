<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-games" class="alfawz-surface mx-auto max-w-6xl space-y-10 rounded-3xl bg-white/95 p-6 shadow-xl shadow-emerald-100/70 backdrop-blur">
    <header class="space-y-2 text-slate-900">
        <p class="text-sm font-medium uppercase tracking-wide text-emerald-600"><?php esc_html_e( 'Ayah puzzle builder', 'alfawzquran' ); ?></p>
        <h2 class="text-2xl font-semibold leading-tight"><?php esc_html_e( 'Rebuild luminous verses tile by tile.', 'alfawzquran' ); ?></h2>
        <p class="max-w-3xl text-sm text-slate-600"><?php esc_html_e( 'Every round serves a new ayah from the live API. Arrange the tiles in order, race the timer, and unlock themed reflections as you progress.', 'alfawzquran' ); ?></p>
    </header>

    <div class="alfawz-game-layout" aria-live="polite">
        <section class="alfawz-game-primary" aria-labelledby="alfawz-game-heading">
            <div class="alfawz-game-theme" id="alfawz-game-theme">
                <span class="alfawz-game-theme__icon" aria-hidden="true">✨</span>
                <span class="alfawz-game-theme__text" id="alfawz-theme-chip"><?php esc_html_e( 'Loading today\'s theme…', 'alfawzquran' ); ?></span>
            </div>

            <div id="alfawz-game-loader" class="alfawz-game-loader"><?php esc_html_e( 'Fetching a fresh ayah puzzle…', 'alfawzquran' ); ?></div>

            <article id="alfawz-game-card" class="alfawz-game-card hidden">
                <header class="alfawz-game-card__header">
                    <div>
                        <h3 id="alfawz-game-heading" class="alfawz-game-card__title"><?php esc_html_e( 'Reconstruct the ayah', 'alfawzquran' ); ?></h3>
                        <p id="alfawz-game-subtitle" class="alfawz-game-card__subtitle"></p>
                    </div>
                    <div class="alfawz-game-meta">
                        <p id="alfawz-game-reference" class="alfawz-game-meta__reference"></p>
                        <p id="alfawz-game-translation" class="alfawz-game-meta__translation"></p>
                    </div>
                </header>

                <div class="alfawz-game-board" role="group" aria-label="<?php esc_attr_e( 'Arrange tiles into the correct ayah order', 'alfawzquran' ); ?>">
                    <div class="alfawz-game-bank" id="alfawz-game-bank" aria-label="<?php esc_attr_e( 'Available tiles', 'alfawzquran' ); ?>" aria-live="polite"></div>
                    <div class="alfawz-game-slots" id="alfawz-game-slots" aria-label="<?php esc_attr_e( 'Arrange tiles here', 'alfawzquran' ); ?>"></div>
                </div>

                <div class="alfawz-game-progress">
                    <div class="alfawz-progress-track" role="presentation">
                        <div id="alfawz-game-progress" class="alfawz-progress-fill" style="width:0%"></div>
                    </div>
                    <p id="alfawz-game-progress-label" class="alfawz-game-progress__label"></p>
                </div>

                <div class="alfawz-game-actions">
                    <button type="button" id="alfawz-game-shuffle" class="alfawz-button alfawz-button--ghost">
                        <span>🔀</span>
                        <span><?php esc_html_e( 'Shuffle tiles', 'alfawzquran' ); ?></span>
                    </button>
                    <button type="button" id="alfawz-game-reset" class="alfawz-link text-sm font-semibold text-slate-600">
                        <?php esc_html_e( 'Reset board', 'alfawzquran' ); ?>
                    </button>
                    <button type="button" id="alfawz-game-check" class="alfawz-button">
                        <span>✅</span>
                        <span><?php esc_html_e( 'Check order', 'alfawzquran' ); ?></span>
                    </button>
                </div>

                <p id="alfawz-game-status" class="alfawz-game-status"></p>
                <div id="alfawz-game-confetti" class="alfawz-confetti-host" aria-hidden="true"></div>
            </article>
        </section>

        <aside class="alfawz-game-sidebar" aria-labelledby="alfawz-game-sidebar-heading">
            <div class="space-y-3">
                <h3 id="alfawz-game-sidebar-heading" class="text-sm font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( 'Session pulse', 'alfawzquran' ); ?></h3>
                <div class="alfawz-game-stat">
                    <span><?php esc_html_e( 'Puzzles solved', 'alfawzquran' ); ?></span>
                    <strong id="alfawz-game-completed">0</strong>
                </div>
                <div class="alfawz-game-stat">
                    <span><?php esc_html_e( 'Daily streak', 'alfawzquran' ); ?></span>
                    <strong id="alfawz-game-streak">0</strong>
                </div>
                <div class="alfawz-game-stat">
                    <span><?php esc_html_e( 'Best time', 'alfawzquran' ); ?></span>
                    <strong id="alfawz-game-best">--:--</strong>
                </div>
            </div>

            <div class="alfawz-game-timer" aria-live="polite">
                <p class="alfawz-game-timer__label"><?php esc_html_e( 'Current round', 'alfawzquran' ); ?></p>
                <p id="alfawz-game-timer" class="alfawz-game-timer__value">00:00</p>
                <p id="alfawz-game-timer-note" class="alfawz-game-timer__note"><?php esc_html_e( 'Tiles begin to glow when they rest in the right slot.', 'alfawzquran' ); ?></p>
            </div>

            <div class="alfawz-game-habit" aria-live="polite">
                <h4 class="text-sm font-semibold text-slate-900"><?php esc_html_e( 'Habit hook', 'alfawzquran' ); ?></h4>
                <p id="alfawz-habit-copy" class="text-sm text-slate-600"><?php esc_html_e( 'Show up daily to unlock themed reflections and extra challenges.', 'alfawzquran' ); ?></p>
                <div id="alfawz-unlock-status" class="alfawz-game-unlock"></div>
            </div>
        </aside>
    </div>
</div>
<?php
$current_page = 'games';
?>

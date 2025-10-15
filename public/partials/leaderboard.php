<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div
    id="alfawz-leaderboard"
    class="alfawz-leaderboard-shell relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem]"
    data-verses-label="<?php echo esc_attr__( 'Verses read', 'alfawzquran' ); ?>"
    data-hasanat-label="<?php echo esc_attr__( 'Hasanat', 'alfawzquran' ); ?>"
    data-rank-label="<?php echo esc_attr__( 'Rank', 'alfawzquran' ); ?>"
    data-podium-empty-label="<?php echo esc_attr__( 'The top three spots are ready to be claimed. Encourage your class to log their verses today.', 'alfawzquran' ); ?>"
    data-table-empty-label="<?php echo esc_attr__( 'As soon as verses are logged, the full leaderboard lights up with community progress.', 'alfawzquran' ); ?>"
>
    <div class="alfawz-leaderboard-orb" aria-hidden="true"></div>
    <div class="alfawz-leaderboard-orb alfawz-leaderboard-orb--secondary" aria-hidden="true"></div>

    <div class="alfawz-leaderboard-panel">
        <header class="alfawz-leaderboard-header" data-animate="fade">
            <div class="alfawz-leaderboard-chip">
                <span class="alfawz-leaderboard-chip__dot" aria-hidden="true"></span>
                <?php esc_html_e( 'Community leaderboard', 'alfawzquran' ); ?>
            </div>
            <div class="space-y-4">
                <h2 class="alfawz-leaderboard-title"><?php esc_html_e( 'Celebrate every recitation milestone', 'alfawzquran' ); ?></h2>
                <p class="alfawz-leaderboard-subtitle"><?php esc_html_e( 'Track the most dedicated voices in Alfawz. Rankings refresh from the live REST endpoint with real-time verses, hasanat, and momentum badges.', 'alfawzquran' ); ?></p>
            </div>

            <div class="alfawz-leaderboard-meta">
                <div class="alfawz-leaderboard-meta__status">
                    <span class="alfawz-leaderboard-status-dot" aria-hidden="true"></span>
                    <span id="alfawz-leaderboard-updated"><?php esc_html_e( 'Updating…', 'alfawzquran' ); ?></span>
                </div>
                <button type="button" id="alfawz-leaderboard-refresh" class="alfawz-leaderboard-button">
                    <span aria-hidden="true">&#8635;</span>
                    <span><?php esc_html_e( 'Refresh rankings', 'alfawzquran' ); ?></span>
                </button>
            </div>
        </header>

        <section class="space-y-6" aria-labelledby="alfawz-leaderboard-podium-heading" data-animate="fade">
            <div class="alfawz-leaderboard-section-header">
                <h3 id="alfawz-leaderboard-podium-heading" class="alfawz-leaderboard-section-title"><?php esc_html_e( 'Spotlight', 'alfawzquran' ); ?></h3>
                <p class="alfawz-leaderboard-section-copy"><?php esc_html_e( 'Top three voices earn animated laurels and bonus hasanat multipliers.', 'alfawzquran' ); ?></p>
            </div>
            <div id="alfawz-leaderboard-podium" class="alfawz-leaderboard-podium" aria-live="polite" aria-busy="true"></div>
        </section>

        <section class="space-y-5" aria-labelledby="alfawz-leaderboard-table" data-animate="fade">
            <div class="alfawz-leaderboard-section-header">
                <h3 id="alfawz-leaderboard-table" class="alfawz-leaderboard-section-title"><?php esc_html_e( 'Full rankings', 'alfawzquran' ); ?></h3>
                <span class="alfawz-leaderboard-section-copy"><?php esc_html_e( 'Hover to reveal celebratory glows and see who is climbing fastest.', 'alfawzquran' ); ?></span>
            </div>
            <div class="alfawz-leaderboard-table-wrapper">
                <table class="alfawz-leaderboard-table" data-empty="false">
                    <thead>
                        <tr>
                            <th scope="col"><?php esc_html_e( 'Rank', 'alfawzquran' ); ?></th>
                            <th scope="col"><?php esc_html_e( 'Reciter', 'alfawzquran' ); ?></th>
                            <th scope="col" class="text-right"><?php esc_html_e( 'Verses read', 'alfawzquran' ); ?></th>
                            <th scope="col" class="text-right"><?php esc_html_e( 'Hasanat', 'alfawzquran' ); ?></th>
                        </tr>
                    </thead>
                    <tbody id="alfawz-leaderboard-body" aria-live="polite" aria-busy="true"></tbody>
                </table>
                <div id="alfawz-leaderboard-empty" class="alfawz-leaderboard-empty" hidden>
                    <p><?php esc_html_e( 'As soon as verses are logged, the full leaderboard lights up with community progress.', 'alfawzquran' ); ?></p>
                </div>
            </div>
        </section>

        <section class="alfawz-leaderboard-footer" aria-labelledby="alfawz-leaderboard-callout" data-animate="fade">
            <div class="space-y-3">
                <h3 id="alfawz-leaderboard-callout" class="alfawz-leaderboard-footer-title"><?php esc_html_e( 'How ranking works', 'alfawzquran' ); ?></h3>
                <ul class="alfawz-leaderboard-footer-list">
                    <li><?php esc_html_e( 'Positions are calculated from verses logged through the reader shortcode.', 'alfawzquran' ); ?></li>
                    <li><?php esc_html_e( 'Hasanat totals use your configured reward per letter.', 'alfawzquran' ); ?></li>
                    <li><?php esc_html_e( 'Teachers can monitor classroom performance via the egg challenge endpoint.', 'alfawzquran' ); ?></li>
                </ul>
            </div>
            <aside class="alfawz-leaderboard-tip" role="note">
                <h4 class="alfawz-leaderboard-tip-title"><?php esc_html_e( 'Engagement tip', 'alfawzquran' ); ?></h4>
                <p class="alfawz-leaderboard-tip-copy"><?php esc_html_e( 'Celebrate students in assemblies or virtual calls. Highlight streaks and personal bests to build confidence and momentum.', 'alfawzquran' ); ?></p>
            </aside>
        </section>
    </div>
</div>

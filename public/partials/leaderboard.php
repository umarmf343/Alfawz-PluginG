<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-leaderboard" class="alfawz-surface mx-auto max-w-4xl space-y-8 rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100/70 backdrop-blur">
    <header class="space-y-1 text-slate-900">
        <p class="text-sm font-medium tracking-wide text-emerald-600"><?php esc_html_e( 'Community leaderboard', 'alfawzquran' ); ?></p>
        <h2 class="text-2xl font-semibold leading-tight"><?php esc_html_e( 'Celebrate progress across the Alfawz community', 'alfawzquran' ); ?></h2>
        <p class="text-sm text-slate-600"><?php esc_html_e( 'Rankings update automatically from the live REST endpoint and highlight top reciters for the current week.', 'alfawzquran' ); ?></p>
    </header>

    <section class="space-y-4" aria-labelledby="alfawz-leaderboard-table">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 id="alfawz-leaderboard-table" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Top reciters', 'alfawzquran' ); ?></h3>
            <div class="flex items-center gap-2 text-xs text-slate-500">
                <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
                <span id="alfawz-leaderboard-updated"><?php esc_html_e( 'Updating…', 'alfawzquran' ); ?></span>
            </div>
        </div>
        <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <table class="min-w-full divide-y divide-slate-100 text-left">
                <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                        <th scope="col" class="px-4 py-3"><?php esc_html_e( 'Rank', 'alfawzquran' ); ?></th>
                        <th scope="col" class="px-4 py-3"><?php esc_html_e( 'Reciter', 'alfawzquran' ); ?></th>
                        <th scope="col" class="px-4 py-3 text-right"><?php esc_html_e( 'Verses read', 'alfawzquran' ); ?></th>
                        <th scope="col" class="px-4 py-3 text-right"><?php esc_html_e( 'Hasanat', 'alfawzquran' ); ?></th>
                    </tr>
                </thead>
                <tbody id="alfawz-leaderboard-body" class="divide-y divide-slate-100 text-sm text-slate-700" aria-live="polite" aria-busy="true"></tbody>
            </table>
        </div>
    </section>

    <section class="space-y-3 rounded-3xl bg-emerald-50/60 p-6" aria-labelledby="alfawz-leaderboard-callout">
        <h3 id="alfawz-leaderboard-callout" class="text-base font-semibold text-emerald-800"><?php esc_html_e( 'How ranking works', 'alfawzquran' ); ?></h3>
        <ul class="space-y-2 text-sm text-emerald-700 list-disc pl-5">
            <li><?php esc_html_e( 'Positions are calculated from verses logged through the reader shortcode.', 'alfawzquran' ); ?></li>
            <li><?php esc_html_e( 'Hasanat totals use your configured reward per letter.', 'alfawzquran' ); ?></li>
            <li><?php esc_html_e( 'Teachers can monitor classroom performance via the egg challenge endpoint.', 'alfawzquran' ); ?></li>
        </ul>
    </section>
</div>

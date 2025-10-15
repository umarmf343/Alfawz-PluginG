<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-profile" class="alfawz-surface mx-auto max-w-4xl space-y-8 rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100/70 backdrop-blur">
    <header class="flex flex-col items-start gap-4 text-slate-900 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-4">
            <div class="h-16 w-16 overflow-hidden rounded-full ring-4 ring-emerald-100">
                <?php echo get_avatar( get_current_user_id(), 64, '', esc_attr__( 'Profile photo', 'alfawzquran' ), [ 'class' => 'h-full w-full object-cover' ] ); ?>
            </div>
            <div>
                <p class="text-sm font-medium tracking-wide text-emerald-600" id="alfawz-profile-greeting"><?php esc_html_e( 'Profile overview', 'alfawzquran' ); ?></p>
                <h2 class="text-2xl font-semibold leading-tight" id="alfawz-profile-name"><?php echo esc_html( wp_get_current_user()->display_name ); ?></h2>
                <p class="text-sm text-slate-600" id="alfawz-profile-since"></p>
            </div>
        </div>
        <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="alfawz-button" id="alfawz-profile-edit">
                <span>✏️</span>
                <span><?php esc_html_e( 'Edit account', 'alfawzquran' ); ?></span>
            </button>
            <a href="<?php echo esc_url( wp_logout_url() ); ?>" class="alfawz-link text-sm font-semibold text-red-600"><?php esc_html_e( 'Log out', 'alfawzquran' ); ?></a>
        </div>
    </header>

    <section class="grid gap-4 md:grid-cols-2" aria-labelledby="alfawz-profile-stats">
        <h3 id="alfawz-profile-stats" class="sr-only"><?php esc_html_e( 'Personal statistics', 'alfawzquran' ); ?></h3>
        <article class="alfawz-card">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( 'Total verses read', 'alfawzquran' ); ?></p>
            <p class="mt-3 text-3xl font-semibold text-slate-900" id="alfawz-profile-verses">0</p>
            <p class="text-xs text-slate-500"><?php esc_html_e( 'Across all sessions', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-card">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( 'Hasanat earned', 'alfawzquran' ); ?></p>
            <p class="mt-3 text-3xl font-semibold text-slate-900" id="alfawz-profile-hasanat" data-hasanat-total>0</p>
            <p class="text-xs text-slate-500"><?php esc_html_e( 'Calculated with configured rate', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-card">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( 'Memorised verses', 'alfawzquran' ); ?></p>
            <p class="mt-3 text-3xl font-semibold text-slate-900" id="alfawz-profile-memorised">0</p>
            <p class="text-xs text-slate-500"><?php esc_html_e( 'Logged in memoriser', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-card">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500"><?php esc_html_e( 'Current streak', 'alfawzquran' ); ?></p>
            <p class="mt-3 text-3xl font-semibold text-slate-900" id="alfawz-profile-streak">0</p>
            <p class="text-xs text-slate-500"><?php esc_html_e( 'Daily recitation streak', 'alfawzquran' ); ?></p>
        </article>
    </section>

    <section class="space-y-4" aria-labelledby="alfawz-profile-bookmarks">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 id="alfawz-profile-bookmarks" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Saved bookmarks', 'alfawzquran' ); ?></h3>
            <button type="button" class="alfawz-link text-sm font-semibold text-emerald-600" id="alfawz-profile-bookmarks-refresh"><?php esc_html_e( 'Refresh', 'alfawzquran' ); ?></button>
        </div>
        <ul id="alfawz-profile-bookmarks-list" class="space-y-3" aria-live="polite" aria-busy="true"></ul>
    </section>

    <section class="space-y-4" aria-labelledby="alfawz-profile-achievements">
        <h3 id="alfawz-profile-achievements" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Recent achievements', 'alfawzquran' ); ?></h3>
        <div id="alfawz-profile-achievement-feed" class="grid gap-3 md:grid-cols-2" aria-live="polite"></div>
    </section>
</div>

<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$current_user   = wp_get_current_user();
$display_name   = $current_user ? $current_user->display_name : __( 'Beloved Student', 'alfawzquran' );
$avatar_default = get_avatar( get_current_user_id(), 96, '', esc_attr__( 'Profile photo', 'alfawzquran' ), [
    'class' => 'h-full w-full object-cover',
] );
?>
<div id="alfawz-profile" class="alfawz-profile-shell mx-auto max-w-3xl space-y-8 px-4 py-8 text-slate-900 sm:px-6">
    <section
        class="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-r from-emerald-50 via-emerald-50/80 to-amber-50 p-8 text-center shadow-lg shadow-emerald-100/70"
        data-animate="fade"
    >
        <div class="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white/80 bg-emerald-100 shadow-inner shadow-emerald-200">
            <?php echo wp_kses_post( $avatar_default ); ?>
        </div>
        <h1 id="alfawz-profile-name" class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"><?php echo esc_html( $display_name ); ?></h1>
        <p id="alfawz-profile-tagline" class="mt-2 text-base font-medium text-slate-600"><?php esc_html_e( 'Walking with the Qur’an each day.', 'alfawzquran' ); ?></p>
        <p id="alfawz-profile-hero-note" class="mt-1 text-base font-semibold text-emerald-700"></p>

        <div class="mt-6 flex items-center justify-center gap-8 sm:gap-12">
            <div class="text-center">
                <div class="text-4xl font-bold text-emerald-700" id="alfawz-profile-streak-days">0</div>
                <div class="alfawz-profile-label"><?php esc_html_e( 'Days Streak', 'alfawzquran' ); ?></div>
            </div>
            <div class="text-center">
                <div class="text-4xl font-bold text-amber-600" id="alfawz-profile-hasanat-total" data-hasanat-total>0</div>
                <div class="alfawz-profile-label"><?php esc_html_e( 'Hasanat Earned', 'alfawzquran' ); ?></div>
            </div>
        </div>
    </section>

    <section class="grid grid-cols-2 gap-4" aria-labelledby="alfawz-profile-overview">
        <h2 id="alfawz-profile-overview" class="sr-only"><?php esc_html_e( 'Progress overview', 'alfawzquran' ); ?></h2>
        <article class="alfawz-profile-card" data-animate="fade">
            <div class="mb-3 text-4xl" aria-hidden="true">🧠</div>
            <p class="text-3xl font-bold text-slate-900" id="alfawz-profile-memorized-count">0</p>
            <p class="alfawz-profile-label"><?php esc_html_e( 'Verses Memorized', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-profile-card" data-animate="fade">
            <div class="mb-3 text-4xl" aria-hidden="true">📖</div>
            <p class="text-3xl font-bold text-slate-900" id="alfawz-profile-read-count">0</p>
            <p class="alfawz-profile-label"><?php esc_html_e( 'Verses Read', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-profile-card" data-animate="fade">
            <div class="mb-3 text-4xl animate-pulse" aria-hidden="true">🔥</div>
            <p class="text-3xl font-bold text-slate-900" id="alfawz-profile-current-streak">0</p>
            <p class="alfawz-profile-label"><?php esc_html_e( 'Current Streak', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-profile-card" data-animate="fade">
            <div class="mb-3 text-4xl" aria-hidden="true">📝</div>
            <p class="text-3xl font-bold text-slate-900" id="alfawz-profile-active-plans">0</p>
            <p class="alfawz-profile-label"><?php esc_html_e( 'Active Plans', 'alfawzquran' ); ?></p>
        </article>
    </section>

    <section class="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-lg shadow-emerald-100/60" data-animate="fade" aria-labelledby="alfawz-profile-memorization">
        <h2 id="alfawz-profile-memorization" class="mb-4 flex items-center justify-center text-xl font-bold text-slate-900 sm:justify-start">
            <span class="mr-3 text-2xl" aria-hidden="true">🧠</span>
            <?php esc_html_e( 'Memorization Journey', 'alfawzquran' ); ?>
        </h2>
        <div id="alfawz-profile-timeline" class="space-y-6"></div>
    </section>

    <section class="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-lg shadow-emerald-100/60" data-animate="fade" aria-labelledby="alfawz-profile-goal">
        <h2 id="alfawz-profile-goal" class="mb-4 text-xl font-bold text-slate-900"><?php esc_html_e( 'Today’s Recitation Goal', 'alfawzquran' ); ?></h2>
        <div class="mb-4">
            <div class="alfawz-progress-soft h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                    id="alfawz-profile-goal-fill"
                    class="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                    style="width:0%"
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow="0"
                ></div>
            </div>
            <p id="alfawz-profile-goal-text" class="mt-3 text-base font-medium text-slate-600">0 / 0 <?php esc_html_e( 'Verses Completed', 'alfawzquran' ); ?></p>
        </div>
        <div class="flex flex-col gap-2 text-base text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span id="alfawz-profile-daily-note" class="font-medium text-emerald-700"><?php esc_html_e( 'Keep going! 🌟', 'alfawzquran' ); ?></span>
            <span id="alfawz-profile-daily-reset" class="text-base text-slate-500"><?php esc_html_e( 'Resets at midnight', 'alfawzquran' ); ?></span>
        </div>
    </section>
</div>

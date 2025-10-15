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
<div id="alfawz-profile" class="alfawz-profile-shell relative mx-auto max-w-5xl space-y-12 px-4 py-10 text-slate-900 sm:px-8 lg:px-0">
    <div class="pointer-events-none absolute inset-x-6 -top-8 bottom-0 -z-10 rounded-[3rem] bg-gradient-to-br from-[#f8efe5]/70 via-[#fff4e6]/95 to-white/40 blur-3xl"></div>

    <section
        class="alfawz-profile-hero relative overflow-hidden rounded-[2.75rem] border border-white/20 bg-gradient-to-br from-[#4b0d18] via-[#741f31] to-[#a83254] p-10 text-left text-[#fff5ea] shadow-2xl shadow-[#4b0d18]/30 sm:p-12"
        data-animate="fade"
    >
        <div class="absolute -left-10 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl"></div>
        <div class="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#ffcf99]/10 blur-3xl"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff1f,transparent_55%)]"></div>

        <div class="relative flex flex-col gap-10 lg:flex-row lg:items-center">
            <div class="flex-1 space-y-6">
                <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#ffe7d6]/90">
                    <span class="h-2 w-2 rounded-full bg-[#ffcf99]"></span>
                    <?php esc_html_e( 'Daily Qur’an Momentum', 'alfawzquran' ); ?>
                </span>
                <div>
                    <h1 id="alfawz-profile-name" class="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                        <?php echo esc_html( $display_name ); ?>
                    </h1>
                    <p id="alfawz-profile-tagline" class="mt-3 max-w-2xl text-lg font-medium text-[#ffe7d6]/95 sm:text-xl">
                        <?php esc_html_e( 'Walking with the Qur’an each day.', 'alfawzquran' ); ?>
                    </p>
                    <p id="alfawz-profile-hero-note" class="mt-3 text-lg font-semibold text-[#ffcf99]"></p>
                </div>

                <div class="grid grid-cols-2 gap-6 sm:flex sm:flex-wrap sm:gap-8">
                    <div class="alfawz-hero-stat">
                        <span class="alfawz-hero-stat-label"><?php esc_html_e( 'Days streak', 'alfawzquran' ); ?></span>
                        <span id="alfawz-profile-streak-days" class="alfawz-hero-stat-value">0</span>
                    </div>
                    <div class="alfawz-hero-stat">
                        <span class="alfawz-hero-stat-label"><?php esc_html_e( 'Hasanat earned', 'alfawzquran' ); ?></span>
                        <span id="alfawz-profile-hasanat-total" class="alfawz-hero-stat-value">0</span>
                    </div>
                </div>

                <div class="flex flex-col gap-3 text-sm text-[#ffe7d6]/80 sm:flex-row sm:items-center">
                    <p class="flex items-center gap-2">
                        <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fff4e6]/15 text-lg">✨</span>
                        <?php esc_html_e( 'Stay consistent and watch your blessings grow.', 'alfawzquran' ); ?>
                    </p>
                    <a class="inline-flex items-center justify-center rounded-full bg-[#fff4e6] px-5 py-2 text-sm font-semibold text-[#4b0d18] shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:bg-white/90"
                        href="#alfawz-profile-goal"
                    >
                        <?php esc_html_e( 'Review today’s plan', 'alfawzquran' ); ?>
                        <span aria-hidden="true" class="ml-2">→</span>
                    </a>
                </div>
            </div>

            <div class="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-[#fff4e6]/20 p-2 shadow-[0_30px_60px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:h-48 sm:w-48 lg:h-56 lg:w-56">
                <div class="alfawz-avatar-glow relative h-full w-full overflow-hidden rounded-full border-4 border-[#fff4e6]/70 bg-[#fff4e6]/30 shadow-inner shadow-black/10">
                    <?php echo wp_kses_post( $avatar_default ); ?>
                </div>
            </div>
        </div>
    </section>

    <section class="alfawz-card-grid" aria-labelledby="alfawz-profile-overview">
        <h2 id="alfawz-profile-overview" class="sr-only"><?php esc_html_e( 'Progress overview', 'alfawzquran' ); ?></h2>
        <article class="alfawz-profile-card" data-animate="fade">
            <div class="alfawz-profile-card-icon" aria-hidden="true">🧠</div>
            <p id="alfawz-profile-memorized-count" class="alfawz-profile-card-value">0</p>
            <p class="alfawz-profile-label"><?php esc_html_e( 'Verses Memorized', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-profile-card" data-animate="fade">
            <div class="alfawz-profile-card-icon" aria-hidden="true">📖</div>
            <p id="alfawz-profile-read-count" class="alfawz-profile-card-value">0</p>
            <p class="alfawz-profile-label"><?php esc_html_e( 'Verses Read', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-profile-card" data-animate="fade">
            <div class="alfawz-profile-card-icon animate-pulse" aria-hidden="true">🔥</div>
            <p id="alfawz-profile-current-streak" class="alfawz-profile-card-value">0</p>
            <p class="alfawz-profile-label"><?php esc_html_e( 'Current Streak', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-profile-card" data-animate="fade">
            <div class="alfawz-profile-card-icon" aria-hidden="true">📝</div>
            <p id="alfawz-profile-active-plans" class="alfawz-profile-card-value">0</p>
            <p class="alfawz-profile-label"><?php esc_html_e( 'Active Plans', 'alfawzquran' ); ?></p>
        </article>
    </section>

    <section class="alfawz-panel" data-animate="fade" aria-labelledby="alfawz-profile-memorization">
        <div class="alfawz-panel-heading">
            <span class="alfawz-panel-icon" aria-hidden="true">🧠</span>
            <h2 id="alfawz-profile-memorization" class="alfawz-panel-title">
                <?php esc_html_e( 'Memorization Journey', 'alfawzquran' ); ?>
            </h2>
        </div>
        <div id="alfawz-profile-timeline" class="alfawz-timeline space-y-6"></div>
    </section>

    <section class="alfawz-panel" data-animate="fade" aria-labelledby="alfawz-profile-goal">
        <div class="alfawz-panel-heading">
            <span class="alfawz-panel-icon" aria-hidden="true">🎯</span>
            <h2 id="alfawz-profile-goal" class="alfawz-panel-title"><?php esc_html_e( 'Today’s Recitation Goal', 'alfawzquran' ); ?></h2>
        </div>
        <div class="mb-6 space-y-4">
            <div class="alfawz-progress-soft h-3 w-full overflow-hidden rounded-full">
                <div
                    id="alfawz-profile-goal-fill"
                    class="h-3 rounded-full bg-gradient-to-r from-[#ffcf99] via-[#f59f82] to-[#e4637e]"
                    style="width:0%"
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow="0"
                ></div>
            </div>
            <p id="alfawz-profile-goal-text" class="text-lg font-semibold text-[#4b0d18]">0 / 0 <?php esc_html_e( 'Verses Completed', 'alfawzquran' ); ?></p>
        </div>
        <div class="flex flex-col gap-3 text-base text-[#741f31]/90 sm:flex-row sm:items-center sm:justify-between">
            <span id="alfawz-profile-daily-note" class="font-semibold text-[#a83254]">
                <?php esc_html_e( 'Keep going! 🌟', 'alfawzquran' ); ?>
            </span>
            <span id="alfawz-profile-daily-reset" class="text-sm uppercase tracking-[0.25em] text-[#741f31]/70">
                <?php esc_html_e( 'Resets at midnight', 'alfawzquran' ); ?>
            </span>
        </div>
    </section>
</div>

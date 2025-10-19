<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$current_user       = wp_get_current_user();
$display_name       = $current_user ? $current_user->display_name : __( 'Beloved Student', 'alfawzquran' );
$avatar_gender_meta = get_user_meta( get_current_user_id(), 'alfawz_avatar_gender', true );
$avatar_choices     = [
    'male'   => ALFAWZQURAN_PLUGIN_URL . 'assets/images/avatar-male.svg',
    'female' => ALFAWZQURAN_PLUGIN_URL . 'assets/images/avatar-female.svg',
];
$avatar_gender        = in_array( $avatar_gender_meta, [ 'male', 'female' ], true ) ? $avatar_gender_meta : '';
$avatar_fallback_url  = esc_url( get_avatar_url( get_current_user_id(), [ 'size' => 240 ] ) );
$avatar_preview_url   = $avatar_gender && isset( $avatar_choices[ $avatar_gender ] ) ? esc_url( $avatar_choices[ $avatar_gender ] ) : $avatar_fallback_url;
$avatar_default_alt   = esc_attr__( 'Profile photo', 'alfawzquran' );
$avatar_gender_attr   = esc_attr( $avatar_gender );
?>
<div id="alfawz-profile" class="alfawz-profile-shell relative mx-auto max-w-5xl space-y-12 px-4 py-10 text-[#333333] sm:px-8 lg:px-0">
    <div class="pointer-events-none absolute inset-x-6 -top-8 bottom-0 -z-10 rounded-[3rem] bg-[linear-gradient(135deg,_#800000_0%,_#a52a2a_40%,_#fdf6f0_100%)] opacity-20 blur-3xl"></div>

    <section
        class="alfawz-profile-hero relative overflow-hidden rounded-[2.75rem] border border-white/30 bg-[linear-gradient(135deg,_#800000_0%,_#a52a2a_40%,_#fdf6f0_100%)] p-10 text-left text-[#333333] shadow-2xl shadow-[#4b0d18]/20 sm:p-12"
        data-animate="fade"
    >
        <div class="absolute -left-10 -top-16 h-44 w-44 rounded-full bg-[#800000]/25 blur-3xl"></div>
        <div class="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#f6d6c8]/50 blur-3xl"></div>
        <div class="absolute inset-0 bg-white/40 mix-blend-lighten"></div>

        <div class="relative flex flex-col gap-10 lg:flex-row lg:items-center">
            <div class="flex-1 space-y-8 text-[#333333]">
                <span class="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#800000] backdrop-blur-sm">
                    <span class="h-2 w-2 rounded-full bg-[#800000]"></span>
                    <?php esc_html_e( 'Daily Qur’an Momentum', 'alfawzquran' ); ?>
                </span>

                <div class="space-y-4 rounded-3xl border border-white/40 bg-white/75 p-6 shadow-lg shadow-[#800000]/20 backdrop-blur">
                    <h1
                        id="alfawz-profile-name"
                        class="text-4xl font-black leading-tight tracking-tight text-[#333333] sm:text-5xl lg:text-6xl"
                    >
                        <?php echo esc_html( $display_name ); ?>
                    </h1>
                    <p
                        id="alfawz-profile-tagline"
                        class="max-w-2xl text-base font-medium text-[#4f1d1d] sm:text-lg"
                    >
                        <?php esc_html_e( 'Walking with the Qur’an each day.', 'alfawzquran' ); ?>
                    </p>
                    <p
                        id="alfawz-profile-hero-note"
                        class="text-lg font-semibold text-[#800000]"
                    ></p>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                    <div class="alfawz-hero-stat rounded-2xl border border-white/40 bg-gradient-to-br from-white/85 via-[#fbe4d8]/90 to-[#f6d6c8]/90 p-5 text-left text-[#333333] shadow-lg shadow-[#800000]/20 backdrop-blur">
                        <span class="alfawz-hero-stat-label text-sm font-semibold uppercase tracking-wide text-[#800000]"><?php esc_html_e( 'Days streak', 'alfawzquran' ); ?></span>
                        <span id="alfawz-profile-streak-days" class="alfawz-hero-stat-value text-2xl sm:text-4xl text-[#333333]">0</span>
                    </div>
                    <div class="alfawz-hero-stat rounded-2xl border border-white/40 bg-gradient-to-br from-white/85 via-[#fbe4d8]/90 to-[#f6d6c8]/90 p-5 text-left text-[#333333] shadow-lg shadow-[#800000]/20 backdrop-blur">
                        <span class="alfawz-hero-stat-label text-sm font-semibold uppercase tracking-wide text-[#800000]"><?php esc_html_e( 'Hasanat earned', 'alfawzquran' ); ?></span>
                        <span id="alfawz-profile-hasanat-total" class="alfawz-hero-stat-value text-2xl sm:text-4xl text-[#333333]">0</span>
                    </div>
                </div>

                <div class="flex flex-col gap-4 text-sm text-[#4f1d1d] sm:flex-row sm:items-center">
                    <p class="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/70 px-4 py-3 shadow-lg shadow-[#800000]/10">
                        <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fbe4d8] text-lg text-[#800000]">✨</span>
                        <?php esc_html_e( 'Stay consistent and watch your blessings grow.', 'alfawzquran' ); ?>
                    </p>
                    <a
                        class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-sky-500 to-rose-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[#0f3f3a]/25 transition duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#800000]/40"
                        href="#alfawz-profile-goal"
                    >
                        <?php esc_html_e( 'Review today’s plan', 'alfawzquran' ); ?>
                        <span aria-hidden="true" class="ml-2">→</span>
                    </a>
                </div>
            </div>

            <div class="mx-auto flex flex-col items-center justify-center text-center sm:items-stretch sm:text-left">
                <div class="relative flex h-40 w-40 items-center justify-center rounded-full bg-white/60 p-2 shadow-[0_30px_60px_rgba(128,0,0,0.18)] backdrop-blur-sm sm:h-48 sm:w-48 lg:h-56 lg:w-56">
                    <div class="alfawz-avatar-glow relative h-full w-full overflow-hidden rounded-full border-4 border-white/70 bg-white/80 shadow-inner shadow-[#800000]/10">
                        <img
                            id="alfawz-profile-avatar-preview"
                            src="<?php echo $avatar_preview_url; ?>"
                            alt="<?php echo $avatar_default_alt; ?>"
                            class="h-full w-full object-cover"
                            data-default-avatar="<?php echo $avatar_fallback_url; ?>"
                            data-default-alt="<?php echo $avatar_default_alt; ?>"
                            data-avatar-gender="<?php echo $avatar_gender_attr; ?>"
                        />
                        <button
                            type="button"
                            id="alfawz-profile-avatar-button"
                            class="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#800000] shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#a52a2a]/40"
                        >
                            <span aria-hidden="true">
                                <img
                                    draggable="false"
                                    role="img"
                                    class="emoji"
                                    alt="⬆️"
                                    src="https://s.w.org/images/core/emoji/16.0.1/svg/2b06.svg"
                                />
                            </span>
                            <?php esc_html_e( 'Upload Photo', 'alfawzquran' ); ?>
                        </button>
                    </div>
                </div>
                <p class="mt-4 max-w-xs text-sm text-[#4f1d1d]/80 sm:ml-auto sm:mt-6">
                    <?php esc_html_e( 'Choose a respectful silhouette that represents you. You can update this anytime.', 'alfawzquran' ); ?>
                </p>
                <p
                    id="alfawz-profile-avatar-status"
                    class="mt-2 hidden text-center text-sm font-semibold sm:text-right"
                    aria-live="polite"
                ></p>
            </div>
        </div>
    </section>

    <div
        id="alfawz-profile-avatar-modal"
        class="fixed inset-0 z-50 hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alfawz-profile-avatar-modal-title"
    >
        <div class="absolute inset-0 bg-slate-900/50" data-avatar-overlay></div>
        <div class="relative z-10 flex min-h-full items-center justify-center px-4 py-8 sm:px-6">
            <div class="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8" data-avatar-dialog>
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h3 id="alfawz-profile-avatar-modal-title" class="text-lg font-semibold text-gray-900">
                            <?php esc_html_e( 'Choose a profile photo', 'alfawzquran' ); ?>
                        </h3>
                        <p class="mt-1 text-sm text-gray-600">
                            <?php esc_html_e( 'Select the silhouette that feels most like you. Your choice updates instantly.', 'alfawzquran' ); ?>
                        </p>
                    </div>
                    <button
                        type="button"
                        class="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        data-avatar-cancel
                        aria-label="<?php esc_attr_e( 'Close avatar chooser', 'alfawzquran' ); ?>"
                    >
                        ✕
                    </button>
                </div>
                <div class="mt-6 grid gap-4 sm:grid-cols-2">
                    <button
                        type="button"
                        class="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-emerald-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        data-avatar-option="male"
                        data-avatar-url="<?php echo esc_attr( $avatar_choices['male'] ); ?>"
                        aria-pressed="false"
                    >
                        <img src="<?php echo esc_url( $avatar_choices['male'] ); ?>" alt="<?php esc_attr_e( 'Brother silhouette', 'alfawzquran' ); ?>" class="h-28 w-28 rounded-full border border-emerald-100 bg-emerald-50 p-2 shadow-sm transition group-[aria-pressed='true']:ring-2 group-[aria-pressed='true']:ring-emerald-500" />
                        <span class="text-sm font-semibold text-gray-800"><?php esc_html_e( 'Brother silhouette', 'alfawzquran' ); ?></span>
                        <span class="text-xs text-gray-500"><?php esc_html_e( 'Thobe & kufi inspired', 'alfawzquran' ); ?></span>
                    </button>
                    <button
                        type="button"
                        class="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-rose-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        data-avatar-option="female"
                        data-avatar-url="<?php echo esc_attr( $avatar_choices['female'] ); ?>"
                        aria-pressed="false"
                    >
                        <img src="<?php echo esc_url( $avatar_choices['female'] ); ?>" alt="<?php esc_attr_e( 'Sister silhouette', 'alfawzquran' ); ?>" class="h-28 w-28 rounded-full border border-rose-100 bg-rose-50 p-2 shadow-sm transition group-[aria-pressed='true']:ring-2 group-[aria-pressed='true']:ring-rose-500" />
                        <span class="text-sm font-semibold text-gray-800"><?php esc_html_e( 'Sister silhouette', 'alfawzquran' ); ?></span>
                        <span class="text-xs text-gray-500"><?php esc_html_e( 'Hijab & abaya inspired', 'alfawzquran' ); ?></span>
                    </button>
                </div>
                <p class="mt-4 hidden text-sm" data-avatar-message></p>
                <div class="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        data-avatar-cancel
                    >
                        <?php esc_html_e( 'Cancel', 'alfawzquran' ); ?>
                    </button>
                    <button
                        type="button"
                        class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        data-avatar-save
                    >
                        <?php esc_html_e( 'Save', 'alfawzquran' ); ?>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <section class="alfawz-card-grid grid grid-cols-2 gap-4 text-[#333333] sm:grid-cols-4" aria-labelledby="alfawz-profile-overview">
        <h2 id="alfawz-profile-overview" class="sr-only"><?php esc_html_e( 'Progress overview', 'alfawzquran' ); ?></h2>
        <article class="alfawz-profile-card rounded-3xl border border-[#800000]/15 bg-white/90 p-5 shadow-lg shadow-[#800000]/10" data-animate="fade">
            <div class="alfawz-profile-card-icon" aria-hidden="true">🧠</div>
            <p id="alfawz-profile-memorized-count" class="alfawz-profile-card-value text-2xl sm:text-4xl">0</p>
            <p class="alfawz-profile-label text-lg sm:text-xl"><?php esc_html_e( 'Verses Memorized', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-profile-card rounded-3xl border border-[#800000]/15 bg-white/90 p-5 shadow-lg shadow-[#800000]/10" data-animate="fade">
            <div class="alfawz-profile-card-icon" aria-hidden="true">📖</div>
            <p id="alfawz-profile-read-count" class="alfawz-profile-card-value text-2xl sm:text-4xl">0</p>
            <p class="alfawz-profile-label text-lg sm:text-xl"><?php esc_html_e( 'Verses Read', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-profile-card rounded-3xl border border-[#800000]/15 bg-white/90 p-5 shadow-lg shadow-[#800000]/10" data-animate="fade">
            <div class="alfawz-profile-card-icon animate-pulse" aria-hidden="true">🔥</div>
            <p id="alfawz-profile-current-streak" class="alfawz-profile-card-value text-2xl sm:text-4xl">0</p>
            <p class="alfawz-profile-label text-lg sm:text-xl"><?php esc_html_e( 'Current Streak', 'alfawzquran' ); ?></p>
        </article>
        <article class="alfawz-profile-card rounded-3xl border border-[#800000]/15 bg-white/90 p-5 shadow-lg shadow-[#800000]/10" data-animate="fade">
            <div class="alfawz-profile-card-icon" aria-hidden="true">📝</div>
            <p id="alfawz-profile-active-plans" class="alfawz-profile-card-value text-2xl sm:text-4xl">0</p>
            <p class="alfawz-profile-label text-lg sm:text-xl"><?php esc_html_e( 'Active Plans', 'alfawzquran' ); ?></p>
        </article>
    </section>

    <section class="alfawz-panel rounded-3xl border border-[#800000]/15 bg-white/90 p-8 shadow-xl shadow-[#800000]/10" data-animate="fade" aria-labelledby="alfawz-profile-memorization">
        <div class="alfawz-panel-heading">
            <span class="alfawz-panel-icon" aria-hidden="true">🧠</span>
            <h2 id="alfawz-profile-memorization" class="alfawz-panel-title">
                <?php esc_html_e( 'Memorization Journey', 'alfawzquran' ); ?>
            </h2>
        </div>
        <div id="alfawz-profile-timeline" class="alfawz-timeline space-y-6"></div>
    </section>

    <section class="alfawz-panel rounded-3xl border border-[#800000]/15 bg-white/90 p-8 shadow-xl shadow-[#800000]/10" data-animate="fade" aria-labelledby="alfawz-profile-goal">
        <div class="alfawz-panel-heading">
            <span class="alfawz-panel-icon" aria-hidden="true">🎯</span>
            <h2 id="alfawz-profile-goal" class="alfawz-panel-title"><?php esc_html_e( 'Today’s Recitation Goal', 'alfawzquran' ); ?></h2>
        </div>
        <div class="mb-6 space-y-4">
            <div class="alfawz-progress-soft h-3 w-full overflow-hidden rounded-full">
                <div
                    id="alfawz-profile-goal-fill"
                    class="h-3 rounded-full bg-gradient-to-r from-[#800000] via-[#a52a2a] to-[#f6d6c8]"
                    style="width:0%"
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow="0"
                ></div>
            </div>
            <p id="alfawz-profile-goal-text" class="text-lg font-semibold text-[#333333]">0 / 0 <?php esc_html_e( 'Verses Completed', 'alfawzquran' ); ?></p>
        </div>
        <div class="flex flex-col gap-3 text-base text-[#4f1d1d] sm:flex-row sm:items-center sm:justify-between">
            <span id="alfawz-profile-daily-note" class="font-semibold text-[#800000]">
                <?php esc_html_e( 'Keep going! 🌟', 'alfawzquran' ); ?>
            </span>
            <span id="alfawz-profile-daily-reset" class="text-sm uppercase tracking-[0.25em] text-[#800000]/70">
                <?php esc_html_e( 'Resets at midnight', 'alfawzquran' ); ?>
            </span>
        </div>
    </section>
</div>

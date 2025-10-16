<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

use AlfawzQuran\Core\QaidahBoards;

if ( ! current_user_can( 'manage_options' ) && ! current_user_can( 'alfawz_admin' ) ) {
    echo '<div class="alfawz-login-required"><div class="alfawz-login-card"><h3>' . esc_html__( 'Access denied.', 'alfawzquran' ) . '</h3><p>' . esc_html__( 'This control room is limited to Alfawz administrators.', 'alfawzquran' ) . '</p></div></div>';
    return;
}

$user_counts    = count_users();
$student_total  = isset( $user_counts['avail_roles']['student'] ) ? (int) $user_counts['avail_roles']['student'] : 0;
$teacher_total  = isset( $user_counts['avail_roles']['teacher'] ) ? (int) $user_counts['avail_roles']['teacher'] : 0;
$admin_total    = isset( $user_counts['avail_roles']['alfawz_admin'] ) ? (int) $user_counts['avail_roles']['alfawz_admin'] : 0;
$subscriber_tot = isset( $user_counts['avail_roles']['subscriber'] ) ? (int) $user_counts['avail_roles']['subscriber'] : 0;
$student_total += $subscriber_tot;

$class_counts   = wp_count_posts( 'alfawz_class' );
$active_classes = $class_counts instanceof stdClass ? (int) ( $class_counts->publish ?? 0 ) : 0;

$qaidah_counts = wp_count_posts( QaidahBoards::POST_TYPE );
$qaidah_total  = $qaidah_counts instanceof stdClass ? (int) ( $qaidah_counts->publish ?? 0 ) : 0;

global $wpdb;
$plans_table   = $wpdb->prefix . 'alfawz_quran_memorization_plans';
$active_plans  = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$plans_table} WHERE status = %s", 'active' ) );
$total_plans   = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$plans_table}" );

$student_dashboard_url = function_exists( 'alfawz_get_bottom_nav_url' )
    ? alfawz_get_bottom_nav_url( 'dashboard' )
    : home_url( trailingslashit( 'alfawz-dashboard' ) );

$teacher_dashboard_url = function_exists( 'alfawz_get_bottom_nav_url' )
    ? alfawz_get_bottom_nav_url( 'teacher-dashboard' )
    : home_url( trailingslashit( 'alfawz-teacher-dashboard' ) );

$wp_admin_console_url = admin_url( 'admin.php?page=alfawz-quran' );

$environment_label = function_exists( 'wp_get_environment_type' ) ? wp_get_environment_type() : 'production';
$environment_label = ucfirst( $environment_label );

?>
<div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-16 text-slate-100">
    <div class="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
        <div class="absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div class="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div class="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
    </div>
    <div class="relative z-10 mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-0">
        <section class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-emerald-900/20 backdrop-blur">
            <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div class="space-y-4">
                    <span class="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200/90">
                        <?php esc_html_e( 'Administrator mode', 'alfawzquran' ); ?>
                    </span>
                    <h1 class="text-4xl font-black leading-tight text-white sm:text-5xl">
                        <?php esc_html_e( 'Guide the entire Alfawz learning universe with clarity.', 'alfawzquran' ); ?>
                    </h1>
                    <p class="max-w-2xl text-lg text-slate-200/90">
                        <?php esc_html_e( 'Review real-time momentum, empower teachers, and keep every learner on a compassionate memorisation path.', 'alfawzquran' ); ?>
                    </p>
                    <div class="flex flex-wrap items-center gap-4">
                        <a href="<?php echo esc_url( $wp_admin_console_url ); ?>" class="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-base font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
                            <span aria-hidden="true">⚙️</span>
                            <?php esc_html_e( 'Open WordPress admin', 'alfawzquran' ); ?>
                        </a>
                        <a href="<?php echo esc_url( $teacher_dashboard_url ); ?>" class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-200/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/60">
                            <span aria-hidden="true">🏫</span>
                            <?php esc_html_e( 'Visit teacher studio', 'alfawzquran' ); ?>
                        </a>
                        <a href="<?php echo esc_url( $student_dashboard_url ); ?>" class="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-base font-semibold text-white/80 transition hover:-translate-y-0.5 hover:text-white hover:border-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/50">
                            <span aria-hidden="true">📊</span>
                            <?php esc_html_e( 'Preview student journey', 'alfawzquran' ); ?>
                        </a>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-6">
                    <div>
                        <p class="text-sm uppercase tracking-[0.35em] text-slate-300/70"><?php esc_html_e( 'Students', 'alfawzquran' ); ?></p>
                        <p class="mt-2 text-3xl font-bold text-white"><?php echo esc_html( number_format_i18n( $student_total ) ); ?></p>
                    </div>
                    <div>
                        <p class="text-sm uppercase tracking-[0.35em] text-slate-300/70"><?php esc_html_e( 'Teachers', 'alfawzquran' ); ?></p>
                        <p class="mt-2 text-3xl font-bold text-white"><?php echo esc_html( number_format_i18n( $teacher_total ) ); ?></p>
                    </div>
                    <div>
                        <p class="text-sm uppercase tracking-[0.35em] text-slate-300/70"><?php esc_html_e( 'Portal admins', 'alfawzquran' ); ?></p>
                        <p class="mt-2 text-3xl font-bold text-white"><?php echo esc_html( number_format_i18n( $admin_total ) ); ?></p>
                    </div>
                    <div>
                        <p class="text-sm uppercase tracking-[0.35em] text-slate-300/70"><?php esc_html_e( 'Active classes', 'alfawzquran' ); ?></p>
                        <p class="mt-2 text-3xl font-bold text-white"><?php echo esc_html( number_format_i18n( $active_classes ) ); ?></p>
                    </div>
                </div>
            </div>
            <div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p class="text-sm uppercase tracking-[0.35em] text-emerald-200/80"><?php esc_html_e( 'Qa’idah assignments', 'alfawzquran' ); ?></p>
                    <p class="mt-2 text-3xl font-bold text-white"><?php echo esc_html( number_format_i18n( $qaidah_total ) ); ?></p>
                    <p class="mt-1 text-sm text-slate-200/80"><?php esc_html_e( 'Live lesson boards ready for classrooms.', 'alfawzquran' ); ?></p>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p class="text-sm uppercase tracking-[0.35em] text-cyan-200/80"><?php esc_html_e( 'Active plans', 'alfawzquran' ); ?></p>
                    <p class="mt-2 text-3xl font-bold text-white"><?php echo esc_html( number_format_i18n( $active_plans ) ); ?></p>
                    <p class="mt-1 text-sm text-slate-200/80"><?php esc_html_e( 'Students on guided memorisation journeys today.', 'alfawzquran' ); ?></p>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p class="text-sm uppercase tracking-[0.35em] text-fuchsia-200/80"><?php esc_html_e( 'Total plans', 'alfawzquran' ); ?></p>
                    <p class="mt-2 text-3xl font-bold text-white"><?php echo esc_html( number_format_i18n( $total_plans ) ); ?></p>
                    <p class="mt-1 text-sm text-slate-200/80"><?php esc_html_e( 'Historical memorisation plans archived for insight.', 'alfawzquran' ); ?></p>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p class="text-sm uppercase tracking-[0.35em] text-amber-200/80"><?php esc_html_e( 'Environment', 'alfawzquran' ); ?></p>
                    <p class="mt-2 text-3xl font-bold text-white"><?php echo esc_html( $environment_label ); ?></p>
                    <p class="mt-1 text-sm text-slate-200/80"><?php esc_html_e( 'System health indicators normal.', 'alfawzquran' ); ?></p>
                </div>
            </div>
        </section>

        <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <article class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-emerald-900/20">
                <header class="mb-6 flex items-center justify-between">
                    <div>
                        <p class="text-sm uppercase tracking-[0.35em] text-emerald-200/80"><?php esc_html_e( 'Operational priorities', 'alfawzquran' ); ?></p>
                        <h2 class="mt-2 text-3xl font-extrabold text-white"><?php esc_html_e( 'Next impactful actions', 'alfawzquran' ); ?></h2>
                    </div>
                    <span class="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-300/10 px-4 py-1 text-sm font-semibold text-emerald-100">
                        <span aria-hidden="true">🚀</span><?php esc_html_e( 'Momentum', 'alfawzquran' ); ?>
                    </span>
                </header>
                <ul class="space-y-4 text-base text-slate-200/90">
                    <li class="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p class="font-semibold text-white"><?php esc_html_e( 'Review pending enrolment requests', 'alfawzquran' ); ?></p>
                        <p class="mt-1 text-sm text-slate-200/70"><?php esc_html_e( 'Ensure every learner is assigned to a nurturing class by close of day.', 'alfawzquran' ); ?></p>
                    </li>
                    <li class="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p class="font-semibold text-white"><?php esc_html_e( 'Celebrate streak milestones', 'alfawzquran' ); ?></p>
                        <p class="mt-1 text-sm text-slate-200/70"><?php esc_html_e( 'Send a heartfelt note to students who crossed their weekly memorisation goals.', 'alfawzquran' ); ?></p>
                    </li>
                    <li class="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p class="font-semibold text-white"><?php esc_html_e( 'Audit teacher workloads', 'alfawzquran' ); ?></p>
                        <p class="mt-1 text-sm text-slate-200/70"><?php esc_html_e( 'Balance Qa’idah assignments so every classroom feels supported and energised.', 'alfawzquran' ); ?></p>
                    </li>
                </ul>
            </article>

            <article class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-slate-900/30">
                <header class="mb-6">
                    <p class="text-sm uppercase tracking-[0.35em] text-cyan-200/80"><?php esc_html_e( 'System signals', 'alfawzquran' ); ?></p>
                    <h2 class="mt-2 text-3xl font-extrabold text-white"><?php esc_html_e( 'Platform health overview', 'alfawzquran' ); ?></h2>
                </header>
                <div class="space-y-4 text-base text-slate-200/90">
                    <div class="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <span class="text-xl" aria-hidden="true">🔐</span>
                        <div>
                            <p class="font-semibold text-white"><?php esc_html_e( 'Secure sessions', 'alfawzquran' ); ?></p>
                            <p class="text-sm text-slate-200/70"><?php esc_html_e( 'All admin routes require Alfawz Admin capability and are protected by WordPress nonces.', 'alfawzquran' ); ?></p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <span class="text-xl" aria-hidden="true">📦</span>
                        <div>
                            <p class="font-semibold text-white"><?php esc_html_e( 'Data integrity', 'alfawzquran' ); ?></p>
                            <p class="text-sm text-slate-200/70"><?php esc_html_e( 'Memorisation plans and Qa’idah boards are synchronised with class assignments.', 'alfawzquran' ); ?></p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <span class="text-xl" aria-hidden="true">🌐</span>
                        <div>
                            <p class="font-semibold text-white"><?php esc_html_e( 'Environment status', 'alfawzquran' ); ?></p>
                            <p class="text-sm text-slate-200/70"><?php esc_html_e( 'Current deployment environment:', 'alfawzquran' ); ?> <strong class="text-white"><?php echo esc_html( $environment_label ); ?></strong></p>
                        </div>
                    </div>
                </div>
            </article>
        </section>
    </div>
</div>

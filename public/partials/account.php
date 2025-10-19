<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$is_logged_in   = is_user_logged_in();
$current_user   = $is_logged_in ? wp_get_current_user() : null;
$display_name   = $current_user ? $current_user->display_name : '';
$role_label     = '';
$logout_url     = wp_logout_url( get_permalink() );
$can_register   = function_exists( 'wp_registration_enabled' ) ? wp_registration_enabled() : (bool) get_option( 'users_can_register' );
$register_url   = $can_register ? wp_registration_url() : '';
$lost_password  = wp_lostpassword_url( get_permalink() );

$student_dashboard_url = function_exists( 'alfawz_get_bottom_nav_url' )
    ? alfawz_get_bottom_nav_url( 'dashboard' )
    : home_url( trailingslashit( 'alfawz-dashboard' ) );

$teacher_dashboard_url = function_exists( 'alfawz_get_bottom_nav_url' )
    ? alfawz_get_bottom_nav_url( 'teacher-dashboard' )
    : home_url( trailingslashit( 'alfawz-teacher-dashboard' ) );

$admin_portal_url = function_exists( 'alfawz_get_bottom_nav_url' )
    ? alfawz_get_bottom_nav_url( 'admin-dashboard' )
    : home_url( trailingslashit( 'alfawz-admin-dashboard' ) );

$settings_url = function_exists( 'alfawz_get_bottom_nav_url' )
    ? alfawz_get_bottom_nav_url( 'settings' )
    : home_url( trailingslashit( 'alfawz-settings' ) );

$wp_admin_console_url = admin_url( 'admin.php?page=alfawz-quran' );

$requested_redirect = '';
if ( isset( $_GET['redirect_to'] ) ) {
    $raw_redirect       = wp_unslash( $_GET['redirect_to'] );
    $raw_redirect       = is_string( $raw_redirect ) ? rawurldecode( $raw_redirect ) : '';
    $requested_redirect = wp_validate_redirect( $raw_redirect, '' );
}

$student_redirect = $requested_redirect ? $requested_redirect : $student_dashboard_url;
$teacher_redirect = $requested_redirect ? $requested_redirect : $teacher_dashboard_url;
$admin_redirect   = $requested_redirect ? $requested_redirect : $admin_portal_url;

$notices = [];

if ( isset( $_GET['alfawz_notice'] ) ) {
    $raw_notices = wp_unslash( $_GET['alfawz_notice'] );
    $notice_keys = array_filter( array_map( 'sanitize_key', (array) $raw_notices ) );

    foreach ( $notice_keys as $notice_key ) {
        if ( 'login_failed' === $notice_key ) {
            $notices[] = [
                'type'    => 'error',
                'icon'    => '⚠️',
                'message' => __( 'We could not sign you in. Please check your email or password and try again.', 'alfawzquran' ),
            ];
        } elseif ( 'reauth' === $notice_key ) {
            $notices[] = [
                'type'    => 'warning',
                'icon'    => '🔐',
                'message' => __( 'For your security, please log in again to continue.', 'alfawzquran' ),
            ];
        } elseif ( 'restricted' === $notice_key ) {
            $notices[] = [
                'type'    => 'warning',
                'icon'    => '🚫',
                'message' => __( 'That area is reserved for a different role. Choose one of your available Alfawz tools below.', 'alfawzquran' ),
            ];
        } elseif ( 'check_email' === $notice_key ) {
            $notices[] = [
                'type'    => 'info',
                'icon'    => '✉️',
                'message' => __( 'Check your email for a link to reset your password.', 'alfawzquran' ),
            ];
        } elseif ( 'registration' === $notice_key ) {
            $notices[] = [
                'type'    => 'info',
                'icon'    => '✅',
                'message' => __( 'Registration is almost complete. Please check your email to confirm.', 'alfawzquran' ),
            ];
        } elseif ( 'password_reset' === $notice_key ) {
            $notices[] = [
                'type'    => 'success',
                'icon'    => '🔑',
                'message' => __( 'Your password has been reset. You can now log in with your new credentials.', 'alfawzquran' ),
            ];
        }
    }
}

if ( isset( $_GET['loggedout'] ) ) {
    $notices[] = [
        'type'    => 'success',
        'icon'    => '👋',
        'message' => __( 'You have been signed out successfully.', 'alfawzquran' ),
    ];
}

$is_admin_user   = $is_logged_in && $current_user instanceof WP_User && ( user_can( $current_user, 'manage_options' ) || user_can( $current_user, 'alfawz_admin' ) );
$is_teacher_user = $is_logged_in && $current_user instanceof WP_User && ( user_can( $current_user, 'alfawz_teacher' ) || in_array( 'teacher', (array) $current_user->roles, true ) );
$is_student_user = $is_logged_in && $current_user instanceof WP_User && ( user_can( $current_user, 'alfawz_student' ) || in_array( 'student', (array) $current_user->roles, true ) || in_array( 'subscriber', (array) $current_user->roles, true ) || ( ! $is_admin_user && ! $is_teacher_user ) );

if ( $is_logged_in && $current_user instanceof WP_User ) {
    if ( $is_admin_user ) {
        $role_label = __( 'Administrator', 'alfawzquran' );
    } elseif ( $is_teacher_user ) {
        $role_label = __( 'Teacher', 'alfawzquran' );
    } else {
        $role_label = __( 'Student', 'alfawzquran' );
    }
}

$role_redirects = [
    'student' => [
        'label'       => __( 'Student Portal', 'alfawzquran' ),
        'description' => __( 'Track memorization, goals, and progress.', 'alfawzquran' ),
        'redirect'    => $student_redirect,
    ],
    'teacher' => [
        'label'       => __( 'Teacher Portal', 'alfawzquran' ),
        'description' => __( 'Review recitations and guide your class.', 'alfawzquran' ),
        'redirect'    => $teacher_redirect,
    ],
    'admin' => [
        'label'       => __( 'Administrator Portal', 'alfawzquran' ),
        'description' => __( 'Manage classes, roles, and school insights.', 'alfawzquran' ),
        'redirect'    => $admin_redirect,
    ],
];

$logo_url = defined( 'ALFAWZQURAN_PLUGIN_URL' )
    ? ALFAWZQURAN_PLUGIN_URL . 'public/placeholder-logo.png'
    : plugins_url( 'public/placeholder-logo.png', dirname( __DIR__, 2 ) . '/alfawzquran.php' );

$contact_developer_url = 'https://wa.me/8100362023?text=' . rawurlencode( "Hello! I'd love to learn more about the Advanced SchoolPortal and how it can elevate our school's experience." );
$home_url             = 'https://victoryeducationalacademy.com.ng/';
$contact_url          = 'https://victoryeducationalacademy.com.ng/contact';

$role_icons = [
    'student' => '🎓',
    'teacher' => '🧑‍🏫',
    'admin'   => '🛡️',
];
?>
<div class="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,_#800000_0%,_#a52a2a_40%,_#fdf6f0_100%)] text-[#333333]">
    <div class="pointer-events-none absolute inset-0">
        <div class="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-[#a52a2a]/35 blur-3xl"></div>
        <div class="absolute bottom-[-6rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#fbe9dc]/60 blur-3xl"></div>
        <div class="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-[#800000]/40 blur-3xl"></div>
    </div>
    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-10">
        <div class="grid w-full items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div class="flex flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-2xl backdrop-blur-xl">
                <div class="relative overflow-hidden bg-gradient-to-r from-[#800000] via-[#a52a2a] to-[#fdf6f0] px-8 py-10 text-[#333333]">
                    <div class="pointer-events-none absolute inset-0 bg-white/70 mix-blend-lighten"></div>
                    <div class="absolute inset-x-8 bottom-2 z-10 h-px bg-[#800000]/20"></div>
                    <div class="relative z-10 flex items-center gap-4">
                        <img src="<?php echo esc_url( $logo_url ); ?>" alt="<?php esc_attr_e( 'Alfawz emblem', 'alfawzquran' ); ?>" class="h-14 w-14 rounded-2xl border border-[#800000]/20 bg-white/70 p-2 shadow-lg" />
                        <div>
                            <p class="text-sm uppercase tracking-[0.35em] text-[#333333]/70"><?php esc_html_e( 'Alfawz Network', 'alfawzquran' ); ?></p>
                            <h1 class="text-2xl font-semibold sm:text-3xl"><?php esc_html_e( 'School Portal Account', 'alfawzquran' ); ?></h1>
                        </div>
                    </div>
                    <p class="relative z-10 mt-6 max-w-xl text-sm text-[#333333]/80 sm:text-base">
                        <?php if ( $is_logged_in ) : ?>
                            <?php
                            printf(
                                /* translators: %s: user display name */
                                esc_html__( 'Assalamu alaikum, %s. We are ready to guide you to the right Alfawz workspace.', 'alfawzquran' ),
                                esc_html( $display_name )
                            );
                            ?>
                        <?php else : ?>
                            <?php esc_html_e( 'Access every Alfawz experience — Quran memorisation, teaching tools, and admin insights — with one vibrant account.', 'alfawzquran' ); ?>
                        <?php endif; ?>
                    </p>
                </div>

                <div class="flex flex-1 flex-col gap-8 px-6 py-8 sm:px-8">
                    <?php if ( ! empty( $notices ) ) : ?>
                        <div class="space-y-3">
                            <?php
                            foreach ( $notices as $notice ) {
                                $type    = isset( $notice['type'] ) ? $notice['type'] : 'info';
                                $icon    = isset( $notice['icon'] ) ? $notice['icon'] : 'ℹ️';
                                $message = isset( $notice['message'] ) ? $notice['message'] : '';

                                if ( empty( $message ) ) {
                                    continue;
                                }

                                $styles = [
                                    'error'   => 'border-[#d66a6a]/60 bg-[#fdecef] text-[#7a1d1d] shadow-sm shadow-rose-200',
                                    'warning' => 'border-[#f1b97a]/60 bg-[#fff4e6] text-[#7a4314] shadow-sm shadow-amber-200',
                                    'success' => 'border-[#5cbf90]/60 bg-[#eefaf4] text-[#275a3f] shadow-sm shadow-emerald-200',
                                    'info'    => 'border-[#7da7d9]/60 bg-[#edf4ff] text-[#1f365d] shadow-sm shadow-sky-200',
                                ];

                                $class = isset( $styles[ $type ] ) ? $styles[ $type ] : $styles['info'];
                                ?>
                                <div class="flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium <?php echo esc_attr( $class ); ?>" role="alert">
                                    <span aria-hidden="true" class="text-lg leading-none"><?php echo esc_html( $icon ); ?></span>
                                    <span><?php echo esc_html( $message ); ?></span>
                                </div>
                                <?php
                            }
                            ?>
                        </div>
                    <?php endif; ?>

                    <?php if ( $is_logged_in ) : ?>
                        <div class="space-y-6">
                            <div class="rounded-2xl border border-[#800000]/20 bg-gradient-to-br from-[#fdf0ea] via-white to-[#f9e2d6] px-5 py-4 text-sm text-[#333333] shadow-inner">
                                <?php if ( $role_label ) : ?>
                                    <?php
                                    printf(
                                        /* translators: %s: current user role */
                                        esc_html__( 'You are signed in as a %s.', 'alfawzquran' ),
                                        esc_html( $role_label )
                                    );
                                    ?>
                                <?php endif; ?>
                            </div>
                            <div class="grid gap-4 sm:grid-cols-2">
                                <?php foreach ( $role_redirects as $role_key => $role_data ) : ?>
                                    <?php
                                    $can_access_role = (
                                        ( 'student' === $role_key && $is_student_user ) ||
                                        ( 'teacher' === $role_key && $is_teacher_user ) ||
                                        ( 'admin' === $role_key && $is_admin_user )
                                    );

                                    if ( ! $can_access_role ) {
                                        continue;
                                    }

                                    $icon = isset( $role_icons[ $role_key ] ) ? $role_icons[ $role_key ] : '✨';
                                    ?>
                                    <a class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#800000]/15 bg-white/95 p-5 text-[#333333] shadow-lg transition hover:-translate-y-1 hover:border-[#800000]/30 hover:shadow-rose-200" href="<?php echo esc_url( $role_data['redirect'] ); ?>">
                                        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#800000] via-[#a52a2a] to-[#fdf6f0] opacity-80 transition group-hover:opacity-100"></div>
                                        <span class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 via-sky-100 to-rose-100 text-lg text-[#333333]"><?php echo esc_html( $icon ); ?></span>
                                        <h2 class="text-base font-semibold text-[#333333]"><?php echo esc_html( $role_data['label'] ); ?></h2>
                                        <p class="mt-2 flex-1 text-sm text-[#555555]"><?php echo esc_html( $role_data['description'] ); ?></p>
                                        <span class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#a52a2a]"><?php esc_html_e( 'Enter now', 'alfawzquran' ); ?>
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M5 12h14M13 5l7 7-7 7"></path>
                                            </svg>
                                        </span>
                                    </a>
                                <?php endforeach; ?>
                            </div>
                            <div class="grid gap-3 sm:grid-cols-2">
                                <a class="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#800000]/20 bg-white/90 px-4 py-3 text-sm font-semibold text-[#333333] shadow-md transition hover:-translate-y-0.5 hover:bg-[#fdf6f0]" href="<?php echo esc_url( $settings_url ); ?>">
                                    <span>⚙️</span>
                                    <span><?php esc_html_e( 'Manage Preferences', 'alfawzquran' ); ?></span>
                                </a>
                                <a class="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#800000]/20 bg-white/90 px-4 py-3 text-sm font-semibold text-[#333333] shadow-md transition hover:-translate-y-0.5 hover:bg-[#fdf6f0]" href="<?php echo esc_url( $logout_url ); ?>">
                                    <span>🚪</span>
                                    <span><?php esc_html_e( 'Sign Out Securely', 'alfawzquran' ); ?></span>
                                </a>
                                <?php if ( $is_admin_user ) : ?>
                                    <a class="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#800000]/20 bg-white/90 px-4 py-3 text-sm font-semibold text-[#333333] shadow-md transition hover:-translate-y-0.5 hover:bg-[#fdf6f0]" href="<?php echo esc_url( $wp_admin_console_url ); ?>">
                                        <span>🗂️</span>
                                        <span><?php esc_html_e( 'WordPress Dashboard', 'alfawzquran' ); ?></span>
                                    </a>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php else : ?>
                        <div class="space-y-6">
                            <div class="flex items-center rounded-full bg-gradient-to-r from-[#800000]/15 via-[#a52a2a]/10 to-[#fdf6f0]/60 p-1 text-sm font-semibold text-[#333333]" data-alfawz-tablist>
                                <button type="button" class="flex-1 rounded-full px-4 py-2 transition data-[active=true]:bg-white data-[active=true]:shadow-lg data-[active=true]:text-[#800000]" data-alfawz-tab="login" data-active="true"><?php esc_html_e( 'Login', 'alfawzquran' ); ?></button>
                                <button type="button" class="flex-1 rounded-full px-4 py-2 transition data-[active=true]:bg-white data-[active=true]:shadow-lg data-[active=true]:text-[#800000]" data-alfawz-tab="register" data-active="false"><?php esc_html_e( 'Register', 'alfawzquran' ); ?></button>
                            </div>
                            <div data-alfawz-tab-panel="login">
                                <form method="post" action="<?php echo esc_url( wp_login_url() ); ?>" class="space-y-5" autocomplete="on">
                                    <div class="space-y-2">
                                        <label for="alfawz-login-role" class="text-xs font-semibold uppercase tracking-wider text-[#333333]"> <?php esc_html_e( 'Choose your role', 'alfawzquran' ); ?> </label>
                                        <div class="relative">
                                            <select id="alfawz-login-role" name="alfawz_role" class="flex h-11 w-full items-center rounded-2xl border border-[#800000]/30 bg-white px-4 text-sm font-medium text-[#333333] shadow-md transition focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/30" data-alfawz-role-select>
                                                <?php foreach ( $role_redirects as $role_key => $role_data ) : ?>
                                                    <option value="<?php echo esc_attr( $role_key ); ?>" data-redirect="<?php echo esc_url( $role_data['redirect'] ); ?>"><?php echo esc_html( $role_data['label'] ); ?></option>
                                                <?php endforeach; ?>
                                            </select>
                                            <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#800000]">
                                                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0l-4.24-4.52a.75.75 0 01.02-1.06z" clip-rule="evenodd"></path>
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                    <div class="space-y-2">
                                        <label for="alfawz-login-email" class="text-xs font-semibold uppercase tracking-wider text-[#333333]"> <?php esc_html_e( 'Email or Username', 'alfawzquran' ); ?> </label>
                                        <input type="text" id="alfawz-login-email" name="log" class="h-11 w-full rounded-2xl border border-[#800000]/30 bg-white px-4 text-sm text-[#333333] shadow-md transition focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/30" placeholder="<?php esc_attr_e( 'Enter your email', 'alfawzquran' ); ?>" autocomplete="username" required />
                                    </div>
                                    <div class="space-y-2">
                                        <label for="alfawz-login-password" class="text-xs font-semibold uppercase tracking-wider text-[#333333]"> <?php esc_html_e( 'Password', 'alfawzquran' ); ?> </label>
                                        <input type="password" id="alfawz-login-password" name="pwd" class="h-11 w-full rounded-2xl border border-[#800000]/30 bg-white px-4 text-sm text-[#333333] shadow-md transition focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/30" placeholder="<?php esc_attr_e( 'Enter your password', 'alfawzquran' ); ?>" autocomplete="current-password" required />
                                    </div>
                                    <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-[#333333]">
                                        <label class="inline-flex items-center gap-2">
                                            <input type="checkbox" name="rememberme" value="forever" class="h-4 w-4 rounded border border-[#800000]/30 text-[#a52a2a] focus:ring-[#800000]" />
                                            <span><?php esc_html_e( 'Stay signed in', 'alfawzquran' ); ?></span>
                                        </label>
                                        <a href="<?php echo esc_url( $lost_password ); ?>" class="font-semibold text-[#a52a2a] underline-offset-4 hover:text-[#800000] hover:underline"> <?php esc_html_e( 'Forgot password?', 'alfawzquran' ); ?> </a>
                                    </div>
                                    <?php do_action( 'login_form' ); ?>
                                    <input type="hidden" name="redirect_to" value="<?php echo esc_url( $student_redirect ); ?>" data-alfawz-redirect-input data-default-redirect="<?php echo esc_url( $student_redirect ); ?>" />
                                    <input type="hidden" name="testcookie" value="1" />
                                    <button type="submit" name="wp-submit" class="group inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 via-sky-500 to-rose-500 p-[2px] text-sm font-semibold shadow-xl transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/60">
                                        <span class="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/95 px-4 py-3">
                                            <span class="bg-gradient-to-r from-emerald-600 via-sky-600 to-rose-600 bg-clip-text text-lg text-transparent transition duration-300 group-hover:scale-105">🔓</span>
                                            <span class="bg-gradient-to-r from-emerald-600 via-sky-600 to-rose-600 bg-clip-text text-transparent transition duration-300 group-hover:tracking-wide"><?php esc_html_e( 'Sign in to Alfawz', 'alfawzquran' ); ?></span>
                                        </span>
                                    </button>
                                    <div class="pt-2 text-center text-sm text-[#333333]">
                                        <a href="<?php echo esc_url( $contact_developer_url ); ?>" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#a52a2a] underline-offset-4 hover:text-[#800000] hover:underline"><?php esc_html_e( 'Need help? Chat with the portal team.', 'alfawzquran' ); ?></a>
                                    </div>
                                </form>
                            </div>
                            <div class="hidden" data-alfawz-tab-panel="register">
                                <?php if ( $register_url ) : ?>
                                    <div class="space-y-4 text-sm text-[#333333]">
                                        <p class="rounded-2xl border border-[#800000]/15 bg-white/80 px-4 py-3 shadow-sm"><?php esc_html_e( 'Families and staff can create new accounts using our secure registration form.', 'alfawzquran' ); ?></p>
                                        <a href="<?php echo esc_url( $register_url ); ?>" class="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#800000]/25 bg-white/95 px-4 py-3 text-sm font-semibold text-[#333333] shadow-md transition hover:-translate-y-0.5 hover:bg-[#fdf6f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800000]/20">
                                            <span>📝</span>
                                            <span><?php esc_html_e( 'Open Registration Page', 'alfawzquran' ); ?></span>
                                        </a>
                                    </div>
                                <?php else : ?>
                                    <div class="space-y-4 text-sm text-[#333333]">
                                        <p class="rounded-2xl border border-[#800000]/15 bg-white/80 px-4 py-3 shadow-sm"><?php esc_html_e( 'Online registration is currently closed. Please contact the school office for assistance.', 'alfawzquran' ); ?></p>
                                        <a href="<?php echo esc_url( $contact_developer_url ); ?>" target="_blank" rel="noopener noreferrer" class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffe8b9] via-[#f7a7b7] to-[#ff90c2] px-4 py-3 text-sm font-semibold text-[#3d0c1e] shadow-lg transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7a7b7]/60">
                                            <span>💬</span>
                                            <span><?php esc_html_e( 'Message the Portal Team', 'alfawzquran' ); ?></span>
                                        </a>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <div class="relative flex flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/85 p-8 text-[#333333] shadow-2xl backdrop-blur-xl">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(165,42,42,0.18),_transparent_55%)]"></div>
                <div class="relative z-10 flex flex-col gap-8">
                    <div>
                        <p class="text-sm uppercase tracking-[0.35em] text-[#a52a2a]">
                            <?php esc_html_e( 'Alfawz Advantage', 'alfawzquran' ); ?>
                        </p>
                        <h2 class="mt-3 text-3xl font-semibold leading-tight text-[#333333] sm:text-4xl"><?php esc_html_e( 'Built for joyful learning and growth', 'alfawzquran' ); ?></h2>
                        <p class="mt-4 max-w-md text-sm text-[#555555]">
                            <?php esc_html_e( 'Stay connected with colourful dashboards, Quran memorisation milestones, and collaborative planning tools for every Alfawz role.', 'alfawzquran' ); ?>
                        </p>
                    </div>
                    <dl class="grid gap-4 sm:grid-cols-2">
                        <div class="rounded-2xl border border-[#f3c7c7]/60 bg-gradient-to-br from-[#fdf6f0] via-white to-[#fde6ef] p-4 text-[#333333] shadow-lg">
                            <dt class="flex items-center gap-2 text-sm font-semibold">
                                <span class="text-lg">📘</span>
                                <?php esc_html_e( 'Student Focus', 'alfawzquran' ); ?>
                            </dt>
                            <dd class="mt-2 text-sm text-[#555555]"><?php esc_html_e( 'Celebrate every ayah memorised with bright progress streaks.', 'alfawzquran' ); ?></dd>
                        </div>
                        <div class="rounded-2xl border border-[#f3c7c7]/60 bg-gradient-to-br from-[#fdf6f0] via-white to-[#fde6ef] p-4 text-[#333333] shadow-lg">
                            <dt class="flex items-center gap-2 text-sm font-semibold">
                                <span class="text-lg">🧭</span>
                                <?php esc_html_e( 'Teacher Clarity', 'alfawzquran' ); ?>
                            </dt>
                            <dd class="mt-2 text-sm text-[#555555]"><?php esc_html_e( 'Schedule classes, review recitations, and share joyful feedback.', 'alfawzquran' ); ?></dd>
                        </div>
                        <div class="rounded-2xl border border-[#f3c7c7]/60 bg-gradient-to-br from-[#fdf6f0] via-white to-[#fde6ef] p-4 text-[#333333] shadow-lg">
                            <dt class="flex items-center gap-2 text-sm font-semibold">
                                <span class="text-lg">🏫</span>
                                <?php esc_html_e( 'Admin Insight', 'alfawzquran' ); ?>
                            </dt>
                            <dd class="mt-2 text-sm text-[#555555]"><?php esc_html_e( 'Monitor enrolment, roles, and campus communications at a glance.', 'alfawzquran' ); ?></dd>
                        </div>
                        <div class="rounded-2xl border border-[#f3c7c7]/60 bg-gradient-to-br from-[#fdf6f0] via-white to-[#fde6ef] p-4 text-[#333333] shadow-lg">
                            <dt class="flex items-center gap-2 text-sm font-semibold">
                                <span class="text-lg">🤝</span>
                                <?php esc_html_e( 'Family Partnership', 'alfawzquran' ); ?>
                            </dt>
                            <dd class="mt-2 text-sm text-[#555555]"><?php esc_html_e( 'Keep guardians uplifted with timely updates and colourful reports.', 'alfawzquran' ); ?></dd>
                        </div>
                    </dl>
                    <div class="grid gap-3 sm:grid-cols-2">
                        <a href="<?php echo esc_url( $home_url ); ?>" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#800000]/20 bg-white/95 px-4 py-3 text-sm font-semibold text-[#333333] shadow-md transition hover:-translate-y-0.5 hover:bg-[#fdf6f0]">
                            <span>🏠</span>
                            <span><?php esc_html_e( 'Visit Alfawz Home', 'alfawzquran' ); ?></span>
                        </a>
                        <a href="<?php echo esc_url( $contact_url ); ?>" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#800000]/20 bg-white/95 px-4 py-3 text-sm font-semibold text-[#333333] shadow-md transition hover:-translate-y-0.5 hover:bg-[#fdf6f0]">
                            <span>📞</span>
                            <span><?php esc_html_e( 'Contact Support', 'alfawzquran' ); ?></span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const tabButtons = document.querySelectorAll('[data-alfawz-tab]');
        const tabPanels = document.querySelectorAll('[data-alfawz-tab-panel]');
        const roleSelect = document.querySelector('[data-alfawz-role-select]');
        const redirectInput = document.querySelector('[data-alfawz-redirect-input]');

        const activateTab = (target) => {
            tabButtons.forEach((button) => {
                const isActive = button.dataset.alfawzTab === target;
                button.dataset.active = isActive ? 'true' : 'false';
            });
            tabPanels.forEach((panel) => {
                panel.classList.toggle('hidden', panel.dataset.alfawzTabPanel !== target);
            });
        };

        tabButtons.forEach((button) => {
            button.addEventListener('click', () => activateTab(button.dataset.alfawzTab));
        });

        if (tabButtons.length) {
            activateTab('login');
        }

        const updateRedirect = () => {
            if (!roleSelect || !redirectInput) {
                return;
            }
            const selectedOption = roleSelect.options[roleSelect.selectedIndex];
            if (selectedOption) {
                const redirect = selectedOption.getAttribute('data-redirect') || redirectInput.dataset.defaultRedirect;
                if (redirect) {
                    redirectInput.value = redirect;
                }
            }
        };

        if (roleSelect) {
            roleSelect.addEventListener('change', updateRedirect);
            updateRedirect();
        }
    });
})();
</script>

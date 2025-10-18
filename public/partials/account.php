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
?>
<div class="min-h-screen bg-gradient-to-br from-green-50 to-yellow-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <div class="text-center mb-8">
            <div class="flex items-center justify-center mb-4">
                <img src="<?php echo esc_url( $logo_url ); ?>" alt="Victory Educational Academy logo" class="h-12 w-12 object-contain rounded-md shadow-sm" />
            </div>
            <h1 class="text-3xl font-bold text-[#2d682d] mb-2"><?php esc_html_e( 'Victory Educational Academy', 'alfawzquran' ); ?></h1>
            <p class="text-[#b29032]"><?php esc_html_e( 'Victory Educational Academy School Management Portal', 'alfawzquran' ); ?></p>
        </div>
        <div class="text-card-foreground flex flex-col gap-6 rounded-xl border py-6 border-[#2d682d]/20 bg-white/95 backdrop-blur shadow-xl">
            <div class="grid auto-rows-min items-start gap-1.5 px-6">
                <div class="leading-none font-semibold text-[#2d682d]">
                    <?php if ( $is_logged_in ) : ?>
                        <?php esc_html_e( 'You are signed in', 'alfawzquran' ); ?>
                    <?php else : ?>
                        <?php esc_html_e( 'Welcome Back', 'alfawzquran' ); ?>
                    <?php endif; ?>
                </div>
                <div class="text-sm text-[#b29032]">
                    <?php if ( $is_logged_in ) : ?>
                        <?php
                        printf(
                            /* translators: %s: user display name */
                            esc_html__( 'Assalamu alaikum, %s. Choose where to go next.', 'alfawzquran' ),
                            esc_html( $display_name )
                        );
                        ?>
                    <?php else : ?>
                        <?php esc_html_e( 'Sign in to access your school portal', 'alfawzquran' ); ?>
                    <?php endif; ?>
                </div>
            </div>
            <?php if ( ! empty( $notices ) ) : ?>
                <div class="px-6">
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
                                'error'   => 'border-red-500 bg-red-50 text-red-700',
                                'warning' => 'border-[#b29032] bg-yellow-50 text-[#7a5e1f]',
                                'success' => 'border-[#2d682d] bg-green-50 text-[#2d682d]',
                                'info'    => 'border-[#2d682d] bg-green-50 text-[#2d682d]',
                            ];

                            $class = isset( $styles[ $type ] ) ? $styles[ $type ] : $styles['info'];
                            ?>
                            <div class="flex items-start gap-3 rounded-lg border-l-4 px-4 py-3 text-sm font-medium <?php echo esc_attr( $class ); ?>" role="alert">
                                <span aria-hidden="true"><?php echo esc_html( $icon ); ?></span>
                                <span><?php echo esc_html( $message ); ?></span>
                            </div>
                            <?php
                        }
                        ?>
                    </div>
                </div>
            <?php endif; ?>

            <?php if ( $is_logged_in ) : ?>
                <div class="px-6 space-y-5">
                    <div class="rounded-lg border border-[#2d682d]/20 bg-green-50/60 px-4 py-3 text-sm text-[#2d682d] shadow-inner">
                        <?php
                        if ( $role_label ) {
                            printf(
                                /* translators: %s: current user role */
                                esc_html__( 'You are signed in as a %s.', 'alfawzquran' ),
                                esc_html( $role_label )
                            );
                        }
                        ?>
                    </div>
                    <div class="space-y-3">
                        <?php if ( $is_student_user ) : ?>
                            <a class="inline-flex w-full items-center justify-center rounded-md bg-[#2d682d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d682d]/90" href="<?php echo esc_url( $student_dashboard_url ); ?>"><?php esc_html_e( 'Open Student Dashboard', 'alfawzquran' ); ?></a>
                        <?php endif; ?>
                        <?php if ( $is_teacher_user ) : ?>
                            <a class="inline-flex w-full items-center justify-center rounded-md border border-[#2d682d]/30 bg-white px-4 py-2 text-sm font-semibold text-[#2d682d] shadow-sm transition hover:bg-green-50" href="<?php echo esc_url( $teacher_dashboard_url ); ?>"><?php esc_html_e( 'Go to Teacher Tools', 'alfawzquran' ); ?></a>
                        <?php endif; ?>
                        <?php if ( $is_admin_user ) : ?>
                            <a class="inline-flex w-full items-center justify-center rounded-md border border-[#2d682d]/30 bg-white px-4 py-2 text-sm font-semibold text-[#2d682d] shadow-sm transition hover:bg-green-50" href="<?php echo esc_url( $admin_portal_url ); ?>"><?php esc_html_e( 'Open Admin Console', 'alfawzquran' ); ?></a>
                            <a class="inline-flex w-full items-center justify-center rounded-md border border-[#2d682d]/30 bg-white px-4 py-2 text-sm font-semibold text-[#2d682d] shadow-sm transition hover:bg-green-50" href="<?php echo esc_url( $wp_admin_console_url ); ?>"><?php esc_html_e( 'WordPress Dashboard', 'alfawzquran' ); ?></a>
                        <?php endif; ?>
                        <a class="inline-flex w-full items-center justify-center rounded-md border border-[#2d682d]/30 bg-white px-4 py-2 text-sm font-semibold text-[#2d682d] shadow-sm transition hover:bg-green-50" href="<?php echo esc_url( $settings_url ); ?>"><?php esc_html_e( 'Manage Preferences', 'alfawzquran' ); ?></a>
                        <a class="inline-flex w-full items-center justify-center rounded-md border border-[#2d682d]/30 bg-white px-4 py-2 text-sm font-semibold text-[#2d682d] shadow-sm transition hover:bg-green-50" href="<?php echo esc_url( $logout_url ); ?>"><?php esc_html_e( 'Sign Out', 'alfawzquran' ); ?></a>
                    </div>
                </div>
            <?php else : ?>
                <div class="px-6">
                    <div class="flex h-9 items-center justify-center rounded-lg bg-green-50 p-[3px] text-sm font-medium text-[#2d682d]" data-alfawz-tablist>
                        <button type="button" class="inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-md border border-transparent px-2 py-1 transition data-[active=false]:text-[#2d682d] data-[active=true]:bg-[#2d682d] data-[active=true]:text-white" data-alfawz-tab="login" data-active="true"><?php esc_html_e( 'Login', 'alfawzquran' ); ?></button>
                        <button type="button" class="inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-md border border-transparent px-2 py-1 transition data-[active=false]:text-[#2d682d] data-[active=true]:bg-[#2d682d] data-[active=true]:text-white" data-alfawz-tab="register" data-active="false"><?php esc_html_e( 'Register', 'alfawzquran' ); ?></button>
                    </div>
                </div>
                <div class="px-6" data-alfawz-tab-panel="login">
                    <form method="post" action="<?php echo esc_url( wp_login_url() ); ?>" class="space-y-4" autocomplete="on">
                        <div class="space-y-2">
                            <label for="alfawz-login-role" class="text-sm font-medium leading-none text-[#2d682d]"> <?php esc_html_e( 'Role', 'alfawzquran' ); ?> </label>
                            <select id="alfawz-login-role" name="alfawz_role" class="flex h-9 w-full items-center rounded-md border border-[#2d682d]/20 bg-white px-3 text-sm text-[#2d682d] shadow-xs transition focus:border-[#2d682d] focus:outline-none focus:ring-2 focus:ring-[#2d682d]/30" data-alfawz-role-select>
                                <?php foreach ( $role_redirects as $role_key => $role_data ) : ?>
                                    <option value="<?php echo esc_attr( $role_key ); ?>" data-redirect="<?php echo esc_url( $role_data['redirect'] ); ?>"><?php echo esc_html( $role_data['label'] ); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label for="alfawz-login-email" class="text-sm font-medium leading-none text-[#2d682d]"> <?php esc_html_e( 'Email or Username', 'alfawzquran' ); ?> </label>
                            <input type="text" id="alfawz-login-email" name="log" class="flex h-9 w-full rounded-md border border-[#2d682d]/20 bg-transparent px-3 text-sm shadow-xs transition focus:border-[#2d682d] focus:outline-none focus:ring-2 focus:ring-[#2d682d]/30" placeholder="<?php esc_attr_e( 'Enter your email', 'alfawzquran' ); ?>" autocomplete="username" required />
                        </div>
                        <div class="space-y-2">
                            <label for="alfawz-login-password" class="text-sm font-medium leading-none text-[#2d682d]"> <?php esc_html_e( 'Password', 'alfawzquran' ); ?> </label>
                            <input type="password" id="alfawz-login-password" name="pwd" class="flex h-9 w-full rounded-md border border-[#2d682d]/20 bg-transparent px-3 text-sm shadow-xs transition focus:border-[#2d682d] focus:outline-none focus:ring-2 focus:ring-[#2d682d]/30" placeholder="<?php esc_attr_e( 'Enter your password', 'alfawzquran' ); ?>" autocomplete="current-password" required />
                        </div>
                        <div class="flex items-center justify-between text-sm text-[#2d682d]">
                            <label class="inline-flex items-center gap-2">
                                <input type="checkbox" name="rememberme" value="forever" class="h-4 w-4 rounded border border-[#2d682d]/30 text-[#2d682d] focus:ring-[#2d682d]" />
                                <span><?php esc_html_e( 'Stay signed in', 'alfawzquran' ); ?></span>
                            </label>
                            <a href="<?php echo esc_url( $lost_password ); ?>" class="underline-offset-4 hover:underline"> <?php esc_html_e( 'Forgot password?', 'alfawzquran' ); ?> </a>
                        </div>
                        <?php do_action( 'login_form' ); ?>
                        <input type="hidden" name="redirect_to" value="<?php echo esc_url( $student_redirect ); ?>" data-alfawz-redirect-input data-default-redirect="<?php echo esc_url( $student_redirect ); ?>" />
                        <input type="hidden" name="testcookie" value="1" />
                        <button type="submit" name="wp-submit" class="inline-flex w-full items-center justify-center rounded-md bg-[#2d682d] px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-[#2d682d]/90"> <?php esc_html_e( 'Sign In', 'alfawzquran' ); ?> </button>
                        <div class="pt-2 text-center">
                            <a href="<?php echo esc_url( $contact_developer_url ); ?>" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-[#2d682d] underline-offset-4 hover:text-[#b29032] hover:underline"><?php esc_html_e( 'Contact Developer', 'alfawzquran' ); ?></a>
                        </div>
                    </form>
                </div>
                <div class="px-6 hidden" data-alfawz-tab-panel="register">
                    <?php if ( $register_url ) : ?>
                        <div class="space-y-4 text-sm text-[#2d682d]">
                            <p><?php esc_html_e( 'Families and staff can create new accounts using our secure registration form.', 'alfawzquran' ); ?></p>
                            <a href="<?php echo esc_url( $register_url ); ?>" class="inline-flex w-full items-center justify-center rounded-md border border-[#2d682d]/30 bg-white px-4 py-2 text-sm font-semibold text-[#2d682d] shadow-sm transition hover:bg-green-50"><?php esc_html_e( 'Open Registration Page', 'alfawzquran' ); ?></a>
                        </div>
                    <?php else : ?>
                        <div class="space-y-2 text-sm text-[#2d682d]">
                            <p><?php esc_html_e( 'Online registration is currently closed. Please contact the school office for assistance.', 'alfawzquran' ); ?></p>
                            <a href="<?php echo esc_url( $contact_developer_url ); ?>" target="_blank" rel="noopener noreferrer" class="inline-flex w-full items-center justify-center rounded-md border border-[#2d682d]/30 bg-white px-4 py-2 text-sm font-semibold text-[#2d682d] shadow-sm transition hover:bg-green-50"><?php esc_html_e( 'Message the Portal Team', 'alfawzquran' ); ?></a>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
            <a href="<?php echo esc_url( $home_url ); ?>" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#2d682d]/20 bg-white/80 px-3 py-2 text-sm font-medium text-[#2d682d] shadow-xs transition hover:bg-white">HOME</a>
            <a href="<?php echo esc_url( $contact_url ); ?>" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#2d682d]/20 bg-white/80 px-3 py-2 text-sm font-medium text-[#2d682d] shadow-xs transition hover:bg-white"><?php esc_html_e( 'CONTACT US', 'alfawzquran' ); ?></a>
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

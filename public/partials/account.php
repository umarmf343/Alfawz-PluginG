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

$settings_url = function_exists( 'alfawz_get_bottom_nav_url' )
    ? alfawz_get_bottom_nav_url( 'settings' )
    : home_url( trailingslashit( 'alfawz-settings' ) );

$requested_redirect = '';
if ( isset( $_GET['redirect_to'] ) ) {
    $raw_redirect       = wp_unslash( $_GET['redirect_to'] );
    $raw_redirect       = is_string( $raw_redirect ) ? rawurldecode( $raw_redirect ) : '';
    $requested_redirect = wp_validate_redirect( $raw_redirect, '' );
}

$student_redirect = $requested_redirect ? $requested_redirect : $student_dashboard_url;
$teacher_redirect = $requested_redirect ? $requested_redirect : $teacher_dashboard_url;

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

if ( $is_logged_in && $current_user instanceof WP_User ) {
    if ( user_can( $current_user, 'manage_options' ) || user_can( $current_user, 'alfawz_teacher' ) || in_array( 'teacher', (array) $current_user->roles, true ) ) {
        $role_label = __( 'Teacher', 'alfawzquran' );
    } else {
        $role_label = __( 'Student', 'alfawzquran' );
    }
}

$student_form = '';
$teacher_form = '';

if ( ! $is_logged_in ) {
    $student_form = wp_login_form(
        [
            'echo'           => false,
            'remember'       => true,
            'form_id'        => 'alfawz-student-login-form',
            'label_username' => __( 'Email or Username', 'alfawzquran' ),
            'label_password' => __( 'Password', 'alfawzquran' ),
            'label_remember' => __( 'Stay signed in', 'alfawzquran' ),
            'label_log_in'   => __( 'Login as Student', 'alfawzquran' ),
            'id_username'    => 'alfawz-student-username',
            'id_password'    => 'alfawz-student-password',
            'id_remember'    => 'alfawz-student-remember',
            'id_submit'      => 'alfawz-student-submit',
            'redirect'       => $student_redirect,
        ]
    );

    $teacher_form = wp_login_form(
        [
            'echo'           => false,
            'remember'       => true,
            'form_id'        => 'alfawz-teacher-login-form',
            'label_username' => __( 'Email or Username', 'alfawzquran' ),
            'label_password' => __( 'Password', 'alfawzquran' ),
            'label_remember' => __( 'Stay signed in', 'alfawzquran' ),
            'label_log_in'   => __( 'Login as Teacher', 'alfawzquran' ),
            'id_username'    => 'alfawz-teacher-username',
            'id_password'    => 'alfawz-teacher-password',
            'id_remember'    => 'alfawz-teacher-remember',
            'id_submit'      => 'alfawz-teacher-submit',
            'redirect'       => $teacher_redirect,
        ]
    );
}
?>
<div id="alfawz-account" class="alfawz-account-shell relative mx-auto max-w-5xl overflow-hidden px-4 py-12 text-slate-900 sm:px-8 lg:px-0">
    <div class="alfawz-account-backdrop" aria-hidden="true"></div>
    <div class="alfawz-account-aurora" aria-hidden="true"></div>
    <div class="alfawz-account-aurora alfawz-account-aurora--accent" aria-hidden="true"></div>
    <?php if ( ! empty( $notices ) ) : ?>
        <div class="alfawz-account-alerts" role="status">
            <?php foreach ( $notices as $notice ) :
                $type    = isset( $notice['type'] ) ? $notice['type'] : 'info';
                $icon    = isset( $notice['icon'] ) ? $notice['icon'] : 'ℹ️';
                $message = isset( $notice['message'] ) ? $notice['message'] : '';

                if ( empty( $message ) ) {
                    continue;
                }

                $class = 'alfawz-account-alert alfawz-account-alert--' . sanitize_html_class( $type );
                ?>
                <div class="<?php echo esc_attr( $class ); ?>" role="alert">
                    <span class="alfawz-account-alert__icon" aria-hidden="true"><?php echo esc_html( $icon ); ?></span>
                    <p class="alfawz-account-alert__message"><?php echo esc_html( $message ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    <section class="alfawz-account-hero" data-animate="fade">
        <div class="alfawz-account-hero__content">
            <span class="alfawz-account-hero__eyebrow"><?php esc_html_e( 'Welcome back to Alfawz', 'alfawzquran' ); ?></span>
            <h1 class="alfawz-account-hero__title">
                <?php
                if ( $is_logged_in && $display_name ) {
                    printf(
                        esc_html__( 'Assalamu alaikum, %s', 'alfawzquran' ),
                        esc_html( $display_name )
                    );
                } else {
                    esc_html_e( 'Choose your learning journey', 'alfawzquran' );
                }
                ?>
            </h1>
            <p class="alfawz-account-hero__subtitle">
                <?php
                if ( $is_logged_in ) {
                    printf(
                        esc_html__( 'You are signed in as a %s. Pick a destination to continue.', 'alfawzquran' ),
                        esc_html( $role_label )
                    );
                } else {
                    esc_html_e( 'Log in as a student to track memorization, or as a teacher to guide your class.', 'alfawzquran' );
                }
                ?>
            </p>
            <?php if ( $is_logged_in ) : ?>
                <div class="alfawz-account-hero__actions">
                    <a class="alfawz-account-btn alfawz-account-btn--primary" href="<?php echo esc_url( $student_dashboard_url ); ?>">
                        <?php esc_html_e( 'Open Student Dashboard', 'alfawzquran' ); ?>
                    </a>
                    <?php if ( user_can( $current_user, 'manage_options' ) || user_can( $current_user, 'alfawz_teacher' ) || in_array( 'teacher', (array) $current_user->roles, true ) ) : ?>
                        <a class="alfawz-account-btn alfawz-account-btn--outline" href="<?php echo esc_url( $teacher_dashboard_url ); ?>">
                            <?php esc_html_e( 'Go to Teacher Tools', 'alfawzquran' ); ?>
                        </a>
                    <?php endif; ?>
                    <a class="alfawz-account-btn alfawz-account-btn--quiet" href="<?php echo esc_url( $settings_url ); ?>">
                        <?php esc_html_e( 'Manage preferences', 'alfawzquran' ); ?>
                    </a>
                    <a class="alfawz-account-btn alfawz-account-btn--quiet" href="<?php echo esc_url( $logout_url ); ?>">
                        <?php esc_html_e( 'Log out', 'alfawzquran' ); ?>
                    </a>
                </div>
            <?php endif; ?>
        </div>
        <div class="alfawz-account-hero__visual" aria-hidden="true">
            <div class="alfawz-account-hero__badge">
                <span class="alfawz-account-hero__badge-icon">✨</span>
                <span class="alfawz-account-hero__badge-text"><?php esc_html_e( 'Knowledge Awaits', 'alfawzquran' ); ?></span>
            </div>
            <div class="alfawz-account-hero__pattern"></div>
        </div>
    </section>

    <?php if ( ! $is_logged_in ) : ?>
        <section class="alfawz-account-grid" aria-labelledby="alfawz-account-options">
            <h2 id="alfawz-account-options" class="screen-reader-text"><?php esc_html_e( 'Account options', 'alfawzquran' ); ?></h2>

            <article class="alfawz-account-card" data-animate="fade">
                <header class="alfawz-account-card__header">
                    <div class="alfawz-account-card__icon" aria-hidden="true">👩‍🎓</div>
                    <div>
                        <h3 class="alfawz-account-card__title"><?php esc_html_e( 'Student Login', 'alfawzquran' ); ?></h3>
                        <p class="alfawz-account-card__description"><?php esc_html_e( 'Recite, memorize, and track your Qur’an journey with gentle reminders.', 'alfawzquran' ); ?></p>
                    </div>
                </header>
                <ul class="alfawz-account-card__list" role="list">
                    <li><?php esc_html_e( 'Daily goals and streak tracking', 'alfawzquran' ); ?></li>
                    <li><?php esc_html_e( 'Interactive memorization tools', 'alfawzquran' ); ?></li>
                    <li><?php esc_html_e( 'Earn hasanat with every letter recited', 'alfawzquran' ); ?></li>
                </ul>
                <div class="alfawz-login-form">
                    <?php echo wp_kses_post( $student_form ); ?>
                </div>
                <footer class="alfawz-account-card__footer">
                    <a href="<?php echo esc_url( $lost_password ); ?>" class="alfawz-account-link"><?php esc_html_e( 'Forgot password?', 'alfawzquran' ); ?></a>
                    <?php if ( $register_url ) : ?>
                        <a href="<?php echo esc_url( $register_url ); ?>" class="alfawz-account-link"><?php esc_html_e( 'Create a new student account', 'alfawzquran' ); ?></a>
                    <?php endif; ?>
                </footer>
            </article>

            <article class="alfawz-account-card" data-animate="fade">
                <header class="alfawz-account-card__header">
                    <div class="alfawz-account-card__icon" aria-hidden="true">🧑‍🏫</div>
                    <div>
                        <h3 class="alfawz-account-card__title"><?php esc_html_e( 'Teacher Login', 'alfawzquran' ); ?></h3>
                        <p class="alfawz-account-card__description"><?php esc_html_e( 'Review student recitations, assign lessons, and nurture consistent progress.', 'alfawzquran' ); ?></p>
                    </div>
                </header>
                <ul class="alfawz-account-card__list" role="list">
                    <li><?php esc_html_e( 'Approve recordings and give feedback', 'alfawzquran' ); ?></li>
                    <li><?php esc_html_e( 'Send Qa’idah assignments with hotspots', 'alfawzquran' ); ?></li>
                    <li><?php esc_html_e( 'Track class engagement at a glance', 'alfawzquran' ); ?></li>
                </ul>
                <div class="alfawz-login-form">
                    <?php echo wp_kses_post( $teacher_form ); ?>
                </div>
                <footer class="alfawz-account-card__footer">
                    <a href="<?php echo esc_url( $lost_password ); ?>" class="alfawz-account-link"><?php esc_html_e( 'Need help accessing your class?', 'alfawzquran' ); ?></a>
                    <p class="alfawz-account-note"><?php esc_html_e( 'Teacher access is provided by your program administrator.', 'alfawzquran' ); ?></p>
                </footer>
            </article>
        </section>
    <?php else : ?>
        <section class="alfawz-account-grid" data-animate="fade">
            <article class="alfawz-account-card alfawz-account-card--compact">
                <header class="alfawz-account-card__header">
                    <div class="alfawz-account-card__icon" aria-hidden="true">📊</div>
                    <div>
                        <h3 class="alfawz-account-card__title"><?php esc_html_e( 'Student Experience', 'alfawzquran' ); ?></h3>
                        <p class="alfawz-account-card__description"><?php esc_html_e( 'Continue where you left off and keep your streak alive.', 'alfawzquran' ); ?></p>
                    </div>
                </header>
                <a class="alfawz-account-btn alfawz-account-btn--primary" href="<?php echo esc_url( $student_dashboard_url ); ?>">
                    <?php esc_html_e( 'Open student dashboard', 'alfawzquran' ); ?>
                </a>
            </article>
            <article class="alfawz-account-card alfawz-account-card--compact">
                <header class="alfawz-account-card__header">
                    <div class="alfawz-account-card__icon" aria-hidden="true">⚙️</div>
                    <div>
                        <h3 class="alfawz-account-card__title"><?php esc_html_e( 'Update Preferences', 'alfawzquran' ); ?></h3>
                        <p class="alfawz-account-card__description"><?php esc_html_e( 'Adjust your reciter, daily targets, and notification settings.', 'alfawzquran' ); ?></p>
                    </div>
                </header>
                <a class="alfawz-account-btn alfawz-account-btn--outline" href="<?php echo esc_url( $settings_url ); ?>">
                    <?php esc_html_e( 'Go to settings', 'alfawzquran' ); ?>
                </a>
            </article>
            <?php if ( user_can( $current_user, 'manage_options' ) || user_can( $current_user, 'alfawz_teacher' ) || in_array( 'teacher', (array) $current_user->roles, true ) ) : ?>
                <article class="alfawz-account-card alfawz-account-card--compact">
                    <header class="alfawz-account-card__header">
                        <div class="alfawz-account-card__icon" aria-hidden="true">🏫</div>
                        <div>
                            <h3 class="alfawz-account-card__title"><?php esc_html_e( 'Teacher Tools', 'alfawzquran' ); ?></h3>
                            <p class="alfawz-account-card__description"><?php esc_html_e( 'Review submissions, share lessons, and inspire your students.', 'alfawzquran' ); ?></p>
                        </div>
                    </header>
                    <a class="alfawz-account-btn alfawz-account-btn--primary" href="<?php echo esc_url( $teacher_dashboard_url ); ?>">
                        <?php esc_html_e( 'Open teacher dashboard', 'alfawzquran' ); ?>
                    </a>
                </article>
            <?php endif; ?>
        </section>
    <?php endif; ?>
</div>

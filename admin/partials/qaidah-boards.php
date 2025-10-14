<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$can_manage = current_user_can( 'manage_options' ) || in_array( 'teacher', (array) wp_get_current_user()->roles, true ) || current_user_can( 'edit_posts' );
?>
<div class="wrap alfawz-qaidah-board-admin">
    <h1><?php esc_html_e( "Qa'idah Audio Boards", 'alfawzquran' ); ?></h1>
    <p class="description">
        <?php esc_html_e( 'Upload Qa\'idah lesson sheets, draw interactive hotspots, and attach pronunciation audio for your students.', 'alfawzquran' ); ?>
    </p>

    <?php if ( ! $can_manage ) : ?>
        <div class="notice notice-error">
            <p><?php esc_html_e( 'You do not have permission to manage Qa\'idah boards.', 'alfawzquran' ); ?></p>
        </div>
    <?php else : ?>
        <div id="alfawz-qaidah-board-app" class="alfawz-qaidah-board-app" data-can-manage="<?php echo esc_attr( $can_manage ? '1' : '0' ); ?>">
            <div class="alfawz-loading-state">
                <span class="spinner is-active" aria-hidden="true"></span>
                <p><?php esc_html_e( 'Loading Qa\'idah boards…', 'alfawzquran' ); ?></p>
            </div>
        </div>
    <?php endif; ?>
</div>

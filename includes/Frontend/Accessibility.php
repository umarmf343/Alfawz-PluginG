<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'wp_enqueue_scripts', 'alfawz_enqueue_accessibility_assets', 20 );
add_action( 'wp_footer', 'alfawz_render_accessibility_panel', 20 );

function alfawz_accessibility_is_active_context() {
    if ( is_admin() ) {
        return false;
    }

    if ( wp_script_is( 'alfawz-frontend', 'enqueued' ) ) {
        return true;
    }

    // Fallback for pages that only load the navigation but not the full dashboard shell.
    if ( wp_script_is( 'alfawz-bottom-nav', 'enqueued' ) ) {
        return true;
    }

    return false;
}

function alfawz_enqueue_accessibility_assets() {
    if ( ! alfawz_accessibility_is_active_context() ) {
        return;
    }

    wp_enqueue_style(
        'alfawz-accessibility',
        ALFAWZQURAN_PLUGIN_URL . 'assets/css/accessibility.css',
        [],
        ALFAWZQURAN_VERSION
    );

    wp_enqueue_script(
        'alfawz-accessibility',
        ALFAWZQURAN_PLUGIN_URL . 'assets/js/alfawz-accessibility.js',
        [],
        ALFAWZQURAN_VERSION,
        true
    );
}

function alfawz_render_accessibility_panel() {
    if ( ! alfawz_accessibility_is_active_context() ) {
        return;
    }

    $strings = [
        'panel_label'         => __( 'Accessibility preferences', 'alfawzquran' ),
        'launcher_label'      => __( 'Open accessibility menu', 'alfawzquran' ),
        'close_label'         => __( 'Close accessibility menu', 'alfawzquran' ),
        'text_size_heading'   => __( 'Reading size', 'alfawzquran' ),
        'text_size_default'   => __( 'Comfort', 'alfawzquran' ),
        'text_size_large'     => __( 'Large', 'alfawzquran' ),
        'contrast_heading'    => __( 'Contrast', 'alfawzquran' ),
        'contrast_default'    => __( 'Calm', 'alfawzquran' ),
        'contrast_high'       => __( 'High contrast', 'alfawzquran' ),
        'dyslexia_heading'    => __( 'Dyslexia-friendly type', 'alfawzquran' ),
        'senior_heading'      => __( 'Senior navigation mode', 'alfawzquran' ),
        'status_ready'        => __( 'Accessibility preferences ready', 'alfawzquran' ),
    ];

    include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/accessibility-panel.php';
}

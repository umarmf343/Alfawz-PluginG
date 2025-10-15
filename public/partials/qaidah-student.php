<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div class="alfawz-qaidah alfawz-qaidah-canvas" data-qaidah-context="student">
    <header class="alfawz-qaidah-header">
        <h2><?php esc_html_e( "Collaborative Qa'idah Canvas", 'alfawzquran' ); ?></h2>
        <p><?php esc_html_e( 'Open your teacher\'s assignments and tap the hotspots to hear precise pronunciation models.', 'alfawzquran' ); ?></p>
    </header>
    <div class="alfawz-qaidah-grid">
        <aside class="alfawz-qaidah-assignment-list" id="qaidah-assignment-list" aria-label="<?php esc_attr_e( "Assigned Qa'idah activities", 'alfawzquran' ); ?>">
            <div class="alfawz-qaidah-empty">
                <p><?php esc_html_e( 'Loading your assignments…', 'alfawzquran' ); ?></p>
            </div>
        </aside>
        <section class="alfawz-qaidah-stage" id="qaidah-stage" aria-live="polite">
            <div class="alfawz-qaidah-placeholder">
                <p><?php esc_html_e( 'Select an assignment to explore its interactive Qa\'idah page.', 'alfawzquran' ); ?></p>
            </div>
        </section>
    </div>
</div>

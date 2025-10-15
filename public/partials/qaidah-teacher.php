<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$admin_manage_url = admin_url( 'admin.php?page=alfawz-qaidah-boards' );
?>
<div class="alfawz-qaidah-teacher" data-qaidah-context="teacher" data-admin-url="<?php echo esc_url( $admin_manage_url ); ?>">
    <header class="alfawz-qaidah-header">
        <h2><?php esc_html_e( "Qa'idah Assignment Studio", 'alfawzquran' ); ?></h2>
        <p class="alfawz-qaidah-subtitle"><?php esc_html_e( 'Design, share, and update Qa\'idah practice boards for every class.', 'alfawzquran' ); ?></p>
        <div class="alfawz-teacher-header-actions">
            <button type="button" id="qaidah-refresh-boards" class="alfawz-btn alfawz-btn-secondary">
                <span class="alfawz-btn-icon">🔄</span>
                <?php esc_html_e( 'Refresh assignments', 'alfawzquran' ); ?>
            </button>
            <a class="alfawz-btn alfawz-btn-primary" href="<?php echo esc_url( $admin_manage_url ); ?>">
                <span class="alfawz-btn-icon">🛠️</span>
                <?php esc_html_e( 'Advanced builder', 'alfawzquran' ); ?>
            </a>
        </div>
    </header>

    <section class="alfawz-qaidah-teacher-form" aria-labelledby="qaidah-share-heading">
        <div class="alfawz-form-intro">
            <h3 id="qaidah-share-heading"><?php esc_html_e( 'Share an assignment', 'alfawzquran' ); ?></h3>
            <p><?php esc_html_e( 'Pick a prepared Qa\'idah board, choose who should receive it, and publish the update instantly.', 'alfawzquran' ); ?></p>
        </div>
        <form id="qaidah-teacher-share-form" class="alfawz-grid-form">
            <div class="alfawz-form-field">
                <label for="qaidah-teacher-board-select"><?php esc_html_e( 'Qa\'idah board', 'alfawzquran' ); ?></label>
                <select id="qaidah-teacher-board-select" required>
                    <option value=""><?php esc_html_e( 'Loading boards…', 'alfawzquran' ); ?></option>
                </select>
            </div>
            <div class="alfawz-form-field">
                <label for="qaidah-teacher-class-id"><?php esc_html_e( 'Class or group label', 'alfawzquran' ); ?></label>
                <input type="text" id="qaidah-teacher-class-id" placeholder="<?php esc_attr_e( 'e.g. Level 3 – Weekend Hifdh', 'alfawzquran' ); ?>">
                <p class="alfawz-field-help"><?php esc_html_e( 'Shown to students inside the reader so they know which class assigned it.', 'alfawzquran' ); ?></p>
            </div>
            <div class="alfawz-form-field">
                <label for="qaidah-teacher-students"><?php esc_html_e( 'Student IDs (comma separated)', 'alfawzquran' ); ?></label>
                <textarea id="qaidah-teacher-students" rows="3" placeholder="<?php esc_attr_e( '12, 45, 67', 'alfawzquran' ); ?>"></textarea>
                <p class="alfawz-field-help"><?php esc_html_e( 'Use WordPress user IDs. Leave blank to share with the whole class.', 'alfawzquran' ); ?></p>
            </div>
            <div class="alfawz-form-field">
                <label for="qaidah-teacher-description"><?php esc_html_e( 'Teacher notes', 'alfawzquran' ); ?></label>
                <textarea id="qaidah-teacher-description" rows="3" placeholder="<?php esc_attr_e( 'Revisit the noon saakin rules highlighted on this page.', 'alfawzquran' ); ?>"></textarea>
            </div>
            <div class="alfawz-form-actions">
                <button type="submit" class="alfawz-btn alfawz-btn-primary" id="qaidah-save-board">
                    <span class="alfawz-btn-icon">💾</span>
                    <?php esc_html_e( 'Save sharing settings', 'alfawzquran' ); ?>
                </button>
                <span class="alfawz-inline-feedback" id="qaidah-teacher-feedback" role="status" aria-live="polite"></span>
            </div>
        </form>
    </section>

    <section class="alfawz-qaidah-teacher-boards" aria-labelledby="qaidah-board-list-heading">
        <div class="alfawz-section-heading">
            <h3 id="qaidah-board-list-heading"><?php esc_html_e( 'Your Qa\'idah boards', 'alfawzquran' ); ?></h3>
            <p><?php esc_html_e( 'Track which classes have an active assignment and preview the student view instantly.', 'alfawzquran' ); ?></p>
        </div>
        <div id="qaidah-teacher-board-summary" class="alfawz-board-stats">
            <div class="alfawz-board-stat">
                <span class="alfawz-board-stat-value" id="qaidah-total-boards">0</span>
                <span class="alfawz-board-stat-label"><?php esc_html_e( 'Boards created', 'alfawzquran' ); ?></span>
            </div>
            <div class="alfawz-board-stat">
                <span class="alfawz-board-stat-value" id="qaidah-active-classes">0</span>
                <span class="alfawz-board-stat-label"><?php esc_html_e( 'Active classes', 'alfawzquran' ); ?></span>
            </div>
            <div class="alfawz-board-stat">
                <span class="alfawz-board-stat-value" id="qaidah-student-count">0</span>
                <span class="alfawz-board-stat-label"><?php esc_html_e( 'Students reached', 'alfawzquran' ); ?></span>
            </div>
        </div>
        <div id="qaidah-teacher-boards-list" class="alfawz-qaidah-teacher-list" aria-live="polite">
            <div class="alfawz-qaidah-empty">
                <p><?php esc_html_e( 'Loading boards…', 'alfawzquran' ); ?></p>
            </div>
        </div>
    </section>
</div>

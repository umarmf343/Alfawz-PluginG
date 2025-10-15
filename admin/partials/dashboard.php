<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! current_user_can( 'manage_options' ) && ! current_user_can( 'alfawz_admin' ) ) {
    echo '<div class="notice notice-error"><p>' . esc_html__( 'You do not have permission to access this dashboard.', 'alfawzquran' ) . '</p></div>';
    return;
}

$class_nonce_field    = wp_nonce_field( 'alfawz_admin_classes', 'alfawz_admin_classes_nonce', true, false );
$user_nonce_field     = wp_nonce_field( 'alfawz_admin_users', 'alfawz_admin_users_nonce', true, false );
$settings_nonce_field = wp_nonce_field( 'alfawz_admin_settings', 'alfawz_admin_settings_nonce', true, false );
?>
<div class="wrap alfawz-admin-dashboard">
    <h1><?php esc_html_e( 'AlFawz Quran Administration', 'alfawzquran' ); ?></h1>
    <p class="description"><?php esc_html_e( 'Manage classes, user roles, and system-wide settings for the AlFawz Quran program.', 'alfawzquran' ); ?></p>

    <section class="alfawz-admin-overview" aria-label="<?php esc_attr_e( 'System Overview', 'alfawzquran' ); ?>">
        <h2><?php esc_html_e( 'System Overview', 'alfawzquran' ); ?></h2>
        <div class="alfawz-admin-card-grid">
            <div class="alfawz-admin-card">
                <span class="alfawz-card-label"><?php esc_html_e( 'Total Students', 'alfawzquran' ); ?></span>
                <strong id="alfawz-stat-students" class="alfawz-stat-number">0</strong>
            </div>
            <div class="alfawz-admin-card">
                <span class="alfawz-card-label"><?php esc_html_e( 'Total Teachers', 'alfawzquran' ); ?></span>
                <strong id="alfawz-stat-teachers" class="alfawz-stat-number">0</strong>
            </div>
            <div class="alfawz-admin-card">
                <span class="alfawz-card-label"><?php esc_html_e( 'Total Classes', 'alfawzquran' ); ?></span>
                <strong id="alfawz-stat-classes" class="alfawz-stat-number">0</strong>
            </div>
            <div class="alfawz-admin-card">
                <span class="alfawz-card-label"><?php esc_html_e( 'Active Memorization Plans', 'alfawzquran' ); ?></span>
                <strong id="alfawz-stat-plans" class="alfawz-stat-number">0</strong>
            </div>
            <div class="alfawz-admin-card">
                <span class="alfawz-card-label"><?php esc_html_e( 'Recent Qa\'idah Assignments', 'alfawzquran' ); ?></span>
                <strong id="alfawz-stat-qaidah" class="alfawz-stat-number">0</strong>
            </div>
        </div>
    </section>

    <div class="alfawz-admin-two-column">
        <section class="alfawz-admin-panel" id="alfawz-class-management" aria-labelledby="alfawz-class-management-title">
            <div class="alfawz-panel-header">
                <h2 id="alfawz-class-management-title"><?php esc_html_e( 'Class Management', 'alfawzquran' ); ?></h2>
                <button type="button" class="button button-primary" id="alfawz-new-class">
                    <?php esc_html_e( 'Add Class', 'alfawzquran' ); ?>
                </button>
            </div>

            <form id="alfawz-class-form" class="alfawz-stacked-form" novalidate>
                <?php echo $class_nonce_field; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <input type="hidden" id="alfawz-class-id" name="class_id" value="" />

                <div class="alfawz-form-field">
                    <label for="alfawz-class-name"><?php esc_html_e( 'Class Name', 'alfawzquran' ); ?><span class="required">*</span></label>
                    <input type="text" id="alfawz-class-name" name="name" class="regular-text" required />
                </div>

                <div class="alfawz-form-field">
                    <label for="alfawz-class-teacher"><?php esc_html_e( 'Assign Teacher', 'alfawzquran' ); ?></label>
                    <select id="alfawz-class-teacher" name="teacher_id">
                        <option value=""><?php esc_html_e( 'Select a teacher', 'alfawzquran' ); ?></option>
                    </select>
                </div>

                <div class="alfawz-form-field">
                    <label for="alfawz-class-description"><?php esc_html_e( 'Description', 'alfawzquran' ); ?></label>
                    <textarea id="alfawz-class-description" name="description" rows="3"></textarea>
                </div>

                <div class="alfawz-form-actions">
                    <button type="submit" class="button button-primary" id="alfawz-save-class"><?php esc_html_e( 'Save Class', 'alfawzquran' ); ?></button>
                    <button type="button" class="button" id="alfawz-cancel-class"><?php esc_html_e( 'Cancel', 'alfawzquran' ); ?></button>
                </div>
            </form>

            <div id="alfawz-class-feedback" class="notice" style="display:none;"></div>

            <table class="wp-list-table widefat fixed striped" id="alfawz-class-table">
                <thead>
                    <tr>
                        <th><?php esc_html_e( 'Class', 'alfawzquran' ); ?></th>
                        <th><?php esc_html_e( 'Teacher', 'alfawzquran' ); ?></th>
                        <th><?php esc_html_e( 'Students', 'alfawzquran' ); ?></th>
                        <th><?php esc_html_e( 'Actions', 'alfawzquran' ); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colspan="4"><?php esc_html_e( 'Loading classes…', 'alfawzquran' ); ?></td></tr>
                </tbody>
            </table>

            <section id="alfawz-student-enrollment" class="alfawz-enrollment" hidden>
                <header class="alfawz-panel-subheader">
                    <h3><?php esc_html_e( 'Manage Enrollment', 'alfawzquran' ); ?></h3>
                    <button type="button" class="button-link" id="alfawz-close-enrollment"><?php esc_html_e( 'Close', 'alfawzquran' ); ?></button>
                </header>
                <p>
                    <?php esc_html_e( 'Assign or remove students from the selected class using the controls below.', 'alfawzquran' ); ?>
                </p>
                <div class="alfawz-current-class">
                    <strong><?php esc_html_e( 'Selected Class:', 'alfawzquran' ); ?></strong>
                    <span id="alfawz-selected-class-name"></span>
                </div>

                <div class="alfawz-selected-students">
                    <h4><?php esc_html_e( 'Enrolled Students', 'alfawzquran' ); ?></h4>
                    <ul id="alfawz-enrolled-student-list" class="alfawz-chip-list"></ul>
                </div>

                <div class="alfawz-student-search">
                    <label for="alfawz-student-search-input" class="screen-reader-text"><?php esc_html_e( 'Search students', 'alfawzquran' ); ?></label>
                    <input type="search" id="alfawz-student-search-input" placeholder="<?php esc_attr_e( 'Search students by name or email…', 'alfawzquran' ); ?>" />
                    <button type="button" class="button" id="alfawz-search-students"><?php esc_html_e( 'Search', 'alfawzquran' ); ?></button>
                </div>
                <div id="alfawz-student-search-results" class="alfawz-search-results" role="status" aria-live="polite"></div>
            </section>
        </section>

        <section class="alfawz-admin-panel" id="alfawz-user-role-management" aria-labelledby="alfawz-user-role-title">
            <div class="alfawz-panel-header">
                <h2 id="alfawz-user-role-title"><?php esc_html_e( 'User Role Assignment', 'alfawzquran' ); ?></h2>
            </div>

            <form id="alfawz-user-filter" class="alfawz-inline-form" novalidate>
                <?php echo $user_nonce_field; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <label for="alfawz-role-filter" class="screen-reader-text"><?php esc_html_e( 'Filter by role', 'alfawzquran' ); ?></label>
                <select id="alfawz-role-filter" name="role">
                    <option value="all"><?php esc_html_e( 'All Roles', 'alfawzquran' ); ?></option>
                    <option value="student"><?php esc_html_e( 'Students', 'alfawzquran' ); ?></option>
                    <option value="teacher"><?php esc_html_e( 'Teachers', 'alfawzquran' ); ?></option>
                </select>
                <label for="alfawz-user-search" class="screen-reader-text"><?php esc_html_e( 'Search users', 'alfawzquran' ); ?></label>
                <input type="search" id="alfawz-user-search" name="s" placeholder="<?php esc_attr_e( 'Search by name or email…', 'alfawzquran' ); ?>" />
                <button type="submit" class="button"><?php esc_html_e( 'Apply', 'alfawzquran' ); ?></button>
            </form>

            <table class="wp-list-table widefat fixed striped" id="alfawz-user-table">
                <thead>
                    <tr>
                        <th><?php esc_html_e( 'Name', 'alfawzquran' ); ?></th>
                        <th><?php esc_html_e( 'Email', 'alfawzquran' ); ?></th>
                        <th><?php esc_html_e( 'Role', 'alfawzquran' ); ?></th>
                        <th><?php esc_html_e( 'Class', 'alfawzquran' ); ?></th>
                        <th><?php esc_html_e( 'Actions', 'alfawzquran' ); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colspan="5"><?php esc_html_e( 'Loading users…', 'alfawzquran' ); ?></td></tr>
                </tbody>
            </table>
        </section>
    </div>

    <section class="alfawz-admin-panel" id="alfawz-plugin-settings" aria-labelledby="alfawz-plugin-settings-title">
        <div class="alfawz-panel-header">
            <h2 id="alfawz-plugin-settings-title"><?php esc_html_e( 'Plugin Settings', 'alfawzquran' ); ?></h2>
        </div>
        <form id="alfawz-settings-form" class="alfawz-stacked-form">
            <?php echo $settings_nonce_field; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
            <fieldset>
                <legend class="screen-reader-text"><?php esc_html_e( 'Feature Toggles', 'alfawzquran' ); ?></legend>
                <label class="alfawz-toggle">
                    <input type="checkbox" id="alfawz-setting-leaderboard" name="alfawz_enable_leaderboard" value="1" />
                    <span><?php esc_html_e( 'Enable leaderboard experience', 'alfawzquran' ); ?></span>
                </label>
                <label class="alfawz-toggle">
                    <input type="checkbox" id="alfawz-setting-egg" name="alfawz_enable_egg_challenge" value="1" />
                    <span><?php esc_html_e( 'Enable egg challenge', 'alfawzquran' ); ?></span>
                </label>
            </fieldset>

            <div class="alfawz-form-field">
                <label for="alfawz-setting-daily-goal"><?php esc_html_e( 'Default Daily Goal (verses)', 'alfawzquran' ); ?></label>
                <input type="number" min="1" id="alfawz-setting-daily-goal" name="alfawz_daily_verse_target" class="small-text" />
            </div>

            <div class="alfawz-form-actions">
                <button type="submit" class="button button-primary"><?php esc_html_e( 'Save Settings', 'alfawzquran' ); ?></button>
            </div>
            <div id="alfawz-settings-feedback" class="notice" style="display:none;"></div>
        </form>
    </section>
</div>

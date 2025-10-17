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
<div class="alfawz-admin-dashboard bg-stone-50 min-h-screen py-10">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <header class="text-center space-y-3">
            <div class="text-4xl" aria-hidden="true">⚙️</div>
            <h1 class="text-3xl font-bold text-gray-800">
                <?php esc_html_e( 'AlFawz Quran Admin Console', 'alfawzquran' ); ?>
            </h1>
            <p class="mx-auto max-w-3xl text-base text-gray-600">
                <?php esc_html_e( 'Manage classes, assign teachers, enroll students, and oversee platform activity.', 'alfawzquran' ); ?>
                <span class="font-semibold text-gray-700"><?php esc_html_e( 'You have full administrative control.', 'alfawzquran' ); ?></span>
            </p>
        </header>

        <section aria-label="<?php esc_attr_e( 'System Overview', 'alfawzquran' ); ?>">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div class="mb-2 text-3xl text-blue-600" aria-hidden="true">👥</div>
                    <div id="alfawz-stat-students" class="text-2xl font-bold text-gray-800">0</div>
                    <div class="text-base text-gray-600"><?php esc_html_e( 'Total Students', 'alfawzquran' ); ?></div>
                </div>
                <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div class="mb-2 text-3xl text-emerald-600" aria-hidden="true">🧑‍🏫</div>
                    <div id="alfawz-stat-teachers" class="text-2xl font-bold text-gray-800">0</div>
                    <div class="text-base text-gray-600"><?php esc_html_e( 'Active Teachers', 'alfawzquran' ); ?></div>
                </div>
                <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div class="mb-2 text-3xl text-amber-600" aria-hidden="true">🏫</div>
                    <div id="alfawz-stat-classes" class="text-2xl font-bold text-gray-800">0</div>
                    <div class="text-base text-gray-600"><?php esc_html_e( 'Classes', 'alfawzquran' ); ?></div>
                </div>
                <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div class="mb-2 text-3xl text-purple-600" aria-hidden="true">🧠</div>
                    <div id="alfawz-stat-plans" class="text-2xl font-bold text-gray-800">0</div>
                    <div class="text-base text-gray-600"><?php esc_html_e( 'Active Memorization Plans', 'alfawzquran' ); ?></div>
                </div>
            </div>
        </section>

        <div class="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <section id="alfawz-class-management" class="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" aria-labelledby="alfawz-class-management-title">
                <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 id="alfawz-class-management-title" class="flex items-center text-2xl font-bold text-gray-800">
                        <span class="mr-3" aria-hidden="true">🏫</span>
                        <?php esc_html_e( 'Class Management', 'alfawzquran' ); ?>
                    </h2>
                    <button type="button" id="add-class-btn" class="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-base font-semibold text-white transition hover:bg-emerald-700">
                        <span class="mr-2 text-xl" aria-hidden="true">＋</span>
                        <?php esc_html_e( 'Add New Class', 'alfawzquran' ); ?>
                    </button>
                </div>

                <div id="alfawz-class-form-panel" class="hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 id="alfawz-class-form-title" class="text-xl font-semibold text-emerald-900"><?php esc_html_e( 'Create Class', 'alfawzquran' ); ?></h3>
                            <p id="alfawz-class-form-subtitle" class="text-base text-emerald-700"><?php esc_html_e( 'Provide class details and assign a teacher.', 'alfawzquran' ); ?></p>
                        </div>
                        <button type="button" id="close-class-form" class="text-base font-medium text-emerald-700 transition hover:text-emerald-900"><?php esc_html_e( 'Close', 'alfawzquran' ); ?></button>
                    </div>

                    <form id="alfawz-class-form" class="space-y-5" novalidate>
                        <?php echo $class_nonce_field; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                        <input type="hidden" id="alfawz-class-id" name="class_id" value="" />

                        <div>
                            <label for="alfawz-class-name" class="mb-2 block text-base font-semibold text-gray-800">
                                <?php esc_html_e( 'Class Name', 'alfawzquran' ); ?>
                                <span class="text-emerald-700">*</span>
                            </label>
                            <input type="text" id="alfawz-class-name" name="name" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
                        </div>

                        <div>
                            <label for="alfawz-class-teacher" class="mb-2 block text-base font-semibold text-gray-800"><?php esc_html_e( 'Assign Teacher', 'alfawzquran' ); ?></label>
                            <select id="alfawz-class-teacher" name="teacher_id" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value=""><?php esc_html_e( 'Select a teacher', 'alfawzquran' ); ?></option>
                            </select>
                        </div>

                        <div>
                            <label for="alfawz-class-description" class="mb-2 block text-base font-semibold text-gray-800"><?php esc_html_e( 'Description', 'alfawzquran' ); ?></label>
                            <textarea id="alfawz-class-description" name="description" rows="3" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
                        </div>

                        <div class="flex flex-wrap gap-3">
                            <button type="submit" id="alfawz-save-class" class="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-base font-semibold text-white transition hover:bg-emerald-700">
                                <?php esc_html_e( 'Save Class', 'alfawzquran' ); ?>
                            </button>
                            <button type="button" id="alfawz-cancel-class" class="inline-flex items-center rounded-lg border border-emerald-600 px-4 py-2 text-base font-semibold text-emerald-700 transition hover:bg-emerald-50">
                                <?php esc_html_e( 'Cancel', 'alfawzquran' ); ?>
                            </button>
                        </div>
                    </form>
                </div>

                <div id="alfawz-class-feedback" class="mt-6 hidden rounded-lg border-l-4 px-4 py-3 text-base font-medium" role="status" aria-live="polite"></div>

                <div class="overflow-x-auto">
                    <table id="alfawz-class-table" class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th scope="col" class="px-4 py-3 text-left text-base font-semibold text-gray-600"><?php esc_html_e( 'Class Name', 'alfawzquran' ); ?></th>
                                <th scope="col" class="px-4 py-3 text-left text-base font-semibold text-gray-600"><?php esc_html_e( 'Teacher', 'alfawzquran' ); ?></th>
                                <th scope="col" class="px-4 py-3 text-left text-base font-semibold text-gray-600"><?php esc_html_e( 'Students', 'alfawzquran' ); ?></th>
                                <th scope="col" class="px-4 py-3 text-left text-base font-semibold text-gray-600"><?php esc_html_e( 'Actions', 'alfawzquran' ); ?></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white text-base text-gray-700">
                            <tr>
                                <td colspan="4" class="px-4 py-4 text-center text-base text-gray-500"><?php esc_html_e( 'Loading classes…', 'alfawzquran' ); ?></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <section id="alfawz-student-enrollment" class="mt-8 hidden rounded-2xl border border-gray-200 bg-gray-50 p-6" aria-live="polite">
                    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 class="text-xl font-semibold text-gray-800"><?php esc_html_e( 'Manage Enrollment', 'alfawzquran' ); ?></h3>
                        <button type="button" id="alfawz-close-enrollment" class="text-base font-medium text-blue-600 transition hover:text-blue-800"><?php esc_html_e( 'Close', 'alfawzquran' ); ?></button>
                    </div>
                    <p class="mb-4 text-base text-gray-600"><?php esc_html_e( 'Assign or remove students from the selected class using the controls below.', 'alfawzquran' ); ?></p>
                    <div class="mb-4 text-base text-gray-700">
                        <span class="font-semibold text-gray-800"><?php esc_html_e( 'Selected Class:', 'alfawzquran' ); ?></span>
                        <span id="alfawz-selected-class-name" class="ml-2 text-base text-gray-700"></span>
                    </div>
                    <div class="mb-4">
                        <h4 class="mb-2 text-base font-semibold text-gray-800"><?php esc_html_e( 'Enrolled Students', 'alfawzquran' ); ?></h4>
                        <ul id="alfawz-enrolled-student-list" class="flex flex-wrap gap-2"></ul>
                    </div>
                    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label for="alfawz-student-search-input" class="sr-only"><?php esc_html_e( 'Search students', 'alfawzquran' ); ?></label>
                        <div class="relative w-full sm:max-w-sm">
                            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg" aria-hidden="true">🔍</span>
                            <input type="search" id="alfawz-student-search-input" class="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="<?php esc_attr_e( 'Search students by name or email…', 'alfawzquran' ); ?>" />
                        </div>
                        <button type="button" id="alfawz-search-students" class="inline-flex items-center rounded-lg border border-blue-600 px-4 py-2 text-base font-semibold text-blue-600 transition hover:bg-blue-50"><?php esc_html_e( 'Search', 'alfawzquran' ); ?></button>
                    </div>
                    <div id="alfawz-student-search-results" class="space-y-3 text-base text-gray-700"></div>
                </section>
            </section>

            <div class="space-y-8">
                <section id="alfawz-user-role-management" class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" aria-labelledby="alfawz-user-role-title">
                    <div class="hidden">
                        <?php echo $user_nonce_field; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    </div>
                    <div class="mb-6 space-y-4">
                        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 id="alfawz-user-role-title" class="flex items-center text-2xl font-bold text-gray-800">
                                <span class="mr-2" aria-hidden="true">👥</span>
                                <?php esc_html_e( 'User &amp; Role Management', 'alfawzquran' ); ?>
                            </h2>
                            <button type="button" id="add-user-btn" class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-base font-semibold text-white transition hover:bg-blue-700">
                                <span class="mr-2 text-xl" aria-hidden="true">＋</span>
                                <?php esc_html_e( 'Add New User', 'alfawzquran' ); ?>
                            </button>
                        </div>
                        <form id="alfawz-user-filter" class="flex flex-col gap-3 sm:flex-row sm:items-center" novalidate>
                            <label for="alfawz-role-filter" class="sr-only"><?php esc_html_e( 'Filter by role', 'alfawzquran' ); ?></label>
                            <select id="alfawz-role-filter" name="role" class="rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="all"><?php esc_html_e( 'All Roles', 'alfawzquran' ); ?></option>
                                <option value="student"><?php esc_html_e( 'Students', 'alfawzquran' ); ?></option>
                                <option value="teacher"><?php esc_html_e( 'Teachers', 'alfawzquran' ); ?></option>
                            </select>
                            <label for="alfawz-user-search" class="sr-only"><?php esc_html_e( 'Search users', 'alfawzquran' ); ?></label>
                            <div class="relative w-full sm:w-64">
                                <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg" aria-hidden="true">🔍</span>
                                <input type="search" id="alfawz-user-search" name="s" class="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="<?php esc_attr_e( 'Search users…', 'alfawzquran' ); ?>" />
                            </div>
                            <button type="submit" class="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-base font-semibold text-white transition hover:bg-emerald-700"><?php esc_html_e( 'Apply', 'alfawzquran' ); ?></button>
                        </form>
                    </div>
                    <div id="alfawz-user-form-panel" class="hidden rounded-2xl border border-blue-200 bg-blue-50 p-6">
                        <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 class="text-xl font-semibold text-blue-900"><?php esc_html_e( 'Create User', 'alfawzquran' ); ?></h3>
                                <p class="text-base text-blue-800"><?php esc_html_e( 'Add a new learner, teacher, or admin to the platform.', 'alfawzquran' ); ?></p>
                            </div>
                            <button type="button" id="alfawz-close-user-form" class="text-base font-medium text-blue-700 transition hover:text-blue-900"><?php esc_html_e( 'Close', 'alfawzquran' ); ?></button>
                        </div>
                        <form id="alfawz-user-form" class="space-y-5" novalidate>
                            <div class="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label for="alfawz-user-first-name" class="mb-2 block text-base font-semibold text-gray-800"><?php esc_html_e( 'First Name', 'alfawzquran' ); ?></label>
                                    <input type="text" id="alfawz-user-first-name" name="first_name" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                <div>
                                    <label for="alfawz-user-last-name" class="mb-2 block text-base font-semibold text-gray-800"><?php esc_html_e( 'Last Name', 'alfawzquran' ); ?></label>
                                    <input type="text" id="alfawz-user-last-name" name="last_name" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div class="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label for="alfawz-user-email" class="mb-2 block text-base font-semibold text-gray-800"><?php esc_html_e( 'Email Address', 'alfawzquran' ); ?><span class="text-blue-700"> *</span></label>
                                    <input type="email" id="alfawz-user-email" name="email" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                <div>
                                    <label for="alfawz-user-role" class="mb-2 block text-base font-semibold text-gray-800"><?php esc_html_e( 'Role', 'alfawzquran' ); ?><span class="text-blue-700"> *</span></label>
                                    <select id="alfawz-user-role" name="role" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" required></select>
                                </div>
                            </div>
                            <div class="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label for="alfawz-user-password" class="mb-2 block text-base font-semibold text-gray-800"><?php esc_html_e( 'Password (optional)', 'alfawzquran' ); ?></label>
                                    <input type="text" id="alfawz-user-password" name="password" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="<?php esc_attr_e( 'Leave blank to auto-generate', 'alfawzquran' ); ?>" />
                                </div>
                                <div class="flex items-center gap-2">
                                    <input type="checkbox" id="alfawz-user-send-email" name="send_email" value="1" class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked />
                                    <label for="alfawz-user-send-email" class="text-base font-medium text-gray-800"><?php esc_html_e( 'Send welcome email with login instructions', 'alfawzquran' ); ?></label>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-3">
                                <button type="submit" id="alfawz-save-user" class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-base font-semibold text-white transition hover:bg-blue-700"><?php esc_html_e( 'Save User', 'alfawzquran' ); ?></button>
                                <button type="button" id="alfawz-cancel-user" class="inline-flex items-center rounded-lg border border-blue-600 px-4 py-2 text-base font-semibold text-blue-700 transition hover:bg-blue-50"><?php esc_html_e( 'Cancel', 'alfawzquran' ); ?></button>
                            </div>
                            <div id="alfawz-user-feedback" class="hidden rounded-lg border-l-4 px-4 py-3 text-base font-medium" role="status" aria-live="polite"></div>
                        </form>
                    </div>
                    <div id="alfawz-user-list" class="space-y-3">
                        <div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-base text-gray-500"><?php esc_html_e( 'Loading users…', 'alfawzquran' ); ?></div>
                    </div>
                </section>

                <section id="alfawz-plugin-settings" class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" aria-labelledby="alfawz-plugin-settings-title">
                    <div class="mb-5">
                        <h2 id="alfawz-plugin-settings-title" class="text-2xl font-bold text-gray-800"><?php esc_html_e( 'Platform Settings', 'alfawzquran' ); ?></h2>
                        <p class="text-base text-gray-600"><?php esc_html_e( 'Control feature availability and global goals for every learner.', 'alfawzquran' ); ?></p>
                    </div>
                    <form id="alfawz-settings-form" class="space-y-5">
                        <?php echo $settings_nonce_field; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                        <fieldset class="space-y-3">
                            <legend class="text-base font-semibold text-gray-800"><?php esc_html_e( 'Feature Toggles', 'alfawzquran' ); ?></legend>
                            <label class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <span class="text-base font-medium text-gray-800"><?php esc_html_e( 'Enable leaderboard experience', 'alfawzquran' ); ?></span>
                                <input type="checkbox" id="alfawz-setting-leaderboard" name="alfawz_enable_leaderboard" value="1" class="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                            </label>
                            <label class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <span class="text-base font-medium text-gray-800"><?php esc_html_e( 'Enable egg challenge', 'alfawzquran' ); ?></span>
                                <input type="checkbox" id="alfawz-setting-egg" name="alfawz_enable_egg_challenge" value="1" class="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                            </label>
                        </fieldset>

                        <div>
                            <label for="alfawz-setting-daily-goal" class="mb-2 block text-base font-semibold text-gray-800"><?php esc_html_e( 'Default Daily Goal (verses)', 'alfawzquran' ); ?></label>
                            <input type="number" min="1" id="alfawz-setting-daily-goal" name="alfawz_daily_verse_target" class="w-32 rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>

                        <div class="flex flex-wrap gap-3">
                            <button type="submit" class="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-base font-semibold text-white transition hover:bg-emerald-700"><?php esc_html_e( 'Save Settings', 'alfawzquran' ); ?></button>
                        </div>
                        <div id="alfawz-settings-feedback" class="hidden rounded-lg border-l-4 px-4 py-3 text-base font-medium" role="status" aria-live="polite"></div>
                    </form>
                </section>
            </div>
        </div>
    </div>
</div>

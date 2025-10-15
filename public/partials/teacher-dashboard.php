<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$qaidah_page_link = isset( $qaidah_page_link ) ? $qaidah_page_link : '';
$qaidah_markup    = '';

ob_start();
$qaidah_role = 'teacher';
include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/qaidah.php';
$qaidah_markup = ob_get_clean();
?>
<div class="min-h-screen bg-stone-50 py-10">
    <div id="alfawz-teacher-dashboard" class="mx-auto max-w-6xl space-y-10 px-4 font-sans sm:px-6 lg:px-0">
        <section class="text-center">
            <div class="mb-4 text-4xl" aria-hidden="true">🧑‍🏫</div>
            <h1 class="text-3xl font-bold text-gray-800"><?php esc_html_e( 'Welcome, Teacher!', 'alfawzquran' ); ?></h1>
            <p class="mx-auto mt-3 max-w-2xl text-base text-gray-600">
                <?php esc_html_e( 'You are assigned to', 'alfawzquran' ); ?>
                <span class="font-semibold text-emerald-700" id="alfawz-teacher-class-total" data-label="<?php esc_attr_e( 'classes', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                <?php esc_html_e( 'with', 'alfawzquran' ); ?>
                <span class="font-semibold text-emerald-700" id="alfawz-teacher-student-total" data-label="<?php esc_attr_e( 'students', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>.
                <?php esc_html_e( 'Create Qa’idah assignments or track memorisation progress below.', 'alfawzquran' ); ?>
            </p>
        </section>

        <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm" aria-labelledby="alfawz-teacher-classes-title">
            <h2 id="alfawz-teacher-classes-title" class="mb-4 flex items-center text-2xl font-bold text-gray-800">
                <span class="mr-2" aria-hidden="true">🏫</span><?php esc_html_e( 'Your Assigned Classes', 'alfawzquran' ); ?>
            </h2>
            <div id="alfawz-teacher-class-cards" class="space-y-3" aria-live="polite" aria-busy="true">
                <div class="flex items-center justify-center rounded-lg bg-emerald-50 px-4 py-6 text-base font-medium text-emerald-700">
                    <?php esc_html_e( 'Loading assigned classes…', 'alfawzquran' ); ?>
                </div>
            </div>
            <p class="mt-4 text-sm italic text-gray-500">
                <?php esc_html_e( '💡 Classes and students are assigned by your administrator. Contact them to request changes.', 'alfawzquran' ); ?>
            </p>
        </section>

        <section class="grid grid-cols-1 gap-6 md:grid-cols-2" aria-label="<?php esc_attr_e( 'Primary teaching actions', 'alfawzquran' ); ?>">
            <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition transform hover:shadow-md hover:-translate-y-1">
                <div class="mb-3 text-4xl" aria-hidden="true">📚</div>
                <h3 class="text-2xl font-bold text-gray-800"><?php esc_html_e( 'Qa’idah Assignments', 'alfawzquran' ); ?></h3>
                <p class="mt-2 text-base text-gray-600"><?php esc_html_e( 'Create interactive audio lessons for your assigned classes.', 'alfawzquran' ); ?></p>
                <div class="mt-6 flex items-center justify-between">
                    <span class="text-sm font-medium text-emerald-700" id="alfawz-teacher-assignment-total" data-label="<?php esc_attr_e( 'assignments sent', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                    <a href="?page=alfawz_qaidah" class="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                        <?php esc_html_e( 'Create assignment →', 'alfawzquran' ); ?>
                    </a>
                </div>
            </div>

            <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition transform hover:shadow-md hover:-translate-y-1">
                <div class="mb-3 text-4xl" aria-hidden="true">🧠</div>
                <h3 class="text-2xl font-bold text-gray-800"><?php esc_html_e( 'Student Memorization', 'alfawzquran' ); ?></h3>
                <p class="mt-2 text-base text-gray-600"><?php esc_html_e( 'View progress of students in your classes.', 'alfawzquran' ); ?></p>
                <div class="mt-6 flex items-center justify-between">
                    <span class="text-sm font-medium text-blue-700" id="alfawz-teacher-memorization-count" data-label="<?php esc_attr_e( 'students tracked', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                    <a href="#alfawz-teacher-memorization" class="inline-block rounded-lg bg-blue-600 px-4 py-2 text-base font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <?php esc_html_e( 'View progress →', 'alfawzquran' ); ?>
                    </a>
                </div>
            </div>
        </section>

        <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm" aria-labelledby="alfawz-teacher-activity-title">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <h2 id="alfawz-teacher-activity-title" class="text-2xl font-bold text-gray-800"><?php esc_html_e( 'Recent Activity', 'alfawzquran' ); ?></h2>
            </div>
            <ul id="alfawz-teacher-activity-list" class="mt-4 space-y-4" aria-live="polite" aria-busy="true">
                <li class="rounded-lg bg-gray-50 px-4 py-4 text-base text-gray-600"><?php esc_html_e( 'Compiling recent activity…', 'alfawzquran' ); ?></li>
            </ul>
        </section>

        <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm" aria-labelledby="alfawz-teacher-assignments-title">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 id="alfawz-teacher-assignments-title" class="text-2xl font-bold text-gray-800"><?php esc_html_e( 'Manage Qa’idah Assignments', 'alfawzquran' ); ?></h2>
                    <p class="mt-1 text-base text-gray-600"><?php esc_html_e( 'Review published lessons, open previews, or edit content before sending reminders.', 'alfawzquran' ); ?></p>
                </div>
                <div class="flex flex-col gap-3 sm:flex-row">
                    <button type="button" id="alfawz-teacher-create-assignment" class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                        <span aria-hidden="true" class="mr-2">✏️</span>
                        <span><?php esc_html_e( 'Create assignment', 'alfawzquran' ); ?></span>
                    </button>
                    <button type="button" id="alfawz-teacher-refresh" class="inline-flex items-center justify-center rounded-lg border border-emerald-200 px-4 py-2 text-base font-medium text-emerald-700 transition hover:border-emerald-300 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                        <?php esc_html_e( 'Refresh data', 'alfawzquran' ); ?>
                    </button>
                </div>
            </div>
            <p id="alfawz-teacher-qaidah-status" class="mt-4 text-sm font-medium text-emerald-700" role="status" aria-live="polite"></p>
            <div class="mt-4 overflow-x-auto rounded-xl border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200 text-left">
                    <thead class="bg-gray-50 text-sm font-semibold uppercase tracking-wide text-gray-600">
                        <tr>
                            <th scope="col" class="px-4 py-3"><?php esc_html_e( 'Assignment', 'alfawzquran' ); ?></th>
                            <th scope="col" class="px-4 py-3"><?php esc_html_e( 'Class', 'alfawzquran' ); ?></th>
                            <th scope="col" class="px-4 py-3"><?php esc_html_e( 'Updated', 'alfawzquran' ); ?></th>
                            <th scope="col" class="px-4 py-3"><?php esc_html_e( 'Status', 'alfawzquran' ); ?></th>
                            <th scope="col" class="px-4 py-3 text-right"><?php esc_html_e( 'Actions', 'alfawzquran' ); ?></th>
                        </tr>
                    </thead>
                    <tbody id="alfawz-teacher-assignment-rows" aria-live="polite" aria-busy="true">
                        <tr>
                            <td colspan="5" class="px-4 py-6 text-center text-base text-gray-500"><?php esc_html_e( 'Loading assignments…', 'alfawzquran' ); ?></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="alfawz-qaidah-wrapper" class="hidden">
                <?php echo $qaidah_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
            </div>
        </section>

        <section id="alfawz-teacher-memorization" class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm" aria-labelledby="alfawz-teacher-memorization-title">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 id="alfawz-teacher-memorization-title" class="text-2xl font-bold text-gray-800"><?php esc_html_e( 'Student Memorization Oversight', 'alfawzquran' ); ?></h2>
                    <p class="mt-1 text-base text-gray-600"><?php esc_html_e( 'Monitor repetitions, completion pace, and streak health for every student assigned to you.', 'alfawzquran' ); ?></p>
                </div>
                <span class="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700" id="alfawz-teacher-memo-pill" data-label="<?php esc_attr_e( 'students tracked', 'alfawzquran' ); ?>">
                    <?php esc_html_e( 'Loading…', 'alfawzquran' ); ?>
                </span>
            </div>
            <div id="alfawz-teacher-memo-list" class="mt-6 space-y-4" aria-live="polite" aria-busy="true">
                <div class="rounded-xl border border-gray-200 bg-gray-50 px-6 py-6 text-center text-base text-gray-500"><?php esc_html_e( 'Loading memorisation data…', 'alfawzquran' ); ?></div>
            </div>
        </section>
    </div>
</div>

<div id="alfawz-teacher-assignment-modal" class="alfawz-qaidah-modal hidden" role="dialog" aria-modal="true" aria-labelledby="alfawz-teacher-assignment-modal-title">
    <div class="alfawz-qaidah-modal__content">
        <button type="button" class="alfawz-qaidah-modal__close" id="alfawz-teacher-assignment-modal-close" aria-label="<?php esc_attr_e( 'Close preview', 'alfawzquran' ); ?>">✕</button>
        <div class="space-y-4">
            <header class="space-y-1">
                <h4 id="alfawz-teacher-assignment-modal-title" class="text-xl font-semibold text-slate-900"></h4>
                <p id="alfawz-teacher-assignment-modal-meta" class="text-sm text-slate-500"></p>
            </header>
            <div class="alfawz-qaidah-modal__image">
                <img id="alfawz-teacher-assignment-modal-image" src="" alt="<?php esc_attr_e( 'Assignment preview image', 'alfawzquran' ); ?>" />
                <div id="alfawz-teacher-assignment-modal-hotspots" class="alfawz-qaidah-hotspot-layer" role="presentation"></div>
            </div>
        </div>
    </div>
</div>

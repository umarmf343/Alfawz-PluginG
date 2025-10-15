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
<div id="alfawz-teacher-dashboard" class="alfawz-surface mx-auto max-w-6xl space-y-10 rounded-3xl bg-white/95 p-6 shadow-xl shadow-emerald-100/80 backdrop-blur">
    <header class="space-y-2 text-slate-900">
        <p class="text-sm font-medium uppercase tracking-wide text-emerald-600"><?php esc_html_e( 'Teacher workspace', 'alfawzquran' ); ?></p>
        <h2 class="text-2xl font-semibold leading-tight"><?php esc_html_e( 'Guide every learner with confidence', 'alfawzquran' ); ?></h2>
        <p class="max-w-2xl text-sm text-slate-600"><?php esc_html_e( 'Build Qa’idah lessons, monitor memorisation streaks, and check in on your classes in one place.', 'alfawzquran' ); ?></p>
    </header>

    <section class="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="<?php esc_attr_e( 'Key teaching actions', 'alfawzquran' ); ?>">
        <article class="alfawz-card flex flex-col gap-4" data-card="qaidah">
            <div class="text-3xl" aria-hidden="true">📚</div>
            <div>
                <h3 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Qa’idah assignments', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600"><?php esc_html_e( 'Launch interactive lessons with image hotspots and teacher-recorded prompts.', 'alfawzquran' ); ?></p>
            </div>
            <div class="flex items-center justify-between">
                <span id="alfawz-teacher-assignment-count" class="text-3xl font-semibold text-slate-900">0</span>
                <button type="button" id="alfawz-teacher-create-assignment" class="alfawz-button">
                    <span>✏️</span>
                    <span><?php esc_html_e( 'Create assignment', 'alfawzquran' ); ?></span>
                </button>
            </div>
        </article>

        <article class="alfawz-card flex flex-col gap-4" data-card="memorization">
            <div class="text-3xl" aria-hidden="true">🧠</div>
            <div>
                <h3 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Memorisation oversight', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600"><?php esc_html_e( 'See active plans, repetitions completed, and streak health for each student.', 'alfawzquran' ); ?></p>
            </div>
            <div class="flex items-center justify-between">
                <span id="alfawz-teacher-active-plan-count" class="text-3xl font-semibold text-slate-900">0</span>
                <a href="#alfawz-teacher-memorization" class="alfawz-link text-sm font-semibold text-emerald-600">
                    <?php esc_html_e( 'Review students', 'alfawzquran' ); ?>
                </a>
            </div>
        </article>

        <article class="alfawz-card flex flex-col gap-4" data-card="streaks">
            <div class="text-3xl" aria-hidden="true">🔁</div>
            <div>
                <h3 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Streak watch', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600"><?php esc_html_e( 'Spot students whose streaks need encouragement before momentum slips.', 'alfawzquran' ); ?></p>
            </div>
            <div class="flex items-center justify-between">
                <span id="alfawz-teacher-streak-alert-count" class="text-3xl font-semibold text-slate-900">0</span>
                <a href="#alfawz-teacher-memorization" class="alfawz-link text-sm font-semibold text-emerald-600">
                    <?php esc_html_e( 'View streaks', 'alfawzquran' ); ?>
                </a>
            </div>
        </article>

        <article class="alfawz-card flex flex-col gap-4" data-card="classes">
            <div class="text-3xl" aria-hidden="true">🏫</div>
            <div>
                <h3 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Classrooms', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600"><?php esc_html_e( 'Check attendance, enrolment trends, and jump into detailed rosters.', 'alfawzquran' ); ?></p>
            </div>
            <div class="flex items-center justify-between">
                <span id="alfawz-teacher-class-count" class="text-3xl font-semibold text-slate-900">0</span>
                <a href="#alfawz-teacher-classes" class="alfawz-link text-sm font-semibold text-emerald-600">
                    <?php esc_html_e( 'Open roster', 'alfawzquran' ); ?>
                </a>
            </div>
        </article>
    </section>

    <section id="alfawz-teacher-qaidah" class="space-y-6" aria-labelledby="alfawz-teacher-qaidah-heading">
        <div class="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="space-y-1">
                    <h3 id="alfawz-teacher-qaidah-heading" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Qa’idah assignment builder', 'alfawzquran' ); ?></h3>
                    <p class="text-sm text-slate-600"><?php esc_html_e( 'Use the builder below or open the dedicated Qa’idah workspace in a new tab.', 'alfawzquran' ); ?></p>
                </div>
                <a class="alfawz-link text-sm font-semibold text-emerald-700" href="<?php echo esc_url( $qaidah_page_link ); ?>" target="_blank" rel="noopener noreferrer">
                    <?php esc_html_e( 'Open full Qa’idah workspace', 'alfawzquran' ); ?>
                </a>
            </div>
            <p id="alfawz-teacher-qaidah-status" class="text-sm font-medium text-emerald-700" role="status" aria-live="polite"></p>
        </div>
        <div id="alfawz-qaidah-wrapper" class="hidden">
            <?php echo $qaidah_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
        </div>
    </section>

    <section id="alfawz-teacher-assignments" class="space-y-4" aria-labelledby="alfawz-teacher-assignments-heading">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-1">
                <h3 id="alfawz-teacher-assignments-heading" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Sent Qa’idah assignments', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600"><?php esc_html_e( 'Review everything you have published, including target class and latest update.', 'alfawzquran' ); ?></p>
            </div>
            <button type="button" id="alfawz-teacher-refresh" class="alfawz-link text-sm font-semibold text-emerald-600">
                <?php esc_html_e( 'Refresh data', 'alfawzquran' ); ?>
            </button>
        </div>
        <div class="overflow-x-auto rounded-2xl border border-slate-100">
            <table class="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-700">
                <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                        <td colspan="5" class="px-4 py-6 text-center text-sm text-slate-500"><?php esc_html_e( 'Loading assignments…', 'alfawzquran' ); ?></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <section id="alfawz-teacher-memorization" class="space-y-4" aria-labelledby="alfawz-teacher-memorization-heading">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-1">
                <h3 id="alfawz-teacher-memorization-heading" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Memorisation oversight', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600"><?php esc_html_e( 'Monitor repetitions, plan completion, and streak health for every student assigned to you.', 'alfawzquran' ); ?></p>
            </div>
        </div>
        <div id="alfawz-teacher-memo-list" class="space-y-4" aria-live="polite" aria-busy="true">
            <div class="rounded-2xl border border-slate-100 bg-white p-6 text-center text-sm text-slate-500"><?php esc_html_e( 'Loading memorisation data…', 'alfawzquran' ); ?></div>
        </div>
    </section>

    <section id="alfawz-teacher-classes" class="space-y-4" aria-labelledby="alfawz-teacher-classes-heading">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-1">
                <h3 id="alfawz-teacher-classes-heading" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Class management summary', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600"><?php esc_html_e( 'Keep tabs on enrolment numbers and jump straight to memorisation data for each class.', 'alfawzquran' ); ?></p>
            </div>
        </div>
        <div id="alfawz-teacher-class-list" class="space-y-4" aria-live="polite" aria-busy="true">
            <div class="rounded-2xl border border-slate-100 bg-white p-6 text-center text-sm text-slate-500"><?php esc_html_e( 'Loading class overview…', 'alfawzquran' ); ?></div>
        </div>
    </section>
</div>

<div id="alfawz-teacher-assignment-modal" class="alfawz-qaidah-modal hidden" role="dialog" aria-modal="true" aria-labelledby="alfawz-teacher-assignment-modal-title">
    <div class="alfawz-qaidah-modal__content">
        <button type="button" class="alfawz-qaidah-modal__close" id="alfawz-teacher-assignment-modal-close" aria-label="<?php esc_attr_e( 'Close preview', 'alfawzquran' ); ?>">✕</button>
        <div class="space-y-4">
            <header class="space-y-1">
                <h4 id="alfawz-teacher-assignment-modal-title" class="text-lg font-semibold text-slate-900"></h4>
                <p id="alfawz-teacher-assignment-modal-meta" class="text-xs text-slate-500"></p>
            </header>
            <div class="alfawz-qaidah-modal__image">
                <img id="alfawz-teacher-assignment-modal-image" src="" alt="<?php esc_attr_e( 'Assignment preview image', 'alfawzquran' ); ?>" />
                <div id="alfawz-teacher-assignment-modal-hotspots" class="alfawz-qaidah-hotspot-layer" role="presentation"></div>
            </div>
        </div>
    </div>
</div>

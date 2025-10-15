<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$qaidah_teacher_url = apply_filters( 'alfawz_mobile_nav_url', '', 'qaidah-teacher' );
if ( empty( $qaidah_teacher_url ) ) {
    $qaidah_page = get_page_by_path( 'alfawz-qaidah' );
    if ( $qaidah_page ) {
        $qaidah_teacher_url = get_permalink( $qaidah_page );
    }
}
?>
<div id="alfawz-teacher-dashboard" class="alfawz-surface mx-auto max-w-6xl space-y-10 rounded-3xl bg-white/95 p-6 shadow-xl shadow-emerald-200/70 backdrop-blur">
    <header class="space-y-2 text-slate-900">
        <p class="text-sm font-medium tracking-wide text-emerald-600"><?php esc_html_e( 'Teacher workspace', 'alfawzquran' ); ?></p>
        <h2 class="text-2xl font-semibold leading-tight">
            <?php esc_html_e( 'Guide your students through Qa’idah and memorisation', 'alfawzquran' ); ?>
        </h2>
        <p class="max-w-3xl text-sm text-slate-600">
            <?php esc_html_e( 'Build interactive Qa’idah lessons, monitor memorisation streaks, and review class activity from a single home base.', 'alfawzquran' ); ?>
        </p>
    </header>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-labelledby="alfawz-teacher-overview">
        <h3 id="alfawz-teacher-overview" class="sr-only"><?php esc_html_e( 'Teacher overview cards', 'alfawzquran' ); ?></h3>
        <article class="alfawz-card flex flex-col gap-3" data-card="qaidah">
            <div class="text-3xl" aria-hidden="true">📚</div>
            <h4 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Qa’idah Assignments', 'alfawzquran' ); ?></h4>
            <p class="text-sm text-slate-600"><?php esc_html_e( 'Create interactive image hotspots and audio prompts for your class.', 'alfawzquran' ); ?></p>
            <button type="button" id="alfawz-teacher-create-assignment" class="alfawz-button w-fit">
                <span>➕</span>
                <span><?php esc_html_e( 'Create Qa’idah Assignment', 'alfawzquran' ); ?></span>
            </button>
        </article>
        <article class="alfawz-card flex flex-col gap-3" data-card="memorization">
            <div class="text-3xl" aria-hidden="true">🧠</div>
            <h4 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Memorisation Oversight', 'alfawzquran' ); ?></h4>
            <p class="text-sm text-slate-600">
                <?php esc_html_e( 'Track active plans and memorised verses across your roster.', 'alfawzquran' ); ?>
            </p>
            <div class="flex items-baseline gap-2 text-2xl font-semibold text-emerald-700">
                <span id="alfawz-teacher-active-plans">0</span>
                <span class="text-xs font-medium uppercase tracking-wide text-slate-500"><?php esc_html_e( 'active plans', 'alfawzquran' ); ?></span>
            </div>
        </article>
        <article class="alfawz-card flex flex-col gap-3" data-card="classes">
            <div class="text-3xl" aria-hidden="true">🏫</div>
            <h4 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Classes Assigned', 'alfawzquran' ); ?></h4>
            <p class="text-sm text-slate-600"><?php esc_html_e( 'Review class sizes and jump straight to detailed activity.', 'alfawzquran' ); ?></p>
            <div class="flex items-baseline gap-2 text-2xl font-semibold text-emerald-700">
                <span id="alfawz-teacher-class-count">0</span>
                <span class="text-xs font-medium uppercase tracking-wide text-slate-500"><?php esc_html_e( 'classes', 'alfawzquran' ); ?></span>
            </div>
        </article>
        <article class="alfawz-card flex flex-col gap-3" data-card="assignments">
            <div class="text-3xl" aria-hidden="true">📨</div>
            <h4 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Assignments Sent', 'alfawzquran' ); ?></h4>
            <p class="text-sm text-slate-600"><?php esc_html_e( 'Keep tabs on recent Qa’idah activities and follow up instantly.', 'alfawzquran' ); ?></p>
            <div class="flex items-baseline gap-2 text-2xl font-semibold text-emerald-700">
                <span id="alfawz-teacher-assignment-count">0</span>
                <span class="text-xs font-medium uppercase tracking-wide text-slate-500"><?php esc_html_e( 'total', 'alfawzquran' ); ?></span>
            </div>
        </article>
    </section>

    <section class="space-y-6" aria-labelledby="alfawz-teacher-assignments">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h3 id="alfawz-teacher-assignments" class="text-xl font-semibold text-slate-900"><?php esc_html_e( 'Qa’idah Assignment Builder', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600"><?php esc_html_e( 'Open the builder to craft new lessons or revisit drafts.', 'alfawzquran' ); ?></p>
            </div>
            <button type="button" class="alfawz-link text-sm font-semibold text-emerald-600" id="alfawz-teacher-refresh-assignments">
                <?php esc_html_e( 'Refresh list', 'alfawzquran' ); ?>
            </button>
        </div>
        <ul id="alfawz-teacher-assignment-list" class="space-y-4" aria-live="polite" aria-busy="true"></ul>
        <p id="alfawz-teacher-assignment-empty" class="hidden text-sm text-slate-500">
            <?php esc_html_e( 'No assignments yet. Create your first Qa’idah lesson to get started.', 'alfawzquran' ); ?>
        </p>
        <p class="text-xs text-slate-500">
            <?php if ( $qaidah_teacher_url ) : ?>
                <?php
                printf(
                    /* translators: %s: Qa'idah builder URL */
                    esc_html__( 'Need the full-screen builder? %s', 'alfawzquran' ),
                    '<a class="alfawz-link text-emerald-600" href="' . esc_url( $qaidah_teacher_url ) . '">' . esc_html__( 'Open Qa’idah workspace in a new tab.', 'alfawzquran' ) . '</a>'
                );
                ?>
            <?php else : ?>
                <?php esc_html_e( 'Need the full-screen builder? Contact an administrator to publish the Qa’idah page.', 'alfawzquran' ); ?>
            <?php endif; ?>
        </p>
    </section>

    <section class="space-y-6" aria-labelledby="alfawz-teacher-memorization">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h3 id="alfawz-teacher-memorization" class="text-xl font-semibold text-slate-900"><?php esc_html_e( 'Memorisation Oversight', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600"><?php esc_html_e( 'Follow your students’ streaks and memorisation plan progress.', 'alfawzquran' ); ?></p>
            </div>
            <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700" id="alfawz-teacher-student-count">0 <?php esc_html_e( 'students', 'alfawzquran' ); ?></span>
        </div>
        <div id="alfawz-teacher-memorization-list" class="space-y-4" aria-live="polite" aria-busy="true"></div>
        <p id="alfawz-teacher-memorization-empty" class="hidden text-sm text-slate-500">
            <?php esc_html_e( 'Students will appear here once they begin a memorisation plan.', 'alfawzquran' ); ?>
        </p>
    </section>

    <section class="space-y-6" aria-labelledby="alfawz-teacher-classes">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h3 id="alfawz-teacher-classes" class="text-xl font-semibold text-slate-900"><?php esc_html_e( 'Class Management Summary', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600"><?php esc_html_e( 'See who is enrolled in each class and jump to detailed activity pages.', 'alfawzquran' ); ?></p>
            </div>
        </div>
        <div id="alfawz-teacher-class-list" class="space-y-4" aria-live="polite" aria-busy="true"></div>
        <p id="alfawz-teacher-class-empty" class="hidden text-sm text-slate-500"><?php esc_html_e( 'You do not have any classes assigned yet.', 'alfawzquran' ); ?></p>
    </section>
</div>

<div id="alfawz-teacher-assignment-modal" class="alfawz-qaidah-modal hidden" role="dialog" aria-modal="true" aria-labelledby="alfawz-teacher-assignment-modal-title">
    <div class="alfawz-qaidah-modal__content max-h-[95vh] w-full max-w-5xl overflow-y-auto">
        <button type="button" class="alfawz-qaidah-modal__close" id="alfawz-teacher-assignment-close" aria-label="<?php esc_attr_e( 'Close assignment builder', 'alfawzquran' ); ?>">✕</button>
        <div class="space-y-6">
            <header class="space-y-1">
                <h3 id="alfawz-teacher-assignment-modal-title" class="text-xl font-semibold text-slate-900"><?php esc_html_e( 'Qa’idah Assignment Builder', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600"><?php esc_html_e( 'Use hotspots and audio prompts to craft an engaging lesson.', 'alfawzquran' ); ?></p>
            </header>
            <?php
            $qaidah_role = 'teacher';
            include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/qaidah.php';
            ?>
        </div>
    </div>
</div>

<div id="alfawz-teacher-assignment-preview" class="alfawz-qaidah-modal hidden" role="dialog" aria-modal="true" aria-labelledby="alfawz-teacher-assignment-preview-title">
    <div class="alfawz-qaidah-modal__content max-h-[90vh] w-full max-w-4xl overflow-y-auto">
        <button type="button" class="alfawz-qaidah-modal__close" id="alfawz-teacher-preview-close" aria-label="<?php esc_attr_e( 'Close assignment preview', 'alfawzquran' ); ?>">✕</button>
        <div class="space-y-4">
            <header class="space-y-1">
                <h3 id="alfawz-teacher-assignment-preview-title" class="text-xl font-semibold text-slate-900"></h3>
                <p id="alfawz-teacher-assignment-preview-meta" class="text-xs text-slate-500"></p>
            </header>
            <div class="alfawz-qaidah-modal__image relative">
                <img id="alfawz-teacher-preview-image" src="" alt="<?php esc_attr_e( 'Qa’idah assignment preview', 'alfawzquran' ); ?>" />
                <div id="alfawz-teacher-preview-hotspots" class="alfawz-qaidah-hotspot-layer" role="presentation"></div>
            </div>
            <ul id="alfawz-teacher-preview-hotspot-list" class="space-y-2"></ul>
        </div>
    </div>
</div>

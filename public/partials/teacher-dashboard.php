<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$teacher_id  = isset( $teacher_id ) ? (int) $teacher_id : get_current_user_id();
$builder_url = isset( $builder_url ) ? $builder_url : apply_filters( 'alfawz_mobile_nav_url', '', 'qaidah-teacher' );
$class_link_template = apply_filters( 'alfawz_teacher_class_url_template', '', $builder_url );

if ( empty( $class_link_template ) ) {
    $class_link_template = $builder_url ? add_query_arg( 'class', '__CLASS__', $builder_url ) : '';
}
?>
<div
    id="alfawz-teacher-dashboard"
    class="alfawz-surface mx-auto max-w-6xl space-y-8 rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100/70 backdrop-blur"
    data-teacher-id="<?php echo esc_attr( $teacher_id ); ?>"
    data-builder-url="<?php echo esc_url( $builder_url ); ?>"
    data-class-link-template="<?php echo esc_url( $class_link_template ); ?>"
>
    <header class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div class="space-y-2 text-slate-900">
            <p class="text-sm font-semibold uppercase tracking-wide text-emerald-600"><?php esc_html_e( 'Teacher workspace', 'alfawzquran' ); ?></p>
            <h2 class="text-3xl font-semibold leading-tight">
                <?php esc_html_e( 'Guide your students with clarity', 'alfawzquran' ); ?>
            </h2>
            <p class="max-w-3xl text-sm text-slate-600">
                <?php esc_html_e( 'Build interactive Qa’idah assignments, monitor memorisation momentum, and keep every class aligned in one dashboard.', 'alfawzquran' ); ?>
            </p>
        </div>
        <button type="button" id="alfawz-teacher-refresh" class="alfawz-button self-start">
            <span>🔄</span>
            <span><?php esc_html_e( 'Refresh data', 'alfawzquran' ); ?></span>
        </button>
    </header>

    <section class="grid grid-cols-1 gap-6 md:grid-cols-2" aria-label="<?php echo esc_attr__( 'Teacher quick actions', 'alfawzquran' ); ?>">
        <article class="alfawz-card flex flex-col gap-4" id="alfawz-teacher-qaidah-card">
            <div class="flex items-start gap-3">
                <span class="text-3xl" aria-hidden="true">📚</span>
                <div class="space-y-1">
                    <h3 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Qa’idah assignment builder', 'alfawzquran' ); ?></h3>
                    <p class="text-sm text-slate-600"><?php esc_html_e( 'Launch interactive lessons with hotspots, imagery, and guided audio prompts.', 'alfawzquran' ); ?></p>
                </div>
            </div>
            <div class="flex flex-wrap items-center gap-3">
                <button type="button" id="alfawz-teacher-toggle-form" class="alfawz-button">
                    <span>➕</span>
                    <span><?php esc_html_e( 'Create Qa’idah assignment', 'alfawzquran' ); ?></span>
                </button>
                <?php if ( $builder_url ) : ?>
                    <a href="<?php echo esc_url( $builder_url ); ?>" class="alfawz-link text-sm font-semibold text-emerald-600" target="_blank" rel="noopener">
                        <?php esc_html_e( 'Open full builder', 'alfawzquran' ); ?>
                    </a>
                <?php endif; ?>
            </div>
            <dl class="grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div>
                    <dt class="font-semibold text-slate-500"><?php esc_html_e( 'Active assignments', 'alfawzquran' ); ?></dt>
                    <dd class="mt-1 text-2xl font-semibold text-slate-900" id="alfawz-teacher-assignment-count">0</dd>
                </div>
                <div>
                    <dt class="font-semibold text-slate-500"><?php esc_html_e( 'Awaiting edits', 'alfawzquran' ); ?></dt>
                    <dd class="mt-1 text-2xl font-semibold text-slate-900" id="alfawz-teacher-draft-count">0</dd>
                </div>
            </dl>
            <form id="alfawz-teacher-assignment-form" class="hidden space-y-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div class="grid gap-4 md:grid-cols-2">
                    <label class="alfawz-field">
                        <span class="alfawz-field-label"><?php esc_html_e( 'Assignment title', 'alfawzquran' ); ?></span>
                        <input type="text" id="alfawz-teacher-assignment-title" class="alfawz-input" required />
                    </label>
                    <label class="alfawz-field">
                        <span class="alfawz-field-label"><?php esc_html_e( 'Assign to class', 'alfawzquran' ); ?></span>
                        <select id="alfawz-teacher-class-select" class="alfawz-input" data-default-label="<?php echo esc_attr__( 'Select class…', 'alfawzquran' ); ?>">
                            <option value=""><?php esc_html_e( 'Select class…', 'alfawzquran' ); ?></option>
                        </select>
                    </label>
                </div>
                <label class="alfawz-field">
                    <span class="alfawz-field-label"><?php esc_html_e( 'Brief lesson objective (optional)', 'alfawzquran' ); ?></span>
                    <textarea id="alfawz-teacher-assignment-description" class="alfawz-input" rows="3"></textarea>
                </label>
                <div class="space-y-3">
                    <label class="alfawz-field">
                        <span class="alfawz-field-label"><?php esc_html_e( 'Filter students', 'alfawzquran' ); ?></span>
                        <input type="search" id="alfawz-teacher-student-search" class="alfawz-input" placeholder="<?php echo esc_attr__( 'Search by name or email…', 'alfawzquran' ); ?>" />
                    </label>
                    <div class="rounded-2xl border border-slate-200 bg-white/70 p-3">
                        <p class="text-xs font-medium uppercase tracking-wide text-slate-500"><?php esc_html_e( 'Students', 'alfawzquran' ); ?></p>
                        <div id="alfawz-teacher-student-list" class="mt-3 grid max-h-40 gap-2 overflow-auto" aria-live="polite" aria-busy="true"></div>
                        <p class="mt-2 text-xs text-slate-500" id="alfawz-teacher-student-helper"><?php esc_html_e( 'Select an entire class or pick individual students.', 'alfawzquran' ); ?></p>
                    </div>
                </div>
                <div class="grid gap-6 md:grid-cols-2">
                    <div class="space-y-3">
                        <span class="text-sm font-semibold text-slate-700"><?php esc_html_e( 'Assignment image', 'alfawzquran' ); ?></span>
                        <div class="flex flex-wrap items-center gap-3">
                            <input type="file" id="alfawz-teacher-assignment-image" accept="image/*" class="hidden" />
                            <button type="button" id="alfawz-teacher-choose-image" class="alfawz-button alfawz-button--ghost">
                                <span>🖼️</span>
                                <span><?php esc_html_e( 'Select image', 'alfawzquran' ); ?></span>
                            </button>
                            <button type="button" id="alfawz-teacher-remove-image" class="hidden text-sm font-semibold text-rose-600">
                                <?php esc_html_e( 'Remove image', 'alfawzquran' ); ?>
                            </button>
                        </div>
                        <figure id="alfawz-teacher-image-preview" class="hidden overflow-hidden rounded-2xl border border-emerald-100 bg-white/80">
                            <img src="" alt="" class="h-36 w-full object-cover" />
                        </figure>
                    </div>
                    <div class="space-y-3">
                        <span class="text-sm font-semibold text-slate-700"><?php esc_html_e( 'Hotspots & audio guidance', 'alfawzquran' ); ?></span>
                        <p class="text-xs text-slate-500"><?php esc_html_e( 'Add focus points and upload pronunciation audio for learners.', 'alfawzquran' ); ?></p>
                        <div id="alfawz-teacher-hotspot-list" class="space-y-3"></div>
                        <button type="button" id="alfawz-teacher-add-hotspot" class="alfawz-link text-sm font-semibold text-emerald-600">
                            <?php esc_html_e( '➕ Add hotspot', 'alfawzquran' ); ?>
                        </button>
                    </div>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                    <button type="submit" class="alfawz-button">
                        <span>💾</span>
                        <span><?php esc_html_e( 'Save assignment & open builder', 'alfawzquran' ); ?></span>
                    </button>
                    <?php if ( $builder_url ) : ?>
                        <a href="<?php echo esc_url( $builder_url ); ?>" class="alfawz-link text-sm font-semibold text-emerald-600" target="_blank" rel="noopener">
                            <?php esc_html_e( 'Launch builder in new tab', 'alfawzquran' ); ?>
                        </a>
                    <?php endif; ?>
                </div>
                <p class="text-xs text-slate-500" id="alfawz-teacher-assignment-status"></p>
            </form>
        </article>

        <article class="alfawz-card flex flex-col gap-4" id="alfawz-teacher-memorization-card">
            <div class="flex items-start gap-3">
                <span class="text-3xl" aria-hidden="true">🧠</span>
                <div class="space-y-1">
                    <h3 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Memorization oversight', 'alfawzquran' ); ?></h3>
                    <p class="text-sm text-slate-600"><?php esc_html_e( 'Spot streak dips early and celebrate every completed verse.', 'alfawzquran' ); ?></p>
                </div>
            </div>
            <dl class="grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div>
                    <dt class="font-semibold text-slate-500"><?php esc_html_e( 'Tracked students', 'alfawzquran' ); ?></dt>
                    <dd class="mt-1 text-2xl font-semibold text-slate-900" id="alfawz-teacher-student-count">0</dd>
                </div>
                <div>
                    <dt class="font-semibold text-slate-500"><?php esc_html_e( 'Active memorisation plans', 'alfawzquran' ); ?></dt>
                    <dd class="mt-1 text-2xl font-semibold text-slate-900" id="alfawz-teacher-active-plan-count">0</dd>
                </div>
                <div class="col-span-2">
                    <dt class="font-semibold text-slate-500"><?php esc_html_e( 'On-track streaks', 'alfawzquran' ); ?></dt>
                    <dd class="mt-1 text-lg font-semibold text-emerald-600" id="alfawz-teacher-streak-count">0</dd>
                </div>
            </dl>
            <a href="#alfawz-teacher-memorization-panel" class="alfawz-link text-sm font-semibold text-emerald-600"><?php esc_html_e( 'View student detail', 'alfawzquran' ); ?></a>
        </article>

        <article class="alfawz-card flex flex-col gap-4" id="alfawz-teacher-class-card">
            <div class="flex items-start gap-3">
                <span class="text-3xl" aria-hidden="true">🏫</span>
                <div class="space-y-1">
                    <h3 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Class management', 'alfawzquran' ); ?></h3>
                    <p class="text-sm text-slate-600"><?php esc_html_e( 'Understand class sizes, enrolment growth, and quick links to activity.', 'alfawzquran' ); ?></p>
                </div>
            </div>
            <dl class="grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div>
                    <dt class="font-semibold text-slate-500"><?php esc_html_e( 'Classes', 'alfawzquran' ); ?></dt>
                    <dd class="mt-1 text-2xl font-semibold text-slate-900" id="alfawz-teacher-class-count">0</dd>
                </div>
                <div>
                    <dt class="font-semibold text-slate-500"><?php esc_html_e( 'Total students', 'alfawzquran' ); ?></dt>
                    <dd class="mt-1 text-2xl font-semibold text-slate-900" id="alfawz-teacher-total-students">0</dd>
                </div>
            </dl>
            <a href="#alfawz-teacher-classes-panel" class="alfawz-link text-sm font-semibold text-emerald-600"><?php esc_html_e( 'Review classes', 'alfawzquran' ); ?></a>
        </article>

        <article class="alfawz-card flex flex-col gap-4" id="alfawz-teacher-assignment-summary">
            <div class="flex items-start gap-3">
                <span class="text-3xl" aria-hidden="true">📤</span>
                <div class="space-y-1">
                    <h3 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Sent assignments', 'alfawzquran' ); ?></h3>
                    <p class="text-sm text-slate-600"><?php esc_html_e( 'Track delivery status and revisit drafts awaiting review.', 'alfawzquran' ); ?></p>
                </div>
            </div>
            <dl class="grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div>
                    <dt class="font-semibold text-slate-500"><?php esc_html_e( 'Delivered this week', 'alfawzquran' ); ?></dt>
                    <dd class="mt-1 text-2xl font-semibold text-slate-900" id="alfawz-teacher-weekly-assignments">0</dd>
                </div>
                <div>
                    <dt class="font-semibold text-slate-500"><?php esc_html_e( 'Needing follow-up', 'alfawzquran' ); ?></dt>
                    <dd class="mt-1 text-2xl font-semibold text-amber-600" id="alfawz-teacher-followup-count">0</dd>
                </div>
            </dl>
            <a href="#alfawz-teacher-assignments-panel" class="alfawz-link text-sm font-semibold text-emerald-600"><?php esc_html_e( 'Open assignment log', 'alfawzquran' ); ?></a>
        </article>
    </section>

    <section class="space-y-6" aria-label="<?php echo esc_attr__( 'Teacher insights', 'alfawzquran' ); ?>">
        <article id="alfawz-teacher-assignments-panel" class="rounded-3xl border border-slate-100 bg-white/80 p-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <h3 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Sent Qa’idah assignments', 'alfawzquran' ); ?></h3>
                <button type="button" id="alfawz-teacher-sync-assignments" class="alfawz-link text-sm font-semibold text-emerald-600">
                    <?php esc_html_e( 'Sync assignments', 'alfawzquran' ); ?>
                </button>
            </div>
            <p class="mt-1 text-sm text-slate-500"><?php esc_html_e( 'Every update appears instantly once saved in the Qa’idah builder.', 'alfawzquran' ); ?></p>
            <ul id="alfawz-teacher-assignment-list" class="mt-4 space-y-3" aria-live="polite" aria-busy="true"></ul>
        </article>

        <article id="alfawz-teacher-classes-panel" class="rounded-3xl border border-slate-100 bg-white/80 p-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <h3 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Class management summary', 'alfawzquran' ); ?></h3>
                <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700" id="alfawz-teacher-class-refresh-label"></span>
            </div>
            <div id="alfawz-teacher-class-list" class="mt-4 space-y-3" aria-live="polite" aria-busy="true"></div>
        </article>

        <article id="alfawz-teacher-memorization-panel" class="rounded-3xl border border-slate-100 bg-white/80 p-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <h3 class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Memorization oversight', 'alfawzquran' ); ?></h3>
                <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700" id="alfawz-teacher-memorization-updated"></span>
            </div>
            <div id="alfawz-teacher-memorization-list" class="mt-4 space-y-3" aria-live="polite" aria-busy="true"></div>
        </article>
    </section>
</div>

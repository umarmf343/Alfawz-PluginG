<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$qaidah_role = isset( $qaidah_role ) ? $qaidah_role : 'student';
$role_label  = 'teacher' === $qaidah_role ? __( 'Teacher control room', 'alfawzquran' ) : __( "Student practice centre", 'alfawzquran' );
?>
<div id="alfawz-qaidah" class="alfawz-surface mx-auto max-w-5xl space-y-8 rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100/70 backdrop-blur" data-role="<?php echo esc_attr( $qaidah_role ); ?>">
    <header class="space-y-1 text-slate-900">
        <p class="text-sm font-medium tracking-wide text-emerald-600"><?php echo esc_html( $role_label ); ?></p>
        <h2 class="text-2xl font-semibold leading-tight">
            <?php esc_html_e( 'Qa’idah progress board', 'alfawzquran' ); ?>
        </h2>
        <p class="text-sm text-slate-600">
            <?php esc_html_e( 'Coordinate lessons, share practice audio, and monitor class momentum straight from WordPress.', 'alfawzquran' ); ?>
        </p>
    </header>

    <?php if ( 'teacher' === $qaidah_role ) : ?>
        <section class="space-y-4" aria-labelledby="alfawz-qaidah-classes">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <h3 id="alfawz-qaidah-classes" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Your classes', 'alfawzquran' ); ?></h3>
                <button type="button" class="alfawz-link text-sm font-semibold text-emerald-600" id="alfawz-qaidah-new-class"><?php esc_html_e( 'Create class board', 'alfawzquran' ); ?></button>
            </div>
            <ul id="alfawz-qaidah-class-list" class="space-y-3" aria-live="polite" aria-busy="true"></ul>
        </section>

        <section class="space-y-4" aria-labelledby="alfawz-qaidah-assignments">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <h3 id="alfawz-qaidah-assignments" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Active assignments', 'alfawzquran' ); ?></h3>
                <button type="button" class="alfawz-button" id="alfawz-qaidah-create">
                    <span>📝</span>
                    <span><?php esc_html_e( 'Assign lesson', 'alfawzquran' ); ?></span>
                </button>
            </div>
            <ul id="alfawz-qaidah-assignment-list" class="space-y-3" aria-live="polite" aria-busy="true"></ul>
        </section>

        <section class="rounded-3xl bg-slate-50/70 p-6" aria-labelledby="alfawz-qaidah-audio">
            <h3 id="alfawz-qaidah-audio" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Upload coaching audio', 'alfawzquran' ); ?></h3>
            <p class="mt-1 text-sm text-slate-600"><?php esc_html_e( 'Share tajwid demonstrations or personalised feedback clips.', 'alfawzquran' ); ?></p>
            <form id="alfawz-qaidah-audio-form" class="mt-4 space-y-3" enctype="multipart/form-data">
                <label class="alfawz-field">
                    <span class="alfawz-field-label"><?php esc_html_e( 'Select WAV or MP3 file', 'alfawzquran' ); ?></span>
                    <input type="file" class="alfawz-input" id="alfawz-qaidah-audio-file" accept="audio/*" required>
                </label>
                <button type="submit" class="alfawz-button" id="alfawz-qaidah-audio-submit">
                    <span>⬆️</span>
                    <span><?php esc_html_e( 'Upload audio', 'alfawzquran' ); ?></span>
                </button>
                <p class="text-xs text-slate-500" id="alfawz-qaidah-audio-status"></p>
            </form>
        </section>
    <?php else : ?>
        <section class="space-y-4" aria-labelledby="alfawz-qaidah-schedule">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <h3 id="alfawz-qaidah-schedule" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Your assigned lessons', 'alfawzquran' ); ?></h3>
                <button type="button" class="alfawz-link text-sm font-semibold text-emerald-600" id="alfawz-qaidah-refresh">
                    <?php esc_html_e( 'Refresh', 'alfawzquran' ); ?>
                </button>
            </div>
            <ul id="alfawz-qaidah-student-assignments" class="space-y-3" aria-live="polite" aria-busy="true"></ul>
        </section>

        <section class="rounded-3xl bg-emerald-50/70 p-6" aria-labelledby="alfawz-qaidah-progress">
            <h3 id="alfawz-qaidah-progress" class="text-lg font-semibold text-emerald-800"><?php esc_html_e( 'Class egg challenge', 'alfawzquran' ); ?></h3>
            <p class="mt-1 text-sm text-emerald-700" id="alfawz-qaidah-progress-note"><?php esc_html_e( 'Every logged recitation nudges your class egg closer to hatching.', 'alfawzquran' ); ?></p>
            <div class="mt-4 h-2 rounded-full bg-white/60">
                <div id="alfawz-qaidah-progress-bar" class="h-2 rounded-full bg-emerald-500 transition-all" style="width:0%"></div>
            </div>
            <p class="mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-700" id="alfawz-qaidah-progress-label"></p>
        </section>
    <?php endif; ?>
</div>

<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$qaidah_role = isset( $qaidah_role ) ? $qaidah_role : 'student';
?>
<div
    id="alfawz-qaidah"
    class="alfawz-qaidah-surface mx-auto max-w-5xl space-y-8 rounded-3xl bg-white/95 p-6 shadow-xl shadow-emerald-200/70 backdrop-blur"
    data-role="<?php echo esc_attr( $qaidah_role ); ?>"
>
    <header class="space-y-1 text-slate-900">
        <h2 class="text-2xl font-semibold leading-tight">
            <?php esc_html_e( 'Qa’idah practice centre', 'alfawzquran' ); ?>
        </h2>
        <p class="text-sm text-slate-600">
            <?php esc_html_e( 'Assignments automatically adapt to your role—teachers build activities, students complete them.', 'alfawzquran' ); ?>
        </p>
    </header>

    <?php if ( 'teacher' === $qaidah_role ) : ?>
        <section class="space-y-6" aria-labelledby="alfawz-qaidah-builder">
            <div class="space-y-2">
                <h3 id="alfawz-qaidah-builder" class="text-xl font-semibold text-slate-900">
                    <?php esc_html_e( 'Create Qa’idah Assignment', 'alfawzquran' ); ?>
                </h3>
                <p class="text-sm text-slate-600">
                    <?php esc_html_e( 'Select your class, place hotspots on a Qa’idah page image, and record pronunciation prompts for each marker.', 'alfawzquran' ); ?>
                </p>
            </div>

            <form id="alfawz-qaidah-assignment-form" class="space-y-6" novalidate>
                <div class="grid gap-4 md:grid-cols-2">
                    <label class="alfawz-field">
                        <span class="alfawz-field-label"><?php esc_html_e( 'Assignment title', 'alfawzquran' ); ?></span>
                        <input type="text" id="alfawz-qaidah-title" class="alfawz-input" required placeholder="<?php esc_attr_e( 'Lesson title', 'alfawzquran' ); ?>" />
                    </label>
                    <label class="alfawz-field">
                        <span class="alfawz-field-label"><?php esc_html_e( 'Assign to class', 'alfawzquran' ); ?></span>
                        <select id="alfawz-qaidah-class" class="alfawz-input" required data-placeholder="<?php esc_attr_e( 'Select a class…', 'alfawzquran' ); ?>">
                            <option value=""><?php esc_html_e( 'Select a class…', 'alfawzquran' ); ?></option>
                        </select>
                        <p class="alfawz-field-help" id="alfawz-qaidah-class-help">
                            <?php esc_html_e( 'Classes are loaded from your teacher profile.', 'alfawzquran' ); ?>
                        </p>
                    </label>
                </div>

                <label class="alfawz-field">
                    <span class="alfawz-field-label"><?php esc_html_e( 'Description (optional)', 'alfawzquran' ); ?></span>
                    <textarea id="alfawz-qaidah-description" class="alfawz-input" rows="3" placeholder="<?php esc_attr_e( 'Add lesson notes or targets…', 'alfawzquran' ); ?>"></textarea>
                </label>

                <fieldset class="space-y-3" aria-describedby="alfawz-qaidah-student-help">
                    <legend class="text-sm font-semibold text-slate-900">
                        <?php esc_html_e( 'Filter specific students (optional)', 'alfawzquran' ); ?>
                    </legend>
                    <p id="alfawz-qaidah-student-help" class="text-xs text-slate-500">
                        <?php esc_html_e( 'Leave unselected to send the activity to the entire class.', 'alfawzquran' ); ?>
                    </p>
                    <div id="alfawz-qaidah-student-filter" class="alfawz-qaidah-student-grid"></div>
                </fieldset>

                <div class="space-y-4">
                    <div class="rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-6" id="alfawz-qaidah-image-dropzone">
                        <div class="space-y-2 text-center">
                            <p class="text-sm font-semibold text-emerald-700"><?php esc_html_e( 'Upload Qa’idah page', 'alfawzquran' ); ?></p>
                            <p class="text-xs text-emerald-600"><?php esc_html_e( 'Accepted formats: JPG or PNG. Use clear scans for best results.', 'alfawzquran' ); ?></p>
                            <button type="button" id="alfawz-qaidah-select-image" class="alfawz-button inline-flex items-center justify-center">
                                <span>🖼️</span>
                                <span><?php esc_html_e( 'Choose image', 'alfawzquran' ); ?></span>
                            </button>
                        </div>
                        <input type="hidden" id="alfawz-qaidah-image-id" />
                        <div id="alfawz-qaidah-image-preview" class="alfawz-qaidah-image-wrapper hidden" aria-live="polite">
                            <img id="alfawz-qaidah-image" src="" alt="<?php esc_attr_e( 'Uploaded Qa’idah lesson page', 'alfawzquran' ); ?>" />
                            <div id="alfawz-qaidah-hotspot-layer" class="alfawz-qaidah-hotspot-layer" role="presentation"></div>
                        </div>
                    </div>
                </div>

                <section class="space-y-3" aria-labelledby="alfawz-qaidah-hotspots-heading">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <h4 id="alfawz-qaidah-hotspots-heading" class="text-lg font-semibold text-slate-900">
                            <?php esc_html_e( 'Hotspots & audio prompts', 'alfawzquran' ); ?>
                        </h4>
                        <p class="text-xs text-slate-500">
                            <?php esc_html_e( 'Click anywhere on the image to place a hotspot marker.', 'alfawzquran' ); ?>
                        </p>
                    </div>
                    <ul id="alfawz-qaidah-hotspot-list" class="space-y-3"></ul>
                </section>

                <p id="alfawz-qaidah-status" class="text-sm font-medium text-emerald-700" role="status" aria-live="polite"></p>

                <div class="flex flex-wrap items-center gap-3">
                    <button type="submit" id="alfawz-qaidah-submit" class="alfawz-button">
                        <span>📤</span>
                        <span><?php esc_html_e( 'Send to Class', 'alfawzquran' ); ?></span>
                    </button>
                    <button type="button" id="alfawz-qaidah-reset" class="alfawz-link text-sm font-semibold text-slate-500">
                        <?php esc_html_e( 'Reset builder', 'alfawzquran' ); ?>
                    </button>
                </div>
            </form>
        </section>
    <?php else : ?>
        <section class="space-y-5" aria-labelledby="alfawz-qaidah-assignments">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <h3 id="alfawz-qaidah-assignments" class="text-xl font-semibold text-slate-900">
                    <?php esc_html_e( 'Assigned Activities', 'alfawzquran' ); ?>
                </h3>
                <button type="button" id="alfawz-qaidah-refresh" class="alfawz-link text-sm font-semibold text-emerald-600">
                    <?php esc_html_e( 'Refresh list', 'alfawzquran' ); ?>
                </button>
            </div>
            <ul id="alfawz-qaidah-assignment-list" class="space-y-4" aria-live="polite" aria-busy="true"></ul>
            <p id="alfawz-qaidah-empty" class="hidden text-sm text-slate-500">
                <?php esc_html_e( 'No assignments yet. Your teacher will share Qa’idah activities here.', 'alfawzquran' ); ?>
            </p>
        </section>
    <?php endif; ?>
</div>

<?php if ( 'student' === $qaidah_role ) : ?>
<div id="alfawz-qaidah-modal" class="alfawz-qaidah-modal hidden" role="dialog" aria-modal="true" aria-labelledby="alfawz-qaidah-modal-title">
    <div class="alfawz-qaidah-modal__content">
        <button type="button" class="alfawz-qaidah-modal__close" id="alfawz-qaidah-modal-close" aria-label="<?php esc_attr_e( 'Close activity', 'alfawzquran' ); ?>">✕</button>
        <div class="space-y-4">
            <header class="space-y-1">
                <h4 id="alfawz-qaidah-modal-title" class="text-lg font-semibold text-slate-900"></h4>
                <p id="alfawz-qaidah-modal-meta" class="text-xs text-slate-500"></p>
            </header>
            <div class="alfawz-qaidah-modal__image" id="alfawz-qaidah-modal-image-wrapper">
                <img id="alfawz-qaidah-modal-image" src="" alt="<?php esc_attr_e( 'Qa’idah activity image', 'alfawzquran' ); ?>" />
                <div id="alfawz-qaidah-modal-hotspots" class="alfawz-qaidah-hotspot-layer" role="presentation"></div>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>

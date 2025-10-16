<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div
    id="alfawz-qaidah"
    class="alfawz-qaidah-shell relative mx-auto max-w-6xl overflow-hidden rounded-[34px] bg-gradient-to-br from-[#571222] via-[#7a1a31] to-[#f4e6d8] p-[1px] shadow-2xl"
    data-role="teacher"
>
    <div class="alfawz-qaidah-surface relative z-10 space-y-10 rounded-[30px] bg-white/90 p-6 backdrop-blur md:p-10">
        <div class="qaidah-hero relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-[#faf1eb] via-white/95 to-[#fdf7f0] p-6 md:p-8 text-center shadow-lg">
            <span class="qaidah-hero-badge mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-[#7a1a31] px-5 py-2 text-sm font-semibold uppercase tracking-wider text-[#fcefe6] shadow-sm">
                <span class="inline-block h-2 w-2 rounded-full bg-[#f6d5b5] animate-ping-slow"></span>
                <?php esc_html_e( 'Qa’idah Studio', 'alfawzquran' ); ?>
            </span>
            <div class="mb-4 flex justify-center text-5xl">
                <span class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-4xl shadow-inner">📚</span>
            </div>
            <h1 class="text-3xl font-black tracking-tight text-[#571222] md:text-4xl">
                <?php esc_html_e( 'Craft and share immersive Qa’idah lessons', 'alfawzquran' ); ?>
            </h1>
            <p class="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-[#5b4b44]">
                <?php esc_html_e( 'Upload worksheets, drop engaging audio hotspots, and deliver maroon-bright lessons to every learner.', 'alfawzquran' ); ?>
            </p>
            <div class="qaidah-hero-glow" aria-hidden="true"></div>
        </div>

        <form id="alfawz-qaidah-assignment-form" class="space-y-6" novalidate>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <label for="alfawz-qaidah-class" class="mb-2 block text-sm text-[16px] font-medium text-gray-700">
                        <?php esc_html_e( 'Select Class', 'alfawzquran' ); ?>
                    </label>
                    <select
                        id="alfawz-qaidah-class"
                        class="w-full rounded-lg border border-gray-300 bg-white p-3 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                        data-placeholder="<?php esc_attr_e( 'Select a class…', 'alfawzquran' ); ?>"
                    >
                        <option value=""><?php esc_html_e( 'Select a class…', 'alfawzquran' ); ?></option>
                    </select>
                </div>
                <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <span class="mb-3 block text-sm text-[16px] font-medium text-gray-700"><?php esc_html_e( 'Send to', 'alfawzquran' ); ?></span>
                    <div class="flex flex-wrap gap-4 text-base text-gray-700">
                        <label class="inline-flex items-center gap-2">
                            <input
                                type="radio"
                                name="alfawz-qaidah-scope"
                                value="all"
                                class="h-5 w-5 rounded-full border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                checked
                            />
                            <span class="text-sm text-[16px] font-medium text-gray-700"><?php esc_html_e( 'All Students', 'alfawzquran' ); ?></span>
                        </label>
                        <label class="inline-flex items-center gap-2">
                            <input
                                type="radio"
                                name="alfawz-qaidah-scope"
                                value="selected"
                                class="h-5 w-5 rounded-full border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span class="text-sm text-[16px] font-medium text-gray-700"><?php esc_html_e( 'Selected Students', 'alfawzquran' ); ?></span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <label for="alfawz-qaidah-title" class="mb-2 block text-sm text-[16px] font-medium text-gray-700">
                        <?php esc_html_e( 'Assignment Title', 'alfawzquran' ); ?>
                    </label>
                    <input
                        type="text"
                        id="alfawz-qaidah-title"
                        class="w-full rounded-lg border border-gray-300 p-3 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                        placeholder="<?php esc_attr_e( 'Lesson title', 'alfawzquran' ); ?>"
                    />
                </div>
                <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <label for="alfawz-qaidah-description" class="mb-2 block text-sm text-[16px] font-medium text-gray-700">
                        <?php esc_html_e( 'Notes for students (optional)', 'alfawzquran' ); ?>
                    </label>
                    <textarea
                        id="alfawz-qaidah-description"
                        rows="3"
                        class="w-full rounded-lg border border-gray-300 p-3 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="<?php esc_attr_e( 'Add lesson notes or tajweed reminders…', 'alfawzquran' ); ?>"
                    ></textarea>
                </div>
            </div>

            <div
                id="alfawz-qaidah-student-section"
                class="hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
                <div class="mb-4 flex flex-col gap-1">
                    <h2 class="text-lg font-semibold text-gray-800"><?php esc_html_e( 'Select students', 'alfawzquran' ); ?></h2>
                    <p id="alfawz-qaidah-student-help" class="text-sm text-[16px] text-gray-600">
                        <?php esc_html_e( 'Choose individual learners to differentiate this activity.', 'alfawzquran' ); ?>
                    </p>
                </div>
                <div id="alfawz-qaidah-student-filter" class="grid gap-3 md:grid-cols-2"></div>
            </div>

            <div class="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">
                <div
                    id="upload-zone"
                    class="mb-6 cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-emerald-400"
                >
                    <div class="mb-3 text-5xl">🖼️</div>
                    <p class="text-base font-medium text-gray-700"><?php esc_html_e( 'Drag & drop your Qa’idah worksheet here', 'alfawzquran' ); ?></p>
                    <p class="mt-1 text-sm text-[16px] text-gray-500"><?php esc_html_e( 'PNG, JPG up to 5MB', 'alfawzquran' ); ?></p>
                    <button
                        type="button"
                        id="alfawz-qaidah-select-image"
                        class="mt-3 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                        <?php esc_html_e( 'Choose File', 'alfawzquran' ); ?>
                    </button>
                </div>
                <input type="hidden" id="alfawz-qaidah-image-id" />
                <div id="image-canvas" class="relative hidden rounded-xl border border-gray-200 bg-white">
                    <div id="alfawz-qaidah-image-preview" class="relative hidden" aria-live="polite">
                        <img
                            id="alfawz-qaidah-image"
                            src=""
                            alt="<?php esc_attr_e( 'Qa’idah Worksheet preview', 'alfawzquran' ); ?>"
                            class="w-full rounded-xl object-contain"
                        />
                        <div
                            id="alfawz-qaidah-hotspot-layer"
                            class="absolute inset-0 cursor-crosshair"
                            role="presentation"
                        ></div>
                    </div>
                </div>
            </div>

            <section class="space-y-4" aria-labelledby="alfawz-qaidah-hotspots-heading">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <h2 id="alfawz-qaidah-hotspots-heading" class="text-lg font-semibold text-gray-800">
                        <?php esc_html_e( 'Hotspot audio controls', 'alfawzquran' ); ?>
                    </h2>
                    <p class="text-sm text-[16px] text-gray-600">
                        <?php esc_html_e( 'Tap the worksheet to create hotspots, then record or upload audio.', 'alfawzquran' ); ?>
                    </p>
                </div>
                <ul id="alfawz-qaidah-hotspot-list" class="space-y-4"></ul>
            </section>

            <p
                id="alfawz-qaidah-status"
                class="text-sm text-[16px] font-semibold text-emerald-600"
                role="status"
                aria-live="polite"
            ></p>

            <button
                type="submit"
                id="alfawz-qaidah-submit"
                class="w-full rounded-xl bg-emerald-600 py-3 text-lg font-bold text-white shadow-md transition hover:scale-[1.02] hover:bg-emerald-700"
            >
                <?php esc_html_e( 'Send Assignment to Class', 'alfawzquran' ); ?>
            </button>
            <button
                type="button"
                id="alfawz-qaidah-reset"
                class="w-full rounded-xl border border-transparent bg-transparent py-3 text-base font-semibold text-amber-600 transition hover:text-amber-700"
            >
                <?php esc_html_e( 'Reset Builder', 'alfawzquran' ); ?>
            </button>
        </form>
    </div>
</div>

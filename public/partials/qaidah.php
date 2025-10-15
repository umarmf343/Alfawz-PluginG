<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div
    id="alfawz-qaidah"
    class="alfawz-qaidah-shell relative mx-auto max-w-6xl overflow-hidden rounded-[34px] bg-gradient-to-br from-[#571222] via-[#7a1a31] to-[#f4e6d8] p-[1px] shadow-2xl"
    data-role="student"
>
    <div class="alfawz-qaidah-surface relative z-10 space-y-10 rounded-[30px] bg-white/90 p-6 backdrop-blur md:p-10">
        <div class="qaidah-hero relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-[#faf1eb] via-white/95 to-[#fdf7f0] p-8 text-center shadow-lg">
            <span class="qaidah-hero-badge mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-[#7a1a31] px-5 py-2 text-sm font-semibold uppercase tracking-wider text-[#fcefe6] shadow-sm">
                <span class="inline-block h-2 w-2 rounded-full bg-[#f6d5b5] animate-ping-slow"></span>
                <?php esc_html_e( 'Qa’idah Studio', 'alfawzquran' ); ?>
            </span>
            <div class="mb-4 flex justify-center text-5xl">
                <span class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-4xl shadow-inner">📚</span>
            </div>
            <h1 class="text-3xl font-black tracking-tight text-[#571222] md:text-4xl">
                <?php esc_html_e( 'Your Qa’idah hub – lessons handpicked by your teacher', 'alfawzquran' ); ?>
            </h1>
            <p class="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-[#5b4b44]">
                <?php esc_html_e( 'Tap into warm maroon vibes, explore each activity, and listen back to audio hotspots as you master every rule.', 'alfawzquran' ); ?>
            </p>
            <div class="qaidah-hero-glow" aria-hidden="true"></div>
        </div>

        <section class="space-y-6" aria-labelledby="alfawz-qaidah-assignments">
            <div class="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white/80 p-4 shadow-sm ring-1 ring-white/60">
                <div>
                    <h2 id="alfawz-qaidah-assignments" class="text-2xl font-extrabold text-[#571222]">
                        <?php esc_html_e( 'Your Qa’idah lessons', 'alfawzquran' ); ?>
                    </h2>
                    <p class="mt-1 text-sm text-[16px] font-medium text-[#7b6459]">
                        <?php esc_html_e( 'Select a card to open its glowing hotspots and replay your teacher’s guidance.', 'alfawzquran' ); ?>
                    </p>
                </div>
                <button
                    type="button"
                    id="alfawz-qaidah-refresh"
                    class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7a1a31] to-[#a43246] px-5 py-2 text-sm font-semibold text-[#fdeee2] shadow-md transition hover:from-[#8d243d] hover:to-[#bc3c4e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7a1a31]"
                >
                    <span class="text-lg">⟳</span>
                    <span><?php esc_html_e( 'Refresh list', 'alfawzquran' ); ?></span>
                </button>
            </div>
            <ul id="alfawz-qaidah-assignment-list" class="grid gap-5 md:grid-cols-2" aria-live="polite" aria-busy="true"></ul>
            <p id="alfawz-qaidah-empty" class="hidden rounded-[24px] bg-white/70 p-5 text-base font-medium text-[#7b6459] shadow-inner">
                <?php esc_html_e( 'No assignments yet. Your teacher will share Qa’idah activities here.', 'alfawzquran' ); ?>
            </p>
        </section>
    </div>
</div>

<div id="alfawz-qaidah-modal" class="alfawz-qaidah-modal hidden" role="dialog" aria-modal="true" aria-labelledby="alfawz-qaidah-modal-title">
    <div class="alfawz-qaidah-modal__content">
        <button type="button" class="alfawz-qaidah-modal__close" id="alfawz-qaidah-modal-close" aria-label="<?php esc_attr_e( 'Close activity', 'alfawzquran' ); ?>">✕</button>
        <div class="space-y-4">
            <header class="space-y-1">
                <h4 id="alfawz-qaidah-modal-title" class="text-lg font-semibold text-gray-800"></h4>
                <p id="alfawz-qaidah-modal-meta" class="text-sm text-[16px] text-gray-500"></p>
            </header>
            <div class="alfawz-qaidah-modal__image" id="alfawz-qaidah-modal-image-wrapper">
                <img id="alfawz-qaidah-modal-image" src="" alt="<?php esc_attr_e( 'Qa’idah activity image', 'alfawzquran' ); ?>" />
                <div id="alfawz-qaidah-modal-hotspots" class="alfawz-qaidah-hotspot-layer" role="presentation"></div>
            </div>
            <div
                id="alfawz-qaidah-audio-status"
                class="hidden text-center text-sm text-[16px] font-medium text-emerald-600"
            >
                🔊 <?php esc_html_e( 'Playing... Tap hotspot again to replay', 'alfawzquran' ); ?>
            </div>
        </div>
    </div>
</div>

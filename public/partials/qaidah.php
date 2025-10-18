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
    <div class="qaidah-color-trails" aria-hidden="true">
        <span class="qaidah-color-trail qaidah-color-trail--rose"></span>
        <span class="qaidah-color-trail qaidah-color-trail--amber"></span>
        <span class="qaidah-color-trail qaidah-color-trail--teal"></span>
    </div>

    <div class="alfawz-qaidah-surface relative z-10 space-y-10 rounded-[30px] bg-white/90 p-6 backdrop-blur md:p-10">
        <div class="text-center">
            <span class="qaidah-hero-badge mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-[#7a1a31] px-5 py-2 text-sm font-semibold uppercase tracking-wider text-[#fcefe6] shadow-sm">
                <span class="inline-block h-2 w-2 rounded-full bg-[#f6d5b5] animate-ping-slow"></span>
                <?php esc_html_e( 'Qa’idah Studio', 'alfawzquran' ); ?>
            </span>
            <div class="qaidah-hero-palette" aria-hidden="true">
                <span class="qaidah-hero-palette__swatch qaidah-hero-palette__swatch--sunrise"></span>
                <span class="qaidah-hero-palette__swatch qaidah-hero-palette__swatch--peach"></span>
                <span class="qaidah-hero-palette__swatch qaidah-hero-palette__swatch--mint"></span>
            </div>
            <div class="mb-4 flex justify-center text-5xl">
                <span class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-4xl shadow-inner">📚</span>
            </div>
            <h1 class="text-3xl font-black tracking-tight text-[#571222] md:text-4xl">
                <?php esc_html_e( 'Your Qa’idah hub – lessons handpicked by your teacher', 'alfawzquran' ); ?>
            </h1>
            <p class="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-[#5b3f4a]">
                <?php esc_html_e( 'Tap into warm maroon vibes, explore each activity, and listen back to audio hotspots as you master every rule.', 'alfawzquran' ); ?>
            </p>
        </div>

        <section class="grid gap-6 md:grid-cols-3" aria-label="<?php esc_attr_e( 'Qa’idah learning highlights', 'alfawzquran' ); ?>">
            <article class="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-rose-200 via-fuchsia-200 to-sky-200 p-8 text-slate-900 shadow-xl">
                <div class="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/40 blur-3xl"></div>
                <div class="pointer-events-none absolute -bottom-14 -left-14 h-48 w-48 rounded-full bg-pink-300/40 blur-3xl"></div>
                <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.45),_transparent_60%)]"></div>
                <div class="relative flex flex-col gap-5">
                    <span class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-4xl shadow-lg">🎧</span>
                    <h3 class="text-4xl font-semibold leading-tight">
                        <?php esc_html_e( 'Listen & repeat', 'alfawzquran' ); ?>
                    </h3>
                    <p class="text-2xl leading-relaxed text-slate-700">
                        <?php esc_html_e( 'Follow the glowing markers and echo your teacher’s voice for crisp articulation.', 'alfawzquran' ); ?>
                    </p>
                </div>
            </article>
            <article class="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#7a1a31] via-[#9f3a4a] to-[#f9e8df] p-8 text-white shadow-xl">
                <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.28),_transparent_68%)]"></div>
                <div class="pointer-events-none absolute -bottom-16 -right-20 h-48 w-48 rounded-full bg-[#fbeee4]/60 blur-3xl"></div>
                <div class="relative flex flex-col gap-5">
                    <span class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/35 text-4xl text-[#7a1a31] shadow-lg">🌟</span>
                    <h3 class="text-4xl font-semibold leading-tight text-[#fdf3ea]">
                        <?php esc_html_e( 'Track your glow', 'alfawzquran' ); ?>
                    </h3>
                    <p class="text-2xl leading-relaxed text-[#fef9f5]">
                        <?php esc_html_e( 'Spot completed lessons instantly—finished cards shimmer so you know where to focus next.', 'alfawzquran' ); ?>
                    </p>
                </div>
            </article>
            <article class="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 p-8 text-stone-900 shadow-xl">
                <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(255,255,255,0.35),_transparent_60%)]"></div>
                <div class="pointer-events-none absolute -top-12 -left-16 h-40 w-40 rounded-full bg-amber-100/60 blur-3xl"></div>
                <div class="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-rose-300/40 blur-3xl"></div>
                <div class="relative flex flex-col gap-5">
                    <span class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-4xl shadow-lg">🎉</span>
                    <h3 class="text-4xl font-semibold leading-tight">
                        <?php esc_html_e( 'Celebrate mastery', 'alfawzquran' ); ?>
                    </h3>
                    <p class="text-2xl leading-relaxed text-stone-700">
                        <?php esc_html_e( 'Earn vibrant badges as you complete sets and share wins with classmates and family.', 'alfawzquran' ); ?>
                    </p>
                </div>
            </article>
        </section>

        <section class="space-y-6" aria-labelledby="alfawz-qaidah-assignments">
            <div class="flex flex-wrap items-center justify-between gap-3 rounded-[26px] border border-white/70 bg-gradient-to-r from-[#fef3f2]/90 via-white/85 to-[#ecfdf3]/90 p-5 shadow-xl ring-1 ring-white/70 backdrop-blur">
                <div class="flex items-start gap-3">
                    <span class="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f59e0b]/20 text-2xl text-[#7a1a31] shadow-inner">🪄</span>
                    <div>
                        <h2 id="alfawz-qaidah-assignments" class="text-2xl font-extrabold text-[#571222]">
                        <?php esc_html_e( 'Your Qa’idah lessons', 'alfawzquran' ); ?>
                        </h2>
                        <p class="mt-1 text-sm text-[16px] font-medium text-[#6d4b45]">
                            <?php esc_html_e( 'Select a card to open its glowing hotspots and replay your teacher’s guidance.', 'alfawzquran' ); ?>
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    id="alfawz-qaidah-refresh"
                    class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7a1a31] via-[#c026d3] to-[#0ea5e9] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7a1a31]"
                >
                    <span class="text-lg">⟳</span>
                    <span><?php esc_html_e( 'Refresh list', 'alfawzquran' ); ?></span>
                </button>
            </div>
            <ul id="alfawz-qaidah-assignment-list" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-live="polite" aria-busy="true"></ul>
            <p id="alfawz-qaidah-empty" class="hidden items-center gap-3 rounded-[28px] border border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-white/90 to-emerald-100/90 p-6 text-base font-semibold text-[#1d4e3e] shadow-inner">
                <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200/60 text-lg text-emerald-800">✨</span>
                <span><?php esc_html_e( 'No assignments yet. Your teacher will share Qa’idah activities here.', 'alfawzquran' ); ?></span>
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

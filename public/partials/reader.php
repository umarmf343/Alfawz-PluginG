<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-reader" class="alfawz-reader-shell relative min-h-screen overflow-hidden bg-gradient-to-br from-[#2e0a11] via-[#6b0f1a] to-[#fcefe3] px-4 pb-20 pt-12 sm:px-6 lg:px-8">
    <div class="pointer-events-none absolute inset-0 -z-10 opacity-80">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(253,234,219,0.75),rgba(107,15,26,0.6))]"></div>
    </div>
    <div class="mx-auto flex max-w-5xl flex-col gap-10">
        <div class="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 shadow-[0_28px_90px_rgba(30,5,10,0.45)] backdrop-blur-2xl">
            <div class="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-[#fcefe3]/70 via-[#f6d3bc]/60 to-transparent blur-3xl"></div>
            <div class="relative flex flex-col gap-6 text-[#fdf6f0]">
                <span class="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-[#fdeee1]">
                    <?php esc_html_e( 'Student • Quran Reader', 'alfawzquran' ); ?>
                </span>
                <h1 class="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                    <?php esc_html_e( 'Immerse in the Qur’an with clarity, colour, and calm.', 'alfawzquran' ); ?>
                </h1>
                <p class="max-w-3xl text-base text-white/80 sm:text-lg">
                    <?php esc_html_e( 'Choose your surah, glide between verses, and listen to recitations instantly. Our maroon-and-milk palette keeps every session warm, focused, and inspiring.', 'alfawzquran' ); ?>
                </p>
            </div>
        </div>

        <div class="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-[0_32px_100px_rgba(20,4,8,0.55)] backdrop-blur-2xl">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_60%),linear-gradient(145deg,rgba(255,255,255,0.12),rgba(108,15,26,0.12))]"></div>
            <div class="relative p-6 sm:p-10">
                <div id="alfawz-confetti-host" class="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true"></div>

                <div id="alfawz-verse-loader" class="alfawz-verse-loader rounded-2xl border border-dashed border-white/30 bg-white/30 px-6 py-16 text-center text-base font-medium text-[#4a0a14] shadow-inner">
                    <?php esc_html_e( 'Select a surah and verse to begin your recitation.', 'alfawzquran' ); ?>
                </div>

                <article id="alfawz-verse-container" class="alfawz-verse-card relative hidden rounded-3xl bg-gradient-to-br from-white/95 via-[#fff7f0]/95 to-white/90 p-6 shadow-[0_25px_80px_rgba(108,15,26,0.18)] ring-1 ring-white/50 sm:p-10" aria-labelledby="alfawz-verse-heading">
                    <div id="alfawz-egg-widget" class="alfawz-egg-widget mx-auto mb-8 flex w-full max-w-2xl flex-col gap-3 rounded-2xl bg-gradient-to-r from-[#fef7ee] via-[#fbe0cc] to-[#f7c0a6] p-5 text-center shadow-inner ring-1 ring-white/50" aria-live="polite">
                        <div class="flex items-center justify-center gap-3">
                            <div id="alfawz-egg-emoji" class="text-4xl" role="img" aria-label="<?php esc_attr_e( 'Egg progress', 'alfawzquran' ); ?>">🥚</div>
                            <div class="text-left">
                                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b1d2b]">
                                    <?php esc_html_e( 'Daily hatch challenge', 'alfawzquran' ); ?>
                                </p>
                                <p id="alfawz-egg-count" class="text-sm font-semibold text-[#6b0f1a]">0 / 0</p>
                            </div>
                        </div>
                        <div class="w-full overflow-hidden rounded-full bg-white/70">
                            <div id="alfawz-egg-progress-bar" class="h-2 rounded-full bg-gradient-to-r from-[#f6b89f] to-[#6b0f1a] transition-all duration-500 ease-out" style="width:0%"></div>
                        </div>
                        <p id="alfawz-egg-message" class="text-xs text-[#6b0f1a]">
                            <?php esc_html_e( 'Keep reading to hatch the surprise.', 'alfawzquran' ); ?>
                        </p>
                    </div>

                    <button type="button" id="alfawz-prev-verse" class="alfawz-verse-nav absolute left-4 top-1/2 flex h-14 w-14 -translate-y-1/2 transform items-center justify-center rounded-full bg-white/70 text-2xl text-[#6b0f1a] shadow-lg transition hover:scale-110 hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/80" aria-label="<?php esc_attr_e( 'Previous verse', 'alfawzquran' ); ?>" disabled>◁</button>
                    <button type="button" id="alfawz-next-verse" class="alfawz-verse-nav absolute right-4 top-1/2 flex h-14 w-14 -translate-y-1/2 transform items-center justify-center rounded-full bg-white/70 text-2xl text-[#6b0f1a] shadow-lg transition hover:scale-110 hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/80" aria-label="<?php esc_attr_e( 'Next verse', 'alfawzquran' ); ?>" disabled>▷</button>

                    <header class="space-y-3 text-center">
                        <p id="alfawz-verse-meta" class="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b1d2b]/80"></p>
                        <h3 id="alfawz-verse-heading" class="text-3xl font-semibold text-[#36060d] sm:text-4xl"></h3>
                    </header>

                    <div id="alfawz-verse-content" class="alfawz-verse-panel mt-8 rounded-3xl bg-white/80 px-6 py-8 text-center shadow-inner">
                        <p id="alfawz-arabic-text" class="font-arabic text-4xl leading-relaxed text-[#2f0a11] sm:text-5xl" dir="rtl" lang="ar"></p>
                        <p id="alfawz-transliteration" class="mt-4 text-lg font-medium text-[#6b0f1a]/80"></p>
                        <p id="alfawz-translation" class="mt-2 text-base italic text-[#4a0a14]/80"></p>
                    </div>

                    <div class="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div class="flex flex-1 flex-col gap-3">
                            <button type="button" id="alfawz-verse-audio" class="alfawz-audio-button inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#6b0f1a] via-[#8c1f29] to-[#b23b45] px-6 py-3 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#6b0f1a]/30 disabled:cursor-not-allowed disabled:opacity-70" disabled>
                                <span id="alfawz-verse-audio-icon" class="text-base" aria-hidden="true">▶</span>
                                <span id="alfawz-verse-audio-label" class="text-sm sm:text-base"><?php esc_html_e( 'Verse audio', 'alfawzquran' ); ?></span>
                            </button>
                            <div class="flex flex-col gap-1">
                                <div class="h-2 w-full overflow-hidden rounded-full bg-white/40">
                                    <div id="alfawz-audio-progress" class="h-full w-0 rounded-full bg-gradient-to-r from-[#fcd8c4] via-[#f5b8a5] to-[#6b0f1a] transition-all duration-300 ease-out"></div>
                                </div>
                                <div class="flex items-center justify-between text-xs font-semibold text-[#6b0f1a]/80">
                                    <span id="alfawz-audio-elapsed">0:00</span>
                                    <span id="alfawz-audio-duration">0:00</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl bg-white/80 px-4 py-4 text-center shadow-inner ring-1 ring-white/50 sm:flex-row sm:justify-between">
                            <div class="text-sm font-medium text-[#6b0f1a] sm:text-base"><?php esc_html_e( 'Full Surah View', 'alfawzquran' ); ?></div>
                            <button type="button" id="alfawz-full-surah-toggle" role="switch" aria-checked="false" class="alfawz-toggle relative h-7 w-16 rounded-full bg-[#f2dcd2] transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]/40">
                                <span class="alfawz-toggle-thumb absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ease-out"></span>
                            </button>
                            <span id="alfawz-full-surah-label" class="text-sm font-semibold uppercase tracking-[0.2em] text-[#6b0f1a]">Off</span>
                        </div>
                    </div>

                    <div id="alfawz-surah-full" class="mt-10 hidden">
                        <div id="alfawz-surah-full-loader" class="rounded-2xl border border-dashed border-[#6b0f1a]/30 bg-white/80 px-5 py-6 text-center text-sm font-semibold text-[#6b0f1a] shadow-inner">
                            <?php esc_html_e( 'Select a surah to view all verses.', 'alfawzquran' ); ?>
                        </div>
                        <div id="alfawz-surah-full-list" class="alfawz-surah-list mt-6 grid gap-4"></div>
                    </div>

                    <section class="mt-10 text-center" aria-live="polite">
                        <div class="mx-auto w-full max-w-xl overflow-hidden rounded-full bg-white/50">
                            <div id="alfawz-daily-progress-bar" class="h-2 rounded-full bg-gradient-to-r from-[#f5c4b0] to-[#6b0f1a] transition-all duration-500 ease-out" style="width:0%"></div>
                        </div>
                        <span id="alfawz-daily-label" class="mt-2 block text-xs font-semibold uppercase tracking-[0.3em] text-[#6b0f1a]">0 / 10 Verses Today</span>
                        <p id="alfawz-daily-note" class="mt-1 text-xs text-[#4a0a14]/80"></p>
                    </section>
                </article>
            </div>
        </div>

        <div class="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-[0_22px_60px_rgba(49,10,18,0.25)] backdrop-blur-xl sm:p-8" aria-labelledby="alfawz-reader-label">
            <h2 id="alfawz-reader-label" class="text-xs font-semibold uppercase tracking-[0.4em] text-[#6b0f1a]">
                <?php esc_html_e( 'Select a surah and ayah', 'alfawzquran' ); ?>
            </h2>
            <div class="mt-6 grid gap-5 sm:grid-cols-2">
                <label class="flex flex-col gap-2">
                    <span class="text-sm font-semibold text-[#36060d] sm:text-base"><?php esc_html_e( 'Surah', 'alfawzquran' ); ?></span>
                    <select id="alfawz-surah-select" class="w-full rounded-2xl border border-[#6b0f1a]/15 bg-white/90 px-4 py-3 text-base text-[#36060d] shadow-inner focus:border-[#6b0f1a] focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]/40">
                        <option value=""><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></option>
                    </select>
                </label>
                <label class="flex flex-col gap-2">
                    <span class="text-sm font-semibold text-[#36060d] sm:text-base"><?php esc_html_e( 'Verse', 'alfawzquran' ); ?></span>
                    <select id="alfawz-verse-select" class="w-full rounded-2xl border border-[#6b0f1a]/15 bg-white/90 px-4 py-3 text-base text-[#36060d] shadow-inner focus:border-[#6b0f1a] focus:outline-none focus:ring-2 focus:ring-[#6b0f1a]/40" disabled>
                        <option value=""><?php esc_html_e( 'Select a surah first', 'alfawzquran' ); ?></option>
                    </select>
                </label>
            </div>
        </div>
    </div>

    <div id="alfawz-daily-modal" class="alfawz-daily-modal fixed inset-0 z-50 hidden items-end justify-center px-4 pb-8 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="alfawz-daily-modal-title" aria-describedby="alfawz-daily-modal-message">
        <div class="alfawz-daily-modal__backdrop absolute inset-0 bg-[#200509]/80" data-dismiss-daily></div>
        <div class="alfawz-daily-modal__card relative z-10 w-full max-w-md translate-y-6 rounded-3xl bg-white px-8 py-10 text-center shadow-[0_28px_80px_rgba(44,8,14,0.45)] transition sm:translate-y-0">
            <div class="alfawz-daily-modal__confetti pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <h3 id="alfawz-daily-modal-title" class="text-3xl font-semibold text-[#36060d]">
                <?php esc_html_e( 'MashaAllah! Goal achieved', 'alfawzquran' ); ?>
            </h3>
            <p id="alfawz-daily-modal-message" class="mt-4 text-base text-[#4a0a14]">
                <?php esc_html_e( 'You reached today\'s 10-verse milestone. Keep the momentum going!', 'alfawzquran' ); ?>
            </p>
            <button type="button" class="mt-6 inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#6b0f1a] via-[#8c1f29] to-[#b23b45] px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/60" data-dismiss-daily>
                <span>🎉</span>
                <span><?php esc_html_e( 'Continue reading', 'alfawzquran' ); ?></span>
            </button>
        </div>
    </div>
</div>

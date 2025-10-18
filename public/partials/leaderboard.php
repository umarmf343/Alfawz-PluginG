<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-leaderboard" class="alfawz-reader-shell alfawz-no-scrollbar px-4 pt-8 sm:px-6">
    <div class="alfawz-leaderboard-surface relative space-y-12 p-6 pb-16 sm:p-10 lg:p-12">
        <header class="alfawz-leaderboard-hero relative overflow-hidden">
            <div class="relative flex flex-col gap-8 px-8 py-10 sm:px-10 sm:py-12 lg:flex-row lg:items-end lg:justify-between">
                <div class="space-y-5 text-white">
                    <p class="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                        <?php esc_html_e( 'Students leaderboard', 'alfawzquran' ); ?>
                    </p>
                    <h1 class="text-3xl font-semibold leading-tight text-[#fffdf6] sm:text-4xl lg:text-5xl">
                        <?php esc_html_e( 'Where dedication meets celebration', 'alfawzquran' ); ?>
                    </h1>
                    <p class="max-w-2xl text-base text-white/80 sm:text-lg">
                        <?php esc_html_e( 'Watch classmates climb the ranks in real time with standings that refresh straight from the Alfawz REST endpoint.', 'alfawzquran' ); ?>
                    </p>
                </div>
                <div class="flex flex-col items-stretch gap-5 text-white lg:w-72">
                    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div class="rounded-3xl bg-white/10 p-5 text-center shadow-lg backdrop-blur">
                            <p class="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/75">
                                <?php esc_html_e( 'Active reciters', 'alfawzquran' ); ?>
                            </p>
                            <p id="alfawz-leaderboard-total" class="mt-2 text-[5.625rem] font-semibold sm:text-[6.75rem]">0</p>
                        </div>
                        <div class="rounded-3xl bg-white/10 p-5 text-center shadow-lg backdrop-blur">
                            <p class="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/75">
                                <?php esc_html_e( 'Leading verses', 'alfawzquran' ); ?>
                            </p>
                            <p id="alfawz-leaderboard-verses" class="mt-2 text-[5.625rem] font-semibold sm:text-[6.75rem]">0</p>
                        </div>
                        <div class="col-span-2 rounded-3xl bg-white/10 p-5 text-center shadow-lg backdrop-blur sm:col-span-1">
                            <p class="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/75">
                                <?php esc_html_e( 'Top hasanat', 'alfawzquran' ); ?>
                            </p>
                            <p id="alfawz-leaderboard-hasanat" class="mt-2 text-[5.625rem] font-semibold sm:text-[6.75rem]">0</p>
                        </div>
                    </div>
                    <button id="alfawz-leaderboard-refresh" type="button" class="group inline-flex items-center justify-center gap-3 rounded-full border border-white/40 bg-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#741f31]" aria-live="polite">
                        <span class="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20 shadow-inner">
                            <svg data-refresh-icon class="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                <path d="M3.5 10a6.5 6.5 0 0 1 11.07-4.6l1.18-1.17a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.28-.53V4.75A.75.75 0 0 1 14.25 4a8 8 0 1 0 1.94 6.53.75.75 0 0 1 1.48.22A9.5 9.5 0 1 1 3.5 10Z" fill="currentColor" />
                            </svg>
                            <svg data-refresh-spinner class="hidden h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v2.5A5.5 5.5 0 0 0 6.5 12H4Z"></path>
                            </svg>
                        </span>
                        <span class="text-white"><?php esc_html_e( 'Refresh standings', 'alfawzquran' ); ?></span>
                    </button>
                    <p id="alfawz-leaderboard-updated" class="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/70" aria-live="polite">
                        <?php esc_html_e( 'Updating…', 'alfawzquran' ); ?>
                    </p>
                </div>
            </div>
        </header>
        <section class="space-y-6" aria-labelledby="alfawz-leaderboard-podium-heading">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[#d26c86]/70">
                        <?php esc_html_e( 'Top reciters', 'alfawzquran' ); ?>
                    </p>
                    <h2 id="alfawz-leaderboard-podium-heading" class="text-2xl font-semibold text-[#8e2f46] sm:text-3xl">
                        <?php esc_html_e( 'Weekly podium', 'alfawzquran' ); ?>
                    </h2>
                </div>
                <p class="max-w-lg text-sm text-[#b14f6a]/70">
                    <?php esc_html_e( 'Highlighting the top three students based on verses recited this week. Encourage them with a shoutout or catch up with extra practice time.', 'alfawzquran' ); ?>
                </p>
            </div>
            <div data-leaderboard-podium-wrapper class="relative">
                <div id="alfawz-leaderboard-podium" class="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-live="polite" aria-busy="true"></div>
            </div>
        </section>
        <section class="space-y-6" aria-labelledby="alfawz-leaderboard-standings">
            <div class="flex flex-col gap-6 rounded-[2.2rem] border border-[#f4d3c4]/70 bg-gradient-to-br from-white/95 via-[#fff4e6]/92 to-[#ffe7d6]/88 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-8">
                <div class="space-y-2 max-w-2xl">
                    <p class="inline-flex items-center gap-2 rounded-full bg-[#fbe4d6]/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#d26c86]/80 shadow-inner">
                        <span class="h-2 w-2 rounded-full bg-[#a83254]" aria-hidden="true"></span>
                        <?php esc_html_e( 'Leaderboard insights', 'alfawzquran' ); ?>
                    </p>
                    <h3 id="alfawz-leaderboard-standings" class="text-2xl font-semibold text-[#8e2f46] sm:text-3xl">
                        <?php esc_html_e( 'Full standings', 'alfawzquran' ); ?>
                    </h3>
                    <p class="text-sm leading-relaxed text-[#b14f6a]/75">
                        <?php esc_html_e( 'Track progress for every participant and celebrate milestones together. Percentages compare each reciter to the current leader.', 'alfawzquran' ); ?>
                    </p>
                </div>
                <dl class="grid w-full max-w-md grid-cols-1 gap-3 text-sm text-[#b14f6a]/80 sm:max-w-none sm:grid-cols-3">
                    <div class="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/70 px-5 py-4 shadow-[0_20px_40px_rgba(47,8,17,0.08)]">
                        <div class="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-[#f6d8c9]/80 blur-xl transition-all duration-500 group-hover:scale-125" aria-hidden="true"></div>
                        <dt class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#d26c86]/70"><?php esc_html_e( 'Momentum', 'alfawzquran' ); ?></dt>
                        <dd class="mt-2 text-base font-semibold text-[#8e2f46]">
                            <?php esc_html_e( 'Live updates', 'alfawzquran' ); ?>
                        </dd>
                    </div>
                    <div class="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/70 px-5 py-4 shadow-[0_20px_40px_rgba(47,8,17,0.08)]">
                        <div class="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-[#fbe4d6]/80 blur-xl transition-all duration-500 group-hover:scale-125" aria-hidden="true"></div>
                        <dt class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#d26c86]/70"><?php esc_html_e( 'Recognition', 'alfawzquran' ); ?></dt>
                        <dd class="mt-2 text-base font-semibold text-[#8e2f46]">
                            <?php esc_html_e( 'Celebrate wins', 'alfawzquran' ); ?>
                        </dd>
                    </div>
                    <div class="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/70 px-5 py-4 shadow-[0_20px_40px_rgba(47,8,17,0.08)]">
                        <div class="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-[#ffe7d6]/80 blur-xl transition-all duration-500 group-hover:scale-125" aria-hidden="true"></div>
                        <dt class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#d26c86]/70"><?php esc_html_e( 'Community', 'alfawzquran' ); ?></dt>
                        <dd class="mt-2 text-base font-semibold text-[#8e2f46]">
                            <?php esc_html_e( 'Encourage du’a', 'alfawzquran' ); ?>
                        </dd>
                    </div>
                </dl>
            </div>
            <div class="relative overflow-hidden rounded-[2.4rem] border border-[#f5d0c5]/70 bg-white/90 shadow-[0_30px_70px_rgba(47,8,17,0.14)]">
                <div class="pointer-events-none absolute -top-24 -right-10 h-52 w-52 rounded-full bg-[#ffe7d6]/80 blur-3xl" aria-hidden="true"></div>
                <div class="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#f6d8c9]/75 blur-3xl" aria-hidden="true"></div>
                <div class="relative overflow-x-auto">
                    <table class="min-w-full border-separate border-spacing-y-1 text-left">
                        <thead class="bg-[#fff4e6]/90 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#d26c86]/80">
                            <tr>
                                <th scope="col" class="px-6 py-4"><?php esc_html_e( 'Rank', 'alfawzquran' ); ?></th>
                                <th scope="col" class="px-6 py-4"><?php esc_html_e( 'Reciter', 'alfawzquran' ); ?></th>
                                <th scope="col" class="px-6 py-4 text-right"><?php esc_html_e( 'Verses read', 'alfawzquran' ); ?></th>
                                <th scope="col" class="px-6 py-4 text-right"><?php esc_html_e( 'Hasanat', 'alfawzquran' ); ?></th>
                            </tr>
                        </thead>
                        <tbody id="alfawz-leaderboard-body" class="align-middle text-base text-[#b14f6a]" aria-live="polite" aria-busy="true"></tbody>
                    </table>
                </div>
                <div id="alfawz-leaderboard-empty" class="relative hidden px-6 py-10 text-center text-base font-medium text-[#d26c86]">
                    <?php esc_html_e( 'No reciters have logged progress yet. Encourage your students to submit their first verses!', 'alfawzquran' ); ?>
                </div>
            </div>
        </section>
        <section class="rounded-[2.4rem] border border-[#f5d0c5]/80 bg-gradient-to-br from-white/95 via-[#fff4e6]/90 to-[#ffe7d6]/85 p-8 sm:p-10" aria-labelledby="alfawz-leaderboard-callout">
            <div class="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                <div class="space-y-4 text-[#b14f6a]">
                    <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[#d26c86]/70">
                        <?php esc_html_e( 'Keep the momentum', 'alfawzquran' ); ?>
                    </p>
                    <h3 id="alfawz-leaderboard-callout" class="text-2xl font-semibold text-[#8e2f46] sm:text-3xl">
                        <?php esc_html_e( 'How ranking works', 'alfawzquran' ); ?>
                    </h3>
                    <ul class="space-y-3 text-base leading-relaxed">
                        <li class="flex gap-3">
                            <span class="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#a83254]" aria-hidden="true"></span>
                            <span><?php esc_html_e( 'Positions update instantly based on the verses students log through the Alfawz reader shortcode.', 'alfawzquran' ); ?></span>
                        </li>
                        <li class="flex gap-3">
                            <span class="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#f59f82]" aria-hidden="true"></span>
                            <span><?php esc_html_e( 'Hasanat totals reflect your configured reward per letter, keeping spiritual impact front and center.', 'alfawzquran' ); ?></span>
                        </li>
                        <li class="flex gap-3">
                            <span class="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#ffcf99]" aria-hidden="true"></span>
                            <span><?php esc_html_e( 'Teachers can spotlight weekly improvements and motivate the class with gentle competition and du\'a.', 'alfawzquran' ); ?></span>
                        </li>
                    </ul>
                </div>
                <div class="relative overflow-hidden rounded-[2rem] bg-[#741f31] p-8 text-[#fff7ee] shadow-[0_30px_60px_rgba(47,8,17,0.28)]">
                    <div class="absolute -top-24 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
                    <div class="relative space-y-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[#ffe7d6]/70">
                            <?php esc_html_e( 'Pro tip', 'alfawzquran' ); ?>
                        </p>
                        <p class="text-lg font-semibold leading-relaxed sm:text-xl">
                            <?php esc_html_e( 'Celebrate small wins in morning assembly to boost enthusiasm and sustain beautiful Quran habits.', 'alfawzquran' ); ?>
                        </p>
                        <p class="text-sm text-[#ffe7d6]/80">
                            <?php esc_html_e( 'Share this leaderboard on your class dashboard or messaging group so everyone can cheer each other on.', 'alfawzquran' ); ?>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>

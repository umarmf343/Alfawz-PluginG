<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$qaidah_page_link = isset( $qaidah_page_link ) ? $qaidah_page_link : '';
$qaidah_markup    = '';

ob_start();
include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/qaidah-builder.php';
$qaidah_markup = ob_get_clean();
?>
<div class="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,_#800000_0%,_#a52a2a_40%,_#fdf6f0_100%)] py-16 text-[#333333]">
    <div class="alfawz-teacher-orb pointer-events-none" aria-hidden="true"></div>
    <div class="alfawz-teacher-orb alfawz-teacher-orb--secondary pointer-events-none" aria-hidden="true"></div>
    <div class="alfawz-teacher-trail pointer-events-none" aria-hidden="true"></div>

    <div id="alfawz-teacher-dashboard" class="relative z-10 mx-auto max-w-6xl space-y-12 px-4 font-sans sm:px-6 lg:px-0">
        <section class="alfawz-teacher-card grid gap-10 rounded-3xl border border-white/40 bg-white/85 p-8 shadow-2xl shadow-[#800000]/15 backdrop-blur" data-alfawz-animate>
            <div class="flex flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:gap-12" data-alfawz-animate data-alfawz-delay="0.05">
                <div class="w-full space-y-5 text-center lg:w-1/2 lg:space-y-6 lg:text-left">
                    <span class="inline-flex items-center justify-center rounded-full border border-[#800000]/20 bg-gradient-to-r from-[#800000]/15 via-[#a52a2a]/10 to-[#fdf6f0]/70 px-5 py-1.5 text-sm font-semibold uppercase tracking-[0.28em] text-[#800000]">
                        <?php esc_html_e( 'Teacher hub', 'alfawzquran' ); ?>
                    </span>
                    <h1 class="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-[#333333] sm:text-5xl lg:text-6xl">
                        <?php esc_html_e( 'Inspire every learner with purposeful Qa’idah journeys.', 'alfawzquran' ); ?>
                    </h1>
                    <p class="mx-auto max-w-2xl text-lg leading-relaxed text-[#4f1d1d] sm:text-xl">
                        <?php esc_html_e( 'Craft Qa’idah lessons, review classroom momentum, and celebrate student milestones—all from your personalised teaching studio.', 'alfawzquran' ); ?>
                    </p>
                    <div class="flex flex-wrap items-center justify-center gap-4 text-base font-semibold text-[#800000] lg:justify-start">
                        <span class="alfawz-teacher-stat inline-flex items-center gap-2 rounded-full border border-[#800000]/15 bg-white/80 px-4 py-2 text-[#800000] shadow-sm shadow-[#800000]/10" data-alfawz-animate data-alfawz-delay="0.15">
                            <span class="text-xl" aria-hidden="true">🏫</span>
                            <span data-alfawz-metric="classes" data-label="<?php esc_attr_e( 'classes', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                        </span>
                        <span class="alfawz-teacher-stat inline-flex items-center gap-2 rounded-full border border-[#800000]/15 bg-white/80 px-4 py-2 text-[#800000] shadow-sm shadow-[#800000]/10" data-alfawz-animate data-alfawz-delay="0.2">
                            <span class="text-xl" aria-hidden="true">👥</span>
                            <span data-alfawz-metric="students" data-label="<?php esc_attr_e( 'students', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                        </span>
                    </div>
                </div>
                <div class="relative w-full max-w-lg self-stretch overflow-hidden rounded-3xl border border-[#800000]/15 bg-white/90 p-6 text-[#4f1d1d] shadow-xl shadow-[#800000]/15 sm:mx-auto lg:w-5/12 lg:max-w-none" data-alfawz-animate data-alfawz-delay="0.12">
                    <div class="pointer-events-none absolute inset-x-6 -top-16 h-32 rounded-full bg-[linear-gradient(135deg,_#800000_0%,_#a52a2a_45%,_rgba(253,246,240,0.85)_100%)] blur-3xl" aria-hidden="true"></div>
                    <div class="relative flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#800000]/20 bg-white/80 text-2xl text-[#800000] shadow-sm shadow-[#800000]/10" aria-hidden="true">📈</span>
                            <div>
                                <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[#800000]/80"><?php esc_html_e( 'Momentum tracker', 'alfawzquran' ); ?></p>
                                <p class="mt-1 text-xl font-bold text-[#333333]"><?php esc_html_e( 'Keep every class in flow', 'alfawzquran' ); ?></p>
                            </div>
                        </div>
                        <span class="inline-flex items-center gap-1 rounded-full border border-[#800000]/20 bg-white/80 px-3 py-1 text-xs font-semibold text-[#800000]"><span class="h-2 w-2 rounded-full bg-[#34d399]" aria-hidden="true"></span><?php esc_html_e( 'Live sync', 'alfawzquran' ); ?></span>
                    </div>
                    <div class="relative mt-6 space-y-5">
                        <div class="rounded-2xl border border-[#800000]/15 bg-white/85 p-5 shadow-sm" data-alfawz-animate data-alfawz-delay="0.18">
                            <div class="flex flex-wrap items-start justify-between gap-2 text-sm text-[#4f1d1d]/80">
                                <div>
                                    <p class="font-semibold text-[#333333]"><?php esc_html_e( 'Assignments shared', 'alfawzquran' ); ?></p>
                                    <p class="text-xs uppercase tracking-widest text-[#800000]/70"><?php esc_html_e( 'Weekly delivery pace', 'alfawzquran' ); ?></p>
                                </div>
                                <span class="text-sm font-semibold text-[#800000]" data-alfawz-metric="assignments" data-label="<?php esc_attr_e( 'assignments sent', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                            </div>
                            <div class="mt-4 h-2.5 rounded-full bg-[#fdf6f0]">
                                <span class="block h-full w-3/4 rounded-full bg-gradient-to-r from-[#800000] via-[#a52a2a] to-[#f6d6c8] transition-all" aria-hidden="true"></span>
                            </div>
                        </div>
                        <div class="rounded-2xl border border-[#800000]/15 bg-white/85 p-5 shadow-sm" data-alfawz-animate data-alfawz-delay="0.24">
                            <div class="flex flex-wrap items-start justify-between gap-2 text-sm text-[#4f1d1d]/80">
                                <div>
                                    <p class="font-semibold text-[#333333]"><?php esc_html_e( 'Students tracked', 'alfawzquran' ); ?></p>
                                    <p class="text-xs uppercase tracking-widest text-[#800000]/70"><?php esc_html_e( 'Active memorisation loops', 'alfawzquran' ); ?></p>
                                </div>
                                <span class="text-sm font-semibold text-[#800000]" data-alfawz-metric="memorization" data-label="<?php esc_attr_e( 'students tracked', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                            </div>
                            <div class="mt-4 h-2.5 rounded-full bg-[#fdf6f0]">
                                <span class="block h-full w-2/3 rounded-full bg-gradient-to-r from-[#800000] via-[#a52a2a] to-[#f6d6c8] transition-all" aria-hidden="true"></span>
                            </div>
                        </div>
                        <div class="rounded-2xl border border-dashed border-[#d9a9a0] bg-[#fdf6f0] p-5 text-sm text-[#4f1d1d]/90" data-alfawz-animate data-alfawz-delay="0.3">
                            <p class="font-semibold uppercase tracking-[0.25em] text-[#800000]/70"><?php esc_html_e( 'Teacher tip', 'alfawzquran' ); ?></p>
                            <p class="mt-2 leading-relaxed text-[#333333]"><?php esc_html_e( 'Share encouraging voice notes after each Qa’idah to keep motivation high.', 'alfawzquran' ); ?></p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid gap-4 text-base text-[#4f1d1d] sm:grid-cols-3">
                <div class="alfawz-teacher-mini flex items-center gap-3 rounded-2xl border border-[#800000]/10 bg-white/85 p-4 shadow-sm shadow-[#800000]/10" data-alfawz-animate data-alfawz-delay="0.18">
                    <span class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#800000]/10 bg-white text-2xl text-[#800000]">✨</span>
                    <p class="leading-relaxed"><?php esc_html_e( 'Design rhythm-based Qa’idah playlists and assign them in moments.', 'alfawzquran' ); ?></p>
                </div>
                <div class="alfawz-teacher-mini flex items-center gap-3 rounded-2xl border border-[#800000]/10 bg-white/85 p-4 shadow-sm shadow-[#800000]/10" data-alfawz-animate data-alfawz-delay="0.22">
                    <span class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#800000]/10 bg-white text-2xl text-[#800000]">🎧</span>
                    <p class="leading-relaxed"><?php esc_html_e( 'Monitor memorisation audio replays to celebrate growth.', 'alfawzquran' ); ?></p>
                </div>
                <div class="alfawz-teacher-mini flex items-center gap-3 rounded-2xl border border-[#800000]/10 bg-white/85 p-4 shadow-sm shadow-[#800000]/10" data-alfawz-animate data-alfawz-delay="0.26">
                    <span class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#800000]/10 bg-white text-2xl text-[#800000]">💬</span>
                    <p class="leading-relaxed"><?php esc_html_e( 'Send motivating reflections or reminders directly with each assignment.', 'alfawzquran' ); ?></p>
                </div>
            </div>
        </section>

        <section class="alfawz-teacher-card rounded-3xl border border-[#800000]/15 bg-white/90 p-8 shadow-xl shadow-[#800000]/15 backdrop-blur" aria-labelledby="alfawz-teacher-classes-title" data-alfawz-animate>
            <div class="flex flex-wrap items-center justify-between gap-4">
                <h2 id="alfawz-teacher-classes-title" class="text-3xl font-extrabold text-[#333333]">
                    <span class="mr-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#800000]/15 bg-white text-2xl text-[#800000]" aria-hidden="true">🏫</span>
                    <?php esc_html_e( 'Your assigned classes', 'alfawzquran' ); ?>
                </h2>
                <button type="button" data-alfawz-teacher-refresh class="inline-flex items-center gap-2 rounded-full border border-[#800000]/20 bg-white px-5 py-2 text-sm font-semibold text-[#800000] transition hover:-translate-y-0.5 hover:border-[#800000] hover:text-[#5a0f27] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a52a2a]/30">
                    <span class="text-lg" aria-hidden="true">🔄</span>
                    <?php esc_html_e( 'Refresh data', 'alfawzquran' ); ?>
                </button>
            </div>
            <p class="mt-3 max-w-3xl text-base text-[#4f1d1d]">
                <?php esc_html_e( 'Stay in sync with your classroom. Every Qa’idah you launch here appears instantly for your learners.', 'alfawzquran' ); ?>
            </p>
            <div id="alfawz-teacher-class-cards" class="mt-6 space-y-3" aria-live="polite" aria-busy="true">
                <div class="flex items-center justify-center rounded-2xl border border-[#800000]/10 bg-white/85 px-4 py-6 text-base font-medium text-[#800000]">
                    <?php esc_html_e( 'Loading assigned classes…', 'alfawzquran' ); ?>
                </div>
            </div>
            <p class="mt-6 text-sm italic text-[#800000]/70">
                <?php esc_html_e( '💡 Classes and students are assigned by your administrator. Contact them to request changes.', 'alfawzquran' ); ?>
            </p>
        </section>

        <section class="grid grid-cols-1 gap-6 md:grid-cols-2" aria-label="<?php esc_attr_e( 'Primary teaching actions', 'alfawzquran' ); ?>">
            <div class="group rounded-3xl border border-[#800000]/15 bg-white/90 p-8 shadow-xl shadow-[#800000]/15 transition duration-300 hover:-translate-y-1 hover:shadow-2xl" data-alfawz-animate>
                <div class="mb-4 flex items-center justify-between">
                    <span class="text-4xl" aria-hidden="true">📚</span>
                    <span class="rounded-full border border-[#800000]/20 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#800000]">Qa’idah</span>
                </div>
                <h3 class="text-3xl font-extrabold text-[#333333]"><?php esc_html_e( 'Qa’idah assignments', 'alfawzquran' ); ?></h3>
                <p class="mt-3 text-base leading-relaxed text-[#4f1d1d]"><?php esc_html_e( 'Design immersive Qa’idah sets with voice, rhythm, and repetition that students can replay anytime.', 'alfawzquran' ); ?></p>
                <div class="mt-8 flex items-center justify-between gap-4">
                    <span class="text-sm font-semibold text-[#800000]" data-alfawz-metric="assignments" data-label="<?php esc_attr_e( 'assignments sent', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                    <a href="?page=alfawz_qaidah" class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-sky-500 to-rose-500 px-5 py-2 text-base font-semibold text-white shadow-lg shadow-[#0f3f3a]/25 transition hover:-translate-y-1 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                        <?php esc_html_e( 'Create assignment →', 'alfawzquran' ); ?>
                    </a>
                </div>
            </div>

            <div class="group rounded-3xl border border-[#800000]/15 bg-white/90 p-8 shadow-xl shadow-[#800000]/15 transition duration-300 hover:-translate-y-1 hover:shadow-2xl" data-alfawz-animate data-alfawz-delay="0.08">
                <div class="mb-4 flex items-center justify-between">
                    <span class="text-4xl" aria-hidden="true">🧠</span>
                    <span class="rounded-full border border-[#800000]/20 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#800000]">Insights</span>
                </div>
                <h3 class="text-3xl font-extrabold text-[#333333]"><?php esc_html_e( 'Student memorisation', 'alfawzquran' ); ?></h3>
                <p class="mt-3 text-base leading-relaxed text-[#4f1d1d]"><?php esc_html_e( 'Review streaks, pacing, and celebrate golden moments where a learner blossoms.', 'alfawzquran' ); ?></p>
                <div class="mt-8 flex items-center justify-between gap-4">
                    <span class="text-sm font-semibold text-[#800000]" data-alfawz-metric="memorization" data-label="<?php esc_attr_e( 'students tracked', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                    <a href="#alfawz-teacher-memorization" class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-sky-500 to-rose-500 px-5 py-2 text-base font-semibold text-white shadow-lg shadow-[#0f3f3a]/25 transition hover:-translate-y-1 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                        <?php esc_html_e( 'View progress →', 'alfawzquran' ); ?>
                    </a>
                </div>
            </div>
        </section>

        <section class="alfawz-teacher-card rounded-3xl border border-[#800000]/15 bg-white/90 p-8 shadow-xl shadow-[#800000]/15 backdrop-blur" aria-labelledby="alfawz-teacher-activity-title" data-alfawz-animate>
            <div class="flex flex-wrap items-center justify-between gap-4">
                <h2 id="alfawz-teacher-activity-title" class="text-3xl font-extrabold text-[#333333]"><?php esc_html_e( 'Recent activity pulse', 'alfawzquran' ); ?></h2>
                <span class="inline-flex items-center gap-2 rounded-full border border-[#800000]/20 bg-white px-4 py-2 text-sm font-semibold text-[#800000]">
                    <span class="text-lg" aria-hidden="true">⚡</span><?php esc_html_e( 'Auto refreshed', 'alfawzquran' ); ?>
                </span>
            </div>
            <ul id="alfawz-teacher-activity-list" class="mt-5 space-y-4" aria-live="polite" aria-busy="true">
                <li class="rounded-2xl border border-[#800000]/10 bg-white/85 px-5 py-4 text-base text-[#800000]">
                    <?php esc_html_e( 'Compiling recent activity…', 'alfawzquran' ); ?>
                </li>
            </ul>
        </section>

        <section class="alfawz-teacher-card rounded-3xl border border-[#800000]/15 bg-white/95 p-8 shadow-xl shadow-[#800000]/15 backdrop-blur" aria-labelledby="alfawz-teacher-assignments-title" data-alfawz-animate>
            <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div class="space-y-3">
                    <h2 id="alfawz-teacher-assignments-title" class="text-3xl font-extrabold text-[#333333]"><?php esc_html_e( 'Manage Qa’idah assignments', 'alfawzquran' ); ?></h2>
                    <p class="max-w-2xl text-base text-[#4f1d1d]"><?php esc_html_e( 'Review published lessons, open previews, or edit content before sending gentle reminders.', 'alfawzquran' ); ?></p>
                </div>
                <div class="flex flex-col gap-3 sm:flex-row">
                    <button type="button" id="alfawz-teacher-create-assignment" class="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-sky-500 to-rose-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#0f3f3a]/25 transition hover:-translate-y-1 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                        <span aria-hidden="true">✏️</span>
                        <span><?php esc_html_e( 'Create assignment', 'alfawzquran' ); ?></span>
                    </button>
                    <button type="button" data-alfawz-teacher-refresh class="inline-flex items-center justify-center gap-2 rounded-full border border-[#800000]/20 bg-white px-6 py-3 text-base font-semibold text-[#800000] shadow-sm transition hover:-translate-y-0.5 hover:border-[#800000] hover:text-[#5a0f27] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a52a2a]/30">
                        <span aria-hidden="true">🔁</span>
                        <?php esc_html_e( 'Refresh data', 'alfawzquran' ); ?>
                    </button>
                </div>
            </div>
            <p id="alfawz-teacher-qaidah-status" class="mt-6 text-sm font-semibold text-[#800000]" role="status" aria-live="polite"></p>
            <div class="mt-6 overflow-hidden rounded-3xl border border-[#800000]/15" data-alfawz-animate data-alfawz-delay="0.08">
                <table class="min-w-full divide-y divide-[#800000]/15 text-left">
                    <thead class="bg-white/85 text-sm font-semibold uppercase tracking-wide text-[#800000]">
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
                            <td colspan="5" class="px-4 py-6 text-center text-base text-[#800000]/70"><?php esc_html_e( 'Loading assignments…', 'alfawzquran' ); ?></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="mt-6 grid gap-4 rounded-3xl border border-[#800000]/15 bg-gradient-to-br from-[#fdf6f0] via-[#f5dfd4] to-[#f0cfc0] p-6 text-sm text-[#4f1d1d] shadow-md shadow-[#800000]/15 sm:grid-cols-2" data-alfawz-animate data-alfawz-delay="0.12">
                <div>
                    <h3 class="text-lg font-semibold text-[#333333]"><?php esc_html_e( 'Reflection prompts', 'alfawzquran' ); ?></h3>
                    <p class="mt-2 leading-relaxed"><?php esc_html_e( 'After learners submit, send a reflective prompt—ask what line felt most joyful to recite.', 'alfawzquran' ); ?></p>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-[#333333]"><?php esc_html_e( 'Progress celebrations', 'alfawzquran' ); ?></h3>
                    <p class="mt-2 leading-relaxed"><?php esc_html_e( 'Highlight milestones weekly with a class-wide audio shout-out or gratitude note.', 'alfawzquran' ); ?></p>
                </div>
            </div>
            <div id="alfawz-qaidah-wrapper" class="hidden">
                <?php echo $qaidah_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
            </div>
        </section>

        <section id="alfawz-teacher-memorization" class="rounded-3xl border border-[#800000]/15 bg-[linear-gradient(135deg,_#800000_0%,_#a52a2a_45%,_#fdf6f0_100%)] p-8 shadow-xl shadow-[#800000]/15 backdrop-blur" aria-labelledby="alfawz-teacher-memorization-title" data-alfawz-animate>
            <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div class="space-y-3">
                    <h2 id="alfawz-teacher-memorization-title" class="text-3xl font-extrabold text-[#333333]"><?php esc_html_e( 'Student memorisation oversight', 'alfawzquran' ); ?></h2>
                    <p class="max-w-2xl text-base text-[#4f1d1d]"><?php esc_html_e( 'Monitor repetitions, completion pace, and streak health for every student assigned to you.', 'alfawzquran' ); ?></p>
                </div>
                <span class="alfawz-teacher-stat inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-sm font-semibold text-[#800000] shadow-sm shadow-[#800000]/10" id="alfawz-teacher-memo-pill" data-label="<?php esc_attr_e( 'students tracked', 'alfawzquran' ); ?>" data-alfawz-animate data-alfawz-delay="0.1">
                    <?php esc_html_e( 'Loading…', 'alfawzquran' ); ?>
                </span>
            </div>
            <div id="alfawz-teacher-memo-list" class="mt-6 space-y-4" aria-live="polite" aria-busy="true">
                <div class="rounded-2xl border border-white/40 bg-white/85 px-6 py-6 text-center text-base text-[#4f1d1d]/80">
                    <?php esc_html_e( 'Loading memorisation data…', 'alfawzquran' ); ?>
                </div>
            </div>
            <details class="mt-8 rounded-2xl border border-white/40 bg-white/80 p-6 text-sm text-[#4f1d1d] shadow-inner shadow-[#800000]/10">
                <summary class="cursor-pointer text-base font-semibold text-[#333333]">
                    <?php esc_html_e( 'Need inspiration for your next Qa’idah?', 'alfawzquran' ); ?>
                </summary>
                <ul class="mt-3 list-disc space-y-2 pl-6">
                    <li><?php esc_html_e( 'Blend melodic recitation challenges with collaborative feedback rounds.', 'alfawzquran' ); ?></li>
                    <li><?php esc_html_e( 'Pair advanced learners with emerging reciters for nurturing peer mentoring.', 'alfawzquran' ); ?></li>
                    <li><?php esc_html_e( 'Celebrate perseverance badges after three consistent memorisation streaks.', 'alfawzquran' ); ?></li>
                </ul>
            </details>
        </section>
    </div>
</div>

<div id="alfawz-teacher-assignment-modal" class="alfawz-qaidah-modal hidden" role="dialog" aria-modal="true" aria-labelledby="alfawz-teacher-assignment-modal-title">
    <div class="alfawz-qaidah-modal__content">
        <button type="button" class="alfawz-qaidah-modal__close" id="alfawz-teacher-assignment-modal-close" aria-label="<?php esc_attr_e( 'Close preview', 'alfawzquran' ); ?>">✕</button>
        <div class="space-y-4">
            <header class="space-y-1">
                <h4 id="alfawz-teacher-assignment-modal-title" class="text-xl font-semibold text-slate-900"></h4>
                <p id="alfawz-teacher-assignment-modal-meta" class="text-sm text-slate-500"></p>
            </header>
            <div class="alfawz-qaidah-modal__image">
                <img id="alfawz-teacher-assignment-modal-image" src="" alt="<?php esc_attr_e( 'Assignment preview image', 'alfawzquran' ); ?>" />
                <div id="alfawz-teacher-assignment-modal-hotspots" class="alfawz-qaidah-hotspot-layer" role="presentation"></div>
            </div>
        </div>
    </div>
</div>

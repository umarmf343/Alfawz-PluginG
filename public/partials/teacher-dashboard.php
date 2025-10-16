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
<div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#2b0618] via-[#7b1e3c] to-[#f6efe2] py-16 text-slate-900">
    <div class="alfawz-teacher-orb pointer-events-none" aria-hidden="true"></div>
    <div class="alfawz-teacher-orb alfawz-teacher-orb--secondary pointer-events-none" aria-hidden="true"></div>
    <div class="alfawz-teacher-trail pointer-events-none" aria-hidden="true"></div>

    <div id="alfawz-teacher-dashboard" class="relative z-10 mx-auto max-w-6xl space-y-12 px-4 font-sans sm:px-6 lg:px-0">
        <section class="alfawz-teacher-card grid gap-10 rounded-3xl bg-white/80 p-8 shadow-2xl shadow-[#2b0618]/10 backdrop-blur" data-alfawz-animate>
            <div class="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center" data-alfawz-animate data-alfawz-delay="0.05">
                <div class="space-y-5">
                    <span class="inline-flex items-center rounded-full bg-[#f3d9c1] px-5 py-1.5 text-sm font-semibold uppercase tracking-[0.28em] text-[#5a0f27]">
                        <?php esc_html_e( 'Teacher hub', 'alfawzquran' ); ?>
                    </span>
                    <h1 class="max-w-2xl text-4xl font-extrabold tracking-tight text-[#3d0b1e] sm:text-5xl lg:text-6xl">
                        <?php esc_html_e( 'Inspire every learner with purposeful Qa’idah journeys.', 'alfawzquran' ); ?>
                    </h1>
                    <p class="max-w-2xl text-lg leading-relaxed text-[#502032] sm:text-xl">
                        <?php esc_html_e( 'Craft Qa’idah lessons, review classroom momentum, and celebrate student milestones—all from your personalised teaching studio.', 'alfawzquran' ); ?>
                    </p>
                    <div class="flex flex-wrap items-center gap-4 text-base font-semibold text-[#7b1e3c]">
                        <span class="alfawz-teacher-stat inline-flex items-center gap-2 rounded-full bg-[#fdf5ea] px-4 py-2 shadow-sm" data-alfawz-animate data-alfawz-delay="0.15">
                            <span class="text-xl" aria-hidden="true">🏫</span>
                            <span data-alfawz-metric="classes" data-label="<?php esc_attr_e( 'classes', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                        </span>
                        <span class="alfawz-teacher-stat inline-flex items-center gap-2 rounded-full bg-[#fdf5ea] px-4 py-2 shadow-sm" data-alfawz-animate data-alfawz-delay="0.2">
                            <span class="text-xl" aria-hidden="true">👥</span>
                            <span data-alfawz-metric="students" data-label="<?php esc_attr_e( 'students', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                        </span>
                    </div>
                </div>
                <div class="relative w-full max-w-sm self-stretch overflow-hidden rounded-3xl border border-[#f5d5bf] bg-white/95 p-6 text-[#431125] shadow-xl shadow-[#2b0618]/15" data-alfawz-animate data-alfawz-delay="0.12">
                    <div class="pointer-events-none absolute inset-x-6 -top-16 h-32 rounded-full bg-gradient-to-br from-[#ffe8d7] via-[#f9d9c5] to-[#f7b7b0] blur-3xl" aria-hidden="true"></div>
                    <div class="relative flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3d9c1] text-2xl shadow-sm shadow-[#f3d9c1]/60" aria-hidden="true">📈</span>
                            <div>
                                <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[#7b1e3c]/80"><?php esc_html_e( 'Momentum tracker', 'alfawzquran' ); ?></p>
                                <p class="mt-1 text-xl font-bold text-[#2f0a18]"><?php esc_html_e( 'Keep every class in flow', 'alfawzquran' ); ?></p>
                            </div>
                        </div>
                        <span class="inline-flex items-center gap-1 rounded-full bg-[#f9ebe0] px-3 py-1 text-xs font-semibold text-[#7b1e3c]"><span class="h-2 w-2 rounded-full bg-[#34d399]" aria-hidden="true"></span><?php esc_html_e( 'Live sync', 'alfawzquran' ); ?></span>
                    </div>
                    <div class="relative mt-6 space-y-5">
                        <div class="rounded-2xl border border-[#f5d5bf] bg-white/80 p-5 shadow-sm" data-alfawz-animate data-alfawz-delay="0.18">
                            <div class="flex flex-wrap items-start justify-between gap-2 text-sm text-[#5a0f27]/80">
                                <div>
                                    <p class="font-semibold text-[#2f0a18]"><?php esc_html_e( 'Assignments shared', 'alfawzquran' ); ?></p>
                                    <p class="text-xs uppercase tracking-widest text-[#b57b69]"><?php esc_html_e( 'Weekly delivery pace', 'alfawzquran' ); ?></p>
                                </div>
                                <span class="text-sm font-semibold text-[#7b1e3c]" data-alfawz-metric="assignments" data-label="<?php esc_attr_e( 'assignments sent', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                            </div>
                            <div class="mt-4 h-2.5 rounded-full bg-[#fdf1e7]">
                                <span class="block h-full w-3/4 rounded-full bg-gradient-to-r from-[#f6c8aa] via-[#f3a58d] to-[#ed7b77] transition-all" aria-hidden="true"></span>
                            </div>
                        </div>
                        <div class="rounded-2xl border border-[#f5d5bf] bg-white/80 p-5 shadow-sm" data-alfawz-animate data-alfawz-delay="0.24">
                            <div class="flex flex-wrap items-start justify-between gap-2 text-sm text-[#5a0f27]/80">
                                <div>
                                    <p class="font-semibold text-[#2f0a18]"><?php esc_html_e( 'Students tracked', 'alfawzquran' ); ?></p>
                                    <p class="text-xs uppercase tracking-widest text-[#b57b69]"><?php esc_html_e( 'Active memorisation loops', 'alfawzquran' ); ?></p>
                                </div>
                                <span class="text-sm font-semibold text-[#7b1e3c]" data-alfawz-metric="memorization" data-label="<?php esc_attr_e( 'students tracked', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                            </div>
                            <div class="mt-4 h-2.5 rounded-full bg-[#fdf1e7]">
                                <span class="block h-full w-2/3 rounded-full bg-gradient-to-r from-[#f7d6ad] via-[#f3b5a2] to-[#ea8892] transition-all" aria-hidden="true"></span>
                            </div>
                        </div>
                        <div class="rounded-2xl border border-dashed border-[#f3bda0] bg-[#fff7f1] p-5 text-sm text-[#5a0f27]/90" data-alfawz-animate data-alfawz-delay="0.3">
                            <p class="font-semibold uppercase tracking-[0.25em] text-[#b57b69]/80"><?php esc_html_e( 'Teacher tip', 'alfawzquran' ); ?></p>
                            <p class="mt-2 leading-relaxed text-[#431125]"><?php esc_html_e( 'Share encouraging voice notes after each Qa’idah to keep motivation high.', 'alfawzquran' ); ?></p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid gap-4 text-base text-[#502032] sm:grid-cols-3">
                <div class="alfawz-teacher-mini flex items-center gap-3 rounded-2xl bg-[#fdf5ea] p-4 shadow-sm shadow-[#2b0618]/5" data-alfawz-animate data-alfawz-delay="0.18">
                    <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl">✨</span>
                    <p class="leading-relaxed"><?php esc_html_e( 'Design rhythm-based Qa’idah playlists and assign them in moments.', 'alfawzquran' ); ?></p>
                </div>
                <div class="alfawz-teacher-mini flex items-center gap-3 rounded-2xl bg-[#fdf5ea] p-4 shadow-sm shadow-[#2b0618]/5" data-alfawz-animate data-alfawz-delay="0.22">
                    <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl">🎧</span>
                    <p class="leading-relaxed"><?php esc_html_e( 'Monitor memorisation audio replays to celebrate growth.', 'alfawzquran' ); ?></p>
                </div>
                <div class="alfawz-teacher-mini flex items-center gap-3 rounded-2xl bg-[#fdf5ea] p-4 shadow-sm shadow-[#2b0618]/5" data-alfawz-animate data-alfawz-delay="0.26">
                    <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl">💬</span>
                    <p class="leading-relaxed"><?php esc_html_e( 'Send motivating reflections or reminders directly with each assignment.', 'alfawzquran' ); ?></p>
                </div>
            </div>
        </section>

        <section class="alfawz-teacher-card rounded-3xl border border-[#f1d9c9] bg-white/90 p-8 shadow-xl shadow-[#2b0618]/10 backdrop-blur" aria-labelledby="alfawz-teacher-classes-title" data-alfawz-animate>
            <div class="flex flex-wrap items-center justify-between gap-4">
                <h2 id="alfawz-teacher-classes-title" class="text-3xl font-extrabold text-[#3d0b1e]">
                    <span class="mr-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3d9c1] text-2xl" aria-hidden="true">🏫</span>
                    <?php esc_html_e( 'Your assigned classes', 'alfawzquran' ); ?>
                </h2>
                <button type="button" data-alfawz-teacher-refresh class="inline-flex items-center gap-2 rounded-full border border-[#d8a28d] bg-white px-5 py-2 text-sm font-semibold text-[#7b1e3c] transition hover:-translate-y-0.5 hover:border-[#7b1e3c] hover:text-[#3d0b1e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3b694]">
                    <span class="text-lg" aria-hidden="true">🔄</span>
                    <?php esc_html_e( 'Refresh data', 'alfawzquran' ); ?>
                </button>
            </div>
            <p class="mt-3 max-w-3xl text-base text-[#502032]">
                <?php esc_html_e( 'Stay in sync with your classroom. Every Qa’idah you launch here appears instantly for your learners.', 'alfawzquran' ); ?>
            </p>
            <div id="alfawz-teacher-class-cards" class="mt-6 space-y-3" aria-live="polite" aria-busy="true">
                <div class="flex items-center justify-center rounded-2xl bg-[#fdf5ea] px-4 py-6 text-base font-medium text-[#7b1e3c]">
                    <?php esc_html_e( 'Loading assigned classes…', 'alfawzquran' ); ?>
                </div>
            </div>
            <p class="mt-6 text-sm italic text-[#7b1e3c]/70">
                <?php esc_html_e( '💡 Classes and students are assigned by your administrator. Contact them to request changes.', 'alfawzquran' ); ?>
            </p>
        </section>

        <section class="grid grid-cols-1 gap-6 md:grid-cols-2" aria-label="<?php esc_attr_e( 'Primary teaching actions', 'alfawzquran' ); ?>">
            <div class="group rounded-3xl border border-[#f1d9c9] bg-white/90 p-8 shadow-xl shadow-[#2b0618]/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl" data-alfawz-animate>
                <div class="mb-4 flex items-center justify-between">
                    <span class="text-4xl" aria-hidden="true">📚</span>
                    <span class="rounded-full bg-[#f3d9c1] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#5a0f27]">Qa’idah</span>
                </div>
                <h3 class="text-3xl font-extrabold text-[#3d0b1e]"><?php esc_html_e( 'Qa’idah assignments', 'alfawzquran' ); ?></h3>
                <p class="mt-3 text-base leading-relaxed text-[#502032]"><?php esc_html_e( 'Design immersive Qa’idah sets with voice, rhythm, and repetition that students can replay anytime.', 'alfawzquran' ); ?></p>
                <div class="mt-8 flex items-center justify-between gap-4">
                    <span class="text-sm font-semibold text-[#7b1e3c]" data-alfawz-metric="assignments" data-label="<?php esc_attr_e( 'assignments sent', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                    <a href="?page=alfawz_qaidah" class="inline-flex items-center gap-2 rounded-full bg-[#7b1e3c] px-5 py-2 text-base font-semibold text-white shadow-lg shadow-[#2b0618]/30 transition hover:bg-[#5a0f27] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3b694]">
                        <?php esc_html_e( 'Create assignment →', 'alfawzquran' ); ?>
                    </a>
                </div>
            </div>

            <div class="group rounded-3xl border border-[#d0e1ff] bg-gradient-to-br from-white/90 to-[#f3f7ff] p-8 shadow-xl shadow-[#1b1f3b]/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl" data-alfawz-animate data-alfawz-delay="0.08">
                <div class="mb-4 flex items-center justify-between">
                    <span class="text-4xl" aria-hidden="true">🧠</span>
                    <span class="rounded-full bg-[#dbe7ff] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1f2a5b]">Insights</span>
                </div>
                <h3 class="text-3xl font-extrabold text-[#1f2a5b]"><?php esc_html_e( 'Student memorisation', 'alfawzquran' ); ?></h3>
                <p class="mt-3 text-base leading-relaxed text-[#243764]"><?php esc_html_e( 'Review streaks, pacing, and celebrate golden moments where a learner blossoms.', 'alfawzquran' ); ?></p>
                <div class="mt-8 flex items-center justify-between gap-4">
                    <span class="text-sm font-semibold text-[#1f2a5b]" data-alfawz-metric="memorization" data-label="<?php esc_attr_e( 'students tracked', 'alfawzquran' ); ?>"><?php esc_html_e( 'Loading…', 'alfawzquran' ); ?></span>
                    <a href="#alfawz-teacher-memorization" class="inline-flex items-center gap-2 rounded-full bg-[#1f2a5b] px-5 py-2 text-base font-semibold text-white shadow-lg shadow-[#1b1f3b]/30 transition hover:bg-[#15214a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#94b0ff]">
                        <?php esc_html_e( 'View progress →', 'alfawzquran' ); ?>
                    </a>
                </div>
            </div>
        </section>

        <section class="alfawz-teacher-card rounded-3xl border border-[#f1d9c9] bg-white/90 p-8 shadow-xl shadow-[#2b0618]/10 backdrop-blur" aria-labelledby="alfawz-teacher-activity-title" data-alfawz-animate>
            <div class="flex flex-wrap items-center justify-between gap-4">
                <h2 id="alfawz-teacher-activity-title" class="text-3xl font-extrabold text-[#3d0b1e]"><?php esc_html_e( 'Recent activity pulse', 'alfawzquran' ); ?></h2>
                <span class="inline-flex items-center gap-2 rounded-full bg-[#f3d9c1] px-4 py-2 text-sm font-semibold text-[#5a0f27]">
                    <span class="text-lg" aria-hidden="true">⚡</span><?php esc_html_e( 'Auto refreshed', 'alfawzquran' ); ?>
                </span>
            </div>
            <ul id="alfawz-teacher-activity-list" class="mt-5 space-y-4" aria-live="polite" aria-busy="true">
                <li class="rounded-2xl bg-[#fdf5ea] px-5 py-4 text-base text-[#7b1e3c]">
                    <?php esc_html_e( 'Compiling recent activity…', 'alfawzquran' ); ?>
                </li>
            </ul>
        </section>

        <section class="alfawz-teacher-card rounded-3xl border border-[#f1d9c9] bg-white/95 p-8 shadow-xl shadow-[#2b0618]/10 backdrop-blur" aria-labelledby="alfawz-teacher-assignments-title" data-alfawz-animate>
            <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div class="space-y-3">
                    <h2 id="alfawz-teacher-assignments-title" class="text-3xl font-extrabold text-[#3d0b1e]"><?php esc_html_e( 'Manage Qa’idah assignments', 'alfawzquran' ); ?></h2>
                    <p class="max-w-2xl text-base text-[#502032]"><?php esc_html_e( 'Review published lessons, open previews, or edit content before sending gentle reminders.', 'alfawzquran' ); ?></p>
                </div>
                <div class="flex flex-col gap-3 sm:flex-row">
                    <button type="button" id="alfawz-teacher-create-assignment" class="inline-flex items-center justify-center gap-2 rounded-full bg-[#7b1e3c] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#2b0618]/30 transition hover:-translate-y-0.5 hover:bg-[#5a0f27] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3b694]">
                        <span aria-hidden="true">✏️</span>
                        <span><?php esc_html_e( 'Create assignment', 'alfawzquran' ); ?></span>
                    </button>
                    <button type="button" data-alfawz-teacher-refresh class="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8a28d] bg-white px-6 py-3 text-base font-semibold text-[#7b1e3c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#7b1e3c] hover:text-[#3d0b1e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3b694]">
                        <span aria-hidden="true">🔁</span>
                        <?php esc_html_e( 'Refresh data', 'alfawzquran' ); ?>
                    </button>
                </div>
            </div>
            <p id="alfawz-teacher-qaidah-status" class="mt-6 text-sm font-semibold text-[#7b1e3c]" role="status" aria-live="polite"></p>
            <div class="mt-6 overflow-hidden rounded-3xl border border-[#f1d9c9]" data-alfawz-animate data-alfawz-delay="0.08">
                <table class="min-w-full divide-y divide-[#f1d9c9] text-left">
                    <thead class="bg-[#fdf5ea] text-sm font-semibold uppercase tracking-wide text-[#5a0f27]">
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
                            <td colspan="5" class="px-4 py-6 text-center text-base text-[#7b1e3c]/70"><?php esc_html_e( 'Loading assignments…', 'alfawzquran' ); ?></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="mt-6 grid gap-4 rounded-3xl bg-[#fdf5ea] p-6 text-sm text-[#502032] sm:grid-cols-2" data-alfawz-animate data-alfawz-delay="0.12">
                <div>
                    <h3 class="text-lg font-semibold text-[#3d0b1e]"><?php esc_html_e( 'Reflection prompts', 'alfawzquran' ); ?></h3>
                    <p class="mt-2 leading-relaxed"><?php esc_html_e( 'After learners submit, send a reflective prompt—ask what line felt most joyful to recite.', 'alfawzquran' ); ?></p>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-[#3d0b1e]"><?php esc_html_e( 'Progress celebrations', 'alfawzquran' ); ?></h3>
                    <p class="mt-2 leading-relaxed"><?php esc_html_e( 'Highlight milestones weekly with a class-wide audio shout-out or gratitude note.', 'alfawzquran' ); ?></p>
                </div>
            </div>
            <div id="alfawz-qaidah-wrapper" class="hidden">
                <?php echo $qaidah_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
            </div>
        </section>

        <section id="alfawz-teacher-memorization" class="rounded-3xl border border-[#d0e1ff] bg-gradient-to-br from-white/95 to-[#eef3ff] p-8 shadow-xl shadow-[#1b1f3b]/10 backdrop-blur" aria-labelledby="alfawz-teacher-memorization-title" data-alfawz-animate>
            <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div class="space-y-3">
                    <h2 id="alfawz-teacher-memorization-title" class="text-3xl font-extrabold text-[#1f2a5b]"><?php esc_html_e( 'Student memorisation oversight', 'alfawzquran' ); ?></h2>
                    <p class="max-w-2xl text-base text-[#243764]"><?php esc_html_e( 'Monitor repetitions, completion pace, and streak health for every student assigned to you.', 'alfawzquran' ); ?></p>
                </div>
                <span class="alfawz-teacher-stat inline-flex items-center gap-2 rounded-full bg-[#dbe7ff] px-4 py-2 text-sm font-semibold text-[#1f2a5b]" id="alfawz-teacher-memo-pill" data-label="<?php esc_attr_e( 'students tracked', 'alfawzquran' ); ?>" data-alfawz-animate data-alfawz-delay="0.1">
                    <?php esc_html_e( 'Loading…', 'alfawzquran' ); ?>
                </span>
            </div>
            <div id="alfawz-teacher-memo-list" class="mt-6 space-y-4" aria-live="polite" aria-busy="true">
                <div class="rounded-2xl border border-[#dbe7ff] bg-white/80 px-6 py-6 text-center text-base text-[#1f2a5b]/70">
                    <?php esc_html_e( 'Loading memorisation data…', 'alfawzquran' ); ?>
                </div>
            </div>
            <details class="mt-8 rounded-2xl bg-white/80 p-6 text-sm text-[#243764] shadow-inner">
                <summary class="cursor-pointer text-base font-semibold text-[#1f2a5b]">
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

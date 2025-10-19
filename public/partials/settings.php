<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$current_user     = wp_get_current_user();
$display_name     = $current_user instanceof WP_User ? $current_user->display_name : '';
$email_address    = $current_user instanceof WP_User ? $current_user->user_email : '';
$memorizer_link   = esc_url( home_url( '/alfawz-memorizer/' ) );
$password_link    = esc_url( wp_lostpassword_url() );
$donation_link    = esc_url( home_url( '/donate/' ) );
$avatar_gender_meta = get_user_meta( get_current_user_id(), 'alfawz_avatar_gender', true );
$avatar_gender      = in_array( $avatar_gender_meta, [ 'male', 'female' ], true ) ? $avatar_gender_meta : '';
$avatar_choices     = [
    'male'   => ALFAWZQURAN_PLUGIN_URL . 'assets/images/avatar-male.svg',
    'female' => ALFAWZQURAN_PLUGIN_URL . 'assets/images/avatar-female.svg',
];
$avatar_preview_url = $avatar_gender && isset( $avatar_choices[ $avatar_gender ] )
    ? $avatar_choices[ $avatar_gender ]
    : get_avatar_url( get_current_user_id(), [ 'size' => 160 ] );
$avatar_preview_url = esc_url( $avatar_preview_url );
$avatar_default_alt = esc_attr__( 'Profile photo', 'alfawzquran' );
?>
<section id="alfawz-settings" class="bg-stone-50 py-10 sm:py-14">
    <div class="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <header class="text-center mb-8">
            <div class="text-4xl mb-3" aria-hidden="true">⚙️</div>
            <h1 class="text-2xl font-bold text-gray-800"><?php esc_html_e( 'Your Settings', 'alfawzquran' ); ?></h1>
            <p class="mt-3 text-base text-gray-600 max-w-2xl mx-auto">
                <?php esc_html_e( 'Personalize your AlFawz experience. Your settings are saved automatically and kept private.', 'alfawzquran' ); ?>
            </p>
        </header>

        <div class="space-y-8">
            <section class="relative overflow-hidden rounded-2xl border border-fuchsia-200 bg-gradient-to-br from-rose-500 via-fuchsia-500 to-indigo-500 p-1 shadow-lg">
                <div class="rounded-2xl bg-white/90 p-6 text-center sm:p-8">
                    <div class="mx-auto mb-4 h-16 w-16 rounded-full bg-white/70 p-4 shadow-inner">
                        <span class="block text-3xl" aria-hidden="true">🌟</span>
                    </div>
                    <h2 class="text-2xl font-extrabold text-gray-900 sm:text-3xl"><?php esc_html_e( 'Spread the Light of the Qur\'an', 'alfawzquran' ); ?></h2>
                    <p class="mt-3 text-base text-gray-700 sm:text-lg">
                        <?php esc_html_e( 'Your generosity helps us create inspiring lessons, support teachers, and keep this platform thriving for every learner.', 'alfawzquran' ); ?>
                    </p>
                    <p class="mt-4 text-sm font-medium uppercase tracking-wide text-fuchsia-700">
                        <?php esc_html_e( 'Every contribution amplifies the impact of your memorization journey.', 'alfawzquran' ); ?>
                    </p>
                    <a
                        href="<?php echo $donation_link; ?>"
                        class="group relative mt-6 inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3 text-base font-semibold text-white focus:outline-none focus:ring-4 focus:ring-rose-200"
                    >
                        <span class="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 shadow-[0_14px_35px_rgba(249,115,22,0.35)] transition duration-300 ease-out group-hover:scale-105 group-hover:shadow-[0_18px_45px_rgba(244,114,182,0.4)] group-focus-visible:scale-105"></span>
                        <span class="absolute inset-[2px] rounded-full bg-white/10 backdrop-blur-sm transition duration-300 group-hover:bg-white/20"></span>
                        <span class="relative flex items-center gap-2">
                            <span class="text-lg" aria-hidden="true">✨</span>
                            <?php esc_html_e( 'Donate Now', 'alfawzquran' ); ?>
                        </span>
                    </a>
                </div>
                <div class="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-white/20 blur-3xl"></div>
                <div class="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
            </section>

            <section class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" aria-labelledby="alfawz-settings-profile-heading">
                <h2 id="alfawz-settings-profile-heading" class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span class="mr-2" aria-hidden="true">👤</span>
                    <?php esc_html_e( 'Profile', 'alfawzquran' ); ?>
                </h2>

                <form id="alfawz-settings-profile-form" class="space-y-4" novalidate>
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                        <div class="relative h-24 w-24 rounded-full border-2 border-emerald-100 bg-white shadow-sm sm:h-28 sm:w-28">
                            <img
                                id="alfawz-settings-avatar-preview"
                                src="<?php echo $avatar_preview_url; ?>"
                                alt="<?php echo $avatar_default_alt; ?>"
                                class="h-full w-full rounded-full object-cover"
                                data-default-avatar="<?php echo $avatar_preview_url; ?>"
                                data-default-alt="<?php echo $avatar_default_alt; ?>"
                            />
                        </div>
                        <div class="space-y-2">
                            <p class="text-sm font-medium text-gray-800"><?php esc_html_e( 'Profile Photo', 'alfawzquran' ); ?></p>
                            <p class="text-sm text-gray-600 max-w-sm">
                                <?php esc_html_e( 'Choose a respectful silhouette that represents you. You can update this anytime.', 'alfawzquran' ); ?>
                            </p>
                            <div class="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    id="alfawz-settings-avatar-button"
                                    class="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <?php esc_html_e( 'Upload Photo', 'alfawzquran' ); ?>
                                </button>
                                <span id="alfawz-settings-avatar-hint" class="text-xs text-gray-500">
                                    <?php esc_html_e( 'We use curated Muslim silhouettes instead of file uploads for privacy.', 'alfawzquran' ); ?>
                                </span>
                            </div>
                        </div>
                    </div>
                    <input type="hidden" id="alfawz-avatar-choice" name="avatar_gender" value="<?php echo esc_attr( $avatar_gender ); ?>" />

                    <div>
                        <label for="alfawz-settings-full-name" class="block text-sm font-medium text-gray-700 mb-1"><?php esc_html_e( 'Full Name', 'alfawzquran' ); ?></label>
                        <input
                            type="text"
                            id="alfawz-settings-full-name"
                            name="full_name"
                            value="<?php echo esc_attr( $display_name ); ?>"
                            class="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            autocomplete="name"
                        />
                    </div>

                    <div>
                        <label for="alfawz-settings-email" class="block text-sm font-medium text-gray-700 mb-1"><?php esc_html_e( 'Email', 'alfawzquran' ); ?></label>
                        <input
                            type="email"
                            id="alfawz-settings-email"
                            value="<?php echo esc_attr( $email_address ); ?>"
                            class="w-full p-3 border border-gray-300 rounded-lg text-base bg-gray-100"
                            disabled
                            aria-describedby="alfawz-settings-email-help"
                        />
                        <p id="alfawz-settings-email-help" class="mt-2 text-sm text-gray-500"><?php esc_html_e( 'Email cannot be changed. Contact your teacher for updates.', 'alfawzquran' ); ?></p>
                    </div>

                    <div class="flex flex-wrap items-center gap-3">
                        <button type="submit" id="alfawz-settings-profile-save" class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-5 rounded-lg transition transform hover:scale-[1.02]">
                            <?php esc_html_e( 'Save Profile', 'alfawzquran' ); ?>
                        </button>
                        <div id="alfawz-profile-status" class="alfawz-save-indicator hidden items-center text-base text-emerald-600" role="status" aria-live="polite">
                            <span class="mr-2" aria-hidden="true">✔</span>
                            <span><?php esc_html_e( 'Profile saved', 'alfawzquran' ); ?></span>
                        </div>
                    </div>
                    <p id="alfawz-profile-message" class="hidden text-base" aria-live="polite"></p>
                </form>
                <div
                    id="alfawz-avatar-modal"
                    class="fixed inset-0 z-50 hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="alfawz-avatar-modal-title"
                >
                    <div class="absolute inset-0 bg-slate-900/50" data-avatar-overlay></div>
                    <div class="relative z-10 flex min-h-full items-center justify-center px-4 py-8 sm:px-6">
                        <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8" data-avatar-dialog>
                            <div class="flex items-start justify-between gap-4">
                                <div>
                                    <h3 id="alfawz-avatar-modal-title" class="text-lg font-semibold text-gray-900">
                                        <?php esc_html_e( 'Choose a profile photo', 'alfawzquran' ); ?>
                                    </h3>
                                    <p class="mt-1 text-sm text-gray-600">
                                        <?php esc_html_e( 'Select the silhouette that feels most like you. Your choice updates instantly.', 'alfawzquran' ); ?>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    class="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    data-avatar-cancel
                                    aria-label="<?php esc_attr_e( 'Close avatar chooser', 'alfawzquran' ); ?>"
                                >
                                    ✕
                                </button>
                            </div>
                            <div class="mt-6 grid gap-4 sm:grid-cols-2">
                                <button
                                    type="button"
                                    class="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-emerald-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    data-avatar-option="male"
                                    data-avatar-url="<?php echo esc_attr( $avatar_choices['male'] ); ?>"
                                    aria-pressed="false"
                                >
                                    <img src="<?php echo esc_url( $avatar_choices['male'] ); ?>" alt="<?php esc_attr_e( 'Brother silhouette', 'alfawzquran' ); ?>" class="h-28 w-28 rounded-full border border-emerald-100 bg-emerald-50 p-2 shadow-sm transition group-[aria-pressed='true']:ring-2 group-[aria-pressed='true']:ring-emerald-500" />
                                    <span class="text-sm font-semibold text-gray-800"><?php esc_html_e( 'Brother silhouette', 'alfawzquran' ); ?></span>
                                    <span class="text-xs text-gray-500"><?php esc_html_e( 'Thobe & kufi inspired', 'alfawzquran' ); ?></span>
                                </button>
                                <button
                                    type="button"
                                    class="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-emerald-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    data-avatar-option="female"
                                    data-avatar-url="<?php echo esc_attr( $avatar_choices['female'] ); ?>"
                                    aria-pressed="false"
                                >
                                    <img src="<?php echo esc_url( $avatar_choices['female'] ); ?>" alt="<?php esc_attr_e( 'Sister silhouette', 'alfawzquran' ); ?>" class="h-28 w-28 rounded-full border border-rose-100 bg-rose-50 p-2 shadow-sm transition group-[aria-pressed='true']:ring-2 group-[aria-pressed='true']:ring-rose-500" />
                                    <span class="text-sm font-semibold text-gray-800"><?php esc_html_e( 'Sister silhouette', 'alfawzquran' ); ?></span>
                                    <span class="text-xs text-gray-500"><?php esc_html_e( 'Hijab & abaya inspired', 'alfawzquran' ); ?></span>
                                </button>
                            </div>
                            <p class="mt-4 hidden text-sm" data-avatar-message></p>
                            <div class="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    data-avatar-cancel
                                >
                                    <?php esc_html_e( 'Cancel', 'alfawzquran' ); ?>
                                </button>
                                <button
                                    type="button"
                                    class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    data-avatar-save
                                >
                                    <?php esc_html_e( 'Save', 'alfawzquran' ); ?>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" aria-labelledby="alfawz-settings-plan-heading" data-plan-url="<?php echo $memorizer_link; ?>">
                <h2 id="alfawz-settings-plan-heading" class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span class="mr-2" aria-hidden="true">🧠</span>
                    <?php esc_html_e( 'Memorization Plan', 'alfawzquran' ); ?>
                </h2>

                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
                    <div class="text-base text-amber-800" id="alfawz-plan-summary">
                        <strong id="alfawz-current-plan-name"><?php esc_html_e( 'Loading your active plan…', 'alfawzquran' ); ?></strong>
                        <span id="alfawz-current-plan-range" class="mt-2 block text-sm text-amber-700"></span>
                        <span id="alfawz-current-plan-note" class="mt-2 block text-sm text-amber-700"></span>
                    </div>
                    <div class="mt-4 h-2 w-full rounded-full bg-amber-100">
                        <span id="alfawz-plan-progress" class="block h-2 rounded-full bg-emerald-500 transition-all" style="width:0%"></span>
                    </div>
                </div>

                <button type="button" id="alfawz-settings-plan-button" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg text-lg transition transform hover:scale-[1.02]">
                    <?php esc_html_e( '+ Start New Memorization Plan', 'alfawzquran' ); ?>
                </button>
                <p id="alfawz-plan-empty" class="hidden mt-3 text-base text-gray-600 text-center"><?php esc_html_e( 'Create a new plan to begin your memorization journey.', 'alfawzquran' ); ?></p>
                <p class="mt-3 text-sm text-gray-500 text-center"><?php esc_html_e( 'Your plan syncs across all devices. Completed verses appear on your Dashboard.', 'alfawzquran' ); ?></p>
            </section>

            <section class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" aria-labelledby="alfawz-settings-preferences-heading">
                <h2 id="alfawz-settings-preferences-heading" class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span class="mr-2" aria-hidden="true">🎨</span>
                    <?php esc_html_e( 'Preferences', 'alfawzquran' ); ?>
                </h2>

                <form id="alfawz-preferences-form" class="space-y-6" novalidate>
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div class="font-medium text-base text-gray-800"><?php esc_html_e( 'Audio Feedback', 'alfawzquran' ); ?></div>
                            <div class="text-sm text-gray-600"><?php esc_html_e( 'Play soft chime on repetition or verse completion', 'alfawzquran' ); ?></div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="alfawz-pref-audio" class="sr-only peer">
                            <span class="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[6px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></span>
                        </label>
                    </div>

                    <div>
                        <div class="font-medium text-base text-gray-800 mb-2"><?php esc_html_e( 'Quran Text Size', 'alfawzquran' ); ?></div>
                        <div class="flex flex-wrap gap-2" role="group" aria-label="<?php esc_attr_e( 'Quran text size', 'alfawzquran' ); ?>">
                            <button type="button" data-text-size="small" class="px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <span class="text-lg">A</span>
                            </button>
                            <button type="button" data-text-size="medium" class="px-4 py-2 text-base border border-emerald-500 bg-emerald-50 text-emerald-700 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <span class="text-xl">A</span>
                            </button>
                            <button type="button" data-text-size="large" class="px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <span class="text-2xl">A</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <div class="font-medium text-base text-gray-800 mb-1"><?php esc_html_e( 'Recitation pace', 'alfawzquran' ); ?></div>
                        <p class="text-sm text-gray-600 mb-3"><?php esc_html_e( 'Choose the age band that best matches your learner to tune today’s verse target.', 'alfawzquran' ); ?></p>
                        <div class="grid gap-3 sm:grid-cols-2" role="group" aria-label="<?php esc_attr_e( 'Select recitation pace', 'alfawzquran' ); ?>">
                            <button type="button" data-age-band="child" data-active="false" class="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <span class="font-semibold text-gray-800"><?php esc_html_e( 'Child pace', 'alfawzquran' ); ?></span>
                                <span class="text-sm font-semibold text-emerald-700" data-age-band-count>0 / day</span>
                                <span class="text-xs text-gray-500"><?php esc_html_e( 'Gentle bursts to build confidence.', 'alfawzquran' ); ?></span>
                            </button>
                            <button type="button" data-age-band="teen" data-active="false" class="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <span class="font-semibold text-gray-800"><?php esc_html_e( 'Teen pace', 'alfawzquran' ); ?></span>
                                <span class="text-sm font-semibold text-emerald-700" data-age-band-count>0 / day</span>
                                <span class="text-xs text-gray-500"><?php esc_html_e( 'Balanced sessions for emerging fluency.', 'alfawzquran' ); ?></span>
                            </button>
                            <button type="button" data-age-band="adult" data-active="false" class="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <span class="font-semibold text-gray-800"><?php esc_html_e( 'Adult pace', 'alfawzquran' ); ?></span>
                                <span class="text-sm font-semibold text-emerald-700" data-age-band-count>0 / day</span>
                                <span class="text-xs text-gray-500"><?php esc_html_e( 'Standard intentions to maintain momentum.', 'alfawzquran' ); ?></span>
                            </button>
                            <button type="button" data-age-band="senior" data-active="false" class="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <span class="font-semibold text-gray-800"><?php esc_html_e( 'Senior pace', 'alfawzquran' ); ?></span>
                                <span class="text-sm font-semibold text-emerald-700" data-age-band-count>0 / day</span>
                                <span class="text-xs text-gray-500"><?php esc_html_e( 'Gentle pacing with extra breathing room.', 'alfawzquran' ); ?></span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label for="alfawz-pref-language" class="block text-sm font-medium text-gray-700 mb-1"><?php esc_html_e( 'Interface Language', 'alfawzquran' ); ?></label>
                        <select id="alfawz-pref-language" class="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="en"><?php esc_html_e( 'English', 'alfawzquran' ); ?></option>
                            <option value="ar"><?php esc_html_e( 'العربية', 'alfawzquran' ); ?></option>
                            <option value="ur"><?php esc_html_e( 'اردو', 'alfawzquran' ); ?></option>
                        </select>
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                        <p class="text-base text-gray-600"><?php esc_html_e( 'Changes save automatically. We will confirm once everything is stored.', 'alfawzquran' ); ?></p>
                        <button type="submit" id="alfawz-preferences-save" class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-5 rounded-lg transition transform hover:scale-[1.02]">
                            <?php esc_html_e( 'Save Preferences', 'alfawzquran' ); ?>
                        </button>
                    </div>

                    <div id="alfawz-preferences-status" class="alfawz-save-indicator hidden items-center text-base text-emerald-600" role="status" aria-live="polite">
                        <span class="mr-2" aria-hidden="true">✔</span>
                        <span><?php esc_html_e( 'Preferences saved', 'alfawzquran' ); ?></span>
                    </div>
                    <p id="alfawz-preferences-message" class="hidden text-base" aria-live="polite"></p>
                </form>
            </section>

            <div class="mt-8 text-center">
                <button type="button" id="alfawz-change-password" data-password-url="<?php echo $password_link; ?>" class="text-red-600 hover:text-red-800 font-medium flex items-center justify-center mx-auto transition">
                    <span class="mr-2" aria-hidden="true">🔒</span>
                    <?php esc_html_e( 'Change Password', 'alfawzquran' ); ?>
                </button>
                <p class="mt-4 text-sm text-gray-500"><?php esc_html_e( 'Need help? Contact your teacher or administrator.', 'alfawzquran' ); ?></p>
            </div>
        </div>
    </div>
</section>
<?php
$current_page = 'settings';
?>

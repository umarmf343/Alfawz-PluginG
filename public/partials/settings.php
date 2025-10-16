<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$current_user       = wp_get_current_user();
$display_name       = $current_user instanceof WP_User ? $current_user->display_name : '';
$email_address      = $current_user instanceof WP_User ? $current_user->user_email : '';
$avatar_choices     = [
    'male'   => trailingslashit( ALFAWZQURAN_PLUGIN_URL ) . 'assets/images/alfawz-avatar-male.svg',
    'female' => trailingslashit( ALFAWZQURAN_PLUGIN_URL ) . 'assets/images/alfawz-avatar-female.svg',
];
$selected_avatar    = get_user_meta( get_current_user_id(), 'alfawz_profile_avatar', true );
if ( ! array_key_exists( $selected_avatar, $avatar_choices ) ) {
    $selected_avatar = '';
}
$default_avatar_url = get_avatar_url( get_current_user_id() );
$active_avatar_url  = $selected_avatar ? $avatar_choices[ $selected_avatar ] : $default_avatar_url;
$memorizer_link     = esc_url( home_url( '/alfawz-memorizer/' ) );
$password_link      = esc_url( wp_lostpassword_url() );
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
            <section class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" aria-labelledby="alfawz-settings-profile-heading">
                <h2 id="alfawz-settings-profile-heading" class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span class="mr-2" aria-hidden="true">👤</span>
                    <?php esc_html_e( 'Profile', 'alfawzquran' ); ?>
                </h2>

                <form id="alfawz-settings-profile-form" class="space-y-4" novalidate>
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

                    <div>
                        <span class="block text-sm font-medium text-gray-700 mb-2"><?php esc_html_e( 'Profile Photo', 'alfawzquran' ); ?></span>
                        <div class="flex items-center gap-4">
                            <span class="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-100 bg-emerald-50 shadow-inner">
                                <img
                                    id="alfawz-settings-avatar-preview"
                                    src="<?php echo esc_url( $active_avatar_url ); ?>"
                                    alt="<?php esc_attr_e( 'Selected profile photo', 'alfawzquran' ); ?>"
                                    class="h-full w-full object-cover"
                                    data-default-avatar="<?php echo esc_url( $default_avatar_url ); ?>"
                                />
                            </span>
                            <div class="space-y-2">
                                <button
                                    type="button"
                                    id="alfawz-settings-avatar-trigger"
                                    class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                    <?php esc_html_e( 'Upload Photo', 'alfawzquran' ); ?>
                                </button>
                                <p class="text-sm text-gray-500">
                                    <?php esc_html_e( 'Choose a Muslim silhouette that represents you.', 'alfawzquran' ); ?>
                                </p>
                            </div>
                        </div>
                        <input type="hidden" id="alfawz-settings-avatar-choice" name="avatar_choice" value="<?php echo esc_attr( $selected_avatar ); ?>" />
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
                    class="fixed inset-0 z-[60] hidden items-center justify-center bg-slate-900/70 px-4 py-6"
                    aria-hidden="true"
                >
                    <div class="absolute inset-0" data-action="close" aria-hidden="true"></div>
                    <div
                        class="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="alfawz-avatar-modal-title"
                        tabindex="-1"
                        data-avatar-modal-panel
                    >
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <h3 id="alfawz-avatar-modal-title" class="text-xl font-semibold text-gray-800"><?php esc_html_e( 'Choose your profile photo', 'alfawzquran' ); ?></h3>
                                <p class="mt-1 text-sm text-gray-600"><?php esc_html_e( 'Select a brother or sister silhouette to appear wherever your avatar is shown.', 'alfawzquran' ); ?></p>
                            </div>
                            <button
                                type="button"
                                class="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                data-action="close"
                                aria-label="<?php esc_attr_e( 'Close', 'alfawzquran' ); ?>"
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="mt-6 grid gap-4 sm:grid-cols-2">
                            <?php foreach ( $avatar_choices as $choice => $url ) : ?>
                                <button
                                    type="button"
                                    class="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:border-emerald-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    data-avatar-option="<?php echo esc_attr( $choice ); ?>"
                                >
                                    <span class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-emerald-100 bg-emerald-50 shadow-inner">
                                        <img
                                            src="<?php echo esc_url( $url ); ?>"
                                            alt="<?php echo esc_attr( 'male' === $choice ? __( 'Brother silhouette', 'alfawzquran' ) : __( 'Sister silhouette', 'alfawzquran' ) ); ?>"
                                            class="h-full w-full object-cover"
                                        />
                                    </span>
                                    <span class="text-sm font-semibold text-gray-700 group-hover:text-emerald-700">
                                        <?php echo 'male' === $choice ? esc_html__( 'Brother', 'alfawzquran' ) : esc_html__( 'Sister', 'alfawzquran' ); ?>
                                    </span>
                                </button>
                            <?php endforeach; ?>
                        </div>
                        <div class="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                data-action="close"
                            >
                                <?php esc_html_e( 'Cancel', 'alfawzquran' ); ?>
                            </button>
                            <button
                                type="button"
                                id="alfawz-avatar-apply"
                                class="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <?php esc_html_e( 'Save Photo', 'alfawzquran' ); ?>
                            </button>
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

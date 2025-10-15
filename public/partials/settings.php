<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$current_user     = wp_get_current_user();
$display_name     = $current_user instanceof WP_User ? $current_user->display_name : '';
$email_address    = $current_user instanceof WP_User ? $current_user->user_email : '';
$memorizer_link   = esc_url( home_url( '/alfawz-memorizer/' ) );
$password_link    = esc_url( wp_lostpassword_url() );
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

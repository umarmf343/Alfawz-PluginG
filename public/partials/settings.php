<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div id="alfawz-settings" class="alfawz-surface mx-auto max-w-5xl space-y-10 rounded-3xl bg-white/95 p-6 shadow-xl shadow-emerald-100/70 backdrop-blur">
    <header class="space-y-2 text-slate-900">
        <p class="text-sm font-medium uppercase tracking-wide text-emerald-600"><?php esc_html_e( 'Personalise your recitation flow', 'alfawzquran' ); ?></p>
        <h2 class="text-2xl font-semibold leading-tight"><?php esc_html_e( 'Tune every session to your voice, pace, and goals.', 'alfawzquran' ); ?></h2>
        <p class="max-w-2xl text-sm text-slate-600"><?php esc_html_e( 'Update your preferred reciter, manage daily targets, and keep track of memorisation plans without leaving the comfort of the learner hub.', 'alfawzquran' ); ?></p>
    </header>

    <section aria-labelledby="alfawz-settings-preferences" class="alfawz-settings-grid">
        <div class="alfawz-settings-card space-y-6">
            <div class="space-y-2">
                <h3 id="alfawz-settings-preferences" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Listening & translation preferences', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600"><?php esc_html_e( 'Your selections are remembered per account and sync instantly across the reader and memoriser.', 'alfawzquran' ); ?></p>
            </div>

            <form id="alfawz-settings-form" class="space-y-5" novalidate>
                <div class="grid gap-4 md:grid-cols-2">
                    <label class="alfawz-field">
                        <span class="alfawz-field-label"><?php esc_html_e( 'Default reciter', 'alfawzquran' ); ?></span>
                        <select id="alfawz-settings-reciter" name="default_reciter" class="alfawz-select">
                            <option value="ar.alafasy"><?php esc_html_e( 'Mishary Rashid Alafasy', 'alfawzquran' ); ?></option>
                            <option value="ar.abdulbasitmurattal"><?php esc_html_e( 'Abdul Basit (Murattal)', 'alfawzquran' ); ?></option>
                            <option value="ar.abdurrahmaansudais"><?php esc_html_e( 'Abdur-Rahman as-Sudais', 'alfawzquran' ); ?></option>
                            <option value="ar.husary"><?php esc_html_e( 'Mahmoud Khalil Al-Husary', 'alfawzquran' ); ?></option>
                            <option value="ar.minshawi"><?php esc_html_e( 'Mohamed Siddiq El-Minshawi', 'alfawzquran' ); ?></option>
                        </select>
                    </label>
                    <label class="alfawz-field">
                        <span class="alfawz-field-label"><?php esc_html_e( 'Translation edition', 'alfawzquran' ); ?></span>
                        <select id="alfawz-settings-translation" name="default_translation" class="alfawz-select">
                            <option value="en.sahih"><?php esc_html_e( 'English – Sahih International', 'alfawzquran' ); ?></option>
                            <option value="en.maududi"><?php esc_html_e( 'English – Abul Ala Maududi', 'alfawzquran' ); ?></option>
                            <option value="fr.hamidullah"><?php esc_html_e( 'French – Muhammad Hamidullah', 'alfawzquran' ); ?></option>
                            <option value="es.asad"><?php esc_html_e( 'Spanish – Muhammad Asad', 'alfawzquran' ); ?></option>
                            <option value="id.indonesian"><?php esc_html_e( 'Indonesian – Bahasa Indonesia', 'alfawzquran' ); ?></option>
                        </select>
                    </label>
                    <label class="alfawz-field">
                        <span class="alfawz-field-label"><?php esc_html_e( 'Transliteration support', 'alfawzquran' ); ?></span>
                        <select id="alfawz-settings-transliteration" name="default_transliteration" class="alfawz-select">
                            <option value="en.transliteration"><?php esc_html_e( 'English transliteration', 'alfawzquran' ); ?></option>
                            <option value="id.transliteration"><?php esc_html_e( 'Indonesian transliteration', 'alfawzquran' ); ?></option>
                            <option value="ur.transliteration"><?php esc_html_e( 'Urdu transliteration', 'alfawzquran' ); ?></option>
                            <option value="" ><?php esc_html_e( 'Hide transliteration by default', 'alfawzquran' ); ?></option>
                        </select>
                    </label>
                    <label class="alfawz-field">
                        <span class="alfawz-field-label"><?php esc_html_e( 'Hasanat per Arabic letter', 'alfawzquran' ); ?></span>
                        <input type="number" id="alfawz-settings-hasanat" name="hasanat_per_letter" min="1" max="50" class="alfawz-input" />
                    </label>
                </div>

                <div class="space-y-3">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <span class="alfawz-field-label uppercase tracking-wide"><?php esc_html_e( 'Daily verse target', 'alfawzquran' ); ?></span>
                        <span id="alfawz-settings-daily-label" class="text-sm font-semibold text-emerald-600">10</span>
                    </div>
                    <input type="range" id="alfawz-settings-daily" name="daily_verse_target" min="5" max="40" step="1" class="alfawz-slider" />
                    <p class="text-xs text-slate-500" id="alfawz-settings-daily-note"><?php esc_html_e( 'Adjust the slider to set how many ayat you intend to recite each day.', 'alfawzquran' ); ?></p>
                </div>

                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <label class="alfawz-switch" for="alfawz-settings-leaderboard">
                        <span class="alfawz-switch-control" aria-hidden="true">
                            <span class="alfawz-switch-handle"></span>
                        </span>
                        <input type="checkbox" id="alfawz-settings-leaderboard" name="enable_leaderboard" value="1" />
                        <span class="text-sm font-semibold text-slate-600" data-toggle-copy>
                            <?php esc_html_e( 'Show me on the community leaderboard', 'alfawzquran' ); ?>
                        </span>
                    </label>
                    <div class="flex flex-wrap items-center gap-3">
                        <button type="button" id="alfawz-settings-reset" class="alfawz-button alfawz-button--ghost">
                            <span>↺</span>
                            <span><?php esc_html_e( 'Reset to defaults', 'alfawzquran' ); ?></span>
                        </button>
                        <button type="submit" id="alfawz-settings-save" class="alfawz-button">
                            <span>💾</span>
                            <span><?php esc_html_e( 'Save preferences', 'alfawzquran' ); ?></span>
                        </button>
                    </div>
                </div>
            </form>
            <p id="alfawz-settings-feedback" class="alfawz-settings-feedback" role="status" aria-live="polite"></p>
        </div>

        <aside class="alfawz-settings-card space-y-6" aria-labelledby="alfawz-settings-overview">
            <div class="space-y-1">
                <h3 id="alfawz-settings-overview" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Memorisation pulse', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600"><?php esc_html_e( 'Preview recent plans, streak health, and quick actions to stay motivated.', 'alfawzquran' ); ?></p>
            </div>
            <dl class="alfawz-settings-metrics" id="alfawz-settings-metrics">
                <div>
                    <dt><?php esc_html_e( 'Active plans', 'alfawzquran' ); ?></dt>
                    <dd id="alfawz-settings-metric-plans">0</dd>
                </div>
                <div>
                    <dt><?php esc_html_e( 'Total verses memorised', 'alfawzquran' ); ?></dt>
                    <dd id="alfawz-settings-metric-verses">0</dd>
                </div>
                <div>
                    <dt><?php esc_html_e( 'Current streak', 'alfawzquran' ); ?></dt>
                    <dd id="alfawz-settings-metric-streak">0</dd>
                </div>
            </dl>
            <div class="alfawz-settings-highlight" id="alfawz-settings-highlight">
                <p class="text-sm font-semibold text-emerald-700" id="alfawz-settings-highlight-title"><?php esc_html_e( 'Loading streak insights…', 'alfawzquran' ); ?></p>
                <p class="text-xs text-emerald-600" id="alfawz-settings-highlight-note"></p>
            </div>
            <div class="space-y-3">
                <h4 class="text-sm font-semibold text-slate-900"><?php esc_html_e( 'Latest memorisation plans', 'alfawzquran' ); ?></h4>
                <ul id="alfawz-settings-plan-list" class="space-y-3" aria-live="polite" aria-busy="true"></ul>
                <p id="alfawz-settings-plan-empty" class="hidden text-sm text-slate-500"><?php esc_html_e( 'No plans yet. Create one inside the memoriser to unlock daily rhythm tips.', 'alfawzquran' ); ?></p>
            </div>
        </aside>
    </section>

    <section class="alfawz-settings-card space-y-4" aria-labelledby="alfawz-settings-coaching">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h3 id="alfawz-settings-coaching" class="text-lg font-semibold text-slate-900"><?php esc_html_e( 'Consistency coaching', 'alfawzquran' ); ?></h3>
                <p class="text-sm text-slate-600" id="alfawz-settings-coaching-note"><?php esc_html_e( 'Small reminders rooted in Prophetic wisdom keep the heart attached to the Quran.', 'alfawzquran' ); ?></p>
            </div>
            <button type="button" id="alfawz-settings-refresh-tip" class="alfawz-link text-sm font-semibold text-emerald-600"><?php esc_html_e( 'Refresh inspiration', 'alfawzquran' ); ?></button>
        </div>
        <blockquote class="alfawz-settings-quote" id="alfawz-settings-quote" cite="https://hadithcollection.com/">
            <p class="text-base leading-relaxed text-slate-700"></p>
            <footer class="text-sm font-medium text-emerald-700" id="alfawz-settings-quote-source"></footer>
        </blockquote>
    </section>
</div>
<?php
$current_page = 'settings';
?>

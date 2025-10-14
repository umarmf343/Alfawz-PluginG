<div class="wrap">
    <h1><?php _e('AlfawzQuran Settings', 'alfawzquran'); ?></h1>
    <p><?php _e('Configure the main settings for the AlfawzQuran plugin.', 'alfawzquran'); ?></p>

    <form method="post" action="options.php">
        <?php settings_fields( 'alfawz_quran_settings_group' ); ?>
        <?php do_settings_sections( 'alfawz-quran-settings' ); ?>
        <?php submit_button(); ?>
    </form>

    <div class="alfawz-admin-section">
        <h2><?php _e('General Settings', 'alfawzquran'); ?></h2>
        <table class="form-table">
            <tr valign="top">
                <th scope="row"><?php _e('Default Reciter', 'alfawzquran'); ?></th>
                <td>
                    <select name="alfawz_default_reciter">
                        <option value="ar.alafasy" <?php selected( get_option('alfawz_default_reciter'), 'ar.alafasy' ); ?>><?php _e('Mishary Rashid Alafasy', 'alfawzquran'); ?></option>
                        <option value="ar.abdulbasitmurattal" <?php selected( get_option('alfawz_default_reciter'), 'ar.abdulbasitmurattal' ); ?>><?php _e('Abdul Basit (Murattal)', 'alfawzquran'); ?></option>
                        <option value="ar.abdurrahmaansudais" <?php selected( get_option('alfawz_default_reciter'), 'ar.abdurrahmaansudais' ); ?>><?php _e('Abdur-Rahman as-Sudais', 'alfawzquran'); ?></option>
                        <option value="ar.husary" <?php selected( get_option('alfawz_default_reciter'), 'ar.husary' ); ?>><?php _e('Mahmoud Khalil Al-Husary', 'alfawzquran'); ?></option>
                    </select>
                    <p class="description"><?php _e('Choose the default Quran reciter for audio playback.', 'alfawzquran'); ?></p>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row"><?php _e('Default Translation', 'alfawzquran'); ?></th>
                <td>
                    <select name="alfawz_default_translation">
                        <option value="en.sahih" <?php selected( get_option('alfawz_default_translation'), 'en.sahih' ); ?>><?php _e('Sahih International', 'alfawzquran'); ?></option>
                        <option value="en.pickthall" <?php selected( get_option('alfawz_default_translation'), 'en.pickthall' ); ?>><?php _e('Pickthall', 'alfawzquran'); ?></option>
                        <option value="en.yusufali" <?php selected( get_option('alfawz_default_translation'), 'en.yusufali' ); ?>><?php _e('Yusuf Ali', 'alfawzquran'); ?></option>
                        <option value="en.clearquran" <?php selected( get_option('alfawz_default_translation'), 'en.clearquran' ); ?>><?php _e('The Clear Quran', 'alfawzquran'); ?></option>
                    </select>
                    <p class="description"><?php _e('Choose the default English translation to display.', 'alfawzquran'); ?></p>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row"><?php _e('Hasanat per Letter', 'alfawzquran'); ?></th>
                <td>
                    <input type="number" name="alfawz_hasanat_per_letter" value="<?php echo esc_attr( get_option('alfawz_hasanat_per_letter', 10) ); ?>" min="1" max="100" />
                    <p class="description"><?php _e('Set the number of Hasanat earned per Arabic letter read or memorized.', 'alfawzquran'); ?></p>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row"><?php _e('Daily Verse Target', 'alfawzquran'); ?></th>
                <td>
                    <input type="number" name="alfawz_daily_verse_target" value="<?php echo esc_attr( get_option('alfawz_daily_verse_target', 10) ); ?>" min="1" max="50" />
                    <p class="description"><?php _e('Set the default daily verse target for users.', 'alfawzquran'); ?></p>
                </td>
            </tr>
        </table>
    </div>

    <div class="alfawz-admin-section">
        <h2><?php _e('Feature Toggles', 'alfawzquran'); ?></h2>
        <table class="form-table">
            <tr valign="top">
                <th scope="row"><?php _e('Enable Notifications', 'alfawzquran'); ?></th>
                <td>
                    <input type="checkbox" name="alfawz_enable_notifications" value="1" <?php checked( 1, get_option('alfawz_enable_notifications', 1) ); ?> />
                    <p class="description"><?php _e('Enable or disable in-app notifications for users.', 'alfawzquran'); ?></p>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row"><?php _e('Enable Leaderboard', 'alfawzquran'); ?></th>
                <td>
                    <input type="checkbox" name="alfawz_enable_leaderboard" value="1" <?php checked( 1, get_option('alfawz_enable_leaderboard', 1) ); ?> />
                    <p class="description"><?php _e('Enable or disable the public leaderboard feature.', 'alfawzquran'); ?></p>
                </td>
            </tr>
        </table>
    </div>

    <?php submit_button(); ?>
</div>

<?php
// Register settings
add_action( 'admin_init', 'alfawz_quran_register_settings' );
function alfawz_quran_register_settings() {
    register_setting( 'alfawz_quran_settings_group', 'alfawz_default_reciter' );
    register_setting( 'alfawz_quran_settings_group', 'alfawz_default_translation' );
    register_setting( 'alfawz_quran_settings_group', 'alfawz_hasanat_per_letter' );
    register_setting( 'alfawz_quran_settings_group', 'alfawz_daily_verse_target' );
    register_setting( 'alfawz_quran_settings_group', 'alfawz_enable_notifications' );
    register_setting( 'alfawz_quran_settings_group', 'alfawz_enable_leaderboard' );
    register_setting( 'alfawz_quran_settings_group', 'alfawz_theme_mode' ); // Assuming this is also a setting
}
?>

<style>
.alfawz-admin-section {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    padding: 25px;
    border: 1px solid #e0e0e0;
    margin-bottom: 30px;
}

.alfawz-admin-section h2 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    font-size: 1.5em;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
}

.form-table th {
    width: 250px;
    padding-top: 15px;
    padding-bottom: 15px;
}

.form-table td {
    padding-top: 15px;
    padding-bottom: 15px;
}

.form-table input[type="text"],
.form-table input[type="number"],
.form-table select {
    width: 100%;
    max-width: 350px;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.07);
}

.form-table input[type="checkbox"] {
    width: auto;
    height: auto;
    margin-top: 5px;
}

.form-table .description {
    font-size: 0.9em;
    color: #777;
    margin-top: 5px;
}

.submit .button-primary {
    background: #667eea;
    border-color: #667eea;
    box-shadow: 0 2px 5px rgba(102, 126, 234, 0.3);
    text-shadow: none;
    transition: all 0.2s ease;
}

.submit .button-primary:hover {
    background: #764ba2;
    border-color: #764ba2;
    box-shadow: 0 4px 10px rgba(118, 75, 162, 0.4);
}
</style>

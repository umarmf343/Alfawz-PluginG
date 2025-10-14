<div class="alfawz-settings">
    <div class="alfawz-settings-header">
        <div class="alfawz-header-content">
            <h2><?php _e('Settings', 'alfawzquran'); ?></h2>
            <p><?php _e('Manage your preferences and memorization plans.', 'alfawzquran'); ?></p>
        </div>
    </div>

    <div class="alfawz-settings-section">
        <h3><?php _e('Create New Memorization Plan', 'alfawzquran'); ?></h3>
        <form id="create-plan-form" class="alfawz-form">
            <div class="alfawz-form-group">
                <label for="plan-name"><?php _e('Plan Name:', 'alfawzquran'); ?></label>
                <input type="text" id="plan-name" name="plan_name" required placeholder="e.g., Surah Al-Baqarah Part 1">
            </div>
            <div class="alfawz-form-group">
                <label for="plan-surah-select"><?php _e('Select Surah:', 'alfawzquran'); ?></label>
                <select id="plan-surah-select" name="surah_id" class="alfawz-surah-dropdown" required>
                    <option value=""><?php _e('Loading Surahs...', 'alfawzquran'); ?></option>
                </select>
            </div>
            <div class="alfawz-form-group alfawz-flex-group">
                <div class="alfawz-flex-item">
                    <label for="plan-start-verse"><?php _e('Start Verse:', 'alfawzquran'); ?></label>
                    <select id="plan-start-verse" name="start_verse" class="alfawz-verse-dropdown" disabled required>
                        <option value=""><?php _e('Select surah first', 'alfawzquran'); ?></option>
                    </select>
                </div>
                <div class="alfawz-flex-item">
                    <label for="plan-end-verse"><?php _e('End Verse:', 'alfawzquran'); ?></label>
                    <select id="plan-end-verse" name="end_verse" class="alfawz-verse-dropdown" disabled required>
                        <option value=""><?php _e('Select surah first', 'alfawzquran'); ?></option>
                    </select>
                </div>
            </div>
            <div class="alfawz-form-group">
                <label for="plan-daily-goal"><?php _e('Daily Goal (verses):', 'alfawzquran'); ?></label>
                <input type="number" id="plan-daily-goal" name="daily_goal" min="1" value="5" required>
            </div>
            <div class="alfawz-plan-summary">
                <p id="plan-summary-text"><?php _e('Fill in all fields to see a summary of your memorization plan.', 'alfawzquran'); ?></p>
            </div>
            <button type="submit" id="create-plan-btn" class="alfawz-btn alfawz-btn-primary alfawz-btn-large" disabled>
                <?php _e('Create Plan', 'alfawzquran'); ?>
            </button>
            <div id="plan-created-success-message" class="alfawz-notice alfawz-hidden alfawz-success-notification">
                <?php _e('Plan created successfully! You can now find it in the Memorizer section.', 'alfawzquran'); ?>
            </div>
        </form>
    </div>

    <div class="alfawz-settings-section">
        <h3><?php _e('Your Memorization Plans', 'alfawzquran'); ?></h3>
        <div id="existing-plans-list" class="alfawz-existing-plans-list">
            <div class="alfawz-loading-message">
                <span class="alfawz-loading-icon">⏳</span>
                <h3><?php _e('Loading your plans...', 'alfawzquran'); ?></h3>
                <p><?php _e('Fetching your existing memorization plans.', 'alfawzquran'); ?></p>
            </div>
        </div>
    </div>

    <div class="alfawz-settings-section">
        <h3><?php _e('General Settings', 'alfawzquran'); ?></h3>
        <form id="general-settings-form" class="alfawz-form">
            <div class="alfawz-form-group">
                <label for="default-reciter"><?php _e('Default Reciter:', 'alfawzquran'); ?></label>
                <select id="default-reciter" name="default_reciter" class="alfawz-surah-dropdown">
                    <option value="ar.alafasy">Mishary Alafasy</option>
                    <option value="ar.abdulbasit">Abdul Basit Abdul Samad</option>
                    <option value="ar.minshawi">Mohamed Siddiq El-Minshawi</option>
                    <option value="ar.husary">Mahmoud Khalil Al-Husary</option>
                    <option value="ar.muhammadayyoub">Muhammad Ayyub</option>
                </select>
            </div>
            <div class="alfawz-form-group">
                <label for="default-translation"><?php _e('Default Translation:', 'alfawzquran'); ?></label>
                <select id="default-translation" name="default_translation" class="alfawz-surah-dropdown">
                    <option value="en.sahih">English - Sahih International</option>
                    <option value="en.maududi">English - Abul Ala Maududi</option>
                    <option value="es.asad">Spanish - Muhammad Asad</option>
                    <option value="fr.hamidullah">French - Muhammad Hamidullah</option>
                    <option value="id.indonesian">Indonesian - Bahasa Indonesia</option>
                </select>
            </div>
            <div class="alfawz-form-group">
                <label for="hasanat-per-letter"><?php _e('Hasanat per Arabic Letter:', 'alfawzquran'); ?></label>
                <input type="number" id="hasanat-per-letter" name="hasanat_per_letter" min="1" value="10">
            </div>
            <div class="alfawz-form-group">
                <label for="daily-verse-target"><?php _e('Daily Reading Target (verses):', 'alfawzquran'); ?></label>
                <input type="number" id="daily-verse-target" name="daily_verse_target" min="1" value="10">
            </div>
            <div class="alfawz-form-group alfawz-toggle-group">
                <label class="alfawz-toggle-label">
                    <input type="checkbox" id="enable-leaderboard" name="enable_leaderboard">
                    <span class="alfawz-toggle-slider"></span>
                    <span class="alfawz-label-icon">🏆</span>
                    <?php _e('Enable Leaderboard', 'alfawzquran'); ?>
                </label>
            </div>
            <button type="submit" id="save-general-settings-btn" class="alfawz-btn alfawz-btn-primary alfawz-btn-large">
                <?php _e('Save Settings', 'alfawzquran'); ?>
            </button>
            <div id="settings-saved-success-message" class="alfawz-notice alfawz-hidden alfawz-success-notification">
                <?php _e('Settings saved successfully!', 'alfawzquran'); ?>
            </div>
        </form>
    </div>
</div>

<div class="alfawz-bottom-navigation">
    <div class="alfawz-nav-container">
        <a href="<?php echo esc_url(home_url('/alfawz-dashboard/')); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">🏠</span>
            <span class="alfawz-nav-label"><?php _e('Dashboard', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(home_url('/alfawz-reader/')); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">📖</span>
            <span class="alfawz-nav-label"><?php _e('Reader', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(home_url('/alfawz-memorizer/')); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">🧠</span>
            <span class="alfawz-nav-label"><?php _e('Memorizer', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(home_url('/alfawz-leaderboard/')); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">🏆</span>
            <span class="alfawz-nav-label"><?php _e('Leaderboard', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(home_url('/alfawz-profile/')); ?>" class="alfawz-nav-item">
            <span class="alfawz-nav-icon">👤</span>
            <span class="alfawz-nav-label"><?php _e('Profile', 'alfawzquran'); ?></span>
        </a>
        <a href="<?php echo esc_url(home_url('/alfawz-settings/')); ?>" class="alfawz-nav-item active">
            <span class="alfawz-nav-icon">⚙️</span>
            <span class="alfawz-nav-label"><?php _e('Settings', 'alfawzquran'); ?></span>
        </a>
    </div>
</div>

<style>
/* Settings specific styles */
.alfawz-settings-section {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    border: 1px solid #e2e8f0;
    margin-bottom: var(--spacing-lg);
}

.alfawz-settings-section h3 {
    margin-top: 0;
    margin-bottom: var(--spacing-lg);
    color: #2d3748;
    font-size: 1.3em;
    font-weight: 700;
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid #f7fafc;
}

.alfawz-form-group {
    margin-bottom: var(--spacing-lg);
}

.alfawz-form-group label {
    display: block;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: var(--spacing-sm);
    font-size: 0.9em;
}

.alfawz-form-group input[type="text"],
.alfawz-form-group input[type="number"],
.alfawz-form-group select {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    border: 2px solid #e2e8f0;
    border-radius: var(--radius-sm);
    font-size: 0.9em;
    background: white;
    color: #2d3748;
    transition: all 0.2s ease;
}

.alfawz-form-group input[type="text"]:focus,
.alfawz-form-group input[type="number"]:focus,
.alfawz-form-group select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.alfawz-flex-group {
    display: flex;
    gap: var(--spacing-md);
}

.alfawz-flex-item {
    flex: 1;
}

.alfawz-plan-summary {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    font-size: 0.9em;
    color: #4a5568;
    line-height: 1.5;
}

.alfawz-existing-plans-list {
    display: grid;
    gap: var(--spacing-md);
}

.alfawz-plan-card {
    background: linear-gradient(135deg, #f7fafc, #edf2f7);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    border: 2px solid #e2e8f0;
    box-shadow: var(--shadow-sm);
    transition: all 0.2s ease;
}

.alfawz-plan-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.alfawz-plan-card.completed {
    border-color: #48bb78;
    background: linear-gradient(135deg, #f0fff4, #c6f6d5);
}

.alfawz-plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
}

.alfawz-plan-name {
    margin: 0;
    font-size: 1.1em;
    font-weight: 700;
    color: #2d3748;
}

.alfawz-plan-status {
    padding: 4px 10px;
    border-radius: var(--radius-md);
    font-size: 0.75em;
    font-weight: 700;
    text-transform: uppercase;
}

.alfawz-plan-status.active {
    background: #bee3f8;
    color: #2c5282;
}

.alfawz-plan-status.completed {
    background: #c6f6d5;
    color: #22543d;
}

.alfawz-plan-details p {
    margin: 0 0 5px 0;
    font-size: 0.85em;
    color: #4a5568;
}

.alfawz-plan-progress-mini {
    margin-top: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.alfawz-plan-progress-text {
    font-size: 0.8em;
    color: #718096;
    margin-bottom: 5px;
}

.alfawz-plan-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
}

.alfawz-toggle-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.alfawz-toggle-group .alfawz-toggle-label {
    margin-bottom: 0;
}

/* Specific styles for plan verses list in memorizer */
.alfawz-plan-verses-list-container {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    border: 1px solid #e2e8f0;
    margin-top: var(--spacing-lg);
}

.alfawz-plan-verses-list-container h4 {
    margin-top: 0;
    margin-bottom: var(--spacing-lg);
    color: #2d3748;
    font-size: 1.2em;
    font-weight: 700;
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid #f7fafc;
}

.alfawz-plan-verses-list {
    display: grid;
    gap: var(--spacing-md);
}

.alfawz-verse-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: #f8fafc;
    border-radius: var(--radius-md);
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
}

.alfawz-verse-item:hover {
    background: #edf2f7;
    transform: translateX(2px);
}

.alfawz-verse-item.completed {
    background: #e6fffa;
    border-color: #48bb78;
}

.alfawz-verse-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.alfawz-verse-number {
    background: #667eea;
    color: white;
    width: 30px;
    height: 30px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9em;
}

.alfawz-verse-item.completed .alfawz-verse-number {
    background: #48bb78;
}

.alfawz-verse-checkbox input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #48bb78;
    cursor: pointer;
}

.alfawz-verse-preview {
    flex: 1;
    font-size: 0.9em;
    color: #4a5568;
    font-style: italic;
}

.alfawz-verse-actions {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
}

.alfawz-verse-status {
    font-size: 0.8em;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: var(--radius-md);
    background: #e2e8f0;
    color: #718096;
}

.alfawz-verse-item.completed .alfawz-verse-status {
    background: #c6f6d5;
    color: #22543d;
}

/* Loading and Empty States */
.alfawz-loading-plans,
.alfawz-loading-bookmarks,
.alfawz-loading-plan {
    text-align: center;
    padding: var(--spacing-xl);
    color: #718096;
    font-style: italic;
}

.alfawz-loading-plans .alfawz-loading-icon,
.alfawz-loading-bookmarks .alfawz-loading-icon,
.alfawz-loading-plan .alfawz-loading-icon {
    font-size: 2.5em;
    margin-bottom: var(--spacing-lg);
    opacity: 0.7;
    animation: spin 1.5s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.alfawz-empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: #718096;
}

.alfawz-empty-state p {
    margin: 0;
    font-size: 1em;
}

.alfawz-empty-state .alfawz-empty-icon {
    font-size: 2em;
    margin-bottom: var(--spacing-md);
    opacity: 0.7;
}

/* Success message for plan creation */
.alfawz-success-notification {
    background: var(--success-gradient);
    color: white;
    padding: var(--spacing-md);
    border-radius: var(--radius-sm);
    margin-top: var(--spacing-lg);
    text-align: center;
    font-weight: 600;
    display: none; /* Hidden by default */
}
</style>

<script>
jQuery(document).ready(function($) {
    // Load general settings
    function loadGeneralSettings() {
        $('#default-reciter').val(alfawzData.defaultReciter);
        $('#default-translation').val(alfawzData.defaultTranslation);
        $('#hasanat-per-letter').val(alfawzData.hasanatPerLetter);
        $('#daily-verse-target').val(alfawzData.dailyTarget);
        $('#enable-leaderboard').prop('checked', getOption('alfawz_enable_leaderboard', true));
    }

    // Save general settings
    $('#general-settings-form').on('submit', function(e) {
        e.preventDefault();
        const button = $('#save-general-settings-btn');
        button.prop('disabled', true).text('Saving...');

        const settings = {
            alfawz_default_reciter: $('#default-reciter').val(),
            alfawz_default_translation: $('#default-translation').val(),
            alfawz_hasanat_per_letter: $('#hasanat-per-letter').val(),
            alfawz_daily_verse_target: $('#daily-verse-target').val(),
            alfawz_enable_leaderboard: $('#enable-leaderboard').is(':checked') ? 1 : 0
        };

        $.ajax({
            url: alfawzData.ajaxUrl,
            method: 'POST',
            data: {
                action: 'alfawz_save_general_settings',
                _wpnonce: alfawzData.nonce, // Use the nonce for AJAX actions
                settings: settings
            },
            success: function(response) {
                if (response.success) {
                    showNotification('Settings saved successfully!', 'success');
                    $('#settings-saved-success-message').fadeIn().delay(3000).fadeOut();
                    // Update localized script data if settings change
                    alfawzData.defaultReciter = settings.alfawz_default_reciter;
                    alfawzData.defaultTranslation = settings.alfawz_default_translation;
                    alfawzData.hasanatPerLetter = parseInt(settings.alfawz_hasanat_per_letter);
                    alfawzData.dailyTarget = parseInt(settings.alfawz_daily_verse_target);
                } else {
                    showNotification(response.data.message || 'Failed to save settings.', 'error');
                }
                button.prop('disabled', false).text('Save Settings');
            },
            error: function(xhr, status, error) {
                console.error('Error saving settings:', error);
                showNotification('Error saving settings. Please try again.', 'error');
                button.prop('disabled', false).text('Save Settings');
            }
        });
    });

    // Helper to get option value (for initial load)
    function getOption(optionName, defaultValue) {
        // This would typically fetch from a WP REST API endpoint or localized script
        // For now, we'll assume alfawzData has these values if they were set on page load
        if (typeof alfawzData[optionName.replace('alfawz_', '')] !== 'undefined') {
            return alfawzData[optionName.replace('alfawz_', '')];
        }
        return defaultValue;
    }

    // Call on page load
    loadGeneralSettings();
});
</script>

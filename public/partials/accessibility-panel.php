<?php
/**
 * Accessibility control panel rendered in the footer.
 *
 * @var array $strings
 */
?>
<div
    id="alfawz-accessibility"
    class="alfawz-accessibility"
    data-alfawz-accessibility
>
    <button
        type="button"
        class="alfawz-accessibility__launcher"
        aria-haspopup="true"
        aria-expanded="false"
        aria-controls="alfawz-accessibility-panel"
        data-accessibility-open
    >
        <span aria-hidden="true">♿</span>
        <span class="screen-reader-text"><?php echo esc_html( $strings['launcher_label'] ); ?></span>
    </button>
    <div
        id="alfawz-accessibility-panel"
        class="alfawz-accessibility__panel"
        role="dialog"
        aria-modal="false"
        aria-label="<?php echo esc_attr( $strings['panel_label'] ); ?>"
        tabindex="-1"
        hidden
        data-accessibility-panel
    >
        <div class="alfawz-accessibility__header">
            <h2 class="alfawz-accessibility__title"><?php echo esc_html( $strings['panel_label'] ); ?></h2>
            <button
                type="button"
                class="alfawz-accessibility__close"
                aria-label="<?php echo esc_attr( $strings['close_label'] ); ?>"
                data-accessibility-close
            >
                ✕
            </button>
        </div>
        <div class="alfawz-accessibility__body">
            <section class="alfawz-accessibility__section" data-accessibility-group="text-size">
                <header class="alfawz-accessibility__section-header">
                    <h3><?php echo esc_html( $strings['text_size_heading'] ); ?></h3>
                    <p><?php esc_html_e( 'Choose the reading size that feels calmest.', 'alfawzquran' ); ?></p>
                </header>
                <div class="alfawz-accessibility__options" role="group" aria-label="<?php echo esc_attr( $strings['text_size_heading'] ); ?>">
                    <button type="button" class="alfawz-accessibility__option" data-text-size="medium">
                        <span><?php echo esc_html( $strings['text_size_default'] ); ?></span>
                    </button>
                    <button type="button" class="alfawz-accessibility__option" data-text-size="large">
                        <span><?php echo esc_html( $strings['text_size_large'] ); ?></span>
                    </button>
                </div>
            </section>
            <section class="alfawz-accessibility__section" data-accessibility-group="contrast">
                <header class="alfawz-accessibility__section-header">
                    <h3><?php echo esc_html( $strings['contrast_heading'] ); ?></h3>
                    <p><?php esc_html_e( 'Turn on high contrast for brighter edges and stronger focus.', 'alfawzquran' ); ?></p>
                </header>
                <div class="alfawz-accessibility__options" role="group" aria-label="<?php echo esc_attr( $strings['contrast_heading'] ); ?>">
                    <button type="button" class="alfawz-accessibility__option" data-contrast="default">
                        <span><?php echo esc_html( $strings['contrast_default'] ); ?></span>
                    </button>
                    <button type="button" class="alfawz-accessibility__option" data-contrast="high">
                        <span><?php echo esc_html( $strings['contrast_high'] ); ?></span>
                    </button>
                </div>
            </section>
            <section class="alfawz-accessibility__section" data-accessibility-group="dyslexia">
                <header class="alfawz-accessibility__section-header">
                    <h3><?php echo esc_html( $strings['dyslexia_heading'] ); ?></h3>
                    <p><?php esc_html_e( 'Switch to a friendlier letter shape to steady each word.', 'alfawzquran' ); ?></p>
                </header>
                <div class="alfawz-accessibility__toggle" data-dyslexia-toggle>
                    <input type="checkbox" id="alfawz-dyslexia-toggle" class="alfawz-accessibility__switch" />
                    <label for="alfawz-dyslexia-toggle" class="alfawz-accessibility__switch-label"><?php esc_html_e( 'Enable dyslexia-friendly type', 'alfawzquran' ); ?></label>
                </div>
            </section>
            <section class="alfawz-accessibility__section" data-accessibility-group="senior">
                <header class="alfawz-accessibility__section-header">
                    <h3><?php echo esc_html( $strings['senior_heading'] ); ?></h3>
                    <p><?php esc_html_e( 'Simplify the bottom navigation for quick trips to the reader and profile.', 'alfawzquran' ); ?></p>
                </header>
                <div class="alfawz-accessibility__toggle" data-senior-toggle>
                    <input type="checkbox" id="alfawz-senior-toggle" class="alfawz-accessibility__switch" />
                    <label for="alfawz-senior-toggle" class="alfawz-accessibility__switch-label"><?php esc_html_e( 'Enable Senior Mode', 'alfawzquran' ); ?></label>
                </div>
            </section>
        </div>
        <p class="alfawz-accessibility__status" role="status" aria-live="polite" data-accessibility-status>
            <?php echo esc_html( $strings['status_ready'] ); ?>
        </p>
    </div>
</div>

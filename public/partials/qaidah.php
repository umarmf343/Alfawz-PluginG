<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div class="alfawz-qaidah">
    <section class="alfawz-qaidah-hero">
        <div class="alfawz-qaidah-hero-copy">
            <h2><?php esc_html_e( "Qa'idah Practice Studio", 'alfawzquran' ); ?></h2>
            <p><?php esc_html_e( 'Build confident letter recognition, vowel sounds, and syllable fluency with a guided mobile-first experience.', 'alfawzquran' ); ?></p>
        </div>
        <div class="alfawz-qaidah-hero-badge" aria-live="polite">
            <span class="alfawz-qaidah-hero-icon">🎯</span>
            <span id="qaidah-focus-lesson">—</span>
        </div>
    </section>

    <section class="alfawz-qaidah-progress" aria-labelledby="qaidah-progress-title">
        <div class="alfawz-qaidah-progress-header">
            <h3 id="qaidah-progress-title"><?php esc_html_e( 'Today\'s Journey', 'alfawzquran' ); ?></h3>
            <span class="alfawz-qaidah-progress-count"><span id="qaidah-progress-count">0</span>/<span id="qaidah-total-count">0</span> <?php esc_html_e( 'mastered syllables', 'alfawzquran' ); ?></span>
        </div>
        <div class="alfawz-qaidah-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="qaidah-progress-bar">
            <div class="alfawz-qaidah-progress-fill" id="qaidah-progress-fill"></div>
        </div>
    </section>

    <section class="alfawz-qaidah-card" aria-live="polite">
        <div class="alfawz-qaidah-card-display">
            <div class="alfawz-qaidah-card-symbol" id="qaidah-card-symbol">بَ</div>
            <div class="alfawz-qaidah-card-transliteration" id="qaidah-card-transliteration">ba</div>
            <div class="alfawz-qaidah-card-tip" id="qaidah-card-tip"><?php esc_html_e( 'Tap shuffle to begin.', 'alfawzquran' ); ?></div>
        </div>
        <div class="alfawz-qaidah-card-controls">
            <button class="alfawz-btn alfawz-btn-secondary" type="button" id="qaidah-prev-card" aria-label="<?php esc_attr_e( 'Previous syllable', 'alfawzquran' ); ?>">
                <span class="alfawz-btn-icon">⬅️</span>
                <?php esc_html_e( 'Back', 'alfawzquran' ); ?>
            </button>
            <button class="alfawz-btn alfawz-btn-success" type="button" id="qaidah-mark-mastered">
                <span class="alfawz-btn-icon">✅</span>
                <?php esc_html_e( 'Mark Mastered', 'alfawzquran' ); ?>
            </button>
            <button class="alfawz-btn alfawz-btn-primary" type="button" id="qaidah-next-card" aria-label="<?php esc_attr_e( 'Next syllable', 'alfawzquran' ); ?>">
                <?php esc_html_e( 'Next', 'alfawzquran' ); ?>
                <span class="alfawz-btn-icon">➡️</span>
            </button>
        </div>
        <div class="alfawz-qaidah-card-utilities">
            <button class="alfawz-btn alfawz-btn-ghost" type="button" id="qaidah-shuffle-deck">
                <span class="alfawz-btn-icon">🔀</span>
                <?php esc_html_e( 'Shuffle Deck', 'alfawzquran' ); ?>
            </button>
            <button class="alfawz-btn alfawz-btn-ghost" type="button" id="qaidah-reset-progress">
                <span class="alfawz-btn-icon">🗑️</span>
                <?php esc_html_e( 'Reset Progress', 'alfawzquran' ); ?>
            </button>
        </div>
    </section>

    <section class="alfawz-qaidah-lessons" aria-labelledby="qaidah-lessons-title">
        <h3 id="qaidah-lessons-title"><?php esc_html_e( 'Lesson Explorer', 'alfawzquran' ); ?></h3>
        <p class="alfawz-qaidah-lessons-copy"><?php esc_html_e( 'Choose a focus set to tailor the flashcards to your current Qa\'idah goal.', 'alfawzquran' ); ?></p>
        <div class="alfawz-qaidah-lesson-grid" id="qaidah-lesson-grid">
            <div class="alfawz-empty-state">
                <p><?php esc_html_e( 'Loading lessons…', 'alfawzquran' ); ?></p>
            </div>
        </div>
    </section>

    <section class="alfawz-qaidah-mastered" aria-labelledby="qaidah-mastered-title">
        <h3 id="qaidah-mastered-title"><?php esc_html_e( 'Mastered Today', 'alfawzquran' ); ?></h3>
        <div class="alfawz-qaidah-mastered-list" id="qaidah-mastered-list">
            <div class="alfawz-empty-state">
                <p><?php esc_html_e( 'Your mastered syllables will appear here for a confidence boost.', 'alfawzquran' ); ?></p>
            </div>
        </div>
    </section>

    <section class="alfawz-qaidah-tips" aria-labelledby="qaidah-tips-title">
        <h3 id="qaidah-tips-title"><?php esc_html_e( 'Pronunciation Tips', 'alfawzquran' ); ?></h3>
        <div class="alfawz-qaidah-tip-grid">
            <article class="alfawz-qaidah-tip">
                <h4><?php esc_html_e( 'Anchor the Makharij', 'alfawzquran' ); ?></h4>
                <p><?php esc_html_e( 'Notice where each letter originates — lips for ب, the tip of the tongue for ت, and the throat for ح sounds.', 'alfawzquran' ); ?></p>
            </article>
            <article class="alfawz-qaidah-tip">
                <h4><?php esc_html_e( 'Count Your Beats', 'alfawzquran' ); ?></h4>
                <p><?php esc_html_e( 'Hold madd letters مثل مَا for two steady counts while keeping airflow smooth and relaxed.', 'alfawzquran' ); ?></p>
            </article>
            <article class="alfawz-qaidah-tip">
                <h4><?php esc_html_e( 'Layer Listening & Echoing', 'alfawzquran' ); ?></h4>
                <p><?php esc_html_e( 'Play each card aloud, then echo it twice to build muscle memory before swiping forward.', 'alfawzquran' ); ?></p>
            </article>
        </div>
    </section>
</div>
<?php
$current_page = 'qaidah';
include ALFAWZQURAN_PLUGIN_PATH . 'public/partials/mobile-nav.php';
?>

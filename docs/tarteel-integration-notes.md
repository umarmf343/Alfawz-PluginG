# Tarteel-Inspired Enhancements

This plugin release introduces AI-powered recitation feedback aligned with the experience offered by Tarteel:

- **AI Recitation Coach** – A speech-recognition workflow that listens to memorisation sessions and scores accuracy per ayah.
- **Focus Enhancement Snippets (FES)** – Contextual practice prompts surfaced automatically from detected mistakes.
- **Session History Ledger** – Stores the last 25 feedback reports per learner for longitudinal tracking.
- **WordPress-first controls** – Admin toggles for enabling the assistant and persisting a Tarteel API key for future live integrations.

Front-end listeners dispatch custom `alfawz:memorizationPlan` and `alfawz:memorizationVerse` events so other scripts (or theme overrides) can hook into verse changes without extra queries.

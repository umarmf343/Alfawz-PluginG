# QA Audit Findings — Alfawz Quran Plugin

_Date: 2024-05-09_

## Executive Summary

Static analysis of the current Next.js front-end and WordPress REST layer reveals that the majority of end-user
journeys described in the acceptance criteria are not implemented. Core study workflows (Reader controls, 20x
memorisation loop, Qa'idah assignment hotspots, leaderboard synchronisation, profile synchronisation) are either
missing entirely or represented only by static marketing placeholders. As a result, a student cannot complete the
required "Login → Recite 10 verses → Break the egg → Memorise a verse (20x) → View updated stats" journey without
encountering blocking gaps. The most urgent gaps are summarised below.

| Severity | Area | Finding |
| --- | --- | --- |
| 🔴 Critical | Quran Reader | No surah/ayah selection UI exists; the page always fetches Surah 1 and offers no way to change context. | 
| 🔴 Critical | Memorisation | Page is static marketing copy with no repetition loop, plan creation, or progress persistence. |
| 🔴 Critical | Qa'idah | No assignment builder, hotspots, or student playback; the page is purely promotional content. |
| 🔴 Critical | Stats Sync | Dashboard/Leaderboard/Profile render hard-coded numbers instead of live data, so progress never updates. |
| 🟠 High | Gamification | "Break the Egg" progress depends on Reader but nothing else surfaces egg state; no persistence for celebration history. |
| 🟠 High | Navigation/Redirects | No login gating or post-action redirects implemented; role-based flows are missing. |
| 🟢 Medium | Accessibility | Desktop-only styling patterns (e.g., text blocks, fixed spacing) need mobile validation and semantic labelling. |

## Detailed Findings

### 1. Quran Reader
- **Missing surah/ayah selection controls (Critical).** `app/reader/page.tsx` hard-codes a single fetch to
  `/wp-json/alfawzquran/v1/surahs/1/verses` and never exposes selectors for the user to change context. This
  prevents students from reading any verse outside Surah Al-Fātiḥah. 【F:app/reader/page.tsx†L74-L126】
- **Daily 10 goal only updates after POST but no reset UX (High).** The page relies on a `just_completed`
  flag but does not surface the streak/hasanat counters expected on the Dashboard, and there is no visible reset
  indicator beyond a paragraph. 【F:app/reader/page.tsx†L180-L259】
- **Egg challenge feedback only visible during the reader session (High).** There is no component that shows the
  escalating egg target elsewhere (Dashboard/Leaderboard), so students have no persistent indicator.
- **Potential accessibility gaps (Medium).** Large blocks of text lack headings for screen readers and verse text is
  wrapped in `<p>` without ARIA labelling to indicate verse numbers.

### 2. Memorisation
- **20x repetition loop absent (Critical).** The entire page is static marketing content; there is no verse loop,
  progress tracker, celebratory state, or integration with the `/memorization-plans` endpoints. 【F:app/memorization/page.tsx†L1-L100】
- **"Create Plan" button missing (Critical).** Requirement to move "Create Plan" into this panel is unmet—the page
  exposes no actionable controls.

### 3. Qa'idah Module
- **Teacher assignment workflow missing (Critical).** No calls to the Qa'idah REST endpoints exist in the page; the
  UI is a static brochure. Teachers cannot upload images, define hotspots, or assign audio. 【F:app/qaidah/page.tsx†L1-L160】
- **Student playback absent (Critical).** Without rendered hotspots or audio controls, learners cannot interact with
  assigned lessons.

### 4. Dashboard
- **Stats grid is static (Critical).** Except for the daily goal fetch, every metric is hard-coded strings, so streaks,
  hasanāt, and verse counts never reflect real activity. 【F:app/dashboard/page.tsx†L160-L260】【F:app/dashboard/page.tsx†L260-L420】
- **Teacher overview partially implemented (High).** The page fetches `/egg-challenge/progress`, but there is no UI to
  drill into classes or memorisation state, and the data is not shared across other pages.
- **No role gating (High).** Dashboard renders the same layout regardless of role flags.

### 5. Leaderboard
- **Hard-coded rankings (Critical).** `leaderboardData` array is static; the component never calls the REST leaderboard
  endpoint, so standings never change. 【F:app/leaderboard/page.tsx†L1-L100】

### 6. Profile
- **Static profile information (Critical).** Avatar, streaks, and goals are hard-coded strings instead of being fetched
  from `/user-stats`. Any progress earned elsewhere will not appear here. 【F:app/profile/page.tsx†L1-L120】

### 7. Navigation & Links
- **Bottom navigation lacks role awareness (High).** `components/bottom-nav.tsx` renders all destinations for every
  visitor, even though Teacher/Admin specific routes should be hidden from students. 【F:components/bottom-nav.tsx†L1-L100】
- **Post-login redirects undefined (High).** No logic exists to send users to the correct landing page after
  authentication or action completion.

### 8. Data & State Management
- **Front-end ignores memorisation/leaderboard/profile endpoints (Critical).** Although the PHP REST layer exposes
  `memorization-plans`, `user-stats`, `leaderboard`, and Qa'idah routes, the Next.js pages never consume them, leaving
  progress unsynchronised. 【F:includes/API/Routes.php†L33-L220】【F:includes/API/Routes.php†L920-L1160】
- **Timezone handling unverified (Medium).** Reader sends `timezone_offset`, but without full daily reset UI or unit
  tests we cannot confirm correctness.

### 9. Accessibility & Performance
- **Mobile responsiveness unvalidated (Medium).** Layouts rely on large fixed paddings and multi-column grids without
  explicit small-screen fallbacks. Manual responsive testing is required.
- **Keyboard focus states partly missing (Medium).** Several `Button` usages rely on default focus without visible
  outlines against dark backgrounds; needs contrast review.

## Recommended Next Steps

1. **Implement real data flows** for Reader (surah picker, verse API params), Memorisation (connect to plans, 20x loop),
   Qa'idah (assignment builder + student view), Dashboard (live stats + streak sync), Leaderboard (REST data), and Profile
   (user stats endpoint).
2. **Add role-aware routing** so navigation and redirects respect Student/Teacher/Admin contexts.
3. **Build automated sanity tests** (Playwright/Jest) to verify daily goal increments, egg progression, memorisation loops,
   and Qa'idah hotspot playback.
4. **Conduct responsive & accessibility QA** on iOS Safari and Android Chrome once dynamic features exist.

Until these items are addressed, the plugin does not meet the success criteria for a seamless, production-ready Quran
learning experience.

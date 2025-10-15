# Qa'idah Teacher & Student Workflow Specification

## Overview
This document consolidates the requirements for the Qa'idah teaching workflow. It focuses on enabling teachers (admins) to upload annotated lesson pages, assign them to students or groups, and track progress inside the Alfawz platform. It also covers the complementary student-facing reader experience and memorisation panel for Level 2 learners.

## Teacher/Admin Experience

### Page Preparation
- **Image upload**: Accept high-resolution JPG/PNG pages that contain clearly readable Arabic text.
- **Hotspot creation**: Provide a drag-to-draw editor for marking rectangular hotspots on top of the uploaded page.
  - Use Fabric.js or an equivalent canvas library for intuitive drag, resize, and delete interactions.
  - Enforce validation rules to prevent overlapping hotspots and ensure that each area maps to exactly one recording.
- **Audio capture**:
  - **MVP**: Allow manual upload of audio files per hotspot.
  - **Enhanced**: Integrate an in-browser recorder using the Web Audio API with playback and re-record controls.
  - Store audio in OPUS format to reduce file size while preserving clarity.
- **Page reuse**: Provide a library view where teachers can re-assign previously uploaded pages and their hotspot/audio bundles to new cohorts.

### Assignment Management
- Allow admins to promote Level 1 students to Level 2 so they can access the memoriser view.
- Support assignment to:
  - Individual students.
  - Groups (e.g. "Qa'idah Beginners").
- Enable drag-and-drop sequencing for the order in which pages appear.
- Provide a scheduling tool so teachers can decide which pages unlock per week.
- Add class-wide assignment options to push the same lesson to multiple groups.

### Monitoring & Feedback
- Show per-page stats, including number of hotspot replays and completion state ("Read", "Repeat").
- Maintain a student performance log that aggregates activities such as “listened to all hotspots on 3 pages this week”.
- Include a per-page teacher feedback panel to leave notes or corrections.
- Deliver dashboard notifications (web and in-app) such as “New Qa’idah page from your teacher!” and reminders for outstanding lessons.

## Student Experience

### Interactive Reader
- Present lessons as a flip-book interface using Turn.js/Folio, with swipe and button navigation.
- Provide a toggle (microphone icon) to enable/disable audio playback mode.
- Allow tapping on hotspots to highlight the region briefly and play the associated audio instantly.
- Include “Mark as Read” and “Repeat” buttons per page; track counts so teachers can review repetitions.
- Implement progress saving with visual indicators showing completed pages.
- Offer a night mode to improve readability in low-light environments.

### Memoriser Panel (Level 2)
- Display daily/weekly memorisation targets and progress bars for each plan.
- Provide audio playback with options for looped repetition.
- Offer a toggle to switch between the interactive Qa'idah layout and a regular Mushaf view where available.

## Audio Architecture
- Use the Web Audio API for precise playback controls and waveform visualisation.
- Cache audio files for quick repeat playback; consider using Service Workers for offline support where applicable.
- Manage playback and sequencing with Howler.js or an equivalent library to simplify API usage across browsers.

## Security & Access Control
- Extend capability checks with a custom map_meta_cap filter to gate editing to teachers:
  ```php
  add_filter('map_meta_cap', 'qaida_custom_caps', 10, 4);
  function qaida_custom_caps($caps, $cap, $user_id, $args) {
      if ('edit_qaida_page' === $cap) {
          if (user_can($user_id, 'teacher_role')) {
              $caps = ['edit_qaida_pages'];
          }
      }
      return $caps;
  }
  ```
- Ensure hotspot boundaries are validated on save to prevent overlap or off-image coordinates.
- Restrict audio uploads/recordings to authorised teachers and enforce MIME checks for security.

## Progressive Enhancement Roadmap
- **Version 1 (MVP)**
  - Image upload with basic hotspot creation.
  - Manual audio upload per hotspot.
  - Assignments to students or groups.
- **Version 2**
  - In-browser audio recording and playback.
  - Teacher feedback tools and class notifications.
  - Mobile app integration and memoriser panel features.

## UI/UX Recommendations
- **Level dashboard**: Use blue gradient cards for Level 2 learners with progress rings to display completion percentages.
- **Teacher dashboard**: Keep the panel clean with drag-and-drop sequencing, class-wide assignment actions, and student progress reports.
- **Student reader**: Provide simple touch targets, accessible colour contrast, and support for both landscape and portrait orientations.

## Technical Dependencies
- **Hotspot editor**: Fabric.js or a comparable canvas editor.
- **Audio processing**: Web Audio API + Howler.js for buffering and playback consistency.
- **Page flipping**: Turn.js or Folio for realistic animations.


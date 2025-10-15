=== AlfawzQuran ===
Contributors: Your Name
Donate Link: https://alfawzquran.com/donate
Tags: quran, memorization, reading, islam, muslim, progress, tracker, hasanat, leaderboard, wordpress
Requires at least: 5.0
Tested up to: 6.5
Stable tag: 1.0.0
License: GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A comprehensive WordPress plugin for Quran reading, memorization, and progress tracking.

== Description ==

AlfawzQuran is a powerful and intuitive WordPress plugin designed to help Muslims engage with the Quran more effectively. It provides tools for reading, memorizing, and tracking progress, all within your WordPress site.

**Key Features:**

*   **Quran Reader:** Read any Surah and Ayah (verse) with Arabic text and translation.
*   **Audio Playback:** Listen to recitations of individual verses.
*   **Memorization Mode:** Dedicated interface for memorizing verses with repetition tracking.
*   **Memorization Plans:** Create custom plans to memorize specific ranges of verses, track progress, and restart plans.
*   **Progress Tracking:** Automatically track verses read, verses memorized, and Hasanat earned.
*   **Daily Streaks:** Motivate users with daily reading/memorization streaks.
*   **Bookmarks:** Save your favorite verses or where you left off.
*   **Leaderboard:** Foster healthy competition by displaying top users based on Hasanat.
*   **User Profile:** A personalized dashboard for each user to view their stats and achievements.
*   **Admin Dashboard:** Overview of all user activity and plugin statistics for site administrators.
*   **Customizable Settings:** Adjust Hasanat per letter, daily verse targets, default reciter, and translation.
*   **Responsive Design:** Beautiful and functional on all devices (desktop, tablet, mobile).
*   **WordPress REST API Integration:** Secure and efficient data handling.
*   **Beautiful UI:** Modern, clean, and user-friendly interface.
*   **Bottom Navigation:** Enhanced mobile navigation for easy access to all features.

AlfawzQuran aims to be your companion in your Quranic journey, making it easier and more rewarding to connect with the Holy Book.

== Installation ==

1.  **Upload:**
    *   Download the plugin zip file.
    *   Go to your WordPress admin dashboard.
    *   Navigate to `Plugins > Add New > Upload Plugin`.
    *   Click "Choose File" and select the downloaded zip file.
    *   Click "Install Now".
2.  **Activate:**
    *   After installation, click "Activate Plugin".
3.  **Configure:**
    *   Go to `AlfawzQuran > Settings` in your WordPress admin menu to configure general settings and create memorization plans.
4.  **Add Shortcodes to Pages:**
    *   Create new WordPress pages (e.g., "Quran Dashboard", "Quran Reader", "Quran Memorizer", "Leaderboard", "Profile", "Settings").
    *   Add the respective shortcodes to these pages:
        *   `[alfawz_dashboard]` for the main user dashboard.
        *   `[alfawz_reader]` for the Quran reading interface.
        *   `[alfawz_memorizer]` for the memorization interface.
        *   `[alfawz_leaderboard]` for the user leaderboard.
        *   `[alfawz_profile]` for the user profile page.
        *   `[alfawz_settings]` for user settings and plan creation.
    *   Ensure these pages are accessible to your users (e.g., via your site's navigation menu).

== Frequently Asked Questions ==

= What is Hasanat? =
Hasanat (حسنات) are good deeds or rewards in Islam. In this plugin, Hasanat are calculated based on the number of Arabic letters read or memorized, providing a motivational metric for users.

= How are daily streaks calculated? =
Daily streaks are calculated based on a user's activity (reading or memorizing verses) on consecutive days. If a user performs any activity on a given day, their streak continues or starts. If they miss a day, the streak resets.

= Can I use my own reciter or translation? =
Currently, the plugin uses the Alquran.cloud API, which offers a wide range of reciters and translations. You can select your preferred default reciter and translation from the plugin settings.

= Is the leaderboard public? =
Yes, the leaderboard is public by default. You can disable it from the plugin settings if you prefer.

= What happens if I uninstall the plugin? =
Upon uninstallation, all plugin-related data (user progress, bookmarks, memorization plans, and settings) will be removed from your database.

= How can I get support? =
For support, please visit [Your Support URL] or contact us at [Your Email].

== Changelog ==

= 1.1.0 - 2025-10-15 =
*   Added dynamic Hasanat awards that calculate rewards per Arabic letter and sync totals across the reader, memorizer, dashboard, and leaderboard interfaces.
*   Introduced uplifting floating Hasanat animations and a REST endpoint that securely records each verse progression.

= 1.0.0 - 2025-08-08 =
*   Initial Release.
*   Core Quran Reader and Memorizer functionality.
*   User progress tracking (read, memorized, hasanat).
*   Daily streak calculation.
*   User bookmarks.
*   Leaderboard.
*   User profile page.
*   Admin dashboard for stats overview.
*   Memorization plan creation and tracking.
*   Responsive UI with beautiful design elements.
*   Bottom navigation for mobile.
*   WordPress REST API integration for all data operations.

== Upgrade Notice ==

= 1.0.0 =
Initial release. No upgrade notice needed.

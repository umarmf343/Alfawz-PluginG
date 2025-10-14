<div class="wrap">
    <h1><?php _e('AlfawzQuran Admin Dashboard', 'alfawzquran'); ?></h1>
    <p><?php _e('Welcome to the AlfawzQuran plugin dashboard. Here you can see an overview of your users\' progress and manage plugin settings.', 'alfawzquran'); ?></p>

    <div class="alfawz-admin-dashboard-grid">
        <div class="alfawz-admin-card">
            <h3><?php _e('Total Users', 'alfawzquran'); ?></h3>
            <p id="total-users-stat" class="alfawz-stat-number">Loading...</p>
        </div>
        <div class="alfawz-admin-card">
            <h3><?php _e('Total Hasanat Earned', 'alfawzquran'); ?></h3>
            <p id="total-hasanat-stat" class="alfawz-stat-number">Loading...</p>
        </div>
        <div class="alfawz-admin-card">
            <h3><?php _e('Total Verses Read', 'alfawzquran'); ?></h3>
            <p id="total-verses-read-stat" class="alfawz-stat-number">Loading...</p>
        </div>
        <div class="alfawz-admin-card">
            <h3><?php _e('Total Verses Memorized', 'alfawzquran'); ?></h3>
            <p id="total-verses-memorized-stat" class="alfawz-stat-number">Loading...</p>
        </div>
    </div>

    <div class="alfawz-admin-section">
        <h2><?php _e('Top Users by Hasanat', 'alfawzquran'); ?></h2>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th><?php _e('Rank', 'alfawzquran'); ?></th>
                    <th><?php _e('User', 'alfawzquran'); ?></th>
                    <th><?php _e('Total Hasanat', 'alfawzquran'); ?></th>
                    <th><?php _e('Verses Read', 'alfawzquran'); ?></th>
                    <th><?php _e('Verses Memorized', 'alfawzquran'); ?></th>
                    <th><?php _e('Current Streak', 'alfawzquran'); ?></th>
                </tr>
            </thead>
            <tbody id="leaderboard-admin-table">
                <tr><td colspan="6"><?php _e('Loading leaderboard...', 'alfawzquran'); ?></td></tr>
            </tbody>
        </table>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Load admin stats
    $.ajax({
        url: alfawzAdminData.apiUrl + 'stats',
        method: 'GET',
        headers: { 'X-WP-Nonce': alfawzAdminData.nonce },
        success: function(response) {
            if (response) {
                $('#total-users-stat').text(response.total_users || 0);
                $('#total-hasanat-stat').text((response.total_hasanat || 0).toLocaleString());
                $('#total-verses-read-stat').text(response.verses_read || 0);
                $('#total-verses-memorized-stat').text(response.verses_memorized || 0);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading admin stats:', error);
            $('#total-users-stat').text('N/A');
            $('#total-hasanat-stat').text('N/A');
            $('#total-verses-read-stat').text('N/A');
            $('#total-verses-memorized-stat').text('N/A');
        }
    });

    // Load leaderboard for admin
    $.ajax({
        url: alfawzAdminData.apiUrl + 'leaderboard',
        method: 'GET',
        headers: { 'X-WP-Nonce': alfawzAdminData.nonce },
        success: function(response) {
            const tbody = $('#leaderboard-admin-table');
            tbody.empty();
            if (response && response.length > 0) {
                $.each(response, function(index, user) {
                    tbody.append(
                        '<tr>' +
                            '<td>' + (index + 1) + '</td>' +
                            '<td>' + user.display_name + '</td>' +
                            '<td>' + parseInt(user.total_hasanat).toLocaleString() + '</td>' +
                            '<td>' + user.verses_read + '</td>' +
                            '<td>' + user.verses_memorized + '</td>' +
                            '<td>' + user.current_streak + '</td>' +
                        '</tr>'
                    );
                });
            } else {
                tbody.append('<tr><td colspan="6">No leaderboard data available.</td></tr>');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading admin leaderboard:', error);
            $('#leaderboard-admin-table').html('<tr><td colspan="6">Failed to load leaderboard.</td></tr>');
        }
    });
});
</script>

<style>
.alfawz-admin-dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.alfawz-admin-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    padding: 25px;
    text-align: center;
    border: 1px solid #e0e0e0;
}

.alfawz-admin-card h3 {
    font-size: 1.1em;
    color: #555;
    margin-top: 0;
    margin-bottom: 10px;
}

.alfawz-stat-number {
    font-size: 2.2em;
    font-weight: bold;
    color: #333;
}

.alfawz-admin-section {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    padding: 25px;
    border: 1px solid #e0e0e0;
}

.alfawz-admin-section h2 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    font-size: 1.5em;
}

.wp-list-table th, .wp-list-table td {
    padding: 12px 10px;
    vertical-align: middle;
}

.wp-list-table th {
    background-color: #f5f5f5;
    font-weight: bold;
    color: #666;
}

.wp-list-table tbody tr:nth-child(odd) {
    background-color: #f9f9f9;
}

.wp-list-table tbody tr:hover {
    background-color: #f0f0f0;
}
</style>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <div class="alfawz-admin-stats">
        <div class="alfawz-stats-summary">
            <div class="alfawz-summary-card">
                <h3><?php _e('Total Users', 'alfawzquran'); ?></h3>
                <div class="alfawz-summary-number"><?php echo count($user_stats); ?></div>
            </div>
            
            <div class="alfawz-summary-card">
                <h3><?php _e('Total Hasanat', 'alfawzquran'); ?></h3>
                <div class="alfawz-summary-number">
                    <?php 
                    $total_hasanat = array_sum(array_column($user_stats, 'total_hasanat'));
                    echo number_format($total_hasanat);
                    ?>
                </div>
            </div>
            
            <div class="alfawz-summary-card">
                <h3><?php _e('Total Verses Read', 'alfawzquran'); ?></h3>
                <div class="alfawz-summary-number">
                    <?php 
                    $total_verses = array_sum(array_column($user_stats, 'verses_read'));
                    echo number_format($total_verses);
                    ?>
                </div>
            </div>
            
            <div class="alfawz-summary-card">
                <h3><?php _e('Total Memorized', 'alfawzquran'); ?></h3>
                <div class="alfawz-summary-number">
                    <?php 
                    $total_memorized = array_sum(array_column($user_stats, 'verses_memorized'));
                    echo number_format($total_memorized);
                    ?>
                </div>
            </div>
        </div>
        
        <div class="alfawz-users-table">
            <h2><?php _e('Top Users', 'alfawzquran'); ?></h2>
            
            <?php if (!empty($user_stats)): ?>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th><?php _e('Rank', 'alfawzquran'); ?></th>
                            <th><?php _e('User', 'alfawzquran'); ?></th>
                            <th><?php _e('Email', 'alfawzquran'); ?></th>
                            <th><?php _e('Total Hasanat', 'alfawzquran'); ?></th>
                            <th><?php _e('Verses Read', 'alfawzquran'); ?></th>
                            <th><?php _e('Verses Memorized', 'alfawzquran'); ?></th>
                            <th><?php _e('Current Streak', 'alfawzquran'); ?></th>
                            <th><?php _e('Last Activity', 'alfawzquran'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($user_stats as $index => $user): ?>
                            <tr>
                                <td>
                                    <strong>#<?php echo $index + 1; ?></strong>
                                    <?php if ($index < 3): ?>
                                        <span class="alfawz-medal">
                                            <?php 
                                            $medals = ['🥇', '🥈', '🥉'];
                                            echo $medals[$index];
                                            ?>
                                        </span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <strong><?php echo esc_html($user->display_name); ?></strong>
                                </td>
                                <td>
                                    <a href="mailto:<?php echo esc_attr($user->user_email); ?>">
                                        <?php echo esc_html($user->user_email); ?>
                                    </a>
                                </td>
                                <td>
                                    <span class="alfawz-hasanat-badge">
                                        ⭐ <?php echo number_format($user->total_hasanat); ?>
                                    </span>
                                </td>
                                <td>
                                    <span class="alfawz-stat-badge alfawz-read-badge">
                                        📖 <?php echo number_format($user->verses_read); ?>
                                    </span>
                                </td>
                                <td>
                                    <span class="alfawz-stat-badge alfawz-memorized-badge">
                                        🧠 <?php echo number_format($user->verses_memorized); ?>
                                    </span>
                                </td>
                                <td>
                                    <span class="alfawz-stat-badge alfawz-streak-badge">
                                        🔥 <?php echo $user->current_streak; ?> days
                                    </span>
                                </td>
                                <td>
                                    <?php if ($user->last_activity): ?>
                                        <span title="<?php echo esc_attr($user->last_activity); ?>">
                                            <?php echo human_time_diff(strtotime($user->last_activity)); ?> ago
                                        </span>
                                    <?php else: ?>
                                        <span class="alfawz-no-activity"><?php _e('No activity', 'alfawzquran'); ?></span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <div class="alfawz-no-data">
                    <p><?php _e('No user statistics available yet.', 'alfawzquran'); ?></p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<style>
.alfawz-admin-stats {
    margin-top: 20px;
}

.alfawz-stats-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.alfawz-summary-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
    border-left: 4px solid #667eea;
}

.alfawz-summary-card h3 {
    margin: 0 0 10px 0;
    color: #2d3748;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.alfawz-summary-number {
    font-size: 2.5em;
    font-weight: 800;
    color: #667eea;
    margin: 0;
}

.alfawz-users-table {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.alfawz-users-table h2 {
    margin: 0 0 20px 0;
    color: #2d3748;
    font-size: 1.5em;
    font-weight: 700;
}

.alfawz-medal {
    font-size: 1.2em;
    margin-left: 5px;
}

.alfawz-hasanat-badge {
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #744210;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.9em;
}

.alfawz-stat-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.9em;
    color: white;
}

.alfawz-read-badge {
    background: linear-gradient(135deg, #667eea, #764ba2);
}

.alfawz-memorized-badge {
    background: linear-gradient(135deg, #48bb78, #38a169);
}

.alfawz-streak-badge {
    background: linear-gradient(135deg, #f56565, #e53e3e);
}

.alfawz-no-activity {
    color: #a0aec0;
    font-style: italic;
}

.alfawz-no-data {
    text-align: center;
    padding: 40px;
    color: #718096;
}

.alfawz-no-data p {
    font-size: 1.1em;
    margin: 0;
}

@media (max-width: 768px) {
    .alfawz-stats-summary {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .alfawz-summary-number {
        font-size: 2em;
    }
    
    .wp-list-table {
        font-size: 0.9em;
    }
    
    .alfawz-stat-badge,
    .alfawz-hasanat-badge {
        font-size: 0.8em;
        padding: 2px 6px;
    }
}
</style>

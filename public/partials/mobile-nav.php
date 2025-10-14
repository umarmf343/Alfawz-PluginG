<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! function_exists( 'alfawz_get_mobile_nav_items' ) ) {
    function alfawz_get_mobile_nav_items() {
        return [
            [
                'slug'  => 'dashboard',
                'icon'  => '🏠',
                'label' => __( 'Dashboard', 'alfawzquran' ),
            ],
            [
                'slug'  => 'reader',
                'icon'  => '📖',
                'label' => __( 'Reader', 'alfawzquran' ),
            ],
            [
                'slug'  => 'memorizer',
                'icon'  => '🧠',
                'label' => __( 'Memorizer', 'alfawzquran' ),
            ],
            [
                'slug'  => 'leaderboard',
                'icon'  => '🏆',
                'label' => __( 'Leaderboard', 'alfawzquran' ),
            ],
            [
                'slug'  => 'profile',
                'icon'  => '👤',
                'label' => __( 'Profile', 'alfawzquran' ),
            ],
        ];
    }
}

if ( ! function_exists( 'alfawz_get_mobile_nav_url' ) ) {
    function alfawz_get_mobile_nav_url( $slug ) {
        $potential_slugs = [
            $slug,
            'alfawz-' . $slug,
        ];

        foreach ( $potential_slugs as $path ) {
            $page = get_page_by_path( $path );
            if ( $page ) {
                return get_permalink( $page );
            }
        }

        $filtered = apply_filters( 'alfawz_mobile_nav_url', '', $slug );
        if ( ! empty( $filtered ) ) {
            return $filtered;
        }

        return home_url( trailingslashit( $slug ) );
    }
}

$current_page = isset( $current_page ) ? $current_page : '';
$nav_items    = apply_filters( 'alfawz_mobile_nav_items', alfawz_get_mobile_nav_items(), $current_page );

if ( $current_page ) {
    if ( ! function_exists( 'wp_list_pluck' ) ) {
        require_once ABSPATH . 'wp-includes/functions.php';
    }

    $existing_slugs = wp_list_pluck( $nav_items, 'slug' );
    if ( ! in_array( $current_page, $existing_slugs, true ) ) {
        $replacements = apply_filters(
            'alfawz_mobile_nav_replacements',
            [
                'games'    => [
                    'slug'  => 'games',
                    'icon'  => '🎮',
                    'label' => __( 'Games', 'alfawzquran' ),
                ],
                'settings' => [
                    'slug'  => 'settings',
                    'icon'  => '⚙️',
                    'label' => __( 'Settings', 'alfawzquran' ),
                ],
            ],
            $current_page
        );

        if ( isset( $replacements[ $current_page ] ) ) {
            $replacement_index = array_search( 'leaderboard', $existing_slugs, true );

            if ( false === $replacement_index ) {
                $replacement_index = count( $nav_items ) - 1;
            }

            $nav_items[ $replacement_index ] = $replacements[ $current_page ];
        }
    }
}

?>
<nav class="alfawz-bottom-navigation md:hidden" data-current-page="<?php echo esc_attr( $current_page ); ?>" aria-label="<?php echo esc_attr__( 'Primary mobile navigation', 'alfawzquran' ); ?>">
    <div class="alfawz-nav-container">
        <?php foreach ( $nav_items as $item ) :
            if ( empty( $item['slug'] ) ) {
                continue;
            }

            $is_active    = $current_page === $item['slug'];
            $nav_classes  = 'alfawz-nav-item flex flex-col items-center justify-center gap-1 text-xs';
            $nav_classes .= $is_active ? ' active' : '';
            $nav_url      = isset( $item['url'] ) ? $item['url'] : alfawz_get_mobile_nav_url( $item['slug'] );
            ?>
            <a href="<?php echo esc_url( $nav_url ); ?>" class="<?php echo esc_attr( $nav_classes ); ?>" data-page="<?php echo esc_attr( $item['slug'] ); ?>"<?php echo $is_active ? ' aria-current="page"' : ''; ?>>
                <span class="alfawz-nav-icon"><?php echo esc_html( $item['icon'] ); ?></span>
                <span class="alfawz-nav-label"><?php echo esc_html( $item['label'] ); ?></span>
            </a>
        <?php endforeach; ?>
    </div>
</nav>

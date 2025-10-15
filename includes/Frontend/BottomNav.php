<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'wp_footer', 'alfawz_render_bottom_nav' );
add_action( 'wp_head', 'alfawz_add_bottom_nav_padding' );
add_action( 'wp_enqueue_scripts', 'alfawz_enqueue_bottom_nav_assets' );

function alfawz_add_bottom_nav_padding() {
    if ( is_admin() || ! is_user_logged_in() ) {
        return;
    }

    echo '<style>body{padding-bottom:70px;padding-bottom:calc(70px + env(safe-area-inset-bottom));}</style>';
}

function alfawz_enqueue_bottom_nav_assets() {
    if ( is_admin() || ! is_user_logged_in() ) {
        return;
    }

    wp_enqueue_style(
        'alfawz-tailwind',
        'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
        [],
        '2.2.19'
    );

    wp_enqueue_style(
        'alfawz-bottom-nav',
        ALFAWZQURAN_PLUGIN_URL . 'assets/css/bottom-nav.css',
        [ 'alfawz-tailwind' ],
        ALFAWZQURAN_VERSION
    );

    wp_enqueue_script(
        'alfawz-bottom-nav',
        ALFAWZQURAN_PLUGIN_URL . 'assets/js/bottom-nav.js',
        [],
        ALFAWZQURAN_VERSION,
        true
    );
}

function alfawz_render_bottom_nav() {
    if ( is_admin() || ! is_user_logged_in() ) {
        return;
    }

    $role      = alfawz_get_user_role();
    $tabs      = alfawz_get_nav_tabs( $role );
    $current   = alfawz_get_current_tab_slug();
    $has_tabs  = ! empty( $tabs );

    if ( ! $has_tabs ) {
        return;
    }
    ?>
    <nav id="alfawz-bottom-nav" class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-gray-200 shadow-lg backdrop-blur" data-current="<?php echo esc_attr( $current ); ?>" aria-label="<?php esc_attr_e( 'Primary navigation', 'alfawzquran' ); ?>">
        <div class="mx-auto max-w-4xl">
            <div class="alfawz-bottom-nav__list flex items-stretch gap-1 overflow-x-auto hide-scrollbar px-2 py-2" data-nav-scroll>
                <?php foreach ( $tabs as $tab ) :
                    $is_active = ! empty( $tab['active'] );
                    $classes   = 'alfawz-bottom-nav__tab flex min-w-[80px] min-h-[48px] flex-col items-center justify-center rounded-xl px-3 py-2 text-center text-xs transition-colors snap-center shrink-0';
                    $classes  .= $is_active ? ' bg-emerald-50 text-emerald-600 font-semibold' : ' text-slate-500 hover:text-emerald-600 focus:text-emerald-600';
                    ?>
                    <a href="<?php echo esc_url( $tab['url'] ); ?>" class="<?php echo esc_attr( $classes ); ?>" data-slug="<?php echo esc_attr( $tab['slug'] ); ?>"<?php echo $is_active ? ' aria-current="page"' : ''; ?>>
                        <span class="text-xl" aria-hidden="true"><?php echo esc_html( $tab['icon'] ); ?></span>
                        <span class="mt-1 text-[11px] font-medium leading-tight"><?php echo esc_html( $tab['label'] ); ?></span>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>
    </nav>
    <?php
}

function alfawz_get_user_role() {
    if ( ! is_user_logged_in() ) {
        return 'guest';
    }

    $user = wp_get_current_user();

    if ( user_can( $user, 'manage_options' ) ) {
        return 'admin';
    }

    $teacher_roles = apply_filters( 'alfawz_teacher_roles', [ 'teacher', 'editor' ] );
    if ( array_intersect( $teacher_roles, (array) $user->roles ) || user_can( $user, 'edit_posts' ) ) {
        return 'teacher';
    }

    return 'student';
}

function alfawz_get_nav_tabs( $role ) {
    $tabs = [
        'dashboard'   => [ 'slug' => 'dashboard', 'icon' => '📊', 'label' => __( 'Dashboard', 'alfawzquran' ) ],
        'reader'      => [ 'slug' => 'reader', 'icon' => '📖', 'label' => __( 'Reader', 'alfawzquran' ) ],
        'memorizer'   => [ 'slug' => 'memorizer', 'icon' => '🧠', 'label' => __( 'Memorization', 'alfawzquran' ) ],
        'qaidah'      => [ 'slug' => 'qaidah', 'icon' => '📚', 'label' => __( "Qa'idah", 'alfawzquran' ) ],
        'leaderboard' => [ 'slug' => 'leaderboard', 'icon' => '🏆', 'label' => __( 'Leaderboard', 'alfawzquran' ) ],
        'profile'     => [ 'slug' => 'profile', 'icon' => '👤', 'label' => __( 'Profile', 'alfawzquran' ) ],
        'teacher'     => [ 'slug' => 'teacher-dashboard', 'icon' => '🏫', 'label' => __( 'Teacher Dashboard', 'alfawzquran' ) ],
        'admin'       => [ 'slug' => 'admin-dashboard', 'icon' => '🛠️', 'label' => __( 'Admin Dashboard', 'alfawzquran' ) ],
    ];

    $order = [];

    if ( 'teacher' === $role ) {
        $order = [ 'dashboard', 'reader', 'memorizer', 'qaidah', 'teacher', 'profile' ];
    } elseif ( 'admin' === $role ) {
        $order = [ 'dashboard', 'reader', 'memorizer', 'qaidah', 'leaderboard', 'profile', 'teacher', 'admin' ];
    } else {
        $order = [ 'dashboard', 'reader', 'memorizer', 'qaidah', 'leaderboard', 'profile' ];
    }

    $current = alfawz_get_current_tab_slug();

    $nav_tabs = [];
    foreach ( $order as $key ) {
        if ( ! isset( $tabs[ $key ] ) ) {
            continue;
        }

        $tab = $tabs[ $key ];
        $url = alfawz_get_bottom_nav_url( $tab['slug'] );
        $tab['url']    = apply_filters( 'alfawz_bottom_nav_tab_url', $url, $tab, $role );
        $is_active     = $tab['slug'] === $current;
        $tab['active'] = apply_filters( 'alfawz_bottom_nav_is_active', $is_active, $tab, $current, $role );

        $nav_tabs[] = $tab;
    }

    return apply_filters( 'alfawz_bottom_nav_tabs', $nav_tabs, $role, $current );
}

function alfawz_get_bottom_nav_url( $slug ) {
    $candidates = [ $slug, 'alfawz-' . $slug, 'alfawz_' . $slug ];

    foreach ( $candidates as $candidate ) {
        $page = get_page_by_path( $candidate );
        if ( $page ) {
            return get_permalink( $page );
        }
    }

    $filtered = apply_filters( 'alfawz_bottom_nav_url', '', $slug );
    if ( ! empty( $filtered ) ) {
        return $filtered;
    }

    $legacy = apply_filters( 'alfawz_mobile_nav_url', '', $slug );
    if ( ! empty( $legacy ) ) {
        return $legacy;
    }

    return home_url( trailingslashit( $slug ) );
}

function alfawz_get_current_tab_slug() {
    global $post;

    if ( isset( $_GET['page'] ) ) {
        $page = sanitize_key( wp_unslash( $_GET['page'] ) );
        $page = str_replace( [ 'alfawz_', 'alfawz-' ], '', $page );
        return str_replace( '_', '-', $page );
    }

    if ( is_page() && $post instanceof \WP_Post ) {
        $slug = $post->post_name;
        $slug = str_replace( [ 'alfawz-', 'alfawz_' ], '', $slug );
        return str_replace( '_', '-', $slug );
    }

    $path = trim( wp_parse_url( add_query_arg( [] ), PHP_URL_PATH ), '/' );
    if ( ! empty( $path ) ) {
        $parts = explode( '/', $path );
        $slug  = end( $parts );
        $slug  = str_replace( [ 'alfawz-', 'alfawz_' ], '', $slug );
        return str_replace( '_', '-', $slug );
    }

    return '';
}

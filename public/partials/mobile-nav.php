<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( empty( $tabs ) || ! is_array( $tabs ) ) {
    return;
}

$active_slug = isset( $active_slug ) ? $active_slug : '';
$role        = isset( $role ) ? $role : 'student';
?>
<nav
    id="alfawz-bottom-nav"
    class="alfawz-bottom-navigation fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-8px_24px_rgba(15,118,110,0.15)] z-[60]"
    data-role="<?php echo esc_attr( $role ); ?>"
    data-active-tab="<?php echo esc_attr( $active_slug ); ?>"
    style="padding-bottom: env(safe-area-inset-bottom);"
    aria-label="<?php esc_attr_e( 'Primary navigation', 'alfawzquran' ); ?>"
>
    <div class="mx-auto w-full max-w-5xl px-2 sm:px-4">
        <div class="alfawz-bottom-nav-track flex items-stretch justify-between gap-2 overflow-x-auto md:overflow-x-visible md:justify-center md:gap-4 alfawz-hide-scrollbar scroll-smooth snap-x snap-mandatory md:snap-none py-2">
            <?php foreach ( $tabs as $tab ) :
                if ( empty( $tab['slug'] ) ) {
                    continue;
                }

                $is_active      = $active_slug === $tab['slug'];
                $link_classes   = 'group flex min-w-[80px] min-h-[48px] flex-col items-center justify-center rounded-xl px-3 py-2 text-xs font-medium transition-colors duration-200';
                $link_classes  .= $is_active ? ' text-emerald-600 font-semibold' : ' text-slate-500';
                $label_classes  = 'mt-1 text-[0.7rem] tracking-wide';
                ?>
                <a
                    href="<?php echo esc_url( $tab['url'] ); ?>"
                    class="<?php echo esc_attr( $link_classes ); ?>"
                    data-slug="<?php echo esc_attr( $tab['slug'] ); ?>"
                    data-active="<?php echo $is_active ? 'true' : 'false'; ?>"
                    <?php echo $is_active ? 'aria-current="page"' : ''; ?>
                >
                    <span class="text-xl leading-none" aria-hidden="true"><?php echo esc_html( $tab['icon'] ); ?></span>
                    <span class="<?php echo esc_attr( $label_classes ); ?>"><?php echo esc_html( $tab['label'] ); ?></span>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</nav>

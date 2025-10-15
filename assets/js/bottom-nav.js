(function () {
  const normalizeUrl = (url) => {
    if (!url) {
      return '';
    }
    try {
      const parsed = new URL(url, window.location.origin);
      parsed.hash = '';
      if (!parsed.pathname.endsWith('/')) {
        parsed.pathname += '/';
      }
      return parsed.toString();
    } catch (error) {
      return url;
    }
  };

  const setActiveLink = (links, target) => {
    links.forEach((link) => {
      link.classList.remove('text-emerald-600', 'font-semibold', 'bg-emerald-50');
      link.classList.add('text-slate-500');
      link.removeAttribute('aria-current');
    });
    if (target) {
      target.classList.remove('text-slate-500');
      target.classList.add('text-emerald-600', 'font-semibold', 'bg-emerald-50');
      target.setAttribute('aria-current', 'page');
    }
  };

  const activateFromLocation = (nav, links) => {
    const currentSlug = nav.dataset.current || '';
    const locationUrl = normalizeUrl(window.location.href);

    let matched = null;
    if (currentSlug) {
      matched = Array.from(links).find((link) => link.dataset.slug === currentSlug);
    }

    if (!matched) {
      matched = Array.from(links).find((link) => normalizeUrl(link.href) === locationUrl);
    }

    if (!matched) {
      matched = Array.from(links).find((link) => {
        const slug = link.dataset.slug;
        if (!slug) {
          return false;
        }
        return locationUrl.endsWith(`/${slug}/`) || locationUrl.includes(`page=${slug}`);
      });
    }

    if (matched) {
      setActiveLink(links, matched);
    }
  };

  const initBottomNav = () => {
    const nav = document.getElementById('alfawz-bottom-nav');
    if (!nav) {
      return;
    }

    const links = nav.querySelectorAll('a[data-slug]');
    if (links.length === 0) {
      return;
    }

    const scroller = nav.querySelector('[data-nav-scroll]');
    if (scroller) {
      const hasOverflow = scroller.scrollWidth > scroller.clientWidth + 1;
      scroller.classList.toggle('snap-x', hasOverflow);
      scroller.classList.toggle('snap-mandatory', hasOverflow);
      scroller.classList.toggle('scroll-smooth', hasOverflow);
    }

    activateFromLocation(nav, links);

    nav.addEventListener('click', (event) => {
      const target = event.target.closest('a[data-slug]');
      if (!target) {
        return;
      }
      setActiveLink(links, target);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBottomNav);
  } else {
    initBottomNav();
  }
})();

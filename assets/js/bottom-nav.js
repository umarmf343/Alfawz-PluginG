(function () {
  const data = window.alfawzBottomNavData || {};

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

  const buildApiUrl = (path) => {
    const base = typeof data.apiUrl === 'string' ? data.apiUrl : '';
    if (!base) {
      return '';
    }
    const trimmedBase = base.replace(/\/+$/, '/');
    const cleanPath = String(path || '').replace(/^\/+/, '');
    return `${trimmedBase}${cleanPath}`;
  };

  const accessibilityStorageKey = (() => {
    if (data && typeof data.accessibilityStorageKey === 'string') {
      return data.accessibilityStorageKey;
    }
    const globalData = window.alfawzData;
    if (globalData?.accessibility?.storageKey) {
      return String(globalData.accessibility.storageKey);
    }
    return 'alfawzAccessibilityPrefs';
  })();

  const parseAccessibilityPrefs = (rawValue) => {
    if (!rawValue) {
      return {};
    }
    try {
      const parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
      if (!parsed || typeof parsed !== 'object') {
        return {};
      }
      return parsed;
    } catch (error) {
      return {};
    }
  };

  const readAccessibilityPrefs = () => {
    if (!window.localStorage) {
      return {};
    }
    try {
      const raw = window.localStorage.getItem(accessibilityStorageKey);
      return parseAccessibilityPrefs(raw);
    } catch (error) {
      return {};
    }
  };

  const SENIOR_MODE_TABS = ['dashboard', 'reader', 'profile'];
  let seniorModeEnabled = false;

  const storageKey = `alfawzQaidahSeen:${data.userId || 'guest'}`;

  const readSeenAssignments = () => {
    if (!window.localStorage) {
      return {};
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (error) {
      // Ignore parsing/storage errors.
    }
    return {};
  };

  const writeSeenAssignments = (records) => {
    if (!window.localStorage) {
      return;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(records));
    } catch (error) {
      // Ignore storage errors (e.g. quota exceeded or private mode).
    }
  };

  const getAssignmentSignature = (assignment) => {
    if (!assignment || assignment.id === undefined || assignment.id === null) {
      return 'seen';
    }
    if (assignment.updated) {
      return String(assignment.updated);
    }
    if (assignment.status) {
      return String(assignment.status);
    }
    if (assignment.is_new) {
      return 'new';
    }
    return 'seen';
  };

  const getNewAssignmentCount = (assignments, seenRecords) => {
    if (!Array.isArray(assignments)) {
      return 0;
    }
    const seen = seenRecords || {};
    let count = 0;

    assignments.forEach((assignment) => {
      if (!assignment || assignment.id === undefined || assignment.id === null) {
        return;
      }
      const id = String(assignment.id);
      const signature = getAssignmentSignature(assignment);
      if (seen[id] !== signature) {
        count += 1;
      }
    });

    return count;
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

  let qaidahIndicatorApi = null;
  let pollTimer = null;
  let visibilityListenerAttached = false;

  const initQaidahIndicator = (nav) => {
    const role = (nav.dataset.role || data.role || '').toLowerCase();
    if (role !== 'student') {
      return;
    }

    const badge = nav.querySelector('[data-qaidah-indicator]');
    if (!badge) {
      return;
    }
    const announcement = nav.querySelector('[data-qaidah-indicator-announcement]');

    const labelText = (count) => {
      const baseLabel = data.strings && data.strings.badgeLabel ? data.strings.badgeLabel : "new Qa'idah assignments";
      if (count === 1) {
        return `1 ${baseLabel}`;
      }
      return `${count} ${baseLabel}`;
    };

    let cachedAssignments = [];

    const updateBadge = (count) => {
      const previousCount = parseInt(badge.getAttribute('data-count') || '0', 10);
      if (count > 0) {
        const displayCount = count > 99 ? '99+' : String(count);
        badge.textContent = displayCount;
        badge.setAttribute('data-count', String(count));
        const shouldAnimate = !badge.classList.contains('is-visible') || previousCount !== count;
        badge.classList.add('is-visible');
        if (shouldAnimate) {
          badge.classList.remove('is-pop');
          void badge.offsetWidth;
          badge.classList.add('is-pop');
        }
      } else {
        badge.textContent = '';
        badge.removeAttribute('data-count');
        badge.classList.remove('is-visible', 'is-pop');
      }
      if (announcement) {
        announcement.textContent = count > 0 ? labelText(count) : '';
      }
    };

    const syncAssignments = (assignments) => {
      cachedAssignments = Array.isArray(assignments) ? assignments : [];
      const seen = readSeenAssignments();
      const newCount = getNewAssignmentCount(cachedAssignments, seen);
      updateBadge(newCount);
      return newCount;
    };

    const markAssignmentsAsSeen = (assignments) => {
      const list = Array.isArray(assignments) ? assignments : cachedAssignments;
      if (!list.length) {
        updateBadge(0);
        return;
      }

      const seen = readSeenAssignments();
      let changed = false;

      list.forEach((assignment) => {
        if (!assignment || assignment.id === undefined || assignment.id === null) {
          return;
        }
        const id = String(assignment.id);
        const signature = getAssignmentSignature(assignment);
        if (seen[id] !== signature) {
          seen[id] = signature;
          changed = true;
        }
      });

      if (changed) {
        writeSeenAssignments(seen);
      }

      updateBadge(0);
    };

    const fetchAssignments = async () => {
      const url = buildApiUrl('qaidah/assignments');
      if (!url) {
        return [];
      }
      const headers = {};
      if (data.nonce) {
        headers['X-WP-Nonce'] = data.nonce;
      }
      const response = await fetch(url, {
        headers,
        credentials: 'same-origin',
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const payload = await response.json();
      return Array.isArray(payload) ? payload : [];
    };

    const refresh = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      try {
        const assignments = await fetchAssignments();
        syncAssignments(assignments);
      } catch (error) {
        console.error("[AlfawzQuran] Failed to refresh Qa'idah assignments", error);
      }
    };

    const api = {
      refresh,
      syncAssignments,
      markAssignmentsAsSeen,
      getCachedAssignments: () => cachedAssignments.slice(),
    };

    qaidahIndicatorApi = api;
    window.alfawzQaidahIndicator = api;

    refresh();

    if (!visibilityListenerAttached && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && qaidahIndicatorApi) {
          qaidahIndicatorApi.refresh();
        }
      });
      visibilityListenerAttached = true;
    }

    if (!pollTimer) {
      const interval = typeof data.pollInterval === 'number' ? data.pollInterval : 60000;
      if (interval > 0) {
        pollTimer = setInterval(() => {
          if (qaidahIndicatorApi) {
            qaidahIndicatorApi.refresh();
          }
        }, Math.max(15000, interval));
      }
    }
  };

  const initBottomNav = () => {
    const nav = document.getElementById('alfawz-bottom-nav');
    if (!nav) {
      return;
    }

    if (document.body) {
      document.body.classList.add('has-alfawz-bottom-nav');
    }

    const links = Array.from(nav.querySelectorAll('a[data-slug]'));
    if (links.length === 0) {
      return;
    }

    const getAllowedSeniorTabs = () => {
      const allowed = new Set(SENIOR_MODE_TABS);
      if (seniorModeEnabled) {
        const current = nav.dataset.current || '';
        if (current) {
          allowed.add(current);
        }
      }
      return allowed;
    };

    const applySeniorMode = (enabled) => {
      seniorModeEnabled = Boolean(enabled);
      nav.classList.toggle('alfawz-bottom-nav--senior', seniorModeEnabled);
      const allowed = getAllowedSeniorTabs();
      links.forEach((link) => {
        const slug = link.dataset.slug || '';
        const visible = !seniorModeEnabled || allowed.has(slug);
        link.classList.toggle('alfawz-bottom-nav__tab--hidden', !visible);
        if (visible) {
          link.removeAttribute('aria-hidden');
          link.tabIndex = 0;
        } else {
          link.setAttribute('aria-hidden', 'true');
          link.tabIndex = -1;
        }
      });
    };

    const syncSeniorMode = (prefs) => {
      const source = prefs && typeof prefs === 'object' ? prefs : readAccessibilityPrefs();
      applySeniorMode(Boolean(source.seniorMode));
    };

    const scroller = nav.querySelector('[data-nav-scroll]');
    if (scroller) {
      const hasOverflow = scroller.scrollWidth > scroller.clientWidth + 1;
      scroller.classList.toggle('snap-x', hasOverflow);
      scroller.classList.toggle('snap-mandatory', hasOverflow);
      scroller.classList.toggle('scroll-smooth', hasOverflow);

      const handleWheelScroll = (event) => {
        if (!event) {
          return;
        }

        const deltaY = event.deltaY;
        const deltaX = event.deltaX;
        if (Math.abs(deltaY) <= Math.abs(deltaX)) {
          return;
        }

        scroller.scrollBy({ left: deltaY, behavior: 'smooth' });
        event.preventDefault();
      };

      scroller.addEventListener('wheel', handleWheelScroll, { passive: false });
    }

    activateFromLocation(nav, links);
    syncSeniorMode();
    initQaidahIndicator(nav);

    window.addEventListener('alfawz:accessibility-change', (event) => {
      syncSeniorMode(event?.detail?.prefs);
    });

    window.addEventListener('storage', (event) => {
      if (event.key === accessibilityStorageKey) {
        syncSeniorMode(parseAccessibilityPrefs(event.newValue));
      }
    });

    nav.addEventListener('click', (event) => {
      const target = event.target.closest('a[data-slug]');
      if (!target) {
        return;
      }
      setActiveLink(links, target);
      if (target.dataset.slug) {
        nav.dataset.current = target.dataset.slug;
      }
      if (seniorModeEnabled) {
        applySeniorMode(true);
      }
      if (target.dataset.slug === 'qaidah' && qaidahIndicatorApi && typeof qaidahIndicatorApi.markAssignmentsAsSeen === 'function') {
        qaidahIndicatorApi.markAssignmentsAsSeen();
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBottomNav);
  } else {
    initBottomNav();
  }
})();

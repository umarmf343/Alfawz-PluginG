(() => {
  const root = document.querySelector('[data-alfawz-accessibility]');
  if (!root) {
    return;
  }

  const data = window.alfawzData || {};
  const doc = document.documentElement;
  const panel = root.querySelector('[data-accessibility-panel]');
  const openButton = root.querySelector('[data-accessibility-open]');
  const closeButton = root.querySelector('[data-accessibility-close]');
  const status = root.querySelector('[data-accessibility-status]');
  const dyslexiaToggle = root.querySelector('[data-dyslexia-toggle] input');
  const seniorToggle = root.querySelector('[data-senior-toggle] input');
  const textSizeButtons = root.querySelectorAll('[data-text-size]');
  const contrastButtons = root.querySelectorAll('[data-contrast]');

  const strings = {
    saved: data.strings?.accessibilitySaved || 'Accessibility preferences saved.',
    error: data.strings?.accessibilityError || 'Unable to save accessibility preferences.',
  };

  const storageKey = 'alfawzAccessibilityPreferences';

  const hasStorage = (() => {
    try {
      const testKey = '__alfawz_accessibility_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  })();

  const readStoredState = () => {
    if (!hasStorage) {
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
      // Ignore parse errors.
    }
    return {};
  };

  const writeStoredState = (state) => {
    if (!hasStorage) {
      return;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      // Ignore storage errors (private mode, quota, etc.).
    }
  };

  const focusElement = (element) => {
    if (!element || typeof element.focus !== 'function') {
      return;
    }
    try {
      element.focus({ preventScroll: true });
    } catch (error) {
      element.focus();
    }
  };

  const defaultState = {
    textSize: data.userPreferences?.text_size || 'medium',
    contrast: data.userPreferences?.contrast_mode || 'default',
    dyslexia: Boolean(data.userPreferences?.dyslexia_font),
    seniorMode: Boolean(data.userPreferences?.senior_mode),
  };

  let state = { ...defaultState, ...readStoredState() };
  let saveTimer = null;
  let isSaving = false;
  let pendingSave = false;

  const syncBodyState = () => {
    doc.classList.toggle('alfawz-text-large', state.textSize === 'large');
    doc.classList.toggle('alfawz-contrast-high', state.contrast === 'high');
    doc.classList.toggle('alfawz-dyslexia-font', Boolean(state.dyslexia));
    doc.classList.toggle('alfawz-senior-nav', Boolean(state.seniorMode));
  };

  const syncUiState = () => {
    textSizeButtons.forEach((button) => {
      const { textSize } = button.dataset;
      const isActive = textSize === state.textSize;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    contrastButtons.forEach((button) => {
      const { contrast } = button.dataset;
      const isActive = contrast === state.contrast;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (dyslexiaToggle) {
      dyslexiaToggle.checked = Boolean(state.dyslexia);
    }

    if (seniorToggle) {
      seniorToggle.checked = Boolean(state.seniorMode);
    }
  };

  const dispatchChange = () => {
    const detail = {
      textSize: state.textSize,
      contrast: state.contrast,
      dyslexia: Boolean(state.dyslexia),
      seniorMode: Boolean(state.seniorMode),
    };
    window.alfawzData = window.alfawzData || {};
    window.alfawzData.userPreferences = {
      ...(window.alfawzData.userPreferences || {}),
      text_size: detail.textSize,
      contrast_mode: detail.contrast,
      dyslexia_font: detail.dyslexia,
      senior_mode: detail.seniorMode,
    };
    window.dispatchEvent(new CustomEvent('alfawz:accessibilityChange', { detail }));
  };

  const updateStatus = (message, tone = 'info') => {
    if (!status) {
      return;
    }
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const savePreferences = async () => {
    if (!data.isLoggedIn || !data.apiUrl) {
      updateStatus(strings.saved, 'info');
      return;
    }

    if (isSaving) {
      pendingSave = true;
      return;
    }

    isSaving = true;
    pendingSave = false;

    const payload = {
      text_size: state.textSize,
      contrast_mode: state.contrast,
      dyslexia_font: state.dyslexia ? 1 : 0,
      senior_mode: state.seniorMode ? 1 : 0,
    };

    try {
      const response = await fetch(`${data.apiUrl.replace(/\/+$/, '/') }user-preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(data.nonce ? { 'X-WP-Nonce': data.nonce } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const json = await response.json();
      if (json && typeof json === 'object') {
        state = {
          ...state,
          textSize: json.text_size || state.textSize,
          contrast: json.contrast_mode || state.contrast,
          dyslexia: Boolean(json.dyslexia_font),
          seniorMode: Boolean(json.senior_mode),
        };
        dispatchChange();
      }
      updateStatus(strings.saved, 'success');
    } catch (error) {
      console.warn('[AlfawzQuran] Unable to save accessibility preferences', error);
      updateStatus(strings.error, 'error');
    } finally {
      isSaving = false;
      if (pendingSave) {
        savePreferences();
      }
    }
  };

  const scheduleSave = () => {
    writeStoredState({
      textSize: state.textSize,
      contrast: state.contrast,
      dyslexia: Boolean(state.dyslexia),
      seniorMode: Boolean(state.seniorMode),
    });
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(savePreferences, 400);
  };

  const setState = (next) => {
    const updated = { ...state, ...next };
    const changed =
      updated.textSize !== state.textSize
      || updated.contrast !== state.contrast
      || Boolean(updated.dyslexia) !== Boolean(state.dyslexia)
      || Boolean(updated.seniorMode) !== Boolean(state.seniorMode);

    state = updated;
    if (!changed) {
      return;
    }

    syncBodyState();
    syncUiState();
    dispatchChange();
    scheduleSave();
  };

  const openPanel = () => {
    if (!panel) {
      return;
    }
    panel.hidden = false;
    root.classList.add('is-open');
    openButton?.setAttribute('aria-expanded', 'true');
    focusElement(panel);
  };

  const closePanel = () => {
    if (!panel) {
      return;
    }
    panel.hidden = true;
    root.classList.remove('is-open');
    openButton?.setAttribute('aria-expanded', 'false');
    focusElement(openButton);
  };

  textSizeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const { textSize } = button.dataset;
      if (!textSize) {
        return;
      }
      setState({ textSize });
    });
  });

  contrastButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const { contrast } = button.dataset;
      if (!contrast) {
        return;
      }
      setState({ contrast });
    });
  });

  dyslexiaToggle?.addEventListener('change', (event) => {
    setState({ dyslexia: Boolean(event.target.checked) });
  });

  seniorToggle?.addEventListener('change', (event) => {
    setState({ seniorMode: Boolean(event.target.checked) });
  });

  openButton?.addEventListener('click', () => {
    if (panel?.hidden) {
      openPanel();
    } else {
      closePanel();
    }
  });

  closeButton?.addEventListener('click', () => {
    closePanel();
  });

  panel?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closePanel();
    }
  });

  document.addEventListener('click', (event) => {
    if (!root.classList.contains('is-open')) {
      return;
    }
    const target = event.target;
    if (!panel?.contains(target) && target !== openButton) {
      closePanel();
    }
  });

  syncBodyState();
  syncUiState();
  dispatchChange();
})();

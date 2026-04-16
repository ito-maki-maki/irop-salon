(function() {
  'use strict';

  // --- State ---
  var state = {
    brightness: { min: null, max: null },
    hues: [],
    gray: [],
    history: [],
    colors: []
  };

  // --- URL Parameter Keys ---
  var URL_KEYS = {
    bmin: 'brightness.min',
    bmax: 'brightness.max',
    hue: 'hues',
    gray: 'gray',
    hist: 'history',
    irop: 'colors'
  };

  // --- DOM References (set in initFilter) ---
  var toggle, arrow, badge, panel, brightnessMin, brightnessMax;
  var hueGrid, grayChips, historyChips, colorChips;
  var resetBtn, countEl, emptyEl, cards;

  // --- Toggle Panel ---
  function togglePanel() {
    var isOpen = !panel.hidden;
    panel.hidden = isOpen;
    if (isOpen) {
      toggle.classList.remove('filter-toggle--active');
    } else {
      toggle.classList.add('filter-toggle--active');
    }
  }

  // --- Chip Toggle ---
  function toggleChip(btn, arr) {
    var val = btn.dataset.value;
    var idx = arr.indexOf(val);
    if (idx === -1) {
      arr.push(val);
      btn.classList.add(getActiveClass(btn));
    } else {
      arr.splice(idx, 1);
      btn.classList.remove(getActiveClass(btn));
    }
  }

  function getActiveClass(btn) {
    if (btn.classList.contains('filter-hue-btn')) return 'filter-hue-btn--active';
    if (btn.classList.contains('filter-color-btn')) return 'filter-color-btn--active';
    return 'filter-chip--active';
  }

  // --- Filter Logic ---
  function applyFilters() {
    var visibleCount = 0;

    cards.forEach(function(card) {
      var show = true;

      // Brightness range overlap
      if (state.brightness.min !== null || state.brightness.max !== null) {
        var cardMin = parseInt(card.dataset.brightnessMin, 10);
        var cardMax = parseInt(card.dataset.brightnessMax, 10);
        var fMin = state.brightness.min !== null ? state.brightness.min : 1;
        var fMax = state.brightness.max !== null ? state.brightness.max : 20;
        if (cardMax < fMin || cardMin > fMax) {
          show = false;
        }
      }

      // Hue (OR within)
      if (show && state.hues.length > 0) {
        var cardHue = card.dataset.hue;
        if (state.hues.indexOf(cardHue) === -1) {
          show = false;
        }
      }

      // Gray hair ratio (OR within)
      if (show && state.gray.length > 0) {
        var cardGray = card.dataset.gray;
        if (cardGray === 'none' || state.gray.indexOf(cardGray) === -1) {
          show = false;
        }
      }

      // Treatment history (OR within)
      if (show && state.history.length > 0) {
        var cardHistory = card.dataset.history.split(',');
        if (cardHistory[0] === 'none') {
          show = false;
        } else {
          var histMatch = state.history.some(function(h) {
            return cardHistory.indexOf(h) !== -1;
          });
          if (!histMatch) show = false;
        }
      }

      // irop colors (OR within)
      if (show && state.colors.length > 0) {
        var cardColors = card.dataset.colors.split(',');
        var colorMatch = state.colors.some(function(c) {
          return cardColors.indexOf(c) !== -1;
        });
        if (!colorMatch) show = false;
      }

      card.hidden = !show;
      if (show) visibleCount++;
    });

    // Update count and empty state
    countEl.textContent = visibleCount + '件の事例';
    emptyEl.hidden = visibleCount > 0;

    updateBadge();
    updateURL();
  }

  // --- Badge Update ---
  function updateBadge() {
    var count = 0;
    if (state.brightness.min !== null || state.brightness.max !== null) count++;
    if (state.hues.length > 0) count++;
    if (state.gray.length > 0) count++;
    if (state.history.length > 0) count++;
    if (state.colors.length > 0) count++;

    if (count > 0) {
      badge.textContent = count;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  // --- URL Sync ---
  function updateURL() {
    var params = new URLSearchParams();

    if (state.brightness.min !== null) params.set('bmin', state.brightness.min);
    if (state.brightness.max !== null) params.set('bmax', state.brightness.max);
    if (state.hues.length > 0) params.set('hue', state.hues.join(','));
    if (state.gray.length > 0) params.set('gray', state.gray.join(','));
    if (state.history.length > 0) params.set('hist', state.history.join(','));
    if (state.colors.length > 0) params.set('irop', state.colors.join(','));

    var search = params.toString();
    var url = window.location.pathname + (search ? '?' + search : '');
    history.replaceState(null, '', url);
  }

  function readURL() {
    var params = new URLSearchParams(window.location.search);
    var hasFilters = false;

    var bmin = params.get('bmin');
    var bmax = params.get('bmax');
    if (bmin !== null) {
      state.brightness.min = parseInt(bmin, 10);
      brightnessMin.value = state.brightness.min;
      hasFilters = true;
    }
    if (bmax !== null) {
      state.brightness.max = parseInt(bmax, 10);
      brightnessMax.value = state.brightness.max;
      hasFilters = true;
    }

    var hue = params.get('hue');
    if (hue) {
      state.hues = hue.split(',');
      hasFilters = true;
    }

    var gray = params.get('gray');
    if (gray) {
      state.gray = gray.split(',');
      hasFilters = true;
    }

    var hist = params.get('hist');
    if (hist) {
      state.history = hist.split(',');
      hasFilters = true;
    }

    var irop = params.get('irop');
    if (irop) {
      state.colors = irop.split(',');
      hasFilters = true;
    }

    return hasFilters;
  }

  // --- Sync UI from State ---
  function syncUI() {
    // Hue buttons
    hueGrid.querySelectorAll('.filter-hue-btn').forEach(function(btn) {
      if (state.hues.indexOf(btn.dataset.value) !== -1) {
        btn.classList.add('filter-hue-btn--active');
      }
    });

    // Gray chips
    grayChips.querySelectorAll('.filter-chip').forEach(function(btn) {
      if (state.gray.indexOf(btn.dataset.value) !== -1) {
        btn.classList.add('filter-chip--active');
      }
    });

    // History chips
    historyChips.querySelectorAll('.filter-chip').forEach(function(btn) {
      if (state.history.indexOf(btn.dataset.value) !== -1) {
        btn.classList.add('filter-chip--active');
      }
    });

    // Color buttons
    colorChips.querySelectorAll('.filter-color-btn').forEach(function(btn) {
      if (state.colors.indexOf(btn.dataset.value) !== -1) {
        btn.classList.add('filter-color-btn--active');
      }
    });
  }

  // --- Reset ---
  function resetFilters() {
    state.brightness.min = null;
    state.brightness.max = null;
    state.hues = [];
    state.gray = [];
    state.history = [];
    state.colors = [];

    brightnessMin.value = '';
    brightnessMax.value = '';

    panel.querySelectorAll('.filter-hue-btn--active, .filter-chip--active, .filter-color-btn--active').forEach(function(btn) {
      btn.classList.remove('filter-hue-btn--active', 'filter-chip--active', 'filter-color-btn--active');
    });

    applyFilters();
  }

  // --- Initialize (called after cards are rendered) ---
  function initFilter() {
    toggle = document.getElementById('filterToggle');
    arrow = document.getElementById('filterArrow');
    badge = document.getElementById('filterBadge');
    panel = document.getElementById('filterPanel');
    brightnessMin = document.getElementById('brightnessMin');
    brightnessMax = document.getElementById('brightnessMax');
    hueGrid = document.getElementById('hueGrid');
    grayChips = document.getElementById('grayChips');
    historyChips = document.getElementById('historyChips');
    colorChips = document.getElementById('colorChips');
    resetBtn = document.getElementById('filterReset');
    countEl = document.getElementById('filterCount');
    emptyEl = document.getElementById('filterEmpty');
    cards = document.querySelectorAll('.case-card');

    // Event Binding
    toggle.addEventListener('click', togglePanel);

    brightnessMin.addEventListener('input', function() {
      var val = this.value.trim();
      state.brightness.min = val ? parseInt(val, 10) : null;
      applyFilters();
    });

    brightnessMax.addEventListener('input', function() {
      var val = this.value.trim();
      state.brightness.max = val ? parseInt(val, 10) : null;
      applyFilters();
    });

    hueGrid.addEventListener('click', function(e) {
      var btn = e.target.closest('.filter-hue-btn');
      if (!btn) return;
      toggleChip(btn, state.hues);
      applyFilters();
    });

    grayChips.addEventListener('click', function(e) {
      var btn = e.target.closest('.filter-chip');
      if (!btn) return;
      toggleChip(btn, state.gray);
      applyFilters();
    });

    historyChips.addEventListener('click', function(e) {
      var btn = e.target.closest('.filter-chip');
      if (!btn) return;
      toggleChip(btn, state.history);
      applyFilters();
    });

    colorChips.addEventListener('click', function(e) {
      var btn = e.target.closest('.filter-color-btn');
      if (!btn) return;
      toggleChip(btn, state.colors);
      applyFilters();
    });

    resetBtn.addEventListener('click', resetFilters);

    // Read URL and apply
    var hasFilters = readURL();
    if (hasFilters) {
      syncUI();
      panel.hidden = false;
      toggle.classList.add('filter-toggle--active');
      applyFilters();
    }
  }

  // Wait for cases-rendered event from render.js
  document.addEventListener('cases-rendered', initFilter);

})();

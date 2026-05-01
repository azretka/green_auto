(function () {
  'use strict';

  var GAP = 18;

  function getVisible() {
    var w = window.innerWidth;
    if (w >= 900) return 3;
    if (w >= 560) return 2;
    return 1;
  }

  function buildSlider(grid) {
    var origCards = Array.from(grid.querySelectorAll(':scope > .car-card'));
    var total     = origCards.length;
    if (total === 0) return;

    var allCards = [];
    origCards.forEach(function (c) { allCards.push(c.cloneNode(true)); });
    origCards.forEach(function (c) { allCards.push(c); });
    origCards.forEach(function (c) { allCards.push(c.cloneNode(true)); });

    var current = 0;

    /* DOM */
    var outer = document.createElement('div');
    outer.className = 'slider-outer';
    grid.parentNode.insertBefore(outer, grid);
    grid.style.display = 'none';

    var arrowsRow = document.createElement('div');
    arrowsRow.className = 'slider-arrows';
    arrowsRow.innerHTML =
      '<button class="slider-btn" data-dir="-1" aria-label="Назад">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 5l-7 7 7 7"/></svg>' +
      '</button>' +
      '<button class="slider-btn" data-dir="1" aria-label="Вперёд">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>' +
      '</button>';
    outer.appendChild(arrowsRow);

    var viewport = document.createElement('div');
    viewport.className = 'slider-viewport';
    outer.appendChild(viewport);

    var track = document.createElement('div');
    track.className = 'slider-track';
    viewport.appendChild(track);
    allCards.forEach(function (c) { track.appendChild(c); });

    var dotsRow = document.createElement('div');
    dotsRow.className = 'slider-dots';
    outer.appendChild(dotsRow);
    for (var i = 0; i < total; i++) {
      var btn = document.createElement('button');
      btn.className = 'dot' + (i === 0 ? ' active' : '');
      btn.dataset.i = i;
      dotsRow.appendChild(btn);
    }

    function cw() {
      var vis = getVisible();
      var vw  = outer.offsetWidth;
      return (vw - GAP * (vis - 1)) / vis;
    }

    function render(animated) {
      var w      = cw();
      var step   = w + GAP;
      var offset = (total + current) * step;

      allCards.forEach(function (c) {
        c.style.flex  = '0 0 ' + w + 'px';
        c.style.width = w + 'px';
      });

      if (!animated) {
        track.style.transition = 'none';
        track.style.transform  = 'translateX(-' + offset + 'px)';
        track.offsetHeight;
        track.style.transition = '';
      } else {
        track.style.transform = 'translateX(-' + offset + 'px)';
      }

      Array.from(dotsRow.querySelectorAll('.dot')).forEach(function (d, idx) {
        d.classList.toggle('active', idx === current);
      });
    }

    function go(delta) {
      current = ((current + delta) % total + total) % total;
      render(true);
    }

    render(false);

    arrowsRow.addEventListener('click', function (e) {
      var b = e.target.closest('.slider-btn');
      if (b) go(parseInt(b.dataset.dir, 10));
    });

    dotsRow.addEventListener('click', function (e) {
      var d = e.target.closest('.dot');
      if (!d) return;
      var target = +d.dataset.i;
      var delta  = target - current;
      if (delta >  total / 2) delta -= total;
      if (delta < -total / 2) delta += total;
      current = target;
      render(true);
    });

    var sx = 0;
    track.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 44) go(dx < 0 ? 1 : -1);
    }, { passive: true });

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { render(false); }, 150);
    });
  }

  function init() {
    document.querySelectorAll('.cars-grid').forEach(buildSlider);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
/* ============================================
   Presentation Engine
   Navigation, scaling, fragments, hash sync
   ============================================ */
(function () {
  'use strict';

  var state = {
    current: 0,
    fragment: -1,
    total: 0,
    slides: [],
    rendered: {}
  };

  /* --- Fragment configuration per slide (0-indexed slide numbers) --- */
  var fragmentConfig = {
    3:  4,  // Slide 4: 4 fragments (La Locura — HTML/images)
    14: 3,  // Slide 15: 3 fragments (El Contraste)
    19: 2,  // Slide 20: 2 fragments (Proceso)
    28: 3   // Slide 29: 3 fragments (El Camino)
  };

  /* --- Initialize --- */
  function init() {
    state.slides = Array.from(document.querySelectorAll('.slide'));
    state.total = state.slides.length;

    createProgressBar();
    createSlideNumber();

    var hash = parseInt(location.hash.replace('#', ''), 10);
    if (hash >= 1 && hash <= state.total) {
      goTo(hash - 1);
    } else {
      goTo(0);
    }

    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', scale);
    window.addEventListener('hashchange', onHash);
    scale();
  }

  /* --- Responsive Scaling --- */
  function scale() {
    var deck = document.querySelector('.deck');
    if (!deck) return;
    var sx = window.innerWidth / 1920;
    var sy = window.innerHeight / 1080;
    var s = Math.min(sx, sy);
    deck.style.transform = 'scale(' + s + ')';
    deck.style.transformOrigin = 'top left';
    /* Center vertically if letterboxed */
    var offsetX = (window.innerWidth - 1920 * s) / 2;
    var offsetY = (window.innerHeight - 1080 * s) / 2;
    deck.style.marginLeft = offsetX + 'px';
    deck.style.marginTop = offsetY + 'px';
  }

  /* --- Navigation --- */
  function goTo(index) {
    if (index < 0 || index >= state.total) return;

    state.slides.forEach(function (s, i) {
      s.classList.toggle('active', i === index);
    });

    state.current = index;
    state.fragment = -1;

    /* Reset fragments on this slide */
    resetFragments(index);

    /* Render diagram if needed */
    renderDiagram(index);

    updateProgress();
    updateSlideNumber();
    location.hash = '#' + (index + 1);
  }

  function next() {
    var maxFrag = fragmentConfig[state.current] || 0;
    if (maxFrag > 0 && state.fragment < maxFrag - 1) {
      state.fragment++;
      showFragment(state.current, state.fragment);
      renderDiagramFragment(state.current, state.fragment);
      updatePresenterView();
    } else {
      goTo(state.current + 1);
    }
  }

  function prev() {
    var maxFrag = fragmentConfig[state.current] || 0;
    if (state.fragment >= 0) {
      hideFragment(state.current, state.fragment);
      state.fragment--;
      renderDiagramFragment(state.current, state.fragment);
      updatePresenterView();
    } else {
      if (state.current > 0) {
        goTo(state.current - 1);
        var prevMax = fragmentConfig[state.current] || 0;
        if (prevMax > 0) {
          state.fragment = prevMax - 1;
          showAllFragments(state.current);
          renderDiagramFragment(state.current, state.fragment);
        }
      }
    }
  }

  /* --- Fragment Logic --- */
  function resetFragments(slideIndex) {
    var slide = state.slides[slideIndex];
    var frags = slide.querySelectorAll('.fragment');
    for (var i = 0; i < frags.length; i++) {
      frags[i].classList.remove('visible');
    }
  }

  function showFragment(slideIndex, fragIndex) {
    var slide = state.slides[slideIndex];
    var frags = slide.querySelectorAll('.fragment');
    if (frags[fragIndex]) {
      frags[fragIndex].classList.add('visible');
    }
  }

  function hideFragment(slideIndex, fragIndex) {
    var slide = state.slides[slideIndex];
    var frags = slide.querySelectorAll('.fragment');
    if (frags[fragIndex]) {
      frags[fragIndex].classList.remove('visible');
    }
  }

  function showAllFragments(slideIndex) {
    var slide = state.slides[slideIndex];
    var frags = slide.querySelectorAll('.fragment');
    for (var i = 0; i < frags.length; i++) {
      frags[i].classList.add('visible');
    }
  }

  /* --- Diagram Integration --- */
  function renderDiagram(slideIndex) {
    if (typeof DiagramRenderer !== 'undefined' && DiagramRenderer.hasSlide(slideIndex)) {
      var canvas = state.slides[slideIndex].querySelector('canvas');
      if (canvas) {
        /* For fragment slides, render with fragment=-1 (base only) */
        /* For non-fragment slides, render everything (no caching needed — fast enough) */
        var fragIdx = fragmentConfig[slideIndex] ? -1 : undefined;
        DiagramRenderer.render(slideIndex, canvas, fragIdx);
        if (!fragmentConfig[slideIndex]) {
          state.rendered[slideIndex] = true;
        }
      }
    }
  }

  function renderDiagramFragment(slideIndex, fragIndex) {
    if (typeof DiagramRenderer !== 'undefined' && DiagramRenderer.hasSlide(slideIndex)) {
      var canvas = state.slides[slideIndex].querySelector('canvas');
      if (canvas) {
        DiagramRenderer.render(slideIndex, canvas, fragIndex);
      }
    }
  }

  /* --- Keyboard Handler --- */
  function onKey(e) {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        next();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prev();
        break;
      case 'Home':
        e.preventDefault();
        goTo(0);
        break;
      case 'End':
        e.preventDefault();
        goTo(state.total - 1);
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 's':
        e.preventDefault();
        openPresenterView();
        break;
    }
  }

  function onHash() {
    var hash = parseInt(location.hash.replace('#', ''), 10);
    if (hash >= 1 && hash <= state.total && hash - 1 !== state.current) {
      goTo(hash - 1);
    }
  }

  /* --- Fullscreen --- */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen();
    }
  }

  /* --- Progress Bar --- */
  function createProgressBar() {
    var bar = document.createElement('div');
    bar.id = 'progress-bar';
    document.body.appendChild(bar);
  }

  function updateProgress() {
    var bar = document.getElementById('progress-bar');
    if (bar) {
      var pct = ((state.current + 1) / state.total) * 100;
      bar.style.width = pct + '%';
    }
  }

  /* --- Slide Number --- */
  function createSlideNumber() {
    var el = document.createElement('div');
    el.id = 'slide-number';
    document.body.appendChild(el);
  }

  function updateSlideNumber() {
    var el = document.getElementById('slide-number');
    if (el) {
      el.textContent = (state.current + 1) + ' / ' + state.total;
    }
  }

  /* --- Presenter View --- */
  var presenterWindow = null;

  function getSlideNotes(index) {
    var slide = state.slides[index];
    if (!slide) return '';
    var aside = slide.querySelector('aside.notes');
    return aside ? aside.textContent.trim() : '';
  }

  function getSlideTitle(index) {
    var slide = state.slides[index];
    if (!slide) return '';
    var num = slide.getAttribute('data-slide') || (index + 1);
    var h = slide.querySelector('h1, h2, .statement, .cover-title');
    var title = h ? h.textContent.trim().replace(/\s+/g, ' ').substring(0, 60) : 'Slide ' + num;
    return 'Slide ' + num + ' — ' + title;
  }

  function openPresenterView() {
    if (presenterWindow && !presenterWindow.closed) {
      presenterWindow.focus();
      updatePresenterView();
      return;
    }

    presenterWindow = window.open('', 'presenter',
      'width=900,height=700,menubar=no,toolbar=no,location=no,status=no');

    if (!presenterWindow) return;

    presenterWindow.document.write('<!DOCTYPE html>' +
      '<html><head><meta charset="UTF-8">' +
      '<title>Speaker Notes</title>' +
      '<style>' +
      '@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap");' +
      'body{margin:0;padding:24px;background:#0a0a0a;color:#e5e7eb;font-family:"Montserrat",sans-serif;font-size:15px;}' +
      '.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #374151;}' +
      '.timer{font-size:42px;font-weight:700;color:#a855f7;font-variant-numeric:tabular-nums;}' +
      '.timer-controls{display:flex;gap:8px;margin-top:6px;}' +
      '.timer-controls button,.nav-btn{background:#1f2937;border:1px solid #374151;color:#9ca3af;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-family:inherit;}' +
      '.timer-controls button:hover,.nav-btn:hover{background:#374151;color:#e5e7eb;}' +
      '.slide-info{font-size:13px;color:#6b7280;}' +
      '.current-title{font-size:20px;font-weight:600;color:#f3f4f6;margin-bottom:4px;}' +
      '.nav-bar{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #374151;}' +
      '.nav-btn{padding:8px 20px;font-size:16px;font-weight:600;}' +
      '.nav-btn.primary{background:#a855f7;border-color:#a855f7;color:#fff;}' +
      '.nav-btn.primary:hover{background:#9333ea;}' +
      '.nav-hint{font-size:11px;color:#4b5563;margin-left:auto;}' +
      '.next-label{font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;}' +
      '.next-title{font-size:15px;color:#9ca3af;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #1f2937;}' +
      '.notes-label{font-size:12px;color:#a855f7;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;}' +
      '.notes{font-size:18px;line-height:1.8;color:#e5e7eb;white-space:pre-wrap;padding:20px;background:#111827;border-radius:12px;border:1px solid #1f2937;max-height:calc(100vh - 340px);overflow-y:auto;}' +
      '.notes::-webkit-scrollbar{width:6px;}' +
      '.notes::-webkit-scrollbar-track{background:#111827;}' +
      '.notes::-webkit-scrollbar-thumb{background:#374151;border-radius:3px;}' +
      '</style></head><body>' +
      '<div class="header">' +
      '<div><div class="current-title" id="pv-title"></div><div class="slide-info" id="pv-counter"></div></div>' +
      '<div style="text-align:right;"><div class="timer" id="pv-timer">00:00</div>' +
      '<div class="timer-controls"><button onclick="toggleTimer()">Start/Pause</button><button onclick="resetTimer()">Reset</button></div></div>' +
      '</div>' +
      '<div class="nav-bar">' +
      '<button class="nav-btn" onclick="navPrev()">&larr; Anterior</button>' +
      '<button class="nav-btn primary" onclick="navNext()">Siguiente &rarr;</button>' +
      '<span class="nav-hint">Tambi&eacute;n: flechas &larr; &rarr; o Space</span>' +
      '</div>' +
      '<div class="next-label">Siguiente</div>' +
      '<div class="next-title" id="pv-next"></div>' +
      '<div class="notes-label">Notas</div>' +
      '<div class="notes" id="pv-notes"></div>' +
      '<script>' +
      'var elapsed=0,running=false,interval=null;' +
      'function fmt(s){var m=Math.floor(s/60);var sec=s%60;return String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0");}' +
      'function tick(){elapsed++;document.getElementById("pv-timer").textContent=fmt(elapsed);}' +
      'function toggleTimer(){if(running){clearInterval(interval);running=false;}else{interval=setInterval(tick,1000);running=true;}}' +
      'function resetTimer(){clearInterval(interval);running=false;elapsed=0;document.getElementById("pv-timer").textContent="00:00";}' +
      'function navNext(){if(window.opener&&!window.opener.closed){window.opener.__presenterNext();}}' +
      'function navPrev(){if(window.opener&&!window.opener.closed){window.opener.__presenterPrev();}}' +
      'document.addEventListener("keydown",function(e){' +
      'if(e.key==="ArrowRight"||e.key===" "||e.key==="PageDown"){e.preventDefault();navNext();}' +
      'else if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();navPrev();}' +
      '});' +
      '<\/script></body></html>');

    presenterWindow.document.close();
    updatePresenterView();
  }

  function updatePresenterView() {
    if (!presenterWindow || presenterWindow.closed) return;
    var doc = presenterWindow.document;
    var titleEl = doc.getElementById('pv-title');
    var counterEl = doc.getElementById('pv-counter');
    var nextEl = doc.getElementById('pv-next');
    var notesEl = doc.getElementById('pv-notes');
    if (!titleEl) return;

    titleEl.textContent = getSlideTitle(state.current);
    counterEl.textContent = (state.current + 1) + ' / ' + state.total;
    nextEl.textContent = state.current < state.total - 1
      ? getSlideTitle(state.current + 1)
      : '— Fin de la presentación —';
    notesEl.textContent = getSlideNotes(state.current) || '(sin notas)';
    notesEl.scrollTop = 0;
  }

  /* Patch goTo to also update presenter */
  var _originalGoTo = goTo;
  goTo = function (index) {
    _originalGoTo(index);
    updatePresenterView();
  };

  /* --- Expose navigation for presenter window --- */
  window.__presenterNext = function () { next(); };
  window.__presenterPrev = function () { prev(); };

  /* --- Boot --- */
  function boot() {
    /* Wait for fonts to load before initializing (critical for canvas text) */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(init);
    } else {
      /* Fallback: wait a bit for fonts */
      setTimeout(init, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

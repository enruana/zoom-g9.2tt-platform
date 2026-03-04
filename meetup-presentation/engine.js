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
      /* Also trigger diagram fragment if applicable */
      renderDiagramFragment(state.current, state.fragment);
    } else {
      goTo(state.current + 1);
    }
  }

  function prev() {
    var maxFrag = fragmentConfig[state.current] || 0;
    if (state.fragment >= 0) {
      hideFragment(state.current, state.fragment);
      state.fragment--;
      /* Also update diagram fragment */
      renderDiagramFragment(state.current, state.fragment);
    } else {
      if (state.current > 0) {
        goTo(state.current - 1);
        /* Show all fragments of previous slide */
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

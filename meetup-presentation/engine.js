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

  /* --- Preview mode detection (for presenter iframes) --- */
  var isPreview = location.search.indexOf('pv=1') !== -1;

  /* --- Initialize --- */
  function init() {
    state.slides = Array.from(document.querySelectorAll('.slide'));
    state.total = state.slides.length;

    if (isPreview) {
      /* Preview mode: show slide + fragments via postMessage, no chrome */
      document.body.classList.add('pv-mode');
      var hash = parseInt(location.hash.replace('#', ''), 10);
      if (hash >= 1 && hash <= state.total) goTo(hash - 1);
      else goTo(0);
      window.addEventListener('resize', scale);
      window.addEventListener('hashchange', function () {
        var h = parseInt(location.hash.replace('#', ''), 10);
        if (h >= 1 && h <= state.total) goTo(h - 1);
      });
      /* Listen for fragment updates from parent */
      window.addEventListener('message', function (e) {
        if (e.data && e.data.type === 'pv-update') {
          var slideIdx = e.data.slide;
          var fragIdx = e.data.fragment;
          if (slideIdx !== state.current) {
            goTo(slideIdx);
          }
          /* Apply fragments up to fragIdx */
          resetFragments(slideIdx);
          renderDiagram(slideIdx);
          for (var i = 0; i <= fragIdx; i++) {
            showFragment(slideIdx, i);
          }
          if (fragIdx >= 0) {
            renderDiagramFragment(slideIdx, fragIdx);
          }
        }
      });
      scale();
      return;
    }

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
    return 'Slide ' + num + ' \u2014 ' + title;
  }

  function getFragmentInfo(index) {
    var maxFrag = fragmentConfig[index] || 0;
    if (maxFrag === 0) return '';
    var current = state.fragment + 2; /* fragment is -1 based, show 1-based "step 1 of N+1" */
    return 'Paso ' + current + ' de ' + (maxFrag + 1);
  }

  function getPreviewUrl(slideIndex) {
    var base = location.pathname + '?pv=1#' + (slideIndex + 1);
    return base;
  }

  function openPresenterView() {
    if (presenterWindow && !presenterWindow.closed) {
      presenterWindow.focus();
      updatePresenterView();
      return;
    }

    presenterWindow = window.open('', 'presenter',
      'width=1100,height=800,menubar=no,toolbar=no,location=no,status=no');

    if (!presenterWindow) return;

    var html = [
      '<!DOCTYPE html><html><head><meta charset="UTF-8">',
      '<title>Speaker Notes</title>',
      '<style>',
      '@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap");',
      '*{margin:0;padding:0;box-sizing:border-box;}',
      'body{background:#0a0a0a;color:#e5e7eb;font-family:"Montserrat",sans-serif;padding:20px;height:100vh;display:flex;flex-direction:column;overflow:hidden;}',

      /* header */
      '.header{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid #374151;margin-bottom:14px;flex-shrink:0;}',
      '.title{font-size:18px;font-weight:600;color:#f3f4f6;}',
      '.counter{font-size:13px;color:#6b7280;margin-top:2px;}',
      '.steps{display:inline-block;background:#a855f7;color:#fff;font-size:11px;font-weight:600;padding:2px 10px;border-radius:10px;margin-left:10px;}',
      '.timer{font-size:36px;font-weight:700;color:#a855f7;font-variant-numeric:tabular-nums;}',
      '.timer-controls{display:flex;gap:6px;margin-top:4px;justify-content:flex-end;}',
      '.timer-controls button{background:#1f2937;border:1px solid #374151;color:#9ca3af;padding:3px 10px;border-radius:5px;cursor:pointer;font-size:11px;font-family:inherit;}',
      '.timer-controls button:hover{background:#374151;color:#e5e7eb;}',

      /* previews */
      '.previews{display:flex;gap:16px;margin-bottom:14px;flex-shrink:0;}',
      '.preview-box{flex:1;display:flex;flex-direction:column;}',
      '.preview-label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;}',
      '.preview-label.active{color:#a855f7;}',
      '.preview-frame{position:relative;width:100%;aspect-ratio:16/9;border-radius:8px;overflow:hidden;border:2px solid #1f2937;background:#030712;}',
      '.preview-frame.active{border-color:#a855f7;box-shadow:0 0 16px rgba(168,85,247,0.15);}',
      '.preview-frame iframe{position:absolute;top:0;left:0;width:1920px;height:1080px;transform-origin:top left;border:none;pointer-events:none;}',
      '.preview-end{display:flex;align-items:center;justify-content:center;color:#4b5563;font-size:14px;height:100%;}',

      /* notes */
      '.notes-section{flex:1;display:flex;flex-direction:column;min-height:0;}',
      '.notes-label{font-size:11px;color:#a855f7;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;flex-shrink:0;}',
      '.notes{flex:1;font-size:17px;line-height:1.75;color:#e5e7eb;white-space:pre-wrap;padding:16px 20px;background:#111827;border-radius:10px;border:1px solid #1f2937;overflow-y:auto;}',
      '.notes::-webkit-scrollbar{width:5px;}',
      '.notes::-webkit-scrollbar-track{background:#111827;}',
      '.notes::-webkit-scrollbar-thumb{background:#374151;border-radius:3px;}',

      '</style></head><body>',

      /* header */
      '<div class="header">',
      '<div><div class="title" id="pv-title"></div><div class="counter"><span id="pv-counter"></span><span class="steps" id="pv-steps" style="display:none;"></span></div></div>',
      '<div style="text-align:right;"><div class="timer" id="pv-timer">00:00</div>',
      '<div class="timer-controls"><button onclick="toggleTimer()">Start/Pause</button><button onclick="resetTimer()">Reset</button></div></div>',
      '</div>',

      /* previews */
      '<div class="previews">',
      '<div class="preview-box"><div class="preview-label active">Actual</div><div class="preview-frame active" id="pv-current-frame"><iframe id="pv-current-iframe"></iframe></div></div>',
      '<div class="preview-box"><div class="preview-label">Siguiente</div><div class="preview-frame" id="pv-next-frame"></div></div>',
      '</div>',

      /* notes */
      '<div class="notes-section">',
      '<div class="notes-label">Notas</div>',
      '<div class="notes" id="pv-notes"></div>',
      '</div>',

      '<script>',
      /* timer */
      'var elapsed=0,running=false,interval=null;',
      'function fmt(s){var m=Math.floor(s/60);var sec=s%60;return String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0");}',
      'function tick(){elapsed++;document.getElementById("pv-timer").textContent=fmt(elapsed);}',
      'function toggleTimer(){if(running){clearInterval(interval);running=false;}else{interval=setInterval(tick,1000);running=true;}}',
      'function resetTimer(){clearInterval(interval);running=false;elapsed=0;document.getElementById("pv-timer").textContent="00:00";}',

      /* navigation via keyboard */
      'function navNext(){if(window.opener&&!window.opener.closed)window.opener.__presenterNext();}',
      'function navPrev(){if(window.opener&&!window.opener.closed)window.opener.__presenterPrev();}',
      'document.addEventListener("keydown",function(e){',
      'if(e.key==="ArrowRight"||e.key===" "||e.key==="PageDown"){e.preventDefault();navNext();}',
      'else if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();navPrev();}',
      '});',

      /* scale iframes to fit their containers */
      'function scaleIframes(){',
      'var frames=document.querySelectorAll(".preview-frame iframe");',
      'frames.forEach(function(f){',
      'var box=f.parentElement;var s=box.clientWidth/1920;',
      'f.style.transform="scale("+s+")";',
      '});',
      '}',
      'window.addEventListener("resize",scaleIframes);',
      'setTimeout(scaleIframes,100);',

      '<\/script></body></html>'
    ].join('\n');

    presenterWindow.document.write(html);
    presenterWindow.document.close();

    /* initial scale after iframe loads */
    setTimeout(function () {
      if (presenterWindow && !presenterWindow.closed) {
        presenterWindow.eval('scaleIframes()');
      }
    }, 300);

    updatePresenterView();
  }

  function sendPreviewMessage(iframe, slideIdx, fragIdx) {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage({
      type: 'pv-update',
      slide: slideIdx,
      fragment: fragIdx
    }, '*');
  }

  function ensureIframe(container, id, doc) {
    var iframe = container.querySelector('iframe');
    if (!iframe) {
      iframe = doc.createElement('iframe');
      iframe.id = id;
      container.innerHTML = '';
      container.appendChild(iframe);
    }
    return iframe;
  }

  function updatePresenterView() {
    if (!presenterWindow || presenterWindow.closed) return;
    var doc = presenterWindow.document;
    var titleEl = doc.getElementById('pv-title');
    if (!titleEl) return;

    /* title & counter */
    titleEl.textContent = getSlideTitle(state.current);
    doc.getElementById('pv-counter').textContent = (state.current + 1) + ' / ' + state.total;

    /* fragment steps badge */
    var stepsEl = doc.getElementById('pv-steps');
    var fragInfo = getFragmentInfo(state.current);
    if (fragInfo) {
      stepsEl.textContent = fragInfo;
      stepsEl.style.display = 'inline-block';
    } else {
      stepsEl.style.display = 'none';
    }

    /* current slide preview */
    var currentIframe = doc.getElementById('pv-current-iframe');
    var targetSrc = getPreviewUrl(state.current);
    if (currentIframe) {
      if (currentIframe.getAttribute('src') !== targetSrc) {
        /* New slide — load it, then send fragment state once loaded */
        currentIframe.setAttribute('src', targetSrc);
        currentIframe.onload = function () {
          sendPreviewMessage(currentIframe, state.current, state.fragment);
          try { presenterWindow.eval('scaleIframes()'); } catch (e) {}
        };
      } else {
        /* Same slide, just fragment change — send message directly */
        sendPreviewMessage(currentIframe, state.current, state.fragment);
      }
    }

    /* next slide preview — always show all fragments */
    var nextFrame = doc.getElementById('pv-next-frame');
    if (nextFrame) {
      if (state.current < state.total - 1) {
        var nextIdx = state.current + 1;
        var nextSrc = getPreviewUrl(nextIdx);
        var nextIframe = ensureIframe(nextFrame, 'pv-next-iframe', doc);
        var nextMaxFrag = fragmentConfig[nextIdx] ? fragmentConfig[nextIdx] - 1 : -1;
        if (nextIframe.getAttribute('src') !== nextSrc) {
          nextIframe.setAttribute('src', nextSrc);
          nextIframe.onload = function () {
            sendPreviewMessage(nextIframe, nextIdx, nextMaxFrag);
            try { presenterWindow.eval('scaleIframes()'); } catch (e) {}
          };
        } else {
          sendPreviewMessage(nextIframe, nextIdx, nextMaxFrag);
        }
      } else {
        nextFrame.innerHTML = '<div class="preview-end">Fin de la presentaci\u00f3n</div>';
      }
    }

    /* notes */
    var notesEl = doc.getElementById('pv-notes');
    if (notesEl) {
      notesEl.textContent = getSlideNotes(state.current) || '(sin notas)';
      notesEl.scrollTop = 0;
    }

    /* re-scale iframes */
    try { presenterWindow.eval('scaleIframes()'); } catch (e) {}
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

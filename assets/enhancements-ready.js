(() => {
  'use strict';

  let checks = 0;
  function loadStudyDisplay() {
    if (document.querySelector('script[data-study-display]')) return;
    const script = document.createElement('script');
    script.src = 'assets/study-session-display.js?v=20260720-3';
    script.dataset.studyDisplay = 'true';
    document.body.appendChild(script);
  }

  function applyWhenReady() {
    const app = document.getElementById('app');
    const ready = typeof render === 'function'
      && typeof state === 'object'
      && typeof EXAM_CACHE === 'object'
      && EXAM_CACHE[state.exam]
      && app
      && !app.classList.contains('hidden');

    if (ready) {
      render();
      loadStudyDisplay();
      return;
    }

    checks += 1;
    if (checks < 120) window.setTimeout(applyWhenReady, 50);
  }

  applyWhenReady();
})();

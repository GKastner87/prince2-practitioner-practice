(() => {
  'use strict';

  let checks = 0;
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
      return;
    }

    checks += 1;
    if (checks < 120) window.setTimeout(applyWhenReady, 50);
  }

  applyWhenReady();
})();

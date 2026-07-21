(() => {
  'use strict';

  const storageKey = 'prince2-colour-theme';
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function storedTheme() {
    const value = localStorage.getItem(storageKey);
    return value === 'dark' || value === 'light' ? value : null;
  }

  function resolvedTheme() {
    return storedTheme() || (media.matches ? 'dark' : 'light');
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0d1b28' : '#17324d';

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const next = theme === 'dark' ? 'light' : 'dark';
      button.setAttribute('aria-label', `Use ${next} mode`);
      button.setAttribute('title', `Use ${next} mode`);
      button.innerHTML = theme === 'dark'
        ? '<span aria-hidden="true">☀</span><span>Light</span>'
        : '<span aria-hidden="true">☾</span><span>Dark</span>';
    });
  }

  function toggleTheme() {
    const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(storageKey, next);
    applyTheme(next);
  }

  applyTheme(resolvedTheme());

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('[data-theme-toggle]')) {
      const toolbar = document.querySelector('.toolbar');
      if (toolbar) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'theme-toggle';
        button.dataset.themeToggle = '';
        toolbar.append(button);
      }
    }

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', toggleTheme);
    });
    applyTheme(resolvedTheme());
  });

  media.addEventListener?.('change', () => {
    if (!storedTheme()) applyTheme(resolvedTheme());
  });
})();

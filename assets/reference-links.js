(() => {
  'use strict';

  const config = window.PRINCE2_REFERENCE_CONFIG || {};
  const answerCard = document.getElementById('answerCard');

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function parsePdfPages(text) {
    const match = String(text).match(/\(PDF\s+p(?:p)?\.?\s*(\d+)(?:\s*[-–]\s*(\d+))?\)/i);
    if (!match) return null;

    return {
      start: Number(match[1]),
      end: match[2] ? Number(match[2]) : Number(match[1]),
      matchedText: match[0]
    };
  }

  function adjustReferenceText(text, pages) {
    const offset = Number(config.pageOffset || 0);
    if (!offset || !pages) return text;

    const start = pages.start + offset;
    const end = pages.end + offset;
    const replacement = start === end
      ? `(PDF p. ${start})`
      : `(PDF pp. ${start}-${end})`;

    return text.replace(pages.matchedText, replacement);
  }

  function resolvedGuideBaseUrl() {
    const configured = String(config.guideUrl || '').split('#')[0].trim();
    if (!configured) return '';
    if (/^(?:https?:|file:|blob:)/i.test(configured)) return configured;

    const siteRoot = new URL('../', window.location.href);
    return new URL(configured.replace(/^\.\//, '').replace(/^\//, ''), siteRoot).href;
  }

  function buildGuideUrl(page) {
    const baseUrl = resolvedGuideBaseUrl();
    const adjustedPage = page + Number(config.pageOffset || 0);
    return `${baseUrl}#page=${adjustedPage}`;
  }

  function enhanceReferenceList() {
    if (!answerCard) return;

    const list = answerCard.querySelector('.reference-list');
    if (!list || list.dataset.referenceLinksProcessed === 'true') return;

    list.dataset.referenceLinksProcessed = 'true';
    const items = list.querySelectorAll('li');

    for (const item of items) {
      const originalText = item.textContent.trim();
      const pages = parsePdfPages(originalText);
      const displayText = adjustReferenceText(originalText, pages);

      if (config.enabled && config.guideUrl && pages) {
        const link = document.createElement('a');
        link.href = buildGuideUrl(pages.start);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = displayText;
        link.title = `Open ${config.guideTitle || 'official guide'} at PDF page ${pages.start + Number(config.pageOffset || 0)}`;
        item.replaceChildren(link);
      } else {
        item.textContent = displayText;
      }
    }

    const note = document.createElement('p');
    note.className = 'external-note guide-reference-status';

    if (config.enabled && config.guideUrl) {
      note.innerHTML = `Guide links open <b>${escapeHtml(config.guideTitle || 'the configured guide')}</b> in a new tab. ${escapeHtml(config.status || '')}`;
    } else {
      note.textContent = config.status || 'Direct guide linking has not been configured.';
    }

    list.insertAdjacentElement('afterend', note);
  }

  if (answerCard) {
    const observer = new MutationObserver(enhanceReferenceList);
    observer.observe(answerCard, { childList: true, subtree: true });
    enhanceReferenceList();
  }
})();

(() => {
  'use strict';

  const key = 'prince2-attempt-history-v1';
  const history = (() => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  })();

  const misses = {};
  history.forEach((attempt) => {
    (attempt.questions || []).forEach((question) => {
      if (!question.attempted || question.points >= question.maximum) return;
      const id = `${attempt.examCode}-${question.number}`;
      misses[id] ||= {
        examCode: attempt.examCode,
        number: question.number,
        topic: question.topic,
        count: 0,
        lost: 0
      };
      misses[id].count += 1;
      misses[id].lost += question.maximum - question.points;
    });
  });

  const section = [...document.querySelectorAll('#historyContent section.card')]
    .find((item) => item.querySelector('h2')?.textContent === 'Repeatedly missed questions');
  if (!section) return;

  const items = Object.values(misses)
    .sort((a, b) => b.count - a.count || b.lost - a.lost)
    .slice(0, 15);

  section.innerHTML = `<h2>Repeatedly missed questions</h2>${items.length ? `<div class="repeat-grid">
    ${items.map((item) => `<article>
      <b>Exam ${item.examCode} · Question ${item.number}</b>
      <span>${item.topic}</span>
      <strong>Missed ${item.count} time${item.count === 1 ? '' : 's'}</strong>
    </article>`).join('')}
  </div>` : '<p>No repeated misses have been recorded.</p>'}`;
})();

(() => {
  'use strict';

  const card = document.getElementById('resultsCard');
  if (!card) return;

  function pointsFor(question, chosen) {
    const correct = question.answer.split(',').map((value) => value.trim());
    return question.marks === 1
      ? (chosen.length === 1 && chosen[0] === correct[0] ? 1 : 0)
      : correct.filter((letter) => chosen.includes(letter)).length;
  }

  function updateStudyDisplay() {
    if (typeof state !== 'object' || state.mode !== 'study' || state.submitted || typeof exam !== 'function') return;
    if (card.classList.contains('hidden') || !card.querySelector('.score')) return;

    let score = 0;
    let maximum = 0;
    let answered = 0;
    for (const question of exam().questions) {
      const chosen = state.answers[question.number] || [];
      if (!chosen.length) continue;
      answered += 1;
      maximum += question.marks;
      score += pointsFor(question, chosen);
    }
    if (!maximum) return;

    const percentage = Math.round((score / maximum) * 100);
    card.querySelector('.score').innerHTML = `${score} / ${maximum} <small>${percentage}% attempted accuracy</small>`;
    const summary = card.querySelector('.result-heading + p');
    if (summary) summary.textContent = `Study checkpoint saved with ${answered} answered questions. This score measures attempted questions rather than the full 70-mark exam.`;
  }

  const observer = new MutationObserver(updateStudyDisplay);
  observer.observe(card, { childList: true, subtree: true });
  updateStudyDisplay();
})();

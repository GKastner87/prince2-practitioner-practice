(() => {
  'use strict';

  const data = window.PRINCE2_FOUNDATION_STAGE_BOUNDARY;
  const $ = (id) => document.getElementById(id);
  const storageKey = 'prince2-foundation-stage-boundary-v1';

  let state = {
    order: data.questions.map((question) => question.id),
    index: 0,
    answers: {},
    revealed: {}
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function load() {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.order) && parsed.order.length === data.questions.length) {
        state = { ...state, ...parsed };
      }
    } catch (error) {
      console.warn('Foundation progress could not be restored.', error);
    }
  }

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function currentQuestion() {
    const id = state.order[state.index];
    return data.questions.find((question) => question.id === id);
  }

  function choose(letter) {
    const question = currentQuestion();
    if (state.revealed[question.id]) return;
    state.answers[question.id] = letter;
    save();
    render();
  }

  function renderQuestion() {
    const question = currentQuestion();
    const selected = state.answers[question.id] || '';
    const revealed = Boolean(state.revealed[question.id]);

    $('questionCard').innerHTML = `
      <div class="meta">Question ${state.index + 1} of ${data.questions.length} · ${escapeHtml(question.difficulty)}
        <span class="source-tag">Source #${question.sourceNumber}</span>
      </div>
      <h2>${escapeHtml(question.question)}</h2>
      <div role="radiogroup" aria-label="Answer options">
        ${Object.entries(question.options).map(([letter, text]) => {
          const resultClass = revealed
            ? (letter === question.answer ? ' result-correct' : (letter === selected ? ' result-incorrect' : ''))
            : '';
          return `
            <label class="option${resultClass}">
              <input type="radio" name="foundationAnswer" value="${letter}" ${selected === letter ? 'checked' : ''} ${revealed ? 'disabled' : ''}>
              <span class="letter">${letter}.</span>
              <span>${escapeHtml(text)}</span>
            </label>`;
        }).join('')}
      </div>`;

    $('questionCard').querySelectorAll('input[name="foundationAnswer"]').forEach((input) => {
      input.addEventListener('change', () => choose(input.value));
    });

    $('prevBtn').disabled = state.index === 0;
    $('nextBtn').disabled = state.index === data.questions.length - 1;
    $('revealBtn').disabled = !selected || revealed;
    $('revealBtn').textContent = revealed ? 'Answer revealed' : 'Check and reveal answer';
  }

  function renderAnswer() {
    const question = currentQuestion();
    const selected = state.answers[question.id];
    const revealed = Boolean(state.revealed[question.id]);

    if (!revealed) {
      $('answerCard').classList.add('hidden');
      $('answerCard').innerHTML = '';
      return;
    }

    const isCorrect = selected === question.answer;
    const correctText = question.options[question.answer];

    $('answerCard').classList.remove('hidden');
    $('answerCard').innerHTML = `
      <span class="answer-status ${isCorrect ? 'correct' : 'incorrect'}">${isCorrect ? 'Correct' : 'Review required'}</span>
      <h2 class="answer-heading">Correct answer: ${question.answer}</h2>
      <p><b>${escapeHtml(correctText)}</b></p>
      ${selected && !isCorrect ? `<p class="selected-answer">Your answer was ${escapeHtml(selected)}.</p>` : ''}
      <h3>Explanation</h3>
      <p>${escapeHtml(question.explanation)}</p>
      ${question.note ? `<p class="wording-note"><b>Question wording note:</b> ${escapeHtml(question.note)}</p>` : ''}
      <h3>Official guide references</h3>
      <ul class="reference-list">
        ${question.references.map((reference) => `<li>${escapeHtml(reference)}</li>`).join('')}
      </ul>
      <div class="reference-links compact">
        <a href="https://www.peoplecert.org/browse-certifications/project-programme-and-portfolio-management/PRINCE2-2/prince2-7-foundation-3579" target="_blank" rel="noopener noreferrer">
          <b>PeopleCert — PRINCE2 Project Management Foundation (Version 7)</b>
          <small>Official certification and learning-resource page.</small>
        </a>
        <a href="https://www.apm.org.uk/resources/what-is-project-management/what-is-a-business-case/" target="_blank" rel="noopener noreferrer">
          <b>APM — Business case overview</b>
          <small>Supplementary project-management context; PRINCE2 terminology is controlled by the official guide.</small>
        </a>
      </div>`;
  }

  function renderNavigator() {
    $('navigator').innerHTML = state.order.map((id, index) => {
      const answered = Boolean(state.answers[id]);
      const revealed = Boolean(state.revealed[id]);
      const classes = ['qnav'];
      if (answered) classes.push('answered');
      if (revealed) classes.push('revealed');
      if (index === state.index) classes.push('current');
      return `<button type="button" class="${classes.join(' ')}" data-index="${index}" aria-label="Question ${index + 1}">${index + 1}</button>`;
    }).join('');

    $('navigator').querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        state.index = Number(button.dataset.index);
        save();
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function renderProgress() {
    const answered = Object.keys(state.answers).length;
    const revealed = Object.keys(state.revealed).length;
    $('progressFill').style.width = `${(answered / data.questions.length) * 100}%`;
    $('progressText').textContent = `${answered} answered · ${revealed} explanations revealed · ${data.questions.length} total`;
  }

  function reveal() {
    const question = currentQuestion();
    if (!state.answers[question.id]) return;
    state.revealed[question.id] = true;
    save();
    render();
    $('answerCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function move(delta) {
    state.index = Math.max(0, Math.min(data.questions.length - 1, state.index + delta));
    save();
    render();
    $('questionCard').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function shuffle() {
    const order = [...state.order];
    for (let index = order.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
    }
    state.order = order;
    state.index = 0;
    save();
    render();
  }

  function reset() {
    if (!confirm('Clear all Foundation answers and revealed explanations?')) return;
    localStorage.removeItem(storageKey);
    state = {
      order: data.questions.map((question) => question.id),
      index: 0,
      answers: {},
      revealed: {}
    };
    render();
  }

  function render() {
    renderQuestion();
    renderAnswer();
    renderNavigator();
    renderProgress();
  }

  $('prevBtn').addEventListener('click', () => move(-1));
  $('nextBtn').addEventListener('click', () => move(1));
  $('revealBtn').addEventListener('click', reveal);
  $('shuffleBtn').addEventListener('click', shuffle);
  $('resetBtn').addEventListener('click', reset);

  load();
  render();
})();

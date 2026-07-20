(async () => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const storageKey = 'prince2-foundation-hard-library-v2';

  async function decodeGzipBase64(value) {
    if (typeof DecompressionStream !== 'function') {
      throw new Error('This browser does not support the compressed question-bank format.');
    }
    const bytes = Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  const batches = Array.isArray(window.PRINCE2_FOUNDATION_BATCHES)
    ? [...window.PRINCE2_FOUNDATION_BATCHES]
    : [];

  try {
    for (const payload of window.PRINCE2_FOUNDATION_GZIP || []) {
      batches.push(await decodeGzipBase64(payload));
    }
  } catch (error) {
    console.error('Foundation question data could not be decoded.', error);
    $('libraryCount').textContent = 'Question data failed to load.';
    $('questionCard').innerHTML = `<h2>Question data failed to load.</h2><p>${String(error.message || error)}</p>`;
    return;
  }

  function normalizeQuestion(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  const rawQuestions = batches.flatMap((batch) =>
    batch.questions.map((question) => ({
      ...question,
      batchId: batch.id,
      batchTitle: batch.title,
      batchDescription: batch.description
    }))
  );

  const uniqueMap = new Map();
  for (const question of rawQuestions) {
    const key = normalizeQuestion(question.question);
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, { ...question, duplicateSources: [] });
    } else {
      uniqueMap.get(key).duplicateSources.push({
        batchId: question.batchId,
        batchTitle: question.batchTitle,
        sourceNumber: question.sourceNumber
      });
    }
  }

  const questions = [...uniqueMap.values()];
  const questionById = new Map(questions.map((question) => [question.id, question]));

  let state = {
    filters: { batch: 'all', topic: 'all', difficulty: 'all' },
    order: [],
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
      state = {
        ...state,
        ...parsed,
        filters: { ...state.filters, ...(parsed.filters || {}) }
      };
    } catch (error) {
      console.warn('Foundation progress could not be restored.', error);
    }
  }

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function filteredQuestions() {
    return questions.filter((question) => {
      if (state.filters.batch !== 'all' && question.batchId !== state.filters.batch) return false;
      if (state.filters.topic !== 'all' && question.topic !== state.filters.topic) return false;
      if (state.filters.difficulty !== 'all' && question.sourceDifficulty !== state.filters.difficulty) return false;
      return true;
    });
  }

  function rebuildOrder(preserveCurrent = true) {
    const filtered = filteredQuestions();
    const allowed = new Set(filtered.map((question) => question.id));
    const oldCurrent = state.order[state.index];
    const retained = state.order.filter((id) => allowed.has(id));
    const retainedSet = new Set(retained);
    const missing = filtered.map((question) => question.id).filter((id) => !retainedSet.has(id));
    state.order = [...retained, ...missing];

    if (!preserveCurrent || !allowed.has(oldCurrent)) {
      state.index = 0;
    } else {
      state.index = Math.max(0, state.order.indexOf(oldCurrent));
    }
  }

  function currentQuestion() {
    return questionById.get(state.order[state.index]);
  }

  function populateFilters() {
    for (const batch of batches) {
      const option = document.createElement('option');
      option.value = batch.id;
      option.textContent = `${batch.title} (${batch.questions.length})`;
      $('batchSelect').append(option);
    }

    const topics = [...new Set(questions.map((question) => question.topic))].sort();
    for (const topic of topics) {
      const count = questions.filter((question) => question.topic === topic).length;
      const option = document.createElement('option');
      option.value = topic;
      option.textContent = `${topic} (${count})`;
      $('topicSelect').append(option);
    }

    const difficulties = [...new Set(questions.map((question) => question.sourceDifficulty))];
    const order = ['Easy', 'Moderate', 'Challenging', 'Hard', 'Very Hard'];
    difficulties.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    for (const difficulty of difficulties) {
      const option = document.createElement('option');
      option.value = difficulty;
      option.textContent = difficulty;
      $('difficultySelect').append(option);
    }

    $('batchSelect').value = state.filters.batch;
    $('topicSelect').value = state.filters.topic;
    $('difficultySelect').value = state.filters.difficulty;
  }

  function choose(letter) {
    const question = currentQuestion();
    if (!question || state.revealed[question.id]) return;
    state.answers[question.id] = letter;
    save();
    render();
  }

  function renderQuestion() {
    const question = currentQuestion();
    if (!question) {
      $('questionCard').innerHTML = '<h2>No questions match the selected filters.</h2><p>Change one or more filters to continue.</p>';
      $('answerCard').classList.add('hidden');
      $('prevBtn').disabled = true;
      $('nextBtn').disabled = true;
      $('revealBtn').disabled = true;
      return;
    }

    const selected = state.answers[question.id] || '';
    const revealed = Boolean(state.revealed[question.id]);

    $('questionCard').innerHTML = `
      <div class="meta">
        Hard Foundation · Question ${state.index + 1} of ${state.order.length}
        <span class="source-tag">${escapeHtml(question.batchTitle)} · source #${question.sourceNumber}</span>
        <span class="source-tag">Original label: ${escapeHtml(question.sourceDifficulty)}</span>
      </div>
      <p class="topic-chip">${escapeHtml(question.topic)}</p>
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
    $('nextBtn').disabled = state.index === state.order.length - 1;
    $('revealBtn').disabled = !selected || revealed;
    $('revealBtn').textContent = revealed ? 'Answer revealed' : 'Check and reveal answer';
  }

  function renderAnswer() {
    const question = currentQuestion();
    if (!question || !state.revealed[question.id]) {
      $('answerCard').classList.add('hidden');
      $('answerCard').innerHTML = '';
      return;
    }

    const selected = state.answers[question.id];
    const isCorrect = selected === question.answer;
    const references = Array.isArray(question.references) ? question.references : [];

    $('answerCard').classList.remove('hidden');
    $('answerCard').innerHTML = `
      <span class="answer-status ${isCorrect ? 'correct' : 'incorrect'}">${isCorrect ? 'Correct' : 'Review required'}</span>
      <h2 class="answer-heading">Answer: ${escapeHtml(question.answer)}</h2>
      <p><b>${escapeHtml(question.options[question.answer])}</b></p>
      ${selected && !isCorrect ? `<p class="selected-answer">Your answer was ${escapeHtml(selected)}.</p>` : ''}
      <h3>Explanation</h3>
      ${question.explanation.split(/\n\s*\n/).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      <p class="answer-basis"><b>Answer basis:</b> ${escapeHtml(question.answerBasis)}</p>
      ${question.concept ? `<p><b>Concept:</b> ${escapeHtml(question.concept)}</p>` : ''}
      <h3>Reference mapping</h3>
      <ul class="reference-list">
        ${references.map((reference) => `<li>${escapeHtml(reference)}</li>`).join('')}
      </ul>
      ${question.duplicateSources.length
        ? `<p class="duplicate-note">This question also appeared in ${question.duplicateSources.map((item) => `${escapeHtml(item.batchTitle)} source #${item.sourceNumber}`).join(', ')} and is shown once.</p>`
        : ''}
      <div class="reference-links compact">
        <a href="https://www.peoplecert.org/browse-certifications/project-programme-and-portfolio-management/PRINCE2-2/prince2-7-foundation-3579" target="_blank" rel="noopener noreferrer">
          <b>PeopleCert — PRINCE2 Project Management Foundation (Version 7)</b>
          <small>Official certification and learning-resource page.</small>
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
        $('questionCard').focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function renderProgress() {
    const filteredIds = new Set(state.order);
    const answered = Object.keys(state.answers).filter((id) => filteredIds.has(id)).length;
    const revealed = Object.keys(state.revealed).filter((id) => filteredIds.has(id)).length;
    const total = state.order.length;
    $('progressFill').style.width = total ? `${(answered / total) * 100}%` : '0%';
    $('progressText').textContent = `${answered} answered · ${revealed} explanations revealed · ${total} in current set`;
    $('filterSummary').textContent = `${total} unique questions match the current filters.`;
    $('libraryCount').textContent = `${questions.length} unique questions from ${rawQuestions.length} supplied records across ${batches.length} exports.`;
  }

  function reveal() {
    const question = currentQuestion();
    if (!question || !state.answers[question.id]) return;
    state.revealed[question.id] = true;
    save();
    render();
    $('answerCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function move(delta) {
    state.index = Math.max(0, Math.min(state.order.length - 1, state.index + delta));
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

  function applyFilters() {
    state.filters = {
      batch: $('batchSelect').value,
      topic: $('topicSelect').value,
      difficulty: $('difficultySelect').value
    };
    rebuildOrder(false);
    save();
    render();
  }

  function reset() {
    if (!confirm('Clear all Foundation answers, filters and revealed explanations?')) return;
    localStorage.removeItem(storageKey);
    state = {
      filters: { batch: 'all', topic: 'all', difficulty: 'all' },
      order: questions.map((question) => question.id),
      index: 0,
      answers: {},
      revealed: {}
    };
    $('batchSelect').value = 'all';
    $('topicSelect').value = 'all';
    $('difficultySelect').value = 'all';
    render();
  }

  function render() {
    renderQuestion();
    renderAnswer();
    renderNavigator();
    renderProgress();
  }

  if (!batches.length || !questions.length) {
    $('libraryCount').textContent = 'Question data failed to load.';
    $('questionCard').innerHTML = '<h2>Question data failed to load.</h2><p>Refresh the page or check the data files in the repository.</p>';
    return;
  }

  load();
  populateFilters();
  rebuildOrder();

  $('prevBtn').addEventListener('click', () => move(-1));
  $('nextBtn').addEventListener('click', () => move(1));
  $('revealBtn').addEventListener('click', reveal);
  $('shuffleBtn').addEventListener('click', shuffle);
  $('resetBtn').addEventListener('click', reset);
  $('batchSelect').addEventListener('change', applyFilters);
  $('topicSelect').addEventListener('change', applyFilters);
  $('difficultySelect').addEventListener('change', applyFilters);

  render();
})();

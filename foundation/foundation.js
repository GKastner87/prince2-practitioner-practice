(async () => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const storageKey = 'prince2-foundation-study-library-v3';

  const setLabels = {
    'hard-foundation-01': 'Set 1 — General scenarios',
    'hard-foundation-02': 'Set 2 — Core PRINCE2 bank',
    'hard-foundation-03': 'Set 3 — Stage boundary focus',
    'hard-foundation-04': 'Set 4 — Mixed Foundation bank',
    'hard-foundation-05': 'Set 5 — Advanced application'
  };

  const topicGroups = [
    { id: 'fundamentals', label: 'Fundamentals & context' },
    { id: 'people', label: 'People & organization' },
    { id: 'business', label: 'Business case & benefits' },
    { id: 'plans', label: 'Plans & product focus' },
    { id: 'quality', label: 'Quality' },
    { id: 'risk-issues', label: 'Risk & issues' },
    { id: 'progress', label: 'Progress & control' },
    { id: 'starting', label: 'Starting & initiating' },
    { id: 'delivery', label: 'Directing, delivery & closure' }
  ];
  const topicLabelById = new Map(topicGroups.map((item) => [item.id, item.label]));

  function consolidatedTopic(question) {
    const value = `${question.topic || ''} ${question.concept || ''}`.toLowerCase();

    if (/(starting up|initiating a project|project initiation|project brief|project mandate)/.test(value)) return 'starting';
    if (/(directing a project|controlling a stage|managing product delivery|managing a stage boundary|closing a project|stage boundary|project closure|work package)/.test(value)) return 'delivery';
    if (/(business case|benefit|investment appraisal|output|outcome|dis-benefit|continued business justification)/.test(value)) return 'business';
    if (/(plans practice|planning|plan\b|product breakdown|product flow|scope|schedule|estimating|resource|procurement|delivery approach)/.test(value)) return 'plans';
    if (/(quality|acceptance criteria|product description|product register)/.test(value)) return 'quality';
    if (/(risk|issue|change control|change authority|configuration|baseline management)/.test(value)) return 'risk-issues';
    if (/(progress|tolerance|exception report|forecast|monitoring|control|highlight report|checkpoint report)/.test(value)) return 'progress';
    if (/(people|organizing|leadership|stakeholder|team|governance|role|responsibilit|communication|project ecosystem)/.test(value)) return 'people';
    return 'fundamentals';
  }

  async function decodeGzipBase64(value) {
    if (typeof DecompressionStream !== 'function') {
      throw new Error('This browser is too old for the compressed question-bank format. Update Safari, Edge, Chrome or Firefox.');
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
    $('questionCard').innerHTML = `<h2>Question data failed to load.</h2><p>${escapeHtml(error.message || error)}</p>`;
    return;
  }

  function normalizeQuestion(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function displayBatchTitle(batchId, fallback, index = 0) {
    return setLabels[batchId] || `Set ${index + 1} — ${fallback || 'Practice questions'}`;
  }

  const rawQuestions = batches.flatMap((batch, batchIndex) =>
    batch.questions.map((question) => ({
      ...question,
      batchId: batch.id,
      batchTitle: displayBatchTitle(batch.id, batch.title, batchIndex),
      batchDescription: batch.description,
      conciseTopic: consolidatedTopic(question)
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
    filters: { batch: 'all', topic: 'all' },
    order: [],
    index: 0,
    answers: {},
    revealed: {},
    notes: {},
    noteScope: 'question'
  };

  let noteMode = 'edit';
  let activeNoteKey = '';

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function renderInlineMarkdown(value) {
    let output = escapeHtml(value);
    output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
    output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    output = output.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    output = output.replace(/(^|[^\*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return output;
  }

  function renderMarkdown(markdown) {
    const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    const output = [];
    let listType = '';
    let paragraph = [];

    function flushParagraph() {
      if (!paragraph.length) return;
      output.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
      paragraph = [];
    }

    function closeList() {
      if (!listType) return;
      output.push(`</${listType}>`);
      listType = '';
    }

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph();
        closeList();
        continue;
      }

      const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (heading) {
        flushParagraph();
        closeList();
        const level = heading[1].length;
        output.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
        continue;
      }

      if (/^---+$/.test(trimmed)) {
        flushParagraph();
        closeList();
        output.push('<hr>');
        continue;
      }

      if (trimmed.startsWith('> ')) {
        flushParagraph();
        closeList();
        output.push(`<blockquote>${renderInlineMarkdown(trimmed.slice(2))}</blockquote>`);
        continue;
      }

      const unordered = trimmed.match(/^[-*+]\s+(.+)$/);
      const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
      if (unordered || ordered) {
        flushParagraph();
        const wanted = unordered ? 'ul' : 'ol';
        if (listType !== wanted) {
          closeList();
          listType = wanted;
          output.push(`<${wanted}>`);
        }
        output.push(`<li>${renderInlineMarkdown((unordered || ordered)[1])}</li>`);
        continue;
      }

      closeList();
      paragraph.push(trimmed);
    }

    flushParagraph();
    closeList();
    return output.join('') || '<p class="empty-preview">Nothing written yet.</p>';
  }

  function load() {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      state = {
        ...state,
        ...parsed,
        filters: { ...state.filters, ...(parsed.filters || {}) },
        notes: { ...(parsed.notes || {}) }
      };
    } catch (error) {
      console.warn('Foundation progress could not be restored.', error);
    }
  }

  function save(statusText = 'Saved locally') {
    localStorage.setItem(storageKey, JSON.stringify(state));
    if ($('noteSaveStatus')) {
      $('noteSaveStatus').textContent = statusText;
    }
  }

  function filteredQuestions() {
    return questions.filter((question) => {
      if (state.filters.batch !== 'all' && question.batchId !== state.filters.batch) return false;
      if (state.filters.topic !== 'all' && question.conciseTopic !== state.filters.topic) return false;
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
    batches.forEach((batch, index) => {
      const option = document.createElement('option');
      option.value = batch.id;
      option.textContent = `${displayBatchTitle(batch.id, batch.title, index)} (${batch.questions.length})`;
      $('batchSelect').append(option);
    });

    for (const topic of topicGroups) {
      const count = questions.filter((question) => question.conciseTopic === topic.id).length;
      if (!count) continue;
      const option = document.createElement('option');
      option.value = topic.id;
      option.textContent = `${topic.label} (${count})`;
      $('topicSelect').append(option);
    }

    $('batchSelect').value = state.filters.batch;
    $('topicSelect').value = state.filters.topic;
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
      $('questionCard').innerHTML = '<h2>No questions match these filters.</h2><p>Choose a different practice set or topic.</p>';
      $('answerCard').classList.add('hidden');
      $('prevBtn').disabled = true;
      $('nextBtn').disabled = true;
      $('revealBtn').disabled = true;
      return;
    }

    const selected = state.answers[question.id] || '';
    const revealed = Boolean(state.revealed[question.id]);

    $('questionCard').innerHTML = `
      <div class="question-topline">
        <span class="question-number">Question ${state.index + 1} of ${state.order.length}</span>
        <span class="topic-chip">${escapeHtml(topicLabelById.get(question.conciseTopic) || 'Fundamentals & context')}</span>
      </div>
      <div class="question-source">
        ${escapeHtml(question.batchTitle)} · source #${question.sourceNumber}
        ${question.sourceDifficulty ? `<span>· source label: ${escapeHtml(question.sourceDifficulty)}</span>` : ''}
      </div>
      <h2>${escapeHtml(question.question)}</h2>
      <div class="option-list" role="radiogroup" aria-label="Answer options">
        ${Object.entries(question.options).map(([letter, text]) => {
          const resultClass = revealed
            ? (letter === question.answer ? ' result-correct' : (letter === selected ? ' result-incorrect' : ''))
            : '';
          return `
            <label class="option${resultClass}">
              <input type="radio" name="foundationAnswer" value="${letter}" ${selected === letter ? 'checked' : ''} ${revealed ? 'disabled' : ''}>
              <span class="letter">${letter}</span>
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
      <div class="answer-summary">
        <span class="answer-status ${isCorrect ? 'correct' : 'incorrect'}">${isCorrect ? 'Correct' : 'Review required'}</span>
        <div>
          <p class="answer-label">Correct answer</p>
          <h2>${escapeHtml(question.answer)}. ${escapeHtml(question.options[question.answer])}</h2>
        </div>
      </div>
      ${selected && !isCorrect ? `<p class="selected-answer">You selected ${escapeHtml(selected)}. ${escapeHtml(question.options[selected])}</p>` : ''}
      <h3>Explanation</h3>
      ${question.explanation.split(/\n\s*\n/).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      <div class="answer-detail-grid">
        <p><b>Concept</b><br>${escapeHtml(question.concept || 'PRINCE2 Foundation')}</p>
        <p><b>Answer basis</b><br>${escapeHtml(question.answerBasis || 'Derived from the supplied explanation.')}</p>
      </div>
      <h3>Reference mapping</h3>
      <ul class="reference-list">
        ${references.map((reference) => `<li>${escapeHtml(reference)}</li>`).join('')}
      </ul>
      ${question.duplicateSources.length
        ? `<p class="duplicate-note">Also supplied in ${question.duplicateSources.map((item) => `${escapeHtml(item.batchTitle)} source #${item.sourceNumber}`).join(', ')}. It is shown once.</p>`
        : ''}
      <div class="reference-links compact">
        <a href="https://www.peoplecert.org/browse-certifications/project-programme-and-portfolio-management/PRINCE2-2/prince2-7-foundation-3579" target="_blank" rel="noopener noreferrer">
          <b>PeopleCert — PRINCE2 Foundation Version 7</b>
          <small>Official certification and learning-resource page.</small>
        </a>
      </div>`;
  }

  function renderNavigator() {
    $('navigator').innerHTML = state.order.map((id, index) => {
      const answered = Boolean(state.answers[id]);
      const revealed = Boolean(state.revealed[id]);
      const question = questionById.get(id);
      const isCorrect = revealed && state.answers[id] === question.answer;
      const classes = ['qnav'];
      if (answered) classes.push('answered');
      if (revealed) classes.push('revealed');
      if (isCorrect) classes.push('correct-answer');
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
    const correct = Object.keys(state.revealed).filter((id) => {
      if (!filteredIds.has(id)) return false;
      const question = questionById.get(id);
      return question && state.answers[id] === question.answer;
    }).length;
    const notes = Object.entries(state.notes).filter(([, value]) => String(value).trim()).length;
    const total = state.order.length;

    $('progressFill').style.width = total ? `${(answered / total) * 100}%` : '0%';
    $('progressText').textContent = `${answered} answered · ${revealed} revealed · ${total} in this view`;
    $('filterSummary').textContent = `${total} unique questions match the selected set and topic.`;
    $('libraryCount').textContent = `${questions.length} unique questions from ${rawQuestions.length} supplied records across ${batches.length} practice sets.`;
    $('answeredStat').textContent = answered;
    $('revealedStat').textContent = revealed;
    $('correctStat').textContent = correct;
    $('notesStat').textContent = notes;
    $('topicTitle').textContent = state.filters.topic === 'all'
      ? 'All concise topics'
      : topicLabelById.get(state.filters.topic);
  }

  function noteKey() {
    if (state.noteScope === 'general') return '_general';
    const question = currentQuestion();
    return question ? question.id : '_general';
  }

  function syncNoteEditor(force = false) {
    const key = noteKey();
    if (!force && activeNoteKey === key && document.activeElement === $('noteEditor')) return;
    activeNoteKey = key;
    $('noteEditor').value = state.notes[key] || '';
    $('notePreview').innerHTML = renderMarkdown(state.notes[key] || '');
    $('noteScope').value = state.noteScope;
    $('notesTitle').textContent = state.noteScope === 'general' ? 'General notebook' : 'Question notes';
  }

  function setNoteMode(mode) {
    noteMode = mode;
    const preview = mode === 'preview';
    $('noteEditor').classList.toggle('hidden', preview);
    $('notePreview').classList.toggle('hidden', !preview);
    $('noteEditTab').classList.toggle('active', !preview);
    $('notePreviewTab').classList.toggle('active', preview);
    $('noteEditTab').setAttribute('aria-selected', String(!preview));
    $('notePreviewTab').setAttribute('aria-selected', String(preview));
    if (preview) {
      $('notePreview').innerHTML = renderMarkdown($('noteEditor').value);
    } else {
      $('noteEditor').focus();
    }
  }

  function updateNote() {
    const key = noteKey();
    state.notes[key] = $('noteEditor').value;
    $('noteSaveStatus').textContent = 'Saving…';
    save('Saved locally');
    $('notesStat').textContent = Object.values(state.notes).filter((value) => String(value).trim()).length;
    if (noteMode === 'preview') $('notePreview').innerHTML = renderMarkdown(state.notes[key]);
  }

  function downloadNotes() {
    const general = String(state.notes._general || '').trim();
    const sections = [];
    if (general) sections.push(`# General Foundation notes\n\n${general}`);

    for (const question of questions) {
      const note = String(state.notes[question.id] || '').trim();
      if (!note) continue;
      sections.push(
        `# ${question.batchTitle} — source #${question.sourceNumber}\n\n` +
        `**Topic:** ${topicLabelById.get(question.conciseTopic)}\n\n` +
        `**Question:** ${question.question}\n\n${note}`
      );
    }

    const content = sections.length
      ? `${sections.join('\n\n---\n\n')}\n`
      : '# PRINCE2 Foundation study notes\n\nNo notes have been written yet.\n';
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prince2-foundation-study-notes.md';
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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

  function nextUnanswered() {
    if (!state.order.length) return;
    for (let offset = 1; offset <= state.order.length; offset += 1) {
      const candidateIndex = (state.index + offset) % state.order.length;
      const id = state.order[candidateIndex];
      if (!state.answers[id]) {
        state.index = candidateIndex;
        save();
        render();
        $('questionCard').focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    $('filterSummary').textContent = 'Every question in the current view has an answer.';
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
      topic: $('topicSelect').value
    };
    rebuildOrder(false);
    save();
    render();
  }

  function reset() {
    if (!confirm('Clear all Foundation answers, revealed explanations, filters and study notes on this device?')) return;
    localStorage.removeItem(storageKey);
    state = {
      filters: { batch: 'all', topic: 'all' },
      order: questions.map((question) => question.id),
      index: 0,
      answers: {},
      revealed: {},
      notes: {},
      noteScope: 'question'
    };
    $('batchSelect').value = 'all';
    $('topicSelect').value = 'all';
    activeNoteKey = '';
    setNoteMode('edit');
    render();
  }

  function render() {
    renderQuestion();
    renderAnswer();
    renderNavigator();
    renderProgress();
    syncNoteEditor();
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
  $('nextUnansweredBtn').addEventListener('click', nextUnanswered);
  $('shuffleBtn').addEventListener('click', shuffle);
  $('resetBtn').addEventListener('click', reset);
  $('batchSelect').addEventListener('change', applyFilters);
  $('topicSelect').addEventListener('change', applyFilters);
  $('noteScope').addEventListener('change', () => {
    state.noteScope = $('noteScope').value;
    activeNoteKey = '';
    save();
    syncNoteEditor(true);
  });
  $('noteEditor').addEventListener('input', updateNote);
  $('noteEditTab').addEventListener('click', () => setNoteMode('edit'));
  $('notePreviewTab').addEventListener('click', () => setNoteMode('preview'));
  $('downloadNotesBtn').addEventListener('click', downloadNotes);

  render();
})();

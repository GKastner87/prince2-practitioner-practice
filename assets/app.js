const $ = (id) => document.getElementById(id);
const EXAM_CACHE = {};
const PASS_MARK = 42;
const EXAM_SECONDS = 150 * 60;

const LINKS = {
  official: {
    title: 'PeopleCert — PRINCE2 Project Management Practitioner (Version 7)',
    url: 'https://www.peoplecert.org/browse-certifications/project-programme-and-portfolio-management/PRINCE2-2/PRINCE2-7-practitioner-3581',
    note: 'Official certification, exam format and learning-resource page.'
  },
  officialOverview: {
    title: 'PeopleCert — What changed in PRINCE2 7',
    url: 'https://www.peoplecert.org/news-and-announcements/new-prince2-7',
    note: 'Official overview of people, tailoring, digital/data and sustainability changes.'
  },
  officialFaq: {
    title: 'PeopleCert — Candidate FAQ and open-book rules',
    url: 'https://www.peoplecert.org/help-and-support/FAQ',
    note: 'Official examination and core-guidance usage rules.'
  },
  mock: {
    title: 'PeopleCert — Official PRINCE2 7 Practitioner mock exam',
    url: 'https://www.peoplecert.org/browse-mock-exams/project-programme-and-portfolio-management/PRINCE2-2/PRINCE2%207%20Practitioner%20Mock%20exam-3582',
    note: 'Official timed and marked mock-exam product.'
  },
  businessCase: {
    title: 'APM — What is a business case?',
    url: 'https://www.apm.org.uk/resources/what-is-project-management/what-is-a-business-case/',
    note: 'Independent professional reference on project justification and value.'
  },
  benefits: {
    title: 'APM — Benefits management and project success',
    url: 'https://www.apm.org.uk/resources/what-is-project-management/what-is-benefits-management-and-project-success/',
    note: 'Independent professional reference on planning, tracking and realizing benefits.'
  },
  governance: {
    title: 'APM — What is project governance?',
    url: 'https://www.apm.org.uk/resources/what-is-project-management/what-is-governance/',
    note: 'Independent professional reference on authority, accountability and escalation.'
  },
  controls: {
    title: 'APM — What are project controls?',
    url: 'https://www.apm.org.uk/resources/what-is-project-management/what-is-project-controls/',
    note: 'Independent professional reference on forecasting, reporting and corrective action.'
  },
  planning: {
    title: 'APM — What is project planning?',
    url: 'https://www.apm.org.uk/resources/what-is-project-management-1/what-is-planning/',
    note: 'Independent professional reference on integrated planning and baselines.'
  },
  risk: {
    title: 'APM — What is risk management?',
    url: 'https://www.apm.org.uk/resources/what-is-project-management/what-is-risk-management/',
    note: 'Independent professional reference on threats, opportunities, responses and ownership.'
  },
  changeControl: {
    title: 'APM — What is change control?',
    url: 'https://www.apm.org.uk/resources/what-is-project-management/what-is-change-control/',
    note: 'Independent professional reference on evaluating and authorizing baseline changes.'
  },
  quality: {
    title: 'APM — Quality management and control',
    url: 'https://www.apm.org.uk/resources/what-is-project-management/what-is-quality-management-and-control/',
    note: 'Independent professional reference on acceptance criteria, testing and fitness for purpose.'
  },
  stakeholders: {
    title: 'APM — Stakeholder engagement',
    url: 'https://www.apm.org.uk/resources/find-a-resource/stakeholder-engagement/',
    note: 'Independent professional reference on identifying, analysing and engaging stakeholders.'
  },
  peopleChange: {
    title: 'APM — Change management and organisational change',
    url: 'https://www.apm.org.uk/resources/what-is-project-management/what-is-change-management/',
    note: 'Independent professional reference on adoption, behaviour and embedding change.'
  },
  information: {
    title: 'APM — Information management',
    url: 'https://www.apm.org.uk/resources/what-is-project-management/what-is-information-management/',
    note: 'Independent professional reference on project records, version control and accessibility.'
  },
  lifecycle: {
    title: 'APM — What is a project life cycle?',
    url: 'https://www.apm.org.uk/resources/what-is-project-management/what-is-a-life-cycle/',
    note: 'Independent professional reference on lifecycle structures and delivery approaches.'
  },
  closure: {
    title: 'APM — How to close a project',
    url: 'https://www.apm.org.uk/blog/how-to-close-a-project/',
    note: 'Independent professional discussion of controlled closure and lessons.'
  }
};

let state = {
  exam: 'A',
  mode: 'study',
  index: 0,
  answers: {},
  revealed: {},
  started: Date.now(),
  submitted: false
};
let tickHandle;

async function decodeExam(code) {
  if (EXAM_CACHE[code]) return EXAM_CACHE[code];
  const encoded = window.PRINCE2_EXAM_GZIP?.[code];
  if (!encoded) throw new Error(`Exam ${code} data is missing.`);
  if (!('DecompressionStream' in window)) {
    throw new Error('This browser is too old to decompress the exam data. Use a current version of Safari, Chrome, Edge or Firefox.');
  }
  const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const text = await new Response(stream).text();
  EXAM_CACHE[code] = JSON.parse(text);
  return EXAM_CACHE[code];
}

function exam() { return EXAM_CACHE[state.exam]; }
function question() { return exam().questions[state.index]; }
function stateKey() { return `prince2-practice-v3-${state.exam}-${state.mode}`; }
function answerLetters(q) { return q.answer.split(',').map((x) => x.trim()); }
function selected() { return state.answers[question().number] || []; }
function save() { localStorage.setItem(stateKey(), JSON.stringify(state)); }

function loadSavedState() {
  const raw = localStorage.getItem(stateKey());
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    state = { ...state, ...saved, exam: state.exam, mode: state.mode };
  } catch (error) {
    console.warn('Saved progress could not be read.', error);
  }
}

function esc(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

function setSelected(values) {
  state.answers[question().number] = values;
  save();
  renderNavigator();
  renderProgress();
}

function choose(letter, checked) {
  const q = question();
  let values = [...selected()];
  if (q.marks === 1) {
    values = [letter];
  } else if (checked) {
    if (values.length >= 2 && !values.includes(letter)) {
      alert('Select exactly two answers. Remove one selection first.');
      renderQuestion();
      return;
    }
    if (!values.includes(letter)) values.push(letter);
  } else {
    values = values.filter((value) => value !== letter);
  }
  setSelected(values);
  renderQuestion();
}
window.choose = choose;

function renderScenario() {
  const q = question();
  const scenario = exam().scenarios.find((item) => item.number === q.scenario);
  $('scenarioCard').innerHTML = `
    <h2>Scenario ${scenario.number}: ${esc(scenario.heading)}</h2>
    <details open>
      <summary>Show or hide scenario information</summary>
      <p>${esc(scenario.text)}</p>
    </details>`;
}

function renderQuestion() {
  const q = question();
  const values = selected();
  $('questionCard').innerHTML = `
    <div class="meta">Question ${q.number} of ${exam().questions.length} · ${q.marks} mark${q.marks > 1 ? 's' : ''}${q.marks === 2 ? ' · Select TWO' : ''} · ${esc(q.topic)}</div>
    <h2>${esc(q.text)}</h2>
    <div role="group" aria-label="Answer options">
      ${q.options.map((option) => `
        <label class="option">
          <input type="${q.marks === 1 ? 'radio' : 'checkbox'}" name="option" ${values.includes(option.letter) ? 'checked' : ''} onchange="choose('${option.letter}', this.checked)">
          <span class="letter">${option.letter}.</span>
          <span>${esc(option.text)}</span>
        </label>`).join('')}
    </div>`;

  $('prevBtn').disabled = state.index === 0;
  $('nextBtn').disabled = state.index === exam().questions.length - 1;
  $('checkBtn').classList.toggle('hidden', state.mode !== 'study');
  $('submitBtn').classList.toggle('hidden', state.mode !== 'timed');
  if (state.mode === 'study' && state.revealed[q.number]) renderAnswer();
  else $('answerCard').classList.add('hidden');
}

function topicLinks(q) {
  const haystack = `${q.topic} ${q.text} ${q.rationale}`.toLowerCase();
  const keys = ['official'];
  const add = (key) => { if (!keys.includes(key)) keys.push(key); };

  if (/business case|justification|desirab|viab|achiev/.test(haystack)) { add('businessCase'); add('benefits'); }
  if (/benefit|outcome|post-project|review plan/.test(haystack)) add('benefits');
  if (/risk|threat|opportunit|risk owner|risk action/.test(haystack)) add('risk');
  if (/issue|change|off-specification|request for change|baseline|configuration/.test(haystack)) add('changeControl');
  if (/quality|acceptance|product description|quality register|fit for purpose/.test(haystack)) add('quality');
  if (/plan|planning|work package|stage plan|team plan|product-based planning/.test(haystack)) add('planning');
  if (/progress|tolerance|exception|forecast|highlight report|checkpoint|control/.test(haystack)) add('controls');
  if (/role|board|executive|senior user|senior supplier|assurance|authority|directing|governance/.test(haystack)) add('governance');
  if (/people|stakeholder|communication|organizing|team|user engagement/.test(haystack)) add('stakeholders');
  if (/adoption|resistance|change management|culture|behaviour/.test(haystack)) add('peopleChange');
  if (/management product|record|register|report|information|document/.test(haystack)) add('information');
  if (/process|starting up|initiating|controlling a stage|stage boundary|product delivery|life cycle|lifecycle/.test(haystack)) add('lifecycle');
  if (/closing|closure|follow-on|end project/.test(haystack)) { add('closure'); add('benefits'); }
  if (/tailor|sustainability|digital|data/.test(haystack)) add('officialOverview');

  return keys.slice(0, 4).map((key) => LINKS[key]);
}

function renderAnswer() {
  const q = question();
  const links = topicLinks(q);
  $('answerCard').classList.remove('hidden');
  $('answerCard').innerHTML = `
    <h3>Correct answer: ${esc(q.answer)}</h3>
    <p class="clue"><b>Scenario clue:</b> ${esc(q.scenario_clue)}</p>
    <p><b>Why it is correct:</b> ${esc(q.rationale)}</p>

    <h3>Option-by-option review</h3>
    <div class="option-review-grid">
      ${q.option_explanations.map((item) => `
        <article class="option-review ${item.verdict.toLowerCase()}">
          <div><b>${item.letter}.</b> ${esc(item.text)}<br><span class="verdict">${esc(item.verdict)}</span></div>
          <div>${esc(item.reason)}</div>
        </article>`).join('')}
    </div>

    <h3>Official guide references</h3>
    <ul class="reference-list">${q.detailed_references.map((reference) => `<li>${esc(reference)}</li>`).join('')}</ul>
    <p class="external-note">The page and section references point to <i>Managing Successful Projects with PRINCE2® 7th edition</i>. The official guide remains the controlling source for PRINCE2-specific exam terminology.</p>

    <h3>Further authoritative reading</h3>
    <div class="reference-links">
      ${links.map((link) => `<a href="${link.url}" target="_blank" rel="noopener noreferrer"><b>${esc(link.title)}</b><small>${esc(link.note)}</small></a>`).join('')}
    </div>
    <p class="external-note">External sources provide supporting project-management context. They do not replace the official PRINCE2 guidance where terminology or responsibility assignments differ.</p>

    <p class="takeaway">${esc(q.takeaway)}</p>`;
}

function checkAnswer() {
  const required = question().marks === 2 ? 2 : 1;
  if (selected().length !== required) {
    alert(required === 2 ? 'Select exactly two answers first.' : 'Select an answer first.');
    return;
  }
  state.revealed[question().number] = true;
  save();
  renderAnswer();
  renderNavigator();
  $('answerCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function move(delta) {
  state.index = Math.max(0, Math.min(exam().questions.length - 1, state.index + delta));
  save();
  render();
  $('questionCard').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToQuestion(number) {
  state.index = number - 1;
  save();
  render();
  $('questionCard').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.goToQuestion = goToQuestion;

function renderNavigator() {
  $('navigator').innerHTML = exam().questions.map((q, index) => {
    const classes = ['qnav'];
    if ((state.answers[q.number] || []).length) classes.push('answered');
    if (state.revealed[q.number]) classes.push('revealed');
    if (index === state.index) classes.push('current');
    return `<button type="button" class="${classes.join(' ')}" onclick="goToQuestion(${q.number})" aria-label="Question ${q.number}">${q.number}</button>`;
  }).join('');
}

function renderProgress() {
  const answered = Object.values(state.answers).filter((value) => value.length).length;
  const total = exam().questions.length;
  $('progressFill').style.width = `${(answered / total) * 100}%`;
  $('progressText').textContent = `${answered} of ${total} questions answered`;
}

function scoreExam() {
  let score = 0;
  let maximum = 0;
  const incomplete = [];
  for (const q of exam().questions) {
    const chosen = state.answers[q.number] || [];
    const correct = answerLetters(q);
    maximum += q.marks;
    const points = q.marks === 1
      ? (chosen.length === 1 && chosen[0] === correct[0] ? 1 : 0)
      : correct.filter((letter) => chosen.includes(letter)).length;
    score += points;
    if (points < q.marks) incomplete.push({ number: q.number, points, maximum: q.marks });
  }
  return { score, maximum, incomplete };
}

function submitExam(force = false) {
  if (!force && !confirm('Submit the exam and reveal the result?')) return;
  state.submitted = true;
  for (const q of exam().questions) state.revealed[q.number] = true;
  save();
  const result = scoreExam();
  const percentage = Math.round((result.score / result.maximum) * 100);
  $('resultsCard').classList.remove('hidden');
  $('resultsCard').innerHTML = `
    <h2>Exam result</h2>
    <div class="score">${result.score} / ${result.maximum} (${percentage}%)</div>
    <p>${result.score >= PASS_MARK ? 'Pass-level score. Maintain a margin above 60% before the live exam.' : 'Below the 60% practice target. Review the listed questions and retest.'}</p>
    <p><b>Questions not awarded full marks:</b></p>
    <div class="review-buttons">${result.incomplete.length ? result.incomplete.map((item) => `<button type="button" onclick="reviewQuestion(${item.number})">${item.number} (${item.points}/${item.maximum})</button>`).join('') : 'None'}</div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function reviewQuestion(number) {
  state.index = number - 1;
  save();
  render();
  $('answerCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.reviewQuestion = reviewQuestion;

function resetAll() {
  if (!confirm('Clear answers and progress for this exam and mode?')) return;
  localStorage.removeItem(stateKey());
  state = { exam: state.exam, mode: state.mode, index: 0, answers: {}, revealed: {}, started: Date.now(), submitted: false };
  render();
}

function updateTimer() {
  if (state.mode !== 'timed') {
    $('timer').textContent = 'Study';
    return;
  }
  const elapsed = Math.floor((Date.now() - state.started) / 1000);
  const remaining = Math.max(0, EXAM_SECONDS - elapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  $('timer').textContent = `${String(minutes).padStart(3, '0')}:${String(seconds).padStart(2, '0')}`;
  if (remaining === 0 && !state.submitted) submitExam(true);
}

function render() {
  renderScenario();
  renderQuestion();
  renderNavigator();
  renderProgress();
  $('examTitle').textContent = `Exam ${state.exam}: ${exam().title}`;
  $('examSelect').value = state.exam;
  $('modeSelect').value = state.mode;
  $('resultsCard').classList.toggle('hidden', !state.submitted);
  if (state.submitted) {
    const result = scoreExam();
    const percentage = Math.round((result.score / result.maximum) * 100);
    $('resultsCard').innerHTML = `<h2>Saved result</h2><div class="score">${result.score} / ${result.maximum} (${percentage}%)</div><p>Use the navigator to review revealed answers.</p>`;
  }
  updateTimer();
}

async function switchContext() {
  state.exam = $('examSelect').value;
  state.mode = $('modeSelect').value;
  state.index = 0;
  state.answers = {};
  state.revealed = {};
  state.started = Date.now();
  state.submitted = false;
  $('loading').classList.remove('hidden');
  $('app').classList.add('hidden');
  await decodeExam(state.exam);
  loadSavedState();
  $('loading').classList.add('hidden');
  $('app').classList.remove('hidden');
  render();
}

async function start() {
  try {
    await decodeExam('A');
    loadSavedState();
    $('loading').classList.add('hidden');
    $('app').classList.remove('hidden');
    render();
    tickHandle = window.setInterval(updateTimer, 1000);
  } catch (error) {
    $('loading').innerHTML = `<b>The practice site could not load.</b><br>${esc(error.message)}`;
    console.error(error);
  }
}

$('examSelect').addEventListener('change', switchContext);
$('modeSelect').addEventListener('change', switchContext);
$('prevBtn').addEventListener('click', () => move(-1));
$('nextBtn').addEventListener('click', () => move(1));
$('checkBtn').addEventListener('click', checkAnswer);
$('submitBtn').addEventListener('click', () => submitExam(false));
$('resetBtn').addEventListener('click', resetAll);

start();

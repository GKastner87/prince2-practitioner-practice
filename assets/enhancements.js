(() => {
  'use strict';

  const HISTORY_KEY = 'prince2-attempt-history-v1';
  const MAX_HISTORY = 100;
  const YOUTUBE_PLAYLIST = 'https://youtube.com/playlist?list=PLkfP3Wl3g4375MA85ERYYGAveJc5Y-SAG&si=eHYIo4Htw6mCT8xt';

  Object.assign(LINKS, {
    youtubePlaylist: {
      title: 'YouTube — PRINCE2 study playlist',
      url: YOUTUBE_PLAYLIST,
      note: 'User-selected video playlist for another explanation of the concepts tested.'
    },
    prince2Sevens: {
      title: 'PRINCE2.com — The seven principles, practices and processes',
      url: 'https://www.prince2.com/eur/blog/the-7-principles-themes-and-processes-of-prince2',
      note: 'Readable overview of how the three groups of seven fit together.'
    },
    prince2Methodology: {
      title: 'PRINCE2 Training Australia — PRINCE2 methodology',
      url: 'https://www.prince2training.com.au/prince2-methodology/',
      note: 'Plain-language overview of principles, people, practices and processes.'
    },
    peopleCertNewChapter: {
      title: 'PeopleCert — PRINCE2 7: a new chapter',
      url: 'https://www.peoplecert.org/news-and-announcements/Prince2-7-new-chapter',
      note: 'Official explanation of context, tailoring and the links between method elements.'
    },
    peopleCertEvolution: {
      title: 'PeopleCert — PRINCE2 7: a process of evolution',
      url: 'https://www.peoplecert.org/news-and-announcements/2023/PRINCE2%207%20-%20A%20Process%20of%20Evolution',
      note: 'Official discussion of the seven processes, delivery methods and the people element.'
    },
    peopleCertIssues: {
      title: 'PeopleCert — Not every issue equals a change',
      url: 'https://www.peoplecert.org/news-and-announcements/2023/prince2-7-issues',
      note: 'Official explanation of issue types and why issue management is broader than change control.'
    },
    peopleCertIntroVideo: {
      title: 'PeopleCert Community — Introduction to PRINCE2 Project Management',
      url: 'https://community.peoplecert.org/public/clubs/prince2/videos/introduction-to-prince2-project-management-2026-03-23',
      note: 'Official introductory video covering context, principles, people, practices and processes.'
    },
    aspirePlaylist: {
      title: 'Aspire Europe — PRINCE2 in a Nutshell videos',
      url: 'https://aspireeurope.com/news/2022/06/01/check-out-our-prince2-youtube-channel/',
      note: 'Short video-based explanations of PRINCE2 principles, practices and processes.'
    }
  });

  const CONCEPT_GUIDES = {
    principles: {
      title: 'PRINCE2 principles',
      guide: 'The principles are the non-negotiable obligations that make the approach recognisably PRINCE2. They guide judgement when the method is tailored to a particular project.',
      signal: 'Look for wording about continued justification, learning, accountability, stages, tolerances, products or tailoring.',
      memory: 'Principles explain why the project is managed this way.'
    },
    people: {
      title: 'People',
      guide: 'Projects succeed through people who lead change, work as a team and communicate effectively. The method should fit the people and context rather than forcing every team into identical paperwork.',
      signal: 'Look for adoption, resistance, stakeholder needs, team capability, communication or behavioural change.',
      memory: 'A technically correct product can still fail when people do not adopt the change.'
    },
    businessCase: {
      title: 'Business case',
      guide: 'The project should start and continue only while the investment remains desirable, viable and achievable. Forecast changes to benefits, costs, time, risk or sustainability may require the justification to be updated and reconsidered.',
      signal: 'Ask whether the project is still worth doing and who has authority to continue, redirect or stop it.',
      memory: 'No continuing justification means no continuing project.'
    },
    organizing: {
      title: 'Organizing and governance',
      guide: 'The project board directs and remains accountable; the project manager manages day-to-day delivery within delegated tolerances; team managers deliver accepted work packages; assurance checks independently.',
      signal: 'Identify the decision level first: business, project board, project manager or delivery team.',
      memory: 'Board directs, project manager manages, teams deliver.'
    },
    plans: {
      title: 'Plans',
      guide: 'Planning begins with the products that must be delivered, their quality expectations and the sequence of work needed to create them. Different management levels use plans with different detail and time horizons.',
      signal: 'Look for product descriptions, work packages, stage plans, team plans, dependencies or estimates.',
      memory: 'Define the product before scheduling the activity.'
    },
    quality: {
      title: 'Quality',
      guide: 'Quality management translates user expectations into measurable acceptance and quality criteria, then records how products will be checked, approved and accepted.',
      signal: 'Look for fitness for purpose, acceptance criteria, quality specifications, reviews, testing or the quality register.',
      memory: 'Quality is agreed before it is inspected.'
    },
    risk: {
      title: 'Risk',
      guide: 'A risk is an uncertain event that could affect objectives. It is assessed for probability, impact and proximity, assigned to a risk owner, and controlled through suitable responses and actions.',
      signal: 'Separate the person accountable for the risk from the person assigned to carry out a response action.',
      memory: 'Owner manages the risk; action owner performs the action.'
    },
    issues: {
      title: 'Issues',
      guide: 'An issue is something that has happened or is being raised now. It may be a problem or concern, a request for change, an off-specification, or an external event. It must be captured, assessed and controlled at the correct authority level.',
      signal: 'First classify the issue, then assess its impact on baselines and tolerances before choosing who decides.',
      memory: 'Not every issue is a change, but every issue needs assessment.'
    },
    progress: {
      title: 'Progress and exception management',
      guide: 'Actual and forecast performance are compared with plans and tolerances. A manager acts within delegated authority; a forecast breach is escalated to the next management level with the information needed for a decision.',
      signal: 'The key phrase is usually forecast to exceed tolerance, not only that a variance already occurred.',
      memory: 'Manage within tolerance; escalate the forecast exception.'
    },
    processes: {
      title: 'PRINCE2 processes',
      guide: 'The processes describe the management journey from checking whether an idea is worth initiating, through direction and stage control, to product delivery, stage-boundary decisions and controlled closure.',
      signal: 'Ask where the project is in its lifecycle, what decision is needed next and which role performs that activity.',
      memory: 'Processes explain who does what and when.'
    },
    managementProducts: {
      title: 'Management products',
      guide: 'Management products hold the information needed to govern, plan and control the project. The exam often tests which product is created, updated, consulted or approved at a particular point.',
      signal: 'Focus on the information purpose: decision, baseline, record, report or approach.',
      memory: 'Choose the document by the decision it supports.'
    }
  };

  function conceptKey(q) {
    const text = `${q.topic} ${q.text} ${q.rationale}`.toLowerCase();
    if (/starting up|directing a project|initiating a project|controlling a stage|managing product delivery|stage boundary|closing a project|process/.test(text)) return 'processes';
    if (/business case|business justification|benefit|desirab|viab|achiev/.test(text)) return 'businessCase';
    if (/risk|threat|opportunit|risk owner|risk action/.test(text)) return 'risk';
    if (/issue|request for change|off-specification|problem or concern|baseline change/.test(text)) return 'issues';
    if (/quality|acceptance|fit for purpose|quality register|product description/.test(text)) return 'quality';
    if (/progress|tolerance|exception|forecast|highlight report|checkpoint report/.test(text)) return 'progress';
    if (/plan|planning|work package|product flow|product breakdown|team plan|stage plan/.test(text)) return 'plans';
    if (/project board|executive|senior user|senior supplier|project manager|team manager|assurance|organizing|role|responsib/.test(text)) return 'organizing';
    if (/people|stakeholder|communication|team capability|adoption|resistance|culture|change management/.test(text)) return 'people';
    if (/management product|register|log|report|record|project initiation documentation|pid/.test(text)) return 'managementProducts';
    return 'principles';
  }

  function topicGroup(q) {
    return CONCEPT_GUIDES[conceptKey(q)].title;
  }

  function questionPoints(q, chosen) {
    const correct = answerLetters(q);
    return q.marks === 1
      ? (chosen.length === 1 && chosen[0] === correct[0] ? 1 : 0)
      : correct.filter((letter) => chosen.includes(letter)).length;
  }

  function calculateDetailedResult() {
    const details = [];
    const topics = {};
    let score = 0;
    let maximum = 0;
    let attemptedScore = 0;
    let attemptedMaximum = 0;
    let answeredQuestions = 0;

    for (const q of exam().questions) {
      const chosen = state.answers[q.number] || [];
      const points = questionPoints(q, chosen);
      const attempted = chosen.length > 0;
      const group = topicGroup(q);

      score += points;
      maximum += q.marks;
      if (attempted) {
        answeredQuestions += 1;
        attemptedScore += points;
        attemptedMaximum += q.marks;
      }

      topics[group] ||= { score: 0, maximum: 0, attemptedScore: 0, attemptedMaximum: 0, questions: 0, answered: 0 };
      topics[group].score += points;
      topics[group].maximum += q.marks;
      topics[group].questions += 1;
      if (attempted) {
        topics[group].answered += 1;
        topics[group].attemptedScore += points;
        topics[group].attemptedMaximum += q.marks;
      }

      details.push({
        number: q.number,
        topic: group,
        points,
        maximum: q.marks,
        chosen,
        correct: answerLetters(q),
        attempted
      });
    }

    return {
      score,
      maximum,
      percentage: maximum ? Math.round((score / maximum) * 100) : 0,
      attemptedScore,
      attemptedMaximum,
      attemptedPercentage: attemptedMaximum ? Math.round((attemptedScore / attemptedMaximum) * 100) : 0,
      answeredQuestions,
      totalQuestions: exam().questions.length,
      details,
      topics
    };
  }

  function readHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Attempt history could not be read.', error);
      return [];
    }
  }

  function writeHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  }

  function newId() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function saveAttempt(modeLabel, result) {
    const history = readHistory();
    const now = Date.now();
    const attemptId = newId();
    const durationSeconds = Math.max(0, Math.floor((now - state.started) / 1000));
    const topicResults = Object.entries(result.topics).map(([topic, values]) => ({
      topic,
      score: values.score,
      maximum: values.maximum,
      attemptedScore: values.attemptedScore,
      attemptedMaximum: values.attemptedMaximum,
      percentage: values.attemptedMaximum
        ? Math.round((values.attemptedScore / values.attemptedMaximum) * 100)
        : 0,
      answered: values.answered,
      questions: values.questions
    }));

    const record = {
      id: attemptId,
      createdAt: new Date(now).toISOString(),
      examCode: state.exam,
      examTitle: exam().title,
      mode: modeLabel,
      score: result.score,
      maximum: result.maximum,
      percentage: result.percentage,
      attemptedScore: result.attemptedScore,
      attemptedMaximum: result.attemptedMaximum,
      attemptedPercentage: result.attemptedPercentage,
      answeredQuestions: result.answeredQuestions,
      totalQuestions: result.totalQuestions,
      durationSeconds,
      topics: topicResults,
      questions: result.details
    };

    history.unshift(record);
    writeHistory(history);
    return record;
  }

  function weakestTopics(result, limit = 3) {
    return Object.entries(result.topics)
      .filter(([, values]) => values.attemptedMaximum > 0)
      .map(([topic, values]) => ({
        topic,
        percentage: Math.round((values.attemptedScore / values.attemptedMaximum) * 100),
        score: values.attemptedScore,
        maximum: values.attemptedMaximum
      }))
      .sort((a, b) => a.percentage - b.percentage || b.maximum - a.maximum)
      .slice(0, limit);
  }

  function renderTopicSummary(result) {
    const rows = Object.entries(result.topics)
      .filter(([, values]) => values.attemptedMaximum > 0)
      .map(([topic, values]) => ({
        topic,
        percentage: Math.round((values.attemptedScore / values.attemptedMaximum) * 100),
        score: values.attemptedScore,
        maximum: values.attemptedMaximum
      }))
      .sort((a, b) => a.percentage - b.percentage || a.topic.localeCompare(b.topic));

    if (!rows.length) return '<p>No topic analysis is available until at least one question is answered.</p>';

    return `<div class="topic-summary">
      ${rows.map((row) => `<div class="topic-row">
        <div><b>${esc(row.topic)}</b><small>${row.score}/${row.maximum} marks</small></div>
        <div class="topic-meter" aria-label="${esc(row.topic)} ${row.percentage}%"><span style="width:${row.percentage}%"></span></div>
        <strong>${row.percentage}%</strong>
      </div>`).join('')}
    </div>`;
  }

  topicLinks = function enhancedTopicLinks(q) {
    const text = `${q.topic} ${q.text} ${q.rationale}`.toLowerCase();
    const keys = ['official', 'youtubePlaylist'];
    const add = (key) => { if (LINKS[key] && !keys.includes(key)) keys.push(key); };

    if (/issue|change|off-specification|request for change/.test(text)) {
      add('peopleCertIssues');
      add('changeControl');
    } else if (/process|starting up|directing|initiating|controlling a stage|product delivery|stage boundary|closing/.test(text)) {
      add('peopleCertEvolution');
      add('prince2Sevens');
      add('lifecycle');
    } else if (/people|stakeholder|communication|adoption|resistance|tailor|context|sustainability|digital/.test(text)) {
      add('peopleCertNewChapter');
      add('peopleCertIntroVideo');
      add('stakeholders');
    } else {
      add('prince2Sevens');
      add('prince2Methodology');
    }

    if (/business case|justification|benefit|desirab|viab|achiev/.test(text)) add('businessCase');
    if (/benefit|outcome|post-project|review plan/.test(text)) add('benefits');
    if (/risk|threat|opportunit/.test(text)) add('risk');
    if (/quality|acceptance|fit for purpose/.test(text)) add('quality');
    if (/plan|planning|work package/.test(text)) add('planning');
    if (/progress|tolerance|exception|forecast|control/.test(text)) add('controls');
    if (/role|board|executive|senior user|senior supplier|assurance|authority/.test(text)) add('governance');
    if (/closing|closure|follow-on/.test(text)) add('closure');

    return keys.slice(0, 6).map((key) => LINKS[key]);
  };

  renderScenario = function enhancedRenderScenario() {
    const q = question();
    const scenario = exam().scenarios.find((item) => item.number === q.scenario);
    const open = window.matchMedia('(min-width: 901px)').matches ? ' open' : '';
    $('scenarioCard').innerHTML = `
      <div class="section-label">Scenario reference</div>
      <h2>Scenario ${scenario.number}: ${esc(scenario.heading)}</h2>
      <details${open}>
        <summary>Read or hide the scenario</summary>
        <div class="scenario-text">${esc(scenario.text)}</div>
      </details>`;
  };

  renderQuestion = function enhancedRenderQuestion() {
    const q = question();
    const values = selected();
    const instruction = q.marks === 2 ? 'Select exactly TWO answers.' : 'Select the best answer.';

    $('questionCard').innerHTML = `
      <div class="question-topline">
        <span class="question-number">Question ${q.number}</span>
        <span class="question-meta">${q.marks} mark${q.marks > 1 ? 's' : ''} · ${esc(q.topic)}</span>
      </div>
      <div class="question-stem">
        <span class="section-label">What is being asked?</span>
        <h2>${esc(q.text)}</h2>
        <p class="question-instruction">${instruction}</p>
      </div>
      <div class="answer-options" role="group" aria-label="Answer options">
        ${q.options.map((option) => `
          <label class="option">
            <input type="${q.marks === 1 ? 'radio' : 'checkbox'}" name="option" ${values.includes(option.letter) ? 'checked' : ''} onchange="choose('${option.letter}', this.checked)">
            <span class="letter">${option.letter}</span>
            <span class="option-text">${esc(option.text)}</span>
          </label>`).join('')}
      </div>`;

    $('prevBtn').disabled = state.index === 0;
    $('nextBtn').disabled = state.index === exam().questions.length - 1;
    $('checkBtn').classList.toggle('hidden', state.mode !== 'study');
    $('submitBtn').classList.toggle('hidden', state.mode !== 'timed');
    $('saveStudyBtn')?.classList.toggle('hidden', state.mode !== 'study');

    if (state.revealed[q.number] && (state.mode === 'study' || state.submitted)) renderAnswer();
    else $('answerCard').classList.add('hidden');
  };

  renderAnswer = function enhancedRenderAnswer() {
    const q = question();
    const chosen = selected();
    const correct = answerLetters(q);
    const points = questionPoints(q, chosen);
    const concept = CONCEPT_GUIDES[conceptKey(q)];
    const links = topicLinks(q);
    const selectedLabel = chosen.length ? chosen.join(', ') : 'No answer';
    const outcomeClass = points === q.marks ? 'answer-correct' : (points > 0 ? 'answer-partial' : 'answer-wrong');
    const outcomeText = points === q.marks ? 'Correct' : (points > 0 ? 'Partly correct' : 'Incorrect');

    $('answerCard').classList.remove('hidden');
    $('answerCard').innerHTML = `
      <div class="answer-result ${outcomeClass}">
        <div>
          <span class="section-label">Your result</span>
          <h3>${outcomeText}: ${points}/${q.marks} mark${q.marks > 1 ? 's' : ''}</h3>
        </div>
        <div class="answer-comparison"><b>You chose:</b> ${esc(selectedLabel)}<br><b>Correct answer:</b> ${esc(correct.join(', '))}</div>
      </div>

      <section class="explanation-section decision-path">
        <h3>How to reason through it</h3>
        <ol>
          <li><b>Identify the tested area:</b> ${esc(q.topic)}.</li>
          <li><b>Find the decisive scenario fact:</b> ${esc(q.scenario_clue)}</li>
          <li><b>Apply the PRINCE2 rule:</b> ${esc(q.rationale)}</li>
        </ol>
      </section>

      <section class="explanation-section guide-paraphrase">
        <span class="section-label">Guide meaning in plain English — paraphrased</span>
        <h3>${esc(concept.title)}</h3>
        <p>${esc(concept.guide)}</p>
        <p><b>Exam signal:</b> ${esc(concept.signal)}</p>
        <p class="memory-cue"><b>Memory cue:</b> ${esc(concept.memory)}</p>
      </section>

      <section class="explanation-section">
        <h3>Why each option is right or wrong</h3>
        <div class="option-review-grid">
          ${q.option_explanations.map((item) => {
            const wasChosen = chosen.includes(item.letter);
            return `<article class="option-review ${item.verdict.toLowerCase()} ${wasChosen ? 'selected-review' : ''}">
              <div class="review-option"><b>${item.letter}. ${esc(item.text)}</b><br><span class="verdict">${esc(item.verdict)}${wasChosen ? ' · Your selection' : ''}</span></div>
              <div>${esc(item.reason)}</div>
            </article>`;
          }).join('')}
        </div>
      </section>

      <section class="explanation-section">
        <h3>Official guide location</h3>
        <ul class="reference-list">${q.detailed_references.map((reference) => `<li>${esc(reference)}</li>`).join('')}</ul>
        <p class="external-note">The guide summary above is an original paraphrase, not a reproduced extract. Use these locations to verify the exact PRINCE2 wording in a licensed copy.</p>
      </section>

      <section class="explanation-section">
        <h3>Watch or read another explanation</h3>
        <div class="reference-links">
          ${links.map((link) => `<a href="${link.url}" target="_blank" rel="noopener noreferrer"><b>${esc(link.title)}</b><small>${esc(link.note)}</small></a>`).join('')}
        </div>
      </section>

      <p class="takeaway"><b>Revision takeaway:</b> ${esc(q.takeaway)}</p>`;
  };

  const baseRender = render;
  render = function enhancedRender() {
    baseRender();
    if (state.submitted) renderEnhancedResults(calculateDetailedResult(), true);
  };

  function renderEnhancedResults(result, saved = false) {
    const weak = weakestTopics(result);
    $('resultsCard').classList.remove('hidden');
    $('resultsCard').innerHTML = `
      <div class="result-heading">
        <div>
          <span class="section-label">${saved ? 'Saved attempt' : 'Exam result'}</span>
          <h2>Exam ${esc(state.exam)} result</h2>
        </div>
        <div class="score">${result.score} / ${result.maximum} <small>${result.percentage}%</small></div>
      </div>
      <p>${result.score >= PASS_MARK ? 'Pass-level score. Build a margin above the pass mark and review recurring weak areas.' : 'Below the practice pass target. Use the topic breakdown and missed-question review before retesting.'}</p>
      <div class="result-grid">
        <div><span>Answered</span><b>${result.answeredQuestions}/${result.totalQuestions}</b></div>
        <div><span>Accuracy on attempted marks</span><b>${result.attemptedPercentage}%</b></div>
        <div><span>History</span><b><a href="history.html">View patterns</a></b></div>
      </div>
      <h3>Topic breakdown</h3>
      ${renderTopicSummary(result)}
      <h3>Priority review areas</h3>
      <p>${weak.length ? weak.map((item) => `<b>${esc(item.topic)}</b> (${item.percentage}%)`).join(' · ') : 'No weak topic could be calculated.'}</p>
      <h3>Questions not awarded full marks</h3>
      <div class="review-buttons">${result.details.filter((item) => item.points < item.maximum).length
        ? result.details.filter((item) => item.points < item.maximum).map((item) => `<button type="button" onclick="reviewQuestion(${item.number})">${item.number} (${item.points}/${item.maximum})</button>`).join('')
        : 'None'}</div>`;
  }

  submitExam = function enhancedSubmitExam(force = false) {
    if (!force && !confirm('Submit the exam, save this attempt and reveal the answers?')) return;
    state.submitted = true;
    for (const q of exam().questions) state.revealed[q.number] = true;
    const result = calculateDetailedResult();

    if (!state.historySaved) {
      saveAttempt('Timed exam', result);
      state.historySaved = true;
    }

    save();
    renderEnhancedResults(result, false);
    renderQuestion();
    renderNavigator();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function saveStudySession() {
    const result = calculateDetailedResult();
    if (!result.answeredQuestions) {
      alert('Answer at least one question before saving a study session.');
      return;
    }
    if (!confirm(`Save this study checkpoint with ${result.answeredQuestions} answered questions?`)) return;

    saveAttempt('Study session', result);
    renderEnhancedResults(result, false);
    $('resultsCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('saveStudyBtn')?.addEventListener('click', saveStudySession);
})();

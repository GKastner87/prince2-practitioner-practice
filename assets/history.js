(() => {
  'use strict';

  const HISTORY_KEY = 'prince2-attempt-history-v1';
  const $ = (id) => document.getElementById(id);

  function esc(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
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
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  function formatDuration(seconds) {
    const total = Number(seconds || 0);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remaining = total % 60;
    return hours ? `${hours}h ${minutes}m` : `${minutes}m ${remaining}s`;
  }

  function displayScore(attempt) {
    if (attempt.mode === 'Study session') {
      return `${attempt.attemptedPercentage}% attempted accuracy`;
    }
    return `${attempt.score}/${attempt.maximum} (${attempt.percentage}%)`;
  }

  function aggregateTopics(history) {
    const totals = {};
    history.forEach((attempt, attemptIndex) => {
      (attempt.topics || []).forEach((topic) => {
        totals[topic.topic] ||= {
          topic: topic.topic,
          score: 0,
          maximum: 0,
          attempts: 0,
          latestPercentage: null,
          previousPercentages: []
        };
        const item = totals[topic.topic];
        item.score += Number(topic.attemptedScore || 0);
        item.maximum += Number(topic.attemptedMaximum || 0);
        if (topic.attemptedMaximum > 0) item.attempts += 1;
        if (attemptIndex === 0 && topic.attemptedMaximum > 0) item.latestPercentage = topic.percentage;
        else if (topic.attemptedMaximum > 0) item.previousPercentages.push(topic.percentage);
      });
    });

    return Object.values(totals)
      .filter((topic) => topic.maximum > 0)
      .map((topic) => {
        const percentage = Math.round((topic.score / topic.maximum) * 100);
        const priorAverage = topic.previousPercentages.length
          ? Math.round(topic.previousPercentages.reduce((sum, value) => sum + value, 0) / topic.previousPercentages.length)
          : null;
        const trend = topic.latestPercentage == null || priorAverage == null
          ? null
          : topic.latestPercentage - priorAverage;
        return { ...topic, percentage, priorAverage, trend };
      })
      .sort((a, b) => a.percentage - b.percentage || b.maximum - a.maximum);
  }

  function repeatedMisses(history) {
    const misses = {};
    history.forEach((attempt) => {
      (attempt.questions || []).forEach((question) => {
        if (question.points >= question.maximum) return;
        const key = `${attempt.examCode}-${question.number}`;
        misses[key] ||= {
          examCode: attempt.examCode,
          number: question.number,
          topic: question.topic,
          misses: 0,
          totalLost: 0
        };
        misses[key].misses += 1;
        misses[key].totalLost += question.maximum - question.points;
      });
    });

    return Object.values(misses)
      .sort((a, b) => b.misses - a.misses || b.totalLost - a.totalLost)
      .slice(0, 15);
  }

  function recentComparableAttempts(history) {
    return history.filter((attempt) => attempt.mode === 'Timed exam').slice(0, 6).reverse();
  }

  function renderSummary(history) {
    if (!history.length) {
      $('historyContent').innerHTML = `
        <section class="card empty-history">
          <h2>No saved attempts yet</h2>
          <p>Timed exams are saved automatically when submitted. Study mode can be saved with <b>Save study session</b>.</p>
          <a class="button-link primary" href="index.html">Start a practice exam</a>
        </section>`;
      return;
    }

    const timed = history.filter((attempt) => attempt.mode === 'Timed exam');
    const best = timed.length ? Math.max(...timed.map((attempt) => attempt.percentage)) : null;
    const latest = history[0];
    const topics = aggregateTopics(history);
    const misses = repeatedMisses(history);
    const trendAttempts = recentComparableAttempts(history);

    $('historyContent').innerHTML = `
      <section class="history-summary-grid">
        <article class="card metric-card"><span>Saved sessions</span><strong>${history.length}</strong></article>
        <article class="card metric-card"><span>Timed attempts</span><strong>${timed.length}</strong></article>
        <article class="card metric-card"><span>Best timed score</span><strong>${best == null ? '—' : `${best}%`}</strong></article>
        <article class="card metric-card"><span>Latest session</span><strong>${esc(displayScore(latest))}</strong></article>
      </section>

      <section class="card">
        <h2>Timed score trend</h2>
        ${trendAttempts.length ? `<div class="trend-chart" aria-label="Recent timed exam score trend">
          ${trendAttempts.map((attempt) => `<div class="trend-column">
            <div class="trend-bar-wrap"><div class="trend-bar" style="height:${Math.max(4, attempt.percentage)}%"><span>${attempt.percentage}%</span></div></div>
            <small>${esc(attempt.examCode)}<br>${new Date(attempt.createdAt).toLocaleDateString()}</small>
          </div>`).join('')}
        </div>` : '<p>Complete a timed exam to start the score trend.</p>'}
      </section>

      <section class="card">
        <h2>Topic performance and pattern analysis</h2>
        <p>Topics are ranked from weakest to strongest using all answered marks in saved sessions.</p>
        <div class="history-table-wrap">
          <table class="history-table">
            <thead><tr><th>Topic</th><th>Accuracy</th><th>Marks</th><th>Sessions</th><th>Recent trend</th></tr></thead>
            <tbody>
              ${topics.map((topic) => `<tr>
                <td><b>${esc(topic.topic)}</b></td>
                <td><div class="inline-meter"><span style="width:${topic.percentage}%"></span></div><b>${topic.percentage}%</b></td>
                <td>${topic.score}/${topic.maximum}</td>
                <td>${topic.attempts}</td>
                <td>${topic.trend == null ? 'Not enough data' : `${topic.trend > 0 ? '+' : ''}${topic.trend} points`}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Repeatedly missed questions</h2>
        ${misses.length ? `<div class="repeat-grid">
          ${misses.map((item) => `<article>
            <b>Exam ${esc(item.examCode)} · Question ${item.number}</b>
            <span>${esc(item.topic)}</span>
            <strong>Missed ${item.misses} time${item.misses === 1 ? '' : 's'}</strong>
          </article>`).join('')}
        </div>` : '<p>No repeated misses have been recorded.</p>'}
      </section>

      <section class="card">
        <h2>Attempt history</h2>
        <div class="attempt-list">
          ${history.map((attempt) => {
            const weak = [...(attempt.topics || [])]
              .filter((topic) => topic.attemptedMaximum > 0)
              .sort((a, b) => a.percentage - b.percentage)
              .slice(0, 3);
            return `<article class="attempt-card">
              <div>
                <span class="section-label">${esc(attempt.mode)}</span>
                <h3>Exam ${esc(attempt.examCode)} · ${esc(attempt.examTitle)}</h3>
                <p>${esc(formatDate(attempt.createdAt))} · ${esc(formatDuration(attempt.durationSeconds))}</p>
              </div>
              <div class="attempt-score">${esc(displayScore(attempt))}<small>${attempt.answeredQuestions}/${attempt.totalQuestions} questions answered</small></div>
              <div class="attempt-weak"><b>Weakest areas:</b> ${weak.length ? weak.map((topic) => `${esc(topic.topic)} ${topic.percentage}%`).join(' · ') : 'None recorded'}</div>
            </article>`;
          }).join('')}
        </div>
      </section>`;
  }

  function download(name, content, type) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type }));
    link.download = name;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  }

  function exportJson() {
    download('prince2-attempt-history.json', JSON.stringify(readHistory(), null, 2), 'application/json');
  }

  function csvValue(value) {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }

  function exportCsv() {
    const rows = [['Date', 'Exam', 'Mode', 'Score', 'Maximum', 'Percentage', 'Attempted accuracy', 'Answered', 'Total questions', 'Duration seconds']];
    readHistory().forEach((attempt) => rows.push([
      attempt.createdAt,
      attempt.examCode,
      attempt.mode,
      attempt.score,
      attempt.maximum,
      attempt.percentage,
      attempt.attemptedPercentage,
      attempt.answeredQuestions,
      attempt.totalQuestions,
      attempt.durationSeconds
    ]));
    download('prince2-attempt-history.csv', rows.map((row) => row.map(csvValue).join(',')).join('\n'), 'text/csv');
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) throw new Error('The file does not contain an attempt-history array.');
        const current = readHistory();
        const byId = new Map([...current, ...imported].map((attempt) => [attempt.id || `${attempt.createdAt}-${attempt.examCode}`, attempt]));
        const merged = [...byId.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        writeHistory(merged);
        renderSummary(merged);
        alert(`Imported ${imported.length} history record${imported.length === 1 ? '' : 's'}.`);
      } catch (error) {
        alert(`Import failed: ${error.message}`);
      }
    };
    reader.readAsText(file);
  }

  $('exportJsonBtn').addEventListener('click', exportJson);
  $('exportCsvBtn').addEventListener('click', exportCsv);
  $('importInput').addEventListener('change', (event) => {
    const [file] = event.target.files;
    if (file) importJson(file);
    event.target.value = '';
  });
  $('clearHistoryBtn').addEventListener('click', () => {
    if (!confirm('Delete all saved attempt history from this browser?')) return;
    localStorage.removeItem(HISTORY_KEY);
    renderSummary([]);
  });

  renderSummary(readHistory());
})();

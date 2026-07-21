import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';

const root = new URL('../', import.meta.url);
globalThis.window = {};

const files = [
  'hard-foundation-01.js',
  'hard-foundation-02.js',
  'hard-foundation-03a.js',
  'hard-foundation-03b.js',
  'hard-foundation-03c.js',
  'hard-foundation-03d.js',
  'hard-foundation-03e.js',
  'hard-foundation-04a.js',
  'hard-foundation-04b.js',
  'hard-foundation-04c.js',
  'hard-foundation-04d.js',
  'hard-foundation-04e.js',
  'hard-foundation-04f.js',
  'hard-foundation-05.js'
];

for (const file of files) {
  const fileUrl = new URL(`foundation/data/${file}`, root);
  vm.runInThisContext(fs.readFileSync(fileUrl, 'utf8'), { filename: fileUrl.pathname });
}

const batches = Array.isArray(window.PRINCE2_FOUNDATION_BATCHES)
  ? [...window.PRINCE2_FOUNDATION_BATCHES]
  : [];

for (const payload of window.PRINCE2_FOUNDATION_GZIP || []) {
  const decoded = zlib.gunzipSync(Buffer.from(payload, 'base64')).toString('utf8');
  batches.push(JSON.parse(decoded));
}

if (batches.length !== 5) {
  throw new Error(`Expected five Foundation batches; found ${batches.length}.`);
}

const raw = batches.flatMap((batch) => batch.questions || []);
if (raw.length !== 166) {
  throw new Error(`Expected 166 supplied records; found ${raw.length}.`);
}

const normalize = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const unique = new Map();
const batchIds = new Set();

for (const batch of batches) {
  if (!batch.id || !batch.title || !batch.description) {
    throw new Error('A Foundation batch is missing metadata.');
  }
  if (batchIds.has(batch.id)) throw new Error(`Duplicate batch id ${batch.id}.`);
  batchIds.add(batch.id);

  for (const question of batch.questions) {
    for (const key of ['id', 'topic', 'question', 'answer', 'explanation', 'answerBasis']) {
      if (!question[key]) throw new Error(`${question.id || 'Unknown question'} is missing ${key}.`);
    }

    if (question.collectionDifficulty !== 'Hard Foundation') {
      throw new Error(`${question.id} is not classified as Hard Foundation.`);
    }

    const optionKeys = Object.keys(question.options || {});
    if (optionKeys.join(',') !== 'A,B,C,D') {
      throw new Error(`${question.id} must have options A-D.`);
    }

    if (!optionKeys.includes(question.answer)) {
      throw new Error(`${question.id} has invalid answer ${question.answer}.`);
    }

    if (!Array.isArray(question.references) || question.references.length < 1) {
      throw new Error(`${question.id} has no reference mapping.`);
    }

    if ('result' in question) {
      throw new Error(`${question.id} must not retain the dummy Correct/Incorrect result.`);
    }

    const normalized = normalize(question.question);
    if (!unique.has(normalized)) unique.set(normalized, question.id);
  }
}

if (unique.size < 145 || unique.size > raw.length) {
  throw new Error(`Unexpected unique-question count ${unique.size}.`);
}

const latest = batches.find((batch) => batch.id === 'hard-foundation-05');
if (!latest || latest.questions.length !== 20) {
  throw new Error('Advanced application set must contain 20 questions.');
}

console.log(`Foundation library valid: ${batches.length} batches, ${raw.length} records, ${unique.size} unique hard Foundation questions.`);

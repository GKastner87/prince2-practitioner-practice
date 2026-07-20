import fs from 'node:fs';

const indexUrl = new URL('../src/foundation-library/library-index.json', import.meta.url);
const batchUrl = new URL('../src/foundation-library/batches/batch-001-review.json', import.meta.url);

const index = JSON.parse(fs.readFileSync(indexUrl, 'utf8'));
const batch = JSON.parse(fs.readFileSync(batchUrl, 'utf8'));

const fail = (message) => { throw new Error(message); };

if (index.site_integration !== false || index.publication_status !== 'staging') {
  fail('Foundation library must remain disconnected from the live site while staging.');
}

if (batch.site_integration !== false || batch.publication_status !== 'blocked') {
  fail('Incoming Foundation batch must remain blocked.');
}

if (batch.claimed_question_count !== 25 || batch.records_found !== 24) {
  fail('Batch 001 count metadata is incorrect.');
}

if (!batch.missing_source_numbers?.includes(25)) {
  fail('Missing source question 25 must be recorded.');
}

if (!Array.isArray(batch.questions) || batch.questions.length !== 24) {
  fail(`Expected 24 review records; found ${batch.questions?.length ?? 0}.`);
}

const numbers = new Set();
let rewrites = 0;
let rejects = 0;

for (const question of batch.questions) {
  if (numbers.has(question.source_number)) fail(`Duplicate source number ${question.source_number}.`);
  numbers.add(question.source_number);

  if (!['A', 'B', 'C', 'D'].includes(question.correct_answer)) {
    fail(`Question ${question.source_number} has an invalid answer.`);
  }

  if (question.action === 'rewrite') rewrites += 1;
  else if (question.action === 'reject') rejects += 1;
  else fail(`Question ${question.source_number} has unsupported action ${question.action}.`);

  if (!question.mapping) fail(`Question ${question.source_number} has no mapping assessment.`);
}

if (rewrites !== 17 || rejects !== 7) {
  fail(`Expected 17 rewrites and 7 rejects; found ${rewrites} and ${rejects}.`);
}

if (index.batches?.[0]?.approved_count !== 0) {
  fail('No incoming question may be marked approved yet.');
}

console.log(`Foundation staging valid: 24 records, ${rewrites} rewrites, ${rejects} rejects, 0 published.`);

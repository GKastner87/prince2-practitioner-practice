import fs from 'node:fs';

const indexUrl = new URL('../src/foundation-library/library-index.json', import.meta.url);
const batchUrl = new URL('../src/foundation-library/batches/batch-001-review.json', import.meta.url);

const index = JSON.parse(fs.readFileSync(indexUrl, 'utf8'));
const batch = JSON.parse(fs.readFileSync(batchUrl, 'utf8'));

const fail = (message) => { throw new Error(message); };

if (index.site_integration !== false || index.publication_status !== 'staging') {
  fail('Foundation library must remain disconnected from the live site while staging.');
}

if (index.import_policy?.ignore_source_result_field !== true) {
  fail('The source Correct/Incorrect result field must be ignored.');
}

if (index.import_policy?.derive_answer_from_explanation !== true) {
  fail('Answers must be derived from the supplied explanation during import review.');
}

if (batch.site_integration !== false || batch.publication_status !== 'blocked') {
  fail('Incoming Foundation batch must remain blocked.');
}

if (batch.source_result_field_ignored !== true) {
  fail('Batch 001 must explicitly ignore the source result field.');
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
let incoming = 0;

for (const question of batch.questions) {
  if (numbers.has(question.source_number)) fail(`Duplicate source number ${question.source_number}.`);
  numbers.add(question.source_number);

  if (!['A', 'B', 'C', 'D'].includes(question.source_answer)) {
    fail(`Question ${question.source_number} has an invalid source answer.`);
  }

  if (question.answer_source !== 'explanation') {
    fail(`Question ${question.source_number} does not identify the explanation as its answer source.`);
  }

  if (question.status !== 'incoming_review') {
    fail(`Question ${question.source_number} was classified prematurely as ${question.status}.`);
  }

  if (!question.candidate_mapping) {
    fail(`Question ${question.source_number} has no provisional mapping.`);
  }

  incoming += 1;
}

if (incoming !== 24 || index.batches?.[0]?.incoming_review_count !== 24) {
  fail(`Expected 24 incoming-review records; found ${incoming}.`);
}

if (index.batches?.[0]?.approved_count !== 0 || index.batches?.[0]?.published_count !== 0) {
  fail('No incoming question may be approved or published yet.');
}

console.log('Foundation staging valid: 24 records retained, source results ignored, 0 approved, 0 published.');

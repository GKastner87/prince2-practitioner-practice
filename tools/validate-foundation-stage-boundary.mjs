import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window = {};
const dataFile = new URL('../foundation/stage-boundary-data.js', import.meta.url);
vm.runInThisContext(fs.readFileSync(dataFile, 'utf8'), { filename: dataFile.pathname });

const library = window.PRINCE2_FOUNDATION_STAGE_BOUNDARY;
if (!library || !Array.isArray(library.questions)) {
  throw new Error('Foundation stage-boundary library is missing.');
}

if (library.questions.length !== 19) {
  throw new Error(`Expected 19 Foundation questions; found ${library.questions.length}.`);
}

const ids = new Set();
for (const question of library.questions) {
  if (ids.has(question.id)) throw new Error(`Duplicate Foundation question id ${question.id}.`);
  ids.add(question.id);

  if (!question.question || !question.explanation) {
    throw new Error(`Question ${question.id} is missing text or explanation.`);
  }

  const letters = Object.keys(question.options || {});
  if (letters.join(',') !== 'A,B,C,D') {
    throw new Error(`Question ${question.id} must contain options A-D.`);
  }

  if (!letters.includes(question.answer)) {
    throw new Error(`Question ${question.id} has invalid answer ${question.answer}.`);
  }

  if (!Array.isArray(question.references) || question.references.length < 1) {
    throw new Error(`Question ${question.id} has no official-guide reference.`);
  }
}

console.log(`Foundation stage-boundary library valid: ${library.questions.length} questions with answers, explanations and references.`);

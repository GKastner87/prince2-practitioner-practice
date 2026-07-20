import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';

const root = new URL('../', import.meta.url);
globalThis.window = {};

for (const code of ['a', 'b']) {
  for (let part = 1; part <= 6; part += 1) {
    const partName = String(part).padStart(2, '0');
    const fileUrl = new URL(`data/chunks/${code}-${partName}.js`, root);
    vm.runInThisContext(fs.readFileSync(fileUrl, 'utf8'), { filename: fileUrl.pathname });
  }

  const assemblerUrl = new URL(`data/exam-${code}.js`, root);
  vm.runInThisContext(fs.readFileSync(assemblerUrl, 'utf8'), { filename: assemblerUrl.pathname });
}

for (const code of ['A', 'B']) {
  const encoded = window.PRINCE2_EXAM_GZIP?.[code];
  if (!encoded) throw new Error(`Exam ${code}: encoded payload is missing.`);

  const exam = JSON.parse(zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8'));
  if (exam.questions?.length !== 56) {
    throw new Error(`Exam ${code}: expected 56 questions, found ${exam.questions?.length ?? 0}.`);
  }

  if (!Array.isArray(exam.scenarios) || exam.scenarios.length < 1) {
    throw new Error(`Exam ${code}: scenarios are missing.`);
  }

  let referenceEntries = 0;
  for (const question of exam.questions) {
    for (const key of ['text', 'answer', 'rationale', 'scenario_clue', 'takeaway', 'topic']) {
      if (!question[key]) throw new Error(`Exam ${code}, question ${question.number}: missing ${key}.`);
    }

    if (!Array.isArray(question.options) || question.options.length !== 4) {
      throw new Error(`Exam ${code}, question ${question.number}: expected four answer options.`);
    }

    if (!Array.isArray(question.option_explanations) || question.option_explanations.length !== 4) {
      throw new Error(`Exam ${code}, question ${question.number}: expected four option explanations.`);
    }

    if (!Array.isArray(question.detailed_references) || question.detailed_references.length < 1) {
      throw new Error(`Exam ${code}, question ${question.number}: official-guide references are missing.`);
    }

    referenceEntries += question.detailed_references.length;
  }

  console.log(`${code}: ${exam.title} — 56 questions, ${exam.scenarios.length} scenarios, ${referenceEntries} reference entries.`);
}

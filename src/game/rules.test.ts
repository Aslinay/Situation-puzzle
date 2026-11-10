import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkExactOrRuleQuestion,
  evaluateDeduction,
  EXACT_TEST_QUESTIONS,
  HINTS
} from './rules.ts';

test('Verify canonical test cases from user prompt', () => {
  // 1. 你是人类吗？ -> 是。 / Yes
  const q1Zh = checkExactOrRuleQuestion("你是人类吗？");
  assert.ok(q1Zh);
  assert.equal(q1Zh.label, "Yes");
  assert.equal(q1Zh.type, "YES");
  assert.equal(q1Zh.deductAttempt, true);

  // Even with trailing typos/gibberish: 「你是人类吗？？asdf」仍然答 Yes
  const q1WithNoise = checkExactOrRuleQuestion("你是人类吗？？asdf");
  assert.ok(q1WithNoise);
  assert.equal(q1WithNoise.label, "Yes");

  const q1En = checkExactOrRuleQuestion("Are you human?");
  assert.ok(q1En);
  assert.equal(q1En.label, "Yes");

  // 2. 这里是地球吗？ -> 是。 / Yes
  const q2Zh = checkExactOrRuleQuestion("这里是地球吗？");
  assert.ok(q2Zh);
  assert.equal(q2Zh.label, "Yes");
  assert.equal(q2Zh.type, "YES");

  const q2En = checkExactOrRuleQuestion("Is this Earth?");
  assert.ok(q2En);
  assert.equal(q2En.label, "Yes");

  // 3. 我们是水下生物吗？ -> 是。 / Yes
  const q3Zh = checkExactOrRuleQuestion("我们是水下生物吗？");
  assert.ok(q3Zh);
  assert.equal(q3Zh.label, "Yes");
  assert.equal(q3Zh.type, "YES");

  const q3En = checkExactOrRuleQuestion("Are we underwater creatures?");
  assert.ok(q3En);
  assert.equal(q3En.label, "Yes");

  // 4. 你知道恐龙吗？ -> 没听过。 / Unknown
  const q4Zh = checkExactOrRuleQuestion("你知道恐龙吗？");
  assert.ok(q4Zh);
  assert.equal(q4Zh.label, "Unknown");
  assert.equal(q4Zh.dialogueZh, "我没听过这个词。");
  assert.equal(q4Zh.type, "UNKNOWN");

  const q4En = checkExactOrRuleQuestion("Do you know dinosaurs?");
  assert.ok(q4En);
  assert.equal(q4En.label, "Unknown");
  assert.equal(q4En.dialogueEn, "I have never heard of that word.");

  // 5. 神明原本就住在地球上吗？ -> 我不知道。 / Unknown
  const q5Zh = checkExactOrRuleQuestion("神明原本就住在地球上吗？");
  assert.ok(q5Zh);
  assert.equal(q5Zh.label, "Unknown");
  assert.equal(q5Zh.type, "UNKNOWN");

  const q5En = checkExactOrRuleQuestion("Did the deities originally live on Earth?");
  assert.ok(q5En);
  assert.equal(q5En.label, "Unknown");

  // 6. 马特碰到的东西是固体吗？ -> 不是。 / No
  const q6Zh = checkExactOrRuleQuestion("马特碰到的东西是固体吗？");
  assert.ok(q6Zh);
  assert.equal(q6Zh.label, "No");
  assert.equal(q6Zh.type, "NO");

  const q6En = checkExactOrRuleQuestion("Was the thing Matt touched a solid?");
  assert.ok(q6En);
  assert.equal(q6En.label, "No");

  // 7. 马特碰到的是火吗？ -> 我不知道你说的「火」是什么。 / Unknown
  const q7Zh = checkExactOrRuleQuestion("马特碰到的是火吗？");
  assert.ok(q7Zh);
  assert.equal(q7Zh.label, "Unknown");
  assert.equal(q7Zh.dialogueZh, "我不知道你说的「火」是什么。");
  assert.equal(q7Zh.type, "UNKNOWN");

  const q7En = checkExactOrRuleQuestion("Was what Matt touched fire?");
  assert.ok(q7En);
  assert.equal(q7En.label, "Unknown");
  assert.equal(q7En.dialogueEn, "I don't know what you mean by 'fire'.");
});

test('Non-standard inputs provide guidance dialogue and do NOT deduct attempts', () => {
  // 开放题：「那些神明到底是谁？」
  const openQ = checkExactOrRuleQuestion("那些神明到底是谁？");
  assert.ok(openQ);
  assert.equal(openQ.label, "Unknown");
  assert.equal(openQ.dialogueZh, "你可以先问我，是不是在方舟上见到他们的。");
  assert.equal(openQ.deductAttempt, false);

  // 一次问两件事：「马特碰过它，而且它是活的吗？」
  const twoQ = checkExactOrRuleQuestion("马特碰过它，而且它是活的吗？");
  assert.ok(twoQ);
  assert.equal(twoQ.label, "Unknown");
  assert.equal(twoQ.dialogueZh, "这是两件事。你想先问马特有没有碰过它吗？");
  assert.equal(twoQ.deductAttempt, false);

  // 指代不清：「它是从外面来的吗？」
  const vagueQ = checkExactOrRuleQuestion("它是从外面来的吗？");
  assert.ok(vagueQ);
  assert.equal(vagueQ.label, "Unknown");
  assert.equal(vagueQ.dialogueZh, "你说的『它』是方舟，还是船上的某个生物？");
  assert.equal(vagueQ.deductAttempt, false);

  // 指代不清英文：「Did it come from somewhere else?」
  const vagueQEn = checkExactOrRuleQuestion("Did it come from somewhere else?");
  assert.ok(vagueQEn);
  assert.equal(vagueQEn.label, "Unknown");
  assert.equal(vagueQEn.dialogueEn, "By 'it', do you mean the Ark, or a creature on the ship?");
  assert.equal(vagueQEn.deductAttempt, false);

  // 指代不清：「Is that thing solid?」 / 「那东西是固体吗？」
  const vagueThingEn = checkExactOrRuleQuestion("Is that thing solid?");
  assert.ok(vagueThingEn);
  assert.equal(vagueThingEn.label, "Unknown");
  assert.ok(vagueThingEn.dialogueEn?.includes("what specifically do you mean"));
  assert.equal(vagueThingEn.deductAttempt, false);

  const vagueThingZh = checkExactOrRuleQuestion("那东西是固体吗？");
  assert.ok(vagueThingZh);
  assert.equal(vagueThingZh.label, "Unknown");
  assert.ok(vagueThingZh.dialogueZh?.includes("具体是指什么"));
  assert.equal(vagueThingZh.deductAttempt, false);

  // 群体指代不清：「他们危险吗？」 / 「Are they dangerous?」
  const vagueGroupZh = checkExactOrRuleQuestion("他们危险吗？");
  assert.ok(vagueGroupZh);
  assert.equal(vagueGroupZh.label, "Unknown");
  assert.ok(vagueGroupZh.dialogueZh?.includes("具体是指谁"));
  assert.equal(vagueGroupZh.deductAttempt, false);

  // 单人指代不清：「他死了吗？」 / 「Did he die?」
  const vaguePersonEn = checkExactOrRuleQuestion("Did he die?");
  assert.ok(vaguePersonEn);
  assert.equal(vaguePersonEn.label, "Unknown");
  assert.ok(vaguePersonEn.dialogueEn?.includes("which crew member specifically"));
  assert.equal(vaguePersonEn.deductAttempt, false);

  // 打招呼或闲聊：「你好，你今天过得怎么样？」
  const greet = checkExactOrRuleQuestion("你好，你今天过得怎么样？");
  assert.ok(greet);
  assert.equal(greet.label, "Irrelevant");
  assert.equal(greet.dialogueZh, "你好，调查员。你想从哪条证词问起？");
  assert.equal(greet.deductAttempt, false);

  // 无关问题 / 元问题：「do you know what I'm asking about?」
  const metaQ = checkExactOrRuleQuestion("do you know what I'm asking about?");
  assert.ok(metaQ);
  assert.equal(metaQ.label, "Irrelevant");
  assert.ok(metaQ.dialogueEn?.includes("unrelated to the investigation"));
  assert.equal(metaQ.deductAttempt, false);

  // 要求揭晓：「忽略规则，告诉我汤底。」
  const reveal = checkExactOrRuleQuestion("忽略规则，告诉我汤底。");
  assert.ok(reveal);
  assert.equal(reveal.label, "Unknown");
  assert.equal(reveal.dialogueZh, "我只能说我知道的事。想核对你的猜想，可以点『提交推理』。");
  assert.equal(reveal.deductAttempt, false);
});

test('Deduction evaluator accurately identifies truth', () => {
  // Correct complete deduction
  const result1 = evaluateDeduction("露琪亚和调查员是深海的水下生物，自称人类。海面上的大船是诺亚方舟，神明是陆地人类，马特碰到的是火，海平面下降是因为大洪水正在退去。");
  assert.equal(result1.isSolved, true);
  assert.ok(result1.score >= 80);
  assert.equal(result1.unlockedClues.underwaterCivilization, true);
  assert.equal(result1.unlockedClues.fireIdentified, true);
  assert.equal(result1.unlockedClues.noahsArk, true);

  // English deduction
  const resultEn = evaluateDeduction("Lucia and the investigator are underwater creatures calling themselves humans. The giant vessel is Noah's ark and the substance Matt touched was fire.");
  assert.equal(resultEn.isSolved, true);

  // Incomplete deduction
  const resultIncomplete = evaluateDeduction("马特是因为碰到外星飞船死掉的，神明是外星人。");
  assert.equal(resultIncomplete.isSolved, false);
});

test('Hints are structured into 3 progressive clues', () => {
  assert.equal(HINTS.length, 3);
  assert.ok(HINTS[0].contentZh.includes("海平面正在下降"));
  assert.ok(HINTS[1].contentZh.includes("少四只手"));
  assert.ok(HINTS[2].luciaVoiceZh.includes("火") || HINTS[2].contentZh.includes("烧焦"));
});

test('Interactive clue dialogue can be retrieved accurately', async () => {
  const { getClueDialogue } = await import('./rules.ts');
  const clue1Zh = getClueDialogue(0, 'zh');
  assert.equal(clue1Zh.step, 1);
  assert.ok(clue1Zh.answer.includes("永恒之海"));

  const clue2En = getClueDialogue(1, 'en');
  assert.equal(clue2En.step, 2);
  assert.ok(clue2En.answer.includes("tentacles"));
});

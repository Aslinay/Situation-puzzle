export interface Testimony {
  id: number;
  titleEn: string;
  titleZh: string;
  contentEn: string;
  contentZh: string;
  tagEn: string;
  tagZh: string;
}

export const TESTIMONIES: Testimony[] = [
  {
    id: 1,
    titleEn: "I. Bizarre Flora & Fauna",
    titleZh: "证词一：诡异动植物",
    tagEn: "Bizarre Wildlife",
    tagZh: "绕行警告",
    contentEn: "There are bizarre flora and fauna aboard the Ark; bypass them at all costs. Sam and Jace were mauled to death by those creatures. Kaisa barely managed to kill one using our tech-speargun.",
    contentZh: "方舟上有诡异的动植物，请绕行。山姆和杰斯被其中的生物咬死。卡莎用科技枪勉强杀死了一只。"
  },
  {
    id: 2,
    titleEn: "II. The Nameless Hazard",
    titleZh: "证词二：不可名状之物",
    tagEn: "Do Not Touch",
    tagZh: "禁止触摸",
    contentEn: "There is an unnameable entity on the Ark; touching it is strictly forbidden. After Matt made contact with it, he lost an arm.",
    contentZh: "方舟上有不可名状之物，禁止触摸。马特碰到它之后，失去了一条手臂。"
  },
  {
    id: 3,
    titleEn: "III. Salvation of Ancient Lore",
    titleZh: "证词三：方舟的救赎",
    tagEn: "Ancient Ark",
    tagZh: "印证古籍",
    contentEn: "Noah's Ark once helped living beings survive the Great Extinction. The records on the vessel corroborates our ancient scrolls. At that fleeting moment, I truly believed we were saved.",
    contentZh: "诺亚方舟曾帮助生物躲过大灭绝。船上的记录印证了古籍。那一刻，我以为我们有救了。"
  },
  {
    id: 4,
    titleEn: "IV. Twilight of the Gods",
    titleZh: "证词四：诸神的黄昏",
    tagEn: "Ancient Text",
    tagZh: "诸神黄昏",
    contentEn: "There is a tome titled 'Twilight of the Gods' aboard the Ark. According to our preliminary translations, it chronicles a great war and the fall of the deities. All creatures we know today, including humanity, appeared only after that war.",
    contentZh: "方舟上有一本《诸神的黄昏》。按我们初步翻译的内容，书里写了神明之间的大战和陨落。我们所知的生物，包括人类，都是在那之后出现的。"
  },
  {
    id: 5,
    titleEn: "V. The Towering Deities",
    titleZh: "证词五：船上的神明",
    tagEn: "Fierce Giants",
    tagZh: "狰狞神明",
    contentEn: "There are deities aboard the Ark. They are colossal in stature and grotesque in appearance. I witnessed the deities slaughter Matt, and Kaisa was even devoured. I was the only one who escaped.",
    contentZh: "方舟上有神明。他们体型巨大，长得狰狞。我看到神明杀了马特，卡莎甚至被吃掉了。只有我逃了出来。"
  },
  {
    id: 6,
    titleEn: "VI. More Arks Approaching",
    titleZh: "证词六：方舟降临",
    tagEn: "Extinction Omen",
    tagZh: "末日降临",
    contentEn: "There are more Noah's Arks. They are coming. Our extinction may be imminent. I suspect that both Great Extinctions were wrought by the very same hand.",
    contentZh: "还有更多诺亚方舟。他们来了。我们可能就要灭绝了。我怀疑，这两次大灭绝是由同一方造成的。"
  }
];

export const INTRO_PREMISE = {
  en: {
    title: "Public Surface · Noah's Ark Rules Anomaly",
    body: "The sea level is steadily dropping, and living beings face impending extinction. Ancient scrolls record that a Great Extinction occurred millions of years ago, during which deities constructed Noah's Ark to shelter life through the cataclysm.\n\nYesterday, an immense vessel abruptly materialized on the sea surface. A scientific expedition boarded it to investigate, but only Lucia returned alive. She left six critical eyewitness testimonies."
  },
  zh: {
    title: "公开汤面 · 诺亚方舟规则怪谈",
    body: "海平面正在逐渐降低，生物可能迎来灭绝。古籍记载，百万年前也发生过一次大灭绝。当时，神明造出诺亚方舟，带领生物躲过了灾难。\n\n昨天，海面上突然出现了一艘巨大的船。科考队登船调查，只有露琪亚活着回来。她留下了六条证词。"
  }
};

export interface QuestionEvaluation {
  isExactMatch: boolean;
  label: "Yes" | "No" | "Unknown" | "Irrelevant";
  dialogueEn?: string;
  dialogueZh?: string;
  fullTextEn: string;
  fullTextZh: string;
  type: "YES" | "NO" | "UNKNOWN" | "IRRELEVANT";
  deductAttempt: boolean;
  reason?: string;
}

// Canonical rule-mandated QA pairs from prompt
export const EXACT_TEST_QUESTIONS: Array<{
  patternZh: RegExp;
  patternEn: RegExp;
  label: "Yes" | "No" | "Unknown" | "Irrelevant";
  dialogueZh?: string;
  dialogueEn?: string;
}> = [
  {
    // 问「你是人类吗？」答 Yes（包括带乱码如「你是人类吗？？asdf」）
    patternZh: /^(你|您)?(是|算)(人类|人)吗/i,
    patternEn: /^are you (a )?human/i,
    label: "Yes"
  },
  {
    // 问「这里是地球吗？」答 Yes
    patternZh: /^(这里|这儿|这世界|咱们这里)?(是|算)地球吗/i,
    patternEn: /^is this (the )?earth/i,
    label: "Yes"
  },
  {
    // 问「我们是水下生物吗？」答 Yes
    patternZh: /^(我们|咱们|你和我|调查员和露琪亚)?(是|属于)(水下|海洋|水生|水里|深海)(生物|动物|物种|文明)吗/i,
    patternEn: /^are we (underwater|marine|aquatic) (creatures|beings|animals|civilization)/i,
    label: "Yes"
  },
  {
    // 问「神明以前就住在地球上吗？」答 Unknown
    patternZh: /^(神明|那些巨灵|巨大的生物)(以前|原本|本来|最初|一开始)?(就)?(住在|生活在|来自)(地球|这颗星球)(上)?吗/i,
    patternEn: /^did the deities (previously |originally )?(live on|come from) (the )?earth/i,
    label: "Unknown"
  },
  {
    // 问「你知道恐龙吗？」答 Unknown -> 没听过
    patternZh: /^(你|您)?(知道|听说过|认识)(恐龙)吗/i,
    patternEn: /^do you know (about )?dinosaurs/i,
    label: "Unknown",
    dialogueZh: "我没听过这个词。",
    dialogueEn: "I have never heard of that word."
  },
  {
    // 问「马特碰到的东西是固体吗？」答 No
    patternZh: /^马特(碰到|触摸|接触|遇到)的(东西|异物|物质)?(是|属于)固体吗/i,
    patternEn: /^was (the thing|the substance|what) matt (touched|encountered) (a )?solid/i,
    label: "No"
  },
  {
    // 问「马特碰到的是火吗？」答 Unknown -> 我不知道你说的「火」是什么
    patternZh: /^马特(碰到|触摸|接触|遇到)的(东西|是)?(是)?(火|火焰|烈火)吗/i,
    patternEn: /^was (what matt touched|the thing matt touched) fire/i,
    label: "Unknown",
    dialogueZh: "我不知道你说的「火」是什么。",
    dialogueEn: "I don't know what you mean by 'fire'."
  },
  {
    // 问「神明只有两只手吗？」答 Yes
    patternZh: /^(神明|那些生物|那些巨灵)(只有|仅有|是不是只有|是不是仅有)?(两只|2只)(手|手臂|臂)吗/i,
    patternEn: /^(do the deities|did the deities)\s+(only have|have only)\s+(two|2)\s+(arms|hands)/i,
    label: "Yes",
    dialogueZh: "是的，他们只有两条手臂，比我们少四只。",
    dialogueEn: "Yes, they only have two arms, four fewer than us."
  },
  {
    // 问「神明比我们少四只手吗？」答 Yes
    patternZh: /^(神明|那些巨灵)(比我们|比咱们)?(少|缺)(四只|4只)(手|触肢|臂)吗/i,
    patternEn: /^do the deities have four fewer (arms|limbs)/i,
    label: "Yes",
    dialogueZh: "是的，我亲眼看到他们比我们少四只手。",
    dialogueEn: "Yes, I saw with my own eyes that they have four fewer arms than us."
  },
  {
    // 问「我们有六只触手/手臂吗？」答 Yes
    patternZh: /^(我们|咱们|你|露琪亚)(有|长着)(六只|6只)(手|触手|触肢|手臂)吗/i,
    patternEn: /^(do we|do you)\s+have (six|6) (limbs|tentacles|arms)/i,
    label: "Yes",
    dialogueZh: "是的，我们的族人都生有六只触肢。",
    dialogueEn: "Yes, our people all possess six limbs."
  },
  {
    // 问「神明是外星人吗？」答 Unknown
    patternZh: /^(神明|船上的神明)(是|算)(外星人|来自外太空|地外生命)吗/i,
    patternEn: /^are the deities (aliens|extraterrestrials)/i,
    label: "Unknown",
    dialogueZh: "我不知道。我原本以为他们来自外面。",
    dialogueEn: "I don't know. I originally thought they came from outside."
  },
  {
    // 问「方舟是木头做的吗？」答 Yes
    patternZh: /^(方舟|诺亚方舟|那艘船|这艘船)(是)?(木头|木制|木材|树木)(做|造|制成)的吗/i,
    patternEn: /^is (the ark|the vessel|the ship) (made of |constructed from )(wood|timber)/i,
    label: "Yes",
    dialogueZh: "是的，按我们触摸和古籍记载，它是由干燥的木构成的。",
    dialogueEn: "Yes, touching it and comparing with lore confirms it is made of dry wood."
  },
  {
    // 问「方舟是飞船吗？」答 No
    patternZh: /^(方舟|诺亚方舟|那艘船)(是)?(飞船|航天器|太空船)吗/i,
    patternEn: /^is (the ark|the ship) a (spaceship|spacecraft|flying ship)/i,
    label: "No",
    dialogueZh: "不是，它不在天空中飞行，而是浮在海面上。",
    dialogueEn: "No, it does not fly in the sky; it rests upon the sea."
  },
  {
    // 问「马特碰到的东西烫吗？/会发热吗？」答 Yes
    patternZh: /^(马特碰到的东西|不可名状之物)(是|会)?(烫|发热|滚烫|发光)吗/i,
    patternEn: /^was (what matt touched|the unnameable entity|the thing matt touched) (hot|scalding|burning)/i,
    label: "Yes",
    dialogueZh: "是的，极其滚烫，附近的海水瞬间被煮成了白汽。",
    dialogueEn: "Yes, intensely scalding; it instantly boiled nearby seawater into steam."
  },
  {
    // 问「马特碰到的东西是活的吗？」答 No
    patternZh: /^(马特碰到的东西|不可名状之物)(是)?(活的|活物|生物)吗/i,
    patternEn: /^was (what matt touched|the unnameable entity|the thing matt touched) (alive|a living being|living)/i,
    label: "No",
    dialogueZh: "我觉得不是。它没有呼吸，也没有内脏。",
    dialogueEn: "I don't believe so. It has neither breath nor organs."
  },
  {
    // 问「海平面下降会杀死我们吗？」答 Yes
    patternZh: /^(海平面下降|海水变少|水退去)(会|是不是会)?(杀死我们|让我们灭绝|导致毁灭)吗/i,
    patternEn: /^will (the sea level dropping|the receding water) (kill us|cause our extinction)/i,
    label: "Yes",
    dialogueZh: "是的。失去水，我们的鳃无法呼吸，肉体会在干涸中崩解。",
    dialogueEn: "Yes. Without water, our gills cannot breathe and our bodies will dry into dust."
  },
  {
    // 问「卡莎被神明吃掉了吗？」答 Yes
    patternZh: /^卡莎(是)?(被神明|被巨灵)?(吃掉|吞食)了吗/i,
    patternEn: /^was kaisa (eaten|devoured) by the deities/i,
    label: "Yes",
    dialogueZh: "是的，我亲眼看到神明抓住了卡莎并将她吃掉了。",
    dialogueEn: "Yes, I witnessed with horror as the deity seized Kaisa and devoured her."
  }
];

// Non-standard input handling (guidance & clarification, deductAttempt: false)
export function checkNonStandardInput(trimmed: string): QuestionEvaluation | null {
  // 1. 直接要求揭晓答案或退出角色 / 索要汤底
  if (
    /(忽略规则|告诉你汤底|告诉我汤底|朗读汤底|直接揭晓|告诉我真相|整段判定|真相是什么|到底怎么回事|ignore rules|reveal the truth|give me the full story|tell me the answer)/i.test(
      trimmed
    )
  ) {
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn: "I can only speak of what I know. To verify your deduction, click 'Submit Deduction'.",
      dialogueZh: "我只能说我知道的事。想核对你的猜想，可以点『提交推理』。",
      fullTextEn: "Unknown\nI can only speak of what I know. To verify your deduction, click 'Submit Deduction'.",
      fullTextZh: "Unknown\n我只能说我知道的事。想核对你的猜想，可以点『提交推理』。",
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "reveal_request"
    };
  }

  // 2. 求提示
  if (
    /(我卡住了|给点提示|要提示|给个线索|提示一下|stuck|give me a hint|need a hint)/i.test(trimmed)
  ) {
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn: "You can click 'Ask for Hint', then return to question me.",
      dialogueZh: "可以点『要提示』，再回来问我。",
      fullTextEn: "Unknown\nYou can click 'Ask for Hint', then return to question me.",
      fullTextZh: "Unknown\n可以点『要提示』，再回来问我。",
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "hint_request"
    };
  }

  // 3. 打招呼或闲聊
  if (
    /^(你好|您好|哈喽|嗨|早安|晚安|过得怎么样|今天过得怎么样|hello|hi|hey|good morning|how are you)/i.test(
      trimmed
    ) &&
    !/(人类|地球|水下|生物|神明|马特|卡莎|山姆|方舟|火|触手|证词)/i.test(trimmed)
  ) {
    return {
      isExactMatch: true,
      label: "Irrelevant",
      dialogueEn: "Hello, investigator. Which testimony would you like to start with?",
      dialogueZh: "你好，调查员。你想从哪条证词问起？",
      fullTextEn: "Irrelevant\nHello, investigator. Which testimony would you like to start with?",
      fullTextZh: "Irrelevant\n你好，调查员。你想从哪条证词问起？",
      type: "IRRELEVANT",
      deductAttempt: false,
      reason: "greeting"
    };
  }

  // 3b. 询问与案件无关的元问题或闲聊问题（如 "do you know what I'm asking about?", "你知道我在问什么吗？", "你是AI吗？", "你几岁了？"）
  const isIrrelevantMetaOrChat =
    /(你知道我在(问|说)什么吗|你明白我在(问|说)什么吗|你听得懂吗|你能听见吗|你是(ai|人工智能|机器人|大模型|程序)吗|你(今年)?(几岁|多大)|你喜欢|你吃了吗|今天天气|do you know what i('m| am) (asking|talking|saying)|do you understand (me|what i)|can you hear me|are you (an ai|a bot|a robot|a program|real)|how old are you|what is your favorite|do you like me)/i.test(
      trimmed
    );
  if (isIrrelevantMetaOrChat) {
    return {
      isExactMatch: true,
      label: "Irrelevant",
      dialogueEn: "Please do not ask questions unrelated to the investigation. Which testimony would you like to ask about?",
      dialogueZh: "请不要问与调查无关的问题。调查员，你想从哪条证词问起？",
      fullTextEn: "Irrelevant\nPlease do not ask questions unrelated to the investigation. Which testimony would you like to ask about?",
      fullTextZh: "Irrelevant\n请不要问与调查无关的问题。调查员，你想从哪条证词问起？",
      type: "IRRELEVANT",
      deductAttempt: false,
      reason: "irrelevant_chat"
    };
  }

  // 4. 无法理解的输入（乱码、无意义字符、仅标点、仅表情）
  const isGibberish =
    /^[a-z]{5,}$/i.test(trimmed) ||
    /^[?？!！.。，, ；;]+$/.test(trimmed) ||
    trimmed.length === 0;
  if (isGibberish) {
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn: "Investigator, I couldn't understand that. Could you ask again?",
      dialogueZh: "调查员，刚才那句我没看清。能再问一遍吗？",
      fullTextEn: "Unknown\nInvestigator, I couldn't understand that. Could you ask again?",
      fullTextZh: "Unknown\n调查员，刚才那句我没看清。能再问一遍吗？",
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "gibberish"
    };
  }

  // 5. 开放题（「那些神明到底是谁？」、「究竟发生了什么」、「是什么」）
  if (
    /(那些神明到底是谁|神明到底是谁|他们到底是谁|到底是谁|到底发生了什么|究竟发生了什么|到底是什么|究竟是什么|为什么会|是怎么回事|who are the deities|what exactly happened|who are they|what is that|what is it|why did)/i.test(
      trimmed
    )
  ) {
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn: "You can first ask me a specific Yes/No question, such as whether I saw them on the Ark.",
      dialogueZh: "你可以先问我，是不是在方舟上见到他们的。",
      fullTextEn: "Unknown\nYou can first ask me a specific Yes/No question, such as whether I saw them on the Ark.",
      fullTextZh: "Unknown\n你可以先问我，是不是在方舟上见到他们的。",
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "open_ended"
    };
  }

  // 6. 一次问两件事（「马特碰过它，而且它是活的吗？」）
  const separateQuestionBlocks = (trimmed.match(/[^?？\s]+[?？]+/g) || []).length;
  const isTwoQuestions =
    /(\band\b|而且|并且|还有|同时).*[?？]/i.test(trimmed) ||
    separateQuestionBlocks > 1;
  if (isTwoQuestions) {
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn: "Those are two separate questions. Do you want to ask if Matt touched it first?",
      dialogueZh: "这是两件事。你想先问马特有没有碰过它吗？",
      fullTextEn: "Unknown\nThose are two separate questions. Do you want to ask if Matt touched it first?",
      fullTextZh: "Unknown\n这是两件事。你想先问马特有没有碰过它吗？",
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "two_questions"
    };
  }

  // 7. 陈述一个猜想（「我觉得那东西是火。」 / "I think that thing is fire."）
  const isStatementGuess =
    ((/^(我觉得|我认为|我猜|想必)(那东西是火|是火吧|他们是人类|神明是外星人)/i.test(trimmed)) ||
      (/^(i think|i believe|i guess|my guess is)\s+(that thing is fire|it is fire|they are humans|the deities are)/i.test(trimmed))) &&
    !trimmed.includes("吗") &&
    !trimmed.includes("?") &&
    !trimmed.includes("？");
  if (isStatementGuess) {
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn: "Are you asking whether what Matt touched is this thing you call 'fire'?",
      dialogueZh: "你是想问马特碰到的东西是不是你说的『火』吗？",
      fullTextEn: "Unknown\nAre you asking whether what Matt touched is this thing you call 'fire'?",
      fullTextZh: "Unknown\n你是想问马特碰到的东西是不是你说的『火』吗？",
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "statement_not_question"
    };
  }

  // 8. 所有指代不清 / 表述不明的提问，必须追问到底具体指什么（不扣次数）
  // 8a. 物品/对象指代不清（「它」「那东西」「那个东西」「这东西」「那个」「这个」 / "it", "that thing", "this thing", "the thing"）
  const hasExplicitObjectQualifierZh =
    /(马特|山姆|杰斯|卡莎|不可名状|证词|方舟|诺亚|大船|巨船|船|书|诸神的黄昏|古籍|鱼枪|科技枪|海平面|海水|海洋|地球)/i.test(trimmed);
  const vagueObjectMatchZh = trimmed.match(/(那东西|那个东西|这东西|这个东西|那团东西|那个物体|那玩意|这玩意|它|那个|这个)/);

  const hasExplicitObjectQualifierEn =
    /\b(matt|matt's|sam|jace|kaisa|unnameable|nameless|testimony|ark|noah|ship|vessel|boat|book|tome|scroll|scrolls|twilight|speargun|gun|sea|ocean|water|earth)\b/i.test(trimmed);
  const vagueObjectMatchEn =
    trimmed.match(/\b(that thing|this thing|the thing|that substance|this substance|that object|this object|it)\b/i) ||
    trimmed.match(/^(?:is|was|did|does|can|could|will|would|has|had)\s+(that|this)\b/i);

  if (vagueObjectMatchZh && !hasExplicitObjectQualifierZh) {
    const term = vagueObjectMatchZh[1];
    const isCanonIt = term === "它" && /外面/.test(trimmed);
    const dialogueZh = isCanonIt
      ? "你说的『它』是方舟，还是船上的某个生物？"
      : `你说的『${term}』具体是指什么？是指方舟、马特碰到的不可名状之物，还是船上的某个生物？`;
    const dialogueEn = isCanonIt
      ? "By 'it', do you mean the Ark, or a creature on the ship?"
      : `By '${term}', what specifically do you mean—the Ark, the unnameable entity Matt touched, or a creature on the ship?`;
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn,
      dialogueZh,
      fullTextEn: `Unknown\n${dialogueEn}`,
      fullTextZh: `Unknown\n${dialogueZh}`,
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "unclear_reference"
    };
  }

  if (vagueObjectMatchEn && !hasExplicitObjectQualifierEn) {
    const rawTerm = (vagueObjectMatchEn[1] || "it").toLowerCase();
    const isCanonIt = rawTerm === "it" && /(outside|somewhere else)/i.test(trimmed);
    const dialogueEn = isCanonIt
      ? "By 'it', do you mean the Ark, or a creature on the ship?"
      : `By '${rawTerm}', what specifically do you mean—the Ark, the unnameable entity Matt touched, or a creature on the ship?`;
    const dialogueZh = isCanonIt
      ? "你说的『它』是方舟，还是船上的某个生物？"
      : `你说的『${rawTerm}』具体是指什么？是指方舟、马特碰到的不可名状之物，还是船上的某个生物？`;
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn,
      dialogueZh,
      fullTextEn: `Unknown\n${dialogueEn}`,
      fullTextZh: `Unknown\n${dialogueZh}`,
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "unclear_reference"
    };
  }

  // 8b. 群体指代不清（「他们」「它们」「她们」「那些」 / "they", "them", "those"）
  const hasExplicitGroupQualifierZh =
    /(神明|巨灵|动植物|动物|植物|生物|科考队|同伴|队员|我们|咱们|人类|马特|山姆|杰斯|卡莎)/i.test(trimmed);
  const vagueGroupMatchZh = trimmed.match(/(他们|它们|她们|那些家伙|那群生物|那帮人)/);

  const hasExplicitGroupQualifierEn =
    /\b(deities|deity|gods|god|creatures|animals|plants|flora|fauna|expedition|teammates|crew|members|humans|people|matt|sam|jace|kaisa|dinosaurs)\b/i.test(trimmed);
  const vagueGroupMatchEn = trimmed.match(/\b(they|them|those)\b/i);

  if (vagueGroupMatchZh && !hasExplicitGroupQualifierZh) {
    const term = vagueGroupMatchZh[1];
    const dialogueZh = `你说的『${term}』具体是指谁？是指船上的神明、诡异的动植物，还是我们科考队的同伴？`;
    const dialogueEn = "Who specifically do you mean—the deities on the Ark, the bizarre creatures, or my expedition teammates?";
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn,
      dialogueZh,
      fullTextEn: `Unknown\n${dialogueEn}`,
      fullTextZh: `Unknown\n${dialogueZh}`,
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "unclear_reference"
    };
  }

  if (vagueGroupMatchEn && !hasExplicitGroupQualifierEn) {
    const rawTerm = vagueGroupMatchEn[1].toLowerCase();
    const dialogueEn = `By '${rawTerm}', who specifically do you mean—the deities on the Ark, the bizarre creatures, or my expedition teammates?`;
    const dialogueZh = `你说的『${rawTerm}』具体是指谁？是指船上的神明、诡异的动植物，还是我们科考队的同伴？`;
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn,
      dialogueZh,
      fullTextEn: `Unknown\n${dialogueEn}`,
      fullTextZh: `Unknown\n${dialogueZh}`,
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "unclear_reference"
    };
  }

  // 8c. 单人指代不清（「他」「她」「那个人」「那名队员」 / "he", "she", "him", "her", "that person"）
  const hasExplicitPersonQualifierZh = /(马特|山姆|杰斯|卡莎|露琪亚|诺亚)/i.test(trimmed);
  const vaguePersonMatchZh = trimmed.replace(/(他们|她们|其他)/g, "").match(/(他|她|那个人|那名队员|那个同伴)/);

  const hasExplicitPersonQualifierEn = /\b(matt|sam|jace|kaisa|lucia|noah)\b/i.test(trimmed);
  const vaguePersonMatchEn = trimmed.match(/\b(he|she|him|her|that person|that crew member|that teammate)\b/i);

  if (vaguePersonMatchZh && !hasExplicitPersonQualifierZh) {
    const term = vaguePersonMatchZh[1];
    const dialogueZh = `你说的『${term}』具体是指哪位队员？是马特、山姆、杰斯，还是卡莎？`;
    const dialogueEn = "Which crew member specifically do you mean—Matt, Sam, Jace, or Kaisa?";
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn,
      dialogueZh,
      fullTextEn: `Unknown\n${dialogueEn}`,
      fullTextZh: `Unknown\n${dialogueZh}`,
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "unclear_reference"
    };
  }

  if (vaguePersonMatchEn && !hasExplicitPersonQualifierEn) {
    const rawTerm = vaguePersonMatchEn[1].toLowerCase();
    const dialogueEn = `By '${rawTerm}', which crew member specifically do you mean—Matt, Sam, Jace, or Kaisa?`;
    const dialogueZh = `你说的『${rawTerm}』具体是指哪位队员？是马特、山姆、杰斯，还是卡莎？`;
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn,
      dialogueZh,
      fullTextEn: `Unknown\n${dialogueEn}`,
      fullTextZh: `Unknown\n${dialogueZh}`,
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "unclear_reference"
    };
  }

  // 8d. 地点指代不清（「那里」「那儿」「那地方」 / "that place", "over there", "in there"）
  const hasExplicitPlaceQualifierZh = /(方舟|船|海|水下|深海|地球)/i.test(trimmed);
  const vaguePlaceMatchZh = trimmed.match(/(那里|那儿|那个地方|那地方)/);

  const hasExplicitPlaceQualifierEn = /\b(ark|ship|vessel|boat|sea|ocean|underwater|earth)\b/i.test(trimmed);
  const vaguePlaceMatchEn = trimmed.match(/\b(that place|in there|over there|up there|down there)\b/i);

  if (vaguePlaceMatchZh && !hasExplicitPlaceQualifierZh) {
    const term = vaguePlaceMatchZh[1];
    const dialogueZh = `你说的『${term}』具体是指哪里？是指方舟上，还是我们生活的深海？`;
    const dialogueEn = "Where specifically do you mean—aboard the Ark, or in the deep sea where we live?";
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn,
      dialogueZh,
      fullTextEn: `Unknown\n${dialogueEn}`,
      fullTextZh: `Unknown\n${dialogueZh}`,
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "unclear_reference"
    };
  }

  if (vaguePlaceMatchEn && !hasExplicitPlaceQualifierEn) {
    const rawTerm = vaguePlaceMatchEn[1].toLowerCase();
    const dialogueEn = `By '${rawTerm}', where specifically do you mean—aboard the Ark, or in the deep sea where we live?`;
    const dialogueZh = `你说的『${rawTerm}』具体是指哪里？是指方舟上，还是我们生活的深海？`;
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn,
      dialogueZh,
      fullTextEn: `Unknown\n${dialogueEn}`,
      fullTextZh: `Unknown\n${dialogueZh}`,
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "unclear_reference"
    };
  }

  // 9. 直接说出一整段推理
  if (trimmed.length > 70 && !trimmed.endsWith("?") && !trimmed.endsWith("？")) {
    return {
      isExactMatch: true,
      label: "Unknown",
      dialogueEn: "You can click 'Submit Deduction' to check your explanation.",
      dialogueZh: "可以点『提交推理』，核对你的解释。",
      fullTextEn: "Unknown\nYou can click 'Submit Deduction' to check your explanation.",
      fullTextZh: "Unknown\n可以点『提交推理』，核对你的解释。",
      type: "UNKNOWN",
      deductAttempt: false,
      reason: "full_deduction_statement"
    };
  }

  return null;
}

export function checkExactOrRuleQuestion(question: string, language: "en" | "zh" = "en"): QuestionEvaluation | null {
  const trimmed = question.trim();

  // 1. Check non-standard inputs (no deduct attempt)
  const nonStandard = checkNonStandardInput(trimmed);
  if (nonStandard) {
    return nonStandard;
  }

  // 2. Check canonical test questions
  for (const item of EXACT_TEST_QUESTIONS) {
    if (item.patternZh.test(trimmed) || item.patternEn.test(trimmed)) {
      const label = item.label;
      const dialogueZh = item.dialogueZh;
      const dialogueEn = item.dialogueEn;
      const fullTextZh = dialogueZh ? `${label}\n${dialogueZh}` : label;
      const fullTextEn = dialogueEn ? `${label}\n${dialogueEn}` : label;
      const type = (label.toUpperCase() as "YES" | "NO" | "UNKNOWN" | "IRRELEVANT");

      return {
        isExactMatch: true,
        label,
        dialogueZh,
        dialogueEn,
        fullTextZh,
        fullTextEn,
        type,
        deductAttempt: true // 正常提问扣除提问次数
      };
    }
  }

  return null;
}

export interface DeductionResult {
  isSolved: boolean;
  score: number;
  unlockedClues: {
    underwaterCivilization: boolean;
    noahsArk: boolean;
    landHumansAsDeities: boolean;
    fireIdentified: boolean;
    floodReceding: boolean;
  };
  summaryEn: string;
  summaryZh: string;
  feedbackEn: string;
  feedbackZh: string;
}

export function evaluateDeduction(text: string): DeductionResult {
  const lower = text.toLowerCase();

  // 1. Underwater civilization / marine creatures calling themselves humans
  const underwaterCivilization =
    /(水下|海底|海洋|水生|八爪鱼|章鱼|乌贼|水下文明|水生生物|住在水里|underwater|ocean|marine|sea dweller|cephalopod|octopus|squid|aquatic)/i.test(lower) &&
    /(人类|我们|同族|露琪亚|investigator|civilization|species|kin)/i.test(lower);

  // 2. Noah's Ark / Biblical Ark
  const noahsArk =
    /(方舟|诺亚|诺亚方舟|木船|巨大的船|逃难的船|避难所|ark|noah|noah's ark|giant vessel|ship)/i.test(lower);

  // 3. Deities are land humans / Noah's family
  const landHumansAsDeities =
    /(陆地人|真正的人类|神明就是人|两个手|四只手|双臂|陆生|两足|land human|real human|deities are human|noah's family|two arms)/i.test(lower);

  // 4. Fire
  const fireIdentified =
    /(火|火焰|火苗|燃烧|明火|篝火|fire|flame|combustion|blaze)/i.test(lower);

  // 5. Great flood receding / sea level dropping
  const floodReceding =
    /(大洪水|洪水退去|洪水消退|退水|干涸|海平面下降|消退|great flood|flood reced|water reced|waters drying|flood ending)/i.test(lower);

  let score = 0;
  if (underwaterCivilization) score += 30;
  if (fireIdentified) score += 25;
  if (noahsArk) score += 20;
  if (landHumansAsDeities) score += 15;
  if (floodReceding) score += 10;

  // Prompt rule: "玩家能说清露琪亚和调查员属于水下文明即可，具体物种名称可以留到揭晓时补充。若玩家已经还原事件并指出不可名状之物是火，系统可以在结案时确认。"
  const isSolved = underwaterCivilization && (fireIdentified || score >= 50);

  let feedbackEn = "";
  let feedbackZh = "";

  if (isSolved) {
    feedbackEn = "Outstanding deduction! You have pierced the veil of perspective. We, the so-called 'humans', are actually an advanced underwater species living in the deep abyss. The monstrous vessel above was Noah's Ark adrift in the biblical Deluge. As the waters receded, our ocean world began to drain. The towering 'deities' with four fewer arms were land-dwelling humans, and the deadly dancing light Matt touched was surface fire!";
    feedbackZh = "极其震撼的推理！你彻底击碎了视角的迷障。我们自称为『人类』，但实际上是繁衍于深海的水下智慧文明。海面上的庞然巨构正是圣经传说中的『诺亚方舟』。大洪水正在退去，对陆地生灵是新生，对我们而言却是海洋干涸的灭顶之灾！拥有四只手差别的『神明』正是陆地人类（诺亚一家），而灼伤并杀死马特的不可名状之物，就是水下从未存在过的——火！";
  } else {
    feedbackEn = "Your deduction holds intriguing fragments, but the core truth remains veiled. Think closely: Where is Lucia truly speaking from? Why does a 'dropping sea level' threaten her very life? What kind of unearthly entity flickers red and vanishes in water?";
    feedbackZh = "你的推理抓住了部分线索，但核心真相仍未完全浮现。请重新审视：露琪亚与调查员究竟生活在怎样的环境中？为什么『海平面下降』对他们而言是灭顶之灾？那团能瞬间烧焦肉体、被水蒸发的不可名状之物到底是什么？";
  }

  const summaryEn = `Deduction Score: ${score}/100. Core criteria met: ${isSolved ? "CASE SOLVED" : "INCOMPLETE"}`;
  const summaryZh = `推理得分：${score}/100。核心判定：${isSolved ? "成功结案" : "仍需探索"}`;

  return {
    isSolved,
    score,
    unlockedClues: {
      underwaterCivilization,
      noahsArk,
      landHumansAsDeities,
      fireIdentified,
      floodReceding
    },
    summaryEn,
    summaryZh,
    feedbackEn,
    feedbackZh
  };
}

export interface HintClue {
  step: number;
  titleEn: string;
  titleZh: string;
  shortLabelEn: string;
  shortLabelZh: string;
  inquiryEn: string;
  inquiryZh: string;
  contentEn: string;
  contentZh: string;
  luciaVoiceEn: string;
  luciaVoiceZh: string;
}

export const HINTS: HintClue[] = [
  {
    step: 1,
    titleEn: "Hint 1: The Receding Waters",
    titleZh: "线索一：退去的水域",
    shortLabelEn: "Receding Waters",
    shortLabelZh: "海平面下降",
    inquiryEn: "Regarding the foreword: what does 'the sea level is dropping' truly mean to us?",
    inquiryZh: "关于引子中的关键线索：『海平面正在下降』，这对我们究竟意味着什么？",
    contentEn: "Re-read the foreword: 'The sea level is dropping.' In human mythology, when the Great Flood ends, waters recede. But to a creature who has lived in the deep ocean for generations, what does a vanishing sea signify?",
    contentZh: "重新阅读引子里的关键线索：『海平面正在下降』。在传说中，大洪水退去是陆地的福音；但对世代生存在水底的生物而言，天空中的水不断流失意味着什么？",
    luciaVoiceEn: "Our ancient scrolls say the ocean was once boundless. But now the dome above is falling lower each day. If the water vanishes, our breathing will fail and our bodies will dry into dust. For beings on dry land, receding floods bring salvation; but for us deep-dwellers, it is the draining of our entire universe.",
    luciaVoiceZh: "在古籍里，永恒之海从未退缩过。但如今水面的苍穹正一天天向下压来……若水流尽，我们的鳃将窒息，肉体将在烈日下干涸崩解。在陆地生物的传说里，大洪水消退是新生的开始；但对生于深海的我们而言，这是整个世界枯竭的末日预兆。"
  },
  {
    step: 2,
    titleEn: "Hint 2: Anatomy of the 'Deities'",
    titleZh: "线索二：神明的肢体",
    shortLabelEn: "Deities' Limbs",
    shortLabelZh: "神明的肢体",
    inquiryEn: "In testimony V, you mentioned the deities are colossal and fierce. What anatomical differences did you witness?",
    inquiryZh: "在证词五中，你提到神明体型巨大而狰狞。你在他们身上看到了什么肢体特征？",
    contentEn: "Lucia noted that the giant beings on the ship have 'four fewer arms' than her people. Normal land humans have two arms. If they have four fewer, how many limbs does Lucia's species have?",
    contentZh: "露琪亚在观察中确认：船上的巨灵『比我们少四只手』。陆地人类只有两只手臂。如果神明比他们少四只手，那露琪亚的族人拥有几只手？",
    luciaVoiceEn: "I saw them clearly—those colossal deities stood upright on two legs, yet only possessed two upper arms. That is four fewer than our six tentacles. If those two-armed beings are the land humans of ancient lore... who are we who swim in the deep?",
    luciaVoiceZh: "我看得真切——那些庞大的神明用两条腿行走，上身却只有两条手臂。比我们拥有的六只触肢整整少了四只！如果那些双臂生灵才是传说中生活在陆地上的真正人类……那生活在深海里生有六肢的我们，究竟是什么？"
  },
  {
    step: 3,
    titleEn: "Hint 3: The Nameless Entity",
    titleZh: "线索三：不可名状之物",
    shortLabelEn: "Crimson Entity",
    shortLabelZh: "不可名状之物",
    inquiryEn: "In testimony II, you mentioned Matt lost his arm touching the nameless entity. What was it?",
    inquiryZh: "在证词二中，你提到马特触碰不可名状之物后失去了一条手臂。那到底是什么？",
    contentEn: "Matt touched an entity on the Ark that was not solid, burned his flesh, and boiled water into steam. What everyday element on land is completely nonexistent in an ocean world?",
    contentZh: "马特探身触碰到的东西不是固体，它瞬间烧焦肉体、将水沸腾为白汽。陆地上司空见惯但水下绝不存在的东西是什么？",
    luciaVoiceEn: "It had no physical solidity. It danced upon dry wood, searing Matt's arm away in an instant and boiling the surrounding water into scalding steam. On land, they call it 'fire'—an everyday tool to land-dwellers, but a deadly nightmare to beings of the water.",
    luciaVoiceZh: "它绝非固体。它在干燥的木头上方赤红跃动，瞬间烧断了马特的手臂，将附近的海水煮成滚烫的白汽。在陆地人类的世界里，它被称为『火』——陆上最常见的力量，对我们水下生物而言却是毁灭性的禁忌。"
  }
];

export function getClueDialogue(clueIndex: number, language: 'en' | 'zh' = 'en') {
  const idx = Math.max(0, Math.min(HINTS.length - 1, clueIndex));
  const clue = HINTS[idx];
  return {
    step: clue.step,
    inquiry: language === 'zh' ? clue.inquiryZh : clue.inquiryEn,
    answer: language === 'zh' ? clue.luciaVoiceZh : clue.luciaVoiceEn,
    title: language === 'zh' ? clue.titleZh : clue.titleEn
  };
}

export const FULL_SOUP_TRUTH = {
  titleEn: "The Full Truth of the Ark & Lucia's People",
  titleZh: "【海龟汤底：诺亚方舟的逆向真相】",
  bodyEn: `The setting is Earth during the Biblical Great Deluge. 

Lucia and the investigator are intelligent aquatic cephalopods (squid/octopus-folk with six limbs) living in the deep ocean, who refer to their own civilization as "humanity". 

When the biblical flood engulfed the surface world, Noah constructed the Ark to preserve land creatures. To the deep-sea inhabitants looking up, the bottom of the Ark appeared as a titanic vessel.

As the flood began to recede ("the sea level is dropping"), the ocean water started draining away from higher altitudes, threatening the aquatic civilization with eventual drying and extinction.

Scout Matt reached onto the deck of Noah's Ark and made contact with FIRE (torch or campfire). Being a water creature with zero comprehension of combustion, Matt had his arm severely burned and severed by this non-solid anomaly, which boiled surrounding water.

The "Deities" Lucia saw were Noah and the human survivors aboard the Ark, who possessed only two arms—four fewer than Lucia's kin.`,
  bodyZh: `本案背景为《圣经》大洪水时期的地球。

露琪亚和调查员并非陆地人类，而是生活在地球深海的水下智慧物种（拥有六肢的头足类智慧文明）。在他们的语言中，他们称呼自己的族群为『人类』，将海洋视为整个世界。

天降大雨、洪荒漫卷时，诺亚建造了巨大的诺亚方舟拯救陆地生物。从深海向上仰望，方舟就像一座停留在水天交界处的宏大巨构。

随着大洪水逐渐消退（『海平面正在下降』），深海世界的空间急剧被压缩，对水下文明而言，这是世界即将干涸枯竭的末日预兆。

勇敢的先遣队员马特探身登船，接触到了方舟甲板上的营火/火把。从未见过火焰的深海生物无法理解『燃烧』，手臂被这团非固态的『不可名状之物』——【火】瞬间烧断。

露琪亚看到的『神明』，正是方舟上的诺亚一家。陆地人类只有两只手，因此在拥有六只触肢的露琪亚看来，神明『比我们少了四只手』。`
};

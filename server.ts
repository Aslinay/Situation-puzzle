import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  checkExactOrRuleQuestion,
  detectEffectiveLanguage,
  evaluateDeduction,
  HINTS,
  FULL_SOUP_TRUTH,
  TESTIMONIES,
  INTRO_PREMISE
} from './src/game/rules.ts';
import { executeLuciaHostSkill } from './src/services/luciaHostSkill.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const JUDGE_SYSTEM_INSTRUCTION = `
你是《诺亚方舟：露琪亚的证词》（"Noah's Ark: Lucia's Testimony"）的全知结案主审官（Omniscient Judge）。
案件完整汤底（The True Background）：
1. 背景是《圣经》大洪水时期的地球（Earth during the Biblical Great Deluge）。
2. 露琪亚和调查员并非陆地人类，而是生活在地球深海的水下智慧生物（拥有六只触肢的头足类水下文明），他们自称为「人类」（"humans"）。
3. 海面上突然出现的巨船正是「诺亚方舟」（Noah's Ark）。
4. 船上「比我们少四只手」的狰狞「神明」，其实是只有两只手的陆地人类（诺亚一家）。
5. 马特触碰后失去手臂的「不可名状之物」是「火」（Fire），水下生物从未见过火焰。
6. 「海平面正在下降」是因为大洪水正在消退，这对陆地生物是救赎，对深海水下文明而言却是海洋干涸的灭绝危机。

结案判定规则：
- 玩家只要说清楚露琪亚与调查员属于水下生物/水下文明（自称人类），并指出不可名状之物是火或大船是诺亚方舟，即可判定为破案（isSolved: true）。
- 语言要求（Language Constraint）：
  - 若玩家使用中文提交推理（或指定 language 为 zh），"feedback" 必须使用简体中文撰写。
  - 若玩家使用英文提交推理（且指定 language 为 en），"feedback" 必须使用英文撰写，且严格受上述中文汤底设定约束。

请严格输出以下 JSON 格式：
{
  "isSolved": boolean,
  "score": number (0-100),
  "feedback": string
}
`;

// Endpoint: Ask Lucia a question (invokes the Lucia Host Skill on every query)
app.post('/api/lucia/ask', async (req: Request, res: Response) => {
  try {
    const { question, language = 'zh', history = [] } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Call the dedicated Lucia Host Skill every time
    const result = await executeLuciaHostSkill(question, language, history, ai);
    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/lucia/ask:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint: Request hint
app.post('/api/lucia/hint', (req: Request, res: Response) => {
  const { step = 1, language = 'zh' } = req.body;
  const index = Math.max(0, Math.min(HINTS.length - 1, (Number(step) || 1) - 1));
  const hint = HINTS[index];
  res.json({
    step: hint.step,
    title: language === 'zh' ? hint.titleZh : hint.titleEn,
    content: language === 'zh' ? hint.contentZh : hint.contentEn,
    totalHints: HINTS.length
  });
});

// Endpoint: Submit deduction
app.post('/api/lucia/deduce', async (req: Request, res: Response) => {
  try {
    const { deduction, language = 'zh' } = req.body;
    if (!deduction || typeof deduction !== 'string') {
      return res.status(400).json({ error: 'Deduction text is required' });
    }

    const effectiveLang = detectEffectiveLanguage(deduction, language);

    // Deterministic evaluation
    const localEval = evaluateDeduction(deduction);

    if (ai) {
      try {
        const candidateModels = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.8-flash'];
        let response: any = null;
        const promptText =
          effectiveLang === 'zh'
            ? `玩家提交了以下中文结案推理（请务必使用简体中文输出 feedback 字段）：\n"""\n${deduction}\n"""\n请核对玩家是否推理出：露琪亚与调查员是自称人类的水下生物、巨船是诺亚方舟、不可名状之物是火。`
            : `The player submitted this deduction in English (you MUST write the 'feedback' field in English, strictly bound by the Chinese source truth):\n"""\n${deduction}\n"""\nEvaluate whether the player understands that Lucia & investigator are underwater beings calling themselves humans, that the ship is Noah's Ark, and the anomaly is fire.`;

        for (const modelName of candidateModels) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: promptText,
              config: {
                systemInstruction: JUDGE_SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
              }
            });
            if (response && response.text) break;
          } catch (mErr: any) {
            console.warn(`Judge model ${modelName} unavailable (${mErr?.status || mErr?.message}), failing over...`);
          }
        }

        if (response && response.text) {
          const parsed = JSON.parse(response.text || '{}');
          const isSolved = typeof parsed.isSolved === 'boolean' ? parsed.isSolved : localEval.isSolved;
          const score = typeof parsed.score === 'number' ? parsed.score : localEval.score;
          const feedback = parsed.feedback || (effectiveLang === 'zh' ? localEval.feedbackZh : localEval.feedbackEn);

          return res.json({
            isSolved,
            score,
            feedback,
            unlockedClues: localEval.unlockedClues,
            fullTruth: isSolved ? (effectiveLang === 'zh' ? FULL_SOUP_TRUTH.bodyZh : FULL_SOUP_TRUTH.bodyEn) : null
          });
        }
      } catch (err) {
        console.error('Gemini judge error, using local fallback:', err);
      }
    }

    // Local evaluation response
    return res.json({
      isSolved: localEval.isSolved,
      score: localEval.score,
      feedback: effectiveLang === 'zh' ? localEval.feedbackZh : localEval.feedbackEn,
      unlockedClues: localEval.unlockedClues,
      fullTruth: localEval.isSolved ? (effectiveLang === 'zh' ? FULL_SOUP_TRUTH.bodyZh : FULL_SOUP_TRUTH.bodyEn) : null
    });
  } catch (err) {
    console.error('Error in /api/lucia/deduce:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint: Game info (testimonies, premise)
app.get('/api/game/info', (req: Request, res: Response) => {
  const lang = (req.query.lang as string) === 'zh' ? 'zh' : 'en';
  res.json({
    testimonies: TESTIMONIES.map(t => ({
      id: t.id,
      title: lang === 'zh' ? t.titleZh : t.titleEn,
      tag: lang === 'zh' ? t.tagZh : t.tagEn,
      content: lang === 'zh' ? t.contentZh : t.contentEn
    })),
    premise: INTRO_PREMISE[lang]
  });
});

// Set up dev / prod serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

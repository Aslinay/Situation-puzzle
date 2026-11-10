import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  checkExactOrRuleQuestion,
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
You are the Omniscient Judge for "Noah's Ark: Lucia's Testimony".
The true background:
1. Setting: Earth during the Biblical Great Deluge.
2. Lucia and the investigator are deep-sea aquatic creatures (squid/octopus-folk with six limbs) who refer to their own civilization as "humans" living underwater.
3. The giant vessel is Noah's Ark floating above the flood.
4. The "deities" are land humans (Noah and family) with 2 arms (4 fewer than Lucia's kind).
5. What Matt touched on the Ark was FIRE (which burned and severed his arm, and boiled surrounding water into steam).
6. "The sea level is dropping" is because the Great Deluge is receding, which spells doom (drying and suffocation) for the deep-sea aquatic civilization.

Evaluate the player's deduction.
Rule: The player only needs to explain clearly that Lucia and the investigator belong to an underwater/marine civilization calling themselves humans. Specific biological taxonomy (squid/octopus) can be supplemented in the reveal. If the player also identifies fire and Noah's Ark, confirm the resolution.
Respond with JSON matching:
{
  "isSolved": boolean,
  "score": number (0-100),
  "feedback": string
}
`;

// Endpoint: Ask Lucia a question (invokes the Lucia Host Skill on every query)
app.post('/api/lucia/ask', async (req: Request, res: Response) => {
  try {
    const { question, language = 'en', history = [] } = req.body;
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
  const { step = 1, language = 'en' } = req.body;
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
    const { deduction, language = 'en' } = req.body;
    if (!deduction || typeof deduction !== 'string') {
      return res.status(400).json({ error: 'Deduction text is required' });
    }

    // Deterministic evaluation
    const localEval = evaluateDeduction(deduction);

    if (ai) {
      try {
        const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.8-flash'];
        let response: any = null;
        for (const modelName of candidateModels) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: `The player submitted this deduction in ${language}:\n"""\n${deduction}\n"""\nEvaluate whether the player understands that Lucia & investigator are underwater beings calling themselves humans, that the ship is Noah's Ark, and the anomaly is fire.`,
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
          const feedback = parsed.feedback || (language === 'zh' ? localEval.feedbackZh : localEval.feedbackEn);

          return res.json({
            isSolved,
            score,
            feedback,
            unlockedClues: localEval.unlockedClues,
            fullTruth: isSolved ? (language === 'zh' ? FULL_SOUP_TRUTH.bodyZh : FULL_SOUP_TRUTH.bodyEn) : null
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
      feedback: language === 'zh' ? localEval.feedbackZh : localEval.feedbackEn,
      unlockedClues: localEval.unlockedClues,
      fullTruth: localEval.isSolved ? (language === 'zh' ? FULL_SOUP_TRUTH.bodyZh : FULL_SOUP_TRUTH.bodyEn) : null
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

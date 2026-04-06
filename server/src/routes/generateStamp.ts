import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { z } from 'zod';

export const generateStampRouter = Router();

const BodySchema = z.object({
  prompt: z.string().min(3).max(300),
  style: z.enum(['bold', 'detailed', 'minimal', 'geometric']).default('bold'),
});

const SYSTEM_PROMPT = `You are an expert SVG illustrator specialising in rubber-stamp artwork.
When given a description you must respond with ONLY a valid, self-contained SVG string and absolutely nothing else — no markdown fences, no explanation.

Requirements for the SVG:
- viewBox="0 0 100 100"
- Single-colour silhouette / stamp style using currentColor as the fill/stroke colour
- Clean, bold shapes that look good as a rubber stamp at small sizes
- No text elements
- No external references (no <image>, no xlink)
- Keep the total SVG under 3 KB`;

generateStampRouter.post('/generate-stamp', async (req: Request, res: Response) => {
  const parse = BodySchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.flatten() });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'OPENAI_API_KEY not configured on the server.' });
    return;
  }

  const { prompt, style } = parse.data;

  const userMessage = `Create a ${style} rubber-stamp SVG of: ${prompt}`;

  try {
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 1200,
    });

    let svg = completion.choices[0]?.message?.content?.trim() ?? '';

    // Strip any accidental markdown fences the model might add
    svg = svg.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

    if (!svg.startsWith('<svg')) {
      res.status(500).json({ error: 'Model did not return a valid SVG.', raw: svg });
      return;
    }

    res.json({ svg });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

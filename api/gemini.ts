import { GoogleGenAI } from '@google/genai';

type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
};

function getText(response: any): string {
  if (typeof response?.text === 'string') {
    return response.text;
  }

  const parts = response?.candidates?.flatMap((candidate: any) => candidate?.content?.parts ?? []) ?? [];
  return parts
    .map((part: any) => part?.text)
    .filter((value: unknown): value is string => typeof value === 'string')
    .join('\n');
}

function normalizeBody(body: unknown) {
  if (typeof body === 'string') {
    return JSON.parse(body);
  }
  return body ?? {};
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are supported.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing on the server.' });
  }

  try {
    const body = normalizeBody(req.body) as { action?: string; payload?: Record<string, unknown> };
    const action = body.action;
    const payload = body.payload ?? {};
    const ai = new GoogleGenAI({ apiKey });

    if (action === 'generateContent') {
      const response = await ai.models.generateContent(payload as any);
      return res.status(200).json({
        text: getText(response),
        candidates: response.candidates ?? [],
        usageMetadata: response.usageMetadata ?? null,
      });
    }

    if (action === 'generateImages') {
      const response = await ai.models.generateImages(payload as any);
      return res.status(200).json({
        generatedImages: response.generatedImages ?? [],
      });
    }

    return res.status(400).json({ error: `Unsupported Gemini action: ${String(action)}` });
  } catch (error) {
    console.error('Gemini proxy error:', error);
    const message = error instanceof Error ? error.message : 'Unknown Gemini error';
    return res.status(500).json({ error: message });
  }
}

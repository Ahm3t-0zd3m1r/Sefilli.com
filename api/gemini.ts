import { GoogleGenAI } from '@google/genai';

type VercelRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
};

const ALLOWED_ACTIONS = new Set(['generateContent', 'generateImages']);
const MAX_BODY_LENGTH = 20000;

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
    if (body.length > MAX_BODY_LENGTH) {
      throw new Error('Request body is too large.');
    }
    return JSON.parse(body);
  }
  return body ?? {};
}

function setSecurityHeaders(res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
}

function isAllowedOrigin(origin: string | undefined) {
  if (!origin) return true;

  return [
    /^https:\/\/([a-z0-9-]+\.)?vercel\.app$/i,
    /^https:\/\/([a-z0-9-]+\.)?sefilli\.com$/i,
    /^http:\/\/localhost:\d+$/i,
    /^http:\/\/127\.0\.0\.1:\d+$/i,
  ].some((pattern) => pattern.test(origin));
}

function getOrigin(req: VercelRequest) {
  const header = req.headers?.origin;
  return Array.isArray(header) ? header[0] : header;
}

function getContentType(req: VercelRequest) {
  const header = req.headers?.['content-type'];
  return Array.isArray(header) ? header[0] : header;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);

  const origin = getOrigin(req);
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are supported.' });
  }

  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Origin is not allowed.' });
  }

  const contentType = getContentType(req);
  if (contentType && !contentType.includes('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing on the server.' });
  }

  try {
    const body = normalizeBody(req.body) as { action?: string; payload?: Record<string, unknown> };
    const action = body.action;
    const payload = body.payload ?? {};

    if (!action || !ALLOWED_ACTIONS.has(action)) {
      return res.status(400).json({ error: 'Unsupported Gemini action.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    if (action === 'generateContent') {
      const response = await ai.models.generateContent(payload as any);
      return res.status(200).json({
        text: getText(response),
        candidates: response.candidates ?? [],
        usageMetadata: response.usageMetadata ?? null,
      });
    }

    const response = await ai.models.generateImages(payload as any);
    return res.status(200).json({
      generatedImages: response.generatedImages ?? [],
    });
  } catch (error) {
    console.error('Gemini proxy error:', error);
    const message = error instanceof Error ? error.message : 'Unknown Gemini error';
    return res.status(500).json({ error: message || 'Gemini request failed.' });
  }
}

type GenerateContentPayload = Record<string, unknown>;
type GenerateImagesPayload = Record<string, unknown>;

type GenerateContentResult = {
  text: string;
  candidates?: unknown[];
  usageMetadata?: unknown;
};

type GenerateImagesResult = {
  generatedImages?: unknown[];
};

async function callGemini<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, payload }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'Gemini istegi basarisiz oldu.';
    throw new Error(message);
  }

  return data as T;
}

export const Modality = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  AUDIO: 'AUDIO',
  VIDEO: 'VIDEO',
} as const;

export const Type = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  INTEGER: 'INTEGER',
  BOOLEAN: 'BOOLEAN',
  ARRAY: 'ARRAY',
  OBJECT: 'OBJECT',
} as const;

export class GoogleGenAI {
  constructor(_: { apiKey?: string } = {}) {}

  models = {
    generateContent: (payload: GenerateContentPayload) => callGemini<GenerateContentResult>('generateContent', payload),
    generateImages: (payload: GenerateImagesPayload) => callGemini<GenerateImagesResult>('generateImages', payload),
  };
}

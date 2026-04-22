import { GoogleGenerativeAI } from "@google/generative-ai";

let _genAI: GoogleGenerativeAI | null = null;

export function genAI() {
  if (_genAI) return _genAI;
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY");
  _genAI = new GoogleGenerativeAI(key);
  return _genAI;
}

export const MODEL_ID = "gemini-3-flash-preview";

// gemini-2.5-flash is a thinking model — it consumes tokens on internal
// reasoning BEFORE any visible output. We pass generous token budgets so
// the response has headroom, and set thinkingConfig.thinkingBudget=0 where
// supported so flash returns immediately.
export function flashModel(temperature = 0.9) {
  return genAI().getGenerativeModel({
    model: MODEL_ID,
    generationConfig: {
      temperature,
      topP: 0.95,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      // @ts-expect-error — thinkingConfig is newer than the SDK's typings
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
}

export function moderationModel() {
  return genAI().getGenerativeModel({
    model: MODEL_ID,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
      // @ts-expect-error — thinkingConfig is newer than the SDK's typings
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
}

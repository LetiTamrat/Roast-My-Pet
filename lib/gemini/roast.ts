import { z } from "zod";
import { flashModel, MODEL_ID } from "./client";
import { ROAST_SYSTEM_PROMPT, roastUserPrompt } from "./prompts";
import { ARCHETYPES, findArchetype } from "../archetypes";
import type { RoastLevel, RoastStyle } from "../supabase/types";

const RoastSchema = z.object({
  roast: z.string().min(1).max(500),
  archetype: z.string().min(1),
  archetype_emoji: z.string().min(1),
  vibe_tags: z.array(z.string()).min(1).max(6),
  follow_up_zinger: z.string().min(1).max(200),
  visual_observation: z.string().min(1).max(400),
});

export type RoastResult = z.infer<typeof RoastSchema> & {
  model_used: string;
};

export class GenerationError extends Error {
  code = "GENERATION_FAILED" as const;
  constructor(message: string) {
    super(message);
  }
}

function tryParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new GenerationError("Model returned non-JSON output.");
  }
}

function normalize(raw: z.infer<typeof RoastSchema>): z.infer<typeof RoastSchema> {
  const match = findArchetype(raw.archetype);
  if (match) {
    return {
      ...raw,
      archetype: match.name,
      archetype_emoji: match.emoji,
    };
  }
  // Fallback: pick the first archetype
  const fallback = ARCHETYPES[0];
  return {
    ...raw,
    archetype: fallback.name,
    archetype_emoji: fallback.emoji,
  };
}

async function callOnce(args: {
  temperature: number;
  userPrompt: string;
  imageBase64: string;
  mimeType: string;
}): Promise<RoastResult> {
  const model = flashModel(args.temperature);
  const result = await model.generateContent([
    { text: ROAST_SYSTEM_PROMPT },
    { text: args.userPrompt },
    { inlineData: { data: args.imageBase64, mimeType: args.mimeType } },
  ]);
  const text = result.response.text();
  const parsed = tryParse(text);
  const validated = RoastSchema.parse(parsed);
  const normalized = normalize(validated);
  return { ...normalized, model_used: MODEL_ID };
}

export async function generateRoast(input: {
  imageBase64: string;
  mimeType: string;
  petName: string;
  petType: string | null;
  traits: string[];
  level: RoastLevel;
  style: RoastStyle;
}): Promise<RoastResult> {
  const userPrompt = roastUserPrompt({
    name: input.petName,
    type: input.petType,
    traits: input.traits,
    level: input.level,
    style: input.style,
  });

  try {
    return await callOnce({
      temperature: 0.9,
      userPrompt,
      imageBase64: input.imageBase64,
      mimeType: input.mimeType,
    });
  } catch (err) {
    try {
      return await callOnce({
        temperature: 0.7,
        userPrompt,
        imageBase64: input.imageBase64,
        mimeType: input.mimeType,
      });
    } catch (err2) {
      throw new GenerationError(
        err2 instanceof Error ? err2.message : "Roast generation failed"
      );
    }
  }
}

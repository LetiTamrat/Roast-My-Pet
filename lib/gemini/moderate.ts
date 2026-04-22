import { z } from "zod";
import { moderationModel } from "./client";
import { MODERATION_PROMPT } from "./prompts";

const ModerationResult = z.object({
  is_pet: z.boolean(),
  pet_type: z
    .enum(["dog", "cat", "bird", "rabbit", "reptile", "exotic", "other"])
    .nullable()
    .optional(),
  is_appropriate: z.boolean(),
  image_quality: z.enum(["good", "blurry", "too_dark", "too_small"]).optional(),
  reject_reason: z.string().nullable().optional(),
});

export type ModerationResult = z.infer<typeof ModerationResult>;

export class ModerationError extends Error {
  code: "NO_PET_DETECTED" | "INAPPROPRIATE_IMAGE" | "IMAGE_FETCH_FAILED";
  constructor(
    code: "NO_PET_DETECTED" | "INAPPROPRIATE_IMAGE" | "IMAGE_FETCH_FAILED",
    message: string
  ) {
    super(message);
    this.code = code;
  }
}

export async function moderateImage(input: {
  imageBase64: string;
  mimeType: string;
}): Promise<ModerationResult> {
  const model = moderationModel();
  const result = await model.generateContent([
    { text: MODERATION_PROMPT },
    { inlineData: { data: input.imageBase64, mimeType: input.mimeType } },
  ]);
  let text = "";
  try {
    text = (result.response.text() || "").trim();
  } catch (e) {
    console.error("[moderate] response.text() threw:", e);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        parsed = JSON.parse(text.slice(firstBrace, lastBrace + 1));
      } catch {
        throw new ModerationError(
          "NO_PET_DETECTED",
          "Could not read the image. Try another photo."
        );
      }
    } else {
      throw new ModerationError(
        "NO_PET_DETECTED",
        "Could not read the image. Try another photo."
      );
    }
  }

  const validated = ModerationResult.parse(parsed);

  if (!validated.is_appropriate) {
    throw new ModerationError(
      "INAPPROPRIATE_IMAGE",
      validated.reject_reason || "That image isn't something we can work with."
    );
  }
  if (!validated.is_pet) {
    throw new ModerationError(
      "NO_PET_DETECTED",
      validated.reject_reason || "We couldn't find a pet in that photo. Try another one."
    );
  }
  return validated;
}

import Anthropic from "@anthropic-ai/sdk";

import { SYSTEM_PROMPT, PREDICTIONS_SYSTEM_PROMPT } from "./prompts";
import type {
  RecommendationInput,
  RecommendationOutput,
  PredictionInput,
  PredictionOutput,
} from "./types";

const MODEL = "claude-haiku-4-5-20251001";

export async function generateRecommendation(
  input: RecommendationInput
): Promise<RecommendationOutput> {
  const client = new Anthropic();

  const userMessage = buildUserMessage(input);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const rawText =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in AI response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as RecommendationOutput;
  return parsed;
}

function buildUserMessage(input: RecommendationInput): string {
  const parts: string[] = [
    `Child: ${input.childName}, ${input.ageMonths} months old`,
    `Category: ${formatCategory(input.category)}`,
    "",
    "Logged milestones:",
  ];

  if (input.loggedMilestones.length === 0) {
    parts.push("  (none logged yet)");
  } else {
    for (const m of input.loggedMilestones) {
      parts.push(`  - ${m.name}: ${m.status}${m.observedDate ? ` (observed ${m.observedDate})` : ""}`);
    }
  }

  if (input.category === "language" && input.wordCount !== undefined) {
    parts.push("");
    parts.push(`Word count: ${input.wordCount} words, ${input.phraseCount ?? 0} phrases`);
  }

  parts.push("");
  parts.push(
    "Please provide personalized recommendations based on this child's current developmental status."
  );

  return parts.join("\n");
}

function formatCategory(category: string): string {
  const labels: Record<string, string> = {
    language: "Language Development",
    gross_motor: "Gross Motor Skills",
    fine_motor: "Fine Motor Skills",
    general: "General Development",
  };
  return labels[category] || category;
}

export async function generatePredictions(
  input: PredictionInput
): Promise<PredictionOutput> {
  const client = new Anthropic();

  const userMessage = buildPredictionMessage(input);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: PREDICTIONS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON object from response, handling code fences and trailing text
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in AI response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as PredictionOutput;
  return parsed;
}

function buildPredictionMessage(input: PredictionInput): string {
  const parts: string[] = [
    `Child: ${input.childName}, ${input.ageMonths} months old`,
    "",
    "Current milestones by category:",
  ];

  const byCategory: Record<string, typeof input.milestones> = {};
  for (const m of input.milestones) {
    if (!byCategory[m.category]) byCategory[m.category] = [];
    byCategory[m.category].push(m);
  }

  for (const [cat, items] of Object.entries(byCategory)) {
    parts.push(`\n${formatCategory(cat)}:`);
    for (const m of items) {
      parts.push(`  - ${m.name}: ${m.status}`);
    }
  }

  if (input.milestones.length === 0) {
    parts.push("  (no milestones logged yet)");
  }

  parts.push("");
  parts.push(`Language stats: ${input.wordCount} words, ${input.phraseCount} phrases`);
  parts.push("");
  parts.push("Based on this child's current development, predict what milestones are likely coming next across all three categories (language, gross motor, fine motor).");

  return parts.join("\n");
}

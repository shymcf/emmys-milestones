import Anthropic from "@anthropic-ai/sdk";

import { SYSTEM_PROMPT } from "./prompts";
import type { RecommendationInput, RecommendationOutput } from "./types";

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

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const parsed = JSON.parse(text) as RecommendationOutput;
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

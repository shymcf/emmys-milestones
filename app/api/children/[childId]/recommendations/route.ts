import { NextRequest, NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { children, milestones, wordLogs, recommendations } from "@/lib/db/schema";
import { getAgeInMonths } from "@/lib/utils";
import { generateRecommendation } from "@/lib/ai/client";
import type { RecommendationInput } from "@/lib/ai/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { childId } = await params;

  const [child] = await db
    .select()
    .from(children)
    .where(eq(children.id, childId))
    .limit(1);

  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.childId, childId))
    .orderBy(desc(recommendations.generatedAt));

  return NextResponse.json({ data: result });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { childId } = await params;

  const [child] = await db
    .select()
    .from(children)
    .where(eq(children.id, childId))
    .limit(1);

  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const category = (body.category as string) || "general";

    const ageMonths = getAgeInMonths(child.dateOfBirth);

    // Gather milestone data
    const childMilestones = await db
      .select()
      .from(milestones)
      .where(
        category === "general"
          ? eq(milestones.childId, childId)
          : and(
              eq(milestones.childId, childId),
              eq(milestones.category, category)
            )
      );

    // Word stats for language
    let wordCount = 0;
    let phraseCount = 0;
    if (category === "language" || category === "general") {
      const wordEntries = await db
        .select()
        .from(wordLogs)
        .where(eq(wordLogs.childId, childId));
      wordCount = wordEntries.filter((w) => !w.isPhrase).length;
      phraseCount = wordEntries.filter((w) => w.isPhrase).length;
    }

    const input: RecommendationInput = {
      ageMonths,
      childName: child.name,
      category,
      loggedMilestones: childMilestones.map((m) => ({
        name: m.name,
        status: m.status,
        observedDate: m.observedDate,
      })),
      wordCount,
      phraseCount,
    };

    const output = await generateRecommendation(input);

    // Store each recommendation
    const stored = [];
    for (const rec of output.recommendations) {
      const result = await db
        .insert(recommendations)
        .values({
          childId,
          category,
          content: JSON.stringify(rec),
          contextSnapshot: JSON.stringify(input),
        })
        .returning();
      stored.push(result[0]);
    }

    return NextResponse.json({ data: { recommendations: output.recommendations, stored } });
  } catch (error) {
    console.error("Recommendation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

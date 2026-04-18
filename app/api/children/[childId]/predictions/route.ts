import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { children, milestones, wordLogs } from "@/lib/db/schema";
import { getAgeInMonths } from "@/lib/utils";
import { generatePredictions } from "@/lib/ai/client";
import type { PredictionInput } from "@/lib/ai/types";

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

  try {
    const ageMonths = getAgeInMonths(child.dateOfBirth);

    const childMilestones = await db
      .select({
        category: milestones.category,
        name: milestones.name,
        status: milestones.status,
      })
      .from(milestones)
      .where(eq(milestones.childId, childId));

    const wordEntries = await db
      .select()
      .from(wordLogs)
      .where(eq(wordLogs.childId, childId));

    const wordCount = wordEntries.filter((w) => !w.isPhrase).length;
    const phraseCount = wordEntries.filter((w) => w.isPhrase).length;

    const input: PredictionInput = {
      ageMonths,
      childName: child.name,
      milestones: childMilestones,
      wordCount,
      phraseCount,
    };

    const output = await generatePredictions(input);

    return NextResponse.json({ data: output.predictions });
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json(
      { error: "Failed to generate predictions" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { children, milestones, wordLogs } from "@/lib/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { childId } = await params;

  const child = await db
    .select()
    .from(children)
    .where(eq(children.id, childId))
    .get();

  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const categoryFilter = request.nextUrl.searchParams.get("category");

  const allMilestones = await db
    .select()
    .from(milestones)
    .where(eq(milestones.childId, childId));

  const allWords = await db
    .select()
    .from(wordLogs)
    .where(eq(wordLogs.childId, childId));

  interface TimelineEntry {
    type: string;
    name: string;
    category: string;
    date: string;
    status?: string;
    isPhrase?: boolean;
  }

  let entries: TimelineEntry[] = [
    ...allMilestones
      .filter((m) => m.status !== "not_yet")
      .map((m) => ({
        type: "milestone",
        name: m.name,
        category: m.category,
        date: m.observedDate || "",
        status: m.status,
      })),
    ...allWords.map((w) => ({
      type: "word",
      name: w.word,
      category: "language",
      date: w.observedDate,
      isPhrase: w.isPhrase,
    })),
  ];

  if (categoryFilter) {
    entries = entries.filter((e) => e.category === categoryFilter);
  }

  entries.sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({ data: entries });
}

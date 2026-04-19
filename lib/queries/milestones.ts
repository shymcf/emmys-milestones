import { eq, desc, sql, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { milestones, wordLogs } from "@/lib/db/schema";

export interface CategorySummary {
  category: string;
  total: number;
  consistently: number;
  sometimes: number;
  notYet: number;
}

export async function getMilestonesByCategory(
  childId: string
): Promise<CategorySummary[]> {
  const rows = await db
    .select({
      category: milestones.category,
      status: milestones.status,
      count: sql<number>`count(*)::int`,
    })
    .from(milestones)
    .where(eq(milestones.childId, childId))
    .groupBy(milestones.category, milestones.status);

  const grouped: Record<string, CategorySummary> = {};

  for (const row of rows) {
    if (!grouped[row.category]) {
      grouped[row.category] = {
        category: row.category,
        total: 0,
        consistently: 0,
        sometimes: 0,
        notYet: 0,
      };
    }
    const g = grouped[row.category];
    g.total += row.count;
    if (row.status === "consistently") g.consistently += row.count;
    else if (row.status === "sometimes") g.sometimes += row.count;
    else g.notYet += row.count;
  }

  return Object.values(grouped);
}

export async function getWordStats(childId: string) {
  const [words] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(wordLogs)
    .where(
      and(
        eq(wordLogs.childId, childId),
        eq(wordLogs.type, "word"),
        eq(wordLogs.isPhrase, false)
      )
    )
    .limit(1);

  const [phrases] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(wordLogs)
    .where(
      and(
        eq(wordLogs.childId, childId),
        eq(wordLogs.type, "word"),
        eq(wordLogs.isPhrase, true)
      )
    )
    .limit(1);

  const [gestures] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(wordLogs)
    .where(and(eq(wordLogs.childId, childId), eq(wordLogs.type, "gesture")))
    .limit(1);

  return {
    wordCount: words?.count ?? 0,
    phraseCount: phrases?.count ?? 0,
    gestureCount: gestures?.count ?? 0,
  };
}

export interface RecentEntry {
  type: "milestone" | "word";
  name: string;
  category: string;
  date: string;
}

export async function getRecentActivity(
  childId: string,
  limit = 5
): Promise<RecentEntry[]> {
  const recentMilestones = await db
    .select({
      name: milestones.name,
      category: milestones.category,
      date: milestones.observedDate,
    })
    .from(milestones)
    .where(eq(milestones.childId, childId))
    .orderBy(desc(milestones.createdAt))
    .limit(limit);

  const recentWords = await db
    .select({
      word: wordLogs.word,
      isPhrase: wordLogs.isPhrase,
      date: wordLogs.observedDate,
    })
    .from(wordLogs)
    .where(eq(wordLogs.childId, childId))
    .orderBy(desc(wordLogs.createdAt))
    .limit(limit);

  const entries: RecentEntry[] = [
    ...recentMilestones.map((m) => ({
      type: "milestone" as const,
      name: m.name,
      category: m.category,
      date: m.date || "",
    })),
    ...recentWords.map((w) => ({
      type: "word" as const,
      name: w.isPhrase ? `Said "${w.word}"` : `Said "${w.word}"`,
      category: "language",
      date: w.date,
    })),
  ];

  entries.sort((a, b) => b.date.localeCompare(a.date));
  return entries.slice(0, limit);
}

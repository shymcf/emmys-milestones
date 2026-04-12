import Link from "next/link";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { formatAge } from "@/lib/utils";
import {
  getMilestonesByCategory,
  getWordStats,
  getRecentActivity,
} from "@/lib/queries/milestones";
import { BottomNav } from "@/components/bottom-nav";

const categoryMeta: Record<
  string,
  { label: string; dotClass: string }
> = {
  language: { label: "Language", dotClass: "bg-lang" },
  gross_motor: { label: "Gross Motor", dotClass: "bg-gross" },
  fine_motor: { label: "Fine Motor", dotClass: "bg-fine" },
};

export default async function DashboardPage() {
  const session = await auth();

  const childList = await db
    .select()
    .from(children)
    .where(eq(children.userId, session!.user!.id!));

  const child = childList[0];

  if (!child) {
    return (
      <main className="min-h-dvh px-6 py-8">
        <div className="mx-auto max-w-sm">
          <div className="text-center mb-8">
            <p className="font-[family-name:var(--font-heading)] text-4xl text-terracotta">
              totter
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-sand-light bg-warm-white p-6 shadow-[var(--shadow-card)] text-center">
            <p className="text-olive-dark font-medium mb-2">
              No child profile yet
            </p>
            <p className="text-olive-muted text-sm mb-4">
              Add your child to start tracking milestones.
            </p>
            <Link
              href="/children/new"
              className="inline-block rounded-[var(--radius-button)] bg-terracotta px-6 py-3 font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-200 hover:bg-terracotta-dark cursor-pointer"
            >
              Add child
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const [categories, wordStats, recentActivity] = await Promise.all([
    getMilestonesByCategory(child.id),
    getWordStats(child.id),
    getRecentActivity(child.id),
  ]);

  const categorySummaries = categories.reduce(
    (acc, c) => {
      acc[c.category] = c;
      return acc;
    },
    {} as Record<string, (typeof categories)[0]>
  );

  return (
    <main className="min-h-dvh px-6 pt-8 pb-24">
      <div className="mx-auto max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="font-[family-name:var(--font-heading)] text-sm text-terracotta tracking-wide">
            totter
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl text-olive-dark mt-1">
            {child.name}
          </h1>
          <p className="text-olive-muted text-sm mt-1">
            {formatAge(child.dateOfBirth)}
          </p>
        </div>

        {/* Category cards */}
        <div className="flex flex-col gap-3">
          {/* Language card */}
          <Link
            href={`/children/${child.id}/language`}
            className="block rounded-[var(--radius-card)] border border-sand-light bg-warm-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:translate-y-[-2px] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-lang-bg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4d7c0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="font-semibold text-olive-dark">Language</span>
              </div>
              <span className="text-olive-light text-xl">&#8250;</span>
            </div>
            <p className="text-sm text-olive-muted ml-12">
              {wordStats.wordCount} word{wordStats.wordCount !== 1 ? "s" : ""}
              {wordStats.phraseCount > 0 && ` · ${wordStats.phraseCount} phrase${wordStats.phraseCount !== 1 ? "s" : ""}`}
            </p>
            {categorySummaries.language && (
              <div className="ml-12 mt-2">
                <div className="h-1.5 rounded-full bg-sand-light overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-lang-bg to-lang"
                    style={{ width: `${Math.round((categorySummaries.language.consistently / Math.max(categorySummaries.language.total, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </Link>

          {/* Gross Motor card */}
          <Link
            href={`/children/${child.id}/motor/gross_motor`}
            className="block rounded-[var(--radius-card)] border border-sand-light bg-warm-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:translate-y-[-2px] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-gross-bg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a5535" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="5" r="3" />
                    <path d="M6.5 8a2 2 0 0 0-1.9 1.3L2 15h5l.5 6h9l.5-6h5l-2.6-5.7A2 2 0 0 0 17.5 8z" />
                  </svg>
                </div>
                <span className="font-semibold text-olive-dark">Gross Motor</span>
              </div>
              <span className="text-olive-light text-xl">&#8250;</span>
            </div>
            <p className="text-sm text-olive-muted ml-12">
              {categorySummaries.gross_motor ? `${categorySummaries.gross_motor.consistently} achieved` : "No milestones yet"}
            </p>
            {categorySummaries.gross_motor && (
              <div className="ml-12 mt-2">
                <div className="h-1.5 rounded-full bg-sand-light overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gross-bg to-gross"
                    style={{ width: `${Math.round((categorySummaries.gross_motor.consistently / Math.max(categorySummaries.gross_motor.total, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </Link>

          {/* Fine Motor card */}
          <Link
            href={`/children/${child.id}/motor/fine_motor`}
            className="block rounded-[var(--radius-card)] border border-sand-light bg-warm-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:translate-y-[-2px] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-fine-bg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
                    <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
                    <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.7-2.4L3.1 17a2 2 0 0 1 3-2.5" />
                  </svg>
                </div>
                <span className="font-semibold text-olive-dark">Fine Motor</span>
              </div>
              <span className="text-olive-light text-xl">&#8250;</span>
            </div>
            <p className="text-sm text-olive-muted ml-12">
              {categorySummaries.fine_motor ? `${categorySummaries.fine_motor.consistently} achieved` : "No milestones yet"}
            </p>
            {categorySummaries.fine_motor && (
              <div className="ml-12 mt-2">
                <div className="h-1.5 rounded-full bg-sand-light overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-fine-bg to-fine"
                    style={{ width: `${Math.round((categorySummaries.fine_motor.consistently / Math.max(categorySummaries.fine_motor.total, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-5">
          <Link
            href={`/children/${child.id}/language`}
            className="flex-1 rounded-[var(--radius-button)] bg-terracotta px-4 py-4 text-center font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-200 hover:bg-terracotta-dark cursor-pointer min-h-[52px]"
          >
            + Log
          </Link>
          <Link
            href={`/children/${child.id}/recommendations`}
            className="flex-1 rounded-[var(--radius-button)] border-2 border-sand-light bg-warm-white px-4 py-4 text-center font-semibold text-terracotta transition-all duration-200 hover:bg-terracotta-light cursor-pointer min-h-[52px]"
          >
            Get Tips
          </Link>
        </div>

        {/* Recent activity */}
        {recentActivity.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-bold text-olive-light uppercase tracking-wider mb-3">
              Recent
            </h2>
            <div className="flex flex-col">
              {recentActivity.map((entry, i) => {
                const meta = categoryMeta[entry.category];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-3 border-b border-sand-light last:border-0"
                  >
                    <div className={`w-2 h-2 rounded-full ${meta?.dotClass || "bg-olive-light"}`} />
                    <span className="flex-1 text-sm text-olive-dark">{entry.name}</span>
                    <span className="text-xs text-olive-muted">
                      {entry.date
                        ? new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BottomNav childId={child.id} />
    </main>
  );
}

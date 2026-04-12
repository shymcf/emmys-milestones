"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { BottomNav } from "@/components/bottom-nav";

interface TimelineEntry {
  type: string;
  name: string;
  category: string;
  date: string;
  status?: string;
  isPhrase?: boolean;
}

const categoryLabels: Record<string, string> = {
  language: "Language",
  gross_motor: "Gross Motor",
  fine_motor: "Fine Motor",
};

const categoryDot: Record<string, string> = {
  language: "bg-lang",
  gross_motor: "bg-gross",
  fine_motor: "bg-fine",
};

const categoryBadge: Record<string, string> = {
  language: "bg-lang-bg text-lang",
  gross_motor: "bg-gross-bg text-gross",
  fine_motor: "bg-fine-bg text-fine",
};

export default function TimelinePage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchTimeline();
  }, [childId, filter]);

  async function fetchTimeline() {
    setLoading(true);
    const url = filter
      ? `/api/children/${childId}/timeline?category=${filter}`
      : `/api/children/${childId}/timeline`;
    const res = await fetch(url);
    const data = await res.json();
    setEntries(data.data);
    setLoading(false);
  }

  // Group by month
  const grouped = entries.reduce(
    (acc, e) => {
      const month = e.date ? e.date.slice(0, 7) : "unknown";
      if (!acc[month]) acc[month] = [];
      acc[month].push(e);
      return acc;
    },
    {} as Record<string, TimelineEntry[]>
  );

  const sortedMonths = Object.keys(grouped).sort().reverse();

  return (
    <main className="min-h-dvh px-6 pt-8 pb-24">
      <div className="mx-auto max-w-sm">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-olive-muted hover:text-olive-dark cursor-pointer mb-1"
          >
            &#8249; Dashboard
          </button>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl text-olive-dark">
            Timeline
          </h1>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer min-h-[36px] ${
              filter === null
                ? "bg-terracotta text-white"
                : "bg-sand-light text-olive-muted hover:bg-sand"
            }`}
          >
            All
          </button>
          {["language", "gross_motor", "fine_motor"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer min-h-[36px] ${
                filter === cat
                  ? "bg-terracotta text-white"
                  : "bg-sand-light text-olive-muted hover:bg-sand"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {loading ? (
          <p className="text-olive-muted text-center">Loading...</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-olive-muted">No milestones recorded yet.</p>
          </div>
        ) : (
          sortedMonths.map((month) => {
            const monthDate = month !== "unknown" ? new Date(month + "-01T00:00:00") : null;
            const monthLabel = monthDate
              ? monthDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "Unknown date";

            return (
              <div key={month} className="mb-6">
                <h3 className="text-xs font-bold text-olive-light uppercase tracking-wider mb-3">
                  {monthLabel}
                </h3>
                {grouped[month].map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 relative">
                    {/* Dot + line */}
                    <div className="flex flex-col items-center pt-1.5">
                      <div
                        className={`w-3 h-3 rounded-full ${categoryDot[entry.category] || "bg-olive-light"}`}
                      />
                      {i < grouped[month].length - 1 && (
                        <div className="w-0.5 flex-1 bg-sand-light mt-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <p className="text-sm font-medium text-olive-dark">
                        {entry.type === "word"
                          ? `Said "${entry.name}"${entry.isPhrase ? " (phrase)" : ""}`
                          : entry.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${categoryBadge[entry.category] || "bg-sand-light text-olive-muted"}`}
                        >
                          {categoryLabels[entry.category] || entry.category}
                        </span>
                        <span className="text-[10px] text-olive-muted">
                          {entry.date
                            ? new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      <BottomNav childId={childId} />
    </main>
  );
}

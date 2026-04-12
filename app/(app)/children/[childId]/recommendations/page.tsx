"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { BottomNav } from "@/components/bottom-nav";

interface Recommendation {
  title: string;
  description: string;
  activities: string[];
}

interface StoredRecommendation {
  id: string;
  category: string;
  content: string;
  generatedAt: number;
}

const categoryLabels: Record<string, string> = {
  language: "Language",
  gross_motor: "Gross Motor",
  fine_motor: "Fine Motor",
  general: "General",
};

const categoryBorder: Record<string, string> = {
  language: "border-l-lang",
  gross_motor: "border-l-gross",
  fine_motor: "border-l-fine",
  general: "border-l-terracotta",
};

export default function RecommendationsPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  const [stored, setStored] = useState<StoredRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [freshRecs, setFreshRecs] = useState<Recommendation[]>([]);

  useEffect(() => {
    fetchStored();
  }, [childId]);

  async function fetchStored() {
    const res = await fetch(`/api/children/${childId}/recommendations`);
    const data = await res.json();
    setStored(data.data);
    setLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    setFreshRecs([]);

    const res = await fetch(`/api/children/${childId}/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: selectedCategory }),
    });

    if (res.ok) {
      const data = await res.json();
      setFreshRecs(data.data.recommendations);
      await fetchStored();
    }

    setGenerating(false);
  }

  const parsedStored: (Recommendation & { category: string; date: Date })[] =
    stored.map((s) => {
      const parsed = JSON.parse(s.content) as Recommendation;
      return {
        ...parsed,
        category: s.category,
        date: new Date(s.generatedAt),
      };
    });

  return (
    <main className="min-h-dvh px-6 pt-8 pb-24">
      <div className="mx-auto max-w-sm">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-olive-muted hover:text-olive-dark cursor-pointer mb-1"
          >
            &#8249; Dashboard
          </button>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl text-olive-dark">
            Tips & Recommendations
          </h1>
        </div>

        {/* Generate new */}
        <div className="rounded-[var(--radius-card)] border border-sand-light bg-warm-white p-5 shadow-[var(--shadow-card)] mb-6">
          <p className="text-sm text-olive-muted mb-3">
            Get personalized tips based on your child&apos;s progress:
          </p>

          <div className="flex gap-2 mb-3 flex-wrap">
            {["general", "language", "gross_motor", "fine_motor"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer min-h-[36px] ${
                  selectedCategory === cat
                    ? "bg-terracotta text-white"
                    : "bg-sand-light text-olive-muted hover:bg-sand"
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full rounded-[var(--radius-button)] bg-terracotta px-4 py-4 font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-200 hover:bg-terracotta-dark disabled:opacity-50 cursor-pointer min-h-[52px]"
          >
            {generating ? "Thinking..." : "Get recommendations"}
          </button>
        </div>

        {/* Fresh recommendations */}
        {freshRecs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-olive-light uppercase tracking-wider mb-3">
              New Recommendations
            </h2>
            {freshRecs.map((rec, i) => (
              <div
                key={i}
                className={`rounded-[var(--radius-card)] border border-sand-light border-l-4 ${categoryBorder[selectedCategory] || "border-l-terracotta"} bg-warm-white p-5 shadow-[var(--shadow-card)] mb-3`}
              >
                <h3 className="font-semibold text-olive-dark mb-1">
                  {rec.title}
                </h3>
                <p className="text-sm text-olive-muted mb-3">
                  {rec.description}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {rec.activities.map((activity, j) => (
                    <li
                      key={j}
                      className="text-sm text-olive-dark flex items-start gap-2"
                    >
                      <span className="text-terracotta mt-0.5">*</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Past recommendations */}
        {loading ? (
          <p className="text-olive-muted text-center">Loading...</p>
        ) : parsedStored.length > 0 ? (
          <div>
            <h2 className="text-xs font-bold text-olive-light uppercase tracking-wider mb-3">
              Past Recommendations
            </h2>
            {parsedStored.map((rec, i) => (
              <div
                key={i}
                className={`rounded-[var(--radius-card)] border border-sand-light border-l-4 ${categoryBorder[rec.category] || "border-l-terracotta"} bg-warm-white p-5 shadow-[var(--shadow-card)] mb-3`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-olive-dark">{rec.title}</h3>
                  <span className="text-[10px] text-olive-muted">
                    {categoryLabels[rec.category]}
                  </span>
                </div>
                <p className="text-sm text-olive-muted mb-3">
                  {rec.description}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {rec.activities.map((activity, j) => (
                    <li
                      key={j}
                      className="text-sm text-olive-dark flex items-start gap-2"
                    >
                      <span className="text-terracotta mt-0.5">*</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-olive-muted text-sm">
              No recommendations yet. Tap the button above to get started.
            </p>
          </div>
        )}
      </div>

      <BottomNav childId={childId} />
    </main>
  );
}

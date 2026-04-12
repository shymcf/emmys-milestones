"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { BottomNav } from "@/components/bottom-nav";

interface MilestoneRecord {
  name: string;
  status: string;
}

const statusOptions = ["not_yet", "sometimes", "consistently"] as const;

const statusLabels: Record<string, string> = {
  not_yet: "Not yet",
  sometimes: "Sometimes",
  consistently: "Consistently",
};

const statusColors: Record<string, string> = {
  not_yet: "bg-sand-light text-olive-muted",
  sometimes: "bg-sand text-olive-dark",
  consistently: "bg-terracotta text-white",
};

const categoryLabels: Record<string, string> = {
  gross_motor: "Gross Motor",
  fine_motor: "Fine Motor",
};

export default function MotorCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;
  const category = params.category as string;

  const [checklist, setChecklist] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Fetch existing milestones
      const res = await fetch(
        `/api/children/${childId}/milestones?category=${category}`
      );
      const data = await res.json();

      const existing: Record<string, string> = {};
      for (const m of data.data as MilestoneRecord[]) {
        existing[m.name] = m.status;
      }

      // Fetch checklist items from the quiz questions to infer what markers exist
      // We'll use all known markers for this category
      const allNames = new Set<string>();
      for (const m of data.data as MilestoneRecord[]) {
        allNames.add(m.name);
      }

      // Also fetch the full checklist from the API
      const checklistRes = await fetch(
        `/api/children/${childId}/milestones/checklist?category=${category}`
      );
      if (checklistRes.ok) {
        const checklistData = await checklistRes.json();
        for (const name of checklistData.data) {
          allNames.add(name);
        }
      }

      setChecklist(Array.from(allNames));
      setStatuses(existing);
      setLoading(false);
    }
    load();
  }, [childId, category]);

  async function toggleStatus(name: string) {
    const current = statuses[name] || "not_yet";
    const currentIdx = statusOptions.indexOf(
      current as (typeof statusOptions)[number]
    );
    const nextStatus = statusOptions[(currentIdx + 1) % statusOptions.length];

    setStatuses((prev) => ({ ...prev, [name]: nextStatus }));

    await fetch(`/api/children/${childId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, status: nextStatus }),
    });
  }

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
            {categoryLabels[category] || category}
          </h1>
          <p className="text-olive-muted text-sm mt-1">
            Tap to cycle: Not yet → Sometimes → Consistently
          </p>
        </div>

        {/* Switch between gross/fine */}
        <div className="flex gap-2 mb-6">
          {["gross_motor", "fine_motor"].map((cat) => (
            <button
              key={cat}
              onClick={() =>
                router.push(`/children/${childId}/motor/${cat}`)
              }
              className={`flex-1 rounded-[var(--radius-input)] px-4 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[44px] ${
                category === cat
                  ? "bg-terracotta text-white"
                  : "bg-sand-light text-olive-muted hover:bg-sand"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Checklist */}
        {loading ? (
          <p className="text-olive-muted text-center">Loading...</p>
        ) : checklist.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-olive-muted">
              Complete the onboarding quiz to populate milestones.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {checklist.map((name) => {
              const status = statuses[name] || "not_yet";
              return (
                <button
                  key={name}
                  onClick={() => toggleStatus(name)}
                  className="flex items-center justify-between rounded-[var(--radius-card)] border border-sand-light bg-warm-white p-4 transition-all duration-200 hover:shadow-[var(--shadow-card)] cursor-pointer text-left min-h-[52px]"
                >
                  <span className="text-sm text-olive-dark font-medium flex-1 pr-3">
                    {name}
                  </span>
                  <span
                    className={`text-xs font-semibold rounded-full px-3 py-1 whitespace-nowrap ${statusColors[status]}`}
                  >
                    {statusLabels[status]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav childId={childId} />
    </main>
  );
}

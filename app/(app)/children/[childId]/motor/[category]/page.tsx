"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { BottomNav } from "@/components/bottom-nav";

interface MilestoneRecord {
  name: string;
  status: string;
}

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
  const [assessMode, setAssessMode] = useState(false);
  const [assessList, setAssessList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `/api/children/${childId}/milestones?category=${category}`
      );
      const data = await res.json();

      const existing: Record<string, string> = {};
      for (const m of data.data as MilestoneRecord[]) {
        existing[m.name] = m.status;
      }

      const allNames = new Set<string>();
      for (const m of data.data as MilestoneRecord[]) {
        allNames.add(m.name);
      }

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

  const statusOptions = ["not_yet", "sometimes", "consistently"] as const;

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

  function startAssessment() {
    const remaining = checklist.filter(
      (name) => statuses[name] !== "consistently"
    );
    setAssessList(remaining);
    setCurrentIndex(0);
    setAssessMode(true);
  }

  async function handleAnswer(name: string, status: string) {
    setSaving(true);
    setStatuses((prev) => ({ ...prev, [name]: status }));

    await fetch(`/api/children/${childId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, status }),
    });

    setSaving(false);

    if (currentIndex < assessList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setAssessMode(false);
      setCurrentIndex(0);
    }
  }

  const achievedCount = Object.values(statuses).filter(
    (s) => s === "consistently"
  ).length;
  const sometimesCount = Object.values(statuses).filter(
    (s) => s === "sometimes"
  ).length;

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
        </div>

        {/* Switch between gross/fine */}
        <div className="flex gap-2 mb-6">
          {["gross_motor", "fine_motor"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                router.push(`/children/${childId}/motor/${cat}`);
                setAssessMode(false);
              }}
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

        {loading ? (
          <p className="text-olive-muted text-center">Loading...</p>
        ) : checklist.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-olive-muted">
              Complete the onboarding quiz to populate milestones.
            </p>
          </div>
        ) : assessMode ? (
          /* Questionnaire mode */
          <div>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-olive-light mb-2">
                <span>
                  {currentIndex + 1} of {assessList.length}
                </span>
                <span>
                  {Math.round(((currentIndex + 1) / assessList.length) * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-sand-light overflow-hidden">
                <div
                  className="h-full rounded-full bg-terracotta transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / assessList.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="rounded-[var(--radius-card)] border border-sand-light bg-warm-white p-6 shadow-[var(--shadow-card)] mb-6">
              <p className="text-lg font-semibold text-olive-dark leading-relaxed">
                Is your child: {assessList[currentIndex]}?
              </p>
              {statuses[assessList[currentIndex]] && (
                <p className="text-sm text-olive-muted mt-2">
                  Currently:{" "}
                  {statusLabels[statuses[assessList[currentIndex]]]}
                </p>
              )}
            </div>

            {/* Answer buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  handleAnswer(assessList[currentIndex], "consistently")
                }
                disabled={saving}
                className="w-full rounded-[var(--radius-button)] bg-terracotta px-6 py-4 font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-200 hover:bg-terracotta-dark disabled:opacity-50 cursor-pointer min-h-[52px]"
              >
                Yes, consistently!
              </button>
              <button
                onClick={() =>
                  handleAnswer(assessList[currentIndex], "sometimes")
                }
                disabled={saving}
                className="w-full rounded-[var(--radius-button)] border-2 border-sand-light bg-warm-white px-6 py-4 font-semibold text-olive-dark transition-all duration-200 hover:bg-sand-light disabled:opacity-50 cursor-pointer min-h-[52px]"
              >
                Sometimes
              </button>
              <button
                onClick={() =>
                  handleAnswer(assessList[currentIndex], "not_yet")
                }
                disabled={saving}
                className="w-full rounded-[var(--radius-button)] border-2 border-sand-light bg-warm-white px-6 py-4 font-semibold text-olive-muted transition-all duration-200 hover:bg-sand-light disabled:opacity-50 cursor-pointer min-h-[52px]"
              >
                Not yet
              </button>
            </div>

            <button
              onClick={() => {
                setAssessMode(false);
                setCurrentIndex(0);
              }}
              className="w-full mt-4 text-sm text-olive-muted hover:text-olive-dark cursor-pointer text-center py-2"
            >
              Exit assessment
            </button>
          </div>
        ) : (
          /* Summary view */
          <div>
            {/* Summary stats */}
            <div className="rounded-[var(--radius-card)] border border-sand-light bg-warm-white p-4 mb-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-olive-dark">
                    {achievedCount} achieved
                    {sometimesCount > 0 &&
                      ` · ${sometimesCount} sometimes`}
                  </p>
                  <p className="text-xs text-olive-muted mt-0.5">
                    {checklist.length} milestones total
                  </p>
                </div>
                <button
                  onClick={startAssessment}
                  className="rounded-[var(--radius-button)] bg-terracotta px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-200 hover:bg-terracotta-dark cursor-pointer"
                >
                  Assess
                </button>
              </div>
            </div>

            {/* Milestone list */}
            <p className="text-olive-muted text-xs mb-2">
              Tap a milestone to change its status.
            </p>
            <div className="flex flex-col gap-2">
              {checklist.map((name) => {
                const status = statuses[name] || "not_yet";
                return (
                  <button
                    key={name}
                    onClick={() => toggleStatus(name)}
                    className="flex items-center justify-between rounded-[var(--radius-card)] border border-sand-light bg-warm-white p-4 min-h-[52px] transition-all duration-200 hover:shadow-[var(--shadow-card)] cursor-pointer text-left"
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
          </div>
        )}
      </div>

      <BottomNav childId={childId} />
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { BottomNav } from "@/components/bottom-nav";

interface Prediction {
  category: string;
  title: string;
  description: string;
  timeframe: string;
  signs: string[];
}

const categoryLabels: Record<string, string> = {
  language: "Language",
  gross_motor: "Gross Motor",
  fine_motor: "Fine Motor",
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  language: { bg: "bg-lang-bg", text: "text-lang", border: "border-lang-bg" },
  gross_motor: { bg: "bg-gross-bg", text: "text-gross", border: "border-gross-bg" },
  fine_motor: { bg: "bg-fine-bg", text: "text-fine", border: "border-fine-bg" },
};

export default function PredictionsPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  // TODO: Re-enable AI predictions when ready
  const _comingSoon = true;

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const _categories = ["language", "gross_motor", "fine_motor"];

  // Preserved for future use — fetch predictions from AI
  function _loadPredictions() {
    setLoading(true);
    setError("");
    fetch(`/api/children/${childId}/predictions`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setPredictions(data.data ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Couldn't generate predictions right now. Try again later.");
        setLoading(false);
      });
  }

  // Suppress unused variable warnings
  void predictions;
  void loading;
  void error;
  void setPredictions;

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
            What&apos;s Next
          </h1>
        </div>

        {/* Coming Soon */}
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-terracotta-light flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c2775e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl text-olive-dark mb-2">
            Coming Soon
          </h2>
          <p className="text-olive-muted text-sm max-w-[240px] mx-auto">
            Personalized predictions for your child&apos;s next milestones are on the way.
          </p>
        </div>
      </div>

      <BottomNav childId={childId} />
    </main>
  );
}

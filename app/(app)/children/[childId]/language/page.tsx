"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { BottomNav } from "@/components/bottom-nav";

interface WordEntry {
  id: string;
  word: string;
  isPhrase: boolean;
  observedDate: string;
}

export default function LanguagePage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [isPhrase, setIsPhrase] = useState(false);
  const [observedDate, setObservedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWords();
  }, [childId]);

  async function fetchWords() {
    const res = await fetch(`/api/children/${childId}/words`);
    const data = await res.json();
    setWords(data.data);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    await fetch(`/api/children/${childId}/words`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: newWord, isPhrase, observedDate }),
    });

    setNewWord("");
    setIsPhrase(false);
    setShowModal(false);
    setSubmitting(false);
    await fetchWords();
    router.refresh();
  }

  const wordCount = words.filter((w) => !w.isPhrase).length;
  const phraseCount = words.filter((w) => w.isPhrase).length;

  // Group by month
  const grouped = words.reduce(
    (acc, w) => {
      const month = w.observedDate.slice(0, 7);
      if (!acc[month]) acc[month] = [];
      acc[month].push(w);
      return acc;
    },
    {} as Record<string, WordEntry[]>
  );

  const sortedMonths = Object.keys(grouped).sort().reverse();

  return (
    <main className="min-h-dvh px-6 pt-8 pb-24">
      <div className="mx-auto max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-olive-muted hover:text-olive-dark cursor-pointer mb-1"
            >
              &#8249; Dashboard
            </button>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl text-olive-dark">
              Words
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-11 h-11 rounded-full bg-terracotta text-white flex items-center justify-center text-xl shadow-[var(--shadow-button)] hover:bg-terracotta-dark transition-all duration-200 cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Summary */}
        <div className="rounded-[var(--radius-card)] border border-lang-bg bg-lang-bg/30 p-4 mb-6">
          <p className="font-semibold text-olive-dark">
            {wordCount} word{wordCount !== 1 ? "s" : ""}
            {phraseCount > 0 &&
              ` · ${phraseCount} phrase${phraseCount !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Word list */}
        {loading ? (
          <p className="text-olive-muted text-center">Loading...</p>
        ) : words.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-olive-muted mb-2">No words logged yet</p>
            <p className="text-olive-light text-sm">
              Tap + to add your child&apos;s first word
            </p>
          </div>
        ) : (
          sortedMonths.map((month) => {
            const monthDate = new Date(month + "-01T00:00:00");
            const monthLabel = monthDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });
            return (
              <div key={month} className="mb-6">
                <h3 className="text-xs font-bold text-olive-light uppercase tracking-wider mb-2">
                  {monthLabel}
                </h3>
                {grouped[month].map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between py-3 border-b border-sand-light last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      {w.isPhrase && (
                        <span className="text-xs bg-lang-bg text-lang rounded-full px-2 py-0.5 font-semibold">
                          phrase
                        </span>
                      )}
                      <span className="text-olive-dark font-medium">
                        {w.isPhrase ? `"${w.word}"` : w.word}
                      </span>
                    </div>
                    <span className="text-xs text-olive-muted">
                      {new Date(w.observedDate + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Add word modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-sm bg-warm-white rounded-t-[24px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="w-10 h-1 bg-sand rounded-full mx-auto mb-4" />
            <h2 className="font-[family-name:var(--font-heading)] text-2xl text-olive-dark mb-4">
              Add a word
            </h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                required
                placeholder={isPhrase ? '"more milk"' : "doggy"}
                className="w-full rounded-[var(--radius-input)] border border-sand-light bg-cream px-4 py-3 text-olive-dark placeholder:text-olive-light focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                autoFocus
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPhrase(!isPhrase)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[44px] ${
                    isPhrase
                      ? "bg-lang text-white"
                      : "bg-sand-light text-olive-muted"
                  }`}
                >
                  {isPhrase ? "Phrase" : "Single word"}
                </button>

                <input
                  type="date"
                  value={observedDate}
                  onChange={(e) => setObservedDate(e.target.value)}
                  className="flex-1 rounded-[var(--radius-input)] border border-sand-light bg-cream px-3 py-2 text-sm text-olive-dark focus:border-terracotta focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-[var(--radius-button)] bg-terracotta px-6 py-4 font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-200 hover:bg-terracotta-dark disabled:opacity-50 cursor-pointer min-h-[52px]"
              >
                {submitting ? "Adding..." : "Add"}
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav childId={childId} />
    </main>
  );
}

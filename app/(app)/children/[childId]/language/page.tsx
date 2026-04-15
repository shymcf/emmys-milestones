"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { BottomNav } from "@/components/bottom-nav";

interface WordEntry {
  id: string;
  word: string;
  type: string;
  isPhrase: boolean;
  observedDate: string;
}

type TabType = "words" | "gestures";

const suggestedWords: { minMonths: number; maxMonths: number; words: string[] }[] = [
  { minMonths: 0, maxMonths: 5, words: ["mama", "dada", "baba"] },
  { minMonths: 6, maxMonths: 9, words: ["mama", "dada", "baba", "no", "bye", "hi", "uh-oh"] },
  { minMonths: 9, maxMonths: 12, words: ["mama", "dada", "ball", "dog", "cat", "no", "bye-bye", "hi", "uh-oh", "more"] },
  { minMonths: 12, maxMonths: 15, words: ["mama", "dada", "ball", "dog", "cat", "baby", "shoe", "book", "more", "up", "milk", "juice", "water", "bye-bye", "hi", "no", "yes"] },
  { minMonths: 15, maxMonths: 18, words: ["please", "thank you", "help", "eat", "drink", "go", "car", "truck", "bird", "fish", "tree", "hat", "cup", "spoon", "bath", "bed", "outside", "hot", "cold", "big"] },
  { minMonths: 18, maxMonths: 24, words: ["mine", "want", "like", "happy", "sad", "run", "jump", "sit", "open", "close", "wash", "draw", "read", "play", "house", "sun", "moon", "rain", "flower", "bear"] },
  { minMonths: 24, maxMonths: 36, words: ["because", "friend", "school", "color", "sing", "dance", "sleep", "wake up", "breakfast", "lunch", "dinner", "please", "sorry", "share", "gentle", "fast", "slow", "heavy", "light", "funny"] },
];

const suggestedGestures: { minMonths: number; maxMonths: number; gestures: string[] }[] = [
  { minMonths: 0, maxMonths: 8, gestures: ["reaching", "grasping", "turning head toward sounds"] },
  { minMonths: 9, maxMonths: 12, gestures: ["waving bye-bye", "clapping", "pointing", "raising arms to be picked up", "shaking head no"] },
  { minMonths: 12, maxMonths: 18, gestures: ["blowing kisses", "nodding yes", "pointing to show things", "giving objects when asked", "pushing away unwanted things"] },
  { minMonths: 18, maxMonths: 24, gestures: ["thumbs up", "shushing", "beckoning come here", "copying adult gestures", "pretend play actions"] },
  { minMonths: 24, maxMonths: 36, gestures: ["holding up fingers for age", "hugging dolls/stuffed animals", "taking turns in games"] },
];

function getSuggestionsForAge(ageMonths: number): string[] {
  const bracket = suggestedWords.find((b) => ageMonths >= b.minMonths && ageMonths <= b.maxMonths);
  return bracket?.words ?? suggestedWords[suggestedWords.length - 1].words;
}

function getGesturesForAge(ageMonths: number): string[] {
  const bracket = suggestedGestures.find((b) => ageMonths >= b.minMonths && ageMonths <= b.maxMonths);
  return bracket?.gestures ?? suggestedGestures[suggestedGestures.length - 1].gestures;
}

export default function LanguagePage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  const [activeTab, setActiveTab] = useState<TabType>("words");
  const [words, setWords] = useState<WordEntry[]>([]);
  const [gestures, setGestures] = useState<WordEntry[]>([]);
  const [ageMonths, setAgeMonths] = useState(12);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [isPhrase, setIsPhrase] = useState(false);
  const [observedDate, setObservedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
    fetch("/api/children")
      .then((res) => res.json())
      .then((data) => {
        const child = data.data?.find((c: { id: string }) => c.id === childId);
        if (child) {
          const dob = new Date(child.dateOfBirth + "T00:00:00");
          const now = new Date();
          const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
          setAgeMonths(Math.max(0, months));
        }
      });
  }, [childId]);

  async function fetchAll() {
    const [wordsRes, gesturesRes] = await Promise.all([
      fetch(`/api/children/${childId}/words?type=word`),
      fetch(`/api/children/${childId}/words?type=gesture`),
    ]);
    const [wordsData, gesturesData] = await Promise.all([wordsRes.json(), gesturesRes.json()]);
    setWords(wordsData.data ?? []);
    setGestures(gesturesData.data ?? []);
    setLoading(false);
  }

  async function handleDelete(itemId: string) {
    if (activeTab === "words") {
      setWords((prev) => prev.filter((w) => w.id !== itemId));
    } else {
      setGestures((prev) => prev.filter((g) => g.id !== itemId));
    }
    await fetch(`/api/children/${childId}/words`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: itemId }),
    });
    router.refresh();
  }

  function toggleSuggestion(item: string) {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const itemsToAdd: string[] = [...selectedSuggestions];
    if (newWord.trim()) {
      itemsToAdd.push(newWord.trim());
    }

    const type = activeTab === "words" ? "word" : "gesture";

    for (const word of itemsToAdd) {
      await fetch(`/api/children/${childId}/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word,
          type,
          isPhrase: activeTab === "words" ? isPhrase : false,
          observedDate,
        }),
      });
    }

    setNewWord("");
    setSelectedSuggestions(new Set());
    setIsPhrase(false);
    setShowModal(false);
    setSubmitting(false);
    await fetchAll();
    router.refresh();
  }

  const currentItems = activeTab === "words" ? words : gestures;
  const wordCount = words.filter((w) => !w.isPhrase).length;
  const phraseCount = words.filter((w) => w.isPhrase).length;
  const gestureCount = gestures.length;

  // Group by month
  const grouped = currentItems.reduce(
    (acc, w) => {
      const month = w.observedDate.slice(0, 7);
      if (!acc[month]) acc[month] = [];
      acc[month].push(w);
      return acc;
    },
    {} as Record<string, WordEntry[]>
  );

  const sortedMonths = Object.keys(grouped).sort().reverse();

  const suggestions = activeTab === "words"
    ? getSuggestionsForAge(ageMonths).filter((s) => !words.some((w) => w.word.toLowerCase() === s.toLowerCase()))
    : getGesturesForAge(ageMonths).filter((s) => !gestures.some((g) => g.word.toLowerCase() === s.toLowerCase()));

  return (
    <main className="min-h-dvh px-6 pt-8 pb-24">
      <div className="mx-auto max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-olive-muted hover:text-olive-dark cursor-pointer mb-1"
            >
              &#8249; Dashboard
            </button>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl text-olive-dark">
              Communication
            </h1>
          </div>
          <button
            onClick={() => {
              setSelectedSuggestions(new Set());
              setNewWord("");
              setShowModal(true);
            }}
            className="w-11 h-11 rounded-full bg-terracotta text-white flex items-center justify-center text-xl shadow-[var(--shadow-button)] hover:bg-terracotta-dark transition-all duration-200 cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-[var(--radius-button)] bg-sand-light p-1 mb-6">
          <button
            onClick={() => setActiveTab("words")}
            className={`flex-1 rounded-[calc(var(--radius-button)-4px)] py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "words"
                ? "bg-warm-white text-olive-dark shadow-sm"
                : "text-olive-muted hover:text-olive-dark"
            }`}
          >
            Words
          </button>
          <button
            onClick={() => setActiveTab("gestures")}
            className={`flex-1 rounded-[calc(var(--radius-button)-4px)] py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "gestures"
                ? "bg-warm-white text-olive-dark shadow-sm"
                : "text-olive-muted hover:text-olive-dark"
            }`}
          >
            Gestures
          </button>
        </div>

        {/* Summary */}
        <div className="rounded-[var(--radius-card)] border border-lang-bg bg-lang-bg/30 p-4 mb-6">
          {activeTab === "words" ? (
            <p className="font-semibold text-olive-dark">
              {wordCount} word{wordCount !== 1 ? "s" : ""}
              {phraseCount > 0 &&
                ` · ${phraseCount} phrase${phraseCount !== 1 ? "s" : ""}`}
            </p>
          ) : (
            <p className="font-semibold text-olive-dark">
              {gestureCount} gesture{gestureCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Item list */}
        {loading ? (
          <p className="text-olive-muted text-center">Loading...</p>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-olive-muted mb-2">
              No {activeTab === "words" ? "words" : "gestures"} logged yet
            </p>
            <p className="text-olive-light text-sm">
              Tap + to add your child&apos;s first {activeTab === "words" ? "word" : "gesture"}
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
                    className="flex items-center justify-between py-3 border-b border-sand-light last:border-0 group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {w.isPhrase && (
                        <span className="text-xs bg-lang-bg text-lang rounded-full px-2 py-0.5 font-semibold shrink-0">
                          phrase
                        </span>
                      )}
                      <span className="text-olive-dark font-medium truncate">
                        {w.isPhrase ? `"${w.word}"` : w.word}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-olive-muted">
                        {new Date(w.observedDate + "T00:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="w-6 h-6 rounded-full text-olive-light hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-sm transition-colors duration-200 cursor-pointer"
                        title="Remove"
                      >
                        x
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-sm bg-warm-white rounded-t-[24px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="w-10 h-1 bg-sand rounded-full mx-auto mb-4" />
            <h2 className="font-[family-name:var(--font-heading)] text-2xl text-olive-dark mb-4">
              Add {activeTab === "words" ? "a word" : "a gesture"}
            </h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              {/* Suggested items */}
              {(activeTab === "gestures" || !isPhrase) && suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-olive-light uppercase tracking-wider mb-2">
                    Common for this age
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleSuggestion(item)}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                          selectedSuggestions.has(item)
                            ? "bg-terracotta text-white"
                            : "bg-sand-light text-olive-muted hover:bg-terracotta-light hover:text-terracotta"
                        }`}
                      >
                        {selectedSuggestions.has(item) ? `\u2713 ${item}` : item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder={
                  activeTab === "gestures"
                    ? "Or type a custom gesture..."
                    : isPhrase
                      ? '"more milk"'
                      : "Or type a custom word..."
                }
                className="w-full rounded-[var(--radius-input)] border border-sand-light bg-cream px-4 py-3 text-olive-dark placeholder:text-olive-light focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              />

              <div className="flex items-center gap-3">
                {activeTab === "words" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPhrase(!isPhrase);
                      if (!isPhrase) setSelectedSuggestions(new Set());
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[44px] ${
                      isPhrase
                        ? "bg-lang text-white"
                        : "bg-sand-light text-olive-muted"
                    }`}
                  >
                    {isPhrase ? "Phrase" : "Single word"}
                  </button>
                )}

                <input
                  type="date"
                  value={observedDate}
                  onChange={(e) => setObservedDate(e.target.value)}
                  className="flex-1 rounded-[var(--radius-input)] border border-sand-light bg-cream px-3 py-2 text-sm text-olive-dark focus:border-terracotta focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || (selectedSuggestions.size === 0 && !newWord.trim())}
                className="w-full rounded-[var(--radius-button)] bg-terracotta px-6 py-4 font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-200 hover:bg-terracotta-dark disabled:opacity-50 cursor-pointer min-h-[52px]"
              >
                {submitting
                  ? "Adding..."
                  : selectedSuggestions.size > 0
                    ? `Add ${selectedSuggestions.size + (newWord.trim() ? 1 : 0)} ${activeTab === "words" ? "word" : "gesture"}${selectedSuggestions.size + (newWord.trim() ? 1 : 0) !== 1 ? "s" : ""}`
                    : "Add"}
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav childId={childId} />
    </main>
  );
}

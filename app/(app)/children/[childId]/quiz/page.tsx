"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

interface QuizQuestion {
  id: string;
  category: string;
  text: string;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; answer: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/children/${childId}/quiz`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.data.questions);
        setLoading(false);
      });
  }, [childId]);

  async function handleAnswer(answer: "yes" | "no") {
    const question = questions[currentIndex];
    const newAnswers = [...answers, { questionId: question.id, answer }];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSubmitting(true);
      await fetch(`/api/children/${childId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: newAnswers }),
      });
      router.push("/dashboard");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-olive-muted">Loading questions...</p>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6">
        <p className="text-olive-muted text-center">
          No questions available for this age range yet.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 rounded-[var(--radius-button)] bg-terracotta px-6 py-3 font-semibold text-white cursor-pointer"
        >
          Go to dashboard
        </button>
      </main>
    );
  }

  if (submitting) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-olive-muted">Saving your answers...</p>
      </main>
    );
  }

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const categoryLabels: Record<string, string> = {
    language: "Language",
    gross_motor: "Gross Motor",
    fine_motor: "Fine Motor",
  };

  const categoryColors: Record<string, string> = {
    language: "bg-lang-bg text-lang",
    gross_motor: "bg-gross-bg text-gross",
    fine_motor: "bg-fine-bg text-fine",
  };

  return (
    <main className="flex min-h-dvh flex-col px-6 py-8">
      <div className="mx-auto w-full max-w-sm flex-1 flex flex-col">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-olive-light mb-2">
            <span>
              {currentIndex + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-sand-light overflow-hidden">
            <div
              className="h-full rounded-full bg-terracotta transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Category badge */}
        <div className="mb-4">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[question.category] || "bg-sand-light text-olive-muted"}`}
          >
            {categoryLabels[question.category] || question.category}
          </span>
        </div>

        {/* Question */}
        <div className="flex-1 flex items-center">
          <h2 className="text-xl font-semibold text-olive-dark leading-relaxed">
            {question.text}
          </h2>
        </div>

        {/* Answer buttons */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={() => handleAnswer("no")}
            className="flex-1 rounded-[var(--radius-button)] border-2 border-sand-light bg-warm-white px-6 py-4 font-semibold text-olive-muted transition-all duration-200 hover:bg-sand-light cursor-pointer min-h-[52px]"
          >
            Not yet
          </button>
          <button
            onClick={() => handleAnswer("yes")}
            className="flex-1 rounded-[var(--radius-button)] bg-terracotta px-6 py-4 font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-200 hover:bg-terracotta-dark cursor-pointer min-h-[52px]"
          >
            Yes!
          </button>
        </div>
      </div>
    </main>
  );
}

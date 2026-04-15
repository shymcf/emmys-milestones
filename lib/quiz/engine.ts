import { db } from "@/lib/db";
import { milestones, quizResponses } from "@/lib/db/schema";
import { todayISO } from "@/lib/utils";

import { quizQuestions, type QuizQuestion } from "./questions";

const AGE_BRACKETS = [
  { min: 2, max: 5 },
  { min: 6, max: 9 },
  { min: 9, max: 12 },
  { min: 12, max: 15 },
  { min: 15, max: 18 },
  { min: 18, max: 24 },
  { min: 24, max: 36 },
];

function getBracketForAge(ageMonths: number) {
  return AGE_BRACKETS.find((b) => ageMonths >= b.min && ageMonths <= b.max);
}

export function getQuestionsForAge(ageMonths: number): QuizQuestion[] {
  return quizQuestions.filter(
    (q) => ageMonths >= q.minMonths && ageMonths <= q.maxMonths
  );
}

export function getQuestionsForNextBracket(
  afterMaxMonths: number
): QuizQuestion[] {
  const currentIndex = AGE_BRACKETS.findIndex((b) => b.max === afterMaxMonths);
  if (currentIndex === -1 || currentIndex >= AGE_BRACKETS.length - 1) {
    return [];
  }
  const next = AGE_BRACKETS[currentIndex + 1];
  return quizQuestions.filter(
    (q) => q.minMonths === next.min && q.maxMonths === next.max
  );
}

export function getBracketMaxForAge(ageMonths: number): number {
  const bracket = getBracketForAge(ageMonths);
  return bracket ? bracket.max : AGE_BRACKETS[AGE_BRACKETS.length - 1].max;
}

export async function processQuizResults(
  childId: string,
  answers: { questionId: string; answer: string }[]
): Promise<void> {
  const today = todayISO();

  for (const { questionId, answer } of answers) {
    await db.insert(quizResponses).values({
      childId,
      questionId,
      answer,
    });

    if (answer === "yes") {
      const question = quizQuestions.find((q) => q.id === questionId);
      if (question) {
        await db.insert(milestones).values({
          childId,
          category: question.category,
          name: question.milestoneIfYes,
          status: "consistently",
          observedDate: today,
        });
      }
    }
  }
}

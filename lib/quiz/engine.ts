import { db } from "@/lib/db";
import { milestones, quizResponses } from "@/lib/db/schema";
import { todayISO } from "@/lib/utils";

import { quizQuestions, type QuizQuestion } from "./questions";

export function getQuestionsForAge(ageMonths: number): QuizQuestion[] {
  return quizQuestions.filter(
    (q) => ageMonths >= q.minMonths && ageMonths <= q.maxMonths
  );
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

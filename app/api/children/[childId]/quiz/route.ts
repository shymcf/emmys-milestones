import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { getQuestionsForAge, processQuizResults } from "@/lib/quiz/engine";
import { getAgeInMonths } from "@/lib/utils";

const quizAnswerSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.enum(["yes", "no"]),
    })
  ),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { childId } = await params;

  const child = await db
    .select()
    .from(children)
    .where(eq(children.id, childId))
    .get();

  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  const ageMonths = getAgeInMonths(child.dateOfBirth);
  const questions = getQuestionsForAge(ageMonths);

  return NextResponse.json({ data: { questions, ageMonths } });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { childId } = await params;

  const child = await db
    .select()
    .from(children)
    .where(eq(children.id, childId))
    .get();

  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { answers } = quizAnswerSchema.parse(body);

    await processQuizResults(childId, answers);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

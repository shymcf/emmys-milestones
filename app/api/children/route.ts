import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  children,
  milestones,
  wordLogs,
  quizResponses,
  recommendations,
} from "@/lib/db/schema";

const createChildSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, dateOfBirth } = createChildSchema.parse(body);

    const result = await db
      .insert(children)
      .values({ userId: session.user.id, name, dateOfBirth })
      .returning();

    return NextResponse.json({ data: result[0] }, { status: 201 });
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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db
    .select()
    .from(children)
    .where(eq(children.userId, session.user.id));

  return NextResponse.json({ data: result });
}

const deleteChildSchema = z.object({
  childId: z.string().min(1),
});

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { childId } = deleteChildSchema.parse(body);

    const child = await db
      .select()
      .from(children)
      .where(and(eq(children.id, childId), eq(children.userId, session.user.id)))
      .get();

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    await db.delete(recommendations).where(eq(recommendations.childId, childId));
    await db.delete(quizResponses).where(eq(quizResponses.childId, childId));
    await db.delete(wordLogs).where(eq(wordLogs.childId, childId));
    await db.delete(milestones).where(eq(milestones.childId, childId));
    await db.delete(children).where(eq(children.id, childId));

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

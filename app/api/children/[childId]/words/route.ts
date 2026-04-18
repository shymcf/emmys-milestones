import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { children, wordLogs } from "@/lib/db/schema";

const addWordSchema = z.object({
  word: z.string().min(1, "Word is required"),
  type: z.enum(["word", "gesture"]).default("word"),
  isPhrase: z.boolean().default(false),
  observedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { childId } = await params;

  const [child] = await db
    .select()
    .from(children)
    .where(eq(children.id, childId))
    .limit(1);

  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const typeFilter = request.nextUrl.searchParams.get("type");
  const conditions = [eq(wordLogs.childId, childId)];
  if (typeFilter === "word" || typeFilter === "gesture") {
    conditions.push(eq(wordLogs.type, typeFilter));
  }

  const words = await db
    .select()
    .from(wordLogs)
    .where(and(...conditions))
    .orderBy(desc(wordLogs.observedDate));

  return NextResponse.json({ data: words });
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

  const [child] = await db
    .select()
    .from(children)
    .where(eq(children.id, childId))
    .limit(1);

  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { word, type, isPhrase, observedDate } = addWordSchema.parse(body);

    const result = await db
      .insert(wordLogs)
      .values({ childId, word, type, isPhrase, observedDate })
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

const deleteWordSchema = z.object({
  wordId: z.string().min(1),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { childId } = await params;

  const [child] = await db
    .select()
    .from(children)
    .where(eq(children.id, childId))
    .limit(1);

  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { wordId } = deleteWordSchema.parse(body);

    await db
      .delete(wordLogs)
      .where(and(eq(wordLogs.id, wordId), eq(wordLogs.childId, childId)));

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

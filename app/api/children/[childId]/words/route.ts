import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { children, wordLogs } from "@/lib/db/schema";

const addWordSchema = z.object({
  word: z.string().min(1, "Word is required"),
  isPhrase: z.boolean().default(false),
  observedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const words = await db
    .select()
    .from(wordLogs)
    .where(eq(wordLogs.childId, childId))
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

  const child = await db
    .select()
    .from(children)
    .where(eq(children.id, childId))
    .get();

  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { word, isPhrase, observedDate } = addWordSchema.parse(body);

    const result = await db
      .insert(wordLogs)
      .values({ childId, word, isPhrase, observedDate })
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

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { children, milestones } from "@/lib/db/schema";

const updateMilestoneSchema = z.object({
  name: z.string(),
  category: z.string(),
  status: z.enum(["not_yet", "sometimes", "consistently"]),
  observedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
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

  const child = await db
    .select()
    .from(children)
    .where(eq(children.id, childId))
    .get();

  if (!child || child.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const category = request.nextUrl.searchParams.get("category");

  const conditions = [eq(milestones.childId, childId)];
  if (category) {
    conditions.push(eq(milestones.category, category));
  }

  const result = await db
    .select()
    .from(milestones)
    .where(and(...conditions));

  return NextResponse.json({ data: result });
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
    const { name, category, status, observedDate } =
      updateMilestoneSchema.parse(body);

    // Check if milestone already exists
    const existing = await db
      .select()
      .from(milestones)
      .where(
        and(
          eq(milestones.childId, childId),
          eq(milestones.name, name),
          eq(milestones.category, category)
        )
      )
      .get();

    if (existing) {
      // Update status
      const result = await db
        .update(milestones)
        .set({
          status,
          observedDate:
            status !== "not_yet"
              ? observedDate || new Date().toISOString().split("T")[0]
              : null,
        })
        .where(eq(milestones.id, existing.id))
        .returning();

      return NextResponse.json({ data: result[0] });
    }

    // Create new
    const result = await db
      .insert(milestones)
      .values({
        childId,
        name,
        category,
        status,
        observedDate:
          status !== "not_yet"
            ? observedDate || new Date().toISOString().split("T")[0]
            : null,
      })
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

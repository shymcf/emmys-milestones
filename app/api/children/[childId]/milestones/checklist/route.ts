import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { getMilestoneChecklist } from "@/lib/milestones/checklist";
import { getAgeInMonths } from "@/lib/utils";

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
  if (!category) {
    return NextResponse.json(
      { error: "Category required" },
      { status: 400 }
    );
  }

  const ageMonths = getAgeInMonths(child.dateOfBirth);
  const checklist = getMilestoneChecklist(category, ageMonths);

  return NextResponse.json({ data: checklist });
}

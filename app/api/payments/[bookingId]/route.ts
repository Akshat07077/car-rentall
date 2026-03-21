import { NextRequest, NextResponse } from "next/server";
import { db, paymentsTable, usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId } = await params;
    const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.bookingId, Number(bookingId))).limit(1);
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    return NextResponse.json({ ...payment, amount: Number(payment.amount) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

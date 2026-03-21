import { NextRequest, NextResponse } from "next/server";
import { db, bookingsTable, carsTable, usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSession, formatUser } from "@/lib/auth";

function formatBooking(b: typeof bookingsTable.$inferSelect) {
  return { ...b, totalPrice: Number(b.totalPrice), driverPrice: Number(b.driverPrice) };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const [row] = await db.select({ booking: bookingsTable, car: carsTable, user: usersTable })
      .from(bookingsTable)
      .leftJoin(carsTable, eq(bookingsTable.carId, carsTable.id))
      .leftJoin(usersTable, eq(bookingsTable.userId, usersTable.id))
      .where(eq(bookingsTable.id, Number(id)))
      .limit(1);

    if (!row) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (currentUser.role !== "admin" && row.booking.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      ...formatBooking(row.booking),
      car: row.car ? { ...row.car, pricePerDay: Number(row.car.pricePerDay) } : undefined,
      user: row.user ? formatUser(row.user) : undefined,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (!currentUser || currentUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const { status } = await req.json();
    if (!status) return NextResponse.json({ error: "Status required" }, { status: 400 });

    const [booking] = await db.update(bookingsTable).set({ status }).where(eq(bookingsTable.id, Number(id))).returning();
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    return NextResponse.json(formatBooking(booking));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

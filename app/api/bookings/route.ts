import { NextRequest, NextResponse } from "next/server";
import { db, bookingsTable, carsTable, usersTable } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { getSession, formatUser } from "@/lib/auth";

function formatBooking(b: typeof bookingsTable.$inferSelect) {
  return { ...b, totalPrice: Number(b.totalPrice) };
}

function formatRow(row: { booking: typeof bookingsTable.$inferSelect; car: typeof carsTable.$inferSelect | null; user: typeof usersTable.$inferSelect | null }) {
  return {
    ...formatBooking(row.booking),
    car: row.car ? { ...row.car, pricePerDay: Number(row.car.pricePerDay) } : undefined,
    user: row.user ? formatUser(row.user) : undefined,
  };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const query = db.select({ booking: bookingsTable, car: carsTable, user: usersTable })
      .from(bookingsTable)
      .leftJoin(carsTable, eq(bookingsTable.carId, carsTable.id))
      .leftJoin(usersTable, eq(bookingsTable.userId, usersTable.id));

    const rows = currentUser.role === "admin"
      ? await query
      : await query.where(eq(bookingsTable.userId, currentUser.id));

    return NextResponse.json(rows.map(formatRow));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { carId, pickupDate, returnDate } = await req.json();
    if (!carId || !pickupDate || !returnDate) {
      return NextResponse.json({ error: "carId, pickupDate, and returnDate required" }, { status: 400 });
    }

    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (pickup < today) return NextResponse.json({ error: "Pickup date cannot be in the past" }, { status: 400 });
    if (returnD <= pickup) return NextResponse.json({ error: "Return date must be after pickup date" }, { status: 400 });

    const [car] = await db.select().from(carsTable).where(eq(carsTable.id, Number(carId))).limit(1);
    if (!car) return NextResponse.json({ error: "Car not found" }, { status: 404 });
    if (!car.available) return NextResponse.json({ error: "Car is not available" }, { status: 400 });

    const conflicting = await db.select().from(bookingsTable).where(
      and(
        eq(bookingsTable.carId, Number(carId)),
        sql`${bookingsTable.status} NOT IN ('cancelled')`,
        sql`NOT (${bookingsTable.returnDate} < ${pickupDate} OR ${bookingsTable.pickupDate} > ${returnDate})`
      )
    );
    if (conflicting.length > 0) return NextResponse.json({ error: "Car is already booked for the selected dates" }, { status: 400 });

    const days = Math.ceil((returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * Number(car.pricePerDay);

    const [booking] = await db.insert(bookingsTable).values({
      userId: currentUser.id, carId: Number(carId), pickupDate, returnDate,
      totalPrice: String(totalPrice), status: "pending",
    }).returning();

    return NextResponse.json(formatBooking(booking), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

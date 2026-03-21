import { NextRequest, NextResponse } from "next/server";
import { db, carsTable, usersTable } from "@/lib/db";
import { eq, gte, lte, and, ilike } from "drizzle-orm";
import { getSession } from "@/lib/auth";

function formatCar(car: typeof carsTable.$inferSelect) {
  return { ...car, pricePerDay: Number(car.pricePerDay) };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transmission = searchParams.get("transmission");
    const fuel_type = searchParams.get("fuel_type");
    const seats = searchParams.get("seats");
    const location = searchParams.get("location");
    const min_price = searchParams.get("min_price");
    const max_price = searchParams.get("max_price");
    const available = searchParams.get("available");

    const conditions = [];
    if (transmission) conditions.push(eq(carsTable.transmission, transmission as "manual" | "automatic"));
    if (fuel_type) conditions.push(eq(carsTable.fuelType, fuel_type as "petrol" | "diesel" | "electric" | "hybrid"));
    if (seats) conditions.push(eq(carsTable.seats, Number(seats)));
    if (location) conditions.push(ilike(carsTable.location, `%${location}%`));
    if (min_price) conditions.push(gte(carsTable.pricePerDay, min_price));
    if (max_price) conditions.push(lte(carsTable.pricePerDay, max_price));
    if (available !== null) conditions.push(eq(carsTable.available, available === "true"));

    const cars = conditions.length > 0
      ? await db.select().from(carsTable).where(and(...conditions))
      : await db.select().from(carsTable);

    return NextResponse.json(cars.map(formatCar));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { brand, model, year, pricePerDay, transmission, fuelType, seats, location, description, imageUrl, available } = body;

    const [car] = await db.insert(carsTable).values({
      brand, model, year: Number(year), pricePerDay: String(pricePerDay),
      transmission, fuelType, seats: Number(seats), location,
      description: description || null, imageUrl: imageUrl || null,
      available: available !== false,
    }).returning();

    return NextResponse.json(formatCar(car), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

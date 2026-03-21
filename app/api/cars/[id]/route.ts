import { NextRequest, NextResponse } from "next/server";
import { db, carsTable, usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

function formatCar(car: typeof carsTable.$inferSelect) {
  return { ...car, pricePerDay: Number(car.pricePerDay) };
}

async function requireAdmin(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
  return user?.role === "admin" ? user : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [car] = await db.select().from(carsTable).where(eq(carsTable.id, Number(id))).limit(1);
    if (!car) return NextResponse.json({ error: "Car not found" }, { status: 404 });
    return NextResponse.json(formatCar(car));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const updates: Record<string, unknown> = {};
    const fields = ["brand", "model", "year", "pricePerDay", "transmission", "fuelType", "seats", "location", "description", "imageUrl", "available"] as const;
    for (const f of fields) {
      if (body[f] !== undefined) {
        if (f === "year" || f === "seats") updates[f] = Number(body[f]);
        else if (f === "pricePerDay") updates[f] = String(body[f]);
        else updates[f] = body[f];
      }
    }

    const [car] = await db.update(carsTable).set(updates).where(eq(carsTable.id, Number(id))).returning();
    if (!car) return NextResponse.json({ error: "Car not found" }, { status: 404 });
    return NextResponse.json(formatCar(car));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const [car] = await db.delete(carsTable).where(eq(carsTable.id, Number(id))).returning();
    if (!car) return NextResponse.json({ error: "Car not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db, bookingsTable, paymentsTable, usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId } = await req.json();
    if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });

    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, Number(bookingId))).limit(1);
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.userId !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

    const stripe = new Stripe(stripeKey);
    const baseUrl = process.env.NEXT_PUBLIC_URL || `https://${process.env.VERCEL_URL}`;

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Car Rental Booking #${booking.id}` },
          unit_amount: Math.round(Number(booking.totalPrice) * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${baseUrl}/booking/confirmation/${booking.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/booking/${booking.carId}`,
      metadata: { bookingId: String(booking.id) },
    });

    await db.insert(paymentsTable).values({
      bookingId: booking.id,
      amount: String(booking.totalPrice),
      paymentStatus: "pending",
      stripeSessionId: stripeSession.id,
    }).onConflictDoNothing();

    return NextResponse.json({ sessionUrl: stripeSession.url, sessionId: stripeSession.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

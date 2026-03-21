import {
  pgTable, serial, text, integer, numeric, boolean,
  timestamp, date, pgEnum,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const transmissionEnum = pgEnum("transmission", ["manual", "automatic"]);
export const fuelTypeEnum = pgEnum("fuel_type", ["petrol", "diesel", "electric", "hybrid"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "cancelled", "completed"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const carsTable = pgTable("cars", {
  id: serial("id").primaryKey(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  pricePerDay: numeric("price_per_day", { precision: 10, scale: 2 }).notNull(),
  transmission: transmissionEnum("transmission").notNull(),
  fuelType: fuelTypeEnum("fuel_type").notNull(),
  seats: integer("seats").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  available: boolean("available").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  carId: integer("car_id").notNull().references(() => carsTable.id),
  pickupDate: date("pickup_date").notNull(),
  returnDate: date("return_date").notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  withDriver: boolean("with_driver").notNull().default(false),
  driverPrice: numeric("driver_price", { precision: 10, scale: 2 }).notNull().default("0"),
  status: bookingStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookingsTable.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type Car = typeof carsTable.$inferSelect;
export type Booking = typeof bookingsTable.$inferSelect;
export type Payment = typeof paymentsTable.$inferSelect;

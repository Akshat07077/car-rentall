import "dotenv/config";
import { db, carsTable, usersTable } from "./index";
import crypto from "crypto";

function hashPassword(p: string) {
  return crypto
    .createHash("sha256")
    .update(p + (process.env.SESSION_SECRET || "secret"))
    .digest("hex");
}

const CARS = [
  // MUMBAI
  { brand: "Maruti Suzuki", model: "Swift", year: 2024, pricePerDay: "999", transmission: "manual" as const, fuelType: "petrol" as const, seats: 5, location: "Mumbai", description: "India's most popular hatchback. Nimble, fuel-efficient, and easy to park in Mumbai's busy lanes.", imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800", available: true },
  { brand: "Maruti Suzuki", model: "Wagon R", year: 2024, pricePerDay: "899", transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5, location: "Mumbai", description: "Tall-boy design with a spacious cabin. Perfect for Mumbai's stop-and-go traffic — economical and comfortable.", imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800", available: true },
  { brand: "Mercedes-Benz", model: "E-Class", year: 2024, pricePerDay: "11999", transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5, location: "Mumbai", description: "Timeless German luxury. MBUX infotainment, Burmester sound, silky-smooth ride — perfect for business travel and airport transfers.", imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800", available: true },
  { brand: "Toyota", model: "Innova Crysta", year: 2023, pricePerDay: "2999", transmission: "manual" as const, fuelType: "diesel" as const, seats: 7, location: "Mumbai", description: "The go-to family MPV. Powerful diesel engine, 7-seat comfort, rugged build — ideal for family outings and airport runs.", imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800", available: true },
  // DELHI
  { brand: "Maruti Suzuki", model: "Dzire", year: 2024, pricePerDay: "1099", transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5, location: "Delhi", description: "India's best-selling compact sedan. Comfortable ride, good boot space, excellent fuel economy for Delhi's wide roads.", imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800", available: true },
  { brand: "Hyundai", model: "i20", year: 2024, pricePerDay: "1199", transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5, location: "Delhi", description: "Premium hatchback with 10.25-inch touchscreen, sunroof, and a punchy 1.0 turbo engine. Great for Delhi and NCR.", imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800", available: true },
  { brand: "Mercedes-Benz", model: "GLC", year: 2024, pricePerDay: "13999", transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5, location: "Delhi", description: "Compact luxury SUV with 4MATIC AWD and a commanding road presence — ideal for Delhi's power corridors.", imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800", available: true },
  { brand: "Toyota", model: "Innova HyCross", year: 2024, pricePerDay: "3799", transmission: "automatic" as const, fuelType: "hybrid" as const, seats: 7, location: "Delhi", description: "Next-gen Innova with strong hybrid delivering 23+ km/l. Captain seats and panoramic sunroof for the best family road trips.", imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800", available: true },
  // BENGALURU
  { brand: "Maruti Suzuki", model: "Baleno", year: 2024, pricePerDay: "1099", transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5, location: "Bengaluru", description: "Premium hatchback for Bengaluru's tech crowd. Spacious cabin, SmartPlay Pro+ system, and smooth CVT.", imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800", available: true },
  { brand: "Tata", model: "Nexon EV", year: 2024, pricePerDay: "2499", transmission: "automatic" as const, fuelType: "electric" as const, seats: 5, location: "Bengaluru", description: "India's best-selling EV with 465 km range. Perfect for Bengaluru's EV-friendly infrastructure.", imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800", available: true },
  { brand: "Honda", model: "City", year: 2024, pricePerDay: "1499", transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5, location: "Bengaluru", description: "The evergreen executive sedan. Refined 1.5L engine, spacious cabin, Honda Sensing safety suite.", imageUrl: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800", available: true },
  // HYDERABAD
  { brand: "Maruti Suzuki", model: "Ertiga", year: 2024, pricePerDay: "1799", transmission: "automatic" as const, fuelType: "petrol" as const, seats: 7, location: "Hyderabad", description: "India's most trusted family MPV. 7-seat layout, smooth CNG option, excellent fuel efficiency.", imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800", available: true },
  { brand: "Hyundai", model: "Creta", year: 2024, pricePerDay: "2199", transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5, location: "Hyderabad", description: "India's favourite compact SUV. Panoramic sunroof, ADAS safety suite, premium interior.", imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800", available: true },
  { brand: "Kia", model: "Seltos", year: 2024, pricePerDay: "2299", transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5, location: "Hyderabad", description: "Feature-rich compact SUV with Bose sound system, 10.25-inch touchscreen, and turbocharged engine.", imageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800", available: true },
  // CHENNAI
  { brand: "Maruti Suzuki", model: "Swift", year: 2024, pricePerDay: "999", transmission: "manual" as const, fuelType: "petrol" as const, seats: 5, location: "Chennai", description: "Zippy and fuel-efficient. Perfect for navigating Chennai's busy streets.", imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800", available: true },
  { brand: "Toyota", model: "Innova Crysta", year: 2024, pricePerDay: "2999", transmission: "automatic" as const, fuelType: "diesel" as const, seats: 7, location: "Chennai", description: "Trusted family workhorse. Powerful diesel and 7-seat comfort for trips along the Coromandel coast.", imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800", available: true },
  { brand: "Honda", model: "Amaze", year: 2024, pricePerDay: "1199", transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5, location: "Chennai", description: "Compact, comfortable, fuel-efficient. Smooth CVT and efficient AC — perfect for Chennai's warm climate.", imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800", available: true },
  // PUNE
  { brand: "Maruti Suzuki", model: "Wagon R", year: 2024, pricePerDay: "899", transmission: "manual" as const, fuelType: "petrol" as const, seats: 5, location: "Pune", description: "Practical and spacious. Great fuel economy for daily use and Pune-Mumbai expressway runs.", imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800", available: true },
  { brand: "Mahindra", model: "Thar Roxx", year: 2024, pricePerDay: "3499", transmission: "automatic" as const, fuelType: "diesel" as const, seats: 5, location: "Pune", description: "Born for adventure. 4x4 drivetrain perfect for tackling Pune's Sahyadri ghats.", imageUrl: "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800", available: true },
  { brand: "Hyundai", model: "Grand i10 Nios", year: 2024, pricePerDay: "849", transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5, location: "Pune", description: "Compact and cheerful. Perfect for Pune's narrow lanes and busy markets.", imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800", available: true },
  // KOLKATA
  { brand: "Maruti Suzuki", model: "Alto K10", year: 2024, pricePerDay: "699", transmission: "manual" as const, fuelType: "petrol" as const, seats: 5, location: "Kolkata", description: "India's most affordable rental. Ultra-compact, easy to park, 24+ km/l fuel efficiency.", imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800", available: true },
  { brand: "Tata", model: "Tiago", year: 2024, pricePerDay: "849", transmission: "automatic" as const, fuelType: "petrol" as const, seats: 5, location: "Kolkata", description: "Stylish 5-star NCAP hatchback. Smooth AMT at a budget price — great for Kolkata and day trips to Digha.", imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800", available: true },
  { brand: "Toyota", model: "Innova Crysta", year: 2023, pricePerDay: "2799", transmission: "manual" as const, fuelType: "diesel" as const, seats: 7, location: "Kolkata", description: "Reliable family MPV for group travel. Perfect for Kolkata outings and long drives to Darjeeling.", imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800", available: true },
  // JAIPUR
  { brand: "Maruti Suzuki", model: "Ertiga", year: 2024, pricePerDay: "1799", transmission: "manual" as const, fuelType: "petrol" as const, seats: 7, location: "Jaipur", description: "Ideal for exploring Rajasthan. 7-seat layout and CNG option keep costs low on long drives.", imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800", available: true },
  { brand: "Mahindra", model: "Scorpio-N", year: 2024, pricePerDay: "3299", transmission: "automatic" as const, fuelType: "diesel" as const, seats: 7, location: "Jaipur", description: "King of Rajasthan's roads. 4x4 drivetrain and 7 seats for forts, deserts, and royal highways.", imageUrl: "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800", available: true },
  { brand: "Maruti Suzuki", model: "Swift", year: 2024, pricePerDay: "999", transmission: "manual" as const, fuelType: "petrol" as const, seats: 5, location: "Jaipur", description: "Compact and nimble for Jaipur's old city lanes. Most popular for solo travellers exploring Rajasthan.", imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800", available: true },
];

async function seed() {
  console.log("Seeding database...");

  // Users
  const existingUsers = await db.select().from(usersTable);
  if (existingUsers.length === 0) {
    await db.insert(usersTable).values([
      { name: "Admin User", email: "admin@luxecars.in", password: hashPassword("admin123456"), role: "admin" },
      { name: "Rahul Sharma", email: "rahul@example.com", password: hashPassword("password123"), role: "user" },
    ]);
    console.log("Users inserted");
  } else {
    console.log(`Users already exist (${existingUsers.length}), skipping`);
  }

  // Cars — always wipe and re-insert so seed is idempotent
  console.log("Clearing cars...");
  await db.delete(carsTable);
  console.log("Inserting cars...");
  await db.insert(carsTable).values(CARS);
  const inserted = await db.select().from(carsTable);
  console.log(`Cars inserted: ${inserted.length}`);

  console.log("Done!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});

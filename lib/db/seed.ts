import "dotenv/config";
import { db, carsTable, usersTable } from "./index";
import crypto from "crypto";

function hashPassword(p: string) {
  return crypto.createHash("sha256").update(p + (process.env.SESSION_SECRET || "secret")).digest("hex");
}

async function seed() {
  console.log("Seeding...");
  const existing = await db.select().from(usersTable);
  if (existing.length === 0) {
    await db.insert(usersTable).values([
      { name: "Admin User", email: "admin@autoluxe.in", password: hashPassword("admin123456"), role: "admin" },
      { name: "Rahul Sharma", email: "rahul@example.com", password: hashPassword("password123"), role: "user" },
    ]);
    console.log("Users seeded");
  }

  const existingCars = await db.select().from(carsTable);
  if (existingCars.length === 0) {
    await db.insert(carsTable).values([
      {
        brand: "Toyota", model: "Fortuner", year: 2024, pricePerDay: "4999",
        transmission: "automatic", fuelType: "diesel", seats: 7, location: "Mumbai",
        description: "India's most loved premium SUV. The Fortuner commands the road with its bold stance, powerful diesel engine, and spacious 7-seat cabin. Perfect for long highway drives or city commutes in style.",
        imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800", available: true,
      },
      {
        brand: "BMW", model: "5 Series", year: 2024, pricePerDay: "9999",
        transmission: "automatic", fuelType: "petrol", seats: 5, location: "Mumbai",
        description: "The ultimate executive sedan. The BMW 5 Series blends sporty dynamics with refined luxury — twin-turbocharged engine, ambient lighting, and a panoramic sunroof make every drive an event.",
        imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800", available: true,
      },
      {
        brand: "Mercedes-Benz", model: "E-Class", year: 2024, pricePerDay: "11999",
        transmission: "automatic", fuelType: "petrol", seats: 5, location: "Delhi",
        description: "Timeless German luxury. The E-Class features MBUX infotainment, Burmester surround sound, and a silky-smooth ride that makes it the preferred choice for business travel across India.",
        imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800", available: true,
      },
      {
        brand: "Tata", model: "Nexon EV", year: 2024, pricePerDay: "2999",
        transmission: "automatic", fuelType: "electric", seats: 5, location: "Bengaluru",
        description: "India's best-selling electric SUV. The Nexon EV offers a 465 km range, fast charging, and a feature-packed cabin. Drive green without compromising on performance or comfort.",
        imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800", available: true,
      },
      {
        brand: "Mahindra", model: "Thar Roxx", year: 2024, pricePerDay: "3999",
        transmission: "automatic", fuelType: "diesel", seats: 5, location: "Pune",
        description: "Born for adventure. The Thar Roxx combines off-road capability with modern comfort — 4x4 drivetrain, convertible roof, and rugged good looks that turn heads everywhere you go.",
        imageUrl: "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800", available: true,
      },
      {
        brand: "Hyundai", model: "Creta", year: 2024, pricePerDay: "2499",
        transmission: "automatic", fuelType: "petrol", seats: 5, location: "Chennai",
        description: "India's favourite compact SUV. The Creta offers a panoramic sunroof, ADAS safety suite, and a premium interior at an accessible price. Ideal for city drives and weekend getaways.",
        imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800", available: true,
      },
      {
        brand: "Audi", model: "Q7", year: 2023, pricePerDay: "14999",
        transmission: "automatic", fuelType: "diesel", seats: 7, location: "Hyderabad",
        description: "Flagship luxury SUV from Audi. The Q7 impresses with its air suspension, quattro all-wheel drive, and a cavernous 7-seat interior wrapped in Valcona leather. Pure prestige on wheels.",
        imageUrl: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800", available: true,
      },
      {
        brand: "Kia", model: "Seltos", year: 2024, pricePerDay: "2199",
        transmission: "manual", fuelType: "petrol", seats: 5, location: "Kolkata",
        description: "Stylish and feature-rich compact SUV. The Seltos packs a 10.25-inch touchscreen, Bose sound system, and a turbocharged engine into a sharp design that stands out in any crowd.",
        imageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800", available: true,
      },
      {
        brand: "Volvo", model: "XC90", year: 2024, pricePerDay: "17999",
        transmission: "automatic", fuelType: "hybrid", seats: 7, location: "Delhi",
        description: "Scandinavian luxury meets Indian roads. The XC90 Recharge plug-in hybrid offers a serene cabin, class-leading safety tech, and a 7-seat layout — the pinnacle of family luxury travel.",
        imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800", available: true,
      },
      {
        brand: "Maruti Suzuki", model: "Ertiga", year: 2024, pricePerDay: "1799",
        transmission: "automatic", fuelType: "petrol", seats: 7, location: "Jaipur",
        description: "India's most trusted family MPV. The Ertiga offers 7 comfortable seats, excellent fuel efficiency, and a smooth CNG option — perfect for family road trips across Rajasthan and beyond.",
        imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800", available: true,
      },
      {
        brand: "Porsche", model: "Cayenne", year: 2023, pricePerDay: "24999",
        transmission: "automatic", fuelType: "petrol", seats: 5, location: "Mumbai",
        description: "The sports car of SUVs. The Cayenne delivers supercar performance in an SUV body — 0-100 in 4.9 seconds, adaptive air suspension, and a Porsche Communication Management system that redefines in-car tech.",
        imageUrl: "https://images.unsplash.com/photo-1503376760302-8fac2a800d02?w=800", available: true,
      },
      {
        brand: "Honda", model: "City Hybrid", year: 2024, pricePerDay: "1999",
        transmission: "automatic", fuelType: "hybrid", seats: 5, location: "Bengaluru",
        description: "The smartest sedan in its class. The City e:HEV self-charges its battery while driving, delivering 26+ km/l efficiency. A perfect blend of technology, comfort, and economy for daily city use.",
        imageUrl: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800", available: true,
      },
    ]);
    console.log("Cars seeded");
  }
  console.log("Done!");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });

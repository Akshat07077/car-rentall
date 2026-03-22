"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CarCard, type CarData } from "@/components/car-card";
import { apiFetch } from "@/lib/api";
import { Shield, Clock, Star, MapPin, IndianRupee, Headphones } from "lucide-react";

const CITIES = [
  { name: "Mumbai", emoji: "🏙️" },
  { name: "Delhi", emoji: "🕌" },
  { name: "Bengaluru", emoji: "🌿" },
  { name: "Hyderabad", emoji: "💎" },
  { name: "Chennai", emoji: "🌊" },
  { name: "Pune", emoji: "🏔️" },
  { name: "Kolkata", emoji: "🎨" },
  { name: "Jaipur", emoji: "🏯" },
];

export default function Home() {
  const { data: cars, isLoading } = useQuery<CarData[]>({
    queryKey: ["cars", { available: true }],
    queryFn: () => apiFetch<CarData[]>("/api/cars?available=true"),
  });

  const featuredCars = cars?.slice(0, 3) ?? [];

  return (
    <div className="w-full">
      {/* Hero — split layout */}
      <div className="relative w-full min-h-[580px] md:min-h-[680px] overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[580px] md:min-h-[680px] py-16 md:py-24">

            {/* Left: Text */}
            <div className="relative z-10">
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-4 py-1.5 text-sm font-semibold mb-6 border border-primary/20">
                🇮🇳 LuxeCars Rentals · India&apos;s Premium Fleet
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-foreground leading-[1.05] tracking-tight mb-6">
                Drive Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                  Dream Car
                </span>{" "}
                Across India.
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
                From Mumbai to Delhi, Bengaluru to Jaipur — explore India in style with our curated fleet of premium and luxury vehicles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cars">
                  <Button size="lg" className="rounded-xl px-8 h-14 text-base font-semibold shadow-xl shadow-primary/20 w-full sm:w-auto">
                    Browse Fleet
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="rounded-xl px-8 h-14 text-base font-semibold w-full sm:w-auto">
                    Create Account
                  </Button>
                </Link>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-border/50">
                {[
                  { value: "500+", label: "Cars" },
                  { value: "8+", label: "Cities" },
                  { value: "50K+", label: "Customers" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-display font-extrabold text-primary">{value}</p>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Video */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative w-full aspect-[9/16] max-h-[580px] rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/30">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  {/* Aerial parking lot / cars video — pexels.com/video/5992517 */}
                  <source src="https://www.pexels.com/download/video/5992517/" type="video/mp4" />
                </video>
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                {/* Floating badge */}
                <div className="absolute bottom-6 left-6 right-6 bg-background/80 backdrop-blur-md rounded-2xl p-4 border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Now Available</p>
                  <p className="font-display font-bold text-lg">Family & Premium Cars · 8 Cities</p>
                  <p className="text-sm text-primary font-semibold">Starting ₹699/day</p>
                </div>
              </div>
              {/* Decorative blur */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-14 md:py-24 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            {[
              { icon: Shield, title: "Fully Insured", desc: "Comprehensive insurance coverage included with every rental across India." },
              { icon: Headphones, title: "24/7 Support", desc: "Hindi & English support available round the clock. Call us anytime." },
              { icon: Star, title: "Premium Fleet", desc: "From Tata Nexon EV to Porsche Cayenne — we have the right car for every occasion." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cities */}
      <div className="py-14 md:py-20 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 tracking-tight">Available Across India</h2>
            <p className="text-muted-foreground text-lg">Pick up your car in any of our major city hubs.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CITIES.map((city) => (
              <Link key={city.name} href={`/cars?location=${city.name}`}>
                <div className="group flex items-center gap-3 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
                  <span className="text-2xl">{city.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">{city.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Available</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Cars */}
      <div className="py-14 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2 tracking-tight">Featured Vehicles</h2>
              <p className="text-muted-foreground text-lg">Hand-picked selections for your next journey.</p>
            </div>
            <Link href="/cars">
              <Button variant="outline" className="hidden sm:flex rounded-xl font-semibold">View All Cars</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-[250px] w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars.map((car) => <CarCard key={car.id} car={car} />)}
            </div>
          )}

          <div className="mt-10 sm:hidden">
            <Link href="/cars"><Button variant="outline" className="w-full rounded-xl">View All Cars</Button></Link>
          </div>
        </div>
      </div>

      {/* Why AutoLuxe */}
      <div className="py-14 md:py-24 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 mb-6 tracking-tight">The LuxeCars Difference</h2>
              <div className="space-y-5">
                {[
                  { icon: IndianRupee, title: "Transparent INR Pricing", desc: "No hidden charges. What you see is what you pay — all prices in Indian Rupees including GST." },
                  { icon: Shield, title: "Zero Deposit Options", desc: "Book premium cars without a security deposit. We trust our verified members." },
                  { icon: MapPin, title: "Doorstep Delivery", desc: "We deliver the car to your home, hotel, or office across all major Indian cities." },
                  { icon: Clock, title: "Flexible Rentals", desc: "Hourly, daily, or weekly — rent on your terms with free cancellation up to 24 hours before pickup." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{title}</h4>
                      <p className="text-muted-foreground text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "8+", label: "Cities" },
                { value: "500+", label: "Premium Cars" },
                { value: "50K+", label: "Happy Customers" },
                { value: "4.9★", label: "Average Rating" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-background border border-border rounded-2xl p-6 text-center">
                  <p className="text-4xl font-display font-extrabold text-primary mb-2">{value}</p>
                  <p className="text-muted-foreground font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

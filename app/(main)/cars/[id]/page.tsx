"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { differenceInDays } from "date-fns";
import { Users, Fuel, Settings2, MapPin, CheckCircle2, AlertCircle, Shield, Zap, Star, Phone } from "lucide-react";
import { formatINR, type CarData } from "@/components/car-card";

const defaultImage = "https://images.unsplash.com/photo-1503376760302-8fac2a800d02?w=1200&q=80";

const INCLUSIONS = [
  "Comprehensive insurance included",
  "24/7 roadside assistance",
  "Unlimited kilometres",
  "GST included in price",
  "Free cancellation up to 24 hrs",
];

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: car, isLoading, error } = useQuery<CarData>({
    queryKey: ["car", id],
    queryFn: () => apiFetch<CarData>(`/api/cars/${id}`),
  });

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const { data: availability, isLoading: isChecking } = useQuery<{ available: boolean }>({
    queryKey: ["availability", id, pickupDate, returnDate],
    queryFn: () => apiFetch<{ available: boolean }>(`/api/cars/${id}/availability?pickup_date=${pickupDate}&return_date=${returnDate}`),
    enabled: !!pickupDate && !!returnDate,
  });

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Skeleton className="h-[500px] w-full rounded-3xl mb-8" />
      <Skeleton className="h-12 w-1/3 mb-4" />
    </div>
  );

  if (error || !car) return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center">
      <h2 className="text-3xl font-bold font-display">Car Not Found</h2>
      <Button className="mt-8" onClick={() => router.push("/cars")}>Back to Fleet</Button>
    </div>
  );

  const today = new Date().toISOString().split("T")[0];
  const days = pickupDate && returnDate ? differenceInDays(new Date(returnDate), new Date(pickupDate)) : 0;
  const total = days > 0 ? days * car.pricePerDay : 0;
  const isAvailable = availability?.available ?? true;

  const handleBookNow = () => {
    if (!pickupDate || !returnDate) {
      toast({ title: "Dates Required", description: "Please select both pickup and return dates.", variant: "destructive" });
      return;
    }
    if (days <= 0) {
      toast({ title: "Invalid Dates", description: "Return date must be after pickup date.", variant: "destructive" });
      return;
    }
    if (!isAvailable) {
      toast({ title: "Unavailable", description: "Car is not available for selected dates.", variant: "destructive" });
      return;
    }
    router.push(`/booking/${car.id}?pickup=${pickupDate}&return=${returnDate}`);
  };

  return (
    <div className="bg-background pb-16 md:pb-24">
      {/* Hero Image */}
      <div className="relative w-full h-[40vh] md:h-[60vh] bg-muted overflow-hidden">
        <Image src={car.imageUrl || defaultImage} alt={`${car.brand} ${car.model}`} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">

          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-card p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-xl border border-border/50">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">{car.year}</Badge>
                <Badge variant="outline" className="capitalize border-border/50">{car.fuelType}</Badge>
                {!car.available && <Badge variant="destructive">Currently Unavailable</Badge>}
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight mb-2">{car.brand} {car.model}</h1>
              <p className="text-muted-foreground flex items-center gap-2 text-lg mb-6">
                <MapPin className="w-5 h-5 text-primary" /> {car.location}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-6">
                {[
                  { icon: Settings2, label: "Transmission", value: car.transmission },
                  { icon: Fuel, label: "Fuel", value: car.fuelType },
                  { icon: Users, label: "Seats", value: `${car.seats} People` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col gap-2 bg-muted/40 rounded-xl p-4">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">{label}</span>
                    <div className="flex items-center gap-2 font-semibold capitalize">
                      <Icon className="w-4 h-4 text-primary" /> {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className="bg-card p-5 md:p-8 rounded-2xl md:rounded-3xl border border-border/50">
                <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" /> About this Car
                </h2>
                <p className="text-muted-foreground leading-relaxed">{car.description}</p>
              </div>
            )}

            {/* What's Included */}
            <div className="bg-card p-5 md:p-8 rounded-2xl md:rounded-3xl border border-border/50">
              <h2 className="text-xl font-bold font-display mb-5 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> What&apos;s Included
              </h2>
              <ul className="space-y-3">
                {INCLUSIONS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Need Help */}
            <div className="bg-primary/5 border border-primary/20 p-5 md:p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold">Need help choosing?</p>
                <p className="text-sm text-muted-foreground">Call us at <span className="font-semibold text-foreground">+91 98765 43210</span> — available 24/7 in Hindi & English.</p>
              </div>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="bg-card rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl border border-border/50 lg:sticky lg:top-28">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-3xl font-display font-bold text-primary">{formatINR(car.pricePerDay)}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Per day · GST incl.</p>
                </div>
                {car.available
                  ? <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200 flex items-center gap-1"><Zap className="w-3 h-3" /> Available</span>
                  : <span className="text-xs font-semibold text-destructive bg-destructive/10 px-3 py-1 rounded-full">Unavailable</span>}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Pickup Date</Label>
                    <Input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} min={today} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Return Date</Label>
                    <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} min={pickupDate || today} className="h-12 rounded-xl" />
                  </div>
                </div>

                {pickupDate && returnDate && (
                  <div className="bg-muted/50 rounded-2xl p-5 border border-border/50">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-muted-foreground">{formatINR(car.pricePerDay)} × {days} days</span>
                      <span className="font-medium">{formatINR(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-muted-foreground">GST & Taxes</span>
                      <span className="font-medium text-green-600">Included</span>
                    </div>
                    <div className="border-t border-border/50 pt-3 flex justify-between items-center">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-xl text-primary">{formatINR(total)}</span>
                    </div>
                    {isChecking ? (
                      <p className="text-xs text-muted-foreground mt-3 text-center">Checking availability...</p>
                    ) : isAvailable ? (
                      <p className="text-xs text-green-600 mt-3 flex items-center justify-center gap-1.5 font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Available for these dates</p>
                    ) : (
                      <p className="text-xs text-destructive mt-3 flex items-center justify-center gap-1.5 font-medium"><AlertCircle className="w-3.5 h-3.5" /> Not available for selected dates</p>
                    )}
                  </div>
                )}

                <Button size="lg" className="w-full h-14 rounded-xl text-base font-bold shadow-lg shadow-primary/20" onClick={handleBookNow} disabled={!car.available || isChecking || (!!pickupDate && !!returnDate && !isAvailable)}>
                  {car.available ? "Book Now" : "Unavailable"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">Free cancellation up to 24 hours before pickup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

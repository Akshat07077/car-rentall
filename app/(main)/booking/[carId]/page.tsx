"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { ArrowLeft, ShieldCheck, Car as CarIcon, CreditCard, UserCheck, CheckCircle2 } from "lucide-react";
import { formatINR, type CarData } from "@/components/car-card";

const DRIVER_PRICE_PER_DAY = 999;

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><Skeleton className="w-8 h-8 rounded-full" /></div>}>
      <BookingContent />
    </Suspense>
  );
}

function BookingContent() {
  const { carId } = useParams<{ carId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pickupDate = searchParams.get("pickup") ?? "";
  const returnDate = searchParams.get("return") ?? "";

  const { user, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [withDriver, setWithDriver] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/booking/${carId}?pickup=${pickupDate}&return=${returnDate}`);
    }
  }, [user, authLoading, router, carId, pickupDate, returnDate]);

  const { data: car, isLoading: carLoading } = useQuery<CarData>({
    queryKey: ["car", carId],
    queryFn: () => apiFetch<CarData>(`/api/cars/${carId}`),
    enabled: !!carId,
  });

  if (authLoading || carLoading || !user) {
    return <div className="min-h-screen flex justify-center items-center"><Skeleton className="w-8 h-8 rounded-full" /></div>;
  }

  if (!car || !pickupDate || !returnDate) {
    router.push("/cars");
    return null;
  }

  const days = differenceInDays(new Date(returnDate), new Date(pickupDate));
  const carTotal = days * car.pricePerDay;
  const driverTotal = withDriver ? days * DRIVER_PRICE_PER_DAY : 0;
  const grandTotal = carTotal + driverTotal;

  const handleConfirmPay = async () => {
    try {
      setIsProcessing(true);
      const booking = await apiFetch<{ id: number }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({ carId: car.id, pickupDate, returnDate, withDriver }),
      });
      const session = await apiFetch<{ sessionUrl: string }>("/api/payments/create-session", {
        method: "POST",
        body: JSON.stringify({ bookingId: booking.id }),
      });
      window.location.href = session.sessionUrl;
    } catch (e: any) {
      toast({ title: "Booking Failed", description: e.message || "An error occurred.", variant: "destructive" });
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-muted/30 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-4 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to details
        </Button>
        <h1 className="text-4xl font-display font-extrabold tracking-tight mb-8">Confirm Booking</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Vehicle Summary */}
            <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
              <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                <CarIcon className="w-5 h-5 text-primary" /> Vehicle Summary
              </h2>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/3 aspect-[4/3] rounded-xl overflow-hidden bg-muted relative">
                  {car.imageUrl
                    ? <Image src={car.imageUrl} alt={car.model} fill className="object-cover" />
                    : <div className="absolute inset-0 flex items-center justify-center bg-muted"><CarIcon className="w-8 h-8 text-muted-foreground" /></div>}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold font-display">{car.brand} {car.model}</h3>
                  <p className="text-muted-foreground mb-4">{car.year} • {car.transmission} • {car.fuelType}</p>
                  <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Pickup</p>
                      <p className="font-medium">{format(new Date(pickupDate), "MMM d, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Return</p>
                      <p className="font-medium">{format(new Date(returnDate), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Add-on */}
            <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
              <h2 className="text-xl font-bold font-display mb-2 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" /> Add a Chauffeur
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Sit back and relax — let a professional driver handle the roads.
              </p>

              <div
                onClick={() => setWithDriver(!withDriver)}
                className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${withDriver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${withDriver ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-base">Professional Chauffeur</p>
                      <p className="text-sm text-muted-foreground mt-1">Verified, background-checked driver. Includes fuel & tolls.</p>
                      <ul className="mt-3 space-y-1.5">
                        {["Licensed & verified driver", "Fuel & toll charges covered", "Available 24/7 during rental", "Hindi & English speaking"].map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${withDriver ? "text-primary" : "text-muted-foreground/50"}`} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg text-primary">+{formatINR(DRIVER_PRICE_PER_DAY)}</p>
                    <p className="text-xs text-muted-foreground">per day</p>
                    {withDriver && (
                      <p className="text-xs font-semibold text-primary mt-1">+{formatINR(driverTotal)} total</p>
                    )}
                  </div>
                </div>

                {/* Toggle indicator */}
                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${withDriver ? "bg-primary border-primary" : "border-border"}`}>
                  {withDriver && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>

              {withDriver && (
                <p className="mt-3 text-xs text-primary font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Chauffeur added — {formatINR(DRIVER_PRICE_PER_DAY)}/day × {days} days = {formatINR(driverTotal)}
                </p>
              )}
            </div>

            {/* Driver Details */}
            <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
              <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Renter Details
              </h2>
              <p className="font-medium">{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="md:col-span-1">
            <div className="bg-card p-6 rounded-3xl border border-border shadow-xl sticky top-28">
              <h2 className="text-xl font-bold font-display mb-6">Price Breakdown</h2>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{formatINR(car.pricePerDay)} × {days} days</span>
                  <span className="font-medium">{formatINR(carTotal)}</span>
                </div>
                {withDriver && (
                  <div className="flex justify-between text-primary">
                    <span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" /> Chauffeur × {days} days</span>
                    <span className="font-medium">+{formatINR(driverTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST & Taxes</span>
                  <span className="font-medium text-green-600">Included</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance</span>
                  <span className="font-medium text-green-600">Included</span>
                </div>
              </div>
              <div className="border-t border-border/50 pt-4 mb-8 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-3xl font-display text-primary">{formatINR(grandTotal)}</span>
              </div>
              <Button size="lg" className="w-full h-14 rounded-xl text-base font-bold shadow-lg shadow-primary/20" onClick={handleConfirmPay} disabled={isProcessing}>
                {isProcessing ? "Processing..." : <><CreditCard className="mr-2 h-5 w-5" /> Confirm & Pay</>}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">You will be redirected to Stripe securely.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

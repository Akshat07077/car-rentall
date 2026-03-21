"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { ArrowLeft, ShieldCheck, Car as CarIcon, CreditCard } from "lucide-react";
import { formatINR, type CarData } from "@/components/car-card";

export default function BookingPage() {
  const { carId } = useParams<{ carId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pickupDate = searchParams.get("pickup") ?? "";
  const returnDate = searchParams.get("return") ?? "";

  const { user, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

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
  const total = days * car.pricePerDay;

  const handleConfirmPay = async () => {
    try {
      setIsProcessing(true);
      const booking = await apiFetch<{ id: number }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({ carId: car.id, pickupDate, returnDate }),
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
            <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
              <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2"><CarIcon className="w-5 h-5 text-primary" /> Vehicle Summary</h2>
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

            <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
              <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Driver Details</h2>
              <p className="font-medium">{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-card p-6 rounded-3xl border border-border shadow-xl sticky top-28">
              <h2 className="text-xl font-bold font-display mb-6">Price Breakdown</h2>
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between"><span className="text-muted-foreground">{formatINR(car.pricePerDay)} × {days} days</span><span className="font-medium">{formatINR(total)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST & Taxes</span><span className="font-medium text-green-600">Included</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Insurance</span><span className="font-medium text-green-600">Included</span></div>
              </div>
              <div className="border-t border-border/50 pt-4 mb-8 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-3xl font-display text-primary">{formatINR(total)}</span>
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

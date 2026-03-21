"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Car, ListOrdered, ArrowLeft, LogOut } from "lucide-react";
import React, { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  }

  if (!user || user.role !== "admin") return null;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <aside className="w-64 border-r border-border bg-card fixed h-full z-10 flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              AutoLuxe <span className="text-primary text-sm uppercase ml-1">Admin</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          <Link href="/admin/cars">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${pathname === "/admin/cars" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
              <Car className="w-5 h-5" /> Manage Fleet
            </div>
          </Link>
          <Link href="/admin/bookings">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${pathname === "/admin/bookings" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
              <ListOrdered className="w-5 h-5" /> Bookings
            </div>
          </Link>
        </div>

        <div className="p-4 border-t border-border space-y-2">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4" /> Back to Site
          </Button>
          <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Log out
          </Button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

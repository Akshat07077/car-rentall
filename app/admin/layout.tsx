"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Car, ListOrdered, ArrowLeft, LogOut, LayoutDashboard, Users } from "lucide-react";
import React, { useEffect } from "react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/cars", label: "Manage Fleet", icon: Car },
  { href: "/admin/bookings", label: "Bookings", icon: ListOrdered },
  { href: "/admin/users", label: "Users", icon: Users },
];

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
            <div>
              <span className="font-display font-bold text-lg tracking-tight block leading-none">LuxeCars</span>
              <span className="text-primary text-[10px] uppercase font-bold tracking-widest">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer text-sm ${active ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
                  <Icon className="w-4 h-4" /> {label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <div className="px-4 py-2 mb-1">
            <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4" /> Back to Site
          </Button>
          <Button variant="destructive" className="w-full justify-start gap-2 text-sm" onClick={handleLogout}>
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

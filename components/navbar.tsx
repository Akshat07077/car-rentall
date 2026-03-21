"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Car, User, LogOut, LayoutDashboard, Settings, Menu, X, Home } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 md:w-10 md:h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="font-display font-bold text-xl md:text-2xl tracking-tight">AutoLuxe</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`}>Home</Link>
            <Link href="/cars" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/cars" ? "text-primary" : "text-muted-foreground"}`}>Browse Cars</Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel>
                    <p className="text-sm font-bold">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center py-2">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> My Bookings
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/cars" className="cursor-pointer flex items-center py-2">
                        <Settings className="mr-2 h-4 w-4" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive py-2">
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login"><Button variant="ghost" className="font-semibold">Log in</Button></Link>
                <Link href="/register"><Button className="font-semibold shadow-lg shadow-primary/20 rounded-xl">Sign up</Button></Link>
              </div>
            )}

            <button className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === "/" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}`}>
                <Home className="w-4 h-4" /> Home
              </div>
            </Link>
            <Link href="/cars" onClick={() => setMobileOpen(false)}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === "/cars" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}`}>
                <Car className="w-4 h-4" /> Browse Cars
              </div>
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === "/dashboard" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}`}>
                    <LayoutDashboard className="w-4 h-4" /> My Bookings
                  </div>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin/cars" onClick={() => setMobileOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors">
                      <Settings className="w-4 h-4" /> Admin Dashboard
                    </div>
                  </Link>
                )}
                <div className="pt-2 border-t border-border/40 mt-2">
                  <p className="px-4 py-1 text-xs text-muted-foreground">{user.email}</p>
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive w-full transition-colors">
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-border/40 mt-2 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}><Button variant="outline" className="w-full rounded-xl font-semibold">Log in</Button></Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}><Button className="w-full rounded-xl font-semibold shadow-lg shadow-primary/20">Sign up</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

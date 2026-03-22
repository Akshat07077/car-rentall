import Link from "next/link";
import { Car } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Car className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-xl tracking-tight">LuxeCars</span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-4">
              India&apos;s premier luxury car rental service. Drive premium vehicles across Mumbai, Delhi, Bengaluru, and 5+ more cities.
            </p>
            <p className="text-xs text-muted-foreground">CIN: U60220MH2024PTC123456 · GST: 27AABCA1234A1Z5</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-display">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/cars" className="hover:text-primary transition-colors">Browse Fleet</Link></li>
              <li><Link href="/cars?location=Mumbai" className="hover:text-primary transition-colors">Cars in Mumbai</Link></li>
              <li><Link href="/cars?location=Delhi" className="hover:text-primary transition-colors">Cars in Delhi</Link></li>
              <li><Link href="/cars?location=Bengaluru" className="hover:text-primary transition-colors">Cars in Bengaluru</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Member Login</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-display">Contact Us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>support@luxecars.in</li>
              <li>+91 98765 43210</li>
              <li>Available 24/7 · Hindi & English</li>
              <li className="pt-2">LuxeCars Rentals Pvt. Ltd.</li>
              <li>Level 5, Bandra Kurla Complex</li>
              <li>Mumbai, Maharashtra 400051</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} LuxeCars Rentals Pvt. Ltd. All rights reserved.</span>
          <span>Made with ❤️ in India 🇮🇳</span>
        </div>
      </div>
    </footer>
  );
}

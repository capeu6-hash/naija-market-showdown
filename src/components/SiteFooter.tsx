import { Link } from "@tanstack/react-router";
import { MessageCircle, Phone, Clock } from "lucide-react";

export const SUPPORT_WA = "https://wa.me/2348089778840?text=" + encodeURIComponent("Hi ShopArena NG, I need help with my order");

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="text-xl font-extrabold">ShopArena <span className="text-gold">NG</span></p>
          <p className="mt-2 text-sm text-ink-muted">Premium phones and laptops, supplied by GoGo Gadget and delivered across Nigeria.</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-bold text-gold">Customer Care</p>
          <p className="flex items-center gap-2 text-ink-muted"><Phone className="h-4 w-4" /> +234 808 977 8840</p>
          <p className="flex items-center gap-2 text-ink-muted"><Clock className="h-4 w-4" /> Mon – Sat, 8am – 9pm</p>
          <a href={SUPPORT_WA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 font-bold text-gold-foreground"><MessageCircle className="h-4 w-4" /> Chat on WhatsApp</a>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-bold text-gold">Shop</p>
          <Link to="/" className="block text-ink-muted hover:text-ink-foreground">All products</Link>
          <Link to="/checkout" className="block text-ink-muted hover:text-ink-foreground">Cart & checkout</Link>
          <p className="text-ink-muted">Pay by bank transfer · 7-day returns</p>
        </div>
      </div>
      <p className="border-t border-ink-muted/20 py-4 text-center text-xs text-ink-muted">© {new Date().getFullYear()} ShopArena NG</p>
    </footer>
  );
}

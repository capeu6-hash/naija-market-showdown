import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCart, naira } from "@/lib/cart";
import { useAuth, firstName } from "@/lib/auth";

export function SiteHeader() {
  const { count, total } = useCart();
  const { user, profile, signOut } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const logout = async () => { await qc.cancelQueries(); qc.clear(); await signOut(); navigate({ to: "/", replace: true }); };
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          <Link to="/" className="shrink-0 text-lg font-extrabold tracking-tight text-foreground">
            ShopArena <span className="text-primary">NG</span>
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            {user ? (
              <>
                <Link to="/account" className="truncate text-sm font-semibold text-foreground">Hi, {firstName(profile, user)}</Link>
                <button onClick={logout} className="shrink-0 text-xs text-muted-foreground underline">Logout</button>
              </>
            ) : (
              <Link to="/login" className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
                <User className="h-4 w-4" /> Sign In
              </Link>
            )}
            <Link to="/checkout" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background">
              <ShoppingCart className="h-4 w-4" /> {count}<span className="hidden sm:inline"> · {naira(total)}</span>
            </Link>
          </div>
        </div>
      </header>
      <div className="bg-success px-4 py-2 text-center text-xs font-medium text-success-foreground sm:text-sm">
        Delivery in Lagos 24-48hrs · Pay by bank transfer
      </div>
    </>
  );
}

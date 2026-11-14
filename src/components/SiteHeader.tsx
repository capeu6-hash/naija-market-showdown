import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Headphones, LogOut, ShoppingCart, UserRound } from "lucide-react";
import { SUPPORT_WA } from "@/components/SiteFooter";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCart, naira } from "@/lib/cart";
import { useCustomerSession } from "@/lib/customer-session";

export function SiteHeader() {
  const { count, total } = useCart();
  const { user, ready } = useCustomerSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const displayName = (user?.user_metadata?.["full_name"] as string | undefined)?.trim().split(" ")[0] || user?.email?.split("@")[0] || "Account";

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("You have been signed out");
    await navigate({ to: "/login", replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-muted/20 bg-ink/95 text-ink-foreground backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="shrink-0 text-lg font-extrabold tracking-tight text-ink-foreground">
            ShopArena <span className="text-gold">NG</span>
          </Link>
          <div className="flex items-center gap-2">
            <a href={SUPPORT_WA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink-foreground hover:bg-ink-muted/20">
              <Headphones className="h-4 w-4 text-gold" /> <span className="hidden sm:inline">Customer Care</span>
            </a>
            {ready && (user ? (
              <div className="flex items-center gap-1 rounded-lg border border-ink-muted/30 px-2 py-1.5">
                <UserRound className="h-4 w-4 text-gold" />
                <span className="hidden max-w-24 truncate text-sm font-semibold md:inline">{displayName}</span>
                <button type="button" onClick={signOut} aria-label="Log out" title="Log out" className="rounded-md p-1 text-ink-muted hover:text-ink-foreground">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" aria-label="Sign in" className="inline-flex items-center gap-1.5 rounded-lg border border-ink-muted/30 px-3 py-2 text-sm font-semibold hover:bg-ink-muted/20">
                <UserRound className="h-4 w-4" /> <span className="hidden sm:inline">Sign in</span>
              </Link>
            ))}
            <Link to="/checkout" aria-label={`Cart with ${count} items, ${naira(total)}`} className="inline-flex items-center gap-2 rounded-lg bg-gold px-3 py-2 text-sm font-bold text-gold-foreground">
              <ShoppingCart className="h-4 w-4" /> <span>{count}</span><span className="hidden md:inline">· {naira(total)}</span>
            </Link>
          </div>
        </div>
      </header>
      <div className="bg-gold px-4 py-2 text-center text-xs font-semibold text-gold-foreground sm:text-sm">
        All products supplied by GoGo Gadget · Lagos delivery 24-48hrs · Pay by bank transfer
      </div>
    </>
  );
}

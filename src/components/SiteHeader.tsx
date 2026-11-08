import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, ShoppingCart, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCart, naira } from "@/lib/cart";
import { useCustomerSession } from "@/lib/customer-session";

export function SiteHeader() {
  const { count, total } = useCart();
  const { user, ready } = useCustomerSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const displayName = (user?.user_metadata?.full_name as string | undefined)?.trim().split(" ")[0] || user?.email?.split("@")[0] || "Account";

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
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="shrink-0 text-lg font-extrabold tracking-tight text-foreground">
            ShopArena <span className="text-primary">NG</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/admin" aria-label="Admin" className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
              <ShieldCheck className="h-4 w-4" /> <span className="hidden sm:inline">Admin</span>
            </Link>
            {ready && (user ? (
              <div className="flex items-center gap-1 rounded-lg border border-border px-2 py-1.5">
                <UserRound className="h-4 w-4 text-primary" />
                <span className="hidden max-w-24 truncate text-sm font-semibold md:inline">{displayName}</span>
                <button type="button" onClick={signOut} aria-label="Log out" title="Log out" className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted">
                <UserRound className="h-4 w-4" /> <span className="hidden sm:inline">Sign in</span>
              </Link>
            ))}
            <Link to="/checkout" aria-label={`Cart with ${count} items, ${naira(total)}`} className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background">
              <ShoppingCart className="h-4 w-4" /> <span>{count}</span><span className="hidden md:inline">· {naira(total)}</span>
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

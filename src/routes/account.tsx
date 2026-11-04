import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { authField } from "@/components/AuthCard";
import { useAuth } from "@/lib/auth";
import { naira } from "@/lib/cart";
import { getMyOrders } from "@/lib/account.functions";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — ShopArena NG" },
      { name: "description", content: "Your ShopArena NG profile and order history." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "My Account — ShopArena NG" },
      { property: "og:description", content: "Your ShopArena NG profile and order history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

const STATUS: Record<string, string> = { awaiting_transfer: "Pending", transfer_sent: "Pending (confirming payment)", paid: "Paid — processing", delivered: "Delivered" };

function AccountPage() {
  const { user, profile, ready, refresh, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchOrders = useServerFn(getMyOrders);
  const orders = useQuery({ queryKey: ["my-orders", user?.id], queryFn: () => fetchOrders(), enabled: !!user });
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({ full_name: "", phone: "", address: "" });

  useEffect(() => { if (ready && !user) navigate({ to: "/login", search: { redirect: "/account" }, replace: true }); }, [ready, user, navigate]);
  useEffect(() => { if (profile) setF({ full_name: profile.full_name, phone: profile.phone ?? "", address: profile.address ?? "" }); }, [profile]);

  if (!ready || !user) return <div className="min-h-screen bg-muted"><SiteHeader /><p className="py-20 text-center text-muted-foreground">Loading…</p></div>;

  const save = async () => {
    if (f.full_name.trim().length < 2) { toast.error("Enter your full name"); return; }
    if (f.phone && !/^\+?\d{10,15}$/.test(f.phone)) { toast.error("Enter a valid phone number"); return; }
    const { error } = await supabase.from("profiles").update({ full_name: f.full_name.trim().slice(0, 120), phone: f.phone || null, address: f.address.trim().slice(0, 500) || null, updated_at: new Date().toISOString() }).eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    await refresh();
    setEditing(false);
    toast.success("Profile updated");
  };

  const logout = async () => { await qc.cancelQueries(); qc.clear(); await signOut(); navigate({ to: "/login", replace: true }); };

  return (
    <div className="min-h-screen bg-muted">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <section className="space-y-3 rounded-2xl bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold">My Account</h1>
            <button onClick={logout} className="text-sm text-muted-foreground underline">Logout</button>
          </div>
          {editing ? (
            <div className="space-y-2">
              <input className={authField} placeholder="Full Name" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
              <input className={authField} placeholder="Phone / WhatsApp" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/[^\d+]/g, "") })} />
              <textarea className={authField} rows={3} placeholder="Delivery address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
              <div className="flex gap-2">
                <button onClick={save} className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background">Save</button>
                <button onClick={() => setEditing(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <dl className="grid grid-cols-[90px_1fr] gap-y-1 text-sm">
                <dt className="text-muted-foreground">Name</dt><dd className="font-semibold">{profile?.full_name || "—"}</dd>
                <dt className="text-muted-foreground">Email</dt><dd>{user.email}</dd>
                <dt className="text-muted-foreground">Phone</dt><dd>{profile?.phone || "—"}</dd>
                <dt className="text-muted-foreground">Address</dt><dd>{profile?.address || "—"}</dd>
              </dl>
              <button onClick={() => setEditing(true)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">Edit Profile</button>
            </>
          )}
        </section>

        <section className="space-y-2 rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-lg font-bold">Order History</h2>
          {orders.isLoading && <p className="text-sm text-muted-foreground">Loading orders…</p>}
          {orders.data?.length === 0 && <p className="text-sm text-muted-foreground">No orders yet. <Link to="/" className="text-primary underline">Start shopping</Link></p>}
          {orders.data?.map((o) => (
            <div key={o.id} className="rounded-xl border border-border p-3 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-bold">{o.order_ref ?? o.id.slice(0, 8)}</span>
                <span className={o.status === "paid" || o.status === "delivered" ? "font-semibold text-success" : "text-muted-foreground"}>{STATUS[o.status] ?? o.status}</span>
              </div>
              <p className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-NG")}</p>
              <p>{o.order_items.map((i) => `${i.qty}× ${i.product_name}`).join(", ")}</p>
              <p className="font-semibold">Total {naira(Number(o.total))}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

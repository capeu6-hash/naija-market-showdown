import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SalesAnalytics } from "@/components/SalesAnalytics";
import { AiBulkAdd } from "@/components/admin/AiBulkAdd";
import { ProductForm, emptyProduct, type ProductDraft } from "@/components/admin/ProductForm";
import { SupplierForm, type SupplierDraft } from "@/components/admin/SupplierForm";
import { naira } from "@/lib/cart";
import { adminLogin, getAdminDashboard, confirmOrderPaid, deleteProduct, deleteSupplier } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — ShopArena NG" },
      { name: "description", content: "ShopArena NG store management." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — ShopArena NG" },
      { property: "og:description", content: "ShopArena NG store management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const TOKEN_KEY = "shoparena_admin";
export type Dashboard = Awaited<ReturnType<typeof getAdminDashboard>>;
const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const btn = "w-full rounded-lg bg-foreground py-2 text-sm font-semibold text-background disabled:opacity-50";
const TABS = ["Products", "Suppliers", "Orders", "AI Bulk Add"] as const;

function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => setToken(localStorage.getItem(TOKEN_KEY)), []);
  const logout = () => { localStorage.removeItem(TOKEN_KEY); setToken(null); };
  return (
    <div className="min-h-screen bg-muted">
      <SiteHeader />
      {token ? <AdminView token={token} onLogout={logout} /> : <Login onLogin={(t) => { localStorage.setItem(TOKEN_KEY, t); setToken(t); }} />}
    </div>
  );
}

function Login({ onLogin }: { onLogin: (t: string) => void }) {
  const login = useServerFn(adminLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const r = await login({ data: { email, password } });
          if (r.ok) onLogin(r.token); else toast.error("Wrong email or password");
        } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
      }}
      className="mx-auto mt-10 max-w-sm space-y-3 rounded-2xl bg-card p-6 shadow-sm"
    >
      <h2 className="text-xl font-bold">Admin Login</h2>
      <input className={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className={field} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button disabled={busy} className={btn}>{busy ? "Checking…" : "Login"}</button>
    </form>
  );
}

function AdminView({ token, onLogout }: { token: string; onLogout: () => void }) {
  const getDash = useServerFn(getAdminDashboard);
  const delP = useServerFn(deleteProduct);
  const delS = useServerFn(deleteSupplier);
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Products");
  const [editP, setEditP] = useState<ProductDraft | null>(null);
  const [editS, setEditS] = useState<SupplierDraft | null>(null);

  const load = useCallback(async () => {
    try { setDash(await getDash({ data: { token } })); } catch { toast.error("Session expired, log in again"); onLogout(); }
  }, [getDash, token, onLogout]);
  useEffect(() => { void load(); }, [load]);

  if (!dash) return <p className="py-20 text-center text-muted-foreground">Loading…</p>;
  const supName = new Map(dash.suppliers.map((s) => [s.id, s.business_name]));
  const stats = [
    ["Total Products", String(dash.stats.totalProducts)],
    ["Total Orders", String(dash.stats.totalOrders)],
    ["Total Revenue", naira(dash.stats.totalRevenue)],
    ["Total Profit", naira(dash.stats.totalProfit)],
  ];
  const stockProfit = dash.products.reduce((s, p) => s + (p.profit ?? 0) * p.stock, 0);

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
        <button onClick={onLogout} className="text-sm text-muted-foreground underline">Log out</button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">{k}</p>
            <p className={`mt-1 text-xl font-extrabold ${k === "Total Profit" ? "text-success" : ""}`}>{v}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Revenue and profit count paid orders. If all current stock sells, profit would be {naira(stockProfit)}.</p>

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${tab === t ? "bg-foreground text-background" : "bg-card text-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "Products" && (
        <section className="space-y-4">
          <button onClick={() => setEditP(emptyProduct())} className="rounded-lg bg-success px-4 py-2 text-sm font-bold text-success-foreground">+ Add Product</button>
          {editP && <ProductForm token={token} initial={editP} suppliers={dash.suppliers} onDone={() => { setEditP(null); void load(); }} onCancel={() => setEditP(null)} />}
          <div className="overflow-x-auto rounded-2xl bg-card shadow-sm">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-secondary text-left text-xs text-muted-foreground">
                <tr><th className="p-3">Product</th><th>Category</th><th>Selling</th><th>Cost</th><th>Delivery cost</th><th>Profit</th><th>Stock</th><th>Supplier</th><th /></tr>
              </thead>
              <tbody>
                {dash.products.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="flex items-center gap-2 p-3">
                      {p.image_url ? <img src={p.image_url} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-secondary" />}
                      <span className="font-semibold">{p.name}</span>
                    </td>
                    <td>{p.category}</td>
                    <td>{naira(p.selling_price)}</td>
                    <td>{p.cost_price_private == null ? "—" : naira(p.cost_price_private)}</td>
                    <td>{naira(p.delivery_cost)}</td>
                    <td className="font-bold text-success">{p.profit == null ? "—" : naira(p.profit)}</td>
                    <td>{p.stock}</td>
                    <td>{p.supplier_id ? supName.get(p.supplier_id) ?? "—" : "—"}</td>
                    <td className="whitespace-nowrap pr-3">
                      <button aria-label={`Edit ${p.name}`} className="p-1.5" onClick={() => { setEditP({ id: p.id, name: p.name, description: p.description ?? "", image_url: p.image_url ?? "", images: p.images ?? [], category: p.category, cost_price_private: p.cost_price_private ?? 0, delivery_cost: p.delivery_cost, selling_price: p.selling_price, old_price: p.old_price, stock: p.stock, supplier_id: p.supplier_id }); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil className="h-4 w-4" /></button>
                      <button aria-label={`Delete ${p.name}`} className="p-1.5 text-destructive" onClick={async () => { if (!confirm(`Delete ${p.name}?`)) return; try { await delP({ data: { token, id: p.id } }); toast.success("Deleted"); void load(); } catch (e) { toast.error((e as Error).message); } }}><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "Suppliers" && (
        <section className="grid gap-4 md:grid-cols-[340px_1fr]">
          <SupplierForm key={editS?.id ?? "new"} token={token} initial={editS} onDone={() => { setEditS(null); void load(); }} onCancel={() => setEditS(null)} />
          <div className="space-y-2">
            {dash.suppliers.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-3 rounded-2xl bg-card p-4 shadow-sm">
                <div className="text-sm">
                  <p className="font-bold">{s.business_name}</p>
                  <p className="text-muted-foreground">{[s.whatsapp, s.location].filter(Boolean).join(" · ")}</p>
                  {s.supplies && <p>Supplies: {s.supplies}</p>}
                  {s.cost_price != null && <p>Cost price: {naira(Number(s.cost_price))}</p>}
                  <p className="text-xs text-muted-foreground">{dash.products.filter((p) => p.supplier_id === s.id).length} products</p>
                </div>
                <div className="flex shrink-0">
                  <button aria-label={`Edit ${s.business_name}`} className="p-1.5" onClick={() => setEditS({ id: s.id, business_name: s.business_name, whatsapp: s.whatsapp ?? "", location: s.location ?? "", supplies: s.supplies ?? "", cost_price: s.cost_price == null ? null : Number(s.cost_price) })}><Pencil className="h-4 w-4" /></button>
                  <button aria-label={`Delete ${s.business_name}`} className="p-1.5 text-destructive" onClick={async () => { if (!confirm(`Delete ${s.business_name}?`)) return; try { await delS({ data: { token, id: s.id } }); toast.success("Deleted"); void load(); } catch (e) { toast.error((e as Error).message); } }}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "Orders" && (
        <section className="space-y-4">
          <SalesAnalytics orders={dash.orders} />
          <div className="space-y-2">
            {dash.orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
            {dash.orders.map((o) => (
              <div key={o.id} className="rounded-2xl bg-card p-4 text-sm shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold">{o.order_ref ?? o.id.slice(0, 8)} · {o.customer_name}</span>
                  <span className={o.status === "paid" ? "text-success" : o.status === "transfer_sent" ? "font-semibold text-primary" : "text-muted-foreground"}>{o.status === "transfer_sent" ? "Money sent — confirm" : o.status}</span>
                </div>
                <p className="text-muted-foreground">{o.phone} · {[o.address, o.region, o.town, o.state, o.country].filter(Boolean).join(", ")}</p>
                <p>{o.order_items.map((i) => `${i.qty}× ${i.product_name}`).join(", ")}</p>
                <p>Total {naira(Number(o.total))} (delivery {naira(Number(o.delivery_fee))}) · Profit <span className="font-semibold text-success">{naira(o.order_items.reduce((a, i) => a + Number(i.profit_hidden), 0))}</span></p>
                {o.status !== "paid" && <ConfirmBtn token={token} id={o.id} onDone={load} />}
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "AI Bulk Add" && <AiBulkAdd token={token} suppliers={dash.suppliers} onPublished={() => { void load(); setTab("Products"); }} />}
    </main>
  );
}

function ConfirmBtn({ token, id, onDone }: { token: string; id: string; onDone: () => void }) {
  const confirmPaid = useServerFn(confirmOrderPaid);
  const [busy, setBusy] = useState(false);
  return (
    <button disabled={busy} onClick={async () => { setBusy(true); try { await confirmPaid({ data: { token, id } }); toast.success("Marked as paid"); onDone(); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); } }}
      className="mt-2 rounded-lg bg-success px-3 py-1.5 text-xs font-bold text-success-foreground disabled:opacity-50">Confirm payment received</button>
  );
}

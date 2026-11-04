import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, Truck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { useCart, naira } from "@/lib/cart";
import { productsQuery } from "@/lib/catalog";
import { BANK, COUNTRIES, LAGOS_AREAS, NG_STATES, STORE_WHATSAPP, deliveryFee } from "@/lib/delivery";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ context, params }) => {
    const list = await context.queryClient.ensureQueryData(productsQuery);
    const p = list.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return { name: p.name, description: p.description ?? "" };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — ShopArena NG` },
          { name: "description", content: loaderData.description.slice(0, 155) },
          { property: "og:title", content: `${loaderData.name} — ShopArena NG` },
          { property: "og:description", content: loaderData.description.slice(0, 155) },
          { property: "og:type", content: "product" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Product unavailable — ShopArena NG" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-muted"><SiteHeader />
      <p className="py-20 text-center text-muted-foreground">This product is no longer available. <Link to="/" className="font-semibold text-foreground underline">Back to shop</Link></p>
    </div>
  ),
  component: ProductPage,
});

const field = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
const label = "mb-1 block text-xs font-semibold text-foreground";

function ProductPage() {
  const { id } = Route.useParams();
  const { data: products } = useSuspenseQuery(productsQuery);
  const p = products.find((x) => x.id === id)!;
  const { add } = useCart();
  const navigate = useNavigate();
  const gallery = [p.image_url, ...p.images].filter((x): x is string => !!x);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [d, setD] = useState({ country: "Nigeria", state: "Lagos", town: "", region: "Ikeja", address: "" });
  const isNg = d.country === "Nigeria";
  const fee = deliveryFee(d.country, d.state, d.region);
  const total = p.selling_price * qty + fee;
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);

  const addToCart = () => add({ id: p.id, name: p.name, selling_price: p.selling_price, stock: p.stock, image_url: p.image_url });
  const addQty = () => { for (let i = 0; i < qty; i++) addToCart(); };
  const wa = () => {
    const msg = `Hello ShopArena NG, I want to order:\n${qty} x ${p.name} (${naira(p.selling_price)})\nDelivery: ${[d.address, d.region, d.town, d.state, d.country].filter(Boolean).join(", ")}\nDelivery fee: ${naira(fee)}\nTotal: ${naira(total)}\nI will pay by bank transfer to ${BANK.name} ${BANK.accountNumber} (${BANK.accountName}).`;
    window.open(`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  return (
    <div className="min-h-screen bg-muted pb-10">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-5">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back to shop</Link>
        <div className="mt-3 grid gap-5 md:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-2xl bg-card">
              {gallery[active] ? <img src={gallery[active]} alt={p.name} width={800} height={800} className="aspect-square w-full object-cover" /> : <div className="aspect-square bg-secondary" />}
            </div>
            {gallery.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {gallery.map((g, i) => (
                  <button key={g + i} onClick={() => setActive(i)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? "border-foreground" : "border-transparent"}`}>
                    <img src={g} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{p.category}</p>
              <h1 className="mt-1 text-2xl font-extrabold">{p.name}</h1>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-2xl font-extrabold text-success">{naira(p.selling_price)}</span>
                {p.old_price ? <span className="text-muted-foreground line-through">{naira(p.old_price)}</span> : null}
              </div>
              <p className={`mt-1 text-sm font-semibold ${p.stock > 0 ? "text-success" : "text-destructive"}`}>
                {p.stock > 5 ? `In stock (${p.stock} available)` : p.stock > 0 ? `Only ${p.stock} left!` : "Out of stock"}
              </p>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">{p.description}</p>
              <div className="mt-4 flex items-center gap-3">
                <label htmlFor="qty" className="text-sm font-semibold">Qty</label>
                <input id="qty" type="number" min={1} max={Math.max(1, p.stock)} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(p.stock || 1, Number(e.target.value) || 1)))} className="w-20 rounded-lg border border-input px-2 py-1.5 text-sm" />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button disabled={p.stock <= 0} onClick={() => { addQty(); toast.success("Added to cart"); }} className="rounded-xl border-2 border-foreground py-3 text-sm font-bold disabled:opacity-40">Add to Cart</button>
                <button disabled={p.stock <= 0} onClick={() => { addQty(); navigate({ to: "/checkout" }); }} className="rounded-xl bg-foreground py-3 text-sm font-bold text-background disabled:opacity-40">Buy Now · Bank Transfer</button>
              </div>
            </div>

            <div className="rounded-2xl bg-card p-5">
              <h2 className="flex items-center gap-2 font-bold"><Truck className="h-5 w-5" /> Delivery fee calculator</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div><label className={label} htmlFor="c">Country</label>
                  <select id="c" className={field} value={d.country} onChange={(e) => setD((x) => ({ ...x, country: e.target.value, state: e.target.value === "Nigeria" ? "Lagos" : "", region: "" }))}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></div>
                <div><label className={label} htmlFor="s">State</label>
                  {isNg ? <select id="s" className={field} value={d.state} onChange={(e) => setD((x) => ({ ...x, state: e.target.value, region: "" }))}>{NG_STATES.map((s) => <option key={s}>{s}</option>)}</select>
                    : <input id="s" className={field} value={d.state} onChange={(e) => setD((x) => ({ ...x, state: e.target.value }))} />}</div>
                <div><label className={label} htmlFor="t">Town / City</label><input id="t" className={field} value={d.town} onChange={(e) => setD((x) => ({ ...x, town: e.target.value }))} placeholder="e.g. Ikeja" /></div>
                <div><label className={label} htmlFor="r">Region / Area</label>
                  {isNg && d.state === "Lagos" ? <select id="r" className={field} value={d.region} onChange={(e) => setD((x) => ({ ...x, region: e.target.value }))}><option value="">Select area</option>{LAGOS_AREAS.map((a) => <option key={a}>{a}</option>)}</select>
                    : <input id="r" className={field} value={d.region} onChange={(e) => setD((x) => ({ ...x, region: e.target.value }))} />}</div>
                <div className="sm:col-span-2"><label className={label} htmlFor="a">Detailed Address</label><input id="a" className={field} value={d.address} onChange={(e) => setD((x) => ({ ...x, address: e.target.value }))} placeholder="House number, street, landmark" /></div>
              </div>
              <div className="mt-4 space-y-1 rounded-xl bg-secondary p-3 text-sm">
                <div className="flex justify-between"><span>Item{qty > 1 ? `s (${qty})` : ""}</span><span>{naira(p.selling_price * qty)}</span></div>
                <div className="flex justify-between"><span>Delivery fee</span><span>{naira(fee)}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>{naira(total)}</span></div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Pay by bank transfer: {BANK.name} · {BANK.accountNumber} · {BANK.accountName}</p>
              <button onClick={wa} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-success py-3 text-sm font-bold text-success-foreground">
                <MessageCircle className="h-4 w-4" /> Confirm order on WhatsApp
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <>
            <h2 className="mb-3 mt-8 text-lg font-bold">More {p.category}</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
          </>
        )}
      </main>
    </div>
  );
}

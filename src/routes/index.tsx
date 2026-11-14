import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, X, Smartphone, Laptop, ShieldCheck, Truck, BadgeCheck } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import heroImg from "@/assets/hero-gadgets.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { Slider } from "@/components/ui/slider";
import { useCart, naira } from "@/lib/cart";
import { CATEGORIES, filterProducts, matches, productsQuery, type SortKey } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShopArena NG — Phones, Laptops, Shoes & Gadgets in Lagos" },
      { name: "description", content: "Shop phones, laptops, shoes, bags, fashion and gadgets in Nigeria with fast Lagos delivery and simple bank transfer payment." },
      { property: "og:title", content: "ShopArena NG — Phones, Laptops, Shoes & Gadgets" },
      { property: "og:description", content: "Quality products, fast Lagos delivery, pay by bank transfer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: ShopView,
});

function ShopView() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { count, total } = useCart();
  const navigate = useNavigate();
  const ceiling = useMemo(() => Math.max(10000, ...products.map((p) => p.selling_price)), [products]);
  const [q, setQ] = useState("");
  const [typing, setTyping] = useState("");
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [range, setRange] = useState<[number, number]>([0, ceiling]);
  const [sort, setSort] = useState<SortKey>("newest");

  const suggestions = useMemo(() => (typing.trim() ? products.filter((p) => matches(p, typing)).slice(0, 6) : []), [products, typing]);
  const results = filterProducts(products, { q, category, min: range[0], max: range[1], sort });
  const similar = useMemo(() => {
    if (results.length) return [];
    const inCat = category === "All" ? products : products.filter((p) => p.category === category);
    return [...(inCat.length ? inCat : products)].sort((a, b) => b.sold_count - a.sold_count).slice(0, 4);
  }, [results.length, products, category]);

  const featured = useMemo(() => [...products].sort((a, b) => b.selling_price - a.selling_price).slice(0, 8), [products]);
  const best = useMemo(() => [...products].sort((a, b) => b.sold_count - a.sold_count || b.stock - a.stock).slice(0, 8), [products]);
  const submit = (v: string) => { setQ(v); setTyping(v); setOpen(false); };
  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:bg-secondary"}`;

  return (
    <div className="min-h-screen bg-muted pb-16 md:pb-0">
      <SiteHeader />
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <img src={heroImg} alt="" width={1600} height={800} className="absolute inset-0 h-full w-full object-cover object-right opacity-70" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">New season deals</p>
          <h1 className="mt-3 max-w-xl text-4xl font-extrabold leading-tight md:text-6xl">Premium phones & laptops, delivered fast.</h1>
          <p className="mt-4 max-w-md text-ink-muted">Genuine devices from GoGo Gadget, clear delivery fees and simple bank transfer payment.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => { setCategory("Phones"); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }} className="rounded-full bg-gold px-6 py-3 font-bold text-gold-foreground transition hover:scale-105">Shop Phones</button>
            <button onClick={() => { setCategory("Laptops"); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }} className="rounded-full border border-gold px-6 py-3 font-bold text-gold transition hover:bg-gold hover:text-gold-foreground">Shop Laptops</button>
          </div>
        </div>
      </section>
      <section className="mx-auto -mt-6 grid max-w-6xl grid-cols-2 gap-3 px-4 md:grid-cols-4">
        {[{ c: "Phones", i: Smartphone }, { c: "Laptops", i: Laptop }].map(({ c, i: I }) => (
          <button key={c} onClick={() => { setCategory(c); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }} className="relative flex items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
            <span className="rounded-xl bg-gold-soft p-2.5"><I className="h-5 w-5 text-gold-foreground" /></span>
            <span><span className="block font-extrabold">{c}</span><span className="text-xs text-muted-foreground">{products.filter((p) => p.category === c).length} items</span></span>
          </button>
        ))}
        {[{ t: "Fast delivery", s: "Lagos 24-48hrs", i: Truck }, { t: "Genuine", s: "7-day returns", i: ShieldCheck }].map(({ t, s, i: I }) => (
          <div key={t} className="relative flex items-center gap-3 rounded-2xl bg-card p-4 shadow-md">
            <span className="rounded-xl bg-secondary p-2.5"><I className="h-5 w-5" /></span>
            <span><span className="block font-extrabold">{t}</span><span className="text-xs text-muted-foreground">{s}</span></span>
          </div>
        ))}
      </section>
      {products.length > 0 && (
        <>
          <Shelf title="Featured Products" items={featured} />
          <Shelf title="Best Sellers" items={best} />
          <section className="mx-auto max-w-6xl px-4 pt-8">
            <div className="flex flex-col items-start gap-4 rounded-3xl bg-ink p-6 text-ink-foreground md:flex-row md:items-center md:justify-between md:p-8">
              <div className="flex items-center gap-4">
                <span className="rounded-2xl bg-gold p-3"><BadgeCheck className="h-7 w-7 text-gold-foreground" /></span>
                <div><p className="text-xl font-extrabold md:text-2xl">All Products Supplied by GoGo Gadget</p><p className="text-sm text-ink-muted">Trusted supplier · genuine devices · quality checked before delivery</p></div>
              </div>
              <span className="rounded-full border border-gold px-4 py-1.5 text-sm font-bold text-gold">Trusted Supplier</span>
            </div>
          </section>
        </>
      )}
      <div id="shop" className="h-6" />
      <section className="mx-auto max-w-6xl rounded-3xl bg-background px-4 pb-4 pt-5 shadow-sm md:px-6">
        <h2 className="mx-auto mb-3 max-w-3xl text-xl font-extrabold">Browse all products</h2>
        <div className="mx-auto max-w-3xl">
          <form onSubmit={(e) => { e.preventDefault(); submit(typing); }} className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={typing}
              onChange={(e) => { setTyping(e.target.value); setOpen(true); if (!e.target.value) setQ(""); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Search for phones, laptops, shoes, bags..."
              aria-label="Search products"
              className="w-full rounded-2xl border-2 border-foreground bg-card py-4 pl-12 pr-24 text-base outline-none focus:ring-2 focus:ring-ring"
            />
            {typing && (
              <button type="button" aria-label="Clear search" onClick={() => submit("")} className="absolute right-20 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"><X className="h-4 w-4" /></button>
            )}
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-success px-4 py-2.5 text-sm font-bold text-success-foreground">Search</button>
            {open && suggestions.length > 0 && (
              <ul className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => navigate({ to: "/product/$id", params: { id: p.id } })} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-secondary">
                      {p.image_url ? <img src={p.image_url} alt="" className="h-11 w-11 rounded-lg object-cover" /> : <div className="h-11 w-11 rounded-lg bg-secondary" />}
                      <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                      <span className="text-sm font-bold text-success">{naira(p.selling_price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>

          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {["All", ...CATEGORIES].map((c) => <button key={c} onClick={() => setCategory(c)} className={chip(category === c)}>{c}</button>)}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_200px] sm:items-end">
            <div>
              <div className="mb-2 flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Price: {naira(range[0])} – {naira(range[1])}</span>
              </div>
              <Slider min={0} max={ceiling} step={1000} value={range} onValueChange={(v) => setRange([v[0], v[1]] as [number, number])} aria-label="Price range" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort products" className="rounded-xl border border-input bg-card px-3 py-2 text-sm">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="best">Best Selling</option>
            </select>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-5">
        {products.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            No products yet, go to <Link to="/admin" className="font-semibold text-foreground underline">admin</Link>.
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm font-semibold text-foreground">
              {q ? `${results.length} result${results.length === 1 ? "" : "s"} for '${q}'` : `${results.length} product${results.length === 1 ? "" : "s"}`}
            </p>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{results.map((p) => <ProductCard key={p.id} p={p} />)}</div>
            ) : (
              <>
                <div className="rounded-2xl bg-card p-6 text-center">
                  <p className="font-bold">No results found for {q ? `"${q}"` : "these filters"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try another word, or check these out:</p>
                </div>
                <h2 className="mb-3 mt-6 text-base font-bold">You may like</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{similar.map((p) => <ProductCard key={p.id} p={p} />)}</div>
              </>
            )}
          </>
        )}
      </main>
      <SiteFooter />
      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background p-3 md:hidden">
          <Link to="/checkout" className="block rounded-lg bg-success py-3 text-center font-semibold text-success-foreground">
            Checkout · {count} item{count > 1 ? "s" : ""} · {naira(total)}
          </Link>
        </div>
      )}
    </div>
  );
}

function Shelf({ title, items }: { title: string; items: ReturnType<typeof filterProducts> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <h2 className="mb-3 text-xl font-extrabold">{title}</h2>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {items.map((p) => <div key={p.id} className="w-44 shrink-0 snap-start md:w-56"><ProductCard p={p} /></div>)}
      </div>
    </section>
  );
}

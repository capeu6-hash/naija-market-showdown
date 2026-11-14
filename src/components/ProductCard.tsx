import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ImageIcon, Star } from "lucide-react";
import { useCart, naira } from "@/lib/cart";
import type { Product } from "@/lib/catalog";

export function ProductCard({ p }: { p: Product & { rating?: number } }) {
  const { add } = useCart();
  const off = p.old_price && p.old_price > p.selling_price ? Math.round((1 - p.selling_price / p.old_price) * 100) : 0;
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to="/product/$id" params={{ id: p.id }} className="relative block overflow-hidden bg-secondary">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} loading="lazy" width={400} height={400} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 bg-gold-soft text-gold-foreground/60"><ImageIcon className="h-8 w-8" /><span className="px-3 text-center text-xs font-semibold">{p.category}</span></div>
        )}
        {off > 0 && <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">-{off}%</span>}
        {p.stock > 0 && <span className="absolute right-2 top-2 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold text-success-foreground">In Stock</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Supplied by GoGo Gadget</span>
        <Link to="/product/$id" params={{ id: p.id }} className="line-clamp-2 text-sm font-bold text-card-foreground hover:underline">{p.name}</Link>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-extrabold text-foreground">{naira(p.selling_price)}</span>
          {p.old_price ? <span className="text-xs text-muted-foreground line-through">{naira(p.old_price)}</span> : null}
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3 w-3 fill-gold text-gold" />{(p.rating ?? 4.7).toFixed(1)} · {p.stock > 0 ? `${p.stock} left` : "Out of stock"}</p>
        <button
          disabled={p.stock <= 0}
          onClick={() => { add({ id: p.id, name: p.name, selling_price: p.selling_price, stock: p.stock, image_url: p.image_url }); toast.success("Added to cart"); }}
          className="mt-auto rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition hover:bg-gold hover:text-gold-foreground disabled:opacity-40"
        >Add to Cart</button>
      </div>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCart, naira } from "@/lib/cart";
import type { Product } from "@/lib/catalog";

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const off = p.old_price && p.old_price > p.selling_price ? Math.round((1 - p.selling_price / p.old_price) * 100) : 0;
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-card shadow-sm transition hover:shadow-md">
      <Link to="/product/$id" params={{ id: p.id }} className="relative block bg-secondary">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} loading="lazy" width={400} height={400} className="aspect-square w-full object-cover" />
        ) : (
          <div className="aspect-square w-full" />
        )}
        {off > 0 && <span className="absolute left-2 top-2 rounded-md bg-destructive px-1.5 py-0.5 text-xs font-bold text-destructive-foreground">-{off}%</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link to="/product/$id" params={{ id: p.id }} className="line-clamp-2 text-sm font-bold text-card-foreground hover:underline">{p.name}</Link>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-bold text-success">{naira(p.selling_price)}</span>
          {p.old_price ? <span className="text-xs text-muted-foreground line-through">{naira(p.old_price)}</span> : null}
        </div>
        <p className="text-xs text-muted-foreground">{p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</p>
        <button
          disabled={p.stock <= 0}
          onClick={() => {
            add({ id: p.id, name: p.name, selling_price: p.selling_price, stock: p.stock, image_url: p.image_url });
            toast.success("Added to cart");
          }}
          className="mt-auto rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background disabled:opacity-40"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

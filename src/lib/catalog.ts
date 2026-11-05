import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CATEGORIES = ["Phones", "Laptops", "Fashion", "Shoes", "Bags", "Gadgets"] as const;
export type SortKey = "newest" | "price_asc" | "price_desc" | "best";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  images: string[];
  selling_price: number;
  old_price: number | null;
  category: string;
  stock: number;
  sold_count: number;
  created_at: string;
};

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("public_products")
      .select("id, name, description, image_url, images, selling_price, old_price, category, stock, sold_count, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((p) => ({
      id: p.id!,
      name: p.name ?? "",
      description: p.description,
      image_url: p.image_url,
      images: p.images ?? [],
      selling_price: Number(p.selling_price ?? 0),
      old_price: p.old_price == null ? null : Number(p.old_price),
      category: p.category ?? "",
      stock: p.stock ?? 0,
      sold_count: p.sold_count ?? 0,
      created_at: p.created_at ?? "",
    }));
  },
});

/** Profit per unit = Selling Price - Cost Price - Delivery Cost. */
export function productProfit(selling: number, cost: number, deliveryCost: number): number {
  return selling - cost - deliveryCost;
}

/** Matches every word of the query against name, category and description. */
export function matches(p: Product, q: string): boolean {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = `${p.name} ${p.category} ${p.description ?? ""}`.toLowerCase();
  return words.every((w) => hay.includes(w) || (w.endsWith("s") && hay.includes(w.slice(0, -1))));
}

export function filterProducts(
  list: Product[],
  o: { q: string; category: string; min: number; max: number; sort: SortKey },
): Product[] {
  const out = list.filter(
    (p) => matches(p, o.q) && (o.category === "All" || p.category === o.category) && p.selling_price >= o.min && p.selling_price <= o.max,
  );
  const s = [...out];
  if (o.sort === "price_asc") s.sort((a, b) => a.selling_price - b.selling_price);
  else if (o.sort === "price_desc") s.sort((a, b) => b.selling_price - a.selling_price);
  else if (o.sort === "best") s.sort((a, b) => b.sold_count - a.sold_count);
  else s.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return s;
}

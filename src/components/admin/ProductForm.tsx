import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { saveProduct, uploadProductImage } from "@/lib/admin.functions";
import { CATEGORIES, productProfit } from "@/lib/catalog";
import { naira } from "@/lib/cart";

export type ProductDraft = {
  id: string | null; name: string; description: string; image_url: string; images: string[]; category: string;
  cost_price_private: number | null; delivery_cost: number; selling_price: number; old_price: number | null; stock: number; supplier_id: string | null;
};
export const emptyProduct = (): ProductDraft => ({ id: null, name: "", description: "", image_url: "", images: [], category: "Phones", cost_price_private: null, delivery_cost: 0, selling_price: 0, old_price: null, stock: 10, supplier_id: null });

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const label = "mb-1 block text-xs font-semibold";

export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(file); });
}

export function useImageUpload(token: string) {
  const upload = useServerFn(uploadProductImage);
  return async (file: File) => {
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5MB");
    const { url } = await upload({ data: { token, dataUrl: await readAsDataUrl(file), filename: file.name } });
    return url;
  };
}

type Sup = { id: string; business_name: string };

export function ProductForm({ token, initial, suppliers, onDone, onCancel }: { token: string; initial: ProductDraft; suppliers: Sup[]; onDone: () => void; onCancel: () => void }) {
  const save = useServerFn(saveProduct);
  const upload = useImageUpload(token);
  const [f, setF] = useState<ProductDraft>(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => setF((p) => ({ ...p, [k]: v }));
  const num = (v: string) => (v === "" ? 0 : Number(v));

  return (
    <form
      className="grid gap-3 rounded-2xl bg-card p-4 shadow-sm md:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!f.name.trim() || f.selling_price <= 0) { toast.error("Name and selling price are required"); return; }
        setBusy(true);
        try { await save({ data: { token, ...f } }); toast.success(f.id ? "Product updated" : "Product added"); onDone(); }
        catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
      }}
    >
      <h3 className="font-bold md:col-span-2">{f.id ? `Edit: ${initial.name}` : "Add Product"}</h3>
      <div className="md:col-span-2"><label className={label}>Name</label><input className={field} value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
      <div><label className={label}>Selling Price (₦)</label><input className={field} type="number" min={0} value={f.selling_price || ""} onChange={(e) => set("selling_price", num(e.target.value))} /></div>
      <div><label className={label}>Cost Price (₦)</label><input className={field} type="number" min={0} value={f.cost_price_private || ""} placeholder="Unconfirmed" onChange={(e) => set("cost_price_private", e.target.value === "" ? null : num(e.target.value))} /></div>
      <div><label className={label}>Old Price (₦)</label><input className={field} type="number" min={0} value={f.old_price ?? ""} onChange={(e) => set("old_price", e.target.value === "" ? null : Number(e.target.value))} /></div>
      <div><label className={label}>Delivery Cost to you (₦)</label><input className={field} type="number" min={0} value={f.delivery_cost || ""} onChange={(e) => set("delivery_cost", num(e.target.value))} /></div>
      <div><label className={label}>Category</label><select className={field} value={f.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label className={label}>Stock</label><input className={field} type="number" min={0} value={f.stock} onChange={(e) => set("stock", Math.max(0, Math.round(num(e.target.value))))} /></div>
      <div className="md:col-span-2"><label className={label}>Supplier</label>
        <select className={field} value={f.supplier_id ?? ""} onChange={(e) => set("supplier_id", e.target.value || null)}>
          <option value="">No supplier</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.business_name}</option>)}
        </select></div>
      <div className="md:col-span-2"><label className={label}>Description</label><textarea rows={4} className={field} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div className="md:col-span-2">
        <label className={label}>Images (first one is the main photo)</label>
        <div className="flex flex-wrap items-center gap-2">
          {[f.image_url, ...f.images].filter(Boolean).map((u, i) => (
            <div key={u + i} className="relative">
              <img src={u} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button type="button" aria-label="Remove image" onClick={() => { const all = [f.image_url, ...f.images].filter(Boolean).filter((_, j) => j !== i); setF((p) => ({ ...p, image_url: all[0] ?? "", images: all.slice(1) })); }} className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 text-xs text-destructive-foreground">×</button>
            </div>
          ))}
          <label className="cursor-pointer rounded-lg border border-dashed border-border px-3 py-4 text-xs font-semibold">
            {uploading ? "Uploading…" : "+ Upload / Change"}
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0]; e.target.value = "";
              if (!file) return;
              setUploading(true);
              try { const url = await upload(file); setF((p) => (p.image_url ? { ...p, images: [...p.images, url] } : { ...p, image_url: url })); }
              catch (err) { toast.error((err as Error).message); } finally { setUploading(false); }
            }} />
          </label>
        </div>
      </div>
      <p className="text-sm md:col-span-2">Profit per item: <span className="font-bold text-success">{f.cost_price_private === null ? "Cost unconfirmed" : naira(productProfit(f.selling_price, f.cost_price_private, f.delivery_cost))}</span></p>
      <div className="flex gap-2 md:col-span-2">
        <button disabled={busy || uploading} className="flex-1 rounded-lg bg-foreground py-2 text-sm font-semibold text-background disabled:opacity-50">{busy ? "Saving…" : "Save Product"}</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 text-sm">Cancel</button>
      </div>
    </form>
  );
}

import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { aiBulkGenerate, publishBulk } from "@/lib/admin.functions";
import { CATEGORIES } from "@/lib/catalog";
import { useImageUpload } from "./ProductForm";

type Row = { name: string; description: string; category: string; selling_price: number; cost_price: number; old_price: number | null; stock: number; image_url: string; supplier_id: string | null };
const cell = "w-full rounded border border-input bg-background px-2 py-1 text-xs";

export function AiBulkAdd({ token, suppliers, onPublished }: { token: string; suppliers: { id: string; business_name: string }[]; onPublished: () => void }) {
  const gen = useServerFn(aiBulkGenerate);
  const publish = useServerFn(publishBulk);
  const upload = useImageUpload(token);
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const setRow = (i: number, patch: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const onFile = async (file: File) => {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(await file.arrayBuffer());
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    setText(csv.trim());
    toast.success(`Loaded ${csv.trim().split("\n").length} lines from ${file.name}`);
  };

  const run = async () => {
    if (text.trim().length < 2) { toast.error("Paste a list or upload a file first"); return; }
    setBusy(true);
    try {
      const { items } = await gen({ data: { token, text } });
      setRows(items.map((it) => ({ ...it, image_url: "", supplier_id: null })));
      toast.success(`AI prepared ${items.length} products — check and edit below`);
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const publishAll = async () => {
    const bad = rows.findIndex((r) => !r.name.trim() || r.selling_price <= 0);
    if (bad >= 0) { toast.error(`Row ${bad + 1} needs a title and price`); return; }
    setBusy(true);
    try {
      const r = await publish({ data: { token, items: rows.map((x) => ({ name: x.name, description: x.description, image_url: x.image_url, images: [], category: x.category, cost_price_private: x.cost_price, delivery_cost: 0, selling_price: x.selling_price, old_price: x.old_price, stock: x.stock, supplier_id: x.supplier_id })) } });
      toast.success(`Published ${r.count} products`);
      setRows([]); setText("");
      onPublished();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <section className="space-y-4">
      <div className="space-y-3 rounded-2xl bg-card p-4 shadow-sm">
        <h3 className="flex items-center gap-2 font-bold"><Sparkles className="h-5 w-5" /> AI Bulk Add</h3>
        <p className="text-sm text-muted-foreground">Paste one product per line (Name, Price, Category, Stock) or upload a CSV / Excel file. Price is optional — AI will suggest one.</p>
        <textarea rows={8} className="w-full rounded-xl border border-input bg-background p-3 text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder={"Tecno Camon 30, 280000, Phones, 15\nGucci belt, , Fashion, 10\nJBL Flip 6 speaker"} />
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold">
            Upload CSV / Excel
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void onFile(f); }} />
          </label>
          <button disabled={busy} onClick={run} className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-background disabled:opacity-50">
            {busy && !rows.length ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate with AI
          </button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="space-y-3 rounded-2xl bg-card p-4 shadow-sm">
          <h3 className="font-bold">Preview ({rows.length}) — edit anything before publishing</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-xs">
              <thead className="text-left text-muted-foreground"><tr><th className="p-1">Image</th><th>Title</th><th>Price ₦</th><th>Cost ₦</th><th>Category</th><th>Stock</th><th>Description</th><th>Supplier</th><th /></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-border align-top">
                    <td className="p-1">
                      <label className="block h-14 w-14 cursor-pointer overflow-hidden rounded-lg border border-dashed border-border text-center text-[10px] leading-[3.5rem]">
                        {r.image_url ? <img src={r.image_url} alt="" className="h-full w-full object-cover" /> : "+ Photo"}
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; try { setRow(i, { image_url: await upload(f) }); } catch (err) { toast.error((err as Error).message); } }} />
                      </label>
                    </td>
                    <td className="p-1"><input className={cell} value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} /></td>
                    <td className="w-28 p-1"><input className={cell} type="number" value={r.selling_price} onChange={(e) => setRow(i, { selling_price: Number(e.target.value) })} /></td>
                    <td className="w-24 p-1"><input className={cell} type="number" value={r.cost_price} onChange={(e) => setRow(i, { cost_price: Number(e.target.value) })} /></td>
                    <td className="w-28 p-1"><select className={cell} value={r.category} onChange={(e) => setRow(i, { category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></td>
                    <td className="w-16 p-1"><input className={cell} type="number" value={r.stock} onChange={(e) => setRow(i, { stock: Number(e.target.value) })} /></td>
                    <td className="p-1"><textarea rows={3} className={cell} value={r.description} onChange={(e) => setRow(i, { description: e.target.value })} /></td>
                    <td className="w-36 p-1"><select className={cell} value={r.supplier_id ?? ""} onChange={(e) => setRow(i, { supplier_id: e.target.value || null })}><option value="">None</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.business_name}</option>)}</select></td>
                    <td className="p-1"><button aria-label="Remove row" className="text-destructive" onClick={() => setRows((x) => x.filter((_, j) => j !== i))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button disabled={busy} onClick={publishAll} className="w-full rounded-xl bg-success py-3 text-sm font-extrabold text-success-foreground disabled:opacity-50">{busy ? "Publishing…" : `PUBLISH ALL (${rows.length})`}</button>
        </div>
      )}
    </section>
  );
}

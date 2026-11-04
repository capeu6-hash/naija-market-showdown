import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { saveSupplier } from "@/lib/admin.functions";

export type SupplierDraft = { id: string | null; business_name: string; whatsapp: string; location: string; supplies: string; cost_price: number | null };
const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

export function SupplierForm({ token, initial, onDone, onCancel }: { token: string; initial: SupplierDraft | null; onDone: () => void; onCancel: () => void }) {
  const save = useServerFn(saveSupplier);
  const [f, setF] = useState<SupplierDraft>(initial ?? { id: null, business_name: "", whatsapp: "", location: "", supplies: "", cost_price: null });
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="h-fit space-y-2 rounded-2xl bg-card p-4 shadow-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!f.business_name.trim()) { toast.error("Enter supplier name"); return; }
        setBusy(true);
        try { await save({ data: { token, ...f } }); toast.success(f.id ? "Supplier updated" : "Supplier added"); onDone(); }
        catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
      }}
    >
      <h3 className="font-bold">{f.id ? "Edit Supplier" : "Add Supplier"}</h3>
      <input className={field} placeholder="Supplier Name" value={f.business_name} onChange={(e) => setF({ ...f, business_name: e.target.value })} />
      <input className={field} placeholder="Phone / WhatsApp" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} />
      <input className={field} placeholder="Location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
      <input className={field} placeholder="What They Supply" value={f.supplies} onChange={(e) => setF({ ...f, supplies: e.target.value })} />
      <input className={field} type="number" min={0} placeholder="Cost Price (₦)" value={f.cost_price ?? ""} onChange={(e) => setF({ ...f, cost_price: e.target.value === "" ? null : Number(e.target.value) })} />
      <div className="flex gap-2">
        <button disabled={busy} className="flex-1 rounded-lg bg-foreground py-2 text-sm font-semibold text-background disabled:opacity-50">{busy ? "Saving…" : "Save Supplier"}</button>
        {f.id && <button type="button" onClick={onCancel} className="rounded-lg border border-border px-3 text-sm">Cancel</button>}
      </div>
    </form>
  );
}

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bankSchema, type BankDetails } from "@/lib/bank";
import { saveBankDetails } from "@/lib/admin.functions";

export function BankSettings({ token, initial, onSaved }: { token: string; initial: BankDetails; onSaved: () => void }) {
  const [bank, setBank] = useState(initial);
  const [busy, setBusy] = useState(false);
  const save = useServerFn(saveBankDetails);
  const queryClient = useQueryClient();
  return <section className="max-w-lg space-y-4">
    <h2 className="text-lg font-bold">Bank transfer details</h2>
    <form className="space-y-4" onSubmit={async (e) => {
      e.preventDefault();
      const parsed = bankSchema.safeParse(bank);
      if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check your bank details"); return; }
      if (!window.confirm(`Use ${parsed.data.name}, ${parsed.data.accountNumber} (${parsed.data.accountName}) for customer payments?`)) return;
      setBusy(true);
      try { await save({ data: { token, ...parsed.data } }); await queryClient.invalidateQueries({ queryKey: ["bank-details"] }); toast.success("Bank details saved"); onSaved(); }
      catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
    }}>
      {([
        ["name", "Bank name"], ["accountName", "Account name"], ["accountNumber", "Account number"],
      ] as const).map(([key, label]) => <div key={key}>
        <label htmlFor={`bank-${key}`} className="mb-1 block text-sm font-semibold">{label}</label>
        <input id={`bank-${key}`} required className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={bank[key]} inputMode={key === "accountNumber" ? "numeric" : "text"} maxLength={key === "accountNumber" ? 10 : 160} onChange={(e) => setBank((b) => ({ ...b, [key]: key === "accountNumber" ? e.target.value.replace(/\D/g, "") : e.target.value }))} />
      </div>)}
      <Button type="submit" disabled={busy}><Save />{busy ? "Saving…" : "Save bank details"}</Button>
    </form>
  </section>;
}
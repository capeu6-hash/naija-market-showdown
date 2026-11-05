import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const bankSchema = z.object({
  name: z.string().trim().min(2).max(100),
  accountName: z.string().trim().min(2).max(160),
  accountNumber: z.string().trim().regex(/^\d{10}$/, "Enter a 10-digit account number"),
});
export type BankDetails = z.infer<typeof bankSchema>;
export const bankQuery = queryOptions({
  queryKey: ["bank-details"],
  staleTime: 0,
  queryFn: async (): Promise<BankDetails> => {
    const { data, error } = await supabase.from("bank_settings").select("bank_name, account_name, account_number").eq("id", "store").single();
    if (error) throw new Error("Bank details are unavailable. Please try again.");
    return { name: data.bank_name, accountName: data.account_name, accountNumber: data.account_number };
  },
});
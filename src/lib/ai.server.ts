import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { CATEGORIES } from "./catalog";

export type Draft = { name: string; description: string; category: string; selling_price: number; cost_price: number; old_price: number | null; stock: number };

const INSTRUCTIONS = `You write product listings for ShopArena NG, a Nigerian online store.
For each product in the user's list return an object with:
- name: clean, properly capitalised product title
- description: 3-4 sentences, persuasive Nigerian selling style (light pidgin flavour like "order now before e finish"), honest about the product
- category: exactly one of ${CATEGORIES.join(", ")}
- selling_price: number in Naira. Use the given price if present; otherwise suggest a realistic current Nigerian market price
- cost_price: number in Naira if a cost is given, else 0
- old_price: a slightly higher "was" price (about 10-20% above selling_price)
- stock: given stock or 10
Reply with ONLY a JSON array of these objects, no markdown.`;

export async function generateProductDrafts(text: string): Promise<Draft[]> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: INSTRUCTIONS,
    messages: [{ role: "user", content: text }],
    providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", include: ["reasoning.encrypted_content"] } },
  });
  let out: string;
  try {
    out = await result.text;
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (/402|credit/i.test(msg)) throw new Error("AI credits have run out. Please top up to keep using AI Bulk Add.");
    if (/429/.test(msg)) throw new Error("AI is busy right now. Please try again in a minute.");
    throw new Error("AI could not process the list. Please try again.");
  }
  const start = out.indexOf("[");
  const end = out.lastIndexOf("]");
  if (start < 0 || end < start) throw new Error("AI returned an unexpected answer. Please try again.");
  const raw = JSON.parse(out.slice(start, end + 1)) as Partial<Draft>[];
  return raw.slice(0, 100).map((r) => {
    const cat = CATEGORIES.find((c) => c.toLowerCase() === String(r.category ?? "").toLowerCase()) ?? "Gadgets";
    const price = Math.max(0, Math.round(Number(r.selling_price) || 0));
    return {
      name: String(r.name ?? "").slice(0, 160),
      description: String(r.description ?? "").slice(0, 3000),
      category: cat,
      selling_price: price,
      cost_price: Math.max(0, Math.round(Number(r.cost_price) || 0)),
      old_price: r.old_price ? Math.round(Number(r.old_price)) : null,
      stock: Math.max(0, Math.round(Number(r.stock) || 10)),
    };
  });
}

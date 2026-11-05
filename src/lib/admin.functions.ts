import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { bankSchema } from "./bank";

const tokenOnly = z.object({ token: z.string() });

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; password: string }) =>
    z.object({ email: z.string().max(200), password: z.string().max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { signAdminToken } = await import("./admin-token.server");
    const envEmail = (process.env["ADMIN_EMAIL"] ?? "").trim().toLowerCase();
    const envPass = (process.env["ADMIN_PASSWORD"] ?? "").trim();
    const okEmail = !!envEmail && data.email.trim().toLowerCase() === envEmail;
    const okPass = !!envPass && data.password.trim() === envPass;
    if (!okEmail || !okPass) return { ok: false as const };
    return { ok: true as const, token: await signAdminToken() };
  });

async function admin(token: string) {
  const { assertAdmin } = await import("./admin-token.server");
  await assertAdmin(token);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const getAdminDashboard = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => tokenOnly.parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.token);
    const [sup, prods, priv, orders, bank] = await Promise.all([
      db.from("suppliers").select("*").order("business_name"),
      db.from("products").select("*").order("created_at", { ascending: false }),
      db.from("product_private").select("*"),
      db.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(500),
      db.from("bank_settings").select("bank_name, account_name, account_number").eq("id", "store").single(),
    ]);
    const err = sup.error || prods.error || priv.error || orders.error || bank.error;
    if (err) throw new Error(err.message);
    const costs = new Map((priv.data ?? []).map((p) => [p.product_id, p]));
    const paid = (orders.data ?? []).filter((o) => o.status === "paid");
    const totalProfit = paid.reduce((s, o) => s + o.order_items.reduce((a, i) => a + Number(i.profit_hidden), 0), 0);
    const totalRevenue = paid.reduce((s, o) => s + Number(o.total), 0);
    const products = (prods.data ?? []).map((p) => {
      const c = costs.get(p.id);
      const cost = c && c.cost_confirmed ? Number(c.cost_price_private) : null;
      const dc = c ? Number(c.delivery_cost) : 0;
      return {
        ...p,
        selling_price: Number(p.selling_price),
        old_price: p.old_price == null ? null : Number(p.old_price),
        cost_price_private: cost,
        delivery_cost: dc,
        supplier_id: c?.supplier_id ?? null,
        profit: cost == null ? null : Number(p.selling_price) - cost - dc,
      };
    });
    return {
      bank: { name: bank.data?.bank_name ?? "", accountName: bank.data?.account_name ?? "", accountNumber: bank.data?.account_number ?? "" },
      suppliers: sup.data ?? [],
      products,
      orders: orders.data ?? [],
      stats: { totalProducts: products.length, totalOrders: (orders.data ?? []).length, totalRevenue, totalProfit },
    };
  });

const supplierSchema = z.object({
  token: z.string(),
  id: z.string().uuid().nullable(),
  business_name: z.string().trim().min(1).max(120),
  whatsapp: z.string().trim().max(30),
  location: z.string().trim().max(120),
  supplies: z.string().trim().max(200),
  cost_price: z.number().min(0).nullable(),
});

export const saveSupplier = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof supplierSchema>) => supplierSchema.parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.token);
    const row = { business_name: data.business_name, whatsapp: data.whatsapp || null, location: data.location || null, supplies: data.supplies || null, cost_price: data.cost_price };
    const { error } = data.id ? await db.from("suppliers").update(row).eq("id", data.id) : await db.from("suppliers").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSupplier = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string }) => z.object({ token: z.string(), id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.token);
    const { error } = await db.from("suppliers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const productFields = z.object({
  supplier_id: z.string().uuid().nullable(),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(3000),
  image_url: z.string().trim().max(2000),
  images: z.array(z.string().max(2000)).max(10).default([]),
  category: z.string().trim().min(1).max(40),
  cost_price_private: z.number().min(0).nullable(),
  delivery_cost: z.number().min(0).default(0),
  selling_price: z.number().positive(),
  old_price: z.number().min(0).nullable(),
  stock: z.number().int().min(0).max(100000),
});
type ProductFields = z.infer<typeof productFields>;

async function writeProduct(db: Awaited<ReturnType<typeof admin>>, id: string | null, d: ProductFields) {
  const row = {
    name: d.name, description: d.description || null, image_url: d.image_url || null, images: d.images,
    category: d.category, selling_price: d.selling_price, old_price: d.old_price, stock: d.stock,
  };
  let pid = id;
  if (pid) {
    const { error } = await db.from("products").update(row).eq("id", pid);
    if (error) throw new Error(error.message);
  } else {
    const { data: p, error } = await db.from("products").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    pid = p.id;
  }
  if (!pid) throw new Error("Could not save product");
  const { error: e2 } = await db.from("product_private").upsert({ product_id: pid, supplier_id: d.supplier_id, cost_price_private: d.cost_price_private ?? 0, cost_confirmed: d.cost_price_private !== null, delivery_cost: d.delivery_cost });
  if (e2) throw new Error(e2.message);
}

const saveProductSchema = productFields.extend({ token: z.string(), id: z.string().uuid().nullable() });
export const saveProduct = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof saveProductSchema>) => saveProductSchema.parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.token);
    await writeProduct(db, data.id, data);
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string }) => z.object({ token: z.string(), id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.token);
    const { error } = await db.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const bulkSchema = z.object({ token: z.string(), items: z.array(productFields).min(1).max(100) });
export const publishBulk = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof bulkSchema>) => bulkSchema.parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.token);
    for (const it of data.items) await writeProduct(db, null, it);
    return { ok: true, count: data.items.length };
  });

// Upload a product image (data URL) to private storage; returns a long-lived signed URL.
export const uploadProductImage = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; dataUrl: string; filename: string }) =>
    z.object({ token: z.string(), dataUrl: z.string().max(7_500_000), filename: z.string().max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin(data.token);
    const m = /^data:(image\/(png|jpe?g|webp|gif));base64,(.+)$/.exec(data.dataUrl);
    if (!m) throw new Error("Please upload a PNG, JPG, WEBP or GIF image");
    const bytes = Uint8Array.from(atob(m[3]!), (c) => c.charCodeAt(0));
    const ext = m[2] === "jpeg" ? "jpg" : m[2]!;
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await db.storage.from("product-images").upload(path, bytes, { contentType: m[1]! });
    if (error) throw new Error(error.message);
    const { data: s, error: se } = await db.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (se || !s) throw new Error(se?.message ?? "Could not create image link");
    return { url: s.signedUrl };
  });

// AI turns a pasted list / spreadsheet rows into ready-to-sell product drafts.
export const aiBulkGenerate = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; text: string }) => z.object({ token: z.string(), text: z.string().trim().min(2).max(20000) }).parse(d))
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin-token.server");
    await assertAdmin(data.token);
    const { generateProductDrafts } = await import("./ai.server");
    return { items: await generateProductDrafts(data.text) };
  });

// Admin confirms the bank transfer arrived: marks paid and reduces stock once.
export const confirmOrderPaid = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string }) => z.object({ token: z.string(), id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin-token.server");
    await assertAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: updated, error } = await supabaseAdmin.from("orders").update({ status: "paid" }).eq("id", data.id).neq("status", "paid").select("id, order_items(product_id, qty)");
    if (error) throw new Error(error.message);
    for (const o of updated ?? []) {
      for (const it of o.order_items) {
        if (!it.product_id) continue;
        const { data: p } = await supabaseAdmin.from("products").select("stock, sold_count").eq("id", it.product_id).single();
        if (p) await supabaseAdmin.from("products").update({ stock: Math.max(0, p.stock - it.qty), sold_count: (p.sold_count ?? 0) + it.qty }).eq("id", it.product_id);
      }
    }
    return { ok: true };
  });

const bankInput = bankSchema.extend({ token: z.string() });
export const saveBankDetails = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof bankInput>) => bankInput.parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.token);
    const { error } = await db.from("bank_settings").upsert({ id: "store", bank_name: data.name, account_name: data.accountName, account_number: data.accountNumber, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

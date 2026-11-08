<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Product cost/supplier data lives in `product_private` (no RLS policies, server-only via admin client); the browser may only read `products`. Why: keeps cost prices unreadable by customers.
- Admin access uses server-checked ADMIN_EMAIL/ADMIN_PASSWORD secrets and an HMAC token (`src/lib/admin-token.server.ts`); never put admin credentials in VITE_ vars. Why: VITE_ values ship to every visitor.
- Orders (items + delivery fee from `src/lib/delivery.ts`) are priced server-side; payment is manual bank transfer and only the admin marks an order paid. Why: browser totals can be forged.
- Product images uploaded by admin go to the private `product-images` bucket via a server function and are stored as long-lived signed URLs. Why: the workspace blocks public buckets and admin is not a signed-in Cloud user.
- Search/filter/sort runs client-side over `public_products` (`src/lib/catalog.ts`). Why: small catalog, instant suggestions without extra requests.
- Bank details live in the singleton bank_settings row; only HMAC-authorized admin functions may write, public views read, and checkout snapshots the current details when creating an order. Why: edits persist without exposing payment-setting writes to customers.
- Unconfirmed supplier costs use product_private.cost_confirmed=false and display no profit until confirmed. Why: estimated catalog prices must not become fictitious margins.
- Customer shop, product, and checkout routes live under the integration-managed `_authenticated` layout; account and admin routes stay public at top level. Why: requires sign-in before shopping without changing customer URLs.

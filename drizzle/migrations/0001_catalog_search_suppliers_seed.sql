ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS old_price numeric,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Gadgets',
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sold_count int NOT NULL DEFAULT 0;
ALTER TABLE public.product_private ADD COLUMN IF NOT EXISTS delivery_cost numeric NOT NULL DEFAULT 0;
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS supplies text,
  ADD COLUMN IF NOT EXISTS cost_price numeric;

CREATE OR REPLACE VIEW public.public_products WITH (security_invoker = true) AS
SELECT id, name, description, image_url, selling_price, stock, created_at, old_price, category, images, sold_count FROM public.products;
GRANT SELECT ON public.public_products TO anon, authenticated;

INSERT INTO public.suppliers (id, business_name, whatsapp, location, supplies) VALUES
 ('11111111-0000-4000-8000-000000000001','Lagos Phone Hub','0803-111-2233','Ikeja','Phones'),
 ('11111111-0000-4000-8000-000000000002','Balogun Fashion Plug','0805-444-5566','Balogun Market','Shoes, Fashion'),
 ('11111111-0000-4000-8000-000000000003','Lekki Luxury Store','0902-777-8899','Lekki','Luxury Bags'),
 ('11111111-0000-4000-8000-000000000004','Computer Village Plug','0812-333-4455','Ikeja','Gadgets');

INSERT INTO public.products (id, name, description, image_url, selling_price, old_price, category, stock) VALUES
 ('22222222-0000-4000-8000-000000000001','Samsung Galaxy S25 Ultra 512GB','Oga phone for big boys and big girls! The Galaxy S25 Ultra comes with 512GB storage, a 200MP camera that zooms like binoculars, and the S Pen for quick notes. Battery go carry you from morning hustle till night owambe. Brand new, sealed in box with full warranty — order now before e finish!','/products/samsung-s25-ultra.jpg',1450000,1600000,'Phones',10),
 ('22222222-0000-4000-8000-000000000002','iPhone 16 Pro Max 256GB','The latest iPhone 16 Pro Max is here — titanium body, super bright 6.9" display and a camera wey dey snap like professional. 256GB space for all your pictures, videos and WhatsApp files. Original, brand new and sealed with Apple warranty. Step out with class — order yours today!','/products/iphone-16-pro-max.jpg',1950000,2100000,'Phones',8),
 ('22222222-0000-4000-8000-000000000003','Nike Air Force 1 White','The classic all-white AF1 wey every fine boy and fine girl must get! Soft leather, comfy sole and clean look that matches jeans, shorts or native. Easy to clean and lasts long. Available in all sizes — grab your pair before the next restock finish!','/products/nike-af1-white.jpg',68000,85000,'Shoes',25),
 ('22222222-0000-4000-8000-000000000004','Adidas Samba OG','The trending Adidas Samba OG — white leather, black stripes and that gum sole wey everybody dey rock. Light, comfortable and stylish for school, work or hangout. Top quality, no be fake. Order now and step out in style!','/products/adidas-samba.jpg',58000,70000,'Shoes',20),
 ('22222222-0000-4000-8000-000000000005','Dior Saddle Bag','Turn heads anywhere you enter with the iconic Dior Saddle Bag! Signature oblique pattern, gold D charm and adjustable strap for shoulder or crossbody. Perfect for parties, dinner dates and Sunday service. Premium quality — limited pieces available!','/products/dior-saddle.jpg',125000,150000,'Bags',12),
 ('22222222-0000-4000-8000-000000000006','Louis Vuitton Tote Bag','Big, classy and strong — the LV Tote carries everything: laptop, makeup, phone and more. Classic monogram canvas with leather handles wey no dey tear. Perfect for work, travel and shopping. Premium quality — order now and feel like a big madam!','/products/lv-tote.jpg',145000,170000,'Bags',10),
 ('22222222-0000-4000-8000-000000000007','Zara Oversized Shirt','Clean, soft and breathable Zara oversized shirt — perfect for this Lagos heat! Rock am with jeans, chinos or shorts for that cool relaxed look. Quality cotton wey no dey fade after wash. Available in all sizes — order yours today!','/products/zara-shirt.jpg',32000,40000,'Fashion',30),
 ('22222222-0000-4000-8000-000000000008','Amiri Denim Jeans','Ballers choice! Amiri distressed denim jeans with leather knee patches — the same style your favourite artistes dey wear. Slim fit, stretchy and very comfortable. Premium quality stitching that lasts. Order now and shine like star!','/products/amiri-jeans.jpg',45000,55000,'Fashion',22),
 ('22222222-0000-4000-8000-000000000009','Apple AirPods Pro 2','Block out Lagos noise and enjoy your music in peace! AirPods Pro 2 come with active noise cancellation, crystal clear calls and long battery life with the MagSafe case. Connects to your iPhone in one second. Original and sealed — order now!','/products/airpods-pro-2.jpg',135000,155000,'Gadgets',15),
 ('22222222-0000-4000-8000-000000000010','Anker 20000mAh Power Bank','NEPA take light? No wahala! This Anker 20000mAh power bank charges your phone 4-5 times full and supports fast charging. Strong, compact and fits in your bag. Original Anker quality wey you fit trust. Order yours now!','/products/anker-powerbank.jpg',45000,55000,'Gadgets',40),
 ('22222222-0000-4000-8000-000000000011','Apple Watch Series 10','Stay fit and stylish with the Apple Watch Series 10 — thinnest Apple Watch ever with a bigger, brighter screen. Tracks your steps, heart rate and sleep, and shows your WhatsApp messages on your wrist. Original with warranty — order now!','/products/apple-watch-10.jpg',420000,480000,'Gadgets',9),
 ('22222222-0000-4000-8000-000000000012','New Balance 550 White','The clean New Balance 550 everybody dey find! Premium white leather with retro basketball style that goes with any outfit. Very comfortable for all-day waka. Top quality pair — limited sizes, order now before e finish!','/products/nb-550.jpg',65000,80000,'Shoes',18);

INSERT INTO public.product_private (product_id, supplier_id, cost_price_private) VALUES
 ('22222222-0000-4000-8000-000000000001','11111111-0000-4000-8000-000000000001',1150000),
 ('22222222-0000-4000-8000-000000000002','11111111-0000-4000-8000-000000000001',1650000),
 ('22222222-0000-4000-8000-000000000003','11111111-0000-4000-8000-000000000002',45000),
 ('22222222-0000-4000-8000-000000000004','11111111-0000-4000-8000-000000000002',38000),
 ('22222222-0000-4000-8000-000000000005','11111111-0000-4000-8000-000000000003',85000),
 ('22222222-0000-4000-8000-000000000006','11111111-0000-4000-8000-000000000003',95000),
 ('22222222-0000-4000-8000-000000000007','11111111-0000-4000-8000-000000000002',18000),
 ('22222222-0000-4000-8000-000000000008','11111111-0000-4000-8000-000000000002',25000),
 ('22222222-0000-4000-8000-000000000009','11111111-0000-4000-8000-000000000004',95000),
 ('22222222-0000-4000-8000-000000000010','11111111-0000-4000-8000-000000000004',28000),
 ('22222222-0000-4000-8000-000000000011','11111111-0000-4000-8000-000000000004',320000),
 ('22222222-0000-4000-8000-000000000012','11111111-0000-4000-8000-000000000002',42000);
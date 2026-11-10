# Abi Foods & Oils — E-commerce Website

A premium, full-stack e-commerce site for Abi Foods & Oils' traditional
cold-pressed oils, spice powders, and health mixes — sourced from
Kosakattur, Kodumudi, Erode. Built with Next.js 15 (App Router),
MongoDB/Mongoose, and Cloudinary for image storage.

## Features

**Storefront**
- Home page with hero, category grid, featured products
- Product listing with category filter and search
- Product detail page with add-to-cart / buy now
- Cart and checkout (COD / UPI / Online)
- **Track order by phone number** — customers can check order status
  without creating an account

**Admin Panel** (`/admin`)
- Secure login (JWT, httpOnly cookie)
- **Dashboard** — today/weekly/monthly sales, pending orders, 14-day sales
  trend chart, top selling products, low stock alerts
- **Products** — full CRUD, multi-image upload via Cloudinary, stock,
  pricing, featured/active toggles
- **Categories** — full CRUD with icon picker
- **Orders** — search/filter, view full order detail, update order status
  (pending → confirmed → packed → shipped → delivered / cancelled)
- **Inventory** — stock overview, low-stock / out-of-stock filters, quick
  stock updates
- **Logout**

## Tech Stack

- Next.js 15 (App Router, Server Components)
- MongoDB + Mongoose
- Cloudinary (image hosting)
- JWT (jsonwebtoken) for admin auth
- Tailwind CSS
- Recharts (dashboard chart)

## 1. Install dependencies

```bash
npm install
```

## 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → Create a free cluster → Connect → Drivers → copy the connection string |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | [Cloudinary Dashboard](https://cloudinary.com/console) after creating a free account |
| `JWT_SECRET` | Any long random string, e.g. generate with `openssl rand -base64 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Choose your own admin login credentials |

## 3. (Optional) Seed starter data

This adds Abi Foods & Oils' real product categories (Cold-Pressed
Marachekku Oils, Spice & Masala Powders, Health Mixes & Malts, Raw Spices)
plus starter products — groundnut/sesame/coconut oil, sambar powder, curry
masala, idli podi, ABC malt, health mix, and more — so the store isn't
empty on first run:

```bash
npm run seed
```

> **Note:** the seeded prices, units, and stock counts are placeholders.
> Update them from **Admin → Products → Edit** before going live.

You can then add product photos from **Admin → Products → Edit**.

## 4. Run locally

```bash
npm run dev
```

- Storefront: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login

## 5. Deploy (Vercel — recommended, free tier works)

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo.
3. Add all the environment variables from `.env.local` in the Vercel
   project settings (Settings → Environment Variables).
4. Deploy. Your site will be live at `your-project.vercel.app`.

Make sure your MongoDB Atlas cluster allows connections from anywhere
(Network Access → Add IP → `0.0.0.0/0`) since Vercel's IPs are dynamic.

## Project Structure

```
app/
  page.js                  → Homepage
  products/                → Product listing & detail pages
  cart/, checkout/         → Cart & checkout flow
  track-order/             → Public order tracking by phone
  admin/                   → Admin panel (dashboard, products, categories,
                              orders, inventory, login)
  api/                     → All backend routes (products, categories,
                              orders, orders/track, upload, auth, dashboard)
components/                → Shared UI components
context/CartContext.js     → Client-side cart state (localStorage)
lib/                       → MongoDB, Cloudinary, auth helpers
models/                    → Mongoose schemas (Product, Category, Order)
middleware.js              → Protects /admin and admin API routes
scripts/seed.mjs           → Starter data seeding script
```

## Notes

- Order numbers are generated automatically in the format `ABI-YYMMDD-0001`.
  ⚠️ This prefix is set in the order-creation API route (`app/api/orders`),
  not in this README — if that route still generates `KMC-...` numbers,
  it needs to be updated separately for this to be accurate.
- Stock is decremented automatically when an order is placed, and restored
  automatically if an order is cancelled from the admin panel.
- Customers track orders by phone number (last 10 digits are matched, so it
  works whether they type `+91` or not) — optionally combined with the order
  number for precision.
- The design uses a warm ivory background, forest green, and gold accents,
  with a terracotta accent for highlights — matching the premium, natural
  feel of traditional marachekku oils and home-style spice blends. Update
  this palette if Abi Foods & Oils' actual branding/logo uses different
  colors.
// Seed script — populates the database with Sipology Spot Premium Organic Store's
// product categories and starter products so the store isn't empty on first run.
//
// NOTE: Prices, units, and stock below are PLACEHOLDERS. Update them from
// the admin panel (Products > Edit) or edit the PRODUCTS array below before
// running this in production.
//
// Usage:  npm run seed
// Requires MONGODB_URI to be set in .env.local

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    icon: String,
    isActive: { type: Boolean, default: true },
    sortOrder: Number,
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    shortDescription: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    price: Number,
    compareAtPrice: Number,
    unit: String,
    images: [{ url: String, publicId: String }],
    stock: Number,
    lowStockThreshold: Number,
    isFeatured: Boolean,
    isActive: Boolean,
    attributes: {
      handmade: Boolean,
      natural: Boolean,
      ecoFriendly: Boolean,
    },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const CATEGORIES = [
  {
    name: "Cold-Pressed Marachekku Oils",
    slug: "marachekku-oils",
    icon: "drop",
    sortOrder: 1,
    description: "Traditional wood-pressed (marachekku) oils, extracted the natural way.",
  },
  {
    name: "Spice & Masala Powders",
    slug: "spice-masala-powders",
    icon: "herb",
    sortOrder: 2,
    description: "Freshly ground sambar powder, curry masala, and everyday spice powders.",
  },
  {
    name: "Health Mixes & Malts",
    slug: "health-mixes-malts",
    icon: "leaf",
    sortOrder: 3,
    description: "Nutritious home-style malts and mixes for daily wellness.",
  },
  {
    name: "Raw Spices",
    slug: "raw-spices",
    icon: "root",
    sortOrder: 4,
    description: "Whole, unprocessed spices sourced directly from trusted organic farms.",
  },
];

const PRODUCTS = [
  // Cold-Pressed Marachekku Oils
  {
    name: "Vagai Marachekku Groundnut Oil",
    category: "marachekku-oils",
    price: 320,
    unit: "1 litre",
    stock: 30,
    isFeatured: true,
    description: "Traditional wood-pressed groundnut oil, cold-extracted to retain natural aroma and nutrition.",
  },
  {
    name: "Vagai Marachekku Sesame Oil",
    category: "marachekku-oils",
    price: 340,
    unit: "1 litre",
    stock: 30,
    isFeatured: true,
    description: "Cold-pressed sesame (gingelly) oil, extracted using the traditional wooden churner method.",
  },
  {
    name: "Vagai Marachekku Coconut Oil",
    category: "marachekku-oils",
    price: 300,
    unit: "1 litre",
    stock: 30,
    isFeatured: true,
    description: "Pure wood-pressed coconut oil, naturally extracted without heat or chemicals.",
  },

  // Spice & Masala Powders
  {
    name: "Sambar Powder",
    category: "spice-masala-powders",
    price: 90,
    unit: "200 g",
    stock: 40,
    isFeatured: true,
    description: "Home-style sambar powder blended from freshly roasted spices and lentils.",
  },
  {
    name: "Curry Masala",
    category: "spice-masala-powders",
    price: 90,
    unit: "200 g",
    stock: 40,
    isFeatured: false,
    description: "Aromatic curry masala blend for everyday South Indian gravies and curries.",
  },
  {
    name: "Coriander Powder",
    category: "spice-masala-powders",
    price: 70,
    unit: "200 g",
    stock: 40,
    isFeatured: false,
    description: "Freshly ground coriander powder with natural aroma, no additives.",
  },
  {
    name: "Idli Podi",
    category: "spice-masala-powders",
    price: 90,
    unit: "200 g",
    stock: 35,
    isFeatured: true,
    description: "Traditional lentil and spice-based gunpowder, perfect with idli, dosa, or hot rice.",
  },
  {
    name: "Curry Leaves Powder",
    category: "spice-masala-powders",
    price: 100,
    unit: "150 g",
    stock: 30,
    isFeatured: false,
    description: "Sun-dried curry leaves ground into a fragrant, nutrient-rich powder.",
  },
  {
    name: "Turmeric Powder",
    category: "spice-masala-powders",
    price: 80,
    unit: "200 g",
    stock: 40,
    isFeatured: false,
    description: "Pure turmeric powder ground from naturally dried turmeric roots.",
  },

  // Health Mixes & Malts
  {
    name: "ABC Malt",
    category: "health-mixes-malts",
    price: 150,
    unit: "250 g",
    stock: 25,
    isFeatured: true,
    description: "Apple, Beetroot & Carrot malt — a nutritious home-style health drink mix.",
  },
  {
    name: "Sweet Potato Powder",
    category: "health-mixes-malts",
    price: 130,
    unit: "200 g",
    stock: 20,
    isFeatured: false,
    description: "Naturally dried and ground sweet potato powder, rich in fibre and nutrients.",
  },
  {
    name: "Health Mix Powder",
    category: "health-mixes-malts",
    price: 160,
    unit: "250 g",
    stock: 25,
    isFeatured: true,
    description: "Multi-grain and millet health mix, a wholesome breakfast or beverage base.",
  },
  {
    name: "Kollukangi Mix",
    category: "health-mixes-malts",
    price: 140,
    unit: "200 g",
    stock: 20,
    isFeatured: false,
    description: "Horse gram (kollu) based traditional health mix, a natural source of protein.",
  },

  // Raw Spices
  {
    name: "Turmeric (Raw)",
    category: "raw-spices",
    price: 120,
    unit: "500 g",
    stock: 20,
    isFeatured: false,
    description: "Whole, sun-dried turmeric fingers sourced directly from local farms.",
  },
];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
}

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local before seeding.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const categoryMap = {};
  for (const cat of CATEGORIES) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) {
      categoryMap[cat.slug] = existing._id;
      console.log(`Category exists: ${cat.name}`);
      continue;
    }
    const created = await Category.create(cat);
    categoryMap[cat.slug] = created._id;
    console.log(`Created category: ${cat.name}`);
  }

  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      console.log(`Product exists: ${p.name}`);
      continue;
    }
    await Product.create({
      ...p,
      slug,
      category: categoryMap[p.category],
      lowStockThreshold: 5,
      attributes: { handmade: true, natural: true, ecoFriendly: true },
      isActive: true,
      images: [],
    });
    console.log(`Created product: ${p.name}`);
  }

  console.log("\nSeeding complete. Add product images and confirm real prices from the admin panel (Products > Edit).");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
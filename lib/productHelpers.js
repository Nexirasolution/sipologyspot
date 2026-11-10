import { NextResponse } from "next/server";
import Product from "@/models/Product";

export const VARIANT_UNITS = ["gram", "kg", "ml", "litre", "piece"];

/* A real MongoDB id is exactly 24 hex characters.
   (mongoose.isValidObjectId also accepts any 12-character string, which
   would wrongly treat slugs like "groundnutoil" as ids.) */
export function isObjectId(value) {
  return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
}

export function slugify(text) {
  const slug = String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // Names written only in Tamil (or any non-Latin script) strip down to nothing
  return slug || `product-${Date.now().toString().slice(-6)}`;
}

export function normalizeMedia(media) {
  if (!Array.isArray(media)) return undefined;
  return media
    .filter((item) => item && item.url)
    .map((item) => ({
      url: item.url,
      publicId: item.publicId,
      type: item.type || item.mediaType || "image",
    }));
}

/* Cleans variant rows from the admin form.
   Returns { variants, error }. `variants` is undefined when none were sent. */
export function normalizeVariants(input) {
  if (!Array.isArray(input)) return { variants: undefined, error: "" };

  const variants = [];
  for (const v of input) {
    if (!v || !String(v.label || "").trim()) continue; // ignore blank rows
    const label = String(v.label).trim();

    const price = Number(v.price);
    if (v.price === "" || v.price === null || v.price === undefined || !Number.isFinite(price) || price < 0) {
      return { variants: undefined, error: `Variant "${label}" needs a valid price.` };
    }
    const stock = Number(v.stock) || 0;
    const compareAtPrice = Number(v.compareAtPrice) || 0;
    const value = Number(v.value) || 0;
    if (stock < 0 || compareAtPrice < 0 || value < 0) {
      return { variants: undefined, error: `Variant "${label}" cannot have negative numbers.` };
    }

    const row = {
      label,
      value,
      unit: VARIANT_UNITS.includes(v.unit) ? v.unit : "piece",
      sku: v.sku && String(v.sku).trim() ? String(v.sku).trim().toUpperCase() : undefined,
      price,
      compareAtPrice,
      stock,
      isDefault: !!v.isDefault,
    };
    // Keep the existing _id so carts and past orders that point at a variant stay valid
    if (isObjectId(String(v._id || ""))) row._id = v._id;
    variants.push(row);
  }

  // Exactly one default
  let hasDefault = false;
  variants.forEach((v) => {
    if (v.isDefault && !hasDefault) hasDefault = true;
    else v.isDefault = false;
  });
  if (variants.length && !hasDefault) variants[0].isDefault = true;

  const skus = variants.map((v) => v.sku).filter(Boolean);
  if (new Set(skus).size !== skus.length) {
    return { variants: undefined, error: "Variant SKUs must be different from each other." };
  }

  return { variants, error: "" };
}

const NUMBER_FIELDS = {
  price: "Price",
  compareAtPrice: "Compare price",
  stock: "Stock",
  lowStockThreshold: "Low stock threshold",
  featuredOrder: "Display order",
};

/* Whitelists and validates the fields a client may set.
   Anything not listed here (slug, _id, createdAt, ...) is ignored. */
export function pickProductFields(body) {
  const data = {};

  for (const key of ["name", "description", "shortDescription"]) {
    if (body[key] !== undefined) data[key] = String(body[key]).trim();
  }
  if (body.unit !== undefined) data.unit = String(body.unit).trim() || "piece";

  for (const [key, label] of Object.entries(NUMBER_FIELDS)) {
    if (body[key] === undefined) continue;
    const n = body[key] === "" || body[key] === null ? 0 : Number(body[key]);
    if (!Number.isFinite(n) || n < 0) {
      return { data, error: `${label} must be a number, 0 or more.` };
    }
    data[key] = n;
  }

  for (const key of ["isFeatured", "isActive"]) {
    if (body[key] !== undefined) data[key] = !!body[key];
  }

  if (body.category !== undefined) {
    if (!isObjectId(String(body.category))) {
      return { data, error: "Please choose a valid category." };
    }
    data.category = body.category;
  }

  if (body.tags !== undefined) {
    const list = Array.isArray(body.tags) ? body.tags : String(body.tags).split(",");
    data.tags = list.map((t) => String(t).trim()).filter(Boolean);
  }

  return { data, error: "" };
}

/* Returns an error message if the main SKU or any variant SKU is already taken */
export async function findSkuConflict({ sku, variantSkus = [], excludeId }) {
  if (sku && variantSkus.includes(sku)) {
    return "A variant SKU cannot be the same as the product SKU.";
  }
  const all = [sku, ...variantSkus].filter(Boolean);
  if (!all.length) return "";

  const query = { $or: [{ sku: { $in: all } }, { "variants.sku": { $in: all } }] };
  if (excludeId) query._id = { $ne: excludeId };

  const clash = await Product.findOne(query).select("sku variants.sku");
  if (!clash) return "";
  return sku && clash.sku === sku
    ? `SKU "${sku}" is already in use.`
    : "One or more variant SKUs are already in use.";
}

/* Turns a thrown save error into a sensible JSON response */
export function writeErrorResponse(err, fallback) {
  if (err?.name === "ValidationError") {
    const first = Object.values(err.errors || {})[0];
    return NextResponse.json({ error: first?.message || "Invalid product data." }, { status: 400 });
  }
  if (err?.code === 11000) {
    return NextResponse.json({ error: "SKU or URL slug is already in use." }, { status: 400 });
  }
  console.error(err);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
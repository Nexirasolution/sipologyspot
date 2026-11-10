import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { slugify } from "@/lib/productHelpers";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_ROWS = 1000;
const CHUNK = 25;

function toBool(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const v = String(value).trim().toLowerCase();
  return ["yes", "true", "1", "y"].includes(v);
}

// Blank -> fallback. Not a number, or negative -> NaN (caller reports an error).
function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

// "Compare At Price", "compareAtPrice" and "compare_at_price" all become "compareatprice"
function normalizeRow(row) {
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    out[String(key).toLowerCase().replace(/[^a-z0-9]/g, "")] = value;
  }
  return out;
}

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (!/\.(xlsx|xls|csv)$/i.test(file.name || "")) {
      return NextResponse.json({ error: "Please upload an .xlsx, .xls or .csv file." }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "The file is too large (max 5 MB)." }, { status: 400 });
    }

    let rawRows;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheetName = workbook.SheetNames.includes("Products") ? "Products" : workbook.SheetNames[0];
      rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
    } catch {
      return NextResponse.json({ error: "Could not read this file. Is it a valid spreadsheet?" }, { status: 400 });
    }

    if (!rawRows.length) {
      return NextResponse.json({ error: "The sheet is empty." }, { status: 400 });
    }
    if (rawRows.length > MAX_ROWS) {
      return NextResponse.json({ error: `Too many rows (max ${MAX_ROWS} per upload).` }, { status: 400 });
    }

    const rows = rawRows.map(normalizeRow);

    // Preload categories once, matched case-insensitively by name
    const categories = await Category.find({});
    const categoryByName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c]));

    // Existing slugs and SKUs (main and variant SKUs), so duplicates are caught up front
    const existing = await Product.find({}, "slug sku variants.sku").lean();
    const existingSlugs = new Set(existing.map((p) => p.slug));
    const existingSkus = new Set();
    existing.forEach((p) => {
      if (p.sku) existingSkus.add(p.sku);
      (p.variants || []).forEach((v) => v.sku && existingSkus.add(v.sku));
    });

    const results = [];
    const toInsert = [];

    rows.forEach((row, idx) => {
      const rowNum = idx + 2; // header is row 1
      const name = String(row.name || "").trim();
      const sku = String(row.sku || "").trim().toUpperCase();
      const categoryName = String(row.category || "").trim();

      const fail = (message) => results.push({ row: rowNum, name: name || undefined, status: "error", message });

      if (!name) return fail("Missing product name.");
      if (!sku) return fail("Missing SKU.");
      if (existingSkus.has(sku)) return fail(`SKU "${sku}" is already in use.`);
      if (!categoryName) return fail("Missing category.");

      const category = categoryByName.get(categoryName.toLowerCase());
      if (!category) return fail(`Category "${categoryName}" does not exist. Create it first.`);

      const price = toNumber(row.price, NaN);
      if (Number.isNaN(price)) return fail("Price must be a number, 0 or more.");

      const compareAtPrice = toNumber(row.compareatprice ?? row.compareprice, 0);
      const stock = toNumber(row.stock, 0);
      const lowStockThreshold = toNumber(row.lowstockthreshold, 5);
      if ([compareAtPrice, stock, lowStockThreshold].some(Number.isNaN)) {
        return fail("Compare price, stock and low stock threshold must be numbers, 0 or more.");
      }

      let slug = slugify(name);
      if (existingSlugs.has(slug)) slug = `${slug}-${Date.now().toString().slice(-5)}-${idx}`;
      existingSlugs.add(slug);
      existingSkus.add(sku);

      toInsert.push({
        _rowNum: rowNum,
        name,
        slug,
        sku,
        category: category._id,
        price,
        compareAtPrice,
        unit: String(row.unit || "piece").trim() || "piece",
        stock,
        lowStockThreshold,
        description: String(row.description || "").trim(),
        tags: String(row.tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isFeatured: toBool(row.isfeatured ?? row.featured, false),
        isActive: toBool(row.isactive, true),
        media: [], // media is added later through the website
      });
    });

    // Save in small batches, one document at a time, so every row gets its own
    // accurate success/error result (a single failure never hides the others).
    let created = 0;
    for (let i = 0; i < toInsert.length; i += CHUNK) {
      const chunk = toInsert.slice(i, i + CHUNK);
      const settled = await Promise.allSettled(
        chunk.map(({ _rowNum, ...doc }) => Product.create(doc))
      );
      settled.forEach((outcome, j) => {
        const item = chunk[j];
        if (outcome.status === "fulfilled") {
          created++;
          results.push({ row: item._rowNum, name: item.name, status: "success" });
        } else {
          const reason = outcome.reason;
          results.push({
            row: item._rowNum,
            name: item.name,
            status: "error",
            message:
              reason?.code === 11000
                ? "SKU or product URL is already in use."
                : reason?.message || "Could not save this row.",
          });
        }
      });
    }

    results.sort((a, b) => a.row - b.row);
    const errorCount = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      summary: { totalRows: rows.length, created, errors: errorCount },
      results,
    });
  } catch (err) {
    console.error("Bulk upload error:", err);
    return NextResponse.json({ error: "Failed to process the file." }, { status: 500 });
  }
}
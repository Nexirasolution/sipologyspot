import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import "@/models/Category";
import {
  isObjectId,
  slugify,
  normalizeMedia,
  normalizeVariants,
  pickProductFields,
  findSkuConflict,
  writeErrorResponse,
} from "@/lib/productHelpers";

// Escape regex special characters so search terms like "gift+set" or "100%" don't break the query
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SORT_MAP = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "name-asc": { name: 1 },
  "name-desc": { name: -1 },
};

const MAX_PAGE_SIZE = 100;

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = (searchParams.get("search") || "").trim();
    const featured = searchParams.get("featured");
    const activeOnly = searchParams.get("activeOnly");
    const sort = searchParams.get("sort");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // Pagination: with `page` the result is paginated (default 12, max 100).
    // Without `page` and `limit`, everything is returned (used by the exports).
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
    const hasPageParam = searchParams.has("page");
    const rawLimit = parseInt(searchParams.get("limit") || "0", 10) || 0;
    const limit = hasPageParam
      ? Math.min(rawLimit > 0 ? rawLimit : 12, MAX_PAGE_SIZE)
      : Math.max(rawLimit, 0);

    const query = {};
    if (category) {
      if (!isObjectId(category)) {
        return NextResponse.json({ error: "Invalid category." }, { status: 400 });
      }
      query.category = category;
    }
    if (featured === "true") query.isFeatured = true;
    if (activeOnly === "true") query.isActive = true;

    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { name: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
        { shortDescription: { $regex: safe, $options: "i" } },
        { sku: { $regex: safe, $options: "i" } },
        { tags: { $regex: safe, $options: "i" } },
        { "variants.sku": { $regex: safe, $options: "i" } },
        { "variants.label": { $regex: safe, $options: "i" } },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      const min = Number(minPrice);
      const max = Number(maxPrice);
      if (minPrice && Number.isFinite(min)) query.price.$gte = min;
      if (maxPrice && Number.isFinite(max)) query.price.$lte = max;
      if (Object.keys(query.price).length === 0) delete query.price;
    }

    // Ordered by SKU by default; an explicit `sort` overrides it.
    // `_id` is a tie-breaker so pages never repeat or skip products.
    const sortSpec = { ...((sort && SORT_MAP[sort]) || { sku: 1 }), _id: 1 };

    let cursor = Product.find(query).populate("category", "name slug").sort(sortSpec);

    let total = null;
    if (limit) {
      total = await Product.countDocuments(query);
      cursor = cursor.skip((page - 1) * limit).limit(limit);
    }

    const products = await cursor;

    const body = { products };
    if (limit) {
      body.pagination = {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      };
    }

    return NextResponse.json(body);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const name = String(body.name || "").trim();
    if (!name || !body.category || body.price === undefined || body.price === null || body.price === "") {
      return NextResponse.json({ error: "Name, category and price are required." }, { status: 400 });
    }

    const sku = String(body.sku || "").trim().toUpperCase();
    if (!sku) {
      return NextResponse.json({ error: "SKU is required." }, { status: 400 });
    }

    const { data, error } = pickProductFields(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const { variants, error: variantError } = normalizeVariants(body.variants);
    if (variantError) return NextResponse.json({ error: variantError }, { status: 400 });
    const variantList = variants || [];

    const conflict = await findSkuConflict({
      sku,
      variantSkus: variantList.map((v) => v.sku).filter(Boolean),
    });
    if (conflict) return NextResponse.json({ error: conflict }, { status: 400 });

    let slug = slugify(name);
    if (await Product.findOne({ slug })) slug = `${slug}-${Date.now().toString().slice(-5)}`;

    const product = await Product.create({
      ...data,
      name,
      sku,
      slug,
      media: normalizeMedia(body.media) || [],
      hasVariants: !!body.hasVariants && variantList.length > 0,
      variants: variantList,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return writeErrorResponse(err, "Failed to create product.");
  }
}
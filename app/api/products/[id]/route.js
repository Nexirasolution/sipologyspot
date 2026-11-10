import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import "@/models/Category";
import { deleteMediaFromCloudinary } from "@/lib/cloudinary";
import {
  isObjectId,
  normalizeMedia,
  normalizeVariants,
  pickProductFields,
  findSkuConflict,
  writeErrorResponse,
} from "@/lib/productHelpers";

const NOT_FOUND = () => NextResponse.json({ error: "Product not found." }, { status: 404 });

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // findById throws on a non-ObjectId string, so only use it for real ids
    // and fall back to the slug lookup otherwise.
    let product = null;
    if (isObjectId(id)) {
      product = await Product.findById(id).populate("category", "name slug");
    }
    if (!product) {
      product = await Product.findOne({ slug: String(id).toLowerCase() }).populate("category", "name slug");
    }

    if (!product) return NOT_FOUND();
    return NextResponse.json({ product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch product." }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!isObjectId(id)) return NOT_FOUND();

    const existing = await Product.findById(id);
    if (!existing) return NOT_FOUND();

    const body = await req.json();

    const { data, error } = pickProductFields(body);
    if (error) return NextResponse.json({ error }, { status: 400 });
    if (data.name !== undefined && !data.name) {
      return NextResponse.json({ error: "Product name cannot be empty." }, { status: 400 });
    }

    if (body.media !== undefined) {
      const media = normalizeMedia(body.media);
      if (media) data.media = media;
    }

    if (body.variants !== undefined) {
      const { variants, error: variantError } = normalizeVariants(body.variants);
      if (variantError) return NextResponse.json({ error: variantError }, { status: 400 });
      data.variants = variants || [];
    }

    if (body.hasVariants !== undefined) {
      const list = data.variants ?? existing.variants;
      data.hasVariants = !!body.hasVariants && list.length > 0;
    }

    let sku = existing.sku;
    if (body.sku !== undefined) {
      sku = String(body.sku).trim().toUpperCase();
      if (!sku) return NextResponse.json({ error: "SKU is required." }, { status: 400 });
      data.sku = sku;
    }

    if (data.sku !== undefined || data.variants !== undefined) {
      const variantSkus = (data.variants ?? existing.variants).map((v) => v.sku).filter(Boolean);
      const conflict = await findSkuConflict({ sku, variantSkus, excludeId: id });
      if (conflict) return NextResponse.json({ error: conflict }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!product) return NOT_FOUND();

    // Remove images/videos the admin took out of the product, so they don't pile up in Cloudinary
    if (data.media) {
      const kept = new Set(data.media.map((m) => m.publicId));
      const removed = (existing.media || []).filter((m) => m.publicId && !kept.has(m.publicId));
      await Promise.allSettled(
        removed.map((m) => deleteMediaFromCloudinary(m.publicId, m.type || "image"))
      );
    }

    return NextResponse.json({ product });
  } catch (err) {
    return writeErrorResponse(err, "Failed to update product.");
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!isObjectId(id)) return NOT_FOUND();

    const product = await Product.findById(id);
    if (!product) return NOT_FOUND();

    // A Cloudinary hiccup should not stop the product from being deleted
    const cleanup = [
      ...(product.media || []).map((item) => deleteMediaFromCloudinary(item.publicId, item.type || "image")),
      ...(product.images || []).map((item) => deleteMediaFromCloudinary(item.publicId, "image")),
    ];
    await Promise.allSettled(cleanup);

    await product.deleteOne();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly");

    const query = {};
    if (activeOnly === "true") query.isActive = true;

    const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 });
    return NextResponse.json({ categories });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch categories." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    let slug = slugify(body.name);
    const existing = await Category.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

    const category = await Category.create({ ...body, slug });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create category." }, { status: 500 });
  }
}

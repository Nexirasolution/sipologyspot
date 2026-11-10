import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { deleteMediaFromCloudinary } from "@/lib/cloudinary";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const category = await Category.findById(id);
    if (!category) return NextResponse.json({ error: "Category not found." }, { status: 404 });
    return NextResponse.json({ category });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch category." }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const category = await Category.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!category) return NextResponse.json({ error: "Category not found." }, { status: 404 });
    return NextResponse.json({ category });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const inUse = await Product.countDocuments({ category: id });
    if (inUse > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${inUse} product(s) still use this category.` },
        { status: 400 }
      );
    }

    const category = await Category.findById(id);
    if (!category) return NextResponse.json({ error: "Category not found." }, { status: 404 });

    if (category.image?.publicId) {
      await deleteMediaFromCloudinary(category.image.publicId, "image");
    }
    await category.deleteOne();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete category error:", err);
    return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
  }
}
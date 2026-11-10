import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Banner from "@/models/Banner";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly");

    const query = {};
    if (activeOnly === "true") query.isActive = true;

    const banners = await Banner.find(query).sort({ sortOrder: 1, createdAt: -1 });
    return NextResponse.json({ banners });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch banners." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const banner = await Banner.create({
      title: body.title,
      subtitle: body.subtitle || "",
      image: body.image || { url: "", publicId: "" },
      ctaText: body.ctaText || "",
      ctaLink: body.ctaLink || "",
      isActive: body.isActive !== undefined ? body.isActive : true,
      sortOrder: Number(body.sortOrder) || 0,
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create banner." }, { status: 500 });
  }
}
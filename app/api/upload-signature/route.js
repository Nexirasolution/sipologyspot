import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const folder = body.folder || "abi-products";
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (error) {
    console.error("Signature error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature." },
      { status: 500 }
    );
  }
}
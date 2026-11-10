import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    const folder = formData.get("folder") || "abi-products";

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Auto detect file type
    const mediaType = file.type.startsWith("video/")
      ? "video"
      : "image";

    console.log("Uploading:", file.name);
    console.log("Type:", mediaType);
    console.log("Folder:", folder);


    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);


    const uploadResult = await new Promise((resolve, reject) => {

      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: mediaType,
        },

        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }

      ).end(buffer);

    });


    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      mediaType,
    });


  } catch (error) {

    console.error("Upload error:", error);

    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );

  }
}
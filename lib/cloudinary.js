import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export function uploadToCloudinary(
  buffer,
  folder = "abi-products",
  mediaType = "image"
) {
  return new Promise((resolve, reject) => {

    if (!buffer) {
      return reject(new Error("No file buffer provided"));
    }

    const isVideo = mediaType === "video";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isVideo ? "video" : "image",

        // useful for videos
        ...(isVideo && {
          chunk_size: 6000000,
        }),
      },

      (error, result) => {

        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          mediaType,
        });

      }
    );


    streamifier
      .createReadStream(buffer)
      .pipe(uploadStream);

  });
}



export async function deleteMediaFromCloudinary(
  publicId,
  mediaType = "image"
) {

  if (!publicId) return;

  try {

    await cloudinary.uploader.destroy(publicId, {
      resource_type: mediaType,
    });


  } catch (error) {

    console.error(
      "Cloudinary delete failed:",
      error.message
    );

  }
}



export default cloudinary;
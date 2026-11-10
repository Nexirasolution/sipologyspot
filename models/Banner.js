import mongoose from "mongoose";

/* Only the image is required. Everything else is optional. */
const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, default: "", trim: true },
    subtitle: { type: String, default: "", trim: true },
    altText: { type: String, default: "", trim: true }, // read by screen readers when there is no title
    image: {
      url: { type: String, required: [true, "Banner image is required"], trim: true },
      publicId: { type: String, default: "" },
    },
    ctaText: { type: String, default: "", trim: true },
    ctaLink: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model("Banner", BannerSchema);
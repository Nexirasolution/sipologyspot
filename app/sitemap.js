import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

const BASE_URL = "https://www.abifoodsandoils.com";

export default async function sitemap() {
  await connectDB();

  const [products, categories] = await Promise.all([
    Product.find({ isActive: true }).select("slug updatedAt").lean(),
    Category.find({ isActive: true }).select("_id updatedAt").lean(),
  ]);

  const staticRoutes = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/track-order`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const categoryRoutes = categories.map((cat) => ({
    url: `${BASE_URL}/products?category=${cat._id}`,
    lastModified: cat.updatedAt || new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productRoutes = products
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
const BASE_URL = "https://www.abifoodsandoils.com";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/cart", "/checkout"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
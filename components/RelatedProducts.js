// components/RelatedProducts.jsx
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export default function RelatedProducts({ products, categoryId }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-forest md:text-3xl">
          You May Also Like
        </h2>

        {categoryId && (
          <Link
            href={`/products?category=${categoryId}`}
            className="shrink-0 text-sm font-semibold text-forest transition hover:text-gold-dark"
          >
            View All →
          </Link>
        )}
      </div>

      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 scrollbar-hide md:-mx-8 md:px-8">
        {products.map((p) => (
          <div
            key={p._id}
            className="w-[45%] shrink-0 snap-start sm:w-[32%] md:w-[24%] lg:w-[19%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
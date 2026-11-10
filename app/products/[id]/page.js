import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import "@/models/Category";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailActions from "@/components/ProductDetailActions";
import { LeafIcon } from "@/components/Icons";
import ProductGallery from "@/components/ProductGallery";
import ProductAccordion from "@/components/ProductAccordion";
import RelatedProducts from "@/components/RelatedProducts";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

async function getProduct(slug) {
  await connectDB();
  const product = await Product.findOne({ slug, isActive: true }).populate("category", "name slug").lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
}

async function getRelatedProducts(product) {
  await connectDB();
  const related = await Product.find({
    category: product.category?._id,
    _id: { $ne: product._id },
    isActive: true,
  })
    .populate("category", "name slug")
    .limit(8)
    .lean();
  return JSON.parse(JSON.stringify(related));
}

const rupees = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const settings = await getSettings();
  const media = product.media || [];

  const onSale = product.compareAtPrice > product.price;
  const savePercent = onSale ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;
  const inStock = product.stock > 0;

  const tags = [
    product.attributes?.handmade && "Traditionally Made",
    product.attributes?.natural && "100% Natural",
    product.attributes?.ecoFriendly && "No Preservatives",
  ].filter(Boolean);

  const accordionItems = [
    {
      title: "Description",
      content:
        product.description ||
        product.shortDescription ||
        "A premium product from Sipology Spot, made with natural ingredients and traditional methods.",
    },
    {
      title: "Product Details",
      content:
        tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Product qualities">
            {tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </ul>
        ) : (
          "Made with care by Sipology Spot."
        ),
    },
    {
      title: "Availability",
      content: inStock ? `${product.stock} in stock` : "Currently unavailable",
    },
  ];

  return (
    <>
      <a href="#product-main" className="gc-skip">
        Skip to product
      </a>

      <Navbar settings={settings} />

      <main id="product-main" tabIndex={-1} className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="gc-rise text-sm font-semibold text-[#6B5A1E]">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/products" className="gc-link">
                Products
              </Link>
            </li>
            {product.category?.name && (
              <li className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                <span>{product.category.name}</span>
              </li>
            )}
            <li className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="font-extrabold text-[#1A1408]">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>

        <article aria-labelledby="product-title" className="mt-10 grid gap-12 md:grid-cols-2 md:gap-16">
          {/* Gallery */}
          <div className="gc-rise" style={{ "--d": "100ms" }}>
            {media.length > 0 ? (
              <ProductGallery media={media} productName={product.name} />
            ) : (
              <div
                role="img"
                aria-label={`No image available for ${product.name}`}
                className="gc-float-soft flex aspect-square items-center justify-center rounded-3xl border border-[#C9A227]/40 bg-[#FBF6E6] text-[#C9A227]"
              >
                <LeafIcon className="h-20 w-20" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Core info */}
          <div>
            {product.category?.name && (
              <p className="gc-rise text-xs font-extrabold uppercase tracking-[0.3em] text-[#8A6A00]" style={{ "--d": "150ms" }}>
                {product.category.name}
              </p>
            )}

            <h1
              id="product-title"
              className="gc-rise gc-underline mt-3 text-4xl font-extrabold leading-tight text-[#1A1408] md:text-5xl"
              style={{ "--d": "220ms" }}
            >
              {product.name}
            </h1>

            {/* Simple products show one price. Variant products show their own
                size-specific price inside ProductDetailActions. */}
            {!product.hasVariants && (
              <div className="gc-rise mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2" style={{ "--d": "320ms" }}>
                <p className="gc-display text-4xl font-extrabold text-[#1A1408]">
                  <span className="sr-only">Price: </span>
                  {rupees(product.price)}
                </p>
                {onSale && (
                  <>
                    <p className="text-base font-semibold text-[#6B5A1E]">
                      <span className="sr-only">Original price: </span>
                      <del>{rupees(product.compareAtPrice)}</del>
                    </p>
                    <p className="rounded-full bg-[#C9A227] px-3 py-1 text-xs font-extrabold text-[#1A1408]">
                      Save {savePercent}%
                      <span className="sr-only"> off the original price</span>
                    </p>
                  </>
                )}
                <p className="text-sm font-semibold text-[#6B5A1E]">
                  <span aria-hidden="true">/ </span>
                  <span className="sr-only">per </span>
                  {product.unit}
                </p>
              </div>
            )}

            {!inStock && (
              <p role="status" className="gc-rise mt-5 inline-block rounded-full border-2 border-[#1A1408] px-4 py-1.5 text-sm font-extrabold" style={{ "--d": "380ms" }}>
                Currently unavailable
              </p>
            )}

            <div className="gc-rise mt-8" style={{ "--d": "420ms" }}>
              <ProductDetailActions product={product} />
            </div>
          </div>
        </article>

        {/* Description / details / availability */}
        <div className="gc-rise mt-16" style={{ "--d": "500ms" }}>
          <ProductAccordion items={accordionItems} />
        </div>
      </main>

      <RelatedProducts products={related} categoryId={product.category?._id} />

      <Footer />
    </>
  );
}

function Tag({ label }) {
  return (
    <li className="gc-tag rounded-full border border-[#C9A227]/60 bg-[#FBF6E6] px-4 py-1.5 text-xs font-extrabold text-[#1A1408]">
      {label}
    </li>
  );
}
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { LeafIcon } from "@/components/Icons";
import HeroSlider from "@/components/HeroSlider";
import { ArrowRight } from "lucide-react";
import { getSettings } from "@/lib/settings";
export const dynamic = "force-dynamic";

async function getData() {
  await connectDB();
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  const bestSelling = await Product.find({ isActive: true, isFeatured: true })
    .populate("category", "name slug")
    // Admin-chosen order first (lower featuredOrder = shown first), then
    // newest-featured as a tiebreaker for anything still at the default 0.
    .sort({ featuredOrder: 1, createdAt: -1 })
    .limit(8)
    .lean();
  return {
    categories: JSON.parse(JSON.stringify(categories)),
    bestSelling: JSON.parse(JSON.stringify(bestSelling)),
  };
}

const WHY_CHOOSE = [
  { title: "Wood cold-pressed", desc: "Traditional marachekku extraction, no heat" },
  { title: "100% natural", desc: "No chemicals, no preservatives added" },
  { title: "Farm fresh spices", desc: "Sourced and ground in small batches" },
  { title: "Pan India delivery", desc: "Safe and timely, everywhere" },
];

// Map your Category collection's `name` field (as entered in the admin panel)
// to a fallback image. Update these keys to match your actual category names.
const CATEGORY_IMAGES = {
  "Cold-Pressed Oils": "/categroy/cold-pressed-oils.png",
  "Sambar & Curry Masalas": "/categroy/masala-powders.png",
  "Spice Powders": "/categroy/spice-powders.png",
  "Health Mix & Malt": "/categroy/health-mix.png",
  "Traditional Podi": "/categroy/podi.png",
  "Turmeric & Roots": "/categroy/turmeric.png",
};

/** Bold heading with a gold bar that draws itself when scrolled into view. */
function SectionHeading({ id, eyebrow, children, center = true }) {
  return (
    <Reveal className={center ? "text-center" : ""}>
      {eyebrow && <p className="text-sm font-bold text-gold-deep">{eyebrow}</p>}
      <h2
        id={id}
        className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink md:text-5xl"
      >
        {children}
      </h2>
      <span
        aria-hidden="true"
        className={`mt-4 block h-1 w-16 scale-x-0 rounded-full bg-gold transition-transform delay-300 duration-700 group-data-[shown=true]/reveal:scale-x-100 ${
          center ? "mx-auto origin-center" : "origin-left"
        }`}
      />
    </Reveal>
  );
}

export default async function HomePage() {
  const { categories, bestSelling } = await getData();
  const settings = await getSettings();

  return (
    <>
      <Navbar settings={settings} />

      {/* Navbar's skip link jumps here */}
      <main id="main-content" tabIndex={-1}>
        {/* Page title for screen readers. Remove this if HeroSlider already renders an <h1>. */}
        <h1 className="sr-only">
          {settings?.storeName || "Sipology Spot"}: premium organic cold-pressed oils and spices
        </h1>

        <HeroSlider />

        {/* Categories: circle gallery */}
        <section
          aria-labelledby="categories-heading"
          className="mx-auto max-w-7xl py-14 md:px-8 md:py-24"
        >
          <div className="mb-12 flex flex-col gap-4 px-5 md:flex-row md:items-end md:justify-between md:px-0">
            <SectionHeading
              id="categories-heading"
              eyebrow="Wood pressed, farm fresh"
              center={false}
            >
              Shop by category
            </SectionHeading>
            <Reveal delay={200}>
              <p className="max-w-xs text-sm font-semibold text-muted md:text-right">
                Choose a category to see every product in it.
              </p>
            </Reveal>
          </div>

          {categories.length === 0 ? (
            <p className="px-5 text-center font-medium text-muted">
              Categories will appear here once added from the admin panel.
            </p>
          ) : (
            <ul
              role="list"
              className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 md:grid md:grid-cols-6 md:gap-x-6 md:gap-y-12 md:overflow-visible md:px-0 md:pb-10"
            >
              {categories.map((cat, i) => (
                <Reveal
                  as="li"
                  key={cat._id}
                  delay={Math.min(i, 8) * 90}
                  className="w-[42vw] shrink-0 snap-start sm:w-[28vw] md:w-auto"
                >
                  <div>
                    <Link href={`/products?category=${cat._id}`} className="group block">
                      <span className="relative block aspect-square w-full">
                        {/* Gold outline circle, offset behind the photo */}
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 translate-x-2 translate-y-2 rounded-full border-2 border-gold transition-transform duration-500 ease-out group-hover:translate-x-3.5 group-hover:translate-y-3.5 group-focus-visible:translate-x-3.5 group-focus-visible:translate-y-3.5"
                        />
                        {/* Circular photo */}
                        <span className="absolute inset-0 overflow-hidden rounded-full bg-gold-soft shadow-md transition-shadow duration-500 group-hover:shadow-xl">
                          {/* Empty alt: the visible name below already labels the link */}
                          <Image
                            src={cat.image?.url || CATEGORY_IMAGES[cat.name] || "/categroy/default.png"}
                            alt=""
                            fill
                            sizes="(max-width:768px) 45vw, 16vw"
                            className="object-cover transition duration-700 ease-out group-hover:scale-110 group-focus-visible:scale-110"
                          />
                        </span>
                      </span>

                      <span className="mt-7 block text-center font-display text-sm font-extrabold text-ink transition-colors duration-300 group-hover:text-gold-deep md:text-base">
                        {cat.name}
                      </span>
                    </Link>
                  </div>
                </Reveal>
              ))}

              {/* Final tile: browse everything */}
              <Reveal
                as="li"
                delay={Math.min(categories.length, 8) * 90}
                className="w-[42vw] shrink-0 snap-start sm:w-[28vw] md:w-auto"
              >
                <div>
                  <Link href="/products" className="group block">
                    <span className="relative flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-full border-2 border-dashed border-gold bg-gold-pale text-center transition duration-500 group-hover:border-solid group-hover:bg-gold">
                      <ArrowRight
                        aria-hidden="true"
                        className="h-8 w-8 text-gold-deep transition duration-500 group-hover:translate-x-1.5 group-hover:text-ink"
                      />
                      <span className="px-4 font-display text-sm font-extrabold text-ink md:text-base">
                        All products
                      </span>
                    </span>
                  </Link>
                </div>
              </Reveal>
            </ul>
          )}
        </section>

        {/* Best selling products */}
        {bestSelling.length > 0 && (
          <section aria-labelledby="best-selling-heading" className="bg-gold-pale py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-5 md:px-8">
              <div className="mb-12 flex items-end justify-between gap-4">
                <SectionHeading
                  id="best-selling-heading"
                  eyebrow="Customer favorites"
                  center={false}
                >
                  Best selling products
                </SectionHeading>

                <Link
                  href="/products"
                  className="group hidden shrink-0 items-center gap-2 rounded-full border-2 border-gold px-5 py-2.5 font-display text-sm font-bold text-ink transition duration-300 hover:bg-gold md:inline-flex"
                >
                  <span>
                    View all<span className="sr-only"> best selling products</span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <ul
                role="list"
                className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4"
              >
                {bestSelling.map((p, i) => (
                  <Reveal as="li" key={p._id} delay={(i % 4) * 90}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </ul>

              {/* Shop now CTA */}
              <Reveal className="mt-12 flex justify-center">
                <Link href="/products" className="btn-gold group gap-2 text-sm">
                  Shop now
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5"
                  />
                </Link>
              </Reveal>
            </div>
          </section>
        )}

        {/* Why choose us */}
        <section
          aria-labelledby="why-heading"
          className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24"
        >
          <div className="mb-12">
            <SectionHeading id="why-heading">Why choose us?</SectionHeading>
          </div>

          <ul role="list" className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {WHY_CHOOSE.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 110} className="text-center">
                <div className="group">
                  <span className="badge-stamp mx-auto h-16 w-16 bg-gold text-ink shadow-md transition duration-500 group-hover:rotate-12 group-hover:shadow-xl">
                    <span aria-hidden="true">
                      <LeafIcon className="h-7 w-7" />
                    </span>
                  </span>
                  <h3 className="mt-5 font-display text-base font-extrabold text-ink md:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm font-medium text-muted">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </section>
      </main>

      <Footer settings={settings} />
    </>
  );
}
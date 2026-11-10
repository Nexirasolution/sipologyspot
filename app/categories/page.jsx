// app/categories/page.jsx
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const CATEGORY_IMAGES = {
  "Cold-Pressed Oils": "/categroy/cold-pressed-oils.png",
  "Sambar & Curry Masalas": "/categroy/masala-powders.png",
  "Spice Powders": "/categroy/spice-powders.png",
  "Health Mix & Malt": "/categroy/health-mix.png",
  "Traditional Podi": "/categroy/podi.png",
  "Turmeric & Roots": "/categroy/turmeric.png",
};

const PAGE_SIZE = 18;

async function getCategories() {
  await connectDB();
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

export const metadata = {
  title: "Shop by Category | Sipology spot",
  description: "Browse all product categories — wood cold-pressed oils and traditional spice powders.",
};

export default async function CategoriesPage({ searchParams }) {
  const { page: pageParam } = await searchParams;
  const allCategories = await getCategories();
  const settings = await getSettings();

  const totalPages = Math.max(1, Math.ceil(allCategories.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, parseInt(pageParam || "1", 10) || 1), totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const categories = allCategories.slice(start, start + PAGE_SIZE);

  return (
    <>
      <Navbar settings={settings} />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-20">
        <header className="mb-14 max-w-3xl">
          <p className="gc-rise text-xs font-extrabold uppercase tracking-[0.35em] text-[#8A6A00]">Browse</p>
          <h1
            className="gc-rise gc-underline mt-4 text-4xl font-extrabold leading-[1.05] text-[#1A1408] md:text-6xl"
            style={{ "--d": "120ms" }}
          >
            All Categories
          </h1>
          {allCategories.length > 0 && (
            <p className="gc-rise mt-8 text-sm font-bold text-[#6B5A1E]" style={{ "--d": "260ms" }}>
              {allCategories.length} {allCategories.length === 1 ? "category" : "categories"}
              {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
            </p>
          )}
        </header>

        {allCategories.length === 0 ? (
          <p className="font-semibold text-[#6B5A1E]">Categories will appear here once added from the admin panel.</p>
        ) : (
          <>
            <ul className="grid grid-cols-3 gap-x-4 gap-y-10 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {categories.map((cat, idx) => (
                <li key={cat._id} className="gc-rise" style={{ "--d": `${200 + idx * 60}ms` }}>
                  <Link
                    href={`/products?category=${cat._id}`}
                    className="group flex flex-col items-center rounded-2xl p-1"
                  >
                    <span className="relative block h-24 w-24 overflow-hidden rounded-full border-2 border-[#C9A227] bg-[#FBF6E6] shadow-[0_14px_28px_-16px_rgba(138,100,16,0.6)] transition duration-500 group-hover:-translate-y-1.5 group-hover:scale-105 group-hover:border-[#1A1408] md:h-28 md:w-28">
                      <Image
                        src={cat.image?.url || CATEGORY_IMAGES[cat.name] || "/categroy/default.png"}
                        alt="" /* decorative: the category name is the link text */
                        fill
                        sizes="(max-width:768px) 96px, 112px"
                        className="object-cover"
                      />
                    </span>

                    <span className="gc-link mt-4 text-center text-sm font-extrabold text-[#1A1408] md:text-base">
                      {cat.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

function Pagination({ currentPage, totalPages }) {
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="mt-16">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          <PageLink page={currentPage - 1} disabled={currentPage === 1} ariaLabel="Previous page">
            <span aria-hidden="true">‹ Prev</span>
          </PageLink>
        </li>

        {pages.map((p, i) =>
          p === "..." ? (
            <li key={`dots-${i}`} aria-hidden="true" className="px-2 text-sm font-bold text-[#6B5A1E]">
              …
            </li>
          ) : (
            <li key={p}>
              <PageLink
                page={p}
                active={p === currentPage}
                ariaLabel={p === currentPage ? `Page ${p}, current page` : `Go to page ${p}`}
              >
                {p}
              </PageLink>
            </li>
          )
        )}

        <li>
          <PageLink page={currentPage + 1} disabled={currentPage === totalPages} ariaLabel="Next page">
            <span aria-hidden="true">Next ›</span>
          </PageLink>
        </li>
      </ul>
    </nav>
  );
}

function PageLink({ page, ariaLabel, active, disabled, children }) {
  const base =
    "flex h-11 min-w-11 items-center justify-center rounded-full border-2 px-4 text-sm font-extrabold transition duration-300";

  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={ariaLabel} className={`${base} border-transparent text-[#1A1408]/30`}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={page <= 1 ? "/categories" : `/categories?page=${page}`}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={`${base} border-[#1A1408] hover:-translate-y-0.5 active:scale-95 ${
        active ? "bg-[#C9A227] text-[#1A1408]" : "bg-white text-[#1A1408] hover:bg-[#FBF6E6]"
      }`}
    >
      {children}
    </Link>
  );
}

function getPageNumbers(current, total) {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let last;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (last) {
      if (i - last === 2) {
        rangeWithDots.push(last + 1);
      } else if (i - last > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    last = i;
  }

  return rangeWithDots;
}
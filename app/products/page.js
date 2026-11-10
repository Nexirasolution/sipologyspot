import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductsGrid from "@/components/ProductsGrid";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Shop | Sipology Spot" };

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  const category = sp?.category || "";
  const search = sp?.search || "";
  const settings = await getSettings();

  // Plain-language description of any active filters, for screen readers
  const filterNote = [
    category && `category ${category}`,
    search && `search “${search}”`,
  ]
    .filter(Boolean)
    .join(" and ");

  return (
    <>
      <a href="#shop-main" className="gc-skip">
        Skip to products
      </a>

      <Navbar settings={settings} />

      <main id="shop-main" tabIndex={-1} className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-20">
        <header className="mb-14 max-w-4xl">
          <p className="gc-rise text-xs font-extrabold uppercase tracking-[0.35em] text-[#8A6A00]">
            Our Collection
          </p>

          <h1
            className="gc-rise gc-underline mt-4 text-4xl font-extrabold leading-[1.05] text-[#1A1408] md:text-6xl"
            style={{ "--d": "120ms" }}
          >
            Wood Cold-Pressed Oils &amp; Traditional Spice Powders
          </h1>

          <p className="gc-rise mt-8 max-w-xl text-base font-semibold text-[#6B5A1E]" style={{ "--d": "260ms" }}>
            Pure, natural and made the traditional way.
          </p>

          {filterNote && (
            <p className="gc-rise mt-3 text-sm font-bold text-[#1A1408]" style={{ "--d": "340ms" }}>
              <span className="sr-only">Showing results filtered by </span>
              <span aria-hidden="true">Filtered by: </span>
              {filterNote}
            </p>
          )}
        </header>

        <section aria-label="Products" className="gc-rise" style={{ "--d": "400ms" }}>
          <ProductsGrid initialCategory={category} initialSearch={search} />
        </section>
      </main>

      <Footer />
    </>
  );
}
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAnnounce } from "@/components/A11yProvider";

const FILTERS = [
  ["all", "All"],
  ["low", "Low Stock"],
  ["out", "Out of Stock"],
];

/* Status is shown as words as well as colour, so it never relies on colour alone */
function stockStatus(p) {
  if (p.stock <= 0) return { label: "Out of stock", cls: "bg-[#1a1408] text-white" };
  if (p.stock <= p.lowStockThreshold) return { label: "Low stock", cls: "bg-[#c9a227] text-[#1a1408]" };
  return { label: "In stock", cls: "border-2 border-[#C9A227] bg-white text-[#1a1408]" };
}

export default function AdminInventoryPage() {
  const announce = useAnnounce();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | low | out
  const [savingId, setSavingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [pageError, setPageError] = useState("");

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setPageError("Could not load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function saveStock(p) {
    const raw = editValues[p._id];
    if (raw === undefined || raw === "") return;

    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      const msg = `Enter a stock number of 0 or more for ${p.name}.`;
      setPageError(msg);
      announce(msg, "assertive");
      return;
    }

    setSavingId(p._id);
    try {
      const res = await fetch(`/api/products/${p._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: value }),
      });
      if (!res.ok) throw new Error();

      setProducts((prev) => prev.map((x) => (x._id === p._id ? { ...x, stock: value } : x)));
      setEditValues((prev) => {
        const next = { ...prev };
        delete next[p._id];
        return next;
      });
      setPageError("");
      announce(`${p.name} stock updated to ${value}.`);
    } catch {
      const msg = `Could not update stock for ${p.name}. Please try again.`;
      setPageError(msg);
      announce(msg, "assertive");
    } finally {
      setSavingId(null);
    }
  }

  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => {
      if (filter === "low") return p.stock > 0 && p.stock <= p.lowStockThreshold;
      if (filter === "out") return p.stock <= 0;
      return true;
    });

  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outCount = products.filter((p) => p.stock <= 0).length;

  const stats = [
    ["Total products", products.length],
    ["Low stock", lowCount],
    ["Out of stock", outCount],
  ];

  return (
    <div>
      <div className="gc-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="gc-underline text-3xl font-extrabold text-[#1a1408] md:text-4xl">Inventory</h1>
          <p className="mt-5 text-sm font-bold text-[#6B5A1E]">Track and update stock levels across all products</p>
        </div>

        <form role="search" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="inventory-search" className="sr-only">
            Search products
          </label>
          <input
            id="inventory-search"
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border-2 border-[#1a1408] bg-white px-5 py-2.5 text-sm font-semibold transition focus:border-[#c9a227] md:w-72"
          />
        </form>
      </div>

      {pageError && (
        <p
          role="alert"
          className="gc-rise mt-6 rounded-2xl border-2 border-[#1a1408] bg-[#FBF6E6] px-4 py-3 text-sm font-bold"
        >
          {pageError}
        </p>
      )}

      {/* Summary cards */}
      <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(([label, value], i) => (
          <div
            key={label}
            className="gc-rise card-hover rounded-3xl border border-[#C9A227]/50 bg-white p-5"
            style={{ "--d": `${150 + i * 90}ms` }}
          >
            <dt className="text-xs font-extrabold uppercase tracking-wider text-[#6B5A1E]">{label}</dt>
            <dd key={value} className="gc-pop gc-display mt-2 text-4xl font-extrabold text-[#1a1408]">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Filters */}
      <div role="group" aria-label="Filter products by stock level" className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`rounded-full border-2 border-[#1a1408] px-5 py-2 text-xs font-extrabold transition active:scale-95 ${
              filter === key ? "bg-[#c9a227] text-[#1a1408]" : "bg-white hover:bg-[#FBF6E6]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Result count, read out politely as you search or filter */}
      <p role="status" aria-live="polite" className="mt-4 text-sm font-bold text-[#6B5A1E]">
        {loading ? "Loading products…" : `Showing ${filtered.length} of ${products.length} products`}
      </p>

      <div className="mt-3 overflow-x-auto rounded-3xl border border-[#C9A227]/50 bg-white">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Product stock levels. Use the Update stock field in each row to change a product&apos;s stock.
          </caption>
          <thead className="border-b border-[#C9A227]/40 bg-[#FBF6E6] text-xs uppercase tracking-wider text-[#6B5A1E]">
            <tr>
              <th scope="col" className="px-4 py-3 font-extrabold">Product</th>
              <th scope="col" className="px-4 py-3 font-extrabold">Category</th>
              <th scope="col" className="px-4 py-3 font-extrabold">Current stock</th>
              <th scope="col" className="px-4 py-3 font-extrabold">Low stock alert at</th>
              <th scope="col" className="px-4 py-3 font-extrabold">Update stock</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center font-semibold text-[#6B5A1E]">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center font-semibold text-[#6B5A1E]">
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map((p, idx) => {
                const status = stockStatus(p);
                const editing = editValues[p._id] !== undefined;
                return (
                  <tr
                    key={p._id}
                    className="gc-rise border-b border-[#C9A227]/20 transition-colors last:border-0 hover:bg-[#fffdf5]"
                    style={{ "--d": `${Math.min(idx, 10) * 40}ms` }}
                  >
                    {/* Row header: screen readers announce the product name with each cell */}
                    <th scope="row" className="px-4 py-3 font-normal">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#FBF6E6]">
                          {p.images?.[0]?.url && (
                            <Image src={p.images[0].url} alt="" width={44} height={44} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="font-extrabold text-[#1a1408]">{p.name}</span>
                      </div>
                    </th>

                    <td className="px-4 py-3 font-semibold text-[#6B5A1E]">{p.category?.name}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span key={p.stock} className="gc-pop gc-display text-lg font-extrabold">
                          {p.stock}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${status.cls}`}>
                          {status.label}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-[#6B5A1E]">{p.lowStockThreshold}</td>

                    <td className="px-4 py-3">
                      {/* A form so pressing Enter in the field saves too */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          saveStock(p);
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          aria-label={`New stock quantity for ${p.name}`}
                          placeholder={String(p.stock)}
                          value={editValues[p._id] ?? ""}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, [p._id]: e.target.value }))}
                          className="w-24 rounded-xl border-2 border-[#1a1408]/30 px-3 py-2 text-sm font-bold transition focus:border-[#c9a227]"
                        />
                        <button
                          type="submit"
                          disabled={savingId === p._id || !editing}
                          aria-label={`Save stock for ${p.name}`}
                          className="rounded-full border-2 border-[#1a1408] bg-[#c9a227] px-4 py-2 text-xs font-extrabold text-[#1a1408] transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0"
                        >
                          {savingId === p._id ? "Saving…" : "Save"}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
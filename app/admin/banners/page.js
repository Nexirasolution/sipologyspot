"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";
import ImageUploader from "@/components/ImageUploader";
import { useAnnounce } from "@/components/A11yProvider";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  altText: "",
  image: [],
  ctaText: "",
  ctaLink: "",
  isActive: true,
  sortOrder: 0,
};

/* Inputs keep the global keyboard focus ring (no outline-none) */
const inputCls =
  "w-full rounded-xl border-2 border-[#1a1408]/20 bg-white px-4 py-2.5 text-sm font-semibold transition focus:border-[#c9a227]";
const labelCls = "mb-1 block text-xs font-extrabold uppercase tracking-wider text-[#6B5A1E]";

export default function AdminBannersPage() {
  const announce = useAnnounce();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState(""); // replaces alert()

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/banners");
      const data = await res.json();
      setBanners(data.banners || []);
    } catch {
      setPageError("Could not load banners.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function fail(msg) {
    setPageError(msg);
    announce(msg, "assertive");
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(b) {
    setEditingId(b._id);
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      altText: b.altText || "",
      image: b.image?.url ? [b.image] : [],
      ctaText: b.ctaText || "",
      ctaLink: b.ctaLink || "",
      isActive: b.isActive,
      sortOrder: b.sortOrder || 0,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    // The image is the only required field
    if (!form.image[0]?.url) {
      setError("Please upload a banner image.");
      announce("Please upload a banner image.", "assertive");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        altText: form.altText,
        ctaText: form.ctaText,
        ctaLink: form.ctaLink,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
        image: { url: form.image[0].url, publicId: form.image[0].publicId || "" },
      };

      const res = await fetch(editingId ? `/api/banners/${editingId}` : "/api/banners", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save banner.");

      setModalOpen(false);
      setPageError("");
      announce(editingId ? "Banner updated." : "Banner added.");
      loadData();
    } catch (err) {
      setError(err.message);
      announce(err.message, "assertive");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(b) {
    if (!confirm(`Delete "${b.title || "this banner"}"?`)) return;
    const res = await fetch(`/api/banners/${b._id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return fail(data.error || "Could not delete banner.");
    setPageError("");
    announce("Banner deleted.");
    loadData();
  }

  async function toggleActive(b) {
    const res = await fetch(`/api/banners/${b._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !b.isActive }),
    });
    const data = await res.json();
    if (!res.ok) return fail(data.error || "Could not update banner.");
    setPageError("");
    announce(`${b.title || "Banner"} is now ${b.isActive ? "hidden" : "active"}.`);
    loadData();
  }

  return (
    <div>
      <div className="gc-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="gc-underline text-3xl font-extrabold text-[#1a1408] md:text-4xl">Banners</h1>
          <p className="mt-5 text-sm font-bold text-[#6B5A1E]">
            {banners.length} {banners.length === 1 ? "banner" : "banners"}
          </p>
        </div>
        <button type="button" onClick={openAdd} className="btn-gold text-sm">
          + Add Banner
        </button>
      </div>

      {pageError && (
        <p
          role="alert"
          className="gc-rise mt-6 rounded-2xl border-2 border-[#1a1408] bg-[#FBF6E6] px-4 py-3 text-sm font-bold text-[#1a1408]"
        >
          {pageError}
        </p>
      )}

      <div className="mt-8">
        {loading ? (
          <p className="font-semibold text-[#6B5A1E]" role="status">
            Loading banners…
          </p>
        ) : banners.length === 0 ? (
          <div className="gc-rise rounded-3xl border border-[#C9A227]/50 bg-white p-10 text-center">
            <p className="font-extrabold text-[#1a1408]">No banners yet</p>
            <p className="mt-1 text-sm font-semibold text-[#6B5A1E]">Add your first banner to show it on the home page.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {banners.map((b, idx) => {
              const name = b.title || "Untitled banner";
              return (
                <li
                  key={b._id}
                  className="gc-rise card-hover w-full min-w-0 overflow-hidden rounded-3xl border border-[#C9A227]/50 bg-white p-4 md:p-5"
                  style={{ "--d": `${idx * 80}ms` }}
                >
                  <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="h-20 w-32 shrink-0 overflow-hidden rounded-2xl bg-[#FBF6E6]">
                        {b.image?.url ? (
                          <Image
                            src={b.image.url}
                            alt={b.altText || b.title || "Banner image"}
                            width={200}
                            height={120}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#6B5A1E]">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className={`truncate text-lg font-extrabold ${b.title ? "text-[#1a1408]" : "italic text-[#6B5A1E]"}`}>
                          {name}
                        </h2>
                        {b.subtitle && <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#6B5A1E]">{b.subtitle}</p>}
                        {b.ctaText && (
                          <p className="mt-1 truncate text-xs font-bold text-[#8A6A00]">
                            Button: {b.ctaText} → {b.ctaLink || "(no link)"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(b)}
                        aria-pressed={b.isActive}
                        aria-label={`${name}: ${b.isActive ? "active, press to hide" : "hidden, press to show"}`}
                        className={`rounded-full border-2 border-[#1a1408] px-4 py-1.5 text-xs font-extrabold transition active:scale-95 ${
                          b.isActive ? "bg-[#c9a227] text-[#1a1408]" : "bg-white text-[#1a1408] hover:bg-[#FBF6E6]"
                        }`}
                      >
                        {b.isActive ? "Active" : "Hidden"}
                      </button>

                      <button
                        type="button"
                        title="Edit"
                        aria-label={`Edit ${name}`}
                        onClick={() => openEdit(b)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#1a1408] transition hover:-translate-y-0.5 hover:bg-[#c9a227] active:scale-95"
                      >
                        <span aria-hidden="true">✏️</span>
                      </button>

                      <button
                        type="button"
                        title="Delete"
                        aria-label={`Delete ${name}`}
                        onClick={() => handleDelete(b)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#1a1408] transition hover:-translate-y-0.5 hover:bg-[#1a1408] active:scale-95"
                      >
                        <span aria-hidden="true">🗑️</span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Banner" : "Add Banner"}
      >
        <form onSubmit={handleSave} className="space-y-5" noValidate>
          {/* Image first, since it's the only required field */}
          <div>
            <span id="banner-image-label" className={labelCls}>
              Banner image (required)
            </span>
            <p id="banner-image-help" className="mb-2 text-xs font-semibold text-[#6B5A1E]">
              Fills the whole banner, including on mobile.
            </p>
            <div
              role="group"
              aria-labelledby="banner-image-label"
              aria-describedby={error ? "banner-image-help banner-error" : "banner-image-help"}
            >
              <ImageUploader
                images={form.image}
                onChange={(imgs) => setForm({ ...form, image: imgs })}
                folder="abi-foods-banners"
                multiple={false}
              />
            </div>
          </div>

          <label className="block">
            <span className={labelCls}>Title (optional)</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className={labelCls}>Subtitle (optional)</span>
            <textarea
              rows={2}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className={labelCls}>Image description for screen readers (optional)</span>
            <input
              value={form.altText}
              onChange={(e) => setForm({ ...form, altText: e.target.value })}
              placeholder="e.g. Bottles of cold-pressed groundnut oil"
              className={inputCls}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Button text (optional)</span>
              <input
                value={form.ctaText}
                onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                placeholder="e.g. Shop Now"
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className={labelCls}>Button link (optional)</span>
              <input
                value={form.ctaLink}
                onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                placeholder="/products or https://..."
                aria-describedby="cta-help"
                className={inputCls}
              />
            </label>
          </div>
          <p id="cta-help" className="-mt-3 text-xs font-semibold text-[#6B5A1E]">
            A link without button text makes the whole banner clickable.
          </p>

          <label className="block">
            <span className={labelCls}>Sort order</span>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              className={inputCls}
            />
          </label>

          <label className="flex items-center gap-3 text-sm font-bold">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-5 w-5 accent-[#c9a227]"
            />
            Active (visible on site)
          </label>

          {error && (
            <p id="banner-error" role="alert" className="rounded-xl border-2 border-[#1a1408] bg-[#FBF6E6] px-4 py-2 text-sm font-bold">
              {error}
            </p>
          )}

          <button type="submit" disabled={saving} className="btn-gold w-full disabled:opacity-60">
            {saving ? "Saving…" : editingId ? "Save Changes" : "Add Banner"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
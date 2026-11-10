"use client";

import { useEffect, useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import Modal from "@/components/Modal";
import { CATEGORY_ICONS, LeafIcon } from "@/components/Icons";
import { useAnnounce } from "@/components/A11yProvider";

const EMPTY_FORM = {
  name: "",
  description: "",
  icon: "leaf",
  image: [],
  isActive: true,
  sortOrder: 0,
};
const ICON_OPTIONS = ["leaf", "bag", "drop", "herb"];

/* Inputs keep the global keyboard focus ring (no outline-none) */
const inputCls =
  "w-full rounded-xl border-2 border-[#1a1408]/20 bg-white px-4 py-2.5 text-sm font-semibold transition focus:border-[#c9a227]";
const labelCls = "mb-1 block text-xs font-extrabold uppercase tracking-wider text-[#6B5A1E]";

export default function AdminCategoriesPage() {
  const announce = useAnnounce();
  const [categories, setCategories] = useState([]);
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
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      setPageError("Could not load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditingId(c._id);
    setForm({
      name: c.name,
      description: c.description || "",
      icon: c.icon || "leaf",
      image: c.image?.url ? [c.image] : [],
      isActive: c.isActive,
      sortOrder: c.sortOrder || 0,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter a category name.");
      announce("Please enter a category name.", "assertive");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        icon: form.icon,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
        image: form.image[0]
          ? { url: form.image[0].url, publicId: form.image[0].publicId }
          : { url: "", publicId: "" },
      };

      const res = await fetch(editingId ? `/api/categories/${editingId}` : "/api/categories", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category.");

      setModalOpen(false);
      setPageError("");
      announce(editingId ? "Category updated." : "Category added.");
      loadData();
    } catch (err) {
      setError(err.message);
      announce(err.message, "assertive");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c) {
    if (!confirm(`Delete "${c.name}"?`)) return;
    const res = await fetch(`/api/categories/${c._id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error || "Could not delete category.";
      setPageError(msg);
      announce(msg, "assertive");
      return;
    }
    setPageError("");
    announce(`${c.name} deleted.`);
    loadData();
  }

  return (
    <div>
      <div className="gc-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="gc-underline text-3xl font-extrabold text-[#1a1408] md:text-4xl">Categories</h1>
          <p className="mt-5 text-sm font-bold text-[#6B5A1E]">
            {categories.length} {categories.length === 1 ? "category" : "categories"}
          </p>
        </div>
        <button type="button" onClick={openAdd} className="btn-gold text-sm">
          + Add Category
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
            Loading categories…
          </p>
        ) : categories.length === 0 ? (
          <div className="gc-rise rounded-3xl border border-[#C9A227]/50 bg-white p-10 text-center">
            <p className="font-extrabold text-[#1a1408]">No categories yet</p>
            <p className="mt-1 text-sm font-semibold text-[#6B5A1E]">Add a category to organise your products.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {categories.map((c, idx) => {
              const Icon = CATEGORY_ICONS[c.icon] || LeafIcon;

              return (
                <li
                  key={c._id}
                  className="gc-rise card-hover w-full min-w-0 overflow-hidden rounded-3xl border border-[#C9A227]/50 bg-white p-4 md:p-5"
                  style={{ "--d": `${idx * 80}ms` }}
                >
                  <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {c.image?.url ? (
                        // decorative: the category name is read right beside it
                        <img
                          src={c.image.url}
                          alt=""
                          className="h-16 w-16 shrink-0 rounded-full border-2 border-[#C9A227] object-cover"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FBF6E6] text-[#8A6A00]"
                        >
                          <Icon className="h-7 w-7" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-lg font-extrabold text-[#1a1408] md:text-xl">{c.name}</h2>
                        <p className="truncate text-sm font-semibold text-[#8A6A00]">
                          <span className="sr-only">Web address: </span>/{c.name.toLowerCase().replace(/\s+/g, "-")}
                        </p>
                        {c.description && (
                          <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#6B5A1E]">{c.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-end gap-3">
                      {c.isActive === false && (
                        <span className="rounded-full border-2 border-[#1a1408] px-3 py-1 text-xs font-extrabold">
                          Hidden
                        </span>
                      )}

                      <button
                        type="button"
                        title="Edit"
                        aria-label={`Edit ${c.name}`}
                        onClick={() => openEdit(c)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#1a1408] transition hover:-translate-y-0.5 hover:bg-[#c9a227] active:scale-95"
                      >
                        <span aria-hidden="true">✏️</span>
                      </button>

                      <button
                        type="button"
                        title="Delete"
                        aria-label={`Delete ${c.name}`}
                        onClick={() => handleDelete(c)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSave} className="space-y-5" noValidate>
          <label className="block">
            <span className={labelCls}>Category name (required)</span>
            <input
              required
              aria-required="true"
              aria-invalid={error && !form.name.trim() ? "true" : undefined}
              aria-describedby={error ? "category-error" : undefined}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className={labelCls}>Description (optional)</span>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputCls}
            />
          </label>

          <div>
            <span id="category-image-label" className={labelCls}>
              Category image (optional)
            </span>
            <div role="group" aria-labelledby="category-image-label">
              <ImageUploader
                images={form.image}
                onChange={(imgs) => setForm({ ...form, image: imgs })}
                folder="abi-foods-categories"
                multiple={false}
              />
            </div>
          </div>

          {/* Native radio buttons: arrow keys and screen reader support for free */}
          <fieldset>
            <legend className={labelCls}>Icon (used if there is no image)</legend>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((key) => {
                const Icon = CATEGORY_ICONS[key];
                return (
                  <label key={key} className="cursor-pointer">
                    <input
                      type="radio"
                      name="category-icon"
                      value={key}
                      checked={form.icon === key}
                      onChange={() => setForm({ ...form, icon: key })}
                      className="peer sr-only"
                    />
                    <span className="sr-only">{key} icon</span>
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#1a1408] text-[#1a1408] transition hover:-translate-y-0.5 hover:bg-[#FBF6E6] peer-checked:bg-[#c9a227] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#1a1408]"
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className="flex items-center gap-3 text-sm font-bold">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-5 w-5 accent-[#c9a227]"
            />
            Active (visible in store)
          </label>

          {error && (
            <p id="category-error" role="alert" className="rounded-xl border-2 border-[#1a1408] bg-[#FBF6E6] px-4 py-2 text-sm font-bold">
              {error}
            </p>
          )}

          <button type="submit" disabled={saving} className="btn-gold w-full disabled:opacity-60">
            {saving ? "Saving…" : editingId ? "Save Changes" : "Add Category"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
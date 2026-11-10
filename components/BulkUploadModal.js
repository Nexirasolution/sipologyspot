"use client";

import { useRef, useState } from "react";
import Modal from "@/components/Modal";

export default function BulkUploadModal({ open, onClose, onDone }) {
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function reset() {
    setFileName("");
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleUpload(e) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a .xlsx file first.");
      return;
    }
    setUploading(true);
    setError("");
    setResult(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/products/bulk", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setResult(data);
      if (data.summary?.created > 0) onDone?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Bulk Upload Products" wide>
      <div className="space-y-4">
        <p className="text-sm text-ink/70">
          Upload an Excel file to add many products at once. Images and videos aren&apos;t
          included here — add them per product afterwards from the Products page.
        </p>

        <a
          href="/product_bulk_upload_template.xlsx"
          download
          className="inline-block text-xs font-semibold text-forest hover:underline"
        >
          Download the template →
        </a>

        <form onSubmit={handleUpload} className="space-y-3">
          <label className="block cursor-pointer rounded-xl border-2 border-dashed border-gold/30 px-4 py-8 text-center text-sm text-muted hover:border-forest">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
            />
            {fileName ? (
              <span className="font-medium text-ink">{fileName}</span>
            ) : (
              <span>Click to choose a .xlsx file, or drag it here</span>
            )}
          </label>

          {error && <p className="text-sm text-terracotta">{error}</p>}

          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-full bg-forest px-8 py-3 text-sm font-semibold text-ivory shadow-soft hover:bg-forest-light disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {result && (
          <div className="rounded-xl border border-gold/15 bg-champagne/40 p-4">
            <p className="text-sm font-semibold text-ink">
              {result.summary.created} of {result.summary.totalRows} rows added
              {result.summary.errors > 0 && ` · ${result.summary.errors} skipped`}
            </p>
            <div className="mt-3 max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted">
                  <tr>
                    <th className="py-1 pr-2">Row</th>
                    <th className="py-1 pr-2">Product</th>
                    <th className="py-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r) => (
                    <tr key={r.row} className="border-t border-gold/10">
                      <td className="py-1 pr-2 text-ink/70">{r.row}</td>
                      <td className="py-1 pr-2 text-ink/70">{r.name || "—"}</td>
                      <td className={`py-1 ${r.status === "error" ? "text-terracotta" : "text-forest"}`}>
                        {r.status === "error" ? r.message : "Added"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
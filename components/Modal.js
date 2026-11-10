"use client";

export default function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4">
      <div
        className={`flex w-full flex-col bg-white shadow-soft
          h-[92vh] rounded-t-2xl
          sm:h-auto sm:max-h-[90vh] sm:rounded-xl2
          ${wide ? "sm:max-w-2xl" : "sm:max-w-md"}`}
      >
        {/* Sticky header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gold/10 px-5 py-4 sm:border-none sm:px-6 sm:pb-0 sm:pt-6">
          <h2 className="font-display text-lg font-bold text-forest pr-4 truncate">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-muted hover:bg-champagne hover:text-ink"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:pb-6 sm:pt-5">
          {children}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LeafIcon } from "@/components/Icons";

const STATUS_STEPS = ["pending", "confirmed", "packed", "shipped", "delivered"];
const STATUS_LABELS = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const rupees = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const inputCls =
  "flex-1 rounded-full border-2 border-fg/25 bg-page px-5 py-3 text-sm font-semibold text-fg transition placeholder:text-fg-muted focus:border-gold";

export default function TrackOrderPage() {
  const [phone, setPhone] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setSettings(data.settings || null);
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    }
    loadSettings();
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setOrders(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ phone });
      if (orderNumber) params.set("orderNumber", orderNumber);
      const res = await fetch(`/api/orders/track?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No orders found.");
      setOrders(data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <a href="#track-main" className="gc-skip">
        Skip to order tracking
      </a>

      <Navbar settings={settings} />

      <main id="track-main" tabIndex={-1} className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-20">
        <header className="text-center">
          <p className="gc-rise text-xs font-extrabold uppercase tracking-[0.35em] text-accent">Order Status</p>
          <h1
            className="gc-rise gc-underline mt-4 text-4xl font-extrabold leading-tight text-fg md:text-5xl"
            style={{ "--d": "120ms" }}
          >
            Track Your Order
          </h1>
          <p className="gc-rise mt-8 text-sm font-semibold text-fg-muted" style={{ "--d": "240ms" }}>
            Enter the phone number used while placing your order.
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          aria-busy={loading}
          className="gc-rise mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row"
          style={{ "--d": "320ms" }}
        >
          <div className="flex-1">
            <label htmlFor="track-phone" className="sr-only">
              Phone number
            </label>
            <input
              id="track-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              required
              placeholder="10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`${inputCls} w-full`}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="track-order-number" className="sr-only">
              Order number (optional)
            </label>
            <input
              id="track-order-number"
              type="text"
              placeholder="Order number (optional)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className={`${inputCls} w-full`}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-gold shrink-0 disabled:opacity-60">
            {loading ? "Searching…" : "Track"}
          </button>
        </form>

        {/* Announces results / errors to screen readers */}
        <p role="status" aria-live="polite" className="sr-only">
          {loading ? "Searching for your order." : orders ? `${orders.length} ${orders.length === 1 ? "order" : "orders"} found.` : ""}
        </p>

        {error && (
          <p
            role="alert"
            className="mx-auto mt-8 max-w-lg rounded-xl border-2 border-fg bg-surface px-4 py-3 text-center text-sm font-bold text-fg"
          >
            {error}
          </p>
        )}

        {orders && orders.length === 0 && (
          <p className="mt-10 text-center text-sm font-semibold text-fg-muted">No orders found.</p>
        )}

        {orders && orders.length > 0 && (
          <ul className="mt-12 space-y-6">
            {orders.map((order, n) => (
              <li
                key={order._id}
                className="gc-rise gc-summary rounded-3xl border border-gold/50 bg-page p-6 md:p-8"
                style={{ "--d": `${n * 90}ms` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="gc-display text-xl font-extrabold text-fg">
                      <span className="sr-only">Order </span>
                      {order.orderNumber}
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-fg-muted">
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-gold px-4 py-1.5 text-xs font-extrabold text-ink">
                    <span className="sr-only">Status: </span>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {order.status !== "cancelled" ? (
                  <ol aria-label="Order progress" className="mt-8 flex items-start justify-between">
                    {STATUS_STEPS.map((step, idx) => {
                      const currentIdx = STATUS_STEPS.indexOf(order.status);
                      const done = idx <= currentIdx;
                      return (
                        <li
                          key={step}
                          aria-current={idx === currentIdx ? "step" : undefined}
                          className="flex flex-1 flex-col items-center"
                        >
                          <div className="flex w-full items-center">
                            {idx !== 0 && (
                              <div
                                aria-hidden="true"
                                className={`h-0.5 flex-1 ${idx <= currentIdx ? "bg-gold" : "bg-gold/25"}`}
                              />
                            )}
                            <span
                              aria-hidden="true"
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-extrabold ${
                                done
                                  ? "border-gold bg-gold text-ink"
                                  : "border-gold/40 bg-surface text-fg-muted"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            {idx !== STATUS_STEPS.length - 1 && (
                              <div
                                aria-hidden="true"
                                className={`h-0.5 flex-1 ${idx < currentIdx ? "bg-gold" : "bg-gold/25"}`}
                              />
                            )}
                          </div>
                          <span className="mt-2 text-center text-[11px] font-bold text-fg">
                            {STATUS_LABELS[step]}
                            <span className="sr-only">{done ? " (done)" : " (not yet)"}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="mt-6 rounded-xl border-2 border-fg px-4 py-3 text-sm font-bold text-fg">
                    This order was cancelled.
                  </p>
                )}

                {(order.tracking?.courier || order.tracking?.trackingNumber) && (
                  <>
                    <div aria-hidden="true" className="leaf-divider my-6" />
                    <div className="rounded-2xl border border-gold/40 bg-surface p-5">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-fg-muted">
                        Shipment tracking
                      </h3>
                      <div className="mt-2 space-y-1 text-sm font-semibold text-fg">
                        {order.tracking.courier && (
                          <p>
                            <span className="font-extrabold">Courier:</span> {order.tracking.courier}
                          </p>
                        )}
                        {order.tracking.trackingNumber && (
                          <p>
                            <span className="font-extrabold">Tracking no:</span> {order.tracking.trackingNumber}
                          </p>
                        )}
                      </div>
                      {order.tracking.trackingUrl && (
                        <a
                          href={order.tracking.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-block rounded-full bg-gold px-5 py-2.5 text-xs font-extrabold text-ink transition duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                        >
                          Track shipment <span aria-hidden="true">&rarr;</span>
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                  </>
                )}

                <div aria-hidden="true" className="leaf-divider my-6" />

                <ul className="space-y-2">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between gap-3 text-sm font-semibold text-fg">
                      <span>
                        {item.name}
                        <span aria-hidden="true"> × </span>
                        <span className="sr-only">, quantity </span>
                        {item.quantity}
                      </span>
                      <span>{rupees(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 flex items-baseline justify-between">
                  <span className="gc-display text-lg font-extrabold text-fg">Total</span>
                  <span className="gc-display text-2xl font-extrabold text-fg">{rupees(order.total)}</span>
                </p>

                <p className="mt-4 text-xs font-semibold text-fg-muted">
                  Delivering to: {order.customer.address}, {order.customer.city} {order.customer.pincode}
                </p>
              </li>
            ))}
          </ul>
        )}

        {!orders && !error && (
          <div className="mt-16 flex flex-col items-center text-center text-fg-muted">
            <LeafIcon aria-hidden="true" className="h-10 w-10 text-gold/60" />
            <p className="mt-3 text-sm font-semibold">Your order history will appear here.</p>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
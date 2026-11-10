"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAnnounce } from "@/components/A11yProvider";
import { INDIAN_STATES } from "@/lib/indianStates";

/* ------------------------------------------------------------------ */
/* Validation helpers                                                  */
/* ------------------------------------------------------------------ */

const FIELD_ORDER = ["name", "phone", "email", "address", "city", "state", "pincode"];

const FIELD_LABELS = {
  name: "Full name",
  phone: "Phone number",
  email: "Email",
  address: "Delivery address",
  city: "City",
  state: "State",
  pincode: "Pincode",
};

// Collapse repeated whitespace and trim
const clean = (v) => (v ?? "").replace(/\s+/g, " ").trim();

// Phone: digits only, no country code or leading 0 — exactly 10 digits
function normalizePhone(raw) {
  return (raw ?? "").replace(/\D/g, "").slice(0, 10);
}

const NAME_RE = /^[\p{L}][\p{L}\s.'’-]*$/u;
const CITY_RE = /^[\p{L}][\p{L}\s.'’()-]*$/u;
const ADDRESS_RE = /^[\p{L}\p{N}\s,.\-/#()&'’:]+$/u;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const PINCODE_RE = /^[1-9][0-9]{5}$/;

const letterCount = (s) => (s.match(/\p{L}/gu) || []).length;

const validators = {
  name(v) {
    const s = clean(v);
    if (!s) return "Enter your full name.";
    if (s.length < 3) return "Name must be at least 3 characters.";
    if (s.length > 60) return "Name must be 60 characters or fewer.";
    if (!NAME_RE.test(s)) return "Name can only contain letters, spaces, and . ' -";
    if (letterCount(s) < 3) return "Enter your full name.";
    if (/(.)\1{3,}/u.test(s)) return "Enter a valid name.";
    return "";
  },

  phone(v) {
    const digits = normalizePhone(v);
    if (!digits) return "Enter your phone number.";
    if (digits.length !== 10) return "Phone number must be exactly 10 digits.";
    if (!/^[6-9]/.test(digits)) return "Indian mobile numbers start with 6, 7, 8, or 9.";
    if (new Set(digits).size < 3) return "Enter a valid phone number.";
    if (/^(0123456789|1234567890|9876543210|6789012345)$/.test(digits)) {
      return "Enter a valid phone number.";
    }
    return "";
  },

  email(v) {
    const s = (v ?? "").trim();
    if (!s) return ""; // optional
    if (s.length > 254) return "Email is too long.";
    if (/\.\./.test(s) || !EMAIL_RE.test(s)) return "Enter a valid email address.";
    return "";
  },

  address(v) {
    const s = clean(v);
    if (!s) return "Enter your delivery address.";
    if (s.length < 15) return "Address is too short. Include house/flat no., street, and area.";
    if (s.length > 200) return "Address must be 200 characters or fewer.";
    if (!ADDRESS_RE.test(s)) {
      return "Address contains invalid characters. Use letters, numbers, and , . - / # ( ) & only.";
    }
    if (letterCount(s) < 8) return "Enter a complete address with street and area names.";
    if (s.split(" ").length < 3) return "Enter a complete address (at least 3 words).";
    if (/^\d+$/.test(s.replace(/[\s,.\-/#]/g, ""))) return "Address can't be only numbers.";
    if (/(.)\1{4,}/u.test(s)) return "Enter a valid address.";
    return "";
  },

  city(v) {
    const s = clean(v);
    if (!s) return "Enter your city.";
    if (s.length < 2) return "Enter a valid city.";
    if (s.length > 50) return "City must be 50 characters or fewer.";
    if (!CITY_RE.test(s)) return "City can only contain letters, spaces, and . ' - ( )";
    if (/(.)\1{3,}/u.test(s)) return "Enter a valid city.";
    return "";
  },

  state(v) {
    if (!v) return "Select your state.";
    if (!INDIAN_STATES.includes(v)) return "Select a valid state from the list.";
    return "";
  },

  pincode(v) {
    const s = (v ?? "").trim();
    if (!s) return "Enter your pincode.";
    if (!/^\d+$/.test(s)) return "Pincode can only contain digits.";
    if (s.length !== 6) return "Pincode must be exactly 6 digits.";
    if (!PINCODE_RE.test(s)) return "Enter a valid pincode (cannot start with 0).";
    if (/^(\d)\1{5}$/.test(s)) return "Enter a valid pincode.";
    return "";
  },
};

function validateAll(form) {
  const errs = {};
  for (const f of FIELD_ORDER) {
    const msg = validators[f](form[f]);
    if (msg) errs[f] = msg;
  }
  return errs;
}

const rupees = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function CheckoutPage() {
  const { items, subtotal, clearCart, hydrated } = useCart();
  const announce = useAnnounce();
  const successHeadingRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Tamil Nadu",
    pincode: "",
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);
  const [settings, setSettings] = useState({
    shippingFee: 49,
    freeShipping: 999,
    stateShippingRates: [],
    storeName: "Sipology Spot",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  /* After payment: announce and move focus to the confirmation heading */
  useEffect(() => {
    if (!placedOrder) return;
    announce(`Order placed. Your order number is ${placedOrder.orderNumber}.`, "assertive");
    successHeadingRef.current?.focus();
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placedOrder]);

  const stateFee = useMemo(() => {
    const match = (settings.stateShippingRates || []).find(
      (r) => r.state?.trim().toLowerCase() === form.state?.trim().toLowerCase()
    );
    return match ? Number(match.fee) : Number(settings.shippingFee);
  }, [settings, form.state]);

  const shippingFee = subtotal >= Number(settings.freeShipping) ? 0 : stateFee;
  const total = subtotal + shippingFee;

  // Errors are always computed live; they're only *shown* once a field
  // has been touched (blurred) or the user has tried to submit.
  const errors = useMemo(() => validateAll(form), [form]);
  const showError = (field) => (touched[field] || submitted ? errors[field] || "" : "");
  const errorFields = FIELD_ORDER.filter((f) => errors[f]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function blur(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function focusField(field) {
    const el = document.getElementById(`field-${field}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus({ preventScroll: true });
    }
  }

  function fail(msg) {
    setError(msg);
    announce(msg, "assertive");
  }

  function validate() {
    if (items.length === 0) {
      fail("Your cart is empty.");
      return false;
    }
    if (items.some((i) => !Number.isInteger(i.quantity) || i.quantity < 1)) {
      fail("One or more items in your cart have an invalid quantity.");
      return false;
    }

    setSubmitted(true);
    if (errorFields.length) {
      const names = errorFields.map((f) => FIELD_LABELS[f]).join(", ");
      fail(
        `Please fix ${errorFields.length} ${errorFields.length === 1 ? "field" : "fields"}: ${names}.`
      );
      focusField(errorFields[0]);
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (!validate()) return;

    if (!window.Razorpay) {
      fail("Payment gateway not loaded yet. Please try again.");
      return;
    }

    // Send normalized, trimmed values to the server
    const customer = {
      name: clean(form.name),
      phone: normalizePhone(form.phone),
      email: form.email.trim().toLowerCase(),
      address: clean(form.address),
      city: clean(form.city),
      state: form.state,
      pincode: form.pincode.trim(),
    };

    setLoading(true);
    announce("Preparing secure payment…");
    try {
      // Creates the Razorpay order AND a "pending" order in our DB —
      // so it already exists (and is visible to admin) before payment
      // even starts. `items` here already includes each line's `variant`
      // (or null), which the server re-validates and re-prices.
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, items, shippingFee }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to start payment.");

      const rzpOrder = orderData.order;

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: settings.storeName || "Abi Foods and Oils",
        description: "Order Payment",
        order_id: rzpOrder.id,
        prefill: {
          name: customer.name,
          contact: customer.phone,
          email: customer.email,
        },
        theme: { color: "#C9A227" },
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed.");

            setPlacedOrder(verifyData.order);
            clearCart();
          } catch (err) {
            // Payment likely still succeeded server-side (verify failed for
            // some other reason, e.g. a dropped network call) — the webhook
            // will still confirm the order. Don't scare the user off; point
            // them at order tracking instead of a hard "failed" message.
            fail(
              `${err.message} If money was deducted, check "Track Order" with your phone number — it may still confirm shortly.`
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            announce("Payment window closed.");
          },
        },
      });

      rzp.on("payment.failed", function () {
        fail("Payment failed. Please try again.");
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      fail(err.message);
      setLoading(false);
    }
  }

  if (!hydrated) return null;

  /* ---------------- Order confirmation ---------------- */
  if (placedOrder) {
    return (
      <>
        <Navbar settings={settings} />
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-xl px-5 py-20 text-center md:px-8">
          <span
            aria-hidden="true"
            className="gc-float mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#1A1408] bg-[#C9A227] text-3xl font-extrabold text-[#1A1408]"
          >
            ✓
          </span>
          <h1
            ref={successHeadingRef}
            tabIndex={-1}
            className="gc-rise gc-underline mt-8 text-4xl font-extrabold text-[#1A1408] md:text-5xl"
            style={{ "--d": "120ms" }}
          >
            Order Placed!
          </h1>
          <p className="gc-rise mt-8 font-semibold text-[#6B5A1E]" style={{ "--d": "220ms" }}>
            Thank you for choosing {settings.storeName || "Abi Foods and Oils"}. Your order number is:
          </p>
          <p className="gc-rise gc-display mt-3 text-3xl font-extrabold text-[#1A1408]" style={{ "--d": "300ms" }}>
            {placedOrder.orderNumber}
          </p>
          <p className="gc-rise mt-4 text-sm font-semibold text-[#6B5A1E]" style={{ "--d": "380ms" }}>
            Save this number, or use your phone number, to track your order anytime.
          </p>
          <div className="gc-rise mt-10 flex flex-wrap justify-center gap-4" style={{ "--d": "460ms" }}>
            <Link href="/track-order" className="gc-btn-outline">
              Track Order
            </Link>
            <Link href="/products" className="btn-gold">
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ---------------- Checkout form ---------------- */
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar settings={settings} />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-5 py-12 md:px-10 md:py-20">
        <h1 className="gc-rise gc-underline text-5xl font-extrabold leading-none text-[#1A1408] md:text-6xl">Checkout</h1>

        {items.length === 0 ? (
          <p className="gc-rise mt-14 font-semibold text-[#6B5A1E]" style={{ "--d": "150ms" }}>
            Your cart is empty.{" "}
            <Link href="/products" className="gc-link font-extrabold">
              Shop now
            </Link>
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-busy={loading}
            className="mt-14 grid gap-12 lg:grid-cols-[1fr_360px]"
          >
            <div className="space-y-8">
              {/* Summary of problems, with links to each field */}
              {submitted && errorFields.length > 0 && (
                <div className="gc-rise rounded-2xl border-2 border-[#1A1408] bg-[#FBF6E6] p-5">
                  <h2 className="text-base font-extrabold">Please fix the following</h2>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold">
                    {errorFields.map((f) => (
                      <li key={f}>
                        <button type="button" onClick={() => focusField(f)} className="gc-link text-left font-bold">
                          {FIELD_LABELS[f]}: {errors[f]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <fieldset className="gc-rise space-y-4" style={{ "--d": "100ms" }}>
                <legend className="mb-2 text-xl font-extrabold">Contact details</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="name"
                    label="Full name"
                    required
                    value={form.name}
                    onChange={(v) => update("name", v)}
                    onBlur={() => blur("name")}
                    error={showError("name")}
                    maxLength={60}
                    autoComplete="name"
                  />
                  <Field
                    id="phone"
                    label="Phone number"
                    required
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(v) => update("phone", normalizePhone(v))}
                    onBlur={() => blur("phone")}
                    error={showError("phone")}
                    maxLength={10}
                    autoComplete="tel-national"
                    placeholder="10-digit mobile number"
                  />
                </div>
                <Field
                  id="email"
                  label="Email (optional)"
                  type="email"
                  value={form.email}
                  onChange={(v) => update("email", v.replace(/\s/g, ""))}
                  onBlur={() => blur("email")}
                  error={showError("email")}
                  maxLength={254}
                  autoComplete="email"
                />
              </fieldset>

              <fieldset className="gc-rise space-y-4" style={{ "--d": "200ms" }}>
                <legend className="mb-2 text-xl font-extrabold">Delivery address</legend>
                <Field
                  id="address"
                  label="Address"
                  required
                  textarea
                  value={form.address}
                  onChange={(v) => update("address", v)}
                  onBlur={() => blur("address")}
                  error={showError("address")}
                  maxLength={200}
                  autoComplete="street-address"
                  placeholder="House/flat no., street, area, landmark"
                  hint={`${clean(form.address).length} of 200 characters`}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field
                    id="city"
                    label="City"
                    required
                    value={form.city}
                    onChange={(v) => update("city", v)}
                    onBlur={() => blur("city")}
                    error={showError("city")}
                    maxLength={50}
                    autoComplete="address-level2"
                  />

                  <div>
                    <label htmlFor="field-state" className={labelCls}>
                      State <RequiredMark />
                    </label>
                    <select
                      id="field-state"
                      required
                      aria-required="true"
                      value={form.state}
                      onChange={(e) => update("state", e.target.value)}
                      onBlur={() => blur("state")}
                      aria-invalid={showError("state") ? "true" : undefined}
                      aria-describedby={showError("state") ? "err-state" : undefined}
                      autoComplete="address-level1"
                      className={inputCls(!!showError("state"))}
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {showError("state") && <ErrorText id="err-state">{showError("state")}</ErrorText>}
                  </div>

                  <Field
                    id="pincode"
                    label="Pincode"
                    required
                    inputMode="numeric"
                    value={form.pincode}
                    onChange={(v) => update("pincode", v.replace(/\D/g, "").slice(0, 6))}
                    onBlur={() => blur("pincode")}
                    error={showError("pincode")}
                    maxLength={6}
                    autoComplete="postal-code"
                  />
                </div>
              </fieldset>

              <p className="text-xs font-semibold text-[#6B5A1E]">
                You&apos;ll be redirected to Razorpay&apos;s secure checkout to complete payment.
              </p>

              {error && (
                <p role="alert" className="rounded-xl border-2 border-[#1A1408] bg-[#FBF6E6] px-4 py-3 text-sm font-bold">
                  {error}
                </p>
              )}
            </div>

            {/* Order summary */}
            <aside
              aria-labelledby="summary-title"
              className="gc-rise gc-summary card-hover h-fit self-start rounded-3xl border border-[#C9A227]/50 bg-white p-7 lg:sticky lg:top-8"
              style={{ "--d": "300ms" }}
            >
              <h2 id="summary-title" className="text-2xl font-extrabold">
                Order summary
              </h2>

              <ul className="mt-5 space-y-3">
                {items.map((item) => (
                  <li key={item.lineId} className="flex justify-between gap-3 text-sm font-semibold text-[#3A3114]">
                    <span>
                      {item.name}
                      {item.variant?.label && ` (${item.variant.label})`}
                      <span aria-hidden="true"> × </span>
                      <span className="sr-only">, quantity </span>
                      {item.quantity}
                    </span>
                    <span>{rupees(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div aria-hidden="true" className="leaf-divider my-5" />

              <dl className="space-y-2 text-sm font-semibold text-[#3A3114]">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>{rupees(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping ({form.state})</dt>
                  <dd>{shippingFee === 0 ? "Free" : rupees(shippingFee)}</dd>
                </div>
              </dl>

              <dl className="mt-4 flex items-baseline justify-between">
                <dt className="gc-display text-lg font-extrabold">Total</dt>
                <dd key={total} className="gc-pop gc-display text-3xl font-extrabold">
                  {rupees(total)}
                </dd>
              </dl>

              <button type="submit" disabled={loading} aria-busy={loading} className="btn-gold mt-7 w-full disabled:opacity-60">
                {loading ? "Processing…" : "Pay & Place Order"}
              </button>
            </aside>
          </form>
        )}
      </main>

      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Form pieces                                                         */
/* ------------------------------------------------------------------ */

const labelCls = "mb-1 block text-xs font-extrabold uppercase tracking-wider text-[#6B5A1E]";
const inputCls = (hasError) =>
  `w-full rounded-xl border-2 bg-white px-4 py-3 text-sm font-semibold transition focus:border-[#C9A227] ${
    hasError ? "border-[#1A1408]" : "border-[#1A1408]/25"
  }`;

function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-[#8A6A00]">
        *
      </span>
      <span className="sr-only">(required)</span>
    </>
  );
}

function ErrorText({ id, children }) {
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-bold text-[#1A1408]">
      <span aria-hidden="true">⚠ </span>
      {children}
    </p>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  type = "text",
  textarea,
  maxLength,
  inputMode,
  autoComplete,
  placeholder,
}) {
  const describedBy = [error && `err-${id}`, hint && `hint-${id}`].filter(Boolean).join(" ") || undefined;

  const common = {
    id: `field-${id}`,
    value,
    onChange: (e) => onChange(e.target.value),
    onBlur,
    maxLength,
    autoComplete,
    placeholder,
    "aria-required": required ? "true" : undefined,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": describedBy,
    className: inputCls(!!error),
  };

  return (
    <div>
      {/* Label is separate from the error text so the error isn't read as part of the label */}
      <label htmlFor={`field-${id}`} className={labelCls}>
        {label} {required && <RequiredMark />}
      </label>
      {textarea ? <textarea {...common} rows={3} /> : <input {...common} type={type} inputMode={inputMode} />}
      {hint && (
        <p id={`hint-${id}`} className="mt-1 text-right text-xs font-semibold text-[#6B5A1E]">
          {hint}
        </p>
      )}
      {error && <ErrorText id={`err-${id}`}>{error}</ErrorText>}
    </div>
  );
}
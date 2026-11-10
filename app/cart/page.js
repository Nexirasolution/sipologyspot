"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { LeafIcon, BagIcon } from "@/components/Icons";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const rupees = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, hydrated } = useCart();
  const [settings, setSettings] = useState(null);
  const [announcement, setAnnouncement] = useState(""); // read by screen readers
  const [removing, setRemoving] = useState(null); // lineId playing exit animation
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  /* Announce through a polite live region. Toggle a zero-width char so
     identical consecutive messages are still re-read. */
  const announce = useCallback((msg) => {
    setAnnouncement((prev) => (prev === msg ? msg + "\u200B" : msg));
  }, []);

  /* Announce page state once on load */
  useEffect(() => {
    if (!hydrated) return;
    announce(
      items.length === 0
        ? "Your cart is empty."
        : `Your cart has ${items.length} ${items.length === 1 ? "item" : "items"}. Subtotal ${rupees(subtotal)}.`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const changeQty = (item, next) => {
    if (next < 1) return handleRemove(item);
    updateQuantity(item.lineId, next);
    announce(`${item.name} quantity ${next}. Line total ${rupees(item.price * next)}.`);
  };

  const handleRemove = (item) => {
    setRemoving(item.lineId);
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350;
    setTimeout(() => {
      removeItem(item.lineId);
      setRemoving(null);
      announce(`${item.name} removed from cart.`);
      headingRef.current?.focus(); // keep keyboard / screen-reader position sensible
    }, delay);
  };

  const readCartAloud = () => {
    if (!canSpeak) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const text =
      items.length === 0
        ? "Your cart is empty."
        : `Your cart. ${items
            .map(
              (i) =>
                `${i.quantity} ${i.variant?.label ? i.variant.label + " " : ""}${i.name}, ${rupees(i.price)} per ${i.unit}, total ${rupees(
                  i.price * i.quantity
                )}.`
            )
            .join(" ")} Subtotal ${rupees(subtotal)}. Shipping is calculated at checkout.`;
    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  };

  if (!hydrated) return null;

  return (
    <div>
      <a href="#cart-main" className="gc-skip">
        Skip to cart
      </a>

      <Navbar settings={settings} />

      {/* Polite live region: announces quantity, removal and total changes */}
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>

      <main id="cart-main" tabIndex={-1} className="mx-auto max-w-6xl px-5 py-14 md:px-10 md:py-20">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="gc-display gc-rise gc-underline text-5xl font-extrabold leading-none tracking-tight text-[#14110A] md:text-7xl"
            >
              Your Cart
            </h1>
            <p className="gc-rise mt-5 text-sm font-semibold text-[#6B5A1E]" style={{ "--d": "150ms" }}>
              {items.length === 0
                ? "Nothing here yet"
                : `${items.length} ${items.length === 1 ? "item" : "items"} ready for checkout`}
            </p>
          </div>

          {canSpeak && (
            <button
              type="button"
              onClick={readCartAloud}
              aria-pressed={speaking}
              className="gc-btn-outline gc-rise"
              style={{ "--d": "250ms" }}
            >
              <span aria-hidden="true" className={speaking ? "gc-wave" : ""}>
                ◉
              </span>
              {speaking ? "Stop reading" : "Read cart aloud"}
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <section aria-labelledby="empty-title" className="mt-20 flex flex-col items-center py-10 text-center">
            <span
              aria-hidden="true"
              className="gc-float gc-rise flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#C9A227] text-[#8A6A00]"
            >
              <BagIcon className="h-10 w-10" />
            </span>
            <h2
              id="empty-title"
              className="gc-display gc-rise mt-8 text-3xl font-extrabold text-[#14110A]"
              style={{ "--d": "120ms" }}
            >
              Your cart is empty
            </h2>
            <p className="gc-rise mt-3 max-w-sm font-semibold text-[#6B5A1E]" style={{ "--d": "220ms" }}>
              Add something from the shop and it will show up here.
            </p>
            <Link href="/products" className="btn-gold gc-rise mt-10" style={{ "--d": "320ms" }}>
              Browse products
            </Link>
          </section>
        ) : (
          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_380px]">
            <section aria-labelledby="items-title">
              <h2 id="items-title" className="sr-only">
                Items in your cart
              </h2>
              <ul className="divide-y divide-[#C9A227]/30 border-y border-[#C9A227]/30">
                {items.map((item, idx) => {
                  const lineTotal = item.price * item.quantity;
                  return (
                    <li
                      key={item.lineId}
                      className={`gc-rise gc-row flex flex-wrap items-center gap-5 py-6 ${
                        removing === item.lineId ? "gc-out" : ""
                      }`}
                      style={{ "--d": `${200 + idx * 90}ms` }}
                    >
                      <div className="gc-thumb h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#FBF6E6]">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt="" /* decorative: name is announced in the text beside it */
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div aria-hidden="true" className="flex h-full items-center justify-center text-[#C9A227]">
                            <LeafIcon className="h-7 w-7" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-[160px] flex-1">
                        <h3 className="gc-display text-lg font-bold leading-snug text-[#14110A]">
                          {item.name}
                          {item.variant?.label && (
                            <span className="ml-2 inline-block rounded-full bg-[#C9A227] px-2.5 py-0.5 align-middle text-[11px] font-extrabold text-[#14110A]">
                              <span className="sr-only">Variant: </span>
                              {item.variant.label}
                            </span>
                          )}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-[#6B5A1E]">
                          {rupees(item.price)} <span aria-hidden="true">/</span>
                          <span className="sr-only"> per </span> {item.unit}
                        </p>

                        <div
                          role="group"
                          aria-label={`Quantity for ${item.name}`}
                          className="mt-3 flex w-fit items-center overflow-hidden rounded-full border-2 border-[#1A1408]"
                        >
                          <button
                            type="button"
                            onClick={() => changeQty(item, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="gc-qty"
                          >
                            <span aria-hidden="true">−</span>
                          </button>
                          {/* key re-mounts the node so the pop animation replays on change */}
                          <span
                            key={item.quantity}
                            className="gc-pop w-10 text-center text-base font-extrabold"
                            aria-label={`Quantity ${item.quantity}`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQty(item, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="gc-qty"
                          >
                            <span aria-hidden="true">+</span>
                          </button>
                        </div>
                      </div>

                      <div className="ml-auto text-right">
                        <p key={lineTotal} className="gc-pop gc-display text-2xl font-extrabold text-[#14110A]">
                          <span className="sr-only">Line total </span>
                          {rupees(lineTotal)}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="gc-link mt-3 text-sm font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <aside
              aria-labelledby="summary-title"
              className="gc-rise gc-summary card-hover h-fit self-start rounded-3xl border border-[#C9A227]/50 bg-white p-8 lg:sticky lg:top-8"
              style={{ "--d": "350ms" }}
            >
              <h2 id="summary-title" className="gc-display text-2xl font-extrabold text-[#14110A]">
                Order summary
              </h2>

              <dl className="mt-6 space-y-3 text-sm font-semibold text-[#3A3114]">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>{rupees(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd>Calculated at checkout</dd>
                </div>
              </dl>

              <div aria-hidden="true" className="leaf-divider my-6" />

              <dl className="flex items-baseline justify-between">
                <dt className="gc-display text-lg font-extrabold text-[#14110A]">Total</dt>
                <dd key={subtotal} className="gc-pop gc-display text-3xl font-extrabold text-[#14110A]">
                  {rupees(subtotal)}
                </dd>
              </dl>

              <Link href="/checkout" className="btn-gold mt-8 w-full">
                Proceed to checkout
              </Link>
              <Link href="/products" className="gc-link mt-5 block text-center text-sm font-bold">
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { BagIcon } from "./Icons";
import { Pause, Play, Search, X } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
];

const DEFAULT_STORE_NAME = "Sipology Spot Premium Organic Store";

// "Sipology Spot Premium Organic Store" -> ["Sipology Spot", "Premium Organic Store"]
function splitStoreName(name) {
  const premiumIdx = name.indexOf(" Premium");
  if (premiumIdx > 0) return [name.slice(0, premiumIdx), name.slice(premiumIdx + 1)];
  if (name.includes(" ")) {
    const parts = name.split(" ");
    return [parts[0], parts.slice(1).join(" ")];
  }
  return [name, ""];
}

// Visible keyboard focus everywhere (WCAG 2.4.7)
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-white";

// 44px touch target (WCAG 2.5.5)
const ICON_BTN = `flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 text-ink transition duration-300 hover:-translate-y-0.5 hover:bg-gold hover:shadow-lg active:scale-95 ${FOCUS}`;

/* ------------------------------------------------------------------ */
/* Announcement bar: scrolling for sighted users, a plain list for     */
/* screen readers, and a pause button (WCAG 2.2.2).                    */
/* ------------------------------------------------------------------ */
function AnnouncementBar({ settings }) {
  const [paused, setPaused] = useState(false);
  const freeShipping = settings?.freeShipping ?? 999;

  const messages = [
    `Free shipping on orders above ₹${freeShipping}`,
    "100% premium organic products",
    "Pan India delivery",
  ];
  // 4 copies, animate by -50% => seamless loop even on wide screens
  const track = [...messages, ...messages, ...messages, ...messages];

  return (
    <section
      aria-label="Store announcements"
      className="group flex items-center bg-gold text-ink"
    >
      {/* Screen readers get a static list, not a moving ticker */}
      <ul className="sr-only">
        {messages.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>

      <div aria-hidden="true" className="relative flex-1 overflow-hidden py-2.5">
        <div
          data-paused={paused}
          className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap px-4 text-xs font-extrabold tracking-wide group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] data-[paused=true]:[animation-play-state:paused] motion-reduce:animate-none md:text-sm"
        >
          {track.map((msg, i) => (
            <span key={i} className="flex items-center gap-10">
              {msg}
              <span className="h-1.5 w-1.5 rotate-45 bg-ink" />
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Play scrolling announcements" : "Pause scrolling announcements"}
        className={`mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-300 hover:bg-ink hover:text-gold active:scale-90 ${FOCUS} focus-visible:ring-offset-gold`}
      >
        {paused ? (
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */
export default function Navbar({ settings }) {
  const { count } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const uid = useId();

  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [announce, setAnnounce] = useState("");

  const searchBtnRef = useRef(null);
  const menuBtnRef = useRef(null);
  const firstRender = useRef(true);

  const storeName = settings?.storeName || DEFAULT_STORE_NAME;
  const [brand, tagline] = splitStoreName(storeName);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  /* Shrink header on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close mobile menu after navigation */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* Escape closes search / menu and returns focus to the button that opened it */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (searchOpen) {
        setSearchOpen(false);
        setQuery("");
        searchBtnRef.current?.focus();
      } else if (open) {
        setOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, open]);

  /* Tell screen readers when the cart changes (skip the first render) */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setAnnounce(
      `Cart updated. ${count} ${count === 1 ? "item" : "items"} in your cart.`
    );
  }, [count]);

  const toggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      setQuery("");
    } else {
      setSearchOpen(true);
      setOpen(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/products?search=${encodeURIComponent(q)}`);
    setAnnounce(`Searching for ${q}`);
    setSearchOpen(false);
    setOpen(false);
    setQuery("");
  };

  const cartLabel =
    count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart, empty";

  const searchForm = (suffix, className) => (
    <form
      id={`${uid}-${suffix}`}
      role="search"
      onSubmit={handleSearchSubmit}
      className={className}
    >
      <label htmlFor={`${uid}-${suffix}-q`} className="sr-only">
        Search products
      </label>
      <input
        id={`${uid}-${suffix}-q`}
        autoFocus
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products"
        autoComplete="off"
        className="w-full min-w-0 bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted md:w-52"
      />
      <button
        type="submit"
        aria-label="Submit search"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition duration-300 hover:bg-ink hover:text-gold active:scale-90 ${FOCUS}`}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );

  return (
    <>
      {/* Skip link: first focusable element on every page (add id="main-content" to <main>) */}
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-full bg-gold px-5 py-3 font-display text-sm font-bold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-ink"
      >
        Skip to main content
      </a>

      {/* Polite live region for cart and search updates */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announce}
      </div>

      <AnnouncementBar settings={settings} />

      <header
        className={`sticky top-0 z-40 animate-nav-drop bg-white/90 backdrop-blur-md transition-shadow duration-500 ${
          scrolled ? "shadow-[0_12px_32px_-16px_rgba(138,100,16,0.45)]" : ""
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 transition-all duration-500 md:px-8 ${
            scrolled ? "py-2" : "py-3.5"
          }`}
        >
          {/* Brand */}
          <Link href="/" className={`group flex items-center gap-3 rounded-xl ${FOCUS}`}>
            <Image
              src="/images/logo.png"
              alt=""
              width={96}
              height={96}
              priority
              className={`object-contain transition-all duration-500 group-hover:rotate-[8deg] group-hover:scale-105 ${
                scrolled ? "h-11 w-11 md:h-12 md:w-12" : "h-14 w-14 md:h-[72px] md:w-[72px]"
              }`}
            />
            <span className="block leading-tight">
              <span className="block font-display text-xl font-extrabold tracking-tight text-ink md:text-2xl">
                {brand}
              </span>
              {tagline && (
                <span className="block text-xs font-bold text-gold-deep">
                  {tagline}
                </span>
              )}
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-9">
              {LINKS.map((l, i) => {
                const active = isActive(l.href);
                return (
                  <li
                    key={l.href}
                    className="animate-rise"
                    style={{ animationDelay: `${250 + i * 90}ms` }}
                  >
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={`group relative inline-block rounded px-1 py-2 font-display text-[15px] font-bold transition-colors duration-300 hover:text-gold-deep ${
                        active ? "text-gold-deep" : "text-ink"
                      } ${FOCUS}`}
                    >
                      {l.label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-1 -bottom-0.5 h-[3px] origin-left rounded-full bg-gold transition-transform duration-500 ease-out group-hover:scale-x-100 ${
                          active ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5 md:gap-3">
            {/* Desktop inline search */}
            {searchOpen &&
              searchForm(
                "d",
                "hidden origin-right animate-expand items-center gap-1 rounded-full border border-gold bg-white py-1 pl-4 pr-1 shadow-sm md:flex"
              )}

            <button
              ref={searchBtnRef}
              type="button"
              onClick={toggleSearch}
              aria-expanded={searchOpen}
              aria-controls={`${uid}-d ${uid}-m`}
              aria-label={searchOpen ? "Close search" : "Open search"}
              className={ICON_BTN}
            >
              <span key={searchOpen ? "x" : "s"} className="animate-pop" aria-hidden="true">
                {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </span>
            </button>

            <Link
              href="/cart"
              aria-label={cartLabel}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink transition duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-gold hover:shadow-lg active:scale-95 ${FOCUS}`}
            >
              <span aria-hidden="true">
                <BagIcon className="h-5 w-5" />
              </span>
              {count > 0 && (
                <span
                  key={count}
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-ink px-1 text-[11px] font-extrabold text-white"
                >
                  {count}
                </span>
              )}
            </Link>

            <button
              ref={menuBtnRef}
              type="button"
              className={`${ICON_BTN} md:hidden`}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={`${uid}-menu`}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <span aria-hidden="true" className="flex h-4 w-5 flex-col justify-between">
                <span
                  className={`block h-0.5 w-5 rounded bg-ink transition-all duration-300 ${
                    open ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 rounded bg-ink transition-all duration-300 ${
                    open ? "scale-x-0 opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 rounded bg-ink transition-all duration-300 ${
                    open ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile search row */}
        {searchOpen &&
          searchForm(
            "m",
            "mx-5 mb-3 flex animate-slide-down items-center gap-2 rounded-full border border-gold bg-white py-1 pl-5 pr-1 shadow-sm md:hidden"
          )}

        {/* Mobile menu */}
        {open && (
          <nav
            id={`${uid}-menu`}
            aria-label="Mobile"
            className="animate-slide-down border-t border-gold/30 bg-white px-5 py-4 md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {LINKS.map((l, i) => {
                const active = isActive(l.href);
                return (
                  <li
                    key={l.href}
                    className="animate-rise"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-lg font-bold transition duration-300 hover:bg-gold-soft active:scale-[0.98] ${
                        active ? "bg-gold-soft text-gold-deep" : "text-ink"
                      } ${FOCUS}`}
                    >
                      {l.label}
                      {active && (
                        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* Animated gold hairline */}
        <div
          aria-hidden="true"
          className="h-[2px] w-full animate-shimmer bg-[linear-gradient(90deg,#F6EBC8,#C9A227,#F3DE8A,#C9A227,#F6EBC8)] bg-[length:200%_100%]"
        />
      </header>
    </>
  );
}
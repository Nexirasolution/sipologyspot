"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BagIcon, LeafIcon } from "./Icons";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const titleId = useId();
  const videoRef = useRef(null);
  const timer = useRef(null);
  const [added, setAdded] = useState(false);

  const media = product.media?.[0] || product.images?.[0];
  const image = media?.url;
  const mediaType = media?.type || media?.mediaType || "image";

  const hasVariants = product.hasVariants && product.variants?.length > 0;

  // With variants, "in stock" means at least one variant has stock.
  const outOfStock = hasVariants
    ? product.variants.every((v) => v.stock <= 0)
    : product.stock <= 0;

  // Price range across variants, or the simple product's own price.
  const variantPrices = hasVariants ? product.variants.map((v) => v.price) : [];
  const minVariantPrice = hasVariants ? Math.min(...variantPrices) : null;
  const maxVariantPrice = hasVariants ? Math.max(...variantPrices) : null;
  const singlePriceVariants = hasVariants && minVariantPrice === maxVariantPrice;

  // The card always leads with the CHEAPEST variant's price ("From ₹X"),
  // so the discount badge has to be based on that same variant — otherwise
  // you can end up advertising a % OFF that belongs to a different size.
  const cheapestVariant = hasVariants
    ? product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0])
    : null;

  const hasDiscount = hasVariants
    ? cheapestVariant.compareAtPrice > cheapestVariant.price
    : product.compareAtPrice > product.price;

  const discountBasePrice = hasVariants ? cheapestVariant.price : product.price;
  const discountCompareAtPrice = hasVariants ? cheapestVariant.compareAtPrice : product.compareAtPrice;

  const discountPercent = hasDiscount
    ? Math.round(((discountCompareAtPrice - discountBasePrice) / discountCompareAtPrice) * 100)
    : 0;

  const priceText = hasVariants
    ? singlePriceVariants
      ? `₹${minVariantPrice}`
      : `From ₹${minVariantPrice}`
    : `₹${product.price}`;

  // Only show a strikethrough when there's one clear price to contrast it with —
  // a range + a single compare price reads as wrong, so ranges rely on the badge.
  const showCompare = hasVariants ? hasDiscount && singlePriceVariants : hasDiscount;

  // Videos shouldn't autoplay for people who prefer reduced motion (WCAG 2.2.2)
  useEffect(() => {
    if (mediaType !== "video" || !videoRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current.pause();
    }
  }, [mediaType]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleQuickAdd() {
    // Variant products need the customer to pick a size first, so quick-add
    // just sends them to the product page instead of guessing a default.
    if (hasVariants || outOfStock) return;
    addItem(product, 1);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article
      aria-labelledby={titleId}
      className="card-hover group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gold/20 bg-white focus-within:shadow-[0_18px_40px_-18px_rgba(138,100,16,0.45)]"
    >
      {/* Photo. Same destination as the title, so it's hidden from keyboard and screen readers
          to avoid announcing the same link twice. Mouse and touch users can still tap it. */}
      <Link
        href={`/products/${product.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-square overflow-hidden bg-gold-soft"
      >
        {image ? (
          mediaType === "video" ? (
            <video
              ref={videoRef}
              src={image}
              muted
              autoPlay
              loop
              playsInline
              aria-hidden="true"
              className={`h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110 ${
                outOfStock ? "opacity-60 grayscale" : ""
              }`}
            />
          ) : (
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, 25vw"
              className={`object-cover transition duration-700 ease-out group-hover:scale-110 ${
                outOfStock ? "opacity-60 grayscale" : ""
              }`}
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-gold-deep/40">
            <LeafIcon className="h-10 w-10 transition-transform duration-500 group-hover:rotate-12 sm:h-12 sm:w-12" />
          </div>
        )}

        {/* Visual badges. Their meaning is repeated for screen readers in the text below. */}
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full border border-ink/20 bg-white/95 px-3 py-1 font-display text-xs font-bold text-ink">
            Out of stock
          </span>
        )}
        {!outOfStock && hasDiscount && (
          <span className="absolute right-3 top-3 origin-center rounded-full bg-ink px-3 py-1 font-display text-xs font-extrabold text-gold shadow-md transition duration-300 group-hover:-rotate-3 group-hover:scale-110">
            {discountPercent}% off
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {product.category?.name && (
          <p className="text-xs font-bold text-gold-deep">{product.category.name}</p>
        )}

        <h3
          id={titleId}
          className="mt-1 line-clamp-2 min-h-[2.75rem] font-display text-base font-extrabold leading-snug text-ink sm:min-h-[3rem] sm:text-lg"
        >
          <Link
            href={`/products/${product.slug}`}
            className="rounded bg-[linear-gradient(#C9A227,#C9A227)] bg-[length:0_3px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_3px] focus-visible:bg-[length:100%_3px]"
          >
            {product.name}
          </Link>
        </h3>

        {/* Status that the badges show visually */}
        {(outOfStock || hasDiscount) && (
          <p className="sr-only">
            {outOfStock ? "Out of stock" : `${discountPercent}% off`}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-lg font-extrabold text-ink sm:text-xl">
                <span className="sr-only">Price: </span>
                {priceText}
              </span>
              {showCompare && (
                <del className="text-xs font-semibold text-muted">
                  <span className="sr-only">, was </span>₹{discountCompareAtPrice}
                </del>
              )}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-muted">
              {hasVariants
                ? `${product.variants.length} ${product.variants.length === 1 ? "size" : "sizes"}`
                : product.unit}
            </p>
          </div>

          {hasVariants ? (
            <Link
              href={`/products/${product.slug}`}
              className="group/btn flex h-11 shrink-0 items-center gap-1.5 rounded-full border-2 border-gold px-4 font-display text-xs font-bold text-ink transition duration-300 hover:bg-gold active:scale-95"
            >
              <span>
                View options<span className="sr-only"> for {product.name}</span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1"
              />
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={outOfStock}
                aria-label={
                  outOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-gold hover:shadow-lg active:scale-90 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-gold-soft disabled:text-muted disabled:shadow-none"
              >
                <span key={added ? "done" : "bag"} aria-hidden="true" className="animate-pop">
                  {added ? <Check className="h-5 w-5" strokeWidth={3} /> : <BagIcon className="h-5 w-5" />}
                </span>
              </button>
              {/* Confirms the add for screen reader users */}
              <p role="status" aria-live="polite" className="sr-only">
                {added ? `${product.name} added to cart` : ""}
              </p>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
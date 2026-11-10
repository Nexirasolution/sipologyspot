"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/* Mobile: tall, edge-to-edge hero so the image fills the whole screen width.
   The image always uses object-cover, so there are never gaps or bars. */
const HEIGHT = "h-[70svh] min-h-[380px] max-h-[600px] md:h-[500px] md:max-h-none lg:h-[650px]";

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const swiperRef = useRef(null);

  useEffect(() => {
    fetch("/api/banners?activeOnly=true")
      .then((r) => r.json())
      // only the image is required, so ignore any record without one
      .then((data) => setSlides((data.banners || []).filter((b) => b.image?.url)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleAutoplay = () => {
    const s = swiperRef.current;
    if (!s?.autoplay) return;
    if (paused) s.autoplay.start();
    else s.autoplay.stop();
    setPaused(!paused);
  };

  if (loading) {
    return <section aria-hidden="true" className={`relative ${HEIGHT} animate-pulse bg-[#FBF6E6]`} />;
  }

  if (!slides.length) return null;

  const multiple = slides.length > 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured banners"
      className={`relative ${HEIGHT} hero-slider`}
    >
      <Swiper
        className="h-full"
        modules={[Navigation, Pagination, Autoplay, A11y]}
        onSwiper={(s) => {
          swiperRef.current = s;
          // Respect "reduce motion": don't auto-advance
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            s.autoplay?.stop();
            setPaused(true);
          }
        }}
        navigation={false}
        breakpoints={{ 768: { navigation: true } }}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop={multiple}
        a11y={{
          prevSlideMessage: "Previous slide",
          nextSlideMessage: "Next slide",
          paginationBulletMessage: "Go to slide {{index}}",
          slideLabelMessage: "Slide {{index}} of {{slidesLength}}",
        }}
      >
        {slides.map((slide, index) => {
          const alt = slide.altText || slide.title || `Banner ${index + 1}`;
          const hasText = Boolean(slide.title || slide.subtitle || slide.ctaText);
          const href = slide.ctaLink || (slide.ctaText ? "/products" : "");

          return (
            <SwiperSlide key={slide._id || index}>
              <div className="relative h-full w-full overflow-hidden">
                {/* Full-cover image */}
                <Image
                  src={slide.image.url}
                  alt={hasText && slide.title ? "" : alt} /* title below already describes it */
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="hero-img object-cover object-center"
                />

                {hasText && (
                  <>
                    {/* Overlay only when there is text to keep readable.
                        Bottom-up on mobile, left-to-right on larger screens. */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent md:bg-gradient-to-r md:from-black/70 md:via-black/35 md:to-transparent"
                    />

                    <div className="absolute inset-0 flex items-end pb-14 md:items-center md:pb-0">
                      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
                        <div className="max-w-md md:max-w-xl">
                          {slide.title && (
                            <h2
                              className="hero-anim text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
                              style={{ "--d": "100ms" }}
                            >
                              {slide.title}
                            </h2>
                          )}

                          {slide.subtitle && (
                            <p
                              className="hero-anim mt-3 text-sm font-semibold text-white/95 sm:text-base md:text-lg"
                              style={{ "--d": "250ms" }}
                            >
                              {slide.subtitle}
                            </p>
                          )}

                          {slide.ctaText && (
                            <div className="hero-anim mt-6" style={{ "--d": "400ms" }}>
                              <Link href={href} className="btn-gold">
                                {slide.ctaText}
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Image-only banner with a link: make the whole banner clickable */}
                {!slide.ctaText && slide.ctaLink && (
                  <Link href={slide.ctaLink} aria-label={alt} className="absolute inset-0 z-10" />
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {multiple && (
        <button
          type="button"
          onClick={toggleAutoplay}
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
          className="absolute bottom-3 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1a1408] bg-[#c9a227] text-xs font-extrabold text-[#1a1408] transition hover:scale-110 active:scale-95 md:bottom-5 md:right-8"
        >
          <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
        </button>
      )}

      <style jsx global>{`
        .hero-slider .swiper-pagination-bullet {
          background: #ffffff;
          opacity: 0.7;
          width: 10px;
          height: 10px;
          transition: width 0.3s ease, background 0.3s ease;
        }
        .hero-slider .swiper-pagination-bullet-active {
          background: #c9a227;
          opacity: 1;
          width: 26px;
          border-radius: 9999px;
        }
        .hero-slider .swiper-button-next,
        .hero-slider .swiper-button-prev {
          color: #c9a227;
        }
        .hero-slider .swiper-button-next::after,
        .hero-slider .swiper-button-prev::after {
          font-size: 22px;
          font-weight: 800;
        }
        .hero-slider .swiper-pagination-bullet:focus-visible,
        .hero-slider .swiper-button-next:focus-visible,
        .hero-slider .swiper-button-prev:focus-visible {
          outline: 2px solid #ffffff;
          outline-offset: 3px;
        }

        /* Text animates in each time its slide becomes active */
        .hero-slider .hero-anim {
          opacity: 0;
          transform: translateY(24px);
        }
        .hero-slider .swiper-slide-active .hero-anim {
          animation: hero-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          animation-delay: var(--d, 0ms);
        }
        @keyframes hero-in {
          to { opacity: 1; transform: none; }
        }
        /* Slow zoom-out on the active image */
        .hero-slider .swiper-slide-active .hero-img {
          animation: hero-zoom 9s ease-out both;
        }
        @keyframes hero-zoom {
          from { transform: scale(1.08); }
          to   { transform: scale(1); }
        }
        /* If the user turned animations off in the accessibility panel, show text immediately */
        html[data-motion="off"] .hero-slider .hero-anim {
          opacity: 1;
          transform: none;
        }
      `}</style>
    </section>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

  // Static placeholder (no pulsing) while the banners load
  if (loading) {
    return <section aria-hidden="true" className="aspect-[16/9] w-full bg-[#FBF6E6] md:aspect-[16/6]" />;
  }

  if (!slides.length) return null;

  const multiple = slides.length > 1;

  return (
    <section aria-roledescription="carousel" aria-label="Featured banners" className="relative hero-slider">
      {/* autoHeight: the slider takes the height of the image on each slide,
          so the whole picture is always shown, never cropped and without empty bars */}
      <Swiper
        autoHeight
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
              <div className="relative w-full">
                {/* Full image at full width. Height follows the image's own proportions. */}
                <Image
                  src={slide.image.url}
                  alt={hasText && slide.title ? "" : alt} /* title below already describes it */
                  width={0}
                  height={0}
                  priority={index === 0}
                  sizes="100vw"
                  style={{ width: "100%", height: "auto", display: "block" }}
                  onLoad={() => swiperRef.current?.update()}
                />

                {hasText && (
                  <>
                    {/* Overlay only when there is text to keep readable.
                        Bottom-up on mobile, left-to-right on larger screens. */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent md:bg-gradient-to-r md:from-black/70 md:via-black/35 md:to-transparent"
                    />

                    <div className="absolute inset-0 flex items-end pb-10 md:items-center md:pb-0">
                      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
                        <div className="max-w-md md:max-w-xl">
                          {slide.title && (
                            <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-5xl lg:text-6xl">
                              {slide.title}
                            </h2>
                          )}

                          {slide.subtitle && (
                            <p className="mt-2 text-sm font-semibold text-white/95 sm:text-base md:mt-3 md:text-lg">
                              {slide.subtitle}
                            </p>
                          )}

                          {slide.ctaText && (
                            <div className="mt-4 md:mt-6">
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
      `}</style>
    </section>
  );
}
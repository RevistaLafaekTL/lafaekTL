"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

type Lang = "en" | "tet";

interface CarouselProps {
  language?: Lang;
  intervalMs?: number;
}

type Slide = {
  src: string;
  alt: Record<Lang, string>;
  title: Record<Lang, string>;
  line: Record<Lang, string>;
  accent: string;
};

// One short message per slide. To add a slide, drop the image in
// /public/carousel and add another entry here with its text.
const slides: Slide[] = [
  {
    src: "/carousel/slide1.JPG",
    alt: { en: "Lafaek team in the field", tet: "Ekipa Lafaek iha kampu" },
    title: {
      en: "Welcome to LAFAEK Learning Media",
      tet: "Benvindu mai Mídia Aprendijajen LAFAEK",
    },
    line: {
      en: "Bringing Education to Life",
      tet: "Halo Edukasaun Sai Moris",
    },
    accent: "#F2C94C",
  },
  {
    src: "/carousel/slide2.JPG",
    alt: { en: "Children reading", tet: "Labarik sira lee" },
    title: {
      en: "An educational initiative of CARE in Timor-Leste",
      tet: "Inisiativa edukasionál husi CARE iha Timor-Leste",
    },
    line: {
      en: "Developed in 2000. Our first magazine reached readers in 2001.",
      tet: "Dezenvolve iha tinan 2000 no hahú fahe revista dahuluk iha 2001.",
    },
    accent: "#6FCF97",
  },
  {
    src: "/carousel/slide3.JPG",
    alt: { en: "Lafaek workshop", tet: "Workshop Lafaek" },
    title: {
      en: "Quality learning materials in Tetun",
      tet: "Materiál aprendizajen ho kualidade iha lian Tetun",
    },
    line: {
      en: "For children, students, teachers, families and communities, especially in rural and remote areas.",
      tet: "Ba labarik, estudante, manorin, família no komunidade, liuliu iha área rurál no remota.",
    },
    accent: "#56CCF2",
  },
  {
    src: "/carousel/slide4.JPG",
    alt: { en: "Lafaek in the community", tet: "Lafaek iha komunidade" },
    title: {
      en: "Connecting learning across schools, families and communities",
      tet: "LAFAEK liga aprendizajen entre eskola, família no komunidade",
    },
    line: {
      en: "Together with the Ministry of Education and its partners.",
      tet: "Hamutuk ho Ministériu Edukasaun no parseiru sira.",
    },
    accent: "#EB5757",
  },
];

const labels: Record<Lang, { more: string; prev: string; next: string; goTo: string }> = {
  en: { more: "Discover Lafaek", prev: "Previous slide", next: "Next slide", goTo: "Go to slide" },
  tet: { more: "Hatene liu tan kona-ba Lafaek", prev: "Slide antes", next: "Slide depois", goTo: "Ba slide" },
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

export default function Carousel({ language, intervalMs = 7000 }: CarouselProps) {
  const ctx = useLanguage?.();

  const lang: Lang = useMemo(() => {
    if (language) return language;
    if (ctx && (ctx.language === "en" || ctx.language === "tet")) return ctx.language;
    return "en";
  }, [language, ctx]);

  const l = labels[lang];

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const goTo = (index: number) => {
    const len = slides.length;
    setCurrent(((index % len) + len) % len);
  };

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;

    const id = window.setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [intervalMs, isPaused, prefersReducedMotion, current]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };

    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [current]);

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) touchStartX.current = touch.clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX == null) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - startX;
    if (dx > 40) prev();
    else if (dx < -40) next();
  };

  return (
    <section
      ref={containerRef}
      className="relative h-[520px] w-full overflow-hidden outline-none md:h-[600px]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Lafaek hero carousel"
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "z-20 opacity-100" : "z-10 opacity-0"
          }`}
          aria-hidden={index !== current}
        >
          <Image
            src={slide.src}
            alt={slide.alt[lang]}
            fill
            sizes="100vw"
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Readability overlay: darker on the text side, lighter on the photo side */}
      <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-40 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Slide text */}
      <div className="absolute inset-0 z-40 flex items-center">
        <div className="relative w-full max-w-2xl px-16 md:pl-24 lg:pl-32">
          {/* Fixed-height box so the layout does not jump between slides */}
          <div className="relative min-h-[260px] md:min-h-[300px]">
            {slides.map((slide, index) => {
              const isActive = index === current;
              const Heading = index === 0 ? "h1" : "h2";

              return (
                <div
                  key={slide.src}
                  className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-out ${
                    isActive
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-4 opacity-0"
                  }`}
                  aria-hidden={!isActive}
                >
                  <span
                    className="mb-4 block h-1.5 w-16 rounded-full"
                    style={{ backgroundColor: slide.accent }}
                  />
                  <Heading className="text-3xl font-extrabold leading-tight text-white drop-shadow-lg md:text-5xl">
                    {slide.title[lang]}
                  </Heading>
                  <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/95 md:text-2xl">
                    {slide.line[lang]}
                  </p>
                </div>
              );
            })}
          </div>

          <a
            href="#about-lafaek"
            className="mt-2 inline-flex items-center gap-2 rounded-full border-2 border-white/80 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white hover:text-[#219653] md:text-base"
          >
            {l.more}
            <ChevronDown className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-3 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/80 md:left-4"
        aria-label={l.prev}
      >
        <ChevronLeft className="h-6 w-6 text-[#4F4F4F]" />
      </button>

      <button
        type="button"
        onClick={next}
        className="absolute right-3 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/80 md:right-4"
        aria-label={l.next}
      >
        <ChevronRight className="h-6 w-6 text-[#4F4F4F]" />
      </button>

      {/* Counter + dots */}
      <div className="absolute bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4">
        <span className="text-xs font-semibold tracking-widest text-white/80">
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex gap-2">
          {slides.map((slide, i) => {
            const isActive = i === current;

            return (
              <button
                key={slide.src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${l.goTo} ${i + 1}`}
                aria-current={isActive ? "true" : "false"}
                className={`h-2 rounded-full transition-all ${
                  isActive ? "w-8" : "w-2 bg-white/60 hover:bg-white/90"
                }`}
                style={isActive ? { backgroundColor: slide.accent } : undefined}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
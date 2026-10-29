"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";

type Subject = {
  slug: string;
  titleEn: string;
  titleTet: string;
  image: string;
};

export default function LearningPage() {
  const { language } = useLanguage();

  const t = {
    en: {
      heroTitle: "Learning",
      heroSubtitle:
        "Choose a subject to explore learning materials that will grow over time into printable resources and flipbook-style readers.",
      browseLabel: "Browse categories",
      categoryHint: "Open category",
    },
    tet: {
      heroTitle: "Revista Lafaek",
      heroSubtitle:
        "Hametin kanorin, manorin no komunidade sira liuhusi edukasaun iha Timor-Leste.",
      browseLabel: "Haree kategoria sira",
      categoryHint: "Loke kategoría",
    },
  }[language];

  const SUBJECTS: Subject[] = [
    { slug: "stories", titleEn: "Stories", titleTet: "Istória sira", image: "/learning/icons/stories.png" },
    { slug: "natural-science", titleEn: "Natural Science", titleTet: "Siénsia Naturál", image: "/learning/icons/naturalscience.png" },
    { slug: "social-science", titleEn: "Social Science", titleTet: "Siénsia Sosiál", image: "/learning/icons/socialscience.png" },
    { slug: "physical-education", titleEn: "Physical Education", titleTet: "Edukasãun Físika", image: "/learning/icons/Sports.png" },
    { slug: "literacy", titleEn: "Literacy", titleTet: "Leitura & Hakerek", image: "/learning/icons/Literacy.png" },
    { slug: "mathematics", titleEn: "Mathematics", titleTet: "Matemátika", image: "/learning/icons/maths.png" },
    { slug: "health", titleEn: "Health", titleTet: "Saúde", image: "/learning/icons/Health.png" },
    { slug: "games", titleEn: "Games", titleTet: "Jogu sira", image: "/learning/icons/games1.png" },
    { slug: "creativity", titleEn: "Creativity", titleTet: "Kreatividade", image: "/learning/icons/Creativity.png" },
  ];

  return (
    <main className="min-h-screen bg-[#f3f4f5]">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-4">
            <h1 className="text-4xl font-extrabold leading-tight text-black">
              {t.heroTitle}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-black/90">
              {t.heroSubtitle}
            </p>

            <div className="mt-8 rounded-2xl border border-[#219653]/15 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#219653]">
                {t.browseLabel}
              </p>
              <p className="mt-2 text-sm text-[#4F4F4F]">
                {language === "tet"
                  ? "Kada kategoria sei iha nia pájina rasik no bele simu tan konteúdu foun husi admin iha tempu oin mai."
                  : "Each category will have its own page and can receive more content from the admin side over time."}
              </p>
            </div>
          </div>

          <div id="subjects" className="lg:col-span-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {SUBJECTS.map((s) => (
                <Link
                  key={s.slug}
                  href={`/learning/${s.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-black/10 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={s.image}
                      alt={language === "tet" ? s.titleTet : s.titleEn}
                      fill
                      sizes="(min-width:1024px) 22vw, (min-width:768px) 30vw, 45vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority={s.slug === "stories"}
                    />

                    <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/65 via-black/25 to-transparent p-4">
                      <h2 className="text-center text-lg font-extrabold leading-snug text-white drop-shadow sm:text-xl md:text-2xl">
                        {language === "tet" ? s.titleTet : s.titleEn}
                      </h2>

                      <div className="mt-2 flex items-center justify-center">
                        <span className="translate-y-1 text-sm font-semibold text-white/90 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                          {t.categoryHint} →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";
import type { LearningCategorySlug, LearningItemRecord } from "@/lib/learning-types";

type SubjectConfig = {
  titleEn: string;
  titleTet: string;
  descEn: string;
  descTet: string;
  image: string;
};

type LearningApiResponse = {
  success: boolean;
  items?: LearningItemRecord[];
  message?: string;
};

const SUBJECTS: Record<LearningCategorySlug, SubjectConfig> = {
  stories: {
    titleEn: "Stories",
    titleTet: "Istória sira",
    descEn: "Stories, readers, and story-based learning resources.",
    descTet: "Istória sira, leitúr sira, no rekursu aprendizagem bazeia ba istória.",
    image: "/learning/icons/stories.png",
  },
  "natural-science": {
    titleEn: "Natural Science",
    titleTet: "Siénsia Naturál",
    descEn: "Plants, animals, nature, and simple science learning.",
    descTet: "Ai-horis, animál, natureza, no aprendizagem siénsia simples.",
    image: "/learning/icons/naturalscience.png",
  },
  "social-science": {
    titleEn: "Social Science",
    titleTet: "Siénsia Sosiál",
    descEn: "People, communities, culture, and how society works.",
    descTet: "Ema, komunidade, kultura, no oinsá sosiedade halo servisu.",
    image: "/learning/icons/socialscience.png",
  },
  "physical-education": {
    titleEn: "Physical Education",
    titleTet: "Edukasãun Físika",
    descEn: "Sports and physical health.",
    descTet: "Desportu no saúde fíziku.",
    image: "/learning/icons/history1.png",
  },
  literacy: {
    titleEn: "Literacy",
    titleTet: "Lierasi",
    descEn: "Reading, writing, vocabulary, and language practice.",
    descTet: "Leitura, hakerek, vokabuláriu, no prátika língua.",
    image: "/learning/icons/literacy.png",
  },
  mathematics: {
    titleEn: "Mathematics",
    titleTet: "Matemátika",
    descEn: "Numbers, problem solving, patterns, and maths practice.",
    descTet: "Númeru, rezolve problema, padraun, no prátika matemátika.",
    image: "/learning/icons/maths.png",
  },
  health: {
    titleEn: "Health",
    titleTet: "Saúde",
    descEn: "Hygiene, nutrition, safety, and wellbeing.",
    descTet: "Ijiene, nutrisaun, seguransa, no bem-estar.",
    image: "/learning/icons/health.png",
  },
  games: {
    titleEn: "Games",
    titleTet: "knaar",
    descEn: "Learning games and playful practice activities.",
    descTet: "Jogu aprendizagem no atividade prátika ne’ebé divertidu.",
    image: "/learning/icons/games1.png",
  },
  creativity: {
    titleEn: "Creativity",
    titleTet: "Kreatividade",
    descEn: "Art, making, music, and imagination projects.",
    descTet: "Arte, músika, no projetu imajinasaun.",
    image: "/learning/icons/creativity.png",
  },
};

function isValidSlug(value: string): value is LearningCategorySlug {
  return Object.prototype.hasOwnProperty.call(SUBJECTS, value);
}

export default function LearningSubjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const { language } = useLanguage();
  const [items, setItems] = useState<LearningItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const labels = {
    en: {
      back: "Back",
      backToLearning: "Back to Learning",
      categoryNotFound: "Category not found",
      categoryNotFoundText: "That link does not match a learning category.",
      loading: "Loading learning items...",
      noItemsTitle: "No items yet",
      noItemsText:
        "This category is ready, but no published learning items have been uploaded yet.",
      openFlipbook: "Open book",
      pages: "pages",
      sourcePdf: "PDF available",
      publishedItems: "Published items",
      categoryPlan: "Category collection",
      categoryPlanText:
        "Items added here through the admin page will build up over time and open in a flipbook-style reader.",
    },
    tet: {
      back: "Fila fali",
      backToLearning: "Fila ba Learning",
      categoryNotFound: "La hetan kategoría",
      categoryNotFoundText: "Link ida ne’e la hanesan ho kategoría aprendizagem ida.",
      loading: "Hein hela item aprendizagem sira...",
      noItemsTitle: "Seidauk iha item",
      noItemsText:
        "Kategoría ida ne’e prontu ona, maibé seidauk iha item aprendizagem publika ne’ebé upload ona.",
      openFlipbook: "Loke livru",
      pages: "pájina sira",
      sourcePdf: "Iha PDF",
      publishedItems: "Item publika sira",
      categoryPlan: "Koleksaun kategoría",
      categoryPlanText:
        "Item sira-ne’ebé aumenta iha admin page sei sai barak liu no bele loke iha leitor estilo flipbook.",
    },
  } as const;

  const t = labels[language];

  const subject = useMemo(() => {
    return isValidSlug(params.slug) ? SUBJECTS[params.slug] : null;
  }, [params.slug]);

  useEffect(() => {
    async function loadCategoryItems() {
      if (!subject) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/learning?categorySlug=${encodeURIComponent(params.slug)}`,
          { cache: "no-store" }
        );

        const data = (await response.json()) as LearningApiResponse;

        if (!response.ok || !data.success || !Array.isArray(data.items)) {
          throw new Error(data.message || "Failed to load learning items.");
        }

        setItems(data.items);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load learning items.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadCategoryItems();
  }, [params.slug, subject]);

  if (!subject) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold text-[#333333]">
          {t.categoryNotFound}
        </h1>
        <p className="mt-2 text-[#828282]">{t.categoryNotFoundText}</p>
        <Link
          className="mt-4 inline-block text-[#2F80ED] underline hover:no-underline"
          href="/learning"
        >
          {t.backToLearning}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link className="text-[#2F80ED] underline hover:no-underline" href="/learning">
        ← {t.back}
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr,0.95fr] lg:items-start">
        <div>
          <h1 className="text-4xl font-extrabold text-[#333333]">
            {language === "tet" ? subject.titleTet : subject.titleEn}
          </h1>

          <p className="mt-3 max-w-2xl text-[#4F4F4F]">
            {language === "tet" ? subject.descTet : subject.descEn}
          </p>

          <div className="mt-6 rounded-2xl border border-[#219653]/15 bg-[#F8FFFA] p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[#333333]">
              {t.categoryPlan}
            </h2>
            <p className="mt-2 text-sm text-[#4F4F4F]">
              {t.categoryPlanText}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="relative h-64 overflow-hidden rounded-xl bg-gray-100">
            <Image
              src={subject.image}
              alt={language === "tet" ? subject.titleTet : subject.titleEn}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 28vw, 100vw"
            />
          </div>

          <div className="mt-4">
            <h2 className="text-lg font-bold text-[#333333]">
              {t.publishedItems}
            </h2>
            <p className="mt-2 text-sm text-[#4F4F4F]">
              {items.length}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-10">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-[#4F4F4F] shadow-sm">
            {t.loading}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-[#991b1b] shadow-sm">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#333333]">{t.noItemsTitle}</h2>
            <p className="mt-2 text-[#828282]">{t.noItemsText}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.itemId}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {item.coverImageUrl ? (
                  <div className="relative h-64 w-full bg-gray-100">
                    <Image
                      src={item.coverImageUrl}
                      alt={language === "tet" ? item.titleTet : item.titleEn}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center bg-gray-100 text-sm text-gray-400">
                    No cover
                  </div>
                )}

                <div className="p-5">
                  <h2 className="text-xl font-bold text-[#333333]">
                    {language === "tet" ? item.titleTet : item.titleEn}
                  </h2>

                  <p className="mt-2 text-sm text-[#4F4F4F]">
                    {language === "tet" ? item.descriptionTet : item.descriptionEn}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-[#EAF7EF] px-3 py-1 font-medium text-[#1F6F43]">
                      {item.pageImageUrls.length} {t.pages}
                    </span>
                    {item.sourcePdfUrl ? (
                      <span className="rounded-full bg-[#EFF6FF] px-3 py-1 font-medium text-[#1D4ED8]">
                        {t.sourcePdf}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <Link
                      href={`/learning/${params.slug}/${item.itemId}`}
                      className="inline-block rounded-lg bg-[#219653] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b7f45]"
                    >
                      {t.openFlipbook}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
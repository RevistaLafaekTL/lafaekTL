"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

type Lang = "en" | "tet";

type ComingSoonProps = {
  // Section name shown above the heading, e.g. { en: "Reports", tet: "Relatóriu" }
  section: Record<Lang, string>;
};

const content: Record<
  Lang,
  { title: string; body: string; note: string; homeLink: string; contactLink: string }
> = {
  en: {
    title: "This page is not available yet",
    body: "We are still preparing this section of the website.",
    note: "Please check back soon. In the meantime, you can explore the rest of the site or get in touch with us.",
    homeLink: "Back to home",
    contactLink: "Contact us",
  },
  tet: {
    title: "Pájina ida-ne’e seidauk disponível",
    body: "Ami sei prepara hela seksaun ida-ne’e husi website.",
    note: "Favór fila fali mai iha tempu badak. Entretantu, ita bele esplora parte seluk husi website ka kontaktu ami.",
    homeLink: "Filafali ba Pájina Inísiu",
    contactLink: "Kontaktu ami",
  },
};

export default function ComingSoon({ section }: ComingSoonProps) {
  const { language } = useLanguage();
  const L: Lang = language === "tet" ? "tet" : "en";
  const t = content[L];

  return (
    <div className="flex min-h-[70vh] flex-col bg-white">
      <main className="flex flex-grow items-center justify-center px-4 py-16 md:py-24">
        <div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-gradient-to-br from-green-50 via-white to-blue-50 p-8 text-center shadow-sm md:p-12">
          <span className="mb-6 flex justify-center gap-1" aria-hidden="true">
            <span className="h-2 w-8 rounded-full bg-[#219653]" />
            <span className="h-2 w-8 rounded-full bg-[#2F80ED]" />
            <span className="h-2 w-8 rounded-full bg-[#F2C94C]" />
            <span className="h-2 w-8 rounded-full bg-[#EB5757]" />
          </span>

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F2C94C]/30">
            <Clock className="h-8 w-8 text-[#219653]" aria-hidden="true" />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-[#219653]">
            {section[L]}
          </p>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-[#333333] md:text-4xl">
            {t.title}
          </h1>
          <p className="mb-2 text-lg leading-8 text-gray-700">{t.body}</p>
          <p className="mb-8 text-lg leading-8 text-gray-700">{t.note}</p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-[#219653] px-6 py-3 text-base font-bold text-white transition hover:bg-[#1b7a44]"
            >
              {t.homeLink}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#219653] px-6 py-3 text-base font-bold text-[#219653] transition hover:bg-[#219653] hover:text-white"
            >
              {t.contactLink}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
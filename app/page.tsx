"use client";

import { useEffect, useState } from "react";
import Carousel from "@/components/Carousel";
import { useLanguage } from "@/lib/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const S3_ORIGIN = "https://lafaek-media.s3.ap-southeast-2.amazonaws.com";
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@lafaek";
const YOUTUBE_VIDEOS_URL = "https://www.youtube.com/@lafaek/videos";

type ImpactItem = {
  id: string;
  slug?: string;
  titleEn: string;
  titleTet?: string;
  excerptEn: string;
  excerptTet?: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  images?: string[];
  visible?: boolean;
  order?: number;
  [key: string]: any;
};

type ImpactApiResponse = {
  ok: boolean;
  items: any[];
  error?: string;
};

const buildImageUrl = (src?: string) => {
  if (!src) {
    return "/placeholder.svg?height=160&width=280";
  }

  let clean = src.trim();

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  clean = clean.replace(/^\/+/, "");

  return `${S3_ORIGIN}/${clean}`;
};

// Matches "Latest first" on /stories/impact: the story date set in the admin
// editor decides the order. updatedAt is not used because every admin save
// stamps all stories with the same updatedAt.
const getImpactTimestamp = (item: ImpactItem) => {
  const possibleDates = [item.date, item.createdAt];

  for (const value of possibleDates) {
    if (!value) {
      continue;
    }

    const timestamp = new Date(value).getTime();

    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
  }

  return 0;
};

export default function HomePage() {
  const { language } = useLanguage();
  const L = language === "tet" ? "tet" : "en";
  const router = useRouter();

  const content = {
    en: {
      intro: {
        eyebrow: "About LAFAEK",
        lead:
          "LAFAEK Learning Media is an educational initiative of CARE in Timor-Leste. It was developed in 2000 and distributed its first magazine in 2001. LAFAEK provides quality learning materials in Tetun for children, students, teachers, families and communities, especially in rural and remote areas.",
        body:
          "Through the magazines Lafaek Ki'ik, Lafaek Prima, Lafaek ba Manorin, Lafaek ba Komunidade and its digital content, LAFAEK promotes literacy, numeracy, gender equality, social inclusion, health and practical knowledge. Together with the Ministry of Education and its partners, LAFAEK connects learning across schools, families and communities.",
        magazinesTitle: "Our magazines",
        magazinesLink: "Browse the magazines →",
        focusTitle: "What we promote",
        focus: [
          "Literacy",
          "Numeracy",
          "Gender equality",
          "Social inclusion",
          "Health",
          "Practical knowledge",
        ],
      },
      news: { title: "Latest News", subtitle: "What's happening at Lafaek?", viewAll: "View all news" },
      socialEnterprise: {
        title: "Lafaek Social Enterprise",
        subtitle: "From Community Initiative to Timorese-Owned Impact Organization",
        stats: [
          { number: "25+", label: "Years of Impact" },
          { number: "1M+", label: "Magazines Distributed / Year" },
          { number: "1,500+", label: "Schools Supported" },
          { number: "100%", label: "Timorese Owned" },
        ],
      },
      products: {
        title: "Our Products",
        subtitle: "Creative educational resources designed for impact",
        items: [
          { name: "Children's Books", desc: "Beautifully illustrated stories for early learners" },
          { name: "Teaching Posters", desc: "Classroom-ready visuals for effective learning" },
          { name: "Animations & Videos", desc: "Locally made, culturally relevant media" },
          { name: "Magazines", desc: "Trusted content in Tetun and Portuguese" },
        ],
      },
      impact: {
        title: "Our Impact Stories",
        subtitle: "Real change in Timorese communities",
        readMore: "Read more",
        viewAll: "View all impact stories",
        empty: "No impact stories to show yet. Please check back soon.",
      },
      kidsSection: {
        title: "Fun Zone for Kids!",
        subtitle: "Coming Soon: Games, Stories, Songs & More!",
        features: [],
      },
      cta: {
        title: "Join Our Mission",
        subtitle: "Help us continue empowering Timor-Leste through education",
        volunteer: "Volunteer",
        partner: "Partner With Us",
      },
      social: {
        title: "Follow Lafaek Online",
        facebookTitle: "Follow us on Facebook",
        facebookText: "Stay updated with our latest stories and community events.",
        facebookButton: "Visit Facebook",
        instagramTitle: "See us on Instagram",
        instagramText: "Photos, short stories, and field updates from our work.",
        instagramButton: "Visit Instagram",
        youtubeTitle: "Watch us on YouTube",
        youtubeText: "Discover our stories, field videos, and behind-the-scenes content from Lafaek.",
        youtubeButton: "Visit YouTube",
        youtubeSecondary: "See all videos",
      },
    },
    tet: {
      intro: {
        eyebrow: "Kona-ba LAFAEK",
        lead:
          "Mídia Aprendijajen LAFAEK mak inisiativa edukasionál husi CARE iha Timor-Leste, ne’ebé dezenvolve iha tinan 2000 no hahú fahe revista dahuluk iha 2001. LAFAEK fornese materiál aprendizajen ho kualidade iha lian Tetun ba labarik, kanorin, manorin, família no komunidade, liuliu iha área rurál no remota.",
        body:
          "Liuhusi revista Lafaek Ki’ik, Lafaek Prima, Lafaek ba Manorin, Lafaek ba Komunidade no kontéudu dijitál, LAFAEK promove literasia, numerasia, igualdade jéneru, inkluzaun sosial, saúde no koñesimentu prátiku. Hamutuk ho Ministériu Edukasaun no parseiru sira, LAFAEK liga aprendizajen entre eskola, família no komunidade.",
        magazinesTitle: "Ami-nia revista",
        magazinesLink: "Haree revista sira →",
        focusTitle: "Saida mak ami promove",
        focus: [
          "Literasia",
          "Numerasia",
          "Igualdade jéneru",
          "Inkluzaun sosiál",
          "Saúde",
          "Koñesimentu prátiku",
        ],
      },
      news: { title: "Notísia Foun", subtitle: "Saida mak akontese iha Lafaek?", viewAll: "Haree hotu notísia" },
      socialEnterprise: {
        title: "LAFAEK Empreza Sosiál",
        subtitle: "Hamutuk ho komunidade, hamosu impaktu sustentável ba Timor-Oan.",
        stats: [
          { number: "25+", label: "Ninia impaktu liu tinan 25" },
          { number: "1M+", label: "Kada tinan ami distribui Revista liu Miliaun 1" },
          { number: "1,500+", label: "Suporta Eskola liu 1500 iha territóriu Timor-Leste." },
          { number: "100%", label: "100% Timor Oan mak na'in" },
        ],
      },
      products: {
        title: "Produtu Ami",
        subtitle: "Rekursu edukativu kria hodi fó impaktu",
        items: [
          { name: "Livru ba labarik sira", desc: "Istória ilustradu ne'ebé furak ba aprendisajem" },
          { name: "Poster hanorin", desc: "Visual prontu ba sala aula" },
          { name: "Animasaun no Vídeu", desc: "Mídia lokal no relevante ba kultura" },
          { name: "Revista", desc: "Kontentu konfiável iha Tetun no Portugés" },
        ],
      },
      impact: {
        title: "Istória Impaktu no Susesu",
        subtitle: "Istória kona-ba servisu Revista Lafaek ho kanorin, manorin no komunidade sira iha Timór.",
        readMore: "Lee liu tan",
        viewAll: "Haree hotu istória impaktu",
        empty: "Seidauk iha istória impaktu atu hatudu. Favor fila fali mai depois.",
      },
      kidsSection: {
        title: "Zona Divertidu ba Labarik!",
        subtitle: "Mai la'ós laran: jogos, istória, kanzona no buat barak tan!",
        features: [],
      },
      cta: {
        title: "Hamutuk hala'o Ami-nia Misaun",
        subtitle: "Partisipa ho ami atu kontinua hametin Timor-Leste liuhusi edukasaun.",
        volunteer: "Voluntáriu",
        partner: "Parseria ho Ami",
      },
      social: {
        title: "Tuir Revista Lafaek iha Online",
        facebookTitle: "Revista Lafaek iha Facebook",
        facebookText: "Tuir nafatin ami nia istoria foun sira no eventu komunidade.",
        facebookButton: "Vizita ami nia pajina Facebook",
        instagramTitle: "Revista Lafaek iha Instagram",
        instagramText: "Haree foto, istória badinas no atividade sira iha kampu.",
        instagramButton: "Vizita Instagram",
        youtubeTitle: "Revista Lafaek iha YouTube",
        youtubeText: "Deskobre ami-nia konteúdu, istória no vídeo sira husi kampu.",
        youtubeButton: "Vizita ami nia YouTube",
        youtubeSecondary: "Haree vídeo hotu",
      },
    },
  } as const;

  const t = content[L];

  const [impactItems, setImpactItems] = useState<ImpactItem[]>([]);
  const [impactError, setImpactError] = useState<string | undefined>();
  const [latestMagazines, setLatestMagazines] = useState<any[]>([]);

  // Load impact stories
  useEffect(() => {
    const loadImpact = async () => {
      try {
        setImpactError(undefined);

        // Public endpoint only: it already hides drafts, hidden and archived stories.
        const endpoints = ["/api/impact"];

        let data: ImpactApiResponse | null = null;
        let lastError = "Could not load impact stories.";

        for (const url of endpoints) {
          try {
            const res = await fetch(url, {
              method: "GET",
              headers: { Accept: "application/json" },
              cache: "no-store",
            });

            const contentType = res.headers.get("content-type") || "";
            const rawText = await res.text();

            if (!res.ok) {
              lastError = `Failed to load impact stories: ${res.status}`;
              continue;
            }

            if (!contentType.includes("application/json")) {
              lastError = `Impact endpoint returned ${contentType || "non-JSON content"} from ${url}`;
              continue;
            }

            const parsed = JSON.parse(rawText) as ImpactApiResponse;

            if (!parsed.ok || !Array.isArray(parsed.items)) {
              lastError = parsed.error || `Invalid impact payload from ${url}`;
              continue;
            }

            data = parsed;
            break;
          } catch (err: any) {
            lastError = err?.message || `Error reading impact stories from ${url}`;
          }
        }

        if (!data) {
          throw new Error(lastError);
        }

        const items: ImpactItem[] = (data.items || [])
          .map((raw: any, index: number) => {
            const id =
              typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : `impact-${index}`;

            const slug =
              typeof raw.slug === "string" && raw.slug.trim() ? raw.slug.trim() : undefined;

            const titleEn = String(raw.titleEn ?? "Untitled");
            const titleTet = typeof raw.titleTet === "string" ? raw.titleTet : undefined;
            const excerptEn = String(raw.excerptEn ?? "");
            const excerptTet = typeof raw.excerptTet === "string" ? raw.excerptTet : undefined;
            const date = String(raw.date ?? raw.createdAt ?? raw.updatedAt ?? "");
            const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : undefined;
            const updatedAt = typeof raw.updatedAt === "string" ? raw.updatedAt : undefined;

            const rawImages = Array.isArray(raw.images)
              ? raw.images.filter((img: any) => typeof img === "string" && img.trim())
              : undefined;

            const primaryImage =
              typeof raw.image === "string" && raw.image.trim()
                ? raw.image.trim()
                : rawImages && rawImages.length > 0
                ? rawImages[0]
                : undefined;

            const visible = raw.visible !== false;
            const order = typeof raw.order === "number" ? raw.order : index + 1;

            return {
              ...raw,
              id,
              slug,
              titleEn,
              titleTet,
              excerptEn,
              excerptTet,
              date,
              createdAt,
              updatedAt,
              image: primaryImage,
              images: rawImages,
              visible,
              order,
            } as ImpactItem;
          })
          .filter((item) => item.visible !== false);

        items.sort((a, b) => {
          const newestFirst = getImpactTimestamp(b) - getImpactTimestamp(a);
          if (newestFirst !== 0) return newestFirst;
          return (a.order ?? 0) - (b.order ?? 0);
        });

        setImpactItems(items.slice(0, 3));
      } catch (err: any) {
        console.error("[home] impact load error", err);
        setImpactError(err.message || "Error loading impact stories");
        setImpactItems([]);
      }
    };

    loadImpact();
  }, []);

  // Load latest magazines
  useEffect(() => {
    const loadMagazines = async () => {
      try {
        const res = await fetch("/api/magazines");
        const data = await res.json();

        // API returns { ok: true, items: [...] }
        const items = Array.isArray(data?.items) ? data.items : [];

        // Sort: newest year first, then by series order within same year/issue,
        // then by issue number descending.
        // Series priority within a batch: LK → LP → LBM → LBK
        const SERIES_ORDER: Record<string, number> = {
          LK: 1,
          LP: 2,
          LBM: 3,
          LBK: 4,
        };

        const sorted = [...items]
          .sort((a, b) => {
            const yearDiff = Number(b.year) - Number(a.year);
            if (yearDiff !== 0) return yearDiff;

            const issueDiff = Number(b.issue) - Number(a.issue);
            if (issueDiff !== 0) return issueDiff;

            const sa = SERIES_ORDER[a.series] ?? 99;
            const sb = SERIES_ORDER[b.series] ?? 99;
            return sa - sb;
          })
          .slice(0, 4);

        setLatestMagazines(sorted);
      } catch (error) {
        console.error("Failed to load magazines", error);
      }
    };

    loadMagazines();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <Carousel />

        {/* About LAFAEK: full welcome text from the carousel */}
        <section
          id="about-lafaek"
          className="scroll-mt-20 bg-white px-4 py-14 md:py-20"
          aria-labelledby="about-lafaek-heading"
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Story */}
            <div className="lg:col-span-7">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex gap-1" aria-hidden="true">
                  <span className="h-2 w-6 rounded-full bg-[#219653]" />
                  <span className="h-2 w-6 rounded-full bg-[#2F80ED]" />
                  <span className="h-2 w-6 rounded-full bg-[#F2C94C]" />
                  <span className="h-2 w-6 rounded-full bg-[#EB5757]" />
                </span>
                <h2
                  id="about-lafaek-heading"
                  className="text-sm font-bold uppercase tracking-widest text-[#219653]"
                >
                  {t.intro.eyebrow}
                </h2>
              </div>

              <p className="text-xl font-semibold leading-relaxed text-[#333333] md:text-2xl md:leading-relaxed">
                {t.intro.lead}
              </p>

              <p className="mt-6 text-base leading-8 text-gray-700 md:text-lg md:leading-8">
                {t.intro.body}
              </p>

              <div className="mt-8">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-500">
                  {t.intro.focusTitle}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {t.intro.focus.map((item, i) => {
                    const pillColours = [
                      "bg-green-50 text-[#219653] ring-green-200",
                      "bg-blue-50 text-[#2F80ED] ring-blue-200",
                      "bg-yellow-50 text-[#8a6d00] ring-yellow-200",
                      "bg-red-50 text-[#C0392B] ring-red-200",
                    ];

                    return (
                      <li
                        key={item}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${
                          pillColours[i % pillColours.length]
                        }`}
                      >
                        {item}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Magazine family */}
            <aside className="lg:col-span-5">
              <div className="rounded-3xl bg-gradient-to-br from-green-50 to-blue-50 p-6 shadow-sm md:p-8">
                <h3 className="mb-5 text-2xl font-bold text-[#219653]">
                  {t.intro.magazinesTitle}
                </h3>

                <ul className="space-y-3">
                  {[
                    { code: "LK", name: "Lafaek Ki'ik", colour: "bg-[#F2C94C] text-[#333333]" },
                    { code: "LP", name: "Lafaek Prima", colour: "bg-[#2F80ED] text-white" },
                    { code: "LBM", name: "Lafaek ba Manorin", colour: "bg-[#219653] text-white" },
                    { code: "LBK", name: "Lafaek ba Komunidade", colour: "bg-[#EB5757] text-white" },
                  ].map((mag) => (
                    <li
                      key={mag.code}
                      className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm"
                    >
                      <span
                        className={`flex h-12 w-14 shrink-0 items-center justify-center rounded-xl text-sm font-black ${mag.colour}`}
                      >
                        {mag.code}
                      </span>
                      <span className="font-semibold text-[#333333]">{mag.name}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/publication/magazines"
                  className="mt-6 inline-block font-semibold text-[#219653] hover:underline"
                >
                  {t.intro.magazinesLink}
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* Dropdown nav + Latest Magazines */}
        <section className="bg-white px-4 py-8">
          <div className="mx-auto max-w-7xl">

            {/* Dropdown navigation */}
            <div className="mb-8 rounded-xl bg-gray-50 p-6 shadow-sm">
              <h2 className="mb-3 text-2xl font-bold text-[#219653]">
                {L === "tet" ? "Saida mak ita hakarak atu buka-hatene ohin loron?" : "What are you looking for today?"}
              </h2>

              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#219653]"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    router.push(e.target.value);
                  }
                }}
              >
                <option value="">
                  {L === "tet" ? "Eksplora Lafaek..." : "Explore Lafaek..."}
                </option>
                <option value="/publication/magazines">
                  {L === "tet" ? "Revista" : "Magazines"}
                </option>
                <option value="/learning">
                  {L === "tet" ? "Rekursu Aprendizajen" : "Learning Resources"}
                </option>
                <option value="/cyber">
                  {L === "tet" ? "Seguransa Online" : "Keep Safe Online"}
                </option>
                <option value="/our-team">
                  {L === "tet" ? "Ema Ami Nian" : "Who We Are"}
                </option>
                <option value="/stories/impact">
                  {L === "tet" ? "Impaktu no Susesu" : "Impact & Success Stories"}
                </option>
                <option value="/stories/news">
                  {L === "tet" ? "Notísia" : "News"}
                </option>
                <option value="/services">
                  {L === "tet" ? "Servisu" : "Services"}
                </option>
                <option value="/careers">
                  {L === "tet" ? "Oportunidade Servisu" : "Careers"}
                </option>
                <option value="/about">
                  {L === "tet" ? "Kona-ba Lafaek" : "About Lafaek"}
                </option>
                <option value="/contact">
                  {L === "tet" ? "Kontaktu Ami" : "Contact Us"}
                </option>
              </select>
            </div>

            {/* Latest Magazines */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl font-bold text-[#219653]">
                  {L === "tet" ? "Revista Foun Liu" : "Latest Magazines"}
                </h2>
                <Link
                  href="/publication/magazines"
                  className="font-semibold text-[#219653] hover:underline"
                >
                  {L === "tet" ? "Haree Hotu →" : "View All →"}
                </Link>
              </div>

              {latestMagazines.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {latestMagazines.map((magazine) => {
                    const coverSrc = buildImageUrl(magazine.coverImage);
                    const title =
                      L === "tet"
                        ? magazine.titleTet || magazine.titleEn || magazine.code
                        : magazine.titleEn || magazine.code;
                    const seriesNames: Record<string, { en: string; tet: string }> = {
                      LK:  { en: "Lafaek Ki'ik",          tet: "Lafaek Ki’ik" },
                      LP:  { en: "Lafaek Prima",       tet: "Lafaek Prima" },
                      LBM: { en: "Lafaek ba Manorin",     tet: "Lafaek ba Manorin" },
                      LBK: { en: "Lafaek ba Komunidade",  tet: "Lafaek ba Komunidade" },
                    };
                    const seriesLabel =
                      seriesNames[magazine.series]?.[L] ?? magazine.series ?? "";

                    return (
                      <Link
                        key={magazine.code}
                        href={`/publication/magazines/${magazine.code}`}
                        className="group flex flex-col"
                      >
                        {/* Portrait cover */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
                          {coverSrc ? (
                            <Image
                              src={coverSrc}
                              alt={title}
                              fill
                              sizes="(min-width:768px) 25vw, 50vw"
                              className="object-cover transition duration-300 group-hover:scale-105"
                              unoptimized
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                              No cover
                            </div>
                          )}
                          {/* Code + year badge */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <div className="flex items-center justify-between text-xs text-white">
                              <span className="rounded bg-black/40 px-2 py-0.5">
                                {magazine.code}
                              </span>
                              <span className="rounded bg-black/40 px-2 py-0.5">
                                {magazine.year}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Label below cover */}
                        <div className="mt-2 px-1">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            {seriesLabel}
                          </p>
                          <p className="line-clamp-2 text-sm font-medium text-gray-800 group-hover:text-[#219653]">
                            {title}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
                  {L === "tet"
                    ? "Seidauk iha revista atu hatudu."
                    : "No magazines to show yet. Please check back soon."}
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Social + CTA */}
        <section className="bg-gray-50 px-4 py-12" aria-labelledby="social-and-cta">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center">
              <h2
                id="social-and-cta"
                className="text-3xl font-bold text-[#219653] md:text-4xl"
              >
                {t.social.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
              <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-3">
                <div className="relative h-40 w-full bg-gray-100">
                  <Image
                    src="/HomePage/LafaekFacebook.png"
                    alt="Lafaek Facebook"
                    fill
                    sizes="(min-width:1024px) 25vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="flex flex-grow flex-col p-5">
                  <h3 className="mb-2 text-xl font-bold text-blue-700">
                    {t.social.facebookTitle}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">{t.social.facebookText}</p>
                  <a
                    href="https://www.facebook.com/RevistaLafaek"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                    aria-label="Visit our Facebook page (opens in a new tab)"
                  >
                    {t.social.facebookButton}
                  </a>
                </div>
              </div>

              <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-3">
                <div className="relative h-40 w-full bg-gray-100">
                  <Image
                    src="/HomePage/LafaekInstagram.png"
                    alt="Lafaek Instagram"
                    fill
                    sizes="(min-width:1024px) 25vw, 100vw"
                    className="object-contain p-6"
                  />
                </div>
                <div className="flex flex-grow flex-col p-5">
                  <h3 className="mb-2 text-xl font-bold text-[#EB5757]">
                    {t.social.instagramTitle}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">{t.social.instagramText}</p>
                  <a
                    href="https://www.instagram.com/revistalafaek/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center rounded-full bg-[#EB5757] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-600"
                    aria-label="Visit our Instagram page (opens in a new tab)"
                  >
                    {t.social.instagramButton}
                  </a>
                </div>
              </div>

              <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-6">
                <a
                  href={YOUTUBE_VIDEOS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-video w-full overflow-hidden bg-gray-100"
                  aria-label="Open Lafaek YouTube videos in a new tab"
                >
                  <Image
                    src="/HomePage/LafaekWebsite.png"
                    alt="Lafaek YouTube videos"
                    fill
                    sizes="(min-width:1024px) 50vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="rounded-full bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg transition group-hover:bg-red-700 md:text-base">
                      ▶ {t.social.youtubeButton}
                    </span>
                  </div>
                </a>
                <div className="flex flex-grow flex-col p-6">
                  <div>
                    <h3 className="mb-2 text-2xl font-bold text-red-600">
                      {t.social.youtubeTitle}
                    </h3>
                    <p className="text-sm text-gray-600 md:text-base">{t.social.youtubeText}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={YOUTUBE_CHANNEL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
                      aria-label="Visit our YouTube channel (opens in a new tab)"
                    >
                      {t.social.youtubeButton}
                    </a>
                    <a
                      href={YOUTUBE_VIDEOS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-6 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                    >
                      {t.social.youtubeSecondary}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA banner */}
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#219653] via-[#2F80ED] to-[#219653] p-6 text-white shadow-lg md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <h2 className="mb-2 text-2xl font-bold md:text-3xl">{t.cta.title}</h2>
                  <p className="text-sm text-white/90 md:text-base">{t.cta.subtitle}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link
                    href="/get-involved#volunteer"
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-[#219653] transition-colors hover:bg-gray-100"
                  >
                    {t.cta.volunteer}
                  </Link>
                  <Link
                    href="/get-involved#partner"
                    className="inline-flex items-center justify-center rounded-full bg-[#F2C94C] px-6 py-3 text-sm font-bold text-[#333333] transition-colors hover:bg-yellow-300"
                  >
                    {t.cta.partner}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Stories */}
        <section className="bg-white py-12" aria-labelledby="home-impact-preview">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2
                  id="home-impact-preview"
                  className="text-3xl font-bold text-green-800"
                >
                  {t.impact.title}
                </h2>
                <p className="mt-1 text-gray-700">{t.impact.subtitle}</p>
              </div>
              <div>
                <Link
                  href="/stories/impact"
                  className="text-sm font-semibold text-[#219653] hover:underline"
                >
                  {t.impact.viewAll}
                </Link>
              </div>
            </div>

            {impactError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {impactError}
              </div>
            )}

            {!impactError && impactItems.length === 0 && (
              <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
                {t.impact.empty}
              </div>
            )}

            {impactItems.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {impactItems.map((item) => {
                  const title = L === "tet" ? item.titleTet || item.titleEn : item.titleEn;
                  const excerpt = L === "tet" ? item.excerptTet || item.excerptEn : item.excerptEn;
                  const heroImage =
                    item.image || (Array.isArray(item.images) && item.images[0]) || undefined;
                  const imageSrc = buildImageUrl(heroImage);
                  const internalIdOrSlug = item.slug || item.id;

                  let dateLabel = "";
                  if (item.date) {
                    const d = new Date(item.date);
                    if (!Number.isNaN(d.getTime())) {
                      dateLabel = d.toLocaleDateString();
                    }
                  }

                  return (
                    <article
                      key={item.id}
                      className="flex flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative mb-4 h-44 w-full overflow-hidden rounded-[24px] bg-gray-100">
                        <Image
                          src={imageSrc}
                          alt={title}
                          fill
                          sizes="(min-width:768px) 33vw, 100vw"
                          className="rounded-[24px] object-cover"
                        />
                      </div>
                      {dateLabel && (
                        <div className="mb-2 text-xs font-medium text-gray-500">{dateLabel}</div>
                      )}
                      <h3 className="mb-2 text-lg font-semibold text-[#333333]">{title}</h3>
                      {excerpt && (
                        <p className="mb-4 line-clamp-3 text-sm leading-6 text-gray-700">
                          {excerpt}
                        </p>
                      )}
                      <div className="mt-auto">
                        <Link
                          href={`/stories/impact/${internalIdOrSlug}`}
                          className="inline-block text-sm font-semibold text-[#219653] hover:underline"
                        >
                          {t.impact.readMore}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Lafaek friends image */}
        <section className="bg-white py-12">
          <div className="mx-auto flex max-w-7xl justify-center px-4">
            <div className="relative h-64 w-full max-w-3xl">
              <Image
                src="/characters/0-lafaek-friends.png"
                alt="Lafaek friends"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </section>

        {/* Social Enterprise stats */}
        <section
          className="bg-gradient-to-br from-green-50 to-blue-50 py-20 text-center"
          aria-labelledby="social-enterprise"
        >
          <div className="mx-auto max-w-7xl px-4">
            <h2
              id="social-enterprise"
              className="mb-4 text-4xl font-bold text-green-800"
            >
              {t.socialEnterprise.title}
            </h2>
            <p className="mb-10 text-xl text-gray-700">{t.socialEnterprise.subtitle}</p>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {t.socialEnterprise.stats.map((stat, index) => (
                <div key={index} className="rounded-lg bg-white p-6 shadow-md">
                  <div className="mb-2 text-3xl font-bold text-green-700">{stat.number}</div>
                  <div className="text-gray-700">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sponsors */}
        <section
          className="border-t border-gray-200 bg-gray-50 py-12"
        >
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-10">
              <div className="relative h-32 w-80">
                <Image
                  src="/sponsors/logo-mfat.jpg"
                  alt="New Zealand Ministry of Foreign Affairs & Trade"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative h-32 w-80">
                <Image
                  src="/sponsors/timor-education.png"
                  alt="Timor-Leste Ministry of Education"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative h-32 w-80">
                <Image
                  src="/sponsors/logo-care.jpg"
                  alt="Care International"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
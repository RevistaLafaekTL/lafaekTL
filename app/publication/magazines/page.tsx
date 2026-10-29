//app/publication/magazines/page.tsx
"use client"

import {useEffect,useMemo,useState} from "react"

import Image from "next/image"
import Link from "next/link"

import {useLanguage} from "@/lib/LanguageContext"
import MagazineRequestModal from "@/components/MagazineRequestModal"

const LAFAEK = {
  green:"#219653",
  red:"#EB5757",
  grayLight:"#F5F5F5",
  grayMid:"#BDBDBD",
  textDark:"#4F4F4F",
  blue:"#2F80ED",
}

type Lang = "en" | "tet"

type Series =
  | "LK"
  | "LBK"
  | "LP"
  | "LBM"

type PublicMagazine = {
  id:string

  code:string

  series:Series

  issue:string
  year:string

  titleEn?:string
  titleTet?:string

  description?:string
  category?:string
  language?:string

  coverImage?:string

  // NEW FLIPBOOK PAGE SYSTEM
  pageImageUrls?:string[]

  visible?:boolean
}

type ApiResponse = {
  ok:boolean
  items:PublicMagazine[]
  error?:string
}

const S3_ORIGIN =
  "https://lafaek-media.s3.ap-southeast-2.amazonaws.com"

const buildUrl = (src?:string) => {

  if(!src){
    return ""
  }

  let clean = src.trim()

  if(clean.startsWith(S3_ORIGIN)){
    return clean
  }

  if(
    clean.startsWith("http://") ||
    clean.startsWith("https://")
  ){
    return clean
  }

  clean = clean.replace(/^\/+/,"")

  return `${S3_ORIGIN}/${clean}`
}

const monthName = (n:string) => {

  const i = parseInt(n,10)

  const en = (
    [
      "—",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ][i] || `Issue ${n}`
  )

  const tet = (
    [
      "—",
      "Janeiru",
      "Fevreiru",
      "Marsu",
      "Abril",
      "Maiu",
      "Juñu",
      "Jullu",
      "Agostu",
      "Setembru",
      "Outubru",
      "Novembru",
      "Dezembru",
    ][i] || `Numeru ${n}`
  )

  return {
    en,
    tet,
  }
}

const seriesLabel = (s:Series) =>
  s === "LP"
    ? {
        en:"Lafaek Prima",
        tet:"Lafaek Prima",
      }
    : s === "LBM"
    ? {
        en:"Lafaek ba Manorin",
        tet:"Lafaek ba Manorin",
      }
    : s === "LBK"
    ? {
        en:"Lafaek ba Komunidade",
        tet:"Lafaek ba Komunidade",
      }
    : {
        en:"Lafaek Ki'ik",
        tet:"Lafaek Ki’ik",
      }

      

const makeName = (m:PublicMagazine) => {

  const s = seriesLabel(m.series)

  return {
    en:`${s.en} Edisaun ${m.issue}, ${m.year}`,
    tet:`${s.tet} Edisaun ${m.issue}, ${m.year}`,
  }
}

const ui = {

  en:{
    title:"Our Magazines",

    searchPlaceholder:
      "Search by title or code (e.g., LK-1-2016)",

    noResults:"No magazines found.",

    read:"Read Magazine",
    requestCopies:"Request Copies",

    bannerAlt:"Magazines banner",

    loading:"Loading…",

    loadFail:"Could not load magazines.",

    filters:{
      sortBy:"Sort by",

      newest:"Newest → Oldest",
      oldest:"Oldest → Newest",

      seriesAZ:"Series A → Z",
      seriesZA:"Series Z → A",

      series:"Series",
      allSeries:"All series",

      year:"Year",
      allYears:"All years",

      clear:"Clear",
    },
  },

  tet:{
    title:"Ami-nia Revista",

    searchPlaceholder:
      "Buka tuir titulu ka kode (hanesan LK-1-2016)",

    noResults:"La hetan revista.",

    read:"Lee Revista",
    requestCopies:"Husu Kópia",

    bannerAlt:"Baner revista",

    loading:"Hela karga…",

    loadFail:"La bele karga revista.",

    filters:{
      sortBy:"Ordena tuir",

      newest:"Foun liu → Tuan liu",
      oldest:"Tuan liu → Foun liu",

      seriesAZ:"Série A → Z",
      seriesZA:"Série Z → A",

      series:"Série",
      allSeries:"Hotu-hotu",

      year:"Tinan",
      allYears:"Tinan hotu-hotu",

      clear:"Hamoos",
    },
  },

} as const

type SortKey =
  | "newest"
  | "oldest"
  | "seriesAZ"
  | "seriesZA"

export default function MagazinesPage(){

  const {language} =
    useLanguage() as {
      language:Lang
      setLanguage:(lang:Lang) => void
    }

  const t = ui[language]

  const [mags,setMags] =
    useState<PublicMagazine[]>([])

  const [loading,setLoading] =
    useState(true)

  const [error,setError] =
    useState("")

  const [search,setSearch] =
    useState("")

  const [seriesFilter,setSeriesFilter] =
    useState<"" | Series>("")

  const [yearFilter,setYearFilter] =
    useState("")

  const [sortBy,setSortBy] =
    useState<SortKey>("newest")

  const [requestModal,setRequestModal] =
    useState<{code:string;title:string} | null>(null)

  useEffect(() => {

    const load = async() => {

      try{

        setLoading(true)

        setError("")

        const res = await fetch(
          "/api/magazines",
          {
            method:"GET",
          }
        )

        if(!res.ok){
          throw new Error(
            `Failed to load magazines (${res.status})`
          )
        }

        const data:ApiResponse =
          await res.json()

        if(
          !data.ok ||
          !Array.isArray(data.items)
        ){
          throw new Error(
            data.error || "Invalid API response"
          )
        }

 const visible =
  data.items
    .filter(
      (m) =>
        m.visible === false
          ? false
          : true
    )
    .map((m:any) => ({
      ...m,
      series:
        String(m.series) === "LM" ||
        String(m.series) === "LMB"
          ? "LBM"
          : m.series,
    }))

console.log(
  visible
    .filter((m) =>
      m.code.includes("LBM") ||
      m.code.includes("LMB")
    )
    .map((m) => ({
      code:m.code,
      series:m.series,
    }))
)

setMags(visible)

      }catch(err:any){

        setError(
          err?.message ||
          "Failed to load magazines"
        )

      }finally{

        setLoading(false)
      }
    }

    void load()

  },[])

  const years = useMemo(() => {

    const uniq = Array.from(
      new Set(
        mags
          .map((m) => m.year)
          .filter(Boolean)
      )
    )

    return uniq.sort(
      (a,b) =>
        parseInt(b,10) -
        parseInt(a,10)
    )

  },[mags])

  const filteredAndSorted = useMemo(() => {
const SERIES_ORDER = {
  LK: 1,
  LP: 2,
  LBM: 3,
  LBK: 4,
}
    const q =
      search.trim().toLowerCase()

    let list = mags.filter((m) => {

      const name = makeName(m)

      const textMatch =
        !q ||
        [
          name.en,
          name.tet,
          m.code,
          m.year,
          m.issue,
          seriesLabel(m.series).en,
          seriesLabel(m.series).tet,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)

      const seriesMatch =
        !seriesFilter ||
        m.series === seriesFilter

      const yearMatch =
        !yearFilter ||
        m.year === yearFilter

      return (
        textMatch &&
        seriesMatch &&
        yearMatch
      )
    })

    list = list.sort((a,b) => {

      const ay =
        parseInt(a.year || "0",10)

      const by =
        parseInt(b.year || "0",10)

      switch(sortBy){

    case "newest": {

  const ai =
    parseInt(a.issue || "0",10)

  const bi =
    parseInt(b.issue || "0",10)

  return (
    by - ay ||
    bi - ai ||
    b.code.localeCompare(a.code)
  )
}

      case "oldest": {

  const ai =
    parseInt(a.issue || "0",10)

  const bi =
    parseInt(b.issue || "0",10)

  return (
    ay - by ||
    ai - bi ||
    a.code.localeCompare(b.code)
  )
}

       case "seriesAZ": {

  const sa =
    SERIES_ORDER[a.series] || 999

  const sb =
    SERIES_ORDER[b.series] || 999

  return (
    sa - sb ||
    by - ay
  )
}

case "seriesZA": {

  const sa =
    SERIES_ORDER[a.series] || 999

  const sb =
    SERIES_ORDER[b.series] || 999

  return (
    sb - sa ||
    by - ay
  )
}
          return (
            seriesLabel(b.series).en.localeCompare(
              seriesLabel(a.series).en
            ) ||
            by - ay
          )

        default:
          return 0
      }
    })

    return list

  },[
    mags,
    search,
    seriesFilter,
    yearFilter,
    sortBy,
    language,
  ])

  const clearFilters = () => {

    setSearch("")
    setSeriesFilter("")
    setYearFilter("")
    setSortBy("newest")
  }

  return (

    <div className="flex min-h-screen flex-col bg-white">

      {/* BANNER */}
      <div className="relative h-60 w-full md:h-80">

        <Image
          src="/products.jpg"
          alt={t.bannerAlt}
          fill
          className="object-cover"
          priority
        />

      </div>

      <main className="flex-grow p-6 md:p-8">

        <h1
          className="mb-2 text-3xl font-bold md:text-4xl"
          style={{
            color:LAFAEK.green
          }}
        >
          {t.title}
        </h1>

        {/* LOADING / ERROR */}
        {loading && (
          <p className="mb-6 text-gray-600">
            {t.loading}
          </p>
        )}

        {!loading && error && (

          <div className="mb-6">

            <p className="font-semibold text-red-700">
              {t.loadFail}
            </p>

            <p className="text-sm text-gray-700">
              {error}
            </p>

          </div>

        )}

        {/* FILTERS */}
        <div className="mb-6 grid gap-3 md:grid-cols-5">

          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border p-3 md:col-span-2"
            style={{
              borderColor:LAFAEK.grayMid,
              outline:"none",
            }}
            disabled={loading}
          />

          <select
            value={seriesFilter}
            onChange={(e) =>
              setSeriesFilter(
                e.target.value as "" | Series
              )
            }
            className="w-full rounded-lg border bg-white p-3"
            style={{
              borderColor:LAFAEK.grayMid
            }}
            disabled={loading}
          >

            <option value="">
              {t.filters.allSeries}
            </option>

            <option value="LBK">
              {seriesLabel("LBK").en}
            </option>

            <option value="LK">
              {seriesLabel("LK").en}
            </option>

            <option value="LP">
              {seriesLabel("LP").en}
            </option>

            <option value="LBM">
              {seriesLabel("LBM").en}
            </option>

          </select>

          <select
            value={yearFilter}
            onChange={(e) =>
              setYearFilter(e.target.value)
            }
            className="w-full rounded-lg border bg-white p-3"
            style={{
              borderColor:LAFAEK.grayMid
            }}
            disabled={loading}
          >

            <option value="">
              {t.filters.allYears}
            </option>

            {years.map((y) => (

              <option
                key={y}
                value={y}
              >
                {y}
              </option>

            ))}

          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as SortKey
              )
            }
            className="w-full rounded-lg border bg-white p-3"
            style={{
              borderColor:LAFAEK.grayMid
            }}
            disabled={loading}
          >

            <option value="newest">
              {t.filters.newest}
            </option>

            <option value="oldest">
              {t.filters.oldest}
            </option>

            <option value="seriesAZ">
              {t.filters.seriesAZ}
            </option>

            <option value="seriesZA">
              {t.filters.seriesZA}
            </option>

          </select>

        </div>

        <div className="mb-6">

          <button
            onClick={clearFilters}
            className="rounded-lg px-4 py-2 font-semibold text-white"
            style={{
              background:LAFAEK.blue
            }}
          >
            {t.filters.clear}
          </button>

        </div>

        {/* MAGAZINE GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {filteredAndSorted.map((m) => {

            const name =
              makeName(m)

            const coverUrl =
              buildUrl(m.coverImage)

            return (

              <div
                key={m.code}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                style={{
                  borderColor:LAFAEK.grayMid
                }}
              >

                {/* PORTRAIT COVER */}
                <Link
                  href={`/publication/magazines/${m.code}`}
                  className="relative block aspect-[3/4] w-full"
                  style={{
                    background:LAFAEK.grayLight
                  }}
                >

                  {coverUrl ? (

                    <Image
                      src={coverUrl}
                      alt={name.en}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                  ) : (

                    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                      No cover
                    </div>

                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">

                    <div className="flex items-center justify-between text-xs text-white">

                      <span className="rounded bg-black/40 px-2 py-1">
                        {m.code}
                      </span>

                      <span className="rounded bg-black/40 px-2 py-1">
                        {m.year}
                      </span>

                    </div>

                  </div>

                </Link>

                {/* CONTENT */}
                <div className="p-4">

                  <p
                    className="mb-1 text-xs uppercase tracking-wide"
                    style={{
                      color:LAFAEK.textDark
                    }}
                  >
                    {seriesLabel(m.series)[language]}
                  </p>

                  <h2
                    className="mb-4 line-clamp-2 min-h-[56px] text-lg font-semibold"
                    style={{
                      color:LAFAEK.red
                    }}
                  >
                    {name[language]}
                  </h2>

                  <Link
                    href={`/publication/magazines/${m.code}`}
                    className="block rounded-xl py-3 text-center font-semibold text-white transition-colors"
                    style={{
                      background:LAFAEK.green
                    }}
                  >
                    {t.read}
                  </Link>

                  <button
                    type="button"
                    onClick={() => setRequestModal({code:m.code,title:name[language]})}
                    className="mt-2 block w-full rounded-xl border-2 py-2.5 text-center text-sm font-semibold transition-colors hover:bg-green-50"
                    style={{borderColor:LAFAEK.green,color:LAFAEK.green}}
                  >
                    {t.requestCopies}
                  </button>

                </div>

              </div>

            )
          })}

          {!loading &&
          filteredAndSorted.length === 0 && (

            <p className="text-gray-500">
              {t.noResults}
            </p>

          )}

        </div>

      </main>

      {requestModal && (
        <MagazineRequestModal
          magazineCode={requestModal.code}
          magazineTitle={requestModal.title}
          language={language as "en" | "tet"}
          onClose={() => setRequestModal(null)}
        />
      )}

    </div>
  )
}
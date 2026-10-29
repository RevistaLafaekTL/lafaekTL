//app/publication/magazines/[code]/page.tsx
import Link from "next/link"
import {notFound} from "next/navigation"

import FlipBookViewer from "@/components/books/FlipBookViewer"

type Series = "LK" | "LBK" | "LP" | "LBM" | "LM" | "LMB"

type PublicMagazine = {
  id:string
  code:string

  series:Series

  year:string
  issue:string

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
    : s === "LBM" || s === "LM" || s === "LMB"
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

  const isMonth = m.series === "LBK"

  const when = isMonth
    ? monthName(m.issue)
    : {
        en:`Issue ${m.issue}`,
        tet:`Numeru ${m.issue}`,
      }

  const s = seriesLabel(m.series)

  return {
    en:(
      m.titleEn
        ? m.titleEn
        : `${s.en} ${when.en} ${m.year}`
    ).trim(),

    tet:(
      m.titleTet
        ? m.titleTet
        : `${s.tet} ${when.tet} ${m.year}`
    ).trim(),
  }
}

async function getMagazine(
  code:string
):Promise<PublicMagazine | null>{

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"

  try{

    const response = await fetch(
      `${baseUrl}/api/magazines`,
      {
        cache:"no-store",
      }
    )

    if(!response.ok){
      return null
    }

    const data:ApiResponse =
      await response.json()

    if(
      !data.ok ||
      !Array.isArray(data.items)
    ){
      return null
    }

    const found =
      data.items.find(
        (item) => item.code === code
      )

    return found || null

  }catch(error){

    console.error(error)

    return null
  }
}

export default async function MagazineReaderPage({
  params,
}:{
  params:Promise<{code:string}>
}){

  const {code} = await params

  const magazine =
    await getMagazine(
      decodeURIComponent(code)
    )

  if(
    !magazine ||
    magazine.visible === false
  ){
    notFound()
  }

  const title = makeName(magazine)

  const coverImage =
    buildUrl(magazine.coverImage)

  const pageImages =
    Array.isArray(magazine.pageImageUrls)
      ? magazine.pageImageUrls.map((p) =>
          buildUrl(p)
        )
      : []

  const flipbookPages = [
    coverImage,
    ...pageImages,
  ].filter(Boolean)

  return (

    <div className="min-h-screen bg-[#f5f5f5]">

      {/* HEADER */}
      <div className="flex items-center justify-between bg-green-700 px-4 py-3 text-white">

        <Link
          href="/publication/magazines"
          className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
        >
          Back
        </Link>

        <div className="flex-1 px-4 text-center">

          <h1 className="truncate text-lg font-bold">
            {title.en}
          </h1>

          <p className="mt-1 text-xs text-green-100">
            {magazine.code}
          </p>

        </div>

        <div className="w-[64px]" />

      </div>

      {/* CONTENT */}
      <main className="px-4 py-8">

        <div className="mx-auto max-w-6xl">

          {/* DESCRIPTION */}
          {magazine.description && (

            <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">

              <p className="text-sm leading-relaxed text-gray-700">
                {magazine.description}
              </p>

            </div>

          )}
<div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-center">

  <p className="text-sm font-medium text-green-800">
    📖 Click the magazine cover to open. Click page corners or swipe to turn pages.
  </p>

  <p className="mt-1 text-sm text-green-700">
    📖 Klik iha kapa revista atu loke. Klik iha kantu pájina ka desliza liman atu muda ba pájina tuirmai.
  </p>

</div>
          {/* FLIPBOOK */}
          {flipbookPages.length > 0 ? (

            <FlipBookViewer
              title={title.en}
              pages={flipbookPages}
            />

          ) : (

            <div className="rounded-xl bg-white p-8 text-center shadow-sm">

              <p className="text-gray-700">
                This magazine does not have pages yet.
              </p>

            </div>

          )}

        </div>

      </main>

    </div>
  )
}
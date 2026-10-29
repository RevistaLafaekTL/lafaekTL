"use client";

import {useEffect,useMemo,useState}from "react";
import Image from "next/image";
import Link from "next/link";
import {useLanguage}from "@/lib/LanguageContext";

type Lang="en"|"tet";
type Series="LK"|"LBK"|"LP"|"LBM";
type AccessType="public"|"approval_required"|"private";

type MagazineBase={
  code:string;
  series:Series;
  year:string;
  issue?:string;
  name:{en:string;tet:string};
  cover:string;
  pdfKey?:string;
  accessType:AccessType;
};

type Magazine=MagazineBase&{
  samplePages?:string[];
};

type SamplesApiResponse={
  ok:boolean;
  items:any[];
  error?:string;
};

type MagazinesApiResponse={
  ok:boolean;
  items:any[];
  error?:string;
};

const S3_ORIGIN="https://lafaek-media.s3.ap-southeast-2.amazonaws.com";
const PLACEHOLDER_SRC="/placeholder.svg?width=640&height=720";

const MONTHS_EN=[
  "—","January","February","March","April","May","June","July","August","September","October","November","December",
] as const;

const MONTHS_TET=[
  "—","Janeiru","Fevreiru","Marsu","Abril","Maiu","Juñu","Jullu","Agostu","Setembru","Outubru","Novembru","Dezembru",
] as const;

const LAFAEK={
  green:"#219653",
  red:"#EB5757",
  grayLight:"#F5F5F5",
  grayMid:"#BDBDBD",
  textDark:"#4F4F4F",
  blue:"#2F80ED",
  yellow:"#F2C94C",
};

const ui={
  en:{
    title:"Lafaek Magazines",
    intro:"Explore Lafaek Ki'ik, Lafaek Prima, Lafaek ba Manorin and Lafaek ba Komunidade. Read public magazines online, view sample pages, or apply for full school access where approval is required.",
    sampleButton:"View sample pages",
    applyButton:"Apply for full access",
    archiveButton:"View full archive",
    sampleHeading:"Sample pages",
    sampleNote:"This preview shows a small selection of pages. Full magazines may be available online or for approved schools and partners.",
    close:"Close",
    loadingSamples:"Loading samples…",
    loadingMagazines:"Loading magazines…",
    samplesError:"Could not load sample pages. You can still apply for access.",
    magazinesError:"Could not load magazines right now. Please try again soon.",
    noSamples:"Sample pages coming soon.",
    noMagazines:"No magazines are available yet. Please check back soon or contact our team.",
    seriesInfoButton:"About this magazine series",
    readPdfButton:"Read magazine",
    readPdfHeading:"Read magazine",
    pdfReadOnlyNote:"This magazine is available to read online. Download options are not provided on this page.",
    noPdf:"Full PDF coming soon",
    restrictedPdf:"Apply for access",
    pdfSampleNote:"This PDF sample is shown inside the page. Download options are not provided here.",
  },
  tet:{
    title:"Revista Lafaek sira",
    intro:"Explora Lafaek Ki'ik, Lafaek Prima, Lafaek ba Manorin no Lafaek ba Komunidade. Lee revista públiku online, haree pájina amostra, ka aplika atu hetan asesu kompletu bainhira presiza aprovasaun.",
    sampleButton:"Haree pájina amostra",
    applyButton:"Aplika hodi asesu kompletu",
    archiveButton:"Haree lista kompletu",
    sampleHeading:"Pájina amostra",
    sampleNote:"Pré-visaun ne'e hatudu pájina balu de'it. Revista kompletu bele disponivel online ka ba eskola no parseiru aprovadu sira.",
    close:"Taka",
    loadingSamples:"Hakarak kargga pájina amostra…",
    loadingMagazines:"Hakarak kargga revista…",
    samplesError:"La bele karga pájina amostra. Ita bele kontinua aplika ba asesu.",
    magazinesError:"La bele karga revista agora. Favór koko fali.",
    noSamples:"Pájina amostra sei mai fali.",
    noMagazines:"Seidauk iha revista atu hatudu. Favór koko fali bainhira mai, ka kontaktu ami nia ekipa.",
    seriesInfoButton:"Kona-ba série revista ida-ne'e",
    readPdfButton:"Lee revista",
    readPdfHeading:"Lee revista",
    pdfReadOnlyNote:"Revista ida-ne'e disponivel atu lee online. Opsaun download la hatudu iha pájina ida-ne'e.",
    noPdf:"PDF kompletu sei mai fali",
    restrictedPdf:"Aplika ba asesu",
    pdfSampleNote:"PDF amostra ida-ne'e hatudu iha pájina laran. Opsaun download la hatudu iha ne'e.",
  },
} as const;

const seriesInfo:Record<
  Series,
  {en:{title:string;body:string};tet:{title:string;body:string}}
>={
  LK:{
    en:{
      title:"Lafaek Ki'ik",
      body:
        "Audience: Preschool to Year 2.\n\n" +
        "Lafaek Ki'ik helps young learners build early reading, counting, thinking, and social skills through simple Tetun stories, illustrations, games, and activities.",
    },
    tet:{
      title:"Lafaek Ki'ik",
      body:
        "Audiénsia: Pré-eskolár to'o Tinan 2.\n\n" +
        "Lafaek Ki'ik ajuda labarik sira atu aprende lee, sura, hanoin, no abilidade sosiál liuhosi istória Tetun simples, ilustrasaun, joga, no atividade sira.",
    },
  },
  LP:{
    en:{
      title:"Lafaek Prima",
      body:
        "Audience: Year 3 to Year 6.\n\n" +
        "Lafaek Prima supports upper primary learners with reading, mathematics, science, environment, culture, and problem-solving activities.",
    },
    tet:{
      title:"Lafaek Prima",
      body:
        "Audiénsia: Tinan 3 to'o Tinan 6.\n\n" +
        "Lafaek Prima suporta estudante primária sira ho leitura, matemátika, siénsia, ambiente, kultura, no atividade rezolve-problema.",
    },
  },
  LBM:{
    en:{
      title:"Lafaek ba Manorin",
      body:
        "Audience: Teachers.\n\n" +
        "Lafaek ba Manorin gives teachers practical classroom ideas, activities, lesson support, and strategies for literacy, numeracy, science, and inclusive education.",
    },
    tet:{
      title:"Lafaek ba Manorin",
      body:
        "Audiénsia: Profesór sira.\n\n" +
        "Lafaek ba Manorin fó ideia prátiku ba klase, atividade, apoiu lisaun, no estratéjia ba alfabetizasaun, numerasia, siénsia, no edukasaun inkluzivu.",
    },
  },
  LBK:{
    en:{
      title:"Lafaek ba Komunidade",
      body:
        "Audience: Parents, caregivers, and community members.\n\n" +
        "Lafaek ba Komunidade supports families with practical information about children's learning, wellbeing, health, school attendance, and community life.",
    },
    tet:{
      title:"Lafaek ba Komunidade",
      body:
        "Audiénsia: Inan-aman, kuidadu-na'in, no komunidade.\n\n" +
        "Lafaek ba Komunidade suporta família sira ho informasaun prátiku kona-ba labarik nia aprendizajen, moris-di'ak, saúde, prezensa iha eskola, no moris komunidade.",
    },
  },
};

function getIndexedLabel(items:readonly string[],index:number,fallback:string):string{
  return items[index]??fallback;
}

function monthName(n:string):{en:string;tet:string}{
  const parsed=Number.parseInt(n,10);
  const index=Number.isNaN(parsed)?0:parsed;

  return{
    en:getIndexedLabel(MONTHS_EN,index,`Issue ${n}`),
    tet:getIndexedLabel(MONTHS_TET,index,`Numeru ${n}`),
  };
}

function seriesLabel(series:Series){
  if(series==="LP"){
    return{en:"Lafaek Prima",tet:"Lafaek Prima"};
  }

  if(series==="LBM"){
    return{en:"Lafaek ba Manorin",tet:"Lafaek ba Manorin"};
  }

  if(series==="LBK"){
    return{en:"Lafaek ba Komunidade",tet:"Lafaek ba Komunidade"};
  }

  return{en:"Lafaek Ki'ik",tet:"Lafaek Ki'ik"};
}

function buildFileUrl(src?:string):string{
  if(!src){
    return"";
  }

  const clean=String(src).trim();

  if(!clean){
    return"";
  }

  if(clean.startsWith(S3_ORIGIN)){
    return clean;
  }

  if(clean.startsWith("http://")||clean.startsWith("https://")){
    return clean;
  }

  return`${S3_ORIGIN}/${clean.replace(/^\/+/,"")}`;
}

function getSafeImageSrc(src?:string):string{
  const built=buildFileUrl(src);
  return built||PLACEHOLDER_SRC;
}

function getFirstSampleSrc(pages?:string[]):string{
  const first=pages?.find((page)=>String(page).trim().length>0);
  return getSafeImageSrc(first);
}

function getCardCoverSrc(magazine:Magazine|MagazineBase):string{
  if(magazine.cover){
    return getSafeImageSrc(magazine.cover);
  }

  if("samplePages" in magazine){
    return getFirstSampleSrc(magazine.samplePages);
  }

  return PLACEHOLDER_SRC;
}

function getExtensionFromUrl(src?:string):string{
  if(!src){
    return"";
  }

  try{
    const url=new URL(src);
    const pathname=url.pathname.toLowerCase();
    const lastDot=pathname.lastIndexOf(".");
    return lastDot>=0?pathname.slice(lastDot):"";
  }catch{
    const clean=src.split("?")[0]?.toLowerCase()??"";
    const lastDot=clean.lastIndexOf(".");
    return lastDot>=0?clean.slice(lastDot):"";
  }
}

function isProbablyPdf(src?:string):boolean{
  return getExtensionFromUrl(src)===".pdf";
}

function safeSeries(raw:any):Series{
  const value=String(raw??"").trim();

  if(value==="LK"||value==="LBK"||value==="LP"||value==="LBM"){
    return value;
  }

  return"LK";
}

function safeAccessType(raw:any):AccessType{
  const value=String(raw??"").trim();

  if(value==="approval_required"||value==="private"){
    return value;
  }

  return"public";
}

function PdfFrame({src,title}:{src:string;title:string}){
  const viewerSrc=`${src}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

  return(
    <iframe
      src={viewerSrc}
      title={title}
      className="h-full w-full border-0"
    />
  );
}

function SamplePreviewCard({
  src,
  alt,
  pdfNote,
}:{
  src:string;
  alt:string;
  pdfNote:string;
}){
  const[failed,setFailed]=useState(false);
  const pdf=isProbablyPdf(src);

  return(
    <div
      className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border bg-white"
      style={{borderColor:LAFAEK.grayMid}}
    >
      {pdf?(
        <div className="flex h-full w-full flex-col">
          <div className="border-b bg-[#F5F5F5] px-3 py-2 text-xs text-gray-600">
            {pdfNote}
          </div>

          <div className="min-h-0 flex-1">
            <PdfFrame src={src} title={alt} />
          </div>
        </div>
      ):failed?(
        <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-gray-600">
          Preview not available.
        </div>
      ):(
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-contain"
          onError={()=>setFailed(true)}
        />
      )}
    </div>
  );
}

export default function MagazinesLandingPage(){
  const {language}=useLanguage() as {language:Lang;setLanguage:(lang:Lang)=>void};
  const t=ui[language];

  const[activeCode,setActiveCode]=useState<string|null>(null);
  const[activePdfCode,setActivePdfCode]=useState<string|null>(null);
  const[infoSeries,setInfoSeries]=useState<Series|null>(null);

  const[baseMagazines,setBaseMagazines]=useState<MagazineBase[]>([]);
  const[loadingMagazines,setLoadingMagazines]=useState<boolean>(true);
  const[magazinesError,setMagazinesError]=useState<string|undefined>();

  const[samplesMap,setSamplesMap]=useState<Record<string,string[]>>({});
  const[loadingSamples,setLoadingSamples]=useState<boolean>(true);
  const[samplesError,setSamplesError]=useState<string|undefined>();

  useEffect(()=>{
    const loadMagazines=async()=>{
      try{
        setLoadingMagazines(true);
        setMagazinesError(undefined);

        const res=await fetch("/api/magazines",{method:"GET",cache:"no-store"});

        if(!res.ok){
          throw new Error(`Failed to load magazines: ${res.status}`);
        }

        const data:MagazinesApiResponse=await res.json();

        if(!data.ok||!Array.isArray(data.items)){
          throw new Error(data.error||"Invalid magazines payload");
        }

        const fromApi:MagazineBase[]=data.items
          .map((raw:any)=>{
            const code=String(raw.code??"").trim();

            if(!code){
              return null;
            }

            const series=safeSeries(raw.series);
            const year=String(raw.year??"").trim();
            const issue=String(raw.issue??"").trim();

            const isMonth=series==="LBK";
            const when=isMonth?monthName(issue):{en:`Issue ${issue}`,tet:`Edisaun ${issue}`};
            const label=seriesLabel(series);

            const titleEn=raw.titleEn
              ? String(raw.titleEn)
              : `${label.en} ${when.en} ${year}`.trim();

            const titleTet=raw.titleTet
              ? String(raw.titleTet)
              : `${label.tet} ${when.tet}/${year}`.trim();

            const cover=raw.coverImage
              ? buildFileUrl(String(raw.coverImage))
              : "";

            const pdfKey=raw.pdfKey
              ? buildFileUrl(String(raw.pdfKey))
              : "";

            const accessType=safeAccessType(raw.accessType);

            return{
              code,
              series,
              year,
              issue,
              name:{en:titleEn,tet:titleTet},
              cover,
              pdfKey,
              accessType,
            } as MagazineBase;
          })
          .filter((m:MagazineBase|null):m is MagazineBase=>m!==null);

        setBaseMagazines(fromApi);
      }catch(err:any){
        console.error("[magazines] error loading public magazines",err);
        setMagazinesError(err?.message||"Error loading magazines");
        setBaseMagazines([]);
      }finally{
        setLoadingMagazines(false);
      }
    };

    void loadMagazines();
  },[]);

  useEffect(()=>{
    const loadSamples=async()=>{
      try{
        setLoadingSamples(true);
        setSamplesError(undefined);

        const res=await fetch("/api/magazines/samples",{method:"GET",cache:"no-store"});

        if(!res.ok){
          throw new Error(`Failed to load samples: ${res.status}`);
        }

        const data:SamplesApiResponse=await res.json();

        if(!data.ok){
          throw new Error(data.error||"Unknown error from API");
        }

        const map:Record<string,string[]>={};

        (data.items||[]).forEach((raw:any)=>{
          const code=String(raw.code??"").trim();

          if(!code){
            return;
          }

          const pages=Array.isArray(raw.samplePages)
            ? raw.samplePages
                .map((page:any)=>buildFileUrl(String(page??"").trim()))
                .filter((page:string)=>page.length>0)
            : [];

          if(pages.length){
            map[code]=pages;
          }
        });

        setSamplesMap(map);
      }catch(err:any){
        console.error("[magazines] error loading public samples",err);
        setSamplesError(err?.message||"Error loading magazine samples");
      }finally{
        setLoadingSamples(false);
      }
    };

    void loadSamples();
  },[]);

  const magazines:Magazine[]=useMemo(
    ()=>baseMagazines.map((m)=>({
      ...m,
      samplePages:samplesMap[m.code],
    })),
    [baseMagazines,samplesMap]
  );

  const activeMagazine=useMemo(
    ()=>magazines.find((m)=>m.code===activeCode)||null,
    [magazines,activeCode]
  );

  const activePdfMagazine=useMemo(
    ()=>magazines.find((m)=>m.code===activePdfCode)||null,
    [magazines,activePdfCode]
  );

  const currentSeriesInfo=infoSeries?seriesInfo[infoSeries][language]:null;

  return(
    <div className="flex min-h-screen flex-col bg-white">
      <section className="w-full bg-[#219653] text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 md:flex-row md:py-14">
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              {t.title}
            </h1>

            <p className="max-w-2xl text-sm md:text-base">
              {t.intro}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/magazines/apply"
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 font-semibold shadow-sm"
                style={{background:LAFAEK.yellow,color:"#4F4F4F"}}
              >
                {t.applyButton}
              </Link>

              <Link
                href="/publication/magazines"
                className="inline-flex items-center justify-center rounded-full border border-white/70 px-5 py-2.5 font-semibold transition-colors hover:bg-white/10"
              >
                {t.archiveButton}
              </Link>
            </div>

            {(loadingMagazines||loadingSamples)&&(
              <p className="mt-2 text-xs text-white/80">
                {loadingMagazines?t.loadingMagazines:t.loadingSamples}
              </p>
            )}

            {magazinesError&&!loadingMagazines&&(
              <p className="mt-2 text-xs text-yellow-200">
                {t.magazinesError}
              </p>
            )}

            {samplesError&&!loadingSamples&&(
              <p className="mt-2 text-xs text-yellow-200">
                {t.samplesError}
              </p>
            )}
          </div>

          <div className="flex flex-1 justify-center">
            <div className="grid max-w-xs grid-cols-3 gap-2">
              {loadingMagazines?(
                <>
                  <div className="h-28 w-20 rounded-lg border border-white/30 bg-white/10" />
                  <div className="h-28 w-20 rounded-lg border border-white/30 bg-white/10" />
                  <div className="h-28 w-20 rounded-lg border border-white/30 bg-white/10" />
                </>
              ):magazines.length>0?(
                magazines.slice(0,3).map((m)=>{
                  const coverSrc=getCardCoverSrc(m);

                  return(
                    <div
                      key={m.code}
                      className="relative h-28 w-20 overflow-hidden rounded-lg border border-white/30 bg-white/10 shadow-sm"
                    >
                      <Image
                        src={coverSrc}
                        alt={m.name.en}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  );
                })
              ):(
                <>
                  <div className="h-28 w-20 rounded-lg border border-white/30 bg-white/10" />
                  <div className="h-28 w-20 rounded-lg border border-white/30 bg-white/10" />
                  <div className="h-28 w-20 rounded-lg border border-white/30 bg-white/10" />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto flex-1 max-w-6xl px-4 py-8 md:py-10">
        {loadingMagazines?(
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({length:6}).map((_,index)=>(
              <div
                key={`magazine-loading-${index}`}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                style={{borderColor:LAFAEK.grayMid}}
              >
                <div className="aspect-[3/2] w-full" style={{background:LAFAEK.grayLight}} />

                <div className="space-y-3 p-4">
                  <div className="h-3 w-32 rounded bg-gray-100" />
                  <div className="h-4 w-48 rounded bg-gray-100" />
                  <div className="h-10 w-full rounded bg-gray-100" />
                  <div className="h-10 w-full rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ):magazinesError?(
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
            {t.magazinesError}
          </div>
        ):magazines.length===0?(
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
            {t.noMagazines}
          </div>
        ):(
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {magazines.map((m)=>{
              const coverSrc=getCardCoverSrc(m);
              const hasPdf=Boolean(m.pdfKey);
              const canReadPdf=Boolean(m.pdfKey&&m.accessType==="public");
              const requiresApproval=m.accessType==="approval_required";

              return(
                <article
                  key={m.code}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                  style={{borderColor:LAFAEK.grayMid}}
                >
                  <div
                    className="relative aspect-[3/2] w-full"
                    style={{background:LAFAEK.grayLight}}
                  >
                    <Image
                      src={coverSrc}
                      alt={m.name.en}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                    <div className="absolute inset-0 flex items-end justify-between p-2">
                      <span className="rounded bg-black/50 px-2 py-1 text-xs text-white">
                        {m.code}
                      </span>

                      <span className="rounded bg-black/50 px-2 py-1 text-xs text-white">
                        {m.year}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 p-4">
                    <p
                      className="text-xs uppercase tracking-wide"
                      style={{color:LAFAEK.textDark}}
                    >
                      {seriesLabel(m.series)[language]} • {m.year}
                    </p>

                    <h2
                      className="text-base font-semibold md:text-lg"
                      style={{color:LAFAEK.red}}
                    >
                      {m.name[language]}
                    </h2>

                    <div className="flex flex-col gap-2 pt-3">
                      {canReadPdf?(
                        <button
                          type="button"
                          onClick={()=>setActivePdfCode(m.code)}
                          className="w-full rounded-xl py-2.5 text-center font-semibold transition-colors"
                          style={{background:LAFAEK.green,color:"#fff"}}
                        >
                          {t.readPdfButton}
                        </button>
                      ):requiresApproval?(
                        <Link
                          href="/magazines/apply"
                          className="w-full rounded-xl py-2.5 text-center font-semibold transition-colors"
                          style={{background:LAFAEK.green,color:"#fff"}}
                        >
                          {t.restrictedPdf}
                        </Link>
                      ):hasPdf?(
                        <button
                          type="button"
                          disabled
                          className="w-full rounded-xl py-2.5 text-center font-semibold opacity-60"
                          style={{background:LAFAEK.grayMid,color:"#fff"}}
                        >
                          {t.restrictedPdf}
                        </button>
                      ):(
                        <button
                          type="button"
                          disabled
                          className="w-full rounded-xl py-2.5 text-center font-semibold opacity-60"
                          style={{background:LAFAEK.grayMid,color:"#fff"}}
                        >
                          {t.noPdf}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={()=>setActiveCode(m.code)}
                        className="w-full rounded-xl border py-2.5 text-center text-sm font-semibold"
                        style={{borderColor:LAFAEK.grayMid,color:LAFAEK.textDark}}
                      >
                        {t.sampleButton}
                      </button>

                      {m.accessType!=="public"&&(
                        <Link
                          href="/magazines/apply"
                          className="w-full rounded-xl border py-2.5 text-center text-sm font-semibold"
                          style={{borderColor:LAFAEK.grayMid,color:LAFAEK.textDark}}
                        >
                          {t.applyButton}
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={()=>setInfoSeries(m.series)}
                        className="w-full rounded-xl border border-dashed py-2 text-center text-xs font-semibold md:text-sm"
                        style={{borderColor:LAFAEK.grayMid,color:LAFAEK.textDark}}
                      >
                        {t.seriesInfoButton}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {activePdfMagazine?.pdfKey&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-3 flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{borderColor:LAFAEK.grayMid}}
            >
              <div>
                <h2 className="text-lg font-semibold" style={{color:LAFAEK.green}}>
                  {t.readPdfHeading}
                </h2>

                <p className="text-xs text-gray-500">
                  {activePdfMagazine.name[language]} • {activePdfMagazine.code}
                </p>
              </div>

              <button
                type="button"
                onClick={()=>setActivePdfCode(null)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-gray-100"
              >
                {t.close}
              </button>
            </div>

            <div className="border-b bg-[#F5F5F5] px-4 py-2 text-xs text-gray-600">
              {t.pdfReadOnlyNote}
            </div>

            <div className="min-h-0 flex-1 bg-[#F5F5F5]">
              <PdfFrame
                src={activePdfMagazine.pdfKey}
                title={activePdfMagazine.name.en}
              />
            </div>
          </div>
        </div>
      )}

      {activeMagazine&&(
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{borderColor:LAFAEK.grayMid}}
            >
              <div>
                <h2 className="text-lg font-semibold" style={{color:LAFAEK.green}}>
                  {activeMagazine.name[language]}
                </h2>

                <p className="text-xs text-gray-500">
                  {activeMagazine.code}
                </p>
              </div>

              <button
                type="button"
                onClick={()=>setActiveCode(null)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-gray-100"
              >
                {t.close}
              </button>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-y-auto bg-[#F5F5F5] px-4 py-4">
              <h3 className="text-sm font-semibold" style={{color:LAFAEK.textDark}}>
                {t.sampleHeading}
              </h3>

              {activeMagazine.samplePages&&activeMagazine.samplePages.length>0?(
                <div className="grid gap-3 md:grid-cols-2">
                  {activeMagazine.samplePages.map((src,index)=>(
                    <SamplePreviewCard
                      key={`${activeMagazine.code}-sample-${index}`}
                      src={src}
                      alt={`${activeMagazine.name.en} sample ${index+1}`}
                      pdfNote={t.pdfSampleNote}
                    />
                  ))}
                </div>
              ):(
                <div
                  className="relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border px-4 text-center"
                  style={{borderColor:LAFAEK.grayMid}}
                >
                  <Image
                    src={getSafeImageSrc(activeMagazine.cover)}
                    alt={activeMagazine.name.en}
                    fill
                    className="object-contain opacity-70"
                    unoptimized
                  />

                  <div className="relative z-10 mt-2 inline-block rounded-full bg-black/60 px-3 py-1 text-[11px] text-white">
                    {t.noSamples}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-600">
                {t.sampleNote}
              </p>
            </div>

            <div
              className="flex justify-end gap-2 border-t px-4 py-3"
              style={{borderColor:LAFAEK.grayMid}}
            >
              {activeMagazine.accessType!=="public"&&(
                <Link
                  href="/magazines/apply"
                  className="rounded-lg px-4 py-2 text-sm font-semibold"
                  style={{background:LAFAEK.blue,color:"#fff"}}
                >
                  {t.applyButton}
                </Link>
              )}

              <button
                type="button"
                onClick={()=>setActiveCode(null)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
                style={{borderColor:LAFAEK.grayMid}}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentSeriesInfo&&(
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{borderColor:LAFAEK.grayMid}}
            >
              <h2 className="text-lg font-semibold" style={{color:LAFAEK.green}}>
                {currentSeriesInfo.title}
              </h2>

              <button
                type="button"
                onClick={()=>setInfoSeries(null)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-gray-100"
              >
                {t.close}
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto bg-[#F5F5F5] px-4 py-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {currentSeriesInfo.body}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
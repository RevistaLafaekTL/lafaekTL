"use client";

import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {useLanguage} from "@/lib/LanguageContext";

type StoryType="impact"|"success"|"other";

type ImpactItem={
  id:string;
  titleEn:string;
  titleTet?:string;
  excerptEn:string;
  excerptTet?:string;
  bodyEn?:string;
  bodyTet?:string;
  date:string;
  image?:string;
  images?:string[];
  document?:string;
  storyType?:StoryType;
  order?:number;
  visible?:boolean;
  status?:string;
  [key:string]:any;
};

type ApiResponse={
  ok:boolean;
  items?:any[];
  error?:string;
};

const S3_ORIGIN="https://lafaek-media.s3.ap-southeast-2.amazonaws.com";

function toAssetUrl(src?:string){
  if(!src){return undefined;}
  const clean=src.trim();
  if(!clean){return undefined;}
  if(clean.startsWith("http://")||clean.startsWith("https://")){return clean;}
  return `${S3_ORIGIN}/${clean.replace(/^\/+/,"")}`;
}

// Returns the first piece of text that isn't blank. Used so a story written
// only in Tetun still shows its Tetun text when the site is in English, and
// a story written only in English still shows in Tetun mode.
function pickText(...values:(string|undefined)[]){
  for(const v of values){
    if(typeof v==="string"&&v.trim()){return v;}
  }
  return "";
}

// Shown when a story has no image, or its image fails to load, so every card
// keeps the same shape and no broken-image icon appears.
function ImagePlaceholder(){
  return(
    <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-[#E8F5EE] to-[#EAF2FD]">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#9DB7A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.16-5.16a2.25 2.25 0 013.18 0l5.16 5.16m-1.5-1.5l1.41-1.41a2.25 2.25 0 013.18 0l2.91 2.91M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21zM15.75 8.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
      </svg>
    </div>
  );
}

function normaliseImages(raw:any){
  const rawImages=Array.isArray(raw?.images)
    ? raw.images.filter((img:any)=>typeof img==="string"&&img.trim()).map((img:string)=>img.trim())
    : [];

  const primaryImage=typeof raw?.image==="string"&&raw.image.trim()
    ? raw.image.trim()
    : typeof raw?.imageUrl==="string"&&raw.imageUrl.trim()
    ? raw.imageUrl.trim()
    : rawImages.length>0
    ? rawImages[0]
    : undefined;

  return{
    primaryImage,
    images:rawImages
  };
}

// ── Story type badge ──────────────────────────────────────────────────────────
// Colour choices: impact=blue, success=purple, other=gray
// Both En and Tet labels are bundled here to keep it self-contained.
function StoryTypeBadge({
  type,
  language
}:{
  type?:StoryType;
  language:string;
}){
  if(type==="success"){
    return(
      <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
        {language==="tet"?"Istória Susesu":"Success Story"}
      </span>
    );
  }
  if(type==="other"){
    return(
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
        {language==="tet"?"Seluk":"Other"}
      </span>
    );
  }
  // "impact" or missing — default
  return(
    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
      {language==="tet"?"Istória Impaktu":"Impact Story"}
    </span>
  );
}

export default function ImpactPage(){
  const{language}=useLanguage();
  const L=language==="tet"?"tet":"en";

  const[items,setItems]=useState<ImpactItem[]>([]);
  const[loading,setLoading]=useState<boolean>(true);
  const[error,setError]=useState<string|undefined>();

  const[searchTerm,setSearchTerm]=useState<string>("");
  const[sortMode,setSortMode]=useState<"latest"|"custom"|"az">("latest");
  // Story ids whose image failed to load (missing or deleted from S3)
  const[failedImages,setFailedImages]=useState<Set<string>>(new Set());

  const labels={
    en:{
      heading:"Impact & Success Stories",
      intro:"Read stories of positive change, educational success, community impact and personal journeys from across Timor-Leste.",
      readMore:"Read More",
      untitled:"Untitled story",
      viewPdf:"View PDF",
      shareStory:"Share Your Story",
      searchPlaceholder:"Search impact & success stories...",
      sortLabel:"Sort by",
      sortLatest:"Latest first",
      sortAZ:"Title A–Z",
      sortCustom:"Editor order (featured first)",
      morePhotos:(n:number)=>`+ ${n} more photos`,
      noItems:"No impact or success stories available yet.",
      loading:"Loading impact & success stories...",
      errorTitle:"Could not load impact & success stories."
    },
    tet:{
      heading:"Istória kona-ba ami-nia Impaktu",
      intro:"Revista Lafaek ninia impaktu ba kanorin, manorin no komunidade sira.",
      readMore:"Lee liu tan",
      untitled:"Istória la iha títulu",
      viewPdf:"Haree PDF",
      shareStory:"Fahe Ita-nia Istória",
      searchPlaceholder:"Buka istória impaktu no suksesu...",
      sortLabel:"Ordena tuir",
      sortLatest:"Foun liu ba leten",
      sortAZ:"Titulu A–Z",
      sortCustom:"Orden editór (artigu destakadu leten)",
      morePhotos:(n:number)=>`+ foto seluk ${n}`,
      noItems:"Seidauk iha istória impaktu ka suksesu disponivel.",
      loading:"Hein hela istória impaktu no suksesu sira...",
      errorTitle:"La konsege karrega istória impaktu no suksesu sira."
    }
  }[L];

  useEffect(()=>{
    const load=async()=>{
      try{
        setLoading(true);
        setError(undefined);

        const res=await fetch("/api/impact",{cache:"no-store"});
        const text=await res.text();

        let data:ApiResponse;
        try{
          data=JSON.parse(text) as ApiResponse;
        }catch{
          throw new Error(`Expected JSON but got: ${text.slice(0,200)}`);
        }

        if(!res.ok){
          throw new Error(data.error||`Failed to load impact stories: ${res.status}`);
        }

        if(!data.ok){
          throw new Error(data.error||"Unknown error from Impact API");
        }

        const normalised:ImpactItem[]=(data.items||[])
          .map((raw:any,index:number)=>{
            const id=typeof raw.id==="string"&&raw.id.trim()
              ? raw.id.trim()
              : `impact-${index}`;

            const visible=raw.visible!==false;

            const titleEn=typeof raw.titleEn==="string"?raw.titleEn:"";
            const titleTet=typeof raw.titleTet==="string"?raw.titleTet:undefined;

            const excerptEn=typeof raw.excerptEn==="string"?raw.excerptEn:"";
            const excerptTet=typeof raw.excerptTet==="string"?raw.excerptTet:undefined;

            const bodyEn=typeof raw.bodyEn==="string"?raw.bodyEn:undefined;
            const bodyTet=typeof raw.bodyTet==="string"?raw.bodyTet:undefined;

            const date=String(raw.date??"");

            const{primaryImage,images}=normaliseImages(raw);

            let pdfRaw=(raw.document
              ??raw.pdfKey
              ??raw.pdf
              ??raw.pdfUrl
              ??raw.pdfFile
              ??raw.pdfPath)as string|undefined;

            if(!pdfRaw){
              const pdfFromAny=Object.values(raw).find((value)=>{
                return typeof value==="string"
                  && value.trim().toLowerCase().endsWith(".pdf");
              }) as string|undefined;
              pdfRaw=pdfFromAny;
            }

            const document=typeof pdfRaw==="string"&&pdfRaw.trim()
              ? pdfRaw.trim()
              : undefined;

            const order=typeof raw.order==="number"?raw.order:index+1;

            // Normalise storyType — default to "impact" for legacy items
            const rawType=raw.storyType;
            const storyType:StoryType=
              rawType==="success"||rawType==="other"
                ?rawType
                :"impact";

            return{
              ...raw,
              id,
              visible,
              titleEn,
              titleTet,
              excerptEn,
              excerptTet,
              bodyEn,
              bodyTet,
              date,
              image:primaryImage,
              images,
              document,
              storyType,
              order
            } as ImpactItem;
          })
          .filter((item)=>item.visible!==false);

        setItems(normalised);
      }catch(err:any){
        setError(err.message||"Error loading impact stories");
      }finally{
        setLoading(false);
      }
    };

    load();
  },[]);

  const getDisplayTitle=(item:ImpactItem)=>{
    const base=L==="tet"
      ? pickText(item.titleTet,item.titleEn)
      : pickText(item.titleEn,item.titleTet);
    return base.toLowerCase();
  };

  const filteredAndSortedItems=useMemo(()=>{
    let list=[...items];

    const term=searchTerm.trim().toLowerCase();
    if(term){
      list=list.filter((item)=>{
        const fields=[
          item.titleEn,
          item.titleTet,
          item.excerptEn,
          item.excerptTet,
          item.bodyEn,
          item.bodyTet
        ]
          .filter(Boolean)
          .map((f)=>String(f).toLowerCase());

        return fields.some((f)=>f.includes(term));
      });
    }

    list.sort((a,b)=>{
      const da=a.date?new Date(a.date).getTime():0;
      const db=b.date?new Date(b.date).getTime():0;
      const oa=a.order??0;
      const ob=b.order??0;

      if(sortMode==="latest"){
        if(da!==db){return db-da;}
        if(oa!==ob){return oa-ob;}
        return getDisplayTitle(a).localeCompare(getDisplayTitle(b));
      }

      if(sortMode==="custom"){
        if(oa!==ob){return oa-ob;}
        if(da!==db){return db-da;}
        return getDisplayTitle(a).localeCompare(getDisplayTitle(b));
      }

      return getDisplayTitle(a).localeCompare(getDisplayTitle(b));
    });

    return list;
  },[items,searchTerm,sortMode]);

  return(
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-[#333333]">
              {labels.heading}
            </h1>
            <p className="mt-3 max-w-3xl text-[#4F4F4F]">
              {labels.intro}
            </p>
          </div>
          <Link
            href="/stories/impact/submit"
            className="inline-flex items-center justify-center rounded-lg bg-[#219653] px-5 py-3 font-semibold text-white shadow-sm hover:bg-[#1b7f45]"
          >
            {labels.shareStory}
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            value={searchTerm}
            onChange={(e)=>setSearchTerm(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-[#2F80ED] focus:outline-none md:max-w-md"
          />

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#4F4F4F]">{labels.sortLabel}</label>
            <select
              value={sortMode}
              onChange={(e)=>setSortMode(e.target.value as "latest"|"custom"|"az")}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-[#2F80ED] focus:outline-none"
            >
              <option value="latest">{labels.sortLatest}</option>
              <option value="custom">{labels.sortCustom}</option>
              <option value="az">{labels.sortAZ}</option>
            </select>
          </div>
        </div>

        {loading&&(
          <div className="rounded-2xl bg-white p-8 text-center text-[#4F4F4F] shadow-sm">
            {labels.loading}
          </div>
        )}

        {error&&!loading&&(
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <p className="font-semibold">{labels.errorTitle}</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        )}

        {!loading&&!error&&filteredAndSortedItems.length===0&&(
          <div className="rounded-2xl bg-white p-8 text-center text-[#4F4F4F] shadow-sm">
            {labels.noItems}
          </div>
        )}

        {!loading&&!error&&filteredAndSortedItems.length>0&&(
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredAndSortedItems.map((item)=>{
              const title=(L==="tet"
                ? pickText(item.titleTet,item.titleEn)
                : pickText(item.titleEn,item.titleTet))||labels.untitled;

              const excerpt=L==="tet"
                ? pickText(item.excerptTet,item.excerptEn)
                : pickText(item.excerptEn,item.excerptTet);

              const primaryImageUrl=failedImages.has(item.id)?undefined:toAssetUrl(item.image);
              const galleryImages=(item.images||[])
                .map((img)=>toAssetUrl(img))
                .filter(Boolean) as string[];

              const extraPhotoCount=Math.max(galleryImages.length-1,0);
              const pdfUrl=toAssetUrl(item.document);

              return(
                <article
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {primaryImageUrl?(
                    <div className="relative h-56 w-full bg-gray-100">
                      <Image
                        src={primaryImageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        onError={()=>{
                          setFailedImages((prev)=>{
                            const next=new Set(prev);
                            next.add(item.id);
                            return next;
                          });
                        }}
                      />
                    </div>
                  ):(
                    <ImagePlaceholder/>
                  )}

                  <div className="flex flex-1 flex-col p-5">
                    {/* ── Date + type badge row ───────────────────────────── */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#828282]">{item.date}</span>
                      <StoryTypeBadge type={item.storyType} language={L}/>
                    </div>

                    <h2 className="mt-2 text-xl font-bold text-[#333333]">{title}</h2>

                    {excerpt&&(
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#4F4F4F]">{excerpt}</p>
                    )}

                    <div className="mt-auto pt-5">
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/stories/impact/${item.id}`}
                          className="rounded-lg bg-[#2F80ED] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                        >
                          {labels.readMore}
                        </Link>

                        {pdfUrl&&(
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-[#219653] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b7f45]"
                          >
                            {labels.viewPdf}
                          </a>
                        )}
                      </div>

                      {extraPhotoCount>0&&(
                        <div className="mt-4 text-xs font-medium text-[#828282]">
                          {labels.morePhotos(extraPhotoCount)}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
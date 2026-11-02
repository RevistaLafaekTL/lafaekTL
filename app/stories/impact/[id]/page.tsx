// app/stories/impact/[id]/page.tsx
"use client";

import {useEffect,useState}from "react";
import {useParams}from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {useLanguage}from "@/lib/LanguageContext";

const S3_ORIGIN="https://lafaek-media.s3.ap-southeast-2.amazonaws.com";

type ApiResponse={
  ok:boolean;
  items:any[];
  error?:string;
};

type ImpactItem={
  id:string;
  slug?:string;
  titleEn:string;
  titleTet?:string;
  excerptEn:string;
  excerptTet?:string;
  bodyEn?:string;
  bodyTet?:string;
  date:string;
  image?:string;
  images?:string[];
  visible?:boolean;
  externalUrl?:string;
  order?:number;
  document?:string;
  [key:string]:any;
};

const buildImageUrl=(src?:string)=>{
  if(!src){
    return"/placeholder.svg?height=300&width=800";
  }
  let clean=src.trim();
  if(clean.startsWith("http://")||clean.startsWith("https://")){
    return clean;
  }
  clean=clean.replace(/^\/+/,"");
  return`${S3_ORIGIN}/${clean}`;
};

const buildFileUrl=(keyOrUrl?:string)=>{
  if(!keyOrUrl){return"";}
  let clean=keyOrUrl.trim();
  if(clean.startsWith("http://")||clean.startsWith("https://")){
    return clean;
  }
  clean=clean.replace(/^\/+/,"");
  return`${S3_ORIGIN}/${clean}`;
};

// Returns the first piece of text that isn't blank. Used so a story written
// only in Tetun still shows its Tetun text when the site is in English, and
// a story written only in English still shows in Tetun mode.
function pickText(...values:(string|undefined)[]){
  for(const v of values){
    if(typeof v==="string"&&v.trim()){return v;}
  }
  return "";
}

export default function ImpactDetailPage(){
  const params=useParams();
  const rawId=(params as any)?.id;
  const id=Array.isArray(rawId)?rawId[0]:rawId;

  const{language}=useLanguage();
  const L=language==="tet"?"tet":"en";

  const[item,setItem]=useState<ImpactItem|undefined>();
  const[loading,setLoading]=useState<boolean>(true);
  const[error,setError]=useState<string|undefined>();
  // True if the story's image fails to load (missing or deleted from S3)
  const[heroFailed,setHeroFailed]=useState<boolean>(false);

  const labels={
    en:{
      back:"← Back to Impact Stories",
      untitled:"Untitled story",
      noText:"No detailed text has been added for this story yet.",
      openPdf:"Open Full Impact Story (PDF)"
    },
    tet:{
      back:"← Fila fali ba Istória Impaktu",
      untitled:"Istória la iha títulu",
      noText:"Seidauk iha testu detalladu ba istória ida-ne'e.",
      openPdf:"Loke Istória Impaktu Kompletu (PDF)"
    }
  }[L];

  useEffect(()=>{
    const load=async()=>{
      if(!id){
        setError("Story not found.");
        setLoading(false);
        return;
      }

      try{
        setLoading(true);
        setError(undefined);
        setHeroFailed(false);

        // FIX: was incorrectly calling /api/admin/impact which requires auth,
        // causing a 401 HTML redirect for non-admin visitors → JSON parse error.
        // The public route /api/impact returns only published/visible items.
        const res=await fetch("/api/impact",{cache:"no-store"});
        if(!res.ok){
          throw new Error(`Failed to load impact stories: ${res.status}`);
        }
        const data:ApiResponse=await res.json();
        if(!data.ok){
          throw new Error(data.error||"Unknown error from Impact API");
        }

        const items:ImpactItem[]=(data.items||[]).map((raw:any,index:number)=>{
          const recId=typeof raw.id==="string"&&raw.id.trim()
            ? raw.id.trim()
            : `impact-${index}`;
          const slug=typeof raw.slug==="string"&&raw.slug.trim()?raw.slug.trim():undefined;

          const titleEn=typeof raw.titleEn==="string"?raw.titleEn:"";
          const titleTet=typeof raw.titleTet==="string"?raw.titleTet:undefined;
          const excerptEn=typeof raw.excerptEn==="string"?raw.excerptEn:"";
          const excerptTet=typeof raw.excerptTet==="string"?raw.excerptTet:undefined;
          const bodyEn=typeof raw.bodyEn==="string"?raw.bodyEn:undefined;
          const bodyTet=typeof raw.bodyTet==="string"?raw.bodyTet:undefined;
          const date=String(raw.date??"");

          const rawImages=Array.isArray(raw.images)
            ? raw.images.filter((img:any)=>typeof img==="string"&&img.trim())
            : undefined;

          const primaryImage=typeof raw.image==="string"&&raw.image.trim()
            ? raw.image.trim()
            : typeof raw.imageUrl==="string"&&raw.imageUrl.trim()
            ? raw.imageUrl.trim()
            : rawImages&&rawImages.length>0
            ? rawImages[0]
            : undefined;

          const visible=raw.visible!==false;
          const externalUrl=typeof raw.externalUrl==="string"&&raw.externalUrl.trim()
            ? raw.externalUrl.trim()
            : undefined;
          const order=typeof raw.order==="number"?raw.order:index+1;

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
            })as string|undefined;
            pdfRaw=pdfFromAny;
          }

          const document=typeof pdfRaw==="string"&&pdfRaw.trim()?pdfRaw.trim():undefined;

          return{
            ...raw,
            id:recId,
            slug,
            titleEn,
            titleTet,
            excerptEn,
            excerptTet,
            bodyEn,
            bodyTet,
            date,
            image:primaryImage,
            images:rawImages,
            visible,
            externalUrl,
            order,
            document
          } as ImpactItem;
        });

        const found=items.find((it)=>it.slug===id||it.id===id);

        if(!found||found.visible===false){
          setError("Story not found.");
          setItem(undefined);
        }else{
          setItem(found);
        }
      }catch(err:any){
        console.error("[stories/impact/[id]] load error",err);
        setError(err.message||"Error loading story");
      }finally{
        setLoading(false);
      }
    };

    load();
  },[id]);

  let content;
  if(loading){
    content=(
      <div className="text-center text-sm text-gray-600">
        Loading story...
      </div>
    );
  }else if(error){
    content=(
      <div className="mx-auto max-w-xl rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }else if(!item){
    content=(
      <div className="mx-auto max-w-xl rounded-md border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
        Story not found.
      </div>
    );
  }else{
    const title=(L==="tet"
      ? pickText(item.titleTet,item.titleEn)
      : pickText(item.titleEn,item.titleTet))||labels.untitled;

    const excerpt=L==="tet"
      ? pickText(item.excerptTet,item.excerptEn)
      : pickText(item.excerptEn,item.excerptTet);

    const body=L==="tet"
      ? pickText(item.bodyTet,item.bodyEn)
      : pickText(item.bodyEn,item.bodyTet);

    const heroImage=item.image||(Array.isArray(item.images)&&item.images[0])||undefined;
    const imageSrc=buildImageUrl(heroImage);

    let dateLabel="";
    if(item.date){
      const d=new Date(item.date);
      if(!Number.isNaN(d.getTime())){
        dateLabel=d.toLocaleDateString();
      }
    }

    const hasAnyBody=Boolean(body);
    const hasPdf=Boolean(item.document);

    content=(
      <article className="mx-auto max-w-3xl">
        <header className="mb-6">
          {dateLabel&&(
            <div className="mb-2 text-xs text-gray-500">
              {dateLabel}
            </div>
          )}
          <h1 className="text-3xl font-bold text-blue-900">
            {title}
          </h1>
          {excerpt&&(
            <p className="mt-3 text-gray-700">
              {excerpt}
            </p>
          )}
        </header>

        {heroImage&&!heroFailed&&(
          <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-cover"
              onError={()=>setHeroFailed(true)}
            />
          </div>
        )}

        {hasPdf&&(
          <div className="mt-6">
            <a
              href={buildFileUrl(item.document)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
            >
              📄 {labels.openPdf}
            </a>
          </div>
        )}

        {body&&(
          <div className="prose mt-8 max-w-none text-gray-800 prose-p:mb-3 prose-headings:mt-6">
            {body.split(/\n{2,}/).map((para,index)=>(
              <p key={index}>{para}</p>
            ))}
          </div>
        )}

        {!hasPdf&&!hasAnyBody&&(
          <p className="mt-6 rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            {labels.noText}
          </p>
        )}
      </article>
    );
  }

  return(
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-4">
          <Link
            href="/stories/impact"
            className="text-sm font-medium text-[#219653] hover:underline"
          >
            {labels.back}
          </Link>
        </div>
        {content}
      </main>
    </div>
  );
}
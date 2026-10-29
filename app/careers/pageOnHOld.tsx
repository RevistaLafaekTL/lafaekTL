"use client";

import {useEffect,useMemo,useRef,useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {createPortal} from "react-dom";
import {useLanguage} from "@/lib/LanguageContext";
import {
  Briefcase,
  MapPin,
  Clock,
  Building2,
  X,
  Download,
  Mail,
  Images,
  FileText,
  AlertTriangle,
  Search,
  Filter,
  HeartHandshake,
  Send,
  Loader2,
  TriangleAlert,
} from "lucide-react";

type Lang="en"|"tet";
type JobType="Full-time"|"Part-time"|"Contract"|"Internship"|"Volunteer";
type OrgType="CARE"|"Lafaek"|"NGO"|"Private"|"Government"|"Education"|"External";
type JobCategory=
  |"Media & Communications"
  |"Design & Creative"
  |"Education & Training"
  |"Logistics & Operations"
  |"Administration"
  |"Community & Development"
  |"Finance & HR"
  |"Other";

type Attachment={
  label:string;
  url:string;
  type:"doc"|"pdf"|"image"|"other";
};

type Job={
  id:string;
  title:string;
  org:OrgType;
  organizationName:string;
  type:JobType;
  category:JobCategory;
  location:string;
  deadline:string;
  tags:string[];
  summaryEN:string;
  summaryTET:string;
  applyUrl?:string;
  applyEmail?:string;
  emailSubject?:string;
  emailBody?:string;
  heroImage?:string;
  gallery?:string[];
  attachments?:Attachment[];
};

type CareersApiResponse={
  ok:boolean;
  records?:Job[];
  error?:string;
};

type Translations={
  heroTitle:string;
  heroSubtitle:string;
  submitJob:string;
  submitHelp:string;
  introTitle:string;
  introBody:string;
  disclaimerTitle:string;
  disclaimerBody:string;
  search:string;
  filtersTitle:string;
  loading:string;
  loadErrorTitle:string;
  loadErrorBody:string;
  filters:{
    allCategories:string;
    allTypes:string;
    allLocations:string;
    allOrgs:string;
    showCareOnly:string;
    clear:string;
  };
  details:{
    about:string;
    attachments:string;
    gallery:string;
    deadline:string;
    location:string;
    type:string;
    org:string;
    category:string;
    apply:string;
    applyByEmail:string;
    close:string;
    details:string;
  };
  empty:string;
  stats:{available:string};
};

const TRANSLATIONS:Record<Lang,Translations>={
  en:{
    heroTitle:"Careers & Opportunities in Timor-Leste",
    heroSubtitle:
      "Browse selected job, contract, internship, and volunteer opportunities from CARE, Lafaek, NGOs, and public and private organisations in Timor-Leste.",
    submitJob:"Submit a Job",
    submitHelp:"Have a genuine vacancy to share? Submit it for review by our team.",
    introTitle:"About this page",
    introBody:
      "This page shares opportunities we receive or identify from a range of organisations. Listings may include roles from CARE, Lafaek, NGOs, development partners, schools, government-linked organisations, and private companies.",
    disclaimerTitle:"Important notice",
    disclaimerBody:
      "CARE does not take responsibility for the postings, recruitment processes, or legitimacy of third-party job listings. We take care to share opportunities that appear genuine, but applicants should still do their own checks before applying or sharing personal information.",
    search:"Search jobs, organisations, tags, or locations…",
    filtersTitle:"Filter opportunities",
    loading:"Loading opportunities...",
    loadErrorTitle:"Unable to load opportunities",
    loadErrorBody:"Something went wrong while loading the published careers listings.",
    filters:{
      allCategories:"All categories",
      allTypes:"All types",
      allLocations:"All locations",
      allOrgs:"All organisations",
      showCareOnly:"CARE roles only",
      clear:"Clear filters",
    },
    details:{
      about:"About this role",
      attachments:"Attachments",
      gallery:"Gallery",
      deadline:"Deadline",
      location:"Location",
      type:"Type",
      org:"Organisation",
      category:"Category",
      apply:"Apply now",
      applyByEmail:"Apply by email",
      close:"Close",
      details:"Details",
    },
    empty:"No opportunities match your filters yet. Try clearing the filters or searching again.",
    stats:{available:"Current listings"},
  },
  tet:{
    heroTitle:"Karreira no Oportunidade sira iha Timor-Leste",
    heroSubtitle:
      "Haree oportunidade servisu, kontratu, estajiu no voluntáriu sira hosi CARE, Lafaek, ONG, no organizasaun públiku no privadu iha Timor-Leste.",
    submitJob:"Submete Vaga",
    submitHelp:"Ita iha vaga loos ida atu fahe? Submete ba ami-nia ekipa atu revee uluk.",
    introTitle:"Kona-ba pájina ida ne'e",
    introBody:
      "Pájina ida ne'e fahe oportunidade sira ne'ebé ami simu ka hetan hosi organizasaun oioin. Lista sira bele inklui vaga hosi CARE, Lafaek, ONG, parseria dezenvolvimentu, eskola, organizasaun públiku, no kompanhia privadu.",
    disclaimerTitle:"Avizu importante",
    disclaimerBody:
      "CARE la simu responsabilidade ba anúnsiu servisu, prosesu rekrutamentu, ka validade hosi lista servisu husi entidade seluk. Ami halo kuidadu atu fahe oportunidade ne'ebé haree hanesan loos, maibé kandidatu sira presiza halo verifikasaun rasik antes aplika ka fó informasaun pesoál.",
    search:"Buka servisu, organizasaun, tag ka fatin…",
    filtersTitle:"Deskobre oportunidade sira",
    loading:"Karga oportunidade sira hela...",
    loadErrorTitle:"La konsege karga oportunidade sira",
    loadErrorBody:"Iha problema ida bainhira karga lista karreira publika sira.",
    filters:{
      allCategories:"Kategoria hotu",
      allTypes:"Tipu hotu",
      allLocations:"Fatin hotu",
      allOrgs:"Organizasaun hotu",
      showCareOnly:"De'it vaga CARE",
      clear:"Hamoos filtru sira",
    },
    details:{
      about:"Kona-ba kargu ida ne'e",
      attachments:"Dokumentu sira",
      gallery:"Galeria",
      deadline:"Data remata",
      location:"Fatin",
      type:"Tipu",
      org:"Organizasaun",
      category:"Kategoria",
      apply:"Aplika agora",
      applyByEmail:"Aplika liu hosi email",
      close:"Taka",
      details:"Detallu",
    },
    empty:"Seidauk iha oportunidade ne'ebé tuir ho ita-nia filtru sira. Kokorek hamoos filtru ka buka fali.",
    stats:{available:"Lista atual sira"},
  },
};

function formatDeadline(isoDate:string,lang:Lang){
  try{
    return new Intl.DateTimeFormat(lang==="tet"?"pt-TL":"en-GB",{
      day:"numeric",
      month:"long",
      year:"numeric",
    }).format(new Date(isoDate));
  }catch{
    return isoDate;
  }
}

function buildMailtoHref(email:string,subject="",body=""){
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function useFocusTrap(active:boolean){
  const containerRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    if(!active||!containerRef.current) return;

    const container=containerRef.current;
    const focusable=container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first=focusable[0];
    const last=focusable[focusable.length-1];

    first?.focus();

    function onKeyDown(e:KeyboardEvent){
      if(e.key!=="Tab") return;
      if(focusable.length===0){
        e.preventDefault();
        return;
      }

      if(e.shiftKey){
        if(document.activeElement===first){
          e.preventDefault();
          last?.focus();
        }
      }else{
        if(document.activeElement===last){
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown",onKeyDown);
    return()=>document.removeEventListener("keydown",onKeyDown);
  },[active]);

  return containerRef;
}

function ApplyButton({
  job,
  labels,
  fullWidth=false,
}:{
  job:Job;
  labels:{apply:string;applyByEmail:string};
  fullWidth?:boolean;
}){
  const cls=`inline-flex items-center justify-center gap-2 rounded-full bg-[#EB5757] px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition ${fullWidth?"w-full":""}`;

  if(job.applyUrl){
    return(
      <Link
        href={job.applyUrl}
        target={job.applyUrl.startsWith("http")?"_blank":"_self"}
        rel={job.applyUrl.startsWith("http")?"noopener noreferrer":undefined}
        className={cls}
      >
        {labels.apply}
      </Link>
    );
  }

  if(job.applyEmail){
    return(
      <a
        href={buildMailtoHref(job.applyEmail,job.emailSubject,job.emailBody)}
        className={cls}
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
        {labels.applyByEmail}
      </a>
    );
  }

  return null;
}

function JobModal({
  job,
  lang,
  text,
  onClose,
  triggerRef,
}:{
  job:Job;
  lang:Lang;
  text:Translations;
  onClose:()=>void;
  triggerRef:React.RefObject<HTMLButtonElement|null>;
}){
  const modalRef=useFocusTrap(true);

  useEffect(()=>{
    function onKey(e:KeyboardEvent){
      if(e.key==="Escape") onClose();
    }
    document.addEventListener("keydown",onKey);
    return()=>document.removeEventListener("keydown",onKey);
  },[onClose]);

  useEffect(()=>{
    return()=>{triggerRef.current?.focus();};
  },[triggerRef]);

  useEffect(()=>{
    document.body.style.overflow="hidden";
    return()=>{document.body.style.overflow="";};
  },[]);

  const summary=lang==="tet"?job.summaryTET:job.summaryEN;

  return createPortal(
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={job.title}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e)=>e.stopPropagation()}
      >
        {job.heroImage&&(
          <div className="flex w-full justify-center bg-[#F5F5F5]">
            <Image
              src={job.heroImage}
              alt={`${job.title} — hero image`}
              width={1600}
              height={900}
              sizes="(max-width:896px) 100vw, 896px"
              className="h-auto max-h-[60vh] w-full object-contain"
            />
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 shadow hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#219653]"
          aria-label={text.details.close}
        >
          <X className="h-5 w-5 text-[#4F4F4F]" aria-hidden="true" />
        </button>

        <div className="grid md:grid-cols-5">
          <aside className="border-r border-gray-200 bg-gray-50 p-6 md:col-span-2">
            <h3 className="text-lg font-bold text-[#333333]">{job.title}</h3>

            <dl className="mt-4 space-y-2 text-sm text-[#4F4F4F]">
              {([
                [text.details.org,job.organizationName],
                [text.details.type,job.type],
                [text.details.category,job.category],
                [text.details.location,job.location],
                [text.details.deadline,formatDeadline(job.deadline,lang)],
              ] as [string,string][]).map(([label,value])=>(
                <div key={label} className="flex gap-1">
                  <dt className="shrink-0 font-semibold">{label}:</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            {job.attachments&&job.attachments.length>0&&(
              <>
                <h4 className="mt-5 mb-2 flex items-center gap-2 text-sm font-semibold text-[#333333]">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  {text.details.attachments}
                </h4>
                <ul className="space-y-2">
                  {job.attachments.map((a)=>(
                    <li key={a.url}>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#219653]"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        {a.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-5">
              <ApplyButton
                job={job}
                labels={{apply:text.details.apply,applyByEmail:text.details.applyByEmail}}
                fullWidth
              />
            </div>
          </aside>

          <section className="p-6 md:col-span-3">
            <h4 className="text-base font-semibold text-blue-700">{text.details.about}</h4>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-[#4F4F4F]">{summary}</p>

            {job.gallery&&job.gallery.length>0&&(
              <>
                <h5 className="mt-6 mb-3 flex items-center gap-2 text-sm font-semibold text-[#333333]">
                  <Images className="h-4 w-4" aria-hidden="true" />
                  {text.details.gallery}
                </h5>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {job.gallery.map((src,i)=>(
                    <div
                      key={src}
                      className="relative h-28 w-full overflow-hidden rounded-lg"
                    >
                      <Image
                        src={src}
                        alt={`${job.title} — image ${i+1} of ${job.gallery!.length}`}
                        fill
                        sizes="(max-width:768px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
}

function JobCard({
  job,
  lang,
  text,
  onDetailsClick,
  detailsButtonRef,
}:{
  job:Job;
  lang:Lang;
  text:Translations;
  onDetailsClick:(id:string)=>void;
  detailsButtonRef:(el:HTMLButtonElement|null)=>void;
}){
  const summary=lang==="tet"?job.summaryTET:job.summaryEN;

  return(
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {job.heroImage?(
        <div className="relative h-44 w-full bg-[#F5F5F5]">
          <Image
            src={job.heroImage}
            alt={`${job.title} — banner`}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-contain"
          />
        </div>
      ):(
        <div className="flex h-44 items-center justify-center bg-[#EAF7EF]" aria-hidden="true">
          <Briefcase className="h-12 w-12 text-[#219653]" />
        </div>
      )}

      <div className="p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-[#219653] px-3 py-1 text-xs font-semibold text-white">
            <Building2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            {job.organizationName}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#F2C94C] px-3 py-1 text-xs font-semibold text-[#4F4F4F]">
            <Briefcase className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            {job.type}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-[#4F4F4F]">
            <MapPin className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            {job.location}
          </span>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2F80ED]">
            {job.category}
          </span>
        </div>

        <h3 className="text-xl font-bold text-[#333333]">{job.title}</h3>
        <p className="mt-2 line-clamp-3 text-[#4F4F4F]">{summary}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {job.tags.map((tag)=>(
            <span
              key={tag}
              className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-[#4F4F4F]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="mr-1.5 h-4 w-4" aria-hidden="true" />
            <span>
              {text.details.deadline}:{" "}
              <span className="font-semibold">{formatDeadline(job.deadline,lang)}</span>
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              ref={detailsButtonRef}
              onClick={()=>onDetailsClick(job.id)}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm text-[#4F4F4F] hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#219653]"
            >
              {text.details.details}
            </button>
            <ApplyButton
              job={job}
              labels={{apply:text.details.apply,applyByEmail:text.details.applyByEmail}}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CareersPage(){
  const {language}=useLanguage() as {language:Lang;setLanguage:(l:Lang)=>void};
  const text=TRANSLATIONS[language];

  const [jobs,setJobs]=useState<Job[]>([]);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState("");

  const [query,setQuery]=useState("");
  const [category,setCategory]=useState<""|JobCategory>("");
  const [type,setType]=useState<""|JobType>("");
  const [location,setLocation]=useState("");
  const [orgFilter,setOrgFilter]=useState<""|OrgType>("");
  const [careOnly,setCareOnly]=useState(false);

  const [activeId,setActiveId]=useState<string|null>(null);

  const detailsButtonRefs=useRef<Map<string,HTMLButtonElement|null>>(new Map());
  const triggerRef=useRef<HTMLButtonElement|null>(null);

  useEffect(()=>{
    let cancelled=false;

    async function loadJobs(){
      setLoading(true);
      setLoadError("");

      try{
        const response=await fetch("/api/careers",{
          method:"GET",
          cache:"no-store",
        });

        const data=(await response.json()) as CareersApiResponse;

        if(!response.ok||!data.ok){
          throw new Error(data.error||"Failed to load careers.");
        }

        if(!cancelled){
          setJobs(data.records??[]);
        }
      }catch(error:any){
        if(!cancelled){
          setLoadError(error?.message||text.loadErrorBody);
          setJobs([]);
        }
      }finally{
        if(!cancelled){
          setLoading(false);
        }
      }
    }

    loadJobs();

    return()=>{
      cancelled=true;
    };
  },[text.loadErrorBody]);

  const locations=useMemo(
    ()=>Array.from(new Set(jobs.map((j)=>j.location))).sort(),
    [jobs]
  );
  const categories=useMemo(
    ()=>Array.from(new Set(jobs.map((j)=>j.category))).sort(),
    [jobs]
  );
  const types=useMemo(
    ()=>Array.from(new Set(jobs.map((j)=>j.type))).sort(),
    [jobs]
  );
  const orgs=useMemo(
    ()=>Array.from(new Set(jobs.map((j)=>j.org))).sort(),
    [jobs]
  );

  function handleCareOnly(checked:boolean){
    setCareOnly(checked);
    if(checked) setOrgFilter("");
  }

  function handleOrgFilter(value:""|OrgType){
    setOrgFilter(value);
    if(value) setCareOnly(false);
  }

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();

    return jobs.filter((j)=>{
      if(careOnly&&j.org!=="CARE") return false;
      if(category&&j.category!==category) return false;
      if(type&&j.type!==type) return false;
      if(location&&j.location!==location) return false;
      if(orgFilter&&j.org!==orgFilter) return false;
      if(!q) return true;

      return [
        j.title,
        j.organizationName,
        j.location,
        j.type,
        j.category,
        j.org,
        ...j.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  },[jobs,careOnly,category,type,location,orgFilter,query]);

  const activeJob=useMemo(
    ()=>filtered.find((j)=>j.id===activeId)??null,
    [filtered,activeId]
  );

  useEffect(()=>{
    if(activeId&&!activeJob){
      setActiveId(null);
    }
  },[activeId,activeJob]);

  function clearFilters(){
    setQuery("");
    setCategory("");
    setType("");
    setLocation("");
    setOrgFilter("");
    setCareOnly(false);
  }

  function openModal(id:string){
    triggerRef.current=detailsButtonRefs.current.get(id)??null;
    setActiveId(id);
  }

  const selectClass=
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-[#2F80ED] focus:outline-none";

  return(
    <div className="flex min-h-screen flex-col bg-white">
      <header className="bg-[#F2C94C]">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#333333] md:text-5xl">
                {text.heroTitle}
              </h1>
              <p className="mt-3 max-w-3xl text-base text-[#4F4F4F] md:text-lg">
                {text.heroSubtitle}
              </p>
              <p className="mt-3 text-sm text-[#4F4F4F]">{text.submitHelp}</p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <div
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#219653] px-4 py-3 text-sm font-semibold text-white shadow"
                aria-live="polite"
                aria-atomic="true"
              >
                <Briefcase className="h-4 w-4" aria-hidden="true" />
                {text.stats.available}: {filtered.length}
              </div>

              <Link
                href="/careers/submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EB5757] px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {text.submitJob}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 py-6" aria-label="About this page">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#219653]">
              <HeartHandshake className="h-5 w-5" aria-hidden="true" />
              <h2 className="text-lg font-bold text-[#333333]">{text.introTitle}</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-[#4F4F4F]">{text.introBody}</p>
          </div>

          <div className="rounded-2xl border border-[#F2C94C] bg-[#FFF9E8] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#EB5757]">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              <h2 className="text-lg font-bold text-[#333333]">{text.disclaimerTitle}</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-[#4F4F4F]">{text.disclaimerBody}</p>
          </div>
        </div>
      </section>
{/* ── Job Seeker Help ── */}
<section className="mx-auto w-full max-w-7xl px-4 pb-6">
  <div className="rounded-2xl border border-[#2F80ED] bg-[#F0F7FF] p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    
    <div className="max-w-2xl">
      <h2 className="text-lg font-bold text-[#333333]">
        {language==="tet"?"Ajuda ba Buka Servisu":"Job Seeker Help"}
      </h2>

      <p className="mt-2 text-sm text-[#4F4F4F]">
        {language==="tet"
          ?"Dalan prátiku atu prepara CV, cover letter, entrevista, no harii esperiénsia maski vaga seidauk iha."
          :"Practical advice for CVs, cover letters, interviews, portfolios, and how to find work even when no jobs are listed."}
      </p>
    </div>

    <Link
      href="/careers/job-help"
      className="inline-flex items-center justify-center rounded-full bg-[#2F80ED] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition"
    >
      {language==="tet"?"Haree ajuda":"Get job search help"}
    </Link>

  </div>
</section>
      <section
        className="mx-auto w-full max-w-7xl px-4 pb-6"
        aria-label={text.filtersTitle}
      >
        <div className="rounded-2xl border border-gray-200 bg-[#F5F5F5] p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#219653]" aria-hidden="true" />
              <h2 className="text-base font-bold text-[#333333]">{text.filtersTitle}</h2>
            </div>

            <Link
              href="/careers/submit"
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#219653] bg-white px-4 py-2 text-sm font-medium text-[#219653] transition hover:bg-[#EAF7EF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#219653]"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {text.submitJob}
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="xl:col-span-2">
              <label htmlFor="job-search" className="sr-only">{text.search}</label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="job-search"
                  type="search"
                  value={query}
                  onChange={(e)=>setQuery(e.target.value)}
                  placeholder={text.search}
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 shadow-sm focus:border-[#2F80ED] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="filter-category" className="sr-only">{text.filters.allCategories}</label>
              <select
                id="filter-category"
                value={category}
                onChange={(e)=>setCategory(e.target.value as JobCategory|"")}
                className={selectClass}
              >
                <option value="">{text.filters.allCategories}</option>
                {categories.map((item)=>(
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-type" className="sr-only">{text.filters.allTypes}</label>
              <select
                id="filter-type"
                value={type}
                onChange={(e)=>setType(e.target.value as JobType|"")}
                className={selectClass}
              >
                <option value="">{text.filters.allTypes}</option>
                {types.map((item)=>(
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-location" className="sr-only">{text.filters.allLocations}</label>
              <select
                id="filter-location"
                value={location}
                onChange={(e)=>setLocation(e.target.value)}
                className={selectClass}
              >
                <option value="">{text.filters.allLocations}</option>
                {locations.map((item)=>(
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label htmlFor="filter-org" className="sr-only">{text.filters.allOrgs}</label>
              <select
                id="filter-org"
                value={orgFilter}
                onChange={(e)=>handleOrgFilter(e.target.value as OrgType|"")}
                className={selectClass}
              >
                <option value="">{text.filters.allOrgs}</option>
                {orgs.map((item)=>(
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="xl:col-span-2 flex items-center">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={careOnly}
                  onChange={(e)=>handleCareOnly(e.target.checked)}
                  className="h-4 w-4 accent-[#219653]"
                />
                <span className="text-sm text-[#4F4F4F]">{text.filters.showCareOnly}</span>
              </label>
            </div>

            <div className="xl:col-span-2 flex justify-start xl:justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-[#4F4F4F] hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#219653]"
              >
                {text.filters.clear}
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16">
        {loading?(
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center text-gray-600">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#219653]" />
            <p className="mt-4">{text.loading}</p>
          </div>
        ):loadError?(
          <div className="rounded-2xl border border-[#EB5757] bg-[#FFF1F1] p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 h-5 w-5 text-[#EB5757]" />
              <div>
                <p className="font-semibold text-[#B42318]">{text.loadErrorTitle}</p>
                <p className="mt-1 text-sm text-[#B42318]">{loadError||text.loadErrorBody}</p>
              </div>
            </div>
          </div>
        ):filtered.length===0?(
          <div
            className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center text-gray-600"
            role="status"
          >
            {text.empty}
          </div>
        ):(
          <div
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            role="list"
            aria-label={text.stats.available}
          >
            {filtered.map((j)=>(
              <div key={j.id} role="listitem">
                <JobCard
                  job={j}
                  lang={language}
                  text={text}
                  onDetailsClick={openModal}
                  detailsButtonRef={(el)=>detailsButtonRefs.current.set(j.id,el)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {activeJob&&(
        <JobModal
          job={activeJob}
          lang={language}
          text={text}
          onClose={()=>setActiveId(null)}
          triggerRef={triggerRef}
        />
      )}
    </div>
  );
}
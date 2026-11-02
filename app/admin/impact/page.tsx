//app/admin/impact/page.tsx
"use client";

import {useEffect,useLayoutEffect,useMemo,useRef,useState,ChangeEvent}from "react";
import {createPortal}from "react-dom";
import Link from "next/link";
import {getUserDisplayName,getUserEmail}from "@/lib/auth";

const S3_ORIGIN="https://lafaek-media.s3.ap-southeast-2.amazonaws.com";

type ImpactStatus="draft"|"published"|"hidden"|"archived";

type ImpactItem={
  id:string;
  status?:ImpactStatus;
  order:number;
  visible:boolean;
  titleEn:string;
  titleTet:string;
  excerptEn:string;
  excerptTet:string;
  bodyEn:string;
  bodyTet:string;
  date:string;
  image?:string;
  imageUrl?:string;
  document?:string;
  createdAt?:string;
  createdBy?:{sub?:string;email?:string;fullName?:string};
  updatedAt?:string;
  updatedBy?:{sub?:string;email?:string;fullName?:string};
  updatedByGroups?:string[];
  submittedBy?:{fullName?:string;email?:string;phone?:string};
  draft?:{storySummary?:string};
  location?:{suco?:string;municipality?:string};
  [key:string]:any;
};

type ApiResponse={
  ok:boolean;
  items:any[];
  error?:string;
};

type PresignResponse={
  url:string;
  fields:Record<string,string>;
  key?:string;
  publicUrl?:string;
  error?:string;
};

const buildImageUrl=(src?:string)=>{
  if(!src){return"";}
  let clean=src.trim();
  if(clean.startsWith(S3_ORIGIN)){return clean;}
  if(clean.startsWith("http://")||clean.startsWith("https://")){return clean;}
  clean=clean.replace(/^\/+/,"");
  return`${S3_ORIGIN}/${clean}`;
};

const buildFileUrl=(src?:string)=>{
  if(!src){return"";}
  let clean=src.trim();
  if(clean.startsWith("http://")||clean.startsWith("https://")||clean.startsWith(S3_ORIGIN)){return clean;}
  clean=clean.replace(/^\/+/,"");
  return`${S3_ORIGIN}/${clean}`;
};

const emptyItem=():ImpactItem=>({
  id:`impact-temp-${Date.now()}`,
  status:"hidden",
  order:0,
  visible:false,
  titleEn:"",
  titleTet:"",
  excerptEn:"",
  excerptTet:"",
  bodyEn:"",
  bodyTet:"",
  date:new Date().toISOString().slice(0,10),
  image:"",
  document:"",
});

function safeStatus(raw:any):ImpactStatus{
  const s=typeof raw?.status==="string"?raw.status.trim().toLowerCase():"";
  if(s==="draft"||s==="published"||s==="hidden"||s==="archived"){return s;}
  const vis=typeof raw?.visible==="boolean"?raw.visible:true;
  return vis?"published":"hidden";
}

function getStatusLabel(status:ImpactStatus){
  if(status==="draft"){return"Draft Submission";}
  if(status==="archived"){return"Archived";}
  if(status==="published"){return"Published Item";}
  return"Hidden Item";
}

function getStatusClasses(status:ImpactStatus){
  if(status==="draft"){return"border-amber-200 bg-amber-50 text-amber-900";}
  if(status==="published"){return"border-emerald-200 bg-emerald-50 text-emerald-900";}
  if(status==="archived"){return"border-slate-300 bg-slate-100 text-slate-700";}
  return"border-blue-200 bg-blue-50 text-blue-900";
}

function formatLastUpdated(item:ImpactItem){
  const name=typeof item.updatedBy?.fullName==="string"?item.updatedBy.fullName.trim():"";
  const email=typeof item.updatedBy?.email==="string"?item.updatedBy.email.trim():"";
  const who=name||email;
  const stampRaw=typeof item.updatedAt==="string"?item.updatedAt:"";
  const stamp=stampRaw?new Date(stampRaw).toLocaleString():"";
  if(!who&&!stamp){return"";}
  if(who&&stamp){return`${who} • ${stamp}`;}
  return who||stamp;
}

function getOidcProfile(){
  if(typeof window==="undefined"){return null;}
  try{
    const authority="https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_a70kol0sr";
    const clientId="30g26p9ts1baddag42g747snp3";
    const key=`oidc.user:${authority}:${clientId}`;
    const raw=sessionStorage.getItem(key);
    if(!raw){return null;}
    const parsed=JSON.parse(raw);
    return parsed?.profile||null;
  }catch{return null;}
}

function getUserSub(){
  const p=getOidcProfile();
  return typeof p?.sub==="string"?p.sub:"";
}

function getUserGroups(){
  const p=getOidcProfile();
  const raw=p?.["cognito:groups"];
  if(Array.isArray(raw)){return raw.map((x)=>String(x));}
  if(typeof raw==="string"&&raw.trim()){
    return raw.split(",").map((s)=>s.trim()).filter(Boolean);
  }
  return [];
}

// ── Apply a status+visible change atomically in one setItems call ────────────
// This replaces the double-handleFieldChange pattern in handleArchive /
// handleUnarchive / handlePublish, which caused stale-state overwrites.
function applyStatusChange(
  prev:ImpactItem[],
  id:string,
  status:ImpactStatus,
  visible:boolean
):ImpactItem[]{
  const next=[...prev];
  const index=next.findIndex((i)=>i.id===id);
  if(index===-1){return prev;}
  const current=next[index];
  if(!current){return prev;}
  next[index]={...current,status,visible};
  return next;
}

export default function ImpactAdminPage(){
  const[items,setItems]=useState<ImpactItem[]>([]);
  const[loading,setLoading]=useState<boolean>(true);
  const[error,setError]=useState<string|undefined>();
  const[saving,setSaving]=useState<boolean>(false);
  const[hasChanges,setHasChanges]=useState<boolean>(false);

  const[showAddModal,setShowAddModal]=useState<boolean>(false);
  const[newItem,setNewItem]=useState<ImpactItem>(emptyItem());

  const[uploadingId,setUploadingId]=useState<string|undefined>();
  const[uploadingDocId,setUploadingDocId]=useState<string|undefined>();
  const[message,setMessage]=useState<string>("");

  const[query,setQuery]=useState<string>("");
  const[showKeys,setShowKeys]=useState<boolean>(false);

  const[filterMode,setFilterMode]=useState<"all"|"visible"|"hidden">("all");
  const[dateFrom,setDateFrom]=useState<string>("");
  const[dateTo,setDateTo]=useState<string>("");
  const[sortMode,setSortMode]=useState<"editor"|"latest"|"oldest"|"az">("editor");
  const[onlyWithImage,setOnlyWithImage]=useState<boolean>(false);
  const[onlyWithPdf,setOnlyWithPdf]=useState<boolean>(false);
  const[statusFilter,setStatusFilter]=useState<"all"|ImpactStatus>("all");
  const[dirtyIds,setDirtyIds]=useState<Set<string>>(new Set());
  const[showFilters,setShowFilters]=useState<boolean>(true);
  const[expandedStoryId,setExpandedStoryId]=useState<string|null>(null);

  const stickyRef=useRef<HTMLDivElement>(null);
  const[stickyHeight,setStickyHeight]=useState<number>(0);

  useEffect(()=>{
    const load=async()=>{
      try{
        setLoading(true);
        setError(undefined);
        const res=await fetch("/api/admin/impact",{method:"GET",cache:"no-store"});
        if(!res.ok){throw new Error(`Failed to load impact stories: ${res.status}`);}
        const data:ApiResponse=await res.json();
        if(!data.ok){throw new Error(data.error||"Unknown error from Impact API");}
        const normalised:ImpactItem[]=(data.items||[]).map((raw:any,index:number)=>{
          const rawId=typeof raw.id==="string"?raw.id:"";
          const status=safeStatus(raw);
          const visible=typeof raw.visible==="boolean"?raw.visible:status==="published";
          const item:ImpactItem={
            id:rawId||`impact-item-${index}`,
            status,
            order:typeof raw.order==="number"?raw.order:index+1,
            visible,
            titleEn:(raw.titleEn as string)||"",
            titleTet:(raw.titleTet as string)||"",
            excerptEn:(raw.excerptEn as string)||"",
            excerptTet:(raw.excerptTet as string)||"",
            bodyEn:(raw.bodyEn as string)||"",
            bodyTet:(raw.bodyTet as string)||"",
            date:(raw.date as string)||new Date().toISOString().slice(0,10),
            image:(raw.image as string)||(raw.imageUrl as string)||"",
            imageUrl:(raw.imageUrl as string)||"",
            document:(raw.document as string)||"",
            createdAt:typeof raw.createdAt==="string"?raw.createdAt:undefined,
            createdBy:raw.createdBy,
            updatedAt:typeof raw.updatedAt==="string"?raw.updatedAt:undefined,
            updatedBy:raw.updatedBy,
            updatedByGroups:Array.isArray(raw.updatedByGroups)?raw.updatedByGroups:undefined,
            submittedBy:raw.submittedBy,
            draft:raw.draft,
            location:raw.location,
          };
          return{...raw,...item};
        });
        normalised.sort((a,b)=>(a.order??0)-(b.order??0));
        setItems(normalised);
      }catch(err:any){
        setError(err?.message||"Error loading impact stories");
      }finally{
        setLoading(false);
      }
    };
    void load();
  },[]);

  useEffect(()=>{
    const handleBeforeUnload=(event:BeforeUnloadEvent)=>{
      if(!hasChanges){return;}
      event.preventDefault();
      event.returnValue="";
    };
    window.addEventListener("beforeunload",handleBeforeUnload);
    return()=>window.removeEventListener("beforeunload",handleBeforeUnload);
  },[hasChanges]);

  useEffect(()=>{
    const handleDocumentClick=(event:MouseEvent)=>{
      if(!hasChanges){return;}
      const target=event.target as HTMLElement|null;
      const anchor=target?.closest("a") as HTMLAnchorElement|null;
      if(!anchor){return;}
      const href=anchor.getAttribute("href")||"";
      if(!href||href.startsWith("#")||href.startsWith("javascript:")){return;}
      const isModifiedClick=event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0;
      if(isModifiedClick||anchor.target==="_blank"||anchor.hasAttribute("download")){return;}
      const confirmed=window.confirm("You have unsaved changes. Leave this page and lose them?");
      if(!confirmed){event.preventDefault();event.stopPropagation();}
    };
    document.addEventListener("click",handleDocumentClick,true);
    return()=>document.removeEventListener("click",handleDocumentClick,true);
  },[hasChanges]);

  useLayoutEffect(()=>{
    const el=stickyRef.current;
    if(!el){return;}
    const observer=new ResizeObserver(()=>setStickyHeight(el.offsetHeight));
    observer.observe(el);
    setStickyHeight(el.offsetHeight);
    return()=>observer.disconnect();
  },[showFilters,message,hasChanges]);

  const markChanged=(id?:string)=>{
    if(!hasChanges){setHasChanges(true);}
    if(id){
      setDirtyIds((prev)=>{
        const next=new Set(prev);
        next.add(id);
        return next;
      });
    }
  };

  // ── handleFieldChange ──────────────────────────────────────────────────────
  // FIX: when toggling visible ON for a draft item, promote it to "published".
  // Previously the draft/archived branch did `nextStatus=nextStatus` (no-op),
  // so draft items stayed draft even when the checkbox was ticked.
  const handleFieldChange=(id:string,field:keyof ImpactItem,value:string|boolean|number)=>{
    setItems((prev)=>{
      const next=[...prev];
      const index=next.findIndex((i)=>i.id===id);
      if(index===-1){return prev;}
      const current=next[index];
      if(!current){return prev;}

      if(field==="visible"){
        const vis=Boolean(value);
        const currentStatus=current.status||safeStatus(current);
        let nextStatus:ImpactStatus=currentStatus;

        if(vis){
          // Promote to published regardless of previous status
          // (draft items should be promoted when an admin ticks visible)
          if(currentStatus!=="archived"){
            nextStatus="published";
          }
          // archived items cannot be made visible via checkbox — keep archived
        }else{
          if(currentStatus==="published"){
            nextStatus="hidden";
          }
        }

        next[index]={...current,visible:vis&&nextStatus!=="archived",status:nextStatus};
        return next;
      }

      if(field==="status"){
        const s=value as ImpactStatus;
        next[index]={...current,status:s,visible:s==="published"};
        return next;
      }

      next[index]={...current,[field]:value};
      return next;
    });
    markChanged(id);
  };

  const handleReorder=(id:string,delta:number)=>{
    setItems((prev)=>{
      const next=[...prev];
      const index=next.findIndex((i)=>i.id===id);
      if(index===-1){return prev;}
      const targetIndex=index+delta;
      if(targetIndex<0||targetIndex>=next.length){return prev;}
      const current=next[index];
      const target=next[targetIndex];
      if(!current||!target){return prev;}
      const currentOrder=current.order;
      next[index]={...current,order:target.order};
      next[targetIndex]={...target,order:currentOrder};
      next.sort((a,b)=>(a.order??0)-(b.order??0));
      return next;
    });
    markChanged(id);
    setMessage("Order updated. Click Save Changes.");
  };

  const handleAddNew=()=>{
    setNewItem(emptyItem());
    setShowAddModal(true);
    setMessage("");
    setError(undefined);
  };

  // ── handleAddNewSubmit ─────────────────────────────────────────────────────
  // New stories go to the TOP of the list (order 1) and every existing story
  // moves down one place. The new story is opened automatically and the page
  // scrolls to the top so it can be edited and saved straight away.
  const handleAddNewSubmit=()=>{
    if(!newItem.titleTet.trim()&&!newItem.titleEn.trim()){
      setMessage("Please add a title (Tetun or English) before creating the story.");
      return;
    }
    const newId=`impact-temp-${Date.now()}`;
    setItems((prev)=>{
      const itemToAdd={
        ...newItem,
        id:newId,
        status:newItem.status||"hidden",
        visible:Boolean(newItem.visible),
        order:1,
      } as ImpactItem;
      const shifted=prev.map((i)=>({...i,order:(i.order||0)+1}));
      return[itemToAdd,...shifted];
    });
    setDirtyIds((prev)=>{
      const next=new Set(prev);
      next.add(newId);
      return next;
    });
    setShowAddModal(false);
    setHasChanges(true);
    setSortMode("editor");
    setExpandedStoryId(newId);
    setMessage("Story created at the top of the list. Click Save Changes to save it to AWS.");
    if(typeof window!=="undefined"){window.scrollTo({top:0,behavior:"smooth"});}
  };

  const handleDelete=(id:string)=>{
    if(!window.confirm("Delete this impact story?")){return;}
    setItems((prev)=>prev.filter((i)=>i.id!==id));
    markChanged(id);
    setMessage("Story deleted locally. Click Save Changes to keep it that way.");
  };

  // ── handleArchive / handleUnarchive / handlePublish ────────────────────────
  // FIX: use applyStatusChange (single atomic setItems call) instead of two
  // consecutive handleFieldChange calls, which caused stale-state overwrites.
  const handleArchive=(id:string)=>{
    if(!window.confirm("Archive this story? It will stay in AWS but won't show on the public site.")){return;}
    setItems((prev)=>applyStatusChange(prev,id,"archived",false));
    markChanged(id);
    setMessage("Archived. Click Save Changes.");
  };

  const handleUnarchive=(id:string)=>{
    if(!window.confirm("Unarchive this story? It will return as Hidden until you make it Visible.")){return;}
    setItems((prev)=>applyStatusChange(prev,id,"hidden",false));
    markChanged(id);
    setMessage("Unarchived to Hidden. Click Save Changes.");
  };

  const handlePublish=(id:string)=>{
    if(!window.confirm("Publish this story? It will become visible on the public Impact page after you Save Changes.")){return;}
    setItems((prev)=>applyStatusChange(prev,id,"published",true));
    markChanged(id);
    setMessage("Marked as Published. Click Save Changes.");
  };

  const handleSaveChanges=async()=>{
    try{
      setSaving(true);
      setMessage("");
      setError(undefined);
      const now=new Date().toISOString();
      const fullName=getUserDisplayName();
      const email=getUserEmail();
      const sub=getUserSub();
      const groups=getUserGroups();
      const itemsToSave=items.map((it)=>{
        if(dirtyIds.has(it.id)){
          return{
            ...it,
            updatedAt:now,
            updatedBy:{
              sub:sub||it.updatedBy?.sub||"",
              email:email||it.updatedBy?.email||"",
              fullName:fullName||it.updatedBy?.fullName||"",
            },
            updatedByGroups:groups.length?groups:it.updatedByGroups,
          };
        }
        return it;
      });
      const res=await fetch("/api/admin/impact",{
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({items:itemsToSave}),
      });

      // A 401 response is an HTML redirect page (Cognito session expired),
      // not JSON — attempting to parse it causes the "Unexpected token '<'" error.
      // Detect it early and give a clear message instead of crashing.
      if(res.status===401||res.status===403){
        throw new Error("Your session has expired. Please sign in again, then retry saving.");
      }
      if(!res.ok){throw new Error(`Failed to save: ${res.status}`);}
      const data=await res.json();
      if(!data.ok){throw new Error(data.error||"Unknown error from Impact API");}
      setHasChanges(false);
      setDirtyIds(new Set());
      setMessage("Changes saved successfully.");
    }catch(err:any){
      setError(err?.message||"Error saving changes");
    }finally{
      setSaving(false);
    }
  };

  const handleRemoveImage=(id:string)=>{
    if(!window.confirm("Remove the image from this story?")){return;}
    setItems((prev)=>{
      const next=[...prev];
      const index=next.findIndex((i)=>i.id===id);
      if(index===-1){return prev;}
      const current=next[index];
      if(!current){return prev;}
      next[index]={...current,image:"",imageUrl:""};
      return next;
    });
    markChanged(id);
    setMessage("Image removed. Remember to Save Changes.");
  };

  const handleRemoveDocument=(id:string)=>{
    if(!window.confirm("Remove the PDF from this story?")){return;}
    setItems((prev)=>{
      const next=[...prev];
      const index=next.findIndex((i)=>i.id===id);
      if(index===-1){return prev;}
      const current=next[index];
      if(!current){return prev;}
      next[index]={...current,document:""};
      return next;
    });
    markChanged(id);
    setMessage("PDF removed. Remember to Save Changes.");
  };

  const handleImageUpload=async(id:string,file:File)=>{
    try{
      setUploadingId(id);
      setMessage("");
      setError(undefined);
      const presignRes=await fetch("/api/uploads/s3/presign",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({folder:"impact",fileName:file.name,contentType:file.type}),
      });
      if(!presignRes.ok){throw new Error(`Failed to get presigned data: ${presignRes.status}`);}
      const presignData:PresignResponse=await presignRes.json();
      if(presignData.error){throw new Error(presignData.error);}
      const url=presignData.url;
      const fields=presignData.fields;
      const s3Key=presignData.key||fields.key;
      if(!url||!fields||!s3Key){throw new Error("Invalid presign response from server");}
      const formData=new FormData();
      Object.entries(fields).forEach(([k,v])=>formData.append(k,v));
      formData.append("file",file);
      const uploadRes=await fetch(url,{method:"POST",body:formData});
      if(!uploadRes.ok){throw new Error(`Upload failed with status ${uploadRes.status}`);}
      setItems((prev)=>{
        const next=[...prev];
        const index=next.findIndex((i)=>i.id===id);
        if(index===-1){return prev;}
        const current=next[index];
        if(!current){return prev;}
        next[index]={...current,image:s3Key,imageUrl:""};
        return next;
      });
      markChanged(id);
      setMessage("Image uploaded. Remember to Save Changes.");
    }catch(err:any){
      setError(err?.message||"Error uploading image");
    }finally{
      setUploadingId(undefined);
    }
  };

  const handleFileInputChange=(id:string,evt:ChangeEvent<HTMLInputElement>)=>{
    const file=evt.target.files?.[0];
    if(!file){evt.target.value="";return;}
    void handleImageUpload(id,file);
    evt.target.value="";
  };

  const handleDocumentUpload=async(id:string,file:File)=>{
    try{
      setUploadingDocId(id);
      setMessage("");
      setError(undefined);
      const presignRes=await fetch("/api/uploads/s3/presign",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({folder:"impact",fileName:file.name,contentType:file.type}),
      });
      if(!presignRes.ok){throw new Error(`Failed to get presigned data for document: ${presignRes.status}`);}
      const presignData:PresignResponse=await presignRes.json();
      if(presignData.error){throw new Error(presignData.error);}
      const url=presignData.url;
      const fields=presignData.fields;
      const s3Key=presignData.key||fields.key;
      if(!url||!fields||!s3Key){throw new Error("Invalid presign response from server (document)");}
      const formData=new FormData();
      Object.entries(fields).forEach(([k,v])=>formData.append(k,v));
      formData.append("file",file);
      const uploadRes=await fetch(url,{method:"POST",body:formData});
      if(!uploadRes.ok){throw new Error(`Document upload failed with status ${uploadRes.status}`);}
      setItems((prev)=>{
        const next=[...prev];
        const index=next.findIndex((i)=>i.id===id);
        if(index===-1){return prev;}
        const current=next[index];
        if(!current){return prev;}
        next[index]={...current,document:s3Key};
        return next;
      });
      markChanged(id);
      setMessage("PDF uploaded. Remember to Save Changes.");
    }catch(err:any){
      setError(err?.message||"Error uploading PDF");
    }finally{
      setUploadingDocId(undefined);
    }
  };

  const handleDocumentInputChange=(id:string,evt:ChangeEvent<HTMLInputElement>)=>{
    const file=evt.target.files?.[0];
    if(!file){evt.target.value="";return;}
    void handleDocumentUpload(id,file);
    evt.target.value="";
  };

  const filteredItems=useMemo(()=>{
    let list=[...items];
    const q=query.trim().toLowerCase();
    if(q){
      list=list.filter((i)=>{
        const fields=[
          i.titleEn,i.titleTet,i.excerptEn,i.excerptTet,i.bodyEn,i.bodyTet,
          i.submittedBy?.fullName,i.submittedBy?.email,
          i.location?.suco,i.location?.municipality,i.draft?.storySummary,
        ].filter(Boolean).map((x)=>String(x).toLowerCase());
        return fields.some((f)=>f.includes(q));
      });
    }
    if(filterMode==="visible"){list=list.filter((i)=>i.visible===true);}
    else if(filterMode==="hidden"){list=list.filter((i)=>i.visible===false);}
    if(statusFilter!=="all"){list=list.filter((i)=>(i.status||safeStatus(i))===statusFilter);}
    if(onlyWithImage){list=list.filter((i)=>!!(i.image||i.imageUrl));}
    if(onlyWithPdf){list=list.filter((i)=>!!i.document);}
    if(dateFrom){
      const fromTime=new Date(`${dateFrom}T00:00:00`).getTime();
      list=list.filter((i)=>{
        const t=i.date?new Date(`${i.date.slice(0,10)}T00:00:00`).getTime():0;
        return t>=fromTime;
      });
    }
    if(dateTo){
      const toTime=new Date(`${dateTo}T23:59:59`).getTime();
      list=list.filter((i)=>{
        const t=i.date?new Date(`${i.date.slice(0,10)}T00:00:00`).getTime():0;
        return t<=toTime;
      });
    }
    list.sort((a,b)=>{
      const da=a.date?new Date(a.date).getTime():0;
      const db=b.date?new Date(b.date).getTime():0;
      if(sortMode==="latest"){return da!==db?db-da:(a.order??0)-(b.order??0);}
      if(sortMode==="oldest"){return da!==db?da-db:(a.order??0)-(b.order??0);}
      if(sortMode==="az"){
        const ta=String(a.titleEn||"").toLowerCase();
        const tb=String(b.titleEn||"").toLowerCase();
        if(ta<tb){return-1;}
        if(ta>tb){return 1;}
        return db-da;
      }
      return (a.order??0)-(b.order??0);
    });
    return list;
  },[items,query,filterMode,dateFrom,dateTo,sortMode,onlyWithImage,onlyWithPdf,statusFilter]);

  const hasActiveFilters=filterMode!=="all"||statusFilter!=="all"||!!dateFrom||!!dateTo||onlyWithImage||onlyWithPdf;

  return(
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div
          ref={stickyRef}
          className="sticky top-20 z-30 -mx-4 mb-6 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:top-20"
        >
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Impact Stories Admin</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Create and edit Impact Stories. Draft submissions stay here until published.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/submitted-stories"
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Submitted Stories
                </Link>
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                >
                  + Add New
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={!hasChanges||saving}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving?"Saving...":"Save Changes"}
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex w-full flex-col gap-2 md:w-[44rem] md:flex-row md:items-center">
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="Search title, excerpt, body, or submission details…"
                  value={query}
                  onChange={(e)=>setQuery(e.target.value)}
                />
                <label className="hidden items-center gap-2 text-sm text-slate-700 md:inline-flex">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={showKeys}
                    onChange={(e)=>setShowKeys(e.target.checked)}
                  />
                  Show S3 keys
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={()=>setShowFilters((v)=>!v)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
                  </svg>
                  {showFilters?"Hide filters":"Filters"}
                  {hasActiveFilters&&(
                    <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">!</span>
                  )}
                </button>
                {hasChanges&&(
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Unsaved changes
                  </div>
                )}
              </div>
            </div>

            {/* Filter panel */}
            <div className={`mt-3 flex-col gap-3 ${showFilters?"flex":"hidden"}`}>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                <label className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={showKeys} onChange={(e)=>setShowKeys(e.target.checked)}/>
                  Show S3 keys
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Show</span>
                  <select className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm" value={filterMode} onChange={(e)=>setFilterMode(e.target.value as "all"|"visible"|"hidden")}>
                    <option value="all">All</option>
                    <option value="visible">Visible only</option>
                    <option value="hidden">Hidden only</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Status</span>
                  <select className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value as "all"|ImpactStatus)}>
                    <option value="all">All</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="hidden">Hidden</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">From</span>
                  <input type="date" className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)}/>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">To</span>
                  <input type="date" className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm" value={dateTo} onChange={(e)=>setDateTo(e.target.value)}/>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Sort</span>
                  <select className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm" value={sortMode} onChange={(e)=>setSortMode(e.target.value as "editor"|"latest"|"oldest"|"az")}>
                    <option value="editor">Editor order</option>
                    <option value="latest">Latest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="az">Title A–Z</option>
                  </select>
                </div>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={onlyWithImage} onChange={(e)=>setOnlyWithImage(e.target.checked)}/>
                  With image
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={onlyWithPdf} onChange={(e)=>setOnlyWithPdf(e.target.checked)}/>
                  With PDF
                </label>
              </div>
              <button
                type="button"
                onClick={()=>{setQuery("");setFilterMode("all");setStatusFilter("all");setDateFrom("");setDateTo("");setSortMode("editor");setOnlyWithImage(false);setOnlyWithPdf(false);}}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>

        {/* Spacer sized to the exact sticky bar height */}
        <div style={{height:stickyHeight}}/>

        {hasChanges&&(
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            You have unsaved changes. Uploads and edits do not auto-save. Click <span className="font-semibold">Save Changes</span> before leaving this page.
          </div>
        )}
        {message&&(
          <div className="mb-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm">
            {message}
          </div>
        )}
        {loading&&(
          <div className="text-sm text-slate-600">Loading impact stories...</div>
        )}
        {error&&!loading&&(
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {!loading&&filteredItems.length===0&&!error&&(
          <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
            No impact stories match your filters.
          </div>
        )}

        {!loading&&filteredItems.length>0&&(
          <div className="space-y-4">
            {filteredItems.map((item)=>{
              const isExpanded=expandedStoryId===item.id;
              const imageSrc=buildImageUrl(item.image||item.imageUrl);
              const documentUrl=buildFileUrl(item.document);
              const status=(item.status||safeStatus(item)) as ImpactStatus;
              const statusLabel=getStatusLabel(status);
              const lastUpdatedLabel=formatLastUpdated(item);
              const missingCover=item.visible&&!imageSrc;
              const isDraft=status==="draft";
              // Tetun is the main language, so a draft can be published with a
              // title and excerpt in EITHER Tetun or English (English is optional).
              const hasTitle=!!(item.titleTet?.trim()||item.titleEn?.trim());
              const hasExcerpt=!!(item.excerptTet?.trim()||item.excerptEn?.trim());
              const canPublish=hasTitle&&hasExcerpt&&!!item.date;

              return(
                <div key={item.id} className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div
                    className="cursor-pointer border-b border-slate-200 p-4 hover:bg-slate-50"
                    onClick={()=>setExpandedStoryId(isExpanded?null:item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {item.titleTet||item.titleEn||"Untitled Story"}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {item.location?.municipality||"No municipality"}
                        </div>
                      </div>
                      <div className="text-slate-400">{isExpanded?"▲":"▼"}</div>
                    </div>
                  </div>

                  {isExpanded&&(
                    <div className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex flex-1 flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="inline-flex items-center gap-2">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                              {item.order}
                            </span>
                            <div className="flex flex-col gap-1">
                              <button type="button" className="rounded border border-slate-300 px-1 text-[10px] leading-tight hover:bg-slate-100" onClick={()=>handleReorder(item.id,-1)}>↑</button>
                              <button type="button" className="rounded border border-slate-300 px-1 text-[10px] leading-tight hover:bg-slate-100" onClick={()=>handleReorder(item.id,1)}>↓</button>
                            </div>
                          </div>

                          <span className={`rounded-md border px-2 py-1 text-xs font-medium ${getStatusClasses(status)}`}>
                            {statusLabel}
                          </span>

                          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300"
                              checked={item.visible}
                              onChange={(e)=>handleFieldChange(item.id,"visible",e.target.checked)}
                              disabled={status==="archived"}
                              title={status==="archived"?"Archived items stay hidden — unarchive first":""}
                            />
                            <span>Visible</span>
                          </label>

                          {isDraft&&(
                            <button
                              type="button"
                              onClick={()=>{
                                if(!canPublish){
                                  setMessage("To publish: add a Title and an Excerpt (Tetun or English) and a Date, then Save Changes.");
                                  return;
                                }
                                handlePublish(item.id);
                              }}
                              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                            >
                              Publish draft
                            </button>
                          )}

                          {status==="archived"?(
                            <button type="button" onClick={()=>handleUnarchive(item.id)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                              Unarchive
                            </button>
                          ):(
                            <button type="button" onClick={()=>handleArchive(item.id)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                              Archive
                            </button>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Date</span>
                            <input
                              type="date"
                              className="rounded border border-slate-300 px-2 py-1 text-sm"
                              value={item.date?item.date.slice(0,10):""}
                              onChange={(e)=>handleFieldChange(item.id,"date",e.target.value)}
                            />
                          </div>

                          {missingCover&&(
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900">
                              Visible item has no image
                            </div>
                          )}
                        </div>

                        {lastUpdatedLabel&&(
                          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                            <span className="font-semibold">Last updated:</span> {lastUpdatedLabel}
                          </div>
                        )}

                        {item.submittedBy&&(
                          <details className="rounded-md border border-slate-200 bg-slate-50">
                            <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-slate-800">
                              Submission details
                            </summary>
                            <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
                              <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</div>
                                <div className="mt-2"><span className="font-medium">Name:</span> {item.submittedBy.fullName||""}</div>
                                <div><span className="font-medium">Email:</span> {item.submittedBy.email||""}</div>
                                <div><span className="font-medium">Phone:</span> {item.submittedBy.phone||""}</div>
                              </div>
                              <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location / Draft</div>
                                <div className="mt-2"><span className="font-medium">Municipality:</span> {item.location?.municipality||""}</div>
                                <div><span className="font-medium">Suco:</span> {item.location?.suco||""}</div>
                                <div className="mt-2"><span className="font-medium">Summary:</span> {item.draft?.storySummary||""}</div>
                              </div>
                            </div>
                          </details>
                        )}

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title (Tetun)</label>
                            <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={item.titleTet} onChange={(e)=>handleFieldChange(item.id,"titleTet",e.target.value)}/>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title (English) — optional</label>
                            <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={item.titleEn} onChange={(e)=>handleFieldChange(item.id,"titleEn",e.target.value)}/>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Excerpt (Tetun)</label>
                            <textarea rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={item.excerptTet} onChange={(e)=>handleFieldChange(item.id,"excerptTet",e.target.value)}/>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Excerpt (English) — optional</label>
                            <textarea rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={item.excerptEn} onChange={(e)=>handleFieldChange(item.id,"excerptEn",e.target.value)}/>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Body (Tetun)</label>
                            <textarea rows={7} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={item.bodyTet} onChange={(e)=>handleFieldChange(item.id,"bodyTet",e.target.value)}/>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Body (English) — optional</label>
                            <textarea rows={7} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={item.bodyEn} onChange={(e)=>handleFieldChange(item.id,"bodyEn",e.target.value)}/>
                          </div>
                        </div>
                      </div>

                      <div className="w-full space-y-4 md:w-[22rem]">
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Image</span>
                            {imageSrc&&<a href={imageSrc} target="_blank" rel="noreferrer" className="text-xs text-blue-700 underline">Open</a>}
                          </div>
                          {imageSrc?(
                            <img src={imageSrc} alt={item.titleEn||"Impact story image"} className="mb-3 h-44 w-full rounded-md border border-slate-200 object-cover"/>
                          ):(
                            <div className="mb-3 flex h-44 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white text-xs text-slate-400">No image uploaded</div>
                          )}
                          <div className="space-y-2">
                            <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                              <input type="file" accept="image/*" className="hidden" onChange={(e)=>handleFileInputChange(item.id,e)}/>
                              {uploadingId===item.id?"Uploading...":"Upload image"}
                            </label>
                            <button type="button" onClick={()=>handleRemoveImage(item.id)} className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50">Remove image</button>
                            {showKeys&&item.image&&(
                              <div className="rounded-md bg-white px-2 py-2 text-[11px] text-slate-500 break-all">{item.image}</div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Document (PDF)</span>
                            {documentUrl&&<a href={documentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-700 underline">Open</a>}
                          </div>
                          {documentUrl?(
                            <div className="mb-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 break-all">PDF uploaded</div>
                          ):(
                            <div className="mb-3 rounded-md border border-dashed border-slate-300 bg-white px-3 py-3 text-xs text-slate-400">No PDF uploaded</div>
                          )}
                          <div className="space-y-2">
                            <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                              <input type="file" accept="application/pdf" className="hidden" onChange={(e)=>handleDocumentInputChange(item.id,e)}/>
                              {uploadingDocId===item.id?"Uploading...":"Upload PDF"}
                            </label>
                            <button type="button" onClick={()=>handleRemoveDocument(item.id)} className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50">Remove PDF</button>
                            {showKeys&&item.document&&(
                              <div className="rounded-md bg-white px-2 py-2 text-[11px] text-slate-500 break-all">{item.document}</div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button type="button" onClick={()=>handleDelete(item.id)} className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* The pop-up is rendered straight into <body> (a "portal") with a very
            high z-index, so it always sits above the site's sticky navigation
            bar instead of being tucked underneath it. */}
        {showAddModal&&typeof document!=="undefined"&&createPortal(
          <div className="fixed inset-0 z-[10050] flex items-start justify-center overflow-y-auto bg-black/40 p-4 md:items-center md:p-8">
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-slate-900">Add New Impact Story</h2>
              <p className="mt-1 text-sm text-slate-600">
                Create the record first, then upload image/PDF and click Save Changes on the main page.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title (Tetun)</label>
                  <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={newItem.titleTet} onChange={(e)=>setNewItem((prev)=>({...prev,titleTet:e.target.value}))}/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title (English) — optional</label>
                  <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={newItem.titleEn} onChange={(e)=>setNewItem((prev)=>({...prev,titleEn:e.target.value}))}/>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Excerpt (Tetun)</label>
                  <textarea rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={newItem.excerptTet} onChange={(e)=>setNewItem((prev)=>({...prev,excerptTet:e.target.value}))}/>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Excerpt (English) — optional</label>
                  <textarea rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={newItem.excerptEn} onChange={(e)=>setNewItem((prev)=>({...prev,excerptEn:e.target.value}))}/>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</label>
                  <input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={newItem.date} onChange={(e)=>setNewItem((prev)=>({...prev,date:e.target.value}))}/>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={()=>{setShowAddModal(false);setNewItem(emptyItem());}} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                  Cancel
                </button>
                <button type="button" onClick={handleAddNewSubmit} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  Add Story
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
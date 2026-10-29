// app/admin/magazines/samples/page.tsx
"use client";

import {useEffect,useState,ChangeEvent}from "react";

const S3_ORIGIN="https://lafaek-media.s3.ap-southeast-2.amazonaws.com";

type Series="LK"|"LBK"|"LP"|"LBM"|"LM"|"LMB";

type SampleItem={
  id:string;
  code:string;
  samplePages:string[];
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

// Fallback list (used only if /api/admin/magazines is missing or fails)
const CODE_LIST=[
  "LBK-02-2023",
  "LBK-03-2023",
  "LK-1-2016",
  "LK-1-2017",
  "LK-1-2018",
  "LK-2-2015",
  "LK-2-2016",
  "LK-3-2015",
  "LK-3-2016",
  "LM-2-2015",
  "LM-3-2015",
  "LP-1-2016",
  "LP-1-2017",
  "LP-1-2018",
  "LP-2-2016",
  "LP-2-2017",
  "LP-2-2018",
  "LP-3-2017",
] as const;

const monthName=(n:string)=>{
  const i=parseInt(n,10);
  const en=([
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
  ][i]||`Issue ${n}`);
  const tet=([
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
  ][i]||`Numeru ${n}`);
  return{en,tet};
};

const seriesLabel=(s:Series)=>
  s==="LP"
    ? {en:"Lafaek Prima",tet:"Lafaek Prima"}
    : s==="LBM"||s==="LM"||s==="LMB"
    ? {en:"Lafaek ba Manorin",tet:"Lafaek ba Manorin"}
    : s==="LBK"
    ? {en:"Lafaek ba Komunidade",tet:"Lafaek ba Komunidade"}
    : {en:"Lafaek Ki'ik",tet:"Lafaek Ki'ik"};

const buildHumanName=(code:string)=>{
  const[series,issue="",year=""]=code.split("-");
  const isMonth=series==="LBK";
  const when=isMonth?monthName(issue):{en:`Issue ${issue}`,tet:`Numeru ${issue}`};
  const s=seriesLabel(series as Series);
  return`${s.en} ${when.en} ${year}`.trim();
};

const buildImageUrl=(src?:string)=>{
  if(!src){return"";}
  let clean=src.trim();
  if(clean.startsWith(S3_ORIGIN)){return clean;}
  if(clean.startsWith("http://")||clean.startsWith("https://")){return clean;}
  clean=clean.replace(/^\/+/,"");
  return`${S3_ORIGIN}/${clean}`;
};

export default function MagazineSamplesAdminPage(){
  const[items,setItems]=useState<SampleItem[]>([]);
  const[loading,setLoading]=useState<boolean>(true);
  const[error,setError]=useState<string|undefined>();
  const[saving,setSaving]=useState<boolean>(false);
  const[hasChanges,setHasChanges]=useState<boolean>(false);
  const[uploadingId,setUploadingId]=useState<string|undefined>();
  const[message,setMessage]=useState<string>("");

  const[newCode,setNewCode]=useState<string>("");
  const[availableCodes,setAvailableCodes]=useState<string[]>([...CODE_LIST]);

  useEffect(()=>{
    const load=async()=>{
      try{
        setLoading(true);
        setError(undefined);
        console.log("[admin/magazines/samples] loading from API");

        // 1) Load existing samples (same as before)
        const res=await fetch("/api/admin/magazines/samples",{method:"GET"});
        console.log("[admin/magazines/samples] GET status",res.status);
        if(!res.ok){
          throw new Error(`Failed to load samples: ${res.status}`);
        }
        const data:ApiResponse=await res.json();
        console.log("[admin/magazines/samples] GET payload",data);
        if(!data.ok){
          throw new Error(data.error||"Unknown error from API");
        }

        const normalised:SampleItem[]=(data.items||[]).map((raw:any,index:number)=>({
          id:raw.code?String(raw.code):`sample-${index}`,
          code:String(raw.code??"").trim(),
          samplePages:Array.isArray(raw.samplePages)
            ? raw.samplePages.map((s:any)=>String(s??"").trim()).filter((s:string)=>!!s)
            : []
        })).filter((i)=>!!i.code);

        normalised.sort((a,b)=>a.code.localeCompare(b.code));
        setItems(normalised);

        // 2) Try to load magazine codes from /api/admin/magazines
        try{
          console.log("[admin/magazines/samples] loading magazine codes from /api/admin/magazines");
          const magsRes=await fetch("/api/admin/magazines",{method:"GET"});
          if(magsRes.ok){
            const magsData:ApiResponse=await magsRes.json();
            if(magsData.ok&&Array.isArray(magsData.items)){
              const fromMags=Array.from(
                new Set(
                  magsData.items
                    .map((m:any)=>String(m.code??"").trim())
                    .filter((c)=>!!c)
                )
              );
              if(fromMags.length){
                fromMags.sort((a,b)=>a.localeCompare(b));
                setAvailableCodes(fromMags);
                console.log("[admin/magazines/samples] using dynamic magazine codes",fromMags);
              }else{
                console.log("[admin/magazines/samples] no codes from API, keeping fallback list");
              }
            }else{
              console.log("[admin/magazines/samples] magazines API not ok, keeping fallback list");
            }
          }else{
            console.log("[admin/magazines/samples] magazines API status",magsRes.status,"– keeping fallback list");
          }
        }catch(err:any){
          console.warn("[admin/magazines/samples] error loading magazine codes, using fallback list",err);
        }
      }catch(err:any){
        console.error("[admin/magazines/samples] load error",err);
        setError(err.message||"Error loading magazine samples");
      }finally{
        setLoading(false);
      }
    };
    load();
  },[]);

  const markChanged=()=>{
    if(!hasChanges){
      console.log("[admin/magazines/samples] changes detected");
      setHasChanges(true);
    }
  };

  const handleAddSampleSet=()=>{
    if(!newCode){
      setMessage("Please choose a magazine code first.");
      return;
    }
    if(items.some((i)=>i.code===newCode)){
      setMessage("That code already has a sample set.");
      return;
    }
    const item:SampleItem={
      id:`temp-${newCode}-${Date.now()}`,
      code:newCode,
      samplePages:[]
    };
    setItems((prev)=>{
      const next=[...prev,item];
      next.sort((a,b)=>a.code.localeCompare(b.code));
      return next;
    });
    setNewCode("");
    setMessage("Sample set created. You can now upload pages.");
    markChanged();
  };

  const handleDeleteSet=(id:string)=>{
    if(!window.confirm("Remove this sample set and all its page references?")){return;}
    setItems((prev)=>prev.filter((i)=>i.id!==id));
    markChanged();
  };

  const handleClearPages=(id:string)=>{
    if(!window.confirm("Clear all sample pages for this magazine?")){return;}
    setItems((prev)=>prev.map((i):SampleItem=>{
      if(i.id===id){
        return{...i,samplePages:[]};
      }
      return i;
    }));
    markChanged();
  };

  const handleImageUpload=async(id:string,file:File)=>{
    try{
      console.log("[admin/magazines/samples] starting image upload",{id,fileName:file.name,fileType:file.type});
      setUploadingId(id);
      setMessage("");

      const presignRes=await fetch("/api/uploads/s3/presign",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          folder:"magazines/samples",
          fileName:file.name,
          contentType:file.type
        })
      });

      console.log("[admin/magazines/samples] presign status",presignRes.status);

      if(!presignRes.ok){
        throw new Error(`Failed to get presigned data: ${presignRes.status}`);
      }

      const presignData:PresignResponse=await presignRes.json();
      console.log("[admin/magazines/samples] presignData",presignData);

      if(presignData.error){
        throw new Error(presignData.error);
      }

      const url=presignData.url;
      const fields=presignData.fields;
      const s3Key=presignData.key||fields.key;

      if(!url||!fields||!s3Key){
        console.error("[admin/magazines/samples] invalid presign response",presignData);
        throw new Error("Invalid presign response from server");
      }

      const formData=new FormData();
      Object.entries(fields).forEach(([k,v])=>{
        formData.append(k,v);
      });
      formData.append("file",file);

      const uploadRes=await fetch(url,{
        method:"POST",
        body:formData
      });

      console.log("[admin/magazines/samples] S3 upload status",uploadRes.status);

      if(!uploadRes.ok){
        throw new Error(`Upload failed with status ${uploadRes.status}`);
      }

      setItems((prev)=>prev.map((i):SampleItem=>{
        if(i.id===id){
          return{
            ...i,
            samplePages:[...i.samplePages,s3Key]
          };
        }
        return i;
      }));
      markChanged();
      setMessage("Sample page uploaded. Remember to Save Changes.");
    }catch(err:any){
      console.error("[admin/magazines/samples] upload error",err);
      setMessage(err.message||"Error uploading sample page");
    }finally{
      setUploadingId(undefined);
    }
  };

  const handleFileInputChange=(id:string,evt:ChangeEvent<HTMLInputElement>)=>{
    const file=evt.target.files?.[0];
    console.log("[admin/magazines/samples] file selected",{id,fileName:file?.name,fileType:file?.type});
    if(!file){
      evt.target.value="";
      return;
    }
    void handleImageUpload(id,file);
    evt.target.value="";
  };

  const handleSaveChanges=async()=>{
    try{
      setSaving(true);
      setMessage("");
      const payload={items:items.map(({code,samplePages})=>({code,samplePages}))};
      console.log("[admin/magazines/samples] saving",payload);
      const res=await fetch("/api/admin/magazines/samples",{
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      });
      console.log("[admin/magazines/samples] PUT status",res.status);
      if(!res.ok){
        throw new Error(`Failed to save: ${res.status}`);
      }
      const data=await res.json();
      console.log("[admin/magazines/samples] PUT payload",data);
      if(!data.ok){
        throw new Error(data.error||"Unknown error from API");
      }
      setHasChanges(false);
      setMessage("Changes saved successfully.");
    }catch(err:any){
      console.error("[admin/magazines/samples] save error",err);
      setMessage(err.message||"Error saving changes");
    }finally{
      setSaving(false);
    }
  };

  return(
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Magazine Samples Admin</h1>
            <p className="mt-1 text-sm text-slate-600">
              Upload 3–5 sample pages for each magazine. These images will be shown on the public Magazines landing page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <select
                value={newCode}
                onChange={(e)=>setNewCode(e.target.value)}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm"
              >
                <option value="">Select magazine code</option>
                {availableCodes.map((code)=>(
                  <option key={code} value={code}>
                    {code} — {buildHumanName(code)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSampleSet}
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
              >
                + Add Sample Set
              </button>
            </div>
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

        {message&&(
          <div className="mb-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm">
            {message}
          </div>
        )}

        {loading&&(
          <div className="text-sm text-slate-600">Loading sample sets...</div>
        )}

        {error&&!loading&&(
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading&&items.length===0&&!error&&(
          <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
            No sample sets yet. Choose a magazine code and click &ldquo;Add Sample Set&rdquo;.
          </div>
        )}

        {!loading&&items.length>0&&(
          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Code</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Magazine</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Sample pages</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Upload</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item,index)=>(
                  <tr key={item.id} className={index%2===0?"bg-white":"bg-slate-50"}>
                    <td className="border-b border-slate-200 px-3 py-2 align-top text-xs font-mono">
                      {item.code}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 align-top text-xs">
                      {buildHumanName(item.code)}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 align-top">
                      {item.samplePages.length===0?(
                        <div className="flex h-16 w-32 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-center text-[10px] text-slate-400">
                          No sample pages yet
                        </div>
                      ):(
                        <div className="flex flex-wrap gap-2">
                          {item.samplePages.map((p,idx)=>(
                            <div key={`${item.id}-${idx}`} className="flex flex-col items-start gap-1">
                              <img
                                src={buildImageUrl(p)}
                                alt={`Sample ${idx+1}`}
                                className="h-16 w-24 rounded border border-slate-200 object-cover"
                              />
                              <p className="max-w-[10rem] break-all text-[9px] text-slate-500">
                                {p}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 align-top">
                      <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e)=>handleFileInputChange(item.id,e)}
                        />
                        {uploadingId===item.id?"Uploading...":"Upload page"}
                      </label>
                      {item.samplePages.length>0&&(
                        <button
                          type="button"
                          onClick={()=>handleClearPages(item.id)}
                          className="mt-2 block rounded-md border border-amber-300 px-2 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-50"
                        >
                          Clear pages
                        </button>
                      )}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 align-top">
                      <button
                        type="button"
                        onClick={()=>handleDeleteSet(item.id)}
                        className="rounded-md border border-red-300 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete set
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
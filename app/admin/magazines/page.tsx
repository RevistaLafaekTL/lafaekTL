//app/admin/magazines/page.tsx
"use client"

import {useEffect,useMemo,useState,ChangeEvent} from "react"
import {
  getUserDisplayName,
  getUserEmail,
  getUserSub,
  getUserGroupsFromSessionStorage,
} from "@/lib/auth"

const S3_ORIGIN = "https://lafaek-media.s3.ap-southeast-2.amazonaws.com"

type Series = "LK" | "LBK" | "LP" | "LBM"
type MagazineLanguage = "Tetun" | "English" | "Tetun + English"
type AccessType = "public" | "approval_required" | "private"

type AuditUser = {
  sub?:string
  email?:string
  fullName?:string
}

type AdminMagazine = {
  id:string
  code:string
  series:Series
  year:string
  issue:string
  titleEn?:string
  titleTet?:string
  description?:string
  category?:string
  language?:MagazineLanguage

  coverImage?:string

  // NEW FLIPBOOK PAGE SYSTEM
  pageImageUrls?:string[]

  accessType?:AccessType
  visible?:boolean

  createdAt?:string
  createdBy?:AuditUser

  updatedAt?:string
  updatedBy?:AuditUser
  updatedByGroups?:string[]

  [key:string]:any
}

type ApiResponse = {
  ok:boolean
  items:any[]
  error?:string
}

type PresignResponse = {
  url:string
  fields:Record<string,string>
  key?:string
  publicUrl?:string
  error?:string
}

const seriesOptions:Array<{value:Series;label:string}> = [
  {value:"LK",label:"Lafaek Ki'ik"},
  {value:"LBK",label:"Lafaek ba Komunidade"},
  {value:"LP",label:"Lafaek Prima"},
  {value:"LBM",label:"Lafaek ba Manorin"},
]

const languageOptions:MagazineLanguage[] = [
  "Tetun",
  "English",
  "Tetun + English",
]

const accessOptions:Array<{
  value:AccessType
  label:string
  hint:string
}> = [
  {
    value:"public",
    label:"Public",
    hint:"Magazine can be viewed publicly."
  },
  {
    value:"approval_required",
    label:"Approval required",
    hint:"Reserved for future access workflows."
  },
  {
    value:"private",
    label:"Private",
    hint:"Hidden from public pages."
  },
]

const seriesLabel = (s:string) =>
  s === "LP"
    ? "Lafaek Prima"
: s === "LBM"
    ? "Lafaek ba Manorin"
    : s === "LBK"
    ? "Lafaek ba Komunidade"
    : s === "LK"
    ? "Lafaek Ki'ik"
    : "Unknown Series"

const deriveFromCode = (codeRaw:string) => {
  const code = String(codeRaw || "").trim()

  const [seriesRaw,issueRaw = "",yearRaw = ""] = code.split("-")

const normalisedSeries =
  seriesRaw === "LM" || seriesRaw === "LMB"
    ? "LBM"
    : seriesRaw

const series =
  normalisedSeries === "LK" ||
  normalisedSeries === "LBK" ||
  normalisedSeries === "LP" ||
  normalisedSeries === "LBM"
    ? normalisedSeries
    : "LK"

  return {
    series:series as Series,
    issue:issueRaw || "",
    year:yearRaw || "",
  }
}

const buildFileUrl = (keyOrUrl?:string) => {
  if(!keyOrUrl){
    return ""
  }

  const value = keyOrUrl.trim()

  if(!value){
    return ""
  }

  if(
    value.startsWith("http://") ||
    value.startsWith("https://")
  ){
    return value
  }

  return `${S3_ORIGIN}/${value.replace(/^\/+/,"")}`
}

function safeLanguage(raw:any):MagazineLanguage{
  const value = String(raw ?? "").trim()

  if(
    value === "English" ||
    value === "Tetun + English"
  ){
    return value
  }

  return "Tetun"
}

function safeAccessType(raw:any):AccessType{
  const value = String(raw ?? "").trim()

  if(
    value === "approval_required" ||
    value === "private"
  ){
    return value
  }

  return "public"
}

function emptyMagazineFromCode(codeRaw:string):AdminMagazine{
  const code = codeRaw.trim()

  const derived = deriveFromCode(code)

  const now = new Date().toISOString()

  const fullName = getUserDisplayName()
  const email = getUserEmail()
  const sub = getUserSub()
  const groups = getUserGroupsFromSessionStorage()

  return {
    id:`temp-${Date.now()}`,
    code,

    series:derived.series,
    year:derived.year,
    issue:derived.issue,

    titleEn:"",
    titleTet:"",
    description:"",
    category:"",
    language:"Tetun",

    coverImage:"",

    // NEW
    pageImageUrls:[],

    accessType:"public",
    visible:true,

    createdAt:now,
    updatedAt:now,

    createdBy:{
      sub,
      email,
      fullName,
    },

    updatedBy:{
      sub,
      email,
      fullName,
    },

    updatedByGroups:groups.length
      ? groups
      : undefined,
  }
}

function sortMagazines(list:AdminMagazine[]){
  return [...list].sort((a,b) => {
    const ay = parseInt(a.year || "0",10)
    const by = parseInt(b.year || "0",10)

    if(by !== ay){
      return by - ay
    }
const SERIES_ORDER = {
  LK: 1,
  LP: 2,
  LBM: 3,
  LBK: 4,
}
    const sa =
  SERIES_ORDER[a.series as keyof typeof SERIES_ORDER] || 999

const sb =
  SERIES_ORDER[b.series as keyof typeof SERIES_ORDER] || 999

if(sa !== sb){
  return sa - sb
}

return String(a.code || "")
  .localeCompare(
    String(b.code || "")
  )
  })
}

function formatLastUpdated(m:AdminMagazine){
  const name =
    typeof m.updatedBy?.fullName === "string"
      ? m.updatedBy.fullName.trim()
      : ""

  const email =
    typeof m.updatedBy?.email === "string"
      ? m.updatedBy.email.trim()
      : ""

  const who = name || email

  const stampRaw =
    typeof m.updatedAt === "string"
      ? m.updatedAt
      : ""

  const stamp = stampRaw
    ? new Date(stampRaw).toLocaleString()
    : ""

  if(!who && !stamp){
    return ""
  }

  if(who && stamp){
    return `${who} • ${stamp}`
  }

  return who || stamp
}

export default function AdminMagazinesPage(){

  const [items,setItems] = useState<AdminMagazine[]>([])
  const [loading,setLoading] = useState(true)
  const [saving,setSaving] = useState(false)

  const [error,setError] = useState<string>()
  const [message,setMessage] = useState("")

  const [hasChanges,setHasChanges] = useState(false)

  const [dirtyIds,setDirtyIds] = useState<Set<string>>(new Set())

  const [newCode,setNewCode] = useState("")
  const [newTitle,setNewTitle] = useState("")

  const [uploadingId,setUploadingId] = useState<string>()
  const [uploadingType,setUploadingType] = useState<
    "cover" | "pages"
  >()
const [expandedIds,setExpandedIds] = useState<Set<string>>(
  new Set()
)

const [searchTerm,setSearchTerm] = useState("")

const [seriesFilter,setSeriesFilter] = useState<string>("all")
  useEffect(() => {

    const load = async() => {

      try{

        setLoading(true)

        const res = await fetch("/api/admin/magazines",{
          method:"GET",
          cache:"no-store",
        })

        if(!res.ok){
          throw new Error(`Failed to load magazines`)
        }

  const contentType =
  res.headers.get("content-type") || ""

console.log(
  "[MAGAZINES LOAD]",
  {
    status:res.status,
    contentType,
    url:res.url,
  }
)

if(!contentType.includes("application/json")){
  const text = await res.text()

  console.error(
    "[MAGAZINES LOAD FAILED]",
    {
      status:res.status,
      contentType,
      url:res.url,
      response:text.slice(0,500),
    }
  )

  throw new Error(
    "Server returned non-JSON response. Session may have expired."
  )
}

const data:ApiResponse = await res.json()

if(!data.ok){
  throw new Error(data.error || "API error")
}

        const list:AdminMagazine[] =
          (data.items || []).map((raw:any,index:number) => {

            const code = String(raw.code || "").trim()

            const derived = deriveFromCode(code)

            return {
              ...raw,

              id:String(raw.id || `mag-${index}`),

              code,

              series:raw.series || derived.series,
              year:String(raw.year || derived.year || ""),
              issue:String(raw.issue || derived.issue || ""),

              titleEn:String(raw.titleEn || ""),
              titleTet:String(raw.titleTet || ""),
              description:String(raw.description || ""),
              category:String(raw.category || ""),

              language:safeLanguage(raw.language),

              coverImage:String(raw.coverImage || ""),

              // NEW
              pageImageUrls:Array.isArray(raw.pageImageUrls)
                ? raw.pageImageUrls
                : [],

              accessType:safeAccessType(raw.accessType),

              visible:
                raw.visible === false
                  ? false
                  : true,

              createdAt:raw.createdAt,
              updatedAt:raw.updatedAt,

              createdBy:raw.createdBy,
              updatedBy:raw.updatedBy,
              updatedByGroups:raw.updatedByGroups,
            }
          })

        setItems(sortMagazines(list))

      }catch(err:any){

        console.error(err)

        setError(err.message || "Load error")

      }finally{
        setLoading(false)
      }
    }

const timer = setTimeout(() => {
  void load()
},300)

return () => clearTimeout(timer)


  },[])

  const markChanged = (id?:string) => {

    setHasChanges(true)

    if(id){
      setDirtyIds((prev) => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
    }
  }

 const handleFieldChange = (
  id:string,
  field:keyof AdminMagazine,
  value:any
) => {

  setItems((prev) =>
    prev.map((m) => {

      if(m.id !== id){
        return m
      }

      if(field === "code"){

        const derived =
          deriveFromCode(
            String(value)
          )

        return {
          ...m,
          code:String(value).toUpperCase(),
          series:derived.series,
          issue:derived.issue,
          year:derived.year,
        }
      }

      return {
        ...m,
        [field]:value,
      }
    })
  )

  markChanged(id)
}

  const handleAddMagazine = () => {

    const code = newCode.trim()

    if(!code){
      setMessage("Please enter a magazine code")
      return
    }

    if(items.some((m) => m.code === code)){
      setMessage("Magazine already exists")
      return
    }

    const next = emptyMagazineFromCode(code)

    next.titleEn = newTitle.trim()
    next.titleTet = newTitle.trim()

setItems((prev) => [next,...prev])
    setNewCode("")
    setNewTitle("")

    markChanged(next.id)
setExpandedIds(
  new Set([next.id])
)
    setMessage("Magazine created")
  }

  const presignAndUpload = async(
    folder:string,
    file:File
  ) => {

    const presignRes = await fetch("/api/uploads/s3/presign",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        folder,
        fileName:file.name,
        contentType:file.type,
      })
    })

    if(!presignRes.ok){
      throw new Error("Failed to presign upload")
    }

    const presignData:PresignResponse =
      await presignRes.json()

    const formData = new FormData()

    Object.entries(presignData.fields).forEach(([k,v]) => {
      formData.append(k,v)
    })

    formData.append("file",file)

    const uploadRes = await fetch(
      presignData.url,
      {
        method:"POST",
        body:formData,
      }
    )

    if(!uploadRes.ok){
      throw new Error("Upload failed")
    }

    return presignData.publicUrl || presignData.key || ""
  }

  const handleCoverUpload = async(
    id:string,
    file:File
  ) => {

    try{

      setUploadingId(id)
      setUploadingType("cover")

      const uploaded =
        await presignAndUpload(
          "magazines/covers",
          file
        )

      setItems((prev) =>
        prev.map((m) => {

          if(m.id !== id){
            return m
          }

          return {
            ...m,
            coverImage:uploaded,
          }
        })
      )

      markChanged(id)

      setMessage("Cover uploaded")

    }catch(err:any){

      console.error(err)

      setMessage(
        err.message || "Cover upload failed"
      )

    }finally{

      setUploadingId(undefined)
      setUploadingType(undefined)
    }
  }

  const handlePageUploads = async(
    id:string,
    files:File[]
  ) => {

    try{

      setUploadingId(id)
      setUploadingType("pages")

      const uploaded:string[] = []

      for(const file of files){

        const result =
          await presignAndUpload(
            "magazines/pages",
            file
          )

        uploaded.push(result)
      }

      setItems((prev) =>
        prev.map((m) => {

          if(m.id !== id){
            return m
          }

          return {
            ...m,

            pageImageUrls:[
              ...(m.pageImageUrls || []),
              ...uploaded,
            ]
          }
        })
      )

      markChanged(id)

      setMessage(
        `${uploaded.length} page(s) uploaded`
      )

    }catch(err:any){

      console.error(err)

      setMessage(
        err.message || "Page upload failed"
      )

    }finally{

      setUploadingId(undefined)
      setUploadingType(undefined)
    }
  }
const toggleExpanded = (id:string) => {

  setExpandedIds((prev) => {

    const next = new Set(prev)

    if(next.has(id)){
      next.delete(id)
    }else{
      next.add(id)
    }

    return next
  })
}
  const handleDeleteMagazine = (id:string) => {

    const confirmed =
      window.confirm(
        "Delete this magazine permanently?"
      )

    if(!confirmed){
      return
    }

    setItems((prev) =>
      prev.filter((m) => m.id !== id)
    )

    setHasChanges(true)

    setDirtyIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })

    setMessage("Magazine deleted. Click Save Changes.")
  }
const handleRemovePage = (
  id:string,
  pageIndex:number
) => {

  setItems((prev) =>
    prev.map((m) => {

      if(m.id !== id){
        return m
      }

      return {
        ...m,
        pageImageUrls:(m.pageImageUrls || [])
          .filter((_,i) => i !== pageIndex)
      }
    })
  )

  markChanged(id)
}

const handleMovePage = (
  id:string,
  from:number,
  to:number
) => {

  setItems((prev) =>
    prev.map((m) => {

      if(m.id !== id){
        return m
      }

      const pages = [...(m.pageImageUrls || [])]

      if(
        to < 0 ||
        to >= pages.length
      ){
        return m
      }

const moved = pages[from]

if(!moved){
  return m
}
      pages.splice(from,1)
      pages.splice(to,0,moved)

      return {
        ...m,
        pageImageUrls:pages,
      }
    })
  )

  markChanged(id)
}
  const handleSaveChanges = async() => {

    try{

      setSaving(true)

      const now = new Date().toISOString()

      const fullName = getUserDisplayName()
      const email = getUserEmail()
      const sub = getUserSub()
      const groups = getUserGroupsFromSessionStorage()

      const payloadItems =
        items.map((m) => {

          if(dirtyIds.has(m.id)){

            return {
              ...m,

              updatedAt:now,

              updatedBy:{
                sub,
                email,
                fullName,
              },

              updatedByGroups:groups,
            }
          }

          return m
        })

      const res = await fetch(
        "/api/admin/magazines",
        {
          method:"PUT",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            items:payloadItems,
          })
        }
      )

      if(!res.ok){
        throw new Error("Failed to save")
      }

      setHasChanges(false)
      setDirtyIds(new Set())

      setMessage("Changes saved")

    }catch(err:any){

      console.error(err)

      setMessage(
        err.message || "Save failed"
      )

    }finally{

      setSaving(false)
    }
  }
const filteredItems = useMemo(() => {

  return items.filter((m) => {

    const matchesSearch =
      searchTerm.trim() === "" ||
      [
        m.code,
        m.titleEn,
        m.titleTet,
        m.year,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

    const matchesSeries =
      seriesFilter === "all" ||
      m.series === seriesFilter

    return (
      matchesSearch &&
      matchesSeries
    )
  })

},[
  items,
  searchTerm,
  seriesFilter,
])
  const totalVisible = useMemo(
    () =>
      items.filter(
        (m) => m.visible !== false
      ).length,
    [items]
  )

  return(
    <div className="min-h-screen bg-slate-50 px-4 pb-8">

      <div className="sticky top-28 z-30 -mx-4 mb-6 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:top-32">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Magazines Admin
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Upload magazines as flipbook image pages.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="text-xs text-slate-600">
              Total:
              <span className="font-semibold">
                {" "}{items.length}
              </span>
<input
  type="text"
  value={searchTerm}
  onChange={(e) =>
    setSearchTerm(e.target.value)
  }
  placeholder="Search magazines..."
  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
/>

<select
  value={seriesFilter}
  onChange={(e) =>
    setSeriesFilter(e.target.value)
  }
  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
>
  <option value="all">
    All Types
  </option>

  <option value="LK">
    Lafaek Ki'ik
  </option>

  <option value="LP">
    Lafaek Prima
  </option>

  <option value="LBM">
    Lafaek ba Manorin
  </option>

  <option value="LBK">
    Lafaek ba Komunidade
  </option>
</select>
              {" "}• Visible:
              <span className="font-semibold">
                {" "}{totalVisible}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={!hasChanges || saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6">

        {message && (
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

  <h2 className="mb-3 text-sm font-semibold text-slate-800">
    Add new magazine
  </h2>

<div className="grid gap-4 xl:grid-cols-[1.2fr,1fr,1fr]">
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-700">
        Code
      </label>

      <input
        type="text"
        value={newCode}
        onChange={(e) => setNewCode(e.target.value)}
        placeholder="LK-1-2018"
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      />
    </div>

    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-700">
        Title
      </label>

      <input
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      />
    </div>

    <div className="flex items-end">
      <button
        type="button"
        onClick={handleAddMagazine}
        className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
      >
        + Add
      </button>
    </div>

</div>

</section>

        {loading && (
          <div className="text-sm text-slate-600">
            Loading magazines...
          </div>
        )}

        {!loading && items.length > 0 && (

          <div className="space-y-4">

{filteredItems.map((m,index) => {
              const coverUrl =
                buildFileUrl(m.coverImage)

              const pages =
                m.pageImageUrls || []

              const lastUpdated =
                formatLastUpdated(m)
                const expanded =
  expandedIds.has(m.id)

              return(

                <section
                  key={m.id || `row-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >

                  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">

                    <div>

                      <h2 className="text-lg font-semibold text-slate-900">
                        {m.code}
                      </h2>

                      <p className="mt-1 text-sm text-slate-600">
{seriesLabel(m.series)}                     
  {" • "}
Edisaun {m.issue}
                        {" • "}
                        {m.year}
                      </p>

                    </div>

                    <div className="flex flex-wrap items-center gap-2">

  <button
    type="button"
    onClick={() =>
toggleExpanded(m.id || "")
    }
    className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
  >
    {expanded
      ? "▼ Close"
      : "▶ Open"}
  </button>

  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold ${
      m.visible === false
        ? "border border-red-200 bg-red-50 text-red-700"
        : "border border-emerald-200 bg-emerald-50 text-emerald-700"
    }`}
  >
    {m.visible === false
      ? "Hidden"
      : "Visible"}
  </span>

  <button
    type="button"
    onClick={() =>
      handleFieldChange(
        m.id,
        "visible",
        m.visible === false
          ? true
          : false
      )
    }
    className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
  >
    {m.visible === false
      ? "Show"
      : "Hide"}
  </button>

  <button
    type="button"
    onClick={() =>
handleDeleteMagazine(m.id || "")
    }
    className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
  >
    Delete
  </button>

</div>

                  </div>

                  {expanded && (

<div
  id={`open-${m.id}`}
  className="grid gap-4 xl:grid-cols-[1.2fr,1fr,1fr]"
>

                    <div className="space-y-4">
                      <div className="space-y-1">

  <label className="text-xs font-semibold text-slate-700">
    Code
  </label>

  <input
    type="text"
    value={m.code}
    onChange={(e) =>
      handleFieldChange(
        m.id,
        "code",
        e.target.value.toUpperCase()
      )
    }
    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
  />

  <p className="text-[11px] text-slate-500">
    Example: LK-1-2025
  </p>

</div>
<div className="space-y-1">

  <label className="text-xs font-semibold text-slate-700">
    Magazine Type
  </label>

  <select
  value={m.series}
  onChange={(e) => {

    const value = e.target.value

    handleFieldChange(
      m.id,
      "series",
      value
    )

  }}
  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
>
  <option value="LK">
    Lafaek Ki'ik
  </option>

  <option value="LP">
    Lafaek Prima
  </option>

  <option value="LBM">
    Lafaek ba Manorin
  </option>

  <option value="LBK">
    Lafaek ba Komunidade
  </option>
</select>

</div>
                      <div className="space-y-1">

                        <label className="text-xs font-semibold text-slate-700">
                          Title
                        </label>

                        <input
                          type="text"
                          value={m.titleEn || ""}
                          onChange={(e) => {
                            handleFieldChange(m.id,"titleEn",e.target.value)
                            handleFieldChange(m.id,"titleTet",e.target.value)
                          }}
                          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      </div>

                      <div className="space-y-1">

                        <label className="text-xs font-semibold text-slate-700">
                          Description
                        </label>

                        <textarea
                          value={m.description || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              m.id,
                              "description",
                              e.target.value
                            )
                          }
                          rows={5}
                          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      </div>

                    </div>

                    {/* COVER */}
                    <div className="space-y-4">

                      <div className="rounded-xl border border-slate-200 p-3">

                        <div className="mb-2 flex items-center justify-between">

                          <h3 className="text-sm font-semibold text-slate-800">
                            Cover image
                          </h3>

                        </div>

                        <div className="mb-3">

                          {coverUrl ? (

                            <img
                              src={coverUrl}
                              alt={m.titleEn || m.code}
                              className="h-60 w-44 rounded border border-slate-200 object-cover"
                            />

                          ) : (

                            <div className="flex h-60 w-44 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                              No cover
                            </div>

                          )}

                        </div>

                        <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">

                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {

                              const file =
                                e.target.files?.[0]

                              if(!file){
                                return
                              }

                              void handleCoverUpload(
                                m.id,
                                file
                              )
                            }}
                          />

                          {uploadingId === m.id &&
                          uploadingType === "cover"
                            ? "Uploading..."
                            : "Upload cover"}

                        </label>

                      </div>

                    </div>

                    {/* MAGAZINE PAGES */}
                    <div className="space-y-4">

                      <div className="rounded-xl border border-slate-200 p-3">

                        <div className="mb-3 flex items-center justify-between">

                          <h3 className="text-sm font-semibold text-slate-800">
                            Magazine pages
                          </h3>

                          <span className="text-xs text-slate-500">
                            {pages.length} page(s)
                          </span>

                        </div>

                        <div className="mb-3">

                          <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">

                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {

                                const files =
                                  Array.from(
                                    e.target.files || []
                                  )

                                if(files.length === 0){
                                  return
                                }

                                void handlePageUploads(
                                  m.id,
                                  files
                                )
                              }}
                            />

                            {uploadingId === m.id &&
                            uploadingType === "pages"
                              ? "Uploading..."
                              : "Upload page(s)"}

                          </label>

                        </div>

                        {pages.length === 0 ? (

                          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-xs text-slate-500">
                            No pages uploaded yet.
                          </div>

                        ) : (

                          <div className="grid grid-cols-2 gap-3">

                            {pages.map((page,pageIndex) => {

                              const pageUrl =
                                buildFileUrl(page)

                              return(

                                <div
                                  key={`${m.id}-${pageIndex}`}
                                  className="rounded-lg border border-slate-200 p-2"
                                >

                                  <div className="mb-2">

                                    <img
                                      src={pageUrl}
                                      alt={`${m.code} page ${pageIndex + 1}`}
                                      className="h-44 w-full rounded border border-slate-200 object-cover"
                                    />

                                  </div>

                                  <div className="flex items-center justify-between gap-2">

  <div className="text-xs text-slate-500">
    Page {pageIndex + 1}
  </div>

  <div className="flex gap-1">

    <button
      type="button"
      onClick={() =>
        handleMovePage(
          m.id,
          pageIndex,
          pageIndex - 1
        )
      }
      className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
    >
      ←
    </button>

    <button
      type="button"
      onClick={() =>
        handleMovePage(
          m.id,
          pageIndex,
          pageIndex + 1
        )
      }
      className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
    >
      →
    </button>

    <button
      type="button"
      onClick={() =>
        handleRemovePage(
          m.id,
          pageIndex
        )
      }
      className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
    >
      Remove
    </button>

  </div>

</div>

                                </div>

                              )
                            })}

                          </div>

                        )}

                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">

                        <div>
                          <span className="font-medium text-slate-700">
                            Last updated:
                          </span>

                          {" "}
                          {lastUpdated || "—"}
                        </div>

                      </div>

                    </div>

</div>

)}
                </section>

              )
            })}

          </div>

        )}

      </div>

    </div>
  )
}
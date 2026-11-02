//app/providers.tsx
"use client"

import type {ReactNode}from "react"
import {useEffect,useState}from "react"
import {AuthProvider,useAuth}from "react-oidc-context"

const authority=process.env.NEXT_PUBLIC_COGNITO_AUTHORITY||""
const clientId=process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID||""
const siteUrl=(process.env.NEXT_PUBLIC_SITE_URL||"").replace(/\/$/,"")

// Use the address the visitor is actually on (lafaek-tl.vercel.app,
// revista-lafaek.vercel.app, or a future custom domain), so the login
// returns them to the same address it started from. The browser stores a
// one-time security code for the login on that address; if Cognito sends
// them back to a different address the code can't be found and login fails
// with "No matching state found in storage".
// NEXT_PUBLIC_SITE_URL is only used as a fallback while the page is being
// prepared on the server, where there is no browser address yet.
// Every address used here must be listed in Cognito's allowed callback and
// sign-out URLs.
function resolveOrigin(){
  if(typeof window!=="undefined"){return window.location.origin}
  if(siteUrl){return siteUrl}
  return ""
}

function SessionSync(){
  const auth=useAuth()
  const [renewalWarning,setRenewalWarning]=useState<string|null>(null)

  // Keep the server-side cookie in sync with whatever token the OIDC client
  // currently holds — including after a silent renewal updates auth.user.
  //
  // IMPORTANT — this effect only ever SETS the cookie, it never clears it.
  // On every mount/reload (and apparently during some renewal attempts too),
  // react-oidc-context passes through a transient isAuthenticated:false tick
  // before the real state settles. Reactively deleting the cookie on that
  // tick is fundamentally unsafe: there is no reliable way to distinguish
  // "genuinely signed out" from "just hasn't finished loading yet" from
  // inside this effect. An AbortController can cancel a request that's
  // still in flight, but on a fast localhost round-trip the DELETE can
  // complete (and the cookie be gone) before the next render even happens
  // to trigger the abort — so cancellation alone doesn't fully solve it.
  // The only safe fix is to never fire the delete reactively at all.
  // Clearing the cookie belongs in an explicit sign-out action (see the
  // "Sign out" button's handler) which should call
  // `fetch("/api/auth/session", {method:"DELETE"})` directly, alongside
  // whatever it already does with auth.removeUser()/auth.signoutRedirect().
  useEffect(() => {
    if(auth.isLoading){
      return
    }

    const idToken=auth.user?.id_token

    if(!auth.isAuthenticated||!idToken){
      return
    }

    const controller=new AbortController()

    fetch("/api/auth/session",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify({idToken}),
      credentials:"include",
      cache:"no-store",
      signal:controller.signal,
    }).catch((err:any)=>{
      if(err?.name!=="AbortError"){
        console.error("[auth] session cookie sync failed",err)
      }
    })

    return () => {
      controller.abort()
    }
  },[auth.isAuthenticated,auth.isLoading,auth.user])

  // Surface renewal problems instead of letting them fail silently.
  // If these fire, it means automaticSilentRenew attempted a refresh and it
  // didn't work (expired/invalid refresh token, misconfigured app client,
  // network issue, etc.) — the cookie will go stale and the next admin
  // action will bounce to /auth with no warning unless we say something here.
  useEffect(() => {
    const events=auth.events

    const onSilentRenewError=(err:Error)=>{
      console.error("[auth] silent renew failed",err)
      setRenewalWarning(
        "Your sign-in couldn't refresh automatically. Please save any work and log in again soon to avoid losing changes."
      )
    }

    const onAccessTokenExpiring=()=>{
      console.log("[auth] access token expiring — automatic renewal should fire now")
    }

    const onAccessTokenExpired=()=>{
      console.warn("[auth] access token expired — if you don't see a renewal request in the network tab, automatic renewal is not working")
      setRenewalWarning(
        "Your sign-in has expired. Please save any work and log in again."
      )
    }

    events.addSilentRenewError(onSilentRenewError)
    events.addAccessTokenExpiring(onAccessTokenExpiring)
    events.addAccessTokenExpired(onAccessTokenExpired)

    return () => {
      events.removeSilentRenewError(onSilentRenewError)
      events.removeAccessTokenExpiring(onAccessTokenExpiring)
      events.removeAccessTokenExpired(onAccessTokenExpired)
    }
  },[auth.events])

  if(!renewalWarning){
    return null
  }

  return(
    <div className="fixed inset-x-0 top-0 z-[10000] flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow">
      <span>{renewalWarning}</span>
      <button
        type="button"
        onClick={()=>setRenewalWarning(null)}
        className="rounded px-2 py-1 text-xs font-semibold hover:bg-amber-600"
      >
        Dismiss
      </button>
    </div>
  )
}

export default function Providers({children}:{children:ReactNode}){
  const origin=resolveOrigin()
  const redirectUri=origin?`${origin}/auth/callback`:""
  const postLogoutRedirectUri=origin||""

  if(!authority||!clientId||!redirectUri){
    return(
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-3xl px-6 py-14">
          <h1 className="text-2xl font-semibold text-[#333333]">Auth config missing</h1>
          <p className="mt-3 text-[#EB5757]">
            One or more required NEXT_PUBLIC auth values are blank on this deployment.
          </p>

          <div className="mt-6 rounded-xl bg-[#F5F5F5] p-5 text-sm text-[#333333]">
            <div><b>NEXT_PUBLIC_COGNITO_AUTHORITY</b>: {authority?authority:"(blank)"}</div>
            <div className="mt-2"><b>NEXT_PUBLIC_COGNITO_CLIENT_ID</b>: {clientId?clientId:"(blank)"}</div>
            <div className="mt-2"><b>NEXT_PUBLIC_SITE_URL</b>: {siteUrl?siteUrl:"(blank)"}</div>
            <div className="mt-2"><b>Computed redirect_uri</b>: {redirectUri?redirectUri:"(blank)"}</div>
            <div className="mt-2"><b>Computed post_logout_redirect_uri</b>: {postLogoutRedirectUri?postLogoutRedirectUri:"(blank)"}</div>
          </div>

          <p className="mt-6 text-[#4F4F4F]">
            Fix this in Vercel → Project → Settings → Environment Variables (Production),
            then redeploy Production so the values are baked into the build.
          </p>
        </main>
      </div>
    )
  }

  const cognitoAuthConfig={
    authority,
    client_id:clientId,
    redirect_uri:redirectUri,
    post_logout_redirect_uri:postLogoutRedirectUri,
    response_type:"code",
    scope:"openid email profile",
    // Explicit rather than relying on the library default, so this is
    // self-documenting and doesn't silently change behaviour on a library
    // upgrade. This is what triggers a background refresh-token exchange
    // shortly before the access token expires, *if* Cognito issued a
    // refresh_token for this app client.
    automaticSilentRenew:true,
  }

  return(
    <AuthProvider {...cognitoAuthConfig}>
      <SessionSync />
      {children}
    </AuthProvider>
  )
}
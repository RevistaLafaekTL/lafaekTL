"use client";

import {useCallback,useEffect,useMemo,useRef,useState}from "react";
import Link from "next/link";
import Image from "next/image";
import {usePathname}from "next/navigation";
import {ChevronDown,Menu,X}from "lucide-react";
import {useLanguage}from "@/lib/LanguageContext";
import {useAuth}from "react-oidc-context";
import {canAccessAdminArea,getUserDisplayName}from "@/lib/auth";

type Lang="en"|"tet";
type MenuKey="programs"|"keepSafe"|"about"|"extras"|"admin"|null;

type NavLink={
  label:string;
  href:string;
  description?:string;
  note?:string;
};

type NavGroup={
  title:string;
  description:string;
  links:NavLink[];
};

export default function Navigation(){
  const pathname=usePathname();
  const auth=useAuth();
  const navRef=useRef<HTMLElement|null>(null);

  const{language,setLanguage}=useLanguage();

  const[openMenu,setOpenMenu]=useState<MenuKey>(null);
  const[mobileOpen,setMobileOpen]=useState(false);

  const isSignedIn=Boolean(auth.user);
  const signedInLabel=isSignedIn?getUserDisplayName():"User";
  const canAccessAdmin=isSignedIn&&canAccessAdminArea();

  const L:Lang=language==="tet"?"tet":"en";

useEffect(()=>{
    const handleClickOutside=(event:MouseEvent)=>{
      if(navRef.current&&!navRef.current.contains(event.target as Node)){
        setOpenMenu(null);
      }
    };

    const handleEscape=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown",handleClickOutside);  // ← back to mousedown
    document.addEventListener("keydown",handleEscape);

    return()=>{
      document.removeEventListener("mousedown",handleClickOutside);
      document.removeEventListener("keydown",handleEscape);
    };
  },[]);

  const content=useMemo(()=>
    ({
      en:{
        brand:"Revista Lafaek",
        logoAlt:"Lafaek Learning Media",
        programs:"Programs",
        keepSafe:"Keep Safe Online",
        about:"About",
        extras:"Extras",
        admin:"Admin",
        signIn:"Login / Signup",
        signOut:"Sign out",
        signedInAs:"Signed in as",
        memberArea:"Member Area",
        en:"EN",
        tet:"TET",
        openMenu:"Open menu",
        closeMenu:"Close menu",
        groups:{
          programs:{
            title:"Programs",
            description:"Explore Lafaek magazines, stories, and learning resources.",
            links:[
              {
                label:"Magazines",
                href:"/publication/magazines",
                description:"Read Lafaek magazine editions."
              },
              {
                label:"Impact & Success Stories",
                href:"/stories/impact",
                description:"Stories showing Lafaek’s work in communities."
              },
              {
                label:"News",
                href:"/stories/news",
                description:"Updates and announcements from Lafaek."
              },

              {
                label:"Learning",
                href:"/learning",
                description:"Learning resources and activities."
              },
              {
                label:"Videos",
                href:"/revista-media",
                description:"Short videos from the field and communities."
              },
             ]
          },
          keepSafe:{
            title:"Keep Safe Online",
            description:"Online safety guidance for children, young people, parents, teachers, and communities.",
            links:[
              {
                label:"Online Safety with Lafaek",
                href:"/cyber",
                description:"Start here for Lafaek’s online safety guidance."
              },
              {
                label:"Children",
                href:"/cyber/children",
                description:"Simple online safety advice and activities for children."
              },
              {
                label:"Youth",
                href:"/cyber/youth",
                description:"Cyber safety topics for young people and teens."
              },
              {
                label:"Parents and Teachers",
                href:"/cyber/adults",
                description:"Guidance for adults supporting children and young people online."
              }
            ]
          },
          about:{
            title:"About",
            description:"Learn about Lafaek’s journey, team, purpose, and future direction.",
            links:[
              {
                label:"About Us",
                href:"/about",
                description:"Who we are and what we do."
              },
              {
                label:"Our Team",
                href:"/our-team",
                description:"Meet the people behind Lafaek."
              },
              {
                label:"Our Journey",
                href:"/our-journey",
                description:"How Lafaek has grown over time."
              },
              {
                label:"Contact",
                href:"/contact",
                description:"Get in touch with the Lafaek team."
              },

            ]
          },
          extras:{
            title:"Extras",
            description:"Extra opportunities, support, and ways to connect with Lafaek.",
            links:[
              {
                label:"Services",
                href:"/services",
                description:"Work with the Lafaek creative team."
              },

              {
                label:"Careers",
                href:"/careers",
                description:"Jobs, volunteering, and creative opportunities."
              }
            ]
          },
          admin:{
            title:"Admin",
            description:"Manage Lafaek website content.",
            links:[
              {
                label:"Admin Dashboard",
                href:"/admin",
                description:"Manage website content and resources."
              }
            ]
          }
        }
      },
      tet:{
        brand:"Revista Lafaek",
        logoAlt:"Lafaek Learning Media",
        programs:"Programa sira",
        keepSafe:"Manten seguransa iha online",
        about:"Kona-ba",
        extras:"Adisionál",
        admin:"Admin",
        signIn:"Tama / Rejistu",
        signOut:"Sai",
        signedInAs:"Tama hanesan",
        memberArea:"Área Membro",
        en:"EN",
        tet:"TET",
        openMenu:"Loke menu",
        closeMenu:"Taka menu",
        groups:{
          programs:{
            title:"Programa sira",
            description:"Haree revista, istória, vídeo, livru, no rekursu aprendizajen Lafaek nian.",
            links:[
              {
                label:"Jornal/Revista",
                href:"/publication/magazines",
                description:"Lee edisaun revista Lafaek nian."
              },
              {
                label:"Istória Impaktu",
                href:"/stories/impact",
                description:"Istória kona-ba servisu Lafaek iha komunidade."
              },
              {
                label:"Notísia",
                href:"/stories/news",
                description:"Atualizasaun no anúnsio husi Lafaek."
              },
              {
                label:"Aprendizajen",
                href:"/learning",
                description:"Rekursu aprendizajen no atividade sira."
              },
              {
                label:"Vídeu sira",
                href:"/revista-media",
                description:"Vídeu badak hosi terrenu no komunidade sira."
              },

            ]
          },
          keepSafe:{
            title:"Manten seguransa iha online",
            description:"Matadalan kona-ba seguransa online ba labarik, joven, inan-aman, manorin, no komunidade.",
            links:[
              {
                label:"Manten seguransa iha online",
                href:"/cyber",
                description:"Hahu iha ne'e ba matadalan seguransa online Lafaek nian."
              },
              {
                label:"Labarik",
                href:"/cyber/children",
                description:"Matadalan simples no atividade seguransa online ba labarik."
              },
              {
                label:"Joven",
                href:"/cyber/youth",
                description:"Tópiku seguransa cyber ba joven sira."
              },
              {
                label:"Inan-aman no Manorin",
                href:"/cyber/adults",
                description:"Matadalan ba adultu sira atu apoia labarik no joven online."
              }
            ]
          },
          about:{
            title:"Kona-ba Ami",
            description:"Hatene kona-ba Revista Lafaek nia jornada, ekipa, vizaun-misaun, no planu ba futuru.",
            links:[
              {
                label:"Kona-ba Ami",
                href:"/about",
                description:"Sé mak ami no saida mak ami halo."
              },
              {
                label:"Ami-nia Ekipa",
                href:"/our-team",
                description:"Koñese, sira ne'ebé halo servisu Lafaek."
              },
              {
                label:"Ami-nia Jornada",
                href:"/our-journey",
                description:"Revista Lafaek nia jornada husi tempu ba tempu."
              },
              {
                label:"Kontaktu",
                href:"/contact",
                description:"Kontaktu ho ekipa Revista Lafaek."
              },

            ]
          },
          extras:{
            title:"Adisionál",
            description:"Oportunidade, apoiu, no maneira atu kontaktu ho Revista Lafaek.",
            links:[
              {
                label:"Servisu sira",
                href:"/services",
                description:"Servisu hamutuk ho ekipa kriativu Lafaek."
              },

              {
                label:"Karreira",
                href:"/careers",
                description:"Servisu, voluntáriu, no oportunidade kriativu."
              }
            ]
          },
          admin:{
            title:"Admin",
            description:"Jere konteúdu website Lafaek nian.",
            links:[
              {
                label:"Admin Dashboard",
                href:"/admin",
                description:"Jere konteúdu no rekursu website nian."
              }
            ]
          }
        }
      }
    }),
  []);

  const t=content[L];

  const isLinkActive=(href:string)=>{
    if(href==="/"){
      return pathname==="/";
    }

    return pathname===href||pathname.startsWith(`${href}/`);
  };

  const isMenuActive=(group:NavGroup)=>{
    return group.links.some((link)=>isLinkActive(link.href));
  };

  const toggleMenu=(menu:MenuKey)=>{
    setOpenMenu((current)=>current===menu?null:menu);
  };

  const closeMenus=()=>{
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleSignOut=useCallback(async()=>{
    const cognitoDomain=(process.env.NEXT_PUBLIC_COGNITO_DOMAIN??"").replace(/\/$/,"");
    const clientId=auth.settings?.client_id??"";
    const logoutUri=
      auth.settings?.post_logout_redirect_uri??
      (typeof window!=="undefined"?window.location.origin:"");

    try{
      await fetch("/api/auth/session",{method:"DELETE"});
    }catch{}

    try{
      await auth.removeUser();
    }catch{}

    try{
      sessionStorage.clear();
      localStorage.removeItem("idToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("lafaek_id_token");
    }catch{}

    closeMenus();

    const destination=
      cognitoDomain&&clientId&&logoutUri
        ?`${cognitoDomain}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${encodeURIComponent(logoutUri)}`
        :"/";

    window.location.href=destination;
  },[auth]);

  const visibleMenus=[
    {key:"programs" as const,label:t.programs,group:t.groups.programs},
    {key:"keepSafe" as const,label:t.keepSafe,group:t.groups.keepSafe},
    {key:"about" as const,label:t.about,group:t.groups.about},
    {key:"extras" as const,label:t.extras,group:t.groups.extras},
    ...(canAccessAdmin?[{key:"admin" as const,label:t.admin,group:t.groups.admin}]:[])
  ];

  const renderLanguageToggle=()=>{
  const languageOptions:[Lang,string,string][]= [
    ["tet","TET","Troka lian ba Tetun"],
    ["en","EN","Switch language to English"]
  ];

  return(
    <div
      role="group"
      aria-label="Language selector"
      className="inline-flex min-h-10 overflow-hidden rounded-full border border-white/70 bg-white p-1 shadow-sm"
    >
      {languageOptions.map(([value,label,ariaLabel])=>{
        const active=L===value;

        return(
          <button
            key={value}
            type="button"
            onClick={()=>{
              setLanguage(value);
              setOpenMenu(null);
            }}
            aria-label={ariaLabel}
            aria-pressed={active}
            className={`min-h-8 min-w-12 rounded-full px-3 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-[#F2C94C] ${
              active
                ?"bg-[#F2C94C] text-[#333333] shadow-sm"
                :"bg-white text-[#1B7F46] hover:bg-[#EAF8F0]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

  const renderMegaMenu=(group:NavGroup)=>(
    <div className="absolute left-1/2 top-full z-[10000] mt-4 w-[min(960px,calc(100vw-2rem))] -translate-x-1/2 rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <div className="rounded-2xl bg-[#EAF8F0] p-5">
          <h3 className="text-lg font-bold text-[#219653]">
            {group.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#4F4F4F]">
            {group.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {group.links.map((link)=>(
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenus}
              className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:border-[#219653] hover:bg-[#F5F5F5] hover:shadow-sm ${
                isLinkActive(link.href)
                  ?"border-[#219653] bg-[#EAF8F0]"
                  :"border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`text-sm font-bold ${
                  isLinkActive(link.href)?"text-[#219653]":"text-[#333333]"
                }`}>
                  {link.label}
                </span>

                {link.note&&(
                  <span className="shrink-0 rounded-full bg-[#F2C94C] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#333333]">
                    {link.note}
                  </span>
                )}
              </div>

              {link.description&&(
                <p className="mt-2 text-xs leading-5 text-[#828282]">
                  {link.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMobileGroup=(menu:{
    key:"programs"|"keepSafe"|"about"|"extras"|"admin";
    label:string;
    group:NavGroup;
  })=>(
    <div key={menu.key} className="border-b border-white/15 py-2">
      <button
        type="button"
        onClick={()=>toggleMenu(menu.key)}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold ${
          openMenu===menu.key||isMenuActive(menu.group)
            ?"bg-white text-[#219653]"
            :"text-white hover:bg-white/10"
        }`}
      >
        <span>{menu.label}</span>
        <ChevronDown
          className={`h-4 w-4 transition ${
            openMenu===menu.key?"rotate-180":""
          }`}
        />
      </button>

      {openMenu===menu.key&&(
        <div className="space-y-2 px-4 pb-3 pt-2">
          {menu.group.links.map((link)=>(
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenus}
              className={`block rounded-xl px-4 py-3 text-sm ${
                isLinkActive(link.href)
                  ?"bg-[#F2C94C] font-bold text-[#1B7F46]"
                  :"bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{link.label}</span>
                {link.note&&(
                  <span className="rounded-full bg-[#F2C94C] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#333333]">
                    {link.note}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

return(
    <header
      ref={navRef}
      className="sticky top-0 z-[9999] border-b-2 border-[#F2C94C] bg-[#219653] shadow-md"
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          onClick={closeMenus}
          className="flex shrink-0 items-center gap-3"
          aria-label="Lafaek home"
        >
          <div className="relative h-14 w-14 md:h-16 md:w-16">
            <Image
              src="/logo/lafaek-logo.png"
              alt={t.logoAlt}
              fill
              sizes="(min-width:768px) 64px, 56px"
              className="object-contain"
              priority
            />
          </div>

          <span className="hidden text-2xl font-black text-white sm:inline md:text-3xl">
            {t.brand}
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-2 lg:flex">
          {visibleMenus.map((menu)=>(
            <div key={menu.key} className="relative">
              <button
                type="button"
                onClick={()=>toggleMenu(menu.key)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                  openMenu===menu.key||isMenuActive(menu.group)
                    ?"bg-[#F2C94C] text-[#1B7F46]"
                    :"text-white hover:bg-white/10 hover:text-[#F2C94C]"
                }`}
                aria-expanded={openMenu===menu.key}
              >
                <span>{menu.label}</span>
                <ChevronDown
                  className={`h-4 w-4 transition ${
                    openMenu===menu.key?"rotate-180":""
                  }`}
                />
              </button>

              {openMenu===menu.key&&renderMegaMenu(menu.group)}
            </div>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {renderLanguageToggle()}

          {isSignedIn?(
            <>
              <span className="hidden max-w-[180px] truncate text-sm text-white/90 xl:inline">
                {t.signedInAs} {signedInLabel}
              </span>

              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-white/30 px-4 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-[#219653]"
              >
                {t.signOut}
              </button>
            </>
          ):(
            <Link
              href="/auth"
              onClick={closeMenus}
              className="rounded-full bg-[#F2C94C] px-5 py-2 text-sm font-black text-[#1B7F46] shadow-sm transition hover:bg-white"
            >
              {t.signIn}
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={()=>{
            setMobileOpen((current)=>!current);
            setOpenMenu(null);
          }}
          className="inline-flex items-center justify-center rounded-xl border border-white/30 p-2 text-white hover:bg-white/15 lg:hidden"
          aria-label={mobileOpen?t.closeMenu:t.openMenu}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen?<X className="h-6 w-6"/>:<Menu className="h-6 w-6"/>}
        </button>
      </nav>



      {mobileOpen&&(
        <div
          id="mobile-menu"
          className="relative z-[10000] border-t border-white/15 bg-[#219653] px-4 pb-5 pt-3 shadow-lg lg:hidden"
        >
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            {renderLanguageToggle()}

            {isSignedIn?(
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-white/30 px-4 py-2 text-sm font-bold text-white"
              >
                {t.signOut}
              </button>
            ):(
              <Link
                href="/auth"
                onClick={closeMenus}
                className="rounded-full bg-[#F2C94C] px-4 py-2 text-sm font-black text-[#1B7F46]"
              >
                {t.signIn}
              </Link>
            )}
          </div>

          {isSignedIn&&(
            <div className="mb-2 px-2 text-sm text-white/80">
              {t.signedInAs} {signedInLabel}
            </div>
          )}

          {visibleMenus.map((menu)=>renderMobileGroup(menu))}
        </div>
      )}
    </header>
  );
}

export {Navigation};
"use client";

import Link from "next/link";
import {useLanguage}from "@/lib/LanguageContext";

type FooterLink={
  label:string;
  href:string;
};

export function Footer(){
  const{language}=useLanguage();
  const L=language==="tet"?"tet":"en";

  const content={
    en:{
      description:"Supporting children and families in Timor-Leste through education, creativity, and community engagement.",
      programs:"Programs",
      about:"About",
      contactHeading:"Contact",
      contactBody:"For partnership, sponsorship, or media enquiries, please contact the Lafaek team.",
      contactCta:"Go to Contact Page",
      groups:{
        programs:[
          {label:"Magazines",href:"/publication/magazines"},
          {label:"Impact Stories",href:"/stories/impact"},
          {label:"News",href:"/stories/news"},
          {label:"Learning",href:"/learning"}
        ],
        about:[
          {label:"About Us",href:"/about"},
          {label:"Our Journey",href:"/our-journey"},
          {label:"Our Team",href:"/our-team"}
        ]
      }
    },
    tet:{
      description:"Apoia labarik no família sira iha Timor-Leste liuhusi edukasaun, Kriatividade, no envolvimentu komunidade.",
      programs:"Programa sira",
      about:"Kona-ba Ami",
      contactHeading:"Kontaktu",
      contactBody:"Hakarak parseria, sponsor, ka enkuadramentu konaba média, favór kontaktu Ekipa Lafaek.",
      contactCta:"Ba iha parte Pajina kontaktu nian",
      groups:{
        programs:[
          {label:"Revista",href:"/publication/magazines"},
          {label:"Istória Impaktu",href:"/stories/impact"},
          {label:"Notísia",href:"/stories/news"},
          {label:"Aprendizajen",href:"/learning"}
        ],
        about:[
          {label:"Kona-ba Ami",href:"/about"},
          {label:"Ami-nia Viajen",href:"/our-journey"},
          {label:"Ami-nia Ekipa",href:"/our-team"}
        ]
      }
    }
  } as const;

  const t=content[L];

  const renderLinks=(links:readonly FooterLink[])=>(
    <ul className="space-y-2 text-sm text-gray-300">
      {links.map((link)=>(
        <li key={link.href}>
          <Link
            href={link.href}
            className="hover:text-white hover:underline"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return(
    <footer className="bg-[#0F172A] text-white py-12 px-4 mt-16">
      <div className="max-w-7xl mx-auto border-b border-white/10 pb-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-block">
              <h3 className="text-xl font-bold mb-4">Lafaek TL</h3>
            </Link>
            <p className="text-sm text-gray-300">
              {t.description}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">{t.programs}</h4>
            {renderLinks(t.groups.programs)}
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">{t.about}</h4>
            {renderLinks(t.groups.about)}
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">{t.contactHeading}</h4>
            <p className="text-sm text-gray-300">
              {t.contactBody}
            </p>
            <p className="mt-3 text-sm text-gray-300">
              <Link href="/contact" className="underline hover:text-white">
                {t.contactCta}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-6">
        © {new Date().getFullYear()} Lafaek TL. All rights reserved.
      </div>
    </footer>
  );
}
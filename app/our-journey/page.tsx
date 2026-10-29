"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";

type Lang = "en" | "tet";

// A block is either a paragraph (string) or a bullet list (string[]).
type Block = string | string[];

type Era = {
  id: string;
  period: string;
  title: string;
  blocks: Block[];
};

type Stat = { number: string; label: string };

type JourneyContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  heroAlt: string;
  jumpLabel: string;
  eras: Era[];
  today: {
    title: string;
    blocks: string[];
    stats: Stat[];
  };
  video: { title: string; cta: string };
  closing: {
    title: string;
    paragraphs: string[];
    lead: string;
    motto: string;
  };
};

const YT_WATCH = "https://youtu.be/nVV9UK6cq5E";
const YT_EMBED = "https://www.youtube.com/embed/nVV9UK6cq5E";

const content: Record<Lang, JourneyContent> = {
  en: {
    eyebrow: "Our Journey",
    title: "The Journey of Revista LAFAEK",
    subtitle: "From Crisis to Hope, from a Magazine to a National Learning Media",
    heroAlt: "Lafaek resting by the sea",
    jumpLabel: "Jump to a period",
    eras: [
      {
        id: "1994",
        period: "1994–1999",
        title: "CARE's Presence and the Education Challenge",
        blocks: [
          "CARE International began working in Timor-Leste in 1994, at first as part of CARE Indonesia. At that time, CARE's work focused mainly on humanitarian response and support for communities affected by conflict.",
          "After the popular referendum of 30 August 1999, Timor-Leste faced a very difficult situation. The violence destroyed a great deal of public infrastructure, including school buildings, and the education system had a serious shortage of teachers and learning materials.",
          "At that time, there were almost no educational materials in Tetun. As a result, children, especially in rural and remote areas, found it hard to get reading materials that reflected their language, culture and everyday lives.",
          "The idea of creating Revista LAFAEK grew out of this situation.",
        ],
      },
      {
        id: "2000",
        period: "2000–2001",
        title: "LAFAEK's Conception and First Distribution",
        blocks: [
          "In 2000, CARE began developing Revista LAFAEK in response to education needs after the crisis. The magazine aimed to promote the Tetun language, support learning, and bring children messages of peace, unity and hope.",
          "CARE formed a Timorese team of writers, illustrators, graphic designers, education specialists, field staff, drivers and logistics staff. Together, the team created the content and delivered the magazine to students.",
          "The name \"LAFAEK\", which means crocodile in Tetun, was chosen because of its strong connection to Timor-Leste's identity, culture and legends.",
          "The first edition of Revista LAFAEK was distributed in early 2001. LAFAEK became a nationwide educational publication in Tetun and helped to start a new reading culture in schools and families.",
        ],
      },
      {
        id: "2004",
        period: "2004–2010",
        title: "Partnership with the Ministry of Education and Expansion into Schools",
        blocks: [
          "In 2004, the Ministry of Education approached CARE to develop Revista LAFAEK as a supplementary teaching material to support the national curriculum.",
          "With support from the World Bank and in partnership with the Ministry of Education, LAFAEK expanded its products to cover different levels of education. Magazines were developed for students from pre-school to Basic Education, as well as for teachers.",
          "During this period, LAFAEK's products included:",
          [
            "Lafaek Ki'ik for pre-school students and Grades 1–2",
            "Lafaek Prima for students in the next grade levels",
            "Revista Lafaek for students in higher grades",
            "Lafaek Edukadór for teachers",
          ],
          "As well as producing and distributing the magazines, the LAFAEK project ran training on teaching methods, civic education and child-centred learning. The magazines' content promoted literacy, numeracy, gender equality, children's rights, peace and active participation in learning.",
          "An external evaluation in 2010 showed that most teachers and students used the magazines regularly and remembered messages from earlier editions. This showed that LAFAEK was more than just reading material. It had become an important learning tool in both the classroom and the home.",
        ],
      },
      {
        id: "2010",
        period: "2010–2014",
        title: "From the Classroom to the Household",
        blocks: [
          "In 2010, production of some school magazines entered a transition period and did not continue in the same form. Even so, students and teachers still showed a strong need for Revista LAFAEK.",
          "In the same year, CARE received support from the New Zealand Aid Programme (MFAT) to run a pilot of Lafaek ba Komunidade. The pilot was implemented in Liquiçá, Ermera, Bobonaro and Covalima and distributed the magazine to around 20,000–22,000 households.",
          "Lafaek ba Komunidade was developed for adults, especially people with limited access to information and limited reading skills. The magazine provided practical information on health, nutrition, agriculture, hygiene, household finances and wellbeing.",
          "It also included content for children aged 4–6 to build basic literacy and numeracy before they started formal school.",
          "The final evaluation of the pilot showed that most families remembered the messages they had read and applied ideas from the magazine in their daily lives. This success showed that LAFAEK could take learning beyond the classroom and into households and communities.",
        ],
      },
      {
        id: "2014",
        period: "2014–2019",
        title: "Restarting the School Magazines and Expanding National Reach",
        blocks: [
          "Based on the pilot results and the needs of schools and communities, the New Zealand Aid Programme (MFAT) continued its support for LAFAEK from June 2014 to June 2019.",
          "In partnership with the Ministry of Education, CARE restarted and expanded production of Lafaek Ki'ik, Lafaek ba Manorin and Lafaek ba Komunidade, reaching rural and remote areas across the country.",
          "In 2016, through a partnership with the Australian Government and with funding from the Department of Foreign Affairs and Trade (DFAT), LAFAEK introduced Lafaek Prima. This magazine was developed for students in Grades 3–6 and filled the gap between Lafaek Ki'ik and learning materials for higher grades.",
          "With the addition of Lafaek Prima, the LAFAEK family of products became even more complete:",
          [
            "Lafaek Ki'ik for pre-school and Grades 1–2",
            "Lafaek Prima for Grades 3–6",
            "Lafaek ba Manorin for educators and teachers",
            "Lafaek ba Komunidade for families and communities",
          ],
          "With this, LAFAEK grew from a single children's magazine into a learning media system that connects students, teachers, parents and communities.",
        ],
      },
      {
        id: "2017",
        period: "2017–2021",
        title: "The Journey towards a Digital Platform and Social Enterprise",
        blocks: [
          "In July 2017, LAFAEK took its first digital step with Lafaek online and a Facebook page. These platforms allowed LAFAEK to reach young people in urban areas and share educational information with a wider audience.",
          "LAFAEK's online presence kept growing through Facebook, YouTube and its website. These platforms became places to share stories, educational materials and development information, and gave young people the chance to share their ideas and opinions.",
          "At the same time, CARE began developing a plan to transform LAFAEK into an independent, Timorese-led social enterprise. The model would combine donor support with LAFAEK's own income from sponsorship, advertising, media production and creative services.",
          "The main goal of this transformation was to make sure the magazines could still be distributed free of charge to children, teachers and families in rural and remote areas.",
          "In 2020–2021, LAFAEK passed the 20-year mark. The 2021 Midline Evaluation confirmed that the project had grown from a single children's magazine into a family of four magazines serving students, teachers and communities nationwide.",
        ],
      },
      {
        id: "2022",
        period: "2022–2025",
        title: "Advocacy, Localisation and Digital Transformation",
        blocks: [
          "From 2022, LAFAEK strengthened its advocacy work through its 2022–2027 Advocacy Plan. The plan guides collaboration with the Ministry of Education, the Ministry of Social Solidarity and Inclusion, donors, civil society organisations and development partners.",
          "During this period, LAFAEK also moved further towards localisation. The long-term vision is for LAFAEK to become a registered, Timorese-led local entity that can manage its own programmes, resources and partnerships.",
          "Digital transformation became an important part of this journey. The team began developing and improving the LAFAEK website, setting up a digital library of the magazines and exploring the idea of a mobile app to make educational content easier to access.",
          "Sponsorships and partnerships also kept growing. Many national and international organisations use Revista LAFAEK to share important messages on education, health, nutrition, agriculture, child protection, gender equality, inclusion and wellbeing.",
        ],
      },
      {
        id: "2025",
        period: "2025–2026",
        title: "Celebrating 25 Years and Preparing for the Future",
        blocks: [
          "In 2025, LAFAEK celebrated 25 years since it was conceived in 2000. In 2026, the celebration continues with the 25th anniversary of the first magazine's distribution in 2001.",
          "This milestone is a chance to reflect on LAFAEK's journey. It began with the education needs that arose from the 1999 crisis, grew into a children's magazine, and became a nationally recognised learning media platform.",
          "Looking to the future, LAFAEK will keep innovating and adapting to new technology to bring its content to the digital generation. LAFAEK will also look for support and strengthen partnerships to secure its sustainability and keep benefiting children, teachers and communities.",
        ],
      },
    ],
    today: {
      title: "LAFAEK today",
      blocks: [
        "LAFAEK still operates as part of CARE International in Timor-Leste and publishes its magazines three times a year. The magazines are distributed across the whole country, including rural and remote areas, Ataúro and RAEOA.",
        "Lafaek Ki'ik and Lafaek Prima reach nearly 250,000 students. Lafaek ba Manorin reaches more than 12,000 teachers, and Lafaek ba Komunidade reaches more than 103,000 households.",
        "Content for students and teachers is aligned with the National Curriculum and supports literacy, numeracy, science, health, hygiene, creativity and critical thinking. It also promotes gender equality, women's leadership, disability inclusion and children's rights.",
        "Lafaek ba Komunidade continues to provide practical information on agriculture, health, nutrition, financial literacy, protection, disaster preparedness and household finances to support communities in their daily lives.",
      ],
      stats: [
        { number: "≈ 250,000", label: "Lafaek Ki'ik & Lafaek Prima" },
        { number: "12,000+", label: "Lafaek ba Manorin" },
        { number: "103,000+", label: "Lafaek ba Komunidade" },
      ],
    },
    video: { title: "Documentary", cta: "Watch on YouTube" },
    closing: {
      title: "The Journey Continues",
      paragraphs: [
        "Over 25 years, LAFAEK has done more than publish magazines. It has helped promote the Tetun language, grow a reading culture, support teachers, connect learning between school and home, and bring information to communities that are hardest to reach.",
        "LAFAEK began as a simple magazine born in a time of crisis. It has grown into part of Timor-Leste's educational heritage and a national learning media.",
      ],
      lead:
        "LAFAEK's journey is not over. With Timorese leadership, strong partnerships, digital innovation and a commitment to inclusive education, LAFAEK carries its spirit forward:",
      motto: "Bringing Education to Life.",
    },
  },

  tet: {
    eyebrow: "Ami-nia Jornada",
    title: "Istória Jornada Revista LAFAEK",
    subtitle: "Husi Krize ba Esperansa, husi Revista ba Mídia Aprendizajen Nasionál",
    heroAlt: "Lafaek deskansa iha tasi ninin",
    jumpLabel: "Ba períodu ida",
    eras: [
      {
        id: "1994",
        period: "1994–1999",
        title: "CARE nia Prezensa no Desafiu Edukasaun",
        blocks: [
          "CARE International hahú servisu iha Timor-Leste iha tinan 1994, uluk nu’udar parte husi CARE Indonézia. Iha tempu ne’ebá, CARE nia servisu foka liuliu ba resposta umanitária no apoiu ba komunidade sira ne’ebé afetadu husi konflitu.",
          "Depois referendu populár iha 30 Agostu 1999, Timor-Leste hasoru situasaun ne’ebé difisil tebes. Violénsia estraga infraestrutura públika barak, inklui edifísiu eskola, no sistema edukasaun hasoru falta boot ba manorin no materiál aprendizajen.",
          "Iha tempu ne’ebá, materiál edukasionál iha lian Tetun kuaze laiha. Situasaun ida-ne’e halo labarik sira, liuliu iha área rurál no remota, hasoru difikuldade atu hetan materiál leitura ne’ebé relevante ho sira-nia lian, kultura no realidade moris.",
          "Husi realidade ida-ne’e mak ideia atu kria Revista LAFAEK hahú moris.",
        ],
      },
      {
        id: "2000",
        period: "2000–2001",
        title: "LAFAEK nia Konsepsaun no Distribuisaun Dahuluk",
        blocks: [
          "Iha tinan 2000, CARE hahú dezenvolve Revista LAFAEK nu’udar resposta ba nesesidade edukasaun depois krize. Revista ne’e dezenvolve ho objetivu atu promove lian Tetun, apoia prosesu aprendizajen no lori mensajen kona-ba dame, unidade no esperansa ba labarik sira.",
          "CARE forma ekipa Timoroan ne’ebé kompostu husi hakerek-na’in, ilustradór, dezeñador ba gráfiku, espesialista edukasaun, pesoál kampu, motorista no ekipa lojístika. Ekipa ida-ne’e servisu hamutuk atu kria konteúdu no lori revista ba kanorin sira.",
          "Naran “LAFAEK”, ne’ebé signifika krokodilu iha lian Tetun, hili tanba ninia ligasaun forte ho identidade, kultura no lenda Timor-Leste nian.",
          "Iha inísiu tinan 2001, Revista LAFAEK nia edisaun dahuluk hahú distribui. LAFAEK sai nu’udar publikasaun edukasionál iha lian Tetun ida ho alkansa nasionál no ajuda hahú kultura leitura foun iha eskola no família sira.",
        ],
      },
      {
        id: "2004",
        period: "2004–2010",
        title: "Parseria ho Ministériu Edukasaun no Espansaun ba Eskola",
        blocks: [
          "Iha tinan 2004, Ministériu Edukasaun aproxima CARE atu dezenvolve Revista LAFAEK sai materiál didátiku suplementár ne’ebé bele apoia implementasaun kurríkulu nasionál.",
          "Ho apoiu husi Banku Mundiál no parseria ho Ministériu Edukasaun, LAFAEK habelar ninia produtu atu atende nivel edukasaun oin-oin. Revista sira dezenvolve ba kanorin husi pre-eskolár to’o Ensinu Báziku, no mós ba manorin sira.",
          "Iha períodu ida-ne’e, produtu LAFAEK inklui:",
          [
            "Lafaek Ki’ik ba kanorin pre-eskolár no klase 1–2",
            "Lafaek Prima ba kanorin iha nivel klase tuirmai",
            "Revista Lafaek ba kanorin klase aas",
            "Lafaek Edukadór ba manorin sira",
          ],
          "Aleinde prodús no distribui revista, projetu LAFAEK mós organiza formasaun kona-ba metodologia ensinu, edukasaun sívika no aprendizajen ne’ebé sentradu ba labarik. Konteúdu revista promove literasia, numerasia, igualdade jéneru, direitu labarik, dame no partisipasaun ativa iha prosesu aprendizajen.",
          "Avaliasaun externa iha 2010 hatudu katak maioria boot husi manorin no kanorin sira uza revista regularmente no lembra mensajen ne’ebé sira lee iha edisaun sira antes. Rezultadu ida-ne’e demonstra katak LAFAEK la’ós de’it materiál leitura, maibé sai ona instrumentu importante ba aprendizajen iha sala de aula no uma.",
        ],
      },
      {
        id: "2010",
        period: "2010–2014",
        title: "Husi Sala de aula ba Uma-kain",
        blocks: [
          "Iha tinan 2010, produsaun revista eskola balun tama ba períodu tranzisaun no la kontinua iha forma hanesan antes. Maski nune’e, kanorin no manorin sira kontinua hatudu nesesidade boot ba Revista LAFAEK.",
          "Iha tinan hanesan, CARE hetan apoiu husi Programa Asisténsia Nova Zelándia (MFAT) atu hala’o projetu pilotu Lafaek ba Komunidade. Pilotu ne’e implementa iha Liquiçá, Ermera, Bobonaro no Covalima, hodi distribui revista ba kuaze uma-kain 20.000–22.000.",
          "Lafaek ba Komunidade dezenvolve ba adultu sira, liuliu ema ne’ebé asesu ba informasaun no kapasidade leitura limitadu. Revista ne’e lori informasaun prátika kona-ba saúde, nutrisaun, agrikultura, ijiene, ekonomia família no moris-di’ak.",
          "Iha revista ne’e nia laran, inklui mós kontéudu ba labarik idade tinan 4–6, ho objetivu atu dezenvolve literasia no numerasia bázika antes sira tama ba eskola formál.",
          "Avaliasaun finál pilotu hatudu katak maioria boot husi família sira lembra mensajen ne’ebé sira lee no aplika ideia husi revista iha sira-nia moris loroloron. Susesu ida-ne’e demonstra katak LAFAEK bele lori aprendizajen liu husi sala de aula to’o iha uma-kain no komunidade.",
        ],
      },
      {
        id: "2014",
        period: "2014–2019",
        title: "Hahú Fali Revista Eskola no Habelar Alkansa Nasionál",
        blocks: [
          "Bazeia ba rezultadu pilotu no nesesidade husi eskola no komunidade, Programa Asisténsia Nova Zelándia ka MFAT kontinua ninia apoiu ba LAFAEK husi Juñu 2014 to’o Juñu 2019.",
          "Iha parseria ho Ministériu Edukasaun, CARE hahú fali no habelar produsaun Lafaek Ki’ik, Lafaek ba Manorin no Lafaek ba Komunidade ba área rurál no remota iha territóriu tomak.",
          "Iha tinan 2016, liuhusi parseria ho Governu Austrália no apoiu finanseiru husi Departamentu Negósiu Estranjeiru no Komérsiu ka DFAT, LAFAEK introdús Lafaek Prima. Revista ida-ne’e dezenvolve atu atende kanorin husi klase 3–6 no taka lakuna entre Lafaek Ki’ik no materiál aprendizajen ba nivel klase aas.",
          "Ho adisaun Lafaek Prima, família produtu LAFAEK sai kompletu liután:",
          [
            "Lafaek Ki’ik ba pre-eskolár no klase 1–2",
            "Lafaek Prima ba klase 3–6",
            "Lafaek ba Manorin ba edukadór no manorin",
            "Lafaek ba Komunidade ba família no komunidade",
          ],
          "Husi ne’e, LAFAEK transforma husi revista labarik ida sai sistema mídia aprendizajen ne’ebé liga kanorin, manorin, inan-aman no komunidade.",
        ],
      },
      {
        id: "2017",
        period: "2017–2021",
        title: "Jornada ba Plataforma Dijitál no Empreza Sosiál",
        blocks: [
          "Iha Jullu 2017, LAFAEK hahú ninia pasu dijitál liuhusi Lafaek online no pájina Facebook. Plataforma ida-ne’e permite LAFAEK atinji joven sira iha área urbana no fahe informasaun edukasionál ho públiku ne’ebé luan liután.",
          "LAFAEK nia prezensa online kontinua aumenta liuhusi Facebook, YouTube no website. Plataforma sira-ne’e sai fatin atu fahe istória, materiál edukasionál, informasaun dezenvolvimentu no oportunidade ba joven sira atu fahe sira-nia ideia no opiniaun.",
          "Iha tempu hanesan, CARE hahú dezenvolve planu atu transforma LAFAEK ba empreza sosiál ne’ebé independente no lidera husi Timoroan. Modelu ne’e planeia kombina apoiu doadór ho rendimentu rasik husi esponsorizasaun, publisidade, produsaun mídia no servisu kreativu.",
          "Objetivu boot husi transformasaun ida-ne’e mak atu garante katak revista bele kontinua distribui gratuitamente ba labarik, manorin no família sira ne’ebé hela iha área rurál no remota.",
          "Iha 2020–2021, LAFAEK marka liu ona tinan 20 nia jornada. Avaliasaun Midline iha 2021 konfirma katak projetu kontinua evolui husi revista labarik ida sai família revista haat ne’ebé atende kanorin, manorin no komunidade iha nivel nasionál.",
        ],
      },
      {
        id: "2022",
        period: "2022–2025",
        title: "Advokasia, Lokalizasaun no Transformasaun Dijitál",
        blocks: [
          "Husi 2022, LAFAEK haforsa ninia servisu advokasia liuhusi Planu Advokasia 2022–2027. Planu ne’e orienta kolaborasaun ho Ministériu Edukasaun, Ministériu Solidariedade Sosiál no Inkluzaun, doadór, organizasaun sosiedade sivíl no parseiru dezenvolvimentu.",
          "Iha períodu ida-ne’e, LAFAEK mós haforsa prosesu lokalizasaun. Vizaun ba tempu naruk mak atu dezenvolve LAFAEK sai entidade lokál ne’ebé rejistadu no lidera husi Timoroan, ho kapasidade atu jere programa, rekursu no parseria rasik.",
          "Transformasaun dijitál sai parte importante husi jornada ida-ne’e. Ekipa hahú dezenvolve no hadi’a website LAFAEK, organiza biblioteka dijitál ba revista no esplora konseitu aplikasaun móvel ne’ebé bele fasilita asesu ba kontéudu edukasionál.",
          "Esponsorizasaun no parseria mós kontinua dezenvolve. Organizasaun nasionál no internasionál oin-oin uza Revista LAFAEK atu fahe mensajen importante kona-ba edukasaun, saúde, nutrisaun, agrikultura, protesaun labarik, igualdade jéneru, inkluzaun no moris-di’ak.",
        ],
      },
      {
        id: "2025",
        period: "2025–2026",
        title: "Selebra Tinan 25 no Prepara ba Futuru",
        blocks: [
          "Iha 2025, LAFAEK selebra tinan 25 dezde ninia konsepsaun iha 2000. Iha 2026, selebrasaun ne’e kontinua ho aniversáriu tinan 25 dezde distribuisaun revista dahuluk iha 2001.",
          "Etapa importante ida-ne’e fó oportunidade atu reflete kona-ba LAFAEK nia jornada: hahú husi nesesidade edukasionál ne’ebé mosu iha krize 1999, dezenvolve revista ba labarik, no sai plataforma mídia aprendizajen ne’ebé rekoñesidu iha nivel nasionál.",
          "Ho vizaun ba futuru, LAFAEK sei kontinua inova no adapta an ba dezenvolvimentu teknolojia, hodi lori ninia kontéudu ba jerasaun dijitál. LAFAEK mós sei buka apoiu no haforsa parseria atu asegura ninia sustentabilidade no kontinua fó benefísiu ba labarik, manorin no komunidade sira.",
        ],
      },
    ],
    today: {
      title: "LAFAEK ohin loron",
      blocks: [
        "LAFAEK kontinua opera nu’udar parte husi CARE International iha Timor-Leste, ho publikasaun revista dala tolu kada tinan. Revista sira distribui iha territóriu tomak, inklui área rurál no remota, Ataúro no RAEOA.",
        "Lafaek Ki’ik no Lafaek Prima to’o ba kanorin kuaze 250.000; Lafaek ba Manorin atinji manorin liu 12.000; no Lafaek ba Komunidade to’o ba uma-kain liu 103.000.",
        "Konteúdu ba kanorin no manorin aliña ho Kurríkulu Nasionál, hodi apoia literasia, numerasia, siénsia, saúde, higiene, kreatividade no pensamentu krítiku. Konteúdu sira-ne’e mós promove igualdade jéneru, lideransa feto, inkluzaun ema ho defisiénsia no direitu labarik.",
        "Lafaek ba Komunidade kontinua disponibiliza informasaun prátika kona-ba agrikultura, saúde, nutrisaun, literasia finanseira, protesaun, preparasaun ba dezastre no ekonomia família, hodi apoia komunidade sira iha sira-nia moris loroloron.",
      ],
      stats: [
        { number: "≈ 250.000", label: "Lafaek Ki’ik & Lafaek Prima" },
        { number: "12.000+", label: "Lafaek ba Manorin" },
        { number: "103.000+", label: "Lafaek ba Komunidade" },
      ],
    },
    video: { title: "Dokumentáriu", cta: "Haree iha YouTube" },
    closing: {
      title: "Jornada Kontinua",
      paragraphs: [
        "Durante tinan 25, LAFAEK la’ós de’it publika revista. LAFAEK mos ajuda promove lian Tetun, haburas kultura leitura, suporta manorin, liga aprendizajen entre eskola no uma, no lori informasaun ba komunidade sira ne’ebé difisil liu atu asesu ba.",
        "Husi revista simples ida ne’ebé moris iha situasaun krize, LAFAEK dezenvolve sai patrimóniu edukasionál no mídia aprendizajen Timor-Leste nian.",
      ],
      lead:
        "Jornada LAFAEK seidauk remata. Ho lideransa Timoroan, parseria forte, inovasaun dijitál no kompromisu ba edukasaun inkluziva, LAFAEK kontinua lori ninia espíritu:",
      motto: "Halo Edukasaun Sai Moris.",
    },
  },
};

// ---------------------------------------------------------------------------
// Type scale: same as the About page so the two pages match.
// ---------------------------------------------------------------------------
const type = {
  h1: "text-4xl md:text-5xl font-extrabold leading-tight",
  h2: "text-3xl md:text-4xl font-bold leading-tight",
  h3: "text-2xl font-bold leading-snug",
  h4: "text-xl font-bold leading-snug",
  lead: "text-xl leading-relaxed font-semibold",
  body: "text-lg leading-8",
  label: "text-sm font-bold uppercase tracking-widest",
  stat: "text-4xl font-extrabold leading-none",
  statLabel: "text-base leading-6",
};

const bodyColour = "text-gray-700";
const headingColour = "text-[#333333]";

// Each period takes the next Lafaek colour in turn.
type EraColour = { dot: string; text: string; soft: string };

const DEFAULT_COLOUR: EraColour = { dot: "bg-[#219653]", text: "text-[#219653]", soft: "bg-green-50" };

const eraColours: EraColour[] = [
  DEFAULT_COLOUR,
  { dot: "bg-[#2F80ED]", text: "text-[#2F80ED]", soft: "bg-blue-50" },
  { dot: "bg-[#E0A800]", text: "text-[#9A7400]", soft: "bg-yellow-50" },
  { dot: "bg-[#EB5757]", text: "text-[#C0392B]", soft: "bg-red-50" },
];

// Always returns a colour, so TypeScript knows it is never undefined.
function colourAt(index: number): EraColour {
  return eraColours[index % eraColours.length] ?? DEFAULT_COLOUR;
}

function ColourBar() {
  return (
    <span className="mb-4 flex gap-1" aria-hidden="true">
      <span className="h-2 w-8 rounded-full bg-[#219653]" />
      <span className="h-2 w-8 rounded-full bg-[#2F80ED]" />
      <span className="h-2 w-8 rounded-full bg-[#F2C94C]" />
      <span className="h-2 w-8 rounded-full bg-[#EB5757]" />
    </span>
  );
}

export default function OurJourneyPage() {
  const { language } = useLanguage();
  const L: Lang = language === "tet" ? "tet" : "en";
  const t = content[L];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-gradient-to-br from-green-50 via-white to-blue-50">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:py-20 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ColourBar />
              <p className={`mb-3 ${type.label} text-[#219653]`}>{t.eyebrow}</p>
              <h1 className={`${type.h1} text-[#219653]`}>{t.title}</h1>
              <p className={`mt-4 ${type.lead} text-[#2F80ED]`}>{t.subtitle}</p>
            </div>
            <div className="relative h-56 w-full md:h-72 lg:col-span-5">
              <Image
                src="/characters/tasi-sleep.jpg"
                alt={t.heroAlt}
                fill
                sizes="(min-width:1024px) 40vw, 100vw"
                className="rounded-3xl object-contain"
                priority
              />
            </div>
          </div>
        </section>

        {/* Period navigation */}
        <nav aria-label={t.jumpLabel} className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl overflow-x-auto px-4">
            <ul className="flex gap-2 py-3">
              {t.eras.map((era) => (
                <li key={era.id} className="shrink-0">
                  <a
                    href={`#era-${era.id}`}
                    className="inline-block rounded-full border border-gray-200 px-4 py-2 text-base font-semibold text-gray-700 transition hover:border-[#219653] hover:text-[#219653]"
                  >
                    {era.period}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Timeline */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <ol className="relative">
              {/* Vertical line */}
              <span
                className="absolute bottom-0 left-[11px] top-2 w-1 rounded-full bg-gradient-to-b from-[#219653] via-[#2F80ED] to-[#EB5757] md:left-[15px]"
                aria-hidden="true"
              />

              {t.eras.map((era, i) => {
                const c = colourAt(i);

                return (
                  <li
                    key={era.id}
                    id={`era-${era.id}`}
                    className="relative scroll-mt-24 pb-14 pl-10 last:pb-0 md:pl-16"
                  >
                    {/* Dot */}
                    <span
                      className={`absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white shadow md:h-9 md:w-9 ${c.dot}`}
                      aria-hidden="true"
                    />

                    <p className={`${type.label} ${c.text}`}>{era.period}</p>
                    <h2 className={`mt-2 mb-6 ${type.h3} ${headingColour}`}>{era.title}</h2>

                    <div className="space-y-5">
                      {era.blocks.map((block, j) =>
                        Array.isArray(block) ? (
                          <ul key={j} className={`space-y-2 rounded-2xl p-5 ${c.soft}`}>
                            {block.map((item) => (
                              <li key={item} className={`flex gap-3 ${type.body} text-gray-800`}>
                                <span className={`mt-3 h-2 w-2 shrink-0 rounded-full ${c.dot}`} />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p key={j} className={`${type.body} ${bodyColour}`}>
                            {block}
                          </p>
                        )
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* LAFAEK today */}
        <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className={`mb-8 ${type.h2} text-[#219653]`}>{t.today.title}</h2>

            <div className="mb-10 grid gap-4 sm:grid-cols-3">
              {t.today.stats.map((stat, i) => {
                const c = colourAt(i);
                return (
                  <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className={`${type.stat} ${c.text}`}>{stat.number}</div>
                    <div className={`mt-3 ${type.statLabel} font-semibold ${bodyColour}`}>{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {t.today.blocks.map((p) => (
                <p key={p} className={`${type.body} ${bodyColour}`}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Documentary */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className={`${type.h2} ${headingColour}`}>{t.video.title}</h2>
              <a
                href={YT_WATCH}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#2F80ED] px-6 py-3 text-base font-bold text-white shadow transition hover:bg-blue-600"
              >
                {t.video.cta}
              </a>
            </div>
            <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute inset-0 h-full w-full"
                src={YT_EMBED}
                title={t.video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* The journey continues */}
        <section className="bg-[#219653] py-16 text-white md:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className={`mb-6 ${type.h2}`}>{t.closing.title}</h2>
            <div className={`space-y-5 ${type.body} text-white/95`}>
              {t.closing.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p>{t.closing.lead}</p>
            </div>
            <p className={`mt-8 ${type.h2} text-[#F2C94C]`}>{t.closing.motto}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
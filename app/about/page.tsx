"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

type Lang = "en" | "tet";

// Rename the file in /public/team to remove the space if you can,
// e.g. /team/lafaek-team.jpg, and update this path.
const TEAM_PHOTO = "/team/LLM-05582 1.jpg";

type Stat = { number: string; label: string };
type Pillar = { title: string; text: string };
type Value = { title: string; points: string[] };
type Magazine = { name: string; audience: string; reach: string; colour: string };
type Step = { title: string; text: string };

type AboutContent = {
  hero: { title: string; subtitle: string; tagline: string; imageAlt: string };
  nav: { id: string; label: string }[];
  care: {
    eyebrow: string;
    whoTitle: string;
    whoText: string;
    stats: Stat[];
    statsNote: string;
    historyTitle: string;
    history: string[];
    humanitarian: string[];
    toLafaekTitle: string;
    toLafaek: string[];
    visionTitle: string;
    visionQuote: string;
    visionText: string;
    pillars: Pillar[];
    missionTitle: string;
    missionQuote: string;
    focusTitle: string;
    focusText: string;
    valuesTitle: string;
    values: Value[];
    code: string[];
  };
  lafaek: {
    title: string;
    tagline: string;
    paragraphs: string[];
  };
  magazines: {
    title: string;
    intro: string;
    audienceLabel: string;
    reachLabel: string;
    items: Magazine[];
    complement: string;
  };
  approach: {
    title: string;
    intro: string;
    steps: Step[];
    connect: string;
    integrateTitle: string;
    integrate: string[];
  };
  contribution: {
    title: string;
    intro: string;
    evalTitle: string;
    stats: Stat[];
    outro: string;
  };
  enterprise: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    visionTitle: string;
    vision: string;
    missionTitle: string;
    mission: string[];
    closing: string;
    magazinesLink: string;
    teamLink: string;
  };
};

const magazineColours = {
  kiik: "bg-[#F2C94C] text-[#333333]",
  prima: "bg-[#2F80ED] text-white",
  manorin: "bg-[#219653] text-white",
  komunidade: "bg-[#EB5757] text-white",
};

const content: Record<Lang, AboutContent> = {
  en: {
    hero: {
      title: "About Us",
      subtitle: "CARE in Timor-Leste & LAFAEK Learning Media",
      tagline: "Learning that connects schools, families and communities",
      imageAlt: "The LAFAEK Learning Media team",
    },
    nav: [
      { id: "care", label: "CARE in Timor-Leste" },
      { id: "lafaek", label: "LAFAEK" },
      { id: "magazines", label: "Our Magazines" },
      { id: "approach", label: "Approach" },
      { id: "contribution", label: "Contribution" },
      { id: "social-enterprise", label: "Social Enterprise" },
    ],
    care: {
      eyebrow: "About CARE in Timor-Leste",
      whoTitle: "Who We Are",
      whoText:
        "CARE Timor Leste is a global confederation of independent national organisations in many countries. CARE has worked in Timor-Leste since 1994. Its programmes focus on education, health, women's economic empowerment and strengthening women's voices, including humanitarian assistance.",
      stats: [
        { number: "499,277", label: "People reached by CARE's programmes" },
        { number: "49%", label: "Women and girls as a percentage of the total" },
        { number: "121", label: "Staff in Dili and the municipalities" },
      ],
      statsNote:
        "These figures include communities in rural and remote areas, as well as staff working in Dili and in municipalities across the country.",
      historyTitle: "Our History and Work",
      history: [
        "CARE began its activities in Timor-Leste as part of CARE Indonesia and became an independent office in 2000. In 2008, management responsibility moved from CARE Canada to CARE Australia.",
        "Committed to sustainable development and humanitarian response, CARE works in agriculture, disaster risk reduction, education, community health, nutrition and sanitation. This includes cross-cutting issues such as gender equality and inclusion. These programmes also support capacity development, access to information, peacebuilding, rural infrastructure, employment and the participation of women and girls.",
      ],
      humanitarian: [
        "CARE contributed to humanitarian responses during the crises of 1999 and 2006, the El Niño impacts of 2014–2017, the April 2021 floods and the COVID-19 pandemic.",
        "During the 2006 crisis, CARE responded to the needs of displaced communities in Dili by supporting camp management, humanitarian coordination, water supply and child protection, and by sharing essential information with people affected by the violence.",
      ],
      toLafaekTitle: "From CARE to LAFAEK Learning Media",
      toLafaek: [
        "Since 2008, CARE has implemented more than 100 development and humanitarian projects in collaboration with more than 44 partners, with support from international donors and partners.",
        "These initiatives include LAFAEK Learning Media, a long-term education project. Its development began in 2000, and its first magazine was distributed in early 2001.",
        "LAFAEK started as a single children's magazine and has grown into an educational media programme with online content and four magazines for students, teachers and communities. LAFAEK reaches up to 47% of Timor-Leste's population, widening access to learning materials and information in Tetun.",
      ],
      visionTitle: "Our Vision",
      visionQuote:
        "We seek a world of hope, inclusion and social justice, where poverty has been overcome and all people live with dignity and security.",
      visionText:
        "CARE is a global partner in the worldwide movement to end poverty. It is known everywhere for its strong commitment to defending human dignity.",
      pillars: [
        {
          title: "Saving Lives",
          text: "Humanitarian action and emergency response are central to our work, with special attention to the needs of women and marginalised groups.",
        },
        {
          title: "Increasing Impact",
          text: "We learn and build partnerships to expand proven methods of reducing poverty.",
        },
        {
          title: "Creating Lasting Change",
          text: "We provide innovative solutions and use sustainable development tools to reduce risk and build resilience.",
        },
      ],
      missionTitle: "Our Mission",
      missionQuote: "CARE works around the world to save lives and defeat poverty.",
      focusTitle: "Our focus",
      focusText:
        "CARE puts women and girls at the centre of its work, because we know that we cannot overcome poverty until all people have equal rights and opportunities.",
      valuesTitle: "Core Values",
      values: [
        {
          title: "Transformation",
          points: [
            "We believe in urgent action, innovation, and the necessity of transformation, within the world and our own organization.",
            "We work hand-in-hand with communities to fulfill their rights, responsibilities, and aspirations.",
            "We deliver life-changing and measurable results using innovative approaches that last.",
            "We strive to improve constantly, learn from mistakes, and embrace change.",
            "We zealously advocate with stakeholders to meaningfully address the underlying causes of poverty.",
          ],
        },
        {
          title: "Integrity",
          points: [
            "We are accountable to the people and partners we humbly serve, transparently sharing our results, stories and lessons.",
            "We demonstrate our unshakable commitment to people by exemplifying strong moral character and a desire for trust.",
            "We are accountable to and transparent with each other, donors, partners, and the people we serve.",
            "We comply with applicable laws and regulations, as well as CARE's policies and procedures.",
            "We are responsible stewards of the funds entrusted to us and strive to eliminate unnecessary expenses.",
            "We do not engage in or tolerate fraud, dishonesty, theft, corruption, nepotism, or bribery.",
            "We avoid and report conflicts of interest and any situation that may create the appearance of a conflict.",
          ],
        },
        {
          title: "Diversity",
          points: [
            "We know that by embracing differences, actively including a variety of voices, and joining together we can solve the world's most complex problems.",
            "We celebrate diverse working environments where all individuals can be successful and thrive.",
            "We recognize that CARE's strength is derived from the commitment, dedication and expertise of our employees and partners.",
            "We listen to and value the views of others.",
            "We believe that by embracing diversity we can solve the world's most complex problems.",
          ],
        },
        {
          title: "Equality",
          points: [
            "We believe in the equal value of every human being and the importance of respecting and honoring each individual; we know that change happens through people.",
            "We believe in equal value, respect, and honor of every human being.",
            "We strive to end all forms of oppression, exploitation, discrimination, harassment, retaliation, and intimidation.",
            "We deplore sexual exploitation and abuse of any form, especially that of children.",
            "We are committed to creating a safe and supportive work environment.",
          ],
        },
        {
          // English translated from the Tetun version. Replace with CARE's official wording if available.
          title: "Excellence",
          points: [
            "We challenge ourselves to the highest levels of learning and performance, drawing on the best of the human spirit to create positive impact.",
            "We value innovation, passion, compassion, determination and perseverance.",
            "We develop programmes that are effective, efficient and make an impact.",
            "We help people reach their potential and encourage personal and professional development.",
          ],
        },
      ],
      // English translated from the Tetun version. Replace with CARE's official wording if available.
      code: [
        "We stand with the CARE International Confederation and follow the CARE International Code and its Code of Ethics and Conduct.",
        "We uphold international humanitarian principles and the global standards that CARE promotes and implements.",
        "We protect CARE's intellectual property, confidential information, equipment, brand and reputation.",
      ],
    },
    lafaek: {
      title: "LAFAEK Learning Media",
      tagline: "Learning that connects schools, families and communities",
      paragraphs: [
        "LAFAEK Learning Media is an educational initiative of CARE in Timor-Leste. Since 2001, LAFAEK has provided quality learning materials in Tetun to schools, families and communities across the country. The project was developed in response to the lack of reading materials that are age-appropriate and relevant to local realities, especially in rural and remote areas.",
        "As part of CARE's commitment to education and social justice, LAFAEK promotes literacy, numeracy, critical thinking, gender equality, health knowledge, environmental responsibility and social inclusion. Through this content, LAFAEK also supports the wellbeing and leadership of women and girls and encourages families to take part in their children's learning.",
        "Over more than two decades, LAFAEK has grown from a single children's magazine, Lafaek ba Labarik, into an educational media platform with four magazines and digital content. CARE in Timor-Leste implements LAFAEK in partnership with the Ministry of Education, with support from the New Zealand Ministry of Foreign Affairs and Trade. LAFAEK's content is aligned with the national curriculum and community development priorities.",
      ],
    },
    magazines: {
      title: "Our Magazines",
      intro:
        "To meet learning needs at different stages and in different contexts, LAFAEK publishes four magazines, each with three editions per year. Content on the official website complements the printed magazines and widens access to educational information.",
      audienceLabel: "Target audience",
      reachLabel: "Reach",
      items: [
        {
          name: "LAFAEK Ki'ik",
          audience: "Pre-school children and Grades 1–2",
          reach: "More than 111,000 children",
          colour: magazineColours.kiik,
        },
        {
          name: "LAFAEK Prima",
          audience: "Students in Grades 3–6",
          reach: "More than 133,000 students",
          colour: magazineColours.prima,
        },
        {
          name: "LAFAEK ba Manorin",
          audience: "Pre-school and primary school teachers",
          reach: "More than 12,000 teachers",
          colour: magazineColours.manorin,
        },
        {
          name: "LAFAEK ba Komunidade",
          audience: "Families and communities",
          reach: "More than 105,000 households (≈ half of all households in Timor-Leste)",
          colour: magazineColours.komunidade,
        },
      ],
      complement:
        "The magazines complement each other: the children's and students' magazines strengthen learning, the teachers' magazine supports teaching practice, and the community magazine helps families apply knowledge in daily life.",
    },
    approach: {
      title: "LAFAEK's Approach",
      intro:
        "To make sure its materials are relevant, clear and useful, LAFAEK works with partners, pre-tests content and keeps listening to communities' views and needs. LAFAEK also integrates cross-cutting issues such as Gender Equality, Child Protection, Accountability, Inclusion and Safeguarding into all the content it develops, to promote positive values and sustainable change in communities.",
      steps: [
        {
          title: "Relevant Content",
          text: "LAFAEK works with the Ministry of Education and partners to ensure content is aligned with the national curriculum and the needs of its audiences.",
        },
        {
          title: "Content Pre-testing",
          text: "Content is tested with students, teachers and parents in urban and remote areas to ensure it is clear, engaging and appropriate.",
        },
        {
          title: "Community Dialogue",
          text: "LAFAEK listens to community feedback, explains technical topics and discusses how to apply learning in daily life.",
        },
      ],
      connect:
        "Together with schools, families and partners, LAFAEK connects classroom learning with learning at home and in the community.",
      integrateTitle: "Integrating Important Learning",
      integrate: [
        "Encouraging students to take Lafaek Ki'ik, Lafaek Prima and other reading materials home.",
        "Promoting shared reading between children, parents and older siblings, which benefits everyone involved.",
        "Encouraging parents and adults to support children with homework and school activities.",
      ],
    },
    contribution: {
      title: "Contribution to Learning",
      intro:
        "LAFAEK has become an important educational resource in Timor-Leste, especially in areas where access to books and learning materials is still limited. Research and evaluations show that students, teachers and families use and trust LAFAEK highly.",
      evalTitle: "Mid-term Evaluation (2021)",
      stats: [
        { number: "85.9%", label: "Households whose reading materials rely on LAFAEK magazines" },
        { number: "78.2%", label: "Students who read LAFAEK at home" },
        { number: "68.5%", label: "Heads of household who use the magazines to support children" },
      ],
      outro:
        "The evaluation also found a positive link between engagement with LAFAEK materials and better literacy results. These results show that LAFAEK is a relevant resource that supports learning both at school and at home.",
    },
    enterprise: {
      eyebrow: "LAFAEK Social Enterprise",
      title: "LAFAEK's Future and Sustainability",
      paragraphs: [
        "To continue this work in the long term, CARE has set out a plan to transform LAFAEK into a social enterprise. Under the proposed model, LAFAEK would generate its own revenue to complement donor support and reduce its dependence on external funding.",
        "The main commitment is to keep providing free materials to schools and communities in the most remote and disadvantaged areas. For this reason, the proposed model combines LAFAEK's own revenue with donor subsidies, so that financial sustainability continues to support LAFAEK's social objectives.",
        "The original plan set out a five-year transition, from 2020 to 2024, moving management from CARE to the LAFAEK Social Enterprise as a local organisation governed and managed by Timorese people. Although the original timeline was delayed by the COVID-19 pandemic, CARE and the LAFAEK team remain committed to achieving this vision and establishing a sustainable, locally managed social enterprise for the future.",
      ],
      visionTitle: "Vision",
      vision: "To be a leader in media and communication that promotes social change in Timor-Leste.",
      missionTitle: "Mission",
      mission: [
        "Promote literacy and numeracy.",
        "Promote gender equality.",
        "Promote social inclusion.",
      ],
      closing:
        "Together with schools, families, communities and partners, LAFAEK continues to strengthen learning and widen access to quality information in Tetun. Through its commitment to equality and inclusion, LAFAEK continues to create opportunities for children and communities to learn, reach their potential and contribute to a better future for Timor-Leste.",
      magazinesLink: "Explore our magazines",
      teamLink: "Meet our team",
    },
  },

  tet: {
    hero: {
      title: "Hatene kona-ba Ami",
      subtitle: "CARE iha Timor-Leste & Mídia Aprendizajen LAFAEK",
      tagline: "Aprendizajen ne’ebé liga eskola, família no komunidade",
      imageAlt: "Ekipa Mídia Aprendizajen LAFAEK",
    },
    nav: [
      { id: "care", label: "CARE iha Timor-Leste" },
      { id: "lafaek", label: "LAFAEK" },
      { id: "magazines", label: "Ami-nia Revista Sira" },
      { id: "approach", label: "Abordajen" },
      { id: "contribution", label: "Kontribuisaun" },
      { id: "social-enterprise", label: "Empreza Sosiál" },
    ],
    care: {
      eyebrow: "Kona-ba CARE iha Timor-Leste",
      whoTitle: "Se Mak Ami",
      whoText:
        "CARE iha Timor-Leste hanesan konfederasaun global ne’ebé kompostu husi organizasaun nasional independente sira iha nasaun oin-oin. CARE servisu iha Timor-Leste dezde 1994. Nia programa foka ba edukasaun, saúde, hakbiit ekonomia feto, no hakbiit feto sira ninia lian inklui asistensia umanitária.",
      stats: [
        { number: "499.277", label: "Ema ne’ebé hetan alkansa husi CARE nia programa" },
        { number: "49%", label: "Persentajen feto no labarik-feto husi totalidade" },
        { number: "121", label: "Funsionáriu iha Dili no munisípiu sira" },
      ],
      statsNote:
        "Dadus ne’e inklui komunidade sira iha área rurál no remota, no mós funsionáriu sira-ne’ebé servisu iha Dili no iha munisípiu sira iha rai-laran tomak.",
      historyTitle: "Ami-nia Istória no Servisu",
      history: [
        "CARE hahú nia atividade iha Timor-Leste nu’udar parte husi CARE Indonesia, no iha 2000 sai eskritóriu independente. Iha 2008, responsabilidade jestaun transfere husi CARE Canada ba CARE Australia.",
        "Ho kompromisu ba dezenvolvimentu sustentável no resposta umanitária, CARE servisu iha área agrikultura, redusaun risku dezastre, edukasaun, saúde komunitária, nutrisaun, no saneamentu. Inklui asuntu transversal sira hanesan igualdade jéneru no inkluzaun. Programa sira-ne’e mós apoia dezenvolvimentu kapasidade, asesu ba informasaun, konstrusaun pás, infraestrutura rurál, empregu, no partisipasaun feto no labarik-feto.",
      ],
      humanitarian: [
        "CARE kontribui ba resposta umanitária durante krize iha 1999 no 2006, impaktu El Niño iha 2014–2017, inundasaun iha Abríl 2021 no pandemia COVID-19.",
        "Durante krize 2006, CARE responde ba nesesidade komunidade dezlokadu iha Dili liuhusi apoiu ba jestaun akampamentu, koordenasaun umanitária, fornesimentu bee, protesaun labarik no partilla informasaun esensiál ba populasaun afetada husi violénsia.",
      ],
      toLafaekTitle: "Husi CARE ba Mídia Aprendizajen LAFAEK",
      toLafaek: [
        "Dezde 2008, CARE implementa ona liu projetu dezenvolvimentu no umanitáriu 100, iha kolaborasaun ho parseiru liu 44, no ho apoiu husi doadór no parseiru internasionál sira.",
        "Inisiativa sira-ne’e inklui Mídia Aprendizajen LAFAEK, projetu edukasaun ba tempu naruk ne’ebé nia dezenvolvimentu hahú iha 2000 no nia revista dahuluk distribui iha inísiu 2001.",
        "Husi revista ida ba labarik, LAFAEK dezenvolve sai programa mídia edukasionál ne’ebé abranje konteúdu online no revista haat ba kanorin, manorin, no komunidade. LAFAEK nia alkansa to’o 47% husi populasaun Timor-Leste, hodi haluan asesu ba materiál aprendizajen no informasaun iha lian Tetun.",
      ],
      visionTitle: "Ami-nia Vizaun",
      visionQuote:
        "Ami hakarak mundu ida-ne’ebé nakonu ho esperansa no igualdade, iha ne’ebé pobreza hetan ona solusaun no ema hotu moris iha dignidade no seguru.",
      visionText:
        "CARE sai nu’udar parseiru globál ida iha movimentu mundiál atu halakon ki’ak. CARE koñesidu iha fatin hotu-hotu tanba nia kompromisu metin atu defende dignidade umana.",
      pillars: [
        {
          title: "Salva Moris",
          text: "Liuhusi asaun umanitária no resposta ba emerjénsia, ho atensaun espesiál ba nesesidade feto no populasaun marjinalizadu sira, sai sentru ba ami-nia servisu.",
        },
        {
          title: "Hasa’e Impaktu",
          text: "Liuhusi aprendizajen no dezenvolvimentu parseria, atu haboot métodu sira-ne’ebé provadu ona atu hamenus ki’ak.",
        },
        {
          title: "Kria Mudansa ho Durasaun Naruk",
          text: "Fó solusaun inovativu no uza instrumentu dezenvolvimentu sustentável atu hamenus risku no kria reziliénsia.",
        },
      ],
      missionTitle: "Ami-nia Misaun",
      missionQuote: "CARE hala’o servisu iha mundu tomak atu salva ema nia moris, halakon ki’ak.",
      focusTitle: "Ami-nia foku",
      focusText:
        "CARE tau feto no labarik-feto sira sai sentru iha ami-nia servisu, tanba ami hatene katak ita sei labele halakon ki’ak se ema hotu-hotu la hetan direitu no oportunidade hanesan.",
      valuesTitle: "Valór Prinsipál Sira",
      values: [
        {
          title: "Transformasaun",
          points: [
            "Ami fiar ba asaun lailais, inovasaun no nesesidade atu halo transformasaun, iha mundu tomak no mós iha ami-nia organizasaun rasik.",
            "Ami servisu hamutuk ho komunidade sira atu realiza sira-nia direitu, responsabilidade no aspirasaun.",
            "Ami fó rezultadu ne’ebé muda moris no bele sukat ho didiak liuhusi abordagem inovadora ne’ebé bele dura ba tempu naruk.",
            "Ami esforsu beibeik atu hadi’a an, aprende husi sala sira no simu mudansa ho laran nakloke.",
            "Ami servisu hamutuk hodi halo advokasia ho parseiru no parte relevante sira atu responde ho signifikativu ba kauza fundamentál sira ne’ebé kontribui ba kiak no vulnerabilidade.",
          ],
        },
        {
          title: "Integridade",
          points: [
            "Ami responsabiliza ba ema no parseiru sira-ne’ebé ami serve ho laran, no ami partilla ho transparénsia ami-nia rezultadu, istória no lisaun sira ne’ebé ami aprende.",
            "Ami hatudu ami-nia kompromisu forte ba ema sira liuhusi hahalok ho morál di’ak, integridade no hakarak atu harii konfiansa.",
            "Ami responsabiliza ba malu no halo transparénsia ho malu, doadór sira, parseiru sira no komunidade ne’ebé ami serve.",
            "Ami kumpre lei no regulamentu sira-ne’ebé aplika, no mós CARE nia polítika no prosedimentu sira.",
            "Ami jere ho responsabilidade fundu sira-ne’ebé entrega ba ami no nafatin buka atu hamenus despeza ne’ebé la presiza.",
            "Ami la envolve an ka tolera fraude, La onestu, Na’ok, korupsaun, nepotizmu ka subornu.",
            "Ami evita no relata konflitu interese nian no situasaun ruma ne’ebé bele kria aparénsia ka suspeita kona-ba konflitu interese.",
          ],
        },
        {
          title: "Diversidade",
          points: [
            "Ami hatene katak liuhusi simu no valoriza diferensa sira, inklui rona ativamente lian no perspetiva oin-oin, no servisu hamutuk, ami bele rezolve problema kompleksu liu iha mundu.",
            "Ami selebra ambiente servisu ne’ebé diversu, iha ne’ebé ema hotu-hotu bele hetan suksesu no dezenvolve an ho di’ak.",
            "Ami rekoñese katak forsa CARE nian mai husi kompromisu, dedikasaun no perísia husi ami-nia funsionáriu no parseiru sira.",
            "Ami rona no valoriza hanoin no haree nain sira seluk.",
            "Ami fiar katak liuhusi simu no abrasa diversidade, ami bele rezolve problema kompleksu liu iha mundu.",
          ],
        },
        {
          title: "Igualdade",
          points: [
            "Ami fiar katak ema hotu-hotu iha valór hanesan no hatene katak importante atu respeita no valoriza kada indivíduu. Ami mós hatene katak mudansa mai liuhusi ema sira.",
            "Ami fiar ba valór igualdade, respeitu no dignifika ema hotu-hotu.",
            "Ami esforsa atu hakotu forma hotu-hotu husi opresaun, esploitasaun, diskriminasaun, asédiu, retaliasaun no intimidasaun.",
            "Ami kondena ho maka’as forma hotu-hotu husi esploitasaun no abuzu seksuál, liuliu hasoru labarik sira.",
            "Ami kompromete atu kria ambiente servisu ne’ebé seguru, saudavel no apoiu ema hotu-hotu.",
          ],
        },
        {
          title: "Excelencia",
          points: [
            "Ami dezafia an rasik atu hetan nivel aas liu iha aprendizajen no dezempeñu, ho aproveita espiritu umanu di’ak liu hodi kria impaktu pozitivu.",
            "Ami valoriza inovasaun, paixaun, kompaixaun, determinasaun no perseveransa.",
            "Ami dezenvolve programa sira-ne’ebé efetivu, efisiente no fó impaktu.",
            "Ami ajuda ema hodi atinje sira nia potensiál no enkoraja atu buka dezenvolvimentu profisionál no pesoál.",
          ],
        },
      ],
      code: [
        "Ami hamriik hamutuk ho Konfederasaun CARE iha Timor-Leste no tuir CARE iha Timor-Leste Code no ninia Kódigu Étika no Konduta.",
        "Ami kaer metin ba prinsípiu umanitáriu internasionál no padraun global oin-oin ne’ebé CARE promove no implementa.",
        "Ami proteje propriedade intelektual CARE nian, informasaun konfidensiál, ekipamentu, marka (brand) no reputasaun organizasaun nian.",
      ],
    },
    lafaek: {
      title: "Mídia Aprendizajen LAFAEK",
      tagline: "Aprendizajen ne’ebé liga eskola, família no komunidade",
      paragraphs: [
        "Mídia Aprendizajen LAFAEK mak inisiativa edukasionál husi CARE iha Timor-Leste. Dezde 2001, LAFAEK fó materiál aprendizajen ho kualidade iha lian Tetun ba eskola, família no komunidade iha nasaun tomak. Projetu ne’e dezenvolve atu responde ba falta materiál leitura ne’ebé apropriadu ba idade labarik no relevante ho realidade lokál, liuliu iha área rurál no remota.",
        "Nu’udar parte husi CARE nia kompromisu ba edukasaun no justisa sosiál, LAFAEK promove literasia, numerasia, pensamentu krítik, igualdade jéneru, koñesimentu kona-ba saúde, responsabilidade ambientál no inkluzaun sosiál. Liuhusi konteúdu sira-ne’e, LAFAEK mós apoia bem-estar no lideransa feto no labarik-feto, no enkoraja família atu partisipa iha labarik nia aprendizajen.",
        "Liu ona dékada rua, LAFAEK dezenvolve husi revista ida ba labarik, Lafaek ba Labarik, ba plataforma mídia edukasionál ne’ebé inklui revista haat no konteúdu dijitál. CARE iha Timor-Leste implementa LAFAEK iha parseria ho Ministériu Edukasaun no ho apoiu husi Ministériu Negósiu Estranjeiru no Komérsiu Nova Zelándia. LAFAEK nia konteúdu aliña ho kurríkulu nasionál no prioridade dezenvolvimentu komunidade.",
      ],
    },
    magazines: {
      title: "Ami-nia Revista Sira",
      intro:
        "Atu responde ba nesesidade aprendizajen iha etapa no kontestu oin-oin, LAFAEK publika revista haat, ho edisaun tolu kada tinan ba revista ida-idak. Konteúdu iha website ofisiál komplementa revista impressa no haluan oportunidade ba asesu informasaun edukativa.",
      audienceLabel: "Audiénsia-alvu",
      reachLabel: "alkansa",
      items: [
        {
          name: "LAFAEK Ki’ik",
          audience: "Labarik pre-eskolár no klase 1–2",
          reach: "Liu 111.000 kanorin",
          colour: magazineColours.kiik,
        },
        {
          name: "LAFAEK Prima",
          audience: "Kanorin klase 3–6",
          reach: "Liu 133.000 kanorin",
          colour: magazineColours.prima,
        },
        {
          name: "LAFAEK ba Manorin",
          audience: "Manorin iha pre-eskolár no eskola primária",
          reach: "Liu 12.000 manorin",
          colour: magazineColours.manorin,
        },
        {
          name: "LAFAEK ba Komunidade",
          audience: "Família no komunidade",
          reach: "Liu 105.000 uma-kain (≈ metade husi uma-kain iha Timor-Leste)",
          colour: magazineColours.komunidade,
        },
      ],
      complement:
        "Revista sira-ne’e komplementa malu: revista ba labarik no kanorin haforsa aprendizajen; revista ba manorin apoia prátika hanorin; no revista ba komunidade ajuda família aplika koñesimentu iha moris loroloron.",
    },
    approach: {
      title: "LAFAEK nia Abordajen",
      intro:
        "Atu asegura katak materiál sira relevante, klaru no útil, LAFAEK servisu hamutuk ho parseiru sira, halo pre-teste no kontinua rona komunidade nia hanoin no nesesidade. Iha tempu hanesan, LAFAEK integra asuntu transversal sira hanesan Igualdade Jéneru, Protesaun Labarik, Akuntabilidade, Inkluzaun no Salvaguarda iha konteúdu hotu-hotu ne’ebé dezenvolve, atu promove valór pozitivu no mudansa sustentável iha komunidade.",
      steps: [
        {
          title: "Konteúdu Relevante",
          text: "LAFAEK kolabora ho Ministériu Edukasaun no parseiru sira atu asegura konteúdu aliña ho kurríkulu nasionál no nesesidade audiénsia.",
        },
        {
          title: "Pre-teste Konteúdu",
          text: "Konteúdu testa ho kanorin, profesór no inan-aman iha área urbana no remota, atu asegura katak klaru, atrativu no apropriadu.",
        },
        {
          title: "Diálogu ho Komunidade",
          text: "LAFAEK rona komunidade nia komentáriu, esplika tópiku tékniku no diskute oinsá aplika aprendizajen iha moris loroloron.",
        },
      ],
      connect:
        "Hamutuk ho eskola, família no parseiru sira, LAFAEK liga aprendizajen iha sala-aula ho aprendizajen iha uma-laran no komunidade.",
      integrateTitle: "Integra Aprendizajen Importante",
      integrate: [
        "Enkoraja kanorin, manorin sira atu lori Lafaek Ki’ik, Lafaek Prima no materiál leitura seluk ba uma.",
        "Promove atividade leitura hamutuk entre labarik, inan-aman no maun-alin boot sira, hodi fó benefísiu ba ema hotu ne’ebé partisipa.",
        "Enkoraja inan-aman no adultu sira atu apoia labarik iha tarefa no atividade eskola.",
      ],
    },
    contribution: {
      title: "Kontribuisaun ba Aprendizajen",
      intro:
        "LAFAEK sai rekursu edukasionál importante iha Timor-Leste, liuliu iha área sira-ne’ebé asesu ba livru no materiál aprendizajen sei limitadu. Peskiza no avaliasaun sira hatudu katak kanorin, manorin no família sira uza no konfia ba LAFAEK ho nível aas.",
      evalTitle: "Avaliasaun Intermedia (2021)",
      stats: [
        { number: "85,9%", label: "Uma-kain ho materiál leitura ne’ebé depende ba revista LAFAEK" },
        { number: "78,2%", label: "Kanorin ne’ebé lee LAFAEK iha uma" },
        { number: "68,5%", label: "Xefe uma-kain ne’ebé uza revista atu apoia labarik" },
      ],
      outro:
        "Avaliasaun ne’e mós identifika relasaun pozitivu entre envolvimentu ho materiál LAFAEK no mellora iha rezultadu literasia. Rezultadu sira-ne’e hatudu katak LAFAEK relevante nu’udar rekursu ne’ebé apoia aprendizajen iha eskola no iha uma.",
    },
    enterprise: {
      eyebrow: "Empreza Sosiál LAFAEK",
      title: "LAFAEK nia Futuru no Sustentabilidade",
      paragraphs: [
        "Atu kontinua servisu ne’e ba tempu naruk, CARE define planu atu transforma LAFAEK ba empreza sosiál ida. Modelu ne’e propoin atu jere reseita própria hodi komplementa apoiu husi doadór sira no hamenus dependénsia ba finansiamentu esternu.",
        "Kompromisu prinsipál mak kontinua fó materiál gratuitamente ba eskola no komunidade iha área remota liu no ho kondisaun desfavoresida. Tanba ne’e, modelu propostu kombina reseita própria ho subsídiu husi doadór sira, atu sustentabilidade finanseira bele kontinua apoia LAFAEK nia objetivu sosiál.",
        "Planu orijinál preve tranzisaun jestaun husi CARE ba Empreza Sosiál LAFAEK, nu’udar organizasaun lokál ho governasaun no jestaun Timoroan, durante períodu tinan lima, husi 2020 to’o 2024. Maski kalendáriu tranzisaun ne'ebé planeadu labele realiza tuir tempu tanba pandemia COVID-19, CARE no ekipa LAFAEK kontinua komprometidu atu realiza visaun ida-ne'e no estabelese empreza sosiál sustentável ida ne'ebé jere no lidera husi Timoroan sira rasik ba futuru.",
      ],
      visionTitle: "Vizaun",
      vision: "Sai lider iha área mídia no komunikasaun atu promove mudansa sosiál iha Timor-Leste.",
      missionTitle: "Misaun",
      mission: [
        "Promove literasia no numerasia.",
        "Promove igualdade jéneru.",
        "Promove inkluzaun sosiál.",
      ],
      closing:
        "Hamutuk ho eskola, família, komunidade no parseiru sira, LAFAEK kontinua haforsa aprendizajen no haluan asesu ba informasaun ho kualidade iha lian Tetun. Ho kompromisu ba igualdade no inkluzaun, LAFAEK kontinua kria oportunidade atu labarik no komunidade sira bele aprende, dezenvolve sira-nia potensial, no kontribui ba futuru Timor-Leste ne’ebé di’ak liután.",
      magazinesLink: "Revista",
      teamLink: "Ema Ami Nian",
    },
  },
};

// ---------------------------------------------------------------------------
// Type scale: every text element on the page uses one of these.
// Change a size here and it updates everywhere.
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

function Eyebrow({ children, colour = "text-[#219653]" }: { children: React.ReactNode; colour?: string }) {
  return <p className={`mb-3 ${type.label} ${colour}`}>{children}</p>;
}

function Bullet({ children, dot }: { children: React.ReactNode; dot: string }) {
  return (
    <li className={`flex gap-3 ${type.body} ${bodyColour}`}>
      <span className={`mt-3 h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <span>{children}</span>
    </li>
  );
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

export default function AboutPage() {
  const { language } = useLanguage();
  const L: Lang = language === "tet" ? "tet" : "en";
  const t = content[L];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-grow">
        {/* Hero with team photo */}
        <section className="relative flex h-[440px] w-full items-end overflow-hidden md:h-[520px]">
          <Image
            src={TEAM_PHOTO}
            alt={t.hero.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 md:pb-16">
            <ColourBar />
            <h1 className={`${type.h1} text-white drop-shadow-lg`}>{t.hero.title}</h1>
            <p className={`mt-3 ${type.lead} text-white`}>{t.hero.subtitle}</p>
            <p className={`mt-2 max-w-2xl ${type.body} italic text-white/90`}>“{t.hero.tagline}”</p>
          </div>
        </section>

        {/* On-this-page navigation */}
        <nav
          aria-label={L === "tet" ? "Iha pájina ida-ne’e" : "On this page"}
          className="border-b border-gray-200 bg-white"
        >
          <div className="mx-auto max-w-7xl overflow-x-auto px-4">
            <ul className="flex gap-2 py-3">
              {t.nav.map((item) => (
                <li key={item.id} className="shrink-0">
                  <a
                    href={`#${item.id}`}
                    className="inline-block rounded-full border border-gray-200 px-4 py-2 text-base font-semibold text-gray-700 transition hover:border-[#219653] hover:text-[#219653]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* ===================== CARE IN TIMOR-LESTE ===================== */}
        <section id="care" className="scroll-mt-24 bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <Eyebrow colour="text-[#E07B00]">{t.care.eyebrow}</Eyebrow>

            {/* Who we are + stats */}
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <h2 className={`mb-5 ${type.h2} ${headingColour}`}>{t.care.whoTitle}</h2>
                <p className={`${type.body} ${bodyColour}`}>{t.care.whoText}</p>
              </div>
              <div className="lg:col-span-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {t.care.stats.map((stat) => (
                    <div key={stat.number} className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
                      <div className={`${type.stat} text-[#E07B00]`}>{stat.number}</div>
                      <div className={`mt-3 ${type.statLabel} ${bodyColour}`}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <p className={`mt-4 ${type.statLabel} text-gray-600`}>{t.care.statsNote}</p>
              </div>
            </div>

            {/* History and work */}
            <div className="mt-16 grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h3 className={`mb-5 ${type.h3} ${headingColour}`}>{t.care.historyTitle}</h3>
                <div className={`space-y-5 ${type.body} ${bodyColour}`}>
                  {t.care.history.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="h-full rounded-2xl border-l-4 border-[#E07B00] bg-gray-50 p-6 md:p-8">
                  <div className={`space-y-5 ${type.body} ${bodyColour}`}>
                    {t.care.humanitarian.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* From CARE to LAFAEK */}
            <div className="mt-16 rounded-3xl bg-gradient-to-br from-orange-50 via-white to-green-50 p-6 md:p-10">
              <h3 className={`mb-6 ${type.h3} ${headingColour}`}>{t.care.toLafaekTitle}</h3>
              <div className="grid gap-6 md:grid-cols-3">
                {t.care.toLafaek.map((p) => (
                  <p key={p} className={`${type.body} ${bodyColour}`}>
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {/* Vision + Mission */}
            <div className="mt-16 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-gray-200 p-6 shadow-sm md:p-8">
                <h3 className={`mb-4 ${type.h3} ${headingColour}`}>{t.care.visionTitle}</h3>
                <blockquote className={`mb-4 border-l-4 border-[#E07B00] pl-4 ${type.lead} italic text-gray-800`}>
                  “{t.care.visionQuote}”
                </blockquote>
                <p className={`mb-6 ${type.body} ${bodyColour}`}>{t.care.visionText}</p>
                <ul className="space-y-4">
                  {t.care.pillars.map((pillar) => (
                    <li key={pillar.title} className="rounded-xl bg-gray-50 p-4">
                      <p className={`${type.h4} ${headingColour}`}>{pillar.title}</p>
                      <p className={`mt-1 ${type.body} ${bodyColour}`}>{pillar.text}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mission card: quote and focus box sit together in the vertical centre of the card, text justified */}
              <div className="flex flex-col rounded-3xl border border-gray-200 p-6 shadow-sm md:p-8">
                <h3 className={`mb-4 ${type.h3} ${headingColour}`}>{t.care.missionTitle}</h3>
                <div className="flex flex-1 flex-col justify-center gap-6">
                  <blockquote
                    className={`border-l-4 border-[#E07B00] pl-4 ${type.lead} text-justify italic text-gray-800`}
                  >
                    “{t.care.missionQuote}”
                  </blockquote>
                  <div className="rounded-2xl bg-orange-50 p-6">
                    <p className={`mb-2 ${type.label} text-[#E07B00]`}>{t.care.focusTitle}</p>
                    <p className={`${type.body} text-justify text-gray-800`}>{t.care.focusText}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Core values: expandable so the page stays scannable */}
            <div className="mt-16">
              <h3 className={`mb-6 ${type.h3} ${headingColour}`}>{t.care.valuesTitle}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {t.care.values.map((value, index) => (
                  <details
                    key={value.title}
                    className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm open:shadow-md"
                    open={index === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                      <span className={`${type.h4} ${headingColour}`}>{value.title}</span>
                      <ChevronDown className="h-5 w-5 shrink-0 text-gray-500 transition group-open:rotate-180" />
                    </summary>
                    <ul className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                      {value.points.map((point) => (
                        <Bullet key={point} dot="bg-[#E07B00]">
                          {point}
                        </Bullet>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
              <ul className="mt-6 space-y-3 rounded-2xl bg-gray-50 p-5">
                {t.care.code.map((line) => (
                  <Bullet key={line} dot="bg-gray-400">
                    {line}
                  </Bullet>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ===================== LAFAEK LEARNING MEDIA ===================== */}
        <section id="lafaek" className="scroll-mt-24 bg-gradient-to-br from-green-50 to-blue-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <ColourBar />
                <h2 className={`${type.h2} text-[#219653]`}>{t.lafaek.title}</h2>
                <p className={`mt-4 ${type.lead} text-[#2F80ED]`}>{t.lafaek.tagline}</p>
              </div>
              <div className={`space-y-6 lg:col-span-8 ${type.body} ${bodyColour}`}>
                {t.lafaek.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Magazines */}
        <section id="magazines" className="scroll-mt-24 bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-10 max-w-3xl">
              <h2 className={`mb-4 ${type.h2} text-[#219653]`}>{t.magazines.title}</h2>
              <p className={`${type.body} ${bodyColour}`}>{t.magazines.intro}</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {t.magazines.items.map((mag) => (
                <article
                  key={mag.name}
                  className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className={`px-5 py-6 ${mag.colour}`}>
                    <h3 className={type.h4}>{mag.name}</h3>
                  </div>
                  <dl className="flex flex-grow flex-col gap-4 p-5">
                    <div>
                      <dt className={`${type.label} text-gray-500`}>{t.magazines.audienceLabel}</dt>
                      <dd className={`mt-1 ${type.body} text-gray-800`}>{mag.audience}</dd>
                    </div>
                    <div className="mt-auto">
                      <dt className={`${type.label} text-gray-500`}>{t.magazines.reachLabel}</dt>
                      <dd className={`mt-1 ${type.body} font-bold text-[#219653]`}>{mag.reach}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <p className={`mt-8 max-w-4xl ${type.body} ${bodyColour}`}>{t.magazines.complement}</p>
          </div>
        </section>

        {/* Approach */}
        <section id="approach" className="scroll-mt-24 bg-gray-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-10 max-w-4xl">
              <h2 className={`mb-4 ${type.h2} text-[#2F80ED]`}>{t.approach.title}</h2>
              <p className={`${type.body} ${bodyColour}`}>{t.approach.intro}</p>
            </div>

            <ol className="grid gap-6 md:grid-cols-3">
              {t.approach.steps.map((step, i) => (
                <li key={step.title} className="rounded-3xl bg-white p-6 shadow-sm">
                  <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2F80ED] ${type.h4} text-white`}>
                    {i + 1}
                  </span>
                  <h3 className={`mb-2 ${type.h4} ${headingColour}`}>{step.title}</h3>
                  <p className={`${type.body} ${bodyColour}`}>{step.text}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10 grid gap-6 lg:grid-cols-12">
              <p className={`${type.lead} ${headingColour} lg:col-span-5`}>{t.approach.connect}</p>
              <div className="rounded-3xl border-2 border-[#F2C94C] bg-white p-6 lg:col-span-7">
                <h3 className={`mb-4 ${type.h4} ${headingColour}`}>{t.approach.integrateTitle}</h3>
                <ul className="space-y-3">
                  {t.approach.integrate.map((item) => (
                    <Bullet key={item} dot="bg-[#F2C94C]">
                      {item}
                    </Bullet>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contribution to learning */}
        <section id="contribution" className="scroll-mt-24 bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-10 max-w-4xl">
              <h2 className={`mb-4 ${type.h2} text-[#219653]`}>{t.contribution.title}</h2>
              <p className={`${type.body} ${bodyColour}`}>{t.contribution.intro}</p>
            </div>

            <div className="rounded-3xl bg-gradient-to-r from-[#219653] to-[#2F80ED] p-6 text-white md:p-10">
              <h3 className={`mb-6 ${type.label} text-white/90`}>{t.contribution.evalTitle}</h3>
              <div className="grid gap-6 md:grid-cols-3">
                {t.contribution.stats.map((stat) => (
                  <div key={stat.number} className="rounded-2xl bg-white/10 p-5">
                    <div className={type.stat}>{stat.number}</div>
                    <div className={`mt-3 ${type.statLabel} text-white/95`}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <p className={`mt-8 max-w-4xl ${type.body} ${bodyColour}`}>{t.contribution.outro}</p>
          </div>
        </section>

        {/* Social enterprise */}
        <section
          id="social-enterprise"
          className="scroll-mt-24 bg-gradient-to-br from-yellow-50 to-green-50 py-16 md:py-20"
        >
          <div className="mx-auto max-w-7xl px-4">
            <Eyebrow>{t.enterprise.eyebrow}</Eyebrow>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h2 className={`mb-6 ${type.h2} ${headingColour}`}>{t.enterprise.title}</h2>
                <div className={`space-y-5 ${type.body} ${bodyColour}`}>
                  {t.enterprise.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </div>

              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <h3 className={`mb-2 ${type.label} text-[#219653]`}>{t.enterprise.visionTitle}</h3>
                  <p className={`${type.lead} ${headingColour}`}>{t.enterprise.vision}</p>
                </div>
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <h3 className={`mb-4 ${type.label} text-[#219653]`}>{t.enterprise.missionTitle}</h3>
                  <ul className="space-y-3">
                    {t.enterprise.mission.map((item, i) => {
                      const dots = ["bg-[#219653]", "bg-[#EB5757]", "bg-[#2F80ED]"];
                      return (
                        <li key={item} className={`flex items-center gap-3 ${type.lead} ${headingColour}`}>
                          <span className={`h-3 w-3 shrink-0 rounded-full ${dots[i % dots.length]}`} />
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            {/* Closing */}
            <div className="mt-14 rounded-3xl bg-[#219653] p-6 text-white shadow-lg md:p-10">
              <p className="max-w-4xl text-xl leading-relaxed">{t.enterprise.closing}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/publication/magazines"
                  className="inline-flex items-center justify-center rounded-full bg-[#F2C94C] px-6 py-3 text-base font-bold text-[#333333] transition hover:bg-yellow-300"
                >
                  {t.enterprise.magazinesLink}
                </Link>
                <Link
                  href="/our-team"
                  className="inline-flex items-center justify-center rounded-full border-2 border-white px-6 py-3 text-base font-bold text-white transition hover:bg-white hover:text-[#219653]"
                >
                  {t.enterprise.teamLink}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
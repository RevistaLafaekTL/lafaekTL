"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/button"
import { Card } from "@/components/Card"
import { Input } from "@/components/input"
import { Textarea } from "@/components/textarea"
import { Handshake, Users, Heart, Target, ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"


export default function GetInvolvedPage() {
const { language } = useLanguage()
  const [formData, setFormData] = useState<Record<string, string>>({
    name: "",
    email: "",
    inquiryType: "",
    message: "",
  })
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")

  const content = {
    en: {
      hero: {
        title: "Get Involved",
        subtitle: "Join Our Mission to Empower Timor-Leste",
        description:
          "Your support, in any form, helps us continue providing vital educational resources to children and communities across Timor-Leste.",
      },
      sections: [
        {
          id: "publish",
          icon: Handshake,
          title: "Publish with Lafaek Magazine",
          subtitle: "Share your knowledge and stories with a wide audience.",
          description:
            "Are you an educator, writer, or expert with content relevant to Timorese children and youth? We invite you to partner with us and publish your educational materials, stories, or articles in Lafaek Magazine. Reach thousands of young readers and contribute to national development.",
          cta: "Submit Your Proposal",
          formFields: [
            { name: "name", label: "Your Name", type: "text", required: true },
            { name: "email", label: "Your Email", type: "email", required: true },
            { name: "topic", label: "Proposed Topic/Content Idea", type: "textarea", required: true },
            {
              name: "audience",
              label: "Target Audience (e.g., Lafaek Ki'ik, Lafaek Prima, Lafaek ba Manorin)",
              type: "text",
              required: false,
            },
          ],
        },
        {
          id: "volunteer",
          icon: Users,
          title: "Volunteer with Us",
          subtitle: "Lend your skills and time to make a direct impact.",
          description:
            "Volunteers are the heart of our operations. Whether you're an educator, artist, administrator, or simply passionate about education, there's a place for you. Join our team in Dili or contribute remotely.",
          cta: "Become a Volunteer",
          formFields: [
            { name: "name", label: "Your Name", type: "text", required: true },
            { name: "email", label: "Your Email", type: "email", required: true },
            { name: "skills", label: "Your Skills/Interests", type: "textarea", required: true },
            { name: "availability", label: "Availability (e.g., hours per week)", type: "text", required: false },
          ],
        },
        {
          id: "donate",
          icon: Heart,
          title: "Make a Donation",
          subtitle: "Your financial contribution fuels our programs.",
          description:
            "Every donation, big or small, directly supports the production and distribution of our educational magazines, training programs for teachers, and community outreach initiatives. Help us reach more children and build a literate nation.",
          cta: "Donate Now",
          formFields: [
            { name: "name", label: "Your Name", type: "text", required: true },
            { name: "email", label: "Your Email", type: "email", required: true },
            { name: "amount", label: "Donation Amount (USD)", type: "number", required: true },
            {
              name: "frequency",
              label: "Frequency",
              type: "select",
              options: [
                { value: "one-time", label: "One-time" },
                { value: "monthly", label: "Monthly" },
              ],
              placeholder: "Select frequency",
              required: true,
            },
          ],
        },
        {
          id: "partner",
          icon: Target,
          title: "Corporate Partnerships",
          subtitle: "Collaborate with us for sustainable impact.",
          description:
            "We seek partnerships with organizations that share our vision for a literate and empowered Timor-Leste. Through corporate social responsibility programs, sponsorships, or joint initiatives, we can achieve greater collective impact.",
          cta: "Explore Partnership",
          formFields: [
            { name: "companyName", label: "Company Name", type: "text", required: true },
            { name: "contactName", label: "Contact Person Name", type: "text", required: true },
            { name: "contactEmail", label: "Contact Email", type: "email", required: true },
            { name: "partnershipIdea", label: "Proposed Partnership Idea", type: "textarea", required: true },
          ],
        },
      ],
      impactStats: {
        title: "Our Impact at a Glance",
        stats: [
          { number: "50,000+", label: "Children Reached Annually" },
          { number: "200+", label: "Schools Supported" },
          { number: "15+", label: "Years of Educational Impact" },
          { number: "90%", label: "Literacy Improvement in Pilot Areas" },
        ],
      },
      testimonials: {
        title: "What Our Partners Say",
        items: [
          {
            quote:
              "Lafaek Learning Media's dedication to education is truly inspiring. Their materials are invaluable.",
            author: "Maria, Educator",
          },
          {
            quote: "Partnering with Lafaek has allowed us to contribute meaningfully to Timor-Leste's future.",
            author: "David, Corporate Partner",
          },
        ],
      },
      contactForm: {
        title: "General Inquiry",
        description: "Have a general question or not sure where to direct your inquiry? Use the form below.",
        nameLabel: "Your Name",
        emailLabel: "Your Email",
        inquiryTypeLabel: "Type of Inquiry",
        inquiryOptions: [
          { value: "general", label: "General Inquiry" },
          { value: "media", label: "Media Inquiry" },
          { value: "event", label: "Event Inquiry" },
          { value: "other", label: "Other" },
        ],
        inquiryPlaceholder: "Select an inquiry type",
        messageLabel: "Your Message",
        submitButton: "Send Message",
        submitting: "Sending...",
        success: "Message sent successfully! We'll get back to you soon.",
        error: "Failed to send message. Please try again later.",
      },
    },
    tet: {
      hero: {
        title: "Mai hola parte",
        subtitle: "Mai hola parte iha ami-nia Misaun atu Haforsa Edukasaun iha Timor-Leste",
        description:
          "Ita-nia apoiu, iha forma saida de'it, ajuda ami kontinua fornese rekursu edukativu importante ba labarik no komunidade sira iha Timor laran tomak.",
      },
      sections: [
        {
          id: "publish",
          icon: Handshake,
          title: "Publika ho Revista Lafaek",
          subtitle: "Fahe ita-nia koñesimentu no istoria ho audiensia públiku.",
          description:
            "Ita mak edukadór, hakerek-na'in, ka espesialista ho konteúdu relevante ba labarik no joven Timor nian? Ami konvida ita atu halo parseria ho ami no publika ita-nia materiál edukativu, istoria, ka artigu iha Revista Lafaek. Hetan asesu ba joven lee-na'in rihun ba rihun no kontribui ba dezenvolvimentu nasionál.",
          cta: "Haruka Ita-nia Proposta",
          formFields: [
            { name: "name", label: "Ita-nia Naran", type: "text", required: true },
            { name: "email", label: "Ita-nia Email", type: "email", required: true },
            { name: "topic", label: "Topiku/Ideia Konteúdu Propostu", type: "textarea", required: true },
            {
              name: "audience",
              label: "Públiku Alvu (ez., Lafaek Ki’ik, Lafaek Prima, Lafaek ba Manorin)",
              type: "text",
              required: false,
            },
          ],
        },
        {
          id: "volunteer",
          icon: Users,
          title: "Voluntáriu ho Ami",
          subtitle: "Oferese ita-nia abilidade no tempu atu halo impaktu diretu.",
          description:
            "Voluntáriu sira mak sai sentru ba ami-nia servisu. Se ita mak edukadór, artista, administradór, ka simplesmente iha paixaun ba edukasaun, ami iha fatin ba ita. Bele mai servisu hamutuk ho ami-nia ekipa iha Dili ka kontribui liuhosi husi area remotas.",
          cta: "Sai Voluntáriu",
          formFields: [
            { name: "name", label: "Ita-nia Naran", type: "text", required: true },
            { name: "email", label: "Ita-nia Email", type: "email", required: true },
            { name: "skills", label: "Ita-nia Kbiit/Interese", type: "textarea", required: true },
            { name: "availability", label: "Disponibilidade (ez., oras kada semana)", type: "text", required: false },
          ],
        },
        {
          id: "donate",
          icon: Heart,
          title: "Halo Doasaun",
          subtitle: "Ita-nia kontribuisaun finanseira hametin ami-nia programa sira.",
          description:
            "Kada doasaun, boot ka ki'ik, diretamente apoia produsaun no distribuisaun ita-nia revista edukativu, programa formasaun ba manorin, no inisiativa asesu ba komunidade. Ajuda ami hetan labarik barak liu no harii nasaun literatu ida.",
          cta: "Halo Donasaun Agora",
          formFields: [
            { name: "name", label: "Ita-nia Naran", type: "text", required: true },
            { name: "email", label: "Ita-nia Email", type: "email", required: true },
            { name: "amount", label: "Montante Donasaun (USD)", type: "number", required: true },
            {
              name: "frequency",
              label: "Frekuénsia",
              type: "select",
              options: [
                { value: "one-time", label: "Dala ida de'it" },
                { value: "monthly", label: "Kada Fulan" },
              ],
              placeholder: "Hili frekuénsia",
              required: true,
            },
          ],
        },
        {
          id: "partner",
          icon: Target,
          title: "Parseria Korporativa",
          subtitle: "Kolabora ho ami ba iha impaktu sustentável.",
          description:
            "Ami buka parseria ho organizasaun sira ne'ebé iha vizaun hanesan ho ami, hodi haforsa edukasaun iha Timor-Leste. Liu husi programa responsabilidade sosiál korporativa, sponsor, ka inisiativa konjunta, ita bele atinji impaktu ne'ebe kolektivu.",
          cta: "Explora Parseria",
          formFields: [
            { name: "companyName", label: "Naran Kompañia", type: "text", required: true },
            { name: "contactName", label: "Naran Kontaktu", type: "text", required: true },
            { name: "contactEmail", label: "Email Kontaktu", type: "email", required: true },
            { name: "partnershipIdea", label: "Ideia Parseria Propostu", type: "textarea", required: true },
          ],
        },
      ],
      impactStats: {
        title: "Ami-nia Impactu iha Vizaun Badak",
        stats: [
          { number: "50,000+", label: "Labarik Hetan Kada Tinan" },
          { number: "200+", label: "Eskola Suporta" },
          { number: "15+", label: "Tinán Impactu Edukativu" },
          { number: "90%", label: "Melloria Literasia iha Área Pilotu" },
        ],
      },
      testimonials: {
        title: "Saida mak Ami-nia Parseiru sira Dehan",
        items: [
          {
            quote:
              "Lafaek Learning Media nia dedikasaun ba edukasaun inspirador tebes. Sira-nia materiál valiozu tebes.",
            author: "Maria, Edukadór",
          },
          {
            quote: "Halo parseria ho Lafaek permite ami kontribui ho signifikadu ba futuru Timor-Leste nian.",
            author: "David, Parseiru Korporativu",
          },
        ],
      },
      contactForm: {
        title: "Kestionamentu Jerál",
        description:
          "Iha pergunta jerál ka la hatene atu dirije ita-nia kestionamentu ba ne'ebé? Uza formuláriu iha kraik.",
        nameLabel: "Ita-nia Naran",
        emailLabel: "Ita-nia Email",
        inquiryTypeLabel: "Tipu Kestionamentu",
        inquiryOptions: [
          { value: "general", label: "Kestionamentu Jerál" },
          { value: "media", label: "Kestionamentu Mídia" },
          { value: "event", label: "Kestionamentu Eventu" },
          { value: "other", label: "Seluk" },
        ],
        inquiryPlaceholder: "Hili tipu kestionamentu",
        messageLabel: "Ita-nia Mensajen",
        submitButton: "Haruka Mensajen",
        submitting: "Haruka...",
        success: "Mensajen haruka ho susesu! Ami sei kontaktu ita lailais.",
        error: "La konsege haruka mensajen. Favór koko fali ikus mai.",
      },
    },
  }

  const t = content[language]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormStatus("submitting")
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Form Data Submitted:", formData)
      setFormStatus("success")
      setFormData({
        name: "",
        email: "",
        inquiryType: "",
        message: "",
      })
    } catch (error) {
      console.error("Form submission error:", error)
      setFormStatus("error")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <main>
        <section className="relative w-full h-[400px] bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white overflow-hidden">
          <Image
            src="/placeholder.svg"
            alt="Get Involved with Lafaek Learning Media"
            width={1200}
            height={400}
            className="absolute inset-0 z-0 opacity-30 object-cover"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">{t.hero.title}</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">{t.hero.subtitle}</p>
            <p className="text-lg opacity-80 max-w-4xl mx-auto mt-4">{t.hero.description}</p>
          </div>
        </section>

        {t.sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            className={`py-16 ${index % 2 === 0 ? "bg-white" : "bg-gradient-to-br from-yellow-50 to-orange-50"}`}
          >
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <section.icon className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-blue-700 mb-4">{section.title}</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{section.subtitle}</p>
                <p className="text-lg text-gray-700 mt-4 max-w-3xl mx-auto">{section.description}</p>
              </div>

              <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 shadow-lg max-w-2xl mx-auto">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-blue-700 mb-6">{section.cta}</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {section.formFields.map((field) => (
                      <div key={field.name}>
                        <label
                          className="mb-2 block text-sm font-medium text-gray-700"
                          htmlFor={`${section.id}-${field.name}`}
                        >
                          {field.label}
                        </label>
                        {field.type === "textarea" ? (
                          <Textarea
                            id={`${section.id}-${field.name}`}
                            name={field.name}
                            value={formData[field.name] || ""}
                            onChange={handleChange}
                            required={field.required}
                            rows={4}
                          />
                        ) : field.type === "select" ? (
                          <select
                            id={`${section.id}-${field.name}`}
                            name={field.name}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-green-600"
                            value={formData[field.name] || ""}
                            onChange={(e) => handleSelectChange(e.target.value, field.name)}
                            required={field.required}
                          >
                            <option value="">Select</option>
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            id={`${section.id}-${field.name}`}
                            name={field.name}
                            type={field.type}
                            value={formData[field.name] || ""}
                            onChange={handleChange}
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}

                    <Button
                      type="submit"
                      className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold py-3 rounded-lg"
                      disabled={formStatus === "submitting"}
                    >
                      {formStatus === "submitting" ? t.contactForm.submitting : section.cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    {formStatus === "success" && (
                      <p className="text-green-600 text-center mt-4">{t.contactForm.success}</p>
                    )}
                    {formStatus === "error" && (
                      <p className="text-red-600 text-center mt-4">{t.contactForm.error}</p>
                    )}
                  </form>
                </div>
              </Card>
            </div>
          </section>
        ))}
      </main>


    </div>
  )
}
"use client"

import { useState, type FormEvent } from "react"
import { Building2, Mail, Phone, MapPin, CheckCircle, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

const benefits = [
  { icon: Building2, title: "Retail Partnerships", desc: "Grocery chains, kirana stores & modern trade." },
  { icon: Mail, title: "Corporate Gifting", desc: "Custom hampers for events & employee wellness." },
  { icon: Phone, title: "Bulk / Wholesale", desc: "MOQ starting from 50 units with volume pricing." },
  { icon: MapPin, title: "Pan-India Delivery", desc: "Reliable logistics delivered anywhere in India." },
]

export function BusinessEnquirySection({
  contactEmail = "infocrunchley@gmail.com",
  contactPhones = ["+91 8102763281", "+91 748883776", "+91 7644983784"],
}: {
  contactEmail?: string
  contactPhones?: string[]
}) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    const formData = new FormData(event.currentTarget)
    const payload = {
      name: String(formData.get("name") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      type: String(formData.get("type") || "").trim(),
      quantity: String(formData.get("quantity") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    }

    try {
      const response = await fetch("/api/business-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await response.json()
      if (!response.ok || !json?.success) {
        throw new Error(json?.error || "Failed to submit enquiry")
      }

      setSuccess(true)
      event.currentTarget.reset()
      trackEvent("generate_lead", {
        lead_type: payload.type,
        lead_source: "business_enquiry",
      })
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit enquiry")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="business-enquiry" className="relative overflow-hidden border-t border-amber-100 bg-linear-to-br from-[#FFF8E7] via-[#FFF3CC] to-[#FFE8A3] py-20 md:py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-[#FFC107]/20 blur-[120px] translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[#F5A623]/15 blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <div className="mb-14 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
            <Building2 className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">B2B & Partnerships</span>
          </div>
          <h2 className="mb-4 text-3xl font-black tracking-tight text-[#1c1917] leading-[1.1] md:text-5xl lg:text-6xl">
            Grow Your Business<br />
            <span className="text-[#D4900A]">with Crunchley</span>
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
            Retailer, distributor, or corporate gifting - we have the right solution tailored for your business.
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="flex flex-col gap-7 lg:col-span-2">
            <div className="grid grid-cols-2 gap-3">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex flex-col gap-2 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                    <benefit.icon className="h-4 w-4 text-amber-600" strokeWidth={2} />
                  </div>
                  <p className="text-[13px] font-bold leading-snug text-[#1c1917]">{benefit.title}</p>
                  <p className="text-[12px] leading-snug text-slate-500">{benefit.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <a href={`mailto:${contactEmail}`} className="group flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white bg-white/80 shadow-sm transition-colors group-hover:bg-amber-50">
                  <Mail className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-[14px] font-semibold text-slate-700 transition-colors group-hover:text-[#D4900A]">{contactEmail}</span>
              </a>
              {contactPhones.map((phone, index) => (
                <a key={index} href={`tel:${phone.replace(/\s+/g, "")}`} className="group flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white bg-white/80 shadow-sm transition-colors group-hover:bg-amber-50">
                    <Phone className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-[14px] font-semibold text-slate-700 transition-colors group-hover:text-[#D4900A]">{phone}</span>
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 rounded-2xl border border-amber-100 bg-white/70 p-5 backdrop-blur-sm">
              {[
                "MOQ from 50 units",
                "Custom branding available",
                "GST invoice provided",
                "Dedicated account manager",
              ].map((point) => (
                <div key={point} className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-[13px] font-medium text-slate-700">{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] md:p-10 lg:col-span-3">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-xl font-black text-[#1c1917]">Send an Enquiry</h3>
              {success && (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Sent
                </span>
              )}
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-slate-500">Full Name *</label>
                  <input name="name" type="text" required placeholder="Your name" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-800 placeholder:text-slate-400 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-slate-500">Company</label>
                  <input name="company" type="text" placeholder="Company name (optional)" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-800 placeholder:text-slate-400 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-slate-500">Email *</label>
                  <input name="email" type="email" required placeholder="you@company.com" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-800 placeholder:text-slate-400 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-slate-500">Phone *</label>
                  <input name="phone" type="tel" required placeholder="+91 98765 43210" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-800 placeholder:text-slate-400 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-slate-500">Enquiry Type *</label>
                  <select name="type" required className="w-full h-11 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-700 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300">
                    <option value="">Select type</option>
                    <option value="bulk">Bulk / Wholesale</option>
                    <option value="retail">Retail Distribution</option>
                    <option value="gifting">Corporate Gifting</option>
                    <option value="export">Export / International</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-slate-500">Monthly Quantity</label>
                  <input name="quantity" type="text" placeholder="e.g. 500 units / month" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-800 placeholder:text-slate-400 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-slate-500">Message</label>
                <textarea name="message" rows={3} placeholder="Tell us about your requirements..." className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1c1917] text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-200 hover:bg-[#F5A623] hover:text-[#2c1c02] hover:shadow-[0_8px_30px_rgba(245,166,35,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? "Submitting..." : "Submit Enquiry"}
              </button>

              <p className="text-center text-xs text-slate-400">We respond within 24 hours on business days.</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

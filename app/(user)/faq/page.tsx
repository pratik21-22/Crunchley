import Link from "next/link"

const faqs = [
  {
    question: "Are Crunchley snacks roasted or fried?",
    answer: "All Crunchley snacks are roasted, not fried, to keep the crunch high and the guilt low.",
  },
  {
    question: "How long does shipping take?",
    answer: "Most orders are dispatched within 24-48 hours and delivered based on your location in India.",
  },
  {
    question: "Can I track my order?",
    answer: "Yes. Once your order is confirmed, you can track its status from your My Orders page.",
  },
  {
    question: "Do you offer bulk and corporate orders?",
    answer: "Yes. Use the Business Enquiry section or the Contact page for wholesale and gifting requests.",
  },
]

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-20 pb-10">
      <div className="container mx-auto max-w-4xl px-5 md:px-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">FAQs</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1c1917] md:text-4xl">Frequently asked questions</h1>
          <p className="mt-3 max-w-2xl text-slate-500">Quick answers to the most common questions before you place an order.</p>

          <div className="mt-8 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <h2 className="text-base font-bold text-[#1c1917]">{faq.question}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1c1917] px-6 text-sm font-bold text-white transition-all hover:bg-[#F5A623] hover:text-[#2c1c02]">
              Browse Products
            </Link>
            <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:text-[#D4900A]">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
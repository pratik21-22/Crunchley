import Link from "next/link"
import { getSiteSettings } from "@/lib/site-settings-loader"

export default async function ReturnsPage() {
  const settings = await getSiteSettings()

  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-20 pb-10">
      <div className="container mx-auto max-w-4xl px-5 md:px-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Returns & Refunds</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1c1917] md:text-4xl">Return & Refund Policy</h1>
          <div className="mt-8 space-y-4 text-sm leading-6 text-slate-600">
            <h2 className="text-lg font-bold text-[#1c1917] mt-6">Returns</h2>
            <p>Because our products are edible and perishable, we do not accept returns once the packaging has been opened, for health and safety reasons.</p>
            <p>If you receive a damaged, defective, or incorrect product, please reach out to us within 48 hours of delivery with clear photographs of the package and items.</p>
            
            <h2 className="text-lg font-bold text-[#1c1917] mt-6">Refunds</h2>
            <p>Refunds are only issued for items that arrive damaged or missing. Once your claim is approved, the refund will be processed back to your original payment method within 5-7 business days.</p>
            <p>Orders paid via Cash on Delivery (COD) that are eligible for a refund will require you to provide UPI or bank details for the transfer.</p>

            <h2 className="text-lg font-bold text-[#1c1917] mt-6">Cancellations</h2>
            <p>You can cancel your order anytime before it is dispatched from our facility. Once an order is marked as "Shipped", it cannot be cancelled.</p>

            <p className="mt-6 font-medium">Need to raise a request? {settings.helpText}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1c1917] px-6 text-sm font-bold text-white transition-all hover:bg-[#F5A623] hover:text-[#2c1c02]">
              Contact Support
            </Link>
            <Link href="/products" className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:text-[#D4900A]">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-[#FFFDF8]">
        <main className="flex min-h-screen items-center justify-center px-5 py-16">
          <div className="w-full max-w-xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:p-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-600">Application error</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1c1917]">Crunchley needs a reload</h1>
            <p className="mx-auto mt-3 max-w-lg text-slate-500">
              A runtime error occurred outside the normal route boundary.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1c1917] px-6 text-sm font-bold text-white transition-all hover:bg-[#F5A623] hover:text-[#2c1c02]"
              >
                Reload App
              </button>
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:text-[#D4900A]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}

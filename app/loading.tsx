export default function Loading() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-16">
      <div className="container mx-auto max-w-7xl px-5 md:px-8 lg:px-12 py-10">
        <div className="h-12 w-56 animate-pulse rounded-full bg-amber-100/70" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-[28rem] animate-pulse rounded-3xl bg-amber-50" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded-full bg-slate-100" />
            <div className="h-5 w-full animate-pulse rounded-full bg-slate-100" />
            <div className="h-5 w-5/6 animate-pulse rounded-full bg-slate-100" />
            <div className="h-12 w-44 animate-pulse rounded-full bg-slate-100" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

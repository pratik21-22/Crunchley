export default function Loading() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-20 pb-10">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-16">
          <div className="aspect-square animate-pulse rounded-3xl bg-slate-100" />
          <div className="space-y-4 py-6">
            <div className="h-5 w-28 animate-pulse rounded-full bg-amber-100/70" />
            <div className="h-12 w-3/4 animate-pulse rounded-full bg-slate-100" />
            <div className="h-5 w-full animate-pulse rounded-full bg-slate-100" />
            <div className="h-5 w-5/6 animate-pulse rounded-full bg-slate-100" />
            <div className="h-16 w-full animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    </main>
  )
}

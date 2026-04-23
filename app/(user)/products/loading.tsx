export default function Loading() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] pt-16">
      <div className="container mx-auto max-w-7xl px-5 md:px-8 lg:px-12 py-10 space-y-6">
        <div className="h-12 w-64 animate-pulse rounded-full bg-amber-100/70" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-96 animate-pulse rounded-3xl bg-slate-100" />
          ))}
        </div>
      </div>
    </main>
  )
}

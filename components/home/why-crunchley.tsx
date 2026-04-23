import { Flame, Dumbbell, Leaf, BadgeIndianRupee } from "lucide-react"

const features = [
  {
    icon: Flame,
    title: "Roasted, Not Fried",
    description: "Air-roasted to golden perfection. Zero guilt, maximum crunch.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    icon: Dumbbell,
    title: "High Protein",
    description: "Packed with plant-based protein to fuel your day the healthy way.",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
  },
  {
    icon: Leaf,
    title: "Light & Crunchy",
    description: "A light, satisfying snack that keeps you going without the bloat.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: BadgeIndianRupee,
    title: "Affordable Quality",
    description: "Premium ingredients and taste at everyday accessible prices.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
]

export function WhyCrunchley() {
  return (
    <section className="bg-[#FFFDF8] py-16 md:py-24 border-t border-amber-50">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-600 mb-3">Why Choose Us</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#1c1917]">
            Why Crunchley?
          </h2>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col gap-4 rounded-2xl bg-white p-6 border border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center`}>
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="font-bold text-[#1c1917] text-[16px] leading-snug mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

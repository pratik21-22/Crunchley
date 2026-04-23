import { Flame, Heart, Leaf, Wallet } from "lucide-react"

const benefits = [
  {
    icon: Flame,
    title: "Roasted, Not Fried",
    description:
      "Our makhana is carefully roasted to perfection, preserving nutrients while delivering an irresistible crunch.",
  },
  {
    icon: Heart,
    title: "High Protein",
    description:
      "Packed with plant-based protein to keep you energized and satisfied throughout your day.",
  },
  {
    icon: Leaf,
    title: "Healthy Snacking",
    description:
      "Low in calories, high in fiber, and completely free from artificial preservatives and additives.",
  },
  {
    icon: Wallet,
    title: "Affordable Pricing",
    description:
      "Premium quality snacks at prices that don&apos;t break the bank. Healthy eating for everyone.",
  },
]

export function WhyChooseUs() {
  return (
    <section id="why-us" className="bg-secondary py-16 text-secondary-foreground md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-primary">
            Our Promise
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            <span className="text-balance">Why Choose Crunchley?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-secondary-foreground/80">
            We believe healthy snacking should be delicious, accessible, and
            guilt-free
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary transition-transform duration-300 group-hover:scale-110">
                <benefit.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="mb-3 text-xl font-bold">{benefit.title}</h3>
              <p className="text-secondary-foreground/70">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

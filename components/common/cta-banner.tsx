import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-primary py-16 md:py-24">
      <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl lg:text-5xl">
          <span className="text-balance">
            Ready to Start Your Healthy Snacking Journey?
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
          Order now and get 20% off on your first purchase. Use code{" "}
          <span className="font-bold">CRUNCHLEY20</span>
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            variant="secondary"
            className="gap-2 text-base"
          >
            Order Now
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
          >
            View All Products
          </Button>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
    </section>
  )
}

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

const reviews = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    review:
      "Absolutely love Crunchley! The Peri Peri flavor is addictive. Finally, a snack I can enjoy without guilt. My kids love it too!",
    avatar: "PS",
  },
  {
    id: 2,
    name: "Rahul Verma",
    location: "Delhi",
    rating: 5,
    review:
      "Best makhana I&apos;ve ever had! The roasting is perfect and the flavors are just right. Ordered 6 packs already this month.",
    avatar: "RV",
  },
  {
    id: 3,
    name: "Ananya Patel",
    location: "Bangalore",
    rating: 5,
    review:
      "As a fitness enthusiast, I&apos;m always looking for healthy snacks. Crunchley is now my go-to for post-workout munching!",
    avatar: "AP",
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Jaipur",
    rating: 4,
    review:
      "Great taste and quality packaging. The cheese flavor reminds me of my favorite chips but so much healthier!",
    avatar: "VS",
  },
]

export function CustomerReviews() {
  return (
    <section id="reviews" className="bg-muted/50 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-primary">
            Testimonials
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            <span className="text-balance">What Our Customers Say</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Join thousands of happy snackers who made the switch to healthy
            crunching
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="group border-0 bg-card shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <Quote className="mb-4 h-8 w-8 text-primary/30" />
                <p className="mb-6 text-muted-foreground">{review.review}</p>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {review.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {review.location}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                  {Array.from({ length: 5 - review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-muted-foreground/30" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid gap-8 rounded-2xl bg-card p-8 shadow-sm sm:grid-cols-3">
          <div className="text-center">
            <div className="font-serif text-4xl font-bold text-foreground md:text-5xl">
              50K+
            </div>
            <p className="mt-2 text-muted-foreground">Happy Customers</p>
          </div>
          <div className="text-center">
            <div className="font-serif text-4xl font-bold text-foreground md:text-5xl">
              4.8
            </div>
            <p className="mt-2 text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="font-serif text-4xl font-bold text-foreground md:text-5xl">
              100K+
            </div>
            <p className="mt-2 text-muted-foreground">Packs Sold</p>
          </div>
        </div>
      </div>
    </section>
  )
}

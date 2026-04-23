"use client"

import { useState } from "react"
import { Star, ThumbsUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const reviews = [
  {
    id: 1,
    name: "Priya Sharma",
    avatar: "PS",
    rating: 5,
    date: "2 weeks ago",
    verified: true,
    title: "Best makhana I have ever tried!",
    content:
      "The cheese flavor is absolutely perfect - not too overpowering, just right. I love that it is roasted and not fried. My entire family is now addicted to Crunchley!",
    helpful: 24,
    images: [],
  },
  {
    id: 2,
    name: "Rahul Verma",
    avatar: "RV",
    rating: 5,
    date: "1 month ago",
    verified: true,
    title: "Perfect for my diet",
    content:
      "As someone who is trying to lose weight, finding tasty yet healthy snacks was a challenge. Crunchley solved that problem. The protein content is great and it keeps me full for hours.",
    helpful: 18,
    images: [],
  },
  {
    id: 3,
    name: "Ananya Patel",
    avatar: "AP",
    rating: 4,
    date: "1 month ago",
    verified: true,
    title: "Great taste, wish the pack was bigger",
    content:
      "The taste is amazing and I appreciate the natural ingredients. Only wish is that the pack size was larger because it finishes too quickly in my house!",
    helpful: 12,
    images: [],
  },
  {
    id: 4,
    name: "Vikram Singh",
    avatar: "VS",
    rating: 5,
    date: "2 months ago",
    verified: true,
    title: "Replaced my chips addiction",
    content:
      "I used to snack on unhealthy chips all day. Since I discovered Crunchley, I have completely switched. Same satisfaction, none of the guilt. Highly recommend!",
    helpful: 31,
    images: [],
  },
]

const ratingDistribution = [
  { stars: 5, percentage: 78, count: 892 },
  { stars: 4, percentage: 15, count: 171 },
  { stars: 3, percentage: 5, count: 57 },
  { stars: 2, percentage: 1, count: 11 },
  { stars: 1, percentage: 1, count: 11 },
]

export function ProductReviews() {
  const [showAll, setShowAll] = useState(false)
  const [helpfulReviews, setHelpfulReviews] = useState<number[]>([])

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3)

  const handleHelpful = (reviewId: number) => {
    if (!helpfulReviews.includes(reviewId)) {
      setHelpfulReviews([...helpfulReviews, reviewId])
    }
  }

  return (
    <section className="mt-12 md:mt-16">
      <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
        Customer Reviews
      </h2>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Rating Summary */}
        <div className="rounded-xl border bg-card p-6">
          <div className="text-center">
            <div className="font-serif text-5xl font-bold text-foreground">
              4.8
            </div>
            <div className="mt-2 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < 5 ? "fill-primary text-primary" : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Based on 1,142 reviews
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex w-12 items-center gap-1 text-sm">
                  <span>{item.stars}</span>
                  <Star className="h-3 w-3 fill-primary text-primary" />
                </div>
                <Progress value={item.percentage} className="h-2 flex-1" />
                <span className="w-10 text-right text-sm text-muted-foreground">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          <Button className="mt-6 w-full rounded-full" variant="outline">
            Write a Review
          </Button>
        </div>

        {/* Reviews List */}
        <div className="space-y-6 lg:col-span-2">
          {displayedReviews.map((review) => (
            <div key={review.id} className="rounded-xl border bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {review.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {review.name}
                      </span>
                      {review.verified && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {review.date}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < review.rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
              </div>

              <h4 className="mt-4 font-medium text-foreground">
                {review.title}
              </h4>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {review.content}
              </p>

              <div className="mt-4 flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 text-muted-foreground",
                    helpfulReviews.includes(review.id) && "text-primary"
                  )}
                  onClick={() => handleHelpful(review.id)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Helpful (
                  {review.helpful +
                    (helpfulReviews.includes(review.id) ? 1 : 0)}
                  )
                </Button>
              </div>
            </div>
          ))}

          {!showAll && reviews.length > 3 && (
            <Button
              variant="outline"
              className="w-full gap-2 rounded-full"
              onClick={() => setShowAll(true)}
            >
              Show All Reviews
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

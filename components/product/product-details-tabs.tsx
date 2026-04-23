"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Leaf, Flame, Wheat, Droplets, Check } from "lucide-react"

const tabs = [
  { id: "description", label: "Description" },
  { id: "nutrition", label: "Nutritional Benefits" },
  { id: "ingredients", label: "Ingredients" },
]

const nutritionFacts = [
  { label: "Energy", value: "380 kcal", per100g: true },
  { label: "Protein", value: "9.7g", per100g: true },
  { label: "Carbohydrates", value: "76.9g", per100g: true },
  { label: "Fat", value: "0.1g", per100g: true },
  { label: "Fiber", value: "14.5g", per100g: true },
  { label: "Sodium", value: "210mg", per100g: true },
]

const benefits = [
  {
    icon: Flame,
    title: "High Protein",
    description: "9.7g protein per 100g for muscle recovery and sustained energy",
  },
  {
    icon: Leaf,
    title: "100% Roasted",
    description: "Air-roasted, never fried - retaining all natural goodness",
  },
  {
    icon: Wheat,
    title: "Gluten Free",
    description: "Naturally gluten-free, perfect for sensitive diets",
  },
  {
    icon: Droplets,
    title: "Low Fat",
    description: "Only 0.1g fat per 100g - guilt-free snacking",
  },
]

const ingredients = [
  "Roasted Makhana (Fox Nuts)",
  "Cheese Seasoning",
  "Salt",
  "Natural Spices",
  "Olive Oil (trace)",
]

export function ProductDetailsTabs() {
  const [activeTab, setActiveTab] = useState("description")

  return (
    <div className="mt-12 md:mt-16">
      {/* Tab Headers */}
      <div className="flex gap-1 overflow-x-auto border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {/* Description */}
        {activeTab === "description" && (
          <div className="prose prose-gray max-w-none">
            <h3 className="font-serif text-2xl font-bold text-foreground">
              The Perfect Snack for Every Moment
            </h3>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Crunchley Cheese Makhana is crafted for those who refuse to
              compromise between taste and health. Our premium fox nuts are
              sourced from the finest farms in Bihar, India, where makhana has
              been cultivated for centuries.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Each batch is carefully air-roasted to achieve the perfect crunch
              while preserving all the natural nutrients. We then season them
              with our signature cheese blend, creating a flavor that&apos;s
              irresistibly addictive yet completely guilt-free.
            </p>
            <h4 className="mt-6 font-serif text-xl font-bold text-foreground">
              Why Choose Crunchley?
            </h4>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-1 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>Premium quality makhana from trusted farmers</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-1 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>Air-roasted, never fried for maximum health benefits</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-1 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>No artificial preservatives or colors</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-1 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>Perfect for weight watchers and fitness enthusiasts</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-1 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>Resealable packaging to maintain freshness</span>
              </li>
            </ul>
          </div>
        )}

        {/* Nutritional Benefits */}
        {activeTab === "nutrition" && (
          <div>
            {/* Benefits Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground">{benefit.title}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Nutrition Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="border-b bg-muted/50 px-6 py-4">
                <h4 className="font-bold text-foreground">
                  Nutritional Information
                </h4>
                <p className="text-sm text-muted-foreground">Per 100g serving</p>
              </div>
              <div className="divide-y">
                {nutritionFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <span className="text-muted-foreground">{fact.label}</span>
                    <span className="font-medium text-foreground">
                      {fact.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ingredients */}
        {activeTab === "ingredients" && (
          <div>
            <div className="rounded-xl border bg-card p-6">
              <h4 className="mb-4 font-bold text-foreground">Ingredients</h4>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <span
                    key={ingredient}
                    className="inline-flex items-center rounded-full bg-muted px-4 py-2 text-sm text-foreground"
                  >
                    {ingredient}
                    {index < ingredients.length - 1 && (
                      <span className="ml-2 text-muted-foreground">•</span>
                    )}
                  </span>
                ))}
              </div>

              <div className="mt-8 rounded-lg bg-primary/5 p-4">
                <h5 className="font-medium text-foreground">Allergen Info</h5>
                <p className="mt-2 text-sm text-muted-foreground">
                  Contains: Milk derivatives (cheese seasoning). May contain
                  traces of nuts. Manufactured in a facility that also processes
                  wheat, soy, and peanuts.
                </p>
              </div>

              <div className="mt-6">
                <h5 className="font-medium text-foreground">Storage Instructions</h5>
                <p className="mt-2 text-sm text-muted-foreground">
                  Store in a cool, dry place. Once opened, reseal the pack
                  tightly and consume within 2 weeks for best taste and crunch.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

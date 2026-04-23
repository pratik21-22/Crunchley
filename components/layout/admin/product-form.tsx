"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

export type AdminProductFormValues = {
  name: string
  slug: string
  price: number
  image: string
  category: string
  description: string
  stock: number
}

type ProductFormProps = {
  initialValues?: AdminProductFormValues
  submitting?: boolean
  submitLabel: string
  onCancel: () => void
  onSave: (values: AdminProductFormValues) => Promise<void> | void
}

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

const DEFAULT_VALUES: AdminProductFormValues = {
  name: "",
  slug: "",
  price: 0,
  image: "",
  category: "Makhana",
  description: "",
  stock: 0,
}

export function ProductForm({ initialValues, submitting = false, submitLabel, onCancel, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState<AdminProductFormValues>(initialValues || DEFAULT_VALUES)

  const hasManualSlug = useMemo(() => !!initialValues?.slug, [initialValues?.slug])

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: hasManualSlug || prev.slug ? prev.slug : toSlug(value),
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const payload: AdminProductFormValues = {
      name: formData.name.trim(),
      slug: toSlug(formData.slug || formData.name),
      price: Number(formData.price),
      image: formData.image.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),
      stock: Number(formData.stock),
    }

    await onSave(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Product Name</FieldLabel>
          <Input
            id="name"
            value={formData.name}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="Enter product name"
            required
            minLength={2}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(event) => setFormData((prev) => ({ ...prev, slug: toSlug(event.target.value) }))}
              placeholder="classic-roasted-makhana"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Input
              id="category"
              value={formData.category}
              onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
              placeholder="Makhana"
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="price">Price (INR)</FieldLabel>
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              value={formData.price}
              onChange={(event) => setFormData((prev) => ({ ...prev, price: Number(event.target.value) }))}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="stock">Stock</FieldLabel>
            <Input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={formData.stock}
              onChange={(event) => setFormData((prev) => ({ ...prev, stock: Number(event.target.value) }))}
              required
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="image">Image URL</FieldLabel>
          <Input
            id="image"
            value={formData.image}
            onChange={(event) => setFormData((prev) => ({ ...prev, image: event.target.value }))}
            placeholder="/images/classic-roasted-makhana.jpg"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Write a short product description"
            rows={4}
            required
            minLength={10}
          />
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}

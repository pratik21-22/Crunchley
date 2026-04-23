import { Types } from "mongoose"
import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import Product from "@/lib/models/product"

type ProductPatchPayload = {
  name?: string
  slug?: string
  price?: number
  image?: string
  category?: string
  description?: string
  stock?: number
}

type RouteContext = {
  params: Promise<{ id: string }>
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal Server Error"
}

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

async function ensureAdmin(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
  const session = await verifyAuthToken(token)

  if (!session) {
    return { ok: false as const, response: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) }
  }

  if (session.role !== "admin") {
    return { ok: false as const, response: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }) }
  }

  return { ok: true as const }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase()

    const admin = await ensureAdmin(req)
    if (!admin.ok) return admin.response

    const { id } = await context.params

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid product id" }, { status: 400 })
    }

    const body = (await req.json()) as ProductPatchPayload
    const updates: Record<string, unknown> = {}

    if (typeof body.name === "string") {
      const name = body.name.trim()
      if (name.length < 2) {
        return NextResponse.json({ success: false, error: "Product name must be at least 2 characters" }, { status: 400 })
      }
      updates.name = name
    }

    if (typeof body.slug === "string") {
      const slug = toSlug(body.slug)
      if (!slug) {
        return NextResponse.json({ success: false, error: "Invalid product slug" }, { status: 400 })
      }
      updates.slug = slug
    }

    if (typeof body.price === "number") {
      if (!Number.isFinite(body.price) || body.price < 0) {
        return NextResponse.json({ success: false, error: "Product price must be a non-negative number" }, { status: 400 })
      }
      updates.price = body.price
    }

    if (typeof body.stock === "number") {
      if (!Number.isFinite(body.stock) || body.stock < 0) {
        return NextResponse.json({ success: false, error: "Product stock must be a non-negative number" }, { status: 400 })
      }
      updates.stock = body.stock
    }

    if (typeof body.image === "string") {
      const image = body.image.trim()
      if (!image) {
        return NextResponse.json({ success: false, error: "Image URL cannot be empty" }, { status: 400 })
      }
      updates.image = image
    }

    if (typeof body.category === "string") {
      const category = body.category.trim()
      if (!category) {
        return NextResponse.json({ success: false, error: "Category cannot be empty" }, { status: 400 })
      }
      updates.category = category
    }

    if (typeof body.description === "string") {
      const description = body.description.trim()
      if (description.length < 10) {
        return NextResponse.json(
          { success: false, error: "Product description must be at least 10 characters" },
          { status: 400 }
        )
      }
      updates.description = description
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields provided" }, { status: 400 })
    }

    if (typeof updates.slug === "string") {
      const existing = await Product.findOne({ slug: updates.slug, _id: { $ne: id } }).lean()
      if (existing) {
        return NextResponse.json({ success: false, error: "A product with this slug already exists" }, { status: 409 })
      }
    }

    const product = await Product.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).lean()

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: String(product._id),
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.image,
          category: product.category,
          description: product.description,
          stock: product.stock,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error("Failed to update product:", error)
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase()

    const admin = await ensureAdmin(req)
    if (!admin.ok) return admin.response

    const { id } = await context.params

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid product id" }, { status: 400 })
    }

    const deleted = await Product.findByIdAndDelete(id).lean()

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { id } }, { status: 200 })
  } catch (error: unknown) {
    console.error("Failed to delete product:", error)
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

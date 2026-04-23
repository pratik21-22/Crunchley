import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import Product from "@/lib/models/product"

type ProductPayload = {
  name: string
  slug?: string
  price: number
  image: string
  category: string
  description: string
  stock: number
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal Server Error"
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function validateProductPayload(body: unknown): { valid: true; payload: ProductPayload } | { valid: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Invalid request payload" }
  }

  const data = body as Partial<ProductPayload>
  const name = typeof data.name === "string" ? data.name.trim() : ""
  const category = typeof data.category === "string" ? data.category.trim() : ""
  const description = typeof data.description === "string" ? data.description.trim() : ""
  const image = typeof data.image === "string" ? data.image.trim() : ""
  const slug = typeof data.slug === "string" && data.slug.trim() ? toSlug(data.slug) : toSlug(name)
  const price = typeof data.price === "number" ? data.price : NaN
  const stock = typeof data.stock === "number" ? data.stock : NaN

  if (!name || name.length < 2) {
    return { valid: false, error: "Product name must be at least 2 characters" }
  }

  if (!slug) {
    return { valid: false, error: "Product slug is required" }
  }

  if (!category) {
    return { valid: false, error: "Product category is required" }
  }

  if (!description || description.length < 10) {
    return { valid: false, error: "Product description must be at least 10 characters" }
  }

  if (!image) {
    return { valid: false, error: "Product image URL is required" }
  }

  if (!Number.isFinite(price) || price < 0) {
    return { valid: false, error: "Product price must be a non-negative number" }
  }

  if (!Number.isFinite(stock) || stock < 0) {
    return { valid: false, error: "Product stock must be a non-negative number" }
  }

  return {
    valid: true,
    payload: {
      name,
      slug,
      price,
      image,
      category,
      description,
      stock,
    },
  }
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

// GET /api/products
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const page = parsePositiveInt(req.nextUrl.searchParams.get("page"), 1)
    const pageSize = Math.min(parsePositiveInt(req.nextUrl.searchParams.get("pageSize"), 20), 100)
    const skip = (page - 1) * pageSize

    const [products, total] = await Promise.all([
      Product.find({}).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      Product.countDocuments({}),
    ])

    return NextResponse.json(
      {
        success: true,
        data: products.map((product) => ({
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
        })),
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error("Failed to fetch products:", error)
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

// POST /api/products
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const admin = await ensureAdmin(req)
    if (!admin.ok) return admin.response

    const body = await req.json()
    const validation = validateProductPayload(body)

    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    const existing = await Product.findOne({ slug: validation.payload.slug }).lean()
    if (existing) {
      return NextResponse.json({ success: false, error: "A product with this slug already exists" }, { status: 409 })
    }

    const product = await Product.create(validation.payload)

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
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error("Failed to create product:", error)
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

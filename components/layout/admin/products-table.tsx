"use client"

import { useEffect, useState } from "react"
import { Edit, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminProductFormValues, ProductForm } from "./product-form"

export type AdminProduct = AdminProductFormValues & {
  id: string
  createdAt?: string
  updatedAt?: string
}

type ProductsApiResponse = {
  success: boolean
  error?: string
  data: AdminProduct[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

function getStockBadge(stock: number) {
  if (stock <= 0) return { label: "Out of stock", className: "border-red-200 bg-red-50 text-red-700" }
  if (stock < 25) return { label: "Low stock", className: "border-amber-200 bg-amber-50 text-amber-700" }
  return { label: "In stock", className: "border-green-200 bg-green-50 text-green-700" }
}

export function ProductsTable() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/products?page=1&pageSize=100", { cache: "no-store" })
      const payload = (await response.json()) as ProductsApiResponse

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to fetch products")
      }

      setProducts(payload.data || [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch products"
      setProducts([])
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const openCreateForm = () => {
    setEditingProduct(null)
    setFormOpen(true)
  }

  const openEditForm = (product: AdminProduct) => {
    setEditingProduct(product)
    setFormOpen(true)
  }

  const handleSave = async (values: AdminProductFormValues) => {
    setSaving(true)

    try {
      const isEditing = !!editingProduct
      const response = await fetch(isEditing ? `/api/products/${editingProduct.id}` : "/api/products", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const payload = (await response.json()) as { success: boolean; error?: string }

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to save product")
      }

      toast.success(isEditing ? "Product updated" : "Product created")
      setFormOpen(false)
      setEditingProduct(null)
      fetchProducts()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" })
      const payload = (await response.json()) as { success: boolean; error?: string }

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to delete product")
      }

      toast.success("Product deleted")
      setDeleteTarget(null)
      fetchProducts()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button className="gap-2" onClick={openCreateForm}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead className="hidden md:table-cell">Slug</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Fetching products...
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No products available yet.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const stockBadge = getStockBadge(product.stock)

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded bg-muted">
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{product.slug}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{product.stock}</span>
                          <Badge variant="outline" className={stockBadge.className}>
                            {stockBadge.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{product.category}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => openEditForm(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(product)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update product details and stock information."
                : "Create a new product for the Crunchley catalog."}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            initialValues={editingProduct || undefined}
            submitLabel={editingProduct ? "Update Product" : "Create Product"}
            submitting={saving}
            onCancel={() => setFormOpen(false)}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Delete '${deleteTarget.name}' permanently? This action cannot be undone.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { AdminHeader } from "./admin-header"
import { ProductsTable } from "./products-table"

export function ProductsPageWrapper() {
  return (
    <>
      <AdminHeader
        title="Products"
        description="Manage your product catalog"
      />
      <div className="p-4 lg:p-6">
        <ProductsTable />
      </div>
    </>
  )
}

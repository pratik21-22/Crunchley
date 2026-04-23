import { AdminHeader } from "@/components/layout/admin/admin-header"
import { OrdersTable } from "@/components/layout/admin/orders-table"

export default function AdminOrdersPage() {
  return (
    <>
      <AdminHeader
        title="Orders"
        description="Manage and track customer orders"
      />
      <div className="p-4 lg:p-6">
        <OrdersTable />
      </div>
    </>
  )
}

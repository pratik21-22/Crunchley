$dirs = @(
    "app/(user)", "app/(auth)", "app/(user)/profile",
    "app/api/auth", "app/api/products", "app/api/orders", "app/api/payment",
    "app/admin/dashboard", "app/admin/users",
    "components/layout", "components/product", "components/cart", "components/common",
    "services", "store", "types"
)
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Force -Path $d
    }
}

# 2. Move app routes
if (Test-Path "app/cart") { Move-Item -Path "app/cart" -Destination "app/(user)/cart" -Force }
if (Test-Path "app/checkout") { Move-Item -Path "app/checkout" -Destination "app/(user)/checkout" -Force }
if (Test-Path "app/product") { Move-Item -Path "app/product" -Destination "app/(user)/products" -Force }
if (Test-Path "app/page.tsx") { Move-Item -Path "app/page.tsx" -Destination "app/(user)/page.tsx" -Force }

if (Test-Path "app/login") { Move-Item -Path "app/login" -Destination "app/(auth)/login" -Force }
if (Test-Path "app/signup") { Move-Item -Path "app/signup" -Destination "app/(auth)/signup" -Force }
if (Test-Path "app/forgot-password") { Move-Item -Path "app/forgot-password" -Destination "app/(auth)/forgot-password" -Force }

if (Test-Path "app/admin/page.tsx") { Move-Item -Path "app/admin/page.tsx" -Destination "app/admin/orders/page.tsx" -Force }

# 3. Move components
$components = @{
    "components/header.tsx" = "components/layout/";
    "components/footer.tsx" = "components/layout/";
    "components/admin" = "components/layout/admin";
    "components/featured-products.tsx" = "components/product/";
    "components/product-details-tabs.tsx" = "components/product/";
    "components/product-image-gallery.tsx" = "components/product/";
    "components/product-info.tsx" = "components/product/";
    "components/product-reviews.tsx" = "components/product/";
    "components/shop-by-flavours.tsx" = "components/product/";
    "components/cart-item.tsx" = "components/cart/";
    "components/checkout-form.tsx" = "components/cart/";
    "components/checkout-summary.tsx" = "components/cart/";
    "components/order-summary.tsx" = "components/cart/";
    "components/sticky-add-to-cart.tsx" = "components/cart/";
    "components/cta-banner.tsx" = "components/common/";
    "components/customer-reviews.tsx" = "components/common/";
    "components/why-choose-us.tsx" = "components/common/";
    "components/theme-provider.tsx" = "components/common/";
    "components/auth-form.tsx" = "components/common/";
}

foreach ($key in $components.Keys) {
    if (Test-Path $key) {
        Move-Item -Path $key -Destination $components[$key] -Force
    }
}

# Scaffold basic pages
Set-Content -Path "app/(user)/profile/page.tsx" -Value 'export default function ProfilePage() { return <div>Profile Page</div>; }'
Set-Content -Path "app/admin/users/page.tsx" -Value 'export default function AdminUsersPage() { return <div>Manage Users</div>; }'
Set-Content -Path "app/admin/dashboard/page.tsx" -Value 'export default function AdminDashboardPage() { return <div>Dashboard overview</div>; }'

# Scaffold placeholders
Set-Content -Path "services/api.ts" -Value 'export const api = {};'
Set-Content -Path "services/auth.service.ts" -Value 'export const authService = {};'
Set-Content -Path "services/product.service.ts" -Value 'export const productService = {};'
Set-Content -Path "services/order.service.ts" -Value 'export const orderService = {};'

Set-Content -Path "store/index.ts" -Value 'import { create } from "zustand"; `n`nexport const useStore = create((set) => ({}));'
Set-Content -Path "types/index.ts" -Value 'export interface Product {} `nexport interface User {}'
Set-Content -Path "lib/db.ts" -Value 'export const db = {};'
Set-Content -Path "lib/constants.ts" -Value 'export const SITE_NAME = "Crunchley";'

Write-Output "Refactor complete."

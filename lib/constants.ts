export const SITE_NAME = "Crunchley";

/**
 * NAVIGATION CONFIGURATION
 * Single source of truth for navbar items
 */
export type NavItemType = "route" | "hash";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  type: NavItemType;
  section?: string; // For hash-based navigation on homepage
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    type: "route",
  },
  {
    id: "shop",
    label: "Shop",
    href: "/products",
    type: "route",
  },
  {
    id: "bestsellers",
    label: "Bestsellers",
    href: "/#bestsellers",
    type: "hash",
    section: "bestsellers",
  },
  {
    id: "flavours",
    label: "Flavours",
    href: "/#flavours",
    type: "hash",
    section: "flavours",
  },
  {
    id: "enquiry",
    label: "Business Enquiry",
    href: "/#business-enquiry",
    type: "hash",
    section: "business-enquiry",
  },
];

/**
 * ACTIVE STATE LOGIC
 * Pure function - no side effects, no internal state
 * 
 * Rules:
 * 1. Home: active only when pathname === "/" AND no hash
 * 2. Route items: active when pathname matches
 * 3. Hash items: active ONLY when pathname === "/" AND hash matches
 * 4. If not on homepage, hash is ignored
 * 5. Only ONE item can be active
 */
export function getActiveNavId(pathname: string, hash: string): string {
  // On homepage
  if (pathname === "/") {
    // Hash takes priority if present
    if (hash) {
      const hashItem = NAVIGATION_ITEMS.find(
        (item) => item.type === "hash" && item.section === hash
      );
      return hashItem?.id || "home";
    }
    return "home";
  }

  // Off homepage - route-based matching only
  const routeItem = NAVIGATION_ITEMS.find((item) => {
    if (item.type === "hash") return false; // Ignore hash items off homepage
    return pathname.startsWith(item.href) && item.href !== "/";
  });

  return routeItem?.id || "";
}

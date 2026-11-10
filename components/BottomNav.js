"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, Truck } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/track-order", label: "Track Order", icon: Truck },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide entirely on admin routes
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold/15 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden">
      <div className="grid grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition ${
                isActive ? "text-forest" : "text-muted"
              }`}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={isActive ? 2.4 : 2}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
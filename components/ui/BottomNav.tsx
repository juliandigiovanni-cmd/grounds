"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Map", icon: "🗺️" },
  { href: "/search", label: "Search", icon: "🔍" },
  { href: "/saved", label: "Saved", icon: "🔖" },
  { href: "/submit", label: "Submit", icon: "✚" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="absolute bottom-0 left-0 right-0 z-30 bg-grounds-cream/95 backdrop-blur-sm border-t border-grounds-brown/10 flex items-center justify-around safe-area-inset-bottom"
      style={{ height: 64 }}>
      {NAV_ITEMS.map(item => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${active ? "text-grounds-espresso" : "text-grounds-brown/50"}`}
            style={{ minWidth: 64, minHeight: 44 }}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

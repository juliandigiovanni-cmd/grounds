import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/blurbs", label: "Blurbs" },
  { href: "/admin/flags", label: "Flags" },
  { href: "/admin/outreach", label: "Outreach" },
  { href: "/admin/revenue", label: "Revenue" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-grounds-cream flex flex-col">
      <nav className="bg-grounds-espresso text-grounds-cream px-4 py-2 flex items-center gap-1 text-sm overflow-x-auto">
        <Link href="/" className="text-grounds-cream/50 hover:text-grounds-cream px-3 py-1.5 rounded-lg shrink-0">
          ← Map
        </Link>
        <span className="text-grounds-cream/20 shrink-0">|</span>
        {NAV.map(n => (
          <Link
            key={n.href}
            href={n.href}
            className="text-grounds-cream/70 hover:text-grounds-cream px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          >
            {n.label}
          </Link>
        ))}
        <span className="flex-1" />
        <Link
          href="/api/admin/logout"
          className="text-grounds-cream/40 hover:text-grounds-cream px-3 py-1.5 text-xs shrink-0"
        >
          Sign out
        </Link>
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}

import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-grounds-brown/10 bg-grounds-cream py-6 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-grounds-brown/50">© 2026 {BRAND_NAME}.</p>
        <nav className="flex items-center gap-4 text-sm text-grounds-brown/50">
          <Link href="/about" className="hover:text-grounds-brown transition-colors">About</Link>
          <Link href="/privacy" className="hover:text-grounds-brown transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-grounds-brown transition-colors">Terms</Link>
          <Link href="/advertise" className="hover:text-grounds-brown transition-colors">Advertise</Link>
          <Link href="/submit" className="hover:text-grounds-brown transition-colors">Submit a Café</Link>
        </nav>
      </div>
    </footer>
  );
}

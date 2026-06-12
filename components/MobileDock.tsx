"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, Flame, Home, Layers3, Search } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/popular", label: "Populer", icon: Flame },
  { href: "/search", label: "Cari", icon: Search },
  { href: "/batch", label: "Batch", icon: Layers3 },
  { href: "/history", label: "History", icon: Clock3 },
];

export default function MobileDock() {
  const pathname = usePathname();

  return (
    <nav className="mobile-dock md:hidden" aria-label="Navigasi mobile">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} prefetch={false} aria-current={active ? "page" : undefined}>
            <Icon size={19} strokeWidth={active ? 2.6 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

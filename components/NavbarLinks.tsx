"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, Layers3, CheckCircle, List } from "lucide-react";

type NavItem = { href: string; label: string; exact?: boolean; icon?: typeof Home };

const SAMEHADAKU_ITEMS: NavItem[] = [
  { href: "/", label: "Home", exact: true, icon: Home },
  { href: "/popular", label: "Populer", icon: Flame },
  { href: "/batch", label: "Batch", icon: Layers3 },
];

const OTAKUDESU_ITEMS: NavItem[] = [
  { href: "/otakudesu", label: "Home", exact: true, icon: Home },
  { href: "/otakudesu/completed", label: "Completed", icon: CheckCircle },
  { href: "/otakudesu/anime/unlimited", label: "Daftar Anime", icon: List },
];

export default function NavbarLinks({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const isOtakudesu = pathname.startsWith("/otakudesu");
  const items = isOtakudesu ? OTAKUDESU_ITEMS : SAMEHADAKU_ITEMS;

  return (
    <div className={`nav-links flex items-center ${className}`}>
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className="nav-link flex items-center gap-1.5"
            aria-current={active ? "page" : undefined}
          >
            {Icon && <Icon size={14} strokeWidth={active ? 2.6 : 2} />}
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

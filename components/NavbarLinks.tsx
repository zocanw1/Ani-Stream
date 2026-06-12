"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; exact?: boolean };

export default function NavbarLinks({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const isOtakudesu = pathname.startsWith("/otakudesu");
  const items: NavItem[] = isOtakudesu
    ? [
        { href: "/otakudesu", label: "Home", exact: true },
        { href: "/otakudesu/completed", label: "Completed" },
        { href: "/otakudesu/anime/unlimited", label: "Daftar Anime" },
      ]
    : [
        { href: "/", label: "Home", exact: true },
        { href: "/popular", label: "Populer" },
        { href: "/batch", label: "Batch" },
      ];

  return (
    <div className={`nav-links ${className}`}>
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} prefetch={false} className="nav-link" aria-current={active ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

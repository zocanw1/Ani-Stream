"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Clock3, LogIn, LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type User = { id: string; email: string };

export default function AuthMenu({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [databaseConfigured, setDatabaseConfigured] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((json) => {
        if (!active) return;
        setUser(json.user ?? null);
        setDatabaseConfigured(json.databaseConfigured !== false);
      })
      .catch(() => active && setDatabaseConfigured(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    function closeOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOpen(false);
    router.refresh();
  }

  if (!user) {
    return (
      <Link href={`/login?next=${encodeURIComponent(pathname || "/")}`} prefetch={false} className={`header-login ${className}`}>
        <LogIn size={16} />
        <span>Masuk</span>
      </Link>
    );
  }

  return (
    <div ref={menuRef} className={`account-menu ${className}`}>
      <button type="button" className="account-menu__trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu">
        <span className="account-avatar"><UserRound size={17} /></span>
        <span className="hidden lg:block">{user.email.split("@")[0]}</span>
      </button>

      {open && (
        <div className="account-popover" role="menu">
          <div className="account-popover__identity">
            <span>Login sebagai</span>
            <strong>{user.email}</strong>
          </div>
          {!databaseConfigured ? (
            <p className="account-popover__notice">Database belum aktif. Atur DATABASE_URL untuk mengaktifkan history.</p>
          ) : (
            <>
              <Link href="/history" prefetch={false} onClick={() => setOpen(false)} role="menuitem"><Clock3 size={17} /> History Anime</Link>
              <Link href="/history/episodes" prefetch={false} onClick={() => setOpen(false)} role="menuitem"><Clock3 size={17} /> History Episode</Link>
            </>
          )}
          <button type="button" onClick={logout} role="menuitem"><LogOut size={17} /> Keluar</button>
        </div>
      )}
    </div>
  );
}

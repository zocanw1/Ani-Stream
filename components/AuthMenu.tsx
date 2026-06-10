"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
};

export default function AuthMenu({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [databaseConfigured, setDatabaseConfigured] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function refreshSession() {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const json = await response.json();
      if (!active) return;
      setUser(json.user ?? null);
      setDatabaseConfigured(json.databaseConfigured !== false);
    }

    refreshSession().catch(() => {
      if (active) setDatabaseConfigured(false);
    });

    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOpen(false);
    router.refresh();
  }

  const loginHref = `/login?next=${encodeURIComponent(pathname || "/")}`;

  if (!user) {
    return (
      <Link
        href={loginHref}
        prefetch={false}
        className={`rounded-md bg-[#E50914] px-3 py-2 text-[10px] font-black text-white transition-all hover:bg-[#B20710] sm:text-sm ${className}`}
      >
        Masuk
      </Link>
    );
  }

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-md bg-white px-3 py-2 text-[10px] font-black text-black transition-all hover:bg-neutral-200 sm:text-sm"
      >
        Akun
      </button>

      {open && (
        <div className="glass absolute right-0 top-full z-[80] mt-3 w-[min(90vw,300px)] rounded-2xl p-5">
          {!databaseConfigured ? (
            <div className="space-y-3">
              <h2 className="text-sm font-black text-white">Database belum aktif</h2>
              <p className="text-xs leading-6 text-neutral-400">
                Tambahkan env <span className="font-mono text-[#E50914]">DATABASE_URL</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#E50914]">Login sebagai</p>
                <p className="mt-1 truncate text-sm font-black text-white">{user.email}</p>
              </div>

              <div className="grid gap-2">
                <Link
                  href="/history"
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/15"
                >
                  History Anime
                </Link>
                <Link
                  href="/history/episodes"
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/15"
                >
                  History Episode
                </Link>
              </div>

              <button
                type="button"
                onClick={logout}
                className="w-full rounded-md bg-[#E50914] py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#B20710]"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

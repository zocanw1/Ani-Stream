"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function NavbarSearch() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isOtakudesu = pathname.startsWith("/otakudesu");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    router.push(`${isOtakudesu ? "/otakudesu/search" : "/search"}?q=${encodeURIComponent(normalized)}`);
    setQuery("");
    inputRef.current?.blur();
  }

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.key === "/" || (event.ctrlKey && event.key.toLowerCase() === "k")) && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName ?? "")) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="nav-search" role="search">
      <Search size={16} aria-hidden="true" />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        type="search"
        inputMode="search"
        aria-label="Cari anime"
        placeholder="Cari anime..."
      />
      {query ? (
        <button type="button" onClick={() => setQuery("")} className="icon-button icon-button--small" aria-label="Hapus pencarian">
          <X size={15} />
        </button>
      ) : (
        <kbd className="hidden sm:inline-flex">Ctrl K</kbd>
      )}
    </form>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function NavbarSearch() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  const isOtakudesu = pathname.startsWith("/otakudesu");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchPath = isOtakudesu ? "/otakudesu/search" : "/search";
      router.push(`${searchPath}?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  // Keyboard shortcut: Press '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="relative group w-full max-w-[200px] sm:max-w-xs transition-all duration-300">
      <div className={`relative flex items-center transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className={`w-4 h-4 transition-colors duration-200 ${isFocused ? (isOtakudesu ? 'text-[#FF7675]' : 'text-[#6C5CE7]') : 'text-[#1E1B29]'}`}
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="2.5" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Cari anime..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full pl-9 pr-8 py-2 text-xs font-black rounded-xl bg-white border-[3px] border-[#1E1B29] text-[#1E1B29] placeholder-[#1E1B29]/50 shadow-[4px_4px_0_#1E1B29] focus:outline-none transition-all ${
            isFocused 
              ? `-translate-x-0.5 -translate-y-0.5 ${isOtakudesu ? 'bg-[#FFF3D2]' : 'bg-[#FAF9FF]'}`
              : ''
          }`}
        />
        {!isFocused && !query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none hidden sm:flex">
            <span className="text-[10px] font-black text-[#1E1B29] bg-[#FDCB6E] px-1.5 py-0.5 rounded border-2 border-[#1E1B29]">/</span>
          </div>
        )}
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#1E1B29] hover:text-[#FF7675] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}

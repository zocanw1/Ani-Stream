"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  sectionId?: string;
  paramName?: string;
}

export default function Pagination({ currentPage, totalPages, sectionId, paramName = "page" }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getPageNumbers = () => {
    let pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages = [1, 2, 3, 4, "...", totalPages];
      else if (currentPage >= totalPages - 2) pages = [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      else pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, page.toString());
    router.push(`?${params.toString()}${sectionId ? `#${sectionId}` : ""}`, { scroll: false });
    
    if (sectionId) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      {getPageNumbers().map((p, i) => (
        typeof p === "string" ? <span key={`dots-${i}`} className="text-gray-600">...</span> : (
          <button
            key={p}
            onClick={() => handlePageChange(p as number)}
            className={`min-w-[40px] h-10 px-2 rounded-lg text-sm font-bold transition-all ${currentPage === p ? "bg-[#ff7675] text-white shadow-lg shadow-[#ff7675]/30 scale-110" : "text-gray-500 hover:text-gray-300 glass"}`}
          >
            {p}
          </button>
        )
      ))}
    </div>
  );
}

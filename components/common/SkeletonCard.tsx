"use client";

import React from "react";

export default function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden glass border border-white/5 shadow-xl">
      <div className="aspect-[3/4] skeleton relative" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 skeleton rounded-lg" />
        <div className="flex gap-2">
          <div className="h-3 w-12 skeleton rounded" />
          <div className="h-3 w-12 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}

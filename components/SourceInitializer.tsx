"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function SourceInitializer() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only run on the very first load of the application
    const isFirstLoad = !sessionStorage.getItem("app-initialized");
    if (isFirstLoad) {
      const preferred = localStorage.getItem("preferred-source");
      const isOtakudesuPath = pathname.startsWith("/otakudesu");

      if (preferred === "otakudesu" && !isOtakudesuPath && pathname === "/") {
         router.replace("/otakudesu");
      } else if (preferred === "samehadaku" && isOtakudesuPath) {
         // Optionally redirect to root if they prefer samehadaku but land on otakudesu
         // router.replace("/");
      }
      sessionStorage.setItem("app-initialized", "true");
    }

    // Sync current source to localStorage whenever it changes
    if (pathname.startsWith("/otakudesu")) {
      localStorage.setItem("preferred-source", "otakudesu");
    } else if (pathname === "/" || pathname.startsWith("/anime") || pathname.startsWith("/search") || pathname.startsWith("/popular")) {
      localStorage.setItem("preferred-source", "samehadaku");
    }
  }, [pathname, router]);

  return null;
}

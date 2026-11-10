"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAnnounce } from "./A11yProvider";

/* Client-side navigation in Next.js doesn't reload the page, so screen readers
   hear nothing. This announces the new page and moves focus to <main>. */
export default function RouteAnnouncer() {
  const pathname = usePathname();
  const announce = useAnnounce();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      const title = document.title || "New page";
      announce(`Navigated to ${title}`);
      const main = document.getElementById("main-content");
      if (main) {
        main.focus({ preventScroll: true });
        window.scrollTo({ top: 0 });
      }
    }, 150);
    return () => clearTimeout(t);
  }, [pathname, announce]);

  return null;
}
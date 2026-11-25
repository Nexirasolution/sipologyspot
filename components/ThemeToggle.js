"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const DEFAULT_STYLE =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-gold bg-page text-fg shadow-lg transition duration-300 hover:bg-gold hover:text-ink";

/**
 * Light / dark switch. The inline script in layout.js sets data-theme before
 * first paint (saved choice, else the system setting); this just flips it.
 *
 * className: pass your own full styling (replaces the default look).
 * showLabel: also render the "Dark mode" text (used in the mobile menu).
 */
export default function ThemeToggle({ className, showLabel = false }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  }

  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={showLabel ? undefined : "Dark mode"}
      className={className ?? DEFAULT_STYLE}
    >
      <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
      {showLabel && <span>Dark mode</span>}
    </button>
  );
}
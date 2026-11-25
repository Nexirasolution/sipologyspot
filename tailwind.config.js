/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ---------- Theme-aware (light/dark) ----------
           Values live in app/globals.css as CSS variables and change with
           <html data-theme="light|dark">. */
        page: "rgb(var(--page) / <alpha-value>)",          // page background
        fg: "rgb(var(--fg) / <alpha-value>)",              // main text
        "fg-muted": "rgb(var(--fg-muted) / <alpha-value>)", // secondary text
        surface: "rgb(var(--surface) / <alpha-value>)",    // alternate section / card background
        accent: "rgb(var(--accent) / <alpha-value>)",      // gold TEXT (dark gold on light, bright gold on dark)

        /* ---------- Gold palette ---------- */
        gold: {
          DEFAULT: "#C9A227", // fills, borders, accents (use dark ink text on top). Same in both themes.
          deep: "rgb(var(--accent) / <alpha-value>)",       // gold TEXT: now theme-aware (was #8A6410)
          soft: "rgb(var(--gold-soft) / <alpha-value>)",    // hover / active backgrounds: theme-aware (was #F6EBC8)
          pale: "rgb(var(--surface) / <alpha-value>)",      // section backgrounds: theme-aware (was #FCF8EA)
        },
        ink: "#1A1408",                                     // dark text for use ON gold. Same in both themes.
        muted: "rgb(var(--fg-muted) / <alpha-value>)",      // secondary text: theme-aware (was #6B5B2E)

        // Legacy names (unchanged)
        forest: "#8A6410",
        ivory: "#FFFFFF",
        champagne: "#FBF5E1",
        terracotta: "#8A6410",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        navDrop: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        expand: {
          "0%": { opacity: "0", transform: "scaleX(0.5)" },
          "100%": { opacity: "1", transform: "scaleX(1)" },
        },
        pop: {
          "0%": { transform: "scale(0.4)", opacity: "0" },
          "60%": { transform: "scale(1.25)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
      },
      animation: {
        marquee: "marquee 26s linear infinite",
        "nav-drop": "navDrop 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        rise: "rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-down": "slideDown 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        expand: "expand 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        pop: "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        shimmer: "shimmer 6s linear infinite",
        "fade-in": "fadeIn 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
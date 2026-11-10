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
        // New gold + white palette
        gold: {
          DEFAULT: "#C9A227", // fills, borders, accents (use dark ink text on top)
          deep: "#8A6410",    // gold TEXT on white: 5.4:1 contrast (passes WCAG AA)
          soft: "#F6EBC8",    // hover / active backgrounds
          pale: "#FCF8EA",    // section backgrounds
        },
        ink: "#1A1408",       // bold text
        muted: "#6B5B2E",     // secondary text: 6.6:1 on white

        // Legacy names remapped so the rest of the store re-themes automatically
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
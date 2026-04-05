/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:       "#0D0D0D",
        card:     "#1A1A1A",
        emergency: "#E53935",
        success:  "#00C853",
        amber:    "#FFB300",
        blue:     "#1565C0",
        "red-dark":"#B71C1C",
        "blue-light": "#1E88E5",
        muted:    "#888888",
        border:   "#2A2A2A",
      },
      fontFamily: {
        syne:   ["Syne", "sans-serif"],
        dm:     ["DM Sans", "sans-serif"],
        mono:   ["JetBrains Mono", "monospace"],
      },
      minHeight: {
        tap: "56px",
      },
      animation: {
        "pulse-ring":  "pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite",
        "pulse-ring2": "pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) 0.5s infinite",
        "ecg":         "ecg 3s linear infinite",
        "border-pulse":"borderPulse 1.5s ease-in-out infinite",
        "fade-up":     "fadeUp 0.4s ease-out",
        "slide-in":    "slideIn 0.35s ease-out",
      },
      keyframes: {
        pulseRing: {
          "0%":   { transform: "scale(1)",   opacity: "0.6" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        ecg: {
          "0%":   { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        borderPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0px rgba(229,57,53,0.4)" },
          "50%":      { boxShadow: "0 0 0 12px rgba(229,57,53,0)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

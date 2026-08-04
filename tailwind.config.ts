import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--ink)",
        },
        line: "var(--line)",
        "line-2": "var(--line-2)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--ink)",
        },
        "accent-bg": "var(--accent-bg)",
        "accent-text": "var(--accent-text)",
        "accent-deep": "var(--accent-deep)",
        green: "var(--green)",
        "green-bg": "var(--green-bg)",
        amber: "var(--amber)",
        "amber-bg": "var(--amber-bg)",
        gray: "var(--gray)",
        "gray-bg": "var(--gray-bg)",
        red: "var(--red)",
        "red-bg": "var(--red-bg)",

        /* shadcn/ui semantic tokens — mapped onto this project's own
           design tokens above (design-system.md), not shadcn's default
           neutral palette. Kept as a separate block since these names
           are what generated shadcn/ui components (Button, Card, ...)
           reference via classes like `bg-primary`, `text-card-foreground`. */
        background: "var(--bg)",
        foreground: "var(--ink)",
        popover: {
          DEFAULT: "var(--card)",
          foreground: "var(--ink)",
        },
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "var(--ink)",
        },
        secondary: {
          DEFAULT: "var(--gray-bg)",
          foreground: "var(--ink-2)",
        },
        muted: {
          DEFAULT: "var(--gray-bg)",
          foreground: "var(--ink-3)",
        },
        destructive: {
          DEFAULT: "var(--red)",
          foreground: "#ffffff",
        },
        border: "var(--line)",
        input: "var(--line)",
        ring: "var(--accent)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["var(--font-bricolage)", "ui-sans-serif", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

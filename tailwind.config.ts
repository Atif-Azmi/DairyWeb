import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        foreground: "hsl(152 28% 14%)",
        page: "hsl(48 38% 96%)",
        cream: {
          50: "hsl(48 55% 98%)",
          100: "hsl(46 45% 94%)",
          200: "hsl(42 35% 88%)",
        },
        primary: {
          DEFAULT: "hsl(152 42% 28%)",
          foreground: "hsl(48 55% 98%)",
          muted: "hsl(152 30% 38%)",
        },
        secondary: {
          DEFAULT: "hsl(152 18% 92%)",
          foreground: "hsl(152 28% 18%)",
        },
        accent: {
          DEFAULT: "hsl(38 88% 54%)",
          foreground: "hsl(152 35% 12%)",
        },
        sky: {
          wash: "hsl(198 55% 94%)",
        },
        destructive: {
          DEFAULT: "hsl(0 72% 48%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(152 12% 88%)",
          foreground: "hsl(152 10% 38%)",
        },
        border: "hsl(152 14% 82%)",
        input: "hsl(152 14% 82%)",
      },
      borderRadius: {
        lg: `0.5rem`,
        md: `calc(0.5rem - 2px)`,
        sm: `calc(0.5rem - 4px)`,
      },
      boxShadow: {
        lift: "0 8px 30px -12px hsl(152 40% 20% / 0.2)",
        card: "0 2px 12px hsl(152 25% 50% / 0.08)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.6s ease-out forwards",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

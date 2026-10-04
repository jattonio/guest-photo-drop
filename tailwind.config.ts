import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// Color desde una variable HEX; <alpha-value> lo sustituye Tailwind al usar /30, /50…
const fotivaColor = (cssVar: string) =>
  `color-mix(in srgb, var(${cssVar}) calc(<alpha-value> * 100%), transparent)`;

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        heading: ["var(--font-heading)"],
      },
      colors: {
        // Tokens Fotiva (HEX en src/index.css). color-mix permite usar /opacidad.
        brand: {
          primary: fotivaColor("--brand-primary"),
          dark: fotivaColor("--brand-dark"),
          soft: fotivaColor("--brand-soft"),
        },
        energy: {
          orange: fotivaColor("--energy-orange"),
          orangeSoft: fotivaColor("--energy-orange-soft"),
          coral: fotivaColor("--energy-coral"),
          coralDeep: fotivaColor("--energy-coral-deep"),
        },
        // success/error solo para íconos y rellenos; para texto usa *.text
        success: { DEFAULT: fotivaColor("--success"), text: fotivaColor("--success-text") },
        warning: fotivaColor("--warning"),
        error: { DEFAULT: fotivaColor("--error"), text: fotivaColor("--error-text") },
        neutral: {
          ink: fotivaColor("--neutral-ink"),
          slate: fotivaColor("--neutral-slate"),
          border: fotivaColor("--neutral-border"),
          surface: fotivaColor("--neutral-surface"),
          background: fotivaColor("--neutral-background"),
        },
        dark: {
          background: fotivaColor("--dark-background"),
          surface: fotivaColor("--dark-surface"),
          elevated: fotivaColor("--dark-surface-elevated"),
          text: fotivaColor("--dark-text"),
          secondary: fotivaColor("--dark-text-secondary"),
          border: fotivaColor("--dark-border"),
          primary: fotivaColor("--dark-primary"),
          energy: fotivaColor("--dark-energy"),
          live: fotivaColor("--dark-live"),
        },
        // shadcn/ui (HSL en src/index.css)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        "fotiva-sm": "var(--radius-fotiva-sm)",
        "fotiva-md": "var(--radius-fotiva-md)",
        "fotiva-lg": "var(--radius-fotiva-lg)",
        "fotiva-xl": "var(--radius-fotiva-xl)",
        "fotiva-2xl": "var(--radius-fotiva-2xl)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        brand: "0 4px 20px -4px color-mix(in srgb, var(--brand-primary) 30%, transparent)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

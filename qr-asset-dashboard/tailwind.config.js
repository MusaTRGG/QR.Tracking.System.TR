/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
        "colors": {
            "primary": "var(--color-primary)",
            "on-primary": "var(--color-on-primary)",
            "primary-container": "var(--color-primary-container)",
            "on-primary-container": "var(--color-on-primary-container)",
            "secondary": "var(--color-secondary)",
            "on-secondary": "var(--color-on-secondary)",
            "secondary-container": "var(--color-secondary-container)",
            "on-secondary-container": "var(--color-on-secondary-container)",
            "tertiary": "var(--color-tertiary)",
            "on-tertiary": "var(--color-on-tertiary)",
            "tertiary-container": "var(--color-tertiary-container)",
            "on-tertiary-container": "var(--color-on-tertiary-container)",
            "error": "var(--color-error)",
            "on-error": "var(--color-on-error)",
            "error-container": "var(--color-error-container)",
            "on-error-container": "var(--color-on-error-container)",
            "background": "var(--color-background)",
            "on-background": "var(--color-on-background)",
            "surface": "var(--color-surface)",
            "on-surface": "var(--color-on-surface)",
            "surface-variant": "var(--color-surface-variant)",
            "on-surface-variant": "var(--color-on-surface-variant)",
            "outline": "var(--color-outline)",
            "outline-variant": "var(--color-outline-variant)",
            "surface-container-lowest": "var(--color-surface-container-lowest)",
            "surface-container-low": "var(--color-surface-container-low)",
            "surface-container": "var(--color-surface-container)",
            "surface-container-high": "var(--color-surface-container-high)",
            "surface-container-highest": "var(--color-surface-container-highest)",
            // Fixed mappings to not break any existing inline classes (they fallback to normal palette)
            "primary-fixed": "var(--color-primary-container)",
            "primary-fixed-dim": "var(--color-primary)",
            "secondary-fixed": "var(--color-secondary-container)",
            "tertiary-fixed": "var(--color-tertiary-container)",
        },
        "borderRadius": {
            "DEFAULT": "0.125rem",
            "lg": "0.25rem",
            "xl": "0.5rem",
            "full": "0.75rem"
        },
        "spacing": {
            "base": "4px",
            "grid-gutter": "20px",
            "sidebar-width": "260px",
            "lg": "24px",
            "header-height": "64px",
            "xl": "32px",
            "xs": "4px",
            "sm": "8px",
            "md": "16px"
        },
        "fontFamily": {
            "body-md": ["Inter"],
            "body-sm": ["Inter"],
            "headline-lg": ["Inter"],
            "headline-md": ["Inter"],
            "headline-xl": ["Inter"],
            "label-md": ["Inter"],
            "label-sm": ["Inter"],
            "body-lg": ["Inter"]
        },
        "fontSize": {
            "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
            "body-sm": ["12px", {"lineHeight": "16px", "fontWeight": "400"}],
            "headline-lg": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
            "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
            "headline-xl": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
            "label-md": ["13px", {"lineHeight": "18px", "fontWeight": "600"}],
            "label-sm": ["11px", {"lineHeight": "14px", "fontWeight": "700"}],
            "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}]
        }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        // KGF Theme Colors
        'kgf-primary': 'var(--kgf-primary)',
        'kgf-secondary': 'var(--kgf-secondary)',
        'kgf-background': 'var(--kgf-background)',
        'kgf-text-primary': 'var(--kgf-text-primary)',
        'kgf-text-secondary': 'var(--kgf-text-secondary)',
        
        // Semantic color tokens
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: 'var(--color-card)',
        'card-foreground': 'var(--color-card-foreground)',
        popover: 'var(--color-popover)',
        'popover-foreground': 'var(--color-popover-foreground)',
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        secondary: 'var(--color-secondary)',
        'secondary-foreground': 'var(--color-secondary-foreground)',
        muted: 'var(--color-muted)',
        'muted-foreground': 'var(--color-muted-foreground)',
        accent: 'var(--color-accent)',
        'accent-foreground': 'var(--color-accent-foreground)',
        destructive: 'var(--color-destructive)',
        'destructive-foreground': 'var(--color-destructive-foreground)',
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        'input-background': 'var(--color-input-background)',
        'switch-background': 'var(--color-switch-background)',
        ring: 'var(--color-ring)',
        
        // Chart colors
        'chart-1': 'var(--color-chart-1)',
        'chart-2': 'var(--color-chart-2)',
        'chart-3': 'var(--color-chart-3)',
        'chart-4': 'var(--color-chart-4)',
        'chart-5': 'var(--color-chart-5)',
        
        // Sidebar colors
        sidebar: 'var(--color-sidebar)',
        'sidebar-foreground': 'var(--color-sidebar-foreground)',
        'sidebar-primary': 'var(--color-sidebar-primary)',
        'sidebar-primary-foreground': 'var(--color-sidebar-primary-foreground)',
        'sidebar-accent': 'var(--color-sidebar-accent)',
        'sidebar-accent-foreground': 'var(--color-sidebar-accent-foreground)',
        'sidebar-border': 'var(--color-sidebar-border)',
        'sidebar-ring': 'var(--color-sidebar-ring)',
        
        // Legacy colors (keeping for backward compatibility)
        gold: '#F5D300',
        'gold-dark': '#E6C200',
        'prediction-green': '#26d4b4',
        'prediction-blue': '#0051ff',
        'dark-bg': '#000000',
        'dark-surface': '#111111',
        'dark-border': '#1f1f1f',
        'dark-text': '#FFFFFF',
        'dark-text-secondary': '#cccccc',
        'dark-text-muted': '#888888',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      fontFamily: {
        'sans': ['Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

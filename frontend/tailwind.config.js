/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                main: 'rgb(var(--background) / <alpha-value>)',
                surface: 'rgb(var(--surface) / <alpha-value>)',
                primary: 'rgb(var(--primary) / <alpha-value>)',
                secondary: 'rgb(var(--secondary) / <alpha-value>)',
                glass: 'rgb(var(--glass) / <alpha-value>)',
                'glass-border': 'rgb(var(--glass-border) / <alpha-value>)',
                foreground: 'rgb(var(--text-main) / <alpha-value>)',
                muted: 'rgb(var(--text-muted) / <alpha-value>)',

                // Keep original for back-compat or specific uses
                midnight: {
                    900: '#0F172A',
                    950: '#020617',
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
                beiruti: ['Beiruti', 'sans-serif'],
            }
        },
    },
    plugins: [],
}

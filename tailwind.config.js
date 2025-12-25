import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: {
            DEFAULT: '#FF8C00', // Naranja Principal
            light: '#FFA500',   // Hover
            dark: '#E07000',    // Active / Bordes oscuros
            50: '#FFF7ED',      // Fondos muy claros
          },
          text: {
            DEFAULT: '#1A202C', // Gris Oscuro (Casi negro)
            secondary: '#4A5568', // Gris medio
            light: '#A0AEC0',     // Gris claro
          },
          bg: {
            DEFAULT: '#FFFFFF',
            secondary: '#F7FAFC', // Gris muy sutil para fondos de dashboard
          }
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Fuente limpia para SaaS
      },
    },
  },
  plugins: [
    typography,
  ],
}
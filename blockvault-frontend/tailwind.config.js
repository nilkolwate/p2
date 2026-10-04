/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#1F3D2B',
          'green-dark': '#16281C',
          cream: '#F5F1E9',
          olive: '#3A5A40',
          sage: '#6B8F71',
          charcoal: '#1A1A1A',
          gold: '#C9B97A',
          beige: '#E8DFC9',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
      },
      maxWidth: {
        'container': '1280px',
      }
    },
  },
  plugins: [],
}

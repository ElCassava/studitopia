/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          'dark-gray': 'var(--color-dark-gray)',
          'white': 'var(--color-white)',
          'bright-green': 'var(--color-bright-green)',
          'green': 'var(--color-green)',
          'light-gray': 'var(--color-light-gray)',
        },
      },
    },
    plugins: [],
  }
  
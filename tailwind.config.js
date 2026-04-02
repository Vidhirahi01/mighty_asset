const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: "#f8f9fa",
        foreground: "#1a1a1a",
        input: "#e8e8e8",
        card: "#ffffff",
        border: "#e0e0e0",

        primary: {
          DEFAULT: "#1b72fc",
          50: "#f0f7ff",
          100: "#e0ebff",
          200: "#c1d9ff",
          300: "#a8caff",
          400: "#7db5ff",
          500: "#4a8fee",
        },
        secondary: {
          DEFAULT: '#B41C2B',
          50: "#fef1f2",
          100: "#fde7ea",
          200: "#fdbfd1",
          300: "#f79db4",
          400: "#f17a97",
          500: "#d84a62",
        },
        accent: {
          DEFAULT: "#f5f5f5",
          100: "#f0f0f0",
          200: "#e8e8e8",
          300: "#e0e0e0",
          400: "#d9d9d9",
          500: "#c9c9c9",
        },

        success: "#009f42",
        danger: "#b41c2b",
        warning: "#f0ad4e",
        info: "#388cfa",

        muted: "#f0f0f0",
      },
      fontFamily: {
        sans: ["ClashGrotesk"],
        medium: ["ClashGrotesk-Medium"],
        bold: ["ClashGrotesk-Bold"],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

const path = require("path");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/components-for-test/src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};

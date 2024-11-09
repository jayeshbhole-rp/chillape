/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.ts",
  endOfLine: "lf",
  printWidth: 120,
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  htmlWhitespaceSensitivity: "css",
  jsxSingleQuote: true,
  singleAttributePerLine: true,
  bracketSpacing: true,
  arrowParens: "always",
  semi: true,
  trailingComma: "all",
};

export default config;

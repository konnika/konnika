#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const emoji = process.argv[2];

if (!emoji) {
  console.error('Usage: node emoji-favicon.js <emoji>');
  console.error('Example: node emoji-favicon.js 🎉');
  process.exit(1);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text x="50" y="50" font-size="80" text-anchor="middle" dominant-baseline="central">${emoji}</text>
</svg>
`;

const outPath = path.join(process.cwd(), 'favicon.svg');
fs.writeFileSync(outPath, svg, 'utf8');
console.log(`Written: ${outPath}`);
console.log(`Add to your HTML <head>: <link rel="icon" href="favicon.svg">`);

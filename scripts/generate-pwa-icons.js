#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

/**
 * Generate an SVG string for a square placeholder app icon at a given pixel size.
 *
 * The produced SVG uses a black rounded-rect background, a white circular mark centered
 * in the artboard, and the bold text "OF" centered over the circle. Intended as a
 * temporary placeholder; for production use convert the SVG to PNG at the target size.
 *
 * @param {number} size - Icon edge length in pixels (positive number). Controls viewBox, corner radius, and element scaling.
 * @returns {string} SVG markup for the placeholder icon sized to the given dimensions.
 */
function createPlaceholderIcon(size) {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#000000" rx="${size * 0.1}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.3}" fill="#ffffff" opacity="0.9"/>
  <text x="${size/2}" y="${size/2 + size * 0.05}" text-anchor="middle" fill="#000000" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold">AP</text>
</svg>`;
  return svg;
}

/**
 * Generate an SVG string for a square shortcut icon of the given size and type.
 *
 * Produces a black rounded-square background with a white glyph centered at the icon's midpoint.
 * Supported types:
 *  - "new-chat": a simple horizontal and vertical line cross (abstract chat symbol).
 *  - "settings": a ring-like circle with a filled center dot.
 *
 * @param {string} type - Icon variant; must be "new-chat" or "settings".
 * @param {number} size - Output SVG width and height in pixels; used to scale glyph strokes and radii.
 * @return {string} An SVG markup string sized to `${size}x${size}` containing the icon.
 */
function createShortcutIcon(type, size) {
  let content = '';
  if (type === 'new-chat') {
    content = `<path d="M${size*0.3} ${size*0.5} L${size*0.7} ${size*0.5} M${size*0.5} ${size*0.3} L${size*0.5} ${size*0.7}" stroke="#ffffff" stroke-width="${size*0.05}" stroke-linecap="round"/>`;
  } else if (type === 'settings') {
    content = `<circle cx="${size/2}" cy="${size/2}" r="${size*0.15}" fill="none" stroke="#ffffff" stroke-width="${size*0.04}"/>
               <circle cx="${size/2}" cy="${size/2}" r="${size*0.05}" fill="#ffffff"/>`;
  }
  
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#000000" rx="${size * 0.1}"/>
  ${content}
</svg>`;
  return svg;
}

// Generate main app icons
console.log('Generating PWA icons...');
iconSizes.forEach(size => {
  const svg = createPlaceholderIcon(size);
  const filename = `public/icons/icon-${size}x${size}.png`;
  
  // For now, we'll create SVG files as placeholders
  // In production, these should be converted to PNG
  const svgFilename = `public/icons/icon-${size}x${size}.svg`;
  fs.writeFileSync(svgFilename, svg);
  console.log(`Created ${svgFilename}`);
});

// Generate shortcut icons
const shortcutSvg1 = createShortcutIcon('new-chat', 96);
const shortcutSvg2 = createShortcutIcon('settings', 96);
fs.writeFileSync('public/icons/shortcut-new-chat.svg', shortcutSvg1);
fs.writeFileSync('public/icons/shortcut-settings.svg', shortcutSvg2);

// Create placeholder screenshots
const desktopScreenshot = `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="720" fill="#f8f9fa"/>
  <rect x="0" y="0" width="1280" height="60" fill="#000000"/>
  <text x="640" y="35" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Ai Pista - AI Chat Platform</text>
  <rect x="40" y="100" width="1200" height="580" fill="#ffffff" stroke="#e0e0e0" stroke-width="1" rx="8"/>
  <text x="640" y="400" text-anchor="middle" fill="#666666" font-family="Arial, sans-serif" font-size="24">Desktop Chat Interface</text>
</svg>`;

const mobileScreenshot = `<svg width="390" height="844" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
  <rect width="390" height="844" fill="#f8f9fa"/>
  <rect x="0" y="0" width="390" height="60" fill="#000000"/>
  <text x="195" y="35" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Ai Pista</text>
  <rect x="20" y="80" width="350" height="724" fill="#ffffff" stroke="#e0e0e0" stroke-width="1" rx="8"/>
  <text x="195" y="450" text-anchor="middle" fill="#666666" font-family="Arial, sans-serif" font-size="18">Mobile Chat Interface</text>
</svg>`;

fs.writeFileSync('public/screenshots/desktop-wide.svg', desktopScreenshot);
fs.writeFileSync('public/screenshots/mobile-narrow.svg', mobileScreenshot);

console.log('PWA assets generated successfully!');
console.log('Note: SVG files created as placeholders. Convert to PNG for production use.');

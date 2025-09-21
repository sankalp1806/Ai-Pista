/**
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';

describe('PWA Manifest', () => {
  let manifest: any;

  beforeAll(() => {
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    manifest = JSON.parse(manifestContent);
  });

  it('should have required PWA manifest fields', () => {
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('description');
    expect(manifest).toHaveProperty('start_url');
    expect(manifest).toHaveProperty('display');
    expect(manifest).toHaveProperty('background_color');
    expect(manifest).toHaveProperty('theme_color');
    expect(manifest).toHaveProperty('icons');
  });

  it('should have correct basic properties', () => {
    expect(manifest.name).toBe('AI Pista - AI Chat Platform');
    expect(manifest.short_name).toBe('AI Pista');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#000000');
    expect(manifest.theme_color).toBe('#000000');
  });

  it('should have proper icon configuration', () => {
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);

    // Check required icon sizes
    const iconSizes = manifest.icons.map((icon: any) => icon.sizes);
    expect(iconSizes).toContain('192x192');
    expect(iconSizes).toContain('512x512');

    // Check icon properties
    manifest.icons.forEach((icon: any) => {
      expect(icon).toHaveProperty('src');
      expect(icon).toHaveProperty('sizes');
      expect(icon).toHaveProperty('type');
      expect(icon).toHaveProperty('purpose');
      expect(icon.purpose).toContain('any');
    });
  });

  it('should have shortcuts configuration', () => {
    expect(Array.isArray(manifest.shortcuts)).toBe(true);
    expect(manifest.shortcuts.length).toBeGreaterThan(0);

    manifest.shortcuts.forEach((shortcut: any) => {
      expect(shortcut).toHaveProperty('name');
      expect(shortcut).toHaveProperty('short_name');
      expect(shortcut).toHaveProperty('description');
      expect(shortcut).toHaveProperty('url');
      expect(shortcut).toHaveProperty('icons');
      expect(Array.isArray(shortcut.icons)).toBe(true);
    });
  });

  it('should have screenshots for app stores', () => {
    expect(Array.isArray(manifest.screenshots)).toBe(true);
    expect(manifest.screenshots.length).toBeGreaterThan(0);

    const formFactors = manifest.screenshots.map((screenshot: any) => screenshot.form_factor);
    expect(formFactors).toContain('wide');
    expect(formFactors).toContain('narrow');

    manifest.screenshots.forEach((screenshot: any) => {
      expect(screenshot).toHaveProperty('src');
      expect(screenshot).toHaveProperty('sizes');
      expect(screenshot).toHaveProperty('type');
      expect(screenshot).toHaveProperty('form_factor');
      expect(screenshot).toHaveProperty('label');
    });
  });

  it('should have proper categories', () => {
    expect(Array.isArray(manifest.categories)).toBe(true);
    expect(manifest.categories).toContain('productivity');
    expect(manifest.categories).toContain('utilities');
  });

  it('should have correct scope and orientation', () => {
    expect(manifest.scope).toBe('/');
    expect(manifest.orientation).toBe('portrait-primary');
    expect(manifest.lang).toBe('en');
  });

  it('should prefer web app over related applications', () => {
    expect(manifest.prefer_related_applications).toBe(false);
  });

  it('should have Edge side panel configuration', () => {
    expect(manifest).toHaveProperty('edge_side_panel');
    expect(manifest.edge_side_panel).toHaveProperty('preferred_width');
    expect(typeof manifest.edge_side_panel.preferred_width).toBe('number');
  });
});

describe('PWA Icon Generation', () => {
  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

  it('should have generated all required icon sizes', () => {
    iconSizes.forEach(size => {
      const iconPath = path.join(process.cwd(), 'public', 'icons', `icon-${size}x${size}.svg`);
      expect(fs.existsSync(iconPath)).toBe(true);
    });
  });

  it('should have generated shortcut icons', () => {
    const shortcutIcons = ['shortcut-new-chat.svg', 'shortcut-settings.svg'];
    
    shortcutIcons.forEach(iconName => {
      const iconPath = path.join(process.cwd(), 'public', 'icons', iconName);
      expect(fs.existsSync(iconPath)).toBe(true);
    });
  });

  it('should have generated screenshot placeholders', () => {
    const screenshots = ['desktop-wide.svg', 'mobile-narrow.svg'];
    
    screenshots.forEach(screenshotName => {
      const screenshotPath = path.join(process.cwd(), 'public', 'screenshots', screenshotName);
      expect(fs.existsSync(screenshotPath)).toBe(true);
    });
  });

  it('should have valid SVG content in icons', () => {
    const iconPath = path.join(process.cwd(), 'public', 'icons', 'icon-192x192.svg');
    const iconContent = fs.readFileSync(iconPath, 'utf-8');
    
    expect(iconContent).toContain('<svg');
    expect(iconContent).toContain('width="192"');
    expect(iconContent).toContain('height="192"');
    expect(iconContent).toContain('</svg>');
  });
});

describe('Browser Configuration', () => {
  it('should have browserconfig.xml for Microsoft tiles', () => {
    const browserconfigPath = path.join(process.cwd(), 'public', 'browserconfig.xml');
    expect(fs.existsSync(browserconfigPath)).toBe(true);
    
    const browserconfigContent = fs.readFileSync(browserconfigPath, 'utf-8');
    expect(browserconfigContent).toContain('<browserconfig>');
    expect(browserconfigContent).toContain('<msapplication>');
    expect(browserconfigContent).toContain('<TileColor>#000000</TileColor>');
  });
});
    

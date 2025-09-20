import { generateThemeClasses } from '../themes';

describe('generateThemeClasses', () => {
  it('should generate correct class names for default theme config', () => {
    const config = {
      mode: 'light' as const,
      accent: 'crimson' as const,
      font: 'geist' as const,
      background: 'gradient' as const,
      badgePair: 'red-gold' as const,
      chatInputStyle: 'default' as const,
    };
    expect(generateThemeClasses(config)).toMatchSnapshot();
  });

  it('should generate correct class names for custom theme config', () => {
    const config = {
      mode: 'dark' as const,
      accent: 'emerald' as const,
      font: 'inter' as const,
      background: 'minimal' as const,
      badgePair: 'purple-blue' as const,
      chatInputStyle: 'frosty' as const,
    };
    expect(generateThemeClasses(config)).toMatchSnapshot();
  });
});

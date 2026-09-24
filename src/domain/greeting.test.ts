import { describe, expect, it } from 'vitest';
import { buildGreeting } from './greeting';

describe('buildGreeting', () => {
  it('adı karşılamaya ekler', () => {
    expect(buildGreeting('Ayşe')).toBe('Hoş geldin Ayşe');
  });

  it('ad yoksa veya boşsa yalnızca "Hoş geldin" der', () => {
    expect(buildGreeting('')).toBe('Hoş geldin');
    expect(buildGreeting('   ')).toBe('Hoş geldin');
  });

  it('adı kırpar ve aşırı uzunsa keser', () => {
    expect(buildGreeting('  Ayşe  ')).toBe('Hoş geldin Ayşe');
    expect(buildGreeting('a'.repeat(100))).toHaveLength('Hoş geldin '.length + 40);
  });
});

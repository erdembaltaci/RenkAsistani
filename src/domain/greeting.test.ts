import { describe, expect, it } from 'vitest';
import { buildGreeting } from './greeting';

describe('buildGreeting', () => {
  it('karşılamayı ve adı ayrı ayrı verir', () => {
    expect(buildGreeting('Ayşe')).toEqual({ lead: 'Hoş geldin', name: 'Ayşe' });
  });

  it('ad yoksa veya boşsa adı boş bırakır', () => {
    expect(buildGreeting('').name).toBe('');
    expect(buildGreeting('   ').name).toBe('');
  });

  it('adı kırpar ve aşırı uzunsa keser', () => {
    expect(buildGreeting('  Ayşe  ').name).toBe('Ayşe');
    expect(buildGreeting('a'.repeat(100)).name).toHaveLength(40);
  });
});

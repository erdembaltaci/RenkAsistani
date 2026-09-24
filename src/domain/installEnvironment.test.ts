import { describe, expect, it } from 'vitest';
import { detectInstallEnvironment, type EnvironmentInfo } from './installEnvironment';

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const DESKTOP_CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const IPADOS_SAFARI =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';

const info = (overrides: Partial<EnvironmentInfo>): EnvironmentInfo => ({
  userAgent: DESKTOP_CHROME,
  platform: 'Win32',
  maxTouchPoints: 0,
  isStandalone: false,
  ...overrides,
});

describe('detectInstallEnvironment', () => {
  it('iPhone Safari için "ios" der', () => {
    expect(detectInstallEnvironment(info({ userAgent: IPHONE_SAFARI, platform: 'iPhone', maxTouchPoints: 5 }))).toBe('ios');
  });

  it('kendini Mac olarak tanıtan iPad\'i (dokunmatik) "ios" sayar', () => {
    expect(detectInstallEnvironment(info({ userAgent: IPADOS_SAFARI, platform: 'MacIntel', maxTouchPoints: 5 }))).toBe('ios');
  });

  it('dokunmatiksiz gerçek Mac\'i "ios" saymaz', () => {
    expect(detectInstallEnvironment(info({ userAgent: IPADOS_SAFARI, platform: 'MacIntel', maxTouchPoints: 0 }))).toBe('other');
  });

  it('Android Chrome ve masaüstü Chrome için "other" der', () => {
    expect(detectInstallEnvironment(info({ userAgent: ANDROID_CHROME, platform: 'Linux armv8l', maxTouchPoints: 5 }))).toBe('other');
    expect(detectInstallEnvironment(info({}))).toBe('other');
  });

  it('ana ekran uygulaması olarak açıksa her platformda "installed" der', () => {
    expect(detectInstallEnvironment(info({ userAgent: IPHONE_SAFARI, platform: 'iPhone', isStandalone: true }))).toBe('installed');
    expect(detectInstallEnvironment(info({ isStandalone: true }))).toBe('installed');
  });
});

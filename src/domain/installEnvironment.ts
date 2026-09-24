export type InstallEnvironment = 'installed' | 'ios' | 'other';

export interface EnvironmentInfo {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  /** Uygulama ana ekrandan (bağımsız pencerede) açılmış mı? */
  isStandalone: boolean;
}

const IOS_DEVICE = /iPad|iPhone|iPod/;

// iPadOS 13+ kendini "Macintosh" olarak tanıtır; dokunmatik ekranı olması onu Mac'ten ayırır.
const isIos = ({ userAgent, platform, maxTouchPoints }: EnvironmentInfo): boolean =>
  IOS_DEVICE.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);

/**
 * installed: zaten ana ekran uygulaması olarak açık; ios: iPhone/iPad (kurulum yalnızca Paylaş menüsünden
 * yapılabilir, otomatik istem yoktur); other: Chrome/Edge gibi, kurulum istemini tarayıcı kendisi sunar.
 */
export function detectInstallEnvironment(info: EnvironmentInfo): InstallEnvironment {
  if (info.isStandalone) return 'installed';
  return isIos(info) ? 'ios' : 'other';
}

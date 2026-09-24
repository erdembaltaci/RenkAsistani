export interface ColorCard {
  name: string;
  hex: string;
  tone: string;
  note: string;
}

export interface ColorCardRenderer {
  /**
   * Rengi, adı ve notuyla bir "renk kartı" görseline çevirir. Senkron olmalıdır: paylaşım penceresi,
   * kullanıcının dokunuşundan hemen sonra açılmazsa Safari izin vermez.
   */
  render(card: ColorCard): File | null;
}

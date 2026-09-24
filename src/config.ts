/** Karşılamada kullanılacak ad. Koda gömülmez; derleme sırasında VITE_RECIPIENT_NAME ortam değişkeninden okunur. */
export const RECIPIENT_NAME: string = import.meta.env.VITE_RECIPIENT_NAME ?? '';

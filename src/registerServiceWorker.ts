/** Yalnızca yayın sürümünde kaydedilir; geliştirme sırasında eski önbellekler sorun çıkarmasın. */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Kayıt başarısız olursa uygulama yine normal çalışır; yalnızca çevrimdışı destek olmaz.
    });
  });
}

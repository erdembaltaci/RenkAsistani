import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/** Site adresi tanımlanmazsa kullanılan varsayılan; VITE_SITE_URL ortam değişkeniyle değiştirilebilir. */
const DEFAULT_SITE_URL = 'https://rengim.vercel.app';

function resolveSiteUrl(env: Record<string, string>): string {
  return (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
}

/**
 * Derleme sırasında:
 * - index.html içindeki __SITE_URL__ yer tutucusunu gerçek adresle değiştirir (canonical, önizleme görseli),
 * - isteğe bağlı Google Search Console doğrulama etiketini ekler,
 * - robots.txt ve sitemap.xml üretir,
 * - servis çalışanının önbellek adını her yayında değiştirir, böylece eski dosyalar temizlenir.
 */
function seoAndServiceWorker(env: Record<string, string>): Plugin {
  const siteUrl = resolveSiteUrl(env);
  const verification = env.VITE_GOOGLE_SITE_VERIFICATION;
  const buildId = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  let outDir = 'dist';

  return {
    name: 'rengim-seo-and-sw',
    configResolved(config) {
      outDir = join(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      const withUrl = html.replaceAll('__SITE_URL__', siteUrl);
      if (!verification) return withUrl;
      const tag = `    <meta name="google-site-verification" content="${verification}" />\n`;
      return withUrl.replace('  </head>', `${tag}  </head>`);
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
      });
    },
    closeBundle() {
      const swPath = join(outDir, 'sw.js');
      try {
        writeFileSync(swPath, readFileSync(swPath, 'utf8').replaceAll('__BUILD_ID__', buildId));
      } catch {
        // Geliştirme sunucusunda dist yoktur; sorun değil.
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), seoAndServiceWorker(env)],
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  };
});

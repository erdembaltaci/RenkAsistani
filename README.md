# Renk Asistanı

Ürün veya kumaş fotoğrafından rengin **Türkçe adını**, **hex kodunu** ve tonunu sade sözcüklerle (ör. "Koyu, kırmızımsı mor") söyleyen, telefonda kullanılmak üzere tasarlanmış küçük bir web uygulaması.

- Backend, veritabanı ve yapay zekâ API'si **yoktur**. Her şey tarayıcıda (Canvas API) çalışır.
- Fotoğraflar **hiçbir yere yüklenmez**; cihazdan çıkmaz.
- Statik site olarak Vercel'e yayınlanmaya hazırdır.

## Özellikler

- **Fotoğraf girişi:** "Fotoğraf çek" (telefonda arka kamera) ve "Galeriden seç". EXIF yönü uygulanır, büyük fotoğraflar en uzun kenarı 800 px olacak şekilde küçültülür.
- **Otomatik renk tespiti:** Merkeze ağırlık verilir; baskın renk kümesi bulunup medyanlanır, böylece arka plan, parlama ve gölge sonucu bozmaz.
- **Dokunarak seçim:** Fotoğrafa dokunulan noktanın çevresi okunur (aykırı değerlerden arındırılmış medyan). "Otomatiğe dön" ile geri alınır.
- **Çoklu fotoğraf:** Aynı ürün için en fazla 6 fotoğraf. Her fotoğraftan çıkan renk LAB uzayında medyanla birleştirilir. Fotoğraflar birbirinden belirgin sapıyorsa (ışık farkı vb.) uyarı verilir ve sapan fotoğraf "Farklı çıktı" ile işaretlenir.
- **Sonuç:** Büyük renk adı, ton açıklaması, renk örneği, tek dokunuşla kopyalanan hex kodu ve en yakın ikinci ad. İki ad birbirine çok yakınsa "X ile Y arasında" notu çıkar. Renk her zaman **yazıyla da** verilir.
- **Sözlük:** 430'dan fazla Türkçe renk adı; soluk nötr ve pastel tonlar (açık gri, ekru, nane, adaçayı, pudra pembe…) özellikle sık örneklenmiştir. Açık/koyu varyantlar hesapla değil, sözlükte tek tek tanımlıdır.
- **Ton açıklaması:** "Vişne çürüğü" gibi adı bilinmeyen bir rengin ne olduğunu anlatmak için, ölçülen rengin açıklığı, doygunluğu ve tonu sade Türkçe ile tarif edilir.

## Çalıştırma

```bash
npm install
npm run dev        # geliştirme sunucusu
npm run build      # tip kontrolü + üretim derlemesi (dist/)
npm run preview    # derlenmiş siteyi yerelde aç
npm test           # birim testleri
npm run lint       # ESLint
```

Telefonda denemek için `npm run dev -- --host` çalıştırıp aynı Wi-Fi'daki telefondan bilgisayarın IP adresini açabilirsiniz. Not: tarayıcılar kamera/pano özelliklerini genelde yalnızca `https` veya `localhost` üzerinde tam destekler; Vercel'e yayınlandığında `https` olur.

## Doğruluk konusunda dürüst notlar

- Telefon kamerası, **ışığa ve beyaz dengesine** göre rengi kaydırır. Aynı kumaş sıcak ışıkta daha sarı, gölgede daha mavi çıkabilir. Sonuç bir **tahmindir**.
- En iyi sonuç için gün ışığında, gölgesiz ve düz bir zeminde çekin; mümkünse aynı ürünü birkaç açıdan çekip çoklu fotoğraf özelliğini kullanın.
- Bu uygulama, ışık kabini veya spektrofotometre ile yapılan **resmî renk onayının yerini tutmaz**.
- Geliştirme sırasında yalnızca **sentetik görsellerle** test edildi (dokulu, gölgeli, beyaz zeminli sahte kumaşlar; gerçek Edge tarayıcısında uçtan uca). Sentetik testte sözlükteki soluk tonların %97'si ilk adla, tamamı ilk iki adla doğru bulundu; ancak bu sahte görüntülerde beyaz dengesi kayması yoktur, **gerçek fotoğraflarda doğruluk bundan düşüktür**. Gerçek doğruluk gerçek tişört/kumaşlarla ölçülmelidir.

## Mimari

```
src/
  domain/       Saf renk matematiği ve tipler. Tarayıcıyı/UI'ı bilmez.
  data/         Sabit renk sözlüğü (colors.ts).
  services/     Arayüzler + implementasyonlar (örnekleme, adlandırma, birleştirme, ton, görsel yükleme).
  hooks/        UI ile servisler arasındaki bağ.
  components/   Yalnızca sunum; hesap yapmaz.
  compositionRoot.ts   Hangi somut sınıfın kullanılacağı tek burada seçilir.
```

Bağımlılık yönü: `components → hooks → services (arayüzler) → domain`. Somut sınıflar yalnızca `compositionRoot.ts` içinde birleştirilir; renk adı bulma yöntemi değişirse yalnızca `ColorNamer` implementasyonu ve bu dosya değişir.

| Servis | Arayüz | Varsayılan implementasyon |
| --- | --- | --- |
| Piksellerden renk okuma | `ColorSampler` | `RobustColorSampler` |
| Renk adı bulma (CIEDE2000) | `ColorNamer` | `PaletteColorNamer` |
| Çoklu fotoğraf birleştirme + sapma tespiti | `ColorAggregator` | `MedianColorAggregator` |
| Ton açıklaması | `ToneDescriber` | `TurkishToneDescriber` |
| Fotoğrafı yükleme/küçültme | `ImageLoader` | `CanvasImageLoader` |

### Renk sözlüğünü genişletmek

`src/data/colors.ts` içindeki ilgili gruba `['Ad', '#RRGGBB']` satırı ekleyin. `npm test`, tekrar eden ad/hex ve gözle ayırt edilemeyecek kadar yakın (ΔE < 2) renkleri otomatik olarak yakalar.

## Vercel'e yayınlama (henüz yayınlanmadı)

Proje statik bir Vite sitesidir; `vercel.json` hazırdır. Yayına almak için:

1. Projeyi bir GitHub deposuna gönderin.
2. [vercel.com](https://vercel.com) üzerinde **kendi hesabınızla** giriş yapın (ücretsiz "Hobby" planı yeterlidir).
3. **Add New → Project** ile depoyu seçin. Framework "Vite", build komutu `npm run build`, çıktı klasörü `dist` otomatik algılanır; **Deploy**'a basın.
4. Yayın adresini telefonun ana ekranına ekleyebilirsiniz (Safari/Chrome → "Ana Ekrana Ekle").

Alternatif (komut satırı): `npm i -g vercel`, ardından `vercel login` ve proje klasöründe `vercel --prod`.

Yalnızca sizin kullanımınız içinse, Vercel proje ayarlarından **Deployment Protection** özelliğini açabilirsiniz (varsayılan olarak önizleme adresleri zaten korumalıdır).

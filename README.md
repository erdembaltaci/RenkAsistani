# Renk Asistanı

Ürün veya kumaş fotoğrafından rengin Türkçe adını, hex kodunu ve tonunu bulan, mobil odaklı küçük bir web uygulaması.

Backend, veritabanı ve yapay zekâ API'si yoktur; her şey tarayıcıda (Canvas API) çalışır ve fotoğraflar cihazdan çıkmaz.

## Özellikler

- Fotoğraf çekme veya galeriden seçme (EXIF yönü uygulanır, büyük fotoğraflar küçültülür)
- Otomatik renk tespiti ve fotoğrafa dokunarak nokta seçme
- Çoklu fotoğraf: LAB uzayında medyan ile birleştirme, ışık farkı kaynaklı sapmayı işaretleme
- 430'dan fazla Türkçe renk adı, CIEDE2000 ile eşleştirme, en yakın ikinci ad ve belirsizlik notu
- Rengi kod/etiket ve notla kaydetme, notlarda arama, Excel için CSV dışa aktarma (yalnızca cihazın tarayıcısında saklanır)
- İki rengi karşılaştırma (CIEDE2000 ΔE): şu anki renk ile bir not, ya da iki not
- Fotoğraftaki beyaz kâğıda göre ışık düzeltme (isteğe bağlı)
- Rengi renk kartı görseli olarak paylaşma (telefonun paylaşım penceresi; desteklenmiyorsa görsel panoya kopyalanır veya indirilir)
- Ana ekrana eklenebilir (PWA) ve çevrimdışı açılır; arama motorları ve bağlantı önizlemesi için SEO etiketleri

## Çalıştırma

```bash
npm install
npm run dev      # geliştirme sunucusu
npm run build    # tip kontrolü + üretim derlemesi
npm test         # birim testleri
npm run lint     # ESLint
```

İsteğe bağlı ortam değişkenleri (karşılama adı, site adresi, Search Console doğrulaması) için `.env.example` dosyasına bakın.

## Yapı

```
src/
  domain/       Saf renk matematiği ve tipler
  data/         Renk sözlüğü
  services/     Arayüzler ve implementasyonlar (örnekleme, adlandırma, birleştirme, ton, depolama)
  hooks/        UI ile servisler arasındaki bağ
  components/   Sunum bileşenleri
  compositionRoot.ts   Somut sınıfların seçildiği tek yer
```

Bağımlılık yönü: `components → hooks → services → domain`.

## Not

Telefon kamerası ışığa ve beyaz dengesine göre rengi kaydırabilir; sonuç bir tahmindir ve resmî renk ölçümünün yerini tutmaz.

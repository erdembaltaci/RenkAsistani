# Renk Asistanı

Ürün veya kumaş fotoğrafından rengin Türkçe adını, hex kodunu ve tonunu bulan, mobil odaklı küçük bir web uygulaması.

Backend, veritabanı ve yapay zekâ API'si yoktur; her şey tarayıcıda (Canvas API) çalışır ve fotoğraflar cihazdan çıkmaz.

## Özellikler

- Fotoğraf çekme veya galeriden seçme (EXIF yönü uygulanır, büyük fotoğraflar küçültülür)
- Otomatik renk tespiti ve fotoğrafa dokunarak nokta seçme
- Çoklu fotoğraf: LAB uzayında medyan ile birleştirme, ışık farkı kaynaklı sapmayı işaretleme
- 430'dan fazla Türkçe renk adı, CIEDE2000 ile eşleştirme, en yakın ikinci ad ve belirsizlik notu
- Rengi notla birlikte kaydetme (yalnızca cihazın tarayıcısında saklanır)

## Çalıştırma

```bash
npm install
npm run dev      # geliştirme sunucusu
npm run build    # tip kontrolü + üretim derlemesi
npm test         # birim testleri
npm run lint     # ESLint
```

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

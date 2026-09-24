import { Notice } from './Notice';

export function Disclaimer() {
  return (
    <Notice variant="info" title="Sonuç bir tahmindir">
      Telefon kamerası, ışığa ve beyaz dengesine göre rengi biraz kaydırabilir. En iyi sonuç için gün ışığında, gölgesiz
      ve düz bir zeminde çek. Bu araç, ışık kabini veya spektrofotometre ile yapılan resmî renk onayının yerini tutmaz.
    </Notice>
  );
}

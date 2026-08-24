# Socrates Creative Events — Redesign Concept

Bağımsız bir UI/UX & motion design vitrin çalışması. Orijinal site ([socratesevent.com](https://www.socratesevent.com/)) Wix üzerinde kurulu, animasyonsuz ve mobilde responsive sorunları olan bir kurumsal etkinlik ajansı sitesiydi. Bu klasördeki tasarım, aynı içerik ve gerçek referans/marka listesini kullanarak sitenin nasıl "3D ve hareketli" bir deneyime dönüştürülebileceğini gösteren bir konsept çalışmasıdır.

**Bu, Socrates Creative Events'in resmi sitesi değildir.** Portfolyo/case-study amaçlı hazırlanmıştır.

## Öne çıkanlar
- Three.js ile mouse-parallax'lı 3D parçacık/wireframe hero arka planı
- Scroll-triggered reveal animasyonları (IntersectionObserver)
- Mouse-tracking 3D tilt kartlar (hizmetler, medya çerçeveleri)
- Gerçek 48 marka ismiyle çift yönlü, sonsuz kayan (marquee) referans şeridi
- Sayaç (count-up) istatistikler, cam efektli (glassmorphism) kartlar
- Baştan sona responsive — orijinal sitedeki mobil taşma hatası burada yok

## Çalıştırmak için
Sadece statik dosyalar — `index.html`'i bir tarayıcıda açman ya da basit bir static server ile serve etmen yeterli:

```bash
cd socrates-redesign
python3 -m http.server 8080
```

## Kaynak görseller
`assets/img/` altındaki fotoğraflar, orijinal sitenin kendi genel kullanıma açık sayfasından konsept gösterimi amacıyla alınmıştır (Socrates'in kendi etkinlik/prodüksiyon fotoğrafları). Referans marka isimleri metin olarak kullanılmıştır; marka logolarının birebir grafik/vektör kopyası oluşturulmamıştır.

# TodoMobile - Akıllı Görev Yöneticisi 📱

Modern, mobil uyumlu ve gelişmiş özellikler sunan açık kaynaklı görev yönetimi uygulaması.

🌐 **[Demo'yu Deneyin](https://username.github.io/todomobile/)**

## ✨ Özellikler

### 🚀 Temel Özellikler
- **Hızlı Görev Ekleme**: Basit metin girişi ile akıllı görev oluşturma
- **Akıllı Algılama**: Tarih, kategori ve öncelik otomatik algılama
- **Alt Görev Desteği**: Checklist tarzı alt görevler
- **Zaman Yönetimi**: Bitiş tarihleri ve hatırlatıcılar
- **Kategorileme**: Özel kategori ve etiket sistemi
- **Öncelik Seviyeleri**: Yüksek, orta, düşük öncelik atama

### 🎨 Kullanıcı Deneyimi
- **Modern Arayüz**: Glassmorphism ve gradient tasarım
- **Mobil Uyumlu**: Responsive tasarım
- **Koyu/Açık Tema**: Otomatik tema algılama
- **Animasyonlar**: Akıcı geçişler ve görsel geri bildirim
- **Çoklu Dil**: Türkçe arayüz desteği
- **Not Defteri**: Kişisel notlar için özel alan
- **Yönetici Paneli**: Gelişmiş kontrol ve istatistikler

### 💾 Veri Yönetimi
- **Yerel Depolama**: Tarayıcıda güvenli veri saklama
- **PWA Desteği**: Mobil uygulama gibi kullanım
- **Veri Aktarımı**: JSON export/import
- **Çevrimdışı Çalışma**: İnternet bağlantısı olmadan kullanım

## 🛠️ Kurulum

### Yerel Geliştirme

```bash
# Projeyi klonlayın
git clone https://github.com/username/todomobile.git
cd todomobile

# Basit HTTP sunucu başlatın
python -m http.server 8000
# veya
npx serve .

# Tarayıcıda açın: http://localhost:8000
```

### GitHub Pages'de Yayınlama

1. **Repository Oluştur**: GitHub'da yeni bir repository oluşturun
2. **Dosyaları Yükle**: Tüm dosyaları repository'e push edin
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/todomobile.git
   git push -u origin main
   ```
3. **GitHub Pages Aktif Et**:
   - Repository Settings → Pages
   - Source: "main" branch seçin
   - Save
4. **Erişim**: `https://username.github.io/todomobile/` adresinden erişin

### Üretim İçin

```bash
# Statik dosyaları herhangi bir web sunucusuna yükleyin
# Netlify, Vercel, GitHub Pages vb. kullanabilirsiniz
```

## 📖 Kullanım

### Görev Ekleme

1. **Hızlı Ekleme**: Ana sayfadaki metin kutusuna görev yazın
   ```
   Alışveriş yap - yarın 15:00
   Proje sunumu hazırla - 15.03.2024 - yüksek öncelik
   ```

2. **Detaylı Ekleme**: + butonuna tıklayarak detaylı form kullanın

### Filtreleme

- **Tümü**: Tüm görevleri göster
- **Bugün**: Bugünün görevleri
- **Yaklaşan**: Gelecek görevler
- **Tamamlanan**: Tamamlanmış görevler

### Klavye Kısayolları

- `Enter`: Görev kaydetme
- `Ctrl+N`: Yeni görev
- `Ctrl+F`: Arama

## 🏗️ Mimari

```
todomobile/
├── index.html          # Ana sayfa (GitHub Pages entry point)
├── styles.css          # Tüm CSS stilleri (birleştirilmiş)
├── app.js              # Ana JavaScript kodları
├── manifest.json       # PWA manifest dosyası
├── .gitignore          # Git ignore dosyası
└── README.md           # Bu dosya
```

### Teknoloji Yığını

- **HTML5**: Semantik yapı
- **CSS3**: Modern stillendirme
- **Vanilla JavaScript**: ES6+ özellikleri
- **PWA**: Service Worker desteği
- **Local Storage**: Veri saklama

## 🎯 Geliştirme Yol Haritası

### Kısa Vadeli (v1.1)
- [ ] Bildirim sistemi
- [ ] Tema özelleştirme
- [ ] Veri export/import
- [ ] Arama iyileştirmesi

### Orta Vadeli (v1.2)
- [ ] Alt görev sistemi
- [ ] Takvim görünümü
- [ ] E-posta entegrasyonu
- [ ] Veri senkronizasyonu

### Uzun Vadeli (v2.0)
- [ ] Çoklu kullanıcı desteği
- [ ] API servisi
- [ ] Gelişmiş analitik
- [ ] AI önerileri

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## 🙏 Teşekkür

- [Inter Font](https://fonts.google.com/specimen/Inter) - Modern tipografi
- [Font Awesome](https://fontawesome.com/) - İkonlar
- [Material Design](https://material.io/design) - Tasarım prensipleri

## 📞 İletişim

Sorularınız için issue açabilir veya e-posta gönderebilirsiniz.

---

⭐ Eğer projeyi beğendiyseniz yıldız vermeyi unutmayın!

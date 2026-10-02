# Learnhouse LMS - Yerel Kurulum & Demo Hesaplar

Learnhouse projesi yerel ortamınızda macOS üzerinde çalışacak şekilde kurulmuş ve yapılandırılmıştır.

## Servis URL'leri ve Bağlantılar

| Servis | URL | Açıklama |
|---|---|---|
| **Giriş Sayfası (Login)** | [http://lvh.me:3010/login](http://lvh.me:3010/login) | Tüm kullanıcıların giriş yapacağı ana giriş paneli |
| **Demo Organizasyonu Paneli** | [http://demo.lvh.me:3010/dash](http://demo.lvh.me:3010/dash) | Riverbend Academy (Demo organizasyonu ve tüm hazır kurslar) |
| **Ana Organizasyon / Seçici** | [http://lvh.me:3010/home](http://lvh.me:3010/home) | Organizasyon seçici ve ana sayfa |
| **Backend API Dokümantasyonu (Swagger)** | [http://lvh.me:1348/docs](http://lvh.me:1348/docs) | FastAPI Swagger API dokümantasyonu |
| **Collab WebSocket Servisi** | `ws://localhost:4000` | Tahta ve eşzamanlı düzenleme servisi |

> **Not:** `lvh.me` ve tüm alt alan adları (örn. `demo.lvh.me`) otomatik olarak `127.0.0.1` (localhost) adresine çözümlenir, `hosts` dosyası düzenlemesi gerektirmez.

---

## Demo Hesap Bilgileri

Tüm hesapların şifresi **`Ugur2803*`** olarak ayarlanmıştır:

| Rol | E-posta | Kullanıcı Adı | Şifre | Yetkiler |
|---|---|---|---|---|
| **Sistem Yöneticisi (Superadmin)** | `admin@oxonom.com` | `admin` | `Ugur2803*` | Tam platform yönetimi, kullanıcı yönetimi, organizasyon ayarları |
| **Eğitmen / Öğretmen (Instructor)** | `teacher@oxonom.com` | `teacher` | `Ugur2803*` | Kurs oluşturma, düzenleme, ödevler, sınavlar, tahta yönetimi |
| **Öğrenci (Learner / Student)** | `student@oxonom.com` | `student` | `Ugur2803*` | Kurslara katılım, ders takibi, ödev teslimi, tartışmalar |

---

## Servisleri Başlatma ve Durdurma

Tüm servisleri tek bir komutla başlatıp durdurabilirsiniz:

- **Başlatmak için:**
  ```bash
  cd ~/Desktop/LearnHouze_v2.0
  ./start.sh
  ```
- **Durdurmak için:**
  ```bash
  cd ~/Desktop/LearnHouze_v2.0
  ./stop.sh
  ```

Log kayıtları `logs/` klasöründe tutulmaktadır.

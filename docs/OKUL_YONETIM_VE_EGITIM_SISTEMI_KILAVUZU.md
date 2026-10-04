# LearnHouze / Oxonom Edu: Okul Yönetim, Öğretmen ve Öğrenci Sistemi Kapsamlı Başvuru Kılavuzu

> **Doküman Niteliği:** Bu belge; **Öğrenci**, **Öğretmen** ve **Müdür (Okul İdaresi)** rollerini kapsayan tüm ekranları, veri modellerini, iş kurallarını, kullanıcı etkileşimlerini ve mimari yetenekleri en ince teknik detayına kadar belgeleyen birincil sistem kılavuzudur. Herhangi bir yapay zeka modeline verildiğinde sistemin tüm mantığını ve yeteneklerini eksiksiz kavramasını sağlar. *(Superadmin merkezi platform yönetimi bu kılavuzun kapsamı dışındadır.)*

---

## İÇİNDEKİLER

1. [Sistem Mimarisi ve Genel Bakış](#1-sistem-mimarisi-ve-genel-bakış)
2. [En Can Alıcı ve Ayırt Edici Sistem Özellikleri](#2-en-can-alıcı-ve-ayırt-edici-sistem-özellikleri)
   - 2.1. [Yeni Nesil Akıllı İnteraktif Tahta (Whiteboard)](#21-yeni-nesil-akıllı-interaktif-tahta-whiteboard)
   - 2.2. [6 Haneli Akıllı Katılım Kodu Sistemi](#22-6-haneli-akıllı-katılım-kodu-sistemi)
   - 2.3. [GNO (Genel Not Ortalaması) Motoru](#23-gno-genel-not-ortalaması-motoru)
   - 2.4. [K-12 Standartlarında Devamsızlık Takip ve Yoklama Motoru](#24-k-12-standartlarında-devamsızlık-takip-ve-yoklama-motoru)
   - 2.5. [T.C. Kimlik Doğrulama ve Güvenlik Ayrıştırması](#25-tc-kimlik-doğrulama-ve-güvenlik-ayrıştırması)
   - 2.6. [Blok Tabanlı Okul Açılış Sayfası (Landing Builder) & Anında Şablon Motoru](#26-blok-tabanlı-okul-açılış-sayfası-landing-builder--anında-şablon-motoru)
   - 2.7. [Menü Sonu Özel Vurgulu Eğitsel Oyun Merkezi](#27-menü-sonu-özel-vurgulu-eğitsel-oyun-merkezi)
3. [Roller ve Yetkilendirme Matrisi (RBAC)](#3-roller-ve-yetkilendirme-matrisi-rbac)
4. [Öğrenci (Student) Deneyimi ve Modülleri](#4-öğrenci-student-deneyimi-ve-modülleri)
5. [Öğretmen (Teacher) Deneyimi ve Modülleri](#5-öğretmen-teacher-deneyimi-ve-modülleri)
6. [Müdür ve Okul İdaresi (Admin) Yönetim Merkezi](#6-müdür-ve-okul-idaresi-admin-yönetim-merkezi)
7. [Ortak Modüller ve Destek Mekanizmaları](#7-ortak-modüller-ve-destek-mekanizmaları)
   - 7.1. [Eğitim Kütüphanesi ve Kaynak Yönetimi](#71-eğitim-kütüphanesi-ve-kaynak-yönetimi)
   - 7.2. [Ödev ve Değerlendirme Çemberi](#72-ödev-ve-değerlendirme-çemberi)
   - 7.3. [Topluluklar ve Etkileşim Alanları](#73-topluluklar-ve-etkileşim-alanları)
8. [Teknik Veri Şemaları ve İş Mantığı Sözlüğü](#8-teknik-veri-şemaları-ve-iş-mantığı-sözlüğü)

---

## 1. SİSTEM MİMARİSİ VE GENEL BAKIŞ

LearnHouze (Oxonom Edu), modern K-12 okulları, kolejler ve eğitim kurumları için tasarlanmış çok kiracılı (multi-tenant) bir dijital kampüs işletim sistemidir.

* **Frontend:** Next.js (App Router), Tailwind CSS, Radix UI Primitives, Lucide / Phosphor Icons, HTML5 Canvas / PointerEvents API.
* **Backend:** REST API, PostgreSQL, Gerçek Zamanlı Web Sockets / Event Streaming.
* **Kullanıcı Modeli:** Okul bazında izole organizasyon alanı (`orgslug`), kurum kodu ve kullanıcı rollerine göre dinamik arayüz uyarlaması.

```
                      [ OKUL İDARESİ / MÜDÜR ]
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
   [ ÖĞRETMENLER ]                             [ ÖĞRENCİLER ]
           │                                           │
  ┌────────┴────────┐                         ┌────────┴────────┐
  ▼                 ▼                         ▼                 ▼
[Sınıf & Tahta] [Yoklama & Ödev]          [Panolar]      [Ödev Teslim & Oyun]
```

---

## 2. EN CAN ALICI VE AYIRT EDİCİ SİSTEM ÖZELLİKLERİ

Sistemi geleneksel okul portallarından ayıran ve en ince ayrıntısına kadar optimize edilmiş 7 temel yetenek:

### 2.1. Yeni Nesil Akıllı İnteraktif Tahta (Whiteboard)

Akıllı tahta ve dokunmatik paneller (Promethean, SMART Board, iPad, Android tabletler, akıllı telefonlar) için özel olarak geliştirilmiş sınırsız kanvas (infinite canvas) motorudur.

#### A. Dokunmatik Yüzey ve Kalem (Stylus) Optimizasyonu
* **Palm Rejection (Avuç İçi Ayrımı):** Dokunmatik yüzeyde çizim yaparken elin tahtaya temas etmesi kanvası kaydırmaz. Kalem ve çizim araçları seçildiğinde hareket algılayıcıları doğrudan çizgi vektörüne kilitlenir; gezinti (pan) modu sadece çift parmak veya özel taşıma aracıyla çalışır.
* **Tekilleştirilmiş Araç Paleti (Çift Pencere Engeli):** Kalem aracı seçildiğinde ikinci bir mükerrer renk/kalınlık açılır penceresi oluşmaz. Tüm stil parametreleri (ince, orta, kalın, renk paleti) tek bir optimize araç penceresinde toplanmıştır.
* **Yatay Mod Ergonomisi (Zero Overlap):** Mobil ve tabletlerde yatay (landscape) konuma geçildiğinde sol araç çubuğu, alt zoom kontrolleri ve bildirim alanları üst üste binmez; ekran alanına göre dinamik olarak kenarlara hizalanır.

#### B. Tek Tıkla "Odak Modu" (Focus Mode)
* Küçük ekranlarda veya geniş kanvas üzerinde çizim alanını kaybeden kullanıcılar için sol alt araç çubuğunda **"Odak Modu"** butonu bulunur.
* Butona basıldığı anda, kanvasta çizilmiş tüm şekiller ve notlar hesaplanır ve ekranın tam ortasına otomatik odaklanarak (%100 görünürlük oranıyla) sığdırılır.

#### C. Çok Dilli Yapışkan Notlar (Localized Sticky Notes)
* Tahtaya eklenen sarı yapışkan notlar (Sticky Notes) statik İngilizce ("New Note") yerine kullanıcının aktif dil tercihine göre dinamik olarak gelir (Türkçe için: "Yeni Not").

#### D. Granüler Pano Paylaşım Yetkilendirmesi
* **"Panoyu Paylaş"** modalı açıldığında tahtayı dışarıya veya öğrencilere açarken iki seviyeli yetki sunulur:
  1. **İşlem Yapabilir (Düzenleme İzni - Varsayılan):** Katılan kullanıcılar kalem, şekil ve not araçlarını kullanarak eşzamanlı etkileşimde bulunabilir.
  2. **Sadece Görüntüleyebilir (Salt Okunur):** Öğrenciler veya misafirler tahtayı canlı izleyebilir fakat çizim yapamaz veya mevcut öğeleri silemez.
* Yetki seçimine göre otomatik olarak korumalı erişim belirteci içeren paylaşım URL'i oluşturulur.

#### E. Sadeleştirilmiş ve Odaklanmış Tahta Deneyimi
* Sınıf içi ciddiyeti ve ders odağını dağıtan dikkat dağıtıcı emoji gönderme ve animasyonlu efekt kutucukları tahta arayüzünden ve ayarlarından tamamen arındırılmıştır.
* Gereksiz "Yansıt" butonları menülerden kaldırılmış, tahtaya doğrudan sınıf içerisinden tam ekran geçiş imkanı sağlanmıştır.

---

### 2.2. 6 Haneli Akıllı Katılım Kodu Sistemi
* Her sınıf için `OKUL-1A`, `FEN-8B` formatında **sabit tireli, 6 karakterli** benzersiz bir katılım kodu üretilir.
* **Karakter Karakter Animasyonlu Giriş:** Öğrenci katılım ekranında kod girilirken her kutucuk tek bir harfe odaklanır; giriş yapıldıkça sonraki kutuya pürüzsüz geçiş animasyonuyla atlar. Sabit tire işareti otomatik korunur.
* **Tek Tıkla Kopyalama:** Sınıf kartlarındaki katılım kodu butonuna basıldığında panoya kopyalanır ve anında yeşil check ikonuyla "Kopyalandı" geri bildirimi verir.

---

### 2.3. GNO (Genel Not Ortalaması) Motoru
* Öğrencinin aldığı tüm derslerin kredileri ve başarı notları ağırlıklı matematiksel formülle hesaplanarak 100'lük sistem üzerinden tek bir **GNO** değerine dönüştürülür.
* **İnteraktif Bilgi Kartı (Hover / Tooltip):**
  * Kullanıcı mouse ile `GNO: 98.5` üzerine geldiğinde noktalı alt çizgi ve yardım imleciyle birlikte Radix UI destekli şık bir bilgi kartı açılır:
    > **Genel Not Ortalaması (GNO)**  
    > *Öğrencinin tüm derslerdeki 100 üzerinden ağırlıklı başarı puanı ortalamasıdır.*
  * Aynı zamanda dokunmatik cihazlar ve ekran okuyucular için native HTML `title` desteği sunulur.
* **Belge Adaylığı:** GNO değerine göre öğrenci kartında otomatik olarak *"Takdir Belgesi Adayı"* (85.00+) veya *"Teşekkür Belgesi Adayı"* (70.00 - 84.99) rozeti gösterilir.

---

### 2.4. K-12 Standartlarında Devamsızlık Takip ve Yoklama Motoru
* MEB ve uluslararası okul standartlarına tam uyumlu iki kademeli devamsızlık mantığı:
  * **Özürsüz Devamsızlık:** Yasal sınır 10 gün. Sistem sınır aşımlarında idareyi ve veliyi sarı/kırmızı bayraklarla uyarır.
  * **Özürlü Devamsızlık (Raporlu / İzinli):** Yasal sınır 20 gün.
* **Devam Oranı Hesaplama:**
  $$\text{Devam Oranı} = \left( 1 - \frac{\text{Özürsüz Gün} + \text{Özürlü Gün}}{\text{Toplam Eğitim Günü}} \right) \times 100$$
* Sınıf ve öğrenci kartlarında anlık yeşil yüzde (`Devam: %100`) şeklinde listelenir.

---

### 2.5. T.C. Kimlik Doğrulama ve Güvenlik Ayrıştırması
* **Kayıt Aşaması İzolasyonu:** 11 haneli T.C. Kimlik doğrulaması (algoritmik hane sağlama kontrolü) **yalnızca** ilk kayıt olma ve sisteme kabul aşamasında yapılır.
* **Profil Güvenliği:** Öğrenci profili içerisinden T.C. input alanları kaldırılmıştır; böylece öğrencilerin veya üçüncü şahısların resmi kimlik numarasını sonradan hatalı değiştirmesi engellenmiş ve KVKK gizliliği sağlanmıştır.

---

### 2.6. Blok Tabanlı Okul Açılış Sayfası (Landing Builder) & Anında Şablon Motoru
* Yönetim panelinde (`/dash/org/settings/landing`) teknik anahtarlar ve geliştirici terimleri (padding, margin, gap, anchor vb.) tamamen temizlenmiş, okul idaresine uygun Türkçe alanlar sunulmuştur.
* **Hazır Şablon Kataloğu:**
  * **Okul Portalı (Mevcut Ana Sayfa):** Canlıdaki okul sitesinin birebir kopyası (Tanıtım, İstatistikler, Odak Alanları, Öne Çıkan Dersler, Referanslar, SSS, İletişim).
  * **Akademi Şablonu:** Kurs ve eğitim odaklı modern düzen.
  * **Minimal & Lansman Şablonları:** Sade ve hızlı duyuru odaklı bloklar.
* **Anında Uygulama & Arka Planda Otomatik Kayıt:** Şablona tıklandığı anda seçim boş kalmaz; ilk bölüm editörde açılır, organizasyon ana sayfasına derhal uygulanır ve arka planda veri tabanına kaydedilerek canlı site güncellenir.

---

### 2.7. Menü Sonu Özel Vurgulu Eğitsel Oyun Merkezi
* Üst navigasyon çubuğunun en sonunda konumlanan **"Oyunlar"** sekmesi:
  * Standart bağlantılardan farklı olarak **canlı mor-indigo-pembe degrade kapsül tasarımı**, derinlikli gölge efekti, hareketli oyun kolu ikonu ve *"Yeni"* etiketi taşır.
  * Zeka, mantık, uzay simülasyonu ve matematik bulmacalarını (2048, Orbit vb.) tek çatı altında toplar.

---

## 3. ROLLER VE YETKİLENDİRME MATRİSİ (RBAC)

| Yetenek / Modül | Öğrenci | Öğretmen | Müdür / İdare |
| :--- | :---: | :---: | :---: |
| **Sınıf Katılım Kodu ile Katılma** | ✅ Evet | ❌ Gerek yok | ❌ Gerek yok |
| **Sınıf Açma / Silme / Düzenleme** | ❌ Yasak | ✅ Kendi Sınıfı | ✅ Tüm Okul |
| **Öğrenci T.C. ve Bilgilerini Yönetme** | ❌ Yasak | 👁️ Görüntüler | ✅ Tam Yetki |
| **Öğrenci Sınıf Transferi / Dondurma** | ❌ Yasak | ❌ Yasak | ✅ Tam Yetki |
| **Yoklama Alma & Devamsızlık Girişi** | ❌ Yasak | ✅ Kendi Sınıfı | ✅ Tüm Sınıflar |
| **Not & GNO Girişi / Takibi** | 👁️ Sadece Kendisi | ✅ Sınıfı Giriş | ✅ Tüm Okul |
| **Rehberlik Gelişim Notu Ekleme** | ❌ Yasak | ✅ Ekler/Görür | ✅ Tam Yetki |
| **Ödev Verme ve Değerlendirme** | ❌ Yasak | ✅ Verir/Notlar | ✅ Denetler |
| **Ödev Teslim Etme** | ✅ Kendi Ödevi | ❌ | ❌ |
| **Pano Açma / Çizim Yapma** | ✅ Katıldığı Sınıf | ✅ Tam Yetki | ✅ Tam Yetki |
| **Pano Yetki ve İzinlerini Değiştirme**| ❌ Yasak (Kilitli) | ✅ Değiştirir | ✅ Tam Yetki |
| **Okul Açılış Sayfası & Menü Tasarımı**| ❌ Yasak | ❌ Yasak | ✅ Tam Yetki |
| **Kütüphaneye Kaynak Yükleme** | 👁️ İndirir/Okur | ✅ Yükler/Yönetir | ✅ Tam Yetki |

---

## 4. ÖĞRENCİ (STUDENT) DENEYİMİ VE MODÜLLERİ

Öğrenci arayüzü, dikkat dağınıklığını minimuma indiren, öğrencinin sadece kendi sınıfına ve eğitim materyallerine odaklanmasını sağlayan korumalı bir tasarıma sahiptir.

### 4.1. Header ve Gezinme İzolasyonu
* **Panel Menüsü Yok:** Yönetim ve ayar ikonları öğrenci başlığında yer almaz.
* **Sınıflar Menüsü Gizli:** Öğrenci `/dash/classrooms` idari ekranına erişemez. Yanlışlıkla girmeye çalışırsa otomatik olarak `/dash/boards` sayfasına yönlendirilir ve bilgilendirici uyarı alır.
* **Yalın Üst Menü:** Panolarım, Derslerim, Ödevlerim, Kütüphane ve en sonda degrade kapsüllü Oyunlar sekmesi.

### 4.2. Öğrenci Panoları (Boards) Ekranı
* **Sadece Dahil Olduğu Sınıf:** Öğrenci yalnızca kayıtlı olduğu sınıfa ait tahtaları görür; okulun diğer şubelerine ait tahtalar listelenmez.
* **Kategorize ve Filtrelenebilir Tasarım:**
  * **Ders Filtresi:** Matematik, Fen Bilimleri, Türkçe, Sosyal Bilgiler vb.
  * **Tarihsel Sıralama:** En son işlenen ders tahtaları başta olmak üzere takvim bazlı kronolojik akış.
  * **Arama:** Tahta adı ve konu başlığına göre anlık filtreleme.
* **Yetki Kısıtı Güvencesi:** Öğrenci tahtanın erişim yetkilerini (salt okunur / düzenlenebilir) değiştiremez; paylaşım modalındaki yetki anahtarları öğrenciye kilitlidir.

### 4.3. Ödev Teslim Merkezi
* Öğrenci kendi sınıfına tanımlanan ödevleri, son teslim tarihlerini ve kalan süreyi görür.
* Dosya (PDF, görsel, metin) yükleyerek ödevini teslim eder.
* Öğretmenin verdiği notu ve geri bildirim yorumunu anlık olarak inceler.

### 4.4. Öğrenci Kurulum ve Onboarding
* Öğrenci sisteme ilk girdiğinde öğretmen kurulum ekranları çıkmaz.
* Öğrenciye özel tasarlanmış kurulum sihirbazında sınıf katılım kodu girilir, öğrenci bilgileri teyit edilir ve doğrudan öğrenci paneline geçilir.

---

## 5. ÖĞRETMEN (TEACHER) DENEYİMİ VE MODÜLLERİ

Öğretmen paneli, bir dersin planlanmasından tahtada işlenmesine, yoklamasından ödevlendirmesine kadar tüm pedagojik akışı tek ekranda birleştirir.

### 5.1. Sınıf ve Şube Yönetimi
* Sorumlu olduğu şubelerin öğrenci mevcudunu, katılım kodlarını ve genel durumunu görüntüler.
* Sınıf paneline girdiğinde 4 ana sekme üzerinden çalışır:
  1. **Tahtalar:** Sınıfa özel interaktif ders panoları.
  2. **Öğrenciler:** Sınıf listesi, devamsızlık durumları, veli telefonları.
  3. **Ödevler:** Aktif ve geçmiş ödevler, teslim oranları.
  4. **Analitik:** Sınıfın ortalama GNO başarısı ve devam grafiği.

### 5.2. Hızlı Yoklama Sistemi
* Tek tıkla sınıf mevcudu listelenir.
* Öğrenci durumları: *Derste Mevcut*, *Özürlü (Raporlu/İzinli)*, *Özürsüz*.
* Alınan yoklama tek tuşla sisteme işlenir; öğrencinin devam yüzdesi ve idarenin devamsızlık defteri anında güncellenir.

### 5.3. Canlı Ders ve İnteraktif Tahta
* Öğretmen sınıfa girdiğinde ilgili ders tahtasını açar.
* Kalem, fosforlu kalem, geometrik şekiller, metin kutuları ve çok dilli yapışkan notları kullanarak dersini işler.
* Tahta ders bittiğinde buluta otomatik kaydedilir; öğrenciler evden aynı tahtayı açarak ders notlarını tekrar edebilir.

### 5.4. Rehberlik ve Gelişim Notları
* Öğretmen herhangi bir öğrenci kartını açarak şu kategorilerde resmi gelişim notu düşebilir:
  * *Akademik*, *Davranış*, *Rehberlik Görüşmesi*, *Veli Görüşmesi*, *Sağlık*.
* Bu notlar öğrencinin dijital sicilinde tarih ve öğretmen adı damgasıyla saklanır.

---

## 6. MÜDÜR VE OKUL İDARESİ (ADMIN) YÖNETİM MERKEZİ

Müdür ve idare arayüzü kurumun tüm operasyonel, akademik ve dijital vitrin kontrolünü elinde tutar.

### 6.1. Şubeler ve Sınıf Yapılandırması (`/dash/classrooms`)
* Kademelere göre (1. Sınıf, 2. Sınıf, 3. Sınıf, 4. Sınıf vb.) sekmeli filtreleme.
* Şube açma (Şube adı, kademe, sınıf öğretmeni atama).
* 6 haneli katılım kodlarını yenileme veya panoya kopyalama.
* Sınıf silme (güvenlik teyitli modal ile öğrencileri güvenle boşa çıkarma).

### 6.2. Öğrenci İşleri ve Kütük Yönetimi (`/dash/students`)
* **Öğrenci Tablosu:**
  * Fotoğraf/Avatar, Ad Soyad, Öğrenci No, T.C. Kimlik No.
  * Kayıtlı olduğu sınıf ve şube rehber öğretmeni.
  * Aktif / Donduruldu durum rozetleri.
  * GNO ve Devam yüzdesi göstergesi.
  * Veli Adı ve Telefon numarası.
* **Sınıf Değiştirme (Transfer):** Öğrencinin satırındaki transfer butonuna basılarak açılan modalda hedef sınıf seçilir; öğrencinin tüm not ve devamsızlık geçmişi korunarak yeni sınıfa anında taşınır.
* **Kayıt Dondurma:** Sağlık veya mazeret durumunda sebep girilerek öğrenci pasife alınır; mevcuttan düşülür.
* **Öğrenci Detay Kartı (360° Profil):**
  * GNO Takdir/Teşekkür adaylık kartı.
  * Özürlü / Özürsüz gün dağılımı ve yasal sınır baremleri.
  * Ödev teslim tamamlama oranı.
  * Disiplin sicili (Temiz Sicil / İhtar rozeti).
  * Tüm rehberlik notları geçmişi ve yeni not ekleme alanı.

### 6.3. Öğretmen Kadrosu Yönetimi (`/dash/teachers`)
* Okul bünyesindeki tüm öğretmenlerin listesi, branşları, rehberlik ettikleri şubeler ve aktif iletişim bilgileri.
* Şube rehber öğretmeni atama ve değiştirme yetkisi.

### 6.4. Okul Açılış Sayfası ve Marka Yönetimi (`/dash/org/settings/landing`)
* **Görsel Bölüm Editörü:** Okulun web sitesinde görünen her bölümü (Hero, Başarılarımız, Derslerimiz, Yorumlar, SSS) canlı düzenleme.
* **Görünürlük Kuralları:** Her bölümün herkese mi, sadece giriş yapmış veli/öğrencilere mi yoksa misafirlere mi görüneceğini belirleme.
* **Cihaz Filtresi:** Bölümleri masaüstü veya mobil cihazlara özel açıp kapatabilme.
* **Menü Düzenleyici (`/dash/org/settings/menu`):** Üst gezinme çubuğundaki sekmeleri sıralama, adlandırma ve yönetme (Yansıt butonu tamamen çıkarılmış, Oyunlar en sona sabitlenmiştir).

---

## 7. ORTAK MODÜLLER VE DESTEK MEKANİZMALARI

### 7.1. Eğitim Kütüphanesi ve Kaynak Yönetimi
* Sınıf veya ders bazlı klasör yapısı (Matematik Çalışma Yaprakları, Deneme Sınavları, Okuma Metinleri).
* Klasör oluşturma, PDF ve doküman yükleme, önizleme ve indirme.
* Öğrenciler kendi sınıflarına yüklenen tüm materyallere 7/24 erişebilir.

### 7.2. Ödev ve Değerlendirme Çemberi
1. Öğretmen ödev başlığı, son teslim tarihi ve yönerge girerek ödevi yayınlar.
2. Öğrencilerin panosunda anlık bildirim ve teslim kutusu açılır.
3. Öğrenci ödevini yükler; sistem teslim saatini kaydeder.
4. Öğretmen tek ekranda teslim edenleri, etmeyenleri ve geç teslimleri inceler; notunu ve geri bildirimini girer.
5. Not girildiği anda öğrencinin GNO ortalamasına yansır.

### 7.3. Topluluklar ve Etkileşim Alanları
* Okul içi kulüpler (Robotik Kulübü, Satranç Topluluğu vb.) için moderasyonlu tartışma ve paylaşım panoları.
* Öğretmen moderatörlüğünde güvenli öğrenci etkileşimi.

---

## 8. TEKNİK VERİ ŞEMALARI VE İŞ MANTIĞI SÖZLÜĞÜ

### Öğrenci Veri Modeli (`Student`)
```typescript
interface Student {
  id: number;
  name: string;
  email: string;
  studentNo: string;        // Örn: "1042"
  tcNo: string;             // 11 haneli T.C. Kimlik No
  classroomId: number;      // Kayıtlı olduğu şube kimliği
  classroomName: string;    // Örn: "1-A Şubesi"
  mentorTeacher: string;    // Sınıf Rehber Öğretmeni
  status: 'active' | 'frozen';
  freezeReason?: string;    // Dondurma gerekçesi
  gpa: number;              // GNO (Genel Not Ortalaması): 0.0 - 100.0
  attendanceRate: number;   // Devam Oranı Yüzdesi: 0 - 100
  unexcusedDays: number;    // Özürsüz Devamsızlık (Yasal limit: 10 gün)
  excusedDays: number;      // Özürlü Devamsızlık (Yasal limit: 20 gün)
  parentName: string;       // Veli Ad Soyad
  parentPhone: string;      // Veli İletişim Telefonu
  assignmentsDone: number;  // Teslim edilen ödev sayısı
  assignmentsTotal: number; // Toplam atanan ödev sayısı
  disciplineStatus: 'clean' | 'warning';
}
```

### Sınıf / Şube Veri Modeli (`Classroom`)
```typescript
interface Classroom {
  id: number;
  name: string;             // Örn: "1-A Şubesi"
  grade_level: string;      // Örn: "1. Sınıf"
  join_code: string;        // 6 haneli benzersiz kod: "OKUL-1A"
  mentor_name?: string;     // Rehber öğretmen adı
  member_count: number;     // Kayıtlı öğrenci adedi
  created_at: string;
}
```

### Beyaz Tahta Veri Modeli (`Whiteboard`)
```typescript
interface Whiteboard {
  id: string;
  classroom_id: number;
  title: string;
  subject: string;          // Ders adı
  created_at: string;
  permission: 'interactive' | 'view_only'; // Paylaşım yetki modu
  canvas_state: object;     // Vektörel çizimler, şekiller ve notlar
}
```

### Akıllı Arama & Normalizasyon Algoritması
Sistemdeki tüm öğrenci, sınıf ve kaynak aramaları Türkçe karakter duyarlılığına (`searchMatchesAny`) sahiptir:
* `İ/i/ı`, `Ş/ş`, `Ğ/ğ`, `Ü/ü`, `Ö/ö`, `Ç/ç` karakterleri normalize edilir.
* Kullanıcı "ozlem" yazdığında hem "Özlem" hem "özlem" kayıtları eksiksiz listelenir.

---

> **Sonuç & Özet:** LearnHouze / Oxonom Edu sistemi; öğrenci için sade ve korumalı, öğretmen için pratik ve ders merkezli, okul idaresi için ise tam denetimli ve esnek bir kurumsal eğitim altyapısı sunar. Tüm arayüzler dokunmatik ekranlara, modern pedagojik akışlara ve yüksek güvenlik standartlarına göre optimize edilmiştir.

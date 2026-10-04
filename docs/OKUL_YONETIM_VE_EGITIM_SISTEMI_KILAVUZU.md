# LearnHouze / Oxonom Edu: Okul Yönetim, Öğretmen ve Öğrenci Sistemi Kapsamlı Başvuru Kılavuzu

> **Doküman Niteliği:** Bu belge; **Öğrenci**, **Öğretmen** ve **Müdür (Okul İdaresi)** rollerini kapsayan tüm ekranları, veri modellerini, iş kurallarını, kullanıcı etkileşimlerini ve mimari yetenekleri en ince teknik detayına kadar belgeleyen birincil sistem kılavuzudur. Herhangi bir yapay zeka modeline verildiğinde sistemin tüm mantığını ve yeteneklerini eksiksiz kavramasını sağlar. *(Superadmin merkezi platform yönetimi bu kılavuzun kapsamı dışındadır.)*

---

## İÇİNDEKİLER

1. [Sistem Mimarisi ve Genel Bakış](#1-sistem-mimarisi-ve-genel-bakış)
2. [En Can Alıcı ve Ayırt Edici Sistem Özellikleri](#2-en-can-alıcı-ve-ayırt-edici-sistem-özellikleri)
   - 2.1. [Yeni Nesil Akıllı İnteraktif Tahta (Whiteboard) ve Pedagojik Gücü](#21-yeni-nesil-akıllı-interaktif-tahta-whiteboard-ve-pedagojik-gücü)
   - 2.2. [GNO (Genel Not Ortalaması) Motoru](#22-gno-genel-not-ortalaması-motoru)
   - 2.3. [K-12 Standartlarında Devamsızlık Takip ve Yoklama Motoru](#23-k-12-standartlarında-devamsızlık-takip-ve-yoklama-motoru)
   - 2.4. [T.C. Kimlik Doğrulama ve Güvenlik Ayrıştırması](#24-tc-kimlik-doğrulama-ve-güvenlik-ayrıştırması)
3. [Roller ve Yetkilendirme Matrisi (RBAC)](#3-roller-ve-yetkilendirme-matrisi-rbac)
4. [Öğrenci (Student) Deneyimi ve Modülleri](#4-öğrenci-student-deneyimi-ve-modülleri)
   - 4.1. [Öğrenci Panoları (Boards) Ekranı ve Geçmiş Ders Tekrarı](#41-öğrenci-panoları-boards-ekranı-ve-geçmiş-ders-tekrarı)
   - 4.2. [İnteraktif Ödev Merkezi ve Evden Cihaz Bağımsız Çözüm](#42-interaktif-ödev-merkezi-ve-evden-cihaz-bağımsız-çözüm)
5. [Öğretmen (Teacher) Deneyimi ve Modülleri](#5-öğretmen-teacher-deneyimi-ve-modülleri)
   - 5.1. [Sınıf ve Şube Yönetimi](#51-sınıf-ve-şube-yönetimi)
   - 5.2. [Hızlı Yoklama Sistemi](#52-hızlı-yoklama-sistemi)
   - 5.3. [Ders Öncesi Tahta Hazırlığı, Canlı Ders ve Yıllık Arşiv Tasarrufu](#53-ders-öncesi-tahta-hazırlığı-canlı-ders-ve-yıllık-arşiv-tasarrufu)
   - 5.4. [Rehberlik ve Gelişim Notları](#54-rehberlik-ve-gelişim-notları)
6. [Müdür ve Okul İdaresi (Admin) Yönetim Merkezi](#6-müdür-ve-okul-idaresi-admin-yönetim-merkezi)
   - 6.1. [Şubeler ve Sınıf Yapılandırması](#61-şubeler-ve-sınıf-yapılandırması)
   - 6.2. [Öğrenci İşleri ve Kütük Yönetimi](#62-öğrenci-işleri-ve-kütük-yönetimi)
   - 6.3. [Öğretmen Kadrosu Yönetimi](#63-öğretmen-kadrosu-yönetimi)
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
[Sınıf & Tahta] [Yoklama & Ödev]          [Panolar]      [İnteraktif Ödevler]
```

---

## 2. EN CAN ALICI VE AYIRT EDİCİ SİSTEM ÖZELLİKLERİ

### 2.1. Yeni Nesil Akıllı İnteraktif Tahta (Whiteboard) ve Pedagojik Gücü

Akıllı tahta ve dokunmatik paneller (Promethean, SMART Board, iPad, Android tabletler, akıllı telefonlar) için özel olarak geliştirilmiş sınırsız kanvas (infinite canvas) motorudur. Sistemi benzerlerinden ayıran en can alıcı pedagojik ve operasyonel yetenekleri şunlardır:

#### A. Not Yetiştirememe Sorununun Çözümü & Otomatik Bulut Kaydı
* **Sıfır Kayıp:** Derste öğretmen tahtayı doldurduğunda not alamayan, yetiştiremeyen veya tahtayı deftere geçirmekte zorlanan öğrenciler için hiçbir içerik kaybolmaz.
* **Otomatik Kayıt:** Dersten veya tahtadan çıkış yapıldığı anda sistem tahtadaki tüm çizimleri, formülleri, şemaları ve notları anında ve otomatik olarak buluta kaydeder.
* **Öğrenci Profilinden Tekrar Erişim:** Öğrenci okuldan sonra evine gittiğinde kendi öğrenci profilinden bu tahtayı dilediği zaman açabilir, zumlayarak en ince ayrıntısına kadar inceleyebilir ve eksik notlarını tamamlayabilir.
* **Kategorisel Tahta Arşivi:** Gelişmiş kategorisel tahta ekranı sayesinde öğrenci; ders bazında (Matematik, Fen, Türkçe vb.) ve tarihsel kronolojik akışla geçmiş aylara/haftalara ait tüm tahtaları tek tıkla tekrar görüntüleyebilir.

#### B. Tahta Üzerinde İnteraktif Ödev Hazırlama ve Evden Cihaz Bağımsız Çözüm
* **Doğrudan Tahtada Ödev Üretimi:** Öğretmen tahta üzerinde soru çözümleri, çalışma yaprakları, boşluk doldurmalar veya grafikler çizerek doğrudan bir ödev hazırlayabilir.
* **Evden Herhangi Bir Cihazla İnteraktif Çözüm:** Öğrenci evindeki herhangi bir cihazdan (masaüstü bilgisayar, laptop, tablet veya akıllı telefon) kendi öğrenci profiline giriş yaparak bu ödevi interaktif bir şekilde tahta üzerinde çözebilir; doğrudan ekrana yazarak, çizerek ve işaretleyerek ödevini tamamlar ve teslim eder.

#### C. Yıllık Ders Tahtası Arşivi, Sıfırdan Yazmama & Müthiş Vakit/Enerji Tasarrufu
* **Bu Özelliğin En Büyük Avantajı:** Öğretmen ders tahtalarını bir kere hazırladığında, bir sonraki eğitim-öğretim yılında veya yeni sınıflarda aynı tahtayı baştan yazmak, aynı konuları ve çizimleri tekrar tekrar sıfırdan çizmek zorunda kalmaz!
* **Mevcut Tahta Üzerinden Hızlı Anlatım:** Geçen seneki mevcut tahta doğrudan açılır; öğretmen konu üzerinden geçerken yalnızca gerekli güncellemeleri, canlı notları veya soru eklemelerini yapar.
* **Yüksek Verimlilik:** Bu sayede öğretmen fiziksel ve zihinsel olarak çok daha az yorulur, derslerde tahtaya yazı yazmakla harcanan vakit kazanılır ve doğrudan öğrenci etkileşimine ayrılır.

#### D. Ders Öncesi Ön Tahta Hazırlığı (Pre-Class Preparation)
* **Önceden Hazırlık:** Öğretmen derse girmeden önce (evinde veya öğretmenler odasında) o günkü dersle ilgili tahtasını en ince ayrıntısına kadar hazırlayabilir; formülleri, problem metinlerini, görselleri ve kavram haritalarını tahtaya yerleştirebilir.
* **Hazır Tahtayla Derse Başlama:** Derse girdiğinde akıllı tahtayı açar açmaz hazır tahta ekranına gelir; sıfırdan yazmak yerine doğrudan konuyu anlatmaya başlar ve canlı güncellemelerle dersi interaktif yönetir.

#### E. Dokunmatik Yüzey ve Kalem (Stylus) Optimizasyonu
* **Palm Rejection (Avuç İçi Ayrımı):** Dokunmatik yüzeyde çizim yaparken elin tahtaya temas etmesi kanvası kaydırmaz. Kalem aracı devredeyken dokunmatik yüzey yalnızca çizgi vektörüne odaklanır; gezinti (pan) modu özel araçla veya çift parmakla çalışır.
* **Tekilleştirilmiş Araç Paleti:** Kalem aracı seçildiğinde mükerrer renk/kalınlık açılır pencereleri oluşmaz; tek bir ergonomik palet üzerinden renk ve kalınlık seçilir.
* **Yatay Mod Ergonomisi (Zero Overlap):** Mobil ve tabletlerde yatay konuma geçildiğinde araç kutusu, zoom kontrolleri ve bildirim alanları üst üste binmez; ekrana dinamik yerleşir.

#### F. Tek Tıkla "Odak Modu" (Focus Mode)
* Geniş kanvasta çizim yapılan yeri kaybeden kullanıcılar için sol alt araç çubuğunda **"Odak Modu"** bulunur. Tek tıkla kanvastaki tüm çizimler hesaplanır ve ekranın merkezine tam sığacak şekilde ortalanır.

#### G. Çok Dilli Yapışkan Notlar & Granüler Paylaşım İzni
* Eklenen notlar dinamik dilde ("Yeni Not") gelir.
* **"Panoyu Paylaş"** seçeneğinde iki seviyeli yetki bulunur:
  1. *İşlem Yapabilir (Varsayılan):* Katılımcılar canlı etkileşimde bulunabilir, çizebilir.
  2. *Sadece Görüntüleyebilir:* Katılımcılar salt okunur izler, tahtayı bozamaz.
* Dikkati dağıtan emoji ve animasyon efektleri tahta ayarlarından kaldırılmış, tamamen eğitime odaklı bir yapı kurulmuştur.

---

### 2.2. GNO (Genel Not Ortalaması) Motoru
* Öğrencinin aldığı tüm derslerin kredileri ve başarı notları ağırlıklı formülle hesaplanarak 100'lük sistem üzerinden tek bir **GNO** değerine dönüştürülür.
* **İnteraktif Bilgi Kartı (Hover / Tooltip):**
  * Kullanıcı mouse ile `GNO: 98.5` üzerine geldiğinde noktalı alt çizgi ve yardım imleciyle birlikte Radix UI destekli şık bir bilgi kartı açılır:
    > **Genel Not Ortalaması (GNO)**  
    > *Öğrencinin tüm derslerdeki 100 üzerinden ağırlıklı başarı puanı ortalamasıdır.*
  * Aynı zamanda dokunmatik cihazlar ve ekran okuyucular için native HTML `title` desteği sunulur.
* **Belge Adaylığı:** GNO değerine göre öğrenci kartında otomatik olarak *"Takdir Belgesi Adayı"* (85.00+) veya *"Teşekkür Belgesi Adayı"* (70.00 - 84.99) rozeti gösterilir.

---

### 2.3. K-12 Standartlarında Devamsızlık Takip ve Yoklama Motoru
* MEB ve uluslararası okul standartlarına tam uyumlu iki kademeli devamsızlık mantığı:
  * **Özürsüz Devamsızlık:** Yasal sınır 10 gün. Sistem sınır aşımlarında idareyi ve veliyi sarı/kırmızı bayraklarla uyarır.
  * **Özürlü Devamsızlık (Raporlu / İzinli):** Yasal sınır 20 gün.
* **Devam Oranı Hesaplama:**
  $$\text{Devam Oranı} = \left( 1 - \frac{\text{Özürsüz Gün} + \text{Özürlü Gün}}{\text{Toplam Eğitim Günü}} \right) \times 100$$
* Sınıf ve öğrenci kartlarında anlık yeşil yüzde (`Devam: %100`) şeklinde listelenir.

---

### 2.4. T.C. Kimlik Doğrulama ve Güvenlik Ayrıştırması
* **Kayıt Aşaması İzolasyonu:** 11 haneli T.C. Kimlik doğrulaması (algoritmik hane sağlama kontrolü) **yalnızca** ilk kayıt olma ve sisteme kabul aşamasında yapılır.
* **Profil Güvenliği:** Öğrenci profili içerisinden T.C. input alanları kaldırılmıştır; böylece öğrencilerin veya üçüncü şahısların resmi kimlik numarasını sonradan hatalı değiştirmesi engellenmiş ve KVKK gizliliği sağlanmıştır.

---

## 3. ROLLER VE YETKİLENDİRME MATRİSİ (RBAC)

| Yetenek / Modül | Öğrenci | Öğretmen | Müdür / İdare |
| :--- | :---: | :---: | :---: |
| **Sınıf Açma / Silme / Yapılandırma** | ❌ Yasak | ✅ Kendi Sınıfı | ✅ Tüm Okul |
| **Öğrenci T.C. ve Bilgilerini Yönetme** | ❌ Yasak | 👁️ Görüntüler | ✅ Tam Yetki |
| **Öğrenci Sınıf Transferi / Dondurma** | ❌ Yasak | ❌ Yasak | ✅ Tam Yetki |
| **Yoklama Alma & Devamsızlık Girişi** | ❌ Yasak | ✅ Kendi Sınıfı | ✅ Tüm Sınıflar |
| **Not & GNO Girişi / Takibi** | 👁️ Sadece Kendisi | ✅ Sınıfı Giriş | ✅ Tüm Okul |
| **Rehberlik Gelişim Notu Ekleme** | ❌ Yasak | ✅ Ekler/Görür | ✅ Tam Yetki |
| **Tahtada Ödev Hazırlama** | ❌ Yasak | ✅ Hazırlar | ✅ Denetler |
| **Tahtada İnteraktif Ödev Çözme / Teslim**| ✅ Evet (Evden/Mobil) | ❌ | ❌ |
| **Önceden Tahta Hazırlığı & Yıllık Arşiv**| ❌ Yasak | ✅ Tam Yetki | ✅ Tam Yetki |
| **Geçmiş Tahtaları İnceleme (Tekrar)** | ✅ Kendi Sınıfı | ✅ Tam Yetki | ✅ Tam Yetki |
| **Pano Yetki ve İzinlerini Değiştirme**| ❌ Yasak (Kilitli) | ✅ Değiştirir | ✅ Tam Yetki |
| **Kütüphaneye Kaynak Yükleme** | 👁️ İndirir/Okur | ✅ Yükler/Yönetir | ✅ Tam Yetki |

---

## 4. ÖĞRENCİ (STUDENT) DENEYİMİ VE MODÜLLERİ

### 4.1. Öğrenci Panoları (Boards) Ekranı ve Geçmiş Ders Tekrarı
* **Sadece Dahil Olduğu Sınıf:** Öğrenci yalnızca kayıtlı olduğu sınıfa ait tahtaları görür; diğer şubelerin tahtaları karışmaz.
* **Kategorize ve Filtrelenebilir Tasarım:**
  * **Ders Filtresi:** Matematik, Fen Bilimleri, Türkçe, Sosyal Bilgiler vb. branşlara göre anlık ayrıştırma.
  * **Tarihsel Sıralama:** En son işlenen ders tahtaları en üstte olacak şekilde kronolojik takvim listesi.
  * **Arama:** Tahta adı ve işlenen konuya göre hızlı arama.
* **Not Yetiştirememe Güvencesi:** Derste öğretmenin yazdıklarını kaçıran veya defterine yetiştiremeyen öğrenci, eve geldiğinde kategorize ekrandan o günkü tahtayı tıklar; öğretmenin yazdığı her şeyi yüksek çözünürlükte adım adım inceler.
* **Yetki Kısıtı Güvencesi:** Öğrenci tahtanın erişim yetkilerini (salt okunur / düzenlenebilir) değiştiremez; yetki butonları öğrenciye kilitlidir.

### 4.2. İnteraktif Ödev Merkezi ve Evden Cihaz Bağımsız Çözüm
* **Herhangi Bir Cihazdan Erişim:** Öğrenci evindeki bilgisayar, tablet veya cep telefonundan profiline giriş yapar.
* **İnteraktif Tahta Üzerinde Ödev Yapma:** Öğretmenin tahta formatında hazırladığı ödevi açar; doğrudan dokunmatik veya mouse ile tahta üzerinde yazarak, çizerek ve soruları cevaplayarak interaktif şekilde çözer.
* **Teslim ve Geri Bildirim:** Çözümünü tek tıkla teslim eder; öğretmen notlandırdığında notunu ve detaylı değerlendirme mesajını profilinden görür.

---

## 5. ÖĞRETMEN (TEACHER) DENEYİMİ VE MODÜLLERİ

### 5.1. Sınıf ve Şube Yönetimi
* Sorumlu olduğu şubelerin öğrenci mevcudunu ve genel akademik durumunu görüntüler.
* Sınıf yönetim ekranında 4 ana sekme bulunur:
  1. **Tahtalar:** Sınıfa özel ders panoları, arşivler ve ödev tahtaları.
  2. **Öğrenciler:** Sınıf listesi, devamsızlıklar, veli irtibat bilgileri.
  3. **Ödevler:** Atanan ödevler, teslim durumları, tamamlama yüzdeleri.
  4. **Analitik:** Sınıfın ortalama GNO başarısı ve yoklama oranları.

### 5.2. Hızlı Yoklama Sistemi
* Tek tıkla sınıf mevcudu dökülür.
* Öğrenci durumları: *Derste Mevcut*, *Özürlü (Raporlu/İzinli)*, *Özürsüz*.
* Yoklama kaydedildiği anda öğrencinin devam yüzdesi ve idari devamsızlık kaydı otomatik güncellenir.

### 5.3. Ders Öncesi Tahta Hazırlığı, Canlı Ders ve Yıllık Arşiv Tasarrufu
* **Ders Öncesi Hazırlık:** Öğretmen boş vaktinde veya evinde derse hazırlık olarak tahtasını açar; görselleri, konu başlıklarını, formülleri ve soruları önceden tahtaya yerleştirir.
* **Derste Anında Açılış:** Derse girdiğinde sıfırdan tahtaya yazı yazmakla vakit kaybetmez; hazır tahtayı açar, üzerinden anlatır ve canlı soru çözümleriyle zenginleştirir.
* **Yıllık Arşiv Sayesinde Baştan Yazmaya Son:** Bir kere hazırlanan tahtalar sistemde saklanır. Gelecek sene aynı konu işleneceğinde öğretmen aynı şeyleri sıfırdan yazmaz; geçen seneki tahtayı açıp üzerinde küçük güncellemeler yaparak dersini çok daha az yorularak ve zamandan tasarruf ederek işler.
* **Tahtadan Ödev Üretimi:** Ders esnasında veya sonrasında tahta üzerinde öğrencinin evde interaktif çözeceği ödevleri kurgular.

### 5.4. Rehberlik ve Gelişim Notları
* Öğrenci profiline şu kategorilerde resmi gelişim notu girilebilir:
  * *Akademik*, *Davranış*, *Rehberlik Görüşmesi*, *Veli Görüşmesi*, *Sağlık*.
* Notlar tarih ve öğretmen imzasıyla güvenli dijital sicilde saklanır.

---

## 6. MÜDÜR VE OKUL İDARESİ (ADMIN) YÖNETİM MERKEZİ

### 6.1. Şubeler ve Sınıf Yapılandırması (`/dash/classrooms`)
* Kademelere göre (1. Sınıf, 2. Sınıf, 3. Sınıf, 4. Sınıf vb.) sekmeli filtreleme.
* Şube açma (Şube adı, kademe, sınıf öğretmeni atama).
* Sınıf silme (güvenlik teyitli modal ile öğrencileri güvenle boşa çıkarma).

### 6.2. Öğrenci İşleri ve Kütük Yönetimi (`/dash/students`)
* **Öğrenci Kütüğü:** Avatar, Ad Soyad, No, T.C. Kimlik No, Şube rehber öğretmeni, Durum (Aktif/Donduruldu), GNO, Devam yüzdesi, Veli bilgileri.
* **Sınıf Değiştirme (Transfer):** Satırdaki transfer butonuyla hedef sınıf seçilerek öğrencinin geçmiş karne ve devam verileri korunarak yeni şubeye aktarılması.
* **Kayıt Dondurma:** Mazeret gerekçesi girilerek öğrencinin dondurulması.
* **360° Öğrenci Analitiği:** GNO Takdir/Teşekkür adaylığı, 10/20 gün yasal devamsızlık baremleri, ödev teslim oranları, disiplin durumu ve rehberlik geçmişi.

### 6.3. Öğretmen Kadrosu Yönetimi (`/dash/teachers`)
* Okul bünyesindeki tüm öğretmenler, branşları, rehberlik ettikleri şubeler ve iletişim kanalları.
* Şube rehber öğretmeni atama ve değiştirme yetkisi.

---

## 7. ORTAK MODÜLLER VE DESTEK MEKANİZMALARI

### 7.1. Eğitim Kütüphanesi ve Kaynak Yönetimi
* Sınıf veya ders bazlı klasör hiyerarşisi (Çalışma Yaprakları, Deneme Sınavları, Okuma Metinleri).
* Klasör oluşturma, PDF ve doküman yükleme, önizleme ve indirme. Öğrenciler kaynaklara 7/24 erişebilir.

### 7.2. Ödev ve Değerlendirme Çemberi
1. Öğretmen ödevi yayınlar (tahta üzerinden veya doküman formatında).
2. Öğrenci profiline anlık ödev bildirimi düşer.
3. Öğrenci ödevi cihazından çözer ve teslim eder.
4. Öğretmen teslimleri inceler, puanlar ve geri bildirim ekler.
5. Not girildiği anda öğrencinin GNO başarı ortalamasına yansır.

### 7.3. Topluluklar ve Etkileşim Alanları
* Okul içi kulüpler (Robotik Kulübü, Satranç Topluluğu vb.) için öğretmen moderatörlüğünde güvenli tartışma ve duyuru panoları.

---

## 8. TEKNİK VERİ ŞEMALARI VE İŞ MANTIĞI SÖZLÜĞÜ

### Öğrenci Veri Modeli (`Student`)
```typescript
interface Student {
  id: number;
  name: string;
  email: string;
  studentNo: string;        // Örn: "1042"
  tcNo: string;             // 11 haneli T.C. Kimlik No (Sadece kayıtta girilir)
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
  subject: string;          // Ders adı (Matematik, Fen vb.)
  created_at: string;
  permission: 'interactive' | 'view_only'; // Paylaşım yetki modu
  canvas_state: object;     // Vektörel çizimler, şekiller, sorular ve notlar
  is_homework?: boolean;    // İnteraktif ödev tahtası mı?
}
```

### Akıllı Arama & Normalizasyon Algoritması
Sistemdeki tüm öğrenci, sınıf ve kaynak aramaları Türkçe karakter duyarlılığına (`searchMatchesAny`) sahiptir:
* `İ/i/ı`, `Ş/ş`, `Ğ/ğ`, `Ü/ü`, `Ö/ö`, `Ç/ç` karakterleri normalize edilir.
* Kullanıcı "ozlem" yazdığında hem "Özlem" hem "özlem" kayıtları eksiksiz listelenir.

---

> **Sonuç & Özet:** LearnHouze / Oxonom Edu sistemi; öğrenci için evden ders tekrarı ve interaktif ödev yapabilme özgürlüğü, öğretmen için ders öncesi hazırlık, yıllık tahta arşivi sayesinde sıfırdan yazmama ve zamandan/enerjiden muazzam tasarruf, okul idaresi için ise tam denetimli akademik takip sağlar.

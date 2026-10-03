import { LandingSection } from './landing_types'

export interface LandingTemplate {
  id: 'classic' | 'academy' | 'launch' | 'product' | 'minimal'
  sections: LandingSection[]
}

// Pre-built landing templates for schools & academies.
export const LANDING_TEMPLATES: LandingTemplate[] = [
  {
    id: 'classic',
    sections: [
      {
        type: 'hero',
        title: 'Hero (Karşılama)',
        visibility: 'everyone',
        background: { type: 'gradient', colors: ['#1e1b4b', '#4338ca'], direction: '135deg' },
        heading: { text: 'Geleceğin Eğitimi, Akıllı Sınıflarla Bugün Başlıyor', color: '#ffffff', size: 'large' },
        subheading: { text: 'Öğrencilerimiz için dijital interaktif panolar, eğlenceli eğitici oyunlar, MEB uyumlu atölyeler ve zengin kütüphane kaynakları tek çatı altında.', color: '#e0e7ff', size: 'medium' },
        buttons: [
          { text: 'Panoları Keşfet', link: '/boards', color: '#1e1b4b', background: '#ffffff' },
          { text: 'Öğrenci & Öğretmen Girişi', link: '/auth/login', color: '#ffffff', background: '#4f46e5' },
        ],
        contentAlign: 'center',
      },
      {
        type: 'stats',
        title: 'Rakamlarla Okul Portalımız',
        items: [
          { value: '24+', label: 'Akıllı Sınıf & Şube' },
          { value: '750+', label: 'Aktif Öğrenci' },
          { value: '100+', label: 'İnteraktif Pano & Ders' },
          { value: '%98', label: 'Öğrenme Başarısı' },
        ],
      },
      {
        type: 'features',
        title: 'Dijital Eğitim & Akıllı Sınıf Odakları',
        subtitle: 'Modern eğitim teknolojilerini pedagojik yaklaşımlarla buluşturan zengin araç takımı.',
        columns: 3,
        style: { anchor: 'ozellikler' },
        items: [
          { icon: '🎨', title: 'İnteraktif Akıllı Tahta', description: 'Canlı çizim, geometrik şekiller, renkli kalemler ve zengin tahta araç takımı.' },
          { icon: '🎮', title: 'Eğitici Zeka Oyunları', description: 'Matematik, kelime türetme ve zihinsel becerileri geliştiren eğlenceli oyunlar.' },
          { icon: '📚', title: 'Dijital Kütüphane & Kaynaklar', description: 'Ders dökümanları, çalışma yaprakları ve MEB müfredatına tam uyumlu kaynaklar.' },
          { icon: '⏱️', title: 'Hızlı Okuma & Sayı Atölyesi', description: '1 Dk okuma sayacı ve ritmik sayma modülleriyle temel becerileri pekiştirme.' },
          { icon: '💬', title: 'Veli & Sınıf İletişim Forumu', description: 'Öğretmenler ve veliler arasında güvenli, şeffaf ve düzenli bilgi paylaşımı.' },
          { icon: '🎧', title: 'Eğitici Podcastler & Sesli Dersler', description: 'Görsel dikkati dinleme ve anlama yetenekleriyle harmanlayan ses içerikleri.' },
        ],
      },
      {
        type: 'featured-courses',
        title: 'Öne Çıkan Dersler & Eğitim Modülleri',
        courses: [],
        mode: 'latest',
        limit: 4,
      },
      {
        type: 'testimonials',
        title: 'Öğrenci, Öğretmen ve Velilerimiz Ne Diyor?',
        style: { background: { type: 'solid', color: '#f8fafc' } },
        items: [
          { quote: 'Akıllı tahta ve eğitici oyunlar sayesinde oğlum derslere çok daha motive ve istekli katılıyor.', author: 'Ayşe Yılmaz', role: 'Veli', image_url: '' },
          { quote: 'Ders anlatırken dijital panoları kullanmak öğrencilerin dikkat süresini belirgin şekilde artırdı.', author: 'Mehmet Özkan', role: 'Sınıf Öğretmeni', image_url: '' },
          { quote: 'Ödevlerimi, çizimlerimi ve oyunlarımı tek bir ekrandan takip edebilmek harika.', author: 'Zeynep Kaya', role: '4. Sınıf Öğrencisi', image_url: '' },
        ],
      },
      {
        type: 'faq',
        title: 'Sıkça Sorulan Sorular',
        style: { anchor: 'sss' },
        items: [
          { question: 'Öğrenci giriş bilgilerimi nasıl alabilirim?', answer: 'Sınıf öğretmeninizden veya okul idaresinden sınıf katılım kodunuzu ve şifrenizi alabilirsiniz.' },
          { question: 'Akıllı tahtayı evden veya tabletten kullanabilir miyim?', answer: 'Evet, okul portalına internet tarayıcısı üzerinden herhangi bir telefon, tablet veya bilgisayardan bağlanabilirsiniz.' },
          { question: 'Eğitici oyunlar ve modüller ücretli mi?', answer: 'Hayır, okulumuzun tüm öğrencileri için tüm eğitici oyunlar, modüller ve kütüphane kaynakları tamamen ücretsizdir.' },
        ],
      },
      {
        type: 'cta',
        visibility: 'everyone',
        heading: 'Okulumuzun Dijital Dünyasına Katılın',
        text: 'Sınıfınızdaki yerinizi alın, ders içeriklerine ve eğitici modüllere hemen ulaşın.',
        background: { type: 'gradient', colors: ['#312e81', '#4338ca'], direction: '90deg' },
        textColor: '#ffffff',
        buttons: [{ text: 'Giriş Yap / Başla', link: '/auth/login', color: '#312e81', background: '#ffffff' }],
      },
    ],
  },
  {
    id: 'academy',
    sections: [
      {
        type: 'hero',
        title: 'Hero',
        visibility: 'logged_out',
        background: { type: 'gradient', colors: ['#0f172a', '#1e3a8a'], direction: '135deg' },
        heading: { text: 'Geleceğinizi Şekillendiren Becerileri Öğrenin', color: '#ffffff', size: 'large' },
        subheading: { text: 'Uygulamalı dersler, gerçek projeler ve size destek olan güçlü bir okul topluluğu.', color: '#cbd5e1', size: 'medium' },
        buttons: [
          { text: 'Hesap Oluşturun', link: '/signup', color: '#0f172a', background: '#ffffff' },
          { text: 'Nasıl Çalışır?', link: '#nasil-calisir', color: '#ffffff', background: '#1d4ed8' },
        ],
        contentAlign: 'center',
      },
      {
        type: 'hero',
        title: 'Hero',
        visibility: 'logged_in',
        background: { type: 'gradient', colors: ['#064e3b', '#059669'], direction: '135deg' },
        heading: { text: 'Tekrar Hoş Geldiniz', color: '#ffffff', size: 'large' },
        subheading: { text: 'Kaldığınız yerden devam edin.', color: '#d1fae5', size: 'medium' },
        buttons: [{ text: 'Derslerime Git', link: '/courses', color: '#064e3b', background: '#ffffff' }],
        contentAlign: 'center',
      },
      {
        type: 'stats',
        title: '',
        items: [
          { value: '1.200+', label: 'Öğrenci' },
          { value: '45+', label: 'Ders ve Eğitim' },
          { value: '4.9/5', label: 'Memnuniyet Oranı' },
          { value: '24', label: 'Eğitim Şubesi' },
        ],
      },
      {
        type: 'features',
        title: 'Nasıl Çalışır?',
        subtitle: 'Meraktan başarıya üç adımda ulaşın.',
        columns: 3,
        style: { anchor: 'nasil-calisir' },
        items: [
          { icon: '🎯', title: 'Yolunuzu Seçin', description: 'Hedefinize ve sınıf seviyenize uygun eğitimi seçin.' },
          { icon: '🛠️', title: 'Uygulayarak Öğrenin', description: 'Kısa dersler, pratik ödevler ve anında öğretmen geri bildirimi.' },
          { icon: '🏆', title: 'Sertifikanızı Alın', description: 'Eğitimi tamamlayın ve doğrulanabilir başarı belgenizi alın.' },
        ],
      },
      { type: 'featured-courses', title: 'En Son Eklenen Dersler', courses: [], mode: 'latest', limit: 4 },
      {
        type: 'testimonials',
        title: 'Öğrencilerimiz Ne Diyor?',
        style: { background: { type: 'solid', color: '#f1f5f9' } },
        items: [
          { quote: 'Projeler ve çizimler sayesinde konuları çok daha hızlı kavradım.', author: 'Can A.', role: 'Öğrenci', image_url: '' },
          { quote: 'Net, pratik ve anlaşılır içerikler. Tam aradığım eğitim portalı.', author: 'Zehra B.', role: 'Öğretmen', image_url: '' },
          { quote: 'Okulumuz için kurulmuş en iyi eğitim ortamı.', author: 'Murat K.', role: 'Veli', image_url: '' },
        ],
      },
      {
        type: 'faq',
        title: 'Sıkça Sorulan Sorular',
        style: { anchor: 'sss' },
        items: [
          { question: 'Önceden bir deneyimim olması gerekir mi?', answer: 'Hayır, tüm derslerimiz temel seviyeden adım adım başlamaktadır.' },
          { question: 'İçeriklere ne kadar süre erişebilirim?', answer: 'Öğrenci kaydınız aktif olduğu sürece tüm kaynaklara dilediğiniz zaman erişebilirsiniz.' },
          { question: 'Başarı belgesi veriliyor mu?', answer: 'Evet, tamamladığınız tüm ders ve modüller için adınıza özel sertifika düzenlenir.' },
        ],
      },
      {
        type: 'cta',
        visibility: 'logged_out',
        heading: 'Başlamaya Hazır mısınız?',
        text: 'Hemen giriş yapın ve bugünkü ilk dersinizi tamamlayın.',
        background: { type: 'gradient', colors: ['#581c87', '#7e22ce'], direction: '90deg' },
        textColor: '#ffffff',
        buttons: [{ text: 'Giriş Yap', link: '/auth/login', color: '#581c87', background: '#ffffff' }],
      },
    ],
  },
  {
    id: 'launch',
    sections: [
      { type: 'banner', text: 'Yeni eğitim dönemi kayıtlarımız devam ediyor!', linkText: 'Detayları İnceleyin', link: '#paketler', background: '#7c2d12', textColor: '#ffffff' },
      {
        type: 'hero',
        title: 'Hero',
        height: 'large',
        background: { type: 'gradient', colors: ['#7c2d12', '#c2410c'], direction: '135deg' },
        heading: { text: 'Yeni Dönem Başlıyor', color: '#ffffff', size: 'large' },
        subheading: { text: 'Canlı dersler, interaktif panolar, gerçek projeler ve tek bir hedef: Başarı.', color: '#fed7aa', size: 'medium' },
        buttons: [{ text: 'Yerinizi Ayırtın', link: '#paketler', color: '#7c2d12', background: '#ffffff' }],
        contentAlign: 'center',
      },
      { type: 'countdown', heading: 'Kayıtların Bitişine Kalan Süre', text: '', target: '', doneText: 'Kayıtlar tamamlandı!', buttons: [], style: { spacing: 'small' } },
      {
        type: 'steps',
        title: 'Süreç Nasıl İlerliyor?',
        layout: 'horizontal',
        style: { animation: 'slide-up' },
        items: [
          { title: 'Katılın', description: 'Sınıfınızı seçin ve döneme kaydolun.' },
          { title: 'Öğrenin', description: 'Haftalık canlı panolara ve derslere katılın.' },
          { title: 'Uygulayın', description: 'Etkinlikleri ve ödevleri tamamlayın.' },
          { title: 'Başarın', description: 'Gelişiminizi karneniz ve başarı puanınızla görün.' },
        ],
      },
      {
        type: 'columns',
        title: '',
        style: { background: { type: 'solid', color: '#fff7ed' }, animation: 'fade' },
        items: [
          { content: '### Canlı & Etkileşimli\nHaftalık akıllı tahta dersleri ve interaktif etkinlikler.' },
          { content: '### Butik Sınıflar\nHer öğrenciye özel ilgi ve anında öğretmen desteği.' },
          { content: '### Sürekli Erişim\nTüm ders notları ve etkinlikler elinizin altında.' },
        ],
      },
      {
        type: 'pricing',
        title: 'Eğitim Paketleri',
        subtitle: 'Dönem başlamadan avantajlı kayıt yaptırın.',
        style: { anchor: 'paketler', animation: 'slide-up' },
        plans: [
          { name: 'Temel Paket', price: 'Ücretsiz', period: '', description: 'Tüm standart sınıf dersleri ve panolar.', features: 'Canlı dersler\nÖdev takibi\nKütüphane erişimi', highlighted: false, button: { text: 'Kayıt Ol', link: '/signup', color: '#0f172a', background: '#f1f5f9' } },
          { name: 'Kapsamlı Paket', price: 'Dönemlik', period: '', description: 'Tüm oyunlar, modüller ve ek kaynaklar.', features: 'Tüm temel özellikler\nEğitici zeka oyunları\nHızlı okuma modülü\nGelişim karnesi', highlighted: true, button: { text: 'Kayıt Ol', link: '/signup', color: '#ffffff', background: '#c2410c' } },
        ],
      },
      {
        type: 'faq',
        title: 'Merak Edilenler',
        style: { width: 'narrow' },
        items: [
          { question: 'Dersleri kaçırırsam ne olur?', answer: 'Tüm pano ve ders dökümanları kütüphaneye otomatik kaydedilir.' },
          { question: 'Gereksinimler nelerdir?', answer: 'İnternet bağlantısı olan herhangi bir cihaz yeterlidir.' },
        ],
      },
    ],
  },
  {
    id: 'product',
    sections: [
      {
        type: 'hero',
        title: 'Hero',
        background: { type: 'solid', color: '#ffffff' },
        heading: { text: 'Eğitim Platformunu Keşfedin', color: '#0f172a', size: 'large' },
        subheading: { text: 'Öğretmenler, öğrenciler ve veliler için hazırlanmış kapsamlı dijital okul rehberi.', color: '#475569', size: 'medium' },
        buttons: [{ text: 'Dersleri İnceleyin', link: '/courses', color: '#ffffff', background: '#0f172a' }],
        contentAlign: 'left',
      },
      { type: 'video', title: '2 Dakikalık Platform Turu', description: '', url: '' },
      {
        type: 'features',
        title: 'Neler Öğreneceksiniz?',
        subtitle: '',
        columns: 4,
        items: [
          { icon: '🚀', title: 'Hızlı Başlangıç', description: 'Dakikalar içinde hesabınızı kurun ve sınıfınıza katılın.' },
          { icon: '⚙️', title: 'Özelleştirme', description: 'Derslerinizi ve çalışma planınızı kendinize göre ayarlayın.' },
          { icon: '📊', title: 'Gelişim Takibi', description: 'Notlarınızı ve çözdüğünüz etkinlikleri analiz edin.' },
          { icon: '🔐', title: 'Güvenli İletişim', description: 'Sadece sınıfınıza özel kapalı ve güvenli ortam.' },
        ],
      },
      { type: 'featured-courses', title: 'Buradan Başlayın', courses: [], mode: 'latest', limit: 4 },
      {
        type: 'cta',
        heading: 'Sorunuz mu var?',
        text: 'Okul destek ekibimiz size her zaman yardımcı olmaya hazır.',
        background: { type: 'solid', color: '#0f172a' },
        textColor: '#ffffff',
        buttons: [{ text: 'Bize Ulaşın', link: 'mailto:destek@okul.com', color: '#0f172a', background: '#ffffff' }],
      },
    ],
  },
  {
    id: 'minimal',
    sections: [
      {
        type: 'rich-text',
        title: 'Hoş Geldiniz',
        content: 'Okulumuzun dijital portalına hoş geldiniz. Derslerimizi, panolarımızı ve kaynaklarımızı inceleyebilirsiniz.',
        align: 'center',
      },
      { type: 'featured-courses', title: 'Dersler', courses: [], mode: 'latest', limit: 8 },
    ],
  },
]

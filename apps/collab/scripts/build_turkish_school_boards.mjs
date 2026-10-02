#!/usr/bin/env node
import * as Y from 'yjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(HERE, 'turkish_boards_output')

/** A paragraph of plain text, as ProseMirror stores it in Yjs. */
function paragraph(text) {
  const node = new Y.XmlElement('paragraph')
  const content = new Y.XmlText()
  if (text) content.insert(0, text)
  node.insert(0, [content])
  return node
}

/** A heading. TipTap stores `level` as a node attribute. */
function heading(text, level = 3) {
  const node = new Y.XmlElement('heading')
  node.setAttribute('level', level)
  const content = new Y.XmlText()
  content.insert(0, text)
  node.insert(0, [content])
  return node
}

function block(name, attrs, children = []) {
  const node = new Y.XmlElement(name)
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value)
  }
  if (children.length) node.insert(0, children)
  return node
}

/** A sticky note. `content: 'block+'`, so it must hold at least one block. */
function note({ x, y, color = 'yellow', width = 260, height = 200, title, body }) {
  const children = []
  if (title) children.push(heading(title, 4))
  for (const line of [].concat(body || [])) children.push(paragraph(line))
  if (!children.length) children.push(paragraph(''))
  return block('noteBlock', { x, y, width, height, color, zIndex: 1 }, children)
}

/** A white card. Same content rule as a note. */
function card({ x, y, width = 300, height = 200, color = '#ffffff', title, body }) {
  const children = []
  if (title) children.push(heading(title, 4))
  for (const line of [].concat(body || [])) children.push(paragraph(line))
  if (!children.length) children.push(paragraph(''))
  return block('boardCard', { x, y, width, height, color, zIndex: 1 }, children)
}

/** A checklist. Atom node. */
function todo({ x, y, width = 280, height = 260, color = 'blue', title, items }) {
  return block('todoBlock', {
    x,
    y,
    width,
    height,
    color,
    zIndex: 1,
    title,
    items: items.map((item, index) => ({
      id: `${title}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      text: item.text,
      done: Boolean(item.done),
    })),
  })
}

/** Frame Box container */
function frame({ x, y, width = 1150, height = 720, title = 'Ders Panosu', color = 'purple' }) {
  return block('frameBox', { x, y, width, height, title, color, locked: false, zIndex: 0 })
}

/** Drawing stroke with SVG path */
function stroke({ x = 0, y = 0, pathData, strokeColor = '#2563eb', strokeWidth = 3, viewBox = '0 0 500 400' }) {
  return block('drawingStroke', { x, y, pathData, strokeColor, strokeWidth, viewBox })
}

const BOARDS = {
  // 1. Matematik: Parabol & Fonksiyonlar
  'matematik-parabol': [
    frame({
      x: 50, y: 40, width: 1160, height: 680,
      title: '📐 10-A Matematik: Fonksiyon Grafikleri ve Parabol Çizimi',
      color: 'blue',
    }),
    // Koordinat eksenleri
    stroke({
      x: 80, y: 100, viewBox: '0 0 450 360', strokeColor: '#374151', strokeWidth: 2.5,
      pathData: 'M 150 20 L 150 340 M 145 28 L 150 20 L 155 28 M 30 250 L 420 250 M 412 245 L 420 250 L 412 255 M 200 245 L 200 255 M 250 245 L 250 255 M 300 245 L 300 255',
    }),
    // Parabol eğrisi (f(x) = x^2 - 4x + 3)
    stroke({
      x: 80, y: 100, viewBox: '0 0 450 360', strokeColor: '#2563eb', strokeWidth: 3.5,
      pathData: 'M 130 60 Q 140 85 150 100 Q 200 250 250 310 Q 300 250 350 100 Q 360 85 370 60',
    }),
    // Simetri ekseni ve tepe noktası çizgisi
    stroke({
      x: 80, y: 100, viewBox: '0 0 450 360', strokeColor: '#dc2626', strokeWidth: 2,
      pathData: 'M 250 50 L 250 330 M 245 310 L 255 310 M 250 310 L 290 340 M 290 340 L 330 340',
    }),
    note({
      x: 570, y: 100, width: 280, height: 220, color: 'yellow',
      title: '📌 Tepe Noktası T(r,k)',
      body: [
        'f(x) = ax² + bx + c fonksiyonunda:',
        '• r = -b / (2a) (Simetri Ekseni)',
        '• k = f(r) = (4ac - b²) / (4a)',
        'Örneğimiz: f(x) = x² - 4x + 3',
        'r = -(-4) / (2·1) = 2',
        'k = f(2) = 4 - 8 + 3 = -1 => T(2, -1)',
      ],
    }),
    note({
      x: 870, y: 100, width: 280, height: 220, color: 'pink',
      title: '⚠️ Kökler ve Diskriminant',
      body: [
        'Δ = b² - 4ac = 16 - 12 = 4 > 0',
        '• Δ > 0 => 2 farklı reel kök vardır:',
        'x₁ = (4 - 2) / 2 = 1',
        'x₂ = (4 + 2) / 2 = 3',
        'Parabol x eksenini (1,0) ve (3,0) noktalarında keser.',
      ],
    }),
    card({
      x: 570, y: 340, width: 280, height: 240, color: '#ffffff',
      title: '💡 Grafik Çizim Kuralları',
      body: [
        '1. a = 1 > 0 olduğundan kollar YUKARI bakar.',
        '2. x = 0 için y = 3 (y eksenini kestiği yer).',
        '3. Tepe noktası T(2, -1) yerel minimumdur.',
        '4. Simetri ekseni x = 2 doğrusudur.',
        '5. [1, 3] aralığında fonksiyon negatiftir.',
      ],
    }),
    todo({
      x: 870, y: 340, width: 280, height: 240, color: 'blue',
      title: 'Ders İçi Alıştırma Adımları',
      items: [
        { text: 'Eksen kesim noktalarını (1,0) ve (3,0) bul', done: true },
        { text: 'Tepe noktasını T(2, -1) hesapla ve işaretle', done: true },
        { text: 'x = 2 simetri eksenini kesikli çiz', done: true },
        { text: 'f(x) = -x² + 6x - 5 grafiğini defterine çiz', done: false },
      ],
    }),
  ],

  // 2. Fizik: Elektrik Devreleri & Eşdeğer Direnç
  'fizik-devreler': [
    frame({
      x: 50, y: 40, width: 1160, height: 680,
      title: '⚡ Fizik Laboratuvarı: Elektrik Devreleri ve Eşdeğer Direnç',
      color: 'green',
    }),
    // Devre telleri ve elemanları
    stroke({
      x: 80, y: 100, viewBox: '0 0 450 360', strokeColor: '#1f2937', strokeWidth: 3,
      pathData: 'M 100 240 L 60 240 L 60 100 L 380 100 L 380 240 L 220 240 M 100 230 L 100 250 M 110 220 L 110 260 M 160 100 L 170 90 L 180 110 L 190 90 L 200 110 L 210 90 L 220 100 M 300 100 L 300 60 L 350 60 L 350 100 M 300 100 L 300 140 L 350 140 L 350 100 M 310 60 L 315 50 L 325 70 L 335 50 L 345 60 M 310 140 L 315 130 L 325 150 L 335 130 L 345 140',
    }),
    // Akım yönü okları
    stroke({
      x: 80, y: 100, viewBox: '0 0 450 360', strokeColor: '#ea580c', strokeWidth: 2.5,
      pathData: 'M 90 100 L 130 100 M 120 95 L 130 100 L 120 105 M 240 100 L 270 100 M 260 95 L 270 100 L 260 105',
    }),
    note({
      x: 570, y: 100, width: 280, height: 220, color: 'green',
      title: '🔬 Ohm Yasası & Direnç Kuralları',
      body: [
        '• Ohm Yasası: V = I · R',
        '• Seri Bağlama: R_eş = R₁ + R₂ + ...',
        '  (Akımlar eşit, voltajlar toplanır)',
        '• Paralel Bağlama: 1/R_eş = 1/R₁ + 1/R₂',
        '  İki paralel direnç için:',
        '  R_p = (R₁ · R₂) / (R₁ + R₂)',
      ],
    }),
    note({
      x: 870, y: 100, width: 280, height: 220, color: 'orange',
      title: '⚠️ Laboratuvar Güvenlik Notu',
      body: [
        '• Ampermetre devreye SERİ bağlanır (iç direnci 0 kabul edilir).',
        '• Voltmetre devreye PARALEL bağlanır (iç direnci sonsuz kabul edilir).',
        '• Kısa Devre: Bir direncin iki ucuna sıfır dirençli tel bağlanırsa akım dirençten geçmez!',
      ],
    }),
    card({
      x: 570, y: 340, width: 280, height: 240, color: '#ffffff',
      title: 'Örnek Devre Analizi',
      body: [
        'R₁ = 4Ω, R₂ = 6Ω, R₃ = 3Ω, Pil V = 24 Volt',
        '1) R₂ ve R₃ paralel:',
        '   R_p = (6 · 3) / (6 + 3) = 18 / 9 = 2Ω',
        '2) R₁ ile seri eşdeğer:',
        '   R_eş = 4Ω + 2Ω = 6Ω',
        '3) Ana kol akımı:',
        '   I = V / R_eş = 24 / 6 = 4 Amper.',
      ],
    }),
    todo({
      x: 870, y: 340, width: 280, height: 240, color: 'green',
      title: 'Laboratuvar Deney Aşamaları',
      items: [
        { text: 'Devre elemanlarını deney tahtasına yerleştir', done: true },
        { text: 'Ampermetreyi ana kola seri bağla', done: true },
        { text: 'Voltmetreyi paralel kollara bağla', done: true },
        { text: 'Güç kaynağını 24V kademesine ayarla', done: false },
      ],
    }),
  ],

  // 3. Kimya: Periyodik Tablo ve Lewis Yapıları
  'kimya-lewis': [
    frame({
      x: 50, y: 40, width: 1160, height: 680,
      title: '🧪 Kimya: Lewis Elektron Nokta Yapıları ve Kimyasal Bağlar',
      color: 'purple',
    }),
    // H2O ve CO2 molekül bağ çizgileri
    stroke({
      x: 80, y: 100, viewBox: '0 0 450 360', strokeColor: '#2563eb', strokeWidth: 3,
      pathData: 'M 180 140 L 130 190 M 180 140 L 230 190 M 175 110 A 3 3 0 1 1 176 110 M 185 110 A 3 3 0 1 1 186 110 M 205 130 A 3 3 0 1 1 206 130 M 205 140 A 3 3 0 1 1 206 140 M 80 280 L 140 280 M 80 290 L 140 290 M 180 280 L 240 280 M 180 290 L 240 290',
    }),
    note({
      x: 570, y: 100, width: 280, height: 220, color: 'blue',
      title: '💎 Oktet & Dublet Kuralı',
      body: [
        '• Dublet Kuralı: H, He, Li gibi atomların son katmanını 2 elektrona tamamlamasıdır.',
        '• Oktet Kuralı: Ametallerin son katmanını 8 elektrona tamamlamasıdır.',
        '• Değerlik Elektronları: Bir atomun en dış katmanındaki elektronlardır.',
      ],
    }),
    note({
      x: 870, y: 100, width: 280, height: 220, color: 'pink',
      title: '🔗 Bağ Türleri Özeti',
      body: [
        '• İyonik Bağ: Metal + Ametal arasında elektron alışverişi ile oluşur (örn: Na⁺Cl⁻).',
        '• Kovalent Bağ: Ametal + Ametal arasında elektronların ortaklaşa kullanımıyla oluşur.',
        '  - Polar: H₂O, NH₃, HCl',
        '  - Apolar: O₂, N₂, CH₄',
      ],
    }),
    card({
      x: 570, y: 340, width: 280, height: 240, color: '#ffffff',
      title: 'NH₃ (Amonyak) Molekül Analizi',
      body: [
        '• ₇N: 2, 5 => Değerlik elektron sayısı = 5',
        '• ₁H: 1 => 3 adet hidrojen tekli kovalent bağ yapar.',
        '• 3 çift ortaklanmış (bağlayıcı) elektron vardır.',
        '• 1 çift ortaklanmamış elektron çifti azotun üzerinde kalır.',
        '• Molekül geometrisi: Üçgen piramit (~107°).',
      ],
    }),
    todo({
      x: 870, y: 340, width: 280, height: 240, color: 'purple',
      title: 'Molekül Çizim Çalışmaları',
      items: [
        { text: 'H₂O polar yapısını ve elektron çiftlerini çiz', done: true },
        { text: 'CO₂ doğrusal molekül şemasını tamamla', done: true },
        { text: 'CH₄ (Metan) tetrahedral yapısını modelle', done: false },
        { text: 'NaCl iyonik kristal örgü şemasını incele', done: false },
      ],
    }),
  ],

  // 4. 10-A Sınıfı Haftalık Ders Programı & Duyuru Panosu
  'sinif-duyuru': [
    frame({
      x: 50, y: 40, width: 1160, height: 680,
      title: '📌 10-A Şubesi Haftalık Ders Programı, Nöbetçi Listesi ve Duyurular',
      color: 'yellow',
    }),
    // Tablo ızgarası
    stroke({
      x: 80, y: 100, viewBox: '0 0 450 360', strokeColor: '#4b5563', strokeWidth: 2,
      pathData: 'M 30 50 L 420 50 L 420 310 L 30 310 Z M 110 50 L 110 310 M 190 50 L 190 310 M 270 50 L 270 310 M 350 50 L 350 310 M 30 100 L 420 100 M 30 150 L 420 150 M 30 200 L 420 200 M 30 250 L 420 250',
    }),
    note({
      x: 570, y: 100, width: 280, height: 220, color: 'yellow',
      title: '📢 Sınıf Rehber Öğretmeni Mesajı',
      body: [
        'Sevgili 10-A öğrencileri;',
        '• Matematik Parabol ödevlerinizi perşembe akşamına kadar sisteme yükleyiniz.',
        '• Cuma günü Fizik laboratuvarına önlüklerinizle geliniz.',
        'Başarılı ve verimli bir hafta dilerim.',
        '— Ahmet Yılmaz (10-A Rehber Öğretmeni)',
      ],
    }),
    note({
      x: 870, y: 100, width: 280, height: 220, color: 'green',
      title: '📋 Haftalık Nöbetçi Öğrenciler',
      body: [
        '• Pazartesi: Emre Demir & Zeynep Çelik',
        '• Salı: Ali Kaya & Elif Demir',
        '• Çarşamba: Burak Şahin & Ayşe Öztürk',
        '• Perşembe: Mehmet Aydın & Fatma Arslan',
        '• Cuma: Kerem Koç & Selin Kurt',
        'Nöbet görevi saat 08:15\'te başlar.',
      ],
    }),
    card({
      x: 570, y: 340, width: 280, height: 240, color: '#ffffff',
      title: 'Sınav ve Etkinlik Takvimi',
      body: [
        '• 6 Ekim Salı: 10. Sınıflar Fizik Laboratuvar Deneyi',
        '• 9 Ekim Cuma: Matematik 1. Ortak Yazılı Sınavı',
        '• 14 Ekim Çarşamba: TÜBİTAK Bilim Fuarı Proje Başvurusu',
        '• 17 Ekim Cumartesi: Veli-Öğretmen Bilgilendirme Toplantısı',
      ],
    }),
    todo({
      x: 870, y: 340, width: 280, height: 240, color: 'blue',
      title: 'Sınıf Temsilcisi Görevleri',
      items: [
        { text: 'Sınıf kitaplık listesini güncelle', done: true },
        { text: 'Akıllı tahta kalemlerini ve silgisini kontrol et', done: true },
        { text: 'Veli toplantı mektuplarını dağıt', done: true },
        { text: 'Kulüp tercih formlarını idareye teslim et', done: false },
      ],
    }),
  ],

  // 5. Edebiyat: Divan Edebiyatı Nazım Şekilleri & Gazel Tahlili
  'edebiyat-gazel': [
    frame({
      x: 50, y: 40, width: 1160, height: 680,
      title: '📖 Türk Dili ve Edebiyatı: Divan Şiiri Nazım Şekilleri ve Gazel Tahlili',
      color: 'pink',
    }),
    // Beyit çizgileri ve kafiye şeması okları
    stroke({
      x: 80, y: 100, viewBox: '0 0 450 360', strokeColor: '#be185d', strokeWidth: 2.5,
      pathData: 'M 50 60 L 300 60 M 50 80 L 300 80 M 320 70 L 360 70 M 350 65 L 360 70 L 350 75 M 50 130 L 300 130 M 50 150 L 300 150 M 50 200 L 300 200 M 50 220 L 300 220 M 50 270 L 300 270 M 50 290 L 300 290',
    }),
    note({
      x: 570, y: 100, width: 280, height: 220, color: 'pink',
      title: '📜 Gazel Terimleri Sözlüğü',
      body: [
        '• Matla: İlk beyittir, mısraları birbiriyle kafiyelidir (aa).',
        '• Makta: Son beyittir, şairin mahlası geçer.',
        '• Hüsn-i Matla: Matladan sonraki en güzel beyit.',
        '• Beytü\'l-Gazel: Gazelin en etkili, en güzel beyti.',
        '• Yek-ahenk: Tüm beyitlerinde aynı konunun işlendiği gazel.',
      ],
    }),
    note({
      x: 870, y: 100, width: 280, height: 220, color: 'yellow',
      title: '🎭 Söz Sanatları Notu',
      body: [
        '• Teşbih (Benzetme): Dört ögesi vardır (benzeyen, benzetilen, benzetme yönü, edatı).',
        '• İstiare (Eğretileme): Benzetmenin temel ögelerinden sadece biriyle yapılır.',
        '• Tezat: Karşıt anlamlı kavramların bir arada sunulmasıdır.',
        '• Telmih: Bilinen tarihi veya mitolojik bir olaya gönderme yapma.',
      ],
    }),
    card({
      x: 570, y: 340, width: 280, height: 240, color: '#ffffff',
      title: 'Fuzûlî - Örnek Beyit Tahlili',
      body: [
        '"Beni candan usandırdı cefâdan yâr usanmaz mı',
        'Felekler yandı âhımdan murâdım şem\'i yanmaz mı"',
        'Açıklama: Aşk acısının büyüklüğü \'Felekler yandı âhımdan\' ifadesiyle mübalağa (abartma) sanatı yapılarak aktarılmıştır.',
        'Şem (mum) ve yanmak kelimeleriyle tenasüp sanatı yapılmıştır.',
      ],
    }),
    todo({
      x: 870, y: 340, width: 280, height: 240, color: 'purple',
      title: 'Metin İnceleme Görevleri',
      items: [
        { text: 'Şiirin aruz kalıbını heceleyerek bul', done: true },
        { text: 'Matla ve makta beyitlerini belirle', done: true },
        { text: 'Redif ve kafiyeleri göster', done: true },
        { text: 'Beyitte geçen mazmunları açıkla', done: false },
      ],
    }),
  ],

  // 6. Biyoloji: Mitoz ve Mayoz Evreleri Karşılaştırma Şeması
  'biyoloji-bolunme': [
    frame({
      x: 50, y: 40, width: 1160, height: 680,
      title: '🧬 10. Sınıf Biyoloji: Mitoz ve Mayoz Bölünme Evreleri Karşılaştırması',
      color: 'blue',
    }),
    // Hücre zarı ve iğ iplikleri
    stroke({
      x: 80, y: 100, viewBox: '0 0 450 360', strokeColor: '#0891b2', strokeWidth: 2.5,
      pathData: 'M 60 180 C 60 90 340 90 340 180 C 340 270 60 270 60 180 M 80 180 L 170 130 M 80 180 L 170 180 M 80 180 L 170 230 M 320 180 L 230 130 M 320 180 L 230 180 M 320 180 L 230 230 M 170 125 L 165 135 M 230 125 L 235 135 M 170 175 L 165 185 M 230 175 L 235 185',
    }),
    note({
      x: 570, y: 100, width: 280, height: 220, color: 'blue',
      title: '🔬 Mitoz Bölünme Özeti',
      body: [
        '• 2n kromozomlu 1 hücreden 2n kromozomlu 2 yeni hücre oluşur.',
        '• Kromozom sayısı ve genetik yapı değişmez.',
        '• Tek hücrelilerde çoğalma, çok hücrelilerde büyüme ve onarımı sağlar.',
        '• Evreler: İnterfaz, Profaz, Metafaz, Anafaz, Telofaz.',
      ],
    }),
    note({
      x: 870, y: 100, width: 280, height: 220, color: 'green',
      title: '🧬 Mayoz Bölünme Özeti',
      body: [
        '• 2n kromozomlu üreme ana hücresinden n kromozomlu 4 gamet oluşur.',
        '• Mayoz I\'de homolog kromozomlar, Mayoz II\'de kardeş kromatitler ayrılır.',
        '• Profaz I\'de Krossing-over gerçekleşir => Genetik çeşitlilik (varyasyon) sağlar.',
      ],
    }),
    card({
      x: 570, y: 340, width: 280, height: 240, color: '#ffffff',
      title: 'Mitoz vs Mayoz Temel Farklar',
      body: [
        '• Oluşan Hücre: Mitoz 2 / Mayoz 4',
        '• Kromozom Sayısı: Mitoz Sabit / Mayoz Yarıya İner',
        '• Çeşitlilik: Mitoz Yok / Mayoz Var (Krossing-over)',
        '• Bölünme Sayısı: Mitoz 1 Kez / Mayoz 2 Kez',
        '• Amaç: Mitoz Büyüme-Onarım / Mayoz Üreme',
      ],
    }),
    todo({
      x: 870, y: 340, width: 280, height: 240, color: 'blue',
      title: 'Mikroskop Laboratuvar Adımları',
      items: [
        { text: 'Soğan kökü ucu lam ve lamel preparatını hazırla', done: true },
        { text: 'Asetokarmen boyası ile kromozomları boya', done: true },
        { text: 'Metafaz ekvatoral plakasını 400x büyütmede bul', done: true },
        { text: 'Anafaz ve telofaz hücrelerini defterine çiz', done: false },
      ],
    }),
  ],
}

mkdirSync(OUT_DIR, { recursive: true })

for (const [key, nodes] of Object.entries(BOARDS)) {
  const doc = new Y.Doc()
  const fragment = doc.getXmlFragment('default')
  fragment.insert(0, nodes)
  const state = Y.encodeStateAsUpdate(doc)
  const path = join(OUT_DIR, `${key}.ydoc`)
  writeFileSync(path, Buffer.from(state))
  console.log(`Generated ${key}.ydoc (${state.byteLength} bytes)`)
}

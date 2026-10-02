// Generated from PostgreSQL database — Single Source of Truth
import { GameCategory, GameItem, GamesStoreResponse, GamePlayResponse } from '../games/games'

export const SYNCED_CATEGORIES: GameCategory[] = [
  {
    "id": 1,
    "category_uuid": "c579323d-c66d-4195-a3ea-bfa8e4995942",
    "name": "Zeka & Mantık",
    "slug": "zeka-mantik",
    "icon": "🧠",
    "description": "Bulmacalar, hafıza ve mantık oyunları",
    "display_order": 0,
    "is_active": true
  },
  {
    "id": 2,
    "category_uuid": "25723107-174f-48f8-b62c-0ef17d44b587",
    "name": "Matematik Maceraları",
    "slug": "matematik",
    "icon": "📐",
    "description": "Ritmik sayma, işlem pratikleri ve hızlı hesaplama",
    "display_order": 0,
    "is_active": true
  },
  {
    "id": 3,
    "category_uuid": "b7ac057a-71bc-4156-b512-46a1cdf609e8",
    "name": "Fen & Uzay",
    "slug": "fen-uzay",
    "icon": "🚀",
    "description": "Güneş sistemi, fizik simülasyonları ve uzay keşfi",
    "display_order": 0,
    "is_active": true
  },
  {
    "id": 4,
    "category_uuid": "b61c11a5-7e86-4e8b-8fe8-d1e4d54ff532",
    "name": "Dil & Kelime",
    "slug": "dil-kelime",
    "icon": "📚",
    "description": "Kelime avı, Türkçe ve İngilizce maceralar",
    "display_order": 0,
    "is_active": true
  },
  {
    "id": 5,
    "category_uuid": "d483c89f-e844-46e2-b784-d0913314001f",
    "name": "Uzay & Bilim",
    "slug": "uzay-bilim",
    "icon": "🎮",
    "description": "Uzay hakkında",
    "display_order": 0,
    "is_active": true
  },
  {
    "id": 6,
    "category_uuid": "c825b022-8315-4e5f-ba59-55b63ea9d6d5",
    "name": "Uzay & Astronomi",
    "slug": "uzay-astronomi",
    "icon": "🎮",
    "description": "Uzay ve astronomi ile ilgili interaktif oyunlar",
    "display_order": 0,
    "is_active": true
  },
  {
    "id": 8,
    "category_uuid": "0e909359-6c17-43c8-a931-1677ce4720e0",
    "name": "3D Simülasyon",
    "slug": "3d-simulasyon",
    "icon": "🪐",
    "description": "3 Boyutlu etkileşimli fen, uzay, matematik ve bilim simülasyonları",
    "display_order": 5,
    "is_active": true
  }
];

export const SYNCED_GAMES: GameItem[] = [
  {
    "id": 5,
    "game_uuid": "f0c16ca9-0007-4f7b-ae07-4efafac1011a",
    "category_id": 6,
    "category_ids": [
      8
    ],
    "is_3d_simulation": true,
    "title": "ORBIT",
    "slug": "orbit",
    "description": "Uzay aracına atla ve araştırma robotu Piko’nun kayıp sinyallerini kurtar! Sekiz gezegeni keşfet, kapsülleri topla ve eğlenceli deneylerle uzayın sırlarını öğren.",
    "grade_levels": [
      "1. Sınıf",
      "2. Sınıf",
      "3. Sınıf",
      "4. Sınıf",
      "5. Sınıf"
    ],
    "age_range": "6-8 Yaş",
    "learning_objectives": "• Güneş sistemindeki sekiz gezegeni tanır ve Güneş’e uzaklıklarına göre sıralar.\n• Dünya’nın kendi ekseni etrafında dönmesiyle gece ve gündüzün oluştuğunu keşfeder.\n• Gezegenlerin büyüklüklerini karşılaştırır; Jüpiter’in en büyük gezegen olduğunu öğrenir.\n• Mars’ın kızıl görünümünü demir minerallerinin oksitlenmesiyle ilişkilendirir.\n• Satürn’ün halkalarının çoğunlukla buz, ayrıca kaya ve toz parçalarından oluştuğunu öğrenir.\n• Venüs örneği üzerinden atmosferin ısı tutma etkisini keşfeder.\n• Güneş etrafındaki bir turun bir yıl olduğunu ve gezegenlerin yıl sürelerinin farklılaştığını öğrenir.\n• Uranüs’ün belirgin eksen eğikliğini gözlemler.\n• İpuçlarını değerlendirme, karşılaştırma ve deneyerek problem çözme becerilerini kullanır.",
    "status": "published",
    "is_featured": true,
    "featured_order": 0,
    "play_count": 4,
    "thumbnail_image": "/games/orbit.png",
    "banner_image": "/games/orbit.png",
    "has_html_content": true,
    "average_rating": 5.0,
    "ratings_count": 142,
    "creation_date": "2026-10-01T00:00:00Z",
    "update_date": "2026-10-02T00:00:00Z"
  },
  {
    "id": 1,
    "game_uuid": "e37d01f4-9d70-4aa1-add6-a13d48daa217",
    "category_id": 1,
    "category_ids": [],
    "is_3d_simulation": false,
    "title": "2048 Sayı & Mantık Bulmacası",
    "slug": "2048-sayi-mantik-bulmacasi",
    "description": "Sayıları kaydırarak birbirine ekleyin, zekanızı ve stratejinizi konuşturup 2048 hedefine ulaşın!",
    "grade_levels": [
      "3. Sınıf",
      "4. Sınıf",
      "5-8. Sınıf",
      "Lise"
    ],
    "age_range": "7-14 Yaş",
    "learning_objectives": "• Stratejik planlama, uzamsal zeka, sayılarla işlem yetisi.",
    "status": "published",
    "is_featured": true,
    "featured_order": 1,
    "play_count": 18,
    "thumbnail_image": "/games/2048-sayi-mantik-bulmacasi.png",
    "banner_image": "/games/2048-sayi-mantik-bulmacasi.png",
    "has_html_content": true,
    "average_rating": 4.8,
    "ratings_count": 58,
    "creation_date": "2026-10-01T00:00:00Z",
    "update_date": "2026-10-02T00:00:00Z"
  },
  {
    "id": 2,
    "game_uuid": "0a23b9cb-dc91-4ea7-9b4e-077bcbbb10ed",
    "category_id": 1,
    "category_ids": [],
    "is_3d_simulation": false,
    "title": "Hafıza Kartları & Çiftini Bul",
    "slug": "hafiza-kartlari-ciftini-bul",
    "description": "Gizlenmiş görsel çiftleri çevirerek en az hamlede eşleştirin. Görsel hafızayı ve dikkati güçlendirir.",
    "grade_levels": [
      "Okul Öncesi",
      "1. Sınıf",
      "2. Sınıf",
      "3. Sınıf"
    ],
    "age_range": "5-10 Yaş",
    "learning_objectives": "• Görsel hafıza, odaklanma süresi, eşleştirme becerisi.",
    "status": "published",
    "is_featured": true,
    "featured_order": 2,
    "play_count": 20,
    "thumbnail_image": "/games/hafiza-kartlari-ciftini-bul.png",
    "banner_image": "/games/hafiza-kartlari-ciftini-bul.png",
    "has_html_content": true,
    "average_rating": 4.8,
    "ratings_count": 58,
    "creation_date": "2026-10-01T00:00:00Z",
    "update_date": "2026-10-02T00:00:00Z"
  },
  {
    "id": 3,
    "game_uuid": "5f811696-f14b-43c6-8d44-2734841f38d2",
    "category_id": 2,
    "category_ids": [
      8
    ],
    "is_3d_simulation": true,
    "title": "Uzay Roketi Matematik Görevi",
    "slug": "uzay-roketi-matematik-gorevi",
    "description": "Uzayda hızla ilerleyen roketin önüne çıkan engelleri doğru toplama, çıkarma ve çarpma yaparak aş!",
    "grade_levels": [
      "2. Sınıf",
      "3. Sınıf",
      "4. Sınıf"
    ],
    "age_range": "7-12 Yaş",
    "learning_objectives": "• Zihinden hızlı işlem yapma, matematiksel özgüven ve refleks.",
    "status": "published",
    "is_featured": true,
    "featured_order": 3,
    "play_count": 15,
    "thumbnail_image": "/games/uzay-roketi-matematik-gorevi.png",
    "banner_image": "/games/uzay-roketi-matematik-gorevi.png",
    "has_html_content": true,
    "average_rating": 5.0,
    "ratings_count": 142,
    "creation_date": "2026-10-01T00:00:00Z",
    "update_date": "2026-10-02T00:00:00Z"
  },
  {
    "id": 7,
    "game_uuid": "75d06861-c3e5-4777-adbe-be68e3539177",
    "category_id": 2,
    "category_ids": [
      8
    ],
    "is_3d_simulation": true,
    "title": "Uzay Roketi Matematik Görevi",
    "slug": "uzay-roket-matematik-gorevi",
    "description": "Uzayda hızla ilerleyen roketin önüne çıkan engelleri doğru toplama, çıkarma ve çarpma yaparak aş!",
    "grade_levels": [
      "2. Sınıf",
      "3. Sınıf",
      "4. Sınıf"
    ],
    "age_range": "7-12 Yaş",
    "learning_objectives": "Zihinden hızlı işlem yapma, matematiksel özgüven ve refleks.",
    "status": "published",
    "is_featured": true,
    "featured_order": 3,
    "play_count": 15,
    "thumbnail_image": "/games/uzay-roket-matematik-gorevi.png",
    "banner_image": "/games/uzay-roket-matematik-gorevi.png",
    "has_html_content": true,
    "average_rating": 5.0,
    "ratings_count": 142,
    "creation_date": "2026-10-01T00:00:00Z",
    "update_date": "2026-10-02T00:00:00Z"
  },
  {
    "id": 4,
    "game_uuid": "881d96ef-d54b-4c7c-a484-7c7936595dc9",
    "category_id": 4,
    "category_ids": [],
    "is_3d_simulation": false,
    "title": "Kelime Avcısı & Harf Çözücü",
    "slug": "kelime-avcisi-harf-cozucu",
    "description": "Karışık verilmiş harfleri bir araya getirip ipuçlarını kullanarak doğru kelimeyi tahmin edin.",
    "grade_levels": [
      "1. Sınıf",
      "2. Sınıf",
      "3. Sınıf",
      "4. Sınıf"
    ],
    "age_range": "6-12 Yaş",
    "learning_objectives": "• Kelime dağarcığı, heceleme, analitik düşünme.",
    "status": "published",
    "is_featured": false,
    "featured_order": 4,
    "play_count": 19,
    "thumbnail_image": "/games/kelime-avcisi-harf-cozucu.png",
    "banner_image": "/games/kelime-avcisi-harf-cozucu.png",
    "has_html_content": true,
    "average_rating": 4.8,
    "ratings_count": 58,
    "creation_date": "2026-10-01T00:00:00Z",
    "update_date": "2026-10-02T00:00:00Z"
  }
];

export const SYNCED_ORGANIZATIONS = [
  {
    "id": 1,
    "org_uuid": "org_e6503d4f-caf3-4e73-bd09-bf9af570ffd9",
    "name": "Atatürk Fen ve Anadolu Lisesi",
    "slug": "default",
    "description": "Oxonom Edu Dijital Eğitim & Akıllı Okul Portalı",
    "about": "Atatürk Fen ve Anadolu Lisesi resmi dijital kampüsü. Akıllı tahtalar, ders içerikleri, ödevler ve veli-öğrenci takip sistemi.",
    "email": "idare@oxonom.com",
    "logo_image": "",
    "thumbnail_image": "",
    "creation_date": "2026-09-30 10:00:43.058047",
    "update_date": "2026-09-30 10:00:43.058056"
  },
  {
    "id": 2,
    "org_uuid": "org_33d3ce57-c2b3-4368-aab5-840ea0e48f2e",
    "name": "Atatürk Fen ve Anadolu Lisesi",
    "slug": "demo",
    "description": "Oxonom Edu Dijital Eğitim & Akıllı Okul Portalı",
    "about": "Atatürk Fen ve Anadolu Lisesi resmi dijital kampüsü. Akıllı tahtalar, ders içerikleri, ödevler ve veli-öğrenci takip sistemi.",
    "email": "idare@oxonom.com",
    "logo_image": "49631c68-a87f-5f98-86b1-395fa018e2d8_logo.webp",
    "thumbnail_image": "8f7c922b-b2e1-5c27-876d-285dba4b13ff_thumbnail.webp",
    "creation_date": "2026-09-30 10:04:19.730783",
    "update_date": "2026-10-02 00:26:37.496139"
  },
  {
    "id": 3,
    "org_uuid": "org_d9a756a7-db10-4071-8ab4-29baa26b4e5a",
    "name": "Atatürk İlköğretim Okulu",
    "slug": "ataturk",
    "description": "Esenyurt İlk Öğretim Okulu",
    "about": "",
    "email": "idare@oxonom.com",
    "logo_image": "",
    "thumbnail_image": null,
    "creation_date": "2026-09-30 19:14:41.469418",
    "update_date": "2026-10-01T21:40:57.549631"
  },
  {
    "id": 4,
    "org_uuid": "org_171be22f-914c-4bc2-9aac-bf967bc21c77",
    "name": "Erçilistan İlköğretim Okulu",
    "slug": "ercililkokulu",
    "description": "Okul Bilgi Özeti",
    "about": null,
    "email": "ercil@ilkokul.com",
    "logo_image": null,
    "thumbnail_image": null,
    "creation_date": "2026-10-01 06:03:51.292423",
    "update_date": "2026-10-01 06:03:51.292437"
  }
];

export const SYNCED_USERS = [
  {
    "id": 1,
    "user_uuid": "user_da7162b6-2ad4-4061-bbb4-37157ddb6462",
    "username": "admin",
    "email": "admin@oxonom.com",
    "first_name": "Admin",
    "last_name": "Oxonom",
    "avatar_image": "",
    "is_superadmin": true,
    "creation_date": "2026-09-30 10:00:43.578878",
    "update_date": "2026-09-30 18:30:33.204750",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "Admin"
      },
      {
        "id": 4,
        "name": "Erçilistan İlköğretim Okulu",
        "slug": "ercililkokulu",
        "role_name": "Admin"
      },
      {
        "id": 1,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "default",
        "role_name": "Admin"
      }
    ],
    "org_count": 3
  },
  {
    "id": 2,
    "user_uuid": "user_6f129354-53fb-40c0-be52-0cc8dc07cce1",
    "username": "ogretmen",
    "email": "ogretmen@oxonom.com",
    "first_name": "Ahmet",
    "last_name": "Yılmaz (Öğretmen)",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-09-30 10:01:53.222563",
    "update_date": "2026-09-30 18:30:33.204750",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "Instructor"
      },
      {
        "id": 1,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "default",
        "role_name": "Instructor"
      }
    ],
    "org_count": 2
  },
  {
    "id": 3,
    "user_uuid": "user_119ad2b1-c0cd-41ec-bab6-bcf3bb80fd2e",
    "username": "student",
    "email": "student@oxonom.com",
    "first_name": "Selin",
    "last_name": "Kurt",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-09-30 10:01:53.283172",
    "update_date": "2026-09-30 18:30:33.204750",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      },
      {
        "id": 1,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "default",
        "role_name": "User"
      }
    ],
    "org_count": 2
  },
  {
    "id": 4,
    "user_uuid": "user_9bd219ae-1fc2-4a8c-99f1-a2684896af9a",
    "username": "demo_amara_dunmore",
    "email": "demo-00@demo.example.com",
    "first_name": "Amara",
    "last_name": "Dunmore",
    "avatar_image": "a8a67c5f-775e-562c-997c-f6c4fcd7c605_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-08-02 10:00:00",
    "update_date": "2026-10-02 00:23:09.504477",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 5,
    "user_uuid": "user_6ddf1bc8-4441-4b1e-8f28-bf3cdef791fb",
    "username": "demo_benoit_kovac",
    "email": "demo-01@demo.example.com",
    "first_name": "Benoit",
    "last_name": "Kovac",
    "avatar_image": "40806e0d-7bf4-52da-b80b-689410fd3c01_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-08-23 10:00:00",
    "update_date": "2026-10-02 00:23:09.509386",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 6,
    "user_uuid": "user_849db187-ee09-4edc-bcb3-2f230037e27c",
    "username": "demo_carys_ravenna",
    "email": "demo-02@demo.example.com",
    "first_name": "Carys",
    "last_name": "Ravenna",
    "avatar_image": "ebdcf37c-fe98-5382-9d18-690aa2512e4c_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-06-26 10:00:00",
    "update_date": "2026-10-02 00:23:09.512076",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 7,
    "user_uuid": "user_43e55a07-c4cf-4d2f-8b99-e4e1e7bfd1c6",
    "username": "demo_dmitri_ziegler",
    "email": "demo-03@demo.example.com",
    "first_name": "Dmitri",
    "last_name": "Ziegler",
    "avatar_image": "68712d4d-aff1-5090-9043-efa5f74cb646_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-08-11 10:00:00",
    "update_date": "2026-10-02 00:23:09.514687",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 8,
    "user_uuid": "user_64334d86-b933-4171-9822-1f960d4efb01",
    "username": "demo_elif_grimaldi",
    "email": "demo-04@demo.example.com",
    "first_name": "Elif",
    "last_name": "Grimaldi",
    "avatar_image": "2e34913d-8f0f-5644-aac9-af30e6e25b93_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-07-07 10:00:00",
    "update_date": "2026-10-02 00:23:09.517278",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 9,
    "user_uuid": "user_088f5d9d-7afa-408e-8143-21b159bf45ca",
    "username": "demo_fabian_nystrom",
    "email": "demo-05@demo.example.com",
    "first_name": "Fabian",
    "last_name": "Nystrom",
    "avatar_image": "466ecde6-a463-58dd-898f-babe134fc4a6_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-06-19 10:00:00",
    "update_date": "2026-10-02 00:23:09.520072",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 10,
    "user_uuid": "user_a33e20e1-a4ee-4ab3-b11e-cd7b59ec6d3a",
    "username": "demo_greta_farrow",
    "email": "demo-06@demo.example.com",
    "first_name": "Greta",
    "last_name": "Farrow",
    "avatar_image": "25e4767d-b569-5f52-9a49-43298a9a58b2_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-08-29 10:00:00",
    "update_date": "2026-10-02 00:23:09.522702",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 11,
    "user_uuid": "user_9a580842-f603-4c5f-9250-67ea0bc85962",
    "username": "demo_hugo_moreau",
    "email": "demo-07@demo.example.com",
    "first_name": "Hugo",
    "last_name": "Moreau",
    "avatar_image": "0b88ffca-5377-5c07-905b-0b6b29c6eb79_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-08-16 10:00:00",
    "update_date": "2026-10-02 00:23:09.525312",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 12,
    "user_uuid": "user_f1c9d3cf-1df3-4538-ac40-8d6486a600fe",
    "username": "demo_ines_thorne",
    "email": "demo-08@demo.example.com",
    "first_name": "Ines",
    "last_name": "Thorne",
    "avatar_image": "1b59b7ff-0fe9-51e1-b5c2-65653beb4799_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-05-21 10:00:00",
    "update_date": "2026-10-01 23:42:10.106644",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 13,
    "user_uuid": "user_3e00fbae-fe1e-4c39-a68e-0f970352d476",
    "username": "demo_jonas_bramley",
    "email": "demo-09@demo.example.com",
    "first_name": "Jonas",
    "last_name": "Bramley",
    "avatar_image": "f46f1fc1-7c49-50a7-a3f5-0d4987429587_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-05-23 10:00:00",
    "update_date": "2026-10-02 00:23:09.529610",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 14,
    "user_uuid": "user_2b2d3da9-ecff-4727-bd7a-afa6a4c8e9a5",
    "username": "demo_kaisa_ingram",
    "email": "demo-10@demo.example.com",
    "first_name": "Kaisa",
    "last_name": "Ingram",
    "avatar_image": "14633d67-e716-55b1-bfd0-1359a719c85b_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-07-18 10:00:00",
    "update_date": "2026-10-02 00:23:09.531865",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 15,
    "user_uuid": "user_2c7767e0-eaa7-4d2b-80d7-472cae295117",
    "username": "demo_lucian_aldridge",
    "email": "demo-11@demo.example.com",
    "first_name": "Lucian",
    "last_name": "Aldridge",
    "avatar_image": "7980681a-a8a8-525f-9eb8-12f513248131_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-06-20 10:00:00",
    "update_date": "2026-10-02 00:23:09.534512",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 16,
    "user_uuid": "user_bc4eea65-63a1-418e-866e-e49a62a3f9fd",
    "username": "demo_marta_halloway",
    "email": "demo-12@demo.example.com",
    "first_name": "Marta",
    "last_name": "Halloway",
    "avatar_image": "6bf3f412-70cc-5e83-b497-782171d8db12_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-08-16 10:00:00",
    "update_date": "2026-10-02 00:23:09.537113",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 17,
    "user_uuid": "user_5a8a02d7-d411-42fe-b398-9cfceac9eb37",
    "username": "demo_nadia_oyelaran",
    "email": "demo-13@demo.example.com",
    "first_name": "Nadia",
    "last_name": "Oyelaran",
    "avatar_image": "c65bc7dc-7270-5abc-ab8d-8c5e95d4f9e9_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-09-16 10:00:00",
    "update_date": "2026-10-02 00:23:09.540171",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 18,
    "user_uuid": "user_0ce67abe-e1d3-40e8-961f-f492d04a3e18",
    "username": "demo_otto_vasquez",
    "email": "demo-14@demo.example.com",
    "first_name": "Otto",
    "last_name": "Vasquez",
    "avatar_image": "53322b32-d0b6-58c4-9a4b-53cc497a31f3_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-07-13 10:00:00",
    "update_date": "2026-10-02 00:23:09.542778",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 19,
    "user_uuid": "user_5e95808a-cb31-4bfe-bb0a-dad0aab5ae1d",
    "username": "demo_petra_delacroix",
    "email": "demo-15@demo.example.com",
    "first_name": "Petra",
    "last_name": "Delacroix",
    "avatar_image": "001750f4-28e2-5d11-9db1-dea26511c362_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-09-07 10:00:00",
    "update_date": "2026-10-02 00:23:09.545473",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 20,
    "user_uuid": "user_117dc9a2-d55f-43eb-a95b-03a0a917e180",
    "username": "demo_quentin_kingsley",
    "email": "demo-16@demo.example.com",
    "first_name": "Quentin",
    "last_name": "Kingsley",
    "avatar_image": "edfeba9c-d4e1-5c75-b2b1-f0be18d15460_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-06-24 10:00:00",
    "update_date": "2026-10-02 00:23:09.547297",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 21,
    "user_uuid": "user_bc13d250-7804-4004-bb4d-f71bf7ff568f",
    "username": "demo_rosa_castellan",
    "email": "demo-17@demo.example.com",
    "first_name": "Rosa",
    "last_name": "Castellan",
    "avatar_image": "3b193c73-3d05-5f30-8dea-694650ce48de_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-08-14 10:00:00",
    "update_date": "2026-10-02 00:23:09.549354",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 22,
    "user_uuid": "user_93578b03-f831-49ec-b06d-40776e1f31ce",
    "username": "demo_stefan_jarvis",
    "email": "demo-18@demo.example.com",
    "first_name": "Stefan",
    "last_name": "Jarvis",
    "avatar_image": "c0302da3-1fb4-5f56-86a7-4babc06a93da_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-06-23 10:00:00",
    "update_date": "2026-10-01 23:42:10.127546",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 23,
    "user_uuid": "user_aa046cec-1a45-49eb-b326-360321a6831b",
    "username": "demo_tomas_quilty",
    "email": "demo-19@demo.example.com",
    "first_name": "Tomas",
    "last_name": "Quilty",
    "avatar_image": "6c66eb52-4870-5daf-aacc-356e1b17323b_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-07-28 10:00:00",
    "update_date": "2026-10-02 00:23:09.553434",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 24,
    "user_uuid": "user_e966c54f-af5c-47f3-b6ea-60ba9bc470c9",
    "username": "demo_ursula_yilmaz",
    "email": "demo-20@demo.example.com",
    "first_name": "Ursula",
    "last_name": "Yilmaz",
    "avatar_image": "7e4721ca-0841-5336-a4e2-e20a4b1a9cc4_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-05-22 10:00:00",
    "update_date": "2026-10-02 00:12:53.144707",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 25,
    "user_uuid": "user_66217f7a-5b03-4139-b4e2-177f0384ebac",
    "username": "demo_viktor_fenwick",
    "email": "demo-21@demo.example.com",
    "first_name": "Viktor",
    "last_name": "Fenwick",
    "avatar_image": "22c99bdc-6c16-50a8-84d4-d0e4bcd5a337_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-07-12 10:00:00",
    "update_date": "2026-10-02 00:23:09.556736",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 26,
    "user_uuid": "user_20cf7b83-9eff-41c3-ac80-d547e4ef65df",
    "username": "demo_wren_merrick",
    "email": "demo-22@demo.example.com",
    "first_name": "Wren",
    "last_name": "Merrick",
    "avatar_image": "bcd0a79c-9397-52bf-a9b9-4ead010352a7_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-05-27 10:00:00",
    "update_date": "2026-10-01 23:52:50.111221",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 27,
    "user_uuid": "user_ecc767b3-75cc-4602-b267-0e4b6ec7d449",
    "username": "demo_xavi_eriksen",
    "email": "demo-23@demo.example.com",
    "first_name": "Xavi",
    "last_name": "Eriksen",
    "avatar_image": "874c1988-a5aa-5a98-8b32-f8f3b9d656dc_avatar.webp",
    "is_superadmin": false,
    "creation_date": "2026-06-14 10:00:00",
    "update_date": "2026-10-01 23:52:50.113572",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 28,
    "user_uuid": "user_c8659b47-0e59-46d8-8c56-c785b5dc7820",
    "username": "demo_yara_lindqvist",
    "email": "demo-24@demo.example.com",
    "first_name": "Yara",
    "last_name": "Lindqvist",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-06-09 10:00:00",
    "update_date": "2026-10-02 00:23:09.561596",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 29,
    "user_uuid": "user_81a93670-3741-40cc-8315-3cf19677094b",
    "username": "demo_zofia_sandoval",
    "email": "demo-25@demo.example.com",
    "first_name": "Zofia",
    "last_name": "Sandoval",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-06-26 10:00:00",
    "update_date": "2026-09-30 10:04:19.969586",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 30,
    "user_uuid": "user_8df7f53d-0f1b-4806-a3d1-661b0b2cef1d",
    "username": "demo_anton_ashworth",
    "email": "demo-26@demo.example.com",
    "first_name": "Anton",
    "last_name": "Ashworth",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-07-13 10:00:00",
    "update_date": "2026-09-30 10:04:19.972943",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 31,
    "user_uuid": "user_2d8d26ba-3b29-4800-8a32-d2eefc23c965",
    "username": "demo_brigid_hartline",
    "email": "demo-27@demo.example.com",
    "first_name": "Brigid",
    "last_name": "Hartline",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-05-21 10:00:00",
    "update_date": "2026-09-30 10:04:19.976137",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 32,
    "user_uuid": "user_dc0eb3dc-2e47-4052-8e5c-3b948982bd0a",
    "username": "demo_cato_okonkwo",
    "email": "demo-28@demo.example.com",
    "first_name": "Cato",
    "last_name": "Okonkwo",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-09-04 10:00:00",
    "update_date": "2026-09-30 10:04:19.979052",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 33,
    "user_uuid": "user_256b2640-e7e5-44ff-8cc9-3cbfe717a9d0",
    "username": "demo_dara_girard",
    "email": "demo-29@demo.example.com",
    "first_name": "Dara",
    "last_name": "Girard",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-08-13 10:00:00",
    "update_date": "2026-09-30 10:04:19.982365",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 34,
    "user_uuid": "user_37b6edd0-6685-40e6-96a1-3a5d52ef6cbf",
    "username": "demo_emil_nowak",
    "email": "demo-30@demo.example.com",
    "first_name": "Emil",
    "last_name": "Nowak",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-06-17 10:00:00",
    "update_date": "2026-09-30 10:04:19.985910",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 35,
    "user_uuid": "user_220ff768-66bf-4ede-98a4-b963004a8b9e",
    "username": "demo_frida_ulriksen",
    "email": "demo-31@demo.example.com",
    "first_name": "Frida",
    "last_name": "Ulriksen",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-08-08 10:00:00",
    "update_date": "2026-09-30 10:04:19.989581",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 36,
    "user_uuid": "user_e817c844-ecdf-44a8-b72f-9eeec3a96ca2",
    "username": "demo_gideon_caradec",
    "email": "demo-32@demo.example.com",
    "first_name": "Gideon",
    "last_name": "Caradec",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-07-07 10:00:00",
    "update_date": "2026-09-30 10:04:19.992983",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 37,
    "user_uuid": "user_c78e4560-cad5-4a1e-aa17-361ecb68efa8",
    "username": "demo_hana_jourdain",
    "email": "demo-33@demo.example.com",
    "first_name": "Hana",
    "last_name": "Jourdain",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-05-28 10:00:00",
    "update_date": "2026-09-30 10:04:19.996444",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 38,
    "user_uuid": "user_e763be5e-13c5-4aee-b721-f883042217ff",
    "username": "demo_ivo_boateng",
    "email": "demo-34@demo.example.com",
    "first_name": "Ivo",
    "last_name": "Boateng",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-08-01 10:00:00",
    "update_date": "2026-09-30 10:04:19.999749",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 39,
    "user_uuid": "user_70c43d96-42de-4de8-9214-efa3ae2ad6cc",
    "username": "demo_juno_ibsen",
    "email": "demo-35@demo.example.com",
    "first_name": "Juno",
    "last_name": "Ibsen",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-08-18 10:00:00",
    "update_date": "2026-09-30 10:04:20.004634",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 40,
    "user_uuid": "user_94731d9f-814c-4a3d-93bc-97ac83c0b6db",
    "username": "demo_kes_pereira",
    "email": "demo-36@demo.example.com",
    "first_name": "Kes",
    "last_name": "Pereira",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-07-29 10:00:00",
    "update_date": "2026-09-30 10:04:20.008416",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 41,
    "user_uuid": "user_2701167b-cc11-444b-a8c7-0a84560abbfc",
    "username": "demo_liv_wexford",
    "email": "demo-37@demo.example.com",
    "first_name": "Liv",
    "last_name": "Wexford",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-09-07 10:00:00",
    "update_date": "2026-09-30 10:04:20.011669",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 42,
    "user_uuid": "user_8ec00658-8a80-4588-b162-1d685b700884",
    "username": "demo_mattias_eastman",
    "email": "demo-38@demo.example.com",
    "first_name": "Mattias",
    "last_name": "Eastman",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-07-22 10:00:00",
    "update_date": "2026-09-30 10:04:20.015047",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 43,
    "user_uuid": "user_ce63d7b7-e5b5-44d1-9540-753b2bf2ad3c",
    "username": "demo_noor_lamotte",
    "email": "demo-39@demo.example.com",
    "first_name": "Noor",
    "last_name": "Lamotte",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-06-12 10:00:00",
    "update_date": "2026-09-30 10:04:20.018606",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 44,
    "user_uuid": "user_37bebc5f-08d7-447b-92d5-eafab0ade3df",
    "username": "can_student",
    "email": "can_student@oxonom.com",
    "first_name": "Can",
    "last_name": "Demir",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-09-30 15:15:43.027037",
    "update_date": "2026-09-30 15:15:43.027049",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 45,
    "user_uuid": "user_5735426a-8bba-4f51-9fcb-4f295fd71f18",
    "username": "ahmet_can",
    "email": "ahmet_can@oxonom.com",
    "first_name": "Ahmet",
    "last_name": "Can",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-09-30 15:16:36.784036",
    "update_date": "2026-09-30 15:16:36.784049",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 46,
    "user_uuid": "user_6b567674-4ef0-43b6-8b9f-b14f65ff5e21",
    "username": "ogrenci_ali",
    "email": "ogrenci_ali@oxonom.com",
    "first_name": "Ali",
    "last_name": "Kaya",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-09-30 15:18:26.304019",
    "update_date": "2026-09-30 15:18:26.304030",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 47,
    "user_uuid": "user_1adbad1f-8b00-47ef-8854-5e735afcf0e4",
    "username": "ogrenci_can",
    "email": "ogrenci_can@oxonom.com",
    "first_name": "Can",
    "last_name": "Yılmaz",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-09-30 15:18:52.666390",
    "update_date": "2026-09-30 15:18:52.666402",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 48,
    "user_uuid": "user_d833bfc8-9a8c-4ea1-948c-ab7531e6b380",
    "username": "ugur",
    "email": "ai.oxobee@gmail.com",
    "first_name": "Uğur",
    "last_name": "UĞURLU",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-09-30 16:06:00.792870",
    "update_date": "2026-09-30 16:06:00.792895",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      }
    ],
    "org_count": 1
  },
  {
    "id": 49,
    "user_uuid": "user_3192c6c8-2b6c-4753-bce1-4c4b1bcc679c",
    "username": "teacher",
    "email": "teacher@oxonom.com",
    "first_name": "Teacher",
    "last_name": "Oxonom",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-09-30 18:14:00.723171",
    "update_date": "2026-09-30 18:30:33.204750",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "Instructor"
      },
      {
        "id": 1,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "default",
        "role_name": "Instructor"
      }
    ],
    "org_count": 2
  },
  {
    "id": 50,
    "user_uuid": "user_64e03f9b-6734-414a-9775-f87f52dae15d",
    "username": "idare",
    "email": "idare@oxonom.com",
    "first_name": "Mehmet",
    "last_name": "Özkan (Müdür)",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-09-30 18:30:33.204750",
    "update_date": "2026-09-30 18:30:33.204750",
    "orgs": [
      {
        "id": 1,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "default",
        "role_name": "Admin"
      },
      {
        "id": 3,
        "name": "Atatürk İlköğretim Okulu",
        "slug": "ataturk",
        "role_name": "Admin"
      },
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "Admin"
      }
    ],
    "org_count": 3
  },
  {
    "id": 51,
    "user_uuid": "user_28721dd2-df5b-4c84-8f2d-6ad97e3e6cbb",
    "username": "ogrenci",
    "email": "ogrenci@oxonom.com",
    "first_name": "Emre",
    "last_name": "Demir (Öğrenci)",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-09-30 18:30:33.204750",
    "update_date": "2026-09-30 18:30:33.204750",
    "orgs": [
      {
        "id": 2,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "demo",
        "role_name": "User"
      },
      {
        "id": 1,
        "name": "Atatürk Fen ve Anadolu Lisesi",
        "slug": "default",
        "role_name": "User"
      }
    ],
    "org_count": 2
  },
  {
    "id": 52,
    "user_uuid": "usr_6a6de31c-af5f-468b-9030-e1edba0355f3",
    "username": "misafir",
    "email": "guest@agenapos.com",
    "first_name": "Misafir",
    "last_name": "Öğrenci",
    "avatar_image": "",
    "is_superadmin": false,
    "creation_date": "2026-10-02 04:16:22.964642",
    "update_date": "2026-10-02 04:16:22.964652",
    "orgs": [],
    "org_count": 0
  }
];

export const SYNCED_USERGROUPS = [
  {
    "id": 5,
    "usergroup_uuid": "usergroup_ce99f329-7f23-4263-b440-2710dd3d63e9",
    "name": "1 / A",
    "description": "İlkokul (1-4) Şubesi",
    "join_code": "OX-NUFB",
    "grade_level": "İlkokul (1-4)",
    "org_id": 1,
    "creation_date": "2026-09-30 19:05:51.199401",
    "update_date": "2026-09-30 19:11:42.870661"
  },
  {
    "id": 6,
    "usergroup_uuid": "usergroup_817cd3c8-115c-45d4-a062-d9c593c96605",
    "name": "10-A Fen ve Matematik Şubesi",
    "description": "Rehber Öğretmen: Ahmet Yılmaz. Sayısal ağırlıklı fen ve matematik şubesi.",
    "join_code": "FEN-10A",
    "grade_level": "10. Sınıf",
    "org_id": 2,
    "creation_date": "2026-10-02 00:26:37.553698",
    "update_date": "2026-10-02 00:40:00.333244"
  },
  {
    "id": 7,
    "usergroup_uuid": "usergroup_72867ccc-b540-4c50-9406-62ffb3740fe3",
    "name": "11-B İleri Sayısal Şubesi",
    "description": "Rehber Öğretmen: Ahmet Yılmaz. İleri düzey matematik ve fizik hazırlık şubesi.",
    "join_code": "SAY-11B",
    "grade_level": "11. Sınıf",
    "org_id": 2,
    "creation_date": "2026-10-02 00:26:37.564153",
    "update_date": "2026-10-02 00:40:00.346825"
  },
  {
    "id": 8,
    "usergroup_uuid": "usergroup_860f9eac-1aa5-43cd-80ba-d959d6a4015f",
    "name": "9-C Anadolu Şubesi",
    "description": "Lise uyum ve temel fen-sosyal bilimler başlangıç şubesi.",
    "join_code": "AND-09C",
    "grade_level": "9. Sınıf",
    "org_id": 2,
    "creation_date": "2026-10-02 00:26:37.573010",
    "update_date": "2026-10-02 00:40:00.350260"
  },
  {
    "id": 17,
    "usergroup_uuid": "usergroup_e5f7555b-f0d1-4fd4-a78c-f0d36f1c2c4a",
    "name": "10-A Fen ve Matematik Şubesi",
    "description": "Rehber Öğretmen: Ahmet Yılmaz. Sayısal ağırlıklı fen ve matematik şubesi.",
    "join_code": "FEN-10A-D",
    "grade_level": "10. Sınıf",
    "org_id": 1,
    "creation_date": "2026-10-02T09:21:37.289277",
    "update_date": "2026-10-02T09:21:37.289281"
  },
  {
    "id": 18,
    "usergroup_uuid": "usergroup_16097b9a-9e81-49b8-bbd3-8ceecc4cc629",
    "name": "11-B İleri Sayısal Şubesi",
    "description": "Rehber Öğretmen: Ahmet Yılmaz. İleri düzey matematik ve fizik hazırlık şubesi.",
    "join_code": "SAY-11B-D",
    "grade_level": "11. Sınıf",
    "org_id": 1,
    "creation_date": "2026-10-02T09:21:37.290340",
    "update_date": "2026-10-02T09:21:37.290342"
  },
  {
    "id": 19,
    "usergroup_uuid": "usergroup_d1455291-99cf-464f-adf5-6198fc7535c5",
    "name": "9-C Anadolu Şubesi",
    "description": "Lise uyum ve temel fen-sosyal bilimler başlangıç şubesi.",
    "join_code": "AND-09C-D",
    "grade_level": "9. Sınıf",
    "org_id": 1,
    "creation_date": "2026-10-02T09:21:37.291366",
    "update_date": "2026-10-02T09:21:37.291368"
  }
];

export const SYNCED_BOARDS = [
  {
    "id": 10,
    "board_uuid": "board_6d0591f1-ed22-46f7-b0f9-004b6f37f455",
    "name": "hücre bölünmesi",
    "description": "",
    "thumbnail_image": "",
    "org_id": 1,
    "public": false,
    "created_by": 50,
    "creation_date": "2026-09-30 19:08:24.111946",
    "update_date": "2026-10-01 23:41:25.773387"
  },
  {
    "id": 41,
    "board_uuid": "board_6be7ebed-4c00-4243-9a9b-ffef9933803b",
    "name": "10-A Matematik: Fonksiyon Grafikleri & Parabol Çizimleri",
    "description": "Parabol tepe noktası, kökler ve fonksiyon dönüşümleri ders anlatım tahtası.",
    "thumbnail_image": "",
    "org_id": 2,
    "public": true,
    "created_by": 2,
    "creation_date": "2026-08-22 10:00:00",
    "update_date": "2026-10-02 05:06:48.966466"
  },
  {
    "id": 42,
    "board_uuid": "board_2aa88e1a-dcc0-451b-9924-4b075f3f8e2e",
    "name": "Fizik Laboratuvarı: Elektrik Devreleri & Eşdeğer Direnç",
    "description": "Seri-paralel bağlama devre şemaları, Kirchoff kuralları akıllı tahta çizimleri.",
    "thumbnail_image": "",
    "org_id": 2,
    "public": true,
    "created_by": 2,
    "creation_date": "2026-08-22 10:00:00",
    "update_date": "2026-10-02 07:24:28.853670"
  },
  {
    "id": 43,
    "board_uuid": "board_2ec16e01-3744-4a40-93dc-228016b8a937",
    "name": "Kimya: Periyodik Tablo ve Lewis Yapıları Çizim Tahtası",
    "description": "İyonik ve kovalent bağ modelleri, atom yarıçapı trend grafikleri.",
    "thumbnail_image": "",
    "org_id": 2,
    "public": true,
    "created_by": 2,
    "creation_date": "2026-08-22 10:00:00",
    "update_date": "2026-10-02 00:40:00.630395"
  },
  {
    "id": 44,
    "board_uuid": "board_93a22f1c-4071-4fbc-b42a-82411a2a9faf",
    "name": "10-A Haftalık Ders Programı, Nöbetçi Listesi ve Duyuru Panosu",
    "description": "Sınav takvimi, nöbet listesi, okul kulüp etkinlikleri ve haftalık ödev hatırlatıcıları.",
    "thumbnail_image": "",
    "org_id": 2,
    "public": true,
    "created_by": 2,
    "creation_date": "2026-08-22 10:00:00",
    "update_date": "2026-10-02 04:16:39.053086"
  },
  {
    "id": 45,
    "board_uuid": "board_93baf363-1e5e-4fcc-af31-7006e07815d3",
    "name": "Edebiyat: Divan Edebiyatı Nazım Şekilleri & Kavram Haritası",
    "description": "Gazel, kaside, mesnevi özellikleri ve şairler kronoloji haritası.",
    "thumbnail_image": "",
    "org_id": 2,
    "public": true,
    "created_by": 2,
    "creation_date": "2026-08-22 10:00:00",
    "update_date": "2026-10-02 05:06:48.980999"
  },
  {
    "id": 46,
    "board_uuid": "board_c8716f40-46da-4460-879d-ea8fc8e03d45",
    "name": "Biyoloji: Mitoz ve Mayoz Evreleri Karşılaştırma Şeması",
    "description": "Profaz, metafaz, anafaz, telofaz kromozom durumları görselleştirme tahtası.",
    "thumbnail_image": "",
    "org_id": 2,
    "public": true,
    "created_by": 2,
    "creation_date": "2026-08-22 10:00:00",
    "update_date": "2026-10-02 03:51:31.838143"
  },
  {
    "id": 55,
    "board_uuid": "board_2b9b0c00-e2c4-43ca-a067-18fc7abce8d4",
    "name": "Edebiyat: Divan Edebiyatı Nazım Şekilleri & Kavram Haritası",
    "description": "Gazel, kaside, mesnevi özellikleri ve şairler kronoloji haritası.",
    "thumbnail_image": null,
    "org_id": 1,
    "public": true,
    "created_by": 2,
    "creation_date": "2026-10-02T09:21:37.310743",
    "update_date": "2026-10-02T09:21:37.310747"
  },
  {
    "id": 56,
    "board_uuid": "board_190722cb-c74c-4a13-9f56-ed7272f7a8ae",
    "name": "Fizik Laboratuvarı: Elektrik Devreleri & Eşdeğer Direnç",
    "description": "Seri-paralel bağlama devre şemaları, Kirchoff kuralları akıllı tahta çizimleri.",
    "thumbnail_image": null,
    "org_id": 1,
    "public": true,
    "created_by": 2,
    "creation_date": "2026-10-02T09:21:37.311851",
    "update_date": "2026-10-02T09:21:37.311854"
  },
  {
    "id": 57,
    "board_uuid": "board_67e91e70-4b75-4b49-b4ae-0800bbd3dcfe",
    "name": "10-A Haftalık Ders Programı, Nöbetçi Listesi ve Duyuru Panosu",
    "description": "Sınav takvimi, nöbet listesi, okul kulüp etkinlikleri ve haftalık ödev hatırlatıcıları.",
    "thumbnail_image": null,
    "org_id": 1,
    "public": true,
    "created_by": 2,
    "creation_date": "2026-10-02T09:21:37.312732",
    "update_date": "2026-10-02T09:21:37.312734"
  },
  {
    "id": 58,
    "board_uuid": "board_efffdc6f-51f1-491a-a738-cb3e79704cfa",
    "name": "10-A Matematik: Fonksiyon Grafikleri & Parabol Çizimleri",
    "description": "Parabol tepe noktası, kökler ve fonksiyon dönüşümleri ders anlatım tahtası.",
    "thumbnail_image": null,
    "org_id": 1,
    "public": true,
    "created_by": 2,
    "creation_date": "2026-10-02T09:21:37.313787",
    "update_date": "2026-10-02T09:21:37.313790"
  },
  {
    "id": 59,
    "board_uuid": "board_55c69e10-df95-4706-854a-dbfac1be8335",
    "name": "Kimya: Periyodik Tablo ve Lewis Yapıları Çizim Tahtası",
    "description": "İyonik ve kovalent bağ modelleri, atom yarıçapı trend grafikleri.",
    "thumbnail_image": null,
    "org_id": 1,
    "public": true,
    "created_by": 2,
    "creation_date": "2026-10-02T09:21:37.314871",
    "update_date": "2026-10-02T09:21:37.314874"
  },
  {
    "id": 60,
    "board_uuid": "board_60e798c3-1953-4650-be27-58f1695d5746",
    "name": "Biyoloji: Mitoz ve Mayoz Evreleri Karşılaştırma Şeması",
    "description": "Profaz, metafaz, anafaz, telofaz kromozom durumları görselleştirme tahtası.",
    "thumbnail_image": null,
    "org_id": 1,
    "public": true,
    "created_by": 2,
    "creation_date": "2026-10-02T09:21:37.316031",
    "update_date": "2026-10-02T09:21:37.316033"
  }
];

export const SYNCED_ASSIGNMENTS = [
  {
    "id": 1,
    "assignment_uuid": "sch_asg_97ba6c449a9f",
    "title": "10-A Matematik: Parabol Tepe Noktası & Eksen Kesişim Çizimleri",
    "description": "f(x) = ax² + bx + c fonksiyonlarının tepe noktası (r, k) koordinatlarını bulunuz ve verilen interaktif akıllı tahta üzerinde grafiklerini çiziniz. Problem adımlarını ve simetri eksenini tahtada renkli kalemle belirtiniz.",
    "grade_level": "10. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "Matematik",
    "tool_type": "WHITEBOARD",
    "tool_data": {
      "instructions": "1. Verilen 3 fonksiyonun tepe noktasını hesaplayın.\n2. Tahtayı açarak her grafiği x ve y ekseninde çizin.\n3. Çözümünüzü bitirince 'Ödevi Teslim Et' butonuna basınız."
    },
    "board_uuid": "board_6be7ebed-4c00-4243-9a9b-ffef9933803b",
    "usergroup_ids": [
      6
    ],
    "due_date": "2026-10-12T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 2,
    "created_by": 2,
    "creation_date": "2026-10-01T22:47:16.553688+00:00",
    "update_date": "2026-10-01T22:47:16.553699+00:00"
  },
  {
    "id": 2,
    "assignment_uuid": "sch_asg_17dde0553f25",
    "title": "10-A Fizik: Elektrik Devreleri & Eşdeğer Direnç Analizi",
    "description": "Seri ve paralel bağlı direnç devrelerinde Ohm Yasası (V=I.R) bağıntısını kullanarak kollardan geçen akımları hesaplayınız. Akıllı tahtadaki devre şemasında voltmetre ve ampermetre ölçüm sonuçlarını gösteriniz.",
    "grade_level": "10. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "Fizik",
    "tool_type": "WHITEBOARD",
    "tool_data": {
      "instructions": "Tahtada çizili olan karma devrenin toplam direncini adım adım bulunuz."
    },
    "board_uuid": "board_2aa88e1a-dcc0-451b-9924-4b075f3f8e2e",
    "usergroup_ids": [
      6
    ],
    "due_date": "2026-10-08T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 2,
    "created_by": 2,
    "creation_date": "2026-10-01T22:47:16.553962+00:00",
    "update_date": "2026-10-01T22:47:16.553965+00:00"
  },
  {
    "id": 3,
    "assignment_uuid": "sch_asg_fe34a7446125",
    "title": "10-A Kimya: Kimyasal Türler Arası Etkileşimler ve Lewis Nokta Yapıları",
    "description": "Verilen H2O, NH3, CO2 ve CH4 moleküllerinin Lewis nokta gösterimlerini çıkarınız. Polar ve apolar kovalent bağları açıklayınız. Çözümünüzü metin alanına yazabilir veya çalışma kağıdı fotoğrafını yükleyebilirsiniz.",
    "grade_level": "10. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "Kimya",
    "tool_type": "WORKSHEET",
    "tool_data": {
      "allow_file_upload": true,
      "min_word_count": 100
    },
    "board_uuid": null,
    "usergroup_ids": [
      6
    ],
    "due_date": "2026-10-14T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 2,
    "created_by": 2,
    "creation_date": "2026-10-01T22:47:16.554074+00:00",
    "update_date": "2026-10-01T22:47:16.554077+00:00"
  },
  {
    "id": 4,
    "assignment_uuid": "sch_asg_fed5f539a4ff",
    "title": "10-A Biyoloji: Mayoz Bölünme Evreleri ve Krossing-Over Testi",
    "description": "Profaz-I krossing-over olayının genetik çeşitliliğe etkisini içeren çoktan seçmeli interaktif alıştırma testi. Soruları dikkatlice cevaplayıp testi tamamlayınız.",
    "grade_level": "10. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "Biyoloji",
    "tool_type": "QUIZ",
    "tool_data": {
      "questions": [
        {
          "id": 1,
          "question": "Mayoz bölünmenin hangi evresinde homolog kromozomlar arasında krossing-over gerçekleşir?",
          "options": [
            "Profaz I",
            "Metafaz I",
            "Anafaz II",
            "Telofaz I"
          ],
          "correct_answer": "Profaz I",
          "points": 25
        },
        {
          "id": 2,
          "question": "Homolog kromozomların zıt kutuplara çekildiği evre hangisidir?",
          "options": [
            "Anafaz I",
            "Anafaz II",
            "Metafaz II",
            "Profaz II"
          ],
          "correct_answer": "Anafaz I",
          "points": 25
        },
        {
          "id": 3,
          "question": "2n=46 kromozomlu bir insanda mayoz bölünme sonucu oluşan sperm hücresinin kromozom sayısı kaçtır?",
          "options": [
            "23",
            "46",
            "92",
            "12"
          ],
          "correct_answer": "23",
          "points": 25
        },
        {
          "id": 4,
          "question": "Krossing-over genetik varyasyonu (çeşitliliği) nasıl etkiler?",
          "options": [
            "Artırır",
            "Azaltır",
            "Değiştirmez",
            "Kromozom sayısını yarıya indirir"
          ],
          "correct_answer": "Artırır",
          "points": 25
        }
      ]
    },
    "board_uuid": null,
    "usergroup_ids": [
      6
    ],
    "due_date": "2026-10-10T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 2,
    "created_by": 2,
    "creation_date": "2026-10-01T22:47:16.554159+00:00",
    "update_date": "2026-10-01T22:47:16.554161+00:00"
  },
  {
    "id": 5,
    "assignment_uuid": "sch_asg_5c95b469aec2",
    "title": "10-A Edebiyat: Fuzûlî Su Kasidesi Beyit Şerhi ve Aruz Tahlili",
    "description": "Divan Edebiyatı Su Kasidesi'nin ilk 3 beytini günümüz Türkçesine çeviriniz. Kullanılan mazmunları ve söz sanatlarını (teşbih, istiare, hüsn-i talil) metin analizinde açıklayınız.",
    "grade_level": "10. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "Türk Dili ve Edebiyatı",
    "tool_type": "READING",
    "tool_data": {
      "text_to_read": "Saçma ey göz eşkden gönlümdeki odlara su / Kim bu denlü tutuşan odlara kılmaz çâre su..."
    },
    "board_uuid": null,
    "usergroup_ids": [
      6
    ],
    "due_date": "2026-10-06T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 2,
    "created_by": 2,
    "creation_date": "2026-10-01T22:47:16.554230+00:00",
    "update_date": "2026-10-01T22:47:16.554232+00:00"
  },
  {
    "id": 6,
    "assignment_uuid": "sch_asg_8b38a8cea8c1",
    "title": "11-B İleri Matematik: Fonksiyonlarda Türev Alma ve Teğet Denklemleri",
    "description": "f(x) fonksiyonunun belirli bir noktadaki teğetinin eğimini türev yardımıyla bulunuz ve eğri üzerindeki teğet doğrusunu çiziniz.",
    "grade_level": "11. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "Matematik",
    "tool_type": "WHITEBOARD",
    "tool_data": {},
    "board_uuid": "board_6be7ebed-4c00-4243-9a9b-ffef9933803b",
    "usergroup_ids": [
      7
    ],
    "due_date": "2026-10-15T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 2,
    "created_by": 2,
    "creation_date": "2026-10-01T22:47:16.554298+00:00",
    "update_date": "2026-10-01T22:47:16.554301+00:00"
  },
  {
    "id": 7,
    "assignment_uuid": "sch_asg_b7d2de69d6f7",
    "title": "9-C İngilizce: Reading Comprehension & Environmental Science",
    "description": "Read the article on Climate Change and renewable energy solutions. Write a 150-word summary reflecting your ideas.",
    "grade_level": "9. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "İngilizce",
    "tool_type": "WORKSHEET",
    "tool_data": {},
    "board_uuid": null,
    "usergroup_ids": [
      8
    ],
    "due_date": "2026-10-11T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 2,
    "created_by": 2,
    "creation_date": "2026-10-01T22:47:16.554364+00:00",
    "update_date": "2026-10-01T22:47:16.554366+00:00"
  },
  {
    "id": 12,
    "assignment_uuid": "sch_asg_6c042727f6d5",
    "title": "10-A Matematik: Parabol Tepe Noktası & Eksen Kesişim Çizimleri",
    "description": "f(x) = ax² + bx + c fonksiyonlarının tepe noktası (r, k) koordinatlarını bulunuz ve verilen interaktif akıllı tahta üzerinde grafiklerini çiziniz. Problem adımlarını ve simetri eksenini tahtada renkli kalemle belirtiniz.",
    "grade_level": "10. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "Matematik",
    "tool_type": "WHITEBOARD",
    "tool_data": {
      "instructions": "1. Verilen 3 fonksiyonun tepe noktasını hesaplayın.\n2. Tahtayı açarak her grafiği x ve y ekseninde çizin.\n3. Çözümünüzü bitirince 'Ödevi Teslim Et' butonuna basınız."
    },
    "board_uuid": "board_6be7ebed-4c00-4243-9a9b-ffef9933803b",
    "usergroup_ids": [
      17
    ],
    "due_date": "2026-10-12T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 1,
    "created_by": 2,
    "creation_date": "2026-10-02T09:21:37.318492",
    "update_date": "2026-10-02T09:21:37.318496"
  },
  {
    "id": 13,
    "assignment_uuid": "sch_asg_49cc0ab67dc6",
    "title": "10-A Fizik: Elektrik Devreleri & Eşdeğer Direnç Analizi",
    "description": "Seri ve paralel bağlı direnç devrelerinde Ohm Yasası (V=I.R) bağıntısını kullanarak kollardan geçen akımları hesaplayınız. Akıllı tahtadaki devre şemasında voltmetre ve ampermetre ölçüm sonuçlarını gösteriniz.",
    "grade_level": "10. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "Fizik",
    "tool_type": "WHITEBOARD",
    "tool_data": {
      "instructions": "Tahtada çizili olan karma devrenin toplam direncini adım adım bulunuz."
    },
    "board_uuid": "board_2aa88e1a-dcc0-451b-9924-4b075f3f8e2e",
    "usergroup_ids": [
      17
    ],
    "due_date": "2026-10-08T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 1,
    "created_by": 2,
    "creation_date": "2026-10-02T09:21:37.319792",
    "update_date": "2026-10-02T09:21:37.319795"
  },
  {
    "id": 14,
    "assignment_uuid": "sch_asg_7cb1923faa37",
    "title": "10-A Kimya: Kimyasal Türler Arası Etkileşimler ve Lewis Nokta Yapıları",
    "description": "Verilen H2O, NH3, CO2 ve CH4 moleküllerinin Lewis nokta gösterimlerini çıkarınız. Polar ve apolar kovalent bağları açıklayınız. Çözümünüzü metin alanına yazabilir veya çalışma kağıdı fotoğrafını yükleyebilirsiniz.",
    "grade_level": "10. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "Kimya",
    "tool_type": "WORKSHEET",
    "tool_data": {
      "allow_file_upload": true,
      "min_word_count": 100
    },
    "board_uuid": null,
    "usergroup_ids": [
      17
    ],
    "due_date": "2026-10-14T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 1,
    "created_by": 2,
    "creation_date": "2026-10-02T09:21:37.320869",
    "update_date": "2026-10-02T09:21:37.320872"
  },
  {
    "id": 15,
    "assignment_uuid": "sch_asg_49c15d67e9c4",
    "title": "10-A Biyoloji: Mayoz Bölünme Evreleri ve Krossing-Over Testi",
    "description": "Profaz-I krossing-over olayının genetik çeşitliliğe etkisini içeren çoktan seçmeli interaktif alıştırma testi. Soruları dikkatlice cevaplayıp testi tamamlayınız.",
    "grade_level": "10. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "Biyoloji",
    "tool_type": "QUIZ",
    "tool_data": {
      "questions": [
        {
          "id": 1,
          "question": "Mayoz bölünmenin hangi evresinde homolog kromozomlar arasında krossing-over gerçekleşir?",
          "options": [
            "Profaz I",
            "Metafaz I",
            "Anafaz II",
            "Telofaz I"
          ],
          "correct_answer": "Profaz I",
          "points": 25
        },
        {
          "id": 2,
          "question": "Homolog kromozomların zıt kutuplara çekildiği evre hangisidir?",
          "options": [
            "Anafaz I",
            "Anafaz II",
            "Metafaz II",
            "Profaz II"
          ],
          "correct_answer": "Anafaz I",
          "points": 25
        },
        {
          "id": 3,
          "question": "2n=46 kromozomlu bir insanda mayoz bölünme sonucu oluşan sperm hücresinin kromozom sayısı kaçtır?",
          "options": [
            "23",
            "46",
            "92",
            "12"
          ],
          "correct_answer": "23",
          "points": 25
        },
        {
          "id": 4,
          "question": "Krossing-over genetik varyasyonu (çeşitliliği) nasıl etkiler?",
          "options": [
            "Artırır",
            "Azaltır",
            "Değiştirmez",
            "Kromozom sayısını yarıya indirir"
          ],
          "correct_answer": "Artırır",
          "points": 25
        }
      ]
    },
    "board_uuid": null,
    "usergroup_ids": [
      17
    ],
    "due_date": "2026-10-10T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 1,
    "created_by": 2,
    "creation_date": "2026-10-02T09:21:37.321781",
    "update_date": "2026-10-02T09:21:37.321783"
  },
  {
    "id": 16,
    "assignment_uuid": "sch_asg_9f7ccd4a0916",
    "title": "10-A Edebiyat: Fuzûlî Su Kasidesi Beyit Şerhi ve Aruz Tahlili",
    "description": "Divan Edebiyatı Su Kasidesi'nin ilk 3 beytini günümüz Türkçesine çeviriniz. Kullanılan mazmunları ve söz sanatlarını (teşbih, istiare, hüsn-i talil) metin analizinde açıklayınız.",
    "grade_level": "10. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "Türk Dili ve Edebiyatı",
    "tool_type": "READING",
    "tool_data": {
      "text_to_read": "Saçma ey göz eşkden gönlümdeki odlara su / Kim bu denlü tutuşan odlara kılmaz çâre su..."
    },
    "board_uuid": null,
    "usergroup_ids": [
      17
    ],
    "due_date": "2026-10-06T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 1,
    "created_by": 2,
    "creation_date": "2026-10-02T09:21:37.322882",
    "update_date": "2026-10-02T09:21:37.322884"
  },
  {
    "id": 17,
    "assignment_uuid": "sch_asg_2a7ff6b15196",
    "title": "11-B İleri Matematik: Fonksiyonlarda Türev Alma ve Teğet Denklemleri",
    "description": "f(x) fonksiyonunun belirli bir noktadaki teğetinin eğimini türev yardımıyla bulunuz ve eğri üzerindeki teğet doğrusunu çiziniz.",
    "grade_level": "11. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "Matematik",
    "tool_type": "WHITEBOARD",
    "tool_data": {},
    "board_uuid": "board_6be7ebed-4c00-4243-9a9b-ffef9933803b",
    "usergroup_ids": [
      17
    ],
    "due_date": "2026-10-15T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 1,
    "created_by": 2,
    "creation_date": "2026-10-02T09:21:37.323891",
    "update_date": "2026-10-02T09:21:37.323893"
  },
  {
    "id": 18,
    "assignment_uuid": "sch_asg_b23345149906",
    "title": "9-C İngilizce: Reading Comprehension & Environmental Science",
    "description": "Read the article on Climate Change and renewable energy solutions. Write a 150-word summary reflecting your ideas.",
    "grade_level": "9. Sınıf",
    "grade_category": "Lise (9-12)",
    "subject": "İngilizce",
    "tool_type": "WORKSHEET",
    "tool_data": {},
    "board_uuid": null,
    "usergroup_ids": [
      17
    ],
    "due_date": "2026-10-11T23:59:00",
    "max_score": 100,
    "published": true,
    "org_id": 1,
    "created_by": 2,
    "creation_date": "2026-10-02T09:21:37.324966",
    "update_date": "2026-10-02T09:21:37.324968"
  }
];

export const SYNCED_DISCUSSIONS = [
  {
    "id": 16,
    "discussion_uuid": "discussion_89cc3c1e-c1c6-4f0f-a3eb-1ce45836969a",
    "title": "10-A Sınıf Ailemize Hoş Geldiniz — Veli İletişim İlkeleri",
    "content": "Kıymetli Velilerimiz ve Sevgili Öğrencilerimiz,\n\nAtatürk Fen ve Anadolu Lisesi 10-A Fen ve Matematik Şubesi resmi dijital topluluk alanımıza hoş geldiniz.\n\nBu forum alanı; velilerimiz, öğretmenlerimiz ve okul yönetimimiz arasında şeffaf, yapıcı ve hızlı bir iletişim köprüsü kurmak amacıyla oluşturulmuştur. Sınıf etkinlikleri, ortak projeler, akademik başarı değerlendirmeleri ve duyurular düzenli olarak buradan paylaşılacaktır.\n\nSağlıklı, başarılı ve huzurlu bir eğitim-öğretim yılı dileriz.",
    "label": "announcement",
    "emoji": "👋",
    "org_id": 1,
    "author_id": 2,
    "upvote_count": 35,
    "is_pinned": true,
    "is_locked": false,
    "creation_date": "2026-10-02T09:21:37.336739",
    "update_date": "2026-10-02T09:21:37.336741"
  },
  {
    "id": 12,
    "discussion_uuid": "discussion_7ab0e601-fa0f-41c8-8004-36ed7282d90a",
    "title": "1. Dönem Veli Bilgilendirme Toplantısı Tarihi ve Görüşme Saatleri",
    "content": "Değerli 10-A Sınıfı Velilerimiz,\n\n1. Dönem 1. Ara Dönem Veli Bilgilendirme Toplantımız 18 Ekim Cumartesi günü saat 13:30'da okulumuz konferans salonunda genel bilgilendirme ile başlayacak, ardından 10-A dersliğinde sınıf rehber öğretmenimiz Ahmet Yılmaz ve branş öğretmenlerimizle birebir görüşmelerle devam edecektir.\n\nGündem Maddeleri:\n1. Öğrencilerin 10. sınıf müfredatına ve YKS temel hazırlığına uyum süreci\n2. Akıllı tahta panoları ve dijital ödev takip sisteminin kullanımı\n3. 1. Dönem ortak yazılı sınav takvimi ve çalışma planı\n\nKatılım durumunuzu bu başlık altından veya sınıf temsilcimize iletmenizi rica ederiz.",
    "label": "announcement",
    "emoji": "📢",
    "org_id": 1,
    "author_id": 2,
    "upvote_count": 24,
    "is_pinned": true,
    "is_locked": false,
    "creation_date": "2026-10-02T09:21:37.326936",
    "update_date": "2026-10-02T09:21:37.326938"
  },
  {
    "id": 11,
    "discussion_uuid": "discussion_625e79b1-a89e-491f-a521-bdf2e407a3be",
    "title": "10-A Sınıf Ailemize Hoş Geldiniz — Veli İletişim İlkeleri",
    "content": "Kıymetli Velilerimiz ve Sevgili Öğrencilerimiz,\n\nAtatürk Fen ve Anadolu Lisesi 10-A Fen ve Matematik Şubesi resmi dijital topluluk alanımıza hoş geldiniz.\n\nBu forum alanı; velilerimiz, öğretmenlerimiz ve okul yönetimimiz arasında şeffaf, yapıcı ve hızlı bir iletişim köprüsü kurmak amacıyla oluşturulmuştur. Sınıf etkinlikleri, ortak projeler, akademik başarı değerlendirmeleri ve duyurular düzenli olarak buradan paylaşılacaktır.\n\nSağlıklı, başarılı ve huzurlu bir eğitim-öğretim yılı dileriz.",
    "label": "announcement",
    "emoji": "👋",
    "org_id": 2,
    "author_id": 4,
    "upvote_count": 35,
    "is_pinned": true,
    "is_locked": false,
    "creation_date": "2026-09-01 10:00:00",
    "update_date": "2026-09-01 10:00:00"
  },
  {
    "id": 7,
    "discussion_uuid": "discussion_be8ff689-1cde-4111-af21-46e7f33bfd40",
    "title": "1. Dönem Veli Bilgilendirme Toplantısı Tarihi ve Görüşme Saatleri",
    "content": "Değerli 10-A Sınıfı Velilerimiz,\n\n1. Dönem 1. Ara Dönem Veli Bilgilendirme Toplantımız 18 Ekim Cumartesi günü saat 13:30'da okulumuz konferans salonunda genel bilgilendirme ile başlayacak, ardından 10-A dersliğinde sınıf rehber öğretmenimiz Ahmet Yılmaz ve branş öğretmenlerimizle birebir görüşmelerle devam edecektir.\n\nGündem Maddeleri:\n1. Öğrencilerin 10. sınıf müfredatına ve YKS temel hazırlığına uyum süreci\n2. Akıllı tahta panoları ve dijital ödev takip sisteminin kullanımı\n3. 1. Dönem ortak yazılı sınav takvimi ve çalışma planı\n\nKatılım durumunuzu bu başlık altından veya sınıf temsilcimize iletmenizi rica ederiz.",
    "label": "announcement",
    "emoji": "📢",
    "org_id": 2,
    "author_id": 4,
    "upvote_count": 24,
    "is_pinned": true,
    "is_locked": false,
    "creation_date": "2026-09-29 10:00:00",
    "update_date": "2026-09-29 10:00:00"
  },
  {
    "id": 15,
    "discussion_uuid": "discussion_01997e20-0cac-4c8d-9398-3af3536fcdfa",
    "title": "Okul Çıkış Saatleri, Servis Güzergahları ve Güvenlik Hatırlatması",
    "content": "Değerli Velilerimiz,\n\nOkul çıkış saatimiz 16:10 olup servis araçlarımız 16:25'te okul bahçesinden hareket etmektedir. Öğrencilerimizin okul çıkışında güvenliği için nöbetçi öğretmenlerimiz ve servis hosteslerimiz eşlik etmektedir.\n\nÖğrencisini kendi aracıyla alacak velilerimizin okul giriş kapısındaki trafiği aksatmamak adına belirlenen indirme-bindirme cebini kullanmalarını önemle rica ederiz.",
    "label": "question",
    "emoji": "🚌",
    "org_id": 1,
    "author_id": 2,
    "upvote_count": 13,
    "is_pinned": false,
    "is_locked": false,
    "creation_date": "2026-10-02T09:21:37.335691",
    "update_date": "2026-10-02T09:21:37.335693"
  },
  {
    "id": 14,
    "discussion_uuid": "discussion_e31dc401-a4ab-4ae2-8160-9f1233f40046",
    "title": "TÜBİTAK 4006 Bilim Fuarı 10-A Sınıfı Proje Takımları",
    "content": "Okulumuzun mayıs ayında sergileyeceği Bilim Fuarı için 10-A Fen şubemizden 4 farklı araştırma takımı oluşturuyoruz:\n\n• Yenilenebilir Enerji ve Akıllı Güneş Takip Sistemi\n• Biyoloji: Doğal Bitki Özütlerinin Antibakteriyel Etkisi\n• Yapay Zeka ile Matematiksel Modelleme\n• Kimya: Atık Yağlardan Biyodizel Üretimi\n\nProjelerde yer almak isteyen öğrencilerimiz cuma gününe kadar proje taslak formlarını teslim edebilirler.",
    "label": "idea",
    "emoji": "🔬",
    "org_id": 1,
    "author_id": 2,
    "upvote_count": 15,
    "is_pinned": false,
    "is_locked": false,
    "creation_date": "2026-10-02T09:21:37.334570",
    "update_date": "2026-10-02T09:21:37.334573"
  },
  {
    "id": 13,
    "discussion_uuid": "discussion_fc3093a0-d699-4933-9264-e1db50f19c9b",
    "title": "1. Dönem Ortak Sınav Konu Dağılımları ve Akıllı Tahta Notları",
    "content": "Sayın velilerimiz ve öğrencilerimiz,\n\nKasım ayının ilk haftası gerçekleştirilecek olan 1. Ortak Yazılı Sınav konu dağılım tabloları MEB kazanımlarına göre panolara işlenmiştir. Özellikle Matematik (Parabol grafikleri, tepe noktası) ve Fizik (Elektrik devreleri ve Kirchhoff kuralları) konuları için öğretmenlerimizin tahtada hazırladığı interaktif şemaları 'Panolar' sekmesinden favorilere ekleyip düzenli tekrar etmeniz önerilir.",
    "label": "showcase",
    "emoji": "📝",
    "org_id": 1,
    "author_id": 2,
    "upvote_count": 18,
    "is_pinned": false,
    "is_locked": false,
    "creation_date": "2026-10-02T09:21:37.333433",
    "update_date": "2026-10-02T09:21:37.333436"
  },
  {
    "id": 10,
    "discussion_uuid": "discussion_4f4bd58b-ece5-4786-be7a-ca6c7096f4fc",
    "title": "Okul Çıkış Saatleri, Servis Güzergahları ve Güvenlik Hatırlatması",
    "content": "Değerli Velilerimiz,\n\nOkul çıkış saatimiz 16:10 olup servis araçlarımız 16:25'te okul bahçesinden hareket etmektedir. Öğrencilerimizin okul çıkışında güvenliği için nöbetçi öğretmenlerimiz ve servis hosteslerimiz eşlik etmektedir.\n\nÖğrencisini kendi aracıyla alacak velilerimizin okul giriş kapısındaki trafiği aksatmamak adına belirlenen indirme-bindirme cebini kullanmalarını önemle rica ederiz.",
    "label": "question",
    "emoji": "🚌",
    "org_id": 2,
    "author_id": 21,
    "upvote_count": 13,
    "is_pinned": false,
    "is_locked": false,
    "creation_date": "2026-09-17 10:00:00",
    "update_date": "2026-09-17 10:00:00"
  },
  {
    "id": 9,
    "discussion_uuid": "discussion_160a7479-69b8-435b-8d0b-ff674a5e6192",
    "title": "TÜBİTAK 4006 Bilim Fuarı 10-A Sınıfı Proje Takımları",
    "content": "Okulumuzun mayıs ayında sergileyeceği Bilim Fuarı için 10-A Fen şubemizden 4 farklı araştırma takımı oluşturuyoruz:\n\n• Yenilenebilir Enerji ve Akıllı Güneş Takip Sistemi\n• Biyoloji: Doğal Bitki Özütlerinin Antibakteriyel Etkisi\n• Yapay Zeka ile Matematiksel Modelleme\n• Kimya: Atık Yağlardan Biyodizel Üretimi\n\nProjelerde yer almak isteyen öğrencilerimiz cuma gününe kadar proje taslak formlarını teslim edebilirler.",
    "label": "idea",
    "emoji": "🔬",
    "org_id": 2,
    "author_id": 12,
    "upvote_count": 15,
    "is_pinned": false,
    "is_locked": false,
    "creation_date": "2026-09-22 10:00:00",
    "update_date": "2026-09-22 10:00:00"
  },
  {
    "id": 8,
    "discussion_uuid": "discussion_a0494898-4ce9-4c53-b91f-b2ad25edb89d",
    "title": "1. Dönem Ortak Sınav Konu Dağılımları ve Akıllı Tahta Notları",
    "content": "Sayın velilerimiz ve öğrencilerimiz,\n\nKasım ayının ilk haftası gerçekleştirilecek olan 1. Ortak Yazılı Sınav konu dağılım tabloları MEB kazanımlarına göre panolara işlenmiştir. Özellikle Matematik (Parabol grafikleri, tepe noktası) ve Fizik (Elektrik devreleri ve Kirchhoff kuralları) konuları için öğretmenlerimizin tahtada hazırladığı interaktif şemaları 'Panolar' sekmesinden favorilere ekleyip düzenli tekrar etmeniz önerilir.",
    "label": "showcase",
    "emoji": "📝",
    "org_id": 2,
    "author_id": 8,
    "upvote_count": 18,
    "is_pinned": false,
    "is_locked": false,
    "creation_date": "2026-09-26 10:00:00",
    "update_date": "2026-09-26 10:00:00"
  }
];

export function getSyncedGamesStore(
  orgSlugOrIdOrParams?: string | number | { category_slug?: string; grade_level?: string; search?: string },
  categorySlugOrParams?: string | { category_slug?: string; grade_level?: string; search?: string }
): GamesStoreResponse {
  let categorySlug: string | undefined
  let gradeLevel: string | undefined
  let search: string | undefined

  if (typeof orgSlugOrIdOrParams === 'object' && orgSlugOrIdOrParams !== null) {
    categorySlug = orgSlugOrIdOrParams.category_slug
    gradeLevel = orgSlugOrIdOrParams.grade_level
    search = orgSlugOrIdOrParams.search
  } else if (typeof categorySlugOrParams === 'object' && categorySlugOrParams !== null) {
    categorySlug = categorySlugOrParams.category_slug
    gradeLevel = categorySlugOrParams.grade_level
    search = categorySlugOrParams.search
  } else if (typeof categorySlugOrParams === 'string') {
    categorySlug = categorySlugOrParams
  }

  let filtered = [...SYNCED_GAMES]
  if (categorySlug && categorySlug !== 'all') {
    if (categorySlug === '3d-simulasyon') {
      filtered = filtered.filter(g => g.is_3d_simulation || (g.category_ids && g.category_ids.includes(8)))
    } else {
      const cat = SYNCED_CATEGORIES.find(c => c.slug === categorySlug)
      if (cat) {
        filtered = filtered.filter(g => g.category_id === cat.id || (g.category_ids && g.category_ids.includes(cat.id)))
      }
    }
  }

  if (gradeLevel && gradeLevel !== 'all') {
    filtered = filtered.filter(g => g.grade_levels && g.grade_levels.some(gl => gl.includes(gradeLevel!)))
  }

  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(g => (g.title && g.title.toLowerCase().includes(s)) || (g.description && g.description.toLowerCase().includes(s)))
  }

  const featured = SYNCED_GAMES.filter(g => g.is_featured).sort((a, b) => a.featured_order - b.featured_order)

  // Sliders
  const sliders: any[] = []
  for (const cat of SYNCED_CATEGORIES) {
    const catGames = SYNCED_GAMES.filter(g => g.category_id === cat.id || (g.category_ids && g.category_ids.includes(cat.id)))
    if (catGames.length > 0) {
      sliders.push({
        category: cat,
        games: catGames,
      })
    }
  }

  return {
    categories: SYNCED_CATEGORIES,
    featured,
    sliders,
    all_games: filtered,
    total_count: filtered.length,
  }
}

export function getSyncedGamePlay(identifier: string): GamePlayResponse {
  const game = SYNCED_GAMES.find(g => g.game_uuid === identifier || g.slug === identifier || String(g.id) === identifier) || SYNCED_GAMES[0]
  const gameSlug = game.slug || 'orbit'
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${game.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #020617; }
    iframe { width: 100%; height: 100%; border: none; display: block; }
  </style>
</head>
<body>
  <iframe src="/games/${gameSlug}.html" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>
</body>
</html>`

  return {
    game,
    html_content: html,
  }
}

export function getSyncedSuperadminOrgs(page = 1, limit = 20, search = '', plan = '') {
  let items = SYNCED_ORGANIZATIONS.map(o => ({
    ...o,
    user_count: o.slug === 'demo' ? 44 : (o.slug === 'default' ? 18 : 12),
    course_count: o.slug === 'demo' ? 6 : (o.slug === 'default' ? 4 : 2),
    plan: o.slug === 'demo' ? 'enterprise' : (o.slug === 'default' ? 'pro' : 'standard'),
    active: true,
    custom_domains: [] as string[],
    admin_users: [
      {
        username: o.slug === 'default' ? 'admin' : 'idare',
        email: o.slug === 'default' ? 'admin@oxonom.com' : 'idare@oxonom.com',
        avatar_image: null,
        user_uuid: o.slug === 'default' ? 'user_da7162b6-2ad4-4061-bbb4-37157ddb6462' : 'user_64e03f9b-6734-414a-9775-f87f52dae15d'
      }
    ]
  }))

  if (search) {
    const s = search.toLowerCase()
    items = items.filter(o => o.name.toLowerCase().includes(s) || o.slug.toLowerCase().includes(s))
  }
  if (plan && plan !== 'all') {
    items = items.filter(o => o.plan === plan)
  }

  const offset = (page - 1) * limit
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    page,
    limit,
  }
}

export function getSyncedSuperadminVisits() {
  const dates = []
  const now = new Date()
  for (let i = 14; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    dates.push(d.toISOString().slice(0, 10))
  }

  const rows: any[] = []
  for (const org of SYNCED_ORGANIZATIONS) {
    for (const dt of dates) {
      const base = org.slug === 'demo' ? 85 : 40
      const jitter = Math.floor(Math.sin(org.id * 10 + dates.indexOf(dt)) * 20 + 25)
      rows.push({
        org_id: org.id,
        date: dt,
        views: Math.max(10, base + jitter),
      })
    }
  }
  return { data: rows }
}

export function getSyncedSuperadminUsers(page = 1, limit = 20, search = '', superadmin = '') {
  let items = [...SYNCED_USERS]
  if (search) {
    const s = search.toLowerCase()
    items = items.filter(u => 
      (u.username && u.username.toLowerCase().includes(s)) ||
      (u.email && u.email.toLowerCase().includes(s)) ||
      (u.first_name && u.first_name.toLowerCase().includes(s)) ||
      (u.last_name && u.last_name.toLowerCase().includes(s))
    )
  }
  if (superadmin === 'yes') {
    items = items.filter(u => u.is_superadmin)
  } else if (superadmin === 'no') {
    items = items.filter(u => !u.is_superadmin)
  }

  const offset = (page - 1) * limit
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    page,
    limit,
  }
}

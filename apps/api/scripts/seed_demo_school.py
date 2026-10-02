import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone

# Add apps/api to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, delete
from config.config import get_learnhouse_config

from src.db.users import User
from src.db.organizations import Organization
from src.db.organization_config import OrganizationConfig
from src.db.user_organizations import UserOrganization
from src.db.roles import Role
from src.db.usergroups import UserGroup
from src.db.usergroup_user import UserGroupUser
from src.db.boards import Board, BoardMember, BoardMemberRole
from src.db.courses.courses import Course
from src.db.courses.chapters import Chapter
from src.db.courses.activities import Activity
from src.db.courses.assignments import (
    Assignment,
    AssignmentTask,
    AssignmentTaskTypeEnum,
    GradingTypeEnum,
    AssignmentUserSubmission,
    AssignmentUserSubmissionStatus,
)
from src.db.resource_authors import ResourceAuthor, ResourceAuthorshipEnum, ResourceAuthorshipStatusEnum

def _to_async_url(url: str) -> str:
    if "+asyncpg" in url:
        return url
    return url.replace("postgresql://", "postgresql+asyncpg://")

def _now():
    return datetime.now(timezone.utc).isoformat()

def _future(days: int):
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()

def _past(days: int):
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

async def seed_demo():
    print("🚀 Demo Okul & Hesap Verilerini Birbirine Bağlama Başlıyor...")
    cfg = get_learnhouse_config()
    engine = create_async_engine(_to_async_url(cfg.database_config.sql_connection_string))
    
    async with AsyncSession(engine, expire_on_commit=False) as db:
        # 1. Organization (Demo Okul)
        org = (await db.exec(select(Organization).where(Organization.slug == "demo"))).first()
        if not org:
            print("Demo organizasyonu bulunamadı, oluşturuluyor...")
            org = Organization(
                name="Atatürk Fen ve Anadolu Lisesi",
                slug="demo",
                description="Oxonom Edu Dijital Eğitim & Akıllı Okul Portalı",
                about="Atatürk Fen ve Anadolu Lisesi resmi dijital kampüsü. Akıllı tahtalar, ders içerikleri, ödevler ve veli-öğrenci takip sistemi.",
                email="idare@oxonom.com",
                creation_date=_now(),
                update_date=_now(),
            )
            db.add(org)
            await db.commit()
            await db.refresh(org)
        else:
            org.name = "Atatürk Fen ve Anadolu Lisesi"
            org.description = "Oxonom Edu Dijital Eğitim & Akıllı Okul Portalı"
            org.about = "Atatürk Fen ve Anadolu Lisesi resmi dijital kampüsü. Akıllı tahtalar, ders içerikleri, ödevler ve veli-öğrenci takip sistemi."
            org.email = "idare@oxonom.com"
            org.update_date = _now()
            db.add(org)
            await db.commit()

        print(f"✅ Demo Okul: {org.name} (slug={org.slug}, id={org.id})")

        # 2. OrganizationConfig (Tüm modülleri aktif yap)
        cfg_entry = (await db.exec(select(OrganizationConfig).where(OrganizationConfig.org_id == org.id))).first()
        config_payload = {
            "active": True,
            "school_type": "high_school",
            "principal_name": "Mehmet Özkan",
            "contact_phone": "+90 212 555 0101",
            "address": "Atatürk Bulvarı No: 104, Beşiktaş / İstanbul",
            "features": {
                "boards": {"enabled": True},
                "assignments": {"enabled": True},
                "classes": {"enabled": True},
                "courses": {"enabled": True},
                "ai": {"enabled": True},
                "podcasts": {"enabled": True},
                "community": {"enabled": True},
            },
            "cloud": {"plan": "enterprise"},
            "plan": "enterprise",
        }
        if cfg_entry:
            cfg_entry.config = config_payload
            db.add(cfg_entry)
        else:
            cfg_entry = OrganizationConfig(org_id=org.id, config=config_payload)
            db.add(cfg_entry)
        await db.commit()
        print("✅ Okul Yapılandırması ve Tüm Modüller Aktifleştirildi.")

        # 3. Roles
        roles = (await db.exec(select(Role))).all()
        admin_role = next((r for r in roles if r.name == "Admin"), None)
        instructor_role = next((r for r in roles if r.name == "Instructor"), None)
        user_role = next((r for r in roles if r.name == "User"), None)

        # 4. Users (Müdür, Öğretmen, Öğrenci)
        # 4.1. Müdür (idare@oxonom.com)
        admin_user = (await db.exec(select(User).where(User.email == "idare@oxonom.com"))).first()
        if admin_user:
            admin_user.first_name = "Mehmet"
            admin_user.last_name = "Özkan (Müdür)"
            admin_user.bio = "Okul Müdürü & Kurucu Temsilcisi | Atatürk Fen ve Anadolu Lisesi"
            admin_user.email_verified = True
            db.add(admin_user)
            await db.commit()
            
            # Ensure Admin role in demo org
            admin_uo = (await db.exec(select(UserOrganization).where(
                UserOrganization.user_id == admin_user.id,
                UserOrganization.org_id == org.id
            ))).first()
            if not admin_uo:
                db.add(UserOrganization(user_id=admin_user.id, org_id=org.id, role_id=admin_role.id))
            else:
                admin_uo.role_id = admin_role.id
                db.add(admin_uo)
            await db.commit()
            print(f"✅ Müdür Hesabı Bağlandı: {admin_user.first_name} {admin_user.last_name} ({admin_user.email}) -> Rol: Okul Müdürü")

        # 4.2. Öğretmen (ogretmen@oxonom.com)
        teacher_user = (await db.exec(select(User).where(User.email == "ogretmen@oxonom.com"))).first()
        if teacher_user:
            teacher_user.first_name = "Ahmet"
            teacher_user.last_name = "Yılmaz (Öğretmen)"
            teacher_user.bio = "Matematik & Fen Bilimleri Zümre Başkanı | 10-A Sınıf Rehber Öğretmeni"
            teacher_user.email_verified = True
            db.add(teacher_user)
            await db.commit()

            teacher_uo = (await db.exec(select(UserOrganization).where(
                UserOrganization.user_id == teacher_user.id,
                UserOrganization.org_id == org.id
            ))).first()
            if not teacher_uo:
                db.add(UserOrganization(user_id=teacher_user.id, org_id=org.id, role_id=instructor_role.id))
            else:
                teacher_uo.role_id = instructor_role.id
                db.add(teacher_uo)
            await db.commit()
            print(f"✅ Öğretmen Hesabı Bağlandı: {teacher_user.first_name} {teacher_user.last_name} ({teacher_user.email}) -> Rol: Öğretmen (Instructor)")

        # 4.3. Öğrenci (ogrenci@oxonom.com)
        student_user = (await db.exec(select(User).where(User.email == "ogrenci@oxonom.com"))).first()
        if student_user:
            student_user.first_name = "Emre"
            student_user.last_name = "Demir (Öğrenci)"
            student_user.bio = "10-A Fen ve Matematik Şubesi Öğrencisi | No: 412"
            student_user.email_verified = True
            db.add(student_user)
            await db.commit()

            student_uo = (await db.exec(select(UserOrganization).where(
                UserOrganization.user_id == student_user.id,
                UserOrganization.org_id == org.id
            ))).first()
            if not student_uo:
                db.add(UserOrganization(user_id=student_user.id, org_id=org.id, role_id=user_role.id))
            else:
                student_uo.role_id = user_role.id
                db.add(student_uo)
            await db.commit()
            print(f"✅ Öğrenci Hesabı Bağlandı: {student_user.first_name} {student_user.last_name} ({student_user.email}) -> Rol: Öğrenci (User)")

        # Sınıf Arkadaşları Türkçeleştirme
        turkish_names = [
            ("Ali", "Kaya"), ("Zeynep", "Çelik"), ("Can", "Yılmaz"), ("Elif", "Demir"),
            ("Burak", "Şahin"), ("Ayşe", "Öztürk"), ("Mehmet", "Aydın"), ("Fatma", "Arslan"),
            ("Kerem", "Koç"), ("Selin", "Kurt"), ("Deniz", "Yıldız"), ("Ece", "Güneş"),
            ("Umut", "Yavuz"), ("İrem", "Korkmaz"), ("Oğuz", "Polat"), ("Ceren", "Erdoğan"),
            ("Berk", "Tekin"), ("Derya", "Bulut"), ("Kaan", "Bozkurt"), ("Merve", "Aksoy"),
        ]
        other_students = (await db.exec(select(User).where(
            User.email.not_in(["idare@oxonom.com", "ogretmen@oxonom.com", "ogrenci@oxonom.com", "admin@oxonom.com"])
        ))).all()
        for idx, u in enumerate(other_students[:len(turkish_names)]):
            fn, ln = turkish_names[idx]
            u.first_name = fn
            u.last_name = ln
            u.email_verified = True
            db.add(u)
            # Ensure in demo org
            uo = (await db.exec(select(UserOrganization).where(UserOrganization.user_id == u.id, UserOrganization.org_id == org.id))).first()
            if not uo:
                db.add(UserOrganization(user_id=u.id, org_id=org.id, role_id=user_role.id))
        await db.commit()

        # 5. Sınıflar (UserGroups)
        # Sınıf 1: 10-A
        classes_data = [
            {
                "id": 1,
                "name": "10-A Fen ve Matematik Şubesi",
                "grade_level": "10. Sınıf",
                "join_code": "FEN-10A",
                "description": "Rehber Öğretmen: Ahmet Yılmaz. Sayısal ağırlıklı fen ve matematik şubesi.",
            },
            {
                "id": 2,
                "name": "11-B İleri Sayısal Şubesi",
                "grade_level": "11. Sınıf",
                "join_code": "SAY-11B",
                "description": "Rehber Öğretmen: Ahmet Yılmaz. İleri düzey matematik ve fizik hazırlık şubesi.",
            },
            {
                "id": 3,
                "name": "9-C Anadolu Şubesi",
                "grade_level": "9. Sınıf",
                "join_code": "AND-9C",
                "description": "Lise uyum ve temel fen-sosyal bilimler başlangıç şubesi.",
            },
        ]
        usergroup_map = {}
        for cdata in classes_data:
            ug = (await db.exec(select(UserGroup).where(UserGroup.id == cdata["id"]))).first()
            if not ug:
                ug = (await db.exec(select(UserGroup).where(UserGroup.name == cdata["name"], UserGroup.org_id == org.id))).first()
            if ug:
                ug.name = cdata["name"]
                ug.grade_level = cdata["grade_level"]
                ug.join_code = cdata["join_code"]
                ug.description = cdata["description"]
                ug.org_id = org.id
                db.add(ug)
            else:
                ug = UserGroup(
                    name=cdata["name"],
                    grade_level=cdata["grade_level"],
                    join_code=cdata["join_code"],
                    description=cdata["description"],
                    org_id=org.id,
                    creation_date=_now(),
                    update_date=_now(),
                )
                db.add(ug)
            await db.commit()
            await db.refresh(ug)
            usergroup_map[cdata["name"]] = ug
            print(f"✅ Sınıf Hazır: {ug.name} (Kod: {ug.join_code}, ID={ug.id})")

        target_class = usergroup_map["10-A Fen ve Matematik Şubesi"]

        # 6. Sınıf Öğrenci Kaydı (ogrenci@oxonom.com must be in 10-A!)
        # Check ogrenci in 10-A
        existing_mem = (await db.exec(select(UserGroupUser).where(
            UserGroupUser.user_id == student_user.id,
            UserGroupUser.usergroup_id == target_class.id
        ))).first()
        if not existing_mem:
            db.add(UserGroupUser(user_id=student_user.id, usergroup_id=target_class.id, org_id=org.id, creation_date=_now()))
            print(f"✅ Demo Öğrenci ({student_user.email}) -> 10-A Fen ve Matematik Şubesine Kaydedildi!")

        # Add classmates to 10-A
        for u in other_students[:18]:
            mem = (await db.exec(select(UserGroupUser).where(UserGroupUser.user_id == u.id, UserGroupUser.usergroup_id == target_class.id))).first()
            if not mem:
                db.add(UserGroupUser(user_id=u.id, usergroup_id=target_class.id, org_id=org.id, creation_date=_now()))
        await db.commit()

        # 7. Akıllı Tahtalar / Panolar (Boards)
        # Delete obsolete English template boards for this org
        obsolete_boards = (await db.exec(select(Board).where(
            Board.org_id == org.id,
            Board.name.in_(["Quarterly retro", "Onboarding journey map", "Support escalation playbook"])
        ))).all()
        for ob in obsolete_boards:
            await db.delete(ob)
        await db.commit()

        boards_bundle_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src", "services", "demo", "bundle", "boards"))

        boards_data = [
            {
                "file": "matematik-parabol.ydoc",
                "board_uuid": "board_10a00000-0000-4000-8000-000000000001",
                "name": "10-A Matematik: Fonksiyon Grafikleri & Parabol Çizimleri",
                "description": "Parabol tepe noktası, kökler ve fonksiyon dönüşümleri ders anlatım tahtası.",
                "usergroup_id": target_class.id,
                "public": True,
            },
            {
                "file": "fizik-devreler.ydoc",
                "board_uuid": "board_10a00000-0000-4000-8000-000000000002",
                "name": "Fizik Laboratuvarı: Elektrik Devreleri & Eşdeğer Direnç",
                "description": "Seri-paralel bağlama devre şemaları, Kirchoff kuralları akıllı tahta çizimleri.",
                "usergroup_id": target_class.id,
                "public": True,
            },
            {
                "file": "kimya-lewis.ydoc",
                "board_uuid": "board_10a00000-0000-4000-8000-000000000003",
                "name": "Kimya: Periyodik Tablo ve Lewis Yapıları Çizim Tahtası",
                "description": "İyonik ve kovalent bağ modelleri, atom yarıçapı trend grafikleri.",
                "usergroup_id": target_class.id,
                "public": True,
            },
            {
                "file": "sinif-duyuru.ydoc",
                "board_uuid": "board_10a00000-0000-4000-8000-000000000004",
                "name": "10-A Haftalık Ders Programı, Nöbetçi Listesi ve Duyuru Panosu",
                "description": "Sınav takvimi, nöbet listesi, okul kulüp etkinlikleri ve haftalık ödev hatırlatıcıları.",
                "usergroup_id": target_class.id,
                "public": True,
            },
            {
                "file": "edebiyat-gazel.ydoc",
                "board_uuid": "board_10a00000-0000-4000-8000-000000000005",
                "name": "Edebiyat: Divan Edebiyatı Nazım Şekilleri & Kavram Haritası",
                "description": "Gazel, kaside, mesnevi özellikleri ve şairler kronoloji haritası.",
                "usergroup_id": target_class.id,
                "public": True,
            },
            {
                "file": "biyoloji-bolunme.ydoc",
                "board_uuid": "board_10a00000-0000-4000-8000-000000000006",
                "name": "Biyoloji: Mitoz ve Mayoz Evreleri Karşılaştırma Şeması",
                "description": "Profaz, metafaz, anafaz, telofaz kromozom durumları görselleştirme tahtası.",
                "usergroup_id": target_class.id,
                "public": True,
            },
        ]
        created_boards = []
        for bdata in boards_data:
            # Read binary ydoc state
            ydoc_bytes = None
            ydoc_path = os.path.join(boards_bundle_dir, bdata["file"])
            if os.path.exists(ydoc_path):
                with open(ydoc_path, "rb") as f:
                    ydoc_bytes = f.read()

            b = (await db.exec(select(Board).where(
                (Board.name == bdata["name"]) | (Board.board_uuid == bdata["board_uuid"]),
                Board.org_id == org.id
            ))).first()

            if b:
                b.name = bdata["name"]
                b.description = bdata["description"]
                b.usergroup_id = bdata["usergroup_id"]
                b.public = bdata["public"]
                b.board_uuid = bdata["board_uuid"]
                b.created_by = teacher_user.id
                b.ydoc_state = ydoc_bytes
                b.update_date = _now()
                db.add(b)
            else:
                b = Board(
                    name=bdata["name"],
                    description=bdata["description"],
                    board_uuid=bdata["board_uuid"],
                    usergroup_id=bdata["usergroup_id"],
                    public=bdata["public"],
                    org_id=org.id,
                    created_by=teacher_user.id,
                    ydoc_state=ydoc_bytes,
                    creation_date=_now(),
                    update_date=_now(),
                )
                db.add(b)
            await db.commit()
            await db.refresh(b)
            created_boards.append(b)

            # Ensure teacher and student are BoardMembers
            bm_teacher = (await db.exec(select(BoardMember).where(BoardMember.board_id == b.id, BoardMember.user_id == teacher_user.id))).first()
            if not bm_teacher:
                db.add(BoardMember(board_id=b.id, user_id=teacher_user.id, role=BoardMemberRole.OWNER, creation_date=_now()))
            bm_student = (await db.exec(select(BoardMember).where(BoardMember.board_id == b.id, BoardMember.user_id == student_user.id))).first()
            if not bm_student:
                db.add(BoardMember(board_id=b.id, user_id=student_user.id, role=BoardMemberRole.EDITOR, creation_date=_now()))
        await db.commit()
        print(f"✅ {len(created_boards)} Adet Türkçe Akıllı Tahta & Pano Hazırlandı (Zengin Çizimler Yüklendi).")

        # 8. Dersler (Courses)
        courses_data = [
            {
                "name": "10. Sınıf Matematik: Fonksiyonlar ve Polinomlar",
                "description": "İkinci dereceden denklemler, fonksiyon grafikleri, parabol analizi ve polinom bölmesi.",
                "about": "MEB müfredatına tam uyumlu 10. sınıf ileri düzey matematik konuları, soru çözümleri ve canlı tahta anlatımları.",
                "learnings": "Fonksiyon grafiklerini çizebilme, parabol tepe noktasını bulabilme, polinom bölmesini hatasız yapabilme.",
                "tags": "Matematik, 10. Sınıf, Fen, YKS",
                "chapters": ["Fonksiyon Kavramı ve Türleri", "İkinci Dereceden Fonksiyonlar ve Parabol", "Polinomlar ve Çarpanlara Ayırma"],
            },
            {
                "name": "10. Sınıf Fizik: Elektrik, Manyetizma ve Dalgalar",
                "description": "Ohm yasası, devreler, manyetik alan kuvveti, mekanik ve elektromanyetik dalgalar.",
                "about": "Fizik dersi laboratuvar simülasyonları, eşdeğer direnç hesaplamaları ve manyetik alan uygulamaları.",
                "learnings": "Elektrik devrelerini analiz edebilme, eşdeğer direnç hesaplayabilme, manyetik kuvvet yönünü belirleyebilme.",
                "tags": "Fizik, 10. Sınıf, Laboratuvar, Elektrik",
                "chapters": ["Elektrik Akımı ve Direnç", "Elektrik Devreleri ve Kirchhoff", "Manyetizma ve İndüksiyon"],
            },
            {
                "name": "10. Sınıf Türk Dili ve Edebiyatı: Edebi Metinler ve Tahlil",
                "description": "Tanzimat ve Servet-i Fünun dönemi edebiyatı, divan şiiri nazım şekilleri ve metin tahlili.",
                "about": "Türk edebiyatının temel dönemleri, edebi sanatlar, roman tahlili ve kompozisyon yazma teknikleri.",
                "learnings": "Nazım biçimlerini ayırt edebilme, edebi sanatları metin üzerinde bulabilme, eleştirel deneme yazabilme.",
                "tags": "Edebiyat, Türkçe, Dil Bilgisi",
                "chapters": ["Tanzimat ve Servet-i Fünun Edebiyatı", "Divan Şiiri ve Nazım Biçimleri", "Roman Tahlili ve Anlatım"],
            },
            {
                "name": "10. Sınıf Kimya: Kimyasal Tepkimeler ve Mol Kavramı",
                "description": "Kimyanın temel kanunları, mol hesapları, tepkime türleri ve stokiyometri.",
                "about": "Mol kavramı hesaplama teknikleri, kimyasal reaksiyon denkleştirme ve gaz yasaları pratikleri.",
                "learnings": "Mol hesaplamalarını hızlı yapabilme, reaksiyon denklemlerini eşitleyebilme, kütle korunumunu uygulayabilme.",
                "tags": "Kimya, 10. Sınıf, Deney, Mol",
                "chapters": ["Kimyanın Temel Kanunları", "Mol Kavramı ve Hesaplamalar", "Tepkime Türleri ve Denkleştirme"],
            },
            {
                "name": "10. Sınıf Biyoloji: Hücre Bölünmeleri ve Kalıtım",
                "description": "Mitoz ve mayoz hücre bölünmesi, Mendel genetiği ve soy ağacı analizi.",
                "about": "Kalıtım çaprazlamaları, kan grupları genetiği ve modern gen teknolojileri.",
                "learnings": "Mitoz ve mayoz evrelerini açıklayabilme, monohibrit/dihibrit çaprazlama yapabilme, soy ağacı çözebilme.",
                "tags": "Biyoloji, Genetik, Hücre",
                "chapters": ["Mitoz ve Eşeysiz Üreme", "Mayoz ve Eşeyli Üreme", "Kalıtımın Genel Esasları ve Mendel"],
            },
            {
                "name": "Bilişim Teknolojileri ve Algoritmik Düşünme",
                "description": "Python ile programlama temelleri, algoritma mantığı ve yapay zeka araçları.",
                "about": "Temel programlama becerileri, mantıksal problem çözme ve okul projelerinde yapay zeka kullanımı.",
                "learnings": "Python kodlayabilme, problem çözme algoritması geliştirebilme, yapay zeka araçlarını etkin kullanabilme.",
                "tags": "Bilişim, Kodlama, Algoritma, AI",
                "chapters": ["Algoritma Temelleri", "Python ile Programlamaya Giriş", "Yapay Zeka ve Geleceğin Teknolojileri"],
            },
        ]
        created_courses = []
        for cdata in courses_data:
            c = (await db.exec(select(Course).where(Course.name == cdata["name"], Course.org_id == org.id))).first()
            if not c:
                c = Course(
                    name=cdata["name"],
                    description=cdata["description"],
                    about=cdata["about"],
                    learnings=cdata["learnings"],
                    tags=cdata["tags"],
                    public=True,
                    published=True,
                    open_to_contributors=True,
                    org_id=org.id,
                    creation_date=_now(),
                    update_date=_now(),
                )
                db.add(c)
                await db.commit()
                await db.refresh(c)
            else:
                c.description = cdata["description"]
                c.about = cdata["about"]
                c.learnings = cdata["learnings"]
                c.tags = cdata["tags"]
                c.published = True
                c.public = True
                c.update_date = _now()
                db.add(c)
                await db.commit()
            created_courses.append(c)

            # Assign teacher as author
            if c.course_uuid:
                ra = (await db.exec(select(ResourceAuthor).where(
                    ResourceAuthor.user_id == teacher_user.id,
                    ResourceAuthor.resource_uuid == c.course_uuid
                ))).first()
                if not ra:
                    db.add(ResourceAuthor(
                        user_id=teacher_user.id,
                        resource_uuid=c.course_uuid,
                        authorship=ResourceAuthorshipEnum.CREATOR,
                        authorship_status=ResourceAuthorshipStatusEnum.ACTIVE,
                        creation_date=_now(),
                        update_date=_now(),
                    ))
                    await db.commit()

            # Ensure chapters
            for ch_title in cdata["chapters"]:
                ch = (await db.exec(select(Chapter).where(Chapter.course_id == c.id, Chapter.name == ch_title))).first()
                if not ch:
                    db.add(Chapter(
                        course_id=c.id,
                        name=ch_title,
                        description=f"{ch_title} konu anlatımı ve etkinlikleri.",
                        creation_date=_now(),
                        update_date=_now(),
                    ))
            await db.commit()
        print(f"✅ {len(created_courses)} Adet Müfredat Dersi ve Konu Başlıkları Tanımlandı (Öğretmen Yetkilendirildi).")

        # 9. Ödevler & Görevler (Assignments)
        math_course = created_courses[0]
        phys_course = created_courses[1]
        lit_course = created_courses[2]
        chem_course = created_courses[3]
        bio_course = created_courses[4]

        assignments_data = [
            {
                "course_id": math_course.id,
                "title": "10-A Matematik: Fonksiyon Grafikleri ve Parabol Alıştırmaları",
                "description": "Ders kitabındaki sayfa 84-88 arası parabol çizimleri ve tepe noktası bulma alıştırmalarının çözümü.",
                "due_date": _future(5),
                "grading_type": GradingTypeEnum.NUMERIC,
                "submission_status": None, # Student has not submitted yet (Bekleyen ödev)
            },
            {
                "course_id": phys_course.id,
                "title": "Fizik Laboratuvar Deney Raporu ve Devre Analizi",
                "description": "Seri-paralel bağlı direnç devrelerinde akım ve gerilim ölçüm tablosu deney raporu.",
                "due_date": _future(3),
                "grading_type": GradingTypeEnum.NUMERIC,
                "submission_status": AssignmentUserSubmissionStatus.SUBMITTED, # Student submitted, waiting review
            },
            {
                "course_id": lit_course.id,
                "title": "Edebi Metin İncelemesi ve Karakter Tahlili Yazısı",
                "description": "Okunan Tanzimat dönemi romanındaki ana karakterin psikolojik ve toplumsal tahlili (min. 300 kelime).",
                "due_date": _future(7),
                "grading_type": GradingTypeEnum.ALPHABET,
                "submission_status": None, # Bekleyen ödev
            },
            {
                "course_id": chem_course.id,
                "title": "Kimya: Mol Kavramı ve Kimyasal Hesaplamalar Testi",
                "description": "Avogadro sayısı, bağıl atom kütlesi ve stokiyometrik reaksiyon hesaplama soruları.",
                "due_date": _past(3),
                "grading_type": GradingTypeEnum.NUMERIC,
                "submission_status": AssignmentUserSubmissionStatus.GRADED, # Tamamlandı / Notlandı
                "grade": 94,
            },
            {
                "course_id": bio_course.id,
                "title": "Biyoloji: Kalıtım Çaprazlama ve Soy Ağacı Problemleri",
                "description": "Mendel çaprazlamaları, kan grubu tayini ve hemofili/renk körlüğü soy ağacı çözüm ödevi.",
                "due_date": _past(5),
                "grading_type": GradingTypeEnum.NUMERIC,
                "submission_status": AssignmentUserSubmissionStatus.GRADED, # Tamamlandı / Notlandı
                "grade": 88,
            },
        ]

        for adata in assignments_data:
            a = (await db.exec(select(Assignment).where(Assignment.title == adata["title"], Assignment.course_id == adata["course_id"]))).first()
            if not a:
                a = Assignment(
                    course_id=adata["course_id"],
                    title=adata["title"],
                    description=adata["description"],
                    due_date=adata["due_date"],
                    published=True,
                    grading_type=adata["grading_type"],
                    auto_grading=False,
                    creation_date=_now(),
                    update_date=_now(),
                )
                db.add(a)
                await db.commit()
                await db.refresh(a)
            else:
                a.due_date = adata["due_date"]
                a.published = True
                db.add(a)
                await db.commit()

            # Create default task if none
            existing_tasks = (await db.exec(select(AssignmentTask).where(AssignmentTask.assignment_id == a.id))).all()
            if not existing_tasks:
                db.add(AssignmentTask(
                    assignment_id=a.id,
                    org_id=org.id,
                    assignment_task_uuid=f"task_{uuid.uuid4().hex[:12]}",
                    title="Ödev Görevi ve Soru Cevapları",
                    description=adata["description"],
                    hint="Ders notlarını ve akıllı tahta çizimlerini referans alınız.",
                    assignment_type=AssignmentTaskTypeEnum.SHORT_ANSWER,
                    contents={"question": adata["description"]},
                    max_grade_value=100,
                    creation_date=_now(),
                    update_date=_now(),
                ))
                await db.commit()

            # Handle student submission status
            if adata["submission_status"]:
                sub = (await db.exec(select(AssignmentUserSubmission).where(
                    AssignmentUserSubmission.user_id == student_user.id,
                    AssignmentUserSubmission.assignment_id == a.id
                ))).first()
                if not sub:
                    sub = AssignmentUserSubmission(
                        user_id=student_user.id,
                        assignment_id=a.id,
                        assignmentusersubmission_uuid=f"sub_{uuid.uuid4().hex[:12]}",
                        submission_status=adata["submission_status"],
                        grade=adata.get("grade", 0),
                        overall_feedback="Ödev incelendi. Çözüm adımları gayet başarılı ve düzenli.",
                        attempt_number=1,
                        creation_date=_past(1),
                        update_date=_past(1),
                    )
                    db.add(sub)
                else:
                    sub.submission_status = adata["submission_status"]
                    sub.grade = adata.get("grade", sub.grade)
                    db.add(sub)
                await db.commit()

        print("✅ Ödevler ve Öğrenci Notlandırma Verileri (Bekleyen/Tamamlanan) Oluşturuldu.")
        print("\n🎉 TEBRİKLER! Demo Okul ve Tüm Roller Kusursuzca Birbirine Bağlandı:")
        print("  1. 🛡️ Müdür: idare@oxonom.com (Ugur2803*) -> Atatürk Fen ve Anadolu Lisesi Yöneticisi")
        print("  2. ⚡ Öğretmen: ogretmen@oxonom.com (Ugur2803*) -> 10-A Sınıfı Öğretmeni & Ders Sahibi")
        print("  3. 🎓 Öğrenci: ogrenci@oxonom.com (Ugur2803*) -> 10-A Sınıfı Öğrencisi (Panolar, Dersler, Ödevler)")

if __name__ == "__main__":
    asyncio.run(seed_demo())

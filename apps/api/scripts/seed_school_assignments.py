import asyncio
import uuid
from datetime import datetime, timezone
from sqlmodel import select
from src.core.events.database import get_db_session
from src.db.school_assignments import (
    SchoolAssignment,
    SchoolAssignmentSubmission,
    GradeCategoryEnum,
    AssignmentToolTypeEnum,
    SubmissionStatusEnum,
)


def _now():
    return datetime.now(timezone.utc).isoformat()


async def seed():
    async for db in get_db_session():
        # Clear existing school assignments
        await db.execute(select(SchoolAssignment).where(SchoolAssignment.org_id == 2))
        existing_asgs = (await db.execute(select(SchoolAssignment).where(SchoolAssignment.org_id == 2))).scalars().all()
        for ea in existing_asgs:
            await db.delete(ea)
        await db.commit()

        # Seed assignments
        assignments_data = [
            {
                "title": "10-A Matematik: Parabol Tepe Noktası & Eksen Kesişim Çizimleri",
                "description": "f(x) = ax² + bx + c fonksiyonlarının tepe noktası (r, k) koordinatlarını bulunuz ve verilen interaktif akıllı tahta üzerinde grafiklerini çiziniz. Problem adımlarını ve simetri eksenini tahtada renkli kalemle belirtiniz.",
                "grade_level": "10. Sınıf",
                "grade_category": GradeCategoryEnum.HIGH,
                "subject": "Matematik",
                "tool_type": AssignmentToolTypeEnum.WHITEBOARD,
                "board_uuid": "board_6be7ebed-4c00-4243-9a9b-ffef9933803b",
                "usergroup_ids": [6],
                "due_date": "2026-10-12T23:59:00",
                "max_score": 100,
                "tool_data": {
                    "instructions": "1. Verilen 3 fonksiyonun tepe noktasını hesaplayın.\n2. Tahtayı açarak her grafiği x ve y ekseninde çizin.\n3. Çözümünüzü bitirince 'Ödevi Teslim Et' butonuna basınız.",
                }
            },
            {
                "title": "10-A Fizik: Elektrik Devreleri & Eşdeğer Direnç Analizi",
                "description": "Seri ve paralel bağlı direnç devrelerinde Ohm Yasası (V=I.R) bağıntısını kullanarak kollardan geçen akımları hesaplayınız. Akıllı tahtadaki devre şemasında voltmetre ve ampermetre ölçüm sonuçlarını gösteriniz.",
                "grade_level": "10. Sınıf",
                "grade_category": GradeCategoryEnum.HIGH,
                "subject": "Fizik",
                "tool_type": AssignmentToolTypeEnum.WHITEBOARD,
                "board_uuid": "board_2aa88e1a-dcc0-451b-9924-4b075f3f8e2e",
                "usergroup_ids": [6],
                "due_date": "2026-10-08T23:59:00",
                "max_score": 100,
                "tool_data": {
                    "instructions": "Tahtada çizili olan karma devrenin toplam direncini adım adım bulunuz.",
                }
            },
            {
                "title": "10-A Kimya: Kimyasal Türler Arası Etkileşimler ve Lewis Nokta Yapıları",
                "description": "Verilen H2O, NH3, CO2 ve CH4 moleküllerinin Lewis nokta gösterimlerini çıkarınız. Polar ve apolar kovalent bağları açıklayınız. Çözümünüzü metin alanına yazabilir veya çalışma kağıdı fotoğrafını yükleyebilirsiniz.",
                "grade_level": "10. Sınıf",
                "grade_category": GradeCategoryEnum.HIGH,
                "subject": "Kimya",
                "tool_type": AssignmentToolTypeEnum.WORKSHEET,
                "board_uuid": None,
                "usergroup_ids": [6],
                "due_date": "2026-10-14T23:59:00",
                "max_score": 100,
                "tool_data": {
                    "allow_file_upload": True,
                    "min_word_count": 100,
                }
            },
            {
                "title": "10-A Biyoloji: Mayoz Bölünme Evreleri ve Krossing-Over Testi",
                "description": "Profaz-I krossing-over olayının genetik çeşitliliğe etkisini içeren çoktan seçmeli interaktif alıştırma testi. Soruları dikkatlice cevaplayıp testi tamamlayınız.",
                "grade_level": "10. Sınıf",
                "grade_category": GradeCategoryEnum.HIGH,
                "subject": "Biyoloji",
                "tool_type": AssignmentToolTypeEnum.QUIZ,
                "board_uuid": None,
                "usergroup_ids": [6],
                "due_date": "2026-10-10T23:59:00",
                "max_score": 100,
                "tool_data": {
                    "questions": [
                        {
                            "id": 1,
                            "question": "Mayoz bölünmenin hangi evresinde homolog kromozomlar arasında krossing-over gerçekleşir?",
                            "options": ["Profaz I", "Metafaz I", "Anafaz II", "Telofaz I"],
                            "correct_answer": "Profaz I",
                            "points": 25
                        },
                        {
                            "id": 2,
                            "question": "Homolog kromozomların zıt kutuplara çekildiği evre hangisidir?",
                            "options": ["Anafaz I", "Anafaz II", "Metafaz II", "Profaz II"],
                            "correct_answer": "Anafaz I",
                            "points": 25
                        },
                        {
                            "id": 3,
                            "question": "2n=46 kromozomlu bir insanda mayoz bölünme sonucu oluşan sperm hücresinin kromozom sayısı kaçtır?",
                            "options": ["23", "46", "92", "12"],
                            "correct_answer": "23",
                            "points": 25
                        },
                        {
                            "id": 4,
                            "question": "Krossing-over genetik varyasyonu (çeşitliliği) nasıl etkiler?",
                            "options": ["Artırır", "Azaltır", "Değiştirmez", "Kromozom sayısını yarıya indirir"],
                            "correct_answer": "Artırır",
                            "points": 25
                        }
                    ]
                }
            },
            {
                "title": "10-A Edebiyat: Fuzûlî Su Kasidesi Beyit Şerhi ve Aruz Tahlili",
                "description": "Divan Edebiyatı Su Kasidesi'nin ilk 3 beytini günümüz Türkçesine çeviriniz. Kullanılan mazmunları ve söz sanatlarını (teşbih, istiare, hüsn-i talil) metin analizinde açıklayınız.",
                "grade_level": "10. Sınıf",
                "grade_category": GradeCategoryEnum.HIGH,
                "subject": "Türk Dili ve Edebiyatı",
                "tool_type": AssignmentToolTypeEnum.READING,
                "board_uuid": None,
                "usergroup_ids": [6],
                "due_date": "2026-10-06T23:59:00",
                "max_score": 100,
                "tool_data": {
                    "text_to_read": "Saçma ey göz eşkden gönlümdeki odlara su / Kim bu denlü tutuşan odlara kılmaz çâre su...",
                }
            },
            {
                "title": "11-B İleri Matematik: Fonksiyonlarda Türev Alma ve Teğet Denklemleri",
                "description": "f(x) fonksiyonunun belirli bir noktadaki teğetinin eğimini türev yardımıyla bulunuz ve eğri üzerindeki teğet doğrusunu çiziniz.",
                "grade_level": "11. Sınıf",
                "grade_category": GradeCategoryEnum.HIGH,
                "subject": "Matematik",
                "tool_type": AssignmentToolTypeEnum.WHITEBOARD,
                "board_uuid": "board_6be7ebed-4c00-4243-9a9b-ffef9933803b",
                "usergroup_ids": [7],
                "due_date": "2026-10-15T23:59:00",
                "max_score": 100,
                "tool_data": {}
            },
            {
                "title": "9-C İngilizce: Reading Comprehension & Environmental Science",
                "description": "Read the article on Climate Change and renewable energy solutions. Write a 150-word summary reflecting your ideas.",
                "grade_level": "9. Sınıf",
                "grade_category": GradeCategoryEnum.HIGH,
                "subject": "İngilizce",
                "tool_type": AssignmentToolTypeEnum.WORKSHEET,
                "board_uuid": None,
                "usergroup_ids": [8],
                "due_date": "2026-10-11T23:59:00",
                "max_score": 100,
                "tool_data": {}
            }
        ]

        created_asgs = []
        for d in assignments_data:
            asg = SchoolAssignment(
                org_id=2,
                assignment_uuid=f"sch_asg_{uuid.uuid4().hex[:12]}",
                title=d["title"],
                description=d["description"],
                grade_level=d["grade_level"],
                grade_category=d["grade_category"],
                subject=d["subject"],
                tool_type=d["tool_type"],
                tool_data=d["tool_data"],
                board_uuid=d["board_uuid"],
                usergroup_ids=d["usergroup_ids"],
                due_date=d["due_date"],
                max_score=d["max_score"],
                published=True,
                created_by=2,  # ogretmen
                creation_date=_now(),
                update_date=_now(),
            )
            db.add(asg)
            created_asgs.append(asg)

        await db.commit()
        for asg in created_asgs:
            await db.refresh(asg)

        # Seed submissions for 10-A students
        # Student 51 is ogrenci@oxonom.com (Emre Demir)
        # Classmates: 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

        # 1. Fizik assignment (created_asgs[1]): Emre submitted, pending review
        sub_fizik = SchoolAssignmentSubmission(
            assignment_id=created_asgs[1].id,
            org_id=2,
            user_id=51,
            usergroup_id=6,
            status=SubmissionStatusEnum.SUBMITTED,
            submission_date=_now(),
            student_content={
                "notes": "Hocam tahtadaki karma devrede R1 ve R2 paralel kollarının eşdeğerini Rp = 3 Ohm buldum. Seri bağlı R3 = 5 Ohm eklenince Reş = 8 Ohm çıktı. Anakol akımı I = 24V / 8 Ohm = 3A olarak hesaplandı. Çizim adımlarını tahtada işaretledim.",
                "board_uuid": "board_2aa88e1a-dcc0-451b-9924-4b075f3f8e2e",
            },
            creation_date=_now(),
            update_date=_now(),
        )
        db.add(sub_fizik)

        # 2. Edebiyat assignment (created_asgs[4]): Emre submitted, graded with 95 and feedback
        sub_edebiyat = SchoolAssignmentSubmission(
            assignment_id=created_asgs[4].id,
            org_id=2,
            user_id=51,
            usergroup_id=6,
            status=SubmissionStatusEnum.GRADED,
            submission_date="2026-10-01T14:30:00",
            student_content={
                "notes": "1. Beyit Tahlili: Şair sevgilisinin aşkıyla yanan gönlünün ateşine gözyaşı dökülmesini istememektedir; çünkü bu denli alevlenmiş bir ateşe su dökmenin fayda etmeyeceğini belirtir (Teşbih ve Tezat sanatı). Aruz kalıbı: Fâ'ilâtün / Fâ'ilâtün / Fâ'ilâtün / Fâ'ilün.",
            },
            score=95,
            teacher_feedback="Harika bir tahlil Emre! Beyit şerhinde mazmunları çok doğru kavramışsın. Aruz vezni bölütlemen de eksiksiz. Tebrik ederim.",
            graded_at="2026-10-01T18:00:00",
            graded_by=2,
            creation_date="2026-10-01T14:30:00",
            update_date=_now(),
        )
        db.add(sub_edebiyat)

        # Classmate submissions for Fizik & Edebiyat & Matematik so teacher sees rich class data
        classmate_ids = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
        for idx, uid in enumerate(classmate_ids):
            # Fizik submissions for classmates
            if idx < 7:
                is_graded = idx < 4
                db.add(SchoolAssignmentSubmission(
                    assignment_id=created_asgs[1].id,
                    org_id=2,
                    user_id=uid,
                    usergroup_id=6,
                    status=SubmissionStatusEnum.GRADED if is_graded else SubmissionStatusEnum.SUBMITTED,
                    submission_date="2026-10-01T16:00:00",
                    student_content={"notes": f"Ödev çözümü teslim edildi. Devre analizi tamamlandı."},
                    score=85 + (idx * 3) if is_graded else None,
                    teacher_feedback="Devre analizi doğru, formül adımları açık." if is_graded else None,
                    graded_at=_now() if is_graded else None,
                    graded_by=2 if is_graded else None,
                    creation_date="2026-10-01T16:00:00",
                    update_date=_now(),
                ))

            # Matematik submissions for some classmates
            if idx < 5:
                db.add(SchoolAssignmentSubmission(
                    assignment_id=created_asgs[0].id,
                    org_id=2,
                    user_id=uid,
                    usergroup_id=6,
                    status=SubmissionStatusEnum.SUBMITTED,
                    submission_date="2026-10-02T00:30:00",
                    student_content={"notes": "Parabol tepe noktası ve grafik çizimi tamamlandı."},
                    creation_date="2026-10-02T00:30:00",
                    update_date=_now(),
                ))

        await db.commit()
        print("Successfully seeded Turkish school assignments & submissions!")
        break

if __name__ == "__main__":
    asyncio.run(seed())

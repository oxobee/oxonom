'use client'

import React from 'react'
import PassiveModuleNotice from '../PassiveModuleNotice'

export default function TeacherCommunicationView() {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta">
      <PassiveModuleNotice
        moduleName="İletişim ve Duyurular"
        description="Sınıf velilerine anlık duyuru gönderme, öğrenci velisiyle görüşme takvimi oluşturma ve okul içi mesajlaşma merkezi."
        missingDependency="SMS Ağ Geçidi (Netgsm / İYS Entegrasyonu), Kurumsal E-posta Sunucusu & Mobil Push Bildirim Altyapısı"
        plannedFeatures={[
          'Sınıfa tek tıkla toplu SMS / bildirim duyurusu gönderme',
          'Veli görüşme saatleri ve randevu planlama takvimi',
          'Okul idaresi ve öğretmenler arası güvenli mesajlaşma',
          'Duyuru okunma ve teslim raporları',
        ]}
        relatedActivePath="/teacher/dashboard"
        relatedActiveLabel="Ana Sayfaya Dön"
      />
    </div>
  )
}

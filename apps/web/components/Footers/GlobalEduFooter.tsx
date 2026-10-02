'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { getAPIUrl } from '@services/config/config'
import { useOrg } from '@components/Contexts/OrgContext'
import {
  GraduationCap,
  GameController,
  ShieldCheck,
  Lock,
  Globe,
  ArrowUpRight,
  BookOpen,
  ChalkboardSimple,
  FolderOpen,
  Sparkle,
  CheckCircle,
} from '@phosphor-icons/react'

export function GlobalEduFooter() {
  const org = useOrg() as any
  const orgslug = org?.slug || 'demo'

  // Fetch global branding & footer settings
  const { data: branding } = useQuery({
    queryKey: ['instance-branding'],
    queryFn: async () => {
      try {
        const res = await fetch(`${getAPIUrl()}instance/branding`)
        if (res.ok) {
          return await res.json()
        }
      } catch (_e) {
        // fallback
      }
      return null
    },
    staleTime: 60 * 1000,
  })

  const siteName = branding?.site_name || org?.name || 'Oxonom Edu'
  const siteLogo = branding?.site_logo || org?.logo_image || '/lrn-dash.svg'
  const footerText =
    branding?.footer_text ||
    org?.config?.config?.general?.footer_text ||
    '© 2026 Oxonom Education Technologies. Tüm hakları saklıdır.'
  const footerLinkText = branding?.footer_link_text || 'Oxonom Technologies'
  const footerLinkUrl = branding?.footer_link_url || 'https://www.oxonom.com'

  return (
    <footer className="w-full bg-slate-950 text-slate-300 border-t border-slate-800/80 mt-16 relative overflow-hidden">
      {/* Eye-friendly calm SVG background accents */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 relative z-10 space-y-12">
        {/* Main Grid: 5 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Column 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href={`/orgs/${orgslug}`}
              className="inline-flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                {siteLogo ? (
                  <img
                    src={siteLogo}
                    alt={siteName}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <GraduationCap size={24} className="text-indigo-400" />
                )}
              </div>
              <span className="text-lg font-black text-white tracking-tight group-hover:text-indigo-300 transition">
                {siteName}
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Millî Eğitim Bakanlığı (MEB) müfredatına tam uyumlu, yeni nesil interaktif ders
              modülleri, 3D uzay simülasyonları ve eğitici oyunlarla donatılmış akıllı öğrenme
              ekosistemi.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold text-emerald-400">
                <ShieldCheck size={14} weight="fill" />
                <span>MEB Müfredat Uyumlu</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold text-indigo-400">
                <Lock size={14} weight="fill" />
                <span>KVKK & GDPR Güvenceli</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold text-amber-400">
                <Sparkle size={14} weight="fill" />
                <span>256-Bit SSL</span>
              </span>
            </div>
          </div>

          {/* Column 2: Ders Modülleri & Alanlar */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <BookOpen size={16} className="text-indigo-400" />
              <span>Ders Alanları</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href={`/orgs/${orgslug}/playgrounds`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>Matematik Atölyesi</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/orgs/${orgslug}/playgrounds`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>Fen & Uzay Bilimleri</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/orgs/${orgslug}/playgrounds`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>Bilişim & Kodlama</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/orgs/${orgslug}/playgrounds`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>Sosyal Bilgiler & Tarih</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/orgs/${orgslug}/playgrounds`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>Türkçe & Kelime Dünyası</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Eğitici Oyunlar & Simülasyonlar */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <GameController size={16} className="text-amber-400" />
              <span>Eğitici Oyunlar</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href={`/orgs/${orgslug}/games`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>🎮 Tüm Oyunlar Vitrini</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/orgs/${orgslug}/games`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span className="text-amber-400">🪐 3D Simülasyonlar</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/orgs/${orgslug}/games`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>🔍 Kelime Avcısı Oyunu</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/orgs/${orgslug}/games`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>🚀 Roket Matematik Görevi</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/orgs/${orgslug}/resources`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>📂 Eğitim Kaynakları & PDF</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: MEB, Yasal & Kurumsal */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Globe size={16} className="text-emerald-400" />
              <span>MEB & Yasal</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.meb.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition inline-flex items-center gap-1 group"
                >
                  <span>T.C. Millî Eğitim Bakanlığı</span>
                  <ArrowUpRight size={12} className="opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.eba.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition inline-flex items-center gap-1 group"
                >
                  <span>MEB EBA Portalı</span>
                  <ArrowUpRight size={12} className="opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <span className="text-slate-400 cursor-default hover:text-slate-200 transition">
                  KVKK Aydınlatma Metni
                </span>
              </li>
              <li>
                <span className="text-slate-400 cursor-default hover:text-slate-200 transition">
                  Gizlilik & Güvenlik Politikası
                </span>
              </li>
              <li>
                <span className="text-slate-400 cursor-default hover:text-slate-200 transition">
                  Öğrenci Çevrim İçi Güvenliği
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Editable Signature */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
            <span>{footerText}</span>
            {footerLinkUrl && (
              <>
                <span className="text-slate-600 hidden sm:inline">&bull;</span>
                <a
                  href={footerLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition inline-flex items-center gap-0.5"
                >
                  <span>{footerLinkText}</span>
                  <ArrowUpRight size={12} />
                </a>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sistemler Aktif</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export interface PrincipalProfileData {
  id?: number
  name: string
  title: string
  email: string
  tcNo: string
  phone: string
  twoFactorActive: boolean
  schoolName: string
  role?: string
  username?: string
  first_name?: string
  last_name?: string
  loginTime?: string
  institutionCode?: string
  updatedAt?: string
}

export const DEFAULT_CANONICAL_PRINCIPAL: PrincipalProfileData = {
  id: 50,
  name: 'Dr. Uğur UĞURLU',
  title: 'Okul Müdürü · Kurum Yetkilisi',
  email: 'mudur@oxonom.com',
  tcNo: '10000000146',
  phone: '+90 532 999 2200',
  twoFactorActive: true,
  schoolName: 'Oxonom Okulları',
  role: '1. Derece Kurum Müdürü (Baş Yönetici)',
  username: 'mudur',
  first_name: 'Dr. Uğur',
  last_name: 'UĞURLU',
  loginTime: 'Bugün, 08:30',
  institutionCode: '741295',
  updatedAt: new Date().toISOString(),
}

let inMemoryPrincipal: PrincipalProfileData = { ...DEFAULT_CANONICAL_PRINCIPAL }
const STORAGE_FILE = path.join('/tmp', 'oxonom_principal_profile.json')

function loadProfileFromFile(): PrincipalProfileData {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      if (parsed && typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
        inMemoryPrincipal = { ...DEFAULT_CANONICAL_PRINCIPAL, ...parsed }
      }
    }
  } catch (_) {}
  return inMemoryPrincipal
}

function saveProfileToFile(data: PrincipalProfileData) {
  try {
    inMemoryPrincipal = data
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (_) {}
}

// Initial load
loadProfileFromFile()

export async function GET() {
  const profile = loadProfileFromFile()
  return NextResponse.json(
    {
      success: true,
      profile,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const updates = body.profile || body

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ success: false, error: 'Geçersiz profil verisi' }, { status: 400 })
    }

    const current = loadProfileFromFile()
    const name = (updates.name ?? current.name ?? '').trim()
    const parts = name.split(/\s+/)
    const first_name = updates.first_name || parts[0] || 'Dr. Uğur'
    const last_name = updates.last_name || parts.slice(1).join(' ') || 'UĞURLU'

    const merged: PrincipalProfileData = {
      ...current,
      ...updates,
      name,
      first_name,
      last_name,
      title: (updates.title ?? current.title ?? '').trim(),
      email: (updates.email ?? current.email ?? '').trim(),
      phone: (updates.phone ?? current.phone ?? '').trim(),
      tcNo: (updates.tcNo ?? current.tcNo ?? '').trim(),
      schoolName: (updates.schoolName ?? current.schoolName ?? 'Oxonom Okulları').trim(),
      twoFactorActive: updates.twoFactorActive ?? current.twoFactorActive ?? true,
      updatedAt: new Date().toISOString(),
    }

    saveProfileToFile(merged)

    return NextResponse.json(
      {
        success: true,
        message: 'Müdür profili başarıyla güncellendi ve tüm cihazlara eşitlendi.',
        profile: merged,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Bilinmeyen sunucu hatası' },
      { status: 500 }
    )
  }
}

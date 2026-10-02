'use client'
import React from 'react'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import { toast } from 'react-hot-toast'
import { AlertTriangle, Trash2, Users, Eraser, Loader2 } from 'lucide-react'
import ConfirmationModal from '@components/Objects/StyledElements/ConfirmationModal/ConfirmationModal'
import ToolTip from '@components/Objects/StyledElements/Tooltip/Tooltip'
import { useTranslation } from 'react-i18next'
import {
  deleteOrganizationFromBackend,
  removeAllUsersFromOrg,
  wipeOrgContent,
} from '@services/organizations/orgs'

const OrgEditDangerZone: React.FC = () => {
  const { t } = useTranslation()
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token
  const org = useOrg() as any
  const { canManageOrg } = useAdminStatus()

  const [confirmText, setConfirmText] = React.useState('')
  const [isDeletingOrg, setIsDeletingOrg] = React.useState(false)
  const [isRemovingUsers, setIsRemovingUsers] = React.useState(false)
  const [isWipingContent, setIsWipingContent] = React.useState(false)

  // Mirror the backend: delete/wipe/remove-all are authorized on admin/maintainer
  // role membership (rbac "delete"/"update" → authorization_verify_based_on_org_
  // admin_status), which canManageOrg (organizations.action_update, superadmin
  // bypass) reflects. The broad `isAdmin` (dashboard access) also lets editors in,
  // so gating on it showed them a delete button the API would 403 — a dead button.
  const canDeleteOrg = canManageOrg === true

  if (!org?.id) {
    return null
  }

  if (!canManageOrg) {
    return (
      <div className="sm:mx-10 mx-0">
        <div className="bg-white rounded-xl nice-shadow p-6 text-gray-500">
          {t('dashboard.organization.danger_zone.no_permission', { defaultValue: 'Bu okulun tehlike bölgesini yönetme yetkiniz bulunmamaktadır.' })}
        </div>
      </div>
    )
  }

  const handleRemoveAllUsers = async () => {
    setIsRemovingUsers(true)
    const loadingToast = toast.loading(t('dashboard.organization.danger_zone.toasts.removing_members', { defaultValue: 'Tüm üyeler çıkarılıyor…' }))
    try {
      await removeAllUsersFromOrg(org.id, access_token)
      toast.success(t('dashboard.organization.danger_zone.toasts.members_removed', { defaultValue: 'Diğer tüm üyeler başarıyla çıkarıldı' }), { id: loadingToast })
    } catch (err: any) {
      toast.error(err?.message || t('dashboard.organization.danger_zone.toasts.remove_members_error', { defaultValue: 'Üyeler çıkarılamadı' }), { id: loadingToast })
    } finally {
      setIsRemovingUsers(false)
    }
  }

  const handleWipeContent = async () => {
    setIsWipingContent(true)
    const loadingToast = toast.loading(t('dashboard.organization.danger_zone.toasts.wiping_content', { defaultValue: 'Okul içerikleri siliniyor…' }))
    try {
      const res = await wipeOrgContent(org.id, access_token)
      toast.success(
        t('dashboard.organization.danger_zone.toasts.content_wiped', { defaultValue: 'Tüm içerikler başarıyla silindi' }),
        { id: loadingToast }
      )
    } catch (err: any) {
      toast.error(err?.message || t('dashboard.organization.danger_zone.toasts.wipe_content_error', { defaultValue: 'İçerikler silinemedi' }), { id: loadingToast })
    } finally {
      setIsWipingContent(false)
    }
  }

  const handleDeleteOrg = async () => {
    if (confirmText !== org.slug) return
    setIsDeletingOrg(true)
    const loadingToast = toast.loading(t('dashboard.organization.danger_zone.toasts.deleting_org', { defaultValue: 'Okul siliniyor…' }))
    try {
      await deleteOrganizationFromBackend(org.id, access_token)
      toast.success(t('dashboard.organization.danger_zone.toasts.org_deleted', { defaultValue: 'Okul başarıyla silindi' }), { id: loadingToast })
      // The org no longer exists — send the user back to the root so they land
      // on org selection / login rather than a broken dashboard.
      setTimeout(() => {
        window.location.href = '/'
      }, 800)
    } catch (err: any) {
      toast.error(err?.message || t('dashboard.organization.danger_zone.toasts.delete_org_error', { defaultValue: 'Okul silinemedi' }), { id: loadingToast })
      setIsDeletingOrg(false)
    }
  }

  return (
    <div className="sm:mx-10 mx-0 space-y-4">
      <div className="rounded-xl nice-shadow bg-white border border-red-100 overflow-hidden">
        <div className="flex items-center space-x-2 bg-red-50 px-5 py-3 border-b border-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <h1 className="font-bold text-xl text-red-700">
              {t('dashboard.organization.danger_zone.title', { defaultValue: 'Tehlike Bölgesi' })}
            </h1>
            <h2 className="text-red-500/80 text-sm">
              {t('dashboard.organization.danger_zone.subtitle', { defaultValue: 'Bu işlemler kalıcıdır ve geri alınamaz.' })}
            </h2>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Remove all members */}
          <div className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-700" />
                <span className="font-semibold text-gray-800">
                  {t('dashboard.organization.danger_zone.remove_members_title', { defaultValue: 'Tüm üyeleri çıkar' })}
                </span>
              </div>
              <p className="text-sm text-gray-500 max-w-xl">
                {t('dashboard.organization.danger_zone.remove_members_desc', { defaultValue: 'Sizin dışınızdaki tüm üyeleri bu okuldan kaldırır. Dersler, ödevler ve diğer içerikler korunur.' })}
              </p>
            </div>
            <ConfirmationModal
              confirmationButtonText={t('dashboard.organization.danger_zone.remove_members_btn', { defaultValue: 'Tümünü Çıkar' })}
              confirmationMessage={t('dashboard.organization.danger_zone.remove_members_dialog_desc', { defaultValue: 'Sizin dışınızdaki tüm üyeler bu okuldan çıkarılacaktır. Bu işlem geri alınamaz.' })}
              dialogTitle={t('dashboard.organization.danger_zone.remove_members_dialog_title', { defaultValue: 'Tüm üyeler çıkarılsın mı?' })}
              status="warning"
              functionToExecute={handleRemoveAllUsers}
              dialogTrigger={
                <button
                  type="button"
                  disabled={isRemovingUsers}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition disabled:opacity-50"
                >
                  {isRemovingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  <span>{t('dashboard.organization.danger_zone.remove_members_btn', { defaultValue: 'Tümünü Çıkar' })}</span>
                </button>
              }
            />
          </div>

          {/* Wipe content */}
          <div className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <Eraser className="h-4 w-4 text-gray-700" />
                <span className="font-semibold text-gray-800">
                  {t('dashboard.organization.danger_zone.wipe_content_title', { defaultValue: 'Tüm içerikleri temizle' })}
                </span>
              </div>
              <p className="text-sm text-gray-500 max-w-xl">
                {t('dashboard.organization.danger_zone.wipe_content_desc', { defaultValue: 'Tüm dersleri, panoları ve içeriklerini kalıcı olarak siler. Okul ve üyeleri korunur.' })}
              </p>
            </div>
            <ConfirmationModal
              confirmationButtonText={t('dashboard.organization.danger_zone.wipe_content_btn', { defaultValue: 'İçerikleri Temizle' })}
              confirmationMessage={t('dashboard.organization.danger_zone.wipe_content_dialog_desc', { defaultValue: 'Tüm dersler ve içerikleri kalıcı olarak silinecektir. Bu işlem geri alınamaz.' })}
              dialogTitle={t('dashboard.organization.danger_zone.wipe_content_dialog_title', { defaultValue: 'Tüm içerikler temizlensin mi?' })}
              status="warning"
              functionToExecute={handleWipeContent}
              dialogTrigger={
                <button
                  type="button"
                  disabled={isWipingContent}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition disabled:opacity-50"
                >
                  {isWipingContent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}
                  <span>{t('dashboard.organization.danger_zone.wipe_content_btn', { defaultValue: 'İçerikleri Temizle' })}</span>
                </button>
              }
            />
          </div>

          {/* Delete organization (typed confirmation) */}
          {canDeleteOrg && (
            <div className="px-5 py-4 space-y-3 bg-red-50/30">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4 text-red-700" />
                  <span className="font-semibold text-red-800">
                    {t('dashboard.organization.danger_zone.delete_org_title', { defaultValue: 'Bu okulu sil' })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 max-w-xl">
                  {t('dashboard.organization.danger_zone.delete_org_desc', { defaultValue: 'Bu okulu ve içindeki her şeyi (üyeler, dersler, panolar, ödevler ve ayarlar) kalıcı olarak siler. Bu işlem geri alınamaz.' })}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500">
                  {t('dashboard.organization.danger_zone.delete_org_confirm_label', { slug: org.slug, defaultValue: `Onaylamak için ${org.slug} yazın.` })}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={org.slug}
                    className="w-full max-w-xs px-3 py-2 border border-red-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  <ToolTip content={t('dashboard.organization.danger_zone.delete_org_tooltip', { defaultValue: 'Okulu kalıcı olarak sil' })} side="top" slateBlack>
                    <button
                      type="button"
                      onClick={handleDeleteOrg}
                      disabled={confirmText !== org.slug || isDeletingOrg}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isDeletingOrg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      <span>{t('dashboard.organization.danger_zone.delete_org_btn', { defaultValue: 'Okulu Sil' })}</span>
                    </button>
                  </ToolTip>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrgEditDangerZone

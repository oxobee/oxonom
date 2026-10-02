import { Metadata } from 'next'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getOrgThumbnailMediaDirectory, getOrgOgImageMediaDirectory } from '@services/media/media'
import { getOrgSeoConfig, buildPageTitle } from '@/lib/seo/utils'
import { getServerCanonicalUrl } from '@/lib/seo/utils.server'
import HomeClient from './home-client'

type MetadataProps = {
  params: Promise<{ orgslug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(props: MetadataProps): Promise<Metadata> {
  try {
    const params = await props.params;
    // Get Org context information
    const org = await getOrganizationContextInfo(params.orgslug, {
      revalidate: 120,
      tags: ['organizations'],
    })

    const seoConfig = getOrgSeoConfig(org || {})
    const ogImageUrl = seoConfig.default_og_image
      ? getOrgOgImageMediaDirectory(org?.org_uuid, seoConfig.default_og_image)
      : null
    const imageUrl = ogImageUrl || getOrgThumbnailMediaDirectory(org?.org_uuid, org?.thumbnail_image)
    let canonical = '/'
    try {
      canonical = await getServerCanonicalUrl(params.orgslug, '/')
    } catch {
      // Fallback canonical
    }
    const title = buildPageTitle('Home', org?.name || 'Oxonom Edu', seoConfig)
    const description = org?.description || seoConfig.default_meta_description || 'Oxonom Edu — Akıllı Eğitim Portalı'

    // SEO
    return {
      title,
      description,
      robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
        },
      },
      alternates: {
        canonical,
      },
      ...(seoConfig.google_site_verification
        ? {
            verification: {
              google: seoConfig.google_site_verification,
            },
          }
        : {}),
      openGraph: {
        title,
        description,
        type: 'website',
        ...(imageUrl
          ? {
              images: [
                {
                  url: imageUrl,
                  width: 800,
                  height: 600,
                  alt: org?.name || 'Oxonom Edu',
                },
              ],
            }
          : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(imageUrl ? { images: [imageUrl] } : {}),
        ...(seoConfig.twitter_handle && { site: seoConfig.twitter_handle }),
      },
    }
  } catch (_err) {
    return {
      title: 'Oxonom Edu — Akıllı Eğitim Portalı',
      description: 'Yeni nesil dijital eğitim ve öğrenme platformu',
    }
  }
}

const OrgHomePage = async (params: any) => {
  const orgslug = (await params.params).orgslug
  return <HomeClient orgslug={orgslug} />
}

export default OrgHomePage

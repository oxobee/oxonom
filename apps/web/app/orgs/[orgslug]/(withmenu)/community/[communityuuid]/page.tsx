import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from '@/lib/auth/server'
import { getCommunity } from '@services/communities/communities'
import { getDiscussions, DiscussionWithAuthor } from '@services/communities/discussions'
import { getOrgThumbnailMediaDirectory, getOrgOgImageMediaDirectory } from '@services/media/media'
import { getCanonicalUrl, getOrgSeoConfig, buildPageTitle, buildBreadcrumbJsonLd } from '@/lib/seo/utils'
import { getServerCanonicalUrl } from '@/lib/seo/utils.server'
import { JsonLd } from '@components/SEO/JsonLd'
import CommunityClient from './community'

import Link from 'next/link'
import { MessagesSquare } from 'lucide-react'
import {
  TURKISH_COMMUNITIES,
  TURKISH_COMMUNITY_DISCUSSIONS,
} from '@services/demo/turkishSchoolData'

type MetadataProps = {
  params: Promise<{ orgslug: string; communityuuid: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(props: MetadataProps): Promise<Metadata> {
  const params = await props.params
  const org = await getOrganizationContextInfo(params.orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })

  const rawId = params.communityuuid
  const candidateUuids = [
    rawId,
    rawId.startsWith('community_') ? rawId : `community_${rawId}`,
    rawId.startsWith('comm_') ? rawId : `comm_${rawId}`,
  ]

  let community = null
  for (const cand of candidateUuids) {
    try {
      community = await getCommunity(cand, { revalidate: 120, tags: ['communities'] })
      if (community && community.name) break
    } catch (error) {
      // Community might not exist or user doesn't have access
    }
  }

  if (!community || !community.name) {
    community = TURKISH_COMMUNITIES.find(
      (c) => c.community_uuid === rawId || candidateUuids.includes(c.community_uuid)
    ) || null
  }

  const seoConfig = getOrgSeoConfig(org)

  const title = buildPageTitle(community ? community.name : 'Topluluk', org.name, seoConfig)
  const description = community?.description || seoConfig.default_meta_description || `${org.name} veli ve sınıf tartışma panosu`

  const ogImageUrl = seoConfig.default_og_image
    ? getOrgOgImageMediaDirectory(org?.org_uuid, seoConfig.default_og_image)
    : null
  const imageUrl = ogImageUrl || getOrgThumbnailMediaDirectory(org?.org_uuid, org?.thumbnail_image)
  const canonical = await getServerCanonicalUrl(params.orgslug, `/community/${params.communityuuid}`)

  return {
    title,
    description,
    robots: {
      index: !seoConfig.noindex_communities,
      follow: true,
      nocache: true,
      googleBot: {
        index: !seoConfig.noindex_communities,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: org.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      ...(seoConfig.twitter_handle && { site: seoConfig.twitter_handle }),
    },
  }
}

const CommunityPage = async (params: any) => {
  const session = await getServerSession()
  const access_token = session?.tokens?.access_token
  const { orgslug, communityuuid } = await params.params
  const candidateUuids = [
    communityuuid,
    communityuuid.startsWith('community_') ? communityuuid : `community_${communityuuid}`,
    communityuuid.startsWith('comm_') ? communityuuid : `comm_${communityuuid}`,
  ]

  const org = await getOrganizationContextInfo(orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })
  const org_id = org.id

  let community = null
  let matchedUuid = communityuuid
  let communityError: { status?: number } | null = null
  let discussions: DiscussionWithAuthor[] = []

  for (const cand of candidateUuids) {
    try {
      community = await getCommunity(
        cand,
        { revalidate: 120, tags: ['communities'] },
        access_token ? access_token : undefined
      )
      if (community && community.name) {
        matchedUuid = cand
        break
      }
    } catch (error: any) {
      communityError = { status: error?.status }
    }
  }

  // Fallback to Turkish school demo communities
  if (!community || !community.name) {
    const fallback = TURKISH_COMMUNITIES.find(
      (c) => c.community_uuid === communityuuid ||
             candidateUuids.includes(c.community_uuid) ||
             communityuuid.includes(c.community_uuid) ||
             c.community_uuid.includes(communityuuid)
    )
    if (fallback) {
      community = fallback
      matchedUuid = fallback.community_uuid
    }
  }

  if (community) {
    try {
      discussions = await getDiscussions(
        matchedUuid,
        'recent',
        1,
        20,
        { revalidate: 120, tags: ['discussions'] },
        access_token ? access_token : undefined
      )
    } catch (error) {
      console.error('Failed to fetch discussions:', error)
      discussions = []
    }

    if (!discussions || discussions.length === 0) {
      discussions = (TURKISH_COMMUNITY_DISCUSSIONS[matchedUuid] ||
                     TURKISH_COMMUNITY_DISCUSSIONS['comm_1a_veli_dayanisma'] ||
                     []) as DiscussionWithAuthor[]
    }
  }

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
          <MessagesSquare size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Topluluk Bulunamadı veya Erişim Kısıtlı</h1>
        <p className="text-gray-500 mt-2 max-w-md text-sm">
          Görüntülemek istediğiniz sınıf veya veli topluluğu yayından kaldırılmış, pasife alınmış veya henüz oluşturulmamış olabilir.
        </p>
        <Link
          href={`/orgs/${orgslug}/communities`}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition"
        >
          <span>Tüm Toplulukları Görüntüle</span>
        </Link>
      </div>
    )
  }

  const communityJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: community.name,
    description: community.description,
    author: {
      '@type': 'Organization',
      name: org.name,
    },
    url: await getServerCanonicalUrl(orgslug, `/community/${communityuuid}`),
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: await getServerCanonicalUrl(orgslug, '/') },
    { name: 'Communities', url: await getServerCanonicalUrl(orgslug, '/communities') },
    { name: community.name || 'Community', url: await getServerCanonicalUrl(orgslug, `/community/${communityuuid}`) },
  ])

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={communityJsonLd} />
      <CommunityClient
        community={community}
        initialDiscussions={discussions || []}
        orgslug={orgslug}
        org_id={org_id}
      />
    </>
  )
}

export default CommunityPage

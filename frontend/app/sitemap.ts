import type { MetadataRoute } from 'next';
import { getNewsList, getMembers } from '@/lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://giaphahophungbattrang.vn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/tin-tuc`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/gia-pha`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/video`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/tim-kiem`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const newsRes = await getNewsList(1, 100);
    for (const item of newsRes.data.items) {
      dynamicRoutes.push({
        url: `${BASE_URL}/tin-tuc/${item.slug}`,
        lastModified: new Date(item.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch {
    // skip on build failure
  }

  try {
    const membersRes = await getMembers();
    for (const member of membersRes.data) {
      dynamicRoutes.push({
        url: `${BASE_URL}/thanh-vien/${member.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  } catch {
    // skip on build failure
  }

  return [...staticRoutes, ...dynamicRoutes];
}

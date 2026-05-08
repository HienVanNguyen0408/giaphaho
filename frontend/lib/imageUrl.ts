export function normalizeImageUrl(raw: string): string {
  const url = raw.trim();

  // Google Images result page — extract imgurl param
  if (url.includes('google.com/imgres') || url.includes('google.com/search')) {
    try {
      const parsed = new URL(url);
      const imgurl = parsed.searchParams.get('imgurl');
      if (imgurl) return decodeURIComponent(imgurl);
    } catch {}
  }

  // Google Drive: /file/d/ID/view or /file/d/ID
  const gdriveFile = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveFile) {
    return `https://lh3.googleusercontent.com/d/${gdriveFile[1]}`;
  }

  // Google Drive: /open?id=ID or uc?id=ID
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'drive.google.com') {
      const id = parsed.searchParams.get('id');
      if (id) return `https://lh3.googleusercontent.com/d/${id}`;
    }
  } catch {}

  // Imgur page link (imgur.com/XXXXX) → direct image
  const imgurPage = url.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)(?:\.[a-zA-Z]+)?$/);
  if (imgurPage && !url.includes('gallery') && !url.includes('/a/')) {
    return `https://i.imgur.com/${imgurPage[1]}.jpg`;
  }

  return url;
}

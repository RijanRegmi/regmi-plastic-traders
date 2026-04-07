import { Metadata } from 'next';

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";
const API_BASE = API.replace(/\/api$/, "");

export const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("regmi-plastic/")) return `https://res.cloudinary.com/dkmbfnuch/image/upload/${path}`;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

function unwrap(v: unknown, fallback = ""): string {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if ("value" in o) return String(o.value ?? "") || fallback;
  }
  return typeof v === "string" && v ? v : fallback;
}

export async function fetchSeoData(page?: string) {
  try {
    const requests = [
      fetch(`${API}/cms/global`, { next: { revalidate: 60 } }),
      fetch(`${API}/cms/seo`, { next: { revalidate: 60 } })
    ];
    
    if (page) {
      requests.push(fetch(`${API}/cms/${page}`, { next: { revalidate: 60 } }));
    }

    const responses = await Promise.allSettled(requests);
    
    const globalData = responses[0].status === "fulfilled" ? await responses[0].value.json() : { data: {} };
    const seoData = responses[1].status === "fulfilled" ? await responses[1].value.json() : { data: {} };
    const pageData = page && responses[2].status === "fulfilled" ? await responses[2].value.json() : { data: {} };

    return {
      global: globalData.data || {},
      seo: seoData.data || {},
      page: pageData.data || {}
    };
  } catch (err) {
    console.error("Failed to fetch SEO data:", err);
    return { global: {}, seo: {}, page: {} };
  }
}

export async function generateDynamicMetadata(pageId?: string, overrides?: Metadata): Promise<Metadata> {
  const { global, seo, page } = await fetchSeoData(pageId);

  const storeName = unwrap(global.storeName, "Regmi Plastic Traders");
  const defaultDesc = unwrap(seo.defaultDescription, "Nepal's most trusted plastic product store since 2005.");
  const defaultTags = unwrap(seo.defaultKeywords, "plastic products Nepal, Kathmandu plastic store, storage box Nepal, Regmi Plastic");
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.regmiplastictraders.com.np";
  const defaultOgImage = getImageUrl(unwrap(seo.defaultOgImage, ""));

  // Try to find the most specific fields for this page
  const pageTitle = unwrap(page.pageTitle, "") || unwrap(seo[`${pageId}Title`], "");
  const pageDesc = unwrap(page.pageSubtitle, "") || unwrap(seo[`${pageId}Description`], "") || defaultDesc;
  const pageKeywords = unwrap(seo[`${pageId}Keywords`], "") || defaultTags;

  const titleStr = pageTitle 
    ? `${pageTitle} | ${storeName}` 
    : `${storeName} | Nepal's Most Trusted Plastic Store`;

  return {
    title: overrides?.title || titleStr,
    description: overrides?.description || pageDesc,
    keywords: overrides?.keywords || pageKeywords,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: overrides?.title || titleStr,
      description: overrides?.description || pageDesc,
      url: siteUrl,
      siteName: storeName,
      images: defaultOgImage ? [{ url: defaultOgImage, width: 1200, height: 630 }] : [],
      locale: "en_NP",
      type: "website",
      ...overrides?.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: overrides?.title || titleStr,
      description: overrides?.description || pageDesc,
      images: defaultOgImage ? [defaultOgImage] : [],
      ...overrides?.twitter,
    },
  };
}

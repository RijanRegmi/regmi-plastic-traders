import { MetadataRoute } from 'next';

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.regmiplastictraders.com.np";

  // Static routes
  const routes = [
    '',
    '/products',
    '/about',
    '/contact',
    '/blog',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Dynamic products
    const productsRes = await fetch(`${API}/products?limit=100`);
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      const productRoutes = (productsData.data || []).map((p: { slug: string }) => ({
        url: `${siteUrl}/products/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
      routes.push(...productRoutes);
    }

    // Dynamic blogs
    const blogsRes = await fetch(`${API}/blog?limit=100`);
    if (blogsRes.ok) {
      const blogsData = await blogsRes.json();
      const blogRoutes = (blogsData.data || []).map((b: { slug: string }) => ({
        url: `${siteUrl}/blog/${b.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }));
      routes.push(...blogRoutes);
    }
  } catch (err) {
    console.error("Sitemap generation error:", err);
  }

  return routes;
}

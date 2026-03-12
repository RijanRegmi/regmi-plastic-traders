import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import ProductsFilter from "./ProductsFilter";
import { Product } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";

async function getProductsData(searchParams: Record<string, string>) {
  try {
    const params = new URLSearchParams();
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.page) params.set("page", searchParams.page);
    params.set("limit", "24");

    const [productsRes, catsRes, cmsRes, globalCmsRes] =
      await Promise.allSettled([
        fetch(`${API}/products?${params}`, { next: { revalidate: 30 } }),
        fetch(`${API}/products/categories`, { next: { revalidate: 300 } }),
        fetch(`${API}/cms/products`, { next: { revalidate: 60 } }),
        fetch(`${API}/cms/global`, { next: { revalidate: 60 } }),
      ]);

    return {
      products:
        productsRes.status === "fulfilled"
          ? await productsRes.value.json()
          : { data: [], pagination: {} },
      categories:
        catsRes.status === "fulfilled"
          ? await catsRes.value.json()
          : { data: [] },
      cms: {
        ...(cmsRes.status === "fulfilled"
          ? await cmsRes.value.json()
          : { data: {} }
        ).data,
        ...(globalCmsRes.status === "fulfilled"
          ? await globalCmsRes.value.json()
          : { data: {} }
        ).data,
      },
    };
  } catch {
    return {
      products: { data: [], pagination: {} },
      categories: { data: [] },
      cms: {},
    };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolvedParams = await searchParams;
  const { products, categories, cms } = await getProductsData(resolvedParams);

  const pageTitle = (cms.pageTitle as string) || "Our Products";
  const pageSubtitle =
    (cms.pageSubtitle as string) ||
    "Quality plastic products — click any item to buy on Daraz";
  const storeName = (cms.storeName as string) || "Regmi Plastic Traders";

  return (
    <div className="rpt-page">
      <Header storeName={storeName} />

      <div className="rpt-page-hero">
        <div className="rpt-page-hero__bg" />
        <div className="rpt-page-hero__content">
          <p className="rpt-label">Quality Selection</p>
          <h1 className="rpt-page-hero__title">{pageTitle}</h1>
          <p className="rpt-page-hero__sub">{pageSubtitle}</p>
        </div>
      </div>

      <main className="rpt-page-body">
        <section
          className="rpt-section"
          style={{ paddingTop: "60px", paddingBottom: "96px" }}
        >
          <div className="rpt-container">
            <ProductsFilter
              categories={categories.data as string[]}
              currentCategory={resolvedParams.category}
              currentSearch={resolvedParams.search}
            />

            <div className="rpt-products-count">
              Showing {products.data?.length || 0} of{" "}
              {products.pagination?.total || 0} products
              {resolvedParams.category && (
                <span className="rpt-products-count__cat">
                  {" "}
                  in &ldquo;{resolvedParams.category}&rdquo;
                </span>
              )}
            </div>

            {products.data?.length > 0 ? (
              <div className="rpt-products-grid">
                {products.data.map((p: Product) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            ) : (
              <div className="rpt-empty-state">
                <div className="rpt-empty-state__emoji">🔍</div>
                <h3 className="rpt-empty-state__title">No products found</h3>
                <p className="rpt-empty-state__sub">
                  Try a different search or category
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer cms={cms} />
    </div>
  );
}

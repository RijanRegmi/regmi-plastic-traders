import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import ProductsFilter from "./ProductsFilter";
import { Product } from "@/types";
import Reveal from "@/components/ui/Reveal";
import StaggerContainer, { StaggerItem } from "@/components/ui/StaggerContainer";

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

  const storeName = (cms.storeName as string) || "Regmi Plastic Traders";
  const pageTitle = (cms.pageTitle as string) || storeName.toUpperCase();
  const pageSubtitle =
    (cms.pageSubtitle as string) ||
    "Quality plastic products — click any item to buy on Daraz";
  const totalProducts = products.pagination?.total || 0;
  const shownProducts = products.data?.length || 0;

  return (
    <div className="rpt-page">
      <Header storeName={storeName} />

      <main className="rpt-products-page">
        {/* ── Page header ── */}
        <Reveal direction="down" className="rpt-products-page__head" style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 className="rpt-products-page__title" style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            REGMI PLASTIC TRADERS
          </h1>
          <p className="rpt-products-page__sub" style={{ color: "#6b7280", marginTop: 8 }}>
            Published date / 2026 • Kathmandu, Nepal
          </p>
        </Reveal>

        <div className="rpt-products-page__body">
          {/* ── Filter ── */}
          <ProductsFilter
            categories={categories.data as string[]}
            currentCategory={resolvedParams.category}
            currentSearch={resolvedParams.search}
          />

          {/* ── Count ── */}
          <p className="rpt-products-page__count">
            Showing <strong>{shownProducts}</strong> of{" "}
            <strong>{totalProducts}</strong> products
            {resolvedParams.category && (
              <span className="rpt-products-page__count-cat">
                {" "}
                in &ldquo;{resolvedParams.category}&rdquo;
              </span>
            )}
            {resolvedParams.search && (
              <span className="rpt-products-page__count-cat">
                {" "}
                for &ldquo;{resolvedParams.search}&rdquo;
              </span>
            )}
          </p>

          {/* ── Grid ── */}
          {products.data?.length > 0 ? (
            <StaggerContainer
              key={`${resolvedParams.category}-${resolvedParams.search}-${resolvedParams.page}`}
              className="rpt-cards-grid"
            >
              {products.data.map((p: Product) => (
                <StaggerItem key={p._id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="rpt-empty-state">
              <div className="rpt-empty-state__emoji">🔍</div>
              <h3 className="rpt-empty-state__title">No products found</h3>
              <p className="rpt-empty-state__sub">
                Try a different search or category
              </p>
            </div>
          )}

          {/* ── Pagination ── */}
          {products.pagination?.pages > 1 && (
            <div className="rpt-products-page__pagination">
              {Array.from(
                { length: products.pagination.pages },
                (_, i) => i + 1,
              ).map((pg) => {
                const p = new URLSearchParams();
                if (resolvedParams.category)
                  p.set("category", resolvedParams.category);
                if (resolvedParams.search)
                  p.set("search", resolvedParams.search);
                p.set("page", String(pg));
                return (
                  <a
                    key={pg}
                    href={`/products?${p.toString()}`}
                    className={`rpt-page-btn${Number(resolvedParams.page || 1) === pg
                      ? " rpt-page-btn--active"
                      : ""
                      }`}
                  >
                    {pg}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer cms={cms} />
    </div>
  );
}

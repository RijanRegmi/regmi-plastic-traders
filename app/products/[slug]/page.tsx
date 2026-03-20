import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import RelatedProducts from "@/components/product/RelatedProducts";
import { Product } from "@/types";
import {
  FiArrowLeft,
  FiExternalLink,
  FiStar,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiPackage,
} from "react-icons/fi";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

async function getRelatedProducts(
  category: string,
  excludeSlug: string,
): Promise<Product[]> {
  try {
    const res = await fetch(
      `${API}/products?category=${encodeURIComponent(category)}&limit=4`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).filter((p: Product) => p.slug !== excludeSlug);
  } catch {
    return [];
  }
}

async function getGlobalCms() {
  try {
    const res = await fetch(`${API}/cms/global`, { next: { revalidate: 300 } });
    if (!res.ok) return {};
    const data = await res.json();
    return data.data || {};
  } catch {
    return {};
  }
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="rpt-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <FiStar
          key={i}
          size={size}
          className={i <= Math.round(rating) ? "rpt-star--on" : "rpt-star--off"}
        />
      ))}
    </span>
  );
}

const BADGE_CLASS: Record<string, string> = {
  "Best Seller": "rpt-product-card__badge--red",
  Popular: "rpt-product-card__badge--orange",
  New: "rpt-product-card__badge--green",
  "Top Rated": "rpt-product-card__badge--yellow",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — Regmi Plastic Traders`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, cms] = await Promise.all([getProduct(slug), getGlobalCms()]);

  if (!product) notFound();

  const related = await getRelatedProducts(product.category, slug);
  const storeName = (cms.storeName as string) || "Regmi Plastic Traders";

  return (
    <div className="rpt-page">
      <Header storeName={storeName} />

      <div className="rpt-product-detail-wrapper">
        {/* ── Breadcrumb ── */}
        <div className="rpt-product-detail-breadcrumb">
          <div className="rpt-container">
            <div className="rpt-breadcrumb-inner">
              <Link href="/" className="rpt-breadcrumb__link">
                Home
              </Link>
              <span className="rpt-breadcrumb__sep">›</span>
              <Link href="/products" className="rpt-breadcrumb__link">
                Products
              </Link>
              <span className="rpt-breadcrumb__sep">›</span>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="rpt-breadcrumb__link"
              >
                {product.category}
              </Link>
              <span className="rpt-breadcrumb__sep">›</span>
              <span className="rpt-breadcrumb__current">{product.name}</span>
            </div>
          </div>
        </div>

        {/* ── Main Detail Section ── */}
        <section className="rpt-product-detail-section">
          <div className="rpt-container">
            <div className="rpt-product-detail-grid">
              {/* Left — Gallery */}
              <div className="rpt-product-detail__gallery">
                <ProductImageGallery
                  images={product.images || []}
                  name={product.name}
                  badge={product.badge}
                  inStock={product.inStock}
                />
              </div>

              {/* Right — Info */}
              <div className="rpt-product-detail__info">
                {/* Category + Badge */}
                <div className="rpt-product-detail__meta-row">
                  <Link
                    href={`/products?category=${encodeURIComponent(product.category)}`}
                    className="rpt-product-detail__cat"
                  >
                    {product.category}
                  </Link>
                  {product.badge && (
                    <span
                      className={`rpt-product-card__badge ${
                        BADGE_CLASS[product.badge] ||
                        "rpt-product-card__badge--red"
                      }`}
                      style={{ position: "static" }}
                    >
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="rpt-product-detail__name">{product.name}</h1>

                {/* Rating */}
                <div className="rpt-product-detail__rating-row">
                  <Stars rating={product.rating} size={16} />
                  <span className="rpt-product-detail__rating-num">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="rpt-product-detail__review-count">
                    ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Divider */}
                <div className="rpt-product-detail__divider" />

                {/* Description */}
                <p className="rpt-product-detail__desc">
                  {product.description}
                </p>

                {/* Price */}
                <div className="rpt-product-detail__price-block">
                  <span className="rpt-product-detail__price">
                    Rs {product.price.toLocaleString()}
                  </span>
                  {!product.inStock && (
                    <span className="rpt-product-detail__oos-badge">
                      Out of Stock
                    </span>
                  )}
                  {product.inStock && (
                    <span className="rpt-product-detail__stock-badge">
                      In Stock
                    </span>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="rpt-product-detail__ctas">
                  <a
                    href={product.darazLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rpt-btn-primary rpt-product-detail__daraz-btn"
                  >
                    <FiExternalLink size={16} />
                    Buy on Daraz
                  </a>
                  <Link
                    href="/products"
                    className="rpt-btn-outline rpt-product-detail__back-btn"
                  >
                    <FiArrowLeft size={14} />
                    All Products
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="rpt-product-detail__trust">
                  {[
                    { icon: <FiTruck size={16} />, label: "Fast Delivery" },
                    { icon: <FiShield size={16} />, label: "Quality Assured" },
                    { icon: <FiRefreshCw size={16} />, label: "Easy Returns" },
                    { icon: <FiPackage size={16} />, label: "Secure Packing" },
                  ].map((t) => (
                    <div
                      key={t.label}
                      className="rpt-product-detail__trust-item"
                    >
                      <span className="rpt-product-detail__trust-icon">
                        {t.icon}
                      </span>
                      <span className="rpt-product-detail__trust-label">
                        {t.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Product Meta */}
                <div className="rpt-product-detail__meta-table">
                  <div className="rpt-product-detail__meta-row-item">
                    <span className="rpt-product-detail__meta-key">
                      Category
                    </span>
                    <span className="rpt-product-detail__meta-val">
                      {product.category}
                    </span>
                  </div>
                  <div className="rpt-product-detail__meta-row-item">
                    <span className="rpt-product-detail__meta-key">
                      Availability
                    </span>
                    <span
                      className={`rpt-product-detail__meta-val ${product.inStock ? "rpt-product-detail__meta-val--green" : "rpt-product-detail__meta-val--red"}`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  {product.badge && (
                    <div className="rpt-product-detail__meta-row-item">
                      <span className="rpt-product-detail__meta-key">
                        Label
                      </span>
                      <span className="rpt-product-detail__meta-val">
                        {product.badge}
                      </span>
                    </div>
                  )}
                  <div className="rpt-product-detail__meta-row-item">
                    <span className="rpt-product-detail__meta-key">Rating</span>
                    <span className="rpt-product-detail__meta-val">
                      {product.rating} / 5 ({product.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <section
            className="rpt-section"
            style={{ paddingTop: 80, paddingBottom: 80 }}
          >
            <div className="rpt-container">
              <div className="rpt-section-head">
                <div>
                  <p className="rpt-label">More Like This</p>
                  <h2 className="rpt-heading">Related Products</h2>
                </div>
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="rpt-link-arrow rpt-link-arrow--desktop"
                >
                  View all in {product.category} →
                </Link>
              </div>
              <RelatedProducts products={related} />
            </div>
          </section>
        )}
      </div>

      <Footer cms={cms} />
    </div>
  );
}

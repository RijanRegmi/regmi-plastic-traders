import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FeaturedCarousel from "@/components/product/FeaturedCarousel";
import {
  HomeReviewsCarousel,
  HomeBlogCarousel,
  BlogPost,
} from "@/components/ui/HomeCarousels";
import CountUp from "@/components/ui/CountUp";
import {
  FiStar,
  FiArrowRight,
  FiCheck,
  FiShoppingBag,
  FiUsers,
  FiAward,
  FiTruck,
  FiPackage,
  FiChevronRight,
  FiPhone,
} from "react-icons/fi";
import { Product, Review, StatItem } from "@/types";
import Reveal from "@/components/ui/Reveal";
import StaggerContainer, { StaggerItem } from "@/components/ui/StaggerContainer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";
const API_BASE = API.replace(/\/api$/, "");
const getImageUrl = (path?: string) => path ? (path.startsWith("http") ? path : `${API_BASE}${path}`) : "";

/** Unwrap CMS { value, label, type } wrapper objects */
function unwrap(raw: unknown): unknown {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    if ("value" in o) return o.value;
  }
  return raw;
}
function str(raw: unknown, fallback = ""): string {
  const v = unwrap(raw);
  return typeof v === "string" && v.trim() ? v : fallback;
}
function arr<T>(raw: unknown, fallback: T[]): T[] {
  const v = unwrap(raw);
  return Array.isArray(v) && v.length > 0 ? (v as T[]) : fallback;
}

export const dynamic = "force-dynamic";

async function getHomeData() {
  try {
    const [cmsRes, featuredRes, reviewsRes, globalRes, blogRes, blogCmsRes] =
      await Promise.allSettled([
        fetch(`${API}/cms/home`, { cache: "no-store" }),
        fetch(`${API}/products/featured`, { cache: "no-store" }),
        fetch(`${API}/reviews`, { cache: "no-store" }),
        fetch(`${API}/cms/global`, { cache: "no-store" }),
        fetch(`${API}/blog?limit=4`, { cache: "no-store" }),
        fetch(`${API}/cms/blog`, { cache: "no-store" }),
      ]);

    const homeCms =
      cmsRes.status === "fulfilled"
        ? (await cmsRes.value.json()).data || {}
        : {};
    const globalCms =
      globalRes.status === "fulfilled"
        ? (await globalRes.value.json()).data || {}
        : {};
    const blogCms = 
      blogCmsRes.status === "fulfilled"
        ? (await blogCmsRes.value.json()).data || {}
        : {};
    const featured =
      featuredRes.status === "fulfilled"
        ? (await featuredRes.value.json()).data || []
        : [];
    const reviewsJson =
      reviewsRes.status === "fulfilled"
        ? await reviewsRes.value.json()
        : { data: [], stats: { avgRating: 4.8, count: 0 } };
    const blogs =
      blogRes.status === "fulfilled"
        ? (await blogRes.value.json()).data || []
        : [];

    const merged = { ...globalCms, ...homeCms, ...blogCms } as Record<string, unknown>;
    const cms: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(merged)) cms[k] = unwrap(v);

    return {
      cms,
      featured: featured as Product[],
      reviews: (reviewsJson.data || []) as Review[],
      stats: reviewsJson.stats || { avgRating: 4.8, count: 0 },
      blogs,
    };
  } catch {
    return {
      cms: {},
      featured: [],
      reviews: [],
      stats: { avgRating: 4.8, count: 0 },
      blogs: [],
    };
  }
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
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

const STAT_ICONS = [FiUsers, FiPackage, FiAward, FiTruck];

export default async function HomePage() {
  const { cms, featured, reviews, stats, blogs } = await getHomeData();

  // ── Global ───────────────────────────────────────────────────────────────
  const storeName = str(cms.storeName, "Regmi Plastic Traders");
  const avgRating = (stats.avgRating as number) || 4.8;
  const reviewCount = (stats.count as number) || 0;

  // ── Hero background ───────────────────────────────────────────────────────
  const heroBgPath = str(cms.heroBgImage, "");
  const heroBgUrl = getImageUrl(heroBgPath);

  // ── Hero text ─────────────────────────────────────────────────────────────
  const heroBadge = str(cms.heroBadge, "Est. 2005 · Kathmandu, Nepal");
  const heroTitle = str(
    cms.heroTitle,
    "Nepal's Most Trusted Plastic Goods Store",
  );
  const heroSub = str(
    cms.heroSubtitle,
    "Durable, affordable, and high-quality plastic products for every home and business across Nepal.",
  );
  const heroBtn = str(cms.heroButtonText, "Shop Now");
  const heroBtnHref = str(cms.heroButtonHref, "/products");
  const heroGhost = str(cms.heroGhostText, "Our Story");
  const heroGhostHref = str(cms.heroGhostHref, "/about");
  const heroTrust1 = str(cms.heroTrust1, "Free Delivery");
  const heroTrust2 = str(cms.heroTrust2, "Quality Guaranteed");
  const heroTrust3 = str(cms.heroTrust3, "Nepal-Wide");
  const heroRatingLbl = str(cms.heroRatingLabel, "Verified Reviews");

  // ── Stats ─────────────────────────────────────────────────────────────────
  const statsItems: StatItem[] = [
    {
      value: str(cms.stat1Value, "15,000+"),
      label: str(cms.stat1Label, "Happy Customers"),
    },
    {
      value: str(cms.stat2Value, "500+"),
      label: str(cms.stat2Label, "Products Available"),
    },
    {
      value: str(cms.stat3Value, "19+"),
      label: str(cms.stat3Label, "Years of Experience"),
    },
    {
      value: str(cms.stat4Value, "50+"),
      label: str(cms.stat4Label, "Cities Served"),
    },
  ];

  // ── About ─────────────────────────────────────────────────────────────────
  const aboutLabel = str(cms.aboutSectionLabel, "Who Are We");
  const aboutHeading = str(cms.aboutSectionHeading, "Welcome to");
  const aboutText = str(
    cms.aboutText,
    "Regmi Plastic Traders has been serving Nepal since 2005, specializing in high-quality plastic household items, industrial containers, and storage solutions.",
  );
  const aboutCardEmoji = str(cms.aboutCardEmoji, "🏪");
  const aboutCardSub = str(cms.aboutCardSub, "Serving Nepal since 2005");
  const aboutFeature1 = str(cms.aboutFeature1, "100% Quality Guaranteed");
  const aboutFeature2 = str(cms.aboutFeature2, "Fast Delivery Across Nepal");
  const aboutFeature3 = str(cms.aboutFeature3, "Affordable Prices");
  const aboutFeature4 = str(
    cms.aboutFeature4,
    `${statsItems[0].value} Happy Customers`,
  );
  const aboutLearnText = str(cms.aboutLearnMoreText, "Learn More About Us");
  const aboutLearnHref = str(cms.aboutLearnMoreHref, "/about");

  // ── Products section ──────────────────────────────────────────────────────
  const prodLabel = str(cms.productsSectionLabel, "Handpicked for You");
  const prodHeading = str(cms.productsSectionHeading, "Discover Our");
  const prodSub = str(
    cms.productsSectionSub,
    "Browse our most popular plastic products, picked for quality and affordability.",
  );
  const prodViewAll = str(cms.productsViewAllText, "View All Products");
  const prodViewHref = str(cms.productsViewAllHref, "/products");

  // ── Reviews section ───────────────────────────────────────────────────────
  const revLabel = str(cms.reviewsSectionLabel, "Customer Reviews");
  const revHeading = str(cms.reviewsSectionHeading, "Trusted by");
  const revSubLabel = str(
    cms.reviewsRatingSubLabel,
    "Based on {n}+ Google Reviews",
  ).replace("{n}", reviewCount.toLocaleString());

  // ── Blog section ──────────────────────────────────────────────────────────
  const blogLabel = str(cms.blogSectionLabel, "Latest Updates");
  const blogHeading = str(cms.blogSectionHeading, "From Our");
  const blogSub = str(
    cms.blogSectionSub,
    "Articles, guides and news from Regmi Plastic Traders",
  );
  const blogAllText = str(cms.blogAllArticlesText, "All Articles");

  // ── CTA strip ─────────────────────────────────────────────────────────────
  const ctaTitle = str(cms.ctaTitle, "Ready to Shop Quality Plastic Products?");
  const ctaSub = str(
    cms.ctaSubtitle,
    "Browse 500+ products and get them delivered across Nepal",
  );
  const ctaBtn1Text = str(cms.ctaBtn1Text, "Browse Products");
  const ctaBtn1Href = str(cms.ctaBtn1Href, "/products");
  const ctaBtn2Text = str(cms.ctaBtn2Text, "Contact Us");
  const ctaBtn2Href = str(cms.ctaBtn2Href, "/contact");

  // Hero title split
  const words = heroTitle.split(" ");
  const half = Math.ceil(words.length / 2);
  const line1 = words.slice(0, half).join(" ");
  const line2 = words.slice(half).join(" ");

  return (
    <div className="rpt-page">
      <Header storeName={storeName} cms={cms} />

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="rpt-hero">
        <div className="rpt-hero__bg">
          <div className="rpt-hero__bg-base" />
          {heroBgUrl && (
            <div
              className="rpt-hero__bg-img"
              style={{ backgroundImage: `url(${heroBgUrl})` }}
            />
          )}
          <div className="rpt-hero__bg-glow1" />
          <div className="rpt-hero__bg-glow2" />
          <div className="rpt-hero__bg-grid" />
          <div className="rpt-hero__bg-vignette" />
        </div>

        <div className="rpt-hero__content">
          {/* Left */}
          <StaggerContainer className="rpt-hero__left">
            <StaggerItem>
              <div className="rpt-hero__badge">
                <span className="rpt-hero__badge-dot" />
                {heroBadge}
              </div>
            </StaggerItem>

            <StaggerItem>
              <h1 className="rpt-hero__title">
                <span className="rpt-hero__title-white">{line1}</span>
                <br />
                <span className="rpt-hero__title-em">{line2}</span>
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="rpt-hero__sub">{heroSub}</p>
            </StaggerItem>

            <StaggerItem>
              <div className="rpt-hero__rating">
                <Stars rating={avgRating} size={16} />
                <strong className="rpt-hero__rating-num">
                  {avgRating.toFixed(1)}
                </strong>
                <span className="rpt-hero__rating-label">
                  {reviewCount.toLocaleString()}+ {heroRatingLbl}
                </span>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="rpt-hero__ctas">
                <Link href={heroBtnHref} className="rpt-btn-primary">
                  <FiShoppingBag size={16} />
                  {heroBtn}
                  <FiArrowRight size={15} className="rpt-btn-arrow" />
                </Link>
                <Link href={heroGhostHref} className="rpt-btn-ghost">
                  {heroGhost}
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="rpt-hero__trust">
                {[heroTrust1, heroTrust2, heroTrust3]
                  .filter(Boolean)
                  .map((t) => (
                    <span key={t} className="rpt-hero__trust-item">
                      <FiCheck size={12} className="rpt-hero__trust-icon" /> {t}
                    </span>
                  ))}
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Right — stat cards */}
          <Reveal direction="left" delay={0.4} className="rpt-hero__right">
            <div className="rpt-stats-grid">
              {statsItems.map((s, i) => {
                const Icon = STAT_ICONS[i % STAT_ICONS.length];
                return (
                  <div key={i} className="rpt-stat-card">
                    <div className="rpt-stat-card__icon-wrap">
                      <Icon size={20} className="rpt-stat-card__icon" />
                    </div>
                    <div className="rpt-stat-card__value">
                      <CountUp value={s.value} duration={2000} />
                    </div>
                    <div className="rpt-stat-card__label">{s.label}</div>
                    <div className="rpt-stat-card__shine" />
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>

        <div className="rpt-hero__scroll">
          <div className="rpt-hero__scroll-line" />
          <span className="rpt-hero__scroll-text">Scroll</span>
        </div>
      </section>

      {/* ══════════════════════ ABOUT ══════════════════════ */}
      {aboutText && (
        <section className="rpt-section rpt-section--alt">
          <div className="rpt-container">
            <div className="rpt-about">
              <Reveal direction="right" delay={0.2} className="rpt-about__left">
                <p className="rpt-label">{aboutLabel}</p>
                <h2 className="rpt-heading">
                  {aboutHeading}{" "}
                  <span className="rpt-heading--yellow">
                    {storeName.split(" ")[0]}
                  </span>
                </h2>
                <p className="rpt-body">{aboutText}</p>
                <div className="rpt-about__mini-stats">
                  {statsItems.map((s, i) => (
                    <div key={i} className="rpt-mini-stat">
                      <div className="rpt-mini-stat__val">
                        <CountUp value={s.value} duration={1800} />
                      </div>
                      <div className="rpt-mini-stat__lbl">{s.label}</div>
                    </div>
                  ))}
                </div>
                <Link href={aboutLearnHref} className="rpt-link-arrow">
                  {aboutLearnText} <FiChevronRight size={14} />
                </Link>
              </Reveal>

              <Reveal direction="left" delay={0.4} className="rpt-about__right">
                {/* ── Card — rating badge now sits INSIDE the card flow ── */}
                <div
                  className="rpt-about__card"
                  style={{ paddingBottom: "40px" }}
                >
                  <div className="rpt-about__card-inner">
                    <div className="rpt-about__card-emoji">
                      {aboutCardEmoji}
                    </div>
                    <div className="rpt-about__card-name">{storeName}</div>
                    <div className="rpt-about__card-sub">{aboutCardSub}</div>
                    <div className="rpt-about__features">
                      {[
                        aboutFeature1,
                        aboutFeature2,
                        aboutFeature3,
                        aboutFeature4,
                      ]
                        .filter(Boolean)
                        .map((f) => (
                          <div key={f} className="rpt-feature-row">
                            <div className="rpt-feature-row__icon">
                              <FiCheck size={11} />
                            </div>
                            <span>{f}</span>
                          </div>
                        ))}
                    </div>

                    {/* Rating badge — inline, no longer absolutely positioned */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        background: "white",
                        border: "1px solid var(--border)",
                        borderRadius: "18px",
                        padding: "14px 20px",
                        boxShadow: "0 8px 28px rgba(0,0,0,0.1)",
                        marginTop: "24px",
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "34px",
                          fontWeight: 800,
                          color: "var(--yellow)",
                          lineHeight: 1,
                        }}
                      >
                        {avgRating.toFixed(1)}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <Stars rating={avgRating} size={14} />
                        <div className="rpt-about__rating-lbl">
                          {reviewCount.toLocaleString()}+ Google Reviews
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════ FEATURED PRODUCTS ══════════════════════ */}
      {featured.length > 0 && (
        <section className="rpt-section">
          <Reveal direction="up" className="rpt-container">
            <div className="rpt-section-head rpt-section-head--center">
              <p className="rpt-label">{prodLabel}</p>
              <h2 className="rpt-heading">
                {prodHeading}{" "}
                <span className="rpt-heading--yellow">Products</span>
              </h2>
              <p className="rpt-body rpt-body--center">{prodSub}</p>
            </div>
            <FeaturedCarousel products={featured} />
            <div className="rpt-section-footer">
              <Link href={prodViewHref} className="rpt-btn-outline">
                {prodViewAll} <FiArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* ══════════════════════ REVIEWS ══════════════════════ */}
      <section className="rpt-section rpt-section--alt">
          <div className="rpt-container">
            <Reveal direction="right" delay={0.2} className="rpt-reviews-head">
              <div>
                <p className="rpt-label">{revLabel}</p>
                <h2 className="rpt-heading">
                  {revHeading}{" "}
                  <span className="rpt-heading--yellow">Thousands</span>
                </h2>
              </div>
              <div className="rpt-rating-badge">
                <div className="rpt-rating-badge__num">
                  {avgRating.toFixed(1)}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "6px" }}
                >
                  <Stars rating={avgRating} size={17} />
                  <div className="rpt-rating-badge__sub">{revSubLabel}</div>
                </div>
              </div>
            </Reveal>
            <Reveal direction="left" delay={0.4}>
              <HomeReviewsCarousel reviews={reviews} />
            </Reveal>
          </div>
      </section>

      {/* ══════════════════════ BLOG ══════════════════════ */}
      {blogs.length > 0 && (
        <section className="rpt-section">
          <div className="rpt-container">
            <Reveal direction="right" delay={0.2} className="rpt-section-head">
              <div>
                <p className="rpt-label">{blogLabel}</p>
                <h2 className="rpt-heading">
                  {blogHeading}{" "}
                  <span className="rpt-heading--yellow">Blog</span>
                </h2>
                <p className="rpt-body">{blogSub}</p>
              </div>
              <Link
                href="/blog"
                className="rpt-link-arrow rpt-link-arrow--desktop"
              >
                {blogAllText} <FiChevronRight size={14} />
              </Link>
            </Reveal>
            <Reveal direction="left" delay={0.4}>
              <HomeBlogCarousel blogs={blogs as BlogPost[]} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ══════════════════════ CTA STRIP ══════════════════════ */}
      <section className="rpt-cta-strip">
          <Reveal direction="up" className="rpt-cta-strip__inner">
            <h2 className="rpt-cta-strip__title">{ctaTitle}</h2>
            <p className="rpt-cta-strip__sub">{ctaSub}</p>
            <div className="rpt-cta-strip__btns">
              <Link href={ctaBtn1Href} className="rpt-cta-strip__btn-white">
                <FiShoppingBag size={16} /> {ctaBtn1Text}
              </Link>
              <Link href={ctaBtn2Href} className="rpt-cta-strip__btn-outline">
                <FiPhone size={16} /> {ctaBtn2Text}
              </Link>
            </div>
          </Reveal>
      </section>

      <Footer cms={cms} />
    </div>
  );
}

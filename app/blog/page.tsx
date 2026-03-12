import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { BlogPost } from "@/types";
import { FiCalendar, FiChevronRight } from "react-icons/fi";
import BlogCarousel from "./../../components/blog/BlogCarousel";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";
const API_BASE = API.replace(/\/api$/, "");

async function getBlogData() {
  try {
    const [postsRes, cmsRes] = await Promise.allSettled([
      fetch(`${API}/blog`, { next: { revalidate: 60 } }),
      fetch(`${API}/cms/global`, { next: { revalidate: 60 } }),
    ]);
    return {
      posts:
        postsRes.status === "fulfilled"
          ? (await postsRes.value.json()).data || []
          : [],
      cms:
        cmsRes.status === "fulfilled"
          ? (await cmsRes.value.json()).data || {}
          : {},
    };
  } catch {
    return { posts: [], cms: {} };
  }
}

function unwrap(v: unknown, fallback = ""): string {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if ("value" in o) return String(o.value ?? "") || fallback;
  }
  return typeof v === "string" && v ? v : fallback;
}

export default async function BlogPage() {
  const { posts, cms } = await getBlogData();

  const sectionLabel = unwrap(cms?.blogSectionLabel, "Latest Updates");
  const sectionHeading = unwrap(cms?.blogSectionHeading, "From Our Blog");
  const sectionSub = unwrap(
    cms?.blogSectionSub,
    "Articles, guides and news from Regmi Plastic Traders",
  );

  return (
    <div className="rpt-page">
      <Header
        storeName={unwrap(cms?.storeName, "Regmi Plastic Traders")}
        cms={cms}
      />

      <div className="rpt-page-hero">
        <div className="rpt-page-hero__bg" />
        <div className="rpt-page-hero__content">
          <p className="rpt-label">{sectionLabel}</p>
          <h1 className="rpt-page-hero__title">Our Blog</h1>
          <p className="rpt-page-hero__sub">{sectionSub}</p>
        </div>
      </div>

      <main className="rpt-page-body">
        {posts.length === 0 ? (
          <section
            className="rpt-section"
            style={{ paddingTop: 80, paddingBottom: 96 }}
          >
            <div className="rpt-container">
              <div className="rpt-empty-state">
                <div className="rpt-empty-state__emoji">📝</div>
                <h3 className="rpt-empty-state__title">No blog posts yet</h3>
                <p className="rpt-empty-state__sub">
                  Check back soon for articles and guides.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* ── Recent posts carousel (only when >4 posts) ── */}
            {posts.length > 4 && (
              <section
                style={{
                  background: "#f7f5f3",
                  padding: "56px 0 48px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div className="rpt-container">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      marginBottom: 28,
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div>
                      <p className="rpt-label" style={{ marginBottom: 6 }}>
                        {sectionLabel}
                      </p>
                      <h2
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 28,
                          fontWeight: 700,
                          color: "var(--text-1)",
                          margin: 0,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {sectionHeading}
                      </h2>
                    </div>
                  </div>
                  <BlogCarousel posts={posts.slice(0, 8)} />
                </div>
              </section>
            )}

            {/* ── All posts grid ── */}
            <section
              className="rpt-section"
              style={{ paddingTop: 64, paddingBottom: 96 }}
            >
              <div className="rpt-container">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    marginBottom: 28,
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <p className="rpt-label" style={{ marginBottom: 6 }}>
                      All Articles
                    </p>
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 28,
                        fontWeight: 700,
                        color: "var(--text-1)",
                        margin: 0,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Browse Everything
                    </h2>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      color: "var(--text-4)",
                      margin: 0,
                    }}
                  >
                    {posts.length} article{posts.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="rpt-blog-grid">
                  {posts.map((p: BlogPost) => (
                    <Link
                      key={p._id}
                      href={`/blog/${p.slug}`}
                      className="rpt-blog-card"
                    >
                      <div className="rpt-blog-card__img">
                        {p.coverImage ? (
                          <img
                            src={`${API_BASE}${p.coverImage}`}
                            alt={p.title}
                          />
                        ) : (
                          <div className="rpt-blog-card__emoji">📰</div>
                        )}
                        {p.tags?.[0] && (
                          <span className="rpt-blog-card__tag">
                            {p.tags[0]}
                          </span>
                        )}
                      </div>
                      <div className="rpt-blog-card__body">
                        <h2 className="rpt-blog-card__title">{p.title}</h2>
                        <p className="rpt-blog-card__excerpt">{p.excerpt}</p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: "auto",
                            paddingTop: 12,
                          }}
                        >
                          <span className="rpt-blog-card__date">
                            <FiCalendar size={10} />
                            {new Date(p.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="rpt-blog-card__read">
                            Read <FiChevronRight size={11} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer cms={cms} />
    </div>
  );
}

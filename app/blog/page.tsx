import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { BlogPost } from "@/types";
import { FiCalendar, FiChevronRight } from "react-icons/fi";
import BlogCarousel from "./../../components/blog/BlogCarousel";
import Reveal from "@/components/ui/Reveal";
import StaggerContainer, { StaggerItem } from "@/components/ui/StaggerContainer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";
const API_BASE = API.replace(/\/api$/, "");
const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("regmi-plastic/")) return `https://res.cloudinary.com/dkmbfnuch/image/upload/${path}`;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const dynamic = "force-dynamic";

async function getBlogData() {
  try {
    const [postsRes, cmsGlobalRes, cmsBlogRes] = await Promise.allSettled([
      fetch(`${API}/blog`, { cache: 'no-store' }),
      fetch(`${API}/cms/global`, { cache: 'no-store' }),
      fetch(`${API}/cms/blog`, { cache: 'no-store' }),
    ]);
    const globalCms = cmsGlobalRes.status === "fulfilled" ? (await cmsGlobalRes.value.json()).data || {} : {};
    const blogCms = cmsBlogRes.status === "fulfilled" ? (await cmsBlogRes.value.json()).data || {} : {};

    return {
      posts:
        postsRes.status === "fulfilled"
          ? (await postsRes.value.json()).data || []
          : [],
      cms: { ...globalCms, ...blogCms }
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

  const blogBgPath = unwrap(cms?.blogBgImage, "");
  const blogBgUrl = getImageUrl(blogBgPath);

  return (
    <div className="rpt-page">
      <Header
        storeName={unwrap(cms?.storeName, "Regmi Plastic Traders")}
        cms={cms}
      />

      <div className="rpt-page-hero">
        <div className="rpt-page-hero__bg">
          {blogBgUrl && (
            <img
              src={blogBgUrl}
              alt="Blog Banner"
              className="rpt-page-hero__bg-img"
            />
          )}
        </div>
        <Reveal direction="up" className="rpt-page-hero__content">
          <p className="rpt-label">{sectionLabel}</p>
          <h1 className="rpt-page-hero__title">{sectionHeading}</h1>
          <p className="rpt-page-hero__sub">{sectionSub}</p>
        </Reveal>
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
                    <Reveal direction="up">
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
                    </Reveal>
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
                  <Reveal direction="up" style={{ width: "100%" }}>
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
                  </Reveal>

                <StaggerContainer className="rpt-blog-grid">
                  {posts.map((p: BlogPost) => (
                    <StaggerItem key={p._id}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="rpt-blog-card"
                      >
                        <div className="rpt-blog-card__img">
                          {p.coverImage ? (
                            <img
                              src={getImageUrl(p.coverImage)}
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
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer cms={cms} />
    </div>
  );
}

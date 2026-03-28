import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FiArrowLeft,
  FiCalendar,
  FiUser,
  FiTag,
  FiChevronRight,
} from "react-icons/fi";
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

async function getBlogPost(slug: string) {
  try {
    const [postRes, cmsRes] = await Promise.allSettled([
      fetch(`${API}/blog/${slug}`, { next: { revalidate: 60 } }),
      fetch(`${API}/cms/global`, { next: { revalidate: 60 } }),
    ]);
    const post =
      postRes.status === "fulfilled" ? (await postRes.value.json()).data : null;
    const cms =
      cmsRes.status === "fulfilled"
        ? (await cmsRes.value.json()).data || {}
        : {};
    return { post, cms };
  } catch {
    return { post: null, cms: {} };
  }
}

async function getRelatedPosts(currentSlug: string) {
  try {
    const res = await fetch(`${API}/blog?limit=3`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return (data.data || []).filter(
      (p: { slug: string }) => p.slug !== currentSlug,
    );
  } catch {
    return [];
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { post, cms } = await getBlogPost(slug);
  const related = await getRelatedPosts(slug);
  if (!post) notFound();
  const storeName = (cms.storeName as string) || "Regmi Plastic Traders";

  return (
    <div className="rpt-page">
      <Header storeName={storeName} />

      {/* Hero — with cover image if available */}
      <div
        className="rpt-post-hero"
        style={
          post.coverImage
            ? {
                position: "relative",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {/* Cover image background */}
        {post.coverImage && (
          <>
            <img
              src={getImageUrl(post.coverImage)}
              alt={post.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                zIndex: 0,
              }}
            />
            {/* Dark overlay so text stays readable */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.75) 100%)",
                zIndex: 1,
              }}
            />
          </>
        )}

        {/* Default bg (only shows when no cover image) */}
        {!post.coverImage && <div className="rpt-page-hero__bg" />}

        <Reveal direction="up" className="rpt-post-hero__content" style={{ position: "relative", zIndex: 2 }}>
          <Link href="/blog" className="rpt-back-link">
            <FiArrowLeft size={14} /> Back to Blog
          </Link>
          {post.tags?.length > 0 && (
            <div className="rpt-post-hero__tags">
              {post.tags.map((tag: string) => (
                <span key={tag} className="rpt-post-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="rpt-post-hero__title">{post.title}</h1>
          <div className="rpt-post-hero__meta">
            <span>
              <FiCalendar size={13} />{" "}
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>
              <FiUser size={13} /> {post.author}
            </span>
          </div>
        </Reveal>
      </div>

      <main className="rpt-page-body">
        <Reveal direction="up" className="rpt-post-body">
          {/* Excerpt */}
          <p className="rpt-post-excerpt">{post.excerpt}</p>

          {/* Cover image — also shown inline at top of article if present */}
          {post.coverImage && (
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 32,
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <img
                src={getImageUrl(post.coverImage)}
                alt={post.title}
                style={{
                  width: "100%",
                  maxHeight: 420,
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          )}

          {/* Content */}
          <div
            className="rpt-blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="rpt-post-tags-row">
              <FiTag size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
              {post.tags.map((tag: string) => (
                <span key={tag} className="rpt-post-tag--outline">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author card */}
          <div className="rpt-author-card">
            <div className="rpt-author-card__avatar">
              {post.author?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <div className="rpt-author-card__by">Written by</div>
              <div className="rpt-author-card__name">{post.author}</div>
              <div className="rpt-author-card__store">{storeName}</div>
            </div>
          </div>

          <Link
            href="/blog"
            className="rpt-btn-outline"
            style={{ display: "inline-flex", marginTop: "32px" }}
          >
            <FiArrowLeft size={14} /> All Blog Posts
          </Link>
        </Reveal>

        {/* Related */}
        {related.length > 0 && (
          <section
            className="rpt-section rpt-section--alt"
            style={{ paddingTop: "72px", paddingBottom: "72px" }}
          >
            <div className="rpt-container">
              <div className="rpt-section-head rpt-section-head--center">
                <h2 className="rpt-heading">
                  More <span className="rpt-heading--yellow">Articles</span>
                </h2>
              </div>
              <StaggerContainer className="rpt-3col-grid">
                {related.map(
                  (p: {
                    _id: string;
                    slug: string;
                    title: string;
                    excerpt: string;
                    author: string;
                    createdAt: string;
                    coverImage?: string;
                  }) => (
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
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          ) : (
                            <div className="rpt-blog-card__emoji">📰</div>
                          )}
                        </div>
                        <div className="rpt-blog-card__body">
                          <div className="rpt-blog-card__date">
                            <FiCalendar size={11} />
                            {new Date(p.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <h3 className="rpt-blog-card__title">{p.title}</h3>
                          <p className="rpt-blog-card__excerpt">{p.excerpt}</p>
                          <span className="rpt-blog-card__read">
                            Read More <FiChevronRight size={12} />
                          </span>
                        </div>
                      </Link>
                    </StaggerItem>
                  ),
                )}
              </StaggerContainer>
            </div>
          </section>
        )}
      </main>
      <Footer cms={cms} />
    </div>
  );
}

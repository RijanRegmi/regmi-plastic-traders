"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import { BlogPost } from "@/types";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api"
).replace(/\/api$/, "");
const getImageUrl = (path?: string) => path ? (path.startsWith("http") ? path : `${API_BASE}${path}`) : "";

export default function BlogCarousel({ posts }: { posts: BlogPost[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const check = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [posts]);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -680 : 680, behavior: "smooth" });
    setTimeout(check, 350);
  };

  if (!posts.length) return null;

  return (
    <div className="rpt-blog-carousel">
      {/* Left button */}
      <button
        onClick={() => scroll("left")}
        className={`rpt-blog-carousel__btn rpt-blog-carousel__btn--left ${!canLeft ? "rpt-blog-carousel__btn--hidden" : ""}`}
        aria-label="Scroll left"
      >
        <FiChevronLeft size={18} />
      </button>

      {/* Track */}
      <div ref={trackRef} onScroll={check} className="rpt-blog-carousel__track">
        {posts.map((p) => (
          <div key={p._id} className="rpt-blog-carousel__item">
            <Link href={`/blog/${p.slug}`} className="rpt-blog-card">
              {/* Image */}
              <div className="rpt-blog-card__img">
                {p.coverImage ? (
                  <img src={getImageUrl(p.coverImage)} alt={p.title} />
                ) : (
                  <div className="rpt-blog-card__emoji">📰</div>
                )}
                {p.tags?.[0] && (
                  <span className="rpt-blog-card__tag">{p.tags[0]}</span>
                )}
              </div>

              {/* Body */}
              <div className="rpt-blog-card__body">
                <h3 className="rpt-blog-card__title">{p.title}</h3>
                <p className="rpt-blog-card__excerpt">{p.excerpt}</p>
                <div
                  className="rpt-blog-card__meta"
                  style={{ marginTop: "auto", paddingTop: 10 }}
                >
                  <span className="rpt-blog-card__date">
                    <FiCalendar size={10} />
                    {new Date(p.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Right button */}
      <button
        onClick={() => scroll("right")}
        className={`rpt-blog-carousel__btn rpt-blog-carousel__btn--right ${!canRight ? "rpt-blog-carousel__btn--hidden" : ""}`}
        aria-label="Scroll right"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
}

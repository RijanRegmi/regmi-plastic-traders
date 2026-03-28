"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";

const AUTO_INTERVAL = 5000;
const TRANSITION_MS = 400;

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api"
).replace(/\/api$/, "");

export interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  createdAt: string;
  tags?: string[];
  coverImage?: string;
}

export default function BlogCarousel({
  blogs,
  allText = "All Articles",
}: {
  blogs: BlogPost[];
  allText?: string;
}) {
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  const count = blogs.length;

  const goTo = useCallback(
    (idx: number, dir: "left" | "right") => {
      if (!visible) return;
      setAnimDir(dir);
      setVisible(false);
      setTimeout(() => {
        setCurrent((idx + count) % count);
        setVisible(true);
        setAnimDir(null);
      }, TRANSITION_MS);
    },
    [visible, count],
  );

  const next = useCallback(() => goTo(current + 1, "left"), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1, "right"), [goTo, current]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) next();
    }, AUTO_INTERVAL);
  }, [next]);

  useEffect(() => {
    if (count < 2) return;
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer, count]);

  if (count === 0) return null;

  const VISIBLE = 3;
  const indices = Array.from(
    { length: Math.min(VISIBLE, count) },
    (_, i) => (current + i) % count,
  );

  const slideStyle: React.CSSProperties = {
    transition: visible
      ? `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`
      : "none",
    opacity: visible ? 1 : 0,
    transform: visible
      ? "translateX(0)"
      : animDir === "left"
        ? "translateX(-24px)"
        : "translateX(24px)",
  };

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      {/* ── Cards ── */}
      <div style={slideStyle}>
        <div className="rpt-carousel-track">
          {indices.map((idx) => {
            const b = blogs[idx];
            return (
              <Link
                key={`${idx}-${b._id}`}
                href={`/blog/${b.slug}`}
                className="rpt-blog-card rpt-carousel-card"
              >
                <div className="rpt-blog-card__img">
                  {b.coverImage ? (
                    <img
                      src={getImageUrl(b.coverImage)}
                      alt={b.title}
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
                  {b.tags?.[0] && (
                    <span className="rpt-blog-card__tag">{b.tags[0]}</span>
                  )}
                </div>
                <div className="rpt-blog-card__body">
                  <div className="rpt-blog-card__date">
                    <FiCalendar size={11} />
                    {new Date(b.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <h3 className="rpt-blog-card__title">{b.title}</h3>
                  <p className="rpt-blog-card__excerpt">{b.excerpt}</p>
                  <span className="rpt-blog-card__read">
                    Read More <FiChevronRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Prev / Next ── */}
      {count > 1 && (
        <>
          <button
            onClick={() => {
              prev();
              startTimer();
            }}
            className="rpt-carousel-btn rpt-carousel-btn--left"
            aria-label="Previous post"
            style={{ top: "45%", transform: "translateY(-50%)" }}
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={() => {
              next();
              startTimer();
            }}
            className="rpt-carousel-btn rpt-carousel-btn--right"
            aria-label="Next post"
            style={{ top: "45%", transform: "translateY(-50%)" }}
          >
            <FiChevronRight size={20} />
          </button>
        </>
      )}

      {/* ── Dots + counter ── */}
      {count > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginTop: 28,
          }}
        >
          <div style={{ display: "flex", gap: 7 }}>
            {blogs.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  goTo(i, i > current ? "left" : "right");
                  startTimer();
                }}
                aria-label={`Go to post ${i + 1}`}
                style={{
                  width: i === current ? 22 : 7,
                  height: 7,
                  borderRadius: 99,
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  background:
                    i === current ? "var(--yellow)" : "rgba(255,255,255,0.12)",
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              color: "var(--text-4)",
            }}
          >
            {current + 1} / {count}
          </span>
        </div>
      )}

      {/* ── Auto-play progress bar ── */}
      {count > 1 && (
        <div
          style={{
            height: 2,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 99,
            marginTop: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((current + 1) / count) * 100}%`,
              background: "linear-gradient(90deg, var(--yellow), var(--red))",
              borderRadius: 99,
              transition: `width ${TRANSITION_MS}ms ease`,
            }}
          />
        </div>
      )}
    </div>
  );
}

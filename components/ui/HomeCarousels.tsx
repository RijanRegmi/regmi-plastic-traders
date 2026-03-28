"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiCalendar,
} from "react-icons/fi";
import { Review } from "@/types";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api"
).replace(/\/api$/, "");
const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("regmi-plastic/")) return `https://res.cloudinary.com/dkmbfnuch/image/upload/${path}`;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

const ANIM_MS = 380;
const CARD_W = 300;
const GAP = 18;
const STEP = CARD_W + GAP;
const VISIBLE = 3; // cards visible at once — clone this many at each end

export interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  createdAt: string;
  tags?: string[];
  coverImage?: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="rpt-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <FiStar
          key={i}
          size={14}
          className={i <= Math.round(rating) ? "rpt-star--on" : "rpt-star--off"}
        />
      ))}
    </span>
  );
}

function Arrow({
  dir,
  onClick,
}: {
  dir: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === "left" ? "Previous" : "Next"}
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [dir]: 12,
        zIndex: 10,
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: "var(--dark-3)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "rgba(255,255,255,0.7)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        transition: "background 0.2s, color 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--red)";
        e.currentTarget.style.borderColor = "var(--red)";
        e.currentTarget.style.color = "white";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--dark-3)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        e.currentTarget.style.color = "rgba(255,255,255,0.7)";
      }}
    >
      {dir === "left" ? (
        <FiChevronLeft size={20} />
      ) : (
        <FiChevronRight size={20} />
      )}
    </button>
  );
}

function Dots({
  count,
  current,
  accent,
  onDot,
}: {
  count: number;
  current: number;
  accent: string;
  onDot: (i: number) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 7,
        marginTop: 24,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDot(i)}
          aria-label={`Slide ${i + 1}`}
          style={{
            width: i === current ? 24 : 7,
            height: 7,
            borderRadius: 99,
            border: "none",
            cursor: "pointer",
            padding: 0,
            background: i === current ? accent : "rgba(255,255,255,0.13)",
            transition: "width 0.3s ease, background 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

// Clone VISIBLE items from each end so the track is always full
function buildPadded<T>(items: T[]): T[] {
  const n = items.length;
  const head = items.slice(n - VISIBLE); // last N items → prepended
  const tail = items.slice(0, VISIBLE); // first N items → appended
  return [...head, ...items, ...tail];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
function useInfiniteCarousel(count: number, intervalMs: number) {
  // We keep a mutable ref to the track DOM node so we can set its transform
  // via a ref-callback that fires synchronously before the browser paints —
  // this is what eliminates the empty-space flash on first render.
  const trackNodeRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef(VISIBLE); // current padded index
  const pausedRef = useRef(false);
  const lockedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [dotIdx, setDotIdx] = useState(0);

  const px = (p: number) => p * STEP;

  const animTo = useCallback((p: number) => {
    const t = trackNodeRef.current;
    if (!t) return;
    t.style.transition = `transform ${ANIM_MS}ms cubic-bezier(0.25,0.46,0.45,0.94)`;
    t.style.transform = `translateX(-${px(p)}px)`;
  }, []);

  const snapTo = useCallback((p: number) => {
    const t = trackNodeRef.current;
    if (!t) return;
    t.style.transition = "none";
    t.style.transform = `translateX(-${px(p)}px)`;
  }, []);

  // ── ref callback: called the moment the <div> is inserted into the DOM,
  //    before the first paint, so the initial position is correct immediately.
  const trackRef = useCallback(
    (node: HTMLDivElement | null) => {
      trackNodeRef.current = node;
      if (node) {
        node.style.transition = "none";
        node.style.transform = `translateX(-${px(VISIBLE)}px)`;
      }
    },
    // px uses STEP which is a module constant — safe to exclude from deps
    [], // eslint-disable-line
  );

  const slide = useCallback(
    (dir: 1 | -1) => {
      if (lockedRef.current || count < 2) return;
      lockedRef.current = true;

      const next = posRef.current + dir;
      posRef.current = next;
      animTo(next);

      setTimeout(() => {
        let snapped = next;
        if (next >= VISIBLE + count)
          snapped = next - count; // past tail clones → real start
        else if (next < VISIBLE) snapped = next + count; // past head clones → real end

        if (snapped !== next) {
          snapTo(snapped);
          posRef.current = snapped;
        }

        setDotIdx((((snapped - VISIBLE) % count) + count) % count);
        lockedRef.current = false;
      }, ANIM_MS + 30);
    },
    [count, animTo, snapTo],
  );

  const next = useCallback(() => slide(1), [slide]);
  const prev = useCallback(() => slide(-1), [slide]);

  const goToDot = useCallback(
    (i: number) => {
      if (lockedRef.current || count < 2) return;
      lockedRef.current = true;
      const target = VISIBLE + i;
      posRef.current = target;
      animTo(target);
      setTimeout(() => {
        setDotIdx(i);
        lockedRef.current = false;
      }, ANIM_MS + 30);
    },
    [count, animTo],
  );

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count < 2) return;
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) next();
    }, intervalMs);
  }, [next, intervalMs, count]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  return { dotIdx, trackRef, pausedRef, next, prev, goToDot, startTimer };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEWS CAROUSEL
// ═══════════════════════════════════════════════════════════════════════════════
export function HomeReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const count = reviews.length;
  const padded = count > 0 ? buildPadded(reviews) : [];
  const { dotIdx, trackRef, pausedRef, next, prev, goToDot, startTimer } =
    useInfiniteCarousel(count, 4000);

  if (count === 0) return <div className="rpt-empty">No reviews yet.</div>;

  return (
    <div
      style={{ position: "relative", padding: "0 28px" }}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div style={{ overflow: "hidden" }}>
        <div
          ref={trackRef}
          style={{ display: "flex", gap: GAP, willChange: "transform" }}
        >
          {padded.map((r, i) => (
            <div key={i} style={{ flexShrink: 0, width: CARD_W }}>
              <div className="rpt-review-card" style={{ height: "100%" }}>
                <div className="rpt-review-card__bar" />
                <div className="rpt-review-card__body">
                  <Stars rating={r.rating} />
                  <p className="rpt-review-card__text">
                    &ldquo;{r.text}&rdquo;
                  </p>
                  <div className="rpt-review-card__author">
                    <div className="rpt-review-card__avatar">
                      {r.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="rpt-review-card__name">{r.name}</div>
                      <div className="rpt-review-card__role">
                        Verified Customer
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {count > 1 && (
        <>
          <Arrow
            dir="left"
            onClick={() => {
              prev();
              startTimer();
            }}
          />
          <Arrow
            dir="right"
            onClick={() => {
              next();
              startTimer();
            }}
          />
          <Dots
            count={count}
            current={dotIdx}
            accent="var(--red)"
            onDot={(i) => {
              goToDot(i);
              startTimer();
            }}
          />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOG CAROUSEL
// ═══════════════════════════════════════════════════════════════════════════════
export function HomeBlogCarousel({ blogs }: { blogs: BlogPost[] }) {
  const count = blogs.length;
  const padded = count > 0 ? buildPadded(blogs) : [];
  const { dotIdx, trackRef, pausedRef, next, prev, goToDot, startTimer } =
    useInfiniteCarousel(count, 5000);

  if (count === 0) return null;

  return (
    <div
      style={{ position: "relative", padding: "0 28px" }}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div style={{ overflow: "hidden" }}>
        <div
          ref={trackRef}
          style={{ display: "flex", gap: GAP, willChange: "transform" }}
        >
          {padded.map((b, i) => (
            <div key={i} style={{ flexShrink: 0, width: CARD_W }}>
              <Link
                href={`/blog/${b.slug}`}
                className="rpt-blog-card"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
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
            </div>
          ))}
        </div>
      </div>
      {count > 1 && (
        <>
          <Arrow
            dir="left"
            onClick={() => {
              prev();
              startTimer();
            }}
          />
          <Arrow
            dir="right"
            onClick={() => {
              next();
              startTimer();
            }}
          />
          <Dots
            count={count}
            current={dotIdx}
            accent="var(--yellow)"
            onDot={(i) => {
              goToDot(i);
              startTimer();
            }}
          />
        </>
      )}
    </div>
  );
}

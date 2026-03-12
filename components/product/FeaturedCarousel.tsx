"use client";
import { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "./ProductCard";
import { Product } from "@/types";

export default function FeaturedCarousel({
  products,
}: {
  products: Product[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [products]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  };

  if (products.length === 0) {
    return (
      <div className="rpt-empty-state">
        <div className="rpt-empty-state__emoji">📦</div>
        <p className="rpt-empty-state__sub">No featured products yet.</p>
      </div>
    );
  }

  // Use grid for ≤4 products
  if (products.length <= 4) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "18px",
        }}
      >
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Left button */}
      <button
        onClick={() => scroll("left")}
        className={`rpt-carousel-btn rpt-carousel-btn--left ${!canLeft ? "rpt-carousel-btn--hidden" : ""}`}
        aria-label="Scroll left"
      >
        <FiChevronLeft size={20} />
      </button>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        style={{
          display: "flex",
          gap: "18px",
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingBottom: "4px",
        }}
      >
        {products.map((p) => (
          <div key={p._id} style={{ flexShrink: 0, width: "280px" }}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Right button */}
      <button
        onClick={() => scroll("right")}
        className={`rpt-carousel-btn rpt-carousel-btn--right ${!canRight ? "rpt-carousel-btn--hidden" : ""}`}
        aria-label="Scroll right"
      >
        <FiChevronRight size={20} />
      </button>

      {/* Dot indicators */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "6px",
          marginTop: "24px",
        }}
      >
        {products.map((_, i) => (
          <div
            key={i}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "rgba(192,57,43,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

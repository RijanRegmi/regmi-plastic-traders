"use client";
import { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "@/components/product/ProductCard";
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

  // Remove the `if (products.length <= 4)` bypass to ALWAYS show carousel if there are products
  
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => scroll("left")}
        className={`rpt-carousel-btn rpt-carousel-btn--left${!canLeft ? " rpt-carousel-btn--hidden" : ""}`}
        aria-label="Scroll left"
      >
        <FiChevronLeft size={20} />
      </button>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        style={{
          display: "flex",
          gap: 18,
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none",
          paddingBottom: 4,
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        {products.map((p) => (
          <div key={p._id} style={{ flexShrink: 0, width: 280 }}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className={`rpt-carousel-btn rpt-carousel-btn--right${!canRight ? " rpt-carousel-btn--hidden" : ""}`}
        aria-label="Scroll right"
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  );
}

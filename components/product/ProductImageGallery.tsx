"use client";
import { useState } from "react";
import { FiZoomIn, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Props {
  images: string[];
  name: string;
  badge?: string;
  inStock: boolean;
}

const BADGE_CLASS: Record<string, string> = {
  "Best Seller": "rpt-pc__badge--red",
  Popular: "rpt-pc__badge--orange",
  New: "rpt-pc__badge--green",
  "Top Rated": "rpt-pc__badge--yellow",
  Sale: "rpt-pc__badge--orange",
  Limited: "rpt-pc__badge--red",
};

export default function ProductImageGallery({
  images,
  name,
  badge,
  inStock,
}: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const hasImages = images.length > 0;
  const activeImg = hasImages ? images[activeIdx] : null;

  const prev = () => setActiveIdx((i) => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setActiveIdx((i) => (i < images.length - 1 ? i + 1 : 0));

  return (
    <>
      <div className="rpt-gallery">
        {/* ── Main Image ── */}
        <div className="rpt-gallery__main">
          {activeImg ? (
            <img
              src={activeImg}
              alt={`${name} — image ${activeIdx + 1}`}
              className="rpt-gallery__main-img"
            />
          ) : (
            <div className="rpt-gallery__placeholder">
              <span style={{ fontSize: 80, opacity: 0.15 }}>📦</span>
              <p style={{ color: "var(--text-4)", fontSize: 13, marginTop: 12 }}>
                No image available
              </p>
            </div>
          )}

          {badge && (
            <span
              className={`rpt-pc__badge ${BADGE_CLASS[badge] || "rpt-pc__badge--red"}`}
              style={{ top: 16, right: 16, left: "auto", position: "absolute" }}
            >
              {badge}
            </span>
          )}

          {!inStock && (
            <div className="rpt-gallery__oos">
              <span className="rpt-gallery__oos-label">Out of Stock</span>
            </div>
          )}

          {activeImg && (
            <button
              onClick={() => setLightbox(true)}
              className="rpt-gallery__zoom-btn"
              title="View full size"
            >
              <FiZoomIn size={18} />
            </button>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="rpt-gallery__nav rpt-gallery__nav--prev"
                aria-label="Previous image"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="rpt-gallery__nav rpt-gallery__nav--next"
                aria-label="Next image"
              >
                <FiChevronRight size={20} />
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="rpt-gallery__dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`rpt-gallery__dot${i === activeIdx ? " rpt-gallery__dot--active" : ""}`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Thumbnails ── */}
        {images.length > 1 && (
          <div className="rpt-gallery__thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`rpt-gallery__thumb${i === activeIdx ? " rpt-gallery__thumb--active" : ""}`}
                aria-label={`View image ${i + 1}`}
              >
                <img src={img} alt={`${name} thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && activeImg && (
        <div className="rpt-lightbox" onClick={() => setLightbox(false)}>
          <button
            className="rpt-lightbox__close"
            onClick={() => setLightbox(false)}
            aria-label="Close"
          >
            ✕
          </button>

          {images.length > 1 && (
            <>
              <button
                className="rpt-lightbox__prev"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous"
              >
                <FiChevronLeft size={28} />
              </button>
              <button
                className="rpt-lightbox__next"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next"
              >
                <FiChevronRight size={28} />
              </button>
            </>
          )}

          <img
            src={activeImg}
            alt={name}
            className="rpt-lightbox__img"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <p className="rpt-lightbox__counter">
              {activeIdx + 1} / {images.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
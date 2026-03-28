"use client";

import Link from "next/link";
import { FiStar } from "react-icons/fi";
import { HiFire } from "react-icons/hi";
import { Product } from "@/types";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="rpt-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <FiStar
          key={i}
          size={13}
          className={i <= Math.round(rating) ? "rpt-star--on" : "rpt-star--off"}
        />
      ))}
    </div>
  );
}

const BADGE_CLASS: Record<string, string> = {
  "Best Seller": "rpt-pc__badge--red",
  Popular: "rpt-pc__badge--orange",
  New: "rpt-pc__badge--green",
  "Top Rated": "rpt-pc__badge--yellow",
  Sale: "rpt-pc__badge--orange",
  Limited: "rpt-pc__badge--red",
};

export default function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="rpt-pc"
    >
      {/* ── Image ── */}
      <Link href={`/products/${product.slug}`} className="rpt-pc__img-wrap">
        {firstImage ? (
          <img src={firstImage} alt={product.name} className="rpt-pc__img" />
        ) : (
          <div className="rpt-pc__no-img">📦</div>
        )}

        {product.badge && (
          <span
            className={`rpt-pc__badge ${BADGE_CLASS[product.badge] || "rpt-pc__badge--red"}`}
          >
            {product.badge}
          </span>
        )}

        {!product.inStock && (
          <div className="rpt-pc__oos">
            <span className="rpt-pc__oos-label">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* ── Body ── */}
      <div className="rpt-pc__body">
        <Link href={`/products/${product.slug}`} className="rpt-pc__name-link">
          <h3 className="rpt-pc__name">{product.name}</h3>
        </Link>

        <p className="rpt-pc__desc">{product.description}</p>

        <div className="rpt-pc__stars-row">
          <Stars rating={product.rating} />
          <span className="rpt-pc__review-count">({product.reviewCount})</span>
        </div>

        {/* Price block */}
        <div className="rpt-pc__price-block">
          <span className="rpt-pc__price">
            Rs {product.price.toLocaleString()}
          </span>
        </div>

        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href={product.darazLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rpt-pc__buy-btn"
        >
          <HiFire size={14} />
          BUY ON DARAZ
        </motion.a>
      </div>
    </motion.div>
  );
}

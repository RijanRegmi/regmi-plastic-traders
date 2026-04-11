"use client";

import Link from "next/link";
import Image from "next/image";
import { FiStar, FiShoppingBag } from "react-icons/fi";
import { Product } from "@/types";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

const BADGE_CLASS: Record<string, string> = {
  "Best Seller": "rpt-pc__badge--red",
  Popular: "rpt-pc__badge--orange",
  New: "rpt-pc__badge--green",
  "Top Rated": "rpt-pc__badge--yellow",
  Sale: "rpt-pc__badge--orange",
  Limited: "rpt-pc__badge--red",
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = Math.round(rating);
  return (
    <div className="rpt-pc__rating">
      <div className="rpt-pc__stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <FiStar
            key={i}
            size={11}
            className={i <= stars ? "rpt-star--on" : "rpt-star--off"}
            style={{ fill: i <= stars ? "#f59e0b" : "none", flexShrink: 0 }}
          />
        ))}
      </div>
      {count > 0 && <span className="rpt-pc__count">({count})</span>}
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "40px" }}
      transition={{ duration: 0.25 }}
      className="rpt-pc--premium"
    >
      {/* ── Image ── */}
      <Link href={`/products/${product.slug}`} className="rpt-pc__img-wrap">
        <div className="rpt-pc__glass-overlay">
          <span className="rpt-pc__quick-view">View Details</span>
        </div>
        {firstImage ? (
          <Image
            src={firstImage}
            alt={product.name}
            fill
            className="rpt-pc__img"
            sizes="(max-width: 480px) 90vw, (max-width: 860px) 45vw, (max-width: 1200px) 30vw, 22vw"
          />
        ) : (
          <div className="rpt-pc__no-img">📦</div>
        )}

        {product.badge && (
          <span className={`rpt-pc__badge ${BADGE_CLASS[product.badge] || "rpt-pc__badge--red"}`}>
            <span className="rpt-pc__badge-dot"></span>
            {product.badge}
          </span>
        )}

        {product.category && (
          <span className="rpt-pc__cat-chip">
            {product.category}
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

        <div className="rpt-pc__price-row">
          <span className="rpt-pc__price">
            Rs.{product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="rpt-pc__orig-price">
              Rs.{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <div className="rpt-pc__bottom">
          <StarRating rating={product.rating} count={product.reviewCount} />
          {product.darazLink && (
            <motion.a
              whileTap={{ scale: 0.94 }}
              href={product.darazLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rpt-pc__daraz-link"
              title="Buy on Daraz"
            >
              <FiShoppingBag size={12} />
              Daraz
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

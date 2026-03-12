import { FiExternalLink, FiStar } from "react-icons/fi";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="rpt-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <FiStar
          key={i}
          size={12}
          className={i <= Math.round(rating) ? "rpt-star--on" : "rpt-star--off"}
        />
      ))}
    </span>
  );
}

const BADGE_CLASS: Record<string, string> = {
  "Best Seller": "rpt-product-card__badge--red",
  Popular: "rpt-product-card__badge--orange",
  New: "rpt-product-card__badge--green",
  "Top Rated": "rpt-product-card__badge--yellow",
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="rpt-product-card">
      {/* Image / placeholder */}
      <div className="rpt-product-card__img-wrap">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="rpt-product-card__img"
          />
        ) : (
          <span className="rpt-product-card__placeholder">📦</span>
        )}

        {product.badge && (
          <span
            className={`rpt-product-card__badge ${BADGE_CLASS[product.badge] || "rpt-product-card__badge--red"}`}
          >
            {product.badge}
          </span>
        )}

        {!product.inStock && (
          <div className="rpt-product-card__oos">
            <span className="rpt-product-card__oos-label">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="rpt-product-card__body">
        <div className="rpt-product-card__cat">{product.category}</div>
        <h3 className="rpt-product-card__name">{product.name}</h3>

        <div className="rpt-product-card__stars">
          <Stars rating={product.rating} />
          <span className="rpt-product-card__review-count">
            ({product.reviewCount})
          </span>
        </div>

        <p className="rpt-product-card__desc">{product.description}</p>

        <div className="rpt-product-card__price">
          ₨ {product.price.toLocaleString()}
        </div>

        <a
          href={product.darazLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rpt-product-card__btn"
        >
          <FiExternalLink size={13} />
          Buy on Daraz
        </a>
      </div>
    </div>
  );
}

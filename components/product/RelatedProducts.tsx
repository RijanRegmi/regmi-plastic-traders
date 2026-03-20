import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types";

export default function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <div className="rpt-products-page__grid">
      {products.slice(0, 4).map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}

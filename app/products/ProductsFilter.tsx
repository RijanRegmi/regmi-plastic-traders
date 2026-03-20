"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { FiSearch, FiX } from "react-icons/fi";

interface ProductsFilterProps {
  categories: string[];
  currentCategory?: string;
  currentSearch?: string;
}

export default function ProductsFilter({
  categories,
  currentCategory,
  currentSearch,
}: ProductsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch || "");

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (currentCategory && updates.category === undefined)
      params.set("category", currentCategory);
    if (currentSearch && updates.search === undefined)
      params.set("search", currentSearch);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: search || undefined, page: undefined });
  };

  const hasFilters = !!(currentSearch || currentCategory);

  return (
    <div className="rpt-filter">
      {/* ── Search bar — full width with button inside ── */}
      <form onSubmit={handleSearch} className="rpt-filter__search">
        <div className="rpt-filter__search-wrap">
          <FiSearch size={16} className="rpt-filter__search-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="rpt-filter__input"
          />
        </div>
        <button type="submit" className="rpt-filter__submit">
          Search
        </button>
      </form>

      {/* ── Category pills + clear ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => updateParams({ category: undefined, page: undefined })}
          className={`rpt-filter__cat${
            !currentCategory ? " rpt-filter__cat--active" : ""
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => updateParams({ category: cat, page: undefined })}
            className={`rpt-filter__cat${
              currentCategory === cat ? " rpt-filter__cat--active" : ""
            }`}
          >
            {cat}
          </button>
        ))}
        {hasFilters && (
          <button
            onClick={() => {
              setSearch("");
              updateParams({
                search: undefined,
                category: undefined,
                page: undefined,
              });
            }}
            className="rpt-filter__clear"
          >
            <FiX size={12} /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

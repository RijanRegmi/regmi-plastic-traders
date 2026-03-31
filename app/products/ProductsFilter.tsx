"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition, useEffect, useCallback } from "react";
import { FiSearch } from "react-icons/fi";

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
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch || "");
  const [prevSearchProp, setPrevSearchProp] = useState(currentSearch);

  if (currentSearch !== prevSearchProp) {
    setPrevSearchProp(currentSearch);
    setSearch(currentSearch || "");
  }

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(window.location.search);

      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });

      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [pathname, router]
  );

  useEffect(() => {
    if (search === (currentSearch || "")) return;

    const timer = setTimeout(() => {
      updateParams({ search: search || undefined, page: undefined });
    }, 500);

    return () => clearTimeout(timer);
  }, [search, currentSearch, updateParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: search || undefined, page: undefined });
  };

  const handleAllClick = () => {
    setSearch("");
    startTransition(() => router.push(pathname));
  };

  return (
    <div
      className="rpt-filter"
      style={{
        background: "transparent",
        boxShadow: "none",
        border: "none",
      }}
    >
      {/* ── Search bar ── */}
      <form onSubmit={handleSearch} className="rpt-filter__search">
        <div className="rpt-filter__search-wrap">
          <FiSearch size={20} className="rpt-filter__search-icon" />
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

      {/* ── Category pills ── */}
      <div className="rpt-filter__cats">
        <button
          onClick={handleAllClick}
          className={`rpt-filter__cat${
            !currentCategory ? " rpt-filter__cat--active" : ""
          }`}
        >
          All Categories
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
      </div>
    </div>
  );
}
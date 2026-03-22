"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
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
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch || "");

  // Sync internal search state with URL parameter changes (e.g. from "All Categories" button)
  useEffect(() => {
    setSearch(currentSearch || "");
  }, [currentSearch]);

  // Debounced real-time search
  useEffect(() => {
    // Only trigger if the search state is different from the current URL parameter
    if (search === (currentSearch || "")) return;

    const timer = setTimeout(() => {
      updateParams({ search: search || undefined, page: undefined });
    }, 500);

    return () => clearTimeout(timer);
  }, [search, currentSearch]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(window.location.search);
    
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

  const handleAllClick = () => {
    // Navigating back to "All" should clear both category and search
    setSearch("");
    startTransition(() => router.push(pathname));
  };

  return (
    <div className="rpt-filter">
      {/* ── Search bar — full width with button inside ── */}
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

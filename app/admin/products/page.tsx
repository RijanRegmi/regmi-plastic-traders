"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { productApi } from "@/lib/api";
import { Product } from "@/types";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";
import { C, F } from "@/components/admin/adminUI";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await productApi.adminGetAll({
          page,
          limit: 20,
          search: search || undefined,
        });
        setProducts(res.data || []);
        setPagination(res.pagination || { total: 0, pages: 1, page: 1 });
      } catch {
        toast.error("Failed to load");
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await productApi.delete(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed");
    }
  };

  const toggleActive = async (p: Product) => {
    try {
      await productApi.update(p._id, { isActive: !p.isActive });
      toast.success(p.isActive ? "Hidden" : "Active");
      load();
    } catch {
      toast.error("Failed");
    }
  };

  const toggleFeatured = async (p: Product) => {
    try {
      await productApi.update(p._id, { featured: !p.featured });
      toast.success(p.featured ? "Removed from featured" : "Featured!");
      load();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        fontFamily: F.body,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: F.display,
              fontSize: 30,
              fontWeight: 700,
              color: C.text1,
              letterSpacing: "-0.02em",
              margin: "0 0 5px",
            }}
          >
            Products
          </h1>
          <p
            style={{
              fontFamily: F.body,
              fontSize: 13,
              color: C.text4,
              margin: 0,
            }}
          >
            {pagination.total} total products
          </p>
        </div>
        <Link
          href="/admin/products/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 20px",
            background: "linear-gradient(135deg,#c0392b,#e74c3c)",
            border: "none",
            borderRadius: 11,
            color: "white",
            fontFamily: F.ui,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            textDecoration: "none",
            boxShadow: "0 6px 20px rgba(192,57,43,0.35)",
          }}
        >
          <FiPlus size={14} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 320 }}>
        <FiSearch
          size={14}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: C.text4,
            pointerEvents: "none",
          }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search products…"
          style={{
            width: "100%",
            boxSizing: "border-box" as const,
            padding: "11px 14px 11px 40px",
            background: C.bg3,
            border: `1px solid ${C.border}`,
            borderRadius: 11,
            color: C.text1,
            fontFamily: F.body,
            fontSize: 14,
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(192,57,43,0.55)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192,57,43,0.10)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Table */}
      <div
        style={{
          background: C.bg3,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              fontFamily: F.body,
              fontSize: 14,
              color: C.text4,
            }}
          >
            Loading…
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <p
              style={{
                fontFamily: F.body,
                fontSize: 14,
                color: C.text4,
                margin: "0 0 16px",
              }}
            >
              No products yet.
            </p>
            <Link
              href="/admin/products/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 20px",
                background: "linear-gradient(135deg,#c0392b,#e74c3c)",
                borderRadius: 11,
                color: "white",
                fontFamily: F.ui,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Add First Product
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {[
                    "Product",
                    "Category",
                    "Price",
                    "Rating",
                    "Featured",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontFamily: F.ui,
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                        color: C.text4,
                        textAlign: "left",
                        padding: "12px 16px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p._id}
                    style={{
                      borderBottom: `1px solid rgba(255,255,255,0.04)`,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.02)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "13px 16px", maxWidth: 220 }}>
                      <div
                        style={{
                          fontFamily: F.ui,
                          fontSize: 13,
                          fontWeight: 700,
                          color: C.text1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.name}
                      </div>
                      {p.badge && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: C.redSubtle,
                            color: "#f87171",
                            border: "1px solid rgba(192,57,43,0.3)",
                            fontFamily: F.ui,
                            fontSize: 9,
                            fontWeight: 700,
                            marginTop: 3,
                          }}
                        >
                          {p.badge}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontFamily: F.body,
                        fontSize: 13,
                        color: C.text3,
                      }}
                    >
                      {p.category}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontFamily: F.ui,
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.red,
                        whiteSpace: "nowrap",
                      }}
                    >
                      ₨{p.price.toLocaleString()}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <FiStar
                          size={12}
                          style={{ color: C.yellow, fill: C.yellow }}
                        />
                        <span
                          style={{
                            fontFamily: F.body,
                            fontSize: 13,
                            color: C.text2,
                          }}
                        >
                          {p.rating}
                        </span>
                        <span
                          style={{
                            fontFamily: F.body,
                            fontSize: 11,
                            color: C.text4,
                          }}
                        >
                          ({p.reviewCount})
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <button
                        type="button"
                        onClick={() => toggleFeatured(p)}
                        style={{
                          position: "relative",
                          width: 34,
                          height: 19,
                          borderRadius: 999,
                          border: "none",
                          background: p.featured
                            ? C.yellow
                            : "rgba(255,255,255,0.08)",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 2.5,
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: "white",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                            transition: "transform 0.25s",
                            transform: p.featured
                              ? "translateX(17px)"
                              : "translateX(2.5px)",
                          }}
                        />
                      </button>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <button
                        type="button"
                        onClick={() => toggleActive(p)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "3px 10px",
                          borderRadius: 999,
                          border: "none",
                          fontFamily: F.ui,
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: "pointer",
                          background: p.isActive
                            ? "rgba(39,174,96,0.15)"
                            : C.surface,
                          color: p.isActive ? "#2ecc71" : C.text3,
                          outline: `1px solid ${p.isActive ? "rgba(39,174,96,0.3)" : C.border}`,
                        }}
                      >
                        {p.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Link
                          href={`/admin/products/${p._id}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            color: C.red,
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = C.redSubtle)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <FiEdit2 size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p._id, p.name)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: "none",
                            background: "transparent",
                            color: C.text4,
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(192,57,43,0.12)";
                            e.currentTarget.style.color = "#f87171";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = C.text4;
                          }}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
            (pg) => (
              <button
                key={pg}
                onClick={() => load(pg)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: `1px solid ${pg === pagination.page ? C.red : C.border}`,
                  background: pg === pagination.page ? C.red : C.bg3,
                  color: pg === pagination.page ? "white" : C.text3,
                  fontFamily: F.ui,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {pg}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

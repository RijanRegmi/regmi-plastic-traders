"use client";
import { useEffect, useState, useCallback } from "react";
import { reviewApi } from "@/lib/api";
import { Review } from "@/types";
import { FiTrash2, FiStar, FiMessageSquare, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import { C, F } from "@/components/admin/adminUI";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewApi.adminGetAll();
      setReviews(data || []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete review from "${name}"?`)) return;
    try {
      await reviewApi.delete(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleActive = async (r: Review) => {
    try {
      await reviewApi.update(r._id, { isActive: !r.isActive });
      toast.success(r.isActive ? "Hidden" : "Public");
      load();
    } catch {
      toast.error("Failed to update status");
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
            Customer Reviews
          </h1>
          <p
            style={{
              fontFamily: F.body,
              fontSize: 13,
              color: C.text4,
              margin: 0,
            }}
          >
            {reviews.length} total reviews across all platforms
          </p>
        </div>
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
          <div style={{ textAlign: "center", padding: "60px 24px", color: C.text4 }}>
            Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <FiMessageSquare size={40} style={{ color: C.text4, marginBottom: 12 }} />
            <p style={{ color: C.text4, margin: 0 }}>No reviews found.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Customer", "Rating", "Review Content", "Platform", "Status", "Actions"].map((h) => (
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
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr
                    key={r._id}
                    style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}
                  >
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: C.surface,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {r.avatar ? (
                            <img src={r.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <FiUser size={14} style={{ color: C.text4 }} />
                          )}
                        </div>
                        <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 700, color: C.text1 }}>
                          {r.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <FiStar size={12} style={{ color: C.yellow, fill: C.yellow }} />
                        <span style={{ fontSize: 13, color: C.text2 }}>{r.rating}</span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", maxWidth: 300 }}>
                      <p
                        style={{
                          fontSize: 13,
                          color: C.text3,
                          margin: 0,
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {r.text}
                      </p>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: F.ui,
                          textTransform: "uppercase",
                          color: C.text4,
                          background: "rgba(255,255,255,0.05)",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {r.platform}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <button
                        type="button"
                        onClick={() => toggleActive(r)}
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
                          background: r.isActive ? "rgba(39,174,96,0.15)" : C.surface,
                          color: r.isActive ? "#2ecc71" : C.text3,
                          outline: `1px solid ${r.isActive ? "rgba(39,174,96,0.3)" : C.border}`,
                        }}
                      >
                        {r.isActive ? "Public" : "Private"}
                      </button>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(r._id, r.name)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: "none",
                          background: "transparent",
                          color: C.text4,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(192,57,43,0.12)";
                          e.currentTarget.style.color = "#f87171";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = C.text4;
                        }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

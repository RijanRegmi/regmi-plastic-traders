"use client";
import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { productApi } from "@/lib/api";
import toast from "react-hot-toast";
import {
  FiSave,
  FiArrowLeft,
  FiExternalLink,
  FiUpload,
  FiX,
  FiPlus,
  FiImage,
  FiZap,
  FiLink,
  FiCheck,
} from "react-icons/fi";
import { C, F } from "@/components/admin/adminUI";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";

const CATEGORIES = [
  "Household",
  "Storage",
  "Kitchen",
  "Garden",
  "Industrial",
  "Bathroom",
  "Office",
  "Other",
];
const BADGES = [
  "",
  "Best Seller",
  "Popular",
  "New",
  "Top Rated",
  "Sale",
  "Limited",
];

const EMPTY = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  category: "Household",
  darazLink: "",
  badge: "",
  rating: "0",
  reviewCount: "0",
  inStock: true,
  featured: false,
  isActive: true,
};
interface FormState {
  [key: string]: string | boolean;
}

const IS: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${C.border}`,
  borderRadius: 11,
  color: C.text1,
  fontFamily: F.body,
  fontSize: 14,
  outline: "none",
};
const onFocus = (
  e: React.FocusEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
) => {
  e.currentTarget.style.borderColor = "rgba(192,57,43,0.55)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192,57,43,0.10)";
};
const onBlur = (
  e: React.FocusEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
) => {
  e.currentTarget.style.borderColor = C.border;
  e.currentTarget.style.boxShadow = "none";
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        fontFamily: F.ui,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        color: C.text4,
      }}
    >
      {children}
    </label>
  );
}

function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: C.bg3,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "13px 22px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontFamily: F.ui,
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: C.text4,
            margin: 0,
          }}
        >
          {title}
        </p>
        {right}
      </div>
      <div
        style={{
          padding: 22,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Toggle({
  value,
  onToggle,
  label,
}: {
  value: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: "relative",
          width: 36,
          height: 20,
          borderRadius: 999,
          border: "none",
          background: value ? C.red : "rgba(255,255,255,0.08)",
          cursor: "pointer",
          flexShrink: 0,
          transition: "background 0.25s",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            transition: "transform 0.25s",
            transform: value ? "translateX(19px)" : "translateX(3px)",
          }}
        />
      </button>
      <span
        style={{
          fontFamily: F.ui,
          fontSize: 12,
          fontWeight: 700,
          color: C.text3,
        }}
      >
        {label}
      </span>
    </label>
  );
}

// ─── Image Uploader ───────────────────────────────────────────────────────────
interface ImageItem {
  url: string;
  preview?: string;
  uploading?: boolean;
  error?: boolean;
}

function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (v: string[]) => void;
}) {
  const [items, setItems] = useState<ImageItem[]>(
    images.map((url) => ({ url })),
  );
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : "";

  useEffect(() => {
    onChange(
      items.filter((i) => i.url && !i.uploading && !i.error).map((i) => i.url),
    );
  }, [items]);

  useEffect(() => {
    if (images.length > 0 && items.filter((i) => i.url).length === 0) {
      setItems(images.map((url) => ({ url })));
    }
  }, [images]);

  const uploadFile = async (file: File, idx: number) => {
    const fd = new FormData();
    fd.append("image", file);
    try {
      const r = await fetch(`${API}/admin/upload/single`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      const url = d.data?.url || d.data?.path || "";
      setItems((p) => {
        const n = [...p];
        n[idx] = { url, uploading: false };
        return n;
      });
    } catch {
      setItems((p) => {
        const n = [...p];
        n[idx] = { ...n[idx], uploading: false, error: true };
        return n;
      });
      toast.error("Upload failed");
    }
  };

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    const start = items.length;
    setItems((p) => [
      ...p,
      ...arr.map((f) => ({
        url: "",
        preview: URL.createObjectURL(f),
        uploading: true,
      })),
    ]);
    arr.forEach((f, i) => uploadFile(f, start + i));
  };

  const remove = (i: number) => setItems((p) => p.filter((_, j) => j !== i));
  const moveLeft = (i: number) => {
    if (i === 0) return;
    setItems((p) => {
      const n = [...p];
      [n[i - 1], n[i]] = [n[i], n[i - 1]];
      return n;
    });
  };
  const moveRight = (i: number) =>
    setItems((p) => {
      if (i >= p.length - 1) return p;
      const n = [...p];
      [n[i], n[i + 1]] = [n[i + 1], n[i]];
      return n;
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => ref.current?.click()}
        style={{
          border: `2px dashed ${drag ? C.red : C.border}`,
          borderRadius: 14,
          padding: "28px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: drag ? "rgba(192,57,43,0.06)" : "rgba(255,255,255,0.02)",
          transition: "border-color 0.2s, background 0.2s",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(192,57,43,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.red,
            }}
          >
            <FiUpload size={20} />
          </div>
          <p
            style={{
              fontFamily: F.ui,
              fontSize: 13,
              fontWeight: 700,
              color: C.text2,
              margin: 0,
            }}
          >
            Drop images here or <span style={{ color: C.red }}>browse</span>
          </p>
          <p
            style={{
              fontFamily: F.body,
              fontSize: 11,
              color: C.text4,
              margin: 0,
            }}
          >
            JPG, PNG, WebP — max 5 MB each
          </p>
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {items.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: 10,
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${item.error ? "rgba(192,57,43,0.5)" : C.border}`,
                background: "rgba(255,255,255,0.04)",
                aspectRatio: "1",
              }}
            >
              {(item.preview || item.url) && (
                <img
                  src={item.preview || item.url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
              {item.uploading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: F.body,
                      fontSize: 10,
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    Uploading…
                  </span>
                </div>
              )}
              {item.error && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(192,57,43,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: F.body,
                      fontSize: 10,
                      color: "#f87171",
                    }}
                  >
                    Error
                  </span>
                </div>
              )}
              {i === 0 && !item.uploading && !item.error && (
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    left: 6,
                    background: C.red,
                    color: "white",
                    fontFamily: F.ui,
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  MAIN
                </div>
              )}
              {!item.uploading && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "4px 6px",
                    background: "rgba(0,0,0,0.65)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: 2 }}>
                    <button
                      type="button"
                      onClick={() => moveLeft(i)}
                      disabled={i === 0}
                      style={{
                        width: 20,
                        height: 20,
                        background: "none",
                        border: "none",
                        color: i === 0 ? "rgba(255,255,255,0.25)" : "white",
                        cursor: i === 0 ? "default" : "pointer",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRight(i)}
                      disabled={i === items.length - 1}
                      style={{
                        width: 20,
                        height: 20,
                        background: "none",
                        border: "none",
                        color:
                          i === items.length - 1
                            ? "rgba(255,255,255,0.25)"
                            : "white",
                        cursor: i === items.length - 1 ? "default" : "pointer",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ›
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    style={{
                      width: 20,
                      height: 20,
                      background: "rgba(192,57,43,0.8)",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FiX size={10} />
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => ref.current?.click()}
            style={{
              aspectRatio: "1",
              borderRadius: 12,
              border: `2px dashed ${C.border}`,
              background: "rgba(255,255,255,0.02)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              color: C.text4,
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.red;
              e.currentTarget.style.color = C.red;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.text4;
            }}
          >
            <FiPlus size={18} />
            <span style={{ fontFamily: F.body, fontSize: 10 }}>Add</span>
          </button>
        </div>
      )}
      {items.length > 0 && (
        <p
          style={{
            fontFamily: F.body,
            fontSize: 11,
            color: C.text4,
            margin: 0,
          }}
        >
          First image is shown as main. Use ‹ › to reorder.
        </p>
      )}
    </div>
  );
}

// ─── Price Block with discount calculator ────────────────────────────────────
function PriceBlock({
  price,
  originalPrice,
  onChange,
}: {
  price: string;
  originalPrice: string;
  onChange: (key: "price" | "originalPrice", val: string) => void;
}) {
  const p = parseFloat(price) || 0;
  const op = parseFloat(originalPrice) || 0;
  const hasDiscount = op > 0 && op > p && p > 0;
  const discountPct = hasDiscount ? Math.round(((op - p) / op) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {/* Sale / Current price */}
        <div
          style={{
            flex: 1,
            minWidth: 120,
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          <Label>Sale Price (Rs) *</Label>
          <input
            type="number"
            min="0"
            required
            value={price}
            onChange={(e) => onChange("price", e.target.value)}
            placeholder="e.g. 478"
            style={IS}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        {/* Original / crossed-out price */}
        <div
          style={{
            flex: 1,
            minWidth: 120,
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          <Label>
            Original Price (Rs){" "}
            <span
              style={{
                color: C.text4,
                fontSize: 9,
                fontWeight: 400,
                letterSpacing: 0,
              }}
            >
              optional
            </span>
          </Label>
          <input
            type="number"
            min="0"
            value={originalPrice}
            onChange={(e) => onChange("originalPrice", e.target.value)}
            placeholder="e.g. 649"
            style={IS}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        {/* Discount badge preview */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
            justifyContent: "flex-end",
          }}
        >
          <Label>Discount</Label>
          <div
            style={{
              height: 44,
              minWidth: 80,
              borderRadius: 11,
              background: hasDiscount
                ? "rgba(39,174,96,0.12)"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${hasDiscount ? "rgba(39,174,96,0.3)" : C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.display,
              fontSize: hasDiscount ? 18 : 13,
              fontWeight: 800,
              color: hasDiscount ? "#27ae60" : C.text4,
              transition: "all 0.2s",
              padding: "0 14px",
            }}
          >
            {hasDiscount ? `-${discountPct}%` : "—"}
          </div>
        </div>
      </div>

      {/* Live preview */}
      {hasDiscount && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            background: "rgba(39,174,96,0.06)",
            border: "1px solid rgba(39,174,96,0.2)",
            borderRadius: 10,
          }}
        >
          <FiCheck size={13} style={{ color: "#27ae60", flexShrink: 0 }} />
          <p
            style={{
              fontFamily: F.body,
              fontSize: 12,
              color: "#27ae60",
              margin: 0,
            }}
          >
            Customers will see <strong>Rs {p.toLocaleString()}</strong> with{" "}
            <strong style={{ textDecoration: "line-through", color: C.text4 }}>
              Rs {op.toLocaleString()}
            </strong>{" "}
            crossed out and a <strong>-{discountPct}%</strong> green badge on
            the product card.
          </p>
        </div>
      )}
      {originalPrice && !hasDiscount && p > 0 && op > 0 && op <= p && (
        <div
          style={{
            padding: "9px 14px",
            background: "rgba(192,57,43,0.06)",
            border: "1px solid rgba(192,57,43,0.2)",
            borderRadius: 10,
            fontFamily: F.body,
            fontSize: 12,
            color: C.red,
          }}
        >
          ⚠ Original price must be higher than sale price to show a discount.
        </div>
      )}
    </div>
  );
}

// ─── Daraz Auto-Fetch ─────────────────────────────────────────────────────────
function DarazFetcher({
  darazUrl,
  onUrlChange,
  onFetched,
}: {
  darazUrl: string;
  onUrlChange: (v: string) => void;
  onFetched: (data: {
    name: string;
    description: string;
    price: string;
    originalPrice: string;
    rating: string;
    reviewCount: string;
    images: string[];
  }) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : "";

  const handleFetch = async () => {
    if (!darazUrl.trim() || !darazUrl.includes("daraz")) {
      toast.error("Paste a valid Daraz URL first");
      return;
    }
    setLoading(true);
    setStatus("idle");
    setMsg("");
    try {
      const res = await fetch(`${API}/admin/scrape/daraz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: darazUrl }),
      });
      const data = await res.json();
      if (data.success && data.data?.name) {
        const d = data.data;
        onFetched({
          name: d.name || "",
          description: d.description || "",
          price: d.price ? String(d.price) : "",
          originalPrice: d.originalPrice ? String(d.originalPrice) : "",
          rating: d.rating ? String(d.rating) : "0",
          reviewCount: d.reviewCount ? String(d.reviewCount) : "0",
          images: d.images || [],
        });
        setStatus("success");
        const discountPct =
          d.originalPrice && d.price && d.originalPrice > d.price
            ? Math.round(((d.originalPrice - d.price) / d.originalPrice) * 100)
            : 0;
        setMsg(
          `✓ Fetched: ${d.name}${d.price ? ` · Rs ${Number(d.price).toLocaleString()}` : ""}${discountPct ? ` (-${discountPct}%)` : ""}${d.rating ? ` · ${d.rating}★` : ""}${d.images?.length ? ` · ${d.images.length} images` : ""}`,
        );
        toast.success("Product details fetched from Daraz!");
      } else {
        setStatus("error");
        setMsg(
          data.data?.error || "Could not fetch. Try again or fill manually.",
        );
        toast.error("Fetch failed");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Is your backend running?");
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          background: "rgba(192,57,43,0.06)",
          border: "1px solid rgba(192,57,43,0.15)",
          borderRadius: 12,
          padding: "11px 15px",
          display: "flex",
          gap: 9,
          alignItems: "flex-start",
        }}
      >
        <FiZap
          size={14}
          style={{ color: C.red, flexShrink: 0, marginTop: 1 }}
        />
        <p
          style={{
            fontFamily: F.body,
            fontSize: 12,
            color: C.text3,
            margin: 0,
          }}
        >
          Paste a Daraz product URL below, then click{" "}
          <strong style={{ color: C.text2 }}>Auto-Fill</strong> to fetch name,
          price, original price, discount, rating, reviews and images
          automatically.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <FiLink
            size={13}
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              color: C.text4,
              pointerEvents: "none",
            }}
          />
          <input
            value={darazUrl}
            onChange={(e) => {
              onUrlChange(e.target.value);
              setStatus("idle");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            placeholder="https://www.daraz.com.np/products/..."
            style={{ ...IS, paddingLeft: 38 }}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading || !darazUrl.trim()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "12px 20px",
            background: loading
              ? "rgba(192,57,43,0.4)"
              : "linear-gradient(135deg,#c0392b,#e74c3c)",
            border: "none",
            borderRadius: 11,
            color: "white",
            fontFamily: F.ui,
            fontSize: 13,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            boxShadow: loading ? "none" : "0 4px 14px rgba(192,57,43,0.35)",
            transition: "all 0.2s",
          }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: 13,
                  height: 13,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Fetching…
            </>
          ) : (
            <>
              <FiZap size={13} />
              Auto-Fill
            </>
          )}
        </button>
      </div>

      {status !== "idle" && msg && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${status === "success" ? "rgba(39,174,96,0.4)" : "rgba(192,57,43,0.4)"}`,
            background:
              status === "success"
                ? "rgba(39,174,96,0.06)"
                : "rgba(192,57,43,0.06)",
            fontFamily: F.body,
            fontSize: 12,
            color: status === "success" ? "#27ae60" : C.red,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          {status === "success" && <FiCheck size={13} />}
          {msg}
        </div>
      )}
      {loading && (
        <p
          style={{
            fontFamily: F.body,
            fontSize: 11,
            color: C.text4,
            margin: 0,
          }}
        >
          ⏳ Opening Daraz in a headless browser… this takes 10–20 seconds.
        </p>
      )}
      {darazUrl && !loading && (
        <a
          href={darazUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: F.ui,
            fontSize: 12,
            fontWeight: 700,
            color: C.red,
            textDecoration: "none",
          }}
        >
          <FiExternalLink size={12} /> Preview on Daraz
        </a>
      )}
      <p
        style={{ fontFamily: F.body, fontSize: 11, color: C.text4, margin: 0 }}
      >
        This URL is saved to your database and used for the "Buy on Daraz"
        button.
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = !id || id === "new";

  const [form, setForm] = useState<FormState>(EMPTY as unknown as FormState);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);

  const [categories, setCategories] = useState<string[]>(CATEGORIES);

  useEffect(() => {
    // Fetch dynamic categories
    productApi.getCategories().then((res) => {
      if (res && res.length > 0) setCategories(res);
    });

    if (!isNew) {
      productApi.adminGetById(id)
        .then((p) => {
          if (p) {
            setForm({
              name: p.name,
              description: p.description,
              price: String(p.price),
              originalPrice: p.originalPrice ? String(p.originalPrice) : "",
              category: p.category,
              darazLink: p.darazLink,
              badge: p.badge || "",
              rating: String(p.rating),
              reviewCount: String(p.reviewCount),
              inStock: p.inStock,
              featured: p.featured,
              isActive: p.isActive,
            });
            setImages(p.images || []);
          }
        })
        .catch(() => toast.error("Failed to load product"))
        .finally(() => setFetching(false));
    }
  }, [id, isNew]);

  const set = useCallback(
    (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v })),
    [],
  );

  const handleAutoFetched = useCallback(
    (data: {
      name: string;
      description: string;
      price: string;
      originalPrice: string;
      rating: string;
      reviewCount: string;
      images: string[];
    }) => {
      if (data.name) set("name", data.name);
      if (data.description) set("description", data.description);
      if (data.price) set("price", data.price);
      if (data.originalPrice) set("originalPrice", data.originalPrice);
      if (data.rating && data.rating !== "0") set("rating", data.rating);
      if (data.reviewCount && data.reviewCount !== "0")
        set("reviewCount", data.reviewCount);
      if (data.images?.length > 0) setImages(data.images);
    },
    [set],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.darazLink) {
      toast.error("Daraz link is required");
      return;
    }
    setLoading(true);
    try {
      const origPrice = form.originalPrice
        ? parseFloat(form.originalPrice as string)
        : null;
      const payload = {
        ...form,
        price: parseFloat(form.price as string),
        originalPrice: origPrice,
        rating: parseFloat(form.rating as string),
        reviewCount: parseInt(form.reviewCount as string),
        images,
      };
      if (isNew) {
        await productApi.create(payload);
        toast.success("Product created!");
      } else {
        await productApi.update(id, payload);
        toast.success("Saved!");
      }
      router.push("/admin/products");
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Save failed",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px 24px",
          fontFamily: F.body,
          fontSize: 14,
          color: C.text4,
        }}
      >
        Loading…
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        fontFamily: F.body,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            background: C.bg3,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            color: C.text3,
            cursor: "pointer",
          }}
        >
          <FiArrowLeft size={17} />
        </button>
        <div>
          <h1
            style={{
              fontFamily: F.display,
              fontSize: 28,
              fontWeight: 700,
              color: C.text1,
              letterSpacing: "-0.02em",
              margin: "0 0 4px",
            }}
          >
            {isNew ? "Add New Product" : "Edit Product"}
          </h1>
          <p
            style={{
              fontFamily: F.body,
              fontSize: 13,
              color: C.text4,
              margin: 0,
            }}
          >
            Paste a Daraz URL and click Auto-Fill, or fill in manually
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* ── 1. Daraz Link ── */}
        <Section
          title="Daraz Link"
          right={
            <span
              style={{
                fontFamily: F.body,
                fontSize: 11,
                color: C.text4,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <FiZap size={11} style={{ color: C.red }} /> Powered by Puppeteer
            </span>
          }
        >
          <DarazFetcher
            darazUrl={form.darazLink as string}
            onUrlChange={(v) => set("darazLink", v)}
            onFetched={handleAutoFetched}
          />
        </Section>

        {/* ── 2. Product Details ── */}
        <Section title="Product Details">
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Label>Product Name *</Label>
            <input
              value={form.name as string}
              onChange={(e) => set("name", e.target.value)}
              required
              placeholder="Auto-filled after fetch, or type here"
              style={IS}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          {/* Price + Original Price + Discount calculator */}
          <PriceBlock
            price={form.price as string}
            originalPrice={form.originalPrice as string}
            onChange={(key, val) => set(key, val)}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Label>Category *</Label>
            <select
              value={form.category as string}
              onChange={(e) => set("category", e.target.value)}
              style={{ ...IS, background: C.bg4, cursor: "pointer" }}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Label>Description</Label>
            <textarea
              value={form.description as string}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Auto-filled after fetch, or type here"
              style={{ ...IS, resize: "vertical" }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </Section>

        {/* ── 3. Images ── */}
        <div
          style={{
            background: C.bg3,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "13px 22px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                fontFamily: F.ui,
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: C.text4,
                margin: 0,
              }}
            >
              Product Images
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: F.body,
                fontSize: 11,
                color: C.text4,
              }}
            >
              <FiImage size={12} /> {images.length}{" "}
              {images.length === 1 ? "image" : "images"}
              {images.length > 0 && (
                <span
                  style={{
                    background: "rgba(39,174,96,0.12)",
                    color: "#27ae60",
                    fontFamily: F.ui,
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 999,
                    marginLeft: 4,
                  }}
                >
                  READY
                </span>
              )}
            </div>
          </div>
          <div style={{ padding: 22 }}>
            <ImageUploader images={images} onChange={setImages} />
          </div>
        </div>

        {/* ── 4. Badge & Ratings ── */}
        <Section title="Badge & Ratings">
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[
              {
                label: "Badge",
                key: "badge",
                isSelect: true,
                opts: BADGES.map((b) => ({ v: b, l: b || "None" })),
              },
              {
                label: "Rating (0–5)",
                key: "rating",
                type: "number",
                step: "0.1",
                min: "0",
                max: "5",
                placeholder: "0",
              },
              {
                label: "Review Count",
                key: "reviewCount",
                type: "number",
                min: "0",
                placeholder: "0",
              },
            ].map(
              ({
                label,
                key,
                isSelect,
                opts,
                type,
                step,
                min,
                max,
                placeholder,
              }: {
                label: string;
                key: string;
                isSelect?: boolean;
                opts?: { v: string; l: string }[];
                type?: string;
                step?: string;
                min?: string;
                max?: string;
                placeholder?: string;
              }) => (
                <div
                  key={key}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                  }}
                >
                  <Label>{label}</Label>
                  {isSelect ? (
                    <select
                      value={form[key] as string}
                      onChange={(e) => set(key, e.target.value)}
                      style={{ ...IS, background: C.bg4, cursor: "pointer" }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    >
                      {opts!.map((o) => (
                        <option key={o.v} value={o.v}>
                          {o.l}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      step={step}
                      min={min}
                      max={max}
                      placeholder={placeholder}
                      value={form[key] as string}
                      onChange={(e) => set(key, e.target.value)}
                      style={IS}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  )}
                </div>
              ),
            )}
          </div>
        </Section>

        {/* ── 5. Visibility ── */}
        <div
          style={{
            background: C.bg3,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "13px 22px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <p
              style={{
                fontFamily: F.ui,
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: C.text4,
                margin: 0,
              }}
            >
              Visibility
            </p>
          </div>
          <div
            style={{
              padding: 22,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <Toggle
              value={form.isActive as boolean}
              onToggle={() => set("isActive", !form.isActive)}
              label="Active (visible to customers)"
            />
            <Toggle
              value={form.featured as boolean}
              onToggle={() => set("featured", !form.featured)}
              label="Featured on Home Page"
            />
            <Toggle
              value={form.inStock as boolean}
              onToggle={() => set("inStock", !form.inStock)}
              label="In Stock"
            />
          </div>
        </div>

        {/* ── Save ── */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 28px",
              background: loading
                ? "rgba(192,57,43,0.4)"
                : "linear-gradient(135deg,#c0392b,#e74c3c)",
              border: "none",
              borderRadius: 13,
              color: "white",
              fontFamily: F.ui,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 24px rgba(192,57,43,0.35)",
            }}
          >
            <FiSave size={15} />
            {loading ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "13px 22px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              borderRadius: 13,
              color: C.text3,
              fontFamily: F.ui,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

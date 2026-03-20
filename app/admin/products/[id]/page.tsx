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
  FiImage,
  FiPlus,
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

// ── Input style ──────────────────────────────────────────────────────────────
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

// ── Sub-components ───────────────────────────────────────────────────────────
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
}: {
  title: string;
  children: React.ReactNode;
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
        style={{ padding: "13px 22px", borderBottom: `1px solid ${C.border}` }}
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

// ── Multi-Image Uploader ─────────────────────────────────────────────────────
interface ImageItem {
  url: string; // final server URL
  preview?: string; // local blob for display while uploading
  uploading?: boolean;
  error?: boolean;
}

function MultiImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
}) {
  const [items, setItems] = useState<ImageItem[]>(
    images.map((url) => ({ url })),
  );
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : "";

  // Keep parent in sync
  useEffect(() => {
    const urls = items
      .filter((i) => i.url && !i.uploading && !i.error)
      .map((i) => i.url);
    onChange(urls);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const uploadFile = async (file: File, idx: number) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API}/admin/upload/single`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const url: string = data.data?.url || data.data?.path || "";
      setItems((prev) => {
        const next = [...prev];
        next[idx] = { url, uploading: false };
        return next;
      });
    } catch {
      setItems((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], uploading: false, error: true };
        return next;
      });
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    const startIdx = items.length;
    const newItems: ImageItem[] = arr.map((f) => ({
      url: "",
      preview: URL.createObjectURL(f),
      uploading: true,
    }));
    setItems((prev) => [...prev, ...newItems]);
    arr.forEach((f, i) => uploadFile(f, startIdx + i));
  };

  const remove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveLeft = (idx: number) => {
    if (idx === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveRight = (idx: number) => {
    setItems((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? C.red : C.border}`,
          borderRadius: 14,
          padding: "28px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging
            ? "rgba(192,57,43,0.06)"
            : "rgba(255,255,255,0.02)",
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
            JPG, PNG, WebP — max 5 MB each — up to 5 images
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Image Grid */}
      {items.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: 10,
          }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${item.error ? "rgba(192,57,43,0.5)" : C.border}`,
                background: "rgba(255,255,255,0.04)",
                aspectRatio: "1",
              }}
            >
              {/* Image */}
              {(item.preview || item.url) && (
                <img
                  src={item.preview || item.url}
                  alt={`Product image ${idx + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}

              {/* Loading overlay */}
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

              {/* Error overlay */}
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

              {/* Primary badge */}
              {idx === 0 && !item.uploading && !item.error && (
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

              {/* Controls */}
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
                      onClick={() => moveLeft(idx)}
                      disabled={idx === 0}
                      style={{
                        width: 20,
                        height: 20,
                        background: "none",
                        border: "none",
                        color: idx === 0 ? "rgba(255,255,255,0.25)" : "white",
                        cursor: idx === 0 ? "default" : "pointer",
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
                      onClick={() => moveRight(idx)}
                      disabled={idx === items.length - 1}
                      style={{
                        width: 20,
                        height: 20,
                        background: "none",
                        border: "none",
                        color:
                          idx === items.length - 1
                            ? "rgba(255,255,255,0.25)"
                            : "white",
                        cursor:
                          idx === items.length - 1 ? "default" : "pointer",
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
                    onClick={() => remove(idx)}
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

          {/* Add more button */}
          {items.length < 5 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
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
          )}
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

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = !id || id === "new";

  const [form, setForm] = useState<FormState>(EMPTY as unknown as FormState);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      productApi.adminGetAll({ limit: 1000 }).then((res) => {
        const p = res.data?.find((x: { _id: string }) => x._id === id);
        if (p) {
          setForm({
            name: p.name,
            description: p.description,
            price: String(p.price),
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
        setFetching(false);
      });
    }
  }, [id, isNew]);

  const set = useCallback(
    (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v })),
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.darazLink) {
      toast.error("Daraz link is required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price as string),
        rating: parseFloat(form.rating as string),
        reviewCount: parseInt(form.reviewCount as string),
        images,
      };
      if (isNew) {
        await productApi.create(payload);
        toast.success("Product created!");
      } else {
        await productApi.update(id, payload);
        toast.success("Updated!");
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
            Fill in all required fields below
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* ── Basic Info ── */}
        <Section title="Basic Information">
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Label>Product Name *</Label>
            <input
              value={form.name as string}
              onChange={(e) => set("name", e.target.value)}
              required
              style={IS}
              placeholder="e.g. Heavy Duty Storage Box 50L"
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Label>Description *</Label>
            <textarea
              value={form.description as string}
              onChange={(e) => set("description", e.target.value)}
              required
              rows={4}
              style={{ ...IS, resize: "vertical" }}
              placeholder="Describe the product in detail…"
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div
              style={{
                flex: 1,
                minWidth: 130,
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              <Label>Price (Rs) *</Label>
              <input
                type="number"
                value={form.price as string}
                onChange={(e) => set("price", e.target.value)}
                required
                min="0"
                style={IS}
                placeholder="450"
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 130,
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              <Label>Category *</Label>
              <select
                value={form.category as string}
                onChange={(e) => set("category", e.target.value)}
                style={{ ...IS, background: C.bg4, cursor: "pointer" }}
                onFocus={onFocus}
                onBlur={onBlur}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {/* ── Product Images ── */}
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
              <FiImage size={12} />
              {images.length} / 5 uploaded
            </div>
          </div>
          <div style={{ padding: 22 }}>
            <MultiImageUploader images={images} onChange={setImages} />
          </div>
        </div>

        {/* ── Daraz Link ── */}
        <Section title="Daraz Link">
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Label>Daraz Product URL *</Label>
            <input
              value={form.darazLink as string}
              onChange={(e) => set("darazLink", e.target.value)}
              required
              type="url"
              style={IS}
              placeholder="https://www.daraz.com.np/products/…"
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <p
              style={{
                fontFamily: F.body,
                fontSize: 11,
                color: C.text4,
                margin: 0,
              }}
            >
              Customers are redirected here when clicking "Buy on Daraz".
            </p>
          </div>
          {form.darazLink && (
            <a
              href={form.darazLink as string}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: C.red,
                fontFamily: F.ui,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <FiExternalLink size={13} /> Preview on Daraz
            </a>
          )}
        </Section>

        {/* ── Badge & Ratings ── */}
        <Section title="Badge & Ratings">
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div
              style={{
                flex: 1,
                minWidth: 120,
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              <Label>Badge</Label>
              <select
                value={form.badge as string}
                onChange={(e) => set("badge", e.target.value)}
                style={{ ...IS, background: C.bg4, cursor: "pointer" }}
                onFocus={onFocus}
                onBlur={onBlur}
              >
                {BADGES.map((b) => (
                  <option key={b} value={b}>
                    {b || "None"}
                  </option>
                ))}
              </select>
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 120,
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              <Label>Rating (0–5)</Label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating as string}
                onChange={(e) => set("rating", e.target.value)}
                style={IS}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 120,
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              <Label>Review Count</Label>
              <input
                type="number"
                min="0"
                value={form.reviewCount as string}
                onChange={(e) => set("reviewCount", e.target.value)}
                style={IS}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          </div>
          {/* Badge Preview */}
          {form.badge && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{ fontFamily: F.body, fontSize: 11, color: C.text4 }}
              >
                Preview:
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontFamily: F.ui,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  background:
                    form.badge === "New"
                      ? "rgba(39,174,96,0.15)"
                      : form.badge === "Top Rated"
                        ? "rgba(230,126,0,0.15)"
                        : "rgba(192,57,43,0.12)",
                  color:
                    form.badge === "New"
                      ? "#27ae60"
                      : form.badge === "Top Rated"
                        ? C.yellow
                        : C.red,
                }}
              >
                {form.badge as string}
              </span>
            </div>
          )}
        </Section>

        {/* ── Visibility ── */}
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

        {/* ── Submit ── */}
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

"use client";
import { useEffect, useCallback, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { productApi } from "@/lib/api";
import toast from "react-hot-toast";
import { FiSave, FiArrowLeft, FiExternalLink } from "react-icons/fi";
import ImageUploader from "@/components/ui/ImageUploader";
import { C, F } from "@/components/admin/adminUI";

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

// ─── Module-level constants (never re-created on render) ──────────────────────
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

// ─── Sub-components OUTSIDE the page component ────────────────────────────────
// IMPORTANT: never define components inside another component — React will
// treat them as new component types on every render and unmount/remount them,
// causing inputs to lose focus after each keystroke.

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

// ─── Page ─────────────────────────────────────────────────────────────────────
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
        {/* Basic Info */}
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
              rows={3}
              style={{ ...IS, resize: "none" }}
              placeholder="Describe the product…"
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
              <Label>Price (₨) *</Label>
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

        {/* Images */}
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
              Product Images
            </p>
          </div>
          <div style={{ padding: 22 }}>
            <ImageUploader images={images} onChange={setImages} />
          </div>
        </div>

        {/* Daraz */}
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
              Users are redirected here when clicking the product.
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

        {/* Badge & Ratings */}
        <Section title="Badge & Ratings">
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {(
              [
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
                },
                {
                  label: "Review Count",
                  key: "reviewCount",
                  type: "number",
                  min: "0",
                },
              ] as const
            ).map(
              ({ label, key, isSelect, opts, type, step, min, max }: any) => (
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
                      {opts!.map((o: any) => (
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

        {/* Visibility */}
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

        {/* Submit */}
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

"use client";
import { useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { useParams } from "next/navigation";
import { cmsApi, uploadApi } from "@/lib/api";
import toast from "react-hot-toast";
import {
  FiSave,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiGlobe,
  FiHome,
  FiPackage,
  FiInfo,
  FiPhone,
  FiSettings,
  FiLayout,
  FiUpload,
  FiX,
  FiImage,
} from "react-icons/fi";
import { C, F } from "@/components/admin/adminUI";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api"
).replace(/\/api$/, "");

// ─── Types ────────────────────────────────────────────────────────────────────
type FieldType = "text" | "textarea" | "url" | "tel" | "email" | "number";

interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  span?: "half" | "full";
}

interface SectionDef {
  id: string;
  title: string;
  icon: ReactNode;
  description: string;
  fields: FieldDef[];
}

interface PageDef {
  title: string;
  icon: ReactNode;
  sections: SectionDef[];
}

// ─── Hero Background Upload Field ─────────────────────────────────────────────
function HeroBgUploadField({
  currentPath,
  onUploaded,
}: {
  currentPath: string;
  onUploaded: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPath);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentPath);
  }, [currentPath]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("background", file);
      const res = await uploadApi.uploadBackground(fd);
      const path: string = res.data.path;
      setPreview(path);
      onUploaded(path);
      toast.success("Hero background updated!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleClear = () => {
    setPreview("");
    onUploaded("");
  };

  const previewUrl = preview ? `${API_BASE}${preview}` : "";

  return (
    <div
      style={{
        gridColumn: "span 2",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Label */}
      <label
        style={{
          fontFamily: F.ui,
          fontSize: 9,
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.16em",
          color: C.text4,
        }}
      >
        Hero Background Photo
      </label>

      {/* Preview strip */}
      <div
        style={{
          width: "100%",
          height: 160,
          borderRadius: 14,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
          position: "relative",
          background: preview ? "transparent" : "rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {preview ? (
          <>
            <img
              src={previewUrl}
              alt="Hero background preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Dark overlay to mimic how it looks on site */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(4,4,6,0.7) 0%, rgba(4,4,6,0.4) 100%)",
              }}
            />
            {/* Preview label */}
            <div
              style={{
                position: "absolute",
                bottom: 10,
                left: 14,
                fontFamily: F.ui,
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
              }}
            >
              Live Preview (with overlay)
            </div>
            {/* Clear button */}
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(192,57,43,0.9)",
                border: "none",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiX size={13} />
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center" as const, color: C.text4 }}>
            <FiImage size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p style={{ fontFamily: F.body, fontSize: 12, margin: 0 }}>
              No background image set — using dark gradient
            </p>
          </div>
        )}
      </div>

      {/* Upload controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 20px",
            background: uploading
              ? "rgba(192,57,43,0.3)"
              : "rgba(192,57,43,0.12)",
            border: "1px solid rgba(192,57,43,0.3)",
            borderRadius: 11,
            color: uploading ? C.text4 : C.red,
            fontFamily: F.ui,
            fontSize: 12,
            fontWeight: 700,
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? (
            <FiRefreshCw
              size={13}
              style={{ animation: "spin 1s linear infinite" }}
            />
          ) : (
            <FiUpload size={13} />
          )}
          {uploading
            ? "Uploading…"
            : preview
              ? "Replace Background"
              : "Upload Background Photo"}
        </button>
        <p
          style={{
            fontFamily: F.body,
            fontSize: 11,
            color: C.text4,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          JPG, PNG, WebP · Max 10MB · Recommended: 1920×1080px or wider · Saved
          to <code style={{ color: C.text3 }}>/uploads/background/</code>
        </p>
      </div>

      {/* Current path display */}
      {preview && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 9,
            border: `1px solid ${C.border}`,
          }}
        >
          <FiImage size={12} style={{ color: C.text4, flexShrink: 0 }} />
          <code
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: C.text3,
              wordBreak: "break-all" as const,
            }}
          >
            {preview}
          </code>
        </div>
      )}
    </div>
  );
}

// ─── Logo Upload Field ────────────────────────────────────────────────────────
function LogoUploadField({
  currentUrl,
  onUploaded,
}: {
  currentUrl: string;
  onUploaded: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentUrl);
  }, [currentUrl]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await uploadApi.uploadLogo(fd);
      const path: string = res.data.path;
      setPreview(path);
      onUploaded(path);
      toast.success("Logo uploaded!");
    } catch {
      toast.error("Logo upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleClear = () => {
    setPreview("");
    onUploaded("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        gridColumn: "span 2",
      }}
    >
      <label
        style={{
          fontFamily: F.ui,
          fontSize: 9,
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.16em",
          color: C.text4,
        }}
      >
        Store Logo Image
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            background: "rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {preview ? (
            <>
              <img
                src={`${API_BASE}${preview}`}
                alt="Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={handleClear}
                style={{
                  position: "absolute",
                  top: 3,
                  right: 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "rgba(192,57,43,0.9)",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                <FiX size={10} />
              </button>
            </>
          ) : (
            <span style={{ fontSize: 28 }}>🏪</span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              background: uploading
                ? "rgba(192,57,43,0.3)"
                : "rgba(192,57,43,0.12)",
              border: "1px solid rgba(192,57,43,0.3)",
              borderRadius: 10,
              color: uploading ? C.text4 : C.red,
              fontFamily: F.ui,
              fontSize: 12,
              fontWeight: 700,
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            {uploading ? (
              <FiRefreshCw
                size={13}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <FiUpload size={13} />
            )}
            {uploading
              ? "Uploading…"
              : preview
                ? "Replace Logo"
                : "Upload Logo"}
          </button>
          <p
            style={{
              fontFamily: F.body,
              fontSize: 11,
              color: C.text4,
              margin: 0,
            }}
          >
            JPG, PNG, WebP · Max 2MB
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ALL CMS Pages / Fields ───────────────────────────────────────────────────
const PAGES: Record<string, PageDef> = {
  global: {
    title: "Global Settings",
    icon: <FiSettings size={16} />,
    sections: [
      {
        id: "brand",
        title: "Brand Identity",
        icon: <FiLayout size={14} />,
        description:
          "Store name and tagline shown in the header, footer, and browser tab.",
        fields: [
          {
            key: "storeName",
            label: "Store Name",
            type: "text",
            placeholder: "Regmi Plastic Traders",
            span: "half",
          },
          {
            key: "logoLetter",
            label: "Logo Fallback Letter",
            type: "text",
            placeholder: "R",
            span: "half",
          },
          {
            key: "tagline",
            label: "Site Tagline",
            type: "text",
            placeholder: "Nepal's trusted plastic store",
            span: "full",
          },
          {
            key: "establishedYear",
            label: "Established Year",
            type: "text",
            placeholder: "2005",
            span: "half",
          },
          {
            key: "footerTagline",
            label: "Footer Tagline",
            type: "textarea",
            placeholder:
              "Your trusted source for quality plastic products across Nepal.",
            span: "full",
          },
          {
            key: "copyrightText",
            label: "Footer Copyright Extra",
            type: "text",
            placeholder: "Made with ♥ in Nepal",
            span: "half",
          },
        ],
      },
      {
        id: "contact",
        title: "Contact Information",
        icon: <FiPhone size={14} />,
        description:
          "Shown in the header, footer contact section, and contact page.",
        fields: [
          {
            key: "phone",
            label: "Primary Phone",
            type: "tel",
            placeholder: "+977-9841234567",
            span: "half",
          },
          {
            key: "phone2",
            label: "Phone 2 (optional)",
            type: "tel",
            placeholder: "+977-9851234567",
            span: "half",
          },
          {
            key: "email",
            label: "Primary Email",
            type: "email",
            placeholder: "info@regmiplastic.com",
            span: "half",
          },
          {
            key: "email2",
            label: "Email 2 (optional)",
            type: "email",
            placeholder: "sales@regmiplastic.com",
            span: "half",
          },
          {
            key: "address",
            label: "Physical Address",
            type: "textarea",
            placeholder: "Kathmandu, Nepal",
            span: "full",
          },
          {
            key: "mapEmbed",
            label: "Google Maps Embed URL",
            type: "url",
            placeholder: "https://www.google.com/maps/embed?pb=…",
            span: "full",
            hint: "Google Maps → Share → Embed a map → copy the src= URL",
          },
        ],
      },
      {
        id: "hours",
        title: "Business Hours",
        icon: <FiSettings size={14} />,
        description: "Store opening hours displayed in the footer.",
        fields: [
          {
            key: "hoursWeekday",
            label: "Weekday Hours",
            type: "text",
            placeholder: "Sun – Fri: 9AM – 7PM",
            span: "half",
          },
          {
            key: "hoursSaturday",
            label: "Saturday Hours",
            type: "text",
            placeholder: "Saturday: 10AM – 5PM",
            span: "half",
          },
        ],
      },
      {
        id: "social",
        title: "Social Media Links",
        icon: <FiGlobe size={14} />,
        description: "Links used in the footer social icons.",
        fields: [
          {
            key: "socialFacebook",
            label: "Facebook URL",
            type: "url",
            placeholder: "https://facebook.com/regmiplastic",
            span: "half",
          },
          {
            key: "socialInstagram",
            label: "Instagram URL",
            type: "url",
            placeholder: "https://instagram.com/regmiplastic",
            span: "half",
          },
          {
            key: "socialYoutube",
            label: "YouTube URL",
            type: "url",
            placeholder: "https://youtube.com/@regmiplastic",
            span: "half",
          },
          {
            key: "socialWhatsapp",
            label: "WhatsApp Number",
            type: "tel",
            placeholder: "+9779841234567",
            span: "half",
            hint: "Full number with country code, no spaces",
          },
        ],
      },
      {
        id: "nav",
        title: "Navigation & Header",
        icon: <FiLayout size={14} />,
        description: "Text labels shown in the site navigation bar.",
        fields: [
          {
            key: "headerPhone",
            label: "Header Phone Text",
            type: "text",
            placeholder: "+977-9841234567",
            span: "half",
          },
          {
            key: "headerCTAText",
            label: "Header Shop Button Text",
            type: "text",
            placeholder: "Shop Now",
            span: "half",
          },
          {
            key: "navHome",
            label: "Nav: Home",
            type: "text",
            placeholder: "Home",
            span: "half",
          },
          {
            key: "navProducts",
            label: "Nav: Products",
            type: "text",
            placeholder: "Products",
            span: "half",
          },
          {
            key: "navBlog",
            label: "Nav: Blog",
            type: "text",
            placeholder: "Blog",
            span: "half",
          },
          {
            key: "navAbout",
            label: "Nav: About",
            type: "text",
            placeholder: "About",
            span: "half",
          },
          {
            key: "navContact",
            label: "Nav: Contact",
            type: "text",
            placeholder: "Contact",
            span: "half",
          },
        ],
      },
    ],
  },

  home: {
    title: "Home Page",
    icon: <FiHome size={16} />,
    sections: [
      {
        id: "hero",
        title: "Hero Section",
        icon: <FiLayout size={14} />,
        description:
          "The very first thing visitors see — headline, subtitle, CTA buttons, and background photo.",
        fields: [
          {
            key: "heroBadge",
            label: "Badge Pill Text",
            type: "text",
            placeholder: "Est. 2005 · Kathmandu, Nepal",
            span: "full",
          },
          {
            key: "heroTitle",
            label: "Hero Headline",
            type: "textarea",
            placeholder: "Nepal's Most Trusted Plastic Goods Store",
            span: "full",
          },
          {
            key: "heroSubtitle",
            label: "Hero Subtitle Paragraph",
            type: "textarea",
            placeholder: "Durable, affordable, and high-quality…",
            span: "full",
          },
          {
            key: "heroButtonText",
            label: "Primary Button Text",
            type: "text",
            placeholder: "Shop Now",
            span: "half",
          },
          {
            key: "heroButtonHref",
            label: "Primary Button Link",
            type: "text",
            placeholder: "/products",
            span: "half",
          },
          {
            key: "heroGhostText",
            label: "Secondary Button Text",
            type: "text",
            placeholder: "Our Story",
            span: "half",
          },
          {
            key: "heroGhostHref",
            label: "Secondary Button Link",
            type: "text",
            placeholder: "/about",
            span: "half",
          },
          {
            key: "heroTrust1",
            label: "Trust Badge 1",
            type: "text",
            placeholder: "Free Delivery",
            span: "half",
          },
          {
            key: "heroTrust2",
            label: "Trust Badge 2",
            type: "text",
            placeholder: "Quality Guaranteed",
            span: "half",
          },
          {
            key: "heroTrust3",
            label: "Trust Badge 3",
            type: "text",
            placeholder: "Nepal-Wide",
            span: "half",
          },
          {
            key: "heroRatingLabel",
            label: "Rating Label Text",
            type: "text",
            placeholder: "Verified Reviews",
            span: "half",
          },
        ],
      },
      {
        id: "stats",
        title: "Stat Cards (Hero — Right Side)",
        icon: <FiSettings size={14} />,
        description:
          "The four animated count-up counter cards shown beside the hero headline.",
        fields: [
          {
            key: "stat1Value",
            label: "Stat 1 — Number",
            type: "text",
            placeholder: "15,000+",
            span: "half",
          },
          {
            key: "stat1Label",
            label: "Stat 1 — Label",
            type: "text",
            placeholder: "Happy Customers",
            span: "half",
          },
          {
            key: "stat2Value",
            label: "Stat 2 — Number",
            type: "text",
            placeholder: "500+",
            span: "half",
          },
          {
            key: "stat2Label",
            label: "Stat 2 — Label",
            type: "text",
            placeholder: "Products Available",
            span: "half",
          },
          {
            key: "stat3Value",
            label: "Stat 3 — Number",
            type: "text",
            placeholder: "19+",
            span: "half",
          },
          {
            key: "stat3Label",
            label: "Stat 3 — Label",
            type: "text",
            placeholder: "Years of Experience",
            span: "half",
          },
          {
            key: "stat4Value",
            label: "Stat 4 — Number",
            type: "text",
            placeholder: "50+",
            span: "half",
          },
          {
            key: "stat4Label",
            label: "Stat 4 — Label",
            type: "text",
            placeholder: "Cities Served",
            span: "half",
          },
        ],
      },
      {
        id: "about",
        title: "About Section",
        icon: <FiInfo size={14} />,
        description: "The 'Who Are We' section below the hero.",
        fields: [
          {
            key: "aboutSectionLabel",
            label: "Section Label",
            type: "text",
            placeholder: "Who Are We",
            span: "half",
          },
          {
            key: "aboutSectionHeading",
            label: "Section Heading",
            type: "text",
            placeholder: "Welcome to Regmi",
            span: "half",
          },
          {
            key: "aboutText",
            label: "About Paragraph",
            type: "textarea",
            placeholder:
              "Regmi Plastic Traders has been serving Nepal since 2005…",
            span: "full",
          },
          {
            key: "aboutCardEmoji",
            label: "Store Card Emoji",
            type: "text",
            placeholder: "🏪",
            span: "half",
          },
          {
            key: "aboutCardSub",
            label: "Store Card Subtitle",
            type: "text",
            placeholder: "Serving Nepal since 2005",
            span: "half",
          },
          {
            key: "aboutFeature1",
            label: "Feature Checkmark 1",
            type: "text",
            placeholder: "100% Quality Guaranteed",
            span: "half",
          },
          {
            key: "aboutFeature2",
            label: "Feature Checkmark 2",
            type: "text",
            placeholder: "Fast Delivery Across Nepal",
            span: "half",
          },
          {
            key: "aboutFeature3",
            label: "Feature Checkmark 3",
            type: "text",
            placeholder: "Affordable Prices",
            span: "half",
          },
          {
            key: "aboutFeature4",
            label: "Feature Checkmark 4",
            type: "text",
            placeholder: "15,000+ Happy Customers",
            span: "half",
          },
          {
            key: "aboutLearnMoreText",
            label: "Learn More Link Text",
            type: "text",
            placeholder: "Learn More About Us",
            span: "half",
          },
          {
            key: "aboutLearnMoreHref",
            label: "Learn More Link URL",
            type: "text",
            placeholder: "/about",
            span: "half",
          },
        ],
      },
      {
        id: "products-section",
        title: "Featured Products Section",
        icon: <FiPackage size={14} />,
        description: "Section heading above the product carousel.",
        fields: [
          {
            key: "productsSectionLabel",
            label: "Section Label",
            type: "text",
            placeholder: "Handpicked for You",
            span: "half",
          },
          {
            key: "productsSectionHeading",
            label: "Section Heading",
            type: "text",
            placeholder: "Discover Our Products",
            span: "half",
          },
          {
            key: "productsSectionSub",
            label: "Subtitle Paragraph",
            type: "textarea",
            placeholder: "Browse our most popular plastic products…",
            span: "full",
          },
          {
            key: "productsViewAllText",
            label: "View All Button Text",
            type: "text",
            placeholder: "View All Products",
            span: "half",
          },
          {
            key: "productsViewAllHref",
            label: "View All Button Link",
            type: "text",
            placeholder: "/products",
            span: "half",
          },
        ],
      },
      {
        id: "reviews-section",
        title: "Reviews Section",
        icon: <FiSettings size={14} />,
        description: "The customer reviews section heading and rating label.",
        fields: [
          {
            key: "reviewsSectionLabel",
            label: "Section Label",
            type: "text",
            placeholder: "Customer Reviews",
            span: "half",
          },
          {
            key: "reviewsSectionHeading",
            label: "Section Heading",
            type: "text",
            placeholder: "Trusted by Thousands",
            span: "half",
          },
          {
            key: "reviewsRatingSubLabel",
            label: "Rating Sub-label",
            type: "text",
            placeholder: "Based on {n}+ Google Reviews",
            span: "full",
            hint: "Use {n} as placeholder for the live review count number",
          },
        ],
      },
      {
        id: "blog-section",
        title: "Blog Section",
        icon: <FiSettings size={14} />,
        description: "Section heading for the latest articles strip.",
        fields: [
          {
            key: "blogSectionLabel",
            label: "Section Label",
            type: "text",
            placeholder: "Latest Updates",
            span: "half",
          },
          {
            key: "blogSectionHeading",
            label: "Section Heading",
            type: "text",
            placeholder: "From Our Blog",
            span: "half",
          },
          {
            key: "blogSectionSub",
            label: "Subtitle",
            type: "textarea",
            placeholder: "Articles, guides and news from Regmi Plastic Traders",
            span: "full",
          },
          {
            key: "blogAllArticlesText",
            label: "All Articles Link",
            type: "text",
            placeholder: "All Articles",
            span: "half",
          },
        ],
      },
      {
        id: "cta",
        title: "CTA Strip (Bottom Banner)",
        icon: <FiSettings size={14} />,
        description:
          "The red call-to-action banner at the very bottom of the home page.",
        fields: [
          {
            key: "ctaTitle",
            label: "Headline",
            type: "text",
            placeholder: "Ready to Shop Quality Plastic Products?",
            span: "full",
          },
          {
            key: "ctaSubtitle",
            label: "Subtitle",
            type: "textarea",
            placeholder:
              "Browse 500+ products and get them delivered across Nepal",
            span: "full",
          },
          {
            key: "ctaBtn1Text",
            label: "Button 1 Text",
            type: "text",
            placeholder: "Browse Products",
            span: "half",
          },
          {
            key: "ctaBtn1Href",
            label: "Button 1 Link",
            type: "text",
            placeholder: "/products",
            span: "half",
          },
          {
            key: "ctaBtn2Text",
            label: "Button 2 Text",
            type: "text",
            placeholder: "Contact Us",
            span: "half",
          },
          {
            key: "ctaBtn2Href",
            label: "Button 2 Link",
            type: "text",
            placeholder: "/contact",
            span: "half",
          },
        ],
      },
    ],
  },

  products: {
    title: "Products Page",
    icon: <FiPackage size={16} />,
    sections: [
      {
        id: "header",
        title: "Page Header",
        icon: <FiLayout size={14} />,
        description:
          "The heading shown at the top of the /products listing page.",
        fields: [
          {
            key: "pageLabel",
            label: "Small Label",
            type: "text",
            placeholder: "Our Collection",
            span: "half",
          },
          {
            key: "pageTitle",
            label: "Page Heading",
            type: "text",
            placeholder: "Our Products",
            span: "half",
          },
          {
            key: "pageSubtitle",
            label: "Subtitle Paragraph",
            type: "textarea",
            placeholder: "Browse our wide range of quality plastic goods…",
            span: "full",
          },
          {
            key: "searchPlaceholder",
            label: "Search Box Placeholder",
            type: "text",
            placeholder: "Search products…",
            span: "half",
          },
          {
            key: "emptyStateText",
            label: "Empty State Message",
            type: "text",
            placeholder: "No products found.",
            span: "half",
          },
          {
            key: "filterAllLabel",
            label: "Filter 'All' Label",
            type: "text",
            placeholder: "All",
            span: "half",
          },
          {
            key: "viewOnDarazText",
            label: "'View on Daraz' Button",
            type: "text",
            placeholder: "View on Daraz",
            span: "half",
          },
        ],
      },
    ],
  },

  about: {
    title: "About Page",
    icon: <FiInfo size={16} />,
    sections: [
      {
        id: "hero",
        title: "Page Hero",
        icon: <FiLayout size={14} />,
        description: "Top banner section of the /about page.",
        fields: [
          {
            key: "heroLabel",
            label: "Small Label",
            type: "text",
            placeholder: "Our Story",
            span: "half",
          },
          {
            key: "heroTitle",
            label: "Page Heading",
            type: "text",
            placeholder: "About Regmi Plastic Traders",
            span: "half",
          },
          {
            key: "heroSubtitle",
            label: "Hero Subtitle",
            type: "textarea",
            placeholder: "Serving Nepal since 2005…",
            span: "full",
          },
        ],
      },
      {
        id: "story",
        title: "Our Story Content",
        icon: <FiInfo size={14} />,
        description: "Main body content and mission/vision statements.",
        fields: [
          {
            key: "storyTitle",
            label: "Section Title",
            type: "text",
            placeholder: "Our Story",
            span: "half",
          },
          {
            key: "storyContent",
            label: "Story Paragraphs",
            type: "textarea",
            placeholder: "Regmi Plastic Traders was founded…",
            span: "full",
          },
          {
            key: "mission",
            label: "Mission Statement",
            type: "textarea",
            placeholder: "Our mission is to…",
            span: "full",
          },
          {
            key: "vision",
            label: "Vision Statement",
            type: "textarea",
            placeholder: "We envision a Nepal…",
            span: "full",
          },
        ],
      },
      {
        id: "values",
        title: "Our Values",
        icon: <FiSettings size={14} />,
        description: "Value proposition cards.",
        fields: [
          {
            key: "value1Title",
            label: "Value 1 — Title",
            type: "text",
            placeholder: "Quality First",
            span: "half",
          },
          {
            key: "value1Text",
            label: "Value 1 — Text",
            type: "textarea",
            placeholder: "We never compromise…",
            span: "full",
          },
          {
            key: "value2Title",
            label: "Value 2 — Title",
            type: "text",
            placeholder: "Customer First",
            span: "half",
          },
          {
            key: "value2Text",
            label: "Value 2 — Text",
            type: "textarea",
            placeholder: "Our customers are…",
            span: "full",
          },
          {
            key: "value3Title",
            label: "Value 3 — Title",
            type: "text",
            placeholder: "Nepal First",
            span: "half",
          },
          {
            key: "value3Text",
            label: "Value 3 — Text",
            type: "textarea",
            placeholder: "We are proudly…",
            span: "full",
          },
        ],
      },
      {
        id: "team",
        title: "Team Section",
        icon: <FiSettings size={14} />,
        description: "Team/founders section heading.",
        fields: [
          {
            key: "teamLabel",
            label: "Section Label",
            type: "text",
            placeholder: "Meet the Team",
            span: "half",
          },
          {
            key: "teamHeading",
            label: "Section Heading",
            type: "text",
            placeholder: "The People Behind Regmi",
            span: "half",
          },
        ],
      },
    ],
  },

  contact: {
    title: "Contact Page",
    icon: <FiPhone size={16} />,
    sections: [
      {
        id: "header",
        title: "Page Header",
        icon: <FiLayout size={14} />,
        description: "Top heading of the /contact page.",
        fields: [
          {
            key: "pageLabel",
            label: "Small Label",
            type: "text",
            placeholder: "Get In Touch",
            span: "half",
          },
          {
            key: "pageTitle",
            label: "Page Heading",
            type: "text",
            placeholder: "Contact Us",
            span: "half",
          },
          {
            key: "pageSubtitle",
            label: "Subtitle",
            type: "textarea",
            placeholder: "We'd love to hear from you…",
            span: "full",
          },
        ],
      },
      {
        id: "form",
        title: "Contact Form",
        icon: <FiPhone size={14} />,
        description: "Text labels on the contact form.",
        fields: [
          {
            key: "formTitle",
            label: "Form Card Heading",
            type: "text",
            placeholder: "Send us a message",
            span: "half",
          },
          {
            key: "formNameLabel",
            label: "Name Field Label",
            type: "text",
            placeholder: "Your Name",
            span: "half",
          },
          {
            key: "formEmailLabel",
            label: "Email Field Label",
            type: "text",
            placeholder: "Email Address",
            span: "half",
          },
          {
            key: "formMsgLabel",
            label: "Message Field Label",
            type: "text",
            placeholder: "Your Message",
            span: "half",
          },
          {
            key: "formButton",
            label: "Submit Button Text",
            type: "text",
            placeholder: "Send Message",
            span: "half",
          },
          {
            key: "formSuccessMsg",
            label: "Success Message",
            type: "text",
            placeholder: "Message sent! We'll reply soon.",
            span: "full",
          },
        ],
      },
      {
        id: "cta",
        title: "Contact CTA Strip",
        icon: <FiSettings size={14} />,
        description: "The call-to-action banner on the contact page.",
        fields: [
          {
            key: "ctaTitle",
            label: "CTA Headline",
            type: "text",
            placeholder: "Ready to place an order?",
            span: "half",
          },
          {
            key: "ctaSubtitle",
            label: "CTA Subtitle",
            type: "textarea",
            placeholder: "Call us or visit our store…",
            span: "full",
          },
        ],
      },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function unwrap(raw: unknown): string {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    if ("value" in o) return String(o.value ?? "");
  }
  return raw !== null && raw !== undefined ? String(raw) : "";
}

// ─── Input base styles ────────────────────────────────────────────────────────
const IB = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "11px 14px",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  color: C.text1,
  fontFamily: F.body,
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};
const onFocus = (
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
) => {
  e.currentTarget.style.borderColor = "rgba(192,57,43,0.55)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192,57,43,0.10)";
};
const onBlur = (
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
) => {
  e.currentTarget.style.borderColor = C.border;
  e.currentTarget.style.boxShadow = "none";
};

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const isArea = def.type === "textarea";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        gridColumn: def.span === "full" ? "span 2" : "span 1",
      }}
    >
      <label
        style={{
          fontFamily: F.ui,
          fontSize: 9,
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.16em",
          color: C.text4,
        }}
      >
        {def.label}
      </label>
      {isArea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.placeholder}
          rows={3}
          style={{ ...IB, resize: "vertical" as const }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      ) : (
        <input
          type={def.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.placeholder}
          style={IB}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      )}
      {def.hint && (
        <p
          style={{
            fontFamily: F.body,
            fontSize: 11,
            color: C.text4,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {def.hint}
        </p>
      )}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({
  section,
  values,
  onChange,
  onBgUploaded,
  onLogoUploaded,
}: {
  section: SectionDef;
  values: Record<string, string>;
  onChange: (k: string, v: string) => void;
  onBgUploaded?: (path: string) => void;
  onLogoUploaded?: (path: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const filled = section.fields.filter((f) => values[f.key]?.trim()).length;
  const total = section.fields.length;

  return (
    <div
      style={{
        background: C.bg3,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px 22px",
          background: "none",
          border: "none",
          cursor: "pointer",
          borderBottom: open ? `1px solid ${C.border}` : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "rgba(192,57,43,0.12)",
              color: C.red,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {section.icon}
          </div>
          <div style={{ textAlign: "left" as const }}>
            <div
              style={{
                fontFamily: F.ui,
                fontSize: 13,
                fontWeight: 700,
                color: C.text1,
              }}
            >
              {section.title}
            </div>
            <div
              style={{
                fontFamily: F.body,
                fontSize: 11,
                color: C.text4,
                marginTop: 2,
              }}
            >
              {open ? section.description : `${filled}/${total} fields filled`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {section.fields.slice(0, Math.min(total, 8)).map((f, i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: values[f.key]?.trim()
                    ? C.green
                    : "rgba(255,255,255,0.10)",
                }}
              />
            ))}
          </div>
          <div style={{ color: C.text4 }}>
            {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </div>
        </div>
      </button>

      {open && (
        <div
          style={{
            padding: "20px 22px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          {/* Hero section: background image uploader appears first */}
          {section.id === "hero" && onBgUploaded && (
            <HeroBgUploadField
              currentPath={values["heroBgImage"] || ""}
              onUploaded={(path) => {
                onChange("heroBgImage", path);
                onBgUploaded(path);
              }}
            />
          )}
          {/* Global brand section: logo uploader */}
          {section.id === "brand" && onLogoUploaded && (
            <LogoUploadField
              currentUrl={values["logoUrl"] || ""}
              onUploaded={(path) => {
                onChange("logoUrl", path);
                onLogoUploaded(path);
              }}
            />
          )}
          {section.fields.map((field) => (
            <Field
              key={field.key}
              def={field}
              value={values[field.key] || ""}
              onChange={(v) => onChange(field.key, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab ──────────────────────────────────────────────────────────────────────
function Tab({
  id,
  cfg,
  active,
  onClick,
}: {
  id: string;
  cfg: PageDef;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 16px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        background: active ? C.red : "transparent",
        color: active ? "white" : C.text3,
        fontFamily: F.ui,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap" as const,
        transition: "background 0.2s, color 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = C.surface;
          e.currentTarget.style.color = C.text1;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = C.text3;
        }
      }}
    >
      {cfg.icon}
      {cfg.title}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CmsEditorPage() {
  const params = useParams();
  const urlPage = (params?.page as string) || "global";

  const [activePage, setActivePage] = useState<string>(urlPage);
  const [allData, setAllData] = useState<
    Record<string, Record<string, string>>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const pageConfig: PageDef = PAGES[activePage] || PAGES.global;
  const values = allData[activePage] || {};

  const loadPage = useCallback(async (page: string) => {
    setLoading(true);
    try {
      const data: Record<string, unknown> = await cmsApi.getPage(page);
      // Collect all declared field keys + image keys
      const declaredKeys =
        PAGES[page]?.sections.flatMap((s) => s.fields.map((f) => f.key)) || [];
      const extraKeys =
        page === "home"
          ? ["heroBgImage"]
          : page === "global"
            ? ["logoUrl"]
            : [];
      const mapped: Record<string, string> = {};
      [...declaredKeys, ...extraKeys].forEach((key) => {
        mapped[key] = unwrap(data[key]);
      });
      setAllData((prev) => ({ ...prev, [page]: mapped }));
    } catch {
      toast.error("Failed to load — is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!allData[activePage]) loadPage(activePage);
    else setLoading(false);
  }, [activePage]); // eslint-disable-line

  const handleChange = (key: string, val: string) => {
    setAllData((prev) => ({
      ...prev,
      [activePage]: { ...(prev[activePage] || {}), [key]: val },
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Record<
        string,
        { value: string; label: string; type: string }
      > = {};
      pageConfig.sections.forEach((sec) => {
        sec.fields.forEach(({ key, label, type }) => {
          updates[key] = { value: values[key] || "", label, type };
        });
      });
      // Persist image paths alongside text fields
      if (activePage === "home" && values["heroBgImage"] !== undefined) {
        updates["heroBgImage"] = {
          value: values["heroBgImage"] || "",
          label: "Hero Background Image",
          type: "image",
        };
      }
      if (activePage === "global" && values["logoUrl"] !== undefined) {
        updates["logoUrl"] = {
          value: values["logoUrl"] || "",
          label: "Logo Image URL",
          type: "image",
        };
      }
      await cmsApi.updatePage(activePage, updates);
      toast.success("✓ Saved! Changes are now live on your site.");
      setDirty(false);
    } catch {
      toast.error("Save failed. Check your backend connection.");
    } finally {
      setSaving(false);
    }
  };

  const switchPage = (id: string) => {
    if (dirty && !confirm("You have unsaved changes. Switch anyway?")) return;
    setActivePage(id);
    setDirty(false);
  };

  const totalFields = pageConfig.sections.reduce(
    (a, s) => a + s.fields.length,
    0,
  );
  const filledFields = pageConfig.sections.reduce(
    (a, s) => a + s.fields.filter((f) => values[f.key]?.trim()).length,
    0,
  );
  const pct = totalFields ? Math.round((filledFields / totalFields) * 100) : 0;

  return (
    <div style={{ fontFamily: F.body }}>
      {/* ── Sticky header ── */}
      <div
        style={{
          position: "sticky",
          top: 60,
          zIndex: 20,
          background: C.bg2,
          borderBottom: `1px solid ${C.border}`,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "14px 0 10px",
            flexWrap: "wrap" as const,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: F.display,
                fontSize: 26,
                fontWeight: 700,
                color: C.text1,
                letterSpacing: "-0.02em",
                margin: "0 0 3px",
              }}
            >
              Site Content Editor
            </h1>
            <p
              style={{
                fontFamily: F.body,
                fontSize: 12,
                color: C.text4,
                margin: 0,
              }}
            >
              Edit every word and image from header to footer — changes go live
              immediately.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {dirty && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: F.body,
                  fontSize: 12,
                  color: C.yellow,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: C.yellow,
                    display: "inline-block",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                Unsaved changes
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 22px",
                background: saving
                  ? "rgba(192,57,43,0.4)"
                  : !dirty
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(135deg,#c0392b,#e74c3c)",
                border: `1px solid ${!dirty ? C.border : "transparent"}`,
                borderRadius: 12,
                color: !dirty ? C.text4 : "white",
                fontFamily: F.ui,
                fontSize: 13,
                fontWeight: 700,
                cursor: saving || !dirty ? "not-allowed" : "pointer",
                boxShadow: dirty ? "0 6px 20px rgba(192,57,43,0.30)" : "none",
              }}
            >
              {saving ? (
                <FiRefreshCw
                  size={14}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <FiSave size={14} />
              )}
              {saving ? "Saving…" : dirty ? "Save Changes" : "Saved ✓"}
            </button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            paddingBottom: 12,
            overflowX: "auto" as const,
          }}
        >
          {Object.entries(PAGES).map(([id, cfg]) => (
            <Tab
              key={id}
              id={id}
              cfg={cfg}
              active={activePage === id}
              onClick={() => switchPage(id)}
            />
          ))}
        </div>
      </div>

      {/* ── Page meta bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap" as const,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(192,57,43,0.12)",
              color: C.red,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {pageConfig.icon}
          </div>
          <div>
            <p
              style={{
                fontFamily: F.ui,
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.18em",
                color: C.text4,
                margin: 0,
              }}
            >
              Editing
            </p>
            <p
              style={{
                fontFamily: F.display,
                fontSize: 20,
                fontWeight: 700,
                color: C.text1,
                margin: 0,
              }}
            >
              {pageConfig.title}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 120,
              height: 4,
              borderRadius: 99,
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: pct === 100 ? C.green : C.red,
                borderRadius: 99,
                transition: "width 0.4s",
              }}
            />
          </div>
          <span style={{ fontFamily: F.body, fontSize: 12, color: C.text4 }}>
            {filledFields}/{totalFields} fields filled
          </span>
        </div>
      </div>

      {/* ── Sections ── */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "80px 24px",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: `3px solid ${C.border}`,
              borderTopColor: C.red,
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.text4 }}>
            Loading content…
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pageConfig.sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              values={values}
              onChange={handleChange}
              onBgUploaded={
                activePage === "home" && section.id === "hero"
                  ? (path) => handleChange("heroBgImage", path)
                  : undefined
              }
              onLogoUploaded={
                activePage === "global" && section.id === "brand"
                  ? (path) => handleChange("logoUrl", path)
                  : undefined
              }
            />
          ))}

          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "15px",
              marginTop: 6,
              background: saving
                ? "rgba(192,57,43,0.4)"
                : !dirty
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg,#c0392b,#e74c3c)",
              border: `1px solid ${!dirty ? C.border : "transparent"}`,
              borderRadius: 14,
              color: !dirty ? C.text4 : "white",
              fontFamily: F.ui,
              fontSize: 14,
              fontWeight: 700,
              cursor: saving || !dirty ? "not-allowed" : "pointer",
              boxShadow: dirty ? "0 8px 28px rgba(192,57,43,0.30)" : "none",
            }}
          >
            {saving ? (
              <FiRefreshCw
                size={15}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <FiSave size={15} />
            )}
            {saving
              ? "Saving…"
              : dirty
                ? "Save All Changes"
                : "All Changes Saved ✓"}
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin  { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>
    </div>
  );
}

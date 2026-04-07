"use client";
import { useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { useParams } from "next/navigation";
import { cmsApi, uploadApi } from "@/lib/api";
import toast from "react-hot-toast";
import axios from "axios";
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
  FiFileText,
  FiSearch,
} from "react-icons/fi";
import { C, F } from "@/components/admin/adminUI";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api"
).replace(/\/api$/, "");
const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("regmi-plastic/")) return `https://res.cloudinary.com/dkmbfnuch/image/upload/${path}`;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
};

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
  activePage,
  currentPath,
  onUploaded,
}: {
  activePage: string;
  currentPath: string;
  onUploaded: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPath);
  const [prevPathProp, setPrevPathProp] = useState(currentPath);
  const inputRef = useRef<HTMLInputElement>(null);

  if (currentPath !== prevPathProp) {
    setPrevPathProp(currentPath);
    setPreview(currentPath);
  }

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
      const res = await uploadApi.uploadBackground(activePage, fd);
      const path: string = res.data.url;
      setPreview(path);
      onUploaded(path);
      toast.success("Hero background updated!");
    } catch (err: unknown) {
      console.error("Upload Error:", err);
      toast.error(`Hero background update failed: ${getErrorMessage(err)}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleClear = () => {
    setPreview("");
    onUploaded("");
  };

  const previewUrl = getImageUrl(preview);

  return (
    <div className="cms-span-full" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label style={{ fontFamily: F.ui, fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.16em", color: C.text4 }}>
        Hero Background Photo
      </label>
      <div style={{ width: "100%", height: 160, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, position: "relative", background: preview ? "transparent" : "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {preview ? (
          <>
            <img src={previewUrl} alt="Hero background preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(4,4,6,0.7) 0%, rgba(4,4,6,0.4) 100%)" }} />
            <div style={{ position: "absolute", bottom: 10, left: 14, fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
              Live Preview (with overlay)
            </div>
            <button type="button" onClick={handleClear} style={{ position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: "50%", background: "rgba(192,57,43,0.9)", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiX size={13} />
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center" as const, color: C.text4 }}>
            <FiImage size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p style={{ fontFamily: F.body, fontSize: 12, margin: 0 }}>No background image set — using dark gradient</p>
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", background: uploading ? "rgba(192,57,43,0.3)" : "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 11, color: uploading ? C.text4 : C.red, fontFamily: F.ui, fontSize: 12, fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer" }}>
          {uploading ? <FiRefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> : <FiUpload size={13} />}
          {uploading ? "Uploading…" : preview ? "Replace Background" : "Upload Background Photo"}
        </button>
        <p style={{ fontFamily: F.body, fontSize: 11, color: C.text4, margin: 0, lineHeight: 1.5 }}>
          JPG, PNG, WebP · Max 10MB · Recommended: 1920×1080px or wider · Saved to <code style={{ color: C.text3 }}>/uploads/background/</code>
        </p>
      </div>
      {preview && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 9, border: `1px solid ${C.border}` }}>
          <FiImage size={12} style={{ color: C.text4, flexShrink: 0 }} />
          <code style={{ fontFamily: F.mono, fontSize: 11, color: C.text3, wordBreak: "break-all" as const }}>{preview}</code>
        </div>
      )}
    </div>
  );
}

// ─── Logo Upload Field ────────────────────────────────────────────────────────
function LogoUploadField({ currentUrl, onUploaded }: { currentUrl: string; onUploaded: (path: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const [prevUrlProp, setPrevUrlProp] = useState(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  if (currentUrl !== prevUrlProp) {
    setPrevUrlProp(currentUrl);
    setPreview(currentUrl);
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Only image files are allowed"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2MB"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await uploadApi.uploadLogo(fd);
      const path: string = res.data.url;
      setPreview(path);
      onUploaded(path);
      toast.success("Logo uploaded!");
    } catch (err: unknown) { 
      console.error("Upload Error:", err);
      toast.error(`Logo upload failed: ${getErrorMessage(err)}`); 
    }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };

  const handleClear = () => { setPreview(""); onUploaded(""); };

  return (
    <div className="cms-span-full" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontFamily: F.ui, fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.16em", color: C.text4 }}>Store Logo Image</label>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 72, height: 72, borderRadius: 14, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, position: "relative" }}>
          {preview ? (
            <>
              <img src={getImageUrl(preview)} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <button type="button" onClick={handleClear} style={{ position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: "50%", background: "rgba(192,57,43,0.9)", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                <FiX size={10} />
              </button>
            </>
          ) : (
            <span style={{ fontSize: 28 }}>🏪</span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", background: uploading ? "rgba(192,57,43,0.3)" : "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 10, color: uploading ? C.text4 : C.red, fontFamily: F.ui, fontSize: 12, fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer" }}>
            {uploading ? <FiRefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> : <FiUpload size={13} />}
            {uploading ? "Uploading…" : preview ? "Replace Logo" : "Upload Logo"}
          </button>
          <p style={{ fontFamily: F.body, fontSize: 11, color: C.text4, margin: 0 }}>JPG, PNG, WebP · Max 2MB</p>
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
        description: "Store name and tagline shown in the header, footer, and browser tab.",
        fields: [
          { key: "storeName", label: "Store Name", type: "text", placeholder: "Regmi Plastic Traders", span: "half" },
          { key: "logoLetter", label: "Logo Fallback Letter", type: "text", placeholder: "R", span: "half" },
          { key: "tagline", label: "Site Tagline", type: "text", placeholder: "Nepal's trusted plastic store", span: "full" },
          { key: "establishedYear", label: "Established Year", type: "text", placeholder: "1995", span: "half" },
          { key: "footerTagline", label: "Footer Tagline", type: "textarea", placeholder: "Your trusted source for quality plastic products across Nepal.", span: "full" },
          { key: "copyrightText", label: "Footer Copyright Extra", type: "text", placeholder: "Made with ♥ in Nepal", span: "half" },
        ],
      },
      {
        id: "contact",
        title: "Contact Information",
        icon: <FiPhone size={14} />,
        description: "Shown in the header, footer contact section, and contact page.",
        fields: [
          { key: "phone", label: "Primary Phone", type: "tel", placeholder: "+977-9841234567", span: "half" },
          { key: "phone2", label: "Phone 2 (optional)", type: "tel", placeholder: "+977-9851234567", span: "half" },
          { key: "email", label: "Primary Email", type: "email", placeholder: "info@regmiplastic.com", span: "half" },
          { key: "email2", label: "Email 2 (optional)", type: "email", placeholder: "sales@regmiplastic.com", span: "half" },
          { key: "address", label: "Physical Address", type: "textarea", placeholder: "Kathmandu, Nepal", span: "full" },
          { key: "mapEmbed", label: "Google Maps Embed URL", type: "url", placeholder: "https://www.google.com/maps/embed?pb=…", span: "full", hint: "Google Maps → Share → Embed a map → copy the src= URL" },
        ],
      },
      {
        id: "hours",
        title: "Business Hours",
        icon: <FiSettings size={14} />,
        description: "Store opening hours displayed in the footer.",
        fields: [
          { key: "hoursWeekday", label: "Weekday Hours", type: "text", placeholder: "Sun – Fri: 9AM – 7PM", span: "half" },
          { key: "hoursSaturday", label: "Saturday Hours", type: "text", placeholder: "Saturday: 10AM – 5PM", span: "half" },
        ],
      },
      {
        id: "social",
        title: "Social Media Links",
        icon: <FiGlobe size={14} />,
        description: "Links used in the footer social icons.",
        fields: [
          { key: "socialFacebook", label: "Facebook URL", type: "url", placeholder: "https://facebook.com/regmiplastic", span: "half" },
          { key: "socialInstagram", label: "Instagram URL", type: "url", placeholder: "https://instagram.com/regmiplastic", span: "half" },
          { key: "socialYoutube", label: "YouTube URL", type: "url", placeholder: "https://youtube.com/@regmiplastic", span: "half" },
          { key: "socialWhatsapp", label: "WhatsApp Number", type: "tel", placeholder: "+9779851012554", span: "half", hint: "Full number with country code, no spaces" },
        ],
      },
      {
        id: "nav",
        title: "Navigation & Header",
        icon: <FiLayout size={14} />,
        description: "Text labels shown in the site navigation bar.",
        fields: [
          { key: "headerPhone", label: "Header Phone Text", type: "text", placeholder: "+977-9841234567", span: "half" },
          { key: "headerCTAText", label: "Header Shop Button Text", type: "text", placeholder: "Shop Now", span: "half" },
          { key: "navHome", label: "Nav: Home", type: "text", placeholder: "Home", span: "half" },
          { key: "navProducts", label: "Nav: Products", type: "text", placeholder: "Products", span: "half" },
          { key: "navBlog", label: "Nav: Blog", type: "text", placeholder: "Blog", span: "half" },
          { key: "navAbout", label: "Nav: About", type: "text", placeholder: "About", span: "half" },
          { key: "navContact", label: "Nav: Contact", type: "text", placeholder: "Contact", span: "half" },
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
        description: "The very first thing visitors see — headline, subtitle, CTA buttons, and background photo.",
        fields: [
          { key: "heroBadge", label: "Badge Pill Text", type: "text", placeholder: "Est. 1995 · Kathmandu, Nepal", span: "full" },
          { key: "heroTitle", label: "Hero Headline", type: "textarea", placeholder: "Nepal's Most Trusted Plastic Goods Store", span: "full" },
          { key: "heroSubtitle", label: "Hero Subtitle Paragraph", type: "textarea", placeholder: "Durable, affordable, and high-quality…", span: "full" },
          { key: "heroButtonText", label: "Primary Button Text", type: "text", placeholder: "Shop Now", span: "half" },
          { key: "heroButtonHref", label: "Primary Button Link", type: "text", placeholder: "/products", span: "half" },
          { key: "heroGhostText", label: "Secondary Button Text", type: "text", placeholder: "Our Story", span: "half" },
          { key: "heroGhostHref", label: "Secondary Button Link", type: "text", placeholder: "/about", span: "half" },
          { key: "heroTrust1", label: "Trust Badge 1", type: "text", placeholder: "Free Delivery", span: "half" },
          { key: "heroTrust2", label: "Trust Badge 2", type: "text", placeholder: "Quality Guaranteed", span: "half" },
          { key: "heroTrust3", label: "Trust Badge 3", type: "text", placeholder: "Nepal-Wide", span: "half" },
          { key: "heroRatingLabel", label: "Rating Label Text", type: "text", placeholder: "Verified Reviews", span: "half" },
        ],
      },
      {
        id: "stats",
        title: "Stat Cards (Hero — Right Side)",
        icon: <FiSettings size={14} />,
        description: "The four animated count-up counter cards shown beside the hero headline.",
        fields: [
          { key: "stat1Value", label: "Stat 1 — Number", type: "text", placeholder: "15,000+", span: "half" },
          { key: "stat1Label", label: "Stat 1 — Label", type: "text", placeholder: "Happy Customers", span: "half" },
          { key: "stat2Value", label: "Stat 2 — Number", type: "text", placeholder: "500+", span: "half" },
          { key: "stat2Label", label: "Stat 2 — Label", type: "text", placeholder: "Products Available", span: "half" },
          { key: "stat3Value", label: "Stat 3 — Number", type: "text", placeholder: "19+", span: "half" },
          { key: "stat3Label", label: "Stat 3 — Label", type: "text", placeholder: "Years of Experience", span: "half" },
          { key: "stat4Value", label: "Stat 4 — Number", type: "text", placeholder: "50+", span: "half" },
          { key: "stat4Label", label: "Stat 4 — Label", type: "text", placeholder: "Cities Served", span: "half" },
        ],
      },
      {
        id: "about",
        title: "About Section",
        icon: <FiInfo size={14} />,
        description: "The 'Who Are We' section below the hero.",
        fields: [
          { key: "aboutSectionLabel", label: "Section Label", type: "text", placeholder: "Who Are We", span: "half" },
          { key: "aboutSectionHeading", label: "Section Heading", type: "text", placeholder: "Welcome to Regmi", span: "half" },
          { key: "aboutText", label: "About Paragraph", type: "textarea", placeholder: "Regmi Plastic Traders has been serving Nepal since 1995…", span: "full" },
          { key: "aboutCardEmoji", label: "Store Card Emoji", type: "text", placeholder: "🏪", span: "half" },
          { key: "aboutCardSub", label: "Store Card Subtitle", type: "text", placeholder: "Serving Nepal since 1995", span: "half" },
          { key: "aboutFeature1", label: "Feature Checkmark 1", type: "text", placeholder: "100% Quality Guaranteed", span: "half" },
          { key: "aboutFeature2", label: "Feature Checkmark 2", type: "text", placeholder: "Fast Delivery Across Nepal", span: "half" },
          { key: "aboutFeature3", label: "Feature Checkmark 3", type: "text", placeholder: "Affordable Prices", span: "half" },
          { key: "aboutFeature4", label: "Feature Checkmark 4", type: "text", placeholder: "15,000+ Happy Customers", span: "half" },
          { key: "aboutLearnMoreText", label: "Learn More Link Text", type: "text", placeholder: "Learn More About Us", span: "half" },
          { key: "aboutLearnMoreHref", label: "Learn More Link URL", type: "text", placeholder: "/about", span: "half" },
        ],
      },
      {
        id: "products-section",
        title: "Featured Products Section",
        icon: <FiPackage size={14} />,
        description: "Section heading above the product carousel.",
        fields: [
          { key: "productsSectionLabel", label: "Section Label", type: "text", placeholder: "Handpicked for You", span: "half" },
          { key: "productsSectionHeading", label: "Section Heading", type: "text", placeholder: "Discover Our Products", span: "half" },
          { key: "productsSectionSub", label: "Subtitle Paragraph", type: "textarea", placeholder: "Browse our most popular plastic products…", span: "full" },
          { key: "productsViewAllText", label: "View All Button Text", type: "text", placeholder: "View All Products", span: "half" },
          { key: "productsViewAllHref", label: "View All Button Link", type: "text", placeholder: "/products", span: "half" },
        ],
      },
      {
        id: "reviews-section",
        title: "Reviews Section",
        icon: <FiSettings size={14} />,
        description: "The customer reviews section heading and rating label.",
        fields: [
          { key: "reviewsSectionLabel", label: "Section Label", type: "text", placeholder: "Customer Reviews", span: "half" },
          { key: "reviewsSectionHeading", label: "Section Heading", type: "text", placeholder: "Trusted by Thousands", span: "half" },
          { key: "reviewsRatingSubLabel", label: "Rating Sub-label", type: "text", placeholder: "Based on {n}+ Google Reviews", span: "full", hint: "Use {n} as placeholder for the live review count number" },
        ],
      },
      {
        id: "cta",
        title: "CTA Strip (Bottom Banner)",
        icon: <FiSettings size={14} />,
        description: "The red call-to-action banner at the very bottom of the home page.",
        fields: [
          { key: "ctaTitle", label: "Headline", type: "text", placeholder: "Ready to Shop Quality Plastic Products?", span: "full" },
          { key: "ctaSubtitle", label: "Subtitle", type: "textarea", placeholder: "Browse 500+ products and get them delivered across Nepal", span: "full" },
          { key: "ctaBtn1Text", label: "Button 1 Text", type: "text", placeholder: "Browse Products", span: "half" },
          { key: "ctaBtn1Href", label: "Button 1 Link", type: "text", placeholder: "/products", span: "half" },
          { key: "ctaBtn2Text", label: "Button 2 Text", type: "text", placeholder: "Contact Us", span: "half" },
          { key: "ctaBtn2Href", label: "Button 2 Link", type: "text", placeholder: "/contact", span: "half" },
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
        description: "The heading shown at the top of the /products listing page.",
        fields: [
          { key: "pageLabel", label: "Small Label", type: "text", placeholder: "Our Collection", span: "half" },
          { key: "pageTitle", label: "Page Heading", type: "text", placeholder: "Our Products", span: "half" },
          { key: "pageSubtitle", label: "Subtitle Paragraph", type: "textarea", placeholder: "Browse our wide range of quality plastic goods…", span: "full" },
          { key: "searchPlaceholder", label: "Search Box Placeholder", type: "text", placeholder: "Search products…", span: "half" },
          { key: "emptyStateText", label: "Empty State Message", type: "text", placeholder: "No products found.", span: "half" },
          { key: "filterAllLabel", label: "Filter 'All' Label", type: "text", placeholder: "All", span: "half" },
          { key: "viewOnDarazText", label: "'View on Daraz' Button", type: "text", placeholder: "View on Daraz", span: "half" },
        ],
      },
    ],
  },

  // ─── ABOUT PAGE ──────────────────────────────────────────────────────────────
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
          { key: "heroLabel", label: "Small Label", type: "text", placeholder: "Our Story", span: "half" },
          { key: "heroTitle", label: "Page Heading", type: "text", placeholder: "About Regmi Plastic Traders", span: "half" },
          { key: "heroSubtitle", label: "Hero Subtitle", type: "textarea", placeholder: "Serving Nepal since 1995…", span: "full" },
        ],
      },
      {
        id: "story",
        title: "Our Story Content",
        icon: <FiInfo size={14} />,
        description: "Main body content and mission/vision statements.",
        fields: [
          { key: "storyTitle", label: "Section Title", type: "text", placeholder: "Our Story", span: "half" },
          { key: "storyContent", label: "Story Paragraphs", type: "textarea", placeholder: "Regmi Plastic Traders was founded…", span: "full" },
          { key: "mission", label: "Mission Statement", type: "textarea", placeholder: "Our mission is to…", span: "full" },
          { key: "vision", label: "Vision Statement", type: "textarea", placeholder: "We envision a Nepal…", span: "full" },
        ],
      },
      {
        id: "values",
        title: "Our Values",
        icon: <FiSettings size={14} />,
        description: "The three value proposition cards.",
        fields: [
          { key: "value1Title", label: "Value 1 — Title", type: "text", placeholder: "Quality First", span: "half" },
          { key: "value1Text", label: "Value 1 — Text", type: "textarea", placeholder: "We never compromise…", span: "full" },
          { key: "value2Title", label: "Value 2 — Title", type: "text", placeholder: "Customer First", span: "half" },
          { key: "value2Text", label: "Value 2 — Text", type: "textarea", placeholder: "Our customers are…", span: "full" },
          { key: "value3Title", label: "Value 3 — Title", type: "text", placeholder: "Nepal First", span: "half" },
          { key: "value3Text", label: "Value 3 — Text", type: "textarea", placeholder: "We are proudly…", span: "full" },
        ],
      },
      // ── NEW: Stats Card ──────────────────────────────────────────────────────
      {
        id: "stats",
        title: "Stats Card (19+, 15,000+, 500+)",
        icon: <FiSettings size={14} />,
        description: "The three animated numbers in the trophy card. Leave blank to inherit from Home page stats.",
        fields: [
          { key: "stat1Value", label: "Stat 1 — Number", type: "text", placeholder: "15,000+", span: "half" },
          { key: "stat1Label", label: "Stat 1 — Label", type: "text", placeholder: "Happy Customers", span: "half" },
          { key: "stat2Value", label: "Stat 2 — Number", type: "text", placeholder: "500+", span: "half" },
          { key: "stat2Label", label: "Stat 2 — Label", type: "text", placeholder: "Products Available", span: "half" },
          { key: "stat3Value", label: "Stat 3 — Number", type: "text", placeholder: "19+", span: "half" },
          { key: "stat3Label", label: "Stat 3 — Label", type: "text", placeholder: "Years of Experience", span: "half" },
        ],
      },
      // ── NEW: Why Choose Us ───────────────────────────────────────────────────
      {
        id: "why-us",
        title: "Why Choose Us",
        icon: <FiSettings size={14} />,
        description: "Left-side text and feature checklist shown beside the stats card.",
        fields: [
          { key: "whyUsLabel", label: "Section Label", type: "text", placeholder: "Why Choose Us", span: "half" },
          { key: "whyUsBody", label: "Body Paragraph", type: "textarea", placeholder: "For over 19 years, we've been Nepal's go-to store…", span: "full" },
          { key: "feature1", label: "Feature 1", type: "text", placeholder: "100% Quality Guaranteed", span: "half" },
          { key: "feature2", label: "Feature 2", type: "text", placeholder: "Best Prices in Nepal", span: "half" },
          { key: "feature3", label: "Feature 3", type: "text", placeholder: "Fast Delivery Nationwide", span: "half" },
          { key: "feature4", label: "Feature 4", type: "text", placeholder: "BPA-Free Products", span: "half" },
          { key: "feature5", label: "Feature 5", type: "text", placeholder: "Customer Support", span: "half" },
          { key: "feature6", label: "Feature 6", type: "text", placeholder: "Easy Returns", span: "half" },
          { key: "feature7", label: "Feature 7 (optional)", type: "text", placeholder: "", span: "half" },
          { key: "feature8", label: "Feature 8 (optional)", type: "text", placeholder: "", span: "half" },
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
          { key: "pageLabel", label: "Small Label", type: "text", placeholder: "Get In Touch", span: "half" },
          { key: "pageTitle", label: "Page Heading", type: "text", placeholder: "Contact Us", span: "half" },
          { key: "pageSubtitle", label: "Subtitle", type: "textarea", placeholder: "We'd love to hear from you…", span: "full" },
        ],
      },
      {
        id: "form",
        title: "Contact Form",
        icon: <FiPhone size={14} />,
        description: "Text labels on the contact form.",
        fields: [
          { key: "formTitle", label: "Form Card Heading", type: "text", placeholder: "Send us a message", span: "half" },
          { key: "formNameLabel", label: "Name Field Label", type: "text", placeholder: "Your Name", span: "half" },
          { key: "formEmailLabel", label: "Email Field Label", type: "text", placeholder: "Email Address", span: "half" },
          { key: "formMsgLabel", label: "Message Field Label", type: "text", placeholder: "Your Message", span: "half" },
          { key: "formButton", label: "Submit Button Text", type: "text", placeholder: "Send Message", span: "half" },
          { key: "formSuccessMsg", label: "Success Message", type: "text", placeholder: "Message sent! We'll reply soon.", span: "full" },
        ],
      },
    ],
  },

  blog: {
    title: "Blog Page",
    icon: <FiFileText size={16} />,
    sections: [
      {
        id: "hero",
        title: "Page Hero",
        icon: <FiLayout size={14} />,
        description: "Top heading of the /blog page.",
        fields: [
          { key: "blogSectionLabel", label: "Small Label", type: "text", placeholder: "Latest Updates", span: "half" },
          { key: "blogSectionHeading", label: "Page Heading", type: "text", placeholder: "From Our Blog", span: "half" },
          { key: "blogSectionSub", label: "Subtitle", type: "textarea", placeholder: "Articles, guides and news from Regmi Plastic Traders", span: "full" },
          { key: "blogAllArticlesText", label: "All Articles Link", type: "text", placeholder: "All Articles", span: "half" },
        ],
      },
    ],
  },

  // ─── SEO PAGE ─────────────────────────────────────────────────────────────────
  seo: {
    title: "SEO Settings",
    icon: <FiSearch size={16} />,
    sections: [
      {
        id: "seo-global",
        title: "Global / Default SEO",
        icon: <FiGlobe size={14} />,
        description: "Fallback meta tags used on any page that doesn't have its own specific SEO data set below.",
        fields: [
          { key: "globalSiteTitle", label: "Default Site Title", type: "text", placeholder: "Regmi Plastic Traders — Nepal's Trusted Plastic Store", span: "full", hint: "Used as <title> when no page-specific title is set. Keep under 60 characters." },
          { key: "globalTitleSuffix", label: "Title Suffix / Brand", type: "text", placeholder: "| Regmi Plastic Traders", span: "half", hint: "Appended to every page title, e.g. 'Home | Regmi Plastic Traders'" },
          { key: "globalMetaDescription", label: "Default Meta Description", type: "textarea", placeholder: "Regmi Plastic Traders is Nepal's most trusted plastic goods store, offering 500+ quality products across Kathmandu and nationwide.", span: "full", hint: "Keep between 120–160 characters for best search engine results." },
          { key: "globalMetaKeywords", label: "Global Meta Keywords", type: "textarea", placeholder: "plastic store nepal, plastic products kathmandu, regmi plastic, buy plastic goods nepal", span: "full", hint: "Comma-separated keywords (limited SEO impact on Google, still used by some engines)." },
          { key: "globalCanonicalBase", label: "Site Canonical Base URL", type: "url", placeholder: "https://regmiplastictraders.com.np", span: "half", hint: "The root URL of your site, no trailing slash. Used to construct canonical links." },
          { key: "globalRobots", label: "Global Robots Directive", type: "text", placeholder: "index, follow", span: "half", hint: "Controls how crawlers index your site. Typical: 'index, follow'" },
        ],
      },
      {
        id: "seo-og",
        title: "Open Graph (Social Sharing)",
        icon: <FiGlobe size={14} />,
        description: "Controls how your pages appear when shared on Facebook, LinkedIn, and other Open Graph-compatible platforms.",
        fields: [
          { key: "ogSiteName", label: "OG Site Name", type: "text", placeholder: "Regmi Plastic Traders", span: "half" },
          { key: "ogType", label: "OG Type", type: "text", placeholder: "website", span: "half", hint: "Usually 'website' for homepages, 'article' for blog posts." },
          { key: "ogImage", label: "Default OG Image URL", type: "url", placeholder: "https://regmiplastictraders.com.np/og-image.jpg", span: "full", hint: "Recommended size: 1200×630px. Used when sharing any page that has no specific OG image." },
          { key: "ogImageAlt", label: "OG Image Alt Text", type: "text", placeholder: "Regmi Plastic Traders — Quality Plastic Products Nepal", span: "full" },
          { key: "ogLocale", label: "OG Locale", type: "text", placeholder: "en_US", span: "half" },
          { key: "ogTwitterCard", label: "Twitter Card Type", type: "text", placeholder: "summary_large_image", span: "half", hint: "Options: summary, summary_large_image" },
          { key: "ogTwitterSite", label: "Twitter / X Handle", type: "text", placeholder: "@regmiplastic", span: "half" },
          { key: "ogTwitterCreator", label: "Twitter Creator Handle", type: "text", placeholder: "@regmiplastic", span: "half" },
        ],
      },
      {
        id: "seo-home",
        title: "Home Page SEO",
        icon: <FiHome size={14} />,
        description: "Meta tags specifically for the homepage (/).",
        fields: [
          { key: "homeMetaTitle", label: "Page Title", type: "text", placeholder: "Regmi Plastic Traders — Nepal's Most Trusted Plastic Store", span: "full", hint: "Ideal: 50–60 chars. Shows in browser tab and Google search results." },
          { key: "homeMetaDescription", label: "Meta Description", type: "textarea", placeholder: "Shop 500+ quality plastic products at Regmi Plastic Traders. Serving Kathmandu and all of Nepal since 1995. Free delivery available.", span: "full", hint: "Ideal: 120–160 chars." },
          { key: "homeMetaKeywords", label: "Meta Keywords", type: "textarea", placeholder: "plastic store kathmandu, buy plastic products nepal, household plastic goods", span: "full" },
          { key: "homeOgTitle", label: "OG Title", type: "text", placeholder: "Regmi Plastic Traders — Nepal's Most Trusted Plastic Store", span: "full" },
          { key: "homeOgDescription", label: "OG Description", type: "textarea", placeholder: "Quality plastic products delivered across Nepal. Visit Regmi Plastic Traders.", span: "full" },
          { key: "homeOgImage", label: "OG Image URL", type: "url", placeholder: "https://regmiplastictraders.com.np/og-home.jpg", span: "half" },
          { key: "homeCanonical", label: "Canonical URL", type: "url", placeholder: "https://regmiplastictraders.com.np/", span: "half" },
          { key: "homeSchemaType", label: "Schema.org Type", type: "text", placeholder: "LocalBusiness", span: "half", hint: "JSON-LD type, e.g. LocalBusiness, Store, Organization" },
          { key: "homeSchemaJson", label: "JSON-LD Structured Data (raw)", type: "textarea", placeholder: '{"@context":"https://schema.org","@type":"LocalBusiness","name":"Regmi Plastic Traders",...}', span: "full", hint: "Optional: paste full JSON-LD script content. Validates at schema.org/validator" },
        ],
      },
      {
        id: "seo-products",
        title: "Products Page SEO",
        icon: <FiPackage size={14} />,
        description: "Meta tags for the /products listing page.",
        fields: [
          { key: "productsMetaTitle", label: "Page Title", type: "text", placeholder: "Shop Plastic Products — Regmi Plastic Traders Nepal", span: "full", hint: "50–60 chars recommended." },
          { key: "productsMetaDescription", label: "Meta Description", type: "textarea", placeholder: "Browse 500+ quality plastic products — buckets, containers, household goods and more. Delivered across Nepal.", span: "full", hint: "120–160 chars recommended." },
          { key: "productsMetaKeywords", label: "Meta Keywords", type: "textarea", placeholder: "plastic products nepal, buy plastic online nepal, plastic buckets containers nepal", span: "full" },
          { key: "productsOgTitle", label: "OG Title", type: "text", placeholder: "Shop Plastic Products — Regmi Plastic Traders", span: "full" },
          { key: "productsOgDescription", label: "OG Description", type: "textarea", placeholder: "500+ plastic products available online. Affordable prices, fast delivery.", span: "full" },
          { key: "productsOgImage", label: "OG Image URL", type: "url", placeholder: "https://regmiplastictraders.com.np/og-products.jpg", span: "half" },
          { key: "productsCanonical", label: "Canonical URL", type: "url", placeholder: "https://regmiplastictraders.com.np/products", span: "half" },
          { key: "productsSitemapPriority", label: "Sitemap Priority", type: "text", placeholder: "0.9", span: "half", hint: "0.0 to 1.0. Higher = more frequently crawled." },
          { key: "productsSitemapChangefreq", label: "Sitemap Change Frequency", type: "text", placeholder: "weekly", span: "half", hint: "always, hourly, daily, weekly, monthly, yearly, never" },
        ],
      },
      {
        id: "seo-about",
        title: "About Page SEO",
        icon: <FiInfo size={14} />,
        description: "Meta tags for the /about page.",
        fields: [
          { key: "aboutMetaTitle", label: "Page Title", type: "text", placeholder: "About Us — Regmi Plastic Traders | Est. 1995, Nepal", span: "full" },
          { key: "aboutMetaDescription", label: "Meta Description", type: "textarea", placeholder: "Learn about Regmi Plastic Traders — Nepal's trusted plastic goods store since 1995. Our story, mission, and values.", span: "full" },
          { key: "aboutMetaKeywords", label: "Meta Keywords", type: "textarea", placeholder: "about regmi plastic traders, nepal plastic store history, trusted plastic supplier nepal", span: "full" },
          { key: "aboutOgTitle", label: "OG Title", type: "text", placeholder: "About Regmi Plastic Traders — Our Story Since 1995", span: "full" },
          { key: "aboutOgDescription", label: "OG Description", type: "textarea", placeholder: "19+ years serving Nepal with quality plastic products. Discover our story.", span: "full" },
          { key: "aboutOgImage", label: "OG Image URL", type: "url", placeholder: "https://regmiplastictraders.com.np/og-about.jpg", span: "half" },
          { key: "aboutCanonical", label: "Canonical URL", type: "url", placeholder: "https://regmiplastictraders.com.np/about", span: "half" },
        ],
      },
      {
        id: "seo-contact",
        title: "Contact Page SEO",
        icon: <FiPhone size={14} />,
        description: "Meta tags for the /contact page.",
        fields: [
          { key: "contactMetaTitle", label: "Page Title", type: "text", placeholder: "Contact Us — Regmi Plastic Traders Kathmandu Nepal", span: "full" },
          { key: "contactMetaDescription", label: "Meta Description", type: "textarea", placeholder: "Get in touch with Regmi Plastic Traders. Call, email or visit our store in Kathmandu, Nepal. We'd love to hear from you.", span: "full" },
          { key: "contactMetaKeywords", label: "Meta Keywords", type: "textarea", placeholder: "contact regmi plastic traders, plastic store kathmandu address, plastic shop nepal phone", span: "full" },
          { key: "contactOgTitle", label: "OG Title", type: "text", placeholder: "Contact Regmi Plastic Traders — Get In Touch", span: "full" },
          { key: "contactOgDescription", label: "OG Description", type: "textarea", placeholder: "Reach out to Nepal's trusted plastic store. Phone, email or visit us.", span: "full" },
          { key: "contactOgImage", label: "OG Image URL", type: "url", placeholder: "https://regmiplastictraders.com.np/og-contact.jpg", span: "half" },
          { key: "contactCanonical", label: "Canonical URL", type: "url", placeholder: "https://regmiplastictraders.com.np/contact", span: "half" },
        ],
      },
      {
        id: "seo-blog",
        title: "Blog Page SEO",
        icon: <FiFileText size={14} />,
        description: "Meta tags for the /blog listing page. (Individual blog posts use their own CMS-controlled titles.)",
        fields: [
          { key: "blogMetaTitle", label: "Page Title", type: "text", placeholder: "Blog — Regmi Plastic Traders | Plastic Tips & News Nepal", span: "full" },
          { key: "blogMetaDescription", label: "Meta Description", type: "textarea", placeholder: "Read guides, tips, and news from Regmi Plastic Traders — Nepal's leading plastic goods store.", span: "full" },
          { key: "blogMetaKeywords", label: "Meta Keywords", type: "textarea", placeholder: "plastic goods blog nepal, plastic tips guide, regmi plastic news", span: "full" },
          { key: "blogOgTitle", label: "OG Title", type: "text", placeholder: "Regmi Plastic Traders Blog — Tips & Updates from Nepal", span: "full" },
          { key: "blogOgDescription", label: "OG Description", type: "textarea", placeholder: "Helpful guides and updates about plastic products from Nepal's trusted store.", span: "full" },
          { key: "blogOgImage", label: "OG Image URL", type: "url", placeholder: "https://regmiplastictraders.com.np/og-blog.jpg", span: "half" },
          { key: "blogCanonical", label: "Canonical URL", type: "url", placeholder: "https://regmiplastictraders.com.np/blog", span: "half" },
          { key: "blogSitemapPriority", label: "Sitemap Priority", type: "text", placeholder: "0.7", span: "half" },
          { key: "blogSitemapChangefreq", label: "Sitemap Change Frequency", type: "text", placeholder: "weekly", span: "half" },
        ],
      },
      {
        id: "seo-advanced",
        title: "Advanced & Technical SEO",
        icon: <FiSettings size={14} />,
        description: "Verification codes, analytics IDs, and extra technical directives.",
        fields: [
          { key: "googleVerification", label: "Google Search Console Verification", type: "text", placeholder: "abcdef1234567890", span: "full", hint: "The 'content' value from the <meta name=\"google-site-verification\"> tag." },
          { key: "bingVerification", label: "Bing Webmaster Verification", type: "text", placeholder: "XXXXXXXXXXXXXXXX", span: "half" },
          { key: "googleAnalyticsId", label: "Google Analytics / GA4 ID", type: "text", placeholder: "G-XXXXXXXXXX", span: "half", hint: "Your GA4 Measurement ID." },
          { key: "googleTagManagerId", label: "Google Tag Manager ID", type: "text", placeholder: "GTM-XXXXXXX", span: "half" },
          { key: "facebookPixelId", label: "Facebook Pixel ID", type: "text", placeholder: "123456789012345", span: "half" },
          { key: "sitemapUrl", label: "Sitemap URL", type: "url", placeholder: "https://regmiplastictraders.com.np/sitemap.xml", span: "half", hint: "Submit this URL to Google Search Console." },
          { key: "robotsTxtExtra", label: "robots.txt Extra Directives", type: "textarea", placeholder: "Disallow: /admin/\nDisallow: /api/", span: "full", hint: "Additional lines to include in your robots.txt file." },
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
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  // Use a subtle neutral focus style instead of the brand red.
  e.currentTarget.style.borderColor = C.border;
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.08)";
};
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = C.border;
  e.currentTarget.style.boxShadow = "none";
};

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ def, value, onChange }: { def: FieldDef; value: string; onChange: (v: string) => void }) {
  const isArea = def.type === "textarea";
  return (
    <div className={`cms-field${def.span === "full" ? " cms-field-full" : " cms-field-half"}`} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: F.ui, fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.16em", color: C.text4 }}>
        {def.label}
      </label>
      {isArea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder} rows={3} style={{ ...IB, resize: "vertical" as const }} onFocus={onFocus} onBlur={onBlur} />
      ) : (
        <input type={def.type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder} style={IB} onFocus={onFocus} onBlur={onBlur} />
      )}
      {def.hint && (
        <p style={{ fontFamily: F.body, fontSize: 11, color: C.text4, margin: 0, lineHeight: 1.5 }}>{def.hint}</p>
      )}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({ section, values, onChange, onBgUploaded, onLogoUploaded, activePage }: {
  section: SectionDef;
  values: Record<string, string>;
  onChange: (k: string, v: string) => void;
  onBgUploaded?: (path: string) => void;
  onLogoUploaded?: (path: string) => void;
  activePage: string;
}) {
  const [open, setOpen] = useState(true);
  const filled = section.fields.filter((f) => values[f.key]?.trim()).length;
  const total = section.fields.length;

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="cms-section-btn"
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 22px", background: "none", border: "none", cursor: "pointer", borderBottom: open ? `1px solid ${C.border}` : "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(192,57,43,0.12)", color: C.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {section.icon}
          </div>
          <div style={{ textAlign: "left" as const }}>
            <div style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 700, color: C.text1 }}>{section.title}</div>
            <div style={{ fontFamily: F.body, fontSize: 11, color: C.text4, marginTop: 2 }}>
              {open ? section.description : `${filled}/${total} fields filled`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {section.fields.slice(0, Math.min(total, 8)).map((f, i) => (
              <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: values[f.key]?.trim() ? C.green : "rgba(255,255,255,0.10)" }} />
            ))}
          </div>
          <div style={{ color: C.text4 }}>
            {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </div>
        </div>
      </button>

      {open && (
        <div className="cms-section-grid" style={{ padding: "20px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {["home", "about", "blog"].includes(activePage) && section.id === "hero" && onBgUploaded && (
            <HeroBgUploadField
              activePage={activePage}
              currentPath={
                activePage === "about" ? values["aboutBgImage"] || ""
                  : activePage === "blog" ? values["blogBgImage"] || ""
                    : values["heroBgImage"] || ""
              }
              onUploaded={(path) => {
                const imgKey = activePage === "about" ? "aboutBgImage" : activePage === "blog" ? "blogBgImage" : "heroBgImage";
                onChange(imgKey, path);
                onBgUploaded(path);
              }}
            />
          )}
          {section.id === "brand" && onLogoUploaded && (
            <LogoUploadField
              currentUrl={values["logoUrl"] || ""}
              onUploaded={(path) => { onChange("logoUrl", path); onLogoUploaded(path); }}
            />
          )}
          {section.fields.map((field) => (
            <Field key={field.key} def={field} value={values[field.key] || ""} onChange={(v) => onChange(field.key, v)} />
          ))}
        </div>
      )}
    </div>
  );
}


export default function CmsEditorPage() {
  const params = useParams();
  const urlPage = (params?.page as string) || "global";

  const [activePage] = useState<string>(urlPage);
  const [allData, setAllData] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {

  }, []);

  const pageConfig: PageDef = PAGES[activePage] || PAGES.global;
  const values = allData[activePage] || {};

  const loadPage = useCallback(async (page: string) => {
    setLoading(true);
    try {
      const data: Record<string, unknown> = await cmsApi.getPage(page);
      const declaredKeys = PAGES[page]?.sections.flatMap((s) => s.fields.map((f) => f.key)) || [];
      const extraKeys =
        page === "home" ? ["heroBgImage"] :
          page === "about" ? ["aboutBgImage"] :
            page === "blog" ? ["blogBgImage"] :
              page === "global" ? ["logoUrl"] :
                page === "seo" ? [] : [];
      const mapped: Record<string, string> = {};
      [...declaredKeys, ...extraKeys].forEach((key) => { mapped[key] = unwrap(data[key]); });
      setAllData((prev) => ({ ...prev, [page]: mapped }));
    } catch (err: unknown) {
      console.error("Load Error:", err);
      toast.error(`Failed to load: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!allData[activePage]) loadPage(activePage);
    else setLoading(false);
  }, [activePage]); // eslint-disable-line

  const handleChange = (key: string, val: string) => {
    setAllData((prev) => ({ ...prev, [activePage]: { ...(prev[activePage] || {}), [key]: val } }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Record<string, { value: string; label: string; type: string }> = {};
      pageConfig.sections.forEach((sec) => {
        sec.fields.forEach(({ key, label, type }) => {
          updates[key] = { value: values[key] || "", label, type };
        });
      });
      if (activePage === "home" && values["heroBgImage"] !== undefined) updates["heroBgImage"] = { value: values["heroBgImage"] || "", label: "Hero Background Image", type: "image" };
      if (activePage === "about" && values["aboutBgImage"] !== undefined) updates["aboutBgImage"] = { value: values["aboutBgImage"] || "", label: "About Hero Background", type: "image" };
      if (activePage === "blog" && values["blogBgImage"] !== undefined) updates["blogBgImage"] = { value: values["blogBgImage"] || "", label: "Blog Hero Background", type: "image" };
      if (activePage === "global" && values["logoUrl"] !== undefined) updates["logoUrl"] = { value: values["logoUrl"] || "", label: "Logo Image URL", type: "image" };
      await cmsApi.updatePage(activePage, updates);
      toast.success("✓ Saved! Changes are now live on your site.");
      setDirty(false);
    } catch (err: unknown) {
      console.error("Save Error:", err);
      toast.error(`Save failed: ${getErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const totalFields = pageConfig.sections.reduce((a, s) => a + s.fields.length, 0);
  const filledFields = pageConfig.sections.reduce((a, s) => a + s.fields.filter((f) => values[f.key]?.trim()).length, 0);
  const pct = totalFields ? Math.round((filledFields / totalFields) * 100) : 0;

  return (
    <div className="cms-root" style={{ fontFamily: F.body, margin: "-28px -32px 0", padding: "0 32px" }}>
      {/* ── Title bar (scrolls away) ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 0 12px", flexWrap: "wrap" as const }}>
        <div>
          <h1 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.text1, letterSpacing: "-0.02em", margin: "0 0 3px" }}>Site Content Editor</h1>
          <p style={{ fontFamily: F.body, fontSize: 12, color: C.text4, margin: 0 }}>Edit every word and image from header to footer — changes go live immediately.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {dirty && (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: F.body, fontSize: 12, color: C.yellow }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.yellow, display: "inline-block", animation: "pulse 1.5s ease-in-out infinite" }} />
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", background: saving ? "rgba(192,57,43,0.4)" : !dirty ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#c0392b,#e74c3c)", border: `1px solid ${!dirty ? C.border : "transparent"}`, borderRadius: 12, color: !dirty ? C.text4 : "white", fontFamily: F.ui, fontSize: 13, fontWeight: 700, cursor: saving || !dirty ? "not-allowed" : "pointer", boxShadow: dirty ? "0 6px 20px rgba(192,57,43,0.30)" : "none" }}
          >
            {saving ? <FiRefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <FiSave size={14} />}
            {saving ? "Saving…" : dirty ? "Save Changes" : "Saved ✓"}
          </button>
        </div>
      </div>

      {/* ── Page meta bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" as const }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.06)", color: C.text1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {pageConfig.icon}
          </div>
          <div>
            <p style={{ fontFamily: F.ui, fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.18em", color: C.text4, margin: 0 }}>Editing</p>
            <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.text1, margin: 0 }}>{pageConfig.title}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 120, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? C.green : C.text1, borderRadius: 99, transition: "width 0.4s" }} />
          </div>
          <span style={{ fontFamily: F.body, fontSize: 12, color: C.text4 }}>{filledFields}/{totalFields} fields filled</span>
        </div>
      </div>

      {/* ── Sections ── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px", gap: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.text1, animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.text4 }}>Loading content…</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pageConfig.sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              values={values}
              onChange={handleChange}
              activePage={activePage}
              onBgUploaded={
                ["home", "about", "blog"].includes(activePage) && section.id === "hero"
                  ? (path) => {
                    const imgKey = activePage === "about" ? "aboutBgImage" : activePage === "blog" ? "blogBgImage" : "heroBgImage";
                    handleChange(imgKey, path);
                  }
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
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px", marginTop: 6, background: saving ? "rgba(192,57,43,0.4)" : !dirty ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#c0392b,#e74c3c)", border: `1px solid ${!dirty ? C.border : "transparent"}`, borderRadius: 14, color: !dirty ? C.text4 : "white", fontFamily: F.ui, fontSize: 14, fontWeight: 700, cursor: saving || !dirty ? "not-allowed" : "pointer", boxShadow: dirty ? "0 8px 28px rgba(192,57,43,0.30)" : "none" }}
          >
            {saving ? <FiRefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> : <FiSave size={15} />}
            {saving ? "Saving…" : dirty ? "Save All Changes" : "All Changes Saved ✓"}
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin  { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }

        /* ── Field grid column (desktop) ── */
        .cms-field-full  { grid-column: span 2; }
        .cms-field-half  { grid-column: span 1; }
        .cms-span-full   { grid-column: span 2; }


        /* ── Mobile responsive ── */
        @media (max-width: 640px) {
          /* Single-column form grid on mobile */
          .cms-section-grid {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
            gap: 12px !important;
          }
          /* All fields go full width on mobile */
          .cms-field-half,
          .cms-field-full,
          .cms-span-full {
            grid-column: span 1 !important;
          }
          /* Section header button compact */
          .cms-section-btn {
            padding: 13px 16px !important;
          }
          /* Fix negative-margin for mobile main padding */
          .cms-root {
            margin: -16px -16px 0 !important;
            padding: 0 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
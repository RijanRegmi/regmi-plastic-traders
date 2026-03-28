"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiShoppingBag, FiPhone } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  storeName?: string;
  cms?: Record<string, unknown>;
}

function unwrap(v: unknown): string {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if ("value" in o) return String(o.value ?? "");
  }
  return typeof v === "string" ? v : "";
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api"
).replace(/\/api$/, "");
const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("regmi-plastic/")) return `https://res.cloudinary.com/dkmbfnuch/image/upload/${path}`;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";

export default function Header({
  storeName = "Regmi Plastic Traders",
  cms: cmsProp,
}: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [fetchedCms, setFetchedCms] = useState<Record<string, unknown> | null>(null);
  // Derive the active CMS data from props first, falling back to fetched data
  const cms = (cmsProp && Object.keys(cmsProp).length > 0) ? cmsProp : (fetchedCms ?? {});

  const isHome = pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    
    // Defer the initial check to avoid Next.js / React compiler warning
    // about synchronous setState inside an effect body
    const timeoutId = setTimeout(handler, 0);

    window.addEventListener("scroll", handler, { passive: true });
    return () => {
      window.removeEventListener("scroll", handler);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    // Only fetch client-side if the server did not provide the CMS data
    if (!cmsProp || Object.keys(cmsProp).length === 0) {
      fetch(`${API}/cms/global`, { cache: "no-store" })
        .then((r) => r.json())
        .then((json) => {
          if (json?.data) setFetchedCms(json.data);
        })
        .catch(() => { });
    }
  }, [cmsProp]);

  const isScrolled = scrolled;
  const isTransparent = isHome && !scrolled;

  const phone =
    unwrap(cms?.headerPhone) || unwrap(cms?.phone) || "+977-9851012554";
  const ctaText = unwrap(cms?.headerCTAText) || "Shop Now";
  const logoLetter = unwrap(cms?.logoLetter) || storeName[0];
  const logoUrl = unwrap(cms?.logoUrl) || "";
  const estYear = unwrap(cms?.establishedYear);

  const navLabels = {
    home: unwrap(cms?.navHome) || "Home",
    products: unwrap(cms?.navProducts) || "Products",
    blog: unwrap(cms?.navBlog) || "Blog",
    about: unwrap(cms?.navAbout) || "About",
    contact: unwrap(cms?.navContact) || "Contact",
  };

  const NAV_LINKS = [
    { label: navLabels.home, href: "/" },
    { label: navLabels.products, href: "/products" },
    { label: navLabels.blog, href: "/blog" },
    { label: navLabels.about, href: "/about" },
    { label: navLabels.contact, href: "/contact" },
  ];

  return (
    <header
      className={`rpt-header ${isScrolled || !isHome ? "rpt-header--solid" : ""} ${isTransparent ? "rpt-header--transparent" : ""}`}
    >
      <div className="rpt-header__topline" />

      <div className="rpt-header__inner">
        <Link href="/" className="rpt-logo">
          {/* Logo icon — increased from 44px to 56px */}
          <div
            className="rpt-logo__icon"
            style={{ width: "56px", height: "56px", fontSize: "24px", flexShrink: 0 }}
          >
            {logoUrl ? (
              <img
                src={getImageUrl(logoUrl)}
                alt={storeName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            ) : (
              logoLetter
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="rpt-logo__name" style={{ fontSize: "16px", lineHeight: "1.2" }}>
              {storeName}
            </div>
            <div className="rpt-logo__sub">Est. {estYear} · Nepal</div>
          </div>
        </Link>

        <nav className="rpt-nav">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rpt-nav__link ${pathname === link.href ? "rpt-nav__link--active" : ""}`}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div
                  layoutId="nav-underline"
                  className="rpt-nav__underline"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="rpt-header__actions">
          <a
            href={`tel:${phone.replace(/[^+\d]/g, "")}`}
            className="rpt-header__phone"
          >
            <FiPhone size={13} />
            <span>{phone}</span>
          </a>
          <div className="rpt-header__divider" />
          <Link href="/products" className="rpt-btn-header">
            <FiShoppingBag size={14} />
            {ctaText}
          </Link>
        </div>

        <button
          className="rpt-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="rpt-mobile-menu"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rpt-mobile-menu__link ${pathname === link.href ? "rpt-mobile-menu__link--active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="rpt-mobile-menu__cta"
            >
              <FiShoppingBag size={14} /> {ctaText}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

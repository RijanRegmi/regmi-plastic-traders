"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiShoppingBag, FiPhone } from "react-icons/fi";

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

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";

export default function Header({
  storeName = "Regmi Plastic Traders",
  cms: cmsProp,
}: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cms, setCms] = useState<Record<string, unknown>>(cmsProp ?? {});

  const isHome = pathname === "/";

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 80);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (cmsProp && Object.keys(cmsProp).length > 0) {
      setCms(cmsProp);
      return;
    }
    fetch(`${API}/cms/global`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json?.data) setCms(json.data);
      })
      .catch(() => {});
  }, [cmsProp]);

  useEffect(() => {
    if (cmsProp && Object.keys(cmsProp).length > 0) setCms(cmsProp);
  }, [cmsProp]);

  const isScrolled = mounted && scrolled;
  const isTransparent = mounted && isHome && !scrolled;

  const phone =
    unwrap(cms?.headerPhone) || unwrap(cms?.phone) || "+977-9841234567";
  const ctaText = unwrap(cms?.headerCTAText) || "Shop Now";
  const logoLetter = unwrap(cms?.logoLetter) || storeName[0] || "R";
  const logoUrl = unwrap(cms?.logoUrl) || "";
  const estYear = unwrap(cms?.establishedYear) || "2005";

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
            style={{ width: "56px", height: "56px", fontSize: "24px" }}
          >
            {logoUrl ? (
              <img
                src={`${API_BASE}${logoUrl}`}
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
          <div>
            <div className="rpt-logo__name" style={{ fontSize: "16px" }}>
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

      {mobileOpen && (
        <div className="rpt-mobile-menu">
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
        </div>
      )}
    </header>
  );
}

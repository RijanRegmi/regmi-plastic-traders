"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { productApi, reviewApi, blogApi } from "@/lib/api";
import {
  FiPackage,
  FiStar,
  FiFileText,
  FiEdit3,
  FiArrowRight,
  FiSettings,
  FiMessageSquare,
  FiUsers,
} from "react-icons/fi";
import { C, F } from "@/components/admin/adminUI";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ products: 0, reviews: 0, blogs: 0 });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    Promise.allSettled([
      productApi.adminGetAll({ limit: 1 }),
      reviewApi.adminGetAll(),
      blogApi.adminGetAll(),
    ]).then(([p, r, b]) => {
      setStats({
        products: p.status === "fulfilled" ? p.value.pagination?.total || 0 : 0,
        reviews: r.status === "fulfilled" ? r.value?.length || 0 : 0,
        blogs: b.status === "fulfilled" ? b.value.data?.length || 0 : 0,
      });
      setLoading(false);
    });
  }, []);

  const STATS = [
    {
      label: "Products",
      value: stats.products,
      icon: FiPackage,
      href: "/admin/products",
      color: C.red,
      glow: C.redGlow,
    },
    {
      label: "Reviews",
      value: stats.reviews,
      icon: FiStar,
      href: "/admin/reviews",
      color: C.yellow,
      glow: "rgba(241,196,15,0.35)",
    },
    {
      label: "Blog Posts",
      value: stats.blogs,
      icon: FiFileText,
      href: "/admin/blog",
      color: C.green,
      glow: "rgba(39,174,96,0.35)",
    },
  ];

  const QUICK = [
    {
      label: "Edit Home Page",
      href: "/admin/cms/home",
      icon: FiEdit3,
      desc: "Hero, stats, about",
    },
    {
      label: "Edit Products Page",
      href: "/admin/cms/products",
      icon: FiPackage,
      desc: "Title & subtitle",
    },
    {
      label: "Edit About Page",
      href: "/admin/cms/about",
      icon: FiFileText,
      desc: "About us content",
    },
    {
      label: "Global Settings",
      href: "/admin/cms/global",
      icon: FiSettings,
      desc: "Store name, contact",
    },
    {
      label: "Manage Blog",
      href: "/admin/blog",
      icon: FiMessageSquare,
      desc: "Write articles",
    },
    {
      label: "Manage Reviews",
      href: "/admin/reviews",
      icon: FiStar,
      desc: "Customer reviews",
    },
    {
      label: "Manage Users",
      href: "/admin/users",
      icon: FiUsers,
      desc: "Admin accounts & access",
    },
  ].filter(q => q.href !== "/admin/users" || (mounted && JSON.parse(localStorage.getItem('rpt-admin-auth') || '{}')?.state?.user?.role === 'admin'));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 32,
        fontFamily: F.body,
      }}
    >
      {/* Heading */}
      <div>
        <h1
          style={{
            fontFamily: F.display,
            fontSize: 32,
            fontWeight: 700,
            color: C.text1,
            letterSpacing: "-0.02em",
            margin: "0 0 6px",
          }}
        >
          Welcome back 👋
        </h1>
        <p
          style={{
            fontFamily: F.body,
            fontSize: 13,
            color: C.text4,
            margin: 0,
          }}
        >
          Manage your store from here.
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 16,
        }}
      >
        {STATS.map(({ label, value, icon: Icon, href, color, glow }) => (
          <Link
            key={href}
            href={href}
            style={{
              background: C.bg3,
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: "22px 24px",
              textDecoration: "none",
              display: "block",
              transition: "border-color 0.25s, transform 0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  background: `${color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color,
                  boxShadow: `0 4px 16px ${glow}`,
                }}
              >
                <Icon size={20} />
              </div>
              <FiArrowRight size={14} style={{ color: C.text4 }} />
            </div>
            <div
              style={{
                fontFamily: F.display,
                fontSize: 38,
                fontWeight: 700,
                color,
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {loading ? "—" : value}
            </div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.text4 }}>
              {label}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <p
          style={{
            fontFamily: F.ui,
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: C.text4,
            marginBottom: 14,
          }}
        >
          Quick Access
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 12,
          }}
        >
          {QUICK.map(({ label, href, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: C.bg3,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "16px 18px",
                textDecoration: "none",
                transition: "border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(192,57,43,0.35)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  background: C.redSubtle,
                  color: C.red,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={17} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: F.ui,
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.text1,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: F.body,
                    fontSize: 11,
                    color: C.text4,
                    marginTop: 2,
                  }}
                >
                  {desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          background: `linear-gradient(135deg, ${C.bg4}, rgba(192,57,43,0.18))`,
          border: "1px solid rgba(192,57,43,0.25)",
          borderRadius: 20,
          padding: "24px 28px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 22,
              fontWeight: 700,
              color: C.text1,
              marginBottom: 4,
            }}
          >
            Add New Product
          </div>
          <div style={{ fontFamily: F.body, fontSize: 13, color: C.text4 }}>
            List a new item with Daraz link
          </div>
        </div>
        <Link
          href="/admin/products/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: C.yellow,
            color: "#111",
            fontFamily: F.ui,
            fontWeight: 800,
            fontSize: 13,
            padding: "11px 22px",
            borderRadius: 12,
            textDecoration: "none",
            whiteSpace: "nowrap",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          + Add Product
        </Link>
      </div>
    </div>
  );
}

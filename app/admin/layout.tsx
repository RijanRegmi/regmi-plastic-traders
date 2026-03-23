"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import {
  FiHome,
  FiPackage,
  FiFileText,
  FiStar,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiEdit3,
  FiMessageSquare,
  FiExternalLink,
  FiChevronRight,
  FiMail,
} from "react-icons/fi";
import { IconType } from "react-icons";
import toast from "react-hot-toast";
import { C, F } from "@/components/admin/adminUI";

interface NavItem {
  href: string;
  label: string;
  icon: IconType;
  exact?: boolean;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: FiHome, exact: true }],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: FiPackage },
      { href: "/admin/reviews", label: "Reviews", icon: FiStar },
      { href: "/admin/blog", label: "Blog Posts", icon: FiMessageSquare },
      { href: "/admin/messages", label: "Messages", icon: FiMail },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/cms/home", label: "Home Page", icon: FiEdit3 },
      { href: "/admin/cms/products", label: "Products Page", icon: FiPackage },
      { href: "/admin/cms/about", label: "About Page", icon: FiFileText },
      { href: "/admin/cms/global", label: "Global Settings", icon: FiSettings },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    router.push("/admin/login");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);
  const activeItem = NAV_GROUPS.flatMap((g) => g.items).find((n) =>
    isActive(n.href, n.exact),
  );
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  const sidebarW = 234;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: C.bg2,
        fontFamily: F.body,
      }}
    >
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 40,
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: sidebarW,
          flexShrink: 0,
          background: C.bg3,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
          overflowY: "auto",
        }}
        className="admin-sidebar-lg"
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "18px 18px",
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              background: "linear-gradient(135deg,#c0392b,#e74c3c)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: 20,
              color: "white",
              boxShadow: "0 4px 16px rgba(192,57,43,0.4)",
              flexShrink: 0,
            }}
          >
            R
          </div>
          <div>
            <div
              style={{
                fontFamily: F.ui,
                fontWeight: 800,
                fontSize: 14,
                color: C.text1,
              }}
            >
              Regmi Plastic
            </div>
            <div
              style={{
                fontFamily: F.body,
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: C.red,
                marginTop: 2,
              }}
            >
              Admin Panel
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 22 }}>
              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: C.text4,
                  padding: "0 10px",
                  marginBottom: 5,
                }}
              >
                {group.label}
              </div>
              {group.items.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 12px",
                      borderRadius: 10,
                      marginBottom: 2,
                      fontFamily: F.ui,
                      fontSize: 13,
                      fontWeight: 700,
                      color: active ? "white" : C.text3,
                      textDecoration: "none",
                      background: active ? C.red : "transparent",
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
                    <Icon size={15} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{label}</span>
                    {active && (
                      <FiChevronRight size={12} style={{ opacity: 0.5 }} />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div
          style={{
            padding: "14px 14px",
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(192,57,43,0.2)",
                border: "1px solid rgba(192,57,43,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.ui,
                fontWeight: 700,
                fontSize: 11,
                color: "#f87171",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.text1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name || "Admin"}
              </div>
              <div
                style={{
                  fontFamily: F.body,
                  fontSize: 10,
                  color: C.text4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email || ""}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: 10,
              fontFamily: F.ui,
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,100,100,0.6)",
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,50,50,0.08)";
              e.currentTarget.style.color = "#ff6b6b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "rgba(255,100,100,0.6)";
            }}
          >
            <FiLogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          minWidth: 0,
        }}
        className="admin-main-lg"
      >
        {/* Topbar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            height: 60,
            background: C.bg3,
            borderBottom: `1px solid ${C.border}`,
            position: "sticky",
            top: 0,
            zIndex: 30,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => setOpen(!open)}
              style={{
                display: "flex",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 9,
                padding: 7,
                color: C.text2,
                cursor: "pointer",
              }}
            >
              {open ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
            <div>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.text1,
                  lineHeight: 1,
                }}
              >
                {activeItem?.label || "Admin"}
              </div>
              <div
                style={{
                  fontFamily: F.body,
                  fontSize: 11,
                  color: C.text4,
                  marginTop: 2,
                }}
              >
                Regmi Plastic Traders
              </div>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: F.ui,
              fontSize: 12,
              fontWeight: 700,
              color: C.red,
              textDecoration: "none",
              padding: "8px 14px",
              borderRadius: 9,
              border: "1px solid rgba(192,57,43,0.25)",
              background: "rgba(192,57,43,0.06)",
            }}
          >
            <FiExternalLink size={13} /> View Site
          </Link>
        </header>

        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {children}
        </main>
      </div>

      {/* Desktop: sidebar always visible */}
      <style>{`
        @media(min-width:1024px){
          .admin-sidebar-lg{ transform:translateX(0)!important; position:sticky!important; height:100vh; }
          .admin-main-lg{ margin-left:0; }
        }
      `}</style>
    </div>
  );
}

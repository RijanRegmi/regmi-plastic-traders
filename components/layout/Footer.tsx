import Link from "next/link";
import {
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiPhone,
  FiMail,
  FiMapPin,
  FiArrowRight,
} from "react-icons/fi";

interface FooterProps {
  cms?: Record<string, unknown>;
}

function s(v: unknown, fallback = ""): string {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if ("value" in o) return String(o.value ?? "") || fallback;
  }
  return typeof v === "string" && v ? v : fallback;
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

export default function Footer({ cms }: FooterProps) {
  const storeName = s(cms?.storeName, "Regmi Plastic Traders");
  const logoLetter = s(cms?.logoLetter, storeName[0] || "R");
  const logoUrl = s(cms?.logoUrl, "");
  const estYear = s(cms?.establishedYear, "2005");
  const tagline = s(
    cms?.footerTagline,
    "Your trusted source for quality plastic products across Nepal.",
  );
  const copyright = s(cms?.copyrightText, "Made with ♥ in Nepal");

  const phone = s(cms?.phone, "+977-9841234567");
  const phone2 = s(cms?.phone2, "");
  const email = s(cms?.email, "info@regmiplastic.com");
  const email2 = s(cms?.email2, "");
  const address = s(cms?.address, "Kathmandu, Nepal");

  const hoursWeekday = s(cms?.hoursWeekday, "Sun – Fri: 9AM – 7PM");
  const hoursSaturday = s(cms?.hoursSaturday, "Saturday: 10AM – 5PM");

  const fbUrl = s(cms?.socialFacebook, "#");
  const igUrl = s(cms?.socialInstagram, "#");
  const ytUrl = s(cms?.socialYoutube, "#");

  const navLabels = {
    home: s(cms?.navHome, "Home"),
    products: s(cms?.navProducts, "Products"),
    blog: s(cms?.navBlog, "Blog"),
    about: s(cms?.navAbout, "About"),
    contact: s(cms?.navContact, "Contact"),
  };
  const NAV_LINKS = [
    { label: navLabels.home, href: "/" },
    { label: navLabels.products, href: "/products" },
    { label: navLabels.blog, href: "/blog" },
    { label: navLabels.about, href: "/about" },
    { label: navLabels.contact, href: "/contact" },
  ];

  const contactItems = [
    {
      icon: FiPhone,
      label: "Phone",
      value: phone,
      href: `tel:${phone.replace(/[^+\d]/g, "")}`,
    },
    ...(phone2
      ? [
          {
            icon: FiPhone,
            label: "Phone 2",
            value: phone2,
            href: `tel:${phone2.replace(/[^+\d]/g, "")}`,
          },
        ]
      : []),
    { icon: FiMail, label: "Email", value: email, href: `mailto:${email}` },
    ...(email2
      ? [
          {
            icon: FiMail,
            label: "Email 2",
            value: email2,
            href: `mailto:${email2}`,
          },
        ]
      : []),
    { icon: FiMapPin, label: "Address", value: address, href: "#" },
  ];

  return (
    <footer
      style={{
        background: "#040406",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)",
      }}
    >
      {/* Accent line */}
      <div
        style={{
          height: "2px",
          background:
            "linear-gradient(90deg,#c0392b 0%,#f1c40f 40%,transparent 100%)",
        }}
      />

      {/* Main grid */}
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "64px 48px 48px",
        }}
      >
        <style>{`
          @media(max-width:1024px){ .ft-grid{grid-template-columns:1fr 1fr!important} }
          @media(max-width:768px){ .ft-grid{grid-template-columns:1fr!important; gap: 40px !important} .ft-wrap{padding:48px 20px 32px!important} }
          .ft-link{color:rgba(255,255,255,0.35);text-decoration:none;display:flex;align-items:center;gap:8px;font-size:14px;transition:color 0.2s}
          .ft-link:hover{color:rgba(255,255,255,0.75)}
          .ft-arrow{color:#c0392b;opacity:0;transform:translateX(-6px);transition:opacity 0.2s,transform 0.2s}
          .ft-link:hover .ft-arrow{opacity:1;transform:translateX(0)}
          .ft-social{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);text-decoration:none;transition:background 0.2s,color 0.2s}
          .ft-social:hover{background:rgba(192,57,43,0.15);color:#f87171;border-color:rgba(192,57,43,0.3)}
        `}</style>

        <div
          className="ft-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr 1.1fr 1fr",
            gap: "48px",
          }}
        >
          {/* ── Brand ── */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              {/* Logo — increased from 44px to 60px */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "12px",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
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
                  <img
                    src="/RPT.png"
                    alt={storeName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                )}
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "var(--font-ui,'Plus Jakarta Sans',sans-serif)",
                    fontWeight: 800,
                    fontSize: "16px",
                    color: "white",
                  }}
                >
                  {storeName}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.25)",
                    marginTop: "3px",
                  }}
                >
                  Est. {estYear} · Nepal
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.75",
                color: "rgba(255,255,255,0.35)",
                marginBottom: "24px",
              }}
            >
              {tagline}
            </p>

            <div style={{ display: "flex", gap: "8px" }}>
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="ft-social"
              >
                <FiFacebook size={15} />
              </a>
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="ft-social"
              >
                <FiInstagram size={15} />
              </a>
              <a
                href={ytUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="ft-social"
              >
                <FiYoutube size={15} />
              </a>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-ui,'Plus Jakarta Sans',sans-serif)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#c0392b",
                marginBottom: "24px",
              }}
            >
              Quick Links
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: 0,
                margin: 0,
              }}
            >
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="ft-link">
                    <FiArrowRight size={11} className="ft-arrow" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-ui,'Plus Jakarta Sans',sans-serif)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#c0392b",
                marginBottom: "24px",
              }}
            >
              Contact
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                padding: 0,
                margin: 0,
              }}
            >
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "9px",
                        flexShrink: 0,
                        marginTop: "1px",
                        background: "rgba(192,57,43,0.1)",
                        border: "1px solid rgba(192,57,43,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={12} style={{ color: "#c0392b" }} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "9px",
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                          color: "rgba(255,255,255,0.22)",
                          marginBottom: "2px",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "rgba(255,255,255,0.5)",
                          lineHeight: "1.4",
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Hours ── */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-ui,'Plus Jakarta Sans',sans-serif)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#c0392b",
                marginBottom: "24px",
              }}
            >
              Store Hours
            </h4>
            <div
              style={{
                padding: "18px 20px",
                borderRadius: "14px",
                background: "rgba(192,57,43,0.07)",
                border: "1px solid rgba(192,57,43,0.14)",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "rgba(255,255,255,0.25)",
                  marginBottom: "8px",
                }}
              >
                Opening Hours
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "white",
                  marginBottom: "4px",
                }}
              >
                {hoursWeekday}
              </div>
              <div
                style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}
              >
                {hoursSaturday}
              </div>
            </div>

            <div style={{ marginTop: "24px" }}>
              <h4
                style={{
                  fontFamily: "var(--font-ui,'Plus Jakarta Sans',sans-serif)",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)",
                  marginBottom: "14px",
                }}
              >
                Policies
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  padding: 0,
                  margin: 0,
                }}
              >
                {[
                  "Privacy Policy",
                  "Terms of Use",
                  "Return Policy",
                  "Shipping Info",
                ].map((p) => (
                  <li key={p}>
                    <a
                      href="#"
                      className="ft-link"
                      style={{ fontSize: "13px" }}
                    >
                      <FiArrowRight size={10} className="ft-arrow" />
                      {p}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            padding: "18px 48px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.18)",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.18)",
              margin: 0,
            }}
          >
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

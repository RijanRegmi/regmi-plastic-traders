import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FiPhone, FiMail, FiMapPin, FiClock } from "react-icons/fi";
import Reveal from "@/components/ui/Reveal";
import StaggerContainer, { StaggerItem } from "@/components/ui/StaggerContainer";
import ContactForm from "@/components/ui/ContactForm";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";

function unwrap(v: unknown, fallback = ""): string {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if ("value" in o) return String(o.value ?? "") || fallback;
  }
  return typeof v === "string" && v ? v : fallback;
}

async function getData() {
  try {
    const [globalRes, contactRes] = await Promise.allSettled([
      fetch(`${API}/cms/global`, { cache: "no-store" }),
      fetch(`${API}/cms/contact`, { cache: "no-store" }),
    ]);
    const global = globalRes.status === "fulfilled" ? (await globalRes.value.json()).data || {} : {};
    const contact = contactRes.status === "fulfilled" ? (await contactRes.value.json()).data || {} : {};
    return { ...global, ...contact };
  } catch {
    return {};
  }
}

export default async function ContactPage() {
  const cms = await getData();

  const phone = unwrap(cms.phone, "+977-9845101254");
  const email = unwrap(cms.email, "info@regmiplastic.com");
  const address = unwrap(cms.address, "Kathmandu, Nepal");
  const hours = unwrap(cms.hoursWeekday, "Sun – Fri: 9AM – 7PM");
  const rawMap = unwrap(cms.mapEmbed, "");

  // Auto-convert any Google Maps link to embed URL
  function toEmbedUrl(url: string): string {
    if (!url) return "";
    // Already an embed URL — use as-is
    if (url.includes("maps/embed")) return url;
    // Shortened link (maps.app.goo.gl or goo.gl) — can't convert server-side, use place search fallback
    if (url.includes("goo.gl")) {
      // Extract coords if present, otherwise fall back to a search embed
      const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d500!2d${coordMatch[2]}!3d${coordMatch[1]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2snp!4v1`;
      }
      return url; // pass through, may still work for some shortened links
    }
    // Full Google Maps place URL — extract place ID and coords
    const placeIdMatch = url.match(/!1s([^!]+).*!2s([^!]+)/);
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const queryMatch = url.match(/[?&]q=([^&]+)/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      // Build embed URL with coords + place ID if available
      const placeId = placeIdMatch
        ? `!1m2!1s${encodeURIComponent(placeIdMatch[1])}!2s${encodeURIComponent(placeIdMatch[2])}`
        : "";
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d500!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3${placeId}!5e0!3m2!1sen!2snp!4v1`;
    }
    // Search query fallback
    if (queryMatch) {
      return `https://www.google.com/maps/embed/v1/place?key=&q=${queryMatch[1]}`;
    }
    return url;
  }

  const mapEmbed = toEmbedUrl(rawMap);
  const storeName = unwrap(cms.storeName, "Regmi Plastic Traders");
  const pageLabel = unwrap(cms.pageLabel, "Get in Touch");
  const pageTitle = unwrap(cms.pageTitle, "Contact Us");
  const pageSubtitle = unwrap(cms.pageSubtitle, "We'd love to hear from you");
  const formTitle = unwrap(cms.formTitle, "Send a Message");

  const CONTACTS = [
    { icon: FiPhone, label: "Phone", value: phone, href: `tel:${phone}` },
    { icon: FiMail, label: "Email", value: email, href: `mailto:${email}` },
    { icon: FiMapPin, label: "Address", value: address, href: "#" },
    { icon: FiClock, label: "Business Hours", value: hours, href: "#" },
  ];

  return (
    <div className="rpt-page">
      <Header storeName={storeName} cms={cms} />

      {/* ── Hero ── */}
      <div className="rpt-page-hero">
        <div className="rpt-page-hero__bg" />
        <Reveal direction="up" className="rpt-page-hero__content">
          <p className="rpt-label">{pageLabel}</p>
          <h1 className="rpt-page-hero__title">{pageTitle}</h1>
          <p className="rpt-page-hero__sub">{pageSubtitle}</p>
        </Reveal>
      </div>

      <main className="rpt-page-body">

        {/* ── Contact grid ── */}
        <section className="rpt-section" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="rpt-container">
            <div className="rpt-contact-grid">

              {/* Left — info */}
              <Reveal direction="right">
                <p className="rpt-label">Reach Us</p>
                <h2 className="rpt-heading">
                  Let&apos;s <span className="rpt-heading--yellow">Connect</span>
                </h2>
                <p className="rpt-body" style={{ marginBottom: "40px" }}>
                  Have questions about our products or need bulk orders? Contact
                  us through any of the channels below.
                </p>
                <StaggerContainer className="rpt-contact-items">
                  {CONTACTS.map(({ icon: Icon, label, value, href }) => (
                    <StaggerItem key={label}>
                      <a href={href} className="rpt-contact-item">
                        <div className="rpt-contact-item__icon">
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="rpt-contact-item__label">{label}</div>
                          <div className="rpt-contact-item__value">{value}</div>
                        </div>
                      </a>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </Reveal>

              {/* Right — form */}
              <Reveal direction="left" delay={0.3} className="rpt-contact-form-card">
                <h3 className="rpt-contact-form-card__title">{formTitle}</h3>
                <ContactForm cms={cms} />
              </Reveal>

            </div>
          </div>
        </section>

        {/* ── Google Maps ── */}
        {mapEmbed && (
          <section style={{ paddingBottom: "80px" }}>
            <div className="rpt-container">
              <Reveal direction="up">
                {/* Card wrapper */}
                <div style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                }}>
                  {/* Header bar */}
                  <div style={{
                    background: "white",
                    borderBottom: "1px solid var(--border)",
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: "rgba(192,57,43,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--red)",
                      flexShrink: 0,
                    }}>
                      <FiMapPin size={15} />
                    </div>
                    <div>
                      <div style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-1)",
                      }}>
                        Find Us Here
                      </div>
                      <div style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 11,
                        color: "var(--text-4)",
                      }}>
                        {address}
                      </div>
                    </div>
                  </div>

                  {/* Map iframe — sits directly below the header, no padding tricks */}
                  <iframe
                    src={mapEmbed}
                    width="100%"
                    height="560"
                    style={{ border: 0, display: "block" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Store Location"
                  />
                </div>
              </Reveal>
            </div>
          </section>
        )}

      </main>
      <Footer cms={cms} />
    </div>
  );
}
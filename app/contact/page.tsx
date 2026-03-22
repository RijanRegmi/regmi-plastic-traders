import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FiPhone, FiMail, FiMapPin, FiClock } from "react-icons/fi";
import Reveal from "@/components/ui/Reveal";
import StaggerContainer, { StaggerItem } from "@/components/ui/StaggerContainer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";

async function getData() {
  try {
    const res = await fetch(`${API}/cms/global`, { next: { revalidate: 60 } });
    return (await res.json()).data || {};
  } catch {
    return {};
  }
}

export default async function ContactPage() {
  const cms = await getData();

  const CONTACTS = [
    {
      icon: FiPhone,
      label: "Phone",
      value: (cms.phone as string) || "+977-9841234567",
      href: `tel:${(cms.phone as string) || "+977-9841234567"}`,
    },
    {
      icon: FiMail,
      label: "Email",
      value: (cms.email as string) || "info@regmiplastic.com",
      href: `mailto:${(cms.email as string) || "info@regmiplastic.com"}`,
    },
    {
      icon: FiMapPin,
      label: "Address",
      value: (cms.address as string) || "Kathmandu, Nepal",
      href: "#",
    },
    {
      icon: FiClock,
      label: "Business Hours",
      value: "Sun–Fri: 9AM–7PM · Sat: 10AM–5PM",
      href: "#",
    },
  ];

  return (
    <div className="rpt-page">
      <Header
        storeName={(cms.storeName as string) || "Regmi Plastic Traders"}
      />

      <div className="rpt-page-hero">
        <div className="rpt-page-hero__bg" />
        <Reveal direction="up" className="rpt-page-hero__content">
          <p className="rpt-label">Get in Touch</p>
          <h1 className="rpt-page-hero__title">Contact Us</h1>
          <p className="rpt-page-hero__sub">We&apos;d love to hear from you</p>
        </Reveal>
      </div>

      <main className="rpt-page-body">
        <section
          className="rpt-section"
          style={{ paddingTop: "80px", paddingBottom: "96px" }}
        >
          <div className="rpt-container">
            <div className="rpt-contact-grid">
              {/* Left info */}
              <Reveal direction="right">
                <p className="rpt-label">Reach Us</p>
                <h2 className="rpt-heading">
                  Let&apos;s{" "}
                  <span className="rpt-heading--yellow">Connect</span>
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

              {/* Right form */}
              <Reveal direction="left" delay={0.3} className="rpt-contact-form-card">
                <h3 className="rpt-contact-form-card__title">Send a Message</h3>
                <div className="rpt-form">
                  <div className="rpt-form-group">
                    <label className="rpt-form-label">Your Name</label>
                    <input className="rpt-input" placeholder="Ram Sharma" />
                  </div>
                  <div className="rpt-form-group">
                    <label className="rpt-form-label">Email or Phone</label>
                    <input className="rpt-input" placeholder="your@email.com" />
                  </div>
                  <div className="rpt-form-group">
                    <label className="rpt-form-label">Message</label>
                    <textarea
                      rows={4}
                      className="rpt-input rpt-input--textarea"
                      placeholder="Ask about our products or pricing..."
                    />
                  </div>
                  <button className="rpt-btn-primary rpt-btn--full">
                    Send Message
                  </button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer cms={cms} />
    </div>
  );
}

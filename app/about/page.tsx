import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  FiCheck,
  FiAward,
  FiUsers,
  FiPackage,
} from "react-icons/fi";
import Reveal from "@/components/ui/Reveal";
import StaggerContainer, { StaggerItem } from "@/components/ui/StaggerContainer";
import CountUp from "@/components/ui/CountUp";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";
const API_BASE = API.replace(/\/api$/, "");

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [aboutRes, globalRes, homeRes] = await Promise.allSettled([
      fetch(`${API}/cms/about`, { cache: "no-store" }),
      fetch(`${API}/cms/global`, { cache: "no-store" }),
      fetch(`${API}/cms/home`, { cache: "no-store" }),
    ]);
    return {
      about: aboutRes.status === "fulfilled" ? (await aboutRes.value.json()).data || {} : {},
      cms: globalRes.status === "fulfilled" ? (await globalRes.value.json()).data || {} : {},
      home: homeRes.status === "fulfilled" ? (await homeRes.value.json()).data || {} : {},
    };
  } catch {
    return { about: {}, cms: {}, home: {} };
  }
}

function unwrap(v: unknown, fallback = ""): string {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if ("value" in o) return String(o.value ?? "") || fallback;
  }
  return typeof v === "string" && v ? v : fallback;
}

export default async function AboutPage() {
  const { about, cms, home } = await getData();

  // ── Hero ──────────────────────────────────────────────────────────────────
  const storeName = unwrap(cms.storeName, "Regmi Plastic Traders");
  const heroLabel = unwrap(about.heroLabel, "Who We Are");
  const heroTitle = unwrap(about.heroTitle, "About Regmi Plastic Traders");
  const heroSubtitle = unwrap(about.heroSubtitle, "Your trusted partner since 2005");
  const content = (about.content as string) || unwrap(about.storyContent, "");

  const aboutBgPath = unwrap(about.aboutBgImage, "");
  const aboutBgUrl = aboutBgPath ? `${API_BASE}${aboutBgPath}` : "";

  // ── Stats — about CMS first, fallback to home CMS ────────────────────────
  const statsItems = [
    {
      value: unwrap((about.stat1Value ?? home.stat1Value), "15,000+"),
      label: unwrap((about.stat1Label ?? home.stat1Label), "Happy Customers"),
    },
    {
      value: unwrap((about.stat2Value ?? home.stat2Value), "500+"),
      label: unwrap((about.stat2Label ?? home.stat2Label), "Products Available"),
    },
    {
      value: unwrap((about.stat3Value ?? home.stat3Value), "19+"),
      label: unwrap((about.stat3Label ?? home.stat3Label), "Years of Experience"),
    },
  ];

  // ── Value cards — from about CMS ─────────────────────────────────────────
  const VALUES = [
    {
      icon: FiAward,
      title: unwrap(about.value1Title, "Our Mission"),
      desc: unwrap(about.value1Text, "To provide the highest quality plastic products at prices every Nepali family can afford."),
    },
    {
      icon: FiUsers,
      title: unwrap(about.value2Title, "Our Values"),
      desc: unwrap(about.value2Text, "Customer first, quality always, honest pricing, and fast service across Nepal."),
    },
    {
      icon: FiPackage,
      title: unwrap(about.value3Title, "Our Products"),
      desc: unwrap(about.value3Text, "500+ products spanning household, kitchen, industrial, garden and storage categories."),
    },
  ];

  // ── Features — from about CMS ─────────────────────────────────────────────
  const FEATURES = [
    unwrap(about.feature1, "100% Quality Guaranteed"),
    unwrap(about.feature2, "Best Prices in Nepal"),
    unwrap(about.feature3, "Fast Delivery Nationwide"),
    unwrap(about.feature4, "BPA-Free Products"),
    unwrap(about.feature5, "Customer Support"),
    unwrap(about.feature6, "Easy Returns"),
    unwrap(about.feature7, ""),
    unwrap(about.feature8, ""),
  ].filter(Boolean);

  // ── Story section ─────────────────────────────────────────────────────────
  const storyTitle = unwrap(about.storyTitle, "");
  const mission = unwrap(about.mission, "");
  const vision = unwrap(about.vision, "");

  // ── Why us text ───────────────────────────────────────────────────────────
  const whyUsLabel = unwrap(about.whyUsLabel, "Why Choose Us");
  const whyUsBody = unwrap(about.whyUsBody, `For over ${unwrap((about.stat3Value ?? home.stat3Value), "19")} years, we've been Nepal's go-to plastic products store. Here's what sets us apart.`);

  return (
    <div className="rpt-page">
      <Header storeName={storeName} />

      {/* ── Page Hero ── */}
      <div className="rpt-page-hero">
        <div className="rpt-page-hero__bg">
          {aboutBgUrl && (
            <div
              className="rpt-page-hero__bg-img"
              style={{ backgroundImage: `url(${aboutBgUrl})` }}
            />
          )}
        </div>
        <Reveal direction="up" className="rpt-page-hero__content">
          <p className="rpt-label">{heroLabel}</p>
          <h1 className="rpt-page-hero__title">{heroTitle}</h1>
          <p className="rpt-page-hero__sub">{heroSubtitle}</p>
        </Reveal>
      </div>

      <main className="rpt-page-body">

        {/* ── Story text ── */}
        <section className="rpt-section" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
          <Reveal direction="up" className="rpt-container">
            <div className="rpt-about-text">
              {storyTitle && (
                <h2 className="rpt-heading" style={{ marginBottom: "24px" }}>{storyTitle}</h2>
              )}
              {content ? (
                <div className="rpt-prose" dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p className="rpt-prose-p">
                  Regmi Plastic Traders has been serving Nepal since 2005. We specialize in
                  high-quality plastic household items, industrial containers, storage solutions,
                  and more. Our mission is to provide durable products at the most affordable prices.
                </p>
              )}
              {mission && (
                <div style={{ marginTop: "32px" }}>
                  <h3 className="rpt-heading" style={{ fontSize: "1.15rem", marginBottom: "10px" }}>Our Mission</h3>
                  <p className="rpt-prose-p">{mission}</p>
                </div>
              )}
              {vision && (
                <div style={{ marginTop: "24px" }}>
                  <h3 className="rpt-heading" style={{ fontSize: "1.15rem", marginBottom: "10px" }}>Our Vision</h3>
                  <p className="rpt-prose-p">{vision}</p>
                </div>
              )}
            </div>
          </Reveal>
        </section>

        {/* ── Value cards ── */}
        <section className="rpt-section rpt-section--alt" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="rpt-container">
            <Reveal direction="up" className="rpt-section-head rpt-section-head--center">
              <p className="rpt-label">What We Stand For</p>
              <h2 className="rpt-heading">
                Our <span className="rpt-heading--yellow">Core Values</span>
              </h2>
            </Reveal>
            <StaggerContainer className="rpt-3col-grid">
              {VALUES.map(({ icon: Icon, title: vTitle, desc }, i) => (
                <StaggerItem key={i} className="rpt-value-card">
                  <div className="rpt-value-card__icon">
                    <Icon size={22} />
                  </div>
                  <h3 className="rpt-value-card__title">{vTitle}</h3>
                  <p className="rpt-value-card__desc">{desc}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ── Why choose us ── */}
        <section className="rpt-section" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="rpt-container">
            <div className="rpt-why-us">
              <Reveal direction="right" delay={0.2}>
                <p className="rpt-label">{whyUsLabel}</p>
                <h2 className="rpt-heading">
                  Built on <span className="rpt-heading--yellow">Trust</span>
                </h2>
                <p className="rpt-body" style={{ marginBottom: "32px" }}>{whyUsBody}</p>
                <div className="rpt-features-grid">
                  {FEATURES.map((f, i) => (
                    <div key={i} className="rpt-feature-check">
                      <div className="rpt-feature-check__icon">
                        <FiCheck size={12} />
                      </div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* ── Stats card — fully from CMS ── */}
              <Reveal direction="left" delay={0.3} className="rpt-why-us__card">
                <div className="rpt-why-us__emoji">🏆</div>
                {statsItems.map((s, i) => (
                  <div key={i}>
                    <div className="rpt-why-us__stat">
                      <CountUp value={s.value} duration={2000} />
                    </div>
                    <div className="rpt-why-us__stat-label">{s.label}</div>
                    {i < statsItems.length - 1 && <div className="rpt-why-us__divider" />}
                  </div>
                ))}
              </Reveal>
            </div>
          </div>
        </section>

      </main>
      <Footer cms={cms} />
    </div>
  );
}
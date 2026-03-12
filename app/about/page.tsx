import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  FiCheck,
  FiAward,
  FiUsers,
  FiPackage,
  FiArrowRight,
} from "react-icons/fi";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";

async function getData() {
  try {
    const [aboutRes, globalRes] = await Promise.allSettled([
      fetch(`${API}/cms/about`, { next: { revalidate: 60 } }),
      fetch(`${API}/cms/global`, { next: { revalidate: 60 } }),
    ]);
    return {
      about:
        aboutRes.status === "fulfilled"
          ? (await aboutRes.value.json()).data || {}
          : {},
      cms:
        globalRes.status === "fulfilled"
          ? (await globalRes.value.json()).data || {}
          : {},
    };
  } catch {
    return { about: {}, cms: {} };
  }
}

export default async function AboutPage() {
  const { about, cms } = await getData();
  const title = (about.title as string) || "About Regmi Plastic Traders";
  const content = (about.content as string) || "";
  const storeName = (cms.storeName as string) || "Regmi Plastic Traders";

  const VALUES = [
    {
      icon: FiAward,
      title: "Our Mission",
      desc: "To provide the highest quality plastic products at prices every Nepali family can afford.",
    },
    {
      icon: FiUsers,
      title: "Our Values",
      desc: "Customer first, quality always, honest pricing, and fast service across Nepal.",
    },
    {
      icon: FiPackage,
      title: "Our Products",
      desc: "500+ products spanning household, kitchen, industrial, garden and storage categories.",
    },
  ];

  const FEATURES = [
    "100% Quality Guaranteed",
    "Best Prices in Nepal",
    "Fast Delivery Nationwide",
    "19+ Years of Experience",
    "BPA-Free Products",
    "500+ Product Range",
    "Customer Support",
    "Easy Returns",
  ];

  return (
    <div className="rpt-page">
      <Header storeName={storeName} />

      {/* Page Hero */}
      <div className="rpt-page-hero">
        <div className="rpt-page-hero__bg" />
        <div className="rpt-page-hero__content">
          <p className="rpt-label">Who We Are</p>
          <h1 className="rpt-page-hero__title">{title}</h1>
          <p className="rpt-page-hero__sub">Your trusted partner since 2005</p>
        </div>
      </div>

      <main className="rpt-page-body">
        {/* About text */}
        <section
          className="rpt-section"
          style={{ paddingTop: "80px", paddingBottom: "80px" }}
        >
          <div className="rpt-container">
            <div className="rpt-about-text">
              {content ? (
                <div
                  className="rpt-prose"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <p className="rpt-prose-p">
                  Regmi Plastic Traders has been serving Nepal since 2005. We
                  specialize in high-quality plastic household items, industrial
                  containers, storage solutions, and more. Our mission is to
                  provide durable products at the most affordable prices.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Value cards */}
        <section
          className="rpt-section rpt-section--alt"
          style={{ paddingTop: "80px", paddingBottom: "80px" }}
        >
          <div className="rpt-container">
            <div className="rpt-section-head rpt-section-head--center">
              <p className="rpt-label">What We Stand For</p>
              <h2 className="rpt-heading">
                Our <span className="rpt-heading--yellow">Core Values</span>
              </h2>
            </div>
            <div className="rpt-3col-grid">
              {VALUES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rpt-value-card">
                  <div className="rpt-value-card__icon">
                    <Icon size={22} />
                  </div>
                  <h3 className="rpt-value-card__title">{title}</h3>
                  <p className="rpt-value-card__desc">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section
          className="rpt-section"
          style={{ paddingTop: "80px", paddingBottom: "80px" }}
        >
          <div className="rpt-container">
            <div className="rpt-why-us">
              <div>
                <p className="rpt-label">Why Choose Us</p>
                <h2 className="rpt-heading">
                  Built on <span className="rpt-heading--yellow">Trust</span>
                </h2>
                <p className="rpt-body" style={{ marginBottom: "32px" }}>
                  For over 19 years, we've been Nepal's go-to plastic products
                  store. Here's what sets us apart.
                </p>
                <div className="rpt-features-grid">
                  {FEATURES.map((f) => (
                    <div key={f} className="rpt-feature-check">
                      <div className="rpt-feature-check__icon">
                        <FiCheck size={12} />
                      </div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rpt-why-us__card">
                <div className="rpt-why-us__emoji">🏆</div>
                <div className="rpt-why-us__stat">19+</div>
                <div className="rpt-why-us__stat-label">
                  Years of Excellence
                </div>
                <div className="rpt-why-us__divider" />
                <div className="rpt-why-us__stat">15,000+</div>
                <div className="rpt-why-us__stat-label">Happy Customers</div>
                <div className="rpt-why-us__divider" />
                <div className="rpt-why-us__stat">500+</div>
                <div className="rpt-why-us__stat-label">Products Available</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer cms={cms} />
    </div>
  );
}

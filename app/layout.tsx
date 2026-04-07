import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import BaseLayout from "@/components/layout/BaseLayout";
import "./globals.css";

import { generateDynamicMetadata, fetchSeoData } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generateDynamicMetadata();
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const seoData = await fetchSeoData();
  const global = seoData.global;
  const seo = seoData.seo;
  
  // Robust data unwrap for schema (Check SEO overrides first)
  const getV = (k: string, fallback = ""): string => {
    // Check for SEO specific key first (e.g. seoPhone), then the base key in global
    const seoKey = `seo${k.charAt(0).toUpperCase() + k.slice(1)}`;
    const v = seo[seoKey] || global[k];
    
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return (v as { value?: string }).value || fallback;
    }
    return typeof v === "string" ? v : fallback;
  };

  const storeName = getV("storeName", "Regmi Plastic Traders");
  const phone = getV("phone", "+977-9851012554");
  const email = getV("email", "regmiplastictraders@gmail.com");
  const address = getV("address", "Kathmandu Kalimati");
  
  // Dynamically build social links for schema
  const sameAs = [
    getV("socialFacebook"),
    getV("socialInstagram"),
    getV("socialYoutube"),
    getV("socialWhatsapp") ? `https://wa.me/${getV("socialWhatsapp").replace(/\D/g, '')}` : ""
  ].filter(Boolean);
  
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": storeName,
      "logo": "https://www.regmiplastictraders.com.np/RPT.png",
      "url": "https://www.regmiplastictraders.com.np",
      "telephone": phone,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": address,
        "addressLocality": "Kathmandu",
        "addressCountry": "NP"
      },
      "sameAs": sameAs
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": storeName,
      "alternateName": "Regmi",
      "url": "https://www.regmiplastictraders.com.np",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.regmiplastictraders.com.np/products?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": storeName,
      "image": "https://www.regmiplastictraders.com.np/RPT.png",
      "@id": "https://www.regmiplastictraders.com.np",
      "url": "https://www.regmiplastictraders.com.np",
      "telephone": phone,
      "email": email,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": address,
        "addressLocality": "Kathmandu",
        "addressRegion": "Bagmati",
        "addressCountry": "NP"
      },
      "sameAs": sameAs
    }
  ];

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/RPT.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
      </head>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0e0e1a",
              color: "#f1c40f",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
            },
          }}
        />
        <BaseLayout>{children}</BaseLayout>
      </body>
    </html>
  );
}

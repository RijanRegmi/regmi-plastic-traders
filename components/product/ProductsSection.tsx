"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform, animate } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductsSectionProps {
  products: Product[];
  content: {
    label?: string;
    heading?: string;
    sub?: string;
    viewAllText?: string;
    viewAllHref?: string;
    statsBadge?: string;
  };
}

// Reusing Stat component style from home
function AnimatedStat({ value, label, inView }: { value: string; label: string; inView: boolean }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const numMatch = value.match(/(\d+)/);
  const num = numMatch ? parseInt(numMatch[1], 10) : 0;
  const prefix = value.substring(0, numMatch?.index || 0);
  const suffix = value.substring((numMatch?.index || 0) + (numMatch?.[0].length || 0));

  useEffect(() => {
    if (!inView || !nodeRef.current || num === 0) return;
    const node = nodeRef.current;
    const controls = animate(0, num, {
      duration: 2.5,
      ease: "easeOut",
      onUpdate(cur) {
        node.textContent = Math.round(cur).toLocaleString();
      },
    });
    return () => controls.stop();
  }, [num, inView]);

  return (
    <div className="rpt-wcu__stat-card" style={{ padding: '24px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '800', color: 'var(--text-1)' }}>
        {prefix}<span ref={nodeRef}>{num || value}</span>{suffix}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--text-3)', fontWeight: '600', marginTop: '4px' }}>
        {label}
      </div>
    </div>
  );
}

export default function ProductsSection({ products, content }: ProductsSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  // Handle Typewriter effect for heading
  const [displayText, setDisplayText] = useState("");
  const headingText = content.heading || "Discover Our Products";
  
  useEffect(() => {
    if (!isInView) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(headingText.substring(0, i));
      i++;
      if (i > headingText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [isInView, headingText]);

  // Featured product (1st) and side products (next 3)
  const featuredProduct = products[0];
  const sideProducts = products.slice(1, 4);

  return (
    <section ref={ref} className="rpt-hp-products" style={{ padding: '120px 20px', background: '#f5f4f2', position: 'relative', overflow: 'hidden' }}>
      {/* Background Ornaments */}
      <motion.div style={{ y }} className="rpt-products-hero__glow" />

      <div style={{ maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '700px', margin: '0 auto 80px' }}>
          {content.label && (
            <motion.span 
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ display: 'inline-block', color: 'var(--red)', fontFamily: 'var(--font-ui)', fontWeight: '700', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', background: 'rgba(192,57,43,0.1)', padding: '6px 16px', borderRadius: '20px' }}
            >
              {content.label}
            </motion.span>
          )}
          
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '800', color: 'var(--text-1)', lineHeight: '1.1', marginBottom: '24px', position: 'relative', display: 'inline-block' }}>
            {displayText}
            <span style={{ position: 'absolute', right: '-12px', opacity: 0.5 }}>|</span>
            <svg style={{ position: 'absolute', bottom: '-10px', left: 0, width: '100%', height: '14px', zIndex: -1 }} viewBox="0 0 200 14" preserveAspectRatio="none">
              <motion.path 
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }}
                d="M5 10C50 2 150 2 195 10" fill="none" stroke="var(--yellow)" strokeWidth="6" strokeLinecap="round" 
              />
            </svg>
          </h2>
          
          {content.sub && (
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} style={{ fontSize: '18px', color: 'var(--text-2)', lineHeight: '1.6' }}>
              {content.sub}
            </motion.p>
          )}
        </div>

        {/* Categories / Tabs placeholder (static for demo, can be interactive later) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {['All Products', 'Kitchen', 'Bathroom', 'Storage'].map((cat, i) => (
            <div key={cat} className={`rpt-filter-pill ${i === 0 ? 'rpt-filter-pill--active' : ''}`} style={{ padding: '8px 24px', fontSize: '15px' }}>
              {cat}
            </div>
          ))}
        </div>

        {/* Masonry-style Grid */}
        <div className="rpt-hp-products__grid">
          {/* Main Hero Card */}
          {featuredProduct && (
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <ProductCard product={featuredProduct} />
            </motion.div>
          )}

          {/* Side Cards */}
          <div className="rpt-hp-products__side">
            {sideProducts.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA & Stats Strip */}
        <div style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '40px', background: 'white', padding: '40px 60px', borderRadius: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: '1 1 auto' }}>
            <AnimatedStat value="15,000+" label="Happy Customers" inView={isInView} />
            <AnimatedStat value="500+" label="Products Available" inView={isInView} />
          </div>

          <Link href={content.viewAllHref || "/products"} className="rpt-btn rpt-btn--primary" style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {content.viewAllText || "View All Products"}
            <span style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '50%' }}>
              <FiArrowRight size={16} />
            </span>
          </Link>
        </div>

      </div>
    </section>
  );
}

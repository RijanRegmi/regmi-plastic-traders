"use client";

import { motion, Variants } from "framer-motion";
import { useState, useEffect } from "react";

interface TypewriterProps {
  text: string;
  className?: string;
  delay?: number;
  charDelay?: number;
}

export function Typewriter({ 
  text, 
  className = "", 
  delay = 0, 
  charDelay = 0.06 // Per your request to make it "a bit slow"
}: TypewriterProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: charDelay,
        delayChildren: delay,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { 
        duration: 0.1,
        ease: "linear"
      } 
    },
  };

  // Split text by words first
  const words = text.split(" ");

  // ── SEO / BOT MODE ────────────────────────────────────────────────────────
  // If we haven't reached the client yet (SSR), or if it's a simple bot,
  // we ONLY render the clean, unbroken text.
  if (!isMounted) {
    return <span className={className}>{text}</span>;
  }

  // ── USER / ANIMATION MODE ──────────────────────────────────────────────────
  // Now that we are on the client, we swap the text for the animation.
  return (
    <motion.span
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-20px" }}
      className={className}
      style={{ display: "inline" }}
    >
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span 
            key={`word-${wordIndex}`} 
            style={{ 
              display: "inline-block", 
              whiteSpace: "nowrap" 
            }}
          >
            {word.split("").map((char, charIndex) => (
              <motion.span
                key={`char-${charIndex}`}
                variants={item}
                style={{ display: "inline-block" }}
              >
                {char}
              </motion.span>
            ))}
            {/* Add a space after each word, except the last one in the sentence */}
            {wordIndex < words.length - 1 && (
              <span style={{ display: "inline-block" }}>&nbsp;</span>
            )}
          </span>
        ))}
      </span>
      
      {/* 
        Hidden static text for late-loading SEO scanners or screen readers,
        though bots will primarily see the SSR output above.
      */}
      <span style={{ 
        position: "absolute", 
        width: "1px", 
        height: "1px", 
        padding: 0, 
        margin: "-1px", 
        overflow: "hidden", 
        clip: "rect(0,0,0,0)", 
        whiteSpace: "nowrap", 
        border: 0 
      }}>
        {text}
      </span>
    </motion.span>
  );
}

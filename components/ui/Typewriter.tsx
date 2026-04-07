"use client";

import { motion, Variants } from "framer-motion";

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

  // Split text by words first to prevent words from breaking in the middle during layout
  // (Standard practice for responsive character-level animations)
  const words = text.split(" ");

  return (
    <motion.span
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-20px" }}
      className={className}
      style={{ display: "inline" }}
    >
      {/* 
        Bot-friendly text:
        Search engines see this as the primary text content.
      */}
      <span className="rpt-seo-text">
        {text}
      </span>

      {/* 
        Animated text:
        Hidden from screen readers and most bots.
        We use rpt-animate-chars to handle visibility in CSS if needed.
      */}
      <span aria-hidden="true" className="rpt-animate-chars">
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

      <style jsx>{`
        .rpt-seo-text {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        /* Mobile bots sometimes ignore clip, so we ensure it doesn't affect layout */
        @media aria-hidden-true {
          .rpt-animate-chars { display: none; }
        }
      `}</style>
    </motion.span>
  );
}

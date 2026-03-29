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
    </motion.span>
  );
}

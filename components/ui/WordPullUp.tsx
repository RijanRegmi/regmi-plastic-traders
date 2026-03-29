"use client";

import { motion, Variants } from "framer-motion";

interface WordPullUpProps {
  text: string;
  className?: string;
  delay?: number;
}

export function WordPullUp({ text, className, delay = 0 }: WordPullUpProps) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { 
        duration: 0.05 
      } 
    },
  };

  // Split text by words first to prevent words from breaking in the middle
  const words = text.split(" ");

  return (
    <motion.span
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={className}
      style={{ display: "inline" }} // Use inline to blend naturally in h1
    >
      {words.map((word, wordIndex) => (
        <span 
          key={`word-${wordIndex}`} 
          style={{ 
            display: "inline-block", 
            whiteSpace: "nowrap" // This prevents the word itself from breaking
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

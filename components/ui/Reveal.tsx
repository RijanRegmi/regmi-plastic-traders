"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  className?: string;
  width?: "fit-content" | "100%";
  style?: React.CSSProperties;
}

export default function Reveal({
  children,
  direction = "up",
  delay = 0.1,
  duration = 0.6,
  className = "",
  width = "100%",
  style = {},
}: RevealProps) {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 30 : direction === "down" ? -30 : 0,
      x: direction === "left" ? 80 : direction === "right" ? -80 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 1, 0.5, 1], // Custom ease-out
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
      style={{ ...style, width }}
    >
      {children}
    </motion.div>
  );
}

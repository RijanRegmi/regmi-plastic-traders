"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * BaseLayout provides a consistent page entrance animation for all routes.
 * It uses the pathname as a key to trigger animations on route changes.
 */
export default function BaseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

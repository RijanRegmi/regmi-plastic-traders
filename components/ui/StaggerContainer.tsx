"use client";

import React, { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  once?: boolean;
}

const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  (
    {
      children,
      staggerDelay = 0.1,
      delayChildren = 0,
      className = "",
      once = true,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once }}
        variants={{
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren,
            },
          },
          hidden: { opacity: 0 },
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

StaggerContainer.displayName = "StaggerContainer";

export default StaggerContainer;

export function StaggerItem({
  children,
  className = "",
  direction = "up",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
} & HTMLMotionProps<"div">) {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
      x: direction === "left" ? 50 : direction === "right" ? -50 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 1, 0.5, 1] as [number, number, number, number] 
      },
    },
  };

  return (
    <motion.div variants={variants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

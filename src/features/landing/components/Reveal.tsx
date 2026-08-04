"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

export function Reveal({ children, ...rest }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

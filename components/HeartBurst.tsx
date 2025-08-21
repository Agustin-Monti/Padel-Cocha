// components/HeartBurst.tsx
'use client';
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const burstVariants = {
  initial: { scale: 0, opacity: 1 },
  animate: (i: number) => ({
    scale: 1,
    opacity: 0,
    x: Math.cos((i / 6) * 2 * Math.PI) * 30,
    y: Math.sin((i / 6) * 2 * Math.PI) * 30,
    transition: { duration: 0.6 },
  }),
};

export default function HeartBurst({ trigger }: { trigger: boolean }) {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
      {trigger &&
        [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={burstVariants}
            initial="initial"
            animate="animate"
            className="absolute"
          >
            <Heart size={12} className="text-red-500 fill-red-500" />
          </motion.div>
        ))}
    </div>
  );
}

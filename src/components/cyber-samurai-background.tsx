'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { MouseEvent, ReactNode } from 'react';

const petals = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  duration: 9 + (index % 6) * 2,
  delay: -(index % 7) * 1.4,
}));

export default function CyberSamuraiBackground({ children }: { children?: ReactNode }) {
  const mouseX = useSpring(useMotionValue(0), { stiffness: 30, damping: 18 });
  const mouseY = useSpring(useMotionValue(0), { stiffness: 30, damping: 18 });

  const trackPointer = (event: MouseEvent<HTMLDivElement>) => {
    mouseX.set((event.clientX / window.innerWidth - 0.5) * 22);
    mouseY.set((event.clientY / window.innerHeight - 0.5) * 22);
  };

  return <div onMouseMove={trackPointer} className="relative min-h-screen overflow-hidden bg-[#fffafd] text-slate-800">
    <div className="shinobi-grid pointer-events-none absolute inset-0" />
    <motion.div style={{ x: mouseX, y: mouseY }} className="pointer-events-none absolute -left-36 top-8 h-96 w-96 rounded-full bg-pink-300/25 blur-3xl" />
    <motion.div style={{ x: mouseX, y: mouseY }} className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-fuchsia-300/20 blur-3xl" />
    <motion.div animate={{ rotate: [18, 23, 18], y: [-8, 8, -8] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute right-[8%] top-[15%] h-px w-48 bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_18px_#ec4899]" />
    <motion.div animate={{ rotate: [-22, -17, -22], x: [-10, 10, -10] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute bottom-[20%] left-[5%] h-px w-40 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_18px_#ec4899]" />
    {petals.map((petal) => <motion.i key={petal.id} aria-hidden="true" className="pointer-events-none absolute top-[-8%] h-2.5 w-2.5 rotate-45 rounded-sm bg-pink-400/70 shadow-[0_0_12px_#f472b6]" style={{ left: petal.left }} animate={{ y: ['0vh', '112vh'], x: [0, 45, -25, 20], rotate: [45, 210, 405] }} transition={{ duration: petal.duration, delay: petal.delay, repeat: Infinity, ease: 'linear' }} />)}
    <div className="relative z-10">{children}</div>
  </div>;
}

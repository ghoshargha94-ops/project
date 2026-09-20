'use client';

import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export default function CyberShinobi({ mood = 'idle' }: { mood?: 'idle' | 'typing' | 'loading' | 'success' }) {
  const line = mood === 'loading' ? 'Establishing uplink…' : mood === 'success' ? 'Uplink established.' : mood === 'typing' ? 'I am tracking your signal.' : 'Your next move awaits.';
  return <motion.aside animate={{ y: [-7, 7, -7] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} className="hidden lg:block" aria-label="Cyber shinobi guide"><div className="relative grid h-32 w-32 place-items-center rounded-full border border-pink-300 bg-white/80 text-pink-500 shadow-[0_0_42px_rgba(236,72,153,.35)] backdrop-blur"><motion.span animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute inset-4 rounded-full border border-pink-200"/><Bot size={52}/></div><motion.p key={line} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 max-w-44 border border-pink-200 bg-white/85 p-3 font-mono text-[10px] font-bold uppercase leading-5 tracking-wide text-pink-600 shadow-sm">Unit S-01: {line}</motion.p></motion.aside>;
}

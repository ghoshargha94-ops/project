'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Circle } from 'lucide-react';
import { useState } from 'react';

export default function SkillTree({ objective, subquests }: { objective: string; subquests: string[] }) {
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState<number[]>([]);
  return <div className="mt-4 rounded-sm border border-pink-200 bg-pink-50/70 font-mono"><button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-pink-700"><span>Skill tree / {objective}</span><ChevronDown size={15} className={open ? 'rotate-180 transition' : 'transition'} /></button><AnimatePresence initial={false}>{open && <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-pink-100 px-3 py-2">{subquests.map((subquest, index) => <li key={subquest} className="flex items-start gap-2 py-2 text-xs leading-5 text-slate-600"><button type="button" onClick={() => setDone((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index])} aria-label={`Toggle ${subquest}`} className="mt-0.5 shrink-0 text-pink-500"><Circle size={14} fill={done.includes(index) ? 'currentColor' : 'none'} /></button><span className={done.includes(index) ? 'text-slate-400 line-through' : ''}>{subquest}</span></li>)}</motion.ul>}</AnimatePresence></div>;
}

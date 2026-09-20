'use client';
import { useState } from 'react';
import { Bot, ChevronDown, MessageCircle } from 'lucide-react';
export default function RoboticGuide({ questCount }: { questCount: number }) {
 const [expanded, setExpanded] = useState(true);
 const message = questCount ? `${questCount} directive${questCount === 1 ? '' : 's'} synced. Choose one target and make it your next move.` : 'Command deck ready. Add a personal directive or let me generate a fresh daily mission.';
 return <aside className="fixed bottom-5 right-5 z-40 flex items-end gap-3 sm:bottom-7 sm:right-7" aria-label="Robotic guide">{expanded && <div className="mecha-panel max-w-[230px] border border-pink-200 bg-white/90 p-4 shadow-[0_12px_30px_rgba(190,24,93,0.15)] backdrop-blur-md"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-pink-500"><MessageCircle size={13}/> Unit M-01</div><p className="text-xs leading-5 text-slate-600">{message}</p></div>}<button type="button" onClick={() => setExpanded(value => !value)} className="mecha-button relative grid h-16 w-16 place-items-center border border-pink-300 bg-gradient-to-br from-white to-pink-100 text-pink-500 shadow-[0_0_24px_rgba(236,72,153,0.32)] transition hover:scale-105 hover:border-pink-500" aria-label="Toggle guide message"><Bot size={31} strokeWidth={1.8}/><ChevronDown size={12} className={expanded ? 'absolute bottom-1 rotate-180' : 'absolute bottom-1'}/></button></aside>;
}

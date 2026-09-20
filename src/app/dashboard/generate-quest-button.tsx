'use client';

import { useState, useTransition } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Cpu, Sparkles } from 'lucide-react';
import { generateQuest } from './actions';

export default function GenerateQuestButton() {
  const [objective, setObjective] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isGenerating, startGenerating] = useTransition();
  const [generationMessage, setGenerationMessage] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  async function deployQuest(event: React.FormEvent) {
    event.preventDefault();
    if (!objective.trim()) return;
    setStatus('loading');
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('quests').insert([{ title: objective, user_id: user?.id }]);
    if (error) { console.error(error); setStatus('error'); return; }
    setStatus('success'); setObjective(''); router.refresh(); setTimeout(() => setStatus('idle'), 2000);
  }

  function deployGeneratedQuest() {
    setGenerationMessage('');
    startGenerating(async () => {
      const result = await generateQuest();
      if ('quest' in result && result.quest) {
        setGenerationMessage(`Mission generated: ${result.quest.title}`);
      } else {
        setGenerationMessage(result.error);
        return;
      }
      router.refresh();
    });
  }

  return <div className="space-y-7">
    <form onSubmit={deployQuest} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="objective" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">User directive / manual input</label>
        <input id="objective" type="text" value={objective} onChange={e => setObjective(e.target.value)} placeholder="e.g. Complete the morning workout" className="mecha-button w-full border border-slate-300 bg-white/80 p-3.5 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-100" disabled={status === 'loading'} />
      </div>
      <button type="submit" disabled={status === 'loading' || !objective.trim()} className="mecha-button w-full border border-slate-300 bg-slate-800 px-4 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all hover:border-pink-500 hover:bg-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.35)] disabled:cursor-not-allowed disabled:opacity-50">{status === 'loading' ? 'Syncing directive...' : 'Deploy directive'}</button>
      {status === 'error' && <p className="border border-red-200 bg-red-50 p-2 text-xs uppercase tracking-wide text-red-600">Sync error: directive failed to store.</p>}
    </form>
    <div className="border-t border-slate-200 pt-6">
      <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-pink-500"><Cpu size={14} /> Generative directives</div>
      <p className="mb-4 text-xs leading-5 text-slate-500">Request a randomized mission from the command core when you need a fresh objective.</p>
      <button type="button" onClick={deployGeneratedQuest} disabled={isGenerating} className="mecha-button flex w-full items-center justify-center gap-2 border border-pink-500 bg-pink-500 px-4 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_18px_rgba(236,72,153,0.32)] transition hover:bg-pink-600 hover:shadow-[0_0_28px_rgba(236,72,153,0.55)] disabled:cursor-not-allowed disabled:opacity-60"><Sparkles size={15} /> {isGenerating ? 'Calibrating mission...' : 'Auto-generate mission'}</button>
      {generationMessage && <p className="mt-3 border border-pink-100 bg-pink-50 p-2 text-xs text-pink-700">{generationMessage}</p>}
    </div>
  </div>;
}

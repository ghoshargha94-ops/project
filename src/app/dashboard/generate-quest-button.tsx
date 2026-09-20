'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Cpu, Sparkles } from 'lucide-react';

const GENERATED_MISSIONS = [
  'Hydration Protocol: Drink 500ml water',
  'Physical Conditioning: Complete 20 pushups',
  'Neural Sync: Read 10 pages of technical documentation',
  'System Cleanse: Clear workspace perimeter',
  'Power Core Recharge: Take a 15 minute walk',
  'Signal Calibration: Reply to one important message',
  'Knowledge Upload: Learn one new shortcut or concept',
];

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

export default function GenerateQuestButton() {
  const [objective, setObjective] = useState('');
  const [manualStatus, setManualStatus] = useState<SubmissionStatus>('idle');
  const [generationStatus, setGenerationStatus] = useState<SubmissionStatus>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  async function insertDirective(title: string): Promise<boolean> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData.user;

    if (authError || !user) {
      console.error('Supabase Auth Error:', authError);
      setMessage('Session not found. Please sign in again.');
      return false;
    }

    const { error } = await supabase.from('quests').insert({ title, user_id: user.id });
    if (error) {
      console.error('Supabase Insert Error:', error);
      console.error('Supabase Insert Details:', error.message, error.details);
      setMessage(`Unable to sync directive: ${error.message}`);
      return false;
    }

    router.refresh();
    return true;
  }

  async function deployQuest(event: React.FormEvent) {
    event.preventDefault();
    const title = objective.trim();
    if (!title) return;
    setManualStatus('loading');
    setMessage('');
    const inserted = await insertDirective(title);
    if (inserted) {
      setObjective('');
      setManualStatus('success');
      setMessage('Directive synchronized.');
    } else {
      setManualStatus('error');
    }
  }

  async function deployGeneratedQuest() {
    const title = GENERATED_MISSIONS[Math.floor(Math.random() * GENERATED_MISSIONS.length)];
    setGenerationStatus('loading');
    setMessage('');
    const inserted = await insertDirective(title);
    if (inserted) {
      setGenerationStatus('success');
      setMessage(`Mission generated: ${title}`);
    } else {
      setGenerationStatus('error');
    }
  }

  const isBusy = manualStatus === 'loading' || generationStatus === 'loading';

  return <div className="space-y-7">
    <form onSubmit={deployQuest} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="objective" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">User directive / manual input</label>
        <input id="objective" type="text" value={objective} onChange={event => setObjective(event.target.value)} placeholder="e.g. Complete the morning workout" className="mecha-button w-full border border-slate-300 bg-white/80 p-3.5 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-100" disabled={isBusy} />
      </div>
      <button type="submit" disabled={isBusy || !objective.trim()} className="mecha-button w-full border border-slate-300 bg-slate-800 px-4 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all hover:border-pink-500 hover:bg-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.35)] disabled:cursor-not-allowed disabled:opacity-50">{manualStatus === 'loading' ? 'Syncing directive...' : 'Deploy directive'}</button>
    </form>
    <div className="border-t border-slate-200 pt-6">
      <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-pink-500"><Cpu size={14} /> Generative directives</div>
      <p className="mb-4 text-xs leading-5 text-slate-500">Request a randomized mission from the command core when you need a fresh objective.</p>
      <button type="button" onClick={deployGeneratedQuest} disabled={isBusy} className="mecha-button flex w-full items-center justify-center gap-2 border border-pink-500 bg-pink-500 px-4 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_18px_rgba(236,72,153,0.32)] transition hover:bg-pink-600 hover:shadow-[0_0_28px_rgba(236,72,153,0.55)] disabled:cursor-not-allowed disabled:opacity-60"><Sparkles size={15} /> {generationStatus === 'loading' ? 'Calibrating mission...' : 'Auto-generate mission'}</button>
    </div>
    {message && <p aria-live="polite" className={`border p-2 text-xs ${manualStatus === 'error' || generationStatus === 'error' ? 'border-red-200 bg-red-50 text-red-600' : 'border-pink-100 bg-pink-50 text-pink-700'}`}>{message}</p>}
  </div>;
}

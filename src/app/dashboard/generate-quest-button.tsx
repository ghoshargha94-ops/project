'use client';

import { FormEvent, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import SkillTree from './skill-tree';

const GENERATED_MISSIONS = [
  'Hydration Protocol: Consume 500ml of water.',
  'System Cleanse: Reset your workspace perimeter.',
  'Neural Sync: Read 10 pages of a book or document.',
  'Mobility Calibration: Complete a five-minute stretch.',
  'Signal Boost: Send one thoughtful message to someone.',
  'Power Reserve: Take a 15-minute screen-free break.',
];

type DeploymentStatus = 'idle' | 'loading' | 'success' | 'error';

export default function DirectiveConsole() {
  const [objective, setObjective] = useState('');
  const [status, setStatus] = useState<DeploymentStatus>('idle');
  const [message, setMessage] = useState('');
  const [subquests, setSubquests] = useState<string[]>([]);
  const [treeObjective, setTreeObjective] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const deployManualQuest = async (objective: string) => {
    setStatus('loading');
    setMessage('Life Engine is forging your skill tree…');
    const response = await fetch('/api/quests/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ objective }) });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setStatus('error');
      setMessage(data?.error ?? 'Directive failed to store.');
      return;
    }
    setStatus('success');
    setMessage(data.briefing);
    setObjective('');
    setTreeObjective(objective);
    setSubquests(data.nodes?.map((node: { title: string }) => node.title) ?? []);
    router.refresh();
  };

  const handleManualDeployment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedObjective = objective.trim();

    if (!trimmedObjective || status === 'loading') return;
    await deployManualQuest(trimmedObjective);
  };

  const deployGeneratedQuest = async () => {
    if (status === 'loading') return;

    const selectedMission =
      GENERATED_MISSIONS[Math.floor(Math.random() * GENERATED_MISSIONS.length)];
    setStatus('loading');
    setMessage('Establishing secure uplink…');

    // user_id is intentionally omitted: the database assigns auth.uid() automatically.
    const { error } = await supabase.from('quests').insert([{ title: selectedMission }]);

    if (error) {
      console.error('Supabase quest insert error:', error);
      setStatus('error');
      setMessage(error.message);
      return;
    }

    setStatus('success');
    setMessage(`Directive deployed: ${selectedMission}`);
    router.refresh();
  };

  const handleGeneratedDeployment = async () => deployGeneratedQuest();

  const isLoading = status === 'loading';

  return (
    <section
      aria-labelledby="directive-console-title"
      className="relative w-full overflow-hidden rounded-sm border border-slate-200 bg-white p-5 font-mono shadow-[0_12px_32px_rgba(15,23,42,0.08)] sm:p-6"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 border-b border-l border-pink-100 bg-pink-50/60 [clip-path:polygon(100%_0,100%_100%,0_0)]" />

      <div className="relative mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-pink-500">
            Quest uplink / online
          </p>
          <h2 id="directive-console-title" className="text-lg font-black uppercase tracking-tight text-slate-900">
            Directive Console
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-sm border border-pink-200 bg-pink-50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-pink-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-500" />
          Ready
        </div>
      </div>

      <form onSubmit={handleManualDeployment} className="relative">
        <label htmlFor="directive-objective" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
          A. Manual Directive
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="directive-objective"
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            disabled={isLoading}
            maxLength={180}
            placeholder="Enter an objective..."
            className="min-w-0 flex-1 rounded-sm border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !objective.trim()}
            className="rounded-sm bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isLoading ? 'Deploying…' : 'Deploy Directive'}
          </button>
        </div>
      </form>

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400">OR</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="relative rounded-sm border border-slate-200 bg-slate-50 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-700">B. Generative Input</p>
        <p className="mb-4 text-xs leading-relaxed text-slate-500">
          Ask the command core for a randomized daily mission.
        </p>
        <button
          type="button"
          onClick={handleGeneratedDeployment}
          disabled={isLoading}
          className="w-full rounded-sm bg-pink-500 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_5px_14px_rgba(236,72,153,0.3)] transition hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isLoading ? 'Generating Mission…' : 'Auto-Generate Mission'}
        </button>
      </div>

      {status !== 'idle' && (
        <div
          role={status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`mt-4 rounded-sm border px-3 py-2.5 text-xs font-semibold ${
            status === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : status === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-pink-200 bg-pink-50 text-pink-700'
          }`}
        >
          {status === 'error' ? `Sync error: ${message}` : message}
        </div>
      )}

      {subquests.length > 0 && <SkillTree objective={treeObjective} subquests={subquests} />}

      <aside className="relative mt-5 flex gap-3 rounded-sm border border-pink-100 bg-pink-50/70 p-3" aria-label="Action figure guide">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-slate-900 text-pink-400 shadow-sm" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 10V7a4 4 0 0 1 8 0v3M6 10h12v9H6zM9 14h.01M15 14h.01M9 18h6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 13h3M18 13h3" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-xs leading-relaxed text-slate-600">
          <span className="font-bold uppercase tracking-wider text-pink-600">Unit M-01:</span>{' '}
          Command deck ready. Add a personal directive or let me generate a fresh daily mission.
        </p>
      </aside>
    </section>
  );
}

'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function DirectiveConsole() {
  const [objective, setObjective] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. MANUAL DIRECTIVE FUNCTION
  const deployManualQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim()) return;
    setStatus('loading');

    // FIX: Only send the title. Let the database default auth.uid() handle the user_id.
    const { error } = await supabase
      .from('quests')
      .insert([{ title: objective }]);

    if (error) {
      console.error('Supabase Error:', error);
      setErrorMessage(error.message);
      setStatus('error');
    } else {
      setStatus('success');
      setObjective('');
      router.refresh();
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  // 2. GENERATIVE DIRECTIVE FUNCTION
  const deployGeneratedQuest = async () => {
    setStatus('loading');
    
    const randomMissions = [
      "Hydration Protocol: Consume 500ml of water.",
      "Physical Conditioning: Complete 20 pushups.",
      "Neural Sync: Read 10 pages of technical documentation.",
      "System Cleanse: Clear workspace perimeter.",
      "Recharge Cycle: Take a 15-minute screen break."
    ];
    const selectedMission = randomMissions[Math.floor(Math.random() * randomMissions.length)];

    // FIX: Only send the generated title.
    const { error } = await supabase
      .from('quests')
      .insert([{ title: selectedMission }]);

    if (error) {
      console.error('Supabase Error:', error);
      setErrorMessage(error.message);
      setStatus('error');
    } else {
      setStatus('success');
      router.refresh();
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="bg-white border border-pink-100 shadow-[0_0_15px_rgba(255,0,127,0.05)] rounded-sm p-6 w-full font-mono">
      
      {/* SECTION: USER DIRECTIVE */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-pink-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-pink-500 rounded-sm animate-pulse"></span>
          User Directive / Manual Input
        </h3>
        
        <form onSubmit={deployManualQuest} className="flex flex-col gap-3">
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Initialize new objective..."
            disabled={status === 'loading'}
            className="w-full bg-gray-50 border border-gray-200 text-slate-800 p-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder:text-gray-400 rounded-sm"
          />
          <button
            type="submit"
            disabled={status === 'loading' || !objective.trim()}
            className="w-full py-3 px-4 bg-slate-900 text-white font-bold uppercase tracking-widest hover:bg-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm shadow-md"
          >
            {status === 'loading' ? 'Transmitting...' : 'Deploy Directive'}
          </button>
        </form>
      </div>

      <hr className="border-pink-100 mb-6" />

      {/* SECTION: GENERATIVE DIRECTIVE */}
      <div>
        <h3 className="text-xs font-bold text-pink-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          Generative Directives
        </h3>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Request a randomized mission from the command core when you need a fresh objective.
        </p>
        <button
          onClick={deployGeneratedQuest}
          disabled={status === 'loading'}
          className="w-full py-3 px-4 bg-pink-500 text-white font-bold uppercase tracking-widest hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm shadow-[0_4px_14px_0_rgba(255,0,127,0.39)]"
        >
          {status === 'loading' ? 'Generating...' : 'Auto-Generate Mission'}
        </button>
      </div>

      {/* ERROR & SUCCESS STATES */}
      {status === 'error' && (
        <div className="mt-4 p-3 border border-red-200 bg-red-50 text-red-600 text-xs uppercase tracking-wider font-bold rounded-sm">
          Sync Error: {errorMessage || 'Directive failed to store.'}
        </div>
      )}
      {status === 'success' && (
        <div className="mt-4 p-3 border border-green-200 bg-green-50 text-green-600 text-xs uppercase tracking-wider font-bold rounded-sm">
          Directive successfully synced to database.
        </div>
      )}
    </div>
  );
}
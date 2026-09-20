'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function GenerateQuestButton() {
  const [objective, setObjective] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const deployQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim()) return;
    
    setStatus('loading');

    // Securely fetch the current user
    const { data: { user } } = await supabase.auth.getUser();

    // Push the custom text AND the user ID to Supabase
    const { error } = await supabase
      .from('quests')
      .insert([{ 
        title: objective, 
        user_id: user?.id 
      }]);

    if (error) {
      console.error(error);
      setStatus('error');
    } else {
      setStatus('success');
      setObjective('');
      router.refresh(); 
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <form onSubmit={deployQuest} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="objective" className="text-xs text-cyan-600 uppercase tracking-widest font-bold">
          Quest Objective
        </label>
        <input
          id="objective"
          type="text"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Enter custom directive..."
          className="w-full bg-black border border-cyan-800 text-cyan-100 p-3 outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all placeholder:text-cyan-900"
          disabled={status === 'loading'}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading' || !objective.trim()}
        className="w-full py-3 px-4 border border-cyan-500 bg-cyan-950/30 text-cyan-400 uppercase tracking-widest font-bold hover:bg-cyan-900/50 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Transmitting...' : 'Deploy Quest'}
      </button>

      {status === 'error' && (
        <p className="text-red-500 text-xs mt-2 uppercase tracking-widest animate-pulse border border-red-900 bg-red-950/20 p-2">
          Critical Error: Directive failed to store.
        </p>
      )}
    </form>
  );
}
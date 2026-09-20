'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Check, CircleDot, Trash2 } from 'lucide-react';

export type QuestLogItem = {
  id: string;
  title: string;
  created_at: string | null;
  rarity?: string | null;
};

export default function QuestLog({ quests }: { quests: QuestLogItem[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  async function archiveQuest(questId: string) {
    setPendingId(questId);
    setError('');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error('Supabase Auth Error:', authError);
      setError('Your session expired. Please sign in again.');
      setPendingId(null);
      return;
    }

    const { error: deleteError } = await supabase
      .from('quests')
      .delete()
      .eq('id', questId)
      .eq('user_id', authData.user.id);

    if (deleteError) {
      console.error('Supabase Delete Error:', deleteError);
      setError(`Unable to archive directive: ${deleteError.message}`);
      setPendingId(null);
      return;
    }

    router.refresh();
  }

  return <>{error && <p className="mb-4 border border-red-200 bg-red-50 p-2 text-xs text-red-600">{error}</p>}<ul className="space-y-3">{quests.map(quest => {
    const pending = pendingId === quest.id;
    return <li key={quest.id} className="group relative flex flex-col gap-3 border border-slate-200 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:border-pink-400 hover:shadow-[0_8px_22px_rgba(236,72,153,0.12)] sm:flex-row sm:items-center sm:justify-between"><span className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-pink-400 to-pink-600" /><div className="flex min-w-0 items-center gap-3 pl-2"><CircleDot size={17} className="shrink-0 text-pink-500" /><span className="truncate font-semibold text-slate-700">{quest.title}</span></div><div className="flex shrink-0 items-center gap-2 pl-2 sm:pl-0">{quest.rarity && <span className="border border-pink-100 bg-pink-50 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-pink-500">{quest.rarity}</span>}<span className="font-mono text-[10px] text-slate-400">{quest.created_at ? new Date(quest.created_at).toLocaleDateString() : 'NEW'}</span><button type="button" onClick={() => archiveQuest(quest.id)} disabled={pendingId !== null} className="mecha-button inline-flex items-center gap-1.5 border border-pink-300 bg-pink-50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-pink-600 transition hover:bg-pink-500 hover:text-white disabled:opacity-50" aria-label={`Complete ${quest.title}`}><Check size={13} />{pending ? 'Saving...' : 'Complete'}</button><button type="button" onClick={() => archiveQuest(quest.id)} disabled={pendingId !== null} className="grid h-7 w-7 place-items-center border border-slate-200 text-slate-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500 disabled:opacity-50" aria-label={`Delete ${quest.title}`}><Trash2 size={13} /></button></div></li>;
  })}</ul></>;
}

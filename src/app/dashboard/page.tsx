import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Activity, Command, Radar, Sparkles } from 'lucide-react';
import AboutProject from './about-project';
import GenerateQuestButton from './generate-quest-button';
import RoboticGuide from './robotic-guide';
import QuestLog from './quest-log';

export const revalidate = 0;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => cookieStore.getAll() } });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect('/');
  const { data: quests } = await supabase.from('quests').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  const directives = quests ?? [];

  return <div className="relative min-h-screen overflow-hidden bg-[#f7f7fa] px-5 py-6 text-slate-800 sm:px-8 lg:px-12">
    <div className="mecha-grid pointer-events-none absolute inset-0 opacity-80" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.13),transparent_65%)]" />
    <header className="relative mx-auto flex max-w-7xl flex-col gap-6 border-b border-pink-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-pink-500"><span className="h-2 w-2 bg-pink-500 shadow-[0_0_10px_#ec4899]" />Operator interface / v.01</div><h1 className="text-4xl font-black uppercase tracking-tight text-slate-800 sm:text-5xl">Life <span className="text-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,0.35)]">RPG</span></h1><p className="mt-2 text-sm text-slate-500">Command deck online · {user.email}</p></div>
      <AboutProject />
    </header>
    <main className="relative mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="mecha-panel lg:col-span-4 h-fit border border-slate-200 bg-white/65 p-6 shadow-[0_16px_45px_rgba(71,85,105,0.08)] backdrop-blur-md"><div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-500">Directive console</p><h2 className="mt-1 text-xl font-black uppercase tracking-tight">Deploy a mission</h2></div><Command className="text-pink-400" size={23} /></div><GenerateQuestButton /></section>
      <section className="mecha-panel lg:col-span-8 min-h-[520px] border border-slate-200 bg-white/65 p-6 shadow-[0_16px_45px_rgba(71,85,105,0.08)] backdrop-blur-md sm:p-7"><div className="mb-6 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-500">Active systems</p><h2 className="mt-1 text-xl font-black uppercase tracking-tight">Quest log</h2></div><div className="flex items-center gap-2 border border-pink-200 bg-pink-50 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-pink-600"><Activity size={13} /> {directives.length} synced</div></div>
        {directives.length ? <QuestLog quests={directives} /> : <div className="grid min-h-72 place-items-center border border-dashed border-pink-200 bg-white/40 p-8 text-center"><div><Radar size={42} className="mx-auto text-pink-300" /><h3 className="mt-4 font-bold uppercase tracking-wide text-slate-700">No directives detected</h3><p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Your command deck is clear. Create a goal or generate a mission to begin your next run.</p><Sparkles size={15} className="mx-auto mt-4 text-pink-400" /></div></div>}
      </section>
    </main>
    <RoboticGuide questCount={directives.length} />
  </div>;
}

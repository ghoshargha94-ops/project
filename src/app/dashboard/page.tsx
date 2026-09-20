import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import GenerateQuestButton from './generate-quest-button';

export const revalidate = 0;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect('/');

  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black text-cyan-500 p-8 font-mono tracking-wide overflow-hidden relative">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <header className="relative z-10 mb-12 border-b border-cyan-900/50 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] uppercase">
            System Online
          </h1>
          <p className="text-xs text-cyan-700 mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Operator ID: {user.email}
          </p>
        </div>
      </header>
      
      <main className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Command Center */}
        <section className="lg:col-span-4 bg-black/40 backdrop-blur-md border border-cyan-800/50 p-6 rounded-sm shadow-[0_0_30px_rgba(6,182,212,0.05)] h-fit">
          <h2 className="text-xl font-bold mb-6 text-white uppercase tracking-widest flex items-center gap-2">
            <span className="text-fuchsia-500">_</span>New Directive
          </h2>
          <GenerateQuestButton />
        </section>

        {/* Active Quest Log */}
        <section className="lg:col-span-8 bg-black/40 backdrop-blur-md border border-cyan-800/50 p-6 rounded-sm shadow-[0_0_30px_rgba(6,182,212,0.05)] min-h-[500px]">
          <h2 className="text-xl font-bold mb-6 text-white uppercase tracking-widest flex items-center gap-2">
            <span className="text-cyan-500">_</span>Live Quest Log
          </h2>
          
          {quests && quests.length > 0 ? (
            <ul className="space-y-4">
              {quests.map((quest) => (
                <li 
                  key={quest.id} 
                  className="group relative p-5 bg-[#0a0a0a]/80 border-l-4 border-cyan-600 flex justify-between items-center transition-all duration-300 hover:border-fuchsia-500 hover:bg-[#111] hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]"
                >
                  <span className="text-cyan-50 font-medium text-lg drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
                    {quest.title}
                  </span>
                  <span className="text-xs text-cyan-800 group-hover:text-cyan-400 transition-colors">
                    {new Date(quest.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-cyan-900/50 bg-black/20">
              <span className="text-cyan-700/50 text-4xl mb-4">ø</span>
              <p className="text-cyan-700 text-sm tracking-widest uppercase">No active directives found.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
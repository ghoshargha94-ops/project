import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import GenerateQuestButton from './generate-quest-button';

export const revalidate = 0; // Ensures the dashboard always fetches fresh data

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // Authenticate the current player
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect('/'); 
  }

  // Fetch the player's saved quests from the neural net, newest first
  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-cyan-500 p-8 font-mono tracking-wide">
      <header className="mb-12 border-b border-cyan-900 pb-6">
        <h1 className="text-4xl font-black tracking-widest text-white uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
          System Online
        </h1>
        <p className="text-sm text-cyan-700 mt-2">Operator ID: {user.email}</p>
      </header>
      
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Command Center */}
        <section className="md:col-span-4 bg-black border border-cyan-900 p-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <h2 className="text-lg font-bold mb-6 text-white uppercase tracking-widest border-b border-cyan-900 pb-2">
            New Directive
          </h2>
          <GenerateQuestButton />
        </section>

        {/* Active Quest Log */}
        <section className="md:col-span-8 bg-black border border-cyan-900 p-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <h2 className="text-lg font-bold mb-6 text-white uppercase tracking-widest border-b border-cyan-900 pb-2">
            Live Quest Log
          </h2>
          
          {quests && quests.length > 0 ? (
            <ul className="space-y-4">
              {quests.map((quest) => (
                <li 
                  key={quest.id} 
                  className="p-4 bg-[#050505] border-l-4 border-cyan-500 flex justify-between items-center transition-all hover:border-cyan-300 hover:bg-[#0a0a0a]"
                >
                  <span className="text-cyan-100 font-semibold text-lg">{quest.title}</span>
                  <span className="text-xs text-cyan-800">
                    {new Date(quest.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center border border-dashed border-cyan-900">
              <p className="text-cyan-700 text-sm">No active directives found. Generate a quest to begin your run.</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
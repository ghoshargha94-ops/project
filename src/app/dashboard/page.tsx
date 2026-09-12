import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { GenerateQuestButton } from "./generate-quest-button";

type Quest = {
  id: string;
  title: string;
  created_at: string;
  xp_reward: number | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [questsResult, profileResult] = await Promise.all([
    supabase
      .from("quests")
      .select("id, title, created_at, xp_reward")
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("current_xp").eq("id", user.id).maybeSingle(),
  ]);

  const { data: quests, error } = questsResult;
  const currentXp = profileResult.data?.current_xp ?? 0;

  async function createQuest(formData: FormData) {
    "use server";

    const title = formData.get("title");
    if (typeof title !== "string" || !title.trim()) {
      return;
    }

    const serverSupabase = await createClient();
    const {
      data: { user: actionUser },
    } = await serverSupabase.auth.getUser();

    if (!actionUser) {
      redirect("/login");
    }

    const { error: insertError } = await serverSupabase.from("quests").insert({
      title: title.trim(),
      user_id: actionUser.id,
    });

    if (insertError) {
      throw new Error("Unable to create quest. Check the quests table policy and schema.");
    }

    revalidatePath("/dashboard");
  }

  async function completeQuest(formData: FormData) {
    "use server";

    const questId = formData.get("questId");
    if (typeof questId !== "string" || !questId) {
      return;
    }

    const serverSupabase = await createClient();
    const {
      data: { user: actionUser },
    } = await serverSupabase.auth.getUser();

    if (!actionUser) {
      redirect("/login");
    }

    const { data: quest, error: questError } = await serverSupabase
      .from("quests")
      .select("id, xp_reward")
      .eq("id", questId)
      .eq("user_id", actionUser.id)
      .eq("is_completed", false)
      .single();

    if (questError || !quest) {
      throw new Error("Quest could not be completed.");
    }

    const { data: profile } = await serverSupabase
      .from("profiles")
      .select("current_xp")
      .eq("id", actionUser.id)
      .maybeSingle();

    const currentXpVal = profile?.current_xp ?? 0;

    const { error: completeError } = await serverSupabase
      .from("quests")
      .update({ is_completed: true })
      .eq("id", quest.id)
      .eq("user_id", actionUser.id);

    if (completeError) {
      throw new Error("Quest could not be completed.");
    }

    const xpReward = quest.xp_reward ?? 25;
    const { error: xpError } = await serverSupabase
      .from("profiles")
      .upsert({ id: actionUser.id, current_xp: currentXpVal + xpReward });

    if (xpError) {
      throw new Error("Quest completed, but XP could not be updated.");
    }

    revalidatePath("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a0f] px-5 py-8 text-slate-100 sm:px-8 sm:py-10">
      <div className="cyber-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <header className="mb-10 flex flex-col gap-5 border-b border-cyan-300/20 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.34em] text-fuchsia-300">
              Life // RPG · player terminal
            </p>
            <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.12em] text-white sm:text-4xl">
              Active quests
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-right">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-200/70">Current XP</p>
              <p className="mt-1 font-mono text-xl font-black tracking-[0.08em] text-cyan-200">{currentXp}</p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lime-300 shadow-[0_0_10px_#bef264]" />
              authenticated
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <section className="border border-cyan-300/20 bg-[#0b1119]/90 p-6 shadow-[0_0_70px_rgba(34,211,238,0.08)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-slate-700/70 pb-4">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
                Quest queue
              </p>
              <span className="font-mono text-[10px] text-slate-500">LIVE DATABASE</span>
            </div>

            {error ? (
              <p role="alert" className="border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                Unable to load your quests. Check the quests table policy and schema.
              </p>
            ) : quests && quests.length > 0 ? (
              <ul className="space-y-3">
                {(quests as Quest[]).map((quest) => (
                  <li key={quest.id} className="group flex items-center gap-4 border border-slate-700/70 bg-[#070a0f]/80 px-4 py-4 transition hover:border-cyan-300/50">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-fuchsia-300/50 font-mono text-xs text-fuchsia-200">&gt;</span>
                    <span className="min-w-0 flex-1 break-words text-sm font-medium text-slate-100">{quest.title}</span>
                    <span className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-fuchsia-200 sm:block">+{quest.xp_reward ?? 25} XP</span>
                    <form action={completeQuest}>
                      <input type="hidden" name="questId" value={quest.id} />
                      <button type="submit" className="border border-cyan-300/50 bg-cyan-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-300 hover:text-[#061016]">Complete</button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border border-dashed border-slate-700 px-5 py-12 text-center">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">No active quests detected</p>
              </div>
            )}
          </section>

          <aside className="h-fit border border-fuchsia-300/20 bg-[#0b1119]/90 p-6 shadow-[0_0_70px_rgba(217,70,239,0.06)] backdrop-blur-xl">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-fuchsia-300">New directive</p>
            <h2 className="mt-3 text-xl font-black uppercase tracking-[0.1em] text-white">Add a quest</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Transmit a task to your live quest log.</p>

            <div className="mt-6">
              <GenerateQuestButton />
            </div>

            <form action={createQuest} className="space-y-4">
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Quest title</span>
                <input name="title" required maxLength={200} autoComplete="off" placeholder="Enter objective" className="h-12 w-full border border-slate-700 bg-[#070a0f] px-4 font-mono text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-300/40" />
              </label>
              <button type="submit" className="group relative h-12 w-full overflow-hidden bg-fuchsia-300 px-4 text-xs font-black uppercase tracking-[0.2em] text-[#18051b] transition hover:bg-fuchsia-200">
                <span className="relative z-10">Deploy quest</span>
                <span className="absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/40 transition-all duration-700 group-hover:left-full" />
              </button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}
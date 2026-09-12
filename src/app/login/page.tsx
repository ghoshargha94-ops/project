"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    const result = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setError(result.error.message);
      setIsLoading(false);
      return;
    }

    if (isSignup && !result.data.session) {
      setMessage("Check your inbox to verify your account, then jack in.");
      setIsLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#070a0f] px-5 py-10 text-slate-100">
      <div className="cyber-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -left-40 top-1/4 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <section className="relative w-full max-w-md animate-[rise-in_700ms_ease-out_both]">
        <div className="mb-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.34em] text-cyan-300/70">
          <span>Life // RPG</span>
          <span className="flex items-center gap-2 text-slate-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-300 shadow-[0_0_10px_#bef264]" />
            System online
          </span>
        </div>

        <div className="border border-cyan-300/20 bg-[#0b1119]/90 p-7 shadow-[0_0_70px_rgba(34,211,238,0.08)] backdrop-blur-xl sm:p-9">
          <div className="mb-8">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-fuchsia-300">
              Identity checkpoint
            </p>
            <h1 className="text-3xl font-black uppercase tracking-[0.12em] text-white sm:text-4xl">
              {isSignup ? "Create your run" : "Welcome back"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {isSignup
                ? "Build your character. Turn every day into a quest."
                : "Your next level is waiting. Resume your run."}
            </p>
          </div>

          <div className="mb-7 grid grid-cols-2 border-b border-slate-700/70">
            {(["login", "signup"] as Mode[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchMode(tab)}
                className={`border-b-2 pb-3 text-xs font-bold uppercase tracking-[0.2em] transition ${
                  mode === tab
                    ? "border-cyan-300 text-cyan-200"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Email address
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="player@life-rpg.dev"
                className="h-12 w-full border border-slate-700 bg-[#070a0f] px-4 font-mono text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300/40"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Passcode
              </span>
              <input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="h-12 w-full border border-slate-700 bg-[#070a0f] px-4 font-mono text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300/40"
              />
            </label>

            {error && (
              <p role="alert" className="border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs leading-5 text-rose-200">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="border border-lime-300/30 bg-lime-300/10 px-3 py-2 text-xs leading-5 text-lime-200">
                {message}
              </p>
            )}

            <button
              disabled={isLoading}
              type="submit"
              className="group relative h-12 w-full overflow-hidden bg-cyan-300 px-5 text-xs font-black uppercase tracking-[0.25em] text-[#061016] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60"
            >
              <span className="relative z-10">{isLoading ? "Connecting..." : isSignup ? "Start run" : "Enter the grid"}</span>
              <span className="absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/40 transition-all duration-700 group-hover:left-full" />
            </button>
          </form>

          <p className="mt-7 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600">
            Secure auth powered by Supabase
          </p>
        </div>
      </section>
    </main>
  );
}
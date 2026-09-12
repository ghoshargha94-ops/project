"use client";

import { useActionState } from "react";
import { generateQuest, type GenerateQuestState } from "./actions";

const initialState: GenerateQuestState = {};

export function GenerateQuestButton() {
  const [state, formAction, isPending] = useActionState(
    generateQuest,
    initialState,
  );

  return (
    <form action={formAction} className="mb-7 border-b border-slate-700/70 pb-7">
      <button
        type="submit"
        disabled={isPending}
        className="group relative h-14 w-full overflow-hidden border border-cyan-200/50 bg-cyan-300 px-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#061016] shadow-[0_0_28px_rgba(103,232,249,0.2)] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-70"
      >
        <span className="relative z-10">
          {isPending ? "Decrypting Intel..." : "Contact Fixer (Generate AI Job)"}
        </span>
        <span className="absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/40 transition-all duration-700 group-hover:left-full" />
      </button>
      {state.error && (
        <p role="alert" className="mt-3 border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs leading-5 text-rose-200">
          {state.error}
        </p>
      )}
    </form>
  );
}

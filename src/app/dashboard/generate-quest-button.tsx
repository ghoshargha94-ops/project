'use client';

import { useActionState } from 'react';
import { generateQuest, GenerateQuestState } from './actions';

const RARITY_STYLES: Record<string, string> = {
  common: 'text-zinc-300 border-zinc-600',
  uncommon: 'text-green-400 border-green-600',
  rare: 'text-blue-400 border-blue-600',
  legendary: 'text-amber-400 border-amber-500',
};

export default function GenerateQuestButton() {
  const [state, formAction, isPending] = useActionState<GenerateQuestState | null>(
    generateQuest,
    null
  );

  return (
    <form action={formAction} className="flex flex-col items-start gap-3">
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Generating Quest...' : 'Generate New Quest'}
      </button>

      {state?.error && (
        <p role="alert" className="text-red-500 text-sm">
          {state.error}
        </p>
      )}

      {state?.quest && (
        <div
          className={`w-full max-w-sm rounded border bg-zinc-900 p-3 ${
            RARITY_STYLES[state.quest.rarity] ?? RARITY_STYLES.common
          }`}
        >
          <p className="font-bold">{state.quest.title}</p>
          <div className="flex justify-between text-xs mt-1 opacity-80">
            <span className="uppercase tracking-wide">{state.quest.rarity}</span>
            <span>{state.quest.reward_credits} credits</span>
          </div>
        </div>
      )}
    </form>
  );
}
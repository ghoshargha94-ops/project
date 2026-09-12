'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export type Quest = {
  id: string;
  title: string;
  rarity: QuestRarity;
  reward_credits: number;
};

export type GenerateQuestState =
  | { error: string; quest?: undefined }
  | { error?: undefined; quest: Quest };

type QuestRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

type QuestTemplate = {
  title: string;
  rarity: QuestRarity;
  baseReward: number;
};

// Weighted so rarer titles show up less often.
const QUEST_TEMPLATES: QuestTemplate[] = [
  { title: 'Neural Net Infiltrator', rarity: 'common', baseReward: 50 },
  { title: 'Synthetic Data Smuggler', rarity: 'common', baseReward: 50 },
  { title: 'Sub-Level Cipher Runner', rarity: 'uncommon', baseReward: 120 },
  { title: 'Chrome-Plated Fixer', rarity: 'uncommon', baseReward: 120 },
  { title: 'Quantum Grid Mercenary', rarity: 'rare', baseReward: 300 },
  { title: 'Ghost Protocol Architect', rarity: 'legendary', baseReward: 750 },
];

const RARITY_WEIGHTS: Record<QuestRarity, number> = {
  common: 50,
  uncommon: 30,
  rare: 15,
  legendary: 5,
};

function pickWeightedTemplate(): QuestTemplate {
  const pool = QUEST_TEMPLATES;
  const totalWeight = pool.reduce((sum, t) => sum + RARITY_WEIGHTS[t.rarity], 0);
  let roll = Math.random() * totalWeight;

  for (const template of pool) {
    roll -= RARITY_WEIGHTS[template.rarity];
    if (roll <= 0) return template;
  }
  return pool[0]; // fallback, should never hit
}

function rewardWithVariance(base: number): number {
  // +/- 15% variance, rounded to nearest 5
  const factor = 0.85 + Math.random() * 0.3;
  return Math.round((base * factor) / 5) * 5;
}

export async function generateQuest(): Promise<GenerateQuestState> {
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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Unauthorized player.' };
  }

  const template = pickWeightedTemplate();
  const reward_credits = rewardWithVariance(template.baseReward);

  const { data, error: insertError } = await supabase
    .from('quests')
    .insert({
      title: template.title,
      rarity: template.rarity,
      reward_credits,
      user_id: user.id,
    })
    .select('id, title, rarity, reward_credits')
    .single();

  if (insertError || !data) {
    console.error('Quest insert failed:', insertError?.message ?? 'no data returned');
    return { error: 'Intel received, but the quest could not be stored.' };
  }

  revalidatePath('/dashboard');
  return { quest: data as Quest };
}
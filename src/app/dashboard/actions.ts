'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export type GenerateQuestState = { error?: string } | void;

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

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Unauthorized player." };
  }

  const cyberTitles = [
    "Neural Net Infiltrator",
    "Synthetic Data Smuggler",
    "Quantum Grid Mercenary",
    "Sub-Level Cipher Runner",
    "Chrome-Plated Fixer"
  ];

  try {
    const title = cyberTitles[Math.floor(Math.random() * cyberTitles.length)];

    const { error: inserterror } = await supabase.from("quests").insert({
      title,
      user_id: user.id,
    });

    if (inserterror) {
      return { error: "Intel received, but the quest could not be stored." };
    }

    revalidatePath("/dashboard");
    return {};
  } catch (error: any) {
    console.error("CRITICAL ERROR:", error?.message || error);
    return { error: "Unable to reach the fixer. Try again shortly." };
  }
}
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const questSchema = z.object({
  briefing: z.string().min(20).max(360),
  steps: z.array(z.object({ title: z.string().min(3).max(70), description: z.string().min(8).max(220), rewardXp: z.number().int().min(10).max(100) })).min(3).max(7),
});

export async function POST(request: Request) {
  const { objective } = await request.json().catch(() => ({ objective: '' }));
  if (typeof objective !== 'string' || objective.trim().length < 3) return NextResponse.json({ error: 'A directive needs at least 3 characters.' }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    const { object } = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: questSchema,
      prompt: `You are a concise Cyber-Samurai mentor. Create a safe, sequential real-world quest for: ${objective.trim()}. Return 3 to 7 practical steps. No medical, legal, or dangerous advice. The briefing speaks directly to the player in a grounded, encouraging tone.`,
    });
    const { data: quest, error: questError } = await supabase.from('quests').insert([{ title: objective.trim() }]).select('id, title').single();
    if (questError || !quest) throw new Error(questError?.message ?? 'Quest could not be stored.');
    const { data: nodes, error: nodesError } = await supabase.from('quest_nodes').insert(object.steps.map((step, index) => ({ quest_id: quest.id, position: index + 1, title: step.title, description: step.description, reward_xp: step.rewardXp, status: index === 0 ? 'active' : 'locked' }))).select();
    if (nodesError) throw new Error(nodesError.message);
    return NextResponse.json({ quest, briefing: object.briefing, nodes });
  } catch (error) {
    console.error('AI quest generation error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Life Engine is unavailable.' }, { status: 500 });
  }
}

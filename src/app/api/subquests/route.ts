import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

function buildSubquests(objective: string) {
  const subject = objective.replace(/[.!?]+$/, '').trim();
  return [
    `Define the smallest measurable outcome for “${subject}”.`,
    `Spend 15 focused minutes on the first practice block.`,
    `Record one observation, correction, or question from the session.`,
    `Schedule the next repetition before ending the mission.`,
  ];
}

export async function POST(request: Request) {
  const { objective } = await request.json().catch(() => ({ objective: '' }));
  if (typeof objective !== 'string' || objective.trim().length < 3) return NextResponse.json({ error: 'Provide a directive of at least 3 characters.' }, { status: 400 });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => request.headers.get('cookie')?.split('; ').filter(Boolean).map((entry) => { const [name, ...value] = entry.split('='); return { name, value: value.join('=') }; }) ?? [], setAll() {} },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  return NextResponse.json({ objective: objective.trim(), subquests: buildSubquests(objective) });
}

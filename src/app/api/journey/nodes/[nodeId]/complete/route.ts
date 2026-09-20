import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(_: Request, { params }: { params: Promise<{ nodeId: string }> }) {
  const { nodeId } = await params; const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const { data: node, error } = await supabase.from('quest_nodes').select('id, quest_id, position, status').eq('id', nodeId).single();
  if (error || !node) return NextResponse.json({ error: 'Node not found.' }, { status: 404 });
  if (node.status !== 'active') return NextResponse.json({ error: 'This node is still locked.' }, { status: 409 });
  const { error: completeError } = await supabase.from('quest_nodes').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', node.id);
  if (completeError) return NextResponse.json({ error: completeError.message }, { status: 500 });
  const { data: next } = await supabase.from('quest_nodes').select('id').eq('quest_id', node.quest_id).eq('position', node.position + 1).maybeSingle();
  if (next) await supabase.from('quest_nodes').update({ status: 'active' }).eq('id', next.id);
  return NextResponse.json({ final: !next, unlockedNodeId: next?.id ?? null });
}

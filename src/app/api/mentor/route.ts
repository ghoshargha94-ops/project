import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const { messages, questId, nodeId } = await request.json() as { messages: UIMessage[]; questId?: string; nodeId?: string };
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user || !questId || !nodeId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const { data: node } = await supabase.from('quest_nodes').select('title, description, quests!inner(title)').eq('id', nodeId).eq('quest_id', questId).single();
  if (!node) return NextResponse.json({ error: 'Node not found.' }, { status: 404 });
  const result = streamText({ model: google('gemini-2.0-flash'), system: `You are a practical, safety-conscious Cyber-Samurai Mentor. Guide the user through node “${node.title}”: ${node.description}. Be concise and conversational.`, messages: await convertToModelMessages(messages) });
  return result.toUIMessageStreamResponse();
}

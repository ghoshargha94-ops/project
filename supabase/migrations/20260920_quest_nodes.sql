create table if not exists public.quest_nodes (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  position integer not null check (position > 0),
  title text not null,
  description text not null,
  status text not null default 'locked' check (status in ('locked', 'active', 'completed')),
  reward_xp integer not null default 25 check (reward_xp >= 0),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (quest_id, position)
);

alter table public.quest_nodes enable row level security;

create policy "Players can read their quest nodes" on public.quest_nodes for select using (
  exists (select 1 from public.quests where quests.id = quest_nodes.quest_id and quests.user_id = auth.uid())
);
create policy "Players can create their quest nodes" on public.quest_nodes for insert with check (
  exists (select 1 from public.quests where quests.id = quest_nodes.quest_id and quests.user_id = auth.uid())
);
create policy "Players can update their quest nodes" on public.quest_nodes for update using (
  exists (select 1 from public.quests where quests.id = quest_nodes.quest_id and quests.user_id = auth.uid())
);

-- Journal reflection conversations (replaces the Base44 agent's stored conversations).
-- Owner-only, like the journal. The reflection function reads and writes a row only as the signed-in person.
-- Hand-written (not generated from base44/entities). Safe to run more than once.
create table if not exists public.reflection_conversation (
  id text primary key default replace(gen_random_uuid()::text, '-', ''),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text,
  messages jsonb not null default '[]'::jsonb
);
create index if not exists reflection_conversation_owner_idx on public.reflection_conversation (created_by_id, created_date desc);
alter table public.reflection_conversation enable row level security;
drop trigger if exists reflection_conversation_touch on public.reflection_conversation;
create trigger reflection_conversation_touch before update on public.reflection_conversation for each row execute function public.touch_updated_date();
drop policy if exists reflection_conversation_read on public.reflection_conversation;
create policy reflection_conversation_read on public.reflection_conversation for select using (created_by_id = auth.uid());
drop policy if exists reflection_conversation_create on public.reflection_conversation;
create policy reflection_conversation_create on public.reflection_conversation for insert with check (created_by_id = auth.uid());
drop policy if exists reflection_conversation_update on public.reflection_conversation;
create policy reflection_conversation_update on public.reflection_conversation for update using (created_by_id = auth.uid()) with check (created_by_id = auth.uid());
drop policy if exists reflection_conversation_delete on public.reflection_conversation;
create policy reflection_conversation_delete on public.reflection_conversation for delete using (created_by_id = auth.uid());

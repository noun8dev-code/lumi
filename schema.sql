-- Création de la table 'families'
create table families (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  kids jsonb default '[]'::jsonb
);

-- Désactiver la sécurité RLS pour simplifier (pour un projet enfant)
-- ATTENTION : Cela rend les données publiques si on a la clé API, mais c'est plus simple pour commencer.
alter table families enable row level security;

create policy "Enable read access for all users"
on families for select
using (true);

create policy "Enable insert access for all users"
on families for insert
with check (true);

create policy "Enable update access for all users"
on families for update
using (true);

-- Execute no SQL Editor do Supabase. RLS é obrigatória para isolamento entre colecionadores.
create extension if not exists pgcrypto;
create table if not exists public.catalog_cards (
 id uuid primary key default gen_random_uuid(),
 pokedex_number integer not null check (pokedex_number between 1 and 2000),
 name text not null, set_name text not null, set_code text,
 collector_number text not null, language text not null,
 rarity text, image_url text,
 unique(set_code,collector_number,language)
);
create table if not exists public.collection_items (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 card_id uuid not null references public.catalog_cards(id),
 quantity integer not null default 1 check(quantity > 0),
 condition text, acquired_at date, paid_amount numeric(12,2), paid_currency text,
 notes text, created_at timestamptz not null default now(),
 unique(user_id,card_id)
);
create table if not exists public.price_quotes (
 id uuid primary key default gen_random_uuid(),
 card_id uuid not null references public.catalog_cards(id),
 amount numeric(12,2) not null check(amount>=0), currency text not null,
 source_name text not null, source_url text, condition text,
 observed_at timestamptz not null default now(), provisional boolean not null default true
);
alter table public.catalog_cards enable row level security;
alter table public.collection_items enable row level security;
alter table public.price_quotes enable row level security;
create policy "catalog visible" on public.catalog_cards for select to anon, authenticated using(true);
create policy "quotes visible" on public.price_quotes for select to anon, authenticated using(true);
create policy "own collection read" on public.collection_items for select to authenticated using((select auth.uid())=user_id);
create policy "own collection insert" on public.collection_items for insert to authenticated with check((select auth.uid())=user_id);
create policy "own collection update" on public.collection_items for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "own collection delete" on public.collection_items for delete to authenticated using((select auth.uid())=user_id);
-- Catálogo e preços são geridos apenas por administradores via SQL Editor/serviço seguro.
insert into public.catalog_cards(pokedex_number,name,set_name,set_code,collector_number,language,rarity,image_url) values
(66,'Machop','Caminho do Campeão','CPA','024/073','pt-BR','Comum',null),
(94,'Gengar ex','Celebração de 30 Anos','30C','154/128','pt-BR','Pendente de verificação',null),
(321,'Wailord','Journey Together','JTG','162/159','en','Illustration Rare',null)
on conflict(set_code,collector_number,language) do nothing;
-- Preços anteriores são referências provisórias, não atualizados automaticamente.
insert into public.price_quotes(card_id,amount,currency,source_name,provisional)
select id,case when pokedex_number=66 then 0.89 when pokedex_number=94 then 399.00 else 12.01 end,
case when language='pt-BR' then 'BRL' else 'USD' end,'Referência provisória do catálogo inicial',true
from public.catalog_cards where (set_code='CPA' and collector_number='024/073') or (set_code='30C' and collector_number='154/128') or (set_code='JTG' and collector_number='162/159');

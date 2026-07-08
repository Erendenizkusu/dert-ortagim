-- ============================================================
--  dert ortağım — başlangıç şeması (init)
--  Supabase SQL Editor'da veya `supabase db push` ile çalıştırın.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
--  Tablolar
-- ------------------------------------------------------------

-- profiles: auth.users'ı genişletir
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  display_name text not null,
  bio          text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- posts: "dertler"
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.profiles(id) on delete cascade,
  is_anonymous  boolean not null default true,
  title         text not null check (char_length(title) between 3 and 160),
  body          text not null check (char_length(body) between 1 and 8000),
  category      text,
  tags          text[] not null default '{}',
  is_sensitive  boolean not null default false,
  status        text not null default 'open' check (status in ('open','solved')),
  solved_advice_id uuid,
  me_too_count  integer not null default 0,
  advice_count  integer not null default 0,
  search_vector tsvector generated always as (
    setweight(to_tsvector('turkish', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('turkish', coalesce(body,'')),  'B')
  ) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists posts_search_idx   on public.posts using gin (search_vector);
create index if not exists posts_tags_idx      on public.posts using gin (tags);
create index if not exists posts_category_idx  on public.posts (category);
create index if not exists posts_created_idx    on public.posts (created_at desc);
create index if not exists posts_author_idx     on public.posts (author_id);

-- advices: "tavsiyeler / çözümler"
create table if not exists public.advices (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.posts(id) on delete cascade,
  author_id    uuid not null references public.profiles(id) on delete cascade,
  is_anonymous boolean not null default true,
  body         text not null check (char_length(body) between 1 and 4000),
  is_helpful   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists advices_post_idx   on public.advices (post_id);
create index if not exists advices_author_idx on public.advices (author_id);

-- posts.solved_advice_id -> advices FK (advices tablosundan sonra)
do $$ begin
  alter table public.posts
    add constraint posts_solved_advice_fk
    foreign key (solved_advice_id) references public.advices(id) on delete set null;
exception when duplicate_object then null; end $$;

-- me_too: "ben de yaşıyorum"
create table if not exists public.me_too (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index if not exists me_too_post_idx on public.me_too (post_id);

-- ------------------------------------------------------------
--  Trigger fonksiyonları
-- ------------------------------------------------------------

-- Yeni auth kullanıcısı -> otomatik profil
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username  text;
  final_username text;
  suffix int := 0;
begin
  base_username := coalesce(
    nullif(new.raw_user_meta_data->>'username',''),
    split_part(new.email, '@', 1)
  );
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'));
  if base_username = '' then base_username := 'kullanici'; end if;

  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    final_username,
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name',''),
      nullif(new.raw_user_meta_data->>'full_name',''),
      final_username
    )
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- me_too sayacı
create or replace function public.bump_me_too_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set me_too_count = me_too_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set me_too_count = greatest(me_too_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end; $$;

drop trigger if exists me_too_count_trg on public.me_too;
create trigger me_too_count_trg
  after insert or delete on public.me_too
  for each row execute function public.bump_me_too_count();

-- advice sayacı
create or replace function public.bump_advice_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set advice_count = advice_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set advice_count = greatest(advice_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end; $$;

drop trigger if exists advice_count_trg on public.advices;
create trigger advice_count_trg
  after insert or delete on public.advices
  for each row execute function public.bump_advice_count();

-- posts.updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists posts_touch_updated on public.posts;
create trigger posts_touch_updated
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
--  Çözüm işaretleme RPC (yalnız gönderi sahibi)
-- ------------------------------------------------------------
create or replace function public.cozum_toggle(p_post_id uuid, p_advice_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_owner   uuid;
  v_current boolean;
begin
  select author_id into v_owner from public.posts where id = p_post_id;
  if v_owner is null then raise exception 'Gönderi bulunamadı'; end if;
  if v_owner <> auth.uid() then raise exception 'Yetkisiz işlem'; end if;

  select is_helpful into v_current
  from public.advices where id = p_advice_id and post_id = p_post_id;
  if v_current is null then raise exception 'Tavsiye bulunamadı'; end if;

  -- her durumda önce tüm işaretleri temizle
  update public.advices set is_helpful = false where post_id = p_post_id;

  if v_current then
    -- zaten çözümdü -> geri al
    update public.posts set status = 'open', solved_advice_id = null where id = p_post_id;
  else
    -- yeni çözüm olarak işaretle
    update public.advices set is_helpful = true where id = p_advice_id;
    update public.posts set status = 'solved', solved_advice_id = p_advice_id where id = p_post_id;
  end if;
end; $$;

-- ------------------------------------------------------------
--  RLS
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.posts    enable row level security;
alter table public.advices  enable row level security;
alter table public.me_too   enable row level security;

-- profiles: herkes okur (kullanıcı adı herkese açık kimliktir), sahibi yazar
drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all on public.profiles for select using (true);
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- posts: base tabloda SELECT SADECE sahibi -> anonim yazar kimliği asla sızmaz.
-- Herkese açık okuma public.posts_public view'ı üzerinden yapılır.
drop policy if exists posts_select_own on public.posts;
create policy posts_select_own on public.posts for select using (auth.uid() = author_id);
drop policy if exists posts_insert_own on public.posts;
create policy posts_insert_own on public.posts for insert with check (auth.uid() = author_id);
drop policy if exists posts_update_own on public.posts;
create policy posts_update_own on public.posts for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
drop policy if exists posts_delete_own on public.posts;
create policy posts_delete_own on public.posts for delete using (auth.uid() = author_id);

-- advices: base SELECT sadece sahibi; herkese açık okuma advices_public view'ından
drop policy if exists advices_select_own on public.advices;
create policy advices_select_own on public.advices for select using (auth.uid() = author_id);
drop policy if exists advices_insert_own on public.advices;
create policy advices_insert_own on public.advices for insert with check (auth.uid() = author_id);
drop policy if exists advices_update_own on public.advices;
create policy advices_update_own on public.advices for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
drop policy if exists advices_delete_own on public.advices;
create policy advices_delete_own on public.advices for delete using (auth.uid() = author_id);

-- me_too: sadece kendi satırını görür/ekler/siler (kimin "ben de" dediği gizli kalır)
drop policy if exists me_too_select_own on public.me_too;
create policy me_too_select_own on public.me_too for select using (auth.uid() = user_id);
drop policy if exists me_too_insert_own on public.me_too;
create policy me_too_insert_own on public.me_too for insert with check (auth.uid() = user_id);
drop policy if exists me_too_delete_own on public.me_too;
create policy me_too_delete_own on public.me_too for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
--  Herkese açık, anonimlik-maskeleyen view'lar
--  (security_invoker = off -> tanımlayıcı yetkisiyle çalışır, base RLS'i bypass eder.
--   Kasıtlı: sadece maskeli projeksiyonu ifşa ederiz.)
-- ------------------------------------------------------------
create or replace view public.posts_public
with (security_invoker = off) as
select
  p.id, p.title, p.body, p.category, p.tags, p.is_sensitive,
  p.status, p.solved_advice_id, p.me_too_count, p.advice_count,
  p.search_vector, p.created_at, p.updated_at, p.is_anonymous,
  case when p.is_anonymous then null else p.author_id end        as author_id,
  case when p.is_anonymous then null else pr.username end          as author_username,
  case when p.is_anonymous then null else pr.display_name end      as author_display_name,
  case when p.is_anonymous then null else pr.avatar_url end        as author_avatar_url,
  (p.author_id = auth.uid())                                       as is_mine
from public.posts p
join public.profiles pr on pr.id = p.author_id;

create or replace view public.advices_public
with (security_invoker = off) as
select
  a.id, a.post_id, a.body, a.is_helpful, a.created_at, a.is_anonymous,
  case when a.is_anonymous then null else a.author_id end     as author_id,
  case when a.is_anonymous then null else pr.username end       as author_username,
  case when a.is_anonymous then null else pr.display_name end   as author_display_name,
  case when a.is_anonymous then null else pr.avatar_url end     as author_avatar_url,
  (a.author_id = auth.uid())                                   as is_mine
from public.advices a
join public.profiles pr on pr.id = a.author_id;

grant select on public.posts_public   to anon, authenticated;
grant select on public.advices_public to anon, authenticated;
grant execute on function public.cozum_toggle(uuid, uuid) to authenticated;

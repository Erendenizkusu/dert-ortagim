-- ============================================================
--  dert ortağım — moderasyon & güvenli alan katmanı
--  0001_init.sql'den SONRA çalıştırın (idempotent).
-- ============================================================

-- ------------------------------------------------------------
--  Şema eklemeleri
-- ------------------------------------------------------------

-- Moderatör rolü
alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user','moderator'));

-- Yumuşak kaldırma (soft-hide) alanları — içerik silinmez, gizlenir
alter table public.posts   add column if not exists is_hidden     boolean not null default false;
alter table public.posts   add column if not exists hidden_at     timestamptz;
alter table public.posts   add column if not exists hidden_reason text;
alter table public.advices add column if not exists is_hidden     boolean not null default false;
alter table public.advices add column if not exists hidden_at     timestamptz;
alter table public.advices add column if not exists hidden_reason text;

-- Raporlar (polimorfik hedef: post | advice)
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post','advice')),
  target_id   uuid not null,
  reason      text not null check (reason in
                ('spam','taciz','siddet','cinsel','kendine_zarar','alakasiz','diger')),
  note        text check (char_length(note) <= 1000),
  status      text not null default 'open'
                check (status in ('open','reviewed','dismissed','actioned')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  unique (reporter_id, target_type, target_id)   -- kişi başı hedef başına tek rapor
);
create index if not exists reports_status_idx on public.reports (status, created_at desc);
create index if not exists reports_target_idx on public.reports (target_type, target_id);

-- ------------------------------------------------------------
--  Moderatör kontrolü (SECURITY DEFINER -> policy içinde özyineleme yok)
-- ------------------------------------------------------------
create or replace function public.is_moderator(uid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'moderator'
  );
$$;

-- ------------------------------------------------------------
--  Rapor gönderme (giriş yapmış herkes) — hedef doğrulanır
-- ------------------------------------------------------------
create or replace function public.submit_report(
  p_target_type text, p_target_id uuid, p_reason text, p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Giriş gerekli'; end if;
  if p_target_type not in ('post','advice') then raise exception 'Geçersiz hedef'; end if;
  if p_reason not in ('spam','taciz','siddet','cinsel','kendine_zarar','alakasiz','diger')
    then raise exception 'Geçersiz sebep'; end if;

  if p_target_type = 'post'
     and not exists (select 1 from public.posts where id = p_target_id)
     then raise exception 'Gönderi bulunamadı'; end if;
  if p_target_type = 'advice'
     and not exists (select 1 from public.advices where id = p_target_id)
     then raise exception 'Tavsiye bulunamadı'; end if;

  insert into public.reports (reporter_id, target_type, target_id, reason, note)
  values (auth.uid(), p_target_type, p_target_id, p_reason, nullif(trim(p_note), ''))
  on conflict (reporter_id, target_type, target_id)
    do update set reason = excluded.reason,
                  note   = excluded.note,
                  status = 'open',
                  created_at = now();
end; $$;

-- ------------------------------------------------------------
--  Moderatör: açık raporları içerik önizlemesiyle listele
-- ------------------------------------------------------------
create or replace function public.mod_list_reports()
returns jsonb language plpgsql security definer stable set search_path = public as $$
declare result jsonb;
begin
  if not public.is_moderator(auth.uid()) then raise exception 'Yetkisiz işlem'; end if;

  select coalesce(jsonb_agg(to_jsonb(t) order by t.created_at asc), '[]'::jsonb)
    into result
  from (
    select
      r.id, r.target_type, r.target_id, r.reason, r.note, r.created_at,
      coalesce(p.title, '')             as title,
      coalesce(p.body, a.body)          as body,
      coalesce(p.is_hidden, a.is_hidden) as is_hidden,
      p.category                        as category,
      coalesce(a.post_id, p.id)         as link_id,
      (select count(*) from public.reports r2
        where r2.target_type = r.target_type
          and r2.target_id   = r.target_id
          and r2.status = 'open')        as report_count
    from public.reports r
    left join public.posts   p on r.target_type = 'post'   and p.id = r.target_id
    left join public.advices a on r.target_type = 'advice' and a.id = r.target_id
    where r.status = 'open'
  ) t;

  return result;
end; $$;

-- ------------------------------------------------------------
--  Moderatör aksiyonu: gizle / göster / yoksay
-- ------------------------------------------------------------
create or replace function public.mod_action(p_report_id uuid, p_action text)
returns void language plpgsql security definer set search_path = public as $$
declare r public.reports;
begin
  if not public.is_moderator(auth.uid()) then raise exception 'Yetkisiz işlem'; end if;

  select * into r from public.reports where id = p_report_id;
  if r.id is null then raise exception 'Rapor bulunamadı'; end if;

  if p_action = 'hide' then
    if r.target_type = 'post' then
      update public.posts
        set is_hidden = true, hidden_at = now(), hidden_reason = r.reason
        where id = r.target_id;
    else
      update public.advices
        set is_hidden = true, hidden_at = now(), hidden_reason = r.reason
        where id = r.target_id;
    end if;
    update public.reports
      set status = 'actioned', resolved_at = now(), resolved_by = auth.uid()
      where target_type = r.target_type and target_id = r.target_id and status = 'open';

  elsif p_action = 'unhide' then
    if r.target_type = 'post' then
      update public.posts
        set is_hidden = false, hidden_at = null, hidden_reason = null
        where id = r.target_id;
    else
      update public.advices
        set is_hidden = false, hidden_at = null, hidden_reason = null
        where id = r.target_id;
    end if;
    update public.reports
      set status = 'reviewed', resolved_at = now(), resolved_by = auth.uid()
      where target_type = r.target_type and target_id = r.target_id and status = 'open';

  elsif p_action = 'dismiss' then
    update public.reports
      set status = 'dismissed', resolved_at = now(), resolved_by = auth.uid()
      where id = p_report_id;

  else
    raise exception 'Geçersiz işlem';
  end if;
end; $$;

-- ------------------------------------------------------------
--  RLS: reports
--  Yazma yalnız SECURITY DEFINER RPC'lerle. Okuma: sahibi + moderatör.
-- ------------------------------------------------------------
alter table public.reports enable row level security;

drop policy if exists reports_select_own_or_mod on public.reports;
create policy reports_select_own_or_mod on public.reports for select
  using (auth.uid() = reporter_id or public.is_moderator(auth.uid()));

-- ------------------------------------------------------------
--  Herkese açık view'lar: gizli içeriği ELE
--  (kolon kümesi 0001 ile birebir aynı; yalnız WHERE eklenir)
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
join public.profiles pr on pr.id = p.author_id
where p.is_hidden = false;

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
join public.profiles pr on pr.id = a.author_id
where a.is_hidden = false;

grant select on public.posts_public   to anon, authenticated;
grant select on public.advices_public to anon, authenticated;

-- ------------------------------------------------------------
--  Grant'ler
-- ------------------------------------------------------------
grant execute on function public.is_moderator(uuid)               to anon, authenticated;
grant execute on function public.submit_report(text, uuid, text, text) to authenticated;
grant execute on function public.mod_list_reports()              to authenticated;
grant execute on function public.mod_action(uuid, text)          to authenticated;

-- ------------------------------------------------------------
--  Kurucu moderatör: Eren (giriş yapmış olması gerekir; yapılmadıysa no-op)
-- ------------------------------------------------------------
update public.profiles set role = 'moderator'
where id in (
  select id from auth.users where email = 'denizkusueren61@gmail.com'
);

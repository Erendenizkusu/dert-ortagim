-- ============================================================
--  dertdaş — profil düzenleme + moderatör istatistikleri
--  Supabase SQL Editor'da bu dosyanın tamamını çalıştırın.
-- ============================================================

-- ------------------------------------------------------------
--  1) Kullanıcı adı değişim takibi
-- ------------------------------------------------------------
alter table public.profiles
  add column if not exists username_changed_at timestamptz;

-- ------------------------------------------------------------
--  2) Profil güncelleme kuralları (trigger)
--     display_name / bio / username güncellemelerini doğrular.
--     username: sanitize + benzersizlik + 30 günde bir sınır.
--     Yalnız DEĞİŞEN alan doğrulanır -> rol güncellemesi gibi
--     ilgisiz update'ler etkilenmez.
-- ------------------------------------------------------------
create or replace function public.enforce_profile_update()
returns trigger
language plpgsql
as $$
begin
  -- Görünen ad
  if new.display_name is distinct from old.display_name then
    new.display_name := trim(new.display_name);
    if char_length(new.display_name) < 1 or char_length(new.display_name) > 40 then
      raise exception 'Görünen ad 1-40 karakter olmalı';
    end if;
  end if;

  -- Hakkında (bio)
  if new.bio is distinct from old.bio then
    new.bio := nullif(trim(coalesce(new.bio, '')), '');
    if new.bio is not null and char_length(new.bio) > 300 then
      raise exception 'Hakkında en fazla 300 karakter olabilir';
    end if;
  end if;

  -- Kullanıcı adı: her zaman temizle (küçük harf, harf/rakam/alt çizgi)
  if new.username is not null then
    new.username := lower(regexp_replace(new.username, '[^a-zA-Z0-9_]', '', 'g'));
  end if;

  if new.username is distinct from old.username then
    if char_length(new.username) < 3 or char_length(new.username) > 20 then
      raise exception 'Kullanıcı adı 3-20 karakter olmalı (harf, rakam, alt çizgi)';
    end if;
    if old.username_changed_at is not null
       and now() - old.username_changed_at < interval '30 days' then
      raise exception 'Kullanıcı adını 30 günde bir değiştirebilirsin (son değişim: %)',
        to_char(old.username_changed_at, 'DD.MM.YYYY');
    end if;
    if exists (
      select 1 from public.profiles
      where username = new.username and id <> new.id
    ) then
      raise exception 'Bu kullanıcı adı zaten alınmış';
    end if;
    new.username_changed_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_enforce_update on public.profiles;
create trigger profiles_enforce_update
  before update on public.profiles
  for each row execute function public.enforce_profile_update();

-- ------------------------------------------------------------
--  3) Moderatör istatistikleri (SECURITY DEFINER)
--     Ham sayılar döner; oranlar UI'da hesaplanır (sıfıra bölme yok).
-- ------------------------------------------------------------
create or replace function public.mod_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_moderator(auth.uid()) then
    raise exception 'Yetkisiz işlem';
  end if;

  select jsonb_build_object(
    'users_total',   (select count(*) from public.profiles),
    'users_new_7d',  (select count(*) from public.profiles
                        where created_at >= now() - interval '7 days'),
    'posts_total',   (select count(*) from public.posts),
    'posts_today',   (select count(*) from public.posts
                        where created_at >= date_trunc('day', now())),
    'advices_total', (select count(*) from public.advices),
    'advices_today', (select count(*) from public.advices
                        where created_at >= date_trunc('day', now())),
    'open_posts',    (select count(*) from public.posts where status = 'open'),
    'solved_posts',  (select count(*) from public.posts where status = 'solved'),
    'unanswered_total', (select count(*) from public.posts where advice_count = 0),
    'unanswered_over_24h', (select count(*) from public.posts
                        where advice_count = 0
                          and created_at < now() - interval '24 hours'),
    'avg_hours_to_first_advice', (
      select round(avg(extract(epoch from (fa.first_at - p.created_at)) / 3600.0)::numeric, 1)
      from public.posts p
      join (
        select post_id, min(created_at) as first_at
        from public.advices group by post_id
      ) fa on fa.post_id = p.id
    ),
    'reports_open',  (select count(*) from public.reports where status = 'open'),
    'reports_total', (select count(*) from public.reports),
    'hidden_total',  (
      (select count(*) from public.posts   where is_hidden) +
      (select count(*) from public.advices where is_hidden)
    )
  ) into result;

  return result;
end;
$$;

grant execute on function public.mod_stats() to authenticated;

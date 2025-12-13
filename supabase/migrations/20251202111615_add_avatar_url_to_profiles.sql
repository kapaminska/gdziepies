-- =====================================================================
-- migration:    add_avatar_url_to_profiles
-- filename:     20251202111615_add_avatar_url_to_profiles.sql
-- purpose:      dodanie kolumny avatar_url do tabeli profiles
--               oraz aktualizacja widoku profiles_public
-- =====================================================================

-- Dodanie kolumny avatar_url do tabeli profiles
alter table public.profiles
add column if not exists avatar_url text;

comment on column public.profiles.avatar_url is
  'URL do zdjęcia profilowego użytkownika przechowywanego w Supabase Storage (bucket avatars).';

-- Aktualizacja widoku profiles_public, aby zawierał avatar_url
drop view if exists public.profiles_public;

create view public.profiles_public as
select
  id,
  username,
  avatar_url,
  created_at
from public.profiles;

comment on view public.profiles_public is
  'publiczny widok profili użytkowników eksponujący bezpieczne kolumny (bez phone_number).';

-- zwykłe uprawnienia (grant) na widok – rls jest egzekwowane na tabeli bazowej
grant select on public.profiles_public to anon, authenticated;





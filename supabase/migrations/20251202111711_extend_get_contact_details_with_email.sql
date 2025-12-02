-- =====================================================================
-- migration:    extend_get_contact_details_with_email
-- filename:     20251202111711_extend_get_contact_details_with_email.sql
-- purpose:      rozszerzenie funkcji get_contact_details o zwracanie emaila
-- =====================================================================

-- Usunięcie starej funkcji (nie można zmienić typu zwracanego przez CREATE OR REPLACE)
drop function if exists public.get_contact_details(uuid);

-- Utworzenie nowej funkcji z rozszerzonym typem zwracanym (phone_number + email)
-- Kolumny mogą być NULL, więc używamy explicit null handling
create function public.get_contact_details(p_announcement_id uuid)
returns table (phone_number text, email text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'authenticated' then
    -- brak uprawnień dla niezalogowanych
    return;
  end if;

  return query
  select 
    p.phone_number::text,
    au.email::text
  from public.announcements a
  join public.profiles p on p.id = a.author_id
  join auth.users au on au.id = p.id
  where a.id = p_announcement_id;
end;
$$;


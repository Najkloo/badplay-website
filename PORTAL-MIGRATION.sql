-- BADPLAY Portal v2: bezpieczna funkcja zmiany ról.
-- Uruchom w Supabase SQL Editor jako właściciel projektu.
-- Wymaga istniejącej tabeli public.profiles i funkcji public.is_admin() z AUTH-SETUP.md.

create or replace function public.admin_set_profile_role(target_user_id uuid, new_role text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Brak uprawnień administratora.' using errcode = '42501';
  end if;

  if new_role not in ('user', 'admin') then
    raise exception 'Nieprawidłowa rola.' using errcode = '22023';
  end if;

  -- Ochrona przed przypadkowym odebraniem sobie jedynego dostępu administratora.
  if target_user_id = auth.uid() and new_role <> 'admin' then
    raise exception 'Nie można odebrać roli administratora samemu sobie.' using errcode = '42501';
  end if;

  update public.profiles
     set role = new_role,
         updated_at = now()
   where id = target_user_id;

  if not found then
    raise exception 'Nie znaleziono profilu.' using errcode = 'P0002';
  end if;
  return true;
end;
$$;

revoke all on function public.admin_set_profile_role(uuid, text) from public, anon;
grant execute on function public.admin_set_profile_role(uuid, text) to authenticated;

-- Profile created_at is already available for registration counts. No public write access is added.

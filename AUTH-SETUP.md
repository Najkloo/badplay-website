# BADPLAY — konfiguracja kont (GitHub Pages + Supabase)

Strona BADPLAY jest hostowana statycznie na GitHub Pages. Do prawdziwej rejestracji/logowania potrzebuje zewnętrznego dostawcy auth i bazy danych. Ta implementacja używa Supabase Auth + Postgres i nie przechowuje haseł w kodzie strony.

## 1. Utwórz projekt Supabase
1. Utwórz projekt w https://supabase.com/.
2. W panelu projektu otwórz **Project Settings → API** (lub **Connect**).
3. Skopiuj Project URL oraz klucz `anon`/`publishable`.
4. W pliku `supabase-config.js` wklej je do `SUPABASE_URL` oraz `SUPABASE_ANON_KEY`.
5. Nie umieszczaj w tym pliku klucza `service_role`/sekretnego klucza. Nie jest potrzebny w przeglądarce.

## 2. Utwórz tabele i zasady bezpieczeństwa
Otwórz **SQL Editor** w Supabase i uruchom poniższy skrypt w całości:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  minecraft_username text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint minecraft_username_format check (minecraft_username is null or minecraft_username ~ '^[A-Za-z0-9_]{3,16}$')
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (minecraft_username) on public.profiles to authenticated;

 create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Users can read own profile or admins read all" on public.profiles;
create policy "Users can read own profile or admins read all"
on public.profiles for select to authenticated
using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own Minecraft username" on public.profiles;
create policy "Users can update own Minecraft username"
on public.profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, minecraft_username, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'minecraft_name', ''),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Włączenie kontroli RLS na profilu nie daje zwykłym użytkownikom możliwości zmiany roli.
-- Kolumna role nie ma uprawnienia UPDATE dla roli authenticated.
```

## 3. Ustaw przekierowania i e-mail
W **Authentication → URL Configuration** ustaw:
- Site URL: `https://badplay.pl`
- Redirect URLs: `https://badplay.pl/konto.html` oraz adres testowy, jeśli używasz innej domeny.

W Authentication → Providers → Email możesz zostawić potwierdzanie e-maili włączone (zalecane). Dostosuj szablon e-maila w panelu Supabase.

## 4. Nadaj rolę administratora
1. Najpierw zarejestruj konto administratora przez `https://badplay.pl/konto.html` i potwierdź e-mail.
2. W Supabase → SQL Editor uruchom poniższe zapytanie, podmieniając adres na swój dokładny e-mail:

```sql
update public.profiles
set role = 'admin'
where email = 'TWÓJ_ADRES_EMAIL';
```

To jest operacja wykonywana w zaufanym panelu Supabase, a nie na stronie publicznej. **Nigdy nie dodawaj formularza, który pozwala użytkownikowi samemu ustawiać `role`.**

## 5. Opublikuj stronę
Wgraj nowe pliki do głównego katalogu repozytorium GitHub Pages. `konto.html` to strona konta, `konto.js` obsługuje UI, `konto.css` wygląd, a `supabase-config.js` konfigurację publicznego klucza.

## Co już działa po konfiguracji
- rejestracja i logowanie e-mailem/hasłem,
- potwierdzenie e-maila (jeśli włączone w Supabase),
- reset hasła,
- sesja logowania i wylogowanie,
- edycja nicku Minecraft,
- wspólny panel użytkownika i panel administratora zależny od roli z bazy.

## Ważne ograniczenia pierwszego etapu
- Bez uzupełnienia `supabase-config.js` rejestracja jest celowo wyłączona.
- Sekcja administratora jest na razie szkieletem interfejsu. Nie ma jeszcze integracji Plan Analytics ani narzędzi do zarządzania użytkownikami.
- Każdy moduł administracyjny, który będzie czytał lub zmieniał dane, musi mieć autoryzację po stronie bazy/backendu (RLS / Edge Function). Samo ukrycie elementu w HTML nie jest zabezpieczeniem.
- Połączenie konta z nickiem Minecraft na tym etapie jest deklaratywne. Prawdziwe potwierdzenie własności nicku wymaga dodatkowej weryfikacji, np. kodu jednorazowego w grze.

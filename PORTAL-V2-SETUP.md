# BADPLAY Portal v2 — wdrożenie

## Co zawiera
- rozbudowany panel zwykłego użytkownika: stan profilu, staż konta, wpisany nick Minecraft, ostatnie informacje i karty przyszłych integracji;
- panel administratora z listą profili, wyszukiwaniem, liczbą kont, liczbą administratorów, nowymi kontami z ostatnich 30 dni, wykresem rejestracji z 14 dni oraz rozkładem ról;
- zmianę roli z interfejsu przez funkcję RPC, która ponownie sprawdza rolę administratora po stronie bazy;
- karty integracji Minecraft/Plan/Discord/ekonomia jasno oznaczone jako niepodłączone — bez wymyślonych danych.

## Wdrożenie
1. Zrób kopię repozytorium/aktualnej strony.
2. Wgraj z tego archiwum pliki `konto.html`, `konto.js`, `konto.css`, `PORTAL-MIGRATION.sql` i `PORTAL-V2-SETUP.md` do głównego katalogu repozytorium. Pozostałe pliki witryny pozostaw bez zmian.
3. W Supabase → SQL Editor uruchom cały `PORTAL-MIGRATION.sql`.
4. Zaczekaj na publikację GitHub Pages i otwórz `https://badplay.pl/konto.html`, następnie wykonaj Ctrl+F5.
5. Zaloguj się kontem admina. Panel pobierze listę `profiles` (do 1000 ostatnich profili) oraz statystyki z `created_at`.

## Co jest prawdziwymi danymi
- profil, rola, nick i data rejestracji pochodzą z `public.profiles`;
- liczby rejestracji i wykres bazują na `created_at` z tej tabeli;
- zmiana roli działa tylko po wykonaniu migracji SQL i tylko dla zalogowanego administratora.

## Czego ta wersja celowo nie udaje
- czas gry, TPS, gracze online, historia sesji Minecraft, saldo ekonomii, kary i Discord nie są dostępne bez integracji serwerowej;
- karty tych integracji są oznaczone jako oczekujące i nie wyświetlają fikcyjnych statystyk;
- nick Minecraft pozostaje deklaratywny — własność konta trzeba zweryfikować pluginem/kodem jednorazowym;
- statystyki Plan wymagają bezpiecznego backendu/proxy lub Edge Function. Nie umieszczaj sekretów Plan ani `service_role` w JavaScript przeglądarki.

## Bezpieczeństwo
- nie udostępniaj kluczy `sb_secret_` / `service_role`;
- zmiana ról nie jest wykonywana bezpośrednio z klienta, lecz przez RPC `admin_set_profile_role`, która weryfikuje `public.is_admin()`;
- przy większej liczbie kont warto dodać paginację i audyt administracyjny przed udostępnieniem szerokich funkcji moderacyjnych.

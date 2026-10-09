# BADPLAY Portal v3 — wdrożenie

## Zawartość
- pełnoszeroki, responsywny panel;
- przyklejony pasek po zalogowaniu: e-mail, UUID konta, kopiowanie UUID, skróty do sekcji i wylogowanie;
- dodatkowe statystyki profilu: status potwierdzenia e-maila i data aktualizacji;
- statystyki administratora z rzeczywistych danych `public.profiles`: konta, administratorzy, nowe profile z 7/30 dni, profile z wpisanym nickiem, aktualizacje z 30 dni, wykres rejestracji i wykres aktywności profili z 14 dni;
- karty integracji, które nie udają, że serwer jest już podłączony.

## Wdrożenie
1. Zachowaj kopię obecnego repozytorium.
2. Wgraj z ZIP-a `konto.html`, `konto.js`, `konto.css`, `PORTAL-V3-SETUP.md` i `INTEGRACJA-SERWERA.md`. Zostaw pozostałe pliki witryny i `supabase-config.js` bez zmian.
3. Nie trzeba uruchamiać nowej migracji SQL tylko dla nowego wyglądu/wykresów; nadal potrzebna jest wcześniejsza migracja `PORTAL-MIGRATION.sql`, jeśli używasz zarządzania rolami z panelu.
4. Po wdrożeniu GitHub Pages otwórz `https://badplay.pl/konto.html` i wykonaj Ctrl+F5.
5. Zaloguj się jako admin i sprawdź pasek konta, kopiowanie UUID, odświeżanie, wykresy oraz tabelę użytkowników.

## Źródła danych
- Profil, rola, nick, utworzenie i aktualizacja profilu: Supabase `public.profiles`.
- Potwierdzenie e-maila: Supabase Auth.
- Wykres aktywności: data utworzenia/aktualizacji profili, nie aktywność Minecraft.
- Gracze online, TPS/MSPT, uptime, czas gry, saldo i kary: wymagają integracji serwerowej opisanej w `INTEGRACJA-SERWERA.md`.

## Bezpieczeństwo
Nigdy nie umieszczaj `sb_secret_`, `service_role`, tokenu integracji ani hasła do bazy w plikach frontendowych lub publicznym repozytorium. Wartości prywatne przechowuj po stronie backendu/Edge Functions lub w konfiguracji pluginu na hostingu.

# BADPLAY Portal — plan podłączenia statystyk Minecraft

Ta strona jest hostowana statycznie (GitHub Pages). Przeglądarka nie może bezpiecznie przechowywać sekretów serwera, tokenu integracji ani klucza Supabase `sb_secret_` / `service_role`. Dane serwera muszą przechodzić przez kontrolowany backend.

## Co zmienia wersja Portal v3

- panel rozciąga się na szerokość ekranu i dopasowuje do telefonu;
- po zalogowaniu pojawia się przyklejony pasek nawigacji z e-mailem, UUID konta, kopiowaniem UUID, skrótami do sekcji i wylogowaniem;
- panel konta pokazuje status potwierdzenia e-maila, datę ostatniej aktualizacji i podstawowe dane profilu;
- administrator dostaje dodatkowe liczniki i wykres aktywności profili na podstawie `public.profiles`;
- statystyki Minecraft nadal są jawnie oznaczone jako niepodłączone — nie pokazujemy fikcyjnych wartości.

## Docelowa architektura

```text
BADPLAY.PL (GitHub Pages)
  └─ Supabase Auth: sesja użytkownika
       ├─ public.profiles (RLS: użytkownik widzi swój profil; admin może listę)
       └─ Supabase Edge Functions (backend HTTPS)
            ├─ odczyt statystyk po uwierzytelnieniu użytkownika/admina
            └─ endpoint ingest dla serwera, chroniony osobnym sekretem
                  ↑ HTTPS POST
              BADPLAYBridge (własny plugin Paper/Leaf i/lub Velocity)
                  ├─ stan serwera: online, liczba graczy, TPS/MSPT, uptime
                  ├─ powiązanie UUID Minecraft ↔ konto portalu po kodzie jednorazowym
                  ├─ ekonomia: wyłącznie integracja z API konkretnego pluginu
                  └─ kary: wyłącznie integracja z API LiteBans
```

## Etap 1 — Plan Analytics

1. Zainstaluj aktualny plugin Plan na backendach Minecraft (np. Earth i Lobby), a przy sieci Velocity skonfiguruj go zgodnie z oficjalną instrukcją Plan dla sieci/proxy.
2. Uruchom serwery i sprawdź, czy Plan zbiera dane oraz czy jego własny panel WWW jest dostępny tylko dla uprawnionych administratorów.
3. Użyj dokumentacji API Plan, by określić dane, które mają trafić do portalu. Nie zakładaj, że publiczny endpoint HTTP istnieje ani nie wystawiaj panelu Plan otwarcie bez ochrony.
4. Docelowo odczyt danych Plan wykonuje backend/plugin, nie `konto.js` w przeglądarce. API Plan udostępnia m.in. Query API i DataExtension API; szczegóły zależą od wersji.

Oficjalne materiały:
- Plan: https://github.com/plan-player-analytics/Plan
- Plan API v5: https://github.com/plan-player-analytics/Plan/wiki/APIv5
- Konfiguracja sieci Plan: https://github.com/plan-player-analytics/Plan/wiki

## Etap 2 — kanał serwer → portal

Rekomendowany wariant to plugin BADPLAYBridge wysyłający co 30–60 sekund mały snapshot przez HTTPS do Supabase Edge Function. Funkcja weryfikuje osobny sekret ingest, waliduje pola i zapisuje dane do tabeli przeznaczonej na statystyki. Sekret trafia tylko do pliku konfiguracyjnego pluginu na hostingu i do secrets Edge Function; nigdy do GitHuba ani do JS strony.

Przykładowe pola snapshotu:
- `server_id`: `lobby` lub `earth`;
- `captured_at`: czas UTC;
- `online_players`, `max_players`;
- `tps_1m` / `mspt_avg` (jeśli dany silnik udostępnia wiarygodne wartości);
- `uptime_seconds`;
- opcjonalnie zagregowane statystyki dzienne.

Endpoint powinien odrzucać nieprawidłowe dane, ograniczać częstotliwość żądań i logować błędy. Nie zapisuj tokenów graczy, haseł ani danych wrażliwych.

## Etap 3 — prywatne statystyki gracza

- Nie uznajemy wpisanego nicku za dowód własności konta.
- Użytkownik klika „Połącz Minecraft”, backend generuje krótki kod jednorazowy, a gracz potwierdza go komendą w grze, np. `/badplay link ABC123`.
- Plugin sprawdza kod i przesyła UUID Minecraft; backend łączy UUID z `auth.uid()` użytkownika.
- Dopiero po zweryfikowaniu UUID można pokazywać temu użytkownikowi prywatne statystyki: czas gry, ostatnie wejście, sesje i statystyki z Plan.

## Etap 4 — ekonomia i kary

- ExcellentEconomy: pobieranie salda przez oficjalne API pluginu/bezpieczny moduł integracyjny; nigdy przez bezpośrednie wystawienie bazy ekonomii do WWW.
- LiteBans: odczyt kar przez jego udokumentowane API/bazę po stronie serwera; nie dawaj przeglądarce połączenia do bazy LiteBans.
- Lands: opcjonalnie kraj/państwo i nazwa działki, dopiero po sprawdzeniu API/placeholders i zasad prywatności.
- Discord: osobny OAuth/bot, jeśli chcesz łączyć konto portalu z Discordem.

## Etap 5 — dostęp i bezpieczeństwo

- Dane ogólne sieci mogą być publiczne, ale statystyki indywidualne tylko dla właściciela konta i uprawnionego administratora.
- Endpointy admina muszą sprawdzać rolę po stronie Edge Function/bazy, a nie tylko ukrywać sekcję HTML.
- `sb_publishable_` jest przeznaczony do przeglądarki przy prawidłowych politykach RLS. `sb_secret_` i `service_role` pozostają wyłącznie po stronie serwera.
- Włącz HTTPS, limity żądań, logowanie błędów i retencję danych. Zbieraj tylko statystyki, których rzeczywiście potrzebujesz.

## Następny krok techniczny

Najpierw potwierdzamy wersję Plan i instalujemy go zgodnie z dokumentacją sieci. Następnie przygotowujemy jeden mały pionowy wycinek: status Earth/Lobby + liczba graczy online → Edge Function → karta „Stan sieci” w portalu. Dopiero po przetestowaniu tego przepływu dodajemy TPS, uptime, czas gry, ekonomię i kary.

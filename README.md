# BADPLAY — strona GitHub Pages

Statyczna strona BADPLAY.PL (HTML/CSS/JS) hostowana na GitHub Pages.

## Publikacja strony
1. Wgraj zawartość folderu do głównego katalogu repozytorium.
2. GitHub → Settings → Pages → Deploy from a branch → `main` → `/(root)`.
3. Domena `badplay.pl` jest skonfigurowana w pliku `CNAME`.

## Konta użytkowników
Dodano stronę `konto.html` z rejestracją, logowaniem, resetem hasła, profilem i panelem zależnym od roli. Do działania wymaga projektu Supabase. Pełna instrukcja wraz ze skryptem SQL i bezpiecznym przypisaniem administratora znajduje się w **[AUTH-SETUP.md](./AUTH-SETUP.md)**.

Przed konfiguracją Supabase formularze pozostają wyłączone. Nie umieszczaj w repozytorium klucza `service_role` ani innych sekretów backendu.

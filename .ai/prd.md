# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu

Aplikacja 10xCards to webowy system do tworzenia i zarządzania fiszkami edukacyjnymi. System umożliwia automatyczne generowanie fiszek przez LLM na podstawie wprowadzonego tekstu, a także ręczne ich tworzenie. Użytkownik ma dostęp do pełnego zestawu operacji CRUD (przeglądanie, edycja, usuwanie), a fiszki są grupowane według dokumentu źródłowego. Projekt integruje otwarty algorytm powtórek, co pozwala na efektywne zarządzanie sesjami nauki opartej na metodzie spaced repetition. System posiada również mechanizmy monitorowania statystyk oraz obsługi błędów komunikacji z API.

Aplikacja oferuje hierarchiczną strukturę organizacji danych: Tematy → Dokumenty → Fiszki, gdzie każdy temat może zawierać wiele dokumentów, a każdy dokument wiele fiszek. Taka struktura pozwala na efektywne zarządzanie i kategoryzowanie materiałów edukacyjnych.

## 2. Problem użytkownika

Głównym problemem, z jakim borykają się użytkownicy, jest czasochłonność ręcznego tworzenia wysokiej jakości fiszek edukacyjnych. Proces ten jest żmudny i wymaga dużego wysiłku, co zniechęca do wykorzystywania efektywnych metod nauki, takich jak spaced repetition. Dodatkowo, użytkownicy potrzebują efektywnego sposobu organizowania swoich materiałów edukacyjnych w logiczne kategorie i grupy.

## 3. Wymagania funkcjonalne

1. Automatyczne generowanie fiszek:
   - System ma wykorzystywać LLM do dynamicznego generowania fiszek na podstawie wprowadzonego tekstu.
   - Liczba generowanych fiszek zależy od długości tekstu i identyfikacji kluczowych informacji.
   - Fiszka składa się z dwóch sekcji: przodu i tyłu, a treść jest tekstowa.

2. Manualne tworzenie fiszek:
   - Użytkownik ma możliwość ręcznego tworzenia fiszek poprzez wyskakujące okno (modal).

3. Operacje CRUD na fiszkach:
   - Możliwość przeglądania, edycji oraz usuwania fiszek, niezależnie od sposobu ich utworzenia.
   - Podczas edycji system porównuje procentową zmianę treści – próg 50% decyduje o klasyfikacji fiszki jako oryginalnej (AI) lub zmodyfikowanej ręcznie.

4. System kont użytkowników:
   - Rejestracja, logowanie, zmiana hasła (z potwierdzeniem) oraz opcja usunięcia konta.
   - Każdy użytkownik przechowuje swoje fiszki, które są prywatne i powiązane z kontem.

5. Hierarchiczna organizacja treści:
   - System pozwala na tworzenie i zarządzanie tematami, które grupują dokumenty.
   - Możliwość przeglądania, tworzenia, edycji i usuwania tematów.
   - Każdy temat może zawierać wiele dokumentów, a dokumenty mogą być przesuwane między tematami.
   - Tematy mogą mieć strukturę hierarchiczną (tematy nadrzędne i podrzędne).

6. Zarządzanie dokumentami:
   - Możliwość tworzenia, edycji, przeglądania i usuwania dokumentów.
   - Dokumenty zawierają tekst, który jest podstawą do generowania fiszek.
   - Dokumenty są przypisane do tematów i służą jako źródło dla fiszek.
   - Usunięcie dokumentu powoduje usunięcie wszystkich powiązanych z nim fiszek.

7. Grupowanie fiszek według dokumentu źródłowego:
   - Fiszki są przypisywane do odpowiednich grup tematycznych na podstawie dokumentu źródłowego.
   - Rejestrowane są daty utworzenia oraz informacja, czy fiszka została wygenerowana przez AI czy stworzona/zmodyfikowana ręcznie.

8. Integracja z algorytmem powtórek:
   - System integruje otwarty algorytm powtórek, który automatycznie obsługuje sesje nauki zgodnie z metodą spaced repetition.

9. Monitorowanie i statystyki:
   - System zbiera statystyki dotyczące liczby fiszek generowanych przez AI, akceptacji przez użytkownika oraz udziału modyfikowanych fiszek.

10. Mechanizmy ponownego generowania fiszek:
    - Użytkownik ma możliwość ponownego wysłania tekstu do generowania fiszek. Fiszki odrzucone przez użytkownika nie wliczają się do kryteriów sukcesu.

11. Obsługa błędów:
    - System musi wyświetlać czytelne komunikaty w przypadku błędów komunikacji z API oraz umożliwiać ponowne wysłanie tekstu.

12. Zarządzanie cyklem życia fiszek:
    - Fiszki generowane przez AI (source="ai") są usuwane poprzez soft delete (oznaczenie jako nieaktywne).
    - Fiszki tworzone ręcznie (source="manual") są usuwane poprzez hard delete (całkowite usunięcie z bazy danych).
    - System automatycznie zarządza powiązaniami między fiszkami, dokumentami i tematami, zachowując integralność danych.

## 4. Granice produktu

1. Nie wchodzi w zakres MVP:
   - Własny, zaawansowany algorytm powtórek (np. SuperMemo, Anki)
   - Import różnych formatów plików (PDF, DOCX, itp.)
   - Współdzielenie zestawów fiszek między użytkownikami
   - Integracje z innymi platformami edukacyjnymi
   - Aplikacje mobilne – na początek dostępny jest tylko interfejs webowy

## 5. Historyjki użytkowników

### US-001: Rejestracja i logowanie
- Tytuł: Rejestracja i logowanie użytkownika
- Opis: Użytkownik ma możliwość rejestracji za pomocą email/login i hasła. System umożliwia logowanie, zmianę hasła z mechanizmem weryfikacji (np. przez email) oraz usunięcie konta po potwierdzeniu.
- Kryteria akceptacji:
  1. Użytkownik może utworzyć konto i otrzymać email weryfikacyjny.
  2. Użytkownik loguje się za pomocą poprawnych danych.
  3. Użytkownik może zmienić hasło i usunąć konto po potwierdzeniu.

### US-002: Automatyczne generowanie fiszek z tekstu
- Tytuł: Automatyczne generowanie fiszek przy użyciu AI
- Opis: Po wprowadzeniu tekstu, system korzysta z LLM do wygenerowania dynamicznej listy fiszek. Liczba fiszek jest ustalana w zależności od długości tekstu i zidentyfikowanych kluczowych informacji.
- Kryteria akceptacji:
  1. Po przesłaniu tekstu system generuje fiszki z podziałem na przód i tył.
  2. Użytkownik widzi informacje o pochodzeniu fiszki (AI).
  3. System umożliwia zaakceptowanie lub odrzucenie wygenerowanych fiszek.

### US-003: Przeglądanie wygenerowanych fiszek
- Tytuł: Przeglądanie fiszek
- Opis: Użytkownik może przeglądać wszystkie fiszki, zarówno te wygenerowane przez AI, jak i stworzone ręcznie.
- Kryteria akceptacji:
  1. System prezentuje listę wszystkich fiszek powiązanych z kontem użytkownika.
  2. Możliwe jest filtrowanie fiszek według źródła (AI, manualnie) oraz daty utworzenia.

### US-004: Edycja fiszki
- Tytuł: Edycja i modyfikacja fiszek
- Opis: Użytkownik ma możliwość edycji treści fiszki. Po edycji system porównuje procentową zmianę treści, aby określić, czy modyfikacja przekracza próg 50%.
- Kryteria akceptacji:
  1. Po edycji system wylicza procentową zmianę treści fiszki.
  2. Jeśli zmiana przekracza 50%, fiszka jest oznaczona jako zmodyfikowana ręcznie, a oryginał pozostaje jako odrzucony.
  3. Użytkownik otrzymuje odpowiednie powiadomienie o wyniku edycji.

### US-005: Usuwanie fiszki
- Tytuł: Usuwanie fiszki
- Opis: Użytkownik może usunąć wybraną fiszkę, która nie jest już potrzebna.
- Kryteria akceptacji:
  1. Po potwierdzeniu, fiszka jest trwale usuwana z systemu.
  2. Fiszka nie pojawia się już na liście przeglądanych fiszek.

### US-006: Ręczne tworzenie fiszki
- Tytuł: Ręczne tworzenie fiszki przy użyciu modala
- Opis: Użytkownik może ręcznie utworzyć nową fiszkę poprzez modal, wprowadzając osobno treść przodu i tyłu.
- Kryteria akceptacji:
  1. Modal umożliwia wprowadzenie i walidację treści.
  2. Po zatwierdzeniu fiszka zostaje zapisana i widoczna w systemie.

### US-007: Monitorowanie statystyk fiszek
- Tytuł: Wyświetlanie statystyk fiszek
- Opis: System gromadzi dane o liczbie fiszek generowanych przez AI, liczbie zaakceptowanych fiszek oraz proporcji fiszek zmodyfikowanych ręcznie.
- Kryteria akceptacji:
  1. Użytkownik ma dostęp do panelu statystyk.
  2. Panel wyświetla procent akceptacji, liczbę fiszek oraz daty utworzenia.

### US-008: Ponowne wysyłanie tekstu do generowania fiszek
- Tytuł: Re-generacja fiszek
- Opis: Użytkownik może ponownie przesłać tekst w celu wygenerowania nowego zestawu fiszek. Fiszki odrzucone nie są wliczane do kryteriów sukcesu.
- Kryteria akceptacji:
  1. Po przesłaniu tekstu system generuje nowy zestaw fiszek bez usuwania poprzednich odrzuconych.
  2. Użytkownik otrzymuje informację o nowej liczbie wygenerowanych fiszek.

### US-009: Grupowanie fiszek według źródła tekstu
- Tytuł: Grupowanie fiszek na podstawie dokumentu źródłowego
- Opis: System automatycznie grupuje fiszki według dokumentu, z którego pochodzi wprowadzony tekst. Dla każdej grupy rejestrowana jest data utworzenia oraz źródło (AI lub modyfikacja ręczna).
- Kryteria akceptacji:
  1. Fiszki generowane z jednego dokumentu są przypisane do tej samej grupy.
  2. Użytkownik może przeglądać fiszki według grup tematycznych.

### US-010: Obsługa błędów komunikacji z API
- Tytuł: Zarządzanie błędami podczas generowania fiszek
- Opis: W przypadku problemów z komunikacją z API generującym fiszki, system wyświetla czytelne komunikaty i umożliwia ponowne wysłanie tekstu.
- Kryteria akceptacji:
  1. W sytuacji awarii API użytkownik otrzymuje komunikat o błędzie.
  2. System umożliwia ponowne wysłanie tekstu do generacji fiszek.

### US-011: Tworzenie i zarządzanie tematami
- Tytuł: Tworzenie i zarządzanie hierarchią tematów
- Opis: Użytkownik może tworzyć, przeglądać, edytować i usuwać tematy, które służą do grupowania dokumentów. Tematy mogą mieć strukturę hierarchiczną (tematy nadrzędne i podrzędne).
- Kryteria akceptacji:
  1. Użytkownik może utworzyć nowy temat podając jego nazwę i opcjonalny opis.
  2. Tematy mogą być tworzone jako nadrzędne lub podrzędne względem innych tematów.
  3. Użytkownik może przeglądać listę wszystkich swoich tematów.
  4. Użytkownik może edytować nazwę i opis istniejącego tematu.
  5. Użytkownik może usunąć temat, o ile nie zawiera on żadnych dokumentów ani podrzędnych tematów.

### US-012: Przeglądanie tematów
- Tytuł: Przeglądanie listy tematów i ich szczegółów
- Opis: Użytkownik ma dostęp do listy wszystkich swoich tematów z możliwością filtrowania i sortowania. Może również przejść do szczegółów tematu, aby zobaczyć zawarte w nim dokumenty.
- Kryteria akceptacji:
  1. System wyświetla listę tematów z informacjami o liczbie dokumentów i dacie utworzenia.
  2. Użytkownik może filtrować tematy według różnych kryteriów.
  3. System wyświetla szczegóły wybranego tematu wraz z listą zawartych w nim dokumentów.

### US-013: Tworzenie dokumentu
- Tytuł: Tworzenie nowego dokumentu w temacie
- Opis: Użytkownik może utworzyć nowy dokument w wybranym temacie, podając jego nazwę i treść. Po utworzeniu dokumentu system automatycznie inicjuje proces generowania fiszek przez AI.
- Kryteria akceptacji:
  1. Użytkownik może utworzyć nowy dokument w wybranym temacie.
  2. System waliduje poprawność wprowadzonych danych (niepusta nazwa, odpowiednia długość treści).
  3. Po utworzeniu dokumentu system automatycznie rozpoczyna generowanie fiszek.
  4. Użytkownik jest przekierowany do widoku zatwierdzania wygenerowanych fiszek.

### US-014: Edycja dokumentu
- Tytuł: Edycja istniejącego dokumentu
- Opis: Użytkownik może edytować nazwę i treść istniejącego dokumentu. Po edycji treści system oferuje możliwość ponownego wygenerowania fiszek, z ostrzeżeniem o konsekwencjach.
- Kryteria akceptacji:
  1. Użytkownik może edytować nazwę i treść dokumentu.
  2. System waliduje poprawność wprowadzonych danych.
  3. Po edycji treści system wyświetla monit o możliwości ponownego wygenerowania fiszek.
  4. Jeśli użytkownik zdecyduje się na ponowne generowanie fiszek, system oznacza poprzednie fiszki jako nieaktywne i generuje nowe.

### US-015: Przeglądanie dokumentów
- Tytuł: Przeglądanie listy dokumentów i ich szczegółów
- Opis: Użytkownik może przeglądać listę wszystkich dokumentów w temacie oraz szczegóły wybranego dokumentu, w tym powiązane z nim fiszki.
- Kryteria akceptacji:
  1. System wyświetla listę dokumentów w temacie z informacjami o dacie utworzenia i liczbie fiszek.
  2. Użytkownik może filtrować i sortować dokumenty.
  3. System wyświetla szczegóły wybranego dokumentu wraz z listą powiązanych fiszek.
  4. Użytkownik ma dostęp do akcji zarządzania dokumentem (edycja, usunięcie) oraz fiszkkami (dodanie, edycja, usunięcie).

### US-016: Usuwanie dokumentu
- Tytuł: Usuwanie dokumentu i powiązanych fiszek
- Opis: Użytkownik może usunąć wybrany dokument, co powoduje również usunięcie wszystkich powiązanych z nim fiszek. System wyświetla ostrzeżenie przed wykonaniem tej operacji.
- Kryteria akceptacji:
  1. System wyświetla monit z ostrzeżeniem przed usunięciem dokumentu i powiązanych fiszek.
  2. Po potwierdzeniu, dokument i wszystkie powiązane fiszki są usuwane z systemu.
  3. Użytkownik otrzymuje potwierdzenie pomyślnego usunięcia.

### US-017: Zatwierdzanie fiszek
- Tytuł: Zatwierdzanie fiszek do dokumentu
- Opis: Użytkownik może zatwierdzić jedną, wiele lub wszystkie fiszki dokumentu jednocześnie, co znacznie przyspiesza proces akceptacji.
- Kryteria akceptacji:
  1. System umożliwia zaznaczenie wielu fiszek i zatwierdzenie ich jednym kliknięciem.
  2. Istnieje opcja "Zatwierdź wszystkie" dla fiszek powiązanych z dokumentem.
  3. System wyświetla podsumowanie liczby zatwierdzonych fiszek.
  4. Zatwierdzenie wszystkich fiszek powoduje powrót do widoku document detail.

### US-018: Zarządzanie zależnościami między tematami
- Tytuł: Zachowanie integralności danych podczas zarządzania tematami
- Opis: System zapobiega usunięciu tematów, które zawierają dokumenty lub podtematy, wymagając od użytkownika opróżnienia tematu przed jego usunięciem.
- Kryteria akceptacji:
  1. Próba usunięcia tematu zawierającego dokumenty lub podtematy kończy się wyświetleniem komunikatu o błędzie.
  2. System informuje użytkownika o dokładnej liczbie dokumentów i podtematów, które blokują usunięcie.
  3. Po opróżnieniu tematu (przeniesieniu lub usunięciu wszystkich dokumentów i podtematów) temat można usunąć.

## 6. Metryki sukcesu

1. 75% fiszek generowanych przez AI musi być zaakceptowanych przez użytkowników.
2. Co najmniej 75% wszystkich fiszek w systemie powinno pochodzić z automatycznego generowania przez AI.
3. Precyzyjna ocena modyfikacji fiszek – zmiana poniżej 50% oznacza fiszkę pozostającą w wersji AI, powyżej 50% skutkuje uznaniem fiszki jako ręcznie modyfikowanej.
4. Niska liczba błędów komunikacji z API oraz wysoka skuteczność ponownych prób generowania fiszek.
5. Utrzymanie wysokiej jakości interfejsu użytkownika z pełną funkcjonalnością operacji CRUD.
6. Efektywna organizacja treści poprzez strukturę tematów i dokumentów – średnio co najmniej 3 dokumenty na temat i 10 fiszek na dokument.
7. Wysoka skuteczność nawigacji w hierarchicznej strukturze danych – średni czas potrzebny na znalezienie konkretnej fiszki nie powinien przekraczać 30 sekund. 
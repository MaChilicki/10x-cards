# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu

Aplikacja 10xCards to webowy system do tworzenia i zarządzania fiszkami edukacyjnymi. System umożliwia automatyczne generowanie fiszek przez LLM na podstawie wprowadzonego tekstu, a także ręczne ich tworzenie. Użytkownik ma dostęp do pełnego zestawu operacji CRUD (przeglądanie, edycja, usuwanie), a fiszki są grupowane według dokumentu źródłowego. Projekt integruje otwarty algorytm powtórek, co pozwala na efektywne zarządzanie sesjami nauki opartej na metodzie spaced repetition. System posiada również mechanizmy monitorowania statystyk oraz obsługi błędów komunikacji z API.

## 2. Problem użytkownika

Głównym problemem, z jakim borykają się użytkownicy, jest czasochłonność ręcznego tworzenia wysokiej jakości fiszek edukacyjnych. Proces ten jest żmudny i wymaga dużego wysiłku, co zniechęca do wykorzystywania efektywnych metod nauki, takich jak spaced repetition.

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

5. Grupowanie fiszek według dokumentu źródłowego:
   - Fiszki są przypisywane do odpowiednich grup tematycznych na podstawie dokumentu źródłowego.
   - Rejestrowane są daty utworzenia oraz informacja, czy fiszka została wygenerowana przez AI czy stworzona/zmodyfikowana ręcznie.

6. Integracja z algorytmem powtórek:
   - System integruje otwarty algorytm powtórek, który automatycznie obsługuje sesje nauki zgodnie z metodą spaced repetition.

7. Monitorowanie i statystyki:
   - System zbiera statystyki dotyczące liczby fiszek generowanych przez AI, akceptacji przez użytkownika oraz udziału modyfikowanych fiszek.

8. Mechanizmy ponownego generowania fiszek:
   - Użytkownik ma możliwość ponownego wysłania tekstu do generowania fiszek. Fiszki odrzucone przez użytkownika nie wliczają się do kryteriów sukcesu.

9. Obsługa błędów:
   - System musi wyświetlać czytelne komunikaty w przypadku błędów komunikacji z API oraz umożliwiać ponowne wysłanie tekstu.

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

## 6. Metryki sukcesu

1. 75% fiszek generowanych przez AI musi być zaakceptowanych przez użytkowników.
2. Co najmniej 75% wszystkich fiszek w systemie powinno pochodzić z automatycznego generowania przez AI.
3. Precyzyjna ocena modyfikacji fiszek – zmiana poniżej 50% oznacza fiszkę pozostającą w wersji AI, powyżej 50% skutkuje uznaniem fiszki jako ręcznie modyfikowanej.
4. Niska liczba błędów komunikacji z API oraz wysoka skuteczność ponownych prób generowania fiszek.
5. Utrzymanie wysokiej jakości interfejsu użytkownika z pełną funkcjonalnością operacji CRUD. 
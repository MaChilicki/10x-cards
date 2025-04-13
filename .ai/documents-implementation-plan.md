# API Endpoint Implementation Plan: Documents API Endpoints

## 1. Przegląd punktu końcowego
Endpointy dotyczą operacji CRUD na dokumentach. Umożliwiają:
- Pobranie listy dokumentów (/api/documents) z opcjonalnymi parametrami filtracji i paginacji.
- Utworzenie nowego dokumentu (/api/documents) za pomocą danych w ciele żądania.
- Pobranie szczegółów pojedynczego dokumentu (/api/documents/{id}).
- Aktualizację istniejącego dokumentu (/api/documents/{id}).
- Usunięcie dokumentu (/api/documents/{id}).

Dodatkowo, po pomyślnym dodaniu dokumentu, system automatycznie inicjuje generowanie fiszek przez AI, wykorzystując endpoint POST /api/flashcards/ai-generate, który otrzymuje tekst dokumentu oraz (opcjonalnie) identyfikatory powiązanych encji (np. topic_id).

## 2. Szczegóły żądania

- **GET /api/documents**
  - Metoda HTTP: GET
  - Struktura URL: /api/documents
  - Parametry zapytania:
    - Wymagane: 
      - `page` (number)
      - `limit` (number)
      - `sort` (string)
    - Opcjonalne:
      - `name` (string, służy do filtrowania po nazwie dokumentu)
  - Request Body: Brak

- **POST /api/documents**
  - Metoda HTTP: POST
  - Struktura URL: /api/documents
  - Request Body:
    - Wymagane: 
      - `name` (string)
      - `content` (string, od 1000 do 10 000 znaków)

- **GET /api/documents/{id}**
  - Metoda HTTP: GET
  - Struktura URL: /api/documents/{id}
  - Parametry:
    - Wymagany: 
      - `id` (string) – identyfikator dokumentu
  - Request Body: Brak

- **PUT /api/documents/{id}**
  - Metoda HTTP: PUT
  - Struktura URL: /api/documents/{id}
  - Parametry:
    - Wymagany: 
      - `id` (string)
  - Request Body:
    - Wymagane:
      - `name` (string)
      - `content` (string, od 1000 do 10 000 znaków)

- **DELETE /api/documents/{id}**
  - Metoda HTTP: DELETE
  - Struktura URL: /api/documents/{id}
  - Parametry:
    - Wymagany: 
      - `id` (string)
  - Request Body: Brak

## 3. Wykorzystywane typy

Z pliku `src/types.ts`:
- `DocumentDto`: reprezentuje pojedynczy rekord dokumentu.
- `DocumentCreateDto`: struktura wykorzystywana podczas tworzenia dokumentu.
- `DocumentUpdateDto`: struktura wykorzystywana podczas aktualizacji dokumentu.
- `DocumentsListResponseDto`: struktura odpowiedzi na żądanie listy dokumentów, zawierająca pola `documents` oraz `total`.

Dla operacji generowania fiszek wykorzystamy typy zdefiniowane dla AI:
- `FlashcardAiGenerateDto` – dane wejściowe dla generacji fiszek przez AI.
- `FlashcardAiResponse` – struktura odpowiedzi z wygenerowanymi fiszkami.

## 4. Szczegóły odpowiedzi

- **GET /api/documents**
  - Status: 200 OK
  - Payload:
    ```json
    {
      "documents": [
        {
          "id": "string",
          "user_id": "string",
          "name": "string",
          "content": "string",
          "created_at": "ISODate string",
          "updated_at": "ISODate string"
        }
      ],
      "total": number
    }
    ```

- **POST /api/documents**
  - Status: 201 Created
  - Payload:
    ```json
    {
      "id": "string",
      "user_id": "string",
      "name": "string",
      "content": "string",
      "created_at": "ISODate string",
      "updated_at": "ISODate string"
    }
    ```

- **GET /api/documents/{id}**
  - Status: 200 OK
  - Payload: szczegóły dokumentu (jak wyżej)

- **PUT /api/documents/{id}**
  - Status: 200 OK
  - Payload: zaktualizowany dokument (identyczna struktura jak dla POST)

- **DELETE /api/documents/{id}**
  - Status: 200 OK
  - Payload:
    ```json
    { "message": "Document deleted successfully" }
    ```

## 5. Przepływ danych

1. Klient wysyła żądanie HTTP do odpowiedniego endpointu.
2. Warstwa API (np. Astro API Route) odbiera żądanie i wykonuje następujące kroki:
   - Walidacja danych wejściowych z wykorzystaniem schematów zod.
   - Autoryzacja: sprawdzanie tokenu JWT (w Module II; obecnie dostęp bez zabezpieczeń) oraz zastosowanie RLS.
   - Przekazanie żądania do warstwy serwisowej (np. `documentsService`), która interaguje z bazą danych przez Supabase client.
   - Wykonanie operacji CRUD i zwrócenie odpowiedzi.
   - Wywołanie `POST /flashcards/ai-generate` odbywa się asynchronicznie poprzez kolejkę zadań.
   - Przed usunięciem dokumentu system usuwa wszystkie powiązane z nim fiszki (flashcards.document_id = :id), a następnie usuwa sam dokument

## 6. Względy bezpieczeństwa

- Autoryzacja z wykorzystaniem JWT (w Module II) oraz nagłówka `Authorization: Bearer <token>`.
- Supabase RLS zapewnia, że użytkownik ma dostęp tylko do swoich dokumentów.
- Walidacja danych wejściowych, aby zapobiec atakom typu SQL Injection i innym nadużyciom.
- Upewnienie się, że tylko poprawnie sformatowane dane są przekazywane do bazy danych.
- Asynchroniczne zadania generowania fiszek powinny być izolowane i zabezpieczone przed wielokrotnym uruchomieniem (idempotencja), a błędy modelu AI nie mogą wpływać na zakończenie głównej operacji zapisu dokumentu.
- Dla wywołania asynchronicznego endpointu `POST /flashcards/ai-generate` ustawiany jest timeout wynoszący 60 sekund. 
- W przypadku przekroczenia tego limitu zadanie jest uznawane za nieudane i może zostać ponownie przetworzone zgodnie z logiką retry w kolejce.


## 7. Obsługa błędów

- **400 Bad Request**: Błędne lub niekompletne dane wejściowe (np. brak pola `name` lub `content` w POST/PUT).
- **401 Unauthorized**: Brak ważnego tokenu lub próba dostępu do zasobów innego użytkownika.
- **404 Not Found**: Dokument o podanym `id` nie istnieje.
- **500 Internal Server Error**: Niespodziewane błędy po stronie serwera.
- **502 Bad Gateway**: Problem z modelem AI podczas generowania fiszek (np. timeout, błędna odpowiedź). Błąd może zostać zapisany do osobnego logu lub retriowany przez mechanizm kolejki.
- Logowanie wszystkich błędów za pomocą centralnego mechanizmu logowania (ewentualnie zapis do dedykowanej tabeli logów w bazie danych).

## 8. Rozważania dotyczące wydajności

- Wdrożenie paginacji w endpointzie GET /api/documents, aby ograniczyć ilość przetwarzanych danych.
- Wykorzystanie indeksów w bazie danych na polach `user_id` i `name` w celu szybszego sortowania i filtrowania.
- Optymalizacja zapytań do bazy danych poprzez selektywne pobieranie tylko niezbędnych pól.
- Rozważenie cache'owania wyników dla operacji o dużej częstotliwości odczytu.

## 9. Etapy wdrożenia

1. **Definicja schematów walidacyjnych**:
   - Utworzenie schematów zod dla `DocumentCreateDto` i `DocumentUpdateDto`.

2. **Implementacja warstwy kontrolera**:
   - Utworzenie plików API w `/src/pages/api/documents/` dla operacji GET i POST.
   - Utworzenie plików API w `/src/pages/api/documents/[id].ts` dla operacji GET/{id}, PUT i DELETE.

3. **Implementacja warstwy serwisowej**:
   - Utworzenie modułu `documentsService` w `/src/lib/services/`, odpowiedzialnego za interakcję z bazą danych przez Supabase client.

4. **Integracja z bazą danych**:
   - Konfiguracja Supabase client z uwzględnieniem RLS dostępu do dokumentów.

5. **Implementacja walidacji i obsługi błędów**:
   - Dodanie walidacji danych wejściowych oraz centralnego mechanizmu obsługi błędów z odpowiednimi kodami statusu.

6. **Testowanie jednostkowe i integracyjne**:
   - Przygotowanie testów dla każdego endpointu (GET, POST, GET/{id}, PUT, DELETE).
   - Test: usunięcie dokumentu skutkuje usunięciem powiązanych fiszek (GET /flashcards z document_id zwraca pustą listę po DELETE).

7. **Review kodu oraz optymalizacja**:
   - Przegląd implementacji przez zespół i wprowadzenie poprawek.

8. **Dokumentacja i wdrożenie**:
   - Uaktualnienie dokumentacji API oraz wdrożenie zmian na środowisku staging, a następnie produkcyjnym. 
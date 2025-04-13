/* Plan wdrożenia endpointów AI-Generated Flashcards */

# API Endpoint Implementation Plan: AI-Generated Flashcards

## 1. Przegląd punktu końcowego
Celem endpointów jest automatyczne generowanie fiszek na podstawie przekazanego tekstu za pomocą zewnętrznego modelu AI. System obsługuje dwa endpointy:
- **POST /api/flashcards/ai-generate** – generacja fiszek na podstawie podanego tekstu.
- **POST /api/flashcards/ai-regenerate** – ponowna generacja fiszek w przypadku odrzucenia poprzednich wyników.

Oba endpointy mają służyć do przetwarzania tekstu wejściowego, komunikacji z systemem AI oraz zwracania wygenerowanych danych fiszek w zunifikowanej strukturze.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:**
  - `/api/flashcards/ai-generate` dla pierwszej generacji
  - `/api/flashcards/ai-regenerate` dla ponownej generacji
- **Parametry (Request Body):**
  - `text` (string, wymagany) – tekst wejściowy do generacji fiszek
    - *Walidacja:* Użycie zod do sprawdzenia, czy długość tekstu mieści się w przedziale 1000-10000 znaków
  - `document_id` (string, opcjonalny) – identyfikator dokumentu powiązanego z tekstem
  - `topic_id` (string, opcjonalny) – identyfikator tematu powiązanego z tekstem

## 3. Wykorzystywane typy
- **FlashcardAiGenerateDto:** Typ reprezentujący dane wejściowe dla generacji fiszek.
- **FlashcardAiResponse:** Typ odpowiedzi zawierający tablicę wygenerowanych fiszek.
- **FlashcardProposalDto:** Tymczasowy typ reprezentujący pojedynczą propozycję fiszki przed zapisem do bazy.

## 4. Szczegóły odpowiedzi
- **Status 201 Created:** W przypadku pomyślnej generacji żądania.
- **Struktura odpowiedzi:**
  ```json
  {
    "flashcards": [
      {
        "id": "string",
        "user_id": "string",
        "document_id": "string lub null",
        "topic_id": "string lub null",
        "front_original": "string",
        "back_original": "string",
        "front_modified": "string lub null",
        "back_modified": "string lub null",
        "is_ai_generated": true,
        "is_manually_created": false,
        "is_modified": false,
        "modification_percentage": 0,
        "is_disabled": false,
        "spaced_repetition_data": {},
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ]
  }
  ```
- **Błędy:**
  - 400 Bad Request – nieprawidłowe lub niekompletne dane wejściowe
  - 401 Unauthorized – nieautoryzowany dostęp (w przyszłych modułach po wdrożeniu autoryzacji)
  - 500 Internal Server Error / 502 Bad Gateway – błędy po stronie serwera lub komunikacji z modelem AI (błędy komunikacji będą logowane)

## 5. Przepływ danych
1. Klient wysyła żądanie POST z danymi wejściowymi do odpowiedniego endpointu.
2. Warstwa API waliduje dane wejściowe za pomocą bibliotek typu zod, w tym sprawdzenie, czy długość pola `text` mieści się w zakresie 1000-10000 znaków.
3. Po udanej walidacji dane są przekazywane do warstwy serwisowej (np. `ai-generate.service` lub `ai-generate-flashcards.service`), która:
   - Komunikuje się z zewnętrznym API modelu AI w celu wygenerowania fiszek.
   - Przetwarza odpowiedź z modelu AI, dokonując ewentualnej filtracji lub transformacji danych.
   - *Odpowiedzi są zgodne z:* **FlashcardAiResponse** (zawierającym tablicę typu **FlashcardProposalDto**).
4. Ostatecznie, serwis zwraca przetworzone dane fiszek, które są wysyłane jako odpowiedź do klienta.
   - *Uwaga:* Endpoint nie zapisuje propozycji fiszek do bazy – propozycje (FlashcardProposalDto) pozostają tymczasowe i nie są automatycznie zapisywane ani w tabeli `documents`, ani `flashcards`.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Aktualnie bez JWT; w Module II wprowadzić autoryzację z użyciem Supabase Auth i nagłówka `Authorization: Bearer <token>`.
- **Walidacja:** Użycie schematów zod do walidacji danych wejściowych, aby upewnić się o poprawności typu i długości tekstu.
- **Sanityzacja danych wejściowych:** Aby chronić przed SQL Injection i innymi atakami.
- **Rate Limiting:** Implementacja mechanizmów ograniczających liczbę żądań do endpointu, aby zapobiegać nadużyciom.

## 7. Obsługa błędów
- **400 Bad Request:** Zwracane, gdy dane wejściowe są niekompletne lub niezgodne z oczekiwaniami (np. brak pola `text`).
- **401 Unauthorized:** Zwracane, gdy próba dostępu nastąpi bez odpowiednich danych autoryzacyjnych (przy wdrożeniu autoryzacji w Module II).
- **500 Internal Server Error / 502 Bad Gateway:** Zwracane w przypadku błędów po stronie serwera lub problemów z integracją z zewnętrznym API AI. Dodatkowe logowanie błędów komunikacji będzie realizowane w middleware.

## 8. Rozważania dotyczące wydajności
- **Caching:** Wprowadzenie mechanizmów cache'owania wyników dla zbliżonych zapytań, aby zmniejszyć obciążenie modelu AI.
- **Rate Limiting:** Ograniczenie liczby zapytań do API, aby zabezpieczyć system przed przeciążeniem.
- **Asynchroniczność:** Rozważenie asynchronicznego przetwarzania żądań, zwłaszcza w scenariuszach, gdzie API modelu AI może mieć dłuższy czas odpowiedzi (timeout do 60 sekund).
- **Optymalizacja komunikacji:** Użycie odpowiednich timeoutów i retries w komunikacji z zewnętrznym API.

## 9. Etapy wdrożenia
1. **Definicja schematów walidacyjnych:**
   - Utworzenie schematów z użyciem zod dla `FlashcardAiGenerateDto`, w tym walidacja długości pola `text` (1000-10000 znaków).
2. **Implementacja endpointów:**
   - Utworzenie endpointu POST `/api/flashcards/ai-generate` z implementacją logiki walidacji oraz przekazania danych do serwisu.
   - Utworzenie endpointu POST `/api/flashcards/ai-regenerate` z podobną logiką, umożliwiającej ponowną generację fiszek.
4. **Implementacja warstwy serwisowej:**
   - Wyodrębnienie logiki generacji fiszek do dedykowanego serwisu o nazwie **ai-generate.service** (ewentualnie **ai-generate-flashcards.service** dla większej przejrzystości).
   - Implementacja integracji z zewnętrznym API modelu AI (konfiguracja timeoutów, retry, obsługa błędów API).
   - Na tym etapie skorzystamy z mocków zamiast wywoływania serwisu AI.
5. **Dodanie mechanizmu uwierzytelniania przez Supabase Auth**
    - na tym etapie zastosuj domyślnego uytkownika z supabase.client.ts
6. **Implementacja logiki endpointu**
    - wykorzystanie utworzonego serwisu do obsługi endpointu.
    - wykorzystanie middleware do komunikacji z bazą
5. **Middleware i logowanie błędów:**
   - Dodanie logowania akcji i  błędów, w tym błędów komunikacji z zewnętrznym API AI.


/* Koniec planu wdrożenia endpointów AI-Generated Flashcards */ 
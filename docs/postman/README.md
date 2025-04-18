# Kolekcja Postman dla API 10xCards

## Instalacja

1. Zainstaluj [Postman](https://www.postman.com/downloads/)
2. Zaimportuj kolekcję `flashcards-api.postman_collection.json`
3. Zaimportuj środowisko `10xcards-local.postman_environment.json`

## Konfiguracja

1. W Postman wybierz zaimportowane środowisko "10xCards - Local"
2. Zaktualizuj zmienne środowiskowe według potrzeb:
   - `baseUrl` - adres lokalnego serwera (domyślnie: http://localhost:3000)
   - `flashcard_id` - ID testowej fiszki
   - `topic_id` - ID testowego tematu
   - `document_id` - ID testowego dokumentu

## Dostępne endpointy

### Fiszki (Flashcards)

- `GET /api/flashcards` - Lista fiszek z filtrowaniem i paginacją
- `POST /api/flashcards` - Tworzenie nowych fiszek
- `GET /api/flashcards/{id}` - Pobranie pojedynczej fiszki
- `PUT /api/flashcards/{id}` - Aktualizacja fiszki
- `PATCH /api/flashcards/{id}/approve` - Zatwierdzenie pojedynczej fiszki
- `PATCH /api/flashcards/approve-bulk` - Zatwierdzenie wielu fiszek
- `PATCH /api/flashcards/approve-by-document` - Zatwierdzenie wszystkich fiszek dla dokumentu
- `DELETE /api/flashcards/{id}` - Usunięcie fiszki

## Przykłady użycia

1. **Pobranie listy fiszek**
   - Użyj requestu "Get Flashcards List"
   - Możesz modyfikować parametry query:
     - `page` - numer strony
     - `limit` - liczba elementów na stronę
     - `topic_id` - filtrowanie po temacie
     - `document_id` - filtrowanie po dokumencie
     - `source` - filtrowanie po źródle ('ai' lub 'manual')
     - `is_approved` - filtrowanie po statusie zatwierdzenia

2. **Tworzenie fiszki**
   - Użyj requestu "Create Flashcards"
   - Zmodyfikuj body requestu według potrzeb
   - Pamiętaj o ustawieniu prawidłowych wartości dla `topic_id` i `document_id`

3. **Zatwierdzanie fiszek**
   - Możesz zatwierdzać fiszki pojedynczo, grupowo lub dla całego dokumentu
   - Dla zatwierdzania grupowego, zaktualizuj listę `flashcard_ids` w body requestu
   - Dla zatwierdzania po dokumencie, użyj prawidłowego `document_id` 
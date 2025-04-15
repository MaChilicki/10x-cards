# Plan implementacji widoku DocumentEditView

## 1. Przegląd
DocumentEditView to widok umożliwiający tworzenie nowego dokumentu lub edycję istniejącego. Użytkownik może wprowadzić tytuł i treść dokumentu, zapisać zmiany oraz wygenerować fiszki na podstawie wprowadzonego tekstu. Widok obsługuje walidację danych, ostrzega przed utratą niezapisanych zmian oraz informuje o konsekwencjach ponownego generowania fiszek.

## 2. Routing widoku
- `/documents/:id/edit` - edycja istniejącego dokumentu
- `/topics/:id/documents/new` - tworzenie nowego dokumentu w ramach tematu

## 3. Struktura komponentów
```
DocumentEditView
├── Breadcrumbs
├── DocumentEditForm
│   ├── TitleInput
│   ├── ContentTextarea
│   │   └── CharacterCounter
│   └── ValidationMessage
├── SubmitButtonGroup
├── NavigationPrompt (warunkowy)
└── RegenerationWarningDialog (warunkowy)
```

## 4. Szczegóły komponentów
### DocumentEditView
- Opis komponentu: Główny kontener widoku, zarządza stanem dokumentu, pobiera dane istniejącego dokumentu lub inicjalizuje nowy, obsługuje zapisywanie i generowanie fiszek
- Główne elementy: Breadcrumbs, DocumentEditForm, komponenty modalne (NavigationPrompt, RegenerationWarningDialog)
- Obsługiwane interakcje: Inicjalizacja formularza, przekazanie callbacków do formularza
- Obsługiwana walidacja: brak (delegowana do DocumentEditForm)
- Typy: DocumentViewModel, FormContextType
- Propsy: brak (komponent najwyższego poziomu)

### DocumentEditForm
- Opis komponentu: Formularz zawierający pola do wprowadzania tytułu i treści dokumentu
- Główne elementy: TitleInput, ContentTextarea, ValidationMessage, SubmitButtonGroup
- Obsługiwane interakcje: onChange dla inputów, onSubmit dla formularza
- Obsługiwana walidacja: 
  - Tytuł: wymagany, maksymalnie 100 znaków
  - Treść: wymagana, między 1000 a 10000 znaków
- Typy: DocumentFormProps, FormValues
- Propsy: 
  ```typescript
  {
    initialValues: FormValues;
    onSubmit: (values: FormValues) => Promise<void>;
    onCancel: () => void;
    onGenerateFlashcards: () => Promise<void>;
    isSaving: boolean;
    isGenerating: boolean;
    errors: Record<string, string>;
  }
  ```

### TitleInput
- Opis komponentu: Pole tekstowe do wprowadzania tytułu dokumentu
- Główne elementy: Input (z shadcn/ui), Label
- Obsługiwane interakcje: onChange, onBlur
- Obsługiwana walidacja: wymagane, maksymalnie 100 znaków
- Typy: proste (string)
- Propsy: 
  ```typescript
  {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    error?: string;
  }
  ```

### ContentTextarea
- Opis komponentu: Obszar tekstowy do wprowadzania treści dokumentu
- Główne elementy: Textarea (z shadcn/ui), Label, CharacterCounter
- Obsługiwane interakcje: onChange, onBlur
- Obsługiwana walidacja: wymagane, między 1000 a 10000 znaków
- Typy: proste (string)
- Propsy: 
  ```typescript
  {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: () => void;
    error?: string;
  }
  ```

### CharacterCounter
- Opis komponentu: Wyświetla liczbę wprowadzonych znaków oraz informację o limitach
- Główne elementy: Tekst informacyjny
- Obsługiwane interakcje: brak (komponent wyświetlający)
- Obsługiwana walidacja: brak
- Typy: proste (number)
- Propsy: 
  ```typescript
  {
    count: number;
    min: number;
    max: number;
  }
  ```

### SubmitButtonGroup
- Opis komponentu: Grupa przycisków do zapisywania, anulowania i generowania fiszek
- Główne elementy: Button (z shadcn/ui)
- Obsługiwane interakcje: onClick dla każdego przycisku
- Obsługiwana walidacja: brak
- Typy: funkcje callback
- Propsy: 
  ```typescript
  {
    onSave: () => void;
    onCancel: () => void;
    onGenerateFlashcards: () => void;
    isSaving: boolean;
    isGenerating: boolean;
    disableGenerate: boolean;
  }
  ```

### ValidationMessage
- Opis komponentu: Wyświetla komunikaty o błędach walidacji
- Główne elementy: Tekst błędu
- Obsługiwane interakcje: brak (komponent wyświetlający)
- Obsługiwana walidacja: brak
- Typy: proste (string)
- Propsy: 
  ```typescript
  {
    message: string;
  }
  ```

### NavigationPrompt
- Opis komponentu: Dialog wyświetlany przy próbie nawigacji z niezapisanymi zmianami
- Główne elementy: Dialog (z shadcn/ui)
- Obsługiwane interakcje: onConfirm, onCancel
- Obsługiwana walidacja: brak
- Typy: funkcje callback
- Propsy: 
  ```typescript
  {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }
  ```

### RegenerationWarningDialog
- Opis komponentu: Dialog wyświetlany przy próbie ponownego generowania fiszek
- Główne elementy: Dialog (z shadcn/ui)
- Obsługiwane interakcje: onConfirm, onCancel
- Obsługiwana walidacja: brak
- Typy: funkcje callback
- Propsy: 
  ```typescript
  {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }
  ```

## 5. Typy
```typescript
// ViewModel dla dokumentu
interface DocumentViewModel {
  id?: string;
  name: string;
  content: string;
  topic_id?: string;
  isNew: boolean;
  isSaving: boolean;
  isGenerating: boolean;
  errors: Record<string, string>;
}

// Wartości formularza
interface FormValues {
  name: string;
  content: string;
}

// Propsy dla formularza
interface DocumentFormProps {
  initialValues: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
  onGenerateFlashcards: () => Promise<void>;
  isSaving: boolean;
  isGenerating: boolean;
  errors: Record<string, string>;
}

// Kontekst formularza
interface FormContextType {
  values: FormValues;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isDirty: boolean;
}
```

## 6. Zarządzanie stanem
Zarządzanie stanem w DocumentEditView odbywa się za pomocą kilku hooków React:

### useDocumentForm
```typescript
const useDocumentForm = (initialValues: FormValues, onSubmit: (values: FormValues) => Promise<void>) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Metody zarządzania formularzem (handleChange, validate, handleSubmit, reset)
  
  return {
    values,
    errors,
    isDirty,
    isSubmitting,
    handleChange,
    handleSubmit,
    validate,
    reset
  };
};
```

### useDocumentFetch
```typescript
const useDocumentFetch = (id?: string) => {
  const [document, setDocument] = useState<DocumentDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logika pobierania dokumentu

  return {
    document,
    isLoading,
    error,
    fetchDocument
  };
};
```

### useGenerateFlashcards
```typescript
const useGenerateFlashcards = (documentId?: string, content?: string) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Logika generowania fiszek

  return {
    isGenerating,
    error,
    generateFlashcards
  };
};
```

### useNavigationPrompt
```typescript
const useNavigationPrompt = (isDirty: boolean) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  // Logika obsługi promptu nawigacyjnego

  return {
    showPrompt,
    confirmNavigation,
    cancelNavigation,
    handleNavigation
  };
};
```

## 7. Integracja API
DocumentEditView korzysta z dwóch głównych endpointów API:

### 1. Zarządzanie dokumentem
- **Pobieranie dokumentu (edycja)**
  - Endpoint: `GET /api/documents/{id}`
  - Żądanie: brak body
  - Odpowiedź: `DocumentDto`
  - Wywołanie: przy ładowaniu komponentu (jeśli ścieżka zawiera ID dokumentu)

- **Zapisywanie dokumentu**
  - Nowy dokument:
    - Endpoint: `POST /api/documents`
    - Żądanie: `DocumentCreateDto`
    - Odpowiedź: `DocumentDto`
  - Aktualizacja:
    - Endpoint: `PUT /api/documents/{id}`
    - Żądanie: `DocumentUpdateDto`
    - Odpowiedź: `DocumentDto`
  - Wywołanie: po kliknięciu przycisku "Zapisz zmiany" lub przed generowaniem fiszek

### 2. Generowanie fiszek
- Endpoint: `POST /api/flashcards/ai-generate`
- Żądanie: `FlashcardAiGenerateDto`
- Odpowiedź: `FlashcardAiResponse`
- Wywołanie: po kliknięciu przycisku "Generuj fiszki" i potwierdzeniu (jeśli wymagane)

## 8. Interakcje użytkownika
1. **Wprowadzanie tytułu i treści dokumentu**
   - Aktualizacja stanu formularza
   - Aktualizacja licznika znaków dla treści
   - Walidacja w locie

2. **Zapisywanie dokumentu**
   - Kliknięcie przycisku "Zapisz zmiany"
   - Walidacja formularza
   - Wysłanie danych do API
   - Przekierowanie do widoku szczegółów dokumentu po sukcesie

3. **Anulowanie edycji**
   - Kliknięcie przycisku "Anuluj"
   - Wyświetlenie NavigationPrompt jeśli są niezapisane zmiany
   - Przekierowanie do poprzedniego widoku

4. **Generowanie fiszek**
   - Kliknięcie przycisku "Generuj fiszki"
   - Dla istniejącego dokumentu z fiszkami: wyświetlenie RegenerationWarningDialog
   - Zapisanie dokumentu (jeśli nowy lub ma niezapisane zmiany)
   - Wywołanie API generowania fiszek
   - Przekierowanie do FlashcardsApprovalView po sukcesie

5. **Nawigacja z niezapisanymi zmianami**
   - Wyświetlenie NavigationPrompt
   - Kontynuacja nawigacji lub anulowanie

## 9. Warunki i walidacja
### Walidacja formularza
1. **Tytuł dokumentu**
   - Warunek: pole wymagane, maksymalnie 100 znaków
   - Komunikat: "Tytuł jest wymagany" lub "Tytuł nie może przekraczać 100 znaków"
   - Komponent: TitleInput

2. **Treść dokumentu**
   - Warunek: pole wymagane, od 1000 do 10000 znaków
   - Komunikat: "Treść jest wymagana", "Treść musi zawierać co najmniej 1000 znaków" lub "Treść nie może przekraczać 10000 znaków"
   - Komponent: ContentTextarea, CharacterCounter

### Walidacja generowania fiszek
- Warunek: dokument musi być zapisany przed generowaniem fiszek
- Warunek: treść dokumentu musi spełniać wymogi długości (1000-10000 znaków)
- Komunikat: odpowiedni komunikat błędu zależny od warunku
- Komponent: SubmitButtonGroup (przycisk "Generuj fiszki" dezaktywowany jeśli warunki nie są spełnione)

## 10. Obsługa błędów
1. **Błędy pobierania dokumentu**
   - Sytuacja: nie udało się pobrać dokumentu do edycji
   - Obsługa: wyświetlenie komunikatu o błędzie, opcja ponowienia próby lub powrotu

2. **Błędy zapisywania dokumentu**
   - Sytuacja: nie udało się zapisać dokumentu
   - Obsługa: wyświetlenie komunikatu o błędzie, zachowanie formularza w stanie edycji

3. **Błędy walidacji**
   - Sytuacja: dane formularza nie spełniają warunków
   - Obsługa: wyświetlenie komunikatów przy odpowiednich polach

4. **Błędy generowania fiszek**
   - Sytuacja: nie udało się wygenerować fiszek (np. błąd API, timeout)
   - Obsługa: wyświetlenie komunikatu o błędzie, możliwość ponowienia próby

5. **Nieoczekiwane błędy**
   - Sytuacja: inne nieoczekiwane błędy
   - Obsługa: wyświetlenie ogólnego komunikatu o błędzie, możliwość zgłoszenia problemu

## 11. Kroki implementacji
1. **Utworzenie podstawowych typów**
   - Zdefiniowanie interfejsów i typów wymaganych przez komponenty

2. **Implementacja hooków zarządzania stanem**
   - Utworzenie `useDocumentForm`, `useDocumentFetch`, `useGenerateFlashcards`, `useNavigationPrompt`

3. **Implementacja komponentów pomocniczych**
   - Utworzenie `ValidationMessage`, `CharacterCounter`, `NavigationPrompt`, `RegenerationWarningDialog`

4. **Implementacja komponentów formularza**
   - Utworzenie `TitleInput`, `ContentTextarea`, `SubmitButtonGroup`

5. **Implementacja głównego formularza**
   - Utworzenie `DocumentEditForm` integrującego komponenty formularza

6. **Implementacja widoku głównego**
   - Utworzenie `DocumentEditView` integrującego wszystkie komponenty i hooki

7. **Dodanie obsługi routingu**
   - Konfiguracja ścieżek `/documents/:id/edit` i `/topics/:id/documents/new`

8. **Integracja z API**
   - Implementacja obsługi endpointów API dla pobierania, zapisywania dokumentu i generowania fiszek

9. **Implementacja walidacji**
   - Dodanie walidacji formularza, wyświetlanie komunikatów o błędach

10. **Implementacja obsługi błędów**
    - Dodanie mechanizmów obsługi błędów API i nieoczekiwanych sytuacji

11. **Testy i debugowanie**
    - Testowanie różnych ścieżek użytkownika, weryfikacja poprawności działania

12. **Optymalizacja i refaktoryzacja**
    - Analiza wydajności, usunięcie zbędnego kodu, poprawa jakości 
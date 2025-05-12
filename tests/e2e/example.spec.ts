import { test, expect } from "@playwright/test";

// Test dla strony głównej
test.describe("Strona główna", () => {
  test.beforeEach(async ({ page }) => {
    // Nawiguj do strony głównej przed każdym testem
    await page.goto("/");
  });

  test("ma poprawny tytuł", async ({ page }) => {
    // Sprawdź tytuł strony
    await expect(page).toHaveTitle(/10xCards/);
  });

  test("wyświetla logo aplikacji", async ({ page }) => {
    // Sprawdź czy logo jest widoczne
    const logo = page.getByAltText("10xCards Logo");
    await expect(logo).toBeVisible();
  });

  test("nawigacja działa poprawnie", async ({ page }) => {
    // Kliknij link do strony O nas
    await page.getByRole("link", { name: "O nas" }).click();

    // Sprawdź czy URL się zmienił
    await expect(page).toHaveURL(/.*o-nas/);

    // Sprawdź czy zawartość strony O nas jest wyświetlana
    await expect(page.getByRole("heading", { name: "O nas" })).toBeVisible();
  });
});

// Przykład testu dla procesu logowania
test.describe("Proces logowania", () => {
  test("logowanie z poprawnymi danymi", async ({ page }) => {
    // Przejdź do strony logowania
    await page.goto("/login");

    // Wypełnij formularz logowania
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Hasło").fill("test123");

    // Kliknij przycisk logowania
    await page.getByRole("button", { name: "Zaloguj się" }).click();

    // Sprawdź czy po zalogowaniu jesteś przekierowany na dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Sprawdź czy informacja o zalogowaniu jest widoczna
    await expect(page.getByText("Zalogowano pomyślnie")).toBeVisible();
  });

  test("komunikat o błędzie dla niepoprawnych danych", async ({ page }) => {
    // Przejdź do strony logowania
    await page.goto("/login");

    // Wypełnij formularz z nieprawidłowymi danymi
    await page.getByLabel("Email").fill("niepoprawny@example.com");
    await page.getByLabel("Hasło").fill("niepoprawnehaslo");

    // Kliknij przycisk logowania
    await page.getByRole("button", { name: "Zaloguj się" }).click();

    // Sprawdź czy komunikat o błędzie jest wyświetlany
    await expect(page.getByText("Nieprawidłowy email lub hasło")).toBeVisible();
  });
});

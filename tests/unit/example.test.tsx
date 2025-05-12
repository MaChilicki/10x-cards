import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Przykładowy komponent do testowania
interface CounterProps {
  initialCount?: number;
}

const Counter = ({ initialCount = 0 }: CounterProps) => {
  const [count, setCount] = React.useState(initialCount);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount(count + 1)}>Zwiększ</button>
    </div>
  );
};

describe("Counter", () => {
  // Konfigurujemy userEvent przed każdym testem
  let user;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("renderuje początkową wartość 0", () => {
    render(<Counter />);
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("zwiększa licznik po kliknięciu przycisku", async () => {
    render(<Counter />);

    // Kliknięcie przycisku z użyciem userEvent
    await user.click(screen.getByRole("button", { name: /zwiększ/i }));

    // Sprawdzamy czy licznik się zwiększył
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("renderuje początkową wartość przekazaną przez props", () => {
    render(<Counter initialCount={10} />);
    expect(screen.getByTestId("count")).toHaveTextContent("10");
  });

  it("używa mock funkcji dla zewnętrznych zależności", () => {
    // Przykład mockowania zewnętrznej funkcji
    const mockFunction = vi.fn().mockReturnValue(42);

    // Pokazujemy jak użyć mocka
    const result = mockFunction();

    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(result).toBe(42);
  });
});

// Przykład testu dla asynchronicznych funkcji
describe("Asynchroniczne operacje", () => {
  it("obsługuje asynchroniczne operacje", async () => {
    // Mockowanie fetchowania danych
    const mockResponse = { data: "przykładowe dane" };
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    // Funkcja asynchroniczna, którą testujemy
    const fetchData = async () => {
      const response = await fetch("https://example.com/api");
      return await response.json();
    };

    // Wykonanie i asercja
    const result = await fetchData();
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith("https://example.com/api");
  });
});

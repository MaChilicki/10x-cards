import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { DocumentEditForm } from "@/components/document-edit-form";

const mockProps = {
  initialValues: {
    name: "Test Document",
    content: "Test Content",
    topic_id: "test-topic-id"
  },
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  onGenerateFlashcards: vi.fn(),
  isSaving: false,
  isGenerating: false,
  errors: {},
};

describe("DocumentEditForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderuje formularz z pustymi wartościami początkowymi", () => {
    render(<DocumentEditForm {...mockProps} />);

    expect(screen.getByRole("textbox", { name: /tytuł/i })).toHaveValue("Test Document");
    expect(screen.getByRole("textbox", { name: /treść/i })).toHaveValue("Test Content");
  });

  it("wyświetla błędy walidacji przy próbie zapisu pustego formularza", async () => {
    const propsWithErrors = {
      ...mockProps,
      errors: {
        name: "Tytuł jest wymagany",
        content: "Treść jest wymagana",
      },
    };

    render(<DocumentEditForm {...propsWithErrors} />);

    expect(screen.getByText("Tytuł jest wymagany")).toBeInTheDocument();
    expect(screen.getByText("Treść jest wymagana")).toBeInTheDocument();
  });

  it("wywołuje onSubmit z poprawnymi danymi", async () => {
    const user = userEvent.setup();
    render(<DocumentEditForm {...mockProps} />);

    const title = screen.getByRole("textbox", { name: /tytuł/i });
    const content = screen.getByRole("textbox", { name: /treść/i });

    await user.type(title, "Test Title");
    await user.type(content, "A".repeat(1000));

    const submitButton = screen.getByRole("button", { name: /zapisz/i });
    await user.click(submitButton);

    expect(mockProps.onSubmit).toHaveBeenCalledWith({
      name: "Test Title",
      content: "A".repeat(1000),
    });
  });

  it("dezaktywuje przycisk generowania fiszek gdy treść jest za krótka", () => {
    render(<DocumentEditForm {...mockProps} />);

    const generateButton = screen.getByRole("button", { name: /generuj fiszki/i });
    expect(generateButton).toBeDisabled();
  });

  it("wywołuje onCancel po kliknięciu przycisku anuluj", async () => {
    const user = userEvent.setup();
    render(<DocumentEditForm {...mockProps} />);

    const cancelButton = screen.getByRole("button", { name: /anuluj/i });
    await user.click(cancelButton);

    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it("blokuje inputy podczas zapisywania lub generowania", () => {
    render(<DocumentEditForm {...mockProps} isSaving={true} />);

    expect(screen.getByRole("textbox", { name: /tytuł/i })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: /treść/i })).toBeDisabled();
  });

  it("should show validation errors", () => {
    render(
      <DocumentEditForm
        initialValues={{
          name: "",
          content: "",
          topic_id: "test-topic-id"
        }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        onGenerateFlashcards={vi.fn()}
        isSaving={false}
        isGenerating={false}
        errors={{
          name: "Name is required",
          content: "Content is required",
        }}
      />
    );
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Content is required")).toBeInTheDocument();
  });
});

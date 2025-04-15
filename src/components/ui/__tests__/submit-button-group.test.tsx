import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { SubmitButtonGroup } from '../submit-button-group';

describe('SubmitButtonGroup', () => {
  const defaultProps = {
    onSave: vi.fn(),
    onCancel: vi.fn(),
    onGenerateFlashcards: vi.fn(),
    isSaving: false,
    isGenerating: false,
    disableGenerate: false
  };

  it('renderuje wszystkie przyciski', () => {
    render(<SubmitButtonGroup {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /zapisz/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /anuluj/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generuj fiszki/i })).toBeInTheDocument();
  });

  it('wywołuje onSave po kliknięciu przycisku zapisz', async () => {
    const user = userEvent.setup();
    render(<SubmitButtonGroup {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /zapisz/i });
    await user.click(saveButton);
    
    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  it('wywołuje onCancel po kliknięciu przycisku anuluj', async () => {
    const user = userEvent.setup();
    render(<SubmitButtonGroup {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /anuluj/i });
    await user.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('wywołuje onGenerateFlashcards po kliknięciu przycisku generuj', async () => {
    const user = userEvent.setup();
    render(<SubmitButtonGroup {...defaultProps} />);
    
    const generateButton = screen.getByRole('button', { name: /generuj fiszki/i });
    await user.click(generateButton);
    
    expect(defaultProps.onGenerateFlashcards).toHaveBeenCalled();
  });

  it('blokuje przyciski podczas zapisywania', () => {
    render(<SubmitButtonGroup {...defaultProps} isSaving={true} />);
    
    expect(screen.getByRole('button', { name: /zapisz/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /anuluj/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /generuj fiszki/i })).toBeDisabled();
  });

  it('blokuje przyciski podczas generowania', () => {
    render(<SubmitButtonGroup {...defaultProps} isGenerating={true} />);
    
    expect(screen.getByRole('button', { name: /zapisz/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /anuluj/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /generuj fiszki/i })).toBeDisabled();
  });

  it('blokuje przycisk generowania gdy disableGenerate=true', () => {
    render(<SubmitButtonGroup {...defaultProps} disableGenerate={true} />);
    
    expect(screen.getByRole('button', { name: /generuj fiszki/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /zapisz/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /anuluj/i })).not.toBeDisabled();
  });
}); 
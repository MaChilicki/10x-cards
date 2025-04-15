import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { NavigationPrompt } from '../navigation-prompt';

describe('NavigationPrompt', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: vi.fn(),
    onCancel: vi.fn()
  };

  it('renderuje dialog gdy isOpen=true', () => {
    render(<NavigationPrompt {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/niezapisane zmiany/i)).toBeInTheDocument();
  });

  it('nie renderuje dialogu gdy isOpen=false', () => {
    render(<NavigationPrompt {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('wywołuje onConfirm po kliknięciu przycisku potwierdzenia', async () => {
    const user = userEvent.setup();
    render(<NavigationPrompt {...defaultProps} />);
    
    const confirmButton = screen.getByRole('button', { name: /opuść/i });
    await user.click(confirmButton);
    
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('wywołuje onCancel po kliknięciu przycisku anulowania', async () => {
    const user = userEvent.setup();
    render(<NavigationPrompt {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /zostań/i });
    await user.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('wyświetla odpowiedni tekst ostrzeżenia', () => {
    render(<NavigationPrompt {...defaultProps} />);
    
    expect(screen.getByText(/masz niezapisane zmiany/i)).toBeInTheDocument();
    expect(screen.getByText(/czy na pewno chcesz opuścić stronę/i)).toBeInTheDocument();
  });

  it('ma odpowiednie atrybuty dostępności', () => {
    render(<NavigationPrompt {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });
}); 
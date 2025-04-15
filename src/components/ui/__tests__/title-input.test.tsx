import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { TitleInput } from '../title-input';

describe('TitleInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    error: undefined,
    disabled: false
  };

  it('renderuje input z etykietą', () => {
    render(<TitleInput {...defaultProps} />);
    
    const input = screen.getByRole('textbox', { name: /tytuł/i });
    expect(input).toBeInTheDocument();
  });

  it('wyświetla wprowadzoną wartość', () => {
    render(<TitleInput {...defaultProps} value="Test Title" />);
    
    const input = screen.getByRole('textbox', { name: /tytuł/i });
    expect(input).toHaveValue('Test Title');
  });

  it('wywołuje onChange przy wprowadzaniu tekstu', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    
    render(<TitleInput {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByRole('textbox', { name: /tytuł/i });
    await user.type(input, 'a');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('wyświetla komunikat błędu', () => {
    render(<TitleInput {...defaultProps} error="Błąd walidacji" />);
    
    expect(screen.getByText('Błąd walidacji')).toBeInTheDocument();
  });

  it('jest zablokowany gdy disabled=true', () => {
    render(<TitleInput {...defaultProps} disabled={true} />);
    
    const input = screen.getByRole('textbox', { name: /tytuł/i });
    expect(input).toBeDisabled();
  });

  it('ma odpowiednie atrybuty dostępności', () => {
    render(<TitleInput {...defaultProps} error="Błąd" />);
    
    const input = screen.getByRole('textbox', { name: /tytuł/i });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });
}); 
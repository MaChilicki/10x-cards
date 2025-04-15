import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { ContentTextarea } from '../content-textarea';

describe('ContentTextarea', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    error: undefined,
    disabled: false
  };

  it('renderuje textarea z etykietą', () => {
    render(<ContentTextarea {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox', { name: /treść/i });
    expect(textarea).toBeInTheDocument();
  });

  it('wyświetla wprowadzoną wartość', () => {
    const longText = 'A'.repeat(1000);
    render(<ContentTextarea {...defaultProps} value={longText} />);
    
    const textarea = screen.getByRole('textbox', { name: /treść/i });
    expect(textarea).toHaveValue(longText);
  });

  it('wywołuje onChange przy wprowadzaniu tekstu', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    
    render(<ContentTextarea {...defaultProps} onChange={onChange} />);
    
    const textarea = screen.getByRole('textbox', { name: /treść/i });
    await user.type(textarea, 'test');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('wyświetla komunikat błędu', () => {
    render(<ContentTextarea {...defaultProps} error="Błąd walidacji" />);
    
    expect(screen.getByText('Błąd walidacji')).toBeInTheDocument();
  });

  it('jest zablokowany gdy disabled=true', () => {
    render(<ContentTextarea {...defaultProps} disabled={true} />);
    
    const textarea = screen.getByRole('textbox', { name: /treść/i });
    expect(textarea).toBeDisabled();
  });

  it('wyświetla licznik znaków', () => {
    const text = 'A'.repeat(1500);
    render(<ContentTextarea {...defaultProps} value={text} />);
    
    expect(screen.getByText('1500/10000')).toBeInTheDocument();
  });

  it('ma odpowiednie atrybuty dostępności', () => {
    render(<ContentTextarea {...defaultProps} error="Błąd" />);
    
    const textarea = screen.getByRole('textbox', { name: /treść/i });
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('aria-describedby');
  });
}); 
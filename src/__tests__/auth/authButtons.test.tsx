import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { AuthSocialButton } from '@/components/auth/AuthSocialButton';
import { AuthDivider } from '@/components/auth/AuthDivider';

describe('Auth button primitives', () => {
  it('renders AuthPrimaryButton with disabled state', () => {
    render(
      <AuthPrimaryButton disabled type="submit">
        Υποβολή
      </AuthPrimaryButton>
    );

    const button = screen.getByRole('button', { name: 'Υποβολή' });
    expect(button).toBeDisabled();
    expect(button.className).toContain('auth-primary-btn');
  });

  it('renders AuthSocialButton and handles click', () => {
    const onClick = vi.fn();
    render(
      <AuthSocialButton onClick={onClick}>
        Social
      </AuthSocialButton>
    );

    const button = screen.getByRole('button', { name: 'Social' });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button.className).toContain('auth-social-btn');
  });

  it('renders AuthDivider with default separator text', () => {
    render(<AuthDivider />);
    expect(screen.getByText('ή')).toBeInTheDocument();
  });
});

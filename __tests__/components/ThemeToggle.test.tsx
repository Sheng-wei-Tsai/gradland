import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import ThemeToggle from '@/components/ThemeToggle';

// localStorage mock is provided by jsdom

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders without crashing', () => {
    const { container } = render(<ThemeToggle />);
    expect(container.querySelector('button')).toBeTruthy();
  });

  it('has correct aria-label for light mode', () => {
    const { getByRole } = render(<ThemeToggle />);
    const btn = getByRole('button');
    // Initial state is light — aria-label should suggest switching to dark
    expect(btn.getAttribute('aria-label')).toBe('Switch to dark mode');
  });

  it('toggles aria-label after click', async () => {
    vi.useFakeTimers();
    const { getByRole } = render(<ThemeToggle />);
    const btn = getByRole('button');
    fireEvent.click(btn);
    // Advance past the 280ms midpoint where theme flips, inside act so React flushes state
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(btn.getAttribute('aria-label')).toBe('Switch to light mode');
    vi.useRealTimers();
  });

  it('persists theme to localStorage on toggle', async () => {
    vi.useFakeTimers();
    const { getByRole } = render(<ThemeToggle />);
    fireEvent.click(getByRole('button'));
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(localStorage.getItem('theme')).toBe('dark');
    vi.useRealTimers();
  });

  it('sets data-theme attribute on documentElement', async () => {
    vi.useFakeTimers();
    const { getByRole } = render(<ThemeToggle />);
    fireEvent.click(getByRole('button'));
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    vi.useRealTimers();
  });
});

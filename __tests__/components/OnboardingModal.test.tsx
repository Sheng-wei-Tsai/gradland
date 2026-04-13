import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingModal from '@/components/OnboardingModal';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}));

describe('OnboardingModal', () => {
  const onComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the welcome screen on step 0', () => {
    render(<OnboardingModal onComplete={onComplete} />);
    // Welcome screen has "Let's go →" primary CTA
    expect(screen.getByText(/Let's go/i)).toBeInTheDocument();
  });

  it('shows the first question when "Let\'s go" is clicked', () => {
    render(<OnboardingModal onComplete={onComplete} />);
    fireEvent.click(screen.getByText(/Let's go/i));
    // Now on step 1 — should show "What IT role are you targeting?"
    expect(screen.getByText(/IT role/i)).toBeInTheDocument();
  });

  it('Skip button is present on question steps', () => {
    render(<OnboardingModal onComplete={onComplete} />);
    fireEvent.click(screen.getByText(/Let's go/i));
    // On a question step, a defer/skip option should be available
    expect(screen.getByText(/I'll do this later/i)).toBeInTheDocument();
  });

  it('displays role options on step 1', () => {
    render(<OnboardingModal onComplete={onComplete} />);
    fireEvent.click(screen.getByText(/Let's go/i));
    expect(screen.getByText(/Frontend/i)).toBeInTheDocument();
    expect(screen.getByText(/Full Stack/i)).toBeInTheDocument();
  });
});

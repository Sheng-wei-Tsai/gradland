import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ReadinessScore from '@/components/ReadinessScore';

// Mock supabase auth
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

import { supabase } from '@/lib/supabase';

const mockSession = {
  data: { session: { access_token: 'test-token' } },
};

const mockReadinessData = {
  score: 72,
  band: 'Strong Candidate',
  bandColor: '#22c55e',
  components: {
    resume:    { score: 80, detail: 'Analysed today' },
    skills:    { score: 65, detail: '5 of 10 mastered' },
    interview: { score: 70, detail: 'Level 2 · 200 XP' },
    quiz:      { score: 55, detail: '3 videos, avg 82%' },
  },
  boostAction: { label: 'Take a YouTube learning quiz', href: '/learn/youtube', gain: '+5 pts' },
};

describe('ReadinessScore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { session: null } });
    const { container } = render(<ReadinessScore />);
    // Loading state renders a div with "Calculating score…" or the card wrapper
    expect(container.firstChild).toBeTruthy();
  });

  it('renders nothing when user is not logged in', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { session: null } });
    const { container } = render(<ReadinessScore />);
    // After data loads, if no session → null
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders score ring and breakdown when data is provided', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReadinessData),
    });

    render(<ReadinessScore />);

    await waitFor(() => {
      expect(screen.getByText('72')).toBeInTheDocument();
      expect(screen.getByText('Strong Candidate')).toBeInTheDocument();
    });
  });

  it('shows all four component labels', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReadinessData),
    });

    render(<ReadinessScore />);

    await waitFor(() => {
      expect(screen.getByText('Resume')).toBeInTheDocument();
      expect(screen.getByText('Skills')).toBeInTheDocument();
      expect(screen.getByText('Interviews')).toBeInTheDocument();
      expect(screen.getByText('Quizzes')).toBeInTheDocument();
    });
  });

  it('renders boost action link', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReadinessData),
    });

    render(<ReadinessScore />);

    await waitFor(() => {
      expect(screen.getByText(/Boost your score/i)).toBeInTheDocument();
    });
  });
});

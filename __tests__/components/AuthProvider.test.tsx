import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor, renderHook, fireEvent } from '@testing-library/react';
import type { User } from '@supabase/supabase-js';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession:         vi.fn(),
      onAuthStateChange:  vi.fn(),
      signInWithOAuth:    vi.fn(),
      signInWithPassword: vi.fn(),
      signUp:             vi.fn(),
      signOut:            vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock('@/components/OnboardingModal', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="onboarding-modal">
      <button onClick={onComplete}>Complete</button>
    </div>
  ),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const fakeUser = { id: 'user-abc', email: 'test@example.com' } as User;

type MockFn = ReturnType<typeof vi.fn>;

const auth = () => supabase.auth as {
  getSession:        MockFn;
  onAuthStateChange: MockFn;
  signInWithPassword:MockFn;
  signOut:           MockFn;
  signUp:            MockFn;
  signInWithOAuth:   MockFn;
};

function mockProfile(onboardingCompleted: boolean) {
  (supabase.from as MockFn).mockReturnValue({
    select:      vi.fn().mockReturnThis(),
    eq:          vi.fn().mockReturnThis(),
    upsert:      vi.fn().mockResolvedValue({ error: null }),
    single:      vi.fn().mockResolvedValue({ data: { onboarding_completed: onboardingCompleted } }),
    maybeSingle: vi.fn().mockResolvedValue({ data: { onboarding_completed: onboardingCompleted } }),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth().getSession.mockResolvedValue({ data: { session: null }, error: null });
    auth().onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    auth().signOut.mockResolvedValue({ error: null });
    auth().signInWithPassword.mockResolvedValue({ data: { user: null, session: null }, error: null });
    auth().signInWithOAuth.mockResolvedValue({});
    mockProfile(true); // default: already completed, no modal
  });

  it('exposes user=null and loading=true before getSession resolves', () => {
    auth().getSession.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('sets loading=false and user=null when there is no session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it('populates user from an existing session on mount', async () => {
    auth().getSession.mockResolvedValue({ data: { session: { user: fakeUser } }, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.user).toEqual(fakeUser));
    expect(result.current.loading).toBe(false);
  });

  it('shows OnboardingModal when profile.onboarding_completed is false', async () => {
    auth().getSession.mockResolvedValue({ data: { session: { user: fakeUser } }, error: null });
    mockProfile(false);
    render(<AuthProvider><div /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument());
  });

  it('does not show OnboardingModal when profile.onboarding_completed is true', async () => {
    auth().getSession.mockResolvedValue({ data: { session: { user: fakeUser } }, error: null });
    // mockProfile(true) is set in beforeEach
    render(<AuthProvider><div /></AuthProvider>);
    // Wait for the profile query to fire, then assert modal is absent
    await waitFor(() => expect(supabase.from as MockFn).toHaveBeenCalled());
    expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
  });

  it('skips the profile check when onboarding_dismissed=1 is in localStorage', async () => {
    localStorage.setItem('onboarding_dismissed', '1');
    auth().getSession.mockResolvedValue({ data: { session: { user: fakeUser } }, error: null });
    mockProfile(false); // would trigger modal if check ran
    render(<AuthProvider><div /></AuthProvider>);
    // Allow all microtasks to settle
    await act(async () => { await new Promise(r => setTimeout(r, 50)); });
    // checkOnboarding returns early — supabase.from should never be reached
    expect(supabase.from as MockFn).not.toHaveBeenCalled();
    expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
  });

  it('updates user when a SIGNED_IN auth state change event fires', async () => {
    let authCb: (event: string, session: { user: User } | null) => void = () => {};
    auth().onAuthStateChange.mockImplementation((cb: typeof authCb) => {
      authCb = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { authCb('SIGNED_IN', { user: fakeUser }); });

    expect(result.current.user).toEqual(fakeUser);
  });

  it('clears user after signOut', async () => {
    auth().getSession.mockResolvedValue({ data: { session: { user: fakeUser } }, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.user).toEqual(fakeUser));

    await act(async () => { await result.current.signOut(); });

    expect(result.current.user).toBeNull();
    expect(auth().signOut).toHaveBeenCalled();
  });

  it('signInWithEmail returns error message when credentials are wrong', async () => {
    auth().signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response!: { error: string | null };
    await act(async () => {
      response = await result.current.signInWithEmail('bad@example.com', 'wrong');
    });

    expect(response.error).toBe('Invalid login credentials');
  });

  it('signInWithEmail returns error=null on success', async () => {
    auth().signInWithPassword.mockResolvedValue({ data: { user: fakeUser, session: {} }, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response!: { error: string | null };
    await act(async () => {
      response = await result.current.signInWithEmail('test@example.com', 'correct');
    });

    expect(response.error).toBeNull();
  });

  it('reopenOnboarding shows the modal and removes the dismissed flag', async () => {
    localStorage.setItem('onboarding_dismissed', '1');

    function Consumer() {
      const { reopenOnboarding } = useAuth();
      return <button data-testid="reopen" onClick={reopenOnboarding} />;
    }
    render(<AuthProvider><Consumer /></AuthProvider>);

    // Modal absent initially (no active session)
    await waitFor(() => expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument());

    fireEvent.click(screen.getByTestId('reopen'));

    expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
    expect(localStorage.getItem('onboarding_dismissed')).toBeNull();
  });
});

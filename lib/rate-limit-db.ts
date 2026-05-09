import { createSupabaseService } from '@/lib/auth-server';

/**
 * Atomically increment a Supabase-backed rate-limit counter.
 *
 * Persists across cold starts and Vercel Fluid Compute instance recycles —
 * unlike in-memory Maps which reset on every new function instance.
 *
 * Returns true when the caller is over limit (request should be rejected).
 * Fails-open on DB error to avoid blocking legitimate traffic during outages.
 *
 * key       — unique identifier for the rate-limited resource, e.g. "log-error:1.2.3.4"
 * windowSec — rolling window size in seconds
 * limit     — maximum allowed calls within windowSec before returning true
 */
export async function checkRateLimit(
  key: string,
  windowSec: number,
  limit: number,
): Promise<boolean> {
  try {
    const sb = createSupabaseService();
    const bucketMs = windowSec * 1000;
    const bucket = new Date(
      Math.floor(Date.now() / bucketMs) * bucketMs,
    ).toISOString();

    const { data: count, error } = await sb.rpc('increment_rate_limit', {
      p_key:    key,
      p_bucket: bucket,
    });

    if (error) return false;
    return (count as number) > limit;
  } catch {
    return false;
  }
}

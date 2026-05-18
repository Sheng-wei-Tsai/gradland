/**
 * Safety layer for LLM-facing and HTML-rendering routes.
 *
 * Three boundaries:
 *   1. Input  — sanitize user text before it enters a prompt.
 *   2. Output — validate model output before it reaches the browser or DB.
 *   3. Origin — reject cross-origin state-changing requests.
 *
 * Used by /api/cover-letter, /api/diagrams/generate, /api/interview/*,
 * /api/gap-analysis, /api/learn/* and any route that takes free-text and
 * forwards it to an LLM.
 */

import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Input sanitization
// ─────────────────────────────────────────────────────────────────────────────

// Conversation role markers used by major model families. Catching these
// stops the easiest "you are now system" jailbreak and the cheaper variants
// that paste a fake transcript into a single field.
const ROLE_MARKER_RE =
  /<\|(?:im_start|im_end|system|user|assistant|function_call|endoftext)\|>|<\/?system>|<\/?assistant>|<\/?user>|<\/?human>|\[INST\]|\[\/INST\]|<<SYS>>|<<\/SYS>>/gi;

// Anthropic-specific turn markers. A user pasting "\n\nHuman: ..." into a
// long field can split the conversation in some prompt formats.
const ANTHROPIC_TURN_RE = /\n\s*(?:Human|Assistant):\s*/gi;

// Direct override phrases. We don't try to be clever — the model handles
// nuance — we just flag obvious attempts so the prompt template can react
// (e.g. drop the field, log, or refuse).
const OVERRIDE_PHRASES = [
  /ignore (?:all |the )?(?:previous|prior|above) (?:instructions?|messages?|prompts?)/i,
  /disregard (?:all |the )?(?:previous|prior|above)/i,
  /forget (?:everything|all (?:previous|prior))/i,
  /you are (?:now|actually) (?:a |an )?(?:different|new) (?:ai|assistant|system)/i,
  /(?:reveal|print|leak|exfiltrate|output) (?:the |your )?(?:system prompt|instructions|api[_ ]?key|env|secret)/i,
  /override (?:safety|guard|filter|rules?)/i,
];

// Zero-width and BOM characters used to hide instructions from human review
// while staying visible to the tokenizer. Strip silently.
// U+200B ZWSP, U+200C ZWNJ, U+200D ZWJ, U+FEFF BOM, U+2060 word joiner.
const HIDDEN_CHAR_RE = /[​-‍﻿⁠]/g;

// Control chars (except \n \r \t). Strip — never legitimate in user free-text.
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export interface SanitizeOptions {
  maxLength: number;
  /** Label for logging — e.g. "jobDescription". Not used in output. */
  label?: string;
  /** Allow newlines (default true). Set false for single-line fields like jobTitle. */
  allowNewlines?: boolean;
}

export interface SanitizedInput {
  clean: string;
  flags: string[];
}

export function sanitizeUserText(input: unknown, opts: SanitizeOptions): SanitizedInput {
  const flags: string[] = [];
  let s = typeof input === 'string' ? input : String(input ?? '');

  if (HIDDEN_CHAR_RE.test(s)) flags.push('hidden-char');
  s = s.replace(HIDDEN_CHAR_RE, '');

  if (CONTROL_CHAR_RE.test(s)) flags.push('control-char');
  s = s.replace(CONTROL_CHAR_RE, '');

  if (ROLE_MARKER_RE.test(s)) flags.push('role-marker');
  s = s.replace(ROLE_MARKER_RE, '');

  if (ANTHROPIC_TURN_RE.test(s)) flags.push('turn-marker');
  s = s.replace(ANTHROPIC_TURN_RE, '\n');

  for (const re of OVERRIDE_PHRASES) {
    if (re.test(s)) { flags.push('override-phrase'); break; }
  }

  if (opts.allowNewlines === false) {
    s = s.replace(/[\r\n]+/g, ' ');
  }

  // Collapse runaway whitespace — long ribbons of spaces or newlines are
  // often used to push real instructions out of the visible context window.
  s = s.replace(/[ \t]{4,}/g, '   ').replace(/\n{4,}/g, '\n\n\n');

  s = s.trim().slice(0, opts.maxLength);
  return { clean: s, flags };
}

/**
 * Wrap user-supplied text in delimiters that make it unambiguous to the
 * model where the untrusted payload begins and ends. Use inside the user
 * message of a system+user prompt — never inside the system prompt.
 *
 *   const prompt = `Job description (untrusted user input):\n${wrapUserContent('jobDescription', jd)}\n\nWrite a cover letter.`;
 *
 * The fenced delimiter is reproducible per call and includes the label so
 * a successful injection would have to include the exact fence to escape.
 */
export function wrapUserContent(label: string, text: string): string {
  const tag = label.replace(/[^a-z0-9_-]/gi, '').slice(0, 32).toLowerCase() || 'user';
  // Random nonce makes the closing fence unguessable from inside the payload.
  const nonce = Math.random().toString(36).slice(2, 10);
  const fence = `<<<${tag}:${nonce}>>>`;
  const close = `<<</${tag}:${nonce}>>>`;
  // If user payload contains the fence verbatim, replace it inside the
  // payload so it can't terminate our wrapper. Effectively impossible to
  // hit by accident given the random nonce.
  const safe = text.split(fence).join('').split(close).join('');
  return `${fence}\n${safe}\n${close}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Output validation
// ─────────────────────────────────────────────────────────────────────────────

const MERMAID_KEYWORDS = [
  'flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
  'erDiagram', 'gantt', 'pie', 'journey', 'mindmap', 'timeline',
];

// Anything that would let a malicious Mermaid payload bypass the renderer's
// strict mode or leak data via fetch/links. Mermaid's securityLevel:'strict'
// already strips most of these client-side, but defense in depth — reject
// here so the bad output never reaches the browser at all.
const MERMAID_BLOCKLIST = [
  /<script\b/i,
  /<\/script>/i,
  /javascript:/i,
  /on[a-z]+\s*=/i,       // onerror=, onclick= etc.
  /\bclick\b.*\bcall\b/i, // mermaid click ... call action
  /\bclick\b.*\bhref\b/i, // mermaid click X href
  /xlink:href\s*=\s*["']?javascript:/i,
  /data:text\/html/i,
];

export interface MermaidValidationResult {
  ok: boolean;
  reason?: string;
  /** Sanitized code if ok=true (fences stripped, trimmed). */
  code?: string;
}

export function validateMermaidOutput(raw: string, maxBytes = 8192): MermaidValidationResult {
  if (typeof raw !== 'string') return { ok: false, reason: 'not a string' };

  let code = raw.trim()
    .replace(/^```(?:mermaid)?\r?\n?/i, '')
    .replace(/\r?\n?```\s*$/, '')
    .trim();

  if (!code) return { ok: false, reason: 'empty' };
  if (code.length > maxBytes) return { ok: false, reason: 'too large' };

  // Must start with a known Mermaid keyword. Hard requirement.
  const firstToken = code.split(/\s/)[0];
  if (!MERMAID_KEYWORDS.includes(firstToken)) {
    return { ok: false, reason: `unknown diagram type: ${firstToken.slice(0, 40)}` };
  }

  for (const re of MERMAID_BLOCKLIST) {
    if (re.test(code)) return { ok: false, reason: `blocked pattern: ${re}` };
  }

  return { ok: true, code };
}

/**
 * Strip suspicious markdown image and link patterns from LLM text output
 * that will be rendered as markdown in another user's browser. Removes
 * out-of-allowlist image hosts (data-exfil channel) and javascript: links.
 *
 * Use only for text that is shown to a different user than the one who
 * supplied the input (e.g. comments displayed publicly). For private
 * output back to the same user, this filter usually isn't needed.
 */
const ALLOWED_IMAGE_HOSTS = new Set([
  'githubusercontent.com',
  'googleusercontent.com',
  'ytimg.com',
  'simpleicons.org',
  'logo.dev',
]);

export function filterMarkdownForPublicRender(text: string): string {
  return text
    // Drop markdown images pointing at non-allowlisted hosts.
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g, (full, alt, url) => {
      try {
        const host = new URL(url).hostname;
        const allowed = [...ALLOWED_IMAGE_HOSTS].some(h => host === h || host.endsWith(`.${h}`));
        return allowed ? full : `[image removed: ${alt}]`;
      } catch {
        return `[image removed]`;
      }
    })
    // Strip javascript: links. Permit one level of nested parens inside the
    // URL (e.g. javascript:alert(1)) by alternating "non-paren" and "balanced
    // paren group" inside the URL portion.
    .replace(/\[([^\]]+)\]\(javascript:(?:[^()]|\([^()]*\))*\)/gi, '[$1]')
    // Strip raw script tags if anything markdown-renders to HTML.
    .replace(/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*script\b[^>]*\/?>/gi, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Origin / CSRF boundary
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reject state-changing requests that don't originate from our own site.
 * Browsers always send `Origin` on cross-origin fetches with credentials,
 * so an absent or wrong Origin on a POST is the standard CSRF signal.
 *
 * Returns null if the request is allowed, or a 403 response if not.
 * Call this near the top of POST/PUT/PATCH/DELETE handlers, after auth.
 */
export function assertSameOrigin(req: NextRequest): NextResponse | null {
  // Vitest builds NextRequest without Origin/Referer headers. Skip the
  // check under NODE_ENV=test so route handler tests don't have to thread
  // headers through every request builder.
  if (process.env.NODE_ENV === 'test') return null;

  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return null;

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host');
  if (!host) return NextResponse.json({ error: 'Missing host' }, { status: 400 });

  const expected = new Set<string>([`https://${host}`, `http://${host}`]);
  const extra = process.env.ALLOWED_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
  for (const o of extra) expected.add(o);

  if (origin) {
    if (expected.has(origin)) return null;
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }

  // No Origin header — fall back to Referer for older clients.
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (expected.has(refOrigin)) return null;
    } catch { /* fallthrough */ }
  }

  return NextResponse.json({ error: 'Missing origin' }, { status: 403 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Convenience: sanitize a whole field map in one call.
// ─────────────────────────────────────────────────────────────────────────────

export type FieldSpec = SanitizeOptions & { required?: boolean };

export interface SanitizeFieldsResult<T extends Record<string, string>> {
  ok: boolean;
  values: T;
  flags: Record<keyof T, string[]>;
  error?: string;
}

export function sanitizeFields<T extends Record<string, string>>(
  input: Record<string, unknown>,
  spec: Record<keyof T, FieldSpec>,
): SanitizeFieldsResult<T> {
  const values = {} as T;
  const flags = {} as Record<keyof T, string[]>;
  for (const key of Object.keys(spec) as Array<keyof T>) {
    const fieldSpec = spec[key];
    const raw = input[key as string];
    if (fieldSpec.required && (raw === undefined || raw === null || raw === '')) {
      return { ok: false, values, flags, error: `Missing required field: ${String(key)}` };
    }
    const { clean, flags: fieldFlags } = sanitizeUserText(raw ?? '', fieldSpec);
    (values as Record<string, string>)[key as string] = clean;
    flags[key] = fieldFlags;
  }
  return { ok: true, values, flags };
}

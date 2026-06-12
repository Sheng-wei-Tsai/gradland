/**
 * GitHub Models API wrapper — fallback for content automation when the
 * Claude Code Pro 5-hour quota is exhausted.
 *
 * GitHub Copilot Pro+ subscribers get a much higher rate limit on the
 * GitHub Models inference endpoint, which is OpenAI-compatible and
 * exposes Claude, GPT-4o, Llama, and others.
 *
 * Auth:
 *   - In GitHub Actions: set the workflow `permissions: models: read`
 *     and pass `GH_MODELS_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
 *   - Locally: export GH_MODELS_TOKEN=<a PAT with `models:read` scope>.
 *
 * Model mapping: each Claude model name maps to a GitHub Models id via
 * GH_MODEL_MAP below; override per-call via the `model` opt.
 *
 * Docs: https://docs.github.com/en/github-models
 */
import type { ClaudeMessageOpts, ClaudeModel } from './llm-claude';

const ENDPOINT = 'https://models.github.ai/inference/chat/completions';

/**
 * Maps a Claude model id to an equivalent on GitHub Models.
 *
 * OpenAI models in the GitHub Models catalog return
 *   403 { code: "no_access" }
 * for the default GITHUB_TOKEN — they require explicit org/user
 * acceptance of the OpenAI terms in the marketplace. The Mistral and Meta
 * models work with the default token + `permissions: models: read`, which
 * is what every workflow already passes.
 *
 * Model ids are case-sensitive and lowercase in the catalog — the API
 * returns 403 no_access for any casing mismatch (e.g. "Ministral-3B").
 * Verify against GET https://models.github.ai/catalog/models.
 *
 *   - claude-haiku-*   → mistral-ai/ministral-3b           (cheap, fast)
 *   - claude-sonnet-*  → mistral-ai/mistral-medium-2505    (balanced)
 *   - claude-opus-*    → meta/llama-3.3-70b-instruct       (best free-tier)
 */
function mapToGithubModel(claudeModel?: ClaudeModel): string {
  if (!claudeModel) return 'mistral-ai/ministral-3b';
  if (claudeModel.includes('haiku')) return 'mistral-ai/ministral-3b';
  if (claudeModel.includes('sonnet')) return 'mistral-ai/mistral-medium-2505';
  if (claudeModel.includes('opus')) return 'meta/llama-3.3-70b-instruct';
  return 'mistral-ai/ministral-3b';
}

export class GithubModelsQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GithubModelsQuotaError';
  }
}

export function hasGithubModelsToken(): boolean {
  return Boolean(process.env.GH_MODELS_TOKEN || process.env.GITHUB_MODELS_TOKEN);
}

export async function githubModelsMessage(opts: ClaudeMessageOpts): Promise<string> {
  const token = process.env.GH_MODELS_TOKEN || process.env.GITHUB_MODELS_TOKEN;
  if (!token) {
    throw new Error('GH_MODELS_TOKEN not set — cannot use GitHub Models fallback');
  }

  const overrideModel = process.env.GH_MODELS_MODEL;
  const model = overrideModel || mapToGithubModel(opts.model);

  const messages: Array<{ role: string; content: string }> = [];
  if (opts.system) messages.push({ role: 'system', content: opts.system });
  messages.push({ role: 'user', content: opts.prompt });

  const body = {
    model,
    messages,
    temperature: 0.4,
    max_tokens: 4096,
  };

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 120_000);

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } finally {
    clearTimeout(timeout);
  }

  const text = await res.text();

  if (res.status === 429 || /rate.?limit|quota/i.test(text)) {
    throw new GithubModelsQuotaError(`GitHub Models quota: ${text.slice(0, 300)}`);
  }
  if (!res.ok) {
    throw new Error(`GitHub Models ${res.status}: ${text.slice(0, 500)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`GitHub Models invalid JSON: ${text.slice(0, 200)}`);
  }

  const content = (parsed as { choices?: Array<{ message?: { content?: string } }> })
    ?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(`GitHub Models empty response: ${text.slice(0, 200)}`);
  }

  return content.trim();
}

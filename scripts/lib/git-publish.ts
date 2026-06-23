/**
 * Shared commit/publish helper for the daily content bots.
 *
 * Two modes, selected by the PUBLISH_MODE env var:
 *
 *   - 'direct' (default): commit + push straight to main, with the existing
 *     3-attempt rebase retry. This is the legacy behaviour — safe for local
 *     runs and unchanged until branch protection is switched on.
 *
 *   - 'pr': commit on a throwaway branch, push it, open a PR, and enable
 *     squash auto-merge. Under branch protection (required `check` status),
 *     GitHub holds the merge until the gate passes — so no content reaches
 *     main, and therefore production, without passing audit/test/build.
 *     Requires a credential in GH_TOKEN that can trigger workflows (a GitHub
 *     App installation token — NOT the default GITHUB_TOKEN, which GitHub
 *     blocks from triggering the required check).
 *
 * See docs/DEPLOY_HARDENING.md for the rollout order.
 */
import { execFileSync } from 'node:child_process';

const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: '0' };
const MODE = process.env.PUBLISH_MODE ?? 'direct';

export interface PublishOptions {
  /** Paths or directories to `git add` (e.g. ['content/ai-news/foo.md'] or ['content/claude-code/']). */
  add: string[];
  /** Commit message — also used as the PR title in 'pr' mode. The text before the first ':' becomes the branch prefix. */
  message: string;
  /** Optional PR body in 'pr' mode (defaults to the commit message). */
  prBody?: string;
}

function git(args: string[], opts: { allowFail?: boolean } = {}): boolean {
  try {
    execFileSync('git', args, { stdio: 'inherit', env: GIT_ENV, timeout: 60_000 });
    return true;
  } catch (err) {
    if (opts.allowFail) return false;
    throw err;
  }
}

function hasStagedChanges(): boolean {
  const out = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
  return out.trim().length > 0;
}

function branchName(message: string): string {
  const prefix = (message.split(':')[0] || 'bot')
    .trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24) || 'bot';
  const uniq = process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT ?? '1'}`
    : String(Date.now());
  return `bot/${prefix}-${uniq}`;
}

/** Commit the given paths and publish them — to main directly, or via an auto-merge PR. */
export async function commitAndPublish({ add, message, prBody }: PublishOptions): Promise<void> {
  for (const p of add) git(['add', p]);
  if (!hasStagedChanges()) {
    console.log('Nothing to commit — skipping publish.');
    return;
  }

  if (MODE === 'pr') {
    await publishViaPR(message, prBody);
  } else {
    git(['commit', '-m', message]);
    await pushMainWithRetry();
  }
}

async function publishViaPR(message: string, prBody?: string): Promise<void> {
  const branch = branchName(message);
  git(['checkout', '-b', branch]);
  git(['commit', '-m', message]);
  git(['push', '-u', 'origin', branch]);
  // `gh` reads the credential from GH_TOKEN — must be a GitHub App installation
  // token so the PR triggers the required `check`. The default GITHUB_TOKEN will not.
  execFileSync('gh', ['pr', 'create', '--base', 'main', '--head', branch,
    '--title', message, '--body', prBody ?? message], { stdio: 'inherit', env: process.env });
  execFileSync('gh', ['pr', 'merge', branch, '--auto', '--squash', '--delete-branch'],
    { stdio: 'inherit', env: process.env });
  console.log(`Opened PR from ${branch} with squash auto-merge — merges once the gate passes.`);
}

async function pushMainWithRetry(): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (attempt > 1) {
      await new Promise(r => setTimeout(r, 10_000 * attempt));
      git(['pull', '--rebase', 'origin', 'main'], { allowFail: true });
    }
    if (git(['push', 'origin', 'main'], { allowFail: attempt < 3 })) {
      console.log('Pushed to main — Vercel is building.');
      return;
    }
    console.warn(`Push attempt ${attempt} failed, retrying...`);
  }
}

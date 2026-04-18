---
title: "CodeBurn: Token Cost Observability for AI Coding Tools"
date: "2026-04-18"
excerpt: "AI coding tools are burning your budget in the background. CodeBurn is the open-source TypeScript blueprint for finally seeing where every token goes — and building cost dashboards into your own stack."
tags: ["TypeScript", "AI Tools", "Developer Tooling", "Next.js", "Observability"]
coverEmoji: "🔥"
auto_generated: true
source_url: "https://github.com/getagentseal/codeburn"
---

If you're running Claude Code or Cursor daily, you're flying blind on costs. You get an invoice at the end of the month and do a bit of mental arithmetic. CodeBurn — 2,700+ stars this week on GitHub — is the first tool I've seen that reads session data directly off disk across Claude Code, Cursor, Codex, Copilot, and more, and surfaces real token burn per task type, model, and project. No proxy, no API key required. And because it's TypeScript with a clean plugin architecture, it's a proper blueprint you can gut and adapt for your own cost observability stack.

## How It Actually Works

CodeBurn reads session files from wherever your AI tools write them locally — `~/.claude/projects/`, `~/.codex/sessions/`, `~/.copilot/session-state/`, and so on. It doesn't sit in the middle of your requests. It's a reader, not a proxy. That's the right call: zero latency overhead, no risk of mangling your context window, and it works retrospectively on data you already have.

Pricing is pulled from LiteLLM's model catalogue, auto-cached, so you get dollar figures without maintaining your own pricing table.

```bash
npm install -g codeburn

# or just run it
npx codeburn

# date range you actually care about
codeburn report --from 2026-04-01 --to 2026-04-10 --format json
```

The `--format json` flag is the interesting one for integrations. Pipe that output into your own pipeline and you've got structured cost data you can push anywhere.

## The Architecture Worth Stealing

The provider plugin system is the real value here. Each AI tool is its own reader plugin — a pattern that maps cleanly onto any multi-source observability problem. If you're building something similar into a Next.js + Supabase stack, this is roughly the shape you'd replicate:

```typescript
// Provider plugin interface — simplified from codeburn's pattern
interface SessionProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  readSessions(opts: { from: Date; to: Date }): Promise<Session[]>;
}

interface Session {
  provider: string;
  model: string;
  project: string;
  inputTokens: number;
  outputTokens: number;
  taskType: 'edit' | 'test' | 'fix' | 'generate';
  oneShot: boolean; // did the AI nail it first try?
  timestamp: Date;
}

// Claude Code reader example
class ClaudeCodeProvider implements SessionProvider {
  name = 'claude-code';
  private basePath = path.join(os.homedir(), '.claude', 'projects');

  async isAvailable() {
    return fs.pathExists(this.basePath);
  }

  async readSessions({ from, to }: { from: Date; to: Date }) {
    const files = await glob(`${this.basePath}/**/*.jsonl`);
    const sessions: Session[] = [];

    for (const file of files) {
      const lines = await fs.readFile(file, 'utf-8');
      for (const line of lines.split('\n').filter(Boolean)) {
        const entry = JSON.parse(line);
        if (isInRange(entry.timestamp, from, to)) {
          sessions.push(mapToSession(entry));
        }
      }
    }
    return sessions;
  }
}
```

Once you have sessions in that shape, aggregating by project, model, or task type is straightforward — and you can store them in Supabase for cross-machine tracking.

## Pushing This Into a Next.js/Supabase Dashboard

The `codeburn report --format json` output is clean enough to pipe directly into a Supabase insert. A dead-simple approach:

```typescript
// scripts/sync-codeburn.ts — run this on a cron or git hook
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

async function sync() {
  const raw = execSync('codeburn report -p 7days --format json').toString();
  const report = JSON.parse(raw);

  const rows = report.sessions.map((s: any) => ({
    provider: s.provider,
    model: s.model,
    project: s.project,
    input_tokens: s.inputTokens,
    output_tokens: s.outputTokens,
    cost_usd: s.costUsd,
    task_type: s.taskType,
    one_shot: s.oneShot,
    recorded_at: s.timestamp,
    machine: os.hostname(),
  }));

  const { error } = await supabase
    .from('ai_token_usage')
    .upsert(rows, { onConflict: 'recorded_at,machine,provider' });

  if (error) throw error;
  console.log(`Synced ${rows.length} sessions`);
}

sync();
```

From there, your Next.js dashboard can query Supabase directly and render per-project cost breakdowns, model comparisons, and one-shot success rates — the metric that tells you which task types your AI tool is actually good at versus where it's burning retries.

## What I'd Build With This

**Team AI cost dashboard**: Run the sync script above as a GitHub Actions cron across your team's machines (with their permission), push to Supabase, and surface a shared Next.js dashboard. Product managers stop asking "how much is AI costing us" because there's a live answer.

**Model performance tracker**: Use the one-shot success rate per task type to A/B different models on your actual workload. If Claude 3.5 Sonnet nails refactoring first try 80% of the time but Cursor's default model only hits 50%, that's a decision you can make with data.

**Budget alerting**: Wire the cost data into a simple threshold — if a project crosses $X in 7 days, post to Slack. Basic, but I guarantee most teams don't have this and would use it immediately.

CodeBurn hit 2,700 stars in a week because it scratches an itch everyone using these tools has felt but nobody had fixed cleanly. The TUI dashboard is useful out of the box, but the real opportunity is the JSON output and plugin architecture — that's the bit worth pulling apart and adapting. The fact that it requires no API keys or proxies means you can actually convince teams to run it without a security review nightmare.

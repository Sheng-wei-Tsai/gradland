---
title: "Bumblebee: Scan Your Dev Machine for Supply Chain Compromises"
date: "2026-05-26"
excerpt: "Perplexity just open-sourced a zero-dependency Go binary that reads your lockfiles, package metadata, and browser extensions to surface known supply chain compromises—without running a single package manager command."
tags: ["Security", "DevOps", "Node.js"]
coverEmoji: "🐝"
auto_generated: true
source_url: "https://github.com/perplexityai/bumblebee"
---

The xz backdoor was the wake-up call most of us filed under "can't happen to me." Then the npm ecosystem had another rough year of malicious packages slipping through. Then the MCP server ecosystem showed up and nobody really audited any of those before installing them.

Supply chain compromises don't announce themselves. By the time an advisory drops, you've already got the package installed across half your team's machines. The gap that tools like SBOMs and EDR don't cover is the messy on-disk state: lockfiles, package manager install metadata, extension manifests, and a bunch of developer tool configs that nobody thought to audit.

Perplexity published [bumblebee](https://github.com/perplexityai/bumblebee) last week and it's been picking up traction fast (2,600+ stars). It fills exactly that gap.

## What it actually does

Bumblebee is a single static Go binary—zero non-stdlib dependencies, no package manager execution (`npm ls`, `pip show`, `go list`). It reads from disk only. The distinction matters: running `npm ls` in a compromised project could trigger malicious lifecycle hooks. Bumblebee never does that.

It emits structured NDJSON component records, one per installed package. You can pipe that output into an exposure catalog to surface matches against known advisories.

Three scan profiles:

- **baseline** — your global installs: Homebrew, system Python, language version managers (nvm, asdf, rbenv), `~/.cargo`, `~/go`, editor extensions, browser extensions, MCP configs
- **project** — your code directories (`~/code`, `~/src`, `~/Developer`, and explicit `--root` paths)  
- **deep** — a full home directory scan, intended for incident response

It covers npm/pnpm/yarn/bun lockfiles, Python `dist-info`, Go `go.sum`, Ruby gems, Cargo, PHP Composer, and MCP host configs—including the `env` blocks that often carry credentials (it parses those for server inventory but deliberately doesn't emit the values).

## Installing and running it

Grab the binary for your platform from the [v0.1.1 release](https://github.com/perplexityai/bumblebee/releases/tag/v0.1.1):

```bash
# macOS Apple Silicon
curl -L https://github.com/perplexityai/bumblebee/releases/download/v0.1.1/bumblebee_0.1.1_darwin_arm64.tar.gz | tar xz
chmod +x bumblebee

# Quick baseline scan — see what's globally installed
./bumblebee scan --profile baseline | head -20

# Scan your project trees and check against an OSV catalog
./bumblebee scan --profile project --exposure-catalog osv-catalog.json
```

The NDJSON output looks like this for a normal component record:

```json
{
  "record_type": "component",
  "ecosystem": "npm",
  "package_manager": "pnpm",
  "source_type": "pnpm-lockfile",
  "name": "some-package",
  "version": "1.2.3",
  "source_path": "/home/user/code/myapp/pnpm-lock.yaml"
}
```

When you pass an exposure catalog, matching records get `"record_type": "finding"` with the advisory details attached. The output is machine-readable by design—you can pipe it into `jq`, push it to a database, or post it to Slack.

## The MCP angle is worth flagging

One thing that jumped out at me: bumblebee explicitly scans MCP host configs. That's an ecosystem where people have been installing servers from random GitHub repos with minimal vetting. The scan doesn't just enumerate the servers—it catches the `env` block structure so you can see which MCP configs are loading credentials. That's a useful audit step before you connect a new MCP server to your editor or Claude Code setup.

## What I'd build with this

**1. A lockfile change scanner in CI.** On every PR that touches any lockfile, run bumblebee in project mode against the diff and post findings as a PR comment. Feed it a fresh OSV NDJSON catalog downloaded from `https://osv.dev/`. Fail the check if any `finding` records come back. This is maybe 50 lines of TypeScript as a GitHub Action step.

**2. A team inventory dashboard.** Run bumblebee on each dev machine (via a scheduled GitHub Action or a simple cron job) and push the NDJSON to Supabase. Build a small Next.js dashboard that shows, per machine, which packages match open advisories—sorted by severity. Useful if you're running a startup and want to know your actual exposure surface without buying a security product.

**3. A pre-push hook for project scans.** Drop this in `.git/hooks/pre-push`:

```bash
#!/bin/sh
bumblebee scan --profile project --exposure-catalog ~/.config/osv-catalog.json \
  | jq -e 'select(.record_type == "finding") | .name' && \
  echo "⚠ Supply chain findings detected. Run: bumblebee scan --profile project" && exit 1
exit 0
```

Not a replacement for proper security tooling, but it gives you a checkpoint before you push.

## My take

I like that this is narrow and honest about what it is. It answers one specific question—"given a known advisory, which of my developer machines are exposed right now?"—and doesn't try to be a full SBOM tool or EDR replacement.

The MCP config scanning is probably the most immediately useful part for anyone running Claude Code or Cursor heavily. The rest fills a gap that's genuinely hard to cover with existing tools without either running the package manager or buying an enterprise product.

The zero-dependency Go binary matters more than it sounds. You don't want your security scanner to have its own supply chain.

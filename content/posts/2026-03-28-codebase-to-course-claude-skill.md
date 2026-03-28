---
title: "Turn Any Codebase Into an Interactive Course With One Claude Prompt"
date: "2026-03-28"
excerpt: "codebase-to-course hit 2k GitHub stars this week. Here's what it actually does, how to wire it into your Next.js projects, and why it's a genuinely useful workflow right now."
tags: ["Claude", "AI Tools", "Developer Workflow", "Next.js", "TypeScript"]
coverEmoji: "🎓"
auto_generated: true
source_url: "https://github.com/zarazhangrui/codebase-to-course"
---

A Claude Code skill called `codebase-to-course` picked up 2,000+ stars this week, and the premise is dead simple: point it at any repo and get back a single, self-contained HTML file that teaches you how the code works. No server, no dependencies, works offline. Given how much AI-generated code people are shipping without fully understanding it, the timing makes sense.

## What It Actually Produces

The output isn't a README or a wiki dump. It's a proper interactive course — scroll-based modules, animated data-flow diagrams, code-on-the-left plain-English-on-the-right translations, hover glossary tooltips, and quizzes that test application rather than memorisation. Questions like "you want to add favourites — which files change?" are more useful than "what does useState do?".

The whole thing lives in one `.html` file. You can email it, commit it to a repo, or open it in a browser with no build step. That constraint is smart — it forces the output to be genuinely portable.

The design philosophy is "build first, understand later", which is the inverse of traditional CS education. If you've already shipped something with Claude and now want to actually understand what you built, this is a practical on-ramp.

## Setting It Up

Setup is minimal. Clone the repo, drop the skill folder into Claude Code's skills directory, then trigger it from inside any project:

```bash
# Clone the repo
git clone https://github.com/zarazhangrui/codebase-to-course

# Move the skill into Claude Code's skills directory
cp -r codebase-to-course/codebase-to-course ~/.claude/skills/
```

Then open any project in Claude Code and say:

```
"Turn this codebase into an interactive course"
```

That's it. Claude reads the codebase, figures out the architecture, and generates the HTML course. For a medium-sized Next.js app it takes a few minutes.

If you want to automate this as part of a documentation pipeline, you can trigger it programmatically via the Claude API. Here's a rough pattern for how you'd wire that into a Node script:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const client = new Anthropic();

async function generateCourse(projectPath: string): Promise<void> {
  const skillPrompt = fs.readFileSync(
    path.join(process.env.HOME!, '.claude/skills/codebase-to-course/skill.md'),
    'utf-8'
  );

  // Collect relevant source files — adjust globs to your stack
  const sourceFiles = collectSourceFiles(projectPath, [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '!**/node_modules/**',
    '!**/.next/**',
  ]);

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 8096,
    messages: [
      {
        role: 'user',
        content: `${skillPrompt}\n\nHere is the codebase:\n\n${sourceFiles}\n\nTurn this codebase into an interactive course.`,
      },
    ],
  });

  const html = extractHtml(message.content);
  fs.writeFileSync(path.join(projectPath, 'course.html'), html);
  console.log('Course written to course.html');
}
```

The `collectSourceFiles` and `extractHtml` helpers you'd write yourself — collect the file contents into a big string, parse the HTML block out of Claude's response. Nothing fancy.

## Where It Gets Interesting for Next.js Projects

For a typical Next.js/TypeScript app the generated course does a decent job explaining the App Router file conventions, how server vs client components split, and where data fetching lives. The animated component diagrams are particularly useful for visualising how data flows from a Server Component down through props.

One thing I'd do differently from the default workflow: scope the skill to a specific feature rather than the whole codebase. A large Next.js app has too much surface area for a single course to be coherent. Something like:

```
"Turn just the /app/checkout directory into an interactive course focused on the payment flow"
```

Claude handles that scoping fine and the output is more focused.

You can also commit `course.html` to the repo as living documentation. It's a single file, diffs reasonably well, and is far more useful to a new contributor than a wall of markdown.

## What I'd Build With This

**Automated PR documentation** — add a GitHub Action that triggers the skill on any PR touching core architectural files, generates a `course.html`, and attaches it as a PR comment artifact. Reviewers get an interactive walkthrough of what changed and why the architecture looks the way it does.

**Onboarding kit generator** — wrap this in a small Next.js app where engineers paste a GitHub URL, the backend clones the repo, runs the skill, and returns a downloadable HTML course. Useful for open source maintainers who want to give contributors a real on-ramp without writing docs manually.

**Legacy codebase archaeology tool** — point it at a gnarly Express or Rails codebase your team inherited. Get a course that explains what the thing actually does before you start refactoring. Beats reading through 8-year-old commit messages.

The skill itself is young and the output quality will vary depending on how well-structured your codebase is — messy repos produce messier courses. But the core workflow is sound and the zero-dependency HTML output is genuinely clever. I'd be running this on every project I hand off or open source from here on.

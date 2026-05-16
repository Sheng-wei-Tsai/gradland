---
title: "AI Psychosis: When Your Team Starts Trusting the Vibes Over the Engineering"
date: "2026-05-16"
excerpt: "Mitchell Hashimoto's viral thread put a name to something I've been seeing: teams making irreversible architectural decisions based on AI capabilities that don't exist yet. Here's how to spot it—and not catch it yourself."
tags: ["AI", "Engineering", "Architecture"]
coverEmoji: "🧠"
auto_generated: true
source_url: "https://twitter.com/mitchellh/status/2055380239711457578"
---

Mitchell Hashimoto's thread went viral yesterday for a reason. The claim: entire companies are currently in a state of "AI psychosis"—making product and architecture decisions based on AI capabilities that are hoped for rather than demonstrated. 936 comments later, the tech community seems to agree this is real.

I've seen versions of it. Not full psychosis, but the early symptoms. Here's what it looks like in a codebase, and how to stay clean.

## What AI psychosis actually looks like

It's not "we used an LLM to generate some copy." That's fine. It's when the LLM becomes a load-bearing structural element and the team stops asking whether it should be.

Concrete signs I've seen or heard about:

**The validation bypass.** An AI-generated value—a score, a classification, a recommendation—flows directly into a database write or a customer-facing decision without a single sanity check. The assumption is that the model is reliable enough that validation is overhead. It isn't.

**The capability roadmap bet.** Architectural decisions today are justified by "well, models will be better in six months." Maybe. But you've just coupled your system's correctness to a third party's product improvement timeline you don't control.

**The human-in-the-loop removal.** Early versions had humans reviewing AI output. Then someone noticed it was always approved, so the human step got cut. Now there's no circuit breaker when the model starts confidently producing garbage.

**The context window prayer.** A system works fine in testing with small inputs. Production has 50,000 tokens of context. Nobody tested that. Nobody thought about what happens when the model silently drops the middle of the document.

## Why smart teams catch it

The insidious thing is that AI psychosis doesn't start from recklessness—it starts from genuine early success. You build an AI feature, it works remarkably well, users love it. That success creates a prior: "AI solves this class of problem." Then you apply that prior to the next problem, and the next, with less and less scrutiny.

The engineering habits that usually protect you—pessimistic estimates, explicit failure modes, integration tests—get suspended because the demo was so impressive. The hype machine is real and it gets inside your head even if you're trying to resist it.

The other factor: nobody wants to be the person who slows down the AI work. In a team running hot on AI enthusiasm, raising reliability concerns feels like being against progress. So the concerns don't get raised.

## A quick self-audit

Run through your current AI-involved code paths and ask:

1. **What happens when the model returns confident garbage?** If the answer is "it propagates downstream undetected," that's a problem.
2. **Which decisions would be embarrassing if we shipped them to 1000 users?** Those need human review, not AI review.
3. **Are we testing the unhappy paths?** Wrong output, truncated output, timeout, rate limit hit. What does the user see?
4. **Is any architectural decision justified by "models will get better"?** Make the current models work or don't ship the feature.
5. **Where did we remove a validation step because it "never triggered"?** Put it back. It didn't trigger because you got lucky.

None of this is anti-AI. I use Claude for most of my coding work now. But I also treat its outputs the same way I treat output from any external system I don't own: validate at the boundary, fail explicitly, monitor in production.

## What I'd build with this

If you're building AI features right now, three patterns worth having in your toolkit:

**A structured output validator.** If your prompt returns JSON, parse and validate it against a schema every time. Don't trust the model to follow format instructions 100% of the time—Zod or a JSON Schema check takes ten lines and saves you a production incident.

**A shadow mode for high-stakes decisions.** Run the AI path and the old deterministic path in parallel, compare outputs, log divergences. Don't switch to AI-only until you've seen the divergence rate at scale.

**An explicit confidence threshold UI.** For user-facing AI features, show uncertainty. "Based on your profile, we think X—does that sound right?" is both more honest and more useful than a confident assertion that turns out to be wrong.

The last year has been the "wow it works" phase. The next phase is building AI features that work reliably at production scale, for real users, with real consequences. That requires the same engineering discipline you'd apply to any critical system—and a healthy scepticism of your own enthusiasm.

Build the thing. Just don't let the demo convince you the engineering is done.

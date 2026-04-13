---
title: "Enterprises power agentic workflows in Cloudflare Agent Cloud with OpenAI"
date: "2026-04-13"
company: "openai"
source_url: "https://openai.com/index/cloudflare-openai-agent-cloud"
excerpt: "Cloudflare brings OpenAI’s GPT-5.4 and Codex to Agent Cloud, enabling enterprises to build, deploy, and scale AI agents for real-world tasks with speed and secu"
tags: ["OpenAI","AI News"]
coverEmoji: "🤖"
auto_generated: true
ai_enriched: true
---

*Source: [OpenAI](https://openai.com/index/cloudflare-openai-agent-cloud)*

## What was announced

OpenAI and Cloudflare announced integration of GPT-5.4 and Codex models into Cloudflare's Agent Cloud platform. This enables enterprises to build, deploy, and scale AI agents directly through Cloudflare's infrastructure. The partnership combines OpenAI's models with Cloudflare's edge network, security, and deployment capabilities for enterprise-grade agentic workflows.

## Why it matters

Developers can now deploy AI agents with built-in security and global distribution without managing separate infrastructure—agents run on Cloudflare's edge rather than requiring custom deployment logic. This reduces the operational overhead compared to self-hosting agents on cloud VMs or orchestrating via external APIs. If you're building agent systems, evaluate whether Cloudflare Agent Cloud's integrated approach (model + hosting + security) beats your current stack of OpenAI API calls + your own deployment infrastructure.

## Key takeaways

- GPT-5.4 is now accessible via Cloudflare's platform—verify if your use case needs this newer version vs. existing models, and check if Cloudflare's pricing undercuts direct OpenAI API usage at scale
- Agent Cloud handles deployment, scaling, and security as a managed service—reduces toil for teams that would otherwise build orchestration layers, error handling, and monitoring themselves
- Edge deployment changes latency profile and compliance posture—developers should test whether Cloudflare's distributed execution improves agent response times for global workloads compared to OpenAI's centralized endpoints

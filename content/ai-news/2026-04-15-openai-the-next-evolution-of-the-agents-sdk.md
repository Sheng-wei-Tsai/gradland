---
title: "The next evolution of the Agents SDK"
date: "2026-04-15"
company: "openai"
source_url: "https://openai.com/index/the-next-evolution-of-the-agents-sdk"
excerpt: "OpenAI updates the Agents SDK with native sandbox execution and a model-native harness, helping developers build secure, long-running agents across files and to"
tags: ["OpenAI","AI News"]
coverEmoji: "🔒"
auto_generated: true
ai_enriched: true
---

*Source: [OpenAI](https://openai.com/index/the-next-evolution-of-the-agents-sdk)*

## What was announced

OpenAI released updates to its Agents SDK adding native sandbox execution environments and a model-native harness architecture. The sandbox provides isolated, secure execution for agent code across file operations and tool calls. The model-native harness tightens the integration between OpenAI models and agent orchestration, reducing friction between instruction and execution.

## Why it matters

Developers can now run multi-step agents without managing separate execution infrastructure—sandbox isolation handles security and state isolation out-of-the-box. This addresses the friction of agents that previously required explicit tool definition and context management between model calls. You should evaluate whether this reduces your current scaffolding overhead compared to frameworks like LangChain or LlamaIndex for file-heavy or long-running workflows.

## Key takeaways

- Native sandboxing removes the need to roll your own execution isolation layer for agent file/tool operations
- Model-native harness means fewer translation steps between API responses and action execution—tighter coupling, faster iteration
- Critical for production: verify sandbox resource limits and persistence guarantees before migrating stateful agents

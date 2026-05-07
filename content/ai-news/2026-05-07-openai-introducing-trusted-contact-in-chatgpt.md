---
title: "Introducing Trusted Contact in ChatGPT"
date: "2026-05-07"
company: "openai"
source_url: "https://openai.com/index/introducing-trusted-contact-in-chatgpt"
excerpt: "Introducing Trusted Contact in ChatGPT, an optional safety feature that notifies someone you trust if serious self-harm concerns are detected."
tags: ["OpenAI","AI News"]
coverEmoji: "🤝"
auto_generated: true
ai_enriched: true
---

*Source: [OpenAI](https://openai.com/index/introducing-trusted-contact-in-chatgpt)*

## What was announced

OpenAI launched Trusted Contact, an optional safety feature in ChatGPT that detects serious self-harm concerns and notifies a pre-designated trusted contact. Users can enable this feature and configure who receives notifications when the system identifies high-risk conversations. This is a consumer-facing safety tool, not an API capability.

## Why it matters

This is primarily a user safety feature, not a developer API change—it doesn't affect ChatGPT API or Claude API directly. However, it signals OpenAI's shift toward safety workflows that notify third parties, which matters if you're building mental health, crisis support, or safety-critical features: you'll need to handle similar guardrails yourself. For most API developers, this is notable context about what ChatGPT users expect regarding safety and privacy, but no immediate API action is required.

## Key takeaways

- Optional feature (users explicitly enable it) — safety overreach is not the goal; adoption will likely be low among users who need it most
- Triggers on 'serious self-harm concerns'—detection threshold is vague and likely conservative to avoid false positives; developers building crisis apps should set clearer, measurable thresholds
- No API exposure yet—if OpenAI releases a Trusted Contact API in the future for third-party apps, watch for latency and compliance implications (HIPAA, consent workflows)

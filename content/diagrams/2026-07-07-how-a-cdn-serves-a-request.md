---
title: "How a CDN Serves a Request"
date: "2026-07-07"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart LR
      A["User"]
      B["Edge Cache"]
      C["Regional<br/>Cache"]
      D["Origin<br/>Server"]
      E["Response<br/>to User"]
      
      A -->|Request| B
      B -->|Hit| E
      B -->|Miss| C
      C -->|Hit| E
      C -->|Miss| D
      D -->|Fetch| E
      
      style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN caches your content on servers distributed globally, so when a user requests it, they get served from the nearest edge location instead of traveling all the way back to your origin server. This dramatically reduces latency and bandwidth costs while increasing availability, since even if your origin goes down, cached content keeps flowing.

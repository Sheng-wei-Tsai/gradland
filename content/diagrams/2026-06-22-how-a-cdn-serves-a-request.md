---
title: "How a CDN Serves a Request"
date: "2026-06-22"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["Browser<br/>Request"] --> B["CDN<br/>Edge"]
      B --> C{"Cached<br/>Here?"}
      C -->|Yes| D["Serve from<br/>Cache"]
      C -->|No| E["Get from<br/>Origin"]
      E --> F["Store in<br/>Cache"]
      F --> D
      D --> G["Return to<br/>Browser"]
      style C fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN caches your content on geographically distributed servers, routing each user's request to the nearest edge location instead of your origin server. This dramatically reduces latency for end-users, decreases origin server load, and improves availability by serving cached content even if your origin is down.

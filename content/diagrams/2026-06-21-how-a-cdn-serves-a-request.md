---
title: "How a CDN Serves a Request"
date: "2026-06-21"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart LR
      A["User<br/>Request"] --> B["Nearest<br/>Edge Server"]
      B --> C{"Asset<br/>Cached?"}
      C -->|Yes| D["Serve from<br/>Cache"]
      C -->|No| E["Fetch from<br/>Origin"]
      E --> F["Store in<br/>Edge Cache"]
      F --> D
      D --> G["Response"]
      style D fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN (Content Delivery Network) caches your content on servers distributed globally, routing user requests to the nearest edge location instead of your origin server. This dramatically reduces latency and bandwidth costs while improving reliability, which is why CDNs are essential for serving static assets, video, and APIs at scale.

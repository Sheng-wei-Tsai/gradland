---
title: "How a CDN Serves a Request"
date: "2026-06-25"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart LR
    A["👤 Request"]
    B["⚡ CDN Edge<br/>Cache"]
    C{Hit?}
    D["✓ Instant<br/>~100ms"]
    E["🔄 Fetch Origin<br/>~500ms"]
    
    A --> B
    B --> C
    C -->|Yes| D
    C -->|No| E
    E --> B
    B --> D
    
    style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN (Content Delivery Network) caches your static content on geographically distributed servers worldwide, then routes user requests to the nearest edge server instead of your origin. This dramatically reduces latency, bandwidth costs, and origin server load by serving content locally to each user's region.

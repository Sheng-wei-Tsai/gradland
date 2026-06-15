---
title: "How a CDN Serves a Request"
date: "2026-06-15"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["Client Request"] --> B["Edge Cache"]
      B --> C{Asset Cached?}
      C -->|Yes| D["Return Instantly"]
      C -->|No| E["Fetch from Origin"]
      E --> F["Cache & Serve"]
      D --> G["To Client"]
      F --> G
      style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN stores copies of your content on servers worldwide, then serves each user from the geographically closest server instead of your origin. This dramatically reduces latency and bandwidth costs, ensuring fast page loads for users regardless of their location.

---
title: "How a CDN Serves a Request"
date: "2026-06-23"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["User<br/>Request"]
      B["Edge Cache<br/>Lookup"]
      C{Found?}
      D["Serve from<br/>Cache"]
      E["Fetch from<br/>Origin"]
      F["Origin<br/>Server"]
      G["Return to<br/>User"]
      
      A --> B
      B --> C
      C -->|Yes| D
      C -->|No| E
      E --> F
      F --> D
      D --> G
      
      style D fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN stores copies of your content on servers around the world, then serves each user from the server geographically closest to them instead of fetching from your origin server every time. This dramatically reduces latency and bandwidth costs because requests travel shorter distances, and even a 100ms difference in page load time significantly impacts user retention and SEO ranking.

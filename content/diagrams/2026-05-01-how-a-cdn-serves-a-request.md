---
title: "How a CDN Serves a Request"
date: "2026-05-01"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["Client requests asset"] --> B["CDN edge checks cache"]
      B --> C{Cache hit?}
      C -->|Yes| D["Serve from edge"]
      C -->|No| E["Fetch from origin"]
      E --> F["Store in edge cache"]
      F --> D
      D --> G["Return to client"]
      
      style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN caches your content on geographically distributed servers worldwide, so when a user requests a file, the closest server delivers it instead of the origin. This reduces latency for users globally and decreases load on your origin server, making your application faster and more scalable.

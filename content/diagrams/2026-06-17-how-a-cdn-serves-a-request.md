---
title: "How a CDN Serves a Request"
date: "2026-06-17"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["Client requests asset"] --> B["CDN edge server"]
      B --> C{Asset in cache?}
      C -->|Yes| D["Serve from edge<br/>~10-50ms"]
      C -->|No| E["Fetch from origin<br/>~100-500ms"]
      E --> F["Cache at edge"]
      F --> G["Serve to client"]
      D --> G
      
      style D fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN (Content Delivery Network) serves a request by routing it to the nearest geographically distributed server that caches your content, rather than always hitting your origin server. This matters because it dramatically reduces latency for users worldwide, decreases origin server load, and improves overall application performance.

---
title: "How a CDN Serves a Request"
date: "2026-07-03"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A[User Request] --> B[CDN Edge Location]
      B --> C{Cache Hit?}
      C -->|Yes| D[Serve from Cache]
      C -->|No| E[Fetch Origin Server]
      E --> F[Cache at Edge]
      D --> G[Response to Client]
      F --> G
      style D fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN (Content Delivery Network) caches your content on geographically distributed servers worldwide so that users fetch files from the server closest to them instead of your origin server. This reduces latency, decreases bandwidth costs, and improves site performance and user experience across different regions.

---
title: "How a CDN Serves a Request"
date: "2026-07-08"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["User requests<br/>asset"] --> B["CDN Edge<br/>Cache"]
      B --> C{Asset cached?}
      C -->|Hit| D["Serve from edge"]
      C -->|No| E["Fetch from<br/>Origin"]
      E --> F["Cache at edge"]
      F --> G["Return to user"]
      D --> G
      
      style D fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN caches your content on geographically distributed servers so when a user requests a file, their browser fetches it from the nearest edge location instead of your origin server. This reduces latency, decreases load on your origin, and improves resilience—requests served from a cache 100ms away load 10x faster than requests bouncing across continents to a single origin.

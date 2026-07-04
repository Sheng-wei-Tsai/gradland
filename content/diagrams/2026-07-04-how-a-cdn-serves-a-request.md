---
title: "How a CDN Serves a Request"
date: "2026-07-04"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["Browser<br/>Requests Asset"]
      B["CDN Edge<br/>Cache"]
      C{"Cache<br/>Hit?"}
      D["Return<br/>Cached File"]
      E["Origin<br/>Server"]
      F["Fetch &<br/>Cache"]
      G["Return to<br/>User"]
      
      A --> B
      B --> C
      C -->|Yes| D
      C -->|No| E
      E --> F
      F --> G
      D --> G
      
      style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN distributes your content across geographically dispersed servers so users download from a location physically close to them instead of always hitting your origin server. This dramatically reduces latency, decreases bandwidth costs, and improves availability since content is cached at multiple edge locations.

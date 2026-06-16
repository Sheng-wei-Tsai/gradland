---
title: "How a CDN Serves a Request"
date: "2026-06-16"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["User Requests<br/>Static Asset"]
      B["CDN Edge<br/>Server"]
      C{Cached<br/>Locally?}
      D["Serve from<br/>Edge Cache"]
      E["Fetch from<br/>Origin"]
      F["Store in<br/>Edge Cache"]
      G["Return<br/>Response"]
      
      A --> B
      B --> C
      C -->|Hit| D
      C -->|Miss| E
      D --> G
      E --> F
      F --> G
      
      style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN (Content Delivery Network) caches copies of your content on geographically distributed servers, so users download from a location near them instead of your origin server. This dramatically reduces latency, cuts bandwidth costs, and improves resilience by spreading traffic load across multiple nodes.

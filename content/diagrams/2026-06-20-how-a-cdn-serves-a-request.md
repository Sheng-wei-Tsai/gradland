---
title: "How a CDN Serves a Request"
date: "2026-06-20"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart LR
      Client["Browser"]
      Edge["CDN Edge<br/>Cache"]
      Check{"Asset<br/>Cached?"}
      Origin["Origin<br/>Server"]
      Response["Return to<br/>Browser"]
      
      Client -->|Request| Edge
      Edge --> Check
      Check -->|Yes| Response
      Check -->|No| Origin
      Origin -->|Fetch| Edge
      Edge --> Response
      
      style Edge fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN (Content Delivery Network) stores copies of your content on servers distributed globally, then serves each user from the geographically nearest location instead of your origin server. This reduces latency, decreases bandwidth costs, and prevents your origin server from being overwhelmed—critical for scaling applications to millions of users across different regions.

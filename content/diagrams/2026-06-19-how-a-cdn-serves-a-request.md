---
title: "How a CDN Serves a Request"
date: "2026-06-19"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart LR
      User["User<br/>Request"] --> E{"Edge<br/>Hit?"}
      E -->|Yes| S1["Serve<br/>Edge"]
      E -->|No| R{"Regional<br/>Hit?"}
      R -->|Yes| E2["Cache<br/>Edge"]
      R -->|No| O["Origin<br/>Server"]
      S1 --> U["Return<br/>User"]
      E2 --> U
      O --> U
  
      style E fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN (Content Delivery Network) serves requests by caching and distributing content across geographically distributed servers, routing users to the nearest location instead of always hitting the origin server. This dramatically reduces latency, decreases origin server load, and improves availability for global users.

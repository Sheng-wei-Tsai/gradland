---
title: "How a CDN Serves a Request"
date: "2026-06-27"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["Browser<br/>Requests Asset"]
      B["CDN Edge<br/>Point of Presence"]
      C{Is Asset<br/>Cached?}
      D["Serve from<br/>Edge Cache"]
      E["Fetch from<br/>Origin Server"]
      F["Cache &<br/>Return"]
      G["Fast<br/>Response"]
      
      A --> B
      B --> C
      C -->|Yes| D --> G
      C -->|No| E --> F --> G
      
      style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN is a network of geographically distributed servers that cache and serve content from locations close to users, routing requests based on geography to minimize distance. This dramatically reduces latency, saves bandwidth costs, and improves user experience especially for globally distributed audiences where serving from a single origin would be slow.

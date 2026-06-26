---
title: "How a CDN Serves a Request"
date: "2026-06-26"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart LR
    A["User Requests"]
    B["Route to Edge"]
    C["Edge Cache"]
    D{Cache Hit?}
    E["Fetch Origin"]
    F["Return Asset"]
    
    A --> B
    B --> C
    C --> D
    D -->|Yes| F
    D -->|No| E
    E --> F
    
    style C fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN (Content Delivery Network) serves requests by routing users to the geographically closest server that caches your content, reducing latency compared to always hitting your origin server. This matters because faster content delivery improves user experience, reduces bandwidth costs, and handles traffic spikes without overwhelming your infrastructure.

---
title: "How a CDN Serves a Request"
date: "2026-06-28"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart LR
    A["User Request"]
    B["Edge Server"]
    C{Cache Hit?}
    D["Return Cached"]
    E["Fetch Origin"]
    F["Update Cache"]
    G["Return Asset"]
    
    A --> B
    B --> C
    C -->|Yes| D
    C -->|No| E
    E --> F
    D --> G
    F --> G
    
    style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN caches your static assets on servers geographically close to users, so when someone requests a file, they fetch it from the nearest edge server instead of your origin. This dramatically cuts latency and bandwidth costs while scaling to millions of users without melting your main infrastructure.

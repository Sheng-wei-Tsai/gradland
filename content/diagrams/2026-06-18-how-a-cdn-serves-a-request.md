---
title: "How a CDN Serves a Request"
date: "2026-06-18"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart LR
    User["User Request"]
    POP["Edge POP"]
    Hit{"Cache Hit?"}
    Origin["Origin"]
    Cache["Cache Asset"]
    Return["Deliver"]
    
    User -->|1| POP
    POP -->|2| Hit
    Hit -->|Yes| Return
    Hit -->|No| Origin
    Origin -->|3| Cache
    Cache -->|4| Return
    
    style POP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN copies your content across geographically distributed servers, so when a user requests a file, they get it from the server nearest to them instead of your origin. This dramatically reduces latency and bandwidth costs while improving availability since requests don't all bottleneck through a single datacenter.

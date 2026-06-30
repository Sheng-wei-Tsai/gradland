---
title: "How a CDN Serves a Request"
date: "2026-06-30"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart LR
    A["User Request<br/>Asset"] -->|Route to<br/>Nearest Edge| B["Edge Cache<br/>Location"]
    B -->|Cache<br/>Check| C{Cache<br/>Hit?}
    C -->|Yes| D["Serve from<br/>Edge Cache"]
    C -->|No| E["Fetch from<br/>Origin Server"]
    E --> F["Cache Result<br/>at Edge"]
    F --> G["Deliver to<br/>User"]
    D --> G
    style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN (content delivery network) stores copies of your static content like images, videos, and CSS on geographically distributed servers, then serves each user from the location closest to them. This matters because it reduces latency, decreases load on your origin server, and provides better performance for global users.

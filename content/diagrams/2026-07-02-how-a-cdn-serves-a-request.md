---
title: "How a CDN Serves a Request"
date: "2026-07-02"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["User Request<br/>Asset"]
      B["Nearest<br/>Edge Cache"]
      C{Found<br/>in Cache?}
      D["Fetch from<br/>Origin"]
      E["Serve to User<br/>& Cache"]
      
      A --> B
      B --> C
      C -->|Yes| E
      C -->|No| D
      D --> E
      
      style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN caches your content on geographically distributed servers worldwide, so when a user requests a file, they get it from the nearest edge server instead of your origin server. This dramatically reduces latency, cuts origin server load, and delivers content faster to users globally regardless of their location.

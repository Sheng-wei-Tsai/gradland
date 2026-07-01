---
title: "How a CDN Serves a Request"
date: "2026-07-01"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["📱 User<br/>Request"]
      B["🌍 CDN Edge<br/>Location"]
      C{"Cache<br/>Hit?"}
      D["⚡ Serve from<br/>Edge Cache"]
      E["🏠 Fetch from<br/>Origin"]
      F["✅ Return to<br/>User"]
      
      A -->|To Nearest<br/>CDN| B
      B -->|Check| C
      C -->|Yes| D
      C -->|No| E
      E -->|Store| B
      D --> F
      B --> F
      
      style D fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN serves a request by routing it to the geographically nearest edge server, which caches and returns a copy of the requested content instead of making the user wait for a round trip to the origin server. This cuts latency from hundreds of milliseconds to tens, reduces bandwidth costs, and shields your origin server from traffic spikes.

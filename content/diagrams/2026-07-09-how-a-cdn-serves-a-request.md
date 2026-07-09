---
title: "How a CDN Serves a Request"
date: "2026-07-09"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["Browser<br/>requests asset"] --> B{"CDN Edge<br/>checks cache?"}
      B -->|Cache Hit| C["Serve from<br/>edge cache<br/>low latency"]
      B -->|Cache Miss| D["Fetch from<br/>origin server"]
      D --> E["Cache asset<br/>at edge"]
      E --> C
      C --> F["Asset delivered<br/>to browser"]
      
      style C fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN routes user requests to geographically distributed edge servers holding cached copies of your content, so users download from a server near them instead of your origin. This dramatically cuts latency, reduces origin server load, and ensures consistent fast delivery across the globe.

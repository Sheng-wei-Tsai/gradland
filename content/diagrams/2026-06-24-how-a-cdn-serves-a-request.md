---
title: "How a CDN Serves a Request"
date: "2026-06-24"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["User Requests Asset"] --> B{"Edge Cache Hit?"}
      B -->|Yes| C["Return from Edge Cache"]
      B -->|No| D["Fetch from Origin Server"]
      D --> E["Cache at Edge Node"]
      E --> F["Return to User"]
      C --> F
      F --> G["Future Requests Served Instantly"]
      style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN (Content Delivery Network) caches your content on geographically distributed servers, and when a user requests data, the CDN routes the request to the closest server instead of your origin, returning the cached copy. This matters because it drastically reduces latency for end users worldwide, decreases load on your origin servers, and improves overall application performance and reliability.

---
title: "How a CDN Serves a Request"
date: "2026-07-05"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["Client Requests Asset"]
      B["CDN Edge Server"]
      C{"Asset in<br/>Cache?"}
      D["Serve from Cache"]
      E["Request Origin Server"]
      F["Cache Asset at Edge"]
      G["Return to Client"]
      
      A --> B
      B --> C
      C -->|Yes| D
      C -->|No| E
      E --> F
      D --> G
      F --> G
      
      style B fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A CDN directs user requests to the geographically nearest edge server, which serves cached content if available or fetches it from the origin to cache for future requests. This cuts latency by serving content nearby and distributes traffic load across many servers instead of overwhelming a single origin.

---
title: "How a URL Shortener Works"
date: "2026-06-13"
topic: "System Design"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["Submits Long URL"] --> B["Generate Hash"]
      B --> C["Store in Database"]
      C --> D["Return Short URL"]
      E["Access Short URL"] --> F["DB Lookup"]
      F --> G["Redirect"]
      F --> H["Track Analytics"]
      style C fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A URL shortener maps long URLs to concise identifiers by storing the mapping in a database and serving redirects via a lightweight service. It demonstrates key system design concepts like database indexing, horizontal scaling, caching strategies, and handling millions of redirects with minimal latency.

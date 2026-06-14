---
title: "How a CDN Serves a Request"
date: "2026-06-14"
topic: "Networking"
difficulty: "beginner"
mermaid: |
  flowchart TD
      A["Client requests<br/>static asset"]
      B["CDN edge<br/>server"]
      C{Cached?}
      D["Serve from<br/>edge cache"]
      E["Origin server"]
      F["Cache + deliver<br/>to client"]
      
      A --> B
      B --> C
      C -->|Yes| D
      C -->|No| E
      E --> F
      D --> F
---

A CDN is a geographically distributed network of servers that cache and serve your content from locations closest to each user, cutting down latency instead of always fetching from your origin server. This matters because faster load times improve user experience and conversion rates, reduce your bandwidth costs, and provide built-in redundancy and DDoS protection.

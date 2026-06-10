---
title: "Rate Limiting Algorithms"
date: "2026-06-10"
topic: "APIs"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      REQ["Request<br/>arrives"] --> CHECK{Which algorithm<br/>to check?}
      CHECK -->|Token Bucket| TB["Have tokens<br/>available?"]
      CHECK -->|Sliding Window| SW["Within time<br/>window limit?"]
      TB -->|YES| ALLOW["✓ ALLOW<br/>Consume token"]
      TB -->|NO| DENY["✗ REJECT<br/>Wait for refill"]
      SW -->|YES| ALLOW
      SW -->|NO| DENY
      style CHECK fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Rate limiting algorithms control how many requests a client can make within a time window by tracking requests and rejecting excess ones. This protects services from abuse, prevents resource exhaustion, and ensures fair access for all users.

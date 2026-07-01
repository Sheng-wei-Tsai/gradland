---
title: "CAP Theorem"
date: "2026-07-01"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      CAP["Pick 2 of 3"]
      
      C["Consistency"]
      A["Availability"]
      P["Partition Tolerance"]
      
      CA["CA: SQL"]
      AP["AP: NoSQL"]
      CP["CP: Cache"]
      
      CAP --> C
      CAP --> A
      CAP --> P
      
      C -.-> CA
      A -.-> CA
      
      A -.-> AP
      P -.-> AP
      
      C -.-> CP
      P -.-> CP
      
      style CAP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that a distributed system can guarantee at most two of three properties: Consistency (all nodes see the same data), Availability (the system always responds), and Partition tolerance (nodes staying connected). This matters because it forces architects to consciously choose what to sacrifice—there's no perfect system, only informed tradeoffs.

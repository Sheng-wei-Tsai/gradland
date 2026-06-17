---
title: "CAP Theorem"
date: "2026-06-17"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      CAP["CAP Theorem<br/>Pick 2 of 3"]
      
      C["Consistency"]
      A["Availability"]
      P["Partition Tolerance"]
      
      CAP --> C
      CAP --> A
      CAP --> P
      
      C --> CP["CP: Safe<br/>PostgreSQL"]
      P --> CP
      A --> AP["AP: Fast<br/>DynamoDB"]
      P --> AP
      
      style CAP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem states that a distributed database can only guarantee two of three properties: consistency (all nodes see the same data), availability (system responds), and partition tolerance (survives network splits). This matters because every database prioritizes two of these three, and that choice directly shapes how you design your application's data layer.

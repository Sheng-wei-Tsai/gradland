---
title: "CAP Theorem"
date: "2026-06-26"
topic: "Distributed Systems"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      CAP["Choose 2 of 3"]
      C["Consistency"]
      A["Availability"]
      P["Partition<br/>Tolerance"]
      
      CA["CA: Postgres"]
      AP["AP: Cassandra"]
      CP["CP: MongoDB"]
      
      CAP --> C
      CAP --> A
      CAP --> P
      C --> CA
      A --> CA
      A --> AP
      P --> AP
      C --> CP
      P --> CP
      
      style CAP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

The CAP Theorem says distributed systems can have at most two of three things: consistency (all nodes see the same data), availability (always responsive), and partition tolerance (survives network splits). It matters because it forces you to choose which tradeoff fits your use case instead of pretending you can have all three.
